import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const origin=(process.env.PUBLIC_SITE_ORIGIN || 'https://rberrah.github.io').replace(/\/$/,'');
const output='quality-audit/accessibility';
await mkdir(output,{recursive:true});
const errors=[];
const paths=new Set(['/','/pharmacometrie/','/pharmacometrie/game/','/pharmacometrie/tdm/','/multiomics/','/multiomics/tool/','/stats/','/Omics2PK/']);
for (const sitemap of ['/sitemap.xml','/pharmacometrie/sitemap.xml']) {
  try {
    const response=await fetch(origin+sitemap,{signal:AbortSignal.timeout(20000)});
    if(!response.ok) throw new Error('HTTP '+response.status);
    const xml=await response.text();
    const locs=[...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)];
    if(!locs.length) throw new Error('No sitemap URLs');
    for(const [,raw] of locs){
      const url=new URL(raw.trim());
      if(url.origin===origin&&!url.search&&!url.hash) paths.add(url.pathname);
    }
  } catch(e){errors.push({sitemap,error:String(e)});}
}
const cases=[];
for(const path of paths){
  const bilingual=path==='/ecosystem/'||path.startsWith('/pharmacometrie/')||path.startsWith('/multiomics/');
  for(const lang of bilingual?['fr','en']:[null]){
    cases.push({path,lang,viewport:'desktop',theme:'light'});
  }
}
for(const path of ['/','/pharmacometrie/','/pharmacometrie/chapitres/clairance-volume-demi-vie/','/pharmacometrie/game/','/pharmacometrie/tdm/','/ecosystem/','/multiomics/tool/']){
  for(const theme of ['light','dark']) cases.push({path,lang:path==='/'?null:'en',viewport:'mobile',theme});
}
if(paths.has('/pharmacometrie/ressources-outils/')) cases.push({path:'/pharmacometrie/ressources-outils/',lang:'en',viewport:'mobile',theme:'dark'});
const results=[];
const browser=await chromium.launch({headless:true});
try {
  for(const [index,c] of cases.entries()){
    const context=await browser.newContext({
      viewport:c.viewport==='mobile'?{width:390,height:844}:{width:1440,height:1000},
      colorScheme:c.theme
    });
    try {
      await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
      await context.addInitScript(()=>{try{localStorage.setItem('skipgc','t');}catch{}});
      const page=await context.newPage();
      const url=origin+c.path+(c.lang?'?lang='+c.lang:'');
      const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
      if(!response?.ok()) throw new Error('HTTP '+response?.status());
      if(c.lang)await page.waitForFunction(lang=>document.documentElement.lang===lang,c.lang,{timeout:10000});
      await page.locator('h1').first().waitFor({state:'visible',timeout:10000});
      await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,3000))]));
      const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa']).analyze();
      const violations=a.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,helpUrl:v.helpUrl,tags:v.tags,nodes:v.nodes.map(n=>({target:n.target,failureSummary:n.failureSummary}))}));
      const overflow=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-innerWidth));
      results.push({...c,url,violations,incomplete:a.incomplete.map(v=>({id:v.id,nodes:v.nodes.length})),passes:a.passes.length,overflow});
      console.log('ACCESSIBILITY_RESULT '+JSON.stringify({...c,violations:violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length,targets:v.nodes.slice(0,5).map(n=>n.target)})),overflow}));
    }catch(error){errors.push({...c,error:String(error).slice(0,1000)});}
    finally{await context.close();}
    if(index%10===0)await writeFile(output+'/results.json',JSON.stringify({results,errors},null,2));
  }
}finally{await browser.close();}
await writeFile(output+'/results.json',JSON.stringify({results,errors},null,2));
const impacts={};
const rules={};
for(const r of results)for(const v of r.violations){impacts[v.impact]=(impacts[v.impact]||0)+1;rules[v.id]=(rules[v.id]||0)+1;}
const summary={attempted:cases.length,scanned:results.length,errors,statesWithViolations:results.filter(r=>r.violations.length).length,impacts,rules,statesWithOverflow:results.filter(r=>r.overflow>1).length};
console.log('ACCESSIBILITY_SUMMARY '+JSON.stringify(summary));
await writeFile(output+'/summary.json',JSON.stringify(summary,null,2));
// An automated scan alone is not WCAG conformance. Report violations as findings;
// fail the audit execution only when coverage was incomplete, not to hide results.
if(errors.length)process.exitCode=1;

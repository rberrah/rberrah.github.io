// Site-wide language inventory of the *assembled* publication artifact.
// PMx Game's mission-by-mission audit is maintained separately in game.spec.js.
// Candidate strings are reported for editorial adjudication, not called proven
// defects: source titles, named software and shared scientific words can match.
import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const origin = process.env.PORTAL_E2E_URL || 'http://127.0.0.1:4181';
const out = 'test-results/site-bilingual';
const index = JSON.parse(readFileSync('src/lib/content/chapterIndex.generated.json', 'utf8'));
function htmlRoutes(dir='dist') {
  return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
    const p=path.join(dir,e.name);
    if(e.isDirectory())return htmlRoutes(p);
    if(e.name!=='index.html')return [];
    const route='/'+path.relative('dist',dir).split(path.sep).filter(Boolean).join('/');
    const url=route==='/'?route:route+'/';
    const html=readFileSync(p,'utf8');
    return [{url,lang:html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)?.[1]||null,
      redirect:/<meta\b[^>]*http-equiv=["']refresh["']/i.test(html)}];
  });
}
const all=htmlRoutes();
const excluded=all.filter(r=>r.redirect||/^\/(?:pharmacometrie\/)?game\/|^\/pharmacometrie\/(?:qa|slides|multiomics)\//.test(r.url));
const pages=all.filter(r=>!excluded.includes(r)).map(r=>({...r,
  scope:r.url.startsWith('/pharmacometrie/')?'pmx':r.url.startsWith('/multiomics/')?'multiomics':'portal'}));
const chapterRoutes=pages.filter(r=>/^\/pharmacometrie\/chapitres\/[^/]+\/$/.test(r.url));
const frStrong=/(?<![\p{L}])(?:choisissez|vérifiez|vérifier|clairance|prélèvements?|données|courbes?|équations?|modèles?|élimination|variabilité|ajustements?|paramètres|résidus|poids|temps|pharmacocinétique|étapes?|parcours|mesurées|observées|sélectionnez|réinitialiser)(?![\p{L}])/iu;
const frGrammar=/(?<![\p{L}])(?:les|des|une|dans|avec|pour|sont|vous|votre|cette|aux|ces|sans|chez|puis|quelle|quel|deux|trois|avant|après)(?![\p{L}])/giu;
const enStrong=/(?<![\p{L}])(?:choose|select|check|reset|restart|clearance|observed|predicted|predictions|sampling|samples|weights|steady-state|steady state|half-life|dosing interval|population overview|individual fits|simulated|fictional|pathway|workshop|completed|locked|incorrect|try again|beginner track)(?![\p{L}])/iu;
const enGrammar=/(?<![\p{L}])(?:the|this|these|those|with|without|from|your|you|which|when|after|before|between|does|should|would|their|each|both)(?![\p{L}])/giu;
function suspect(s,lang){
  if(!s||/^https?:\/\//i.test(s)||/^(FR|EN)$/i.test(s))return false;
  return lang==='en'?(frStrong.test(s)||(s.match(frGrammar)||[]).length>=2)
    :(enStrong.test(s)||(s.match(enGrammar)||[]).length>=2);
}
function persist(name,data){
  mkdirSync(out,{recursive:true});
  writeFileSync(path.join(out,name+'.json'),JSON.stringify(data,null,2)+'\n');
}
test('site language inventory: every chapter and both source versions exist',()=>{
  const missing=index.filter(c=>!c.translations?.en?.sourceFile);
  const missingBuilt=index.filter(c=>!chapterRoutes.some(r=>r.url==='/pharmacometrie/chapitres/'+c.slug+'/'));
  const findings=[];
  const sources=[];
  for(const c of index)for(const lang of ['fr','en']){
    const file=lang==='en'?c.translations?.en?.sourceFile:c.sourceFile;
    if(!file)continue;
    const p=path.join('src/content/chapters',lang==='en'?'en':'',file);
    const raw=readFileSync(p,'utf8');
    // Inspect prose and step headings; omit fenced code and displayed mathematics.
    const body=raw.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n/,'')
      .replace(/\x60\x60\x60[\s\S]*?\x60\x60\x60/g,'').replace(/\$\$[\s\S]*?\$\$/g,'');
    sources.push({file:p,lang});
    for(const [i,line] of body.split('\n').entries()){
      const s=line.replace(/https?:\/\/\S+/g,'').replace(/\]\([^)]*\)/g,']').trim();
      if(suspect(s,lang))findings.push({file:p,lang,bodyLine:i+1,text:s});
    }
  }
  persist('inventory',{pages,excluded,chapterCount:index.length,sources,sourceCandidates:findings});
  console.log('SITE_LANGUAGE_INVENTORY '+JSON.stringify({pages:pages.length,excluded:excluded.length,
    scopes:Object.fromEntries(['pmx','multiomics','portal'].map(s=>[s,pages.filter(r=>r.scope===s).length])),
    chapters:index.length,sources:sources.length,sourceCandidates:findings.length}));
  expect(missing.map(c=>c.slug)).toEqual([]);
  expect(missingBuilt.map(c=>c.slug)).toEqual([]);
});

async function collect(page){
  return page.evaluate(async()=>{
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const rows=[];
    function visible(el){
      if(!el||el.closest('[hidden],script,style,noscript,code,pre,textarea,.katex-mathml'))return false;
      for(let e=el;e;e=e.parentElement){
        const s=getComputedStyle(e);
        if(s.display==='none'||s.visibility==='hidden')return false;
      }
      return true;
    }
    function add(el,kind,value){
      if(!visible(el)||!value)return;
      const text=value.replace(/\s+/g,' ').trim();
      if(!text||!/[a-zA-ZÀ-ÿ]/.test(text))return;
      const markedLang=el.closest('[lang]:not(html)')?.getAttribute('lang')||null;
      rows.push({kind,text,element:el.id||el.closest('[id]')?.id||el.tagName,markedLang});
    }
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
    while(walker.nextNode()){
      const n=walker.currentNode;
      if(n.nodeType===Node.TEXT_NODE)add(n.parentElement,'text',n.nodeValue);
      else for(const a of ['aria-label','title','alt','placeholder','data-tooltip'])add(n,a,n.getAttribute(a));
    }
    rows.push({kind:'title',text:document.title,element:'head',markedLang:null});
    const description=document.querySelector('meta[name="description"]')?.content;
    if(description)rows.push({kind:'description',text:description,element:'head',markedLang:null});
    return {lang:document.documentElement.lang,rows,
      heading:document.querySelector('h1')?.textContent?.trim()||null,
      overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
}
const batches=[];
for(let i=0;i<pages.length;i+=8)batches.push(pages.slice(i,i+8));
for(const [n,batch] of batches.entries()){
  test('site language inventory: rendered routes '+(n+1)+'/'+batches.length,async({page})=>{
    test.setTimeout(180000);
    await page.setViewportSize({width:1440,height:1000});
    // Avoid contacting external analytics or services; static publication only.
    await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
    const records=[],errors=[],pageErrors=[];
    page.on('pageerror',e=>pageErrors.push(e.message));
    async function record(r,lang,state){
      const capture=await collect(page);
      const candidates=capture.rows.filter(row=>!row.markedLang&&suspect(row.text,lang));
      records.push({route:r.url,scope:r.scope,expected:lang,state,...capture,candidates});
      if(capture.lang!==lang)errors.push({route:r.url,lang,state,actual:capture.lang});
    }
    try{
      for(const r of batch){
        const langs=r.scope==='portal'?[r.lang||'en']:['fr','en'];
        for(const lang of langs){
          pageErrors.length=0;
          const href=origin+r.url+(r.scope==='portal'?'':'?lang='+lang);
          try{
            const response=await page.goto(href,{waitUntil:'load',timeout:20000});
            if(response?.status()!==200){errors.push({route:r.url,lang,http:response?.status()});continue;}
            if(r.scope!=='portal')await page.locator('html[lang="'+lang+'"]').waitFor({timeout:6000}).catch(()=>{});
            const c=index.find(c=>r.url==='/pharmacometrie/chapitres/'+c.slug+'/');
            if(c){
              const title=lang==='en'?c.translations.en.title:c.title;
              await expect(page.getByTestId('chapter-title')).toHaveText(title,{timeout:8000});
            }
            // Audit collapsed lesson and diagnostic explanations as well.
            await page.locator('details').evaluateAll(ds=>ds.forEach(d=>{if(d.getClientRects().length)d.open=true;}));
            await record(r,lang,'direct');
            if(r.scope!=='portal'){
              const other=lang==='en'?'fr':'en';
              const toggle=page.locator('.language-toggle button, [data-testid="language-toggle"] button').filter({hasText:new RegExp('^'+other+'$','i')}).first();
              if(await toggle.isVisible()){
                await toggle.click();
                await page.locator('html[lang="'+other+'"]').waitFor({timeout:6000}).catch(()=>{});
                await record(r,other,'switch-from-'+lang);
              }else errors.push({route:r.url,lang,issue:'language-toggle-not-visible'});
            }
            if(pageErrors.length)errors.push({route:r.url,lang,pageErrors:[...pageErrors]});
          }catch(e){errors.push({route:r.url,lang,error:String(e).slice(0,800)});}
        }
      }
    }finally{
      persist('rendered-'+String(n+1).padStart(3,'0'),{records,errors});
      console.log('SITE_LANGUAGE_BATCH '+JSON.stringify({batch:n+1,rendered:records.length,errors,
        candidates:records.reduce((sum,r)=>sum+r.candidates.length,0),
        flagged:records.filter(r=>r.candidates.length).map(r=>({route:r.route,lang:r.expected,state:r.state,count:r.candidates.length}))}));
    }
    const unique = new Map();
    for(const r of records) for(const c of r.candidates){
      const key = r.expected+'|'+c.kind+'|'+c.text;
      if(!unique.has(key))unique.set(key,{route:r.route,lang:r.expected,state:r.state,kind:c.kind,element:c.element,text:c.text});
    }
    for(const candidate of [...unique.values()].slice(0,100))
      console.log('SITE_LANGUAGE_CANDIDATE '+JSON.stringify(candidate));
    if(unique.size>100)console.log('SITE_LANGUAGE_CANDIDATE_OVERFLOW '+(unique.size-100)+' more in the JSON artifact');
    // Actual coverage/load/locale errors are a test failure; lexical candidates
    // are separately reviewed to avoid misclassifying references as defects.
    expect(errors).toEqual([]);
  });
}

test('home French copy and language control are localized',async({page})=>{
  await page.goto(origin+'/pharmacometrie/?lang=fr');
  await expect(page.locator('.language-toggle')).toHaveAttribute('aria-label','Langue');
  await expect(page.getByTestId('beginner-track-open')).toContainText('parcours débutant');
  await page.locator('.language-toggle button').filter({hasText:/^EN$/}).click();
  await expect(page.locator('.language-toggle')).toHaveAttribute('aria-label','Language');
  await expect(page.getByTestId('beginner-track-open')).toContainText('Beginner Track');
});

test('P0 FR-to-EN: glossary definitions, names, units and aliases update without reload',async({page})=>{
  await page.goto(origin+'/pharmacometrie/glossaire/?lang=fr');
  const entry=page.locator('.entry').filter({has:page.locator('dt').filter({hasText:/^PK\s*·/})}).first();
  await expect(entry).toContainText('Ce que l\'organisme fait au médicament');
  await page.locator('.language-toggle button').filter({hasText:/^EN$/}).click();
  await expect(entry).toContainText('What the body does to a drug');
  await expect(entry).not.toContainText('pharmacocinétique');
  await expect(page.locator('main')).not.toContainText('variable par unité de temps');
  await expect(page.locator('main')).toContainText('Compartmental model');
  await page.locator('.language-toggle button').filter({hasText:/^FR$/}).click();
  await expect(entry).toContainText('Ce que l\'organisme fait au médicament');
});
test('P0 FR-to-EN: domain lessons and reference annotations update',async({page})=>{
  await page.goto(origin+'/pharmacometrie/domaines/?lang=fr');
  await expect(page.locator('h1')).toContainText('Des omiques à la PK/PD');
  await page.locator('.language-toggle button').filter({hasText:/^EN$/}).click();
  await expect(page.locator('h1')).toContainText('From omics to PK/PD');
  await expect(page.getByTestId('cross-domain-courses')).not.toContainText('Comment transformer des mesures génétiques');
  await page.goto(origin+'/pharmacometrie/chapitres/math-fisher/?lang=en');
  await expect(page.locator('.chfoot')).toContainText('PFIM — optimal design in nonlinear mixed-effects models');
  await expect(page.locator('.chfoot')).not.toContainText('fondement statistique des modèles');
  await page.goto(origin+'/pharmacometrie/references/?lang=fr');
  await page.locator('.language-toggle button').filter({hasText:/^EN$/}).click();
  await expect(page.locator('main')).toContainText('random forests for ordinal outcomes');
  await expect(page.locator('main')).not.toContainText('forêts aléatoires pour une réponse ordinale');
});
test('P0 FR-to-EN: teacher sequence remains selected and ordered while labels translate',async({page})=>{
  await page.goto(origin+'/pharmacometrie/exercices/?lang=fr');
  const builder=page.locator('.teacher-builder');
  await builder.locator('summary').click();
  const checkbox=builder.locator('li input[type=checkbox]').first();
  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
  await page.locator('.language-toggle button').filter({hasText:/^EN$/}).click();
  await expect(builder).toContainText('Prepare a sequence');
  await expect(builder).not.toContainText('Sélectionner et ordonner les ressources');
  await expect(checkbox).not.toBeChecked();
});

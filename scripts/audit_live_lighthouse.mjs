import {spawnSync} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';

const origin=(process.env.PUBLIC_SITE_ORIGIN||'https://rberrah.github.io').replace(/\/$/,'');
const mode=process.argv[2]||'mobile';
if(!['mobile','desktop'].includes(mode))throw new Error('Expected mobile or desktop');
const cli=process.env.LIGHTHOUSE_CLI;
if(!cli)throw new Error('LIGHTHOUSE_CLI is required');
const output='quality-audit/lighthouse-'+mode;
await mkdir(output,{recursive:true});
const routes=[
  '/', '/a-propos/', '/publications/', '/pharmacometrie/',
  '/pharmacometrie/chapitres/clairance-volume-demi-vie/',
  '/pharmacometrie/game/', '/pharmacometrie/tdm/', '/ecosystem/',
  '/multiomics/tool/', '/stats/', '/Omics2PK/'
];
// The new resources route exists only after deployment; do not make a pre-merge
// production audit fail because the candidate route is not yet published.
try{if((await fetch(origin+'/pharmacometrie/ressources-outils/',{signal:AbortSignal.timeout(20000)})).ok)routes.push('/pharmacometrie/ressources-outils/');}catch{}
const rows=[];
for(const route of routes){
  const name=route==='/'?'home':route.replace(/^\/|\/$/g,'').replaceAll('/','-');
  const file=output+'/'+name+'.json';
  const url=origin+route+(route.startsWith('/pharmacometrie/')||route.startsWith('/multiomics/')?'?lang=en':'');
  const args=[url,'--only-categories=performance,accessibility,best-practices,seo','--output=json','--output-path='+file,'--quiet','--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage','--blocked-url-patterns=*goatcounter.com*','--max-wait-for-load=45000'];
  if(mode==='desktop')args.push('--preset=desktop');
  const run=spawnSync(cli,args,{encoding:'utf8',timeout:120000});
  try {
    if(run.error||run.status!==0)throw new Error(run.error?.message||run.stderr||'Lighthouse exited '+run.status);
    const report=JSON.parse(await readFile(file,'utf8'));
    if(report.runtimeError)throw new Error(report.runtimeError.message);
    const scores=Object.fromEntries(Object.entries(report.categories).map(([id,c])=>[id,c.score===null?null:Math.round(c.score*100)]));
    const metrics=Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(id=>[id,report.audits[id]?.numericValue??null]));
    const findings=Object.values(report.audits).filter(a=>typeof a.score==='number'&&a.score<1&&a.scoreDisplayMode!=='informative').map(a=>({id:a.id,title:a.title,score:a.score,displayValue:a.displayValue}));
    rows.push({route,url,finalUrl:report.finalDisplayedUrl||report.finalUrl,mode,scores,metrics,findings});
    console.log('LIGHTHOUSE_RESULT '+JSON.stringify({route,mode,scores,metrics}));
  }catch(error){rows.push({route,url,mode,error:String(error).slice(0,1000)});console.log('LIGHTHOUSE_ERROR '+JSON.stringify(rows.at(-1)));}
  await writeFile(output+'/summary.json',JSON.stringify(rows,null,2));
}
if(rows.some(r=>r.error))process.exitCode=1;

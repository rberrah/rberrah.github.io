import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { suppliedModels, externalModels } from './fixtures/lego-imports.mjs';

const marker=/^[ \t]*(?:;|\/\/)\s*PK_LEGO_SPEC_V1:([^\r\n]+)/m;
const snapshot=code=>JSON.parse(decodeURIComponent(code.match(marker)[1]));
function shape(s) {
  const name=id=>s.nodes.find(n=>n.id===id)?.name.toLowerCase()??'OUT';
  const number=x=>x==null?null:Number(Number(x).toPrecision(9));
  return {
    nodes:s.nodes.map(n=>[name(n.id),n.kind,number(n.vol),number(n.dose),number(n.doseFraction),n.inputType,
      number(n.tlag),n.inputType==='zero_order'?number(n.inputDuration):null,name(n.fractionComplementOf),name(n.inputDurationTlagOf)]).sort(),
    edges:s.edges.map(e=>[name(e.from),name(e.to),e.kinetics,
      ...(['hill','michaelis_menten'].includes(e.kinetics)?[number(e.vmax),number(e.km),number(e.gamma)]:[number(e.eliminationParameterization==='clearance'?e.cl:e.k)])]).sort(),
    covariates:s.covariates.map(c=>[c.name,c.target.toLowerCase(),c.type,number(c.reference),number(c.comparison),number(c.beta)]).sort()
  };
}
const cases=suppliedModels.map(m=>({...m,format:'mlxtran'}));
for (const id of ['amik_burdet','genta_franck','levo_gergs','linez_buerger']) cases.push({id,format:'mrgsolve',code:await readFile(`tdm-engine/models/${id}.cpp`,'utf8')});
cases.push(...externalModels.filter(m=>!m.error));
const browser=await chromium.launch();
const artifacts=[];
await mkdir('test-results',{recursive:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${process.env.LEGO_AUDIT_URL??'http://127.0.0.1:4173'}/lego/`);
  await page.waitForLoadState('networkidle');
  const importer=page.locator('.mlxtran-import');
  await importer.locator('summary').click();
  const tab=format=>format==='mrgsolve'?format:format.toUpperCase();
  const apply=async(code,format)=>{
    await importer.getByRole('tab',{name:tab(format),exact:true}).click();
    await importer.locator('textarea').fill(code);
    await importer.getByRole('button',{name:'Construire le sch\u00e9ma',exact:true}).click();
    assert.equal(await importer.locator('.import-status.error').count(),0,await importer.locator('.import-status').innerText());
  };
  for (const item of cases) {
    await apply(item.code,item.format);
    const initial=snapshot(await page.locator('pre.codeblk code').innerText());
    assert(initial.covariates.length===item.covariates || item.covariates==null);
    for (const format of ['mrgsolve','mlxtran','nonmem']) {
      await apply(item.code,item.format);
      await page.locator('.codehead').getByRole('tab',{name:tab(format),exact:true}).click();
      const exported=await page.locator('pre.codeblk code').innerText();
      await apply(exported.replace(marker,''),format);
      const restored=snapshot(await page.locator('pre.codeblk code').innerText());
      assert.deepEqual(shape(restored),shape(initial),`${item.id} ${format}`);
      assert(!await page.locator('.canvas').textContent().then(t=>t.includes('LEGO_INPUT')));
      assert(await page.locator('.chart .serie').first().getAttribute('d'));
      assert(await page.locator('.tdm-launch').isEnabled());
      await page.locator('.codehead').getByRole('tab',{name:'mrgsolve',exact:true}).click();
      artifacts.push({id:item.id,format,spec:restored,code:await page.locator('pre.codeblk code').innerText(),native:item.format==='mrgsolve'?item.code:null});
      console.log(`PASS ${item.id}: ${item.format} -> diagram -> ${format} -> diagram`);
    }
  }
  for (const item of suppliedModels) {
    await apply(item.raw,'mlxtran');
    const s=snapshot(await page.locator('pre.codeblk code').innerText());
    assert.equal(s.nodes.length,item.nodes);
    assert.equal(s.covariates.length,item.covariates);
    assert((await importer.locator('.import-status').innerText()).includes('initialis'));
    assert.equal(s.nodes.find(n=>n.kind==='central').vol,1);
  }
  await apply(suppliedModels[1].code,'mlxtran');
  await page.locator('.canvas').screenshot({path:'test-results/pp6-import-diagram.png'});
  await page.locator('.chart').screenshot({path:'test-results/pp6-import-curve.png'});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'test-results/pp6-import-mobile.png',fullPage:true});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
  assert.deepEqual(errors,[]);
} finally { await browser.close(); }
await writeFile('test-results/lego-external-exports.json',JSON.stringify(artifacts,null,2));
console.log(`${artifacts.length} external browser round trips passed.`);

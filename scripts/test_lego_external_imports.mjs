import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { parseModelCode, parseMlxtran } from '../src/lib/lego/mlxtran.js';
import { samtaniRaw, tjollynRaw, suppliedModels, externalModels } from './fixtures/lego-imports.mjs';

const close=(a,b)=>assert(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const getNode=(s,name)=>s.nodes.find(n=>n.name===name);
const parameter=(s,target,base,covs)=>s.covariates.filter(c=>c.target===target).reduce((v,c)=>v*(c.type==='categorical'
  ? covs[c.name]===c.comparison ? Math.exp(c.beta):1 : (covs[c.name]/c.reference)**c.beta),base);
function rhs(s,amounts,covs) {
  const result=Object.fromEntries(s.nodes.map(n=>[n.name,0]));
  for (const edge of s.edges) {
    const from=s.nodes.find(n=>n.id===edge.from), to=s.nodes.find(n=>n.id===edge.to);
    const suffix=`${from.name}_${to?.name??'e'}`, a=amounts[from.name];
    let flux;
    if (['hill','michaelis_menten'].includes(edge.kinetics)) {
      const h=edge.kinetics==='hill'?parameter(s,`gamma_${suffix}`,edge.gamma,covs):1;
      const vm=parameter(s,`vmax_${suffix}`,edge.vmax,covs), km=parameter(s,`km_${suffix}`,edge.km,covs);
      flux=vm*a**h/(a**h+km**h);
    } else if (edge.eliminationParameterization==='clearance') {
      flux=parameter(s,`cl_${from.name}`,edge.cl,covs)*a/parameter(s,`v_${from.name}`,from.vol,covs);
    } else flux=parameter(s,`k_${suffix}`,edge.k,covs)*a;
    result[from.name]-=flux;
    if (to) result[to.name]+=flux;
  }
  return result;
}

for (const item of suppliedModels) {
  const parsed=parseMlxtran(item.code), s=parsed.spec;
  assert.equal(s.nodes.length,item.nodes); assert.equal(s.edges.length,item.edges); assert.equal(s.covariates.length,item.covariates);
  assert(!parsed.warnings.some(w=>w.code==='populationDefaults'));
  assert(parseMlxtran(item.raw).warnings.some(w=>w.code==='populationDefaults'));
  assert(!s.nodes.some(n=>/LEGO_INPUT/.test(n.name)));
  assert(s.edges.every(e=>e.to==='OUT'||s.nodes.some(n=>n.id===e.to)));
  const filename=item.id==='samtani'?'Samtani PP1.txt':"T'jollyn PP6.txt";
  const local=new URL(`../../FeedBack/ana260907/${filename}`,new URL('../',import.meta.url));
  if (existsSync(local)) {
    const original=parseMlxtran(readFileSync(local,'utf8')).spec;
    assert.deepEqual(original,parseMlxtran(item.raw).spec,'Actual attachment matches the regression fixture');
  }
  console.log(`PASS ${item.id}: ${s.nodes.length} nodes, ${s.edges.length} edges, ${s.covariates.length} covariate effects`);
}
const samtani=parseMlxtran(suppliedModels[0].code).spec;
const tjollyn=parseMlxtran(suppliedModels[1].code).spec;
const emptyValues=parseMlxtran(`[LONGITUDINAL]
input={Cl,V,ka}
PK:
Cc=pkmodel(Cl,V,ka)
`).spec;
close(getNode(emptyValues,'central').vol,1);
close(emptyValues.edges.find(e=>e.to==='OUT').cl,1);
close(emptyValues.edges.find(e=>e.to!=='OUT').k,1);
const aliased=parseMlxtran(`; Vstd=25
; Clstd=4
[LONGITUDINAL]
input={Vstd,Clstd,POIDS}
POIDS={use=regressor}
PK:
V=Vstd*(POIDS/1.1)
Cl=Clstd*(POIDS/1.1)^0.75
Cc=pkmodel(V,Cl)
`).spec;
close(getNode(aliased,'central').vol,25);
close(aliased.edges[0].cl,4);
assert.equal(aliased.covariates.length,2);
for (const SEX of [0,1]) for (const INSJ of [0,1]) for (const NEEDLE of [0,1]) for (const IVOL of [1,1.75,3.5,5]) {
  const c={SEX,INSJ,NEEDLE,IVOL,BMI:32,CLCR:80,AGE:65};
  const ka=.000488*.765**SEX*1.23**INSJ*(c.AGE/42)**.311*IVOL**(-.359);
  const cl=4.95*(c.CLCR/110)**.376, v=391*.726**SEX*(c.BMI/26.8)**.889;
  const f=.168*.781**SEX*1.37**INSJ*1.54**NEEDLE*(c.BMI/26.8)**.642*IVOL**(-.288);
  const out=rhs(samtani,{Ad:83.2,Ac:8},c);
  close(out.Ad,-ka*83.2); close(out.Ac,ka*83.2-cl/v*8);
  const ac=getNode(samtani,'Ac'), ad=getNode(samtani,'Ad');
  close(parameter(samtani,'f_Ac',ac.doseFraction/100,c),f);
  assert.equal(ad.fractionComplementOf,ac.id);
  assert.equal(ac.inputDurationTlagOf,ad.id);
  close(ad.tlag,319); close(ac.inputDuration,319);
  for (const amount of [.1,23.8,120,791]) {
    const a={A1:amount,A3:amount*.25,A2:8};
    const slow=.0904*.746**INSJ*.794**SEX*(IVOL/1.75)**.89*a.A1**1.44/(a.A1**1.44+120**1.44*(IVOL/1.75)**.89);
    const rapid=.149*(IVOL/1.75)**.89*a.A3/(a.A3+23.8*(IVOL/1.75)**.89);
    const elim=3.9*(c.CLCR/115)**.281/(1960*(c.BMI/26.15)**1.18)*a.A2;
    const r=rhs(tjollyn,a,c);
    close(r.A1,-slow); close(r.A3,-rapid); close(r.A2,slow+rapid-elim);
  }
}
close(tjollyn.covariates.find(c=>c.target==='km_A1_A2').beta,.89/1.44);
assert(parseMlxtran(suppliedModels[1].code).warnings.some(w=>w.code==='derivedParameters'));
console.log('PASS independent flux equations, 32 covariate combinations and 4 PP6 depot amounts');

for (const item of externalModels) {
  if (item.error) assert.throws(()=>parseModelCode(item.code,item.format),e=>e.code===item.error);
  else {
    const s=parseModelCode(item.code,item.format).spec;
    assert.equal(s.nodes.length,item.nodes); assert.equal(s.edges.length,item.edges);
    if (item.id==='nonmem-advan2') { close(getNode(s,'central').vol,200); close(s.edges.find(e=>e.to==='OUT').cl,30); close(s.edges.find(e=>e.to!=='OUT').k,4); }
  }
  console.log(`PASS ${item.id}: ${item.error??'recognized'}`);
}

const catalog=JSON.parse(readFileSync(new URL('../tdm-engine/models/catalog.json',import.meta.url)));
const accepted=['amik_burdet','genta_franck','levo_gergs','linez_buerger'];
for (const model of catalog.models) {
  const code=readFileSync(new URL(`../tdm-engine/models/${model.file}`,import.meta.url),'utf8');
  if (accepted.includes(model.id)) {
    const s=parseModelCode(code,'mrgsolve').spec;
    assert.equal(s.nodes.filter(n=>n.dose>0).length,1);
    if (model.id==='amik_burdet') assert.equal(s.covariates.length,0,'Comments are not covariate declarations');
    if (model.id==='levo_gergs') close(getNode(s,'CENT').vol,.835*70);
  } else assert.throws(()=>parseModelCode(code,'mrgsolve'),e=>e.code==='unsupportedEquation'||e.code==='unsupportedAdministration');
  console.log(`AUDIT ${model.id}: ${accepted.includes(model.id)?'recognized':'explicitly unsupported'}`);
}
assert.equal(catalog.models.length,46,'Update the audited library when adding a model');

// Unsupported controls must never disappear from a population graph.
const base='$PARAM CL=4, V=30\n$CMT CENT\n$MAIN\n$ODE\ndxdt_CENT=-CL*CENT/V;';
for (const extra of ['if(V<1) V=1;', 'if(V<1) { V=1; }', 'double V2=V>1?V:1;\nV=V2;']) {
  assert.throws(()=>parseModelCode(base.replace('$MAIN','$MAIN\n'+extra),'mrgsolve'),e=>e.code==='unsupportedEquation');
}
assert.throws(()=>parseModelCode(base.replace('-CL*CENT/V','-UNKNOWN*CENT/V'),'mrgsolve'),e=>e.code==='unsupportedEquation');
assert.throws(()=>parseModelCode(base.replace('$MAIN','$MAIN\nF_CENT=0.5;'),'mrgsolve'),e=>e.code==='unsupportedAdministration');
assert.throws(()=>parseModelCode(base.replace('-CL*CENT/V','-(CL+2)*CENT/V'),'mrgsolve'),e=>e.code==='unsupportedEquation');

// New supplied examples remain local. Do not include publisher supplements in git.
for (const [filename,expected] of [
  ['magnusson PP3.txt','recognized'], ['Korell oral.txt','unsupportedEquation'],
  ['separado ORAL+LAI.txt','unsupportedEquation'], ['2017. Korell code oral.txt','unsupportedStructure'],
  ['2017. Korell code oral ris.txt','unsupportedStructure'], ['2017. Korell code ris LAI.txt','unsupportedStructure'],
  ['2017. Korell code PP1.txt','unsupportedEquation'],
  ['Samtani PP1 - valeurs article.txt','recognized'], ['Tjollyn PP6 - valeurs article.txt','recognized']
]) {
  const file=new URL(`../../../FeedBack/ana260907/${filename}`,import.meta.url);
  if (!existsSync(file)) continue;
  const code=readFileSync(file,'utf8'), format=code.includes('[LONGITUDINAL]')?'mlxtran':'nonmem';
  if (expected==='recognized') {
    const r=parseModelCode(code,format);
    assert.equal(r.mode,'recognized');
    if (filename.includes('valeurs article')) assert(!r.warnings.some(w=>w.code==='populationDefaults'));
    if (filename.includes('magnusson')) { assert.equal(r.spec.nodes.length,3); assert.equal(r.spec.edges.length,3); assert.equal(r.spec.covariates.length,8); }
  } else assert.throws(()=>parseModelCode(code,format),e=>e.code===expected);
  console.log(`LOCAL ${filename}: ${expected}`);
}
console.log('External model import regressions passed.');

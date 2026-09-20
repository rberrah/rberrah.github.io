import assert from 'node:assert/strict';
import { ivConcentration, ivIndex, pdIvProfile, infectionIvCurves } from '../src/lib/tdm/workshopPk.js';

const close = (a,b,tol=1e-8) => assert.ok(Math.abs(a-b) < tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);
const pk = {v:20,cl:4,dose:1000,interval:12,infusion:0};
close(ivConcentration(0,pk), 50);
close(ivConcentration(12,pk), 50*(1+Math.exp(-2.4)));
close(ivConcentration(0,pk,true), 50/(1-Math.exp(-2.4)));
const config = {source:'pk',exposure:'iv1',v:20,cl:4,metric:'auc',basis:'free',fu:.6,multiple:1,target:100,mic:1,replicates:250};
close(ivIndex(pk,config,2), 24/12*1000/4*.6/2);
const pta = infectionIvCurves(config,pk);
assert.deepEqual(pta, infectionIvCurves(config,pk));
assert.ok(pta.pta.every((p,i,a) => i===0 || p.y <= a[i-1].y));
assert.ok(pta.pta.every(p => p.y >=0 && p.y <=100));
const higher = infectionIvCurves(config,{...pk,dose:2000});
assert.ok(higher.pta.every((p,i) => p.y>=pta.pta[i].y));
for (const infusion of [0,1,8,12]) {
  const p={...pk,infusion};
  close(ivIndex(p,config,1), 300);
  const max=ivConcentration(infusion,p,true), min=ivConcentration(12-1e-9,p,true);
  close(ivIndex(p,{...config,metric:'time',fu:1},max*1.01),0);
  close(ivIndex(p,{...config,metric:'time',fu:1},min*.99),100);
}
// Exactly 24 h, not the average daily exposure, for non-divisor dosing intervals.
for (const interval of [8,12,18,36]) for (const infusion of [0,1,interval]) {
  const p={...pk,interval,infusion}, dt=.0005;
  let integral=0;
  for(let t=dt/2;t<24;t+=dt) integral+=ivConcentration(t,p,true)*dt;
  close(ivIndex(p,{...config,fu:1},1),integral,1e-6);
}

const pd={exposure:'iv1',v:10,cl:1,horizon:24,regimen:{dose:100,interval:8,infusion:1},parameters:{E0:100,SLOPE:2,EMAX:.8,EC50:2,HILL:1.5,KE0:.5,KOUT:.15}};
const cases=[];
for(const type of ['linear','emax','hill','inhibit_in','stimulate_in','inhibit_out','stimulate_out']) for(const delay of [false,true]) {
  const c={...pd,type,delay};
  const rows=pdIvProfile(c);
  assert.ok(rows.every(r=>Object.values(r).every(Number.isFinite)));
  close(rows[0].effect,100);
  close(rows.at(-1).time,24);
  cases.push({config:c,rows:rows.filter((_,i)=>i%10===0)});
}
const bolus={...pd,type:'linear',delay:true,regimen:{dose:100,interval:24,infusion:0}};
const rows=pdIvProfile(bolus);
for(const r of rows) close(r.effect,100+2*10*.5/(.5-.1)*(Math.exp(-.1*r.time)-Math.exp(-.5*r.time)),1e-7);
cases.push({config:bolus,rows:rows.filter((_,i)=>i%10===0)});
if(process.argv.includes('--json')) console.log(JSON.stringify(cases));
else console.log('IV PK, exact stationary indices, non-divisor AUC24, reproducible PTA and 15 PK/PD cases passed.');

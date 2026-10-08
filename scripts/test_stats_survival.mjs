import assert from 'node:assert/strict';
import { kaplanMeierSummary, coxBinaryGroup } from '../portal/stats/survival-engine.js';

const near=(actual,expected,tolerance,label)=>{
  assert.ok(Number.isFinite(actual),`${label}: expected finite, got ${actual}`);
  assert.ok(Math.abs(actual-expected)<=tolerance,`${label}: ${actual} != ${expected} within ${tolerance}`);
};

const rows=[
  {group:'A',time:3,event:1},{group:'A',time:5,event:1},{group:'A',time:7,event:0},
  {group:'A',time:8,event:1},{group:'A',time:11,event:0},{group:'A',time:12,event:1},
  {group:'B',time:4,event:1},{group:'B',time:7,event:1},{group:'B',time:9,event:1},
  {group:'B',time:10,event:0},{group:'B',time:13,event:0},{group:'B',time:14,event:1}
];

const km=kaplanMeierSummary(rows,'group','time','event');
assert.equal(km.n,12);
assert.equal(km.events,8);
assert.deepEqual(km.riskTimes,[0,3.5,7,10.5,14]);
const A=km.groups.find(g=>g.group==='A');
const B=km.groups.find(g=>g.group==='B');
assert.equal(A.n,6);assert.equal(A.events,4);assert.equal(A.censored,2);assert.equal(A.median,8);
assert.equal(B.n,6);assert.equal(B.events,4);assert.equal(B.censored,2);assert.equal(B.median,9);
near(A.steps.find(s=>s.time===5).survival,2/3,1e-15,'KM A survival at 5');
near(A.steps.find(s=>s.time===8).survival,4/9,1e-15,'KM A survival at 8');
near(B.steps.find(s=>s.time===9).survival,0.5,1e-15,'KM B survival at 9');
assert.deepEqual(A.atRiskAt,[6,5,4,2,0]);
assert.deepEqual(B.atRiskAt,[6,6,5,2,1]);

const cox=coxBinaryGroup(rows,'group','time','event','A');
assert.equal(cox.ties,'breslow');
assert.equal(cox.converged,true);
assert.equal(cox.separationLikely,false);
assert.equal(cox.groupOfInterest,'A');
assert.equal(cox.reference,'B');
near(cox.beta,0.5891437437668614,3e-10,'Cox log HR');
near(cox.se,0.77064414,3e-8,'Cox SE');
near(cox.hr,1.8024444,4e-7,'Cox HR');
near(cox.hrCI[0],0.39800488,4e-8,'Cox HR CI lower');
near(cox.hrCI[1],8.16272855,5e-7,'Cox HR CI upper');
near(cox.p,0.44457992,4e-8,'Cox Wald p');
near(cox.logLik,-13.92263316195831,3e-12,'Cox partial log-likelihood');
near(cox.likelihoodRatio,0.5925206758196069,3e-12,'Cox LR statistic');
near(cox.pLikelihoodRatio,0.4414460410420693,4e-10,'Cox LR p');

const reciprocal=coxBinaryGroup(rows,'group','time','event','B');
near(reciprocal.hr,0.55480213,4e-8,'Cox reciprocal HR');
near(reciprocal.hrCI[0],0.12250806,4e-8,'Cox reciprocal CI lower');
near(reciprocal.hrCI[1],2.51253201,4e-8,'Cox reciprocal CI upper');

const separated=[
  {group:'A',time:1,event:1},{group:'A',time:2,event:1},{group:'A',time:3,event:1},{group:'A',time:4,event:1},
  {group:'B',time:5,event:0},{group:'B',time:6,event:0},{group:'B',time:7,event:0},{group:'B',time:8,event:0}
];
const unstable=coxBinaryGroup(separated,'group','time','event','A');
assert.equal(unstable.separationLikely,true);

console.log('Stats survival: Kaplan-Meier summaries and Breslow Cox PH reference vectors PASS');

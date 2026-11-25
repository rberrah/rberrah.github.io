import './test_game_careers.mjs';
// Deterministic numerical and hidden-route regression tests for PMx Game.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEFAULTS, CHALLENGE, STEP, atTime, fitScore, simulate, validate } from '../portal/game/engine.js';
import { QUESTS, profileFor, grade, logSlope, validateProgress, unlockedIndex } from '../portal/game/academy-core.js';
import { ADVANCED_MISSIONS, GRAPH_NODES, GRAPH_OPTIONS, GRAPH_EDGES, ODE_STATES, validateGraph, validateOdes, steadyStateBolus, gradeMic, aucLinear, aucMichaelis, nonlinearChallenge, oneDoseProfile, steadyStateOral, ddiChallenge, gradeDdi, loadingChallenge, repeatedBolus, accumulationChallenge, fractionationChallenge, ambiguityChallenge } from '../portal/game/advanced-core.js';

const near = (a,b,tol=1e-6) => assert.ok(Math.abs(a-b)<=tol, a + ' differs from ' + b);
const iv = simulate({ model:1, route:'iv', dose:100, vc:20, cl:4, horizon:24 });
for(const t of [0,1,5,10,20,24]) near(atTime(iv,t).c,5*Math.exp(-0.2*t),1e-8);
near(iv.auc,(100/4)*(1-Math.exp(-0.2*24)),0.001);
near(iv.delivered,100);
// An IV bolus at the last instant changes C(t), but adds zero AUC over [0, t].
const boundaryBolus = simulate({ model:1, route:'iv', dose:100, vc:20, cl:4, horizon:24, tau:24, doses:2 });
near(boundaryBolus.auc, iv.auc, 1e-9);
near(boundaryBolus.cEnd, iv.cEnd+5, 1e-8);
near(iv.points[0].c,5);
near(iv.points[0].gut,0);

for (const model of [1,2,3]) for(const route of ['oral','iv']) {
  const sim = simulate({ model, route, doses:3, tau:12, horizon:48, f:0.65 });
  near(sim.delivered, route === 'oral' ? 195 : 300);
  for(const p of sim.points) {
    near(p.gut+p.central+p.p1+p.p2+p.eliminated,sim.delivered >= 0 ? (
      p.t < 12 ? (route==='oral'?65:100) :
      p.t < 24 ? (route==='oral'?130:200) : (route==='oral'?195:300)
    ) : 0,0.001);
    for(const value of [p.gut,p.central,p.p1,p.p2,p.eliminated,p.c])
      assert.ok(Number.isFinite(value) && value>=0);
  }
  const mid = atTime(sim,5);
  assert.equal(mid.p1 > 0, model >= 2);
  assert.equal(mid.p2 > 0, model >= 3);
}
const oral = simulate({ ...DEFAULTS, route:'oral', doses:1 });
near(oral.points[0].c,0);
near(oral.points[0].gut,80);
const a = simulate({route:'oral',dose:80});
const b = simulate({route:'oral',dose:160});
near(2*a.auc,b.auc,1e-7);
near(2*a.peak,b.peak,1e-7);
assert.equal(fitScore(simulate(CHALLENGE),simulate(CHALLENGE)),100);
assert.ok(fitScore(simulate(DEFAULTS),simulate(CHALLENGE)) < 100);
for(const bad of [{dose:0},{ka:Infinity},{vc:0},{model:4},{route:'inject'},{horizon:12.3},{targetLow:5,targetHigh:3}])
  assert.throws(()=>validate(bad),RangeError);
near(STEP,0.025);

const delayed=simulate({model:1,route:'oral',lag:2,ka:1.5,horizon:24});
near(atTime(delayed,1.975).c,0);
near(atTime(delayed,2).gut,80);
assert.ok(atTime(delayed,2.05).c>0);
const immediate=simulate({model:1,route:'oral',lag:0,ka:1.5,horizon:24});
assert.ok(atTime(immediate,1).c>0);
assert.throws(()=>simulate({lag:6.25}),RangeError);
const ivWithLag=simulate({model:1,route:'iv',lag:2});
near(ivWithLag.points[0].c,100/25);

assert.equal(QUESTS.length,9);
assert.deepEqual(QUESTS.map(q=>q.id),['voyage','mono','bi','lag','slope','three','samples','flip','boss']);
for(const quest of QUESTS){
  const profile=profileFor(quest);
  assert.ok(profile.points.every(p=>p.c>=0 && Number.isFinite(p.c)));
  assert.equal(profile.config.doses,1);
  assert.equal(grade(quest,quest.answerMode==='number'?quest.answerValue:quest.answer).correct,true,quest.id);
  if(quest.answerMode==='number')assert.equal(grade(quest,quest.answerValue+1).correct,false,quest.id);
  else assert.equal(grade(quest,(quest.answer+1)%quest.options.length).correct,false,quest.id);
}
const slopeData=profileFor(QUESTS.find(q=>q.id==='slope'));
near(logSlope(slopeData,2,6),-0.25,1e-8);
const lagQuest=QUESTS.find(q=>q.id==='lag');
near(atTime(profileFor(lagQuest),1.975).c,0);
assert.equal(grade(lagQuest,2.25).correct,true);
assert.equal(grade(lagQuest,2.5).correct,false);
assert.equal(grade(QUESTS.find(q=>q.id==='slope'),0.25).correct,true);
assert.equal(grade(QUESTS.find(q=>q.id==='slope'),'').correct,false);
const cleaned=validateProgress({completed:['mono','mono','fake','voyage'],xp:999999});
assert.deepEqual(cleaned.completed,['mono','voyage']);
assert.equal(cleaned.xp,110);
assert.equal(unlockedIndex([]),0);
assert.equal(unlockedIndex(['voyage','mono']),2);
assert.equal(unlockedIndex(QUESTS.map(q=>q.id)),8);
assert.ok(profileFor(QUESTS[2]).points.length>profileFor(QUESTS[1]).points.length);



// Course exercises are deterministic and must not endorse clinical prescriptions.
assert.equal(ADVANCED_MISSIONS.length,9);
assert.deepEqual(ADVANCED_MISSIONS.map(m=>m.id),['graph','odes','mic','nonlinear','ddi','loading','accumulation','fraction','ambiguity']);
assert.equal(validateGraph(GRAPH_NODES.map(n=>n.id),GRAPH_EDGES).ok,true);
assert.equal(validateGraph(GRAPH_OPTIONS.map(n=>n.id),GRAPH_EDGES).ok,false);
assert.equal(validateGraph(['gut','central','peripheral','exit'],['gut>central','central>peripheral']).ok,false);
assert.equal(validateGraph(GRAPH_NODES.map(n=>n.id),[...GRAPH_EDGES,'peripheral>exit']).ok,false);
const correctOdes=Object.fromEntries(ODE_STATES.map(row=>[row.id,row.expected]));
assert.equal(validateOdes(correctOdes).ok,true);
assert.deepEqual(validateOdes({...correctOdes,central:['gut_in','elimination']}).wrong,['central']);
const metric=steadyStateBolus({dose:200,tau:8});
near(metric.fT,0.7658539094943748,1e-10);
near(metric.auc24,120,1e-12);
assert.equal(gradeMic({dose:200,tau:8}).ok,true);
assert.equal(gradeMic({dose:100,tau:8}).ok,false);
assert.equal(gradeMic({dose:300,tau:8}).ok,false);
near(aucLinear(200),40);
near(aucLinear(300),60);
near(aucMichaelis(100),15);
near(aucMichaelis(200),140/3,1e-9);
assert.ok(aucMichaelis(200)/aucMichaelis(100)>2.9);
assert.equal(nonlinearChallenge({linearDose:300,saturableDose:230}).ok,true);
assert.equal(nonlinearChallenge({linearDose:300,saturableDose:300}).ok,false);
const mmCurve=oneDoseProfile(200,'mm');
const linCurve=oneDoseProfile(200,'linear');
near(mmCurve[0].c,10);near(linCurve[0].c,10);
assert.ok(mmCurve.find(p=>Math.abs(p.t-1)<1e-7).c>linCurve.find(p=>Math.abs(p.t-1)<1e-7).c);
// AUCτ at SS follows FD/CL exactly; C0 does not generally scale in the same proportion.
const baseline=steadyStateOral();
const inhibited=steadyStateOral({cl:2.5});
near(baseline.auc,16);
near(inhibited.auc,32);
near(inhibited.auc/baseline.auc,2);
assert.ok(inhibited.cmin/baseline.cmin>3.5);
assert.ok(steadyStateOral({cl:2.5}).points.every(p=>Number.isFinite(p.c)&&p.c>0));
const dd=ddiChallenge(2.5);
assert.equal(gradeDdi(2.5,dd.troughRatio).ok,true);
assert.equal(gradeDdi(2.5,'trough').ok,true);
assert.equal(gradeDdi(2.5,'auc').ok,false);
assert.equal(gradeDdi(2.5,'same').ok,false);
assert.equal(gradeDdi(2.5,dd.aucRatio).ok,false);
assert.equal(gradeDdi(4.5,1.3).ok,false);
assert.throws(()=>steadyStateOral({cl:0}),RangeError);
assert.throws(()=>steadyStateBolus({mic:0}),RangeError);

assert.equal(loadingChallenge(60,108).ok,true);
assert.equal(loadingChallenge(108,60).ok,false);
near(loadingChallenge(60,108).initial,3);
near(loadingChallenge(60,108).average,3);
assert.equal(repeatedBolus(60,108).length,241);
near(repeatedBolus(60,108)[0].c,3);
assert.equal(accumulationChallenge({cl:0.75,doses:6}).ok,true);
assert.equal(accumulationChallenge({cl:0.75,doses:5}).ok,false);
assert.equal(accumulationChallenge({cl:1,doses:4}).ok,true);
assert.equal(accumulationChallenge({cl:2,doses:2}).ok,true);
near(fractionationChallenge(6).auc24,fractionationChallenge(12).auc24);
assert.equal(fractionationChallenge(6).ok,true);
assert.equal(fractionationChallenge(12).ok,false);
assert.ok(fractionationChallenge(6).fluctuation<fractionationChallenge(12).fluctuation);
assert.equal(ambiguityChallenge(0.4,2).ok,true);
assert.equal(ambiguityChallenge(0.8,4).ok,false); // same parameters are not a second explanation
assert.equal(ambiguityChallenge(0.8,6).ok,false);
near(ambiguityChallenge(0.4,2).auc,20);
assert.throws(()=>ambiguityChallenge(0,4),RangeError);
assert.throws(()=>fractionationChallenge(7),RangeError);
assert.throws(()=>accumulationChallenge({doses:0}),RangeError);
const journeySource=readFileSync('portal/game/journey-art.js','utf8');
assert.ok(journeySource.includes('data-stage'));
assert.ok(journeySource.includes('journey-arrow'));
const additionalSource=readFileSync('portal/game/advanced-more.js','utf8');
assert.ok(additionalSource.includes('setupExtended'));
const advancedSource=readFileSync('portal/game/advanced.js','utf8');
assert.ok(!advancedSource.includes('id="adv-ddi-prediction"'));
assert.ok(advancedSource.includes('name="ddi-comparison"'));

// No answers are rendered in numerical placeholders or lag annotations before solving.
const academySource=readFileSync('portal/game/academy.js','utf8');
const visualSource=readFileSync('portal/game/academy-visual.js','utf8');
assert.match(academySource,/input.placeholder='Votre estimation'/);
assert.match(academySource,/choices.length-1/);
assert.match(visualSource,/quest.id==='lag' && solved/);
assert.ok(QUESTS.find(q=>q.id==='flip').question.toLowerCase().includes('clairance'));
assert.ok(QUESTS.find(q=>q.id==='flip').options[QUESTS.find(q=>q.id==='flip').answer].includes('pente orale'));

const page=readFileSync('portal/game/index.html','utf8');
for(const expected of ['name="robots" content="index,follow"','src="./app.js"','src="./academy.js"','src="./advanced.js"','href="./academy.css"','id="academy-mode"' ,'id="advanced-mode"','id="quest-list"','id="academy-chart"','id="diagram"','id="chart"','id="challenge"'])
  assert.ok(page.includes(expected), expected + ' missing');
assert.ok(readFileSync('portal/index.html','utf8').includes('/pharmacometrie/game/'));
const layoutSource=readFileSync('src/routes/+layout.svelte','utf8');
assert.ok(layoutSource.includes("key: 'game'"));
assert.match(layoutSource,/data-sveltekit-reload=\{link\.key === 'game'/);
assert.match(layoutSource,/game\/\?lang=\$\{\$language\}/);
for(const route of ['src/routes/+page.svelte','src/routes/chapitres/+page.svelte']){
  const source=readFileSync(route,'utf8');
  assert.match(source,/game\/\?lang=\$\{\$language\}\`\} data-sveltekit-reload/);
}
assert.ok(readFileSync('scripts/mount_game_route.mjs','utf8').includes("'pharmacometrie','game'"));
assert.match(readFileSync('scripts/mount_game_route.mjs','utf8'),/await rm\(legacy/);
const injector=readFileSync('scripts/add_portal_analytics.mjs','utf8');
assert.match(injector,/directory === target && entry.name === 'game'/);
console.log('PASS: PMx Game scientific engine, official canonical route and published navigation.');


// Optional navigation and source provenance regressions.
const {normalizeCompleted,firstIncomplete,canVisit}=await import('../portal/game/learning-mode.js');
assert.deepEqual(normalizeCompleted([6,6,0,-1,7,'2'],7),[0,6]);
assert.equal(firstIncomplete([0,6],7),1);
assert.equal(canVisit(5,[0,6],7,false),false);
assert.equal(canVisit(6,[0,6],7,false),true);
assert.equal(canVisit(5,[0,6],7,true),true);
const {ARCHIVE_COMPARISONS,ARCHIVE_GOF}=await import('../portal/game/warfarin-evidence.js');
const notebook=JSON.parse(readFileSync('course_source/warfarin/warfarin_pkpd_nlmixr2_EN.ipynb','utf8'));
for(const stage of ARCHIVE_COMPARISONS){
  const output=notebook.cells[stage.cell].outputs.map(o=>o.data?.['text/plain']?.join('')||'').join('\n');
  for(const [,aic,bic,ll] of stage.models) for(const x of [aic,bic,ll]) assert.ok(output.includes(x.toFixed(4)));
}
for(const g of ARCHIVE_GOF){
  const data=notebook.cells[g.cell].outputs[g.output].data['image/png'];
  const expected=Buffer.from(Array.isArray(data)?data.join(''):data,'base64');
  assert.ok(readFileSync('portal/game/warfarin-archive/'+g.id+'.png').equals(expected));
}

import {doubleGammaConcentration as gammaC,doubleGammaAuc as gammaAuc} from '../portal/game/double-gamma.js';
import {WOILLARD_MPA} from '../portal/game/woillard-mpa-source.js';
const gammaFixtures=JSON.parse(readFileSync('portal/game/double-gamma-fixtures.json','utf8')).fixtures;
for(const f of gammaFixtures){
 const p=f.parameters;
 f.times.forEach((t,i)=>assert.ok(Math.abs(gammaC(t,p)-f.concentrations[i])<1e-7));
 assert.ok(Math.abs(gammaC(0,p)-gammaC(p.tau,p))<1e-10);
 assert.ok(Math.abs(gammaC(1,{...p,dose:p.dose*2})-2*gammaC(1,p))<1e-9);
 assert.equal(gammaAuc(p),f.auc);
 const n=480;
 let area=0;
 for(let i=0;i<=n;i++)area+=(i===0||i===n?.5:1)*gammaC(i*p.tau/n,p)*p.tau/n;
 assert.ok(Math.abs(area/f.auc-1)<.001);
 const swapped={...p,a1:p.a2,b1:p.b2,a2:p.a1,b2:p.b1,f:1-p.f};
 assert.ok(Math.abs(gammaC(3,p)-gammaC(3,swapped))<1e-9);
}
const q=gammaFixtures[2].parameters;
for(const t of gammaFixtures[2].times){
 const k=q.cl/q.v,ka=q.b1,phase=t%q.tau;
 const fo=q.dose*ka/(q.v*(ka-k))*(Math.exp(-k*phase)/(-Math.expm1(-k*q.tau))-Math.exp(-ka*phase)/(-Math.expm1(-ka*q.tau)));
 assert.ok(Math.abs(gammaC(t,q)-fo)<1e-8);
}
assert.throws(()=>gammaC(1,{...q,a1:0}),RangeError);
assert.throws(()=>gammaC(1,{...q,f:1.1}),RangeError);
assert.equal(WOILLARD_MPA.enabled,false);
assert.equal(WOILLARD_MPA.populationParameters.ITS.a1,13.51);
assert.equal(WOILLARD_MPA.variability.Pmetrics.alpha,70.5);
assert.deepEqual(WOILLARD_MPA.samplingHours,[1/3,1,3,6]);
console.log('PASS: independent double-gamma fixture comparisons, periodicity, AUC and source lock.');

// Independent SciPy gamma.pdf/quad references, conditional on 100 mg convention and constant C0.
const {referenceGammaConcentration,referenceGammaAuc,gammaDensity}=await import('../portal/game/double-gamma.js');
const refTimes=[0,1/3,1,3,6,12];
const refCases=[
 ['ITS',[1.7000000000000002,2.292625319040597,8.305940729406348,3.391684388282943,1.7587612777546875,1.7000708977271124],35.22136526988649],
 ['Pmetrics',[1.6,1.6026664326799929,13.873411848808653,2.7796164517376014,1.6088723983960398,1.6000005019275125],36.868711348510715]
];
for(const [method,expected,auc] of refCases){
 const p=WOILLARD_MPA.populationParameters[method];
 refTimes.forEach((t,i)=>assert.ok(Math.abs(referenceGammaConcentration(t,p,1000)-expected[i])<1e-7));
 assert.ok(Math.abs(referenceGammaAuc(12,p,1000)-auc)<1e-7);
 assert.equal(referenceGammaConcentration(0,p,100),p.c0);
 assert.ok(Math.abs(referenceGammaAuc(12,p,500)-auc/2)<1e-7);
}
assert.equal(gammaDensity(0,2,4),0);
assert.ok(Math.abs(gammaDensity(1,1,2)-2*Math.exp(-2))<1e-12);
assert.equal(WOILLARD_MPA.residualError,null);
assert.equal(WOILLARD_MPA.enabled,false);

import {SUPPORTS,INITIAL,TIMES,PATIENT,SYNTHETIC_PROFILES,fitFixedGrid,updateWeights,summarize,populationLogLikelihood} from '../portal/game/pmetrics-course-core.js';
assert.equal(SUPPORTS.length,5);
assert.equal(SYNTHETIC_PROFILES.length,12);
assert.deepEqual(TIMES,[1/3,1,3,6]);
const npFit=fitFixedGrid(20);
for(let i=0;i<npFit.length;i++){
 const row=npFit[i];assert.ok(Math.abs(row.weights.reduce((s,w)=>s+w,0)-1)<1e-12);
 assert.ok(row.weights.every(w=>w>=0&&Number.isFinite(w)));
 if(i)assert.ok(row.ll>=npFit[i-1].ll-1e-10);
}
assert.ok(npFit.at(-1).ll>npFit[0].ll);
const npPrior=npFit.at(-1).weights;
const npEmpty=updateWeights(npPrior,[]).weights;
npEmpty.forEach((w,i)=>assert.ok(Math.abs(w-npPrior[i])<1e-12));
const npPost=updateWeights(npPrior,PATIENT).weights;
assert.ok(npPost[0]>npPrior[0]);
assert.equal(summarize(npPost).map,0);
assert.ok(summarize(npPost).aucMean>0);
assert.throws(()=>updateWeights([1,1,1,1,1],PATIENT));
console.log('PASS: fixed-support mixture likelihood, discrete Bayesian update and synthetic source isolation.');

const {patientSample,individualPrediction,OVERFIT_TIME,trueConcentration}=await import('../portal/game/pmetrics-course-core.js');
const noisy=[patientSample(OVERFIT_TIME)];
const moderate=individualPrediction(npPrior,noisy,.18),low=individualPrediction(npPrior,noisy,.005);
assert.equal(moderate.map,0);
assert.notEqual(low.map,0);
assert.ok(low.sampleRmse<moderate.sampleRmse);
assert.ok(low.truthRmse>moderate.truthRmse+1);
assert.deepEqual(patientSample(OVERFIT_TIME),noisy[0]);
assert.equal(individualPrediction(npPrior,[],.18).estimateAt(2),individualPrediction(npPrior,[],.18).priorAt(2));
assert.throws(()=>patientSample(13),RangeError);
console.log('PASS: arbitrary sampling, fixed noisy measurements, three-curve MAP and demonstrated RUV overfit.');

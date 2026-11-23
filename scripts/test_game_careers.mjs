// Runtime-free scientific regression checks for the two new educational tracks.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {STUDY_META,STUDY_SUBJECTS,STUDY_PK,STUDY_PD} from '../portal/game/warfarin-study.js';
import {POPULATION_META,SUBJECTS,OBSERVATIONS as POP_OBS,FITS,TIMES,
  modelComparison,populationPredict,assessMapping,gradeStructureConclusion,chooseChecks}
 from '../portal/game/saem-replay.js';
import {CASE,DOSES,OBSERVATIONS as MIPD_OBS,infusionAt,posterior,
  doseEvaluation,candidateDoses,chooseDose,simulatorCurve,sampleTimingGrade,qualityGate,
  evaluateEndpoints,scenarioComparison,PKPD}
 from '../portal/game/mipd-course-core.js';

const near=(a,b,tol=1e-7)=>assert.ok(Math.abs(a-b)<=tol,String(a)+' differs from '+String(b));
// The actual O'Reilly/Monolix study must not be mistaken for the synthetic SAEM pilot.
assert.equal(STUDY_META.nSubjects,32);
assert.equal(STUDY_META.nPK,251);
assert.equal(STUDY_META.nPD,232);
assert.equal(STUDY_SUBJECTS.length,32);
assert.equal(STUDY_PK.length,251);
assert.equal(STUDY_PD.length,232);
assert.equal(STUDY_PK.filter(p=>p.c===0).length,4);
assert.equal(new Set(STUDY_PK.map(p=>p.id)).size,32);
assert.ok(STUDY_PK.every(p=>STUDY_SUBJECTS.some(s=>s.id===p.id&&s.dose===p.dose)));
const studySource=readFileSync('static/downloads/warfarin/warfarin_data.csv','utf8');
assert.equal(studySource.split(/\r?\n/).filter(l=>l.includes(';')).length,516);
assert.ok(STUDY_META.sourceUrl.includes('monolixsuite'));
assert.equal(POPULATION_META.nSubjects,28);
assert.equal(POPULATION_META.nObservations,285);
assert.equal(SUBJECTS.length,28);
assert.equal(POP_OBS.length,285);
assert.equal(new Set(POP_OBS.map(x=>x.id)).size,28);
for(const row of POP_OBS){
  assert.ok(row.t>=0&&row.c>0);
  assert.ok(TIMES.includes(row.t));
  near(row.dose,SUBJECTS[row.id-1].dose);
}
assert.deepEqual(Object.keys(FITS).sort(),['lag','one','two']);
for(const fit of Object.values(FITS)){
  assert.equal(fit.trace.length,9);
  assert.equal(fit.trace[0][0],1);
  assert.equal(fit.trace.at(-1)[0],170);
  assert.equal(fit.eta.length,28);
  assert.ok(fit.trace.every(r=>r.every(Number.isFinite)));
  assert.ok(fit.bic<0&&fit.neg2ll<0);
}
const comparison=modelComparison();
const lag=comparison.find(x=>x.id==='lag'),one=comparison.find(x=>x.id==='one'),two=comparison.find(x=>x.id==='two');
near(lag.bic,-224.01);near(one.bic,-223.78);near(two.bic,-215.27);
assert.ok(one.deltaBic<2,'A non-decisive BIC contrast must remain non-decisive');
assert.ok(two.deltaBic>6);
near(populationPredict('lag',0,100),0);
near(populationPredict('lag',.3,100),0);
assert.ok(populationPredict('lag',6,100)>0);
assert.ok(populationPredict('two',6,100)>0);
assert.ok(populationPredict('one',6,100)>0);
assert.throws(()=>populationPredict('bad',6,100),RangeError);
assert.equal(assessMapping({id:'id',time:'time',dose:'dose',concentration:'dv',event:'evid'}),true);
assert.equal(assessMapping({id:'id',time:'time',dose:'dose',concentration:'dv'}),false);
assert.equal(assessMapping({id:'dv',time:'time',dose:'dose',concentration:'id'}),false);
assert.equal(gradeStructureConclusion('equivocal'),true);
assert.equal(gradeStructureConclusion('lag-proved'),false);
assert.equal(chooseChecks(['gof','vpc','stability']),true);
assert.equal(chooseChecks(['gof','vpc','bic-only']),false);

assert.equal(DOSES.length,5);
assert.deepEqual(MIPD_OBS.map(o=>o.t),[2,11]);
assert.ok(MIPD_OBS.every(o=>o.value>0));
const pre=infusionAt(0,{cl:CASE.trueCL,v:CASE.trueV});
near(pre,infusionAt(CASE.tau,{cl:CASE.trueCL,v:CASE.trueV}),1e-12);
assert.ok(infusionAt(2,{cl:CASE.trueCL,v:CASE.trueV})>infusionAt(11,{cl:CASE.trueCL,v:CASE.trueV}));
assert.throws(()=>infusionAt(2,{cl:0}),RangeError);
const p0=posterior({samples:0}),p1=posterior({samples:1}),p2=posterior({samples:2});
for(const p of [p0,p1,p2]){
  near(p.rows.reduce((x,r)=>x+r.w,0),1,1e-10);
  assert.equal(p.rows.length,57*49);
  assert.ok(p.rows.every(x=>x.w>=0));
}
assert.ok(p2.clCI[1]-p2.clCI[0] < p0.clCI[1]-p0.clCI[0]);
assert.ok(Math.abs(p2.meanCL-CASE.trueCL)<.3);
assert.ok(Math.abs(p2.mapCL-CASE.trueCL)<.4);
assert.ok(Math.abs(p2.mapV-CASE.trueV)<4);
assert.ok(Math.abs(p2.meanV-CASE.trueV)<3);
assert.ok(chooseDose(p2).dose===900);
assert.ok(doseEvaluation(p2,900).within);
assert.ok(doseEvaluation(p2,900).p>.85);
assert.ok(!doseEvaluation(p2,600).within);
assert.ok(!candidateDoses(p0).some(x=>x.within));
assert.ok(doseEvaluation(p2,600,{clMultiplier:.6}).within);
assert.equal(chooseDose(p2,.6).dose,600);
assert.throws(()=>doseEvaluation(p2,2000),RangeError);
assert.throws(()=>posterior({samples:3}),RangeError);
assert.ok(simulatorCurve(p2,900).length>60);
assert.equal(sampleTimingGrade(['post-infusion','trough']),true);
assert.equal(sampleTimingGrade(['trough','trough']),false);
assert.equal(sampleTimingGrade(['trough','untimed']),false);
assert.equal(qualityGate({dose:900,modelValidated:false}).canBeUsedClinically,false);
const epi=evaluateEndpoints(p2,900);
assert.ok(epi.meets.auc && epi.meets.trough && epi.meets.time && !epi.toxic);
assert.ok(evaluateEndpoints(p2,1200).toxic);
assert.equal(PKPD.mic*PKPD.micMultiple,8);
const scenarios=scenarioComparison(p2,900,.6);
near(scenarios.unchanged.auc,scenarios.aucMatched.auc,1e-8);
near(scenarios.aucMatched.dose,540);
near(scenarios.safetyReduced.dose,450);
assert.ok(scenarios.aucMatched.toxic,'AUC-preserving adjustment must expose excessive C0');
assert.ok(!scenarios.safetyReduced.toxic,'The more conservative dose must reduce C0');
assert.ok(scenarios.safetyReduced.auc<PKPD.aucLow,'The trade-off must remain visible');
assert.throws(()=>evaluateEndpoints(p2,-1),RangeError);

const html=readFileSync('portal/game/index.html','utf8');
for(const key of ['id="population-mode"','id="mipd-mode"','id="mode-population"','id="mode-mipd"',
  'src="./population-course.js"','src="./mipd-course.js"','href="./courses.css"']){
  assert.ok(html.includes(key),key+' missing in game page');
}
assert.ok(readFileSync('portal/index.html','utf8').includes('/pharmacometrie/game/'));
assert.ok(!readFileSync('portal/index.html','utf8').includes('href="/game"'));
const populationUi=readFileSync('portal/game/population-course.js','utf8');
const mipdUi=readFileSync('portal/game/mipd-course.js','utf8');
for(const fragment of ['STUDY_PK','STUDY_PD','pop-spaghetti','pop-gof-ipred','pop-resid-qq','simulatedVPC','pop-eta-weight','pop-variability-metrics','pop-iiv-density','pop-ruv-shape','variabilitySummary'])assert.ok(populationUi.includes(fragment));
for(const fragment of ['mipd-sampling-verdict','mipd-post-v','mipd-criterion','mipd-shift-safety','concentrationLegend'])assert.ok(mipdUi.includes(fragment));
assert.ok(html.includes('id="game-lang-en"') && html.includes('src="./locale.js"'));
for(const path of ['locale-en.js','locale-en-lessons.js','locale-en-mipd.js']){
  assert.ok(readFileSync('portal/game/'+path,'utf8').length>1000,'English catalog must be substantial');
}
const variabilitySource=readFileSync('portal/game/population-course.js','utf8');
assert.match(variabilitySource,/shrinkage:100\*\(1-etaSD\/omega\)/);
console.log('PASS: real warfarin study, scientific SAEM replay, IIV/RUV/GOF/VPC, bilingual interface, MAP-BE/dose scenarios.');

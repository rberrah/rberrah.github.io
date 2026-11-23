// Study-grounded PopPK + purely fictional MIPD regression tests.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WARFARIN_ROWS,WARFARIN_PK,WARFARIN_PD,WARFARIN_PROVENANCE} from '../portal/game/warfarin-study.js';
import {POPULATION_META,SUBJECTS,OBSERVATIONS as POP_OBS,FITS,ADVANCED_FITS,FINAL_FIT,
 modelComparison,populationPredict,assessMapping,gradeStructureConclusion,chooseChecks}
 from '../portal/game/saem-replay.js';
import {NATIVE_GOF} from '../portal/game/warfarin-native-gof.js';
import {DIAGNOSTIC_OPTIONS,DIAG_ROWS,VPC_DEMO,diagnosticsSummary,estimateCLProxy,drawDiagnostic}
 from '../portal/game/warfarin-diagnostics.js';
import {CASE,DOSES,OBSERVATIONS as MIPD_OBS,infusionAt,posterior,doseEvaluation,candidateDoses,chooseDose,
 simulatorCurve,qualityGate,TARGETS,exposureAtSS,fractionAboveThreshold,gradeDoseGoal,gradeCLChange,assessGivenSamplePlan}
 from '../portal/game/mipd-course-core.js';
const near=(a,b,tol=1e-7)=>assert.ok(Math.abs(a-b)<=tol,String(a)+' differs from '+String(b));
const csv=readFileSync('course_source/warfarin/warfarin_data.csv','utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/);
assert.equal(csv.length,516);
assert.equal(WARFARIN_ROWS.length,515);
assert.equal(SUBJECTS.length,32);
assert.equal(WARFARIN_PK.length,251);
assert.equal(WARFARIN_PD.length,232);
assert.equal(POP_OBS.length,251);
assert.equal(POPULATION_META.nSubjects,32);
assert.equal(POPULATION_META.nObservations,251);
assert.equal(WARFARIN_PROVENANCE.rows,515);
assert.equal(WARFARIN_ROWS.filter(o=>o.amt!==null).length,32);
assert.ok(WARFARIN_PK.some(o=>o.c===0));
assert.equal(WARFARIN_PK.filter(o=>o.id===8&&o.t===3).length,2);
assert.ok(WARFARIN_ROWS.some(o=>o.dvid===2&&o.dv===100));
assert.ok(WARFARIN_PK.every(o=>SUBJECTS.some(s=>s.id===o.id&&Math.abs(s.dose-o.dose)<1e-12)));
assert.deepEqual(Object.keys(FITS).sort(),['lag','one','two']);
near(FITS.one.bic,927.8178);near(FITS.lag.bic,817.0979);near(FITS.two.bic,859.3567);
near(ADVANCED_FITS.covariate.bic,779.7962);
near(FINAL_FIT.tlag,.696);near(FINAL_FIT.cl,.133);near(FINAL_FIT.volume,8.07);
const models=modelComparison();
assert.ok(models.find(x=>x.id==='one').deltaBic>100);
assert.ok(models.find(x=>x.id==='two').deltaBic>40);
assert.equal(gradeStructureConclusion('lag-supported'),true);
assert.equal(gradeStructureConclusion('equivocal'),false);
assert.equal(assessMapping({id:'id',time:'time',dose:'dose',concentration:'dv',event:'dvid'}),true);
assert.equal(assessMapping({id:'id',time:'time',dose:'dose',concentration:'dv',event:'evid'}),false);
assert.equal(chooseChecks(['gof','vpc','stability']),true);
assert.equal(chooseChecks(['gof','vpc','bic-only']),false);
assert.equal(populationPredict('final',0,100),0);
assert.equal(populationPredict('final',.3,100),0);
assert.ok(populationPredict('final',12,100)>0);
assert.ok(populationPredict('one',.3,100)>0);
assert.throws(()=>populationPredict('two',6,100),RangeError);
assert.equal(DIAG_ROWS.length,251);
assert.ok(DIAG_ROWS.every(x=>[x.pred,x.ipred,x.res,x.wres,x.ires,x.iwres].every(Number.isFinite)));
assert.equal(estimateCLProxy().size,32);
assert.equal(diagnosticsSummary().n,251);
assert.equal(diagnosticsSummary().originalPCA,232);
assert.equal(DIAGNOSTIC_OPTIONS.length,12);
assert.deepEqual(Object.keys(NATIVE_GOF).sort(),['native-cwres','native-ipred','native-pred']);
assert.ok(Object.values(NATIVE_GOF).every(o=>o.src.startsWith('data:image/png;base64,')&&o.src.length>15000));
assert.ok(VPC_DEMO.length>=5);
assert.ok(VPC_DEMO.every(v=>[v.obsMedian,v.simMedian,v.lower,v.upper].every(Number.isFinite)));
for(const item of DIAGNOSTIC_OPTIONS){
 const svg={innerHTML:'',setAttribute(key,val){this[key]=val;}};
 const result=drawDiagnostic(svg,item.id,SUBJECTS[0].id);
 assert.ok(result.length>90,item.id);
 assert.equal(svg.viewBox,'0 0 730 300');
}
assert.ok(!readFileSync('portal/game/population-course.js','utf8').includes('28 sujets, 285'));
assert.ok(!readFileSync('portal/game/population-course.js','utf8').includes('170 itérations'));
assert.ok(!readFileSync('portal/game/index.html','utf8').includes('warfarine <strong>synthétique</strong>'));
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
assert.ok(p2.clCI[1]-p2.clCI[0]<p0.clCI[1]-p0.clCI[0]);
assert.ok(Math.abs(p2.meanCL-CASE.trueCL)<.3);
assert.ok(Math.abs(p2.mapCL-CASE.trueCL)<.4);
assert.ok(Math.abs(p2.mapV-CASE.trueV)<4);
assert.equal(chooseDose(p2).dose,900);
assert.ok(doseEvaluation(p2,900).within);
assert.ok(doseEvaluation(p2,900).p>.85);
assert.ok(!candidateDoses(p0).some(x=>x.within));
assert.equal(assessGivenSamplePlan('conditional'),true);
assert.equal(assessGivenSamplePlan('universal'),false);
const current=exposureAtSS(p2,900);
near(current.auc24,490.73957063865265,1e-8);
near(current.c0,9.337771055574418,1e-8);
assert.ok(current.fT2MIC>=.90);
for(const goal of ['auc','c0','ft'])assert.ok(gradeDoseGoal(p2,900,goal).ok);
assert.ok(!gradeDoseGoal(p2,600,'auc').ok);
assert.ok(!gradeDoseGoal(p2,1200,'ft').ok);
assert.throws(()=>gradeDoseGoal(p2,900,'random'),RangeError);
assert.throws(()=>fractionAboveThreshold({dose:0,cl:1,v:10}),RangeError);
const scenario=gradeCLChange(p2,540,450);
assert.ok(scenario.ok&&scenario.aucOk&&scenario.c0Ok&&scenario.conflict);
assert.ok(scenario.preserveAuc.c0>=TARGETS.toxicTrough);
assert.ok(scenario.preserveTrough.c0<TARGETS.toxicTrough);
assert.ok(scenario.preserveTrough.auc24<TARGETS.aucLow);
assert.ok(!gradeCLChange(p2,450,540).ok);
assert.throws(()=>posterior({samples:3}),RangeError);
assert.ok(simulatorCurve(p2,900).length>60);
assert.equal(qualityGate({dose:900,modelValidated:false}).canBeUsedClinically,false);
const html=readFileSync('portal/game/index.html','utf8');
for(const k of ['id="population-mode"','id="mipd-mode"','id="mode-population"','id="mode-mipd"',
 'src="./population-course.js"','src="./mipd-course.js"','href="./courses.css"'])assert.ok(html.includes(k));
assert.ok(!readFileSync('portal/sitemap.xml','utf8').includes('/game'));
assert.ok(!readFileSync('portal/index.html','utf8').includes('href="/game"'));
console.log('PASS: historic warfarin study and executed nlmixr2 scores, 12 scientific diagnostic views, and fictional MAP-BE AUC/C0/fT benefit-risk exercises.');

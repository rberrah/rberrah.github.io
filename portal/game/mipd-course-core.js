// PMx Game: fictional 1-compartment infusion MAP-BE teaching engine.
// This is a bounded grid posterior, NOT the clinical MIPD-Engine and NOT a validated vancomycin model.
export const CASE = Object.freeze({
  name:'Antibiotique V (fictif)', dose:750,tau:12,duration:1,
  priorCL:4.5,priorV:32,omegaCL:.28,omegaV:.22,
  observationCV:.09, observationFloor:.35,
  targetLow:440,targetHigh:560,
  measured:[{t:2,label:'2 h après début de perfusion',value:0},{t:11,label:'11 h après début de perfusion',value:0}],
  trueCL:3.6,trueV:29
});
export const DOSES = Object.freeze([600,750,900,1050,1200]);
export function infusionAt(t,{dose=CASE.dose,tau=CASE.tau,duration=CASE.duration,cl=CASE.priorCL,v=CASE.priorV}={}){
  if(![t,dose,tau,duration,cl,v].every(Number.isFinite)||dose<=0||tau<=0||duration<=0||duration>=tau||cl<=0||v<=0) throw new RangeError('Invalid fictional infusion input');
  const k=cl/v, r=dose/duration, end= r/cl*(1-Math.exp(-k*duration))/(1-Math.exp(-k*tau));
  const trough=end*Math.exp(-k*(tau-duration));
  const tmod=((t%tau)+tau)%tau;
  if(tmod<=duration) return trough*Math.exp(-k*tmod)+r/cl*(1-Math.exp(-k*tmod));
  return end*Math.exp(-k*(tmod-duration));
}
export const OBSERVATIONS=Object.freeze([
  {t:2,value:Number((infusionAt(2,{cl:CASE.trueCL,v:CASE.trueV})*1.035).toFixed(2))},
  {t:11,value:Number((infusionAt(11,{cl:CASE.trueCL,v:CASE.trueV})*.955).toFixed(2))}
]);
const CL_GRID=Object.freeze(Array.from({length:57},(_,i)=>1.7+i*.1));
const V_GRID=Object.freeze(Array.from({length:49},(_,i)=>18+i*.6));
function logNormalPrior(x,median,omega){return -.5*(Math.log(x/median)/omega)**2-Math.log(x*omega);}
function weightedQuantile(data,key,prob){
  const sorted=[...data].sort((a,b)=>a[key]-b[key]);
  let total=0;for(const x of sorted){total+=x.w;if(total>=prob)return x[key];}
  return sorted.at(-1)[key];
}
export function posterior({samples=0,clMultiplier=1}={}){
  if(![0,1,2].includes(samples)||!Number.isFinite(clMultiplier)||clMultiplier<.45||clMultiplier>1.05)
    throw new RangeError('Invalid posterior scenario');
  const logrows=[];
  for(const cl of CL_GRID) for(const v of V_GRID){
    let l=logNormalPrior(cl,CASE.priorCL,CASE.omegaCL)+logNormalPrior(v,CASE.priorV,CASE.omegaV);
    for(let j=0;j<samples;j++){
      const {t,value}=OBSERVATIONS[j];
      const pred=infusionAt(t,{cl,v});
      const sd=Math.sqrt((CASE.observationCV*pred)**2+CASE.observationFloor**2);
      l+= -.5*((value-pred)/sd)**2-Math.log(sd);
    }
    logrows.push({cl,v,l});
  }
  const max=Math.max(...logrows.map(r=>r.l));
  let sum=0;for(const r of logrows){r.w=Math.exp(r.l-max);sum+=r.w;}
  for(const r of logrows)r.w/=sum;
  // Here cl refers to the Bayesian-estimated baseline CL; adjust only for prospective scenario.
  const meanCL=logrows.reduce((s,r)=>s+r.cl*r.w,0);
  const meanV=logrows.reduce((s,r)=>s+r.v*r.w,0);
  const mapRow=logrows.reduce((best,row)=>row.w>best.w?row:best,logrows[0]);
  const clCI=[weightedQuantile(logrows,'cl',.05),weightedQuantile(logrows,'cl',.95)];
  return {samples,meanCL,meanV,mapCL:mapRow.cl,mapV:mapRow.v,clCI,rows:logrows,clMultiplier};
}
export function doseEvaluation(post,dose,{clMultiplier=post.clMultiplier??1}={}){
  if(!DOSES.includes(dose)||!Number.isFinite(clMultiplier)||clMultiplier<.45||clMultiplier>1.05)
    throw new RangeError('Invalid fictional dose');
  let p=0,auc=0,excess=0,below=0;
  for(const row of post.rows){
    const a=24/CASE.tau*dose/(row.cl*clMultiplier);
    auc+=row.w*a;
    if(a>=CASE.targetLow&&a<=CASE.targetHigh)p+=row.w;
    if(a>CASE.targetHigh)excess+=row.w;
    if(a<CASE.targetLow)below+=row.w;
  }
  return {dose,p,auc,excess,below,within:p>=.68};
}
export function candidateDoses(post,scale=1){return DOSES.map(dose=>doseEvaluation(post,dose,{clMultiplier:scale}));}
export function coverageBeforeAfter(){
  const prior=posterior({samples:0});
  const after1=posterior({samples:1});
  const after2=posterior({samples:2});
  return {prior,after1,after2};
}
export function chooseDose(post,clMultiplier=1){
  const a=candidateDoses(post,clMultiplier);
  return [...a].sort((x,y)=>y.p-x.p||x.dose-y.dose)[0];
}
export function simulatorCurve(post,dose,clMultiplier=1){
  return Array.from({length:73},(_,i)=>{
    const t=i*CASE.tau/72;
    return {t,c:infusionAt(t,{dose,cl:post.meanCL*clMultiplier,v:post.meanV})};
  });
}
export function sampleTimingGrade(answers){
  const set=new Set(answers);
  return set.size===2 && set.has('post-infusion')&&set.has('trough');
}
export function qualityGate({dose,modelValidated=false,changingCL=false,missingTimes=false}={}){
  const reasons=[];
  if(!modelValidated) reasons.push('Le modèle fictif n’a aucune validation clinique externe.');
  if(changingCL) reasons.push('CL a pu évoluer depuis le dernier dosage : réévaluation nécessaire.');
  if(missingTimes) reasons.push('Les horaires de prélèvement doivent être vérifiés.');
  if(!DOSES.includes(dose)) reasons.push('La dose est hors de la grille pédagogique.');
  return {canBeUsedClinically:false,reasons};
}


// Additional *fictional* PK/PD targets for the user's benefit/risk exercise.
// Do not identify these as clinical vancomycin or beta-lactam recommendations.
export const TARGETS=Object.freeze({
 mic:5,twiceMIC:10,minFractionAbove2MIC:.90,
 troughLow:8,troughHigh:11,toxicTrough:12,
 aucLow:CASE.targetLow,aucHigh:CASE.targetHigh,
 changedClMultiplier:.6,
 baselineDose:900,
 saferDoses:Object.freeze([450,480,500,540,600])
});
export function fractionAboveThreshold({dose,cl,v,tau=CASE.tau,duration=CASE.duration,threshold=TARGETS.twiceMIC}={}){
 if(![dose,cl,v,tau,duration,threshold].every(Number.isFinite)||Math.min(dose,cl,v,tau,duration,threshold)<=0||duration>=tau)
 throw new RangeError('Invalid fraction threshold scenario');
 const k=cl/v,r=dose/duration,steady=r/cl;
 const trough=infusionAt(0,{dose,cl,v,tau,duration});
 const peak=infusionAt(duration,{dose,cl,v,tau,duration});
 if(trough>=threshold)return 1;
 if(peak<=threshold)return 0;
 const ratio=(threshold-steady)/(trough-steady);
 const start=Math.max(0,Math.min(duration,-Math.log(Math.max(1e-12,ratio))/k));
 const finish=Math.max(duration,Math.min(tau,duration+Math.log(peak/threshold)/k));
 return Math.max(0,Math.min(1,(finish-start)/tau));
}
export function exposureAtSS(post,dose,scale=1){
 if(!Number.isFinite(dose)||dose<=0||!Number.isFinite(scale)||scale<=0||scale>1.1)throw new RangeError('Invalid evaluation');
 const cl=post.meanCL*scale,v=post.meanV,tau=CASE.tau,duration=CASE.duration;
 const c0=infusionAt(0,{dose,cl,v,tau,duration});
 const cmax=infusionAt(duration,{dose,cl,v,tau,duration});
 const fT2MIC=fractionAboveThreshold({dose,cl,v,tau,duration});
 const auc24=24/tau*dose/cl;
 const aucProb=DOSES.includes(dose)?doseEvaluation(post,dose,{clMultiplier:scale}).p:null;
 return {dose,cl,v,c0,cmax,auc24,aucProb,fT2MIC,
  toxic:c0>=TARGETS.toxicTrough,
  aucAccept:auc24>=TARGETS.aucLow&&auc24<=TARGETS.aucHigh,
  c0Accept:c0>=TARGETS.troughLow&&c0<=TARGETS.troughHigh,
  timeAccept:fT2MIC>=TARGETS.minFractionAbove2MIC};
}
export function gradeDoseGoal(post,dose,goal='auc'){
 if(!['auc','c0','ft'].includes(goal))throw new RangeError('Invalid fictional target');
 const e=exposureAtSS(post,dose);
 const ok=!e.toxic &&(goal==='auc'?e.aucProb>=.68:goal==='c0'?e.c0Accept:e.timeAccept);
 return {...e,goal,ok};
}
export function gradeCLChange(post,aucDose,c0Dose){
 if(![aucDose,c0Dose].every(Number.isFinite))throw new RangeError('Missing dose');
 const baseline=exposureAtSS(post,TARGETS.baselineDose);
 const preserveAuc=exposureAtSS(post,aucDose,TARGETS.changedClMultiplier);
 const preserveTrough=exposureAtSS(post,c0Dose,TARGETS.changedClMultiplier);
 return {baseline,preserveAuc,preserveTrough,
  aucOk:Math.abs(preserveAuc.auc24/baseline.auc24-1)<=.045,
  c0Ok:preserveTrough.c0Accept&&!preserveTrough.toxic,
  conflict:preserveAuc.toxic && !preserveTrough.aucAccept,
  ok:Math.abs(preserveAuc.auc24/baseline.auc24-1)<=.045 &&
    preserveTrough.c0Accept&&!preserveTrough.toxic&&preserveAuc.toxic};
}
export function assessGivenSamplePlan(reason){
 return reason==='conditional';
}

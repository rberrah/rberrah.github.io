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
  const clCI=[weightedQuantile(logrows,'cl',.05),weightedQuantile(logrows,'cl',.95)];
  return {samples,meanCL,meanV,clCI,rows:logrows,clMultiplier};
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

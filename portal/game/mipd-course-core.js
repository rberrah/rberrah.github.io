// MPA after heart transplantation: a simulated patient and a deliberately
// simplified oral 1-compartment MAP-BE teaching model. This is not an adopted
// population model nor a dosing recommendation. Endpoints are sourced,
// but model parameters and concentrations are generated for the exercise.
export const CASE=Object.freeze({
 name:'Mycophenolate mofetil (MMF) / mycophenolic acid (MPA)',
 setting:'Heart transplantation, month 2, MMF + tacrolimus + corticosteroids',
 dose:1000,tau:12,ka:1.25,
 priorCL:22,priorV:145,omegaCL:.35,omegaV:.27,
 ruvCV:.12,ruvFloor:.08,trueCL:28,trueV:154,
 targetAucMinimum:36,
 targetAucContextUpper:60,
 targetC0Alternative:2,
 references:{
  guide:'/pharmacometrie/cibles-tdm/?drug=mpa',
  consensus:'https://doi.org/10.1097/FTD.0000000000000871',
  heartGuideline:'https://www.ishlt.org/docs/default-source/standards-guidelines/2022_guideline_ishlt_careofhtxrecipients.pdf',
  lss:'https://pubmed.ncbi.nlm.nih.gov/18641552/',
  label:'https://www.medicines.org.uk/emc/medicine/1679/spc',
  berrah:'https://doi.org/10.1097/FTD.0000000000001413',
  hughes:'https://doi.org/10.1002/psp4.12684'
 }
});
export const SAMPLING_TIMES=Object.freeze([.5,1,2]);
export const DOSES=Object.freeze([250,500,750,1000,1250,1500]);
export function mpaConcentration(t,{dose=CASE.dose,cl=CASE.priorCL,v=CASE.priorV,ka=CASE.ka,tau=CASE.tau}={}){
 if(![t,dose,cl,v,ka,tau].every(Number.isFinite)||dose<=0||cl<=0||v<=0||ka<=0||tau<=0||t<0)
  throw new RangeError('Invalid MPA oral PK inputs');
 const time=((t%tau)+tau)%tau,k=cl/v;
 const ratio=x=>Math.exp(-x*time)/(-Math.expm1(-x*tau));
 if(Math.abs(ka-k)<1e-7){
  const r=Math.exp(-k*tau),e=Math.exp(-k*time);
  return dose/v*k*e*(time/(1-r)+tau*r/(1-r)**2);
 }
 return Math.max(0,dose*ka/(v*(ka-k))*(ratio(k)-ratio(ka)));
}
export const OBSERVATIONS=Object.freeze(SAMPLING_TIMES.map((t,i)=>({
 t,value:Number((mpaConcentration(t,{dose:CASE.dose,cl:CASE.trueCL,v:CASE.trueV})*[1.045,.970,1.030][i]).toFixed(2))
})));
const CL_GRID=Object.freeze(Array.from({length:65},(_,i)=>12+i*.5));
const V_GRID=Object.freeze(Array.from({length:61},(_,i)=>85+i*2.5));
function logPrior(x,median,sd){return -.5*(Math.log(x/median)/sd)**2-Math.log(x*sd);}
function weightedQuantile(rows,key,q){
 const sorted=[...rows].sort((a,b)=>a[key]-b[key]);
 let cumulative=0;
 for(const row of sorted){cumulative+=row.w;if(cumulative>=q)return row[key];}
 return sorted.at(-1)[key];
}
export function posterior({samples=3,omegaFactor=1,ruvCV=CASE.ruvCV,priorWeight=1}={}){
 if(!Number.isInteger(samples)||samples<0||samples>3||
   ![omegaFactor,ruvCV,priorWeight].every(Number.isFinite)||
   omegaFactor<.35||omegaFactor>2.5||ruvCV<.005||ruvCV>.6||
   priorWeight<.05||priorWeight>1)throw new RangeError('Invalid MAP sensitivity settings');
 const omegaCL=CASE.omegaCL*omegaFactor,omegaV=CASE.omegaV*omegaFactor;
 const unnormalised=[];
 for(const cl of CL_GRID)for(const v of V_GRID){
  let l=priorWeight*(logPrior(cl,CASE.priorCL,omegaCL)+logPrior(v,CASE.priorV,omegaV));
  for(let i=0;i<samples;i++){
   const {t,value}=OBSERVATIONS[i],pred=mpaConcentration(t,{cl,v});
   const sd=Math.hypot(ruvCV*pred,CASE.ruvFloor);
   l+=-.5*((value-pred)/sd)**2-Math.log(sd);
  }
  unnormalised.push({cl,v,l});
 }
 const peak=Math.max(...unnormalised.map(r=>r.l));
 let total=0;
 for(const r of unnormalised){r.w=Math.exp(r.l-peak);total+=r.w;}
 for(const r of unnormalised)r.w/=total;
 const map=unnormalised.reduce((a,b)=>b.w>a.w?b:a);
 return {
  samples,omegaFactor,ruvCV,priorWeight,
  rows:unnormalised,mapCL:map.cl,mapV:map.v,
  meanCL:unnormalised.reduce((sum,r)=>sum+r.cl*r.w,0),
  meanV:unnormalised.reduce((sum,r)=>sum+r.v*r.w,0),
  clCI:[weightedQuantile(unnormalised,'cl',.05),weightedQuantile(unnormalised,'cl',.95)],
  vCI:[weightedQuantile(unnormalised,'v',.05),weightedQuantile(unnormalised,'v',.95)]
 };
}
export function targetAssessment(auc,c0){
 return {auc:auc>=CASE.targetAucMinimum,under:auc<CASE.targetAucMinimum,
   c0Alternative:c0>=CASE.targetC0Alternative,
   aboveContext:auc>CASE.targetAucContextUpper};
}
export function doseMetrics(post,dose,{clFactor=1}={}){
 if(!post||!Number.isFinite(dose)||dose<250||dose>1500||
   !Number.isFinite(clFactor)||clFactor<.4||clFactor>1.5)
  throw new RangeError('Dose must be 250–1500 mg per administration and CL multiplier 0.4–1.5');
 const cl=post.mapCL*clFactor,v=post.mapV;
 const auc=dose/cl,c0=mpaConcentration(CASE.tau,{dose,cl,v});
 const curve=Array.from({length:121},(_,i)=>({
   t:i*CASE.tau/120,
   c:mpaConcentration(i*CASE.tau/120,{dose,cl,v})
 }));
 // CL interval propagation is a descriptive posterior interval; no parameter re-estimation.
 const aucCI=[dose/(post.clCI[1]*clFactor),dose/(post.clCI[0]*clFactor)];
 return {dose,cl,v,auc,c0,aucCI,curve,meets:targetAssessment(auc,c0)};
}
export function scenarioComparison(post,dose=1000,clFactor=.6,proposedDose=dose*clFactor){
 return {
  baseline:doseMetrics(post,dose),
  unchanged:doseMetrics(post,dose,{clFactor}),
  revised:doseMetrics(post,proposedDose,{clFactor}),
  preservationDose:dose*clFactor
 };
}
export function doseEvaluation(post,dose,{clMultiplier=1}={}){
 const p=doseMetrics(post,dose,{clFactor:clMultiplier});
 return {...p,p:post.rows.reduce((sum,r)=>sum+(dose/(r.cl*clMultiplier)>=CASE.targetAucMinimum?r.w:0),0)};
}
export function simulatorCurve(post,dose,clMultiplier=1){return doseMetrics(post,dose,{clFactor:clMultiplier}).curve;}
export function candidateDoses(post,clMultiplier=1){return DOSES.map(d=>doseEvaluation(post,d,{clMultiplier}));}
export function chooseDose(post,clMultiplier=1){return candidateDoses(post,clMultiplier).find(d=>d.meets.auc)||candidateDoses(post,clMultiplier).at(-1);}
export function infusionAt(t,options={}){return mpaConcentration(t,options);}
export function evaluateEndpoints(post,dose,clMultiplier=1){
 const p=doseMetrics(post,dose,{clFactor:clMultiplier});
 return {...p,toxic:false,timeAbovePct:null,meets:{auc:p.meets.auc,trough:p.meets.c0Alternative,time:false}};
}
export const PKPD=Object.freeze({aucLow:CASE.targetAucMinimum,aucHigh:null,aucContextHigh:CASE.targetAucContextUpper});
export function sampleTimingGrade(answers){
 const set=new Set(answers);
 return set.has('three')&&set.has('context')&&set.size===2;
}
export function qualityGate({modelValidated=false,changingCL=false,missingTimes=false}={}){
 const reasons=[];
 if(!modelValidated)reasons.push('Modèle oral simplifié non qualifié pour un ajustement clinique réel.');
 if(changingCL)reasons.push('CL/F modifiée hypothétiquement : aucun nouveau dosage pour mettre à jour le posterior.');
 if(missingTimes)reasons.push('Horaires exacts des prélèvements inconnus.');
 return {canBeUsedClinically:false,reasons};
}
// Real, archival warfarin data and executed SAEM results from this site's nlmixr2 notebook.
// The R session's detailed fit tables/parameter histories were not exported as data files.
// Consequently NO pseudo-SAEM iteration trace, CWRES, NPDE, or individual EBEs are invented.
import {
 WARFARIN_SUBJECTS,WARFARIN_PK,WARFARIN_PD,WARFARIN_TIMES,WARFARIN_PROVENANCE
} from './warfarin-study.js';
export const POPULATION_META=Object.freeze({
 title:'Warfarine · étude historique de volontaires sains',
 nSubjects:32,nObservations:251,nPCA:232,nRecords:515,
 source:'Données expérimentales historiques O’Reilly, disponibles dans le dépôt du site et le tutoriel Monolix',
 algorithm:'Ajustements SAEM nlmixr2 déjà exécutés et archivés dans le notebook du site',
 nSteps:null,seed:null,
 dose:'1,5 mg/kg · prise orale unique',
 response:'Concentration de warfarine (mg/L) et PCA (%)',
 warning:'BIC et AIC : sorties SAEM nlmixr2 archivées. Les paramètres individuels, CWRES, NPDE, historiques SAEM et simulations VPC n’ont pas été exportés : aucun graphique ne peut les présenter comme obtenus par nlmixr2.',
 notebook:'course_source/warfarin/warfarin_monolix_nlmixr2.ipynb',
 original:'course_source/warfarin/warfarin_data.csv',
 tutorialUrl:WARFARIN_PROVENANCE.website
});
export const SUBJECTS=WARFARIN_SUBJECTS;
export const OBSERVATIONS=WARFARIN_PK;
export const PD_OBSERVATIONS=WARFARIN_PD;
export const TIMES=WARFARIN_TIMES;
export const FITS=Object.freeze({
 one:Object.freeze({label:'1C oral · sans Tlag',npar:8,aic:899.6142,bic:927.8178,logLik:-441.8071,kind:'PK 1C, combined1',source:'Notebook cell 6'}),
 lag:Object.freeze({label:'1C oral · avec Tlag',npar:10,aic:781.8434,bic:817.0979,logLik:-380.9217,kind:'PK 1C + Tlag, combined1',source:'Notebook cell 6'}),
 two:Object.freeze({label:'2C oral · avec Tlag',npar:12,aic:817.0512,bic:859.3567,logLik:-396.5256,kind:'PK 2C + Tlag, combined1',source:'Notebook cell 6'})
});
export const ADVANCED_FITS=Object.freeze({
 combined2:Object.freeze({label:'1C Tlag + erreur combined2',aic:760.3437,bic:795.5982,logLik:-370.1718,source:'Notebook cell 8'}),
 covariate:Object.freeze({label:'1C Tlag + combined2 + WT→V',aic:741.0162,bic:779.7962,logLik:-359.5081,source:'Notebook cell 10'})
});
// The ONLY fully reported numerical parameter summary is this final fit
// (from notebook cell 17, limited precision). Do not ascribe to other candidate fits.
export const FINAL_FIT=Object.freeze({
 type:'1C oral + Tlag + combined2 + WT→V',
 cl:.133,volume:8.07,ka:1.32,tlag:.696,wtExponent:.847,wtReference:71.65,addSd:.375,propSd:.104
});
function convolution(ka,k,t){
 const d=ka-k;
 return Math.abs(d)<1e-9 ? t*Math.exp(-k*t) : Math.exp(-k*t)*(-Math.expm1(-d*t))/d;
}
// Reconstructed population predictions with FINAL fixed effects only.
// These are not exact PRED/IPRED from the nlmixr2 fit because its random effects
// and individual covariate distributions were not exported.
export function populationPredict(kind,t,dose,etaCL=0,wt=FINAL_FIT.wtReference){
 if(!['one','lag','final'].includes(kind) || ![t,dose,etaCL,wt].every(Number.isFinite) ||
   t<0||dose<=0||wt<=0)throw new RangeError('Unsupported numerical reconstruction');
 const fit=FINAL_FIT;
 const lag=kind==='one'?0:fit.tlag;
 if(t<=lag)return 0;
 const v=fit.volume*Math.pow(wt/fit.wtReference,fit.wtExponent);
 const cl=fit.cl*Math.exp(etaCL);
 const effective=t-lag;
 return Math.max(0,dose*fit.ka/v*convolution(fit.ka,cl/v,effective));
}
export function modelComparison(){
 const best=Math.min(...Object.values(FITS).map(f=>f.bic));
 return Object.entries(FITS).map(([id,fit])=>({
   id,label:fit.label,aic:fit.aic,bic:fit.bic,logLik:fit.logLik,npar:fit.npar,
   deltaBic:Number((fit.bic-best).toFixed(2))
 }));
}
export function gradeStructureConclusion(value){return value==='lag-supported';}
export function chooseChecks(values){
 const s=new Set(values);
 return s.size===3&&s.has('gof')&&s.has('vpc')&&s.has('stability');
}
export function assessMapping(map){
 return map.id==='id'&&map.time==='time'&&map.dose==='dose'&&map.concentration==='dv'&&map.event==='dvid';
}

// Synthetic fixed-grid analogue of a nonparametric mixture fit; NOT the NPAG engine.
// Locations are constructed for teaching, not estimated in Woillard (2015).
import {referenceGammaConcentration,referenceGammaAuc} from './double-gamma.js';
import {WOILLARD_MPA} from './woillard-mpa-source.js';
const mean=WOILLARD_MPA.populationParameters.Pmetrics;
const variants=[
 {r:.28,b2:mean.b2*.40,alpha:mean.alpha*.70,faiv:mean.faiv*.86},
 {r:.65,b2:mean.b2*.72,alpha:mean.alpha*1.25,faiv:mean.faiv*.95},
 {r:.44,b2:mean.b2,alpha:mean.alpha,faiv:mean.faiv},
 {r:.78,b2:mean.b2*1.25,alpha:mean.alpha*.82,faiv:mean.faiv*1.08},
 {r:.36,b2:mean.b2*.50,alpha:mean.alpha*1.45,faiv:mean.faiv*1.16}
];
export const SUPPORTS=Object.freeze(variants.map((p,i)=>Object.freeze({id:'S'+(i+1),parameters:Object.freeze({...mean,...p})})));
export const TIMES=Object.freeze([1/3,1,3,6]);
const cache=new Map();
export function prediction(i,t){
 const key=i+':'+t;
 if(!cache.has(key))cache.set(key,referenceGammaConcentration(t,SUPPORTS[i].parameters,1000));
 return cache.get(key);
}
export function supportAuc(i){return referenceGammaAuc(12,SUPPORTS[i].parameters,1000);}
const truth=[0,0,0,0,1,1,2,2,2,3,3,4];
export const SYNTHETIC_PROFILES=Object.freeze(truth.map((j,i)=>Object.freeze(TIMES.map((t,k)=>Object.freeze({t,value:prediction(j,t)*(1+.065*Math.sin((i+1)*2.1+(k+1)*1.7))})))));
export const PATIENT=Object.freeze(TIMES.map((t,k)=>Object.freeze({t,value:prediction(4,t)*(1+.045*Math.cos(k+1))})));
export const INITIAL=Object.freeze(SUPPORTS.map(()=>1/SUPPORTS.length));
function checkWeights(w){
 if(!Array.isArray(w)||w.length!==SUPPORTS.length||w.some(x=>!Number.isFinite(x)||x<0)||Math.abs(w.reduce((a,b)=>a+b,0)-1)>1e-8)throw new RangeError('Expected normalized nonnegative support weights');
}
export function logLikelihoods(observations,ruv=.18){
 if(!Number.isFinite(ruv)||ruv<=0)throw new RangeError('Positive residual error required');
 return SUPPORTS.map((_,i)=>observations.reduce((s,o)=>{
  const mu=prediction(i,o.t),sd=Math.hypot(.15,ruv*mu);
  return s-Math.log(sd)-.5*Math.log(2*Math.PI)-.5*((o.value-mu)/sd)**2;
 },0));
}
function normalizeLog(logs){
 const max=Math.max(...logs),sum=logs.reduce((s,x)=>s+Math.exp(x-max),0);
 return {weights:logs.map(x=>Math.exp(x-max)/sum),logLikelihood:max+Math.log(sum)};
}
export function updateWeights(prior,observations,ruv=.18){
 checkWeights(prior);
 return normalizeLog(logLikelihoods(observations,ruv).map((l,i)=>l+Math.log(prior[i])));
}
export function populationLogLikelihood(weights,profiles=SYNTHETIC_PROFILES){
 checkWeights(weights);
 return profiles.reduce((s,p)=>s+updateWeights(weights,p).logLikelihood,0);
}
export function fitFixedGrid(iterations=12,profiles=SYNTHETIC_PROFILES){
 if(!Number.isInteger(iterations)||iterations<0||iterations>100||!profiles.length)throw new RangeError('Invalid fit request');
 let weights=[...INITIAL];const history=[{weights:[...weights],ll:populationLogLikelihood(weights,profiles)}];
 for(let k=0;k<iterations;k++){
  const responsibilities=profiles.map(p=>updateWeights(weights,p).weights);
  weights=weights.map((_,j)=>responsibilities.reduce((s,x)=>s+x[j],0)/profiles.length);
  history.push({weights:[...weights],ll:populationLogLikelihood(weights,profiles)});
 }
 return history;
}
export function summarize(weights){
 checkWeights(weights);const map=weights.indexOf(Math.max(...weights));
 return {map,aucMean:weights.reduce((s,w,i)=>s+w*supportAuc(i),0),aucMap:supportAuc(map)};
}

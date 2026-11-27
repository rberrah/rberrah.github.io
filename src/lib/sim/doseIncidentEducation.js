// Educational dimensionless PK only. Public 2026 presentation formula, not Shiny app parity.
// D/V = 1, F = 1, linear oral one-compartment steady state. No clinical dose input.
/** @param {number} delay @param {number} tau @param {number} halfLife @param {number} parts */
export function halfLifeRule(delay,tau,halfLife,parts=10){
  if(![delay,tau,halfLife].every(Number.isFinite)||tau<=0||halfLife<=0||delay<0||delay>tau||!Number.isInteger(parts)||parts<1||parts>100)throw new RangeError('Invalid normalized scenario');
  const k=Math.LN2/halfLife;
  const M=Math.exp(-k*delay),S=Math.expm1(-k*(tau-delay))/Math.expm1(-k*tau);
  const exact=Math.max(M,S);
  return {M,S,exact,rounded:Math.min(1,Math.floor(exact*parts+1e-12)/parts)};
}
/** @param {number} t @param {number} ka @param {number} k */
export function oralPulse(t,ka,k){
  if(t<=0)return 0;
  const gap=Math.abs(ka-k);
  return gap===0?ka*t*Math.exp(-k*t):ka*Math.exp(-Math.min(ka,k)*t)*(-Math.expm1(-gap*t))/gap;
}
/** @param {number} t @param {number} tau @param {number} ka @param {number} k */
export function steadyOral(t,tau,ka,k){
  const phase=((t%tau)+tau)%tau;
  const tail=(/** @type {number} */ rate)=>Math.exp(-rate*phase)/(-Math.expm1(-rate*tau));
  if(Math.abs(ka-k)<1e-7*Math.max(ka,k)){
    const rate=(ka+k)/2,q=Math.exp(-rate*tau),den=-Math.expm1(-rate*tau);
    return ka*Math.exp(-rate*phase)*(phase/den+tau*q/(den*den));
  }
  return ka/(ka-k)*(tail(k)-tail(ka));
}
/** @param {{scenario?:string,tau?:number,delay?:number,ka?:number,popHalfLife?:number,trueHalfLife?:number,parts?:number,loss?:number,trialFraction?:number}} options */
export function incidentProfiles({scenario='adherence',tau=12,delay=3,ka=1,popHalfLife=8,trueHalfLife=8,parts=10,loss=1,trialFraction=.5}={}){
  if(!['adherence','vomiting'].includes(scenario)||![tau,delay,ka,popHalfLife,trueHalfLife,loss,trialFraction].every(Number.isFinite)||tau<4||tau>48||delay<0||delay>tau||ka<.005||ka>5||popHalfLife<.25||popHalfLife>96||trueHalfLife<.25||trueHalfLife>96||loss<0||loss>1||trialFraction<0||trialFraction>1)throw new RangeError('Invalid teaching scenario');
  const rule=halfLifeRule(delay,tau,popHalfLife,parts),k=Math.LN2/trueHalfLife;
  const depot=Math.exp(-ka*delay)/(-Math.expm1(-ka*tau));
  const removed=scenario==='adherence'?1:loss*depot;
  const fraction=scenario==='adherence'?rule.rounded:trialFraction;
  const removalTime=scenario==='adherence'?0:delay;
  const at=(/** @type {number} */ t)=>{
    const reference=steadyOral(t,tau,ka,k);
    const incident=Math.max(0,reference-removed*oralPulse(t-removalTime,ka,k));
    return {t,reference,incident,corrected:incident+fraction*oralPulse(t-delay,ka,k),alternative:incident+oralPulse(t-delay,ka,k)};
  };
  const n=Math.ceil(tau/.025);
  const times=[...new Set([...Array.from({length:3*n+1},(_,i)=>(i-n)*tau/n),0,tau,2*tau,delay])].sort((a,b)=>a-b);
  const points=times.map(at);
  const summarize=(/** @type {number} */ from,/** @type {number} */ to,/** @type {'reference'|'incident'|'corrected'|'alternative'} */ key)=>{
    const rows=points.filter(p=>p.t>=from&&p.t<=to);
    let auc=0,cmax=0;
    for(let i=0;i<rows.length;i++){
      cmax=Math.max(cmax,rows[i][key]);
      if(i)auc+=(rows[i].t-rows[i-1].t)*(rows[i][key]+rows[i-1][key])/2;
    }
    return {auc,cmax,end:rows.at(-1)[key]};
  };
  const metrics=[0,tau].map(from=>Object.fromEntries((/** @type {const} */ (['reference','incident','corrected','alternative'])).map(key=>[key,summarize(from,from+tau,key)])));
  return {points,metrics,rule,depot,removed,fraction,removalTime,delay,tau,k};
}

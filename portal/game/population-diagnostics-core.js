// Pure diagnostic statistics for the fictional SAEM benchmark.
// No UI state, data fitting, or patient data.
export function iivDensityDiagnostic(eta,omega){
  if(!Array.isArray(eta)||eta.length<2||!eta.every(Number.isFinite)||
     !Number.isFinite(omega)||omega<=0)throw new RangeError('Invalid EBE/IIV inputs');
  const n=eta.length,bins=Math.max(5,Math.min(9,Math.round(Math.sqrt(n))+1));
  const bound=Math.max(3*omega,Math.max(...eta.map(Math.abs))*1.08);
  const lo=-bound,hi=bound,width=(hi-lo)/bins,counts=Array(bins).fill(0);
  for(const v of eta)counts[Math.max(0,Math.min(bins-1,Math.floor((v-lo)/width)))]++;
  const histogram=counts.map((count,i)=>({
    x0:lo+i*width,x1:lo+(i+1)*width,density:count/(n*width),count
  }));
  return {lo,hi,n,bins,histogram,area:histogram.reduce((sum,x)=>sum+x.density*width,0)};
}

export function lognormalRuvEnvelope(sigma,maxPred=25){
  if(!Number.isFinite(sigma)||sigma<=0||!Number.isFinite(maxPred)||maxPred<=0)
    throw new RangeError('Invalid lognormal RUV parameters');
  const z=1.6448536269514722;
  const values=Array.from({length:101},(_,i)=>{
    const pred=maxPred*i/100;
    return {pred,median:pred,p5:pred*Math.exp(-z*sigma),p95:pred*Math.exp(z*sigma)};
  });
  return {values,p5Ratio:Math.exp(-z*sigma),p95Ratio:Math.exp(z*sigma)};
}

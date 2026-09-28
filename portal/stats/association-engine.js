import { normalCDF } from './engine.js';

function pairedFinite(x, y) {
  const out=[];
  const n=Math.min(x?.length||0,y?.length||0);
  for(let i=0;i<n;i++){
    const a=Number(x[i]),b=Number(y[i]);
    if(Number.isFinite(a)&&Number.isFinite(b)) out.push([a,b]);
  }
  return out;
}

function tieGroupSizes(values) {
  const counts=new Map();
  for(const value of values) counts.set(value,(counts.get(value)||0)+1);
  return [...counts.values()].filter(n=>n>1);
}

function inversionDistribution(n) {
  let dist=[1n];
  for(let m=2;m<=n;m++){
    const next=Array(dist.length+m-1).fill(0n);
    for(let inv=0;inv<dist.length;inv++){
      for(let add=0;add<m;add++) next[inv+add]+=dist[inv];
    }
    dist=next;
  }
  return dist;
}

function exactKendallP(n, sObserved) {
  const n0=n*(n-1)/2;
  const dist=inversionDistribution(n);
  let extreme=0n,total=0n;
  const threshold=Math.abs(sObserved)-1e-12;
  for(let d=0;d<dist.length;d++){
    const count=dist[d];
    total+=count;
    const s=n0-2*d;
    if(Math.abs(s)>=threshold) extreme+=count;
  }
  return Number(extreme)/Number(total);
}

function asymptoticVarianceS(n, tiesX, tiesY) {
  const base=n*(n-1)*(2*n+5);
  const corrX=tiesX.reduce((s,t)=>s+t*(t-1)*(2*t+5),0);
  const corrY=tiesY.reduce((s,t)=>s+t*(t-1)*(2*t+5),0);
  let variance=(base-corrX-corrY)/18;
  if(n>2){
    const a=tiesX.reduce((s,t)=>s+t*(t-1)*(t-2),0);
    const b=tiesY.reduce((s,t)=>s+t*(t-1)*(t-2),0);
    variance+=(a*b)/(9*n*(n-1)*(n-2));
  }
  const c=tiesX.reduce((s,t)=>s+t*(t-1),0);
  const d=tiesY.reduce((s,t)=>s+t*(t-1),0);
  variance+=(c*d)/(2*n*(n-1));
  return variance;
}

/**
 * Kendall's tau-b for paired observations.
 * - Exact two-sided permutation p-value when n < 50 and there are no ties.
 * - Otherwise a tie-corrected asymptotic normal approximation for S=C-D.
 */
export function kendallTauB(x, y) {
  const pairs=pairedFinite(x,y);
  const n=pairs.length;
  if(n<3) throw new Error('N_TOO_SMALL');
  let concordant=0,discordant=0,tiedBoth=0;
  for(let i=0;i<n-1;i++){
    for(let j=i+1;j<n;j++){
      const dx=Math.sign(pairs[i][0]-pairs[j][0]);
      const dy=Math.sign(pairs[i][1]-pairs[j][1]);
      if(dx===0&&dy===0)tiedBoth++;
      else if(dx===0||dy===0)continue;
      else if(dx===dy)concordant++;
      else discordant++;
    }
  }
  const xs=pairs.map(p=>p[0]),ys=pairs.map(p=>p[1]);
  const tiesX=tieGroupSizes(xs),tiesY=tieGroupSizes(ys);
  const n0=n*(n-1)/2;
  const n1=tiesX.reduce((s,t)=>s+t*(t-1)/2,0);
  const n2=tiesY.reduce((s,t)=>s+t*(t-1)/2,0);
  const S=concordant-discordant;
  const denom=Math.sqrt((n0-n1)*(n0-n2));
  const tau=denom>0?S/denom:NaN;
  const hasTies=tiesX.length>0||tiesY.length>0;
  const exact=!hasTies&&n<50;
  let p,z=null,varianceS=null;
  if(exact){
    p=exactKendallP(n,S);
  }else{
    varianceS=asymptoticVarianceS(n,tiesX,tiesY);
    z=varianceS>0?S/Math.sqrt(varianceS):0;
    p=varianceS>0?Math.min(1,2*(1-normalCDF(Math.abs(z)))):1;
  }
  return {
    test:'kendall_tau_b',n,tau,S,concordant,discordant,tiedBoth,
    tiesX:n1,tiesY:n2,p,exact,inference:exact?'exact':'asymptotic',z,varianceS
  };
}

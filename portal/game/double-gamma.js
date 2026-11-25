// Independent structural kernel: normalized gamma input, one-compartment linear disposition.
// Not a calibrated Woillard model. No parameter defaults or clinical dosing advice.
const X=[0.1834346424956498,0.525532409916329,0.7966664774136267,0.9602898564975363];
const W=[0.362683783378362,0.3137066458778873,0.2223810344533745,0.1012285362903763];
function logGamma(z){
 const p=[676.5203681218851,-1259.1392167224028,771.3234287776531,-176.6150291621406,12.507343278686905,-0.13857109526572012,9.984369578019572e-6,1.5056327351493116e-7];
 if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);
 z-=1;let x=.9999999999998099;for(let i=0;i<p.length;i++)x+=p[i]/(z+i+1);
 const t=z+7.5;return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x);
}
function gauss(fn,a,b){const m=(a+b)/2,h=(b-a)/2;return h*X.reduce((s,x,i)=>s+W[i]*(fn(m-h*x)+fn(m+h*x)),0);}
function integrate(fn,a,b,whole=gauss(fn,a,b),tol=2e-11,depth=18){
 const m=(a+b)/2,l=gauss(fn,a,m),r=gauss(fn,m,b);if(Math.abs(l+r-whole)<=tol)return l+r;
 if(depth<=0)throw new RangeError('Gamma quadrature did not converge');
 return integrate(fn,a,m,l,tol/2,depth-1)+integrate(fn,m,b,r,tol/2,depth-1);
}
function check(p){
 if(!['dose','cl','v','tau','a1','b1','a2','b2','f'].every(k=>Number.isFinite(p[k]))||p.dose<0||p.cl<=0||p.v<=0||p.tau<=0||p.f<0||p.f>1)throw new RangeError('Invalid double-gamma parameters');
 for(const [a,b] of [[p.a1,p.b1],[p.a2,p.b2]])if(a<.2||a>30||b<.05||b>30)throw new RangeError('Outside numerical domain of gamma kernel');
 if(p.tau<1||p.tau>48||p.cl/p.v<.005||p.cl/p.v>5)throw new RangeError('Outside numerical domain of disposition');
}
function component(t,k,tau,a,b){
 const end=Math.max(55,2*a+45),lg=logGamma(a),period=b*tau;
 const cuts=[0,end];for(let q=1;q<end;q++)cuts.push(q);for(let q=b*t;q<end;q+=period)if(q>0)cuts.push(q);
 cuts.sort((x,y)=>x-y);let sum=0;
 for(let j=1;j<cuts.length;j++){
  const lo=cuts[j-1],hi=cuts[j];if(hi-lo<1e-13)continue;
  // Use the phase of the interval midpoint to avoid modulo ambiguity at jumps.
  const periodIndex=Math.ceil(((lo+hi)/2/b-t)/tau);
  const phase=z=>Math.max(0,t-z/b+periodIndex*tau);
  if(lo===0&&a<1){
   // z=hi*x^(1/a) removes the singularity at zero.
   const amplitude=Math.exp(a*Math.log(hi)-Math.log(a)-lg);
   sum+=integrate(x=>{const z=hi*x**(1/a);return amplitude*Math.exp(-z-k*phase(z));},0,1);
  }else if(lo===0){
   // z=hi*x^m smooths the fractional power at zero, including a near 1.
   const m=8,amplitude=m*Math.exp(a*Math.log(hi)-lg);
   sum+=integrate(x=>{const z=hi*x**m;return amplitude*x**(m*a-1)*Math.exp(-z-k*phase(z));},0,1);
  }else sum+=integrate(z=>Math.exp((a-1)*Math.log(z)-z-lg-k*phase(z)),lo,hi);
 }
 return sum/(-Math.expm1(-k*tau));
}
export function doubleGammaConcentration(t,p){
 check(p);if(!Number.isFinite(t)||t<0)throw new RangeError('Invalid time');
 const phase=t%p.tau,k=p.cl/p.v;
 return p.dose/p.v*((p.f===0?0:p.f*component(phase,k,p.tau,p.a1,p.b1))+(p.f===1?0:(1-p.f)*component(phase,k,p.tau,p.a2,p.b2)));
}
export function doubleGammaAuc(p){check(p);return p.dose/p.cl;}

// Reference-dose, independent baseline convention used in the Limoges gamma
// modeling family (Fromage 2025, DOI 10.1111/bcp.16374). Not periodic superposition.
export function gammaDensity(t,a,b){
 if(![t,a,b].every(Number.isFinite)||t<0||a<=0||b<=0)throw new RangeError('Invalid gamma input');
 if(t===0)return a===1?b:a>1?0:Infinity;
 return Math.exp(a*Math.log(b)+(a-1)*Math.log(t)-b*t-logGamma(a));
}
function finiteGammaIntegral(t,a,b,weight){
 if(t===0)return 0;
 const zmax=Math.min(b*t,Math.max(65,2*a+45)),lg=logGamma(a);
 let sum=0;
 for(let lo=0;lo<zmax;lo+=1){
  const hi=Math.min(lo+1,zmax);
  if(lo===0&&a<1){
   const amplitude=Math.exp(a*Math.log(hi)-Math.log(a)-lg);
   sum+=integrate(x=>{const z=hi*x**(1/a);return amplitude*Math.exp(-z)*weight(z/b);},0,1);
  }else if(lo===0){
   const m=8,amplitude=m*Math.exp(a*Math.log(hi)-lg);
   sum+=integrate(x=>{const z=hi*x**m;return amplitude*x**(m*a-1)*Math.exp(-z)*weight(z/b);},0,1);
  }else sum+=integrate(z=>Math.exp((a-1)*Math.log(z)-z-lg)*weight(z/b),lo,hi);
 }
 return sum;
}
function checkReference(t,p,dose){
 if(![t,dose,p.c0,p.a1,p.b1,p.a2,p.b2,p.r,p.faiv,p.alpha].every(Number.isFinite)||t<0||dose<0||p.c0<0||p.faiv<=0||p.alpha<=0||p.r<0||p.r>1||p.a1<=0||p.a2<=0||p.b1<=0||p.b2<=0)throw new RangeError('Invalid reference-dose parameters');
}
function mixedIntegral(t,p,weight){
 return p.r*finiteGammaIntegral(t,p.a1,p.b1,weight)+(1-p.r)*finiteGammaIntegral(t,p.a2,p.b2,weight);
}
export function referenceGammaConcentration(t,p,dose){
 checkReference(t,p,dose);
 return dose/100*(p.c0+p.faiv*mixedIntegral(t,p,u=>Math.exp(-p.alpha*(t-u))));
}
export function referenceGammaAuc(t,p,dose){
 checkReference(t,p,dose);
 return dose/100*(p.c0*t+p.faiv*mixedIntegral(t,p,u=>-Math.expm1(-p.alpha*(t-u))/p.alpha));
}

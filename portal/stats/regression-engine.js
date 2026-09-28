import { normalCDF, chiSquareSF } from './engine.js';

const Z975=1.959963984540054;

function sigmoid(x){
  if(x>=0){const z=Math.exp(-x);return 1/(1+z);}
  const z=Math.exp(x);return z/(1+z);
}
function log1pExp(x){return x>0?x+Math.log1p(Math.exp(-x)):Math.log1p(Math.exp(x));}
function logLik(y,z,b0,b1){let out=0;for(let i=0;i<y.length;i++){const eta=b0+b1*z[i];out+=y[i]*eta-log1pExp(eta);}return out;}
function expSafe(x){if(x>709)return Infinity;if(x<-745)return 0;return Math.exp(x);}

export function logisticRegression(yValues,xValues,{maxIter=100,tolerance=1e-9}={}){
  const y=[],x=[];
  const n=Math.min(yValues?.length||0,xValues?.length||0);
  for(let i=0;i<n;i++){
    const yi=Number(yValues[i]),xi=Number(xValues[i]);
    if((yi===0||yi===1)&&Number.isFinite(xi)){y.push(yi);x.push(xi);}
  }
  if(y.length<8)throw new Error('N_TOO_SMALL');
  const events=y.reduce((s,v)=>s+v,0),nonEvents=y.length-events;
  if(events<2||nonEvents<2)throw new Error('LOGISTIC_CLASS_TOO_SMALL');
  const meanX=x.reduce((s,v)=>s+v,0)/x.length;
  const ss=x.reduce((s,v)=>s+(v-meanX)**2,0);
  const sdX=Math.sqrt(ss/(x.length-1));
  if(!(sdX>1e-12))throw new Error('PREDICTOR_CONSTANT');
  const z=x.map(v=>(v-meanX)/sdX);
  const prevalence=events/y.length;
  let b0=Math.log(prevalence/(1-prevalence)),b1=0,converged=false,singular=false,iterations=0;
  let ll=logLik(y,z,b0,b1);
  for(let iter=1;iter<=maxIter;iter++){
    iterations=iter;
    let s0=0,s1=0,h00=0,h01=0,h11=0;
    for(let i=0;i<y.length;i++){
      const p=sigmoid(b0+b1*z[i]),w=Math.max(1e-12,p*(1-p)),r=y[i]-p;
      s0+=r;s1+=z[i]*r;h00+=w;h01+=w*z[i];h11+=w*z[i]*z[i];
    }
    const det=h00*h11-h01*h01;
    if(!(det>1e-14)){singular=true;break;}
    const d0=(h11*s0-h01*s1)/det,d1=(-h01*s0+h00*s1)/det;
    let step=1,next0=b0+d0,next1=b1+d1,nextLL=logLik(y,z,next0,next1);
    while((!Number.isFinite(nextLL)||nextLL<ll-1e-10)&&step>1/1048576){step/=2;next0=b0+step*d0;next1=b1+step*d1;nextLL=logLik(y,z,next0,next1);}
    if(!Number.isFinite(nextLL)){singular=true;break;}
    b0=next0;b1=next1;ll=nextLL;
    if(Math.max(Math.abs(step*d0),Math.abs(step*d1))<tolerance){converged=true;break;}
  }

  let h00=0,h01=0,h11=0,minP=1,maxP=0;
  const fitted=z.map(zi=>{const p=sigmoid(b0+b1*zi),w=Math.max(1e-12,p*(1-p));h00+=w;h01+=w*zi;h11+=w*zi*zi;minP=Math.min(minP,p);maxP=Math.max(maxP,p);return p;});
  const det=h00*h11-h01*h01;
  if(!(det>1e-14))singular=true;
  const cov00=singular?NaN:h11/det,cov01=singular?NaN:-h01/det,cov11=singular?NaN:h00/det;

  const slope=b1/sdX,intercept=b0-b1*meanX/sdX;
  const t00=1,t01=-meanX/sdX,t10=0,t11=1/sdX;
  const varIntercept=singular?NaN:t00*t00*cov00+2*t00*t01*cov01+t01*t01*cov11;
  const covInterceptSlope=singular?NaN:t00*t10*cov00+(t00*t11+t01*t10)*cov01+t01*t11*cov11;
  const varSlope=singular?NaN:t10*t10*cov00+2*t10*t11*cov01+t11*t11*cov11;
  const seIntercept=Math.sqrt(Math.max(0,varIntercept)),seSlope=Math.sqrt(Math.max(0,varSlope));
  const zSlope=seSlope>0?slope/seSlope:NaN;
  const pWald=Number.isFinite(zSlope)?Math.min(1,2*(1-normalCDF(Math.abs(zSlope)))):NaN;
  const slopeCI=Number.isFinite(seSlope)?[slope-Z975*seSlope,slope+Z975*seSlope]:[NaN,NaN];
  const oddsRatio=expSafe(slope),oddsRatioCI=[expSafe(slopeCI[0]),expSafe(slopeCI[1])];

  const llNull=events*Math.log(prevalence)+nonEvents*Math.log(1-prevalence);
  const likelihoodRatio=Math.max(0,2*(ll-llNull));
  const pLikelihoodRatio=chiSquareSF(likelihoodRatio,1);
  const mcfaddenR2=llNull!==0?1-ll/llNull:NaN;
  const aic=-2*ll+4;
  const separationLikely=!converged||singular||Math.abs(b1)>20||(minP<1e-10&&maxP>1-1e-10);

  return {
    test:'logistic_regression',n:y.length,events,nonEvents,prevalence,
    intercept,slope,seIntercept,seSlope,covInterceptSlope,
    z:zSlope,p:pWald,ci:slopeCI,oddsRatio,oddsRatioCI,
    logLik:ll,logLikNull:llNull,likelihoodRatio,pLikelihoodRatio,mcfaddenR2,aic,
    converged,iterations,separationLikely,singular,minFittedProbability:minP,maxFittedProbability:maxP,
    fitted,x:[...x],y:[...y]
  };
}

export function logisticProbability(model,x){
  const value=Number(x);
  if(!Number.isFinite(value)||!Number.isFinite(model?.intercept)||!Number.isFinite(model?.slope))return NaN;
  return sigmoid(model.intercept+model.slope*value);
}

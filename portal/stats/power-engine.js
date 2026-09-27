function checkProbability(x,name){
  if(!Number.isFinite(x)||x<=0||x>=1)throw new Error(`${name}_INVALID`);
}
function checkPositive(x,name){
  if(!Number.isFinite(x)||x<=0)throw new Error(`${name}_INVALID`);
}

// Peter J. Acklam's inverse-normal approximation, sufficient for study-planning inputs.
export function normalQuantile(p){
  checkProbability(p,'P');
  const a=[-3.969683028665376e1,2.209460984245205e2,-2.759285104469687e2,1.38357751867269e2,-3.066479806614716e1,2.506628277459239];
  const b=[-5.447609879822406e1,1.615858368580409e2,-1.556989798598866e2,6.680131188771972e1,-1.328068155288572e1];
  const c=[-7.784894002430293e-3,-3.223964580411365e-1,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783];
  const d=[7.784695709041462e-3,3.224671290700398e-1,2.445134137142996,3.754408661907416];
  const plow=0.02425, phigh=1-plow;
  if(p<plow){
    const q=Math.sqrt(-2*Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
  if(p>phigh){
    const q=Math.sqrt(-2*Math.log(1-p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
  const q=p-0.5,r=q*q;
  return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}

function zTerms(alpha,power){
  checkProbability(alpha,'ALPHA');
  checkProbability(power,'POWER');
  return {za:normalQuantile(1-alpha/2),zb:normalQuantile(power)};
}
function inflate(n,dropout){
  if(!Number.isFinite(dropout)||dropout<0||dropout>=1)throw new Error('DROPOUT_INVALID');
  return Math.ceil(n/(1-dropout));
}

export function sampleSizeTwoMeans({difference,sd,alpha=0.05,power=0.8,dropout=0}){
  difference=Math.abs(Number(difference));sd=Math.abs(Number(sd));
  checkPositive(difference,'DIFFERENCE');checkPositive(sd,'SD');
  const {za,zb}=zTerms(Number(alpha),Number(power)),d=difference/sd;
  const basePerGroup=Math.ceil(2*((za+zb)/d)**2),perGroup=inflate(basePerGroup,Number(dropout));
  return {design:'two_means',effect:d,basePerGroup,perGroup,total:2*perGroup,alpha:Number(alpha),power:Number(power),dropout:Number(dropout)};
}

export function sampleSizePairedMeans({difference,sdDifference,alpha=0.05,power=0.8,dropout=0}){
  difference=Math.abs(Number(difference));sdDifference=Math.abs(Number(sdDifference));
  checkPositive(difference,'DIFFERENCE');checkPositive(sdDifference,'SD_DIFFERENCE');
  const {za,zb}=zTerms(Number(alpha),Number(power)),dz=difference/sdDifference;
  const baseTotal=Math.ceil(((za+zb)/dz)**2),total=inflate(baseTotal,Number(dropout));
  return {design:'paired_means',effect:dz,baseTotal,total,alpha:Number(alpha),power:Number(power),dropout:Number(dropout)};
}

export function sampleSizeTwoProportions({p1,p2,alpha=0.05,power=0.8,dropout=0}){
  p1=Number(p1);p2=Number(p2);checkProbability(p1,'P1');checkProbability(p2,'P2');
  if(Math.abs(p1-p2)<1e-12)throw new Error('NO_EFFECT');
  const {za,zb}=zTerms(Number(alpha),Number(power)),pbar=(p1+p2)/2;
  const numerator=(za*Math.sqrt(2*pbar*(1-pbar))+zb*Math.sqrt(p1*(1-p1)+p2*(1-p2)))**2;
  const basePerGroup=Math.ceil(numerator/(p1-p2)**2),perGroup=inflate(basePerGroup,Number(dropout));
  return {design:'two_proportions',difference:p2-p1,basePerGroup,perGroup,total:2*perGroup,alpha:Number(alpha),power:Number(power),dropout:Number(dropout)};
}

export function sampleSizeCorrelation({r,alpha=0.05,power=0.8,dropout=0}){
  r=Math.abs(Number(r));
  if(!Number.isFinite(r)||r<=0||r>=1)throw new Error('R_INVALID');
  const {za,zb}=zTerms(Number(alpha),Number(power)),fisherZ=Math.atanh(r);
  const baseTotal=Math.ceil(3+((za+zb)/fisherZ)**2),total=inflate(baseTotal,Number(dropout));
  return {design:'correlation',effect:r,baseTotal,total,alpha:Number(alpha),power:Number(power),dropout:Number(dropout)};
}

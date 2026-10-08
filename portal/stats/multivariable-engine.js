import { tP2, tCritical, fCDF } from './engine.js';

function invertMatrix(matrix, tolerance=1e-12) {
  const n=matrix.length;
  const a=matrix.map((row,i)=>[
    ...row.map(Number),
    ...Array.from({length:n},(_,j)=>i===j?1:0)
  ]);
  let maxScale=0;
  for(const row of matrix) for(const v of row) maxScale=Math.max(maxScale,Math.abs(v));
  const pivotFloor=Math.max(1,maxScale)*tolerance;
  for(let col=0;col<n;col++){
    let pivot=col;
    for(let r=col+1;r<n;r++) if(Math.abs(a[r][col])>Math.abs(a[pivot][col])) pivot=r;
    if(Math.abs(a[pivot][col])<=pivotFloor) throw new Error('MULTIVARIABLE_COLLINEAR');
    if(pivot!==col)[a[pivot],a[col]]=[a[col],a[pivot]];
    const d=a[col][col];
    for(let j=0;j<2*n;j++)a[col][j]/=d;
    for(let r=0;r<n;r++){
      if(r===col)continue;
      const f=a[r][col];
      if(f===0)continue;
      for(let j=0;j<2*n;j++)a[r][j]-=f*a[col][j];
    }
  }
  return a.map(row=>row.slice(n));
}

function matVec(matrix, vector){
  return matrix.map(row=>row.reduce((s,v,j)=>s+v*vector[j],0));
}

function quadratic(vector,matrix){
  let out=0;
  for(let i=0;i<vector.length;i++)for(let j=0;j<vector.length;j++)out+=vector[i]*matrix[i][j]*vector[j];
  return out;
}

function finiteNumber(value){
  if(typeof value==='number')return Number.isFinite(value)?value:NaN;
  const text=String(value??'').trim();
  if(!text)return NaN;
  const x=Number(text.replace(',','.'));
  return Number.isFinite(x)?x:NaN;
}

/**
 * Ordinary least squares with an intercept and at least two numeric predictors.
 * Predictors are centered/scaled internally, then coefficients and covariance are
 * transformed back to the original units. This improves numerical stability
 * without changing the fitted model.
 */
export function multivariableLinearRegression(yValues,predictorColumns,predictorNames=[]){
  if(!Array.isArray(predictorColumns)||predictorColumns.length<2)throw new Error('MULTIVARIABLE_PREDICTORS_TOO_FEW');
  const p=predictorColumns.length;
  const total=Math.min(yValues?.length||0,...predictorColumns.map(x=>x?.length||0));
  const rows=[];
  for(let i=0;i<total;i++){
    const y=finiteNumber(yValues[i]);
    const x=predictorColumns.map(col=>finiteNumber(col[i]));
    if(Number.isFinite(y)&&x.every(Number.isFinite))rows.push({originalIndex:i,y,x});
  }
  const n=rows.length,parameters=p+1,df=n-parameters;
  if(df<2)throw new Error('MULTIVARIABLE_DF_TOO_SMALL');

  const names=predictorNames.length===p?predictorNames.map(String):Array.from({length:p},(_,j)=>`X${j+1}`);
  const means=Array(p).fill(0);
  for(const row of rows)for(let j=0;j<p;j++)means[j]+=row.x[j]/n;
  const sds=Array(p).fill(0);
  for(const row of rows)for(let j=0;j<p;j++)sds[j]+=(row.x[j]-means[j])**2;
  for(let j=0;j<p;j++){
    sds[j]=Math.sqrt(sds[j]/(n-1));
    if(!(sds[j]>1e-12))throw new Error('PREDICTOR_CONSTANT');
  }
  const meanY=rows.reduce((s,r)=>s+r.y,0)/n;
  const z=rows.map(r=>r.x.map((v,j)=>(v-means[j])/sds[j]));

  const g=Array.from({length:p},()=>Array(p).fill(0));
  const rhs=Array(p).fill(0);
  for(let i=0;i<n;i++){
    const dy=rows[i].y-meanY;
    for(let j=0;j<p;j++){
      rhs[j]+=z[i][j]*dy;
      for(let k=0;k<p;k++)g[j][k]+=z[i][j]*z[i][k];
    }
  }
  const gInv=invertMatrix(g);
  const betaStd=matVec(gInv,rhs);
  const slopes=betaStd.map((b,j)=>b/sds[j]);
  const intercept=meanY-slopes.reduce((s,b,j)=>s+b*means[j],0);
  const fitted=rows.map(r=>intercept+slopes.reduce((s,b,j)=>s+b*r.x[j],0));
  const residuals=rows.map((r,i)=>r.y-fitted[i]);

  const sse=residuals.reduce((s,e)=>s+e*e,0);
  const sst=rows.reduce((s,r)=>s+(r.y-meanY)**2,0);
  if(!(sst>0))throw new Error('OUTCOME_CONSTANT');
  const mse=sse/df,residualSE=Math.sqrt(mse);
  const r2=Math.max(0,Math.min(1,1-sse/sst));
  const adjustedR2=1-(1-r2)*(n-1)/df;
  const ssr=Math.max(0,sst-sse);
  const f=(ssr/p)/mse;
  const pGlobal=Math.max(0,Math.min(1,1-fCDF(f,p,df)));
  const critical=tCritical(df);

  const covStd=gInv.map(row=>row.map(v=>v*mse));
  const slopeSE=Array.from({length:p},(_,j)=>Math.sqrt(Math.max(0,covStd[j][j]))/sds[j]);
  const a=means.map((m,j)=>m/sds[j]);
  const interceptVariance=mse/n+quadratic(a,covStd);
  const interceptSE=Math.sqrt(Math.max(0,interceptVariance));

  const coefficients=[{
    name:'(Intercept)',estimate:intercept,se:interceptSE,
    t:interceptSE>0?intercept/interceptSE:NaN,
    p:interceptSE>0?tP2(intercept/interceptSE,df):NaN,
    ci:[intercept-critical*interceptSE,intercept+critical*interceptSE],
    vif:null
  }];
  for(let j=0;j<p;j++){
    const estimate=slopes[j],se=slopeSE[j],tv=se>0?estimate/se:NaN;
    coefficients.push({
      name:names[j],estimate,se,t:tv,p:Number.isFinite(tv)?tP2(tv,df):NaN,
      ci:[estimate-critical*se,estimate+critical*se],
      vif:(n-1)*gInv[j][j]
    });
  }

  const leverage=[],standardizedResiduals=[],cooksDistance=[];
  for(let i=0;i<n;i++){
    const h=Math.min(0.999999999999,Math.max(0,1/n+quadratic(z[i],gInv)));
    const denom=Math.max(1e-15,1-h);
    const std=residualSE>0?residuals[i]/Math.sqrt(mse*denom):0;
    const cook=mse>0?(residuals[i]**2/(parameters*mse))*h/(denom**2):0;
    leverage.push(h);standardizedResiduals.push(std);cooksDistance.push(cook);
  }
  const cookThreshold=4/n,leverageThreshold=2*parameters/n;
  const influential=rows.map((r,i)=>({
    row:r.originalIndex+1,cook:cooksDistance[i],leverage:leverage[i],
    standardizedResidual:standardizedResiduals[i],
    flagged:cooksDistance[i]>cookThreshold||leverage[i]>leverageThreshold||Math.abs(standardizedResiduals[i])>3
  })).filter(r=>r.flagged).sort((a,b)=>b.cook-a.cook);

  const vifs=coefficients.slice(1).map(c=>c.vif);
  return {
    test:'multivariable_linear_regression',
    n,totalRows:total,droppedRows:total-n,p,parameters,df,
    coefficients,f,r2,adjustedR2,pGlobal,residualSE,sse,mse,
    fitted,residuals,leverage,standardizedResiduals,cooksDistance,
    cookThreshold,leverageThreshold,influential,
    maxCook:Math.max(...cooksDistance),
    maxLeverage:Math.max(...leverage),
    maxAbsStandardizedResidual:Math.max(...standardizedResiduals.map(Math.abs)),
    maxVIF:Math.max(...vifs)
  };
}

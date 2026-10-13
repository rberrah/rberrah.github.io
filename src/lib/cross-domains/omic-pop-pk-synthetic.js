/**
 * Entirely synthetic, deterministic PopPK teaching case. No patient data,
 * trained clinical predictor or dosing advice. Comparators use identical
 * train/test individuals; feature scaling and coefficients are train-only.
 */
export function simulateOmicsPopPK({ beta=0.35, seed=20261013 }={}) {
  if(!Number.isFinite(beta)||beta<0||beta>0.65||
     !Number.isSafeInteger(seed)||seed<0) throw Error('Invalid pedagogical scenario');
  let state=seed>>>0;
  function uniform(){state=(Math.imul(state,1664525)+1013904223)>>>0;return (state+0.5)/4294967296;}
  function gaussian(){const u=uniform(),v=uniform();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
  const NTRAIN=80,NTEST=40, sigma=0.16, baseAuc=200;
  const subjects=[];
  for(let i=0;i<NTRAIN+NTEST;i++){
    const score=2+1.1*gaussian(); // raw molecular signature, never a measured real biomarker
    const error=gaussian()*sigma;
    const trueAuc=baseAuc*Math.exp(-beta*(score-2)/1.1);
    subjects.push({score,observedAuc:trueAuc*Math.exp(error)});
  }
  const train=subjects.slice(0,NTRAIN);
  const heldout=subjects.slice(NTRAIN);
  /** @param {number[]} a */
  const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
  const trMean=mean(train.map(x=>x.score));
  const trVar=mean(train.map(x=>(x.score-trMean)**2));
  if(!(trVar>0))throw Error('Synthetic design has zero signature variation');
  const trSD=Math.sqrt(trVar);
  const logTrain=train.map(x=>Math.log(x.observedAuc));
  const interceptOnly=mean(logTrain);
  const scaledTrain=train.map(x=>(x.score-trMean)/trSD);
  const centeredLogs=logTrain.map(y=>y-interceptOnly);
  const slope=mean(scaledTrain.map((x,i)=>x*centeredLogs[i]))/
    mean(scaledTrain.map(x=>x*x));
  /** @param {{score:number,observedAuc:number}} row
   *  @param {boolean} omics */
  function predict(row,omics) {
    const log=interceptOnly+(omics?slope*(row.score-trMean)/trSD:0);
    return Math.exp(log);
  }
  /** @param {boolean} omics */
  function evaluate(omics) {
    const errors=heldout.map(row=>{
      const pred=predict(row,omics);
      return 100*Math.abs(pred-row.observedAuc)/row.observedAuc;
    }).sort((a,b)=>a-b);
    const medianApe=(errors[19]+errors[20])/2;
    const mae=mean(errors);
    const p20=errors.filter(x=>x<=20).length/NTEST*100;
    return {medianAbsolutePercentageError:medianApe,
      meanAbsolutePercentageError:mae,
      within20Percent:p20,
      n:NTEST};
  }
  return {
    type:'synthetic-only-not-a-real-data-validation',
    seed,beta,NTRAIN,NTEST,
    scale:{trainingMean:trMean,trainingSD:trSD},
    fittedCovariateCoefficientOnLogAuc:slope,
    comparator:evaluate(false),
    signatureModel:evaluate(true),
    apparentClearanceReferenceLPerH:25,
    illustrativeOralDoseMg:5,
    designNote:'Independent synthetic subjects; one pre-dose signature; training-only feature scaling; paired held-out comparison; no independent clinical validation'
  };
}

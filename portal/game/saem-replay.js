// Replayed recorded generalized-SAEM pilot, generated offline from synthetic PK only.
// All 28 subjects, 285 observations and actual 170-iteration fit snapshots are cached.
// Reference workflow: Monolix Warfarin tutorial, NOT its patient data or its fitted estimates.
export const POPULATION_META = Object.freeze({
  title:'Dossier Warfarine · cohorte synthétique',nSubjects:28,nObservations:285,
  source:'Cohorte artificielle calculée avec une PK orale 1C; paramètres inspirés des démonstrations warfarine, données NON cliniques.',
  algorithm:'SAEM éducatif généralisé : tirages Metropolis des effets aléatoires, approximation stochastique, M-step numérique conditionnelle.',
  nSteps:170,seed:20261123,dose:'1,5 mg/kg · dose orale unique',response:'Concentration en mg/L',
  random:'ηCL ~ N(0, ωCL²), V et Ka sans effet aléatoire',error:'ε sur log(C), lognormal',
  likelihood:'Marginalisation numérique 1D de ηCL, quadrature de Gauss–Legendre à 161 nœuds; BIC approximatif et non sortie Monolix/nlmixr2.',
  warning:'Replay d’ajustements réellement calculés par un moteur de démonstration non validé. Ne pas assimiler au SAEM Monolix, à une validation externe ou à un modèle utilisable en clinique.',
  tutorialUrl:'https://monolixsuite.slp-software.com/tutorials/2024R1/modeling-the-pharmacokinetics-and-pharmacodynamics'
});
export const TIMES=Object.freeze([1.5,2.5,4,6,9,12,18,24,36,48,72,96,144,168]);
// [weight kg, oral dose mg, encoded (time-index in hex : conc*1000 in hex)].
const PACKED=Object.freeze([
[56.8,85.15,'3:19f0.4:1a8b.6:2087.7:1612.8:160e.9:d94.b:57f.c:1bb.d:123'],
[64.5,96.7,'5:1fea.6:2237.7:1ec0.8:1672.a:d11.b:76a.c:3a4.d:243'],
[57.6,86.45,'0:1580.1:252e.2:19ce.4:1d1d.5:1f00.6:165b.7:15bd.9:b7b.a:584.b:343.c:f1'],
[72.3,108.47,'0:1943.3:2490.4:268f.5:296f.6:29ad.8:1b03.9:1062.a:f6c.b:7c9.d:262'],
[84.3,126.4,'0:1b57.2:3602.3:309a.4:2d40.5:24c0.7:20b2.8:165e.9:fa4.a:bef.c:292.d:190'],
[75.6,113.47,'1:2a85.4:2bad.6:1e03.7:1e86.8:24d3.9:17ef.b:bcf.c:584.d:3e1'],
[76.3,114.45,'0:1b10.3:326d.5:3023.6:19be.7:1a3f.8:12ff.a:5fd.b:2a4.c:da.d:4e'],
[58.1,87.19,'0:1392.1:1cd5.2:1bd9.4:2162.5:1927.6:17e9.7:13a5.9:9fa.a:5cf.b:363.c:115'],
[88.8,133.26,'3:3662.4:289d.5:2c34.6:2795.8:18a6.9:1300.a:7af.b:544.d:a8'],
[55.5,83.25,'2:20c5.3:205b.4:1574.5:1737.7:13dc.8:e28.9:8df.a:377.c:ac.d:4c'],
[93.3,139.88,'1:3b65.2:357b.3:3636.4:3c77.6:3121.7:2aab.8:25fe.9:2b02.b:1360.c:bb3.d:8c4'],
[75.6,113.36,'0:1e20.2:279a.3:2ceb.5:2430.6:245e.7:19fe.8:125b.a:9d2.b:52a.c:1b0.d:e4'],
[80.5,120.77,'1:2b8d.2:2cb0.4:28c9.5:3388.6:2493.7:1f09.9:153d.a:e22.b:7b1.c:2ab'],
[92.4,138.54,'0:27c6.3:2f03.4:34fe.5:2774.6:2a1d.8:2048.9:1231.a:aa9.b:600.d:117'],
[86.7,130.05,'0:1f62.2:342d.3:2ea5.4:2eb9.5:33c3.7:2ae5.8:298f.9:2324.a:1eb8.c:a5a.d:859'],
[73.8,110.68,'3:2cd6.4:2c6a.6:1fc2.7:1837.8:132a.9:e7e.b:580.c:161.d:c4'],
[94.4,141.55,'0:1d4a.1:33af.2:314e.3:30aa.5:2ac4.6:2770.7:20c1.8:1d35.a:13b5.b:ac1.c:34b.d:353'],
[58.1,87.11,'1:1ae1.2:1d1b.4:1b73.5:1dd7.6:19e3.7:1269.9:dd1.a:9df.b:50b.c:1a7'],
[91.8,137.67,'0:25e9.4:28ae.5:2c11.6:3114.8:1a65.9:14c9.a:eeb.b:9ca.d:1c4'],
[60.4,90.54,'0:1654.2:1fe3.4:1b00.5:1d72.7:1586.8:131b.9:1082.a:867.c:246.d:14b'],
[58.4,87.63,'1:1e30.2:19b9.3:1fea.4:2617.6:1537.7:1364.8:b4c.9:7c4.b:22b.c:70.d:3f'],
[71.1,106.59,'1:2002.3:23b9.5:2606.6:23b3.7:17e8.8:1101.a:ac6.b:5a7.c:20e.d:114'],
[81.7,122.6,'1:285d.2:30bf.4:311c.5:264c.6:260c.7:2122.9:12cf.a:ce6.b:941.c:330'],
[93.9,140.88,'0:1bce.1:2ecd.3:3784.4:319d.5:321e.6:232f.8:1335.9:d9c.a:797.b:403.d:7b'],
[91.7,137.57,'2:2e19.3:42df.4:2899.5:2b24.7:2859.8:1a90.9:1738.a:1145.c:530.d:3b2'],
[59.2,88.82,'2:22d1.3:2463.4:2176.6:1e71.7:1d0e.8:13f7.9:14fe.b:934.c:41c.d:289'],
[94.7,142.09,'0:23bc.1:27a3.2:3ce5.3:2eaa.5:2f26.6:2850.7:2409.8:2926.a:13b6.b:aa4.c:7bb.d:3dd'],
[71.4,107.13,'1:304c.2:32d3.4:281c.5:2b7e.6:22e8.7:1cd6.9:1483.a:11c7.b:6ec.c:448']
]);
export const SUBJECTS=Object.freeze(PACKED.map(([wt,dose],i)=>({id:i+1,wt,dose})));
export const OBSERVATIONS=Object.freeze(PACKED.flatMap(([wt,dose,series],i)=>
  series.split('.').map(pair=>{
    const [index,value]=pair.split(':');
    return {id:i+1,t:TIMES[parseInt(index,16)],c:parseInt(value,16)/1000,dose};
  })
));
// 170 actual numerical M-step iterations; a sparse selection of stored checkpoints.
export const FITS=Object.freeze({
  one:{label:'Oral 1C, sans Tlag',npar:5,neg2ll:-252.04,bic:-223.78,rmse:.957,
    est:{CL:.2057,V:9.3077,Ka:.6406,omegaCL:.2722,sigmaLog:.1238},
    trace:[[1,.2416,11.5489,.6882,.1063,.3],[10,.2148,9.7635,.6494,.2914,.1291],[20,.2092,9.3827,.6414,.2757,.1227],[40,.2074,9.3092,.6405,.2795,.1258],[60,.2078,9.2978,.6392,.2699,.1249],[80,.2079,9.3037,.6401,.2723,.1244],[110,.2073,9.2976,.6393,.273,.1233],[140,.2065,9.2979,.6394,.2714,.1237],[170,.2057,9.3077,.6406,.2722,.1238]],
    eta:[-.069,-.251,.149,-.217,-.027,-.383,.291,.134,.172,.26,-.654,.068,-.098,.075,-.677,.099,-.178,-.039,-.078,-.089,.324,-.003,-.131,.272,-.26,-.345,-.321,-.266],
    simMedian:[7.908,9.34,10.202,11.299,10.095,9.806,8.262,6.959,5.65,4.203,2.552,1.461,.492,.32]},
  lag:{label:'Oral 1C + Tlag',npar:6,neg2ll:-257.92,bic:-224.01,rmse:.935,
    est:{CL:.2096,V:9.3984,Ka:.999,Tlag:.6187,omegaCL:.2765,sigmaLog:.1221},
    trace:[[1,.2424,11.5524,.7272,.3328,.095,.3],[10,.2188,9.8795,.9686,.5777,.2895,.1256],[20,.2145,9.5021,1.0083,.6224,.2854,.1258],[40,.2124,9.3974,.9966,.6168,.2754,.1242],[60,.2124,9.409,1.0072,.625,.2831,.1213],[80,.2119,9.4049,1.0045,.6227,.2796,.1226],[110,.211,9.4116,1.0102,.627,.2797,.1227],[140,.2096,9.3963,.9986,.6185,.2763,.1223],[170,.2096,9.3984,.999,.6187,.2765,.1221]],
    eta:[-.082,-.264,.137,-.231,-.039,-.397,.279,.121,.16,.249,-.67,.055,-.111,.062,-.694,.087,-.192,-.052,-.091,-.101,.313,-.016,-.145,.261,-.273,-.359,-.335,-.28],
    simMedian:[7.407,9.867,10.719,11.406,10.004,9.728,8.183,6.799,5.517,4.063,2.559,1.392,.469,.3]},
  two:{label:'Oral 2C, sans Tlag',npar:7,neg2ll:-254.84,bic:-215.27,rmse:.954,
    est:{CL:.1995,Vc:6.6657,Ka:.4386,Q:.8568,Vp:2.5022,omegaCL:.2647,sigmaLog:.1233},
    trace:[[1,.2416,7.8487,.6699,.45,5.36,.1205,.3],[10,.2082,4.2362,.3108,.9161,5.4429,.2945,.1543],[20,.2018,3.5904,.2429,1.077,5.3561,.2805,.126],[40,.1997,4.6265,.3056,1.0702,4.3229,.2716,.1234],[60,.1989,5.5822,.3675,1.0084,3.4887,.2648,.1242],[80,.1996,6.165,.4061,.948,2.9643,.264,.1233],[110,.1995,6.287,.4139,.9099,2.8462,.2647,.1234],[140,.1999,6.2635,.4124,.9305,2.8742,.2669,.1232],[170,.1995,6.6657,.4386,.8568,2.5022,.2647,.1233]],
    eta:[-.039,-.222,.181,-.188,.004,-.355,.327,.166,.205,.296,-.626,.1,-.069,.106,-.649,.132,-.149,-.009,-.048,-.058,.361,.028,-.102,.308,-.23,-.317,-.292,-.238],
    simMedian:[7.784,9.414,10.48,11.423,10.105,9.907,8.382,6.973,5.862,4.259,2.666,1.588,.536,.353]}
});
export const VPC_OBSERVED=Object.freeze([
 [13,5.547,7.118,9.594],[13,7.45,10.333,13.058],[17,6.919,11.44,13.745],[18,8.249,11.943,14.009],
 [22,6.924,10.395,12.688],[22,7.548,10.353,12.78],[23,6.215,9.007,10.759],[23,5.04,7.382,10.109],
 [22,4.388,5.736,9.696],[22,2.593,4.442,6.108],[22,1.492,2.906,4.995],[23,.841,1.536,2.747],
 [23,.222,.658,1.866],[22,.083,.365,.993]
]);
const safely=(k,t)=>Math.exp(-k*t);
function integral(ka,k,t){
  const d=ka-k;
  return Math.abs(d)<1e-8 ? t*Math.exp(-k*t):Math.exp(-k*t)*(-Math.expm1(-d*t))/d;
}
export function populationPredict(kind,t,dose,eta=0){
  if(!Object.hasOwn(FITS,kind)||![t,dose,eta].every(Number.isFinite)||t<0||dose<=0)throw new RangeError('Unknown or invalid model');
  const e=FITS[kind].est,cl=e.CL*Math.exp(eta),ka=e.Ka;
  const lag=kind==='lag'?e.Tlag:0;
  const after=Math.max(0,t-lag);
  if(after===0)return 0;
  if(kind!=='two'){
    const k=cl/e.V;
    return Math.max(0,dose*ka/e.V*integral(ka,k,after));
  }
  const k10=cl/e.Vc,k12=e.Q/e.Vc,k21=e.Q/e.Vp,sm=k10+k12+k21;
  const disc=Math.sqrt(Math.max(1e-15,sm*sm-4*k10*k21));
  const alpha=(sm+disc)/2,beta=(sm-disc)/2;
  const a=(alpha-k21)/(alpha-beta),b=(k21-beta)/(alpha-beta);
  return Math.max(0,dose*ka/e.Vc*(a*integral(ka,alpha,after)+b*integral(ka,beta,after)));
}
export function modelComparison(){
  return Object.entries(FITS).map(([id,fit])=>({id,label:fit.label,bic:fit.bic,neg2ll:fit.neg2ll,
    deltaBic:Number((fit.bic-Math.min(...Object.values(FITS).map(x=>x.bic))).toFixed(2)),parameters:fit.npar,rmse:fit.rmse}));
}
export function gradeStructureConclusion(value){
  return value==='equivocal';
}
export function chooseChecks(values){
  const s=new Set(values);
  return s.size===3 && s.has('gof')&&s.has('vpc')&&s.has('stability');
}
export function assessMapping(map){
  return map.id==='id'&&map.time==='time'&&map.dose==='dose'&&map.concentration==='dv'&&map.event==='evid';
}

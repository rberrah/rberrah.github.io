// Course-based fictional PK exercises, kept separate from clinical MIPD.
export const ADVANCED_MISSIONS=Object.freeze([
 {id:'graph',title:'Dessiner le modèle',chapter:'Architecture PK',summary:'Proposez une structure compartimentale parcimonieuse à partir des concentrations observées.',xp:100},
 {id:'odes',title:'Écrire les équations',chapter:'Systèmes dynamiques',summary:'Assemblez toutes les équations d’état, sans terme manquant ni double comptage.',xp:110},
 {id:'mic',title:'Mission CMI',chapter:'Antibiothérapie simulée',summary:'Jouez sur la dose et l’intervalle pour atteindre un objectif fictif de fT > CMI.',xp:120},
 {id:'nonlinear',title:'Le piège de la dose',chapter:'Linéaire ou saturable ?',summary:'Atteignez la même AUC avec une élimination linéaire puis saturable.',xp:120},
 {id:'ddi',title:'Quand la clairance change',chapter:'Interaction médicamenteuse',summary:'Comparez les conséquences d’une baisse de CL sur AUC et C0.',xp:130},
 {id:'loading',title:'Le premier jour du traitement',chapter:'Dose de charge',summary:'Séparez l’objectif immédiat et l’exposition d’entretien.',xp:110},
 {id:'accumulation',title:'Le temps d’atteindre un plateau',chapter:'État stationnaire',summary:'Combien de doses faut-il selon la vitesse d’élimination ?',xp:110},
 {id:'fraction',title:'Une même dose quotidienne',chapter:'Fractionnement',summary:'Même AUC quotidienne, mais pics et creux différents.',xp:120},
 {id:'ambiguity',title:'Deux patients, une seule AUC',chapter:'Biodisponibilité apparente',summary:'Découvrez pourquoi F et CL ne se déduisent pas d’une AUC orale isolée.',xp:130}
]);
export const GRAPH_NODES=Object.freeze([
 {id:'gut',label:'Dépôt oral',x:90,y:150},
 {id:'central',label:'Central',x:280,y:150},
 {id:'peripheral',label:'Périphérique',x:470,y:150},
 {id:'exit',label:'Éliminé',x:280,y:310}
]);
export const GRAPH_DISTRACTORS=Object.freeze([
 {id:'iv_input',label:'Injection IV',x:90,y:310},
 {id:'p2',label:'2e périphérique',x:470,y:310}
]);
export const GRAPH_OPTIONS=Object.freeze([...GRAPH_NODES,...GRAPH_DISTRACTORS]);
export const GRAPH_EDGES=Object.freeze(['gut>central','central>peripheral','peripheral>central','central>exit']);
function equalSet(a,b){return a.length===b.length && a.every(v=>b.includes(v));}
export function validateGraph(nodes,edges){
  const n=[...new Set(nodes)],e=[...new Set(edges)];
  const wanted=GRAPH_NODES.map(x=>x.id);
  const missingNodes=wanted.filter(x=>!n.includes(x));
  const missingEdges=GRAPH_EDGES.filter(x=>!e.includes(x));
  const extraNodes=n.filter(x=>!wanted.includes(x));
  const extraEdges=e.filter(x=>!GRAPH_EDGES.includes(x));
  return {ok:equalSet(n,wanted)&&equalSet(e,GRAPH_EDGES),missingNodes,missingEdges,extraNodes,extraEdges};
}
export const ODE_TERMS=Object.freeze({
 gut_out:{label:'− Ka · Ag',part:'−ka·Ag'},
 gut_in:{label:'+ Ka · Ag',part:'+ka·Ag'},
 elimination:{label:'− CL · Ac/Vc',part:'−CL·Ac/Vc'},
 elim_accum:{label:'+ CL · Ac/Vc',part:'+CL·Ac/Vc'},
 tissue_out:{label:'− Q · (Ac/Vc − Ap/Vp)',part:'−Q·(Ac/Vc−Ap/Vp)'},
 tissue_in:{label:'+ Q · (Ac/Vc − Ap/Vp)',part:'+Q·(Ac/Vc−Ap/Vp)'}
});
export const ODE_STATES=Object.freeze([
 {id:'gut',label:'dAg/dt',expected:['gut_out']},
 {id:'central',label:'dAc/dt',expected:['gut_in','elimination','tissue_out']},
 {id:'peripheral',label:'dAp/dt',expected:['tissue_in']},
 {id:'eliminated',label:'dAe/dt',expected:['elim_accum']}
]);
export function validateOdes(choices){
  const wrong=[];
  for(const row of ODE_STATES){
    const actual=Array.isArray(choices[row.id])?[...new Set(choices[row.id])]:[];
    if(!equalSet(actual,row.expected))wrong.push(row.id);
  }
  return {ok:wrong.length===0,wrong};
}
export function steadyStateBolus({dose=175,tau=8,cl=5,volume=20,fu=0.8,mic=2}={}){
  const vals=[dose,tau,cl,volume,fu,mic];
  if(vals.some(x=>!Number.isFinite(x)) || dose<=0||tau<=0||cl<=0||volume<=0||fu<=0||fu>1||mic<=0)
    throw new RangeError('Invalid fictional antimicrobial parameters');
  const k=cl/volume;
  const cmax=dose/volume/(1-Math.exp(-k*tau));
  const cmin=cmax*Math.exp(-k*tau);
  const freePeak=fu*cmax;
  const fT=Math.min(1,Math.max(0,Math.log(freePeak/mic)/(k*tau)));
  const auc24=24/tau*dose/cl; // continuous dose frequency equivalent at steady state
  return {k,cmax,cmin,fT,auc24,freePeak,mic,concentrations:Array.from({length:65},(_,i)=>{
    const time=tau*i/64;
    return {t:time,c:fu*cmax*Math.exp(-k*time)}; // unbound plasma concentration
  })};
}
export function gradeMic(args){
  const r=steadyStateBolus(args);
  // These targets are deliberately invented for the fictional exercise only.
  const targetFT=0.70,limitAuc24=150;
  return {...r,ok:r.fT>=targetFT && r.auc24<=limitAuc24,targetFT,limitAuc24};
}
export const NONLINEAR={volume:20,vmax:30,km:2,cl:5,target:60};
export function aucLinear(dose,cl=NONLINEAR.cl){
  if(!Number.isFinite(dose)||!Number.isFinite(cl)||dose<=0||cl<=0)throw new RangeError('Invalid linear parameters');
  return dose/cl;
}
export function aucMichaelis(dose,{volume=NONLINEAR.volume,vmax=NONLINEAR.vmax,km=NONLINEAR.km}={}){
  if(![dose,volume,vmax,km].every(Number.isFinite)||dose<=0||volume<=0||vmax<=0||km<0)throw new RangeError('Invalid saturable parameters');
  // Exact AUC(0,infinity) after one IV bolus for elimination Vmax*C/(Km+C).
  return (km*dose + dose*dose/(2*volume))/vmax;
}
export function nonlinearChallenge({linearDose=200,saturableDose=200}={}){
  const target=NONLINEAR.target,a=aucLinear(linearDose),b=aucMichaelis(saturableDose);
  return {linear:a,saturable:b,target,
    linearOk:Math.abs(a-target)<=target*.06,
    saturableOk:Math.abs(b-target)<=target*.06,
    ok:Math.abs(a-target)<=target*.06 && Math.abs(b-target)<=target*.06};
}
export function oneDoseProfile(dose,kind='linear',horizon=32){
  const {volume,cl,vmax,km}=NONLINEAR;
  if(!Number.isFinite(dose)||dose<=0)throw new RangeError('Invalid dose');
  let c=dose/volume;
  const dt=.02,steps=Math.round(horizon/dt),points=[{t:0,c}];
  for(let n=1;n<=steps;n++){
    const f=x=>kind==='linear'? -cl*x/volume : -(vmax/volume)*x/(km+x);
    const k1=f(c),k2=f(c+dt*k1/2),k3=f(c+dt*k2/2),k4=f(c+dt*k3);
    c=Math.max(0,c+dt*(k1+2*k2+2*k3+k4)/6);
    if(n%10===0)points.push({t:n*dt,c});
  }
  return points;
}
export const DDI_BASE={dose:100,tau:12,volume:25,f:0.8,ka:1.2,cl:5};
export function steadyStateOral({dose=DDI_BASE.dose,tau=DDI_BASE.tau,volume=DDI_BASE.volume,f=DDI_BASE.f,ka=DDI_BASE.ka,cl=DDI_BASE.cl}={}){
  if(![dose,tau,volume,f,ka,cl].every(Number.isFinite) || Math.min(dose,tau,volume,f,ka,cl)<=0 || f>1)
    throw new RangeError('Invalid oral parameters');
  const k=cl/volume;
  // Avoid catastrophic cancellation when ka nearly equals k by explicitly taking the limit.
  const cAt=t=>{
    if(Math.abs(ka-k)<1e-7){
      const r=Math.exp(-k*tau),e=Math.exp(-k*t);
      return f*dose/volume * k*e*(t/(1-r)+tau*r/(1-r)**2);
    }
    return f*dose*ka/(volume*(ka-k))*(Math.exp(-k*t)/(1-Math.exp(-k*tau))-Math.exp(-ka*t)/(1-Math.exp(-ka*tau)));
  };
  const trough=cAt(tau);
  return {auc:f*dose/cl,cmin:trough,points:Array.from({length:97},(_,i)=>({t:i*tau/96,c:cAt(i*tau/96)}))};
}
export function ddiChallenge(newCl=2.5){
  if(!Number.isFinite(newCl)||newCl<1.5||newCl>5)throw new RangeError('Invalid DDI scenario');
  const before=steadyStateOral();
  const after=steadyStateOral({...DDI_BASE,cl:newCl});
  return {before,after,newCl,aucRatio:after.auc/before.auc,troughRatio:after.cmin/before.cmin};
}
export function gradeDdi(newCl,prediction){
  const r=ddiChallenge(newCl);
  const observation=prediction==='trough' ? 'trough' : prediction==='auc' ? 'auc' : prediction==='same' ? 'same' : null;
  if(observation!==null)return {...r,ok:r.aucRatio>=1.7 && observation==='trough' && r.troughRatio>r.aucRatio};
  return {...r,ok:r.aucRatio>=1.7&&Number.isFinite(prediction)&&Math.abs(prediction-r.troughRatio)<=.22};
}


// All following examples have fictional units, thresholds and no patient data.
export const LOADING_CASE=Object.freeze({volume:20,cl:3,tau:12,target:3});
export function loadingChallenge(loadingDose,maintenanceDose){
  if(![loadingDose,maintenanceDose].every(Number.isFinite)||loadingDose<=0||maintenanceDose<=0)
    throw new RangeError('Invalid loading/maintenance quantities');
  const {volume,cl,tau,target}=LOADING_CASE;
  const initial=loadingDose/volume,average=maintenanceDose/(cl*tau);
  return {initial,average,target,ok:Math.abs(initial-target)<=0.2 && Math.abs(average-target)<=0.18};
}
export function repeatedBolus(loadingDose,maintenanceDose,caseParams=LOADING_CASE){
  const {volume,cl,tau}=caseParams;
  if(![loadingDose,maintenanceDose,volume,cl,tau].every(Number.isFinite)||
    Math.min(loadingDose,maintenanceDose,volume,cl,tau)<=0)throw new RangeError('Invalid repeated doses');
  const k=cl/volume;
  const points=[];
  for(let i=0;i<=4*60;i++){
    const time=i*tau/60;
    let c=0;
    for(let doseNo=0;doseNo<=3;doseNo++){
      const timeOfDose=doseNo*tau;
      if(time>=timeOfDose){
        const amount=doseNo===0?loadingDose:maintenanceDose;
        c+=amount/volume*Math.exp(-k*(time-timeOfDose));
      }
    }
    points.push({t:time,c});
  }
  return points;
}
export function accumulationChallenge({cl=0.75,volume=20,tau=12,doses=3}={}){
  if(![cl,volume,tau,doses].every(Number.isFinite)||Math.min(cl,volume,tau)<=0||
    !Number.isInteger(doses)||doses<1||doses>20)throw new RangeError('Invalid accumulation parameters');
  const k=cl/volume;
  const fraction=1-Math.exp(-doses*k*tau);
  const minimumDoses=Math.ceil(-Math.log(0.1)/(k*tau)-1e-12);
  return {fraction,minimumDoses,halfLife:Math.log(2)/k,
    ok:doses===minimumDoses};
}
export function fractionationChallenge(tau=12){
  if(![6,8,12,24].includes(tau))throw new RangeError('Unsupported fictional dose interval');
  const cl=4,volume=20,dailyDose=240,k=cl/volume,dose=dailyDose*tau/24;
  const peak=dose/volume/(1-Math.exp(-k*tau));
  const trough=peak*Math.exp(-k*tau);
  const auc24=dailyDose/cl;
  return {dose,tau,auc24,peak,trough,fluctuation:peak/trough,
    ok:peak/trough<4};
}
export function ambiguityChallenge(f=1,cl=6){
  if(![f,cl].every(Number.isFinite)||f<=0||f>1||cl<=0)throw new RangeError('Invalid hypothetical bioavailability');
  const baseline={f:.8,cl:4,dose:100,auc:20};
  const auc=100*f/cl;
  const independent=Math.abs(f-baseline.f)>=0.1 && Math.abs(cl-baseline.cl)>=0.5;
  return {baseline,auc,f,cl,independent,ok:Math.abs(auc-baseline.auc)<=.5&&independent};
}

// Oral 2C synthetic samples: dose=100 mg, Vc=10 L, CL=2 L/h, Q=6 L/h, Vp=30 L, Ka=2 h^-1. Analytic first-order absorption convolution.
export function graphCaseConcentration(t){const ka=2,k10=.2,k12=.6,k21=.2,s=k10+k12+k21,d=Math.sqrt(s*s-4*k10*k21),a=(s+d)/2,b=(s-d)/2,A=(a-k21)/(a-b),B=(k21-b)/(a-b);return 10*ka*(A*(Math.exp(-a*t)-Math.exp(-ka*t))/(ka-a)+B*(Math.exp(-b*t)-Math.exp(-ka*t))/(ka-b));}
export const GRAPH_OBSERVATIONS=Object.freeze([0,.25,.5,1,2,3,4,6,8,12,18,24,36,48].map((t,i)=>Object.freeze({t,c:graphCaseConcentration(t)*(1+.045*Math.sin(i*2.3))})));

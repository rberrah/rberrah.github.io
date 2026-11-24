import { isFree, firstIncomplete, canVisit, normalizeCompleted } from './learning-mode.js';
// PMx Game track 3: authentic published warfarin data; synthetic SAEM sandbox isolated.
// SAEM traces are real archived exploratory calculations (not runtime computation).
import {STUDY_META,STUDY_SUBJECTS,STUDY_PK,STUDY_PD} from './warfarin-study.js';
import {POPULATION_META,TIMES,SUBJECTS,OBSERVATIONS,FITS,VPC_OBSERVED,
  modelComparison,populationPredict,gradeStructureConclusion,assessMapping,chooseChecks} from './saem-replay.js';
import {ARCHIVE_NOTEBOOK,ARCHIVE_COMPARISONS,ARCHIVE_GOF} from './warfarin-evidence.js';
const $=id=>document.getElementById(id);
const STEPS=[
  {title:'Données et colonnes',chapter:'Dossier source',desc:'Reconnaître les champs du jeu de données et vérifier doses, sujets et unités.'},
  {title:'Exploration',chapter:'EDA',desc:'Visualiser la variabilité et choisir des hypothèses structurales.'},
  {title:'Ajustements SAEM',chapter:'Estimation',desc:'Rejouer trois calculs de type SAEM réellement pré-enregistrés.'},
  {title:'Diagnostics complets',chapter:'Qualification PopPK',desc:'Explorer GOF, IIV, erreur résiduelle, covariables, VPC et stabilité avant de conclure.'},
  {title:'Arbitrage de modèle',chapter:'Sélection',desc:'Interpréter une différence de BIC faible, sans surconclure.'},
  {title:'Effet retardé',chapter:'PK → PD',desc:'Séparer la cinétique de la concentration de celle de la réponse.'},
  {title:'Conclusion scientifique',chapter:'Interprétation',desc:'Confronter résultats des modèles, diagnostics, incertitudes et décisions à étayer.'}
];
const KEY='pmx-game-population-v4';
const read=()=>{
  try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(x)){
    return normalizeCompleted(x,STEPS.length);
  }}catch{}return [];
};
let done=read(),index=firstIncomplete(done,STEPS.length);
let choice='',selectedFit='one',viewed=new Set(),selectedSubject=1,scale='linear',selectedChecks=new Set();
let map={id:'',time:'',dose:'',concentration:'',event:''}, reportChecked=new Set(),reportText='';
const fmt=(v,n=2)=>Number(v).toLocaleString((new URLSearchParams(location.search).get('lang')==='en'||document.documentElement.lang==='en')?'en-US':'fr-FR',{minimumFractionDigits:n,maximumFractionDigits:n});
function store(){try{localStorage.setItem(KEY,JSON.stringify(done));}catch{}}
function escapeText(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function story(text,eyebrow='ENQUÊTE SCIENTIFIQUE'){
  return '<div class="career-story"><span class="career-eyebrow">'+eyebrow+'</span><p>'+text+'</p></div>';
}
function metric(label,value){return '<div><span>'+label+'</span><strong>'+value+'</strong></div>';}
function radio(options,name='pop-choice'){
  return '<div class="career-choices" role="radiogroup" aria-label="Choix de réponse">'+options.map(o=>
    '<label><input type="radio" name="'+name+'" value="'+o[0]+'"><span>'+o[1]+'</span></label>'
  ).join('')+'</div>';
}
function checkboxes(options,name='pop-checks'){
  return '<div class="career-checkboxes">'+options.map(o=>
    '<label><input type="checkbox" name="'+name+'" value="'+o[0]+'"><span>'+o[1]+'</span></label>'
  ).join('')+'</div>';
}
function graph(el,{series=[],points=[],bands=[],summaries=[],maxT=168,ymax=20,log=false,target=null}={}){
  const w=730,h=285,x0=66,y0=22,cw=635,ch=226;
  const hi=log?Math.ceil(Math.log10(ymax)):ymax;
  const low=log?-2:0;
  const xx=t=>x0+cw*t/maxT;
  const yy=v=>log?y0+ch*(hi-Math.log10(Math.max(.01,v)))/(hi-low):y0+ch*(1-v/ymax);
  let s='<rect x="'+x0+'" y="'+y0+'" width="'+cw+'" height="'+ch+'" rx="9" fill="#0c2530"/>';
  for(let i=0;i<=4;i++){
    const lv=log?10**(low+(hi-low)*(1-i/4)):ymax*(1-i/4);
    const x=x0+cw*i/4,y=y0+ch*i/4;
    s+='<line x1="'+x0+'" x2="'+(x0+cw)+'" y1="'+y+'" y2="'+y+'" stroke="#35535c" stroke-dasharray="3 6"/>'+
      '<text x="'+(x0-9)+'" y="'+(y+5)+'" text-anchor="end" fill="#a7cbc4" font-size="12">'+fmt(lv,lv<1?2:1)+'</text>'+
      '<text x="'+x+'" y="269" text-anchor="middle" fill="#a7cbc4" font-size="12">'+fmt(maxT*i/4,0)+' h</text>';
  }
  if(target!==null){const y=yy(target);s+='<line x1="'+x0+'" x2="'+(x0+cw)+'" y1="'+y+'" y2="'+y+'" stroke="#f2c18e" stroke-dasharray="6 4"/>';}
  for(const band of bands){
    const upper=band.upper.filter(p=>p.c>0||!log);
    const lower=band.lower.filter(p=>p.c>0||!log);
    if(upper.length<2||lower.length<2)continue;
    const coords=[...upper,...lower.slice().reverse()].map(p=>xx(p.t).toFixed(1)+','+yy(p.c).toFixed(1)).join(' ');
    s+='<polygon points="'+coords+'" fill="'+(band.color||'#9be9cf')+'" opacity=".13"/>';
  }
  for(const line of series){
    const coords=line.values.filter(p=>!log||p.c>0).map(p=>xx(p.t).toFixed(1)+','+yy(p.c).toFixed(1));
    if(coords.length>1)s+='<polyline points="'+coords.join(' ')+'" fill="none" stroke="'+(line.color||'#8de2ce')+
      '" stroke-width="'+(line.width||3)+'" stroke-linejoin="round" opacity="'+(line.opacity??1)+'"/>';
  }
  for(const entry of summaries){
    if(log && entry.q25<=0)continue;
    const x=xx(entry.t).toFixed(1),top=yy(entry.q75).toFixed(1),bottom=yy(entry.q25).toFixed(1),center=yy(entry.q50).toFixed(1);
    s+='<line x1="'+x+'" x2="'+x+'" y1="'+top+'" y2="'+bottom+'" stroke="#ccb6ee" stroke-width="3.1" opacity=".95"/>'+
      '<line x1="'+(xx(entry.t)-6).toFixed(1)+'" x2="'+(xx(entry.t)+6).toFixed(1)+'" y1="'+top+'" y2="'+top+'" stroke="#ccb6ee" stroke-width="1.7"/>'+
      '<line x1="'+(xx(entry.t)-6).toFixed(1)+'" x2="'+(xx(entry.t)+6).toFixed(1)+'" y1="'+bottom+'" y2="'+bottom+'" stroke="#ccb6ee" stroke-width="1.7"/>'+
      '<circle cx="'+x+'" cy="'+center+'" r="4.6" fill="#d2b8f7" stroke="#17343b" stroke-width=".7"/>';
  }
  for(const dot of points){
    if(log&&dot.c<=0)continue;
    s+='<circle cx="'+xx(dot.t).toFixed(1)+'" cy="'+yy(dot.c).toFixed(1)+'" r="'+(dot.r||3.5)+
      '" opacity="'+(dot.opacity??1)+'" fill="'+(dot.color||'#f6cc93')+'" stroke="'+(dot.stroke||'#17343b')+'" stroke-width=".8"/>';
  }
  el.innerHTML=s;
}
function scatter(el,values,{xLabel='x',yLabel='y',xMin=null,xMax=null,yMin=null,yMax=null,identity=false,zero=false}={}){
  const finite=values.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));
  if(!finite.length){el.textContent='Données insuffisantes';return;}
  let minX=xMin??Math.min(0,...finite.map(p=>p.x)),maxX=xMax??Math.max(...finite.map(p=>p.x));
  let minY=yMin??Math.min(0,...finite.map(p=>p.y)),maxY=yMax??Math.max(...finite.map(p=>p.y));
  if(maxX-minX<.01){minX-=1;maxX+=1;}if(maxY-minY<.01){minY-=1;maxY+=1;}
  const xx=v=>68+625*(v-minX)/(maxX-minX),yy=v=>242-205*(v-minY)/(maxY-minY);
  let svg='<rect x="68" y="37" width="625" height="205" rx="8" fill="#0c2530"/>';
  for(let i=0;i<=4;i++){
    const t=i/4,x=68+625*t,y=242-205*t;
    svg+='<path d="M'+x+' 37 V242 M68 '+y+' H693" stroke="#35535c" stroke-dasharray="2 6"/>'+
      '<text x="'+x+'" y="258" text-anchor="middle" fill="#a7cbc4" font-size="11">'+fmt(minX+(maxX-minX)*t,1)+'</text>'+
      '<text x="60" y="'+(y+4)+'" text-anchor="end" fill="#a7cbc4" font-size="11">'+fmt(minY+(maxY-minY)*t,1)+'</text>';
  }
  if(identity){
    const low=Math.max(minX,minY),hi=Math.min(maxX,maxY);
    if(low<hi)svg+='<path d="M'+xx(low)+' '+yy(low)+' L'+xx(hi)+' '+yy(hi)+'" stroke="#f6c28e" stroke-width="2" stroke-dasharray="6 4"/>';
  }
  if(zero&&minY<=0&&maxY>=0)svg+='<path d="M68 '+yy(0)+' H693" stroke="#f6c28e" stroke-width="1.7" stroke-dasharray="6 4"/>';
  for(const p of finite)svg+='<circle cx="'+xx(p.x).toFixed(1)+'" cy="'+yy(p.y).toFixed(1)+'" r="3" fill="#9be9cf" opacity=".7"/>';
  svg+='<text x="380" y="281" text-anchor="middle" fill="#c8ddd8" font-size="12">'+escapeText(xLabel)+'</text>'+
    '<text x="68" y="20" fill="#c8ddd8" font-size="12">'+escapeText(yLabel)+'</text>';
  el.innerHTML=svg;
}
function histogram(el,values,{label='Résidu',lo=-4,hi=4,bins=16}={}){
  const counts=Array.from({length:bins},()=>0);
  for(const v of values)if(Number.isFinite(v)){
    counts[Math.max(0,Math.min(bins-1,Math.floor((v-lo)/(hi-lo)*bins)))]++;
  }
  const m=Math.max(1,...counts),base=242;
  let svg='<rect x="68" y="32" width="625" height="210" rx="8" fill="#0c2530"/>';
  for(let i=0;i<bins;i++){
    const h=190*counts[i]/m;
    svg+='<rect x="'+(72+i*38)+'" y="'+(base-h).toFixed(1)+'" width="31" height="'+h.toFixed(1)+'" fill="#9be9cf"/>';
  }
  for(let i=0;i<=4;i++)svg+='<text x="'+(72+i*152)+'" y="264" fill="#c8ddd8" font-size="12">'+fmt(lo+(hi-lo)*i/4,1)+'</text>';
  el.innerHTML=svg+'<text x="68" y="21" fill="#c8ddd8" font-size="12">Effectif · '+escapeText(label)+'</text>';
}
function quantile(values,p){
  const a=[...values].filter(Number.isFinite).sort((x,y)=>x-y);
  if(!a.length)return NaN;
  const at=(a.length-1)*p,i=Math.floor(at);
  return a[i]+(a[Math.min(i+1,a.length-1)]-a[i])*(at-i);
}
function sampleSD(values){
  const a=values.filter(Number.isFinite),avg=a.reduce((sum,x)=>sum+x,0)/a.length;
  return Math.sqrt(a.reduce((sum,x)=>sum+(x-avg)**2,0)/(a.length-1));
}
export function variabilitySummary(kind){
  const fit=FITS[kind];if(!fit)throw new RangeError('Unknown fit');
  const omega=fit.est.omegaCL,sigma=fit.est.sigmaLog;
  const etaSD=sampleSD(fit.eta),etaMean=fit.eta.reduce((a,v)=>a+v,0)/fit.eta.length;
  return {omega,omegaCv:Math.sqrt(Math.expm1(omega*omega))*100,etaMean,
    sigma,sigmaCv:Math.sqrt(Math.expm1(sigma*sigma))*100,
    etaSD,shrinkage:100*(1-etaSD/omega)};
}
function gaussianDensity(x,sd){
  return Math.exp(-x*x/(2*sd*sd))/(sd*Math.sqrt(2*Math.PI));
}
// Kernel-smoothed EBE density is descriptive; Ω defines the population
// distribution. Both densities have units of 1/(log CL) and integrate to one.
export function iivPlotData(eta,omega){
  const finite=eta.filter(Number.isFinite),n=finite.length;
  if(n<4||!Number.isFinite(omega)||omega<=0)throw new RangeError('Invalid IIV series');
  const avg=finite.reduce((a,b)=>a+b,0)/n,sd=sampleSD(finite);
  const h=Math.max(.06,1.06*sd*Math.pow(n,-.2));
  const span=Math.max(1,Math.abs(Math.min(...finite))+.16,Math.max(...finite)+.16,3.25*omega);
  const lo=-span,hi=span;
  const pdf=x=>finite.reduce((sum,v)=>sum+gaussianDensity(x-v,h),0)/n;
  const values=Array.from({length:181},(_,i)=>{
    const x=lo+(hi-lo)*i/180;
    return {x,ebe:pdf(x),population:gaussianDensity(x,omega)};
  });
  return {values,mean:avg,sd,bandwidth:h,lo,hi,n};
}
function plotIiv(el,eta,omega){
  const g=iivPlotData(eta,omega),width=625,xx=x=>68+(x-g.lo)/(g.hi-g.lo)*width;
  const ymax=Math.max(...g.values.flatMap(p=>[p.ebe,p.population]))*1.15;
  const yy=v=>239-186*v/ymax;
  let svg='<rect x="68" y="40" width="625" height="199" rx="8" fill="#0c2530"/>';
  for(let i=0;i<=4;i++){
    const v=ymax*i/4;
    svg+='<line x1="68" x2="693" y1="'+yy(v)+'" y2="'+yy(v)+'" stroke="#45636d" stroke-dasharray="4 6"/>'+
      '<text x="61" y="'+(yy(v)+4)+'" text-anchor="end" font-size="11" fill="#c8ddd8">'+fmt(v,2)+'</text>';
  }
  const atZero=xx(0);
  svg+='<path d="M'+atZero+' 40 V239" stroke="#92a8af" stroke-dasharray="4 5"/>';
  for(const [key,color] of [['population','#f6c28e'],['ebe','#9be9cf']]){
    svg+='<polyline fill="none" stroke="'+color+'" stroke-width="3.1" stroke-linejoin="round" points="'+
      g.values.map(p=>xx(p.x).toFixed(1)+','+yy(p[key]).toFixed(1)).join(' ')+'"/>';
  }
  for(let i=0;i<=4;i++){
    const at=g.lo+(g.hi-g.lo)*i/4;
    svg+='<text x="'+xx(at)+'" y="259" text-anchor="middle" fill="#c8ddd8" font-size="11">'+fmt(at,2)+'</text>';
  }
  const en=document.documentElement.lang==='en';
  el.innerHTML=svg+'<text x="68" y="21" fill="#c8ddd8" font-size="12">'+
    (en?'Density (per log CL unit) — ηCL':'Densité (par unité log CL) — ηCL')+'</text>'+
    '<text x="380" y="279" text-anchor="middle" fill="#c8ddd8" font-size="12">ηCL (log CL)</text>';
}
export function ruvPlotData(sigma,{maxPrediction=25}={}){
  if(!Number.isFinite(sigma)||sigma<=0||!Number.isFinite(maxPrediction)||maxPrediction<=0)
    throw new RangeError('Invalid residual error parameters');
  const z=1.6448536269514722;
  return Array.from({length:121},(_,i)=>{
    const pred=maxPrediction*i/120;
    return {pred,lo:pred*Math.exp(-z*sigma),median:pred,hi:pred*Math.exp(z*sigma)};
  });
}
// The model is log(DV)=log(IPRED)+ε; 90% quantiles are IPRED·exp(±1.645σlog).
// An additive model was never estimated and is deliberately not plotted.
function plotResidualError(el,sigma){
  const data=ruvPlotData(sigma),x=v=>68+625*v/25;
  const maxY=26*Math.exp(1.6448536269514722*sigma),y=v=>240-182*v/maxY;
  let svg='<rect x="68" y="40" width="625" height="200" rx="8" fill="#0c2530"/>';
  for(let i=0;i<=5;i++){
    const xv=5*i,at=x(xv);
    svg+='<line x1="'+at+'" x2="'+at+'" y1="40" y2="240" stroke="#3b5961" stroke-dasharray="3 6"/>'+
      '<text x="'+at+'" y="260" text-anchor="middle" fill="#c8ddd8" font-size="11">'+xv+'</text>';
  }
  for(let i=0;i<=4;i++){
    const v=maxY*i/4;
    svg+='<line x1="68" x2="693" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#3b5961" stroke-dasharray="3 6"/>'+
      '<text x="61" y="'+(y(v)+4)+'" text-anchor="end" fill="#c8ddd8" font-size="11">'+fmt(v,1)+'</text>';
  }
  const polygon=[...data.map(p=>[x(p.pred),y(p.hi)]),...data.slice().reverse().map(p=>[x(p.pred),y(p.lo)])];
  svg+='<polygon points="'+polygon.map(p=>p.map(v=>v.toFixed(2)).join(',')).join(' ')+
    '" fill="#9be9cf" fill-opacity=".21"/>';
  for(const [field,color,dash] of [['median','#9be9cf',''],['lo','#b9a0e7','stroke-dasharray="5 5"'],['hi','#b9a0e7','stroke-dasharray="5 5"']]){
    svg+='<polyline points="'+data.map(p=>x(p.pred).toFixed(2)+','+y(p[field]).toFixed(2)).join(' ')+
      '" fill="none" stroke="'+color+'" stroke-width="'+(field==='median'?3:1.6)+'" '+dash+'/>';
  }
  const en=document.documentElement.lang==='en';
  el.innerHTML=svg+'<text x="68" y="21" fill="#c8ddd8" font-size="12">'+
    (en?'Predicted observation (mg/L)':'Observation prédite (mg/L)')+'</text>'+
    '<text x="377" y="281" text-anchor="middle" fill="#c8ddd8" font-size="12">'+
    (en?'Individual prediction IPRED (mg/L)':'Prédiction individuelle IPRED (mg/L)')+'</text>';
}
function normQuantile(p){
  // Acklam approximation; used solely for a diagnostic QQ axis, not inference.
  const a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.357751867269,-30.66479806614716,2.506628277459239];
  const b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572];
  const c=[-.007784894002430293,-.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783];
  const d=[.007784695709041462,.3224671290700398,2.445134137142996,3.754408661907416];
  if(p<.02425||p>1-.02425){
    const q=Math.sqrt(-2*Math.log(p<.5?p:1-p));
    const n=(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]);
    const den=((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
    return (p<.5?1:-1)*n/den;
  }
  const q=p-.5,r=q*q;
  return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/
    (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}
const vpcCache=new Map();
function simulatedVPC(kind){
  if(vpcCache.has(kind))return vpcCache.get(kind);
  const fit=FITS[kind],group=TIMES.map(t=>OBSERVATIONS.filter(o=>o.t===t));
  let seed=20261123+({one:1,lag:2,two:3}[kind])*457;
  const uniform=()=>{seed=(1664525*seed+1013904223)>>>0;return Math.max(1e-10,seed/4294967296);};
  const gaussian=()=>Math.sqrt(-2*Math.log(uniform()))*Math.cos(2*Math.PI*uniform());
  const all=TIMES.map(()=>[[],[],[]]);
  for(let rep=0;rep<120;rep++){
    const etas=new Map(SUBJECTS.map(sub=>[sub.id,fit.est.omegaCL*gaussian()]));
    for(let i=0;i<TIMES.length;i++){
      const vals=group[i].map(o=>populationPredict(kind,o.t,o.dose,etas.get(o.id))*Math.exp(fit.est.sigmaLog*gaussian()));
      [.05,.5,.95].forEach((p,k)=>all[i][k].push(quantile(vals,p)));
    }
  }
  const p=[.05,.5,.95].map((_,k)=>({
    median:TIMES.map((t,i)=>({t,c:quantile(all[i][k],.5)})),
    lower:TIMES.map((t,i)=>({t,c:quantile(all[i][k],.05)})),
    upper:TIMES.map((t,i)=>({t,c:quantile(all[i][k],.95)}))
  }));
  vpcCache.set(kind,p);return p;
}
function navigation(){
  $('population-progress').textContent=done.length+' / '+STEPS.length;
  const frag=document.createDocumentFragment();
  STEPS.forEach((step,i)=>{
    const b=document.createElement('button');b.type='button';b.disabled=!canVisit(i,done,STEPS.length,isFree());
    if(i===index)b.setAttribute('aria-current','step');
    const n=document.createElement('span');n.className='career-step-num';n.textContent=done.includes(i)?'✓':String(i+1);
    const title=document.createElement('span');title.textContent=step.title;
    const sub=document.createElement('small');sub.textContent=done.includes(i)?'Vérifiée':b.disabled?'Verrouillée':step.chapter;
    title.append(sub);b.append(n,title);b.addEventListener('click',()=>select(i));frag.append(b);
  });
  $('population-steps').replaceChildren(frag);
}
function report(){
  const comparisons=modelComparison(),ref=comparisons.find(m=>m.id==='one'),lag=comparisons.find(m=>m.id==='lag');
  const v=variabilitySummary('lag');
  const english=new URLSearchParams(location.search).get('lang')==='en'||document.documentElement.lang==='en';
  if(english)return 'WARFARIN — POPULATION PHARMACOMETRIC ANALYSIS REPORT\n'+
    '1. STUDY POPULATION\n'+STUDY_META.nSubjects+' volunteers; '+STUDY_META.nPK+' measured PK concentrations and '+
     STUDY_META.nPD+' measured prothrombin complex activity values following single oral warfarin 1.5 mg/kg. Source: '+STUDY_META.sourceUrl+'\n'+
    '2. STRUCTURAL MODEL\n'+
    'Exploration of the experimental cohort supports assessing oral absorption and disposition phases. No population NLME model has been fitted to these 32 participants within this analysis.\n'+
    'Separate simulation benchmark: '+POPULATION_META.nSubjects+' simulated subjects, '+POPULATION_META.nObservations+' simulated concentrations. Archived SAEM fits: one-compartment BIC '+fmt(ref.bic)+
    '; one-compartment with Tlag '+fmt(lag.bic)+'; two-compartment '+fmt(comparisons.find(m=>m.id==='two').bic)+
    '. One-compartment vs Tlag ΔBIC '+fmt(Math.abs(ref.bic-lag.bic))+' is not discriminative.\n'+
    '3. INTERINDIVIDUAL AND RESIDUAL VARIABILITY\n'+
    'Benchmark 1C + Tlag: ωCL '+fmt(v.omega,3)+' (lognormal CL IIV CV '+fmt(v.omegaCv,1)+'%); σlog '+fmt(v.sigma,3)+
    ' (lognormal RUV CV '+fmt(v.sigmaCv,1)+'%); descriptive CL EBE shrinkage '+fmt(v.shrinkage,1)+'%. No fitted IIV for V, Ka or Tlag.\n'+
    '4. MODEL DIAGNOSTICS\n'+
    'Benchmark checks: DV/PRED, DV/IPRED, individual fits, log-standardized residuals vs time and IPRED, QQ plot, EBE vs weight, IIV/RUV and VPC P5/P50/P95 from 120 replicates. Not available: exact CWRES, NPDE, covariance matrix, RSE, bootstrap, IOV, pcVPC or external validation.\n'+
    '5. PK/PD AND CONCLUSION\n'+
    'According to the official Monolix tutorial using the original study, the one-compartment model with first-order absorption and Tlag is preferred: Tlag improves early and peak fits, while the two-compartment model has unstable, imprecise peripheral parameter estimates. Following parsimony, retain 1C + Tlag as the structural base. The tutorial subsequently selects a combined2 residual-error model and assesses weight and age covariates; these tutorial fits were not recomputed here. The distinct simulated benchmark (ΔBIC 0.23) cannot establish or refute Tlag in the real study. PCA supports a delayed effect, addressed in the Monolix PK/PD workflow; no PK/PD model was refitted in this game.\n'+
    'Monolix reference: https://monolixsuite.slp-software.com/tutorials/2024R1/modeling-the-pharmacokinetics-and-pharmacodynamics\n';
  return 'WARFARIN — PHARMACOMETRIC ANALYSIS REPORT\n'+
    '1. STUDY POPULATION / POPULATION ÉTUDIÉE\n'+
    'Étude expérimentale : '+STUDY_META.nSubjects+' volontaires, '+STUDY_META.nPK+' mesures de warfarine plasmatique et '+STUDY_META.nPD+' mesures de PCA après administration orale unique de 1,5 mg/kg. Données originales : '+STUDY_META.sourceUrl+'\n'+
    '2. STRUCTURAL MODEL / MODÈLE STRUCTURAL\n'+
    'L’exploration de la cohorte expérimentale met en évidence une phase d’absorption et une décroissance multitemporelle ; la structure ne peut être déterminée sur les courbes exploratoires seules. Aucun modèle NLME n’a été ajusté sur ces 32 volontaires dans cette analyse.\n'+
    'Benchmark distinct : '+POPULATION_META.nSubjects+' individus simulés, '+POPULATION_META.nObservations+' observations simulées. Comparaison par SAEM archivé : BIC 1C = '+fmt(ref.bic)+' ; 1C + Tlag = '+fmt(lag.bic)+' ; 2C = '+fmt(comparisons.find(m=>m.id==='two').bic)+'. ΔBIC(1C,Tlag) = '+fmt(Math.abs(ref.bic-lag.bic))+', non discriminant.\n'+
    '3. INTERINDIVIDUAL AND RESIDUAL VARIABILITY\n'+
    'Benchmark 1C + Tlag : ωCL = '+fmt(v.omega,3)+' (IIV CV lognormal '+fmt(v.omegaCv,1)+' %) ; σlog = '+fmt(v.sigma,3)+' (RUV CV lognormal '+fmt(v.sigmaCv,1)+' %) ; shrinkage descriptif des EBE de CL = '+fmt(v.shrinkage,1)+' %. Aucun effet aléatoire sur V, Ka, Tlag dans ce replay.\n'+
    '4. MODEL DIAGNOSTICS / CONTRÔLES\n'+
    'Examinés sur le benchmark : DV/PRED, DV/IPRED, profils individuels, résidus log-standardisés versus temps/IPRED et QQ-plot, EBE-versus-poids, IIV/RUV et VPC P5/P50/P95 à 120 réplications. Ne sont pas estimés : CWRES exacts, NPDE, matrice de covariance, RSE, bootstrap, IOV, pcVPC et validation externe.\n'+
    '5. PK/PD AND CONCLUSION\n'+
    'Le tutoriel officiel Monolix retient sur les observations originales le modèle 1C avec absorption d’ordre 1 et Tlag : les ajustements précoces et des pics sont améliorés, tandis que le 2C ajoute des paramètres périphériques peu précis et moins stables. Le principe de parcimonie conduit à privilégier 1C + Tlag ; le tutoriel poursuit avec une RUV combinée 2 et l’évaluation d’effets du poids et de l’âge. Ces ajustements Monolix n’ont pas été recalculés dans ce jeu. Le ΔBIC = 0,23 du benchmark simulé ne permet ni de prouver ni de réfuter Tlag dans les données réelles. Le décalage PCA–PK motive une relation indirecte/turnover ; aucune analyse PK/PD nouvelle n’a été refaite ici.\n'+
    'Référence Monolix : https://monolixsuite.slp-software.com/tutorials/2024R1/modeling-the-pharmacokinetics-and-pharmacodynamics\n';
}
function renderImport(){
  const subj=STUDY_SUBJECTS[0],pk=STUDY_PK.filter(x=>x.id===subj.id).slice(0,4),
    pd=STUDY_PD.find(x=>x.id===subj.id);
  const rows=[{id:subj.id,t:0,amt:subj.dose,dv:'—',dvid:1},
    ...pk.map(o=>({id:o.id,t:o.t,amt:'—',dv:fmt(o.c,2),dvid:1}))];
  if(pd)rows.push({id:pd.id,t:pd.t,amt:'—',dv:fmt(pd.c,1),dvid:2});
  $('population-workspace').innerHTML=story('Vous recevez un <strong>jeu de mesures expérimentales de warfarine</strong>, issu de l’étude historique distribuée dans le tutoriel MonolixSuite. Vérifiez les colonnes, la dose et le type de réponse avant de préparer un ajustement. <strong>DVID=1 correspond à la concentration PK ; DVID=2 à la PCA.</strong> Le fichier source ne comporte pas de colonne EVID : une administration est identifiable par AMT renseignée.','DOSSIER ORIGINAL · ÉTUDE WARFARINE')+
    '<div class="career-metrics">'+metric('Volontaires',STUDY_META.nSubjects)+metric('Mesures PK',STUDY_META.nPK)+metric('Mesures PCA',STUDY_META.nPD)+'</div>'+
    '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Colonne A</th><th>Colonne B</th><th>Colonne C</th><th>Colonne D</th><th>Colonne E</th></tr></thead><tbody>'+
    rows.map(p=>'<tr><td>'+p.id+'</td><td>'+fmt(p.t,1)+'</td><td>'+p.amt+'</td><td>'+p.dv+'</td><td>'+p.dvid+'</td></tr>').join('')+
    '</tbody></table></div>'+
    '<p class="career-note">Source : O’Reilly et al. (1968), jeu Warfarin du tutoriel MonolixSuite. Le fichier du dépôt comporte 32 sujets, 251 enregistrements PK (dont 4 valeurs nulles) et 232 mesures PD. Leurs estimations ne doivent pas être confondues avec celles du replay artificiel de l’étape 3.</p>'+
    '<div class="career-field-grid">'+[['id','A'],['time','B'],['dose','C'],['concentration','D'],['event','E']].map(([key,col])=>
      '<label>Colonne '+col+'<select data-pk-map="'+key+'"><option value="">Associer un champ…</option>'+
      [['id','Identifiant (ID)'],['time','Temps (TIME)'],['amt','Dose (AMT)'],['dv','Observation (DV)'],['dvid','Type de réponse (DVID)']].map(([v,label])=>
      '<option value="'+v+'">'+label+'</option>').join('')+'</select></label>').join('')+'</div>'+
    '<div class="career-file-actions"><a class="career-action" href="/pharmacometrie/downloads/warfarin/warfarin_data.csv" target="_blank" rel="noopener">Consulter les données de l’étude</a>'+
    '<a class="career-action" href="'+STUDY_META.sourceUrl+'" target="_blank" rel="noopener">Documentation de la source</a></div>';
  $('population-workspace').querySelectorAll('[data-pk-map]').forEach(el=>el.addEventListener('change',e=>{
    map[e.target.dataset.pkMap]=e.target.value;
  }));
}

// Data are measured and sampling is irregular: do not join sparse profiles
// across subjects. Descriptive bin summaries are unweighted (one subject per bin).
export function warfarinOverview(rows,subjectId){
  const bins=[0,6,12,24,48,72,96,120.001],valid=rows.filter(p=>Number.isFinite(p.t)&&Number.isFinite(p.c)&&p.t>=0&&p.t<=120);
  const others=valid.filter(p=>p.id!==subjectId),chosen=valid.filter(p=>p.id===subjectId).sort((a,b)=>a.t-b.t);
  const summaries=[];
  for(let i=0;i<bins.length-1;i++){
    const perSubject=new Map();
    for(const p of valid){
      if(p.t<bins[i]||p.t>=bins[i+1])continue;
      if(!perSubject.has(p.id))perSubject.set(p.id,[]);
      perSubject.get(p.id).push(p.c);
    }
    const values=[...perSubject.values()].map(v=>quantile(v,.5)).sort((a,b)=>a-b);
    if(values.length<4)continue;
    summaries.push({t:(bins[i]+Math.min(bins[i+1],120))/2,n:values.length,
      q25:quantile(values,.25),q50:quantile(values,.5),q75:quantile(values,.75)});
  }
  const selectedSegments=[];let segment=[];
  for(const p of chosen){
    if(segment.length && p.t-segment.at(-1).t>24){if(segment.length>1)selectedSegments.push(segment);segment=[];}
    segment.push(p);
  }
  if(segment.length>1)selectedSegments.push(segment);
  return {others,chosen,summaries,selectedSegments};
}
function renderEDA(){
  $('population-workspace').innerHTML=story('Explorez les <strong>mesures expérimentales</strong> de warfarine de l’étude : les sujets n’ont pas tous le même nombre d’échantillons ni les mêmes horaires. Une courbe descriptive ne suffit pas à identifier formellement une structure.','ÉTUDE RÉELLE · EXPLORATION GRAPHIQUE')+
    '<p class="career-note"><strong>Vue populationnelle :</strong> nuage d’observations des 32 volontaires, sujet sélectionné en orange et médianes/IQR de fenêtres temporelles en violet. Les données irrégulières ne sont plus reliées artificiellement entre sujets ou sur des périodes non échantillonnées.</p><svg id="pop-spaghetti" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Profils individuels des 32 volontaires, données réelles"></svg><p id="pop-overview-legend" class="career-note"></p>'+ 
    '<div class="career-chart-toolbar"><button id="pop-linear" aria-pressed="true">Linéaire</button><button id="pop-log" aria-pressed="false">Semi-log</button><label>Sujet <select id="pop-subject">'+STUDY_SUBJECTS.map(p=>'<option value="'+p.id+'">S'+p.id+' · '+fmt(p.wt,1)+' kg</option>').join('')+'</select></label></div>'+
    '<svg id="pop-eda-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Concentrations expérimentales de warfarine, source Monolix"></svg>'+
    '<p class="career-note">Les points sont les observations expérimentales DVID=1 ; les zéros ne sont tracés qu’en linéaire. Les lignes orange ne relient que les observations proches du même sujet. Les médianes et IQR par fenêtres représentent des données observées, pas une prédiction populationnelle. Les prélèvements sont irréguliers.</p>'+
    radio([['simple','Un modèle oral 1C est un candidat à ajuster et comparer : les observations seules ne prouvent pas sa structure.'],
      ['three','La pente terminale démontre exactement trois compartiments.'],
      ['fixed','La dispersion entre sujets prouve que tous les paramètres sont parfaitement identifiables.']]);
  function draw(){
    const view=warfarinOverview(STUDY_PK,selectedSubject);
    graph($('pop-spaghetti'),{
      series:view.selectedSegments.map(values=>({values,color:'#ffca86',opacity:.92,width:2.4})),
      points:[...view.others.map(p=>({...p,color:'#7dbcb4',opacity:.37,r:2.6,stroke:'#20414a'})),
        ...view.chosen.map(p=>({...p,color:'#ffca86',opacity:1,r:4.5}))],
      summaries:view.summaries,
      maxT:120,ymax:Math.max(18,...STUDY_PK.map(p=>p.c))*1.09,log:scale==='log'
    });
    const english=new URLSearchParams(location.search).get('lang')==='en'||document.documentElement.lang==='en';
    $('pop-overview-legend').textContent=english?
      '32 subjects · '+STUDY_PK.length+' PK observations · S'+selectedSubject+
      ' ('+view.chosen.length+' samples). Teal = measured values; orange = selected subject; purple = median and IQR by time window (at least 4 subjects), without interpolation.':
      '32 sujets · '+STUDY_PK.length+' observations PK · S'+selectedSubject+
      ' ('+view.chosen.length+' prélèvements). Turquoise = données mesurées ; orange = sujet sélectionné ; violet = médiane et IQR par fenêtre (au moins 4 sujets), sans interpolation.';
    $('pop-linear').setAttribute('aria-pressed',String(scale==='linear'));
    $('pop-log').setAttribute('aria-pressed',String(scale==='log'));
    const obs=STUDY_PK.filter(o=>o.id===selectedSubject);
    graph($('pop-eda-chart'),{points:obs,log:scale==='log',maxT:120,
      ymax:Math.max(18,...obs.map(o=>o.c))*1.17});
  }
  $('pop-linear').addEventListener('click',()=>{scale='linear';draw();});
  $('pop-log').addEventListener('click',()=>{scale='log';draw();});
  if(!STUDY_SUBJECTS.some(x=>x.id===selectedSubject))selectedSubject=STUDY_SUBJECTS[0].id;
  $('pop-subject').value=String(selectedSubject);
  $('pop-subject').addEventListener('change',e=>{selectedSubject=+e.target.value;draw();});
  draw();
}


function plotSAEMConvergence(svg,kind,param,step){
  const keys={one:['CL','V','Ka','omegaCL','sigmaLog'],lag:['CL','V','Ka','Tlag','omegaCL','sigmaLog'],two:['CL','Vc','Ka','Q','Vp','omegaCL','sigmaLog']};
  const available=Object.entries(FITS).flatMap(([id,fit])=>{
    const pos=keys[id].indexOf(param);if(pos<0)return [];
    const final=fit.trace.at(-1)[pos+1];
    return [{id,values:fit.trace.map(row=>({t:row[0],v:100*(row[pos+1]-final)/(Math.abs(final)||1)}))}];
  });
  const max=Math.max(10,Math.ceil(Math.max(...available.flatMap(a=>a.values.map(p=>Math.abs(p.v))))/5)*5);
  const xx=x=>70+x/170*605, yy=y=>135-y/max*90;
  let out='<rect x="70" y="37" width="605" height="206" rx="8" fill="#0c2530"/>'+
    '<rect x="70" y="'+yy(5)+'" width="605" height="'+(yy(-5)-yy(5))+'" fill="#388e74" opacity=".22"/>';
  for(const y of [-max,0,max])out+='<path d="M70 '+yy(y)+' H675" stroke="#527179" stroke-dasharray="4 5"/>'+
    '<text x="62" y="'+(yy(y)+4)+'" fill="#d1e4df" text-anchor="end" font-size="12">'+fmt(y,0)+' %</text>';
  available.forEach((a,i)=>{
    const color={one:'#8cbdba',lag:'#f4c08e',two:'#c7a4f5'}[a.id];
    out+='<polyline points="'+a.values.map(p=>xx(p.t).toFixed(1)+','+yy(p.v).toFixed(1)).join(' ')+
      '" fill="none" stroke="'+color+'" opacity="'+(a.id===kind?1:.36)+'" stroke-width="'+(a.id===kind?3.5:1.7)+'"/>';
  });
  const iter=FITS[kind].trace[step][0];
  out+='<path d="M'+xx(iter)+' 37 V243" stroke="#fff" stroke-dasharray="5 5"/>';
  for(const t of [0,40,80,120,170])out+='<text x="'+xx(t)+'" y="261" text-anchor="middle" font-size="12" fill="#c8ddd8">'+t+'</text>';
  svg.innerHTML=out+'<text x="70" y="23" fill="#c8ddd8" font-size="12">Écart relatif (%) à la dernière valeur enregistrée · estimation SAEM</text>'+
    '<text x="70" y="280" fill="#b7ccc9" font-size="11">Bande verte ±5 % = repère visuel, pas un test de convergence</text>';
}
function renderSAEM(){
  const options=Object.entries(FITS).map(([id,f])=>'<button data-pop-model="'+id+'" aria-pressed="'+(id===selectedFit)+'">'+f.label+'</button>').join('');
  $('population-workspace').innerHTML=story('<strong>Attention : atelier de calcul distinct.</strong> Les résultats SAEM ci-dessous ont été obtenus sur une cohorte <strong>artificielle de 28 sujets</strong>, et non sur les 32 volontaires de l’étude originale. Trois structures sont candidates. Ces valeurs proviennent de <strong>170 itérations de démonstration enregistrées</strong> et non d’un algorithme tournant dans votre navigateur. Sélectionnez chaque modèle pour examiner sa trajectoire et les paramètres estimés.','ENQUÊTE N° 03 · REPLAY SAEM')+
    '<div class="career-model-buttons">'+options+'</div>'+
    '<div class="career-metrics">'+metric('Itérations enregistrées','170')+
    metric('Effets aléatoires','ηCL')+metric('Erreur','log-normale')+'</div>'+
    '<div class="career-chart-toolbar"><label>Paramètre <select id="pop-trace-param"></select></label><label>Itération du replay <input id="pop-iteration" type="range" min="0" max="8" value="8" step="1"></label><span id="pop-iteration-label" class="career-tag"></span></div>'+
    '<svg id="pop-trace" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Convergence relative des paramètres SAEM"></svg>'+ 
    '<p class="career-note">Chaque ligne indique le changement relatif du paramètre par rapport à sa valeur finale. Les modèles sont comparés uniquement lorsqu’ils possèdent ce paramètre ; le plateau ne prouve pas que la solution est identifiable.</p>'+ 
    '<div id="pop-fit-summary" class="career-metrics"></div>'+
    '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Structure</th><th>−2LL approx.</th><th>BIC approx.</th><th>ΔBIC</th><th>Statut</th></tr></thead><tbody id="pop-fit-rows"></tbody></table></div>'+
    '<p class="career-note"><strong>Méthode :</strong> ηCL simulé par Metropolis, approximation stochastique et M-step numérique conditionnelle. BIC calculé ensuite par quadrature marginale 1D (161 nœuds). L’animation est un replay, sans optimisation dans le navigateur. Un BIC faible n’est pas une preuve mécanistique. <strong>Les BIC et EBE ne décrivent pas les mesures expérimentales présentées aux étapes 1–2.</strong></p>';
  function redraw(){
    const fit=FITS[selectedFit],timeIndex=+$('pop-iteration').value;
    const keys=selectedFit==='one'?['CL','V','Ka','omegaCL','sigmaLog']:selectedFit==='lag'?['CL','V','Ka','Tlag','omegaCL','sigmaLog']:['CL','Vc','Ka','Q','Vp','omegaCL','sigmaLog'];
    const rr=fit.trace[timeIndex];
    $('pop-iteration-label').textContent='Itération '+rr[0]+' / 170';
    const names=keys;
    const traceField=$('pop-trace-param');
    if(traceField.options.length!==names.length || [...traceField.options].some((o,i)=>o.value!==names[i])){
      traceField.innerHTML=names.map(x=>'<option value="'+x+'">'+x+'</option>').join('');
    }
    plotSAEMConvergence($('pop-trace'),selectedFit,traceField.value,timeIndex);
    $('pop-fit-summary').innerHTML=metric('CL typique',fmt(fit.est.CL,4)+' L/h')+
      metric('BIC marginal',fmt(fit.bic))+
      metric('ωCL (log SD)',fmt(rr[rr.length-2],3));
    const rows=keys.map((k,i)=>[k,fmt(rr[i+1],3)]).map(x=>x[0]+': '+x[1]).join(' · ');
    const more=document.createElement('p');more.className='career-note';more.textContent='État sauvegardé : '+rows;
    const old=$('pop-fit-summary').nextElementSibling;
    if(old?.classList.contains('career-param-line'))old.remove();
    more.classList.add('career-param-line');
    $('pop-fit-summary').after(more);
    $('pop-fit-rows').innerHTML=modelComparison().map(m=>'<tr data-selected="'+(selectedFit===m.id)+'"><td>'+m.label+'</td><td>'+
      (viewed.has(m.id)?fmt(m.neg2ll):'—')+'</td><td>'+(viewed.has(m.id)?fmt(m.bic):'—')+'</td><td>'+
      (viewed.has(m.id)?fmt(m.deltaBic):'—')+'</td><td>'+(viewed.has(m.id)?'Rejoué':'À examiner')+'</td></tr>').join('');
  }
  $('population-workspace').querySelectorAll('[data-pop-model]').forEach(b=>b.addEventListener('click',()=>{
    selectedFit=b.dataset.popModel;viewed.add(selectedFit);
    $('population-workspace').querySelectorAll('[data-pop-model]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    $('pop-iteration').value='8';redraw();
  }));
  $('pop-iteration').addEventListener('input',redraw);
  $('pop-trace-param').addEventListener('change',redraw);
  redraw();
}
const DIAG_QUESTIONS=Object.freeze([
  {key:'gof',correct:'trends',ask:'DV/PRED s’écarte de l’identité aux faibles concentrations, mais DV/IPRED se rapproche de la diagonale. Quelle interprétation faut-il examiner ?',options:[
    ['trends','Les effets individuels expliquent une partie de la dispersion ; il faut rechercher un biais systématique restant, notamment selon le temps.'],
    ['r2','Le meilleur DV/IPRED démontre que le modèle structural et les covariables sont corrects.'],
    ['overfit','Il faut ajouter un compartiment dès qu’un sujet possède un écart important.']]},
  {key:'residual',correct:'patterns',ask:'L’histogramme résiduel est centré, mais les résidus varient avec IPRED et le QQ-plot s’écarte dans les queues. Quelle suite est justifiée ?',options:[
    ['patterns','Tester les formes de RUV et vérifier les tendances selon temps et prédiction : une moyenne proche de zéro ne suffit pas.'],
    ['ignore','Accepter le modèle, car la moyenne des résidus est proche de zéro.'],
    ['exclude','Supprimer systématiquement les valeurs extrêmes pour forcer la normalité.']]},
  {key:'iiv',correct:'careful',ask:'ηCL semble associé au poids, tandis que la distribution des EBE paraît plus resserrée que Ω. Quelle est la bonne démarche ?',options:[
    ['careful','Quantifier le shrinkage, tester un effet du poids, réestimer Ω et vérifier si la relation et les diagnostics s’améliorent.'],
    ['causal','Inclure automatiquement le poids sur CL : l’association visuelle démontre la causalité.'],
    ['ignore','Ignorer les covariables puisque les EBE peuvent être shrinkés.']]},
  {key:'ruv',correct:'form',ask:'La dispersion absolue augmente lorsque les concentrations prédites sont élevées. Quelle comparaison est informative ?',options:[
    ['form','Comparer des erreurs additives, proportionnelles et combinées par ajustement et diagnostics résiduels, en gardant la précision analytique en tête.'],
    ['zero','Réduire uniquement σ à zéro pour améliorer la vraisemblance.'],
    ['cl','Modifier CL plutôt que la structure de RUV, sans analyser les résidus.']]},
  {key:'vpc',correct:'bands',ask:'La médiane observée suit la bande du VPC mais P5 et P95 s’en écartent. Que conclure ?',options:[
    ['bands','La tendance centrale peut être correcte alors que la variabilité et les extrêmes sont mal reproduits ; revoir Ω, RUV et les temps.'],
    ['median','Le VPC est validé dès que P50 est bien reproduit.'],
    ['replicates','Augmenter uniquement le nombre de réplications suffit à corriger les quantiles.']]},
  {key:'stability',correct:'uncertainty',ask:'Un modèle 2C améliore légèrement −2LL mais Q/Vp sont imprécis et les départs multiples divergent. Quelle décision privilégier ?',options:[
    ['uncertainty','Comparer le critère pénalisé, l’identifiabilité, la stabilité et la prédiction ; retenir le modèle plus simple si son ajustement suffit.'],
    ['bic','Choisir automatiquement le modèle avec la plus faible −2LL, quel que soit le nombre de paramètres.'],
    ['fix','Fixer les paramètres mal identifiés arbitrairement sans nouvelle vérification.']]}
]);
export function gradeDiagnosticQuestions(answers){return DIAG_QUESTIONS.every(q=>answers[q.key]===q.correct);}
function diagnosticQuiz(key){
  const q=DIAG_QUESTIONS.find(q=>q.key===key);
  return '<fieldset class="career-diagnostic-question" data-diagnostic-question="'+key+'"><legend>'+escapeText(q.ask)+'</legend>'+
    q.options.map(([v,label])=>'<label><input type="radio" name="pop-diagnostic-'+key+'" value="'+v+'"><span>'+escapeText(label)+'</span></label>').join('')+'</fieldset>';
}
function renderDiagnostics(){
  $('population-workspace').innerHTML=story('Cette galerie de diagnostics porte <strong>uniquement sur le replay SAEM artificiel</strong> (28 sujets). Le dataset expérimental Warfarine présenté précédemment ne possède pas encore de résultats SAEM associés. Lisez GOF, résidus, EBE, simulation prédictive et convergence, puis jugez quelles preuves manquent.','ATELIER SAEM · DIAGNOSTICS DISPONIBLES')+
    '<div class="career-chart-toolbar"><label>Modèle <select id="pop-diagnostic-model">'+Object.entries(FITS).map(([k,v])=>'<option value="'+k+'">'+v.label+'</option>').join('')+'</select></label>'+
    '<label>Sujet <select id="pop-diagnostic-subject">'+SUBJECTS.map(s=>'<option value="'+s.id+'">S'+s.id+'</option>').join('')+'</select></label></div>'+
    '<details open><summary><strong>1. Ajustements individuels et GOF</strong></summary>'+
    '<p class="career-note">Points DV ; courbe bleu pâle PRED (population) ; courbe verte IPRED (EBE CL). Les deux GOF ci-dessous confrontent les valeurs observées aux prédictions ; ligne pointillée = identité.</p>'+
    '<svg id="pop-diagnostic-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Fit individuel DV, PRED et IPRED"></svg>'+
    '<div class="career-plot-grid"><figure><figcaption>DV versus PRED (population)</figcaption><svg id="pop-gof-pred" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Observed versus population predictions"></svg></figure>'+
    '<figure><figcaption>DV versus IPRED (individuel)</figcaption><svg id="pop-gof-ipred" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Observed versus individual predictions"></svg></figure></div>'+diagnosticQuiz('gof')+'</details>'+
    '<details><summary><strong>2. Résidus et leur distribution</strong></summary>'+
    '<p class="career-note">Résidus conditionnels <em>approximatifs</em> : [log(DV) − log(IPRED)] / σlog. Ce ne sont <strong>ni des CWRES, ni des NPDE</strong> : les calculs correspondants ne sont pas disponibles.</p>'+
    '<div class="career-plot-grid"><figure><figcaption>Résidus versus temps</figcaption><svg id="pop-resid-time" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Résidus log-standardisés versus temps"></svg></figure>'+
    '<figure><figcaption>Résidus versus IPRED</figcaption><svg id="pop-resid-pred" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Résidus log-standardisés versus prédiction individuelle"></svg></figure>'+
    '<figure><figcaption>Histogramme des résidus</figcaption><svg id="pop-resid-hist" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Histogramme des résidus log-standardisés"></svg></figure>'+
    '<figure><figcaption>QQ-plot normal théorique</figcaption><svg id="pop-resid-qq" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="QQ-plot des résidus"></svg></figure></div>'+diagnosticQuiz('residual')+'</details>'+
    '<details><summary><strong>3. Variabilité interindividuelle (IIV), EBE et shrinkage</strong></summary>'+
    '<div class="career-plot-grid"><figure><figcaption>ηCL versus poids</figcaption><svg id="pop-eta-weight" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="ETA CL versus poids"></svg></figure>'+
    '<figure><figcaption>Histogramme des EBE ηCL</figcaption><svg id="pop-eta-hist" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Histogramme ETA CL"></svg></figure></div>'+ 
    '<div id="pop-variability-metrics" class="career-metrics"></div>'+ 
    '<p class="career-note">Les deux courbes sont des densités normalisées sur la même échelle : <strong>vert = distribution empirique lissée des 28 EBE ηCL</strong>, <strong>orange = distribution théorique N(0,ωCL²)</strong>. Une différence de centre ou de dispersion ne démontre pas un mauvais modèle : les EBE sont shrinkés et leurs nombres sont limités. Le shrinkage descriptif vaut 1 − SD(EBE)/ωCL. Seule CL possède un effet aléatoire estimé dans ce replay.</p>'+ 
    '<p class="career-chart-key career-density-legend"><span><i style="background:#9be9cf"></i>Densité EBE (lissée)</span><span><i style="background:#f6c28e"></i>Distribution populationnelle N(0,ω²)</span></p>'+ 
    '<svg id="pop-iiv-density" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Densité des effets individuels et distribution normale populationnelle"></svg>'+ 
    '<p class="career-note">Recherche exploratoire de covariables : ETA_CL en fonction du poids, montré ci-dessus. Attention : le poids détermine également la dose dans cette simulation ; association visuelle ≠ sélection statistique ou causalité. Pour une véritable analyse : graphique ETA/covariable, sélection prudente, réestimation du modèle complet, IC, pertinence clinique et vérification hors échantillon.</p>'+diagnosticQuiz('iiv')+'</details>'+ 
    '<details><summary><strong>4. Modèle d’erreur résiduelle (RUV)</strong></summary>'+ 
    '<p class="career-note">Modèle retenu pour le replay : <strong>log(DV) = log(IPRED) + ε</strong>, avec ε ~ N(0, σlog²). La ligne verte représente la médiane IPRED, la bande verte l’intervalle prédictif central à 90 %, délimité par les courbes violettes IPRED × exp(±1,645 σlog). Ce n’est pas un intervalle d’incertitude sur les paramètres. Aucun modèle d’erreur additif ou combiné n’a été ajusté.</p>'+ 
    '<div id="pop-ruv-metrics" class="career-metrics"></div>'+ 
    '<p class="career-chart-key"><span><i style="background:#9be9cf"></i>Médiane prédite</span><span><i style="background:#b9a0e7"></i>Quantiles prédictifs 5–95 %</span></p>'+ 
    '<svg id="pop-ruv-shape" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Intervalle prédictif lognormal conditionnel 90 pour cent"></svg>'+ 
    '<p class="career-note"><span style="color:#9be9cf">━</span> Médiane conditionnelle ; <span style="color:#b9a0e7">┄</span> quantiles 5 % et 95 %. La largeur de la bande augmente avec IPRED selon l’erreur log-normale. Un diagnostic RUV complet doit aussi confronter les résidus aux observations et comparer des structures alternatives ajustées.</p>'+diagnosticQuiz('ruv')+'</details>'+
    '<details><summary><strong>5. VPC : P5 / P50 / P95 et incertitude</strong></summary>'+
    '<p class="career-note">VPC <strong>simulé de nouveau</strong> par 120 réplications déterministes sous le modèle sélectionné, aux mêmes temps/sujets que le replay. Chaque courbe = médiane des quantiles simulés ; zone transparente = intervalle empirique 5–95 % entre les réplications. Points = quantiles observés dans la cohorte artificielle. Pas de correction pcVPC, ni bootstrap de paramètres.</p>'+
    '<svg id="pop-vpc" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="VPC observé vs simulé, 5e 50e et 95e centiles avec intervalle de simulation"></svg>'+
    '<p class="career-note"><span style="color:#f6c28e">●</span> P5 observé ; <span style="color:#9be9cf">●</span> P50 observé ; <span style="color:#c8a6f5">●</span> P95 observé. Bandes de la même couleur = distribution simulée de ce quantile.</p>'+diagnosticQuiz('vpc')+'</details>'+
    '<details><summary><strong>6. Stabilité, précision, identifiabilité et validation</strong></summary>'+ 
    '<p class="career-note">Séquence du pharmacométricien : contrôle des données et BLQ → modèle structural → choix des effets aléatoires (IIV/IOV, corrélations Ω) et du modèle résiduel (additif/proportionnel/combiné) → choix des covariables → estimation / convergence → GOF et diagnostics individuels → VPC/pcVPC/NPDE → précision (RSE/IC, bootstrap), shrinkage, sensibilité et validation externe → décision documentée.</p>'+ 
    '<div class="career-alert"><strong>Non disponibles pour ce replay :</strong> CWRES exacts, NPDE, pcVPC, RSE et matrice de covariance, corrélations entre effets aléatoires (une seule η), IOV, bootstrap, simulation-estimation, analyse de sensibilité, départs multiples, prédictions externes. Ne pas tracer de valeurs fictives à la place de diagnostics statistiques non calculés. Le shrinkage descriptif EBE/ω est visible mais ne remplace pas les évaluations de précision.</div>'+diagnosticQuiz('stability')+'</details>'+
    '<p class="career-note">La validation exige une réponse à chacune des six questions associées aux graphiques ci-dessus.</p>'+archivedDiagnostics();
  function draw(){
    const kind=$('pop-diagnostic-model').value,id=+$('pop-diagnostic-subject').value,
      subj=SUBJECTS.find(s=>s.id===id),fit=FITS[kind];
    const obs=OBSERVATIONS.filter(x=>x.id===id);
    const curves=Array.from({length:125},(_,i)=>{
      const t=i*168/124;return {t,c:populationPredict(kind,t,subj.dose)};
    });
    const ipred=curves.map(p=>({t:p.t,c:populationPredict(kind,p.t,subj.dose,fit.eta[id-1])}));
    graph($('pop-diagnostic-chart'),{series:[{values:curves,color:'#6dbcb8',width:2},{values:ipred,color:'#a9e8bc',width:3}],
      points:obs,log:false,ymax:Math.max(19,...obs.map(x=>x.c),...ipred.map(x=>x.c))*1.1});
    const vals=OBSERVATIONS.map(o=>{
      const pop=populationPredict(kind,o.t,o.dose);
      const individual=populationPredict(kind,o.t,o.dose,fit.eta[o.id-1]);
      return {t:o.t,dv:o.c,pop,individual,z:Math.log(o.c/Math.max(.001,individual))/fit.est.sigmaLog};
    }).filter(o=>Number.isFinite(o.z));
    const maxConc=Math.max(20,...vals.flatMap(o=>[o.dv,o.pop,o.individual]))*1.07;
    scatter($('pop-gof-pred'),vals.map(o=>({x:o.pop,y:o.dv})),{xLabel:'PRED (mg/L)',yLabel:'DV (mg/L)',xMin:0,yMin:0,xMax:maxConc,yMax:maxConc,identity:true});
    scatter($('pop-gof-ipred'),vals.map(o=>({x:o.individual,y:o.dv})),{xLabel:'IPRED (mg/L)',yLabel:'DV (mg/L)',xMin:0,yMin:0,xMax:maxConc,yMax:maxConc,identity:true});
    const rr=vals.map(o=>o.z),resHigh=Math.max(3.5,...rr.map(Math.abs))*1.08;
    scatter($('pop-resid-time'),vals.map(o=>({x:o.t,y:o.z})),{xLabel:'Temps (h)',yLabel:'Résidu log-standardisé',xMin:0,xMax:168,yMin:-resHigh,yMax:resHigh,zero:true});
    scatter($('pop-resid-pred'),vals.map(o=>({x:o.individual,y:o.z})),{xLabel:'IPRED (mg/L)',yLabel:'Résidu log-standardisé',xMin:0,yMin:-resHigh,yMax:resHigh,zero:true});
    histogram($('pop-resid-hist'),rr,{label:'Résidu conditionnel standardisé',lo:-4,hi:4});
    const sorted=[...rr].sort((a,b)=>a-b);
    const qq=sorted.map((v,i)=>({x:normQuantile((i+.5)/sorted.length),y:v}));
    scatter($('pop-resid-qq'),qq,{xLabel:'Quantile normal théorique',yLabel:'Quantile résiduel',identity:true});
    scatter($('pop-eta-weight'),SUBJECTS.map((p,i)=>({x:p.wt,y:fit.eta[i]})),{xLabel:'Poids (kg)',yLabel:'ETA CL',zero:true});
    histogram($('pop-eta-hist'),fit.eta,{label:'ETA CL (log)',lo:-1,hi:1});
    const v=variabilitySummary(kind);
    $('pop-variability-metrics').innerHTML=metric('ωCL (SD sur log CL)',fmt(v.omega,3))+metric('IIV CL (CV lognormale)',fmt(v.omegaCv,1)+' %')+metric('Moyenne EBE ηCL',fmt(v.etaMean,3))+metric('SD des EBE CL',fmt(v.etaSD,3))+metric('Shrinkage descriptif',fmt(v.shrinkage,1)+' %');
    $('pop-ruv-metrics').innerHTML=metric('σlog',fmt(v.sigma,3))+metric('CV résiduel lognormal',fmt(v.sigmaCv,1)+' %')+metric('RUV retenue','Log-normale')+metric('Autres RUV ajustées','Aucune');
    plotIiv($('pop-iiv-density'),fit.eta,v.omega);
    plotResidualError($('pop-ruv-shape'),v.sigma);
    const sim=simulatedVPC(kind),colors=['#f6c28e','#9be9cf','#c8a6f5'];
    const lines=sim.map((x,i)=>({values:x.median,color:colors[i],width:i===1?3:2}));
    const bands=sim.map((x,i)=>({lower:x.lower,upper:x.upper,color:colors[i]}));
    const points=TIMES.flatMap((t,i)=>[1,2,3].map((k,j)=>({t,c:VPC_OBSERVED[i][k],color:colors[j]})));
    const ymax=Math.max(18,...sim[2].upper.map(p=>p.c),...points.map(p=>p.c))*1.12;
    graph($('pop-vpc'),{series:lines,bands,points,maxT:168,ymax});
  }
  $('pop-diagnostic-model').value='lag';
  $('pop-diagnostic-model').addEventListener('change',draw);
  $('pop-diagnostic-subject').addEventListener('change',draw);
  draw();
}
function archivedModelComparison(){
  return '<section class="career-archive" id="pop-real-comparison"><h3>Résultats archivés sur les données expérimentales · nlmixr2</h3>'+
    '<p class="career-note">Ces résultats proviennent du notebook exécuté sur les données de warfarine. Ils ne sont ni les valeurs du tutoriel Monolix ni les estimations du replay simulé. Les comparaisons s’interprètent à l’intérieur de chaque étape, avec les diagnostics et la précision.</p>'+
    ARCHIVE_COMPARISONS.map(stage=>'<h4>'+stage.stage+'</h4><div class="career-table-wrap"><table class="career-table"><thead><tr><th>Modèle</th><th>AIC</th><th>BIC</th><th>logLik</th></tr></thead><tbody>'+
      stage.models.map(([name,aic,bic,ll])=>'<tr><td>'+escapeText(name)+'</td><td>'+fmt(aic,2)+'</td><td>'+fmt(bic,2)+'</td><td>'+fmt(ll,2)+'</td></tr>').join('')+'</tbody></table></div>').join('')+
    '<p class="career-note">Le développement archivé privilégie 1C + Tlag, puis combined2 et un effet du poids sur V. Un BIC inférieur ne dispense pas des contrôles de stabilité et de qualification.</p>'+
    '<a class="career-action" href="'+ARCHIVE_NOTEBOOK+'" target="_blank" rel="noopener">Notebook source exécuté</a></section>';
}
function archivedDiagnostics(){
  return '<details class="career-archive" id="pop-real-diagnostics"><summary><strong>Diagnostics archivés sur les observations réelles · nlmixr2</strong></summary>'+
    '<p class="career-note">Trois graphiques du notebook exécuté : DV/PRED, DV/IPRED et CWRES en fonction du temps. Les figures originales sont en anglais. Elles décrivent le modèle PK final archivé, distinct des diagnostics simulés ci-dessus. Les zéros sont exclus du graphique logarithmique.</p>'+
    '<div class="archive-gof-grid">'+ARCHIVE_GOF.map(g=>'<figure><img loading="lazy" src="./warfarin-archive/'+g.id+'.png" alt="'+g.title+'"><figcaption>'+g.title+'</figcaption></figure>').join('')+'</div>'+
    '<p class="career-note">Les valeurs individuelles, NPDE, RSE, matrices de covariance et VPC PK doivent encore être exportés et vérifiés avant de remplacer les graphiques interactifs du replay.</p>'+
    '<a href="'+ARCHIVE_NOTEBOOK+'" target="_blank" rel="noopener">Notebook source exécuté</a></details>';
}
function renderDecision(){
  $('population-workspace').innerHTML=story('Vous disposez des BIC de l’atelier SAEM sur cohorte artificielle, indépendamment des 32 volontaires de l’étude expérimentale. Ce replay ne qualifie pas le modèle pour les données réelles. Formulez une conclusion défendable pour une étude exploratoire.','ENQUÊTE N° 05 · DÉCISION ARGUMENTÉE')+
    '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Modèle</th><th>BIC approximatif</th><th>ΔBIC</th><th>Paramètres libres</th></tr></thead><tbody>'+
    modelComparison().map(x=>'<tr><td>'+x.label+'</td><td>'+fmt(x.bic)+'</td><td>'+fmt(x.deltaBic)+'</td><td>'+x.parameters+'</td></tr>').join('')+
    '</tbody></table></div>'+
    '<p class="career-note"><strong>Interprétation :</strong> le replay ne permet pas d’arbitrer Tlag. Sur les observations originales, la formation Monolix obtient au contraire un meilleur ajustement avec Tlag et préfère 1C+Tlag au modèle 2C moins robuste (rasoir d’Occam). Ne pas mélanger les deux analyses.</p>'+ 
    radio([['lag-proved','Le 1C avec Tlag est démontré meilleur : ΔBIC = 0,23 suffit pour conclure.'],
      ['equivocal','1C ± Tlag restent presque équivalents ; le modèle 2C est moins soutenu. Il faut confirmer par stabilité et diagnostics.'],
      ['two-certain','Le 2C doit être retenu car il possède le plus grand nombre de paramètres.']])+archivedModelComparison();
}
function renderPD(){
  $('population-workspace').innerHTML=story('Le même fichier d’étude contient <strong>des valeurs expérimentales de PCA (DVID=2)</strong>, et pas seulement des concentrations PK. Comparez les séries mesurées d’un volontaire : un décalage PK–PD peut motiver un compartiment d’effet ou un modèle indirect, mais aucune des deux structures PD n’est ajustée dans ce jeu.','ÉTUDE RÉELLE · PK ET PCA')+
    '<div class="career-chart-toolbar"><label>Sujet <select id="pop-pd-subject">'+STUDY_SUBJECTS.filter(x=>STUDY_PD.some(p=>p.id===x.id)).map(x=>'<option value="'+x.id+'">S'+x.id+'</option>').join('')+'</select></label></div>'+
    '<div class="career-metrics">'+metric('Concentrations PK',STUDY_META.nPK)+metric('PCA mesurées',STUDY_META.nPD)+metric('Modèle PD ajusté','Aucun')+'</div>'+
    '<p class="career-note"><strong>Concentrations de warfarine (mg/L)</strong></p><svg id="pop-pd-pk" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Concentrations PK réelles du sujet"></svg>'+
    '<p class="career-note"><strong>Activité du complexe prothrombinique, PCA (%)</strong></p><svg id="pop-pd-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="PCA expérimentale issue de la même étude"></svg>'+
    '<p class="career-note">Les points sont mesurés, et non générés par une équation de turnover. La compatibilité avec une structure à délai doit être démontrée par estimation et diagnostics sur ces données.</p>'+
    radio([['instant','L’évolution observée démontre nécessairement une relation concentration–effet instantanée.'],
      ['delay','Un modèle de turnover ou un compartiment d’effet peut être comparé par ajustement aux observations PD.'],
      ['proved','La figure seule prouve le mécanisme physiologique sous-jacent.']]);
  function draw(){
    const id=+$('pop-pd-subject').value;
    const pk=STUDY_PK.filter(x=>x.id===id),pd=STUDY_PD.filter(x=>x.id===id);
    graph($('pop-pd-pk'),{points:pk,maxT:144,ymax:Math.max(18,...pk.map(x=>x.c))*1.1});
    graph($('pop-pd-chart'),{points:pd,maxT:144,ymax:110});
  }
  $('pop-pd-subject').addEventListener('change',draw);
  draw();
}

function renderFinal(){
  $('population-workspace').innerHTML=story('Concluez comme dans un rapport de pharmacométrie : séparez données, modèles candidats, précision, diagnostics et résultat PK/PD. Une conclusion ne peut s’appliquer qu’au jeu de données effectivement estimé.','SYNTHÈSE SCIENTIFIQUE')+
    '<div class="career-alert"><strong>Conclusion — principe de parcimonie :</strong> dans le tutoriel officiel Monolix, le 1C sans délai surestime les premières observations et sous-estime certains pics ; l’ajout de Tlag améliore les diagnostics. Un 2C avec Tlag est essayé mais présente une estimation des paramètres périphériques moins précise et moins stable. Le <strong>1C avec Tlag</strong> est donc retenu comme base structurale ; le développement se poursuit avec une RUV combinée et des covariables. Les BIC du replay simulé ne sont pas ceux de Monolix.</div>'+
    '<p class="career-note"><a href="https://monolixsuite.slp-software.com/tutorials/2024R1/modeling-the-pharmacokinetics-and-pharmacodynamics" target="_blank" rel="noopener noreferrer">Voir les ajustements et la comparaison de convergence de la formation Monolix</a></p>'+
    '<p class="career-note">Quelle interprétation concilie les diagnostics de l’étude réelle et les résultats du benchmark distinct ?</p>'+
    radio([['conditional','Sur les données réelles, Monolix retient le 1C + Tlag pour l’amélioration du fit et la robustesse face au 2C ; le petit ΔBIC simulé ne permet pas de généraliser les paramètres du replay.'],
      ['certain','Le seul ΔBIC = 0,23 du replay prouve que Tlag est supérieur sur l’étude originale.'],
      ['always-simple','Le rasoir d’Occam impose le 1C sans Tlag même si ses diagnostics sont moins bons.']],'pop-conclusion')+
    '<pre id="pop-report" class="career-code">'+escapeText(report())+'</pre>'+
    '<div class="career-file-actions"><button type="button" class="career-action" id="pop-copy-report">Copier le rapport scientifique</button>'+
    '<a href="'+POPULATION_META.tutorialUrl+'" target="_blank" rel="noopener noreferrer" class="career-action">Source de l’étude</a></div>';
  $('pop-copy-report').addEventListener('click',()=>navigator.clipboard?.writeText(report()));
}
function render(){
  const step=STEPS[index];selectedFit='one';
  $('population-chapter').textContent=step.chapter;
  $('population-level').textContent='Étape '+(index+1)+' / '+STEPS.length;
  $('population-title').textContent=step.title;
  $('population-description').textContent=step.desc;
  $('population-feedback').hidden=true;
  $('population-next').hidden=(!done.includes(index)&&!isFree())||index===STEPS.length-1;
  $('population-validate').disabled=done.includes(index);
  $('population-hint-text').hidden=true;
  $('population-help').textContent=[
    'Associez chaque colonne au bon rôle avant d’autoriser les estimations.',
    'Utilisez l’échelle et les observations, pas le seul nombre de paramètres.',
    'Cliquez sur chacune des trois structures et inspectez la trajectoire sauvegardée avant d’arbitrer.',
    'Une bonne qualification associe plusieurs contrôles ; aucun score ne suffit isolément.',
    'Lisez la différence de BIC et la parcimonie sans présenter une petite différence comme décisive.',
    'Un effet retardé exige une hypothèse dynamique à estimer et à confronter aux données.',
    'Une conclusion robuste dépend des données effectivement ajustées et des diagnostics chiffrés.'
  ][index];
  $('population-hint-text').textContent=[
    'Le fichier source a DVID=1 pour PK, DVID=2 pour PCA et AMT pour la dose ; il ne possède pas EVID.',
    'L’échelle semi-log met souvent en évidence les phases terminales.',
    'Les tableaux ne révèlent les BIC qu’après examen de la structure correspondante.',
    'Contrôlez GOF, IIV, modèle résiduel, EBE, covariables, VPC et robustesse/identifiabilité.',
    'ΔBIC inférieur à 2 n’apporte pas ici d’argument discriminant solide.',
    'Le retard peut provenir d’une dynamique d’effet ou de turnover ; la courbe seule ne prouve rien.',
    'Séparez résultats du benchmark, structure suggérée et modèle non encore estimé sur la cohorte expérimentale.'
  ][index];
  [
    renderImport,renderEDA,renderSAEM,renderDiagnostics,renderDecision,renderPD,renderFinal
  ][index]();
  navigation();
}
function select(i){
  if(!canVisit(i,done,STEPS.length,isFree()))return;
  index=i;viewed=new Set();selectedFit='one';selectedChecks.clear();choice='';scale='linear';selectedSubject=1;render();
}
function success(message){
  if(!done.includes(index)){done=normalizeCompleted([...done,index],STEPS.length);store();}
  const el=$('population-feedback');el.hidden=false;el.classList.remove('error');
  el.innerHTML='<strong>Étape qualifiée</strong><p>'+escapeText(message)+'</p>';
  $('population-validate').disabled=true;
  $('population-next').hidden=index===STEPS.length-1;
  navigation();
}
function failure(message){
  const el=$('population-feedback');el.hidden=false;el.classList.add('error');
  el.innerHTML='<strong>À revoir</strong><p>'+escapeText(message)+'</p>';
}
function validate(){
  if(done.includes(index))return;
  const w=$('population-workspace');
  if(index===0){
    const values=Object.fromEntries([...w.querySelectorAll('[data-pk-map]')].map(x=>[x.dataset.pkMap,x.value]));
    return values.id==='id'&&values.time==='time'&&values.dose==='amt'&&values.concentration==='dv'&&values.event==='dvid'?success('Correspondance correcte des colonnes du fichier expérimental.'):failure('Vérifiez AMT, DV et DVID ; le CSV source ne contient pas EVID.');
  }
  if(index===2){
    return viewed.size===3?success('Trois calculs archivés ont été comparés. Les paramètres et BIC ne suffisent pas encore à valider le modèle.'):
      failure('Examinez les trois structures, pas seulement la première sélectionnée.');
  }
  if(index===3){
    const answers=Object.fromEntries(DIAG_QUESTIONS.map(q=>[q.key,w.querySelector('input[name="pop-diagnostic-'+q.key+'"]:checked')?.value]));
    return gradeDiagnosticQuestions(answers)?
      success('Six domaines examinés : GOF, résidus, IIV/covariables, RUV, VPC, stabilité et précision.'):
      failure('Répondez à chaque question, puis analysez les divergences entre graphiques et modèle.');
  }
  if(index===6){
    const answer=w.querySelector('input[name="pop-conclusion"]:checked')?.value;
    return answer==='conditional'?
      success('Conclusion conditionnelle justifiée par les comparaisons et par la disponibilité des diagnostics.'):
      failure('Ne généralisez pas au jeu expérimental les résultats estimés sur le replay distinct.');
  }
  const option=w.querySelector('input[name="pop-choice"]:checked')?.value;
  if(!option)return failure('Choisissez une conclusion avant de valider.');
  if(index===1)return option==='simple'?success('Un modèle de départ plausible n’est pas un modèle démontré.'):failure('Évitez de déduire une structure certaine d’une seule courbe.');
  if(index===4)return gradeStructureConclusion(option)?success('Le replay pédagogique ne distingue pas Tlag ; ces résultats ne concernent pas la cohorte expérimentale.'):failure('Une petite différence de BIC ne prouve pas qu’une structure est vraie.');
  if(index===5)return option==='delay'?success('Un modèle indirect ou à compartiment d’effet devra être ajusté et diagnostiqué.'):failure('La différence entre PK et PD ne démontre pas une relation instantanée.');
}
window.addEventListener('pmx-game-language-change',()=>{if(index===1)renderEDA();else if(index===6)renderFinal();});
$('population-validate').addEventListener('click',validate);
$('population-hint').addEventListener('click',()=>{$('population-hint-text').hidden=false;});
$('population-next').addEventListener('click',()=>select(isFree()?Math.min(STEPS.length-1,index+1):firstIncomplete(done,STEPS.length)));
$('population-reset').addEventListener('click',()=>{
  if(!confirm(document.documentElement.lang==='en'?'Reset the population PK steps in this browser?':'Réinitialiser les étapes pharmacométriques de ce navigateur ?'))return;
  done=[];store();select(0);
});
window.addEventListener('pmx-game-learning-mode',()=>{
  if(!canVisit(index,done,STEPS.length,isFree()))select(firstIncomplete(done,STEPS.length));
  else {navigation();$('population-next').hidden=index===STEPS.length-1||(!done.includes(index)&&!isFree());}
});
select(index);

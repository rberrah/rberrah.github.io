// PMx Game track 3: authentic published warfarin data; synthetic SAEM sandbox isolated.
// SAEM traces are real archived exploratory calculations (not runtime computation).
import {STUDY_META,STUDY_SUBJECTS,STUDY_PK,STUDY_PD} from './warfarin-study.js';
import {POPULATION_META,TIMES,SUBJECTS,OBSERVATIONS,FITS,VPC_OBSERVED,
  modelComparison,populationPredict,gradeStructureConclusion,assessMapping,chooseChecks} from './saem-replay.js';
const $=id=>document.getElementById(id);
const STEPS=[
  {title:'Données et colonnes',chapter:'Dossier source',desc:'Reconnaître les champs du jeu de données et vérifier doses, sujets et unités.'},
  {title:'Exploration',chapter:'EDA',desc:'Visualiser la variabilité et choisir des hypothèses structurales.'},
  {title:'Ajustements SAEM',chapter:'Estimation',desc:'Rejouer trois calculs de type SAEM réellement pré-enregistrés.'},
  {title:'Diagnostics complets',chapter:'Qualification PopPK',desc:'Explorer GOF, IIV, erreur résiduelle, covariables, VPC et stabilité avant de conclure.'},
  {title:'Arbitrage de modèle',chapter:'Sélection',desc:'Interpréter une différence de BIC faible, sans surconclure.'},
  {title:'Effet retardé',chapter:'PK → PD',desc:'Séparer la cinétique de la concentration de celle de la réponse.'},
  {title:'Rapport final',chapter:'Publication',desc:'Conclure avec limites, traçabilité et hypothèses.'}
];
const KEY='pmx-game-population-v3';
const read=()=>{
  try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(x)){
    const done=[];for(let i=0;i<STEPS.length;i++){if(x.includes(i))done.push(i);else break;}return done;
  }}catch{}return [];
};
let done=read(),index=Math.min(done.length,STEPS.length-1);
let choice='',selectedFit='one',viewed=new Set(),selectedSubject=1,scale='linear',selectedChecks=new Set();
let map={id:'',time:'',dose:'',concentration:'',event:''}, reportChecked=new Set(),reportText='';
const fmt=(v,n=2)=>Number(v).toLocaleString('fr-FR',{minimumFractionDigits:n,maximumFractionDigits:n});
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
function graph(el,{series=[],points=[],bands=[],maxT=168,ymax=20,log=false,target=null}={}){
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
  for(const dot of points){
    if(log&&dot.c<=0)continue;
    s+='<circle cx="'+xx(dot.t).toFixed(1)+'" cy="'+yy(dot.c).toFixed(1)+'" r="3.5" fill="'+(dot.color||'#f6cc93')+'" stroke="#17343b" stroke-width=".8"/>';
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
  const etaSD=sampleSD(fit.eta);
  return {omega,omegaCv:Math.sqrt(Math.expm1(omega*omega))*100,
    sigma,sigmaCv:Math.sqrt(Math.expm1(sigma*sigma))*100,
    etaSD,shrinkage:100*(1-etaSD/omega)};
}
function gaussianDensity(x,sd){
  return Math.exp(-x*x/(2*sd*sd))/(sd*Math.sqrt(2*Math.PI));
}
function plotIiv(el,eta,omega){
  const lo=-1,hi=1,bins=20,width=625,scaleX=x=>68+(x-lo)/(hi-lo)*width;
  const counts=Array(bins).fill(0);
  for(const v of eta)if(Number.isFinite(v))counts[Math.min(bins-1,Math.max(0,Math.floor((v-lo)/(hi-lo)*bins)))]++;
  const binWidth=(hi-lo)/bins;
  const hist=counts.map(x=>x/(eta.length*binWidth));
  const ymax=Math.max(...hist,gaussianDensity(0,omega))*1.15;
  const sy=v=>240-195*v/ymax;
  let svg='<rect x="68" y="42" width="625" height="198" rx="8" fill="#0c2530"/>'+
    '<path d="M68 '+sy(0)+' H693" stroke="#65868e"/>';
  for(let i=0;i<bins;i++){
    const x=scaleX(lo+i*binWidth),w=width/bins-2;
    svg+='<rect x="'+(x+1)+'" y="'+sy(hist[i])+'" width="'+w+
      '" height="'+(240-sy(hist[i]))+'" fill="#9be9cf" opacity=".68"/>';
  }
  const line=Array.from({length:141},(_,i)=>{
    const x=lo+(hi-lo)*i/140;return scaleX(x).toFixed(1)+','+sy(gaussianDensity(x,omega)).toFixed(1);
  });
  svg+='<polyline points="'+line.join(' ')+'" fill="none" stroke="#f6c28e" stroke-width="3"/>';
  for(let i=0;i<=4;i++){
    svg+='<text x="'+scaleX(lo+i*(hi-lo)/4)+'" y="262" fill="#c8ddd8" font-size="12" text-anchor="middle">'+(lo+i*(hi-lo)/4).toFixed(1)+'</text>';
  }
  el.innerHTML=svg+'<text x="68" y="23" fill="#c8ddd8" font-size="12">Densité des EBE ηCL (vert) et N(0, ωCL²) estimée (orange)</text>';
}
function plotResidualError(el,sigma){
  const maxC=25,ss=180,cx=68,cy=242;
  const x=v=>cx+625*v/maxC,y=v=>cy-190*v/(sigma*maxC*1.5);
  let svg='<rect x="68" y="36" width="625" height="206" rx="8" fill="#0c2530"/>';
  const line=Array.from({length:101},(_,i)=>{const c=maxC*i/100;return x(c).toFixed(1)+','+y(c*sigma).toFixed(1);});
  const alt=Array.from({length:101},(_,i)=>{const c=maxC*i/100;return x(c).toFixed(1)+','+y(10*sigma).toFixed(1);});
  svg+='<polyline points="'+line.join(' ')+'" fill="none" stroke="#9be9cf" stroke-width="3"/>'+
    '<polyline points="'+alt.join(' ')+'" fill="none" stroke="#f6c28e" stroke-width="2" stroke-dasharray="6 5"/>';
  for(let i=0;i<=5;i++)svg+='<text x="'+x(5*i)+'" y="263" text-anchor="middle" fill="#c8ddd8" font-size="11">'+5*i+'</text>';
  el.innerHTML=svg+'<text x="68" y="23" fill="#c8ddd8" font-size="12">Écart-type sur C (mg/L) ≈ σlog × prédiction (mg/L)</text>';
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
    const b=document.createElement('button');b.type='button';b.disabled=i>done.length;
    if(i===index)b.setAttribute('aria-current','step');
    const n=document.createElement('span');n.className='career-step-num';n.textContent=done.includes(i)?'✓':String(i+1);
    const title=document.createElement('span');title.textContent=step.title;
    const sub=document.createElement('small');sub.textContent=done.includes(i)?'Vérifiée':b.disabled?'Verrouillée':step.chapter;
    title.append(sub);b.append(n,title);b.addEventListener('click',()=>select(i));frag.append(b);
  });
  $('population-steps').replaceChildren(frag);
}
function report(){
  const cmp=modelComparison(),winner=cmp.find(x=>x.id==='lag'),base=cmp.find(x=>x.id==='one');
  return 'PMx Game — Dossier étude Warfarine et atelier distinct SAEM\n'+
    'ÉTUDE EXPÉRIMENTALE : '+STUDY_META.nSubjects+' volontaires, '+STUDY_META.nPK+' mesures PK et '+STUDY_META.nPD+' mesures PCA après dose orale unique de 1,5 mg/kg. Source : '+STUDY_META.sourceUrl+'\n'+
    'ATELIER DE MÉTHODE DISTINCT : replay de généralized-SAEM réalisé sur '+POPULATION_META.nSubjects+' sujets ARTIFICIELS avec '+POPULATION_META.nObservations+' concentrations générées ; aucun des BIC ci-après ne s’applique à la cohorte réelle.\n'+
    '1C sans Tlag BIC '+fmt(base.bic)+' ; 1C avec Tlag BIC '+fmt(winner.bic)+' ; 2C BIC '+fmt(cmp.find(x=>x.id==='two').bic)+'. ΔBIC faible et non conclusif.\n'+
    'Diagnostics du replay : DV/PRED, DV/IPRED, profils individuels, distribution et covariables de ηCL, IIV log-normale (ωCL), erreur résiduelle log-normale (σlog), résidus log-standardisés, QQ/histogrammes, VPC 120 réplications, trajectoires SAEM. Bilan explicite des contrôles non disponibles (CWRES, NPDE, RSE, bootstrap, IOV, diagnostics externes).\n'+
    'Les mesures PCA de l’étude réelle sont affichées, sans estimation du modèle PD.\n'+
    'À compléter : ajustement SAEM/FOCEi sur les 32 sujets réels, diagnostics et BIC recalculés, validation sur données indépendantes si applicable.\n'+
    'Ce rapport n’est pas une expertise clinique ni une recommandation thérapeutique.';
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

function renderEDA(){
  $('population-workspace').innerHTML=story('Explorez les <strong>mesures expérimentales</strong> de warfarine de l’étude : les sujets n’ont pas tous le même nombre d’échantillons ni les mêmes horaires. Une courbe descriptive ne suffit pas à identifier formellement une structure.','ÉTUDE RÉELLE · EXPLORATION GRAPHIQUE')+
    '<p class="career-note"><strong>Vue populationnelle :</strong> superposition des profils individuels réels de la cohorte (spaghetti plot). La dispersion exploratoire n’est pas encore une estimation de l’IIV.</p><svg id="pop-spaghetti" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Profils individuels des 32 volontaires, données réelles"></svg>'+ 
    '<div class="career-chart-toolbar"><button id="pop-linear" aria-pressed="true">Linéaire</button><button id="pop-log" aria-pressed="false">Semi-log</button><label>Sujet <select id="pop-subject">'+STUDY_SUBJECTS.map(p=>'<option value="'+p.id+'">S'+p.id+' · '+fmt(p.wt,1)+' kg</option>').join('')+'</select></label></div>'+
    '<svg id="pop-eda-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Concentrations expérimentales de warfarine, source Monolix"></svg>'+
    '<p class="career-note">Points = observations originales DVID=1, y compris les valeurs nulles à l’échelle linéaire. Les zéros sont exclus uniquement de l’axe logarithmique. Aucune courbe de modèle simulé n’est superposée aux observations réelles.</p>'+
    radio([['simple','Un modèle oral 1C est un candidat à ajuster et comparer : les observations seules ne prouvent pas sa structure.'],
      ['three','La pente terminale démontre exactement trois compartiments.'],
      ['fixed','La dispersion entre sujets prouve que tous les paramètres sont parfaitement identifiables.']]);
  function draw(){
    const all=STUDY_SUBJECTS.map(s=>STUDY_PK.filter(p=>p.id===s.id).sort((a,b)=>a.t-b.t));
    graph($('pop-spaghetti'),{series:all.map(values=>({values,color:'#9be9cf',opacity:.22,width:1.6})),maxT:120,ymax:Math.max(18,...STUDY_PK.map(p=>p.c))*1.08});
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

function renderSAEM(){
  const options=Object.entries(FITS).map(([id,f])=>'<button data-pop-model="'+id+'" aria-pressed="'+(id===selectedFit)+'">'+f.label+'</button>').join('');
  $('population-workspace').innerHTML=story('<strong>Attention : atelier de calcul distinct.</strong> Les résultats SAEM ci-dessous ont été obtenus sur une cohorte <strong>artificielle de 28 sujets</strong>, et non sur les 32 volontaires de l’étude originale. Trois structures sont candidates. Ces valeurs proviennent de <strong>170 itérations de démonstration enregistrées</strong> et non d’un algorithme tournant dans votre navigateur. Sélectionnez chaque modèle pour examiner sa trajectoire et les paramètres estimés.','ENQUÊTE N° 03 · REPLAY SAEM')+
    '<div class="career-model-buttons">'+options+'</div>'+
    '<div class="career-metrics">'+metric('Itérations enregistrées','170')+
    metric('Effets aléatoires','ηCL')+metric('Erreur','log-normale')+'</div>'+
    '<div class="career-chart-toolbar"><label>Paramètre <select id="pop-trace-param"></select></label><label>Itération du replay <input id="pop-iteration" type="range" min="0" max="8" value="8" step="1"></label><span id="pop-iteration-label" class="career-tag"></span></div>'+
    '<svg id="pop-trace" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Trajectoire CL et points réellement enregistrés du SAEM"></svg>'+
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
    const indexField=names.indexOf(traceField.value);
    const values=fit.trace.map(r=>({t:r[0],c:r[indexField+1]}));
    graph($('pop-trace'),{series:[{values,color:'#95f4d6'}],
      points:values.map(p=>({...p,color:'#f6c28e'})),maxT:170,ymax:Math.max(...values.map(p=>p.c)) * 1.12});
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
function renderDiagnostics(){
  $('population-workspace').innerHTML=story('Cette galerie de diagnostics porte <strong>uniquement sur le replay SAEM artificiel</strong> (28 sujets). Le dataset expérimental Warfarine présenté précédemment ne possède pas encore de résultats SAEM associés. Lisez GOF, résidus, EBE, simulation prédictive et convergence, puis jugez quelles preuves manquent.','ATELIER SAEM · DIAGNOSTICS DISPONIBLES')+
    '<div class="career-chart-toolbar"><label>Modèle <select id="pop-diagnostic-model">'+Object.entries(FITS).map(([k,v])=>'<option value="'+k+'">'+v.label+'</option>').join('')+'</select></label>'+
    '<label>Sujet <select id="pop-diagnostic-subject">'+SUBJECTS.map(s=>'<option value="'+s.id+'">S'+s.id+'</option>').join('')+'</select></label></div>'+
    '<details open><summary><strong>1. Ajustements individuels et GOF</strong></summary>'+
    '<p class="career-note">Points DV ; courbe bleu pâle PRED (population) ; courbe verte IPRED (EBE CL). Les deux GOF ci-dessous confrontent les valeurs observées aux prédictions ; ligne pointillée = identité.</p>'+
    '<svg id="pop-diagnostic-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Fit individuel DV, PRED et IPRED"></svg>'+
    '<p class="career-note">DV versus PRED (population)</p><svg id="pop-gof-pred" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Observed versus population predictions"></svg>'+
    '<p class="career-note">DV versus IPRED (individuel)</p><svg id="pop-gof-ipred" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Observed versus individual predictions"></svg></details>'+
    '<details open><summary><strong>2. Résidus et leur distribution</strong></summary>'+
    '<p class="career-note">Résidus conditionnels <em>approximatifs</em> : [log(DV) − log(IPRED)] / σlog. Ce ne sont <strong>ni des CWRES, ni des NPDE</strong> : les calculs correspondants ne sont pas disponibles.</p>'+
    '<p class="career-note">Résidus versus temps</p><svg id="pop-resid-time" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Résidus log-standardisés versus temps"></svg>'+
    '<p class="career-note">Résidus versus IPRED</p><svg id="pop-resid-pred" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Résidus log-standardisés versus prédiction individuelle"></svg>'+
    '<p class="career-note">Histogramme des résidus</p><svg id="pop-resid-hist" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Histogramme des résidus log-standardisés"></svg>'+
    '<p class="career-note">QQ-plot normal théorique</p><svg id="pop-resid-qq" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="QQ-plot des résidus"></svg></details>'+
    '<details open><summary><strong>3. Variabilité interindividuelle (IIV), EBE et shrinkage</strong></summary>'+
    '<p class="career-note">ETA_CL versus poids (sans conclure à une covariable à partir du seul graphe)</p><svg id="pop-eta-weight" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="ETA CL versus poids"></svg>'+
    '<p class="career-note">Distribution des ETA_CL</p><svg id="pop-eta-hist" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Histogramme ETA CL"></svg>'+ 
    '<div id="pop-variability-metrics" class="career-metrics"></div>'+ 
    '<p class="career-note">Comparaison de la distribution des EBE de CL et de la loi N(0,ωCL²) retenue pour la population. Le shrinkage descriptif = 1 − SD(EBE)/ωCL ; il ne valide ni l’IIV ni le mécanisme. Seule CL porte un effet aléatoire dans cet atelier ; V, Ka, Q, Vp et Tlag n’ont pas d’IIV estimée.</p>'+ 
    '<svg id="pop-iiv-density" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Densité des effets individuels et distribution normale populationnelle"></svg>'+ 
    '<p class="career-note">Recherche exploratoire de covariables : ETA_CL en fonction du poids, montré ci-dessus. Attention : le poids détermine également la dose dans cette simulation ; association visuelle ≠ sélection statistique ou causalité. Pour une véritable analyse : graphique ETA/covariable, sélection prudente, réestimation du modèle complet, IC, pertinence clinique et vérification hors échantillon.</p></details>'+ 
    '<details open><summary><strong>4. Modèle d’erreur résiduelle (RUV)</strong></summary>'+ 
    '<p class="career-note">Le replay est ajusté avec log(DV) = log(IPRED) + ε, ε ~ N(0,σlog²). Le modèle implique une erreur approximativement proportionnelle sur l’échelle de concentration. Aucun modèle additif ou combiné n’a été estimé ; la ligne pointillée est une erreur additive théorique normalisée à 10 mg/L uniquement pour illustrer la différence de forme.</p>'+ 
    '<div id="pop-ruv-metrics" class="career-metrics"></div>'+ 
    '<svg id="pop-ruv-shape" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Erreur résiduelle lognormale versus concentration, comparateur additif pédagogique"></svg>'+ 
    '<p class="career-note"><span style="color:#9be9cf">━</span> Approximation σlog × IPRED du modèle de démonstration ; <span style="color:#f6c28e">┄</span> forme additive théorique, non ajustée. La comparaison formelle de RUV additif, proportionnel, combiné, et la dépendance des résidus à l’heure/dose restent nécessaires dans un vrai projet.</p></details>'+
    '<details open><summary><strong>5. VPC : P5 / P50 / P95 et incertitude</strong></summary>'+
    '<p class="career-note">VPC <strong>simulé de nouveau</strong> par 120 réplications déterministes sous le modèle sélectionné, aux mêmes temps/sujets que le replay. Chaque courbe = médiane des quantiles simulés ; zone transparente = intervalle empirique 5–95 % entre les réplications. Points = quantiles observés dans la cohorte artificielle. Pas de correction pcVPC, ni bootstrap de paramètres.</p>'+
    '<svg id="pop-vpc" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="VPC observé vs simulé, 5e 50e et 95e centiles avec intervalle de simulation"></svg>'+
    '<p class="career-note"><span style="color:#f6c28e">●</span> P5 observé ; <span style="color:#9be9cf">●</span> P50 observé ; <span style="color:#c8a6f5">●</span> P95 observé. Bandes de la même couleur = distribution simulée de ce quantile.</p></details>'+
    '<details open><summary><strong>6. Stabilité, précision, identifiabilité et validation</strong></summary>'+ 
    '<p class="career-note">Séquence du pharmacométricien : contrôle des données et BLQ → modèle structural → choix des effets aléatoires (IIV/IOV, corrélations Ω) et du modèle résiduel (additif/proportionnel/combiné) → choix des covariables → estimation / convergence → GOF et diagnostics individuels → VPC/pcVPC/NPDE → précision (RSE/IC, bootstrap), shrinkage, sensibilité et validation externe → décision documentée.</p>'+ 
    '<div class="career-alert"><strong>Non disponibles pour ce replay :</strong> CWRES exacts, NPDE, pcVPC, RSE et matrice de covariance, corrélations entre effets aléatoires (une seule η), IOV, bootstrap, simulation-estimation, analyse de sensibilité, départs multiples, prédictions externes. Ne pas tracer de valeurs fictives à la place de diagnostics statistiques non calculés. Le shrinkage descriptif EBE/ω est visible mais ne remplace pas les évaluations de précision.</div></details>'+
    '<p class="career-note">Quels contrôles conserver pour qualifier un modèle ?</p>'+
    checkboxes([['gof','Examiner DV/PRED, DV/IPRED et résidus.'],
      ['vpc','Examiner P5/P50/P95 et leurs distributions simulées.'],
      ['stability','Vérifier stabilité numérique, précision, identifiabilité et validation externe si pertinente.'],
      ['bic-only','Conclure uniquement à partir du BIC.']]);
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
    $('pop-variability-metrics').innerHTML=metric('ωCL (SD sur log CL)',fmt(v.omega,3))+metric('IIV CL (CV lognormale)',fmt(v.omegaCv,1)+' %')+metric('SD des EBE CL',fmt(v.etaSD,3))+metric('Shrinkage descriptif',fmt(v.shrinkage,1)+' %');
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
function renderDecision(){
  $('population-workspace').innerHTML=story('Vous disposez des BIC de l’atelier SAEM sur cohorte artificielle, indépendamment des 32 volontaires de l’étude expérimentale. Ce replay ne qualifie pas le modèle pour les données réelles. Formulez une conclusion défendable pour une étude exploratoire.','ENQUÊTE N° 05 · DÉCISION ARGUMENTÉE')+
    '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Modèle</th><th>BIC approximatif</th><th>ΔBIC</th><th>Paramètres libres</th></tr></thead><tbody>'+
    modelComparison().map(x=>'<tr><td>'+x.label+'</td><td>'+fmt(x.bic)+'</td><td>'+fmt(x.deltaBic)+'</td><td>'+x.parameters+'</td></tr>').join('')+
    '</tbody></table></div>'+
    radio([['lag-proved','Le 1C avec Tlag est démontré meilleur : ΔBIC = 0,23 suffit pour conclure.'],
      ['equivocal','1C ± Tlag restent presque équivalents ; le modèle 2C est moins soutenu. Il faut confirmer par stabilité et diagnostics.'],
      ['two-certain','Le 2C doit être retenu car il possède le plus grand nombre de paramètres.']]);
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
  $('population-workspace').innerHTML=story('Rédigez un résultat qui distingue les données, le modèle candidat, les diagnostics et ce qui reste non démontré. Votre dossier peut être copié comme exercice de synthèse.','ENQUÊTE N° 07 · RAPPORT FINAL')+
    '<p class="career-note">Cochez les informations que le rapport de pharmacométrie doit conserver.</p>'+
    checkboxes([['data','Citer les observations expérimentales 32 sujets (PK/PCA) et distinguer l’atelier SAEM artificiel.'],
      ['inference','Signaler les limites du SAEM éducatif, du BIC et de l’identifiabilité.'],
      ['pd','Préciser que le lien PK/PD retardé n’a pas été ajusté sur ce jeu de données.'],
      ['clinical','Présenter les estimations comme utilisables pour prescrire de la warfarine.']],'pop-final')+
    '<pre id="pop-report" class="career-code">'+escapeText(report())+'</pre>'+
    '<div class="career-file-actions"><button type="button" class="career-action" id="pop-copy-report">Copier le rapport pédagogique</button>'+
    '<a href="'+POPULATION_META.tutorialUrl+'" target="_blank" rel="noopener noreferrer" class="career-action">Tutoriel de référence</a></div>';
  $('pop-copy-report').addEventListener('click',()=>navigator.clipboard?.writeText(report()));
}
function render(){
  const step=STEPS[index];selectedFit='one';
  $('population-chapter').textContent=step.chapter;
  $('population-level').textContent='Étape '+(index+1)+' / '+STEPS.length;
  $('population-title').textContent=step.title;
  $('population-description').textContent=step.desc;
  $('population-feedback').hidden=true;
  $('population-next').hidden=!done.includes(index)||index===STEPS.length-1;
  $('population-validate').disabled=done.includes(index);
  $('population-hint-text').hidden=true;
  $('population-help').textContent=[
    'Associez chaque colonne au bon rôle avant d’autoriser les estimations.',
    'Utilisez l’échelle et les observations, pas le seul nombre de paramètres.',
    'Cliquez sur chacune des trois structures et inspectez la trajectoire sauvegardée avant d’arbitrer.',
    'Une bonne qualification associe plusieurs contrôles ; aucun score ne suffit isolément.',
    'Lisez la différence de BIC et la parcimonie sans présenter une petite différence comme décisive.',
    'Un effet retardé exige une hypothèse dynamique à estimer et à confronter aux données.',
    'Le rapport doit mentionner ce que le travail ne démontre pas.'
  ][index];
  $('population-hint-text').textContent=[
    'Le fichier source a DVID=1 pour PK, DVID=2 pour PCA et AMT pour la dose ; il ne possède pas EVID.',
    'L’échelle semi-log met souvent en évidence les phases terminales.',
    'Les tableaux ne révèlent les BIC qu’après examen de la structure correspondante.',
    'Contrôlez GOF, IIV, modèle résiduel, EBE, covariables, VPC et robustesse/identifiabilité.',
    'ΔBIC inférieur à 2 n’apporte pas ici d’argument discriminant solide.',
    'Le retard peut provenir d’une dynamique d’effet ou de turnover ; la courbe seule ne prouve rien.',
    'Les observations viennent de l’étude O’Reilly, mais les estimations archivées sont issues d’une simulation distincte.'
  ][index];
  [
    renderImport,renderEDA,renderSAEM,renderDiagnostics,renderDecision,renderPD,renderFinal
  ][index]();
  navigation();
}
function select(i){
  if(i>done.length||i<0||i>=STEPS.length)return;
  index=i;viewed=new Set();selectedFit='one';selectedChecks.clear();choice='';scale='linear';selectedSubject=1;render();
}
function success(message){
  if(!done.includes(index)&&index===done.length){done.push(index);store();}
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
  if(index===3 || index===6){
    const inputs=[...w.querySelectorAll('input[type=checkbox]:checked')].map(el=>el.value);
    if(index===3)return chooseChecks(inputs)?success('GOF, VPC et stabilité restent complémentaires.'):failure('Sélectionnez les contrôles utiles, sans retenir « BIC seul ».');
    return inputs.length===3&&['data','inference','pd'].every(x=>inputs.includes(x))?
      success('Le rapport décrit la source, les résultats exploratoires et leurs limites.'):failure('Distinguez mesures expérimentales, replay SAEM sur cohorte artificielle, limites du modèle et PD non estimée.');
  }
  const option=w.querySelector('input[name="pop-choice"]:checked')?.value;
  if(!option)return failure('Choisissez une conclusion avant de valider.');
  if(index===1)return option==='simple'?success('Un modèle de départ plausible n’est pas un modèle démontré.'):failure('Évitez de déduire une structure certaine d’une seule courbe.');
  if(index===4)return gradeStructureConclusion(option)?success('Le replay pédagogique ne distingue pas Tlag ; ces résultats ne concernent pas la cohorte expérimentale.'):failure('Une petite différence de BIC ne prouve pas qu’une structure est vraie.');
  if(index===5)return option==='delay'?success('Un modèle indirect ou à compartiment d’effet devra être ajusté et diagnostiqué.'):failure('La différence entre PK et PD ne démontre pas une relation instantanée.');
}
$('population-validate').addEventListener('click',validate);
$('population-hint').addEventListener('click',()=>{$('population-hint-text').hidden=false;});
$('population-next').addEventListener('click',()=>select(Math.min(STEPS.length-1,index+1)));
$('population-reset').addEventListener('click',()=>{
  if(!confirm('Réinitialiser les étapes pharmacométriques de ce navigateur ?'))return;
  done=[];store();select(0);
});
select(index);

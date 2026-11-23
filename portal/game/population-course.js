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
  {title:'Diagnostics',chapter:'Qualification',desc:'Lire les ajustements individuels, le VPC et la stabilité.'},
  {title:'Arbitrage de modèle',chapter:'Sélection',desc:'Interpréter une différence de BIC faible, sans surconclure.'},
  {title:'Effet retardé',chapter:'PK → PD',desc:'Séparer la cinétique de la concentration de celle de la réponse.'},
  {title:'Rapport final',chapter:'Publication',desc:'Conclure avec limites, traçabilité et hypothèses.'}
];
const KEY='pmx-game-population-v1';
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
function graph(el,{series=[],points=[],maxT=168,ymax=20,log=false,target=null}={}){
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
    'Diagnostics illustrés sur le replay : DV/PRED, DV/IPRED, résidus conditionnels standardisés sur log(C), histogramme et QQ, ETA_CL, profils individuels et VPC avec 120 réplications. Pas de CWRES/NPDE ni d’identifiabilité numérique validée.\n'+
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
    '<div class="career-file-actions"><a class="career-action" href="/downloads/warfarin/warfarin_data.csv" target="_blank" rel="noopener">Consulter les données de l’étude</a>'+
    '<a class="career-action" href="'+STUDY_META.sourceUrl+'" target="_blank" rel="noopener">Documentation de la source</a></div>';
  $('population-workspace').querySelectorAll('[data-pk-map]').forEach(el=>el.addEventListener('change',e=>{
    map[e.target.dataset.pkMap]=e.target.value;
  }));
}

function renderEDA(){
  $('population-workspace').innerHTML=story('Explorez les <strong>mesures expérimentales</strong> de warfarine de l’étude : les sujets n’ont pas tous le même nombre d’échantillons ni les mêmes horaires. Une courbe descriptive ne suffit pas à identifier formellement une structure.','ÉTUDE RÉELLE · EXPLORATION GRAPHIQUE')+
    '<div class="career-chart-toolbar"><button id="pop-linear" aria-pressed="true">Linéaire</button><button id="pop-log" aria-pressed="false">Semi-log</button><label>Sujet <select id="pop-subject">'+STUDY_SUBJECTS.map(p=>'<option value="'+p.id+'">S'+p.id+' · '+fmt(p.wt,1)+' kg</option>').join('')+'</select></label></div>'+
    '<svg id="pop-eda-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Concentrations expérimentales de warfarine, source Monolix"></svg>'+
    '<p class="career-note">Points = observations originales DVID=1, y compris les valeurs nulles à l’échelle linéaire. Les zéros sont exclus uniquement de l’axe logarithmique. Aucune courbe de modèle simulé n’est superposée aux observations réelles.</p>'+
    radio([['simple','Un modèle oral 1C est un candidat à ajuster et comparer : les observations seules ne prouvent pas sa structure.'],
      ['three','La pente terminale démontre exactement trois compartiments.'],
      ['fixed','La dispersion entre sujets prouve que tous les paramètres sont parfaitement identifiables.']]);
  function draw(){
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
  $('population-workspace').innerHTML=story('Avant d’accepter un modèle, confrontez prédictions et observations. La trajectoire SAEM ne remplace pas les diagnostics. Voici une simulation pédagogique de quantiles (120 réplications, sans bande de confiance bootstrap) et un exemple d’ajustement individuel.','ENQUÊTE N° 04 · GOF ET VPC')+
    '<div class="career-chart-toolbar"><label>Modèle <select id="pop-diagnostic-model">'+Object.entries(FITS).map(([k,v])=>'<option value="'+k+'">'+v.label+'</option>').join('')+'</select></label>'+
    '<label>Sujet <select id="pop-diagnostic-subject">'+SUBJECTS.slice(0,12).map(s=>'<option value="'+s.id+'">S'+s.id+'</option>').join('')+'</select></label></div>'+
    '<p class="career-note"><strong>Profil individuel :</strong> points mesurés, courbe population et courbe conditionnelle d’après l’effet aléatoire CL estimé (EBE).</p>'+
    '<svg id="pop-diagnostic-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Observations versus prédictions population et individuelles"></svg>'+
    '<p class="career-note"><strong>Contrôle prédictif :</strong> médiane observée (points oranges) et médiane simulée (courbe verte), regroupées par temps de prélèvement. Les quantiles externes et leurs incertitudes ne sont pas des garanties d’identifiabilité.</p>'+
    '<svg id="pop-vpc" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="VPC pédagogique, médianes empiriques observées et simulées"></svg>'+
    '<p class="career-note">Cochez les vérifications indispensables au rapport, sans vous limiter à une métrique unique.</p>'+
    checkboxes([['gof','Examiner PRED/IPRED vs concentrations observées et les résidus.'],
      ['vpc','Examiner un contrôle prédictif sur la fenêtre de prélèvement.'],
      ['stability','Évaluer stabilité numérique, départs multiples, précision et identifiabilité.'],
      ['bic-only','S’arrêter au seul BIC sans examen graphique.']]);
  const draw=()=>{
    const kind=$('pop-diagnostic-model').value,id=+$('pop-diagnostic-subject').value;
    const subj=SUBJECTS[id-1],fit=FITS[kind];
    const curves=Array.from({length:105},(_,i)=>{
      const t=i*168/104;return {t,c:populationPredict(kind,t,subj.dose)};
    });
    const ipred=curves.map(p=>({t:p.t,c:populationPredict(kind,p.t,subj.dose,fit.eta[id-1])}));
    const obs=OBSERVATIONS.filter(x=>x.id===id);
    graph($('pop-diagnostic-chart'),{series:[{values:curves,color:'#6dbcb8',width:2},{values:ipred,color:'#a9e8bc',width:3.5}],
      points:obs,log:false,ymax:Math.max(19,...obs.map(x=>x.c))*1.12});
    const sim=TIMES.map((t,i)=>({t,c:fit.simMedian[i]}));
    const med=TIMES.map((t,i)=>({t,c:VPC_OBSERVED[i][2],color:'#f3c089'}));
    graph($('pop-vpc'),{series:[{values:sim,color:'#9be9cf'}],points:med,log:false,ymax:18});
  };
  $('pop-diagnostic-model').value='lag';
  $('pop-diagnostic-model').addEventListener('change',draw);
  $('pop-diagnostic-subject').addEventListener('change',draw);
  draw();
}
function renderDecision(){
  $('population-workspace').innerHTML=story('Vous disposez des BIC marginals du replay, des profils de concentration et de diagnostics limités. Formulez une conclusion défendable pour une étude exploratoire.','ENQUÊTE N° 05 · DÉCISION ARGUMENTÉE')+
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
    'GOF + VPC + robustesse/identifiabilité sont complémentaires.',
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

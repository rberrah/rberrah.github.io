// PMx Game track 3: complete synthetic PopPK workflow.
// SAEM traces are real archived exploratory calculations (not runtime computation).
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
let map={id:'',time:'',dose:'',concentration:''}, reportChecked=new Set(),reportText='';
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
  return 'PMx Game — Rapport exploratoire PopPK (données synthétiques)\n'+
    '28 sujets, 285 concentrations simulées après dose orale unique 1,5 mg/kg.\n'+
    'Trois modèles PK évalués par generalized-SAEM de démonstration, ηCL lognormal, résidu lognormal ; 170 itérations enregistrées.\n'+
    '1C sans Tlag : BIC '+fmt(base.bic)+' ; 1C avec Tlag : BIC '+fmt(winner.bic)+
    ' ; 2C sans Tlag : BIC '+fmt(cmp.find(x=>x.id==='two').bic)+'.\n'+
    'ΔBIC 1C avec vs sans Tlag = '+fmt(base.bic-winner.bic)+' : aucune distinction probante entre ces deux hypothèses.\n'+
    'Une complexification vers 2C n’est pas soutenue par cet indicateur sur ce scénario synthétique.\n'+
    'PK/PD : réponse retardée de type turnover seulement illustrée, paramètres PD NON estimés.\n'+
    'Limites : données générées, SAEM généralisé non qualifié, BIC marginal numérique approximatif, VPC synthétique, absence de validation externe.\n'+
    'Référence pédagogique : '+POPULATION_META.tutorialUrl+'\n'+
    'Ce rapport n’est pas une expertise clinique ni une analyse de données de patients.';
}
function renderImport(){
  // Dose events and concentration observations are distinct NONMEM-style rows.
  const first=SUBJECTS[0];
  const obs=OBSERVATIONS.filter(x=>x.id===first.id).slice(0,4);
  const rows=[{id:first.id,t:0,amt:first.dose,dv:'—',evid:1},
    ...obs.map(o=>({id:o.id,t:o.t,amt:0,dv:fmt(o.c,2),evid:0}))];
  $('population-workspace').innerHTML=story('Votre service reçoit des concentrations après une dose orale unique. Avant tout SAEM, identifiez les champs <strong>patient, temps, administration, observation et type d’événement</strong>. Une ligne de dose n’est pas une concentration et une concentration ne doit pas déclencher une nouvelle dose.','DOSSIER N° 01 · CONTRÔLE QUALITÉ')+
    '<div class="career-metrics">'+metric('Sujets',POPULATION_META.nSubjects)+metric('Concentrations',POPULATION_META.nObservations)+metric('Événements de dose',SUBJECTS.length)+'</div>'+
    '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Colonne A</th><th>Colonne B</th><th>Colonne C</th><th>Colonne D</th><th>Colonne E</th></tr></thead><tbody>'+
    rows.map(p=>'<tr><td>'+p.id+'</td><td>'+fmt(p.t,1)+'</td><td>'+fmt(p.amt,1)+'</td><td>'+p.dv+'</td><td>'+p.evid+'</td></tr>').join('')+
    '</tbody></table></div>'+
    '<p class="career-note">Ligne EVID=1 : AMT contient la dose, DV est absente. Ligne EVID=0 : AMT=0, DV contient une concentration en mg/L. La dose initiale est 1,5 mg/kg et chaque sujet n’est administré qu’une fois.</p>'+
    '<div class="career-field-grid">'+[['id','A'],['time','B'],['dose','C'],['concentration','D'],['event','E']].map(([key,col])=>
      '<label>Colonne '+col+'<select data-pk-map="'+key+'">'+
      '<option value="">Associer un champ…</option>'+
      [['dv','Observation (DV)'],['evid','Type d’événement (EVID)'],['dose','Dose (AMT)'],['time','Temps (TIME)'],['id','Identifiant (ID)']].map(([v,label])=>
        '<option value="'+v+'">'+label+'</option>').join('')+'</select></label>'
    ).join('')+'</div>';
  $('population-workspace').querySelectorAll('[data-pk-map]').forEach(el=>el.addEventListener('change',e=>{
    map[e.target.dataset.pkMap]=e.target.value;
  }));
}
function renderEDA(){
  $('population-workspace').innerHTML=story('Les mêmes données apparaissent très différentes selon l’échelle et les temps de prélèvement. Explorez plusieurs sujets, puis proposez une <strong>hypothèse structurale de départ</strong> sans prétendre l’avoir identifiée.','ENQUÊTE N° 02 · DESSIN DES COURBES')+
    '<div class="career-chart-toolbar"><button id="pop-linear" aria-pressed="true">Linéaire</button><button id="pop-log" aria-pressed="false">Semi-log</button><label>Sujet <select id="pop-subject">'+SUBJECTS.slice(0,7).map(s=>'<option value="'+s.id+'">S'+s.id+' · '+fmt(s.wt,1)+' kg</option>').join('')+'</select></label></div>'+
    '<svg id="pop-eda-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Concentrations individuelles sur échelle linéaire ou semi-logarithmique"></svg>'+
    '<p class="career-note">Points = données observées (fictives). Courbe claire = profil de population de référence non ajusté au patient. Les données précoces sont volontairement inégales selon les sujets.</p>'+
    radio([['simple','Un modèle oral 1C linéaire est un candidat de départ ; il faudra le comparer à d’autres.'],
      ['three','La pente terminale suffit à démontrer exactement trois compartiments.'],
      ['fixed','Le même profil suffit à déterminer tous les effets individuels sans estimation.']]);
  function draw(){
    $('pop-linear').setAttribute('aria-pressed',String(scale==='linear'));
    $('pop-log').setAttribute('aria-pressed',String(scale==='log'));
    const s=SUBJECTS[selectedSubject-1],obs=OBSERVATIONS.filter(o=>o.id===selectedSubject);
    graph($('pop-eda-chart'),{series:[{values:Array.from({length:105},(_,i)=>{
      const t=i*168/104;return {t,c:populationPredict('one',t,s.dose)};
    }),opacity:.75}],points:obs,log:scale==='log',ymax:Math.max(18,...obs.map(o=>o.c))*1.17});
  }
  $('pop-linear').addEventListener('click',()=>{scale='linear';draw();});
  $('pop-log').addEventListener('click',()=>{scale='log';draw();});
  $('pop-subject').value=String(selectedSubject);
  $('pop-subject').addEventListener('change',e=>{selectedSubject=+e.target.value;draw();});
  draw();
}
function renderSAEM(){
  const options=Object.entries(FITS).map(([id,f])=>'<button data-pop-model="'+id+'" aria-pressed="'+(id===selectedFit)+'">'+f.label+'</button>').join('');
  $('population-workspace').innerHTML=story('Trois structures sont candidates. Les valeurs ci-dessous proviennent de <strong>170 itérations de calcul scientifique enregistrées</strong> et non d’un algorithme tournant dans votre navigateur. Sélectionnez chaque modèle pour examiner sa trajectoire et les paramètres estimés.','ENQUÊTE N° 03 · REPLAY SAEM')+
    '<div class="career-model-buttons">'+options+'</div>'+
    '<div class="career-metrics">'+metric('Itérations enregistrées','170')+
    metric('Effets aléatoires','ηCL')+metric('Erreur','log-normale')+'</div>'+
    '<div class="career-chart-toolbar"><label>Itération du replay <input id="pop-iteration" type="range" min="0" max="8" value="8" step="1"></label><span id="pop-iteration-label" class="career-tag"></span></div>'+
    '<svg id="pop-trace" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Trajectoire CL et points réellement enregistrés du SAEM"></svg>'+
    '<div id="pop-fit-summary" class="career-metrics"></div>'+
    '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Structure</th><th>−2LL approx.</th><th>BIC approx.</th><th>ΔBIC</th><th>Statut</th></tr></thead><tbody id="pop-fit-rows"></tbody></table></div>'+
    '<p class="career-note"><strong>Méthode :</strong> ηCL simulé par Metropolis, approximation stochastique et M-step numérique conditionnelle. BIC calculé ensuite par quadrature marginale 1D (161 nœuds). L’animation est un replay, sans optimisation dans le navigateur. Un BIC faible n’est pas une preuve mécanistique.</p>';
  function redraw(){
    const fit=FITS[selectedFit],timeIndex=+$('pop-iteration').value;
    const keys=selectedFit==='one'?['CL','V','Ka','omegaCL','sigmaLog']:selectedFit==='lag'?['CL','V','Ka','Tlag','omegaCL','sigmaLog']:['CL','Vc','Ka','Q','Vp','omegaCL','sigmaLog'];
    const rr=fit.trace[timeIndex];
    $('pop-iteration-label').textContent='Itération '+rr[0]+' / 170';
    const points=fit.trace.map(r=>({t:r[0],c:r[1]}));
    graph($('pop-trace'),{series:[{values:points,color:'#95f4d6'}],points:points.map(p=>({...p,color:'#f6c28e'})),maxT:170,ymax:.32});
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
function simulatedPca(){
  // Toy indirect response; NOT fit to the recorded SAEM PK, not patient PCA.
  const dose=110,kout=.035,ec50=6,emax=.65,step=.15;
  let pca=100;const points=[];
  for(let n=0;n<=Math.round(192/step);n++){
    const t=n*step;
    if(n%10===0)points.push({t,c:pca});
    const c=populationPredict('lag',t,dose);
    const target=100*(1-emax*c/(ec50+c));
    pca+=step*kout*(target-pca);
  }
  return points;
}
function renderPD(){
  $('population-workspace').innerHTML=story('La warfarine illustre la nécessité de distinguer exposition plasmatique et réponse anticoagulante. Dans ce <strong>exemple PD entièrement fictif</strong>, la réponse est retardée : la concentration peut déjà diminuer tandis que l’activité du complexe prothrombinique (PCA) continue de changer. Aucun SAEM PD n’a été réalisé pour cette étape.','ENQUÊTE N° 06 · MÉCANISME PK/PD')+
    '<div class="career-metrics">'+metric('Données PK','Ajustées')+metric('PCA simulée','Illustrative')+metric('PD estimée','Non')+'</div>'+
    '<svg id="pop-pd-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Réponse PCA synthétique retardée après concentration plasmatique"></svg>'+
    '<p class="career-note">PCA (%) illustrée ci-dessus selon une équation de turnover hypothétique. Le véritable exercice Monolix compare notamment modèles à compartiment d’effet et modèles de turnover ; notre graphique n’est pas une reconstruction de ses estimations.</p>'+
    radio([['instant','Une relation concentration→effet instantanée suffit nécessairement à reproduire ce délai.'],
      ['delay','Une dynamique indirecte (turnover) ou un compartiment d’effet doit être envisagé et ajusté aux données PD.'],
      ['proved','La courbe illustre et prouve le mécanisme biologique réel chez l’humain.']]);
  graph($('pop-pd-chart'),{series:[{values:simulatedPca(),color:'#9bedd6'}],maxT:192,ymax:110});
}
function renderFinal(){
  $('population-workspace').innerHTML=story('Rédigez un résultat qui distingue les données, le modèle candidat, les diagnostics et ce qui reste non démontré. Votre dossier peut être copié comme exercice de synthèse.','ENQUÊTE N° 07 · RAPPORT FINAL')+
    '<p class="career-note">Cochez les informations que le rapport de pharmacométrie doit conserver.</p>'+
    checkboxes([['data','Préciser que toutes les observations du jeu sont synthétiques.'],
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
    'La colonne A se répète pour un même sujet ; les doses correspondent à 1,5 mg/kg.',
    'L’échelle semi-log met souvent en évidence les phases terminales.',
    'Les tableaux ne révèlent les BIC qu’après examen de la structure correspondante.',
    'GOF + VPC + robustesse/identifiabilité sont complémentaires.',
    'ΔBIC inférieur à 2 n’apporte pas ici d’argument discriminant solide.',
    'Le retard peut provenir d’une dynamique d’effet ou de turnover ; la courbe seule ne prouve rien.',
    'Le jeu ne possède ni observations patients, ni validation clinique.'
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
    return assessMapping(values)?success('La structure des colonnes est correcte. Vous pouvez passer à l’exploration.'):failure('Revenez aux définitions de sujet, temps, dose et concentration.');
  }
  if(index===2){
    return viewed.size===3?success('Trois calculs archivés ont été comparés. Les paramètres et BIC ne suffisent pas encore à valider le modèle.'):
      failure('Examinez les trois structures, pas seulement la première sélectionnée.');
  }
  if(index===3 || index===6){
    const inputs=[...w.querySelectorAll('input[type=checkbox]:checked')].map(el=>el.value);
    if(index===3)return chooseChecks(inputs)?success('GOF, VPC et stabilité restent complémentaires.'):failure('Sélectionnez les contrôles utiles, sans retenir « BIC seul ».');
    return inputs.length===3&&['data','inference','pd'].every(x=>inputs.includes(x))?
      success('Le rapport décrit la source, les résultats exploratoires et leurs limites.'):failure('Le rapport doit rappeler la provenance synthétique, l’incertitude et la PD non estimée.');
  }
  const option=w.querySelector('input[name="pop-choice"]:checked')?.value;
  if(!option)return failure('Choisissez une conclusion avant de valider.');
  if(index===1)return option==='simple'?success('Un modèle de départ plausible n’est pas un modèle démontré.'):failure('Évitez de déduire une structure certaine d’une seule courbe.');
  if(index===4)return gradeStructureConclusion(option)?success('Les données ne distinguent pas clairement Tlag ; le 2C est pénalisé.'):failure('Une petite différence de BIC ne prouve pas qu’une structure est vraie.');
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

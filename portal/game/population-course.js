// PMx Game track 3: real historic warfarin study + actually executed nlmixr2-SAEM notebook results.
// SAEM traces are real archived exploratory calculations (not runtime computation).
import {POPULATION_META,TIMES,SUBJECTS,OBSERVATIONS,PD_OBSERVATIONS,FITS,ADVANCED_FITS,FINAL_FIT,
  modelComparison,populationPredict,gradeStructureConclusion,assessMapping,chooseChecks} from './saem-replay.js';
import {WARFARIN_ROWS} from './warfarin-study.js';
import {DIAGNOSTIC_OPTIONS,drawDiagnostic,diagnosticsSummary} from './warfarin-diagnostics.js';
import {NATIVE_GOF} from './warfarin-native-gof.js';
const $=id=>document.getElementById(id);
const STEPS=[
  {title:'Données et colonnes',chapter:'Dossier source',desc:'Identifier doses, concentrations et PCA dans le vrai jeu historique de warfarine.'},
  {title:'Exploration',chapter:'EDA',desc:'Visualiser la variabilité et choisir des hypothèses structurales.'},
  {title:'Ajustements SAEM',chapter:'Estimation',desc:'Comparer les résultats SAEM archivés dans le notebook nlmixr2 du site.'},
  {title:'Diagnostics',chapter:'Qualification',desc:'Explorer les diagnostics PK, les résidus, la distribution des effets et la PCA.'},
  {title:'Arbitrage de modèle',chapter:'Sélection',desc:'Comparer BIC sur les mêmes observations, examiner la complexité et les limites.'},
  {title:'Effet retardé',chapter:'PK → PD',desc:'Explorer les vraies concentrations et les vraies PCA observées.'},
  {title:'Rapport final',chapter:'Publication',desc:'Conclure avec limites, traçabilité et hypothèses.'}
];
const KEY='pmx-game-population-v1';
const read=()=>{
  try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(x)){
    const done=[];for(let i=0;i<STEPS.length;i++){if(x.includes(i))done.push(i);else break;}return done;
  }}catch{}return [];
};
let done=read(),index=Math.min(done.length,STEPS.length-1);
let choice='',selectedFit='one',viewed=new Set(),selectedSubject=SUBJECTS[0].id,scale='linear',selectedChecks=new Set();
let diagnosticKey='gof-pred';
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
 const c=modelComparison(),fit=ADVANCED_FITS.covariate;
 return 'PMx Game — Rapport de pharmacométrie, warfarine (données historiques réelles)\n'+
  'Source : O’Reilly 1963/1968 ; fichier conservé dans course_source/warfarin/warfarin_data.csv.\n'+
  '32 individus, 32 administrations orales, 251 observations PK et 232 PCA (515 lignes).\n'+
  'Ajustements SAEM nlmixr2 déjà exécutés dans course_source/warfarin/warfarin_monolix_nlmixr2.ipynb.\n'+
  '1C sans lag : BIC '+fmt(FITS.one.bic,2)+' ; 1C avec lag : '+fmt(FITS.lag.bic,2)+
  ' ; 2C avec lag : '+fmt(FITS.two.bic,2)+'.\n'+
  'Même erreur combined1 : 1C + Tlag nettement mieux soutenu sur ce jeu (ΔBIC 110,72 vs 1C sans lag).\n'+
  'Autres étapes du notebook : combined2 BIC '+fmt(ADVANCED_FITS.combined2.bic,2)+
  ' ; ajout de l’effet poids sur V : BIC '+fmt(fit.bic,2)+'.\n'+
  'Paramètres fixes rapportés pour ce dernier ajustement : Tlag '+fmt(FINAL_FIT.tlag,3)+
  ' h, Ka '+fmt(FINAL_FIT.ka,2)+' h-1, CL '+fmt(FINAL_FIT.cl,3)+' L/h, V à 71,65 kg '+fmt(FINAL_FIT.volume,2)+' L.\n'+
  'Diagnostics : GOF, résidus et VPC d’illustration reconstruits depuis les données et les paramètres fixes, pas exports originaux nlmixr2.\n'+
  'CWRES, NPDE, incertitudes RSE, vraies EBE, historique SAEM et diagnostics PD ajustés : non archivés, non revendiqués.\n'+
  'Les observations PCA sont réelles ; l’explication par modèle d’effet retardé reste à qualifier avec les sorties du fit.\n'+
  'Aucune recommandation clinique ne peut être déduite de ce jeu historique.';
}
function renderImport(){
 const first=SUBJECTS[0];
 const rows=WARFARIN_ROWS.filter(o=>o.id===first.id).slice(0,6);
 $('population-workspace').innerHTML=story('Vous analysez les <strong>observations historiques de warfarine</strong> déjà disponibles dans le dépôt. Les administrations, les concentrations plasmatiques et les mesures de PCA ont des lignes distinctes. Attribuez les colonnes : identifiant, temps, dose, observation et type de mesure.','ÉTUDE HISTORIQUE · CONTRÔLE QUALITÉ')+
  '<div class="career-metrics">'+metric('Volontaires',POPULATION_META.nSubjects)+metric('Concentrations PK',POPULATION_META.nObservations)+metric('PCA',POPULATION_META.nPCA)+'</div>'+
  '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th></tr></thead><tbody>'+
  rows.map(p=>'<tr><td>'+p.id+'</td><td>'+fmt(p.t,1)+'</td><td>'+(p.amt===null?'—':fmt(p.amt,0))+'</td><td>'+(p.dv===null?'—':fmt(p.dv,1))+'</td><td>'+p.dvid+'</td></tr>').join('')+
  '</tbody></table></div>'+
  '<p class="career-note"><strong>AMT renseignée :</strong> ligne de dose. <strong>AMT manquante :</strong> observation avec DVID=1 (concentration) ou DVID=2 (PCA). EVID n’existe pas comme colonne d’origine ; il peut être reconstruit à partir de AMT. Les valeurs nulles et les doublons observés restent conservés.</p>'+
  '<div class="career-field-grid">'+[['id','A'],['time','B'],['dose','C'],['concentration','D'],['event','E']].map(([key,col])=>
    '<label>Colonne '+col+'<select data-pk-map="'+key+'"><option value="">Associer un champ…</option>'+
    [['dv','Observation (DV)'],['dvid','Type de mesure (DVID)'],['dose','Dose (AMT)'],['time','Temps (TIME)'],['id','Identifiant (ID)']].map(([v,label])=>
      '<option value="'+v+'">'+label+'</option>').join('')+'</select></label>'
  ).join('')+'</div>';
 $('population-workspace').querySelectorAll('[data-pk-map]').forEach(el=>el.addEventListener('change',e=>{
   map[e.target.dataset.pkMap]=e.target.value;
 }));
}
function renderEDA(){
 $('population-workspace').innerHTML=story('Explorez les concentrations mesurées chez plusieurs volontaires. Les points sont les <strong>observations historiques</strong>. La courbe indique uniquement la reconstruction avec les effets fixes du modèle final documenté dans le notebook, pas le fit de chacun des modèles candidats.','DONNÉES RÉELLES · EXPLORATION')+
 '<div class="career-chart-toolbar"><button id="pop-linear" aria-pressed="true">Linéaire</button><button id="pop-log" aria-pressed="false">Semi-log</button><label>Volontaire <select id="pop-subject">'+SUBJECTS.slice(0,10).map(p=>
 '<option value="'+p.id+'">S'+p.id+' · '+fmt(p.wt,1)+' kg</option>').join('')+'</select></label></div>'+
 '<svg id="pop-eda-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Concentrations historiques, reconstruction par effets fixes et échelles linéaire/semi-log"></svg>'+
 '<p class="career-note">L’échelle logarithmique ne représente pas les concentrations strictement nulles. Les doublons à une même heure sont conservés ; l’échantillonnage précoce diffère selon les sujets.</p>'+
 radio([['simple','Un modèle oral 1C est un point de départ à tester, sans exclure d’autres structures.'],
 ['three','Une courbe décroissante prouve qu’il existe trois compartiments.'],
 ['fixed','Une seule courbe suffit à estimer parfaitement les effets aléatoires individuels.']]);
 function draw(){
  $('pop-linear').setAttribute('aria-pressed',String(scale==='linear'));
  $('pop-log').setAttribute('aria-pressed',String(scale==='log'));
  const subj=SUBJECTS.find(p=>p.id===selectedSubject)||SUBJECTS[0];
  const obs=OBSERVATIONS.filter(o=>o.id===subj.id),end=Math.max(144,...obs.map(o=>o.t));
  const points=Array.from({length:145},(_,i)=>({t:end*i/144,
    c:populationPredict('final',end*i/144,subj.dose,0,subj.wt)}));
  graph($('pop-eda-chart'),{series:[{values:points,color:'#96e6d3',opacity:.65}],
    points:obs,log:scale==='log',maxT:end,ymax:Math.max(18,...obs.map(o=>o.c))*1.13});
 }
 $('pop-linear').addEventListener('click',()=>{scale='linear';draw();});
 $('pop-log').addEventListener('click',()=>{scale='log';draw();});
 $('pop-subject').value=String(selectedSubject);
 $('pop-subject').addEventListener('change',e=>{selectedSubject=Number(e.target.value);draw();});
 draw();
}
function renderSAEM(){
 $('population-workspace').innerHTML=story('Le notebook du site a <strong>réellement exécuté SAEM avec nlmixr2 sur cette étude</strong>. Trois modèles ont été évalués avec le même type d’erreur résiduelle. Examinez leurs scores, puis les améliorations par le modèle d’erreur et la covariable poids. Les trajectoires d’itération n’ont pas été exportées : aucune fausse animation n’est affichée.','ESTIMATION · SORTIES NLMIXR2 ARCHIVÉES')+
 '<div class="career-model-buttons">'+Object.entries(FITS).map(([id,fit])=>
   '<button data-pop-model="'+id+'" aria-pressed="false">'+fit.label+'</button>').join('')+'</div>'+
 '<div class="career-metrics">'+metric('Moteur','nlmixr2 SAEM')+metric('Données','Étude historique')+metric('Résidus','combined1')+'</div>'+
 '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Modèle</th><th>AIC</th><th>BIC</th><th>ΔBIC</th></tr></thead><tbody id="pop-fit-rows"></tbody></table></div>'+
 '<div id="pop-model-interpretation" class="career-note">Sélectionnez une structure pour révéler ses scores archivés.</div>'+
 '<h3>Étapes supplémentaires de construction</h3>'+
 '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Changement</th><th>BIC</th><th>Source</th></tr></thead><tbody>'+
 Object.entries(ADVANCED_FITS).map(([key,fit])=>
  '<tr><td>'+fit.label+'</td><td>'+fmt(fit.bic,2)+'</td><td>'+fit.source+'</td></tr>').join('')+
 '</tbody></table></div>'+
 '<p class="career-alert">Les résultats du notebook ne contiennent pas d’export exploitable de l’historique SAEM, de la matrice de covariance, des vrais EBE ni des CWRES/NPDE. Les données et les BIC sont authentiques ; aucune série d’itérations ne sera inventée. Le modèle PK final archivé possède Tlag = 0,696 h et un effet du poids sur V.</p>'+
 '<a class="career-action" target="_blank" rel="noopener noreferrer" href="https://github.com/rberrah/rberrah.github.io/blob/main/course_source/warfarin/warfarfin_monolix_nlmixr2.ipynb" id="pop-source-notebook">Consulter le notebook nlmixr2</a>';
 // Correct URL from the repository, not a newly fabricated artifact.
 $('pop-source-notebook').href='https://github.com/rberrah/rberrah.github.io/blob/main/'+POPULATION_META.notebook;
 function draw(){
  $('population-workspace').querySelectorAll('[data-pop-model]').forEach(b=>
   b.setAttribute('aria-pressed',String(selectedFit===b.dataset.popModel)));
  $('pop-fit-rows').innerHTML=modelComparison().map(m=>
   '<tr data-selected="'+(selectedFit===m.id)+'"><td>'+m.label+'</td><td>'+
   (viewed.has(m.id)?fmt(m.aic,2):'—')+'</td><td>'+(viewed.has(m.id)?fmt(m.bic,2):'—')+'</td><td>'+
   (viewed.has(m.id)?fmt(m.deltaBic,2):'—')+'</td></tr>').join('');
  const m=modelComparison().find(x=>x.id===selectedFit);
  $('pop-model-interpretation').textContent=viewed.has(selectedFit)?
   'Résultat enregistré : '+m.label+', BIC '+fmt(m.bic,2)+', ΔBIC '+fmt(m.deltaBic,2)+
   '. Ce score ne remplace pas les diagnostics.':'Examinez les trois sorties.';
 }
 $('population-workspace').querySelectorAll('[data-pop-model]').forEach(b=>b.addEventListener('click',()=>{
   selectedFit=b.dataset.popModel;viewed.add(selectedFit);draw();
 }));
 draw();
}
function renderDiagnostics(){
 const summary=diagnosticsSummary();
 $('population-workspace').innerHTML=story('Voici les principaux graphiques utilisés dans une revue PopPK. Les <strong>observations et les paramètres fixes</strong> proviennent de l’étude et du notebook. Trois graphes GOF sont également repris <strong>à l’identique du fit nlmixr2 exécuté</strong>. Les graphes PRED, IPRED*, WRES* et VPC* sont des <strong>reconstructions explicitement approximatives</strong>, car les sorties individuelles complètes du SAEM n’ont pas été exportées.','QUALIFICATION · DIAGNOSTICS DÉTAILLÉS')+
 '<div class="career-metrics">'+metric('PK observées',summary.n)+metric('PCA observées',summary.originalPCA)+metric('Volontaires',summary.subjects)+'</div>'+
 '<div class="career-chart-toolbar"><label>Diagnostic <select id="pop-diagnostic-key">'+[...Object.values(NATIVE_GOF),...DIAGNOSTIC_OPTIONS].map(o=>
  '<option value="'+o.id+'">'+o.title+'</option>').join('')+'</select></label>'+
 '<label>Volontaire (profil individuel) <select id="pop-diagnostic-subject">'+SUBJECTS.map(p=>
  '<option value="'+p.id+'">S'+p.id+'</option>').join('')+'</select></label></div>'+
 '<div class="career-legend"><span><i style="background:#94edcf"></i> 3 figures originales du fit nlmixr2 (images du notebook)</span><span><i style="background:#f0c28d"></i> 12 reconstructions ou vues explicatives (*)</span></div>'+ 
 '<div class="career-diagnostic-gallery" id="pop-diagnostic-gallery">'+[...Object.values(NATIVE_GOF),...DIAGNOSTIC_OPTIONS].map(o=>
  '<button type="button" class="career-diag-button" data-diagnostic="'+o.id+'" aria-pressed="false">'+o.title+'</button>').join('')+'</div>'+
 '<img id="pop-native-chart" class="career-chart" hidden alt="Figure diagnostique native calculée par nlmixr2 et enregistrée dans le notebook du site">'+
 '<svg id="pop-diagnostic-chart" class="career-chart" viewBox="0 0 730 300" role="img" aria-label="Diagnostic pharmacométrique sélectionné"></svg>'+
 '<p id="pop-diagnostic-desc" class="career-note"></p>'+
 '<div class="career-alert"><strong>Limite d’extraction :</strong> le notebook conserve les BIC et certains paramètres mais pas les tableaux individuels complets. Le <strong>graphe CWRES vs temps original</strong> est disponible mais pas ses valeurs numériques. NPDE, RSE, historiques SAEM et vrais EBE ne sont <strong>pas disponibles</strong>. Des représentations approximatives explicitement marquées par * ne doivent pas leur être substituées.</div>'+
 '<p class="career-note">Pour qualifier une analyse : confronter observations/prédictions, résidus conditionnels, distributions, VPC et stabilité/identifiabilité. Sélectionnez les contrôles indispensables.</p>'+
 checkboxes([['gof','Comparer DV à PRED/IPRED et examiner les résidus.'],
 ['vpc','Examiner les observations versus simulations sur le plan de prélèvement.'],
 ['stability','Évaluer convergence, départs multiples, précision et identifiabilité.'],
 ['bic-only','S’arrêter au BIC sans diagnostic.']]);
 function draw(){
  diagnosticKey=$('pop-diagnostic-key').value;
  const sub=Number($('pop-diagnostic-subject').value);
  const native=NATIVE_GOF[diagnosticKey];
  $('pop-native-chart').hidden=!native;
  $('pop-diagnostic-chart').hidden=!!native;
  if(native){
   $('pop-native-chart').src=native.src;
   $('pop-diagnostic-desc').textContent='Figure originale du fit nlmixr2 du notebook de warfarine (cellule 13). La figure est authentique, mais ses observations/résidus individuels ne sont pas exportés sous forme de tableau dans le dépôt.';
  }else{
   drawDiagnostic($('pop-diagnostic-chart'),diagnosticKey,sub);
   const entry=DIAGNOSTIC_OPTIONS.find(o=>o.id===diagnosticKey);
   $('pop-diagnostic-desc').textContent=entry.desc;
  }
  $('pop-diagnostic-gallery').querySelectorAll('button').forEach(b=>
   b.setAttribute('aria-pressed',String(b.dataset.diagnostic===diagnosticKey)));
 }
 $('pop-diagnostic-key').value=diagnosticKey;
 $('pop-diagnostic-subject').value=String(selectedSubject);
 $('pop-diagnostic-key').addEventListener('change',draw);
 $('pop-diagnostic-subject').addEventListener('change',draw);
 $('pop-diagnostic-gallery').addEventListener('click',e=>{
  const b=e.target.closest('[data-diagnostic]');if(!b)return;
  $('pop-diagnostic-key').value=b.dataset.diagnostic;draw();
 });
 draw();
}
function renderDecision(){
 $('population-workspace').innerHTML=story('Interprétez les BIC SAEM réellement enregistrés. Les trois candidats structuraux utilisent un modèle d’erreur combined1. Une différence importante peut soutenir une structure, sans démontrer à elle seule la vérité mécanistique ou la robustesse numérique.','SÉLECTION · ÉTUDE HISTORIQUE')+
 '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Modèle</th><th>AIC</th><th>BIC</th><th>ΔBIC</th></tr></thead><tbody>'+
 modelComparison().map(m=>'<tr><td>'+m.label+'</td><td>'+fmt(m.aic,1)+'</td><td>'+fmt(m.bic,1)+'</td><td>'+fmt(m.deltaBic,1)+'</td></tr>').join('')+
 '</tbody></table></div>'+
 radio([['lag-supported','Le 1C avec Tlag est mieux soutenu parmi les trois structures testées ; la validation diagnostique reste nécessaire.'],
 ['equivocal','Les structures avec et sans Tlag sont équivalentes ici, car leur BIC diffère de moins de 2 points.'],
 ['two-certain','Le 2C est nécessairement meilleur car il possède davantage de paramètres.']])+
 '<p class="career-note">Une étape supplémentaire du notebook améliore le BIC à '+fmt(ADVANCED_FITS.combined2.bic,1)+
 ' avec une autre erreur résiduelle, puis à '+fmt(ADVANCED_FITS.covariate.bic,1)+
 ' après effet du poids sur V. Ces comparaisons sont distinctes de la comparaison structurale initiale.</p>';
}
function renderPD(){
 $('population-workspace').innerHTML=story('Les <strong>232 mesures de PCA sont réelles</strong>. Leur évolution retardée par rapport à la concentration suggère une dynamique pharmacodynamique supplémentaire. Les fits PK/PD du notebook ne fournissent pas ici un jeu complet de diagnostics utilisables : l’analyse des PCA est descriptive.','ÉTUDE HISTORIQUE · EFFET RETARDÉ')+
 '<div class="career-metrics">'+metric('PK',OBSERVATIONS.length+' concentrations')+
 metric('PD',PD_OBSERVATIONS.length+' PCA')+metric('Origine','Étude historique')+'</div>'+
 '<p class="career-note">PCA observée en fonction du temps (aucune réponse simulée).</p>'+
 '<svg id="pop-pd-chart" class="career-chart" viewBox="0 0 730 300" role="img" aria-label="PCA historiques en fonction du temps"></svg>'+
 '<p class="career-note">PCA vs concentration de population reconstruite aux mêmes temps (hystérésis potentielle, sans estimation PD).</p>'+
 '<svg id="pop-pd-conc" class="career-chart" viewBox="0 0 730 300" role="img" aria-label="PCA mesurées vs concentrations prévues"></svg>'+
 radio([['instant','Les mesures démontrent un effet instantané de la concentration.'],
 ['delay','Tester un compartiment d’effet ou un modèle de turnover, avec validation sur les PCA observées.'],
 ['proved','Le retard prouve à lui seul un mécanisme biologique unique chez chaque sujet.']]);
 drawDiagnostic($('pop-pd-chart'),'pd-time');
 drawDiagnostic($('pop-pd-conc'),'pd-cp');
}
function renderFinal(){
  $('population-workspace').innerHTML=story('Rédigez un résultat qui distingue les données, le modèle candidat, les diagnostics et ce qui reste non démontré. Votre dossier peut être copié comme exercice de synthèse.','ENQUÊTE N° 07 · RAPPORT FINAL')+
    '<p class="career-note">Cochez les informations que le rapport de pharmacométrie doit conserver.</p>'+
    checkboxes([['data','Identifier la source historique O’Reilly et le fichier d’origine du dépôt.'],
      ['inference','Signaler les limites du SAEM éducatif, du BIC et de l’identifiabilité.'],
      ['pd','Distinguer PCA mesurée et analyses PD descriptives, sans diagnostic complet des modèles PD.'],
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
    'Distinguez dose et observations PK/PD avant d’autoriser les estimations.',
    'Utilisez l’échelle et les observations, pas le seul nombre de paramètres.',
    'Lisez les trois ajustements SAEM archivés ; leurs trajectoires d’itération ne sont pas exportées.',
    'Une bonne qualification associe plusieurs contrôles ; aucun score ne suffit isolément.',
    'Lisez la différence de BIC et la parcimonie sans présenter une petite différence comme décisive.',
    'Un effet retardé exige une hypothèse dynamique à estimer et à confronter aux données.',
    'Le rapport doit mentionner ce que le travail ne démontre pas.'
  ][index];
  $('population-hint-text').textContent=[
    'DVID=1 désigne les concentrations et DVID=2 la PCA ; une dose se détecte via AMT.',
    'L’échelle semi-log met souvent en évidence les phases terminales.',
    'Les BIC du notebook sont révélés après ouverture de chaque modèle ; aucune trace SAEM n’est reconstruite.',
    'GOF + VPC + robustesse/identifiabilité sont complémentaires.',
    'Sur les vraies données, ΔBIC = 110,72 entre 1C avec et sans lag : un argument net, à qualifier.',
    'Les PCA sont mesurées, mais leur lien concentration-effet nécessite une estimation PD et des diagnostics.',
    'Les observations historiques sont réelles, mais les diagnostics SAEM détaillés non exportés et l’usage clinique exclus.'
  ][index];
  [
    renderImport,renderEDA,renderSAEM,renderDiagnostics,renderDecision,renderPD,renderFinal
  ][index]();
  navigation();
}
function select(i){
  if(i>done.length||i<0||i>=STEPS.length)return;
  index=i;viewed=new Set();selectedFit='one';selectedChecks.clear();choice='';scale='linear';selectedSubject=SUBJECTS[0].id;render();
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
    return viewed.size===3?success('Les trois modèles ont été comparés à partir des sorties SAEM nlmixr2 réellement archivées.'):
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
  if(index===4)return gradeStructureConclusion(option)?success('Le 1C avec Tlag est mieux soutenu parmi les candidats : ne confondez pas meilleur BIC et mécanisme démontré.'):failure('Relisez les BIC archivés : la différence avec/sans Tlag dépasse 100 points, elle n’est pas équivoque.');
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

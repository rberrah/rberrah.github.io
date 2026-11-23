// PMx Game track 4: bounded MAP-BE pharmacometrics, fictional infusion antibiotic.
// Never expose this widget as a patient dose calculator or link it as clinical MIPD Engine.
import {CASE,DOSES,OBSERVATIONS,infusionAt,posterior,doseEvaluation,candidateDoses,chooseDose,
  simulatorCurve,sampleTimingGrade,qualityGate,PKPD,evaluateEndpoints,scenarioComparison} from './mipd-course-core.js';
const $=id=>document.getElementById(id);
const STEPS=[
  {title:'Recevoir le dossier',chapter:'Audit du modèle',desc:'Vérifier le caractère fictif du modèle et ce qui manque à une décision clinique.'},
  {title:'Évaluer le plan de dosage',chapter:'Stratégie TDM',desc:'Vérifier si un plan de prélèvement proposé convient à ce modèle et à cette administration.'},
  {title:'Actualisation MAP-BE',chapter:'Inférence individuelle',desc:'Observer comment deux concentrations modifient la distribution des paramètres.'},
  {title:'Tester une posologie',chapter:'Prévision PK/PD',desc:'Comparer des courbes et choisir une cible C0, AUC24 ou temps au-dessus de 2×CMI.'},
  {title:'Et si CL change ?',chapter:'Projection dynamique',desc:'Raisonner sur AUC ∝ dose/CL, puis vérifier le creux toxique.'},
  {title:'Décision responsable',chapter:'Sécurité et rapport',desc:'Identifier les étapes nécessaires avant toute véritable utilisation clinique.'}
];
const KEY='pmx-game-mipd-v1';
const read=()=>{try{
  const x=JSON.parse(localStorage.getItem(KEY)||'null');
  if(Array.isArray(x)){const r=[];for(let i=0;i<STEPS.length;i++){if(x.includes(i))r.push(i);else break;}return r;}
}catch{}return [];};
let done=read(),index=Math.min(done.length,STEPS.length-1),selectedDose=null;
let viewed=new Set(),observationsSelected=new Set(),decision=null,afterShiftDose=null;
let selectedCriterion='auc',shiftAnswer='',safetyAnswer='';
const fmt=(n,k=1)=>Number(n).toLocaleString('fr-FR',{minimumFractionDigits:k,maximumFractionDigits:k});
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const P0=posterior({samples:0}),P1=posterior({samples:1}),P2=posterior({samples:2});
function story(text,kicker='MISSION D’INDIVIDUALISATION'){
  return '<div class="career-story"><span class="career-eyebrow">'+kicker+'</span><p>'+text+'</p></div>';
}
function metrics(items){return '<div class="career-metrics">'+items.map(([name,value])=>
  '<div><span>'+name+'</span><strong>'+value+'</strong></div>').join('')+'</div>';}
function choices(arr,name='mipd-choice'){
  return '<div class="career-choices">'+arr.map(([value,label])=>
    '<label><input type="radio" name="'+name+'" value="'+value+'"><span>'+label+'</span></label>').join('')+'</div>';
}
function checkboxes(arr,name){
  return '<div class="career-checkboxes">'+arr.map(([value,label])=>
    '<label><input type="checkbox" name="'+name+'" value="'+value+'"><span>'+label+'</span></label>').join('')+'</div>';
}
function graph(el,series,opts={}){
  const maxTime=opts.maxTime??12,high=opts.high??40,min=0;
  const x=t=>65+624*t/maxTime,y=c=>27+217*(1-(c-min)/(high-min));
  let s='<rect x="65" y="27" width="624" height="217" rx="10" fill="#102830"/>';
  for(let i=0;i<=4;i++){
    const xx=x(i*maxTime/4),yy=y(i*high/4);
    s+='<path d="M65 '+yy+' H689" stroke="#36545a" stroke-dasharray="4 7"/>'+
    '<text x="55" y="'+(yy+5)+'" font-size="13" fill="#aacfc4" text-anchor="end">'+fmt(i*high/4,1)+'</text>'+
    '<text x="'+xx+'" y="269" font-size="13" fill="#aacfc4" text-anchor="middle">'+fmt(i*maxTime/4,0)+' h</text>';
  }
  for(const mark of (opts.thresholds||[])){
    if(mark.value<0||mark.value>high)continue;
    s+='<path d="M65 '+y(mark.value)+' H689" stroke="'+mark.color+'" stroke-width="1.8" stroke-dasharray="6 5"/>';
  }
  for(const line of series){
    const pairs=line.values.map(v=>x(v.t).toFixed(1)+','+y(v.c).toFixed(1)).join(' ');
    s+='<polyline points="'+pairs+'" fill="none" stroke="'+(line.color||'#91e9d4')+'" stroke-width="3.3"/>';
  }
  if(opts.dots)for(const p of opts.dots){
    s+='<circle cx="'+x(p.t)+'" cy="'+y(p.c??p.value)+'" r="6" fill="#f7c68a" stroke="#142b34" stroke-width="2"/>';
  }
  el.innerHTML=s;
}
function distribution(el,one,two,key='cl'){
  const isV=key==='v',keys=Array.from({length:26},(_,i)=>isV?18.6+i*1.08:1.8+i*.22);
  const half=isV?.54:.11;
  const hist=post=>keys.map(k=>post.rows.filter(r=>r[key]>=k-half&&r[key]<k+half).reduce((sum,r)=>sum+r.w,0));
  const a=hist(one),b=hist(two),max=Math.max(.0001,...a,...b)*1.1;
  const x=i=>52+i*23,y=v=>218-183*v/max;
  let svg='<rect x="44" y="23" width="610" height="195" fill="#0b2530" rx="10"/>';
  for(let i=0;i<keys.length;i++){
    svg+='<rect x="'+x(i)+'" y="'+y(a[i]).toFixed(1)+'" width="8" height="'+(218-y(a[i])).toFixed(1)+'" fill="#48757d"/>'+
      '<rect x="'+(x(i)+9)+'" y="'+y(b[i]).toFixed(1)+'" width="8" height="'+(218-y(b[i])).toFixed(1)+'" fill="#a2efce"/>';
  }
  for(let i=0;i<=4;i++){
    const ix=Math.min(i*6,25);
    svg+='<text x="'+x(ix)+'" y="249" fill="#c8dad3" font-size="13" text-anchor="middle">'+fmt(keys[ix],1)+'</text>';
  }
  el.innerHTML=svg+'<text x="54" y="16" fill="#b7d8ce" font-size="13">Masse par classe · '+(isV?'V (L)':'CL (L/h)')+'</text>';
}
function distributionLegend(){
  return '<p class="career-note"><span style="color:#48757d">■</span> A priori (identique dans les trois affichages) · '+
    '<span style="color:#a2efce">■</span> Distribution affichée (a priori, posterior à 1 dosage ou posterior à 2 dosages). '+
    'La vraisemblance apporte l’information des dosages ; elle ne modifie pas le prior.</p>';
}

function nav(){
  $('mipd-progress').textContent=done.length+' / '+STEPS.length;
  const frag=document.createDocumentFragment();
  STEPS.forEach((s,i)=>{
    const b=document.createElement('button');b.type='button';b.disabled=i>done.length;
    if(i===index)b.setAttribute('aria-current','step');
    const n=document.createElement('span');n.className='career-step-num';n.textContent=done.includes(i)?'✓':String(i+1);
    const m=document.createElement('span');m.textContent=s.title;
    const sub=document.createElement('small');sub.textContent=done.includes(i)?'Validée':b.disabled?'Verrouillée':s.chapter;
    m.append(sub);b.append(n,m);b.addEventListener('click',()=>select(i));frag.append(b);
  });
  $('mipd-steps').replaceChildren(frag);
}
function stage0(){
  $('mipd-workspace').innerHTML=story('Vous prenez en charge un dossier pédagogique : <strong>antibiotique V fictif</strong>, perfusion IV de 1 h répétée toutes les 12 h. Le modèle de population 1C possède des paramètres typiques CL et V et une variabilité interindividuelle. Qu’est-ce qui doit être vérifié avant toute application ?','FICHE TECHNIQUE · PATIENT IMAGINAIRE')+
    metrics([['Administration',fmt(CASE.dose,0)+' mg / 12 h'],['Prior CL',fmt(CASE.priorCL)+' L/h'],['Prior V',fmt(CASE.priorV,0)+' L']])+
    '<div class="career-flow"><div>Dose programmée</div><span>→</span><div>Prédiction de population</div></div>'+
    '<p class="career-note">Modèle <strong>entièrement inventé</strong> ; un vrai logiciel MIPD exige une source validée, des prélèvements horodatés, des cibles spécifiques au contexte et une validation externe.</p>'+
    choices([['only-prior','Le modèle de population suffit à prédire une exposition individuelle certaine.'],
      ['audit','Le modèle est un point de départ, mais il faut contrôler ses domaines de validité et exploiter les concentrations mesurées.'],
      ['therapeutic','Les chiffres affichés constituent une recommandation thérapeutique vérifiée.']]);
}
function stage1(){
  $('mipd-workspace').innerHTML=story('Pour ce modèle <strong>1 compartiment IV, perfusion de 1 h toutes les 12 h</strong>, le laboratoire propose un prélèvement à 2 h et un autre à 11 h après le début de la perfusion. Vous ne choisissez pas les horaires : <strong>évaluez ce plan proposé</strong> et son intérêt. Un autre modèle, une perfusion continue ou un autre objectif exigeraient un plan différent.','TDM · AUDIT D’UN PLAN PROPOSÉ')+
    metrics([['Perfusion','0–1 h'],['Premier prélèvement','2 h'],['Second prélèvement','11 h · pré-dose']])+
    choices([['yes','Plan adapté pour ce cas fictif 1C IV.'],['no','Plan nécessairement inadapté, quelles que soient les conditions.']],'mipd-sampling-verdict')+
    '<p class="career-note">Quelle justification est correcte ?</p>'+
    choices([['complement','La mesure après perfusion et le creux renseignent des portions différentes du profil ; la pertinence dépend de la structure et de la voie.'],['universal','Ces deux heures sont universelles pour tous les médicaments, modèles et voies.'],['no-time','Le temps exact de prélèvement n’influence jamais l’estimation.']],'mipd-sampling-reason');
}

function stage2(){
  $('mipd-workspace').innerHTML=story('Le prior du modèle est <strong>fixé avant de voir les observations</strong>. Avec une puis deux mesures, c’est la vraisemblance et donc le posterior qui changent. Explorez séparément les distributions de CL et de V : MAP-BE n’équivaut pas à modifier la moyenne du prior.','BAYES · PRIOR × VRAISEMBLANCE → POSTERIOR')+
    '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Temps depuis début de perfusion</th><th>Concentration pédagogique</th></tr></thead><tbody>'+
    OBSERVATIONS.map(o=>'<tr><td>'+fmt(o.t,0)+' h</td><td>'+fmt(o.value,2)+' mg/L</td></tr>').join('')+'</tbody></table></div>'+
    '<div class="career-model-buttons"><button data-mipd-post="0">A priori seul</button><button data-mipd-post="1">Après 1 dosage</button><button data-mipd-post="2">Après 2 dosages</button></div>'+
    '<div id="mipd-post-metrics" class="career-metrics"></div>'+
    '<p class="career-note"><strong>Distribution de CL</strong></p><svg id="mipd-post-chart" class="career-chart" viewBox="0 0 730 275" role="img" aria-label="Histogrammes CL : prior inchangé et posterior actualisé"></svg>'+
    '<p class="career-note"><strong>Distribution de V</strong></p><svg id="mipd-post-v" class="career-chart" viewBox="0 0 730 275" role="img" aria-label="Histogrammes V : prior inchangé et posterior actualisé"></svg>'+
    distributionLegend()+
    choices([['fixed','Le prior reste inchangé ; la vraisemblance des concentrations actualise le posterior de CL et V.'],['prior-change','Chaque nouveau dosage modifie directement la distribution a priori de population.'],['certain','Deux dosages suppriment toute incertitude sur CL et V.']]);
  function draw(n){
    viewed.add(n);
    const post=[P0,P1,P2][n];
    $('mipd-post-metrics').innerHTML=[
      ['E[CL | observations]',fmt(post.meanCL,2)+' L/h'],
      ['MAP(CL)',fmt(post.mapCL,2)+' L/h'],
      ['CL P5–P95',fmt(post.clCI[0],1)+'–'+fmt(post.clCI[1],1)+' L/h'],
      ['MAP(V)',fmt(post.mapV,1)+' L']
    ].map(([name,value])=>'<div><span>'+name+'</span><strong>'+value+'</strong></div>').join('');
    distribution($('mipd-post-chart'),P0,post,'cl');
    distribution($('mipd-post-v'),P0,post,'v');
    $('mipd-workspace').querySelectorAll('[data-mipd-post]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.mipdPost===n)));
  }
  $('mipd-workspace').querySelectorAll('[data-mipd-post]').forEach(b=>b.addEventListener('click',()=>draw(+b.dataset.mipdPost)));
  draw(0);
}

function doseRow(dose){
  const x=evaluateEndpoints(P2,dose);
  return '<tr data-selected="'+(selectedDose===dose)+'"><td><button type="button" class="career-action" data-mipd-dose="'+dose+'" aria-pressed="'+(selectedDose===dose)+'">'+fmt(dose,0)+' mg</button></td>'+
    '<td>'+fmt(x.auc,0)+'</td><td>'+fmt(x.c0,1)+'</td><td>'+fmt(x.timeAbovePct,0)+' %</td><td>'+(x.toxic?'C0 toxique':'—')+'</td></tr>';
}
function concentrationLegend(){
  return '<p class="career-note"><span style="color:#9cebd5">━</span> Profil prédit · '+
    '<span style="color:#c8a6f5">┄</span> CMI = '+fmt(PKPD.mic,0)+' mg/L · '+
    '<span style="color:#f6c28e">┄</span> 2 × CMI = '+fmt(PKPD.mic*PKPD.micMultiple,0)+' mg/L · '+
    '<span style="color:#f08080">┄</span> Seuil de C0 toxique = '+fmt(PKPD.troughToxic,0)+' mg/L (appliqué <strong>au creux seulement</strong>, pas au pic).</p>';
}
const concentrationMarks=[
  {value:PKPD.mic,color:'#c8a6f5'},
  {value:PKPD.mic*PKPD.micMultiple,color:'#f6c28e'},
  {value:PKPD.troughToxic,color:'#f08080'}
];
function stage3(){
  $('mipd-workspace').innerHTML=story('Choisissez d’abord un <strong>critère pharmacocinétique/pharmacodynamique</strong>, puis testez différentes posologies en comparant les courbes avec la CMI et un seuil de C0 toxique. Cibles et seuils sont inventés pour l’enseignement : AUC24 de 440 à 560 mg·h/L, C0 ≥ 8 mg/L ou temps au-dessus de 2×CMI ≥ 90 % de l’intervalle.','SIMULATIONS · EFFICACITÉ / TOXICITÉ')+
    metrics([['CMI fictive',fmt(PKPD.mic,0)+' mg/L'],['Seuil de C0 toxique',fmt(PKPD.troughToxic,0)+' mg/L'],['Durée de perfusion','1 h / 12 h']])+
    '<label class="career-note" for="mipd-criterion">Critère à atteindre</label> <select id="mipd-criterion"><option value="auc">AUC24 : 440–560 mg·h/L</option><option value="trough">C0 ≥ 8 mg/L</option><option value="time">Temps &gt; 2 × CMI ≥ 90 %</option></select>'+
    '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Dose toutes les 12 h</th><th>AUC24</th><th>C0</th><th>Temps &gt; 2×CMI</th><th>Signal sécurité</th></tr></thead><tbody id="mipd-dose-rows"></tbody></table></div>'+
    '<svg id="mipd-dose-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Courbe concentration-temps avec seuils CMI, deux fois CMI et C0 toxique"></svg>'+
    concentrationLegend()+
    '<p id="mipd-dose-caption" class="career-note">Sélectionnez une dose pour confronter son profil à la cible choisie et au seuil toxique.</p>';
  function draw(){
    $('mipd-criterion').value=selectedCriterion;
    $('mipd-dose-rows').innerHTML=DOSES.map(doseRow).join('');
    const dose=selectedDose??CASE.dose,x=evaluateEndpoints(P2,dose);
    graph($('mipd-dose-chart'),[{values:x.curve,color:'#9cebd5'}],{maxTime:12,high:Math.max(44,...x.curve.map(p=>p.c))*1.1,thresholds:concentrationMarks});
    if(selectedDose!==null){
      $('mipd-dose-caption').textContent=fmt(dose,0)+' mg q12h : AUC24 '+fmt(x.auc,0)+' mg·h/L, C0 '+fmt(x.c0,1)+' mg/L, temps > 2×CMI '+fmt(x.timeAbovePct,0)+' % ; cible '+(x.meets[selectedCriterion]?'atteinte':'non atteinte')+' ; '+(x.toxic?'C0 au-dessus du seuil toxique.':'C0 sous le seuil toxique.');
    }
  }
  $('mipd-criterion').addEventListener('change',e=>{selectedCriterion=e.target.value;draw();});
  $('mipd-dose-rows').addEventListener('click',e=>{
    const b=e.target.closest('[data-mipd-dose]');if(!b)return;selectedDose=+b.dataset.mipdDose;draw();
  });
  draw();
}

function stage4(){
  const scenario=scenarioComparison(P2,900,.6);
  const entries=[['Initial : CL inchangée',scenario.unchanged],['CL × 0,6 ; dose inchangée',scenario.sameDose],
    ['CL × 0,6 ; dose × 0,6',scenario.aucMatched],['CL × 0,6 ; dose × 0,5',scenario.safetyReduced]];
  $('mipd-workspace').innerHTML=story('Partons d’une dose de <strong>900 mg toutes les 12 h</strong>. Dans un scénario hypothétique, la clairance diminue de 40 %. Comment conserver l’AUC initiale ? Puis vérifiez le C0 : la réduction conservant l’AUC peut dépasser le seuil toxique. Il faut alors arbitrer le bénéfice et le risque, sans prétendre qu’une dose unique satisfait toutes les cibles.','SCÉNARIO · CL DIMINUÉE')+
    metrics([['Dose de référence','900 mg / 12 h'],['Nouvelle CL','CL initiale × 0,60'],['Seuil fictif C0',fmt(PKPD.troughToxic,0)+' mg/L']])+
    '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Scénario</th><th>Dose q12h</th><th>AUC24</th><th>C0</th><th>C0 toxique ?</th></tr></thead><tbody>'+
    entries.map(([label,x])=>'<tr><td>'+label+'</td><td>'+fmt(x.dose,0)+' mg</td><td>'+fmt(x.auc,0)+'</td><td>'+fmt(x.c0,1)+'</td><td>'+(x.toxic?'Oui':'Non')+'</td></tr>').join('')+'</tbody></table></div>'+
    '<svg id="mipd-shift-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Comparaison des courbes sous clairance réduite"></svg>'+
    '<p class="career-note"><span style="color:#9cebd5">━</span> 900 mg / CL initiale · <span style="color:#f6c28e">━</span> 540 mg / CL ×0,6 · <span style="color:#c8a6f5">━</span> 450 mg / CL ×0,6</p>'+concentrationLegend()+
    '<p class="career-note"><strong>Question 1.</strong> À clairance diminuée de 40 %, quel facteur de dose maintient l’AUC24, en PK linéaire et à intervalle constant ?</p>'+
    choices([['0.60','Dose × 0,60'],['1.00','Dose inchangée'],['0.50','Dose × 0,50']],'mipd-shift-auc')+
    '<p class="career-note"><strong>Question 2.</strong> Si le creux du schéma ×0,60 dépasse le seuil toxique, quelle mesure est défendable parmi ces propositions ?</p>'+
    choices([['0.50','Tester dose ×0,50 : C0 inférieur au seuil, mais AUC désormais inférieure à la cible ; réévaluer la stratégie.'],['0.60','Conserver ×0,60 quoi qu’il arrive : l’AUC cible garantit l’absence de toxicité.'],['no-change','Conserver la dose initiale, malgré la baisse de CL.']],'mipd-shift-safety')+
    '<p class="career-note">Indice : AUC24 à l’état stationnaire = dose quotidienne / CL (PK linéaire). Cette égalité ne permet pas d’en déduire que C0 reste constant ; V et l’intervalle influencent le profil.</p>';
  graph($('mipd-shift-chart'),[
    {values:scenario.unchanged.curve,color:'#9cebd5'},
    {values:scenario.aucMatched.curve,color:'#f6c28e'},
    {values:scenario.safetyReduced.curve,color:'#c8a6f5'}
  ],{maxTime:12,high:44,thresholds:concentrationMarks});
}

function stage5(){
  const assessment=qualityGate({dose:selectedDose??900,modelValidated:false,changingCL:true,missingTimes:false});
  $('mipd-workspace').innerHTML=story('Votre choix a été évalué mathématiquement. Mais le modèle est fictif, les données ont été simulées et CL peut évoluer. Quelles informations et garanties exigeriez-vous avant de transposer le raisonnement à un médicament réel ?','RELECTURE CRITIQUE · FIN DE MISSION')+
    '<div class="career-alert">'+assessment.reasons.map(s=>'<div>• '+safe(s)+'</div>').join('')+'</div>'+
    checkboxes([['validate','Exiger un modèle populationnel adapté et validé extérieurement.'],
      ['verify','Vérifier dose, modalités, horodatage, analytique et indication.'],
      ['monitor','Réévaluer après modification de la fonction d’élimination ou des observations.'],
      ['prescribe','Utiliser directement la posologie fictive comme prescription réelle.']],'mipd-safety')+
    '<pre id="mipd-report" class="career-code">'+safe(report())+'</pre>'+
    '<div class="career-file-actions"><button type="button" class="career-action" id="mipd-copy">Copier le compte rendu fictif</button></div>';
  $('mipd-copy').addEventListener('click',()=>navigator.clipboard?.writeText(report()));
}
function report(){
  const x=selectedDose!==null?evaluateEndpoints(P2,selectedDose):evaluateEndpoints(P2,900);
  const shift=scenarioComparison(P2,900,.6);
  return 'PMx Game — Étude MIPD purement pédagogique\n'+
    'Antibiotique V fictif ; perfusion IV 1 h toutes les 12 h ; CMI = 4 mg/L, seuil de C0 toxique = 12 mg/L : valeurs inventées.\n'+
    'Prior : CL médiane 4,5 L/h, V médian 32 L ; distribution lognormale et résidu hétéroscédastique. Le prior ne change pas avec les observations.\n'+
    'Deux dosages simulés : t=2 h '+fmt(OBSERVATIONS[0].value,2)+' mg/L ; t=11 h '+fmt(OBSERVATIONS[1].value,2)+' mg/L. La vraisemblance actualise le posterior.\n'+
    'Posterior sur grille : MAP(CL) '+fmt(P2.mapCL,2)+' L/h ; MAP(V) '+fmt(P2.mapV,1)+' L ; E[CL] '+fmt(P2.meanCL,2)+' L/h.\n'+
    'Dose étudiée '+fmt(x.dose,0)+' mg q12h : AUC24 '+fmt(x.auc,0)+' mg·h/L ; C0 '+fmt(x.c0,1)+' mg/L ; temps >2×CMI '+fmt(x.timeAbovePct,0)+' %.\n'+
    'Scénario CL ×0,6, dose initiale 900 mg : dose ×0,6 donne AUC24 '+fmt(shift.aucMatched.auc,0)+' et C0 '+fmt(shift.aucMatched.c0,1)+' ; dose ×0,5 donne AUC24 '+fmt(shift.safetyReduced.auc,0)+' et C0 '+fmt(shift.safetyReduced.c0,1)+'. Rechercher un compromis ou ajuster le schéma après contrôles.\n'+
    'Les chiffres ne sont PAS des recommandations cliniques. Les objectifs et la toxicité sont fictifs. CL modifiée est une hypothèse, sans nouvelle observation ni validation. MIPD Engine clinique non appelé.';
}

function render(){
  const step=STEPS[index];
  $('mipd-chapter').textContent=step.chapter;
  $('mipd-level').textContent='Étape '+(index+1)+' / '+STEPS.length;
  $('mipd-title').textContent=step.title;
  $('mipd-description').textContent=step.desc;
  $('mipd-feedback').hidden=true;
  $('mipd-validate').disabled=done.includes(index);
  $('mipd-next').hidden=!done.includes(index)||index===STEPS.length-1;
  $('mipd-hint-text').hidden=true;
  const help=[
    'Ne confondez pas un modèle validé pour un usage déterminé et une simulation éducative.',
    'Évaluez le plan proposé au regard du modèle, de l’administration et de la cible.',
    'Explorez les trois états de connaissance (a priori, un dosage, deux dosages).',
    'Sélectionnez une cible AUC, C0 ou temps > 2×CMI et vérifiez séparément la toxicité au creux.',
    'AUC ∝ dose/CL ; un ajustement d’AUC ne garantit pas une C0 non toxique.',
    'La limite d’un modèle est une partie du résultat, pas une note de bas de page.'
  ];
  const hints=[
    'Une structure, un jeu de données et une cible doivent être adaptés à l’indication avant le calcul.',
    'Les horaires sont imposés dans cet exemple et ne sont pas universels.',
    'Le prior reste identique ; c’est le posterior qui change avec la vraisemblance des mesures.',
    'Une cible atteinte ne suffit pas : regardez aussi la ligne de C0 toxique.',
    'Une dose ×0,6 conserve l’AUC lorsque CL ×0,6, mais peut augmenter C0 ; tester ×0,5 puis réévaluer.',
    'Le modèle fictif n’a pas d’usage clinique ; privilégiez vérification, suivi et validation.'
  ];
  $('mipd-help').textContent=help[index];$('mipd-hint-text').textContent=hints[index];
  [stage0,stage1,stage2,stage3,stage4,stage5][index]();
  nav();
}
function select(i){
  if(i<0||i>=STEPS.length||i>done.length)return;
  index=i;viewed.clear();afterShiftDose=null;render();
}
function success(message){
  if(index===done.length){done.push(index);try{localStorage.setItem(KEY,JSON.stringify(done));}catch{}}
  $('mipd-feedback').hidden=false;$('mipd-feedback').classList.remove('error');
  $('mipd-feedback').innerHTML='<strong>Mission validée</strong><p>'+safe(message)+'</p>';
  $('mipd-validate').disabled=true;$('mipd-next').hidden=index===STEPS.length-1;nav();
}
function failure(message){
  $('mipd-feedback').hidden=false;$('mipd-feedback').classList.add('error');
  $('mipd-feedback').innerHTML='<strong>Décision à revoir</strong><p>'+safe(message)+'</p>';
}
function validate(){
  if(done.includes(index))return;
  const w=$('mipd-workspace');
  if(index===0){
    const v=w.querySelector('input[name="mipd-choice"]:checked')?.value;
    return v==='audit'?success('Un modèle de population ne remplace ni le contrôle des données ni l’individualisation.'):failure('Le modèle du jeu n’est pas validé pour un usage clinique.');
  }
  if(index===1){
    const verdict=w.querySelector('input[name="mipd-sampling-verdict"]:checked')?.value;
    const reason=w.querySelector('input[name="mipd-sampling-reason"]:checked')?.value;
    return verdict==='yes'&&reason==='complement'?
      success('Plan proposé cohérent pour CE modèle IV 1C ; les horaires dépendent de la structure, des modalités et de l’objectif.'):
      failure('Il faut juger les deux heures proposées et expliquer pourquoi elles sont complémentaires dans ce cas, sans les généraliser.');
  }

  if(index===2){
    const ans=w.querySelector('input[name="mipd-choice"]:checked')?.value;
    return viewed.has(0)&&viewed.has(1)&&viewed.has(2)&&ans==='fixed'?
      success('Après deux dosages, l’intervalle crédible de CL se resserre dans ce cas simulé.'):
      failure('Explorez a priori, une observation et deux observations, puis distinguez réduction d’incertitude et certitude.');
  }
  if(index===3){
    if(selectedDose===null)return failure('Choisissez une dose et une cible PK/PD.');
    const r=evaluateEndpoints(P2,selectedDose);
    if(!r.meets[selectedCriterion])return failure('La dose ne satisfait pas le critère '+selectedCriterion+'. Comparez les courbes et la cible.');
    if(r.toxic)return failure('La cible peut être atteinte, mais le C0 franchit le seuil toxique : recherchez une autre stratégie.');
    return success('Cible '+selectedCriterion+' satisfaite sans dépasser le seuil fictif de C0 toxique. Les autres critères restent à examiner.');
  }
  if(index===4){
    const q1=w.querySelector('input[name="mipd-shift-auc"]:checked')?.value;
    const q2=w.querySelector('input[name="mipd-shift-safety"]:checked')?.value;
    return q1==='0.60'&&q2==='0.50'?
      success('Dose ×0,6 conserve l’AUC en PK linéaire ; dose ×0,5 atténue le risque de C0 toxique mais peut sous-exposer en AUC. La stratégie nécessite une réévaluation.'):
      failure('Appliquez la proportionnalité dose/CL pour l’AUC, puis vérifiez la C0 et le compromis bénéfice–risque.');
  }

  const a=[...w.querySelectorAll('input[name="mipd-safety"]:checked')].map(e=>e.value);
  return a.length===3&&['validate','verify','monitor'].every(t=>a.includes(t))?
    success('Dossier fermé : aucune des doses simulées ne constitue une recommandation pour un patient.'):
    failure('Retenez validation, vérification des entrées et surveillance ; aucune prescription réelle n’est justifiée.');
}
$('mipd-validate').addEventListener('click',validate);
$('mipd-hint').addEventListener('click',()=>{$('mipd-hint-text').hidden=false;});
$('mipd-next').addEventListener('click',()=>select(Math.min(STEPS.length-1,index+1)));
$('mipd-reset').addEventListener('click',()=>{
  if(!confirm('Réinitialiser les missions MIPD de ce navigateur ?'))return;
  done=[];try{localStorage.setItem(KEY,'[]');}catch{}select(0);
});
select(index);

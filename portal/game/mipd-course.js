// PMx Game track 4: bounded MAP-BE pharmacometrics, fictional infusion antibiotic.
// Never expose this widget as a patient dose calculator or link it as clinical MIPD Engine.
import {CASE,DOSES,OBSERVATIONS,infusionAt,posterior,doseEvaluation,candidateDoses,chooseDose,
  simulatorCurve,sampleTimingGrade,qualityGate} from './mipd-course-core.js';
const $=id=>document.getElementById(id);
const STEPS=[
  {title:'Recevoir le dossier',chapter:'Audit du modèle',desc:'Vérifier le caractère fictif du modèle et ce qui manque à une décision clinique.'},
  {title:'Choisir les dosages',chapter:'Stratégie TDM',desc:'Sélectionner deux temps informatifs pour éclairer CL et V.'},
  {title:'Actualisation MAP-BE',chapter:'Inférence individuelle',desc:'Observer comment deux concentrations modifient la distribution des paramètres.'},
  {title:'Tester une posologie',chapter:'Prévision PK/PD',desc:'Comparer une grille de doses selon la probabilité d’atteindre une cible fictive.'},
  {title:'Et si CL change ?',chapter:'Projection dynamique',desc:'Tester la même dose sous une baisse hypothétique de clairance.'},
  {title:'Décision responsable',chapter:'Sécurité et rapport',desc:'Identifier les étapes nécessaires avant toute véritable utilisation clinique.'}
];
const KEY='pmx-game-mipd-v1';
const read=()=>{try{
  const x=JSON.parse(localStorage.getItem(KEY)||'null');
  if(Array.isArray(x)){const r=[];for(let i=0;i<STEPS.length;i++){if(x.includes(i))r.push(i);else break;}return r;}
}catch{}return [];};
let done=read(),index=Math.min(done.length,STEPS.length-1),selectedDose=null;
let viewed=new Set(),observationsSelected=new Set(),decision=null,afterShiftDose=null;
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
  for(const line of series){
    const pairs=line.values.map(v=>x(v.t).toFixed(1)+','+y(v.c).toFixed(1)).join(' ');
    s+='<polyline points="'+pairs+'" fill="none" stroke="'+(line.color||'#91e9d4')+'" stroke-width="3.3"/>';
  }
  if(opts.dots)for(const p of opts.dots){
    s+='<circle cx="'+x(p.t)+'" cy="'+y(p.c??p.value)+'" r="6" fill="#f7c68a" stroke="#142b34" stroke-width="2"/>';
  }
  el.innerHTML=s;
}
function distribution(el,one,two){
  const width=600,maxHeight=183,keys=Array.from({length:26},(_,i)=>2.2+i*.19);
  const hist=(post)=>keys.map((cl,i)=>{
    const low=cl-.095,hi=cl+.095;
    return post.rows.filter(r=>r.cl>=low&&r.cl<hi).reduce((sum,r)=>sum+r.w,0);
  });
  const a=hist(one),b=hist(two),max=Math.max(...a,...b)*1.1;
  const x=i=>52+i*23,y=v=>218-maxHeight*v/max;
  let s='<rect x="44" y="23" width="610" height="195" fill="#0b2530" rx="10"/>';
  for(let i=0;i<keys.length;i++){
    s+='<rect x="'+(x(i))+'" y="'+y(a[i]).toFixed(1)+'" width="8" height="'+(218-y(a[i])).toFixed(1)+'" fill="#48757d"/>'+
      '<rect x="'+(x(i)+9)+'" y="'+y(b[i]).toFixed(1)+'" width="8" height="'+(218-y(b[i])).toFixed(1)+'" fill="#a2efce"/>';
  }
  for(let i=0;i<=4;i++){
    const xx=x(i*6);
    s+='<text x="'+xx+'" y="249" fill="#c8dad3" font-size="13" text-anchor="middle">'+fmt(keys[i*6],1)+'</text>';
  }
  el.innerHTML=s+'<text x="54" y="16" fill="#b7d8ce" font-size="13">Probabilité de CL · L/h</text>';
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
  const options=[
    ['post-infusion','Prélèvement à 2 h du début de la perfusion'],
    ['trough','Prélèvement à 11 h, avant la dose suivante'],
    ['during-infusion','Prélèvement à 15 min pendant la perfusion'],
    ['untimed','Concentration sans heure précise de prélèvement']
  ];
  $('mipd-workspace').innerHTML=story('Vous ne disposez que de deux dosages possibles pour informer un modèle 1C IV. Choisissez <strong>deux prélèvements horodatés</strong> répartis sur l’intervalle, l’un après la fin de la perfusion, l’autre proche du creux.','TDM · PLAN D’ÉCHANTILLONNAGE')+
    metrics([['Dose',fmt(CASE.dose,0)+' mg'],['Intervalle',fmt(CASE.tau,0)+' h'],['Perfusion','1 h']])+
    checkboxes(options,'mipd-samples')+
    '<p class="career-note">Les concentrations seront dévoilées au moment de l’estimation. Des prélèvements mal horodatés peuvent biaiser l’estimation de CL et V.</p>';
}
function stage2(){
  $('mipd-workspace').innerHTML=story('Les échantillons du patient fictif ont été analysés. Vous pouvez utiliser le modèle <strong>a priori</strong>, une concentration ou les deux. Le calcul de MAP est réellement réalisé par intégration des probabilités sur une grille CL × V ; l’interface ne se contente pas de rejouer un résultat prédéfini.','BAYES · DE LA POPULATION AU PATIENT')+
    '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Heure</th><th>Concentration fictive</th></tr></thead><tbody>'+
    OBSERVATIONS.map(o=>'<tr><td>'+fmt(o.t,0)+' h</td><td>'+fmt(o.value,2)+' mg/L</td></tr>').join('')+'</tbody></table></div>'+
    '<div class="career-model-buttons">'+
    '<button data-mipd-post="0">A priori seul</button><button data-mipd-post="1">Après 1 dosage</button><button data-mipd-post="2">Après 2 dosages</button></div>'+
    '<div id="mipd-post-metrics" class="career-metrics"></div>'+
    '<p class="career-note">Distribution de la clairance (bleu sombre : a priori, vert : après intégration des deux dosages). Intervalle central : 5e–95e percentile.</p>'+
    '<svg id="mipd-post-chart" class="career-chart" viewBox="0 0 730 275" role="img" aria-label="Distribution de CL avant et après deux mesures"></svg>'+
    choices([['population','La valeur moyenne a priori doit rester identique après observation.'],
      ['bayes','Deux dosages horodatés peuvent réduire l’incertitude sur la clairance individuelle.'],
      ['certain','Deux mesures rendent CL et V certains, sans modèle d’erreur.']]);
  function draw(n){
    viewed.add(n);
    const post=[P0,P1,P2][n];
    $('mipd-post-metrics').innerHTML=[
      ['E[CL]',fmt(post.meanCL,2)+' L/h'],
      ['CL P5–P95',fmt(post.clCI[0],1)+'–'+fmt(post.clCI[1],1)+' L/h'],
      ['E[V]',fmt(post.meanV,1)+' L']
    ].map(([name,value])=>'<div><span>'+name+'</span><strong>'+value+'</strong></div>').join('');
    distribution($('mipd-post-chart'),P0,post);
    $('mipd-workspace').querySelectorAll('[data-mipd-post]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.mipdPost===n)));
  }
  $('mipd-workspace').querySelectorAll('[data-mipd-post]').forEach(b=>b.addEventListener('click',()=>draw(+b.dataset.mipdPost)));
  draw(0);
}
function doseRow(item){
  return '<tr data-selected="'+(selectedDose===item.dose)+'"><td><button type="button" class="career-action" data-mipd-dose="'+item.dose+'" aria-pressed="'+(selectedDose===item.dose)+'">'+fmt(item.dose,0)+' mg</button></td>'+
    '<td>'+fmt(item.auc,0)+' mg·h/L</td><td>'+fmt(item.p*100,0)+' %</td><td>'+fmt(item.excess*100,0)+' %</td></tr>';
}
function stage3(){
  $('mipd-workspace').innerHTML=story('Le posterior individuel vient de deux concentrations fictives. Vous pouvez désormais comparer <strong>plusieurs doses</strong> sur un intervalle de 12 h, en tenant compte de l’incertitude sur CL. Essayez d’atteindre la zone d’AUC24 pédagogique avec une probabilité d’au moins <strong>68 %</strong>.','PRÉVISION · SCÉNARIO FICTIF')+
    metrics([['CL posterior moyen',fmt(P2.meanCL,2)+' L/h'],['Cible AUC24',fmt(CASE.targetLow,0)+'–'+fmt(CASE.targetHigh,0)],['Confiance du jeu','≥ 68 %']])+
    '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Dose q12h</th><th>E[AUC24]</th><th>P(cible)</th><th>P(au-dessus)</th></tr></thead><tbody id="mipd-dose-rows"></tbody></table></div>'+
    '<svg id="mipd-dose-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Profil moyen simulé à l’état stationnaire"></svg>'+
    '<p id="mipd-dose-caption" class="career-note">Sélectionnez une dose fictive pour afficher sa courbe. Aucun choix n’est prévalidé.</p>';
  function draw(){
    const rows=candidateDoses(P2);
    $('mipd-dose-rows').innerHTML=rows.map(doseRow).join('');
    const dose=selectedDose??CASE.dose,curve=simulatorCurve(P2,dose);
    graph($('mipd-dose-chart'),[{values:curve,color:'#9cebd5'}],{maxTime:12,high:42});
    if(selectedDose!==null){
      const r=doseEvaluation(P2,selectedDose);
      $('mipd-dose-caption').textContent='Pour '+selectedDose+' mg q12h, l’AUC24 moyenne simulée est '+fmt(r.auc,0)+
        ' mg·h/L, avec P(440–560) ≈ '+fmt(r.p*100,0)+' %. Répartition dépendante du modèle.';
    }
  }
  $('mipd-dose-rows').addEventListener('click',e=>{
    const b=e.target.closest('[data-mipd-dose]');if(!b)return;selectedDose=+b.dataset.mipdDose;draw();
  });draw();
}
function stage4(){
  $('mipd-workspace').innerHTML=story('Quelques jours plus tard, l’élimination pourrait ralentir. Simulez un scénario où <strong>CL diminue de 40 %</strong>, sans prétendre connaître ce changement à l’avance. Quelle dose parmi les propositions limiterait au mieux l’exposition, si cette hypothèse était correcte ?','SCÉNARIO WHAT-IF · SURVEILLANCE')+
    metrics([['CL avant hypothèse',fmt(P2.meanCL,2)+' L/h'],['CL multipliée par','0,60'],['Dose antérieure',fmt(selectedDose??900,0)+' mg']])+
    '<div class="career-alert">Les probabilités de ce tableau sont <strong>conditionnelles à une baisse imposée de CL</strong>. En pratique, de nouveaux prélèvements et une réévaluation sont nécessaires : ce n’est pas un nouveau posterior.</div>'+
    '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Dose fictive</th><th>AUC24 moyenne</th><th>Probabilité cible</th></tr></thead><tbody id="mipd-shift-rows"></tbody></table></div>'+
    '<p id="mipd-shift-caption" class="career-note">Sélectionnez une stratégie pour tester cette hypothèse, puis qualifiez-la.</p>';
  const options=candidateDoses(P2,.6);
  const draw=()=>{
    $('mipd-shift-rows').innerHTML=options.map(x=>
      '<tr data-selected="'+(x.dose===afterShiftDose)+'"><td><button class="career-action" type="button" data-shift-dose="'+x.dose+
      '" aria-pressed="'+(x.dose===afterShiftDose)+'">'+fmt(x.dose,0)+' mg q12h</button></td><td>'+
      fmt(x.auc,0)+' mg·h/L</td><td>'+fmt(x.p*100,0)+' %</td></tr>'
    ).join('');
    if(afterShiftDose!==null)$('mipd-shift-caption').textContent='Simulation conditionnelle : dose '+afterShiftDose+
      ' mg, probabilité cible '+fmt(options.find(x=>x.dose===afterShiftDose).p*100,0)+' %. À confirmer avec des mesures à jour.';
  };
  $('mipd-shift-rows').addEventListener('click',e=>{
    const b=e.target.closest('[data-shift-dose]');if(!b)return;afterShiftDose=+b.dataset.shiftDose;draw();
  });draw();
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
  const best=chooseDose(P2);
  const shift=chooseDose(P2,.6);
  return 'PMx Game — Étude MIPD purement pédagogique\n'+
    'Antibiotique V fictif : perfusion IV 1 h q12h, 750 mg. AUC24 cible inventée : 440–560 mg·h/L.\n'+
    'Prior : CL médiane 4,5 L/h, V médian 32 L ; distribution lognormale et résidu hétéroscédastique.\n'+
    'Dosages simulés : 2 h = '+fmt(OBSERVATIONS[0].value,2)+' mg/L ; 11 h = '+fmt(OBSERVATIONS[1].value,2)+' mg/L.\n'+
    'MAP sur grille intégrée : E[CL] = '+fmt(P2.meanCL,2)+' L/h (P5–P95 : '+fmt(P2.clCI[0],1)+'–'+fmt(P2.clCI[1],1)+').\n'+
    'Enseignement : la grille fictive favorise '+best.dose+' mg q12h, P(cible) ≈ '+fmt(best.p*100,0)+
    ' % ; sous l’hypothèse CL ×0,6, dose de la grille '+shift.dose+' mg q12h, P(cible) ≈ '+fmt(shift.p*100,0)+' %.\n'+
    'Ces doses ne sont PAS des recommandations cliniques. Le modèle n’est pas validé, les cibles sont inventées, les observations sont fictives et le changement de CL n’a pas été estimé à partir de nouveaux prélèvements.\n'+
    'Le modèle MIPD Engine clinique n’a pas été appelé.';
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
    'Choisissez deux prélèvements avec temps connu, après perfusion et en fin d’intervalle.',
    'Explorez les trois états de connaissance (a priori, un dosage, deux dosages).',
    'La probabilité de cible est calculée sous l’incertitude postérieure, pas à partir de la seule CL moyenne.',
    'Une nouvelle clairance hypothétique impose une nouvelle projection, pas une prescription immédiate.',
    'La limite d’un modèle est une partie du résultat, pas une note de bas de page.'
  ];
  const hints=[
    'Une structure, un jeu de données et une cible doivent être adaptés à l’indication avant le calcul.',
    'Une mesure tôt après la fin de la perfusion et une mesure proche du creux ont des informations complémentaires.',
    'La distribution verte devient plus concentrée lorsqu’on apporte davantage d’observations informatives.',
    'Cherchez une option qui passe la barre pédagogique de 68 % ; sans dosages, aucune n’y parvenait.',
    'Le modèle est toujours à confronter à des nouveaux dosages : cette étape simule un what-if.',
    'Le modèle fictif n’a pas d’usage clinique ; privilégiez vérification, suivi et validation.'
  ];
  $('mipd-help').textContent=help[index];$('mipd-hint-text').textContent=hints[index];
  [stage0,stage1,stage2,stage3,stage4,stage5][index]();
  nav();
}
function select(i){
  if(i<0||i>=STEPS.length||i>done.length)return;
  index=i;viewed.clear();selectedDose=null;afterShiftDose=null;render();
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
    const v=[...w.querySelectorAll('input[name="mipd-samples"]:checked')].map(e=>e.value);
    return sampleTimingGrade(v)?success('Deux prélèvements correctement horodatés peuvent renseigner les paramètres de disposition.'):
      failure('Choisissez deux instants horodatés, complémentaires au sein du même intervalle.');
  }
  if(index===2){
    const ans=w.querySelector('input[name="mipd-choice"]:checked')?.value;
    return viewed.has(0)&&viewed.has(1)&&viewed.has(2)&&ans==='bayes'?
      success('Après deux dosages, l’intervalle crédible de CL se resserre dans ce cas simulé.'):
      failure('Explorez a priori, une observation et deux observations, puis distinguez réduction d’incertitude et certitude.');
  }
  if(index===3){
    if(selectedDose===null)return failure('Sélectionnez une dose de la grille.');
    const r=doseEvaluation(P2,selectedDose);
    return r.within?success('Cette dose atteint la cible fictive avec une probabilité postérieure de '+fmt(r.p*100,0)+' %.'):
      failure('La probabilité de cible reste insuffisante. Une moyenne AUC dans la fenêtre ne garantit pas une probabilité élevée.');
  }
  if(index===4){
    if(afterShiftDose===null)return failure('Choisissez une option sous la nouvelle hypothèse de CL.');
    const r=doseEvaluation(P2,afterShiftDose,{clMultiplier:.6});
    return r.within?success('Hypothèse retenue sur la grille fictive, mais à confirmer par de nouveaux dosages et une réévaluation MAP.'):
      failure('Cette option ne franchit pas la probabilité requise sous l’hypothèse CL ×0,6.');
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

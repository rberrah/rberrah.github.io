// PMx Game track 4: bounded MAP-BE pharmacometrics, fictional infusion antibiotic.
// Never expose this widget as a patient dose calculator or link it as clinical MIPD Engine.
import {CASE,DOSES,OBSERVATIONS,infusionAt,posterior,doseEvaluation,candidateDoses,chooseDose,
  simulatorCurve,sampleTimingGrade,qualityGate,TARGETS,exposureAtSS,gradeDoseGoal,gradeCLChange,assessGivenSamplePlan} from './mipd-course-core.js';
const $=id=>document.getElementById(id);
const STEPS=[
  {title:'Recevoir le dossier',chapter:'Audit du modèle',desc:'Vérifier le caractère fictif du modèle et ce qui manque à une décision clinique.'},
  {title:'Auditer le plan de prélèvement',chapter:'Stratégie TDM',desc:'Juger un plan de dosages déjà prescrit, selon le modèle et la perfusion.'},
  {title:'Actualisation MAP-BE',chapter:'Inférence individuelle',desc:'Observer comment deux concentrations modifient la distribution des paramètres.'},
  {title:'Tester une posologie',chapter:'Prévision PK/PD',desc:'Choisir AUC, C0 ou temps >2×CMI, puis confronter la cible au risque toxique.'},
  {title:'Et si CL change ?',chapter:'Projection dynamique',desc:'Conserver l’AUC peut provoquer une C0 toxique : trouvez un compromis explicite.'},
  {title:'Décision responsable',chapter:'Sécurité et rapport',desc:'Identifier les étapes nécessaires avant toute véritable utilisation clinique.'}
];
const KEY='pmx-game-mipd-v1';
const read=()=>{try{
  const x=JSON.parse(localStorage.getItem(KEY)||'null');
  if(Array.isArray(x)){const r=[];for(let i=0;i<STEPS.length;i++){if(x.includes(i))r.push(i);else break;}return r;}
}catch{}return [];};
let done=read(),index=Math.min(done.length,STEPS.length-1),selectedDose=null;
let viewed=new Set(),observationsSelected=new Set(),decision=null,afterShiftDose=null;
let aucAdjustedDose=null,goalSelection=null;
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
  if(Array.isArray(opts.thresholds)){
    for(const mark of opts.thresholds){
      if(!Number.isFinite(mark.value)||mark.value<0||mark.value>high)continue;
      const yy=y(mark.value);
      s+='<path d="M65 '+yy+' H689" fill="none" stroke="'+mark.color+'" stroke-width="2.4" stroke-dasharray="7 5"/>'+
       '<text x="682" y="'+(yy-5)+'" text-anchor="end" fill="'+mark.color+'" font-weight="750" font-size="13">'+mark.label+'</text>';
    }
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
 $('mipd-workspace').innerHTML=story('Le plan du service est déjà prescrit. La perfusion IV dure <strong>1 h</strong>, le modèle fictif est 1C et le patient est supposé à l’état stationnaire sous des doses q12h. Deux concentrations sont prévues : <strong>2 h et 11 h après le début</strong>. Votre rôle n’est pas de fixer ces horaires, mais d’évaluer leur pertinence et les informations nécessaires.','AUDIT DU PLAN RÉELLEMENT PROPOSÉ')+
 metrics([['Fin perfusion','1 h'],['Dosage A','2 h après début'],['Dosage B','11 h après début']])+
 '<div class="career-flow"><div>Perfusion 0–1 h</div><span>→</span><div>Prélèvement 2 h</div><span>→</span><div>Prélèvement 11 h</div></div>'+
 '<p class="career-note">Le plan peut être informatif dans cet exemple 1C IV, mais son optimalité, sa nécessité ou sa suffisance <strong>ne se généralisent pas</strong> à un autre modèle, une autre voie, une perfusion plus longue ou une autre stratégie MIPD.</p>'+
 choices([['conditional','Plan raisonnable dans ce scénario si les horaires, le modèle, l’administration et l’état stationnaire sont vérifiés ; pas de règle universelle.'],
 ['universal','Ce couple d’horaires est toujours le meilleur quel que soit le modèle PK ou le médicament.'],
 ['insufficient','Deux dosages après perfusion ne peuvent jamais informer simultanément CL et V.']],'mipd-plan');
}
function stage2(){
 $('mipd-workspace').innerHTML=story('Le <strong>prior populationnel reste identique</strong>. Chaque observation ajoute un terme à la vraisemblance et modifie le <strong>posterior individuel</strong>. Explorez la distribution sans mesure, avec un dosage, puis deux. Le calcul marginalise réellement une grille CL × V.','BAYES · PRIOR + LIKELIHOOD = POSTERIOR')+
 '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Heure depuis début perfusion</th><th>Concentration fictive</th></tr></thead><tbody>'+
 OBSERVATIONS.map(o=>'<tr><td>'+fmt(o.t,0)+' h</td><td>'+fmt(o.value,2)+' mg/L</td></tr>').join('')+'</tbody></table></div>'+
 '<div class="career-model-buttons"><button data-mipd-post="0">Prior seul</button><button data-mipd-post="1">Posterior · 1 dosage</button><button data-mipd-post="2">Posterior · 2 dosages</button></div>'+
 '<div id="mipd-post-metrics" class="career-metrics"></div>'+
 '<div class="career-legend" aria-label="Légende histogramme"><span><i style="background:#48757d"></i> Prior populationnel (inchangé)</span><span><i style="background:#a2efce"></i> Distribution avec observations sélectionnées</span></div>'+
 '<svg id="mipd-post-chart" class="career-chart" viewBox="0 0 730 275" role="img" aria-label="Histogramme marginal CL avant et après les dosages; prior gris-bleu et posterior vert"></svg>'+
 '<p class="career-note">Histogrammes = distributions <strong>marginales de CL</strong>, intégrant les valeurs possibles de V. MAP est le mode conjoint CL,V du quadrillage ; la moyenne postérieure et les quantiles sont des statistiques distinctes. La loi a priori utilisée est strictement la même sur les trois états.</p>'+
 choices([['prior-fixed','Le prior reste fixe ; les dosages modifient la vraisemblance et donc le posterior individuel.'],
 ['prior-changes','Les dosages modifient d’abord la loi a priori de la population.'],
 ['certain','Après deux dosages, les paramètres individuels deviennent certains.']]);
 function draw(n){
  viewed.add(n);
  const post=[P0,P1,P2][n];
  $('mipd-post-metrics').innerHTML=[
   ['E[CL]',fmt(post.meanCL,2)+' L/h'],
   ['MAP(CL)',fmt(post.mapCL,2)+' L/h'],
   ['CL P5–P95',fmt(post.clCI[0],1)+'–'+fmt(post.clCI[1],1)+' L/h'],
   ['MAP(V)',fmt(post.mapV,1)+' L']
  ].map(([name,val])=>'<div><span>'+name+'</span><strong>'+val+'</strong></div>').join('');
  distribution($('mipd-post-chart'),P0,post);
  $('mipd-workspace').querySelectorAll('[data-mipd-post]').forEach(b=>
   b.setAttribute('aria-pressed',String(+b.dataset.mipdPost===n)));
 }
 $('mipd-workspace').querySelectorAll('[data-mipd-post]').forEach(b=>b.addEventListener('click',()=>draw(+b.dataset.mipdPost)));
 draw(0);
}
function doseRow(item){
 const e=exposureAtSS(P2,item.dose);
 return '<tr data-selected="'+(selectedDose===item.dose)+'"><td><button type="button" class="career-action" data-mipd-dose="'+item.dose+'" aria-pressed="'+(selectedDose===item.dose)+'">'+fmt(item.dose,0)+' mg</button></td>'+
 '<td>'+fmt(e.auc24,0)+'</td><td>'+fmt(e.c0,1)+'</td><td>'+fmt(e.fT2MIC*100,0)+' %</td>'+
 '<td>'+(e.toxic?'<strong class="career-danger">Toxique*</strong>':'Sous plafond*')+'</td></tr>';
}
function stage3(){
 $('mipd-workspace').innerHTML=story('Le modèle MAP-BE individuel est disponible. Choisissez <strong>une cible de décision</strong> : AUC24, C0 ou part de l’intervalle au-dessus de 2×CMI. Puis examinez les concentrations sur 12 h et la contrainte de <strong>C0 toxique</strong>. Le choix doit satisfaire votre cible <em>et</em> respecter le plafond.','EXERCICE PK/PD · BÉNÉFICE / RISQUE')+
 '<div class="career-metrics">'+
  [['AUC24 fictive',fmt(TARGETS.aucLow,0)+'–'+fmt(TARGETS.aucHigh,0)+' mg·h/L'],
   ['C0 fictive',fmt(TARGETS.troughLow,0)+'–'+fmt(TARGETS.troughHigh,0)+' mg/L'],
   ['CMI fictive',fmt(TARGETS.mic,0)+' mg/L'],
   ['Plafond toxique C0','≥ '+fmt(TARGETS.toxicTrough,0)+' mg/L']
  ].map(([name,val])=>'<div><span>'+name+'</span><strong>'+val+'</strong></div>').join('')+'</div>'+
 '<fieldset class="career-goal-choice"><legend>Quel objectif souhaitez-vous atteindre ?</legend>'+
 choices([['auc','AUC24 dans la fenêtre pédagogique, avec probabilité ≥68 % sur le posterior de CL.'],
 ['c0','C0 entre 8 et 11 mg/L à partir du profil individuel moyen.'],
 ['ft','Concentration au-dessus de 2×CMI pendant au moins 90 % de l’intervalle.']],'mipd-goal')+'</fieldset>'+
 '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Dose q12h</th><th>AUC24</th><th>C0</th><th>fT > 2×CMI</th><th>C0 toxique*</th></tr></thead><tbody id="mipd-dose-rows"></tbody></table></div>'+
 '<div class="career-legend"><span><i style="background:#9cebd5"></i> Concentration prédite</span>'+
 '<span><i style="background:#98bad8"></i> CMI = '+TARGETS.mic+' mg/L</span>'+
 '<span><i style="background:#e5c288"></i> 2×CMI = '+TARGETS.twiceMIC+' mg/L</span>'+
 '<span><i style="background:#f08b90"></i> C0 toxique ≥ '+TARGETS.toxicTrough+' mg/L</span></div>'+
 '<svg id="mipd-dose-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Concentration à l’état stationnaire avec lignes CMI, 2 fois CMI et seuil C0 toxique"></svg>'+
 '<p id="mipd-dose-caption" class="career-note">Choisissez d’abord un critère puis une dose. Les seuils du jeu n’ont pas d’interprétation clinique.</p>'+
 '<p class="career-note">*Un plafond appliqué à C0 (résiduel) : une courbe peut dépasser cette valeur pendant l’intervalle sans signifier une C0 toxique. Le profil affiché utilise E[CL] et E[V] ; seule la probabilité d’AUC intègre ici toute la grille postérieure.</p>';
 function draw(){
  $('mipd-dose-rows').innerHTML=candidateDoses(P2).map(doseRow).join('');
  const dose=selectedDose??CASE.dose;
  const curve=simulatorCurve(P2,dose);
  graph($('mipd-dose-chart'),[{values:curve,color:'#9cebd5'}],{maxTime:12,high:55,
   thresholds:[
    {value:TARGETS.mic,color:'#98bad8',label:'CMI'},
    {value:TARGETS.twiceMIC,color:'#e5c288',label:'2×CMI'},
    {value:TARGETS.toxicTrough,color:'#f08b90',label:'C0 toxique'}
   ]});
  if(selectedDose!==null){
   const e=exposureAtSS(P2,selectedDose);
   $('mipd-dose-caption').textContent='Simulation '+selectedDose+' mg q12h : AUC24 ≈'+fmt(e.auc24,0)+
    ' mg·h/L ; C0 ≈'+fmt(e.c0,1)+' mg/L ; temps >2×CMI ≈'+fmt(e.fT2MIC*100,0)+' % ;'+
    (e.toxic?' C0 au-dessus du plafond fictif.':' C0 sous le plafond fictif.');
  }
 }
 $('mipd-dose-rows').addEventListener('click',e=>{
  const button=e.target.closest('[data-mipd-dose]');if(!button)return;
  selectedDose=Number(button.dataset.mipdDose);draw();
 });
 draw();
}
function stage4(){
 const first=exposureAtSS(P2,TARGETS.baselineDose);
 $('mipd-workspace').innerHTML=story('Dans un <strong>nouveau scénario indépendant</strong>, une posologie de référence de 900 mg q12h avait une AUC24 et une C0 satisfaisantes. On suppose maintenant <strong>CL diminuée de 40 %</strong>, sans modification de V. Trouvez d’abord la dose qui <strong>conserve l’AUC</strong> puis celle qui ramène <strong>C0 dans la zone souhaitée</strong> sans franchir le plafond toxique.','WHAT-IF · CONFLIT ENTRE AUC ET C0')+
 '<div class="career-metrics">'+[['Dose de référence','900 mg / 12 h'],
 ['CL initiale',fmt(first.cl,2)+' L/h'],['Nouvelle CL','×0,60'],
 ['AUC24 antérieure',fmt(first.auc24,0)+' mg·h/L'],
 ['C0 antérieure',fmt(first.c0,1)+' mg/L'],
 ['Plafond C0 toxique',fmt(TARGETS.toxicTrough,0)+' mg/L']].map(([name,val])=>
  '<div><span>'+name+'</span><strong>'+val+'</strong></div>').join('')+'</div>'+
 '<div class="career-field-grid"><label><span>1. Dose pour conserver l’AUC24</span><select id="mipd-auc-adjust"><option value="">Votre choix…</option>'+
 TARGETS.saferDoses.map(d=>'<option value="'+d+'">'+d+' mg q12h</option>').join('')+'</select></label>'+
 '<label><span>2. Dose pour viser C0 = 8–11 mg/L</span><select id="mipd-c0-adjust"><option value="">Votre choix…</option>'+
 TARGETS.saferDoses.map(d=>'<option value="'+d+'">'+d+' mg q12h</option>').join('')+'</select></label></div>'+
 '<p class="career-note">Rappel : <strong>AUC24 ∝ dose/CL</strong> en PK linéaire. Ce raisonnement n’impose pas que C0 varie dans le même rapport. Aucune probabilité n’est affichée ici : les calculs sont les prédictions centrales sous CL ×0,6.</p>'+
 '<div id="mipd-shift-comparison" class="career-metrics"></div>'+
 '<div class="career-legend"><span><i style="background:#9cebd5"></i> Scénario après baisse CL</span>'+
 '<span><i style="background:#e5c288"></i> 2×CMI</span><span><i style="background:#f08b90"></i> C0 toxique</span></div>'+
 '<svg id="mipd-shift-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="Concentrations après changement de clairance et dose sélectionnée"></svg>'+
 '<p class="career-alert">Vous pourrez constater un conflit : une dose peut conserver l’AUC mais produire une C0 excessive. La dose qui corrige C0 peut alors sous-exposer selon l’AUC. Aucun ajustement automatique unique n’est toujours approprié. Une réévaluation clinique et TDM serait nécessaire dans la réalité.</p>';
 function draw(){
  const dose=afterShiftDose??aucAdjustedDose??TARGETS.baselineDose;
  const vals=exposureAtSS(P2,dose,TARGETS.changedClMultiplier);
  const lines=[];
  if(aucAdjustedDose!==null){
   const a=exposureAtSS(P2,aucAdjustedDose,TARGETS.changedClMultiplier);
   lines.push(['Pour conserver AUC',fmt(a.auc24,0)+' mg·h/L']);
   lines.push(['C0 à cette dose',fmt(a.c0,1)+' mg/L'+(a.toxic?' · toxique*':'')]);
  }
  if(afterShiftDose!==null){
   const b=exposureAtSS(P2,afterShiftDose,TARGETS.changedClMultiplier);
   lines.push(['Pour viser C0',fmt(b.c0,1)+' mg/L']);
   lines.push(['AUC à cette dose',fmt(b.auc24,0)+' mg·h/L']);
  }
  $('mipd-shift-comparison').innerHTML=lines.map(([name,val])=>
   '<div><span>'+name+'</span><strong>'+val+'</strong></div>').join('');
  const curve=simulatorCurve(P2,dose,TARGETS.changedClMultiplier);
  graph($('mipd-shift-chart'),[{values:curve,color:'#9cebd5'}],{maxTime:12,high:55,
   thresholds:[{value:TARGETS.twiceMIC,color:'#e5c288',label:'2×CMI'},
   {value:TARGETS.toxicTrough,color:'#f08b90',label:'Plafond C0'}]});
 }
 $('mipd-auc-adjust').addEventListener('change',e=>{aucAdjustedDose=e.target.value?Number(e.target.value):null;draw();});
 $('mipd-c0-adjust').addEventListener('change',e=>{afterShiftDose=e.target.value?Number(e.target.value):null;draw();});
 draw();
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
  const best=gradeDoseGoal(P2,900,'auc');
  const scenario=gradeCLChange(P2,540,450);
  return 'PMx Game — MIPD, scénario intégralement fictif et non prescriptif\n'+
    'Perfusion IV 1 h q12h, posologie initiale 750 mg. Modèle théorique 1C et objectifs pédagogiques inventés.\n'+
    'Dosages du plan préexistant : 2 h = '+fmt(OBSERVATIONS[0].value,2)+' mg/L, 11 h = '+fmt(OBSERVATIONS[1].value,2)+' mg/L.\n'+
    'Le prior populationnel n’est pas modifié ; les observations changent la likelihood et donc le posterior.\n'+
    'MAP(CL) '+fmt(P2.mapCL,2)+' L/h, MAP(V) '+fmt(P2.mapV,1)+' L ; E[CL] '+fmt(P2.meanCL,2)+
      ' L/h (P5–P95 : '+fmt(P2.clCI[0],1)+'–'+fmt(P2.clCI[1],1)+' L/h).\n'+
    'Trois objectifs fictifs distincts : AUC24 '+TARGETS.aucLow+'–'+TARGETS.aucHigh+
      ' mg·h/L ; C0 '+TARGETS.troughLow+'–'+TARGETS.troughHigh+
      ' mg/L ; temps >2×CMI (CMI='+TARGETS.mic+' mg/L) ≥'+fmt(TARGETS.minFractionAbove2MIC*100,0)+' %.\n'+
    'Plafond toxique de C0 inventé : '+TARGETS.toxicTrough+' mg/L.\n'+
    'Exemple 900 mg q12h avant baisse de CL : AUC24 '+fmt(best.auc24,0)+
     ' mg·h/L, C0 '+fmt(best.c0,1)+' mg/L, temps >2×CMI '+fmt(best.fT2MIC*100,0)+' %.\n'+
    'Sous CL×0,6 : pour conserver l’AUC (540 mg), C0 '+fmt(scenario.preserveAuc.c0,1)+
     ' mg/L, au-dessus du plafond ; pour revenir dans la cible C0 (450 mg), AUC24 '+fmt(scenario.preserveTrough.auc24,0)+
     ' mg·h/L, sous la fenêtre d’AUC du jeu. Un compromis exige une réévaluation des objectifs et de l’information individuelle.\n'+
    'La modélisation par moyennes pour C0/fT ne remplace pas des probabilités d’atteinte, et CL×0,6 n’est pas un posterior réestimé.\n'+
    'AUC, C0 et fT issus des paramètres fictifs ; aucune cible, concentration toxique ou dose ne peut être appliquée à un patient. MIPD Engine clinique non appelé.';
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
    'Jugez le plan déjà proposé en fonction du modèle 1C IV, de la durée de perfusion et des horaires réels.',
    'Explorez les trois états de connaissance (a priori, un dosage, deux dosages).',
    'La probabilité de cible est calculée sous l’incertitude postérieure, pas à partir de la seule CL moyenne.',
    'Après changement de CL, comparez le maintien de l’AUC et le maintien d’une C0 acceptable : les contraintes peuvent entrer en conflit.',
    'La limite d’un modèle est une partie du résultat, pas une note de bas de page.'
  ];
  const hints=[
    'Une structure, un jeu de données et une cible doivent être adaptés à l’indication avant le calcul.',
    'L’horaire dépend de la structure du modèle, de la durée de perfusion et du contexte : il faut auditer les horaires donnés, pas les inventer.',
    'La distribution a priori reste la même ; seules les vraisemblances apportées par les observations changent le posterior.',
    'Pour l’AUC, examinez les probabilités ; pour C0 et fT>2×CMI, les courbes sont calculées au paramètre central et le plafond C0 reste obligatoire.',
    'En PK linéaire AUC24 = Dose quotidienne/CL : conserver l’AUC après une baisse de CL peut malgré tout conduire à une C0 toxique.',
    'Le modèle fictif n’a pas d’usage clinique ; privilégiez vérification, suivi et validation.'
  ];
  $('mipd-help').textContent=help[index];$('mipd-hint-text').textContent=hints[index];
  [stage0,stage1,stage2,stage3,stage4,stage5][index]();
  nav();
}
function select(i){
  if(i<0||i>=STEPS.length||i>done.length)return;
  index=i;viewed.clear();selectedDose=null;afterShiftDose=null;aucAdjustedDose=null;render();
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
    const reason=w.querySelector('input[name="mipd-plan"]:checked')?.value;
    return assessGivenSamplePlan(reason)?success('Plan acceptable dans ce modèle IV 1C si horaires et administrations sont exacts ; sa pertinence doit toujours être discutée selon le modèle.'):
      failure('Les heures de prélèvement ne sont pas universelles. Vérifiez type de modèle, perfusion, dose, calendrier et données réellement disponibles.');
  }
  if(index===2){
    const ans=w.querySelector('input[name="mipd-choice"]:checked')?.value;
    return viewed.has(0)&&viewed.has(1)&&viewed.has(2)&&ans==='prior-fixed'?
      success('Après deux dosages, l’intervalle crédible de CL se resserre dans ce cas simulé.'):
      failure('Explorez a priori, une observation et deux observations, puis distinguez réduction d’incertitude et certitude.');
  }
  if(index===3){
    if(selectedDose===null)return failure('Sélectionnez une dose de la grille.');
    const goal=w.querySelector('input[name="mipd-goal"]:checked')?.value;
    if(!goal)return failure('Choisissez d’abord un critère : AUC24, C0 ou temps >2×CMI.');
    const r=gradeDoseGoal(P2,selectedDose,goal);
    return r.ok?success('Critère fictif atteint sans dépasser le plafond de C0. Les autres objectifs peuvent conduire à une décision différente.'):
      failure('La dose ne satisfait pas votre critère ou atteint le plafond de C0 toxique du jeu. Analysez les courbes et les valeurs.');
  }
  if(index===4){
    if(aucAdjustedDose===null||afterShiftDose===null)return failure('Sélectionnez les deux stratégies : une pour conserver l’AUC, une pour viser la C0.');
    const r=gradeCLChange(P2,aucAdjustedDose,afterShiftDose);
    return r.ok?success('Conserver l’AUC peut rendre C0 toxique ; viser une C0 sûre peut réduire l’AUC. Le compromis ne se résout pas par une proportionnalité unique.'):
      failure('Cherchez la dose proportionnelle à la baisse de CL pour l’AUC, puis vérifiez séparément la cible C0. Les deux choix peuvent être différents.');
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

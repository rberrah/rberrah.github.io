// PMx Game path 4 — MPA after heart transplantation (fictional patient).
// The numeric target is documented; the structural model and observations are
// deliberately simulated, and not an externally validated MPA PopPK model.
import {CASE,OBSERVATIONS,SAMPLING_TIMES,posterior,doseMetrics,scenarioComparison,
  mpaConcentration,qualityGate} from './mipd-course-core.js';
const $=id=>document.getElementById(id);
const tr=(fr,en)=>lang()==='en'?en:fr;
function lang(){
 const selected=new URLSearchParams(location.search).get('lang');
 let stored='fr';try{stored=localStorage.getItem('pharmacometrie-language')||'fr';}catch{}
 return selected==='en'||!selected&&(document.documentElement.lang==='en'||stored==='en')?'en':'fr';
}
const fmt=(v,n=1)=>Number(v).toLocaleString(lang()==='en'?'en-US':'fr-FR',
 {minimumFractionDigits:n,maximumFractionDigits:n});
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STEPS=[
 {title:['Le dossier de greffe','The transplant case'],chapter:['Contexte','Clinical context'],
  desc:['Choisir le bon indicateur d’exposition du MPA en transplantation cardiaque.','Choose an exposure endpoint for MPA after heart transplantation.']},
 {title:['Évaluer un plan de prélèvement','Assess a sampling schedule'],chapter:['Stratégie STP','Sampling strategy'],
  desc:['Interpréter les heures proposées pour une estimation d’AUC.','Assess proposed sampling times for estimating AUC.']},
 {title:['Actualisation MAP-BE','MAP Bayesian update'],chapter:['Inférence individuelle','Individual inference'],
  desc:['Passer de la distribution de population au posterior individuel.','Update the population distribution using individual observations.']},
 {title:['Modifier IIV, RUV et le prior','Change IIV, RUV and prior'],chapter:['Analyse de sensibilité','Sensitivity analysis'],
  desc:['Tester l’effet du poids du prior et de l’erreur résiduelle sur l’estimation.','Explore the effect of the prior weight and residual error.']},
 {title:['Tester une posologie','Test a dosing regimen'],chapter:['AUC du MPA','MPA AUC'],
  desc:['Choisir librement une dose et interpréter l’AUC et la C0.','Enter a dose and interpret AUC and trough concentration.']},
 {title:['Et si la clairance change ?','What if clearance changes?'],chapter:['Scénario prospectif','Prospective scenario'],
  desc:['Proposer une nouvelle dose et vérifier l’AUC plutôt que choisir une réponse prédéfinie.','Enter a revised dose and reassess AUC after a clearance change.']},
 {title:['Compte rendu pharmacométrique','Pharmacometric report'],chapter:['Synthèse du dossier','Case summary'],
  desc:['Conclure sur exposition, incertitude, sensibilité et limites des estimations.','Conclude on exposure, uncertainty, sensitivity and model limitations.']}
];
const KEY='pmx-game-mipd-mpa-v3';
function read(){
 try{
  const raw=JSON.parse(localStorage.getItem(KEY)||'null');if(!Array.isArray(raw))return [];
  let done=[];for(let i=0;i<STEPS.length;i++){if(raw.includes(i))done.push(i);else break;}return done;
 }catch{return [];}
}
let done=read(),index=Math.min(done.length,STEPS.length-1),selectedDose=1000,revisedDose=600;
let sampleView=new Set(),sensitivityIIV=1,sensitivityRUV=.12,priorWeight=1,doseTouched=false;
let sensitivityChanged=new Set(),interpretation='';
const P0=posterior({samples:0}),P1=posterior({samples:1}),P3=posterior({samples:3});
function currentPosterior(){
 return posterior({samples:3,omegaFactor:sensitivityIIV,ruvCV:sensitivityRUV,priorWeight});
}
function dosePost(){return currentPosterior();}
function story(fr,en,kickerFr='DOSSIER CLINIQUE',kickerEn='CLINICAL CASE'){
 return '<div class="career-story"><span class="career-eyebrow">'+tr(kickerFr,kickerEn)+
  '</span><p>'+tr(fr,en)+'</p></div>';
}
function metric(label,value){return '<div><span>'+label+'</span><strong>'+value+'</strong></div>';}
function metrics(rows){return '<div class="career-metrics">'+rows.map(r=>metric(r[0],r[1])).join('')+'</div>';}
function options(list,name){
 return '<div class="career-choices" role="radiogroup">'+list.map(item=>'<label><input type="radio" name="'+name+
  '" value="'+item[0]+'"><span>'+tr(item[1],item[2])+'</span></label>').join('')+'</div>';
}
function chart(svg,series,{maxTime=12,high=20,dots=[],bands=[]}={}){
 const x=t=>64+t/maxTime*626,y=c=>243-c/high*201;
 let out='<rect x="64" y="42" width="626" height="201" rx="9" fill="#0b2630"/>';
 for(let i=0;i<=4;i++){
  out+='<path d="M64 '+y(high*i/4)+' H690" stroke="#43636c" stroke-dasharray="4 5"/>'+
   '<text x="54" y="'+(y(high*i/4)+4)+'" fill="#c3d8d0" text-anchor="end" font-size="11">'+fmt(high*i/4,1)+'</text>'+
   '<text x="'+x(maxTime*i/4)+'" y="261" fill="#c3d8d0" text-anchor="middle" font-size="11">'+fmt(maxTime*i/4,1)+'</text>';
 }
 for(const b of bands){
  const pts=[...b.lower,...b.upper.slice().reverse()].map(p=>x(p.t).toFixed(1)+','+y(p.c).toFixed(1)).join(' ');
  out+='<polygon points="'+pts+'" fill="'+(b.color||'#87dfc3')+'" opacity=".15"/>';
 }
 for(const entry of series){
  out+='<polyline fill="none" stroke="'+(entry.color||'#87dfc3')+
   '" stroke-width="'+(entry.width||3)+'" points="'+entry.values.map(p=>x(p.t).toFixed(1)+','+y(p.c).toFixed(1)).join(' ')+'"/>';
 }
 for(const p of dots){out+='<circle cx="'+x(p.t)+'" cy="'+y(p.c||p.value)+'" r="5" fill="#f8c48f" stroke="#17323a" stroke-width="1.5"/>';}
 svg.innerHTML=out+'<text x="65" y="26" fill="#d3e8e0" font-size="12">'+tr('Concentration totale MPA (mg/L)','Total MPA concentration (mg/L)')+
  '</text><text x="376" y="280" text-anchor="middle" fill="#c4dad2" font-size="12">'+tr('Temps après prise (h)','Time after dose (h)')+'</text>';
}
function marginal(post,key){
 const result=new Map();
 for(const row of post.rows){
  const x=row[key];result.set(x,(result.get(x)||0)+row.w);
 }
 return [...result].sort((a,b)=>a[0]-b[0]).map(([x,y])=>({x,y}));
}
function posteriorChart(svg,left,right,key){
 const a=marginal(left,key),b=marginal(right,key);
 const xmax=Math.max(...a.map(r=>r.x),...b.map(r=>r.x));
 const xmin=Math.min(...a.map(r=>r.x),...b.map(r=>r.x));
 const ymax=Math.max(...a.map(r=>r.y),...b.map(r=>r.y))*1.18;
 const x=v=>68+606*(v-xmin)/(xmax-xmin),y=v=>238-192*v/ymax;
 let out='<rect x="68" y="37" width="606" height="201" rx="9" fill="#0b2630"/>';
 for(let i=0;i<=4;i++){
  out+='<text x="'+x(xmin+(xmax-xmin)*i/4)+'" y="257" fill="#c3d8d0" text-anchor="middle" font-size="11">'+fmt(xmin+(xmax-xmin)*i/4,0)+'</text>';
 }
 for(const [series,color] of [[a,'#a0bbcc'],[b,'#f3bb80']]){
  out+='<polyline fill="none" stroke="'+color+'" stroke-width="3.2" points="'+
   series.map(p=>x(p.x).toFixed(1)+','+y(p.y).toFixed(1)).join(' ')+'"/>';
 }
 svg.innerHTML=out+'<text x="68" y="22" fill="#d3e8e0" font-size="13">'+
   (key==='cl'?'CL/F (L/h)':'V/F (L)')+'</text>';
}
function legend(a,b){
 return '<p class="career-chart-key"><span><i style="background:#a0bbcc"></i>'+a+
   '</span><span><i style="background:#f3bb80"></i>'+b+'</span></p>';
}
function aucBar(x){
 const lo=0,hi=Math.max(90,x.auc*1.4),px=v=>Math.min(100,Math.max(0,v/hi*100));
 return '<div class="career-auc-scale" role="img" aria-label="AUC interval and evidence threshold">'+
  '<div class="career-auc-track"><div class="career-auc-reference" style="left:'+px(CASE.targetAucMinimum)+'%"></div>'+
  '<div class="career-auc-band" style="left:'+px(x.aucCI[0])+'%;width:'+Math.max(0,px(x.aucCI[1])-px(x.aucCI[0]))+'%"></div>'+
  '<div class="career-auc-point" style="left:'+px(x.auc)+'%"></div></div>'+
  '<p class="career-note">'+tr('Trait = AUC du MAP ; bande = intervalle descriptif P5–P95 propagé depuis CL/F ; seuil vertical = 36 mg·h/L.',
   'Marker = MAP AUC; band = descriptive P5–P95 interval propagated from CL/F; vertical threshold = 36 mg·h/L.')+'</p></div>';
}
function nav(){
 $('mipd-progress').textContent=done.length+' / '+STEPS.length;
 const fragment=document.createDocumentFragment();
 STEPS.forEach((step,i)=>{
  const b=document.createElement('button');b.type='button';b.disabled=i>done.length;
  if(i===index)b.setAttribute('aria-current','step');
  const num=document.createElement('span');num.className='career-step-num';num.textContent=done.includes(i)?'✓':String(i+1);
  const title=document.createElement('span');title.textContent=tr(step.title[0],step.title[1]);
  const small=document.createElement('small');
  small.textContent=done.includes(i)?tr('Validée','Completed'):b.disabled?tr('Verrouillée','Locked'):tr(step.chapter[0],step.chapter[1]);
  title.append(small);b.append(num,title);b.addEventListener('click',()=>select(i));fragment.append(b);
 });
 $('mipd-steps').replaceChildren(fragment);
}
function stage0(){
 $('mipd-workspace').innerHTML=story(
  'Deux mois après une transplantation cardiaque, une personne reçoit <strong>MMF 1 000 mg toutes les 12 h</strong> avec tacrolimus et corticostéroïdes. On s’interroge sur une exposition insuffisante au <strong>MPA</strong>. Quel indicateur permet l’évaluation la plus informative ?',
  'Two months after heart transplantation, a patient takes <strong>MMF 1,000 mg every 12 hours</strong> with tacrolimus and corticosteroids. MPA underexposure is suspected. Which exposure endpoint is most informative?')+
  metrics([[tr('Molécule administrée','Administered drug'),'MMF'],
   [tr('Analyte dosé','Measured analyte'),'MPA'],[tr('Intervalle','Interval'),'12 h'],
   [tr('Contexte','Context'),tr('Greffe cardiaque précoce','Early heart transplant')]])+
  '<div class="career-alert">'+tr('Dans la transplantation cardiaque précoce, le consensus décrit une AUC₀–₁₂h supérieure à 36 mg·h/L comme seuil de référence, sans borne supérieure consensuelle. La corrélation entre C0 et AUC est limitée.',
   'In early heart transplantation, consensus literature describes AUC₀–₁₂h above 36 mg·h/L as an exposure reference, without a consensus upper bound. Trough C0 is a limited surrogate for AUC.')+'</div>'+
  '<div class="career-file-actions"><a class="career-action" href="'+CASE.references.guide+'&lang='+lang()+'" target="_blank" rel="noopener">'+
   tr('Consulter la cible MPA dans Cibles‑TDM','View MPA target in TDM Targets')+'</a>'+
   '<a class="career-action" href="'+CASE.references.consensus+'" target="_blank" rel="noopener">'+tr('Consensus IATDMCT','IATDMCT consensus')+'</a></div>'+
  options([['auc','L’AUC₀–₁₂h du MPA, estimée à partir des prélèvements et d’un modèle adapté.','MPA AUC₀–₁₂h, estimated from samples using an appropriate model.'],
   ['c0','La C0 suffit toujours à reconstituer l’AUC.','A trough C0 always suffices to recover AUC.'],
   ['mmf','La dose prescrite indique directement l’AUC sans variabilité.','Prescribed dose directly determines AUC without variability.']],'mipd-choice');
}
function stage1(){
 $('mipd-workspace').innerHTML=story(
  'Pour une forme orale à libération immédiate, un schéma limité <strong>0,5 h, 1 h, 2 h</strong> a été étudié chez des greffés cardiaques pour estimer l’AUC du MPA. Évaluez sa pertinence <em>dans ce contexte</em>, sans généraliser à d’autres modèles ni formulations.',
  'For immediate-release oral MMF, a limited sampling schedule at <strong>0.5 h, 1 h, 2 h</strong> has been studied in heart transplant recipients to estimate MPA AUC. Evaluate it <em>in context</em>; do not generalize to other models or formulations.')+
  metrics([[tr('Prélèvement 1','Sample 1'),'0.5 h'],[tr('Prélèvement 2','Sample 2'),'1 h'],[tr('Prélèvement 3','Sample 3'),'2 h'],
   [tr('Voie et formulation','Route and formulation'),tr('MMF oral immédiat','Immediate-release oral MMF')]])+
  '<p class="career-note">'+tr('Les horaires sont proposés : il faut vérifier leur justification dans la littérature et leur compatibilité avec le modèle retenu.',
   'Sampling times are proposed: verify supporting evidence and compatibility with the selected model.')+'</p>'+
  options([['three','Ce plan est documenté dans cette situation, mais sa précision dépend du modèle, de la formulation et du contexte.','This plan has supporting evidence in this setting, but accuracy depends on model, formulation and context.'],
   ['universal','Ces horaires sont universels et identifient toute recirculation entérohépatique.','These times universally identify enterohepatic recirculation.']],'mipd-sampling')+
  '<p class="career-note"><a href="'+CASE.references.lss+'" target="_blank" rel="noopener">'+tr('Étude des stratégies de prélèvement limité','Limited sampling strategy study')+'</a></p>';
}
function stage2(){
 $('mipd-workspace').innerHTML=story(
  'Le prior populationnel reste défini avant les observations. Les concentrations simulées modifient la <strong>vraisemblance</strong> et le <strong>posterior</strong>. Visualisez chaque mise à jour de CL/F et V/F ; les histogrammes partagent leur échelle.',
  'The population prior remains fixed before observations. Simulated drug levels update the <strong>likelihood</strong> and <strong>posterior</strong>. Compare CL/F and V/F marginals on consistent axes.',
  'BAYES · PRIOR × VRAISEMBLANCE','BAYES · PRIOR × LIKELIHOOD')+
  '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>'+tr('Temps','Time')+'</th><th>MPA (mg/L)</th></tr></thead><tbody>'+
  OBSERVATIONS.map(o=>'<tr><td>'+fmt(o.t,1)+' h</td><td>'+fmt(o.value,2)+'</td></tr>').join('')+'</tbody></table></div>'+
  '<div class="career-model-buttons"><button type="button" data-mipd-post="0">'+tr('Prior seul','Prior only')+'</button>'+
  '<button type="button" data-mipd-post="1">'+tr('Après 1 dosage','After 1 sample')+'</button>'+
  '<button type="button" data-mipd-post="3">'+tr('Après 3 dosages','After 3 samples')+'</button></div>'+
  '<div id="mipd-post-metrics" class="career-metrics"></div>'+
  legend(tr('Prior fixe','Fixed prior'),tr('Posterior sélectionné','Selected posterior'))+
  '<svg id="mipd-post-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="CL posterior marginal"></svg>'+
  '<svg id="mipd-post-v" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="V posterior marginal"></svg>'+
  options([['likelihood','Le prior est fixe ; la vraisemblance des dosages modifie le posterior.','The prior stays fixed; observed concentrations update the posterior via the likelihood.'],
   ['prior','La moyenne du prior doit changer après chaque prélèvement.','The prior mean must change after each sample.']],'mipd-choice');
 function draw(n){
  sampleView.add(n);
  const p=n===0?P0:n===1?P1:P3;
  $('mipd-post-metrics').innerHTML=metrics([
   ['MAP CL/F',fmt(p.mapCL,1)+' L/h'],['MAP V/F',fmt(p.mapV,0)+' L'],
   ['CL/F P5–P95',fmt(p.clCI[0],1)+'–'+fmt(p.clCI[1],1)+' L/h']]);
  posteriorChart($('mipd-post-chart'),P0,p,'cl');posteriorChart($('mipd-post-v'),P0,p,'v');
  $('mipd-workspace').querySelectorAll('[data-mipd-post]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.mipdPost===n)));
 }
 $('mipd-workspace').querySelectorAll('[data-mipd-post]').forEach(b=>b.addEventListener('click',()=>draw(+b.dataset.mipdPost)));
 draw(0);
}
function stage3(){
 $('mipd-workspace').innerHTML=story(
  'Dans MAP-BE, la <strong>variabilité interindividuelle (IIV)</strong> définit la dispersion du prior, alors que la <strong>variabilité résiduelle (RUV)</strong> intervient dans la vraisemblance. Le « flattened prior » de Hughes diminue explicitement le poids du prior. Changez ces trois composantes <em>séparément</em> et regardez CL/F, V/F et l’AUC prédite.',
  'In MAP estimation, <strong>interindividual variability (IIV)</strong> controls prior spread, while <strong>residual unexplained variability (RUV)</strong> controls the likelihood. Hughes et al. proposed selectively <strong>flattening the prior</strong>. Change each component separately and examine CL/F, V/F and predicted AUC.',
  'SENSIBILITÉ DU POSTERIOR','POSTERIOR SENSITIVITY')+
  '<div class="career-field-grid">'+
  '<label>'+tr('Amplitude de l’IIV','IIV scale')+' <select id="mipd-iiv"><option value="0.5">× 0.50</option><option value="1">× 1.00</option><option value="1.75">× 1.75</option></select></label>'+
  '<label>'+tr('Erreur résiduelle proportionnelle','Proportional RUV')+' <select id="mipd-ruv"><option value="0.01">1 %</option><option value="0.12">12 %</option><option value="0.25">25 %</option></select></label>'+
  '<label>'+tr('Poids du prior','Prior weight')+' <select id="mipd-prior-weight"><option value="1">MAP ×1</option><option value="0.125">Flattened ×⅛</option></select></label></div>'+
  legend(tr('MAP de référence','Baseline MAP'),tr('Scénario modifié','Modified settings'))+
  '<div id="mipd-sensitivity-metrics" class="career-metrics"></div>'+
  '<svg id="mipd-sensitive-cl" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="CL prior sensitivity"></svg>'+
  '<svg id="mipd-sensitive-v" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="V prior sensitivity"></svg>'+
  '<p class="career-note">'+tr('Attention : une RUV artificiellement proche de zéro peut surajuster des concentrations bruitées ; aplatir le prior n’est pas toujours meilleur. Ces manipulations ne réestiment pas le modèle populationnel. Le modèle RUV inclut aussi un plancher fixe de 0,08 mg/L.',
   'A near-zero RUV may overfit noisy concentrations; flattening the prior is not always beneficial. These controls do not refit the population model. RUV also includes a fixed 0.08 mg/L error floor.')+'</p>'+
  '<p class="career-note"><a href="'+CASE.references.berrah+'" target="_blank" rel="noopener">'+tr('Berrah et al. (2026) · influence de l’erreur résiduelle en MIPD','Berrah et al. (2026) · residual error as a lever in MIPD')+'</a> · <a href="'+CASE.references.hughes+'" target="_blank" rel="noopener">'+tr('Hughes et al. (2021) · prior aplati','Hughes et al. (2021) · flattened priors')+'</a></p>'+
  options([['balance','IIV et prior modifient la pénalisation populationnelle ; RUV modifie le poids des dosages. Une RUV trop faible risque le surajustement.',
    'IIV and prior weight control population shrinkage; RUV controls observation weight. Excessively small RUV may overfit.'],
   ['all','Baisser la RUV et aplatir le prior améliorent toujours les prédictions.',
    'Reducing RUV and flattening the prior always improve predictions.']],'mipd-sensitivity-answer');
 function draw(){
  const p=currentPosterior(),ref=P3;
  $('mipd-sensitivity-metrics').innerHTML=metrics([
   ['MAP CL/F',fmt(ref.mapCL,1)+' → '+fmt(p.mapCL,1)+' L/h'],
   ['P5–P95 CL/F',fmt(p.clCI[0],1)+'–'+fmt(p.clCI[1],1)],
   ['MAP V/F',fmt(ref.mapV,0)+' → '+fmt(p.mapV,0)+' L'],
   ['AUC₀–₁₂h @ 1000 mg',fmt(doseMetrics(ref,1000).auc,1)+' → '+fmt(doseMetrics(p,1000).auc,1)]]);
  posteriorChart($('mipd-sensitive-cl'),ref,p,'cl');
  posteriorChart($('mipd-sensitive-v'),ref,p,'v');
 }
 $('mipd-iiv').value=String(sensitivityIIV);
 $('mipd-ruv').value=String(sensitivityRUV);
 $('mipd-prior-weight').value=String(priorWeight);
 for(const [id,key,assign] of [
  ['mipd-iiv','iiv',v=>sensitivityIIV=v],['mipd-ruv','ruv',v=>sensitivityRUV=v],
  ['mipd-prior-weight','prior',v=>priorWeight=v]
 ]){
  $(id).addEventListener('change',e=>{assign(+e.target.value);sensitivityChanged.add(key);draw();});
 }
 draw();
}
function doseInput(id,value,help){
 return '<div class="career-field-grid"><label>'+tr('Nouvelle dose de MMF toutes les 12 h (mg)','New MMF dose every 12 hours (mg)')+
 '<input id="'+id+'" type="number" min="250" max="1500" step="50" value="'+value+'" inputmode="decimal"></label>'+
 '<p class="career-note">'+help+'</p></div>';
}
function stage4(){
 const post=dosePost();
 $('mipd-workspace').innerHTML=story(
  'L’AUC₀–₁₂h du MPA est l’indicateur prioritaire pour ce scénario de greffe cardiaque précoce. Vous fixez vous-même la <strong>dose de MMF</strong> ; les concentrations affichées représentent le <strong>MPA</strong>. La cible de référence est AUC &gt; 36 mg·h/L. Une AUC &gt; 60 mg·h/L appelle un examen du contexte, mais 60 n’est pas ici une limite de toxicité cardiaque validée.',
  'MPA AUC₀–₁₂h is the priority endpoint for this early heart-transplant case. Enter a new <strong>MMF dose</strong>; plotted concentrations are <strong>MPA</strong>. The reference is AUC &gt; 36 mg·h/L. AUC &gt; 60 mg·h/L merits contextual review, but 60 is not a validated heart-transplant toxicity cutoff.',
  'SIMULATIONS D’EXPOSITION','EXPOSURE PROJECTIONS')+
  doseInput('mipd-dose-input',selectedDose,tr('Choisissez une dose de 250 à 1500 mg par prise dans le cadre du cas. La même dose n’implique pas la même AUC chez tous les patients.',
   'Enter a dose from 250 to 1,500 mg per administration for this case. Equal doses do not guarantee equal exposure.'))+
  '<div id="mipd-dose-metrics" class="career-metrics"></div><div id="mipd-dose-auc"></div>'+
  '<svg id="mipd-dose-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="MPA concentration time prediction"></svg>'+
  '<p class="career-chart-key"><span><i style="background:#9debd2"></i>'+tr('Profil MPA estimé par MAP','MAP-predicted MPA curve')+'</span></p>'+
  '<p id="mipd-dose-assessment" class="career-note"></p>'+
  '<p class="career-note">'+tr('AUC et C0 sont deux résumés différents : les courbes du MPA peuvent présenter une recirculation entérohépatique que le modèle oral 1C de cet exercice ne représente pas. La tolérance exige aussi clinique, NFS et recherche d’infections.',
   'AUC and trough are different summaries. Real MPA may show enterohepatic recirculation, which this simple oral one-compartment model omits. Safety assessment also requires symptoms, blood counts and infection review.')+'</p>'+
  '<p><a href="'+CASE.references.guide+'&lang='+lang()+'" target="_blank" rel="noopener">'+tr('Voir la cible et ses sources dans Cibles‑TDM','View the target and sources in TDM Targets')+'</a> · <a href="'+CASE.references.label+'" target="_blank" rel="noopener">'+tr('RCP CellCept · posologie cardiaque adulte','CellCept SmPC · adult heart transplant dose')+'</a></p>';
 function draw(){
  const raw=+$('mipd-dose-input').value;
  if(!Number.isFinite(raw)||raw<250||raw>1500){
   $('mipd-dose-assessment').textContent=tr('Saisir une dose entre 250 et 1500 mg.','Enter a dose between 250 and 1,500 mg.');return;
  }
  selectedDose=raw;
  const x=doseMetrics(post,raw);
  $('mipd-dose-metrics').innerHTML=metrics([['AUC₀–₁₂h',fmt(x.auc,1)+' mg·h/L'],
   ['P5–P95 AUC',fmt(x.aucCI[0],1)+'–'+fmt(x.aucCI[1],1)],
   ['C0',fmt(x.c0,2)+' mg/L'],['MAP CL/F',fmt(x.cl,1)+' L/h']]);
  $('mipd-dose-auc').innerHTML=aucBar(x);
  chart($('mipd-dose-chart'),[{values:x.curve,color:'#9debd2'}],{
   high:Math.max(18,...x.curve.map(p=>p.c))*1.1});
  $('mipd-dose-assessment').textContent=x.meets.auc?
   tr('AUC au-dessus du seuil de 36 mg·h/L ; examiner l’intervalle P5–P95 et la tolérance.','AUC exceeds 36 mg·h/L; assess the P5–P95 interval and tolerability.'):
   tr('AUC en dessous de 36 mg·h/L ; revoir dose, modèle et incertitude.','AUC is below 36 mg·h/L; reassess dose, model and uncertainty.');
 }
 $('mipd-dose-input').addEventListener('input',()=>{doseTouched=true;draw();});draw();
}
function stage5(){
 const post=dosePost();
 $('mipd-workspace').innerHTML=story(
  'Supposez que la clairance apparente <strong>CL/F diminue de 40 %</strong> entre deux consultations, sans modification de F ni de la formulation. Saisissez une <strong>nouvelle dose libre</strong> : votre objectif est de préserver l’AUC du schéma précédent. Observez si la C0 change malgré une AUC proche.',
  'Suppose apparent <strong>CL/F decreases by 40%</strong> between visits with no change in F or formulation. Enter any <strong>revised dose</strong>, aiming to preserve the preceding regimen’s AUC. Check whether trough changes even when AUC is preserved.',
  'PROJECTION · CHANGEMENT DE CL/F','PROJECTION · CHANGING CL/F')+
  metrics([[tr('Dose initiale','Baseline dose'),fmt(selectedDose,0)+' mg q12h'],
   ['CL/F',tr('× 0,60 (hypothèse)','× 0.60 (hypothesis)')],
   [tr('Objectif','Goal'),tr('Préserver l’AUC initiale','Preserve baseline AUC')]])+
  doseInput('mipd-shift-dose-input',revisedDose,tr('La dose à choisir n’est pas proposée dans une table : déduisez-la, puis comparez AUC et C0.',
   'No regimen table provides the answer: derive a dose, then compare AUC and trough.'))+
  '<div id="mipd-shift-metrics" class="career-metrics"></div>'+
  '<svg id="mipd-shift-chart" class="career-chart" viewBox="0 0 730 285" role="img" aria-label="AUC preserving dose and changing clearance"></svg>'+
  '<p class="career-chart-key"><span><i style="background:#9debd2"></i>'+tr('Avant diminution de CL/F','Before CL/F change')+'</span>'+
  '<span><i style="background:#f1bd86"></i>'+tr('Après modification : dose choisie','After change: your chosen dose')+'</span></p>'+
  '<p id="mipd-shift-comment" class="career-note"></p>'+
  options([['shape','Même à AUC égale, la C0 peut différer car la cinétique dans l’intervalle dépend de CL/F et V/F.',
    'Even with equal AUC, trough can differ because the profile depends on CL/F and V/F.'],
   ['equal','Même AUC impose toujours une C0 identique.',
    'Equal AUC always implies identical trough.']],'mipd-shift-shape');
 function draw(){
  const raw=+$('mipd-shift-dose-input').value;
  if(!Number.isFinite(raw)||raw<250||raw>3000){$('mipd-shift-comment').textContent=tr('Dose invalide.','Invalid dose.');return;}
  revisedDose=raw;
  const x=scenarioComparison(post,selectedDose,.6,raw);
  $('mipd-shift-metrics').innerHTML=metrics([
   [tr('AUC initiale','Baseline AUC'),fmt(x.baseline.auc,1)],
   [tr('AUC avec nouvelle dose','Revised AUC'),fmt(x.revised.auc,1)],
   [tr('C0 avant → après','Trough before → after'),fmt(x.baseline.c0,2)+' → '+fmt(x.revised.c0,2)],
   [tr('Écart relatif d’AUC','Relative AUC change'),fmt(100*(x.revised.auc/x.baseline.auc-1),1)+' %']]);
  chart($('mipd-shift-chart'),[{values:x.baseline.curve,color:'#9debd2'},
   {values:x.revised.curve,color:'#f1bd86'}],{
   high:Math.max(18,...x.baseline.curve.map(p=>p.c),...x.revised.curve.map(p=>p.c))*1.1});
  $('mipd-shift-comment').textContent=tr('L’AUC stationnaire est proportionnelle à dose/(CL/F). Le changement prospectif de CL/F n’a pas été confirmé par une nouvelle concentration.',
   'At steady state, AUC is proportional to dose/(CL/F). No new observation confirms the prospective CL/F change.');
 }
 $('mipd-shift-dose-input').addEventListener('input',draw);draw();
}
function caseReport(){
 const p=dosePost(),a=doseMetrics(p,selectedDose),shift=scenarioComparison(p,selectedDose,.6,revisedDose);
 const sensitivity=tr('IIV multipliée par ','IIV multiplied by ')+fmt(sensitivityIIV,2)+
  tr(' ; RUV proportionnelle ','; proportional RUV ')+fmt(100*sensitivityRUV,0)+' %'+
  tr(' ; poids du prior ','; prior weight ')+fmt(priorWeight,3);
 const aster=tr('Non calculé : risque de rejet, leucopénie, infection ou effet clinique ; aucune donnée de tolérance, NFS ni évolution rénale individuelle.',
   'Not computed: rejection, cytopenia, infection or other clinical outcomes; no individual tolerability, CBC or renal trajectory was provided.');
 return tr('COMPTE RENDU PHARMACOMÉTRIQUE — MPA, GREFFE CARDIAQUE\n','PHARMACOMETRIC CASE REPORT — MPA, HEART TRANSPLANT\n')+
  tr('Indication : greffe cardiaque, deuxième mois. MMF oral, associé à tacrolimus et corticostéroïdes.\n',
    'Indication: heart transplant, month 2. Oral MMF with tacrolimus and corticosteroids.\n')+
  tr('Objectif d’exposition : AUC0–12h MPA > 36 mg·h/L, référence contextualisée (cibles-TDM / consensus). Aucune borne supérieure cardiaque consensuelle.\n',
    'Exposure reference: MPA AUC0–12h > 36 mg·h/L, contextual consensus target. No consensus heart-transplant upper bound.\n')+
  tr('DOSAGES ET MÉTHODE\n','OBSERVATIONS AND METHODS\n')+
  'MPA '+OBSERVATIONS.map(o=>fmt(o.t,1)+' h: '+fmt(o.value,2)+' mg/L').join('; ')+'\n'+
  tr('Modèle de démonstration : oral 1C, absorption du 1er ordre, CL/F et V/F estimés par MAP sur grille ; recirculation entérohépatique non modélisée. Données PK générées, non issues d’un patient.\n',
    'Demonstration model: oral 1C, first-order absorption, CL/F and V/F estimated by grid-based MAP. Enterohepatic recirculation omitted. PK concentrations generated, not sourced from a patient.\n')+
  tr('SENSIBILITÉ : ','SENSITIVITY: ')+sensitivity+'\n'+
  tr('ESTIMATIONS INDIVIDUELLES\n','INDIVIDUAL ESTIMATES\n')+
  'MAP CL/F '+fmt(p.mapCL,1)+' L/h ; MAP V/F '+fmt(p.mapV,0)+' L ; CL/F P5–P95 '+fmt(p.clCI[0],1)+'–'+fmt(p.clCI[1],1)+' L/h\n'+
  tr('Dose évaluée : ','Evaluated dose: ')+fmt(selectedDose,0)+' mg q12h ; AUC0–12h '+fmt(a.auc,1)+' mg·h/L ; C0 '+fmt(a.c0,2)+' mg/L ; AUC P5–P95 '+fmt(a.aucCI[0],1)+'–'+fmt(a.aucCI[1],1)+'\n'+
  tr('SCÉNARIO : CL/F ×0,60, nouvelle dose ','SCENARIO: CL/F ×0.60, revised dose ')+fmt(revisedDose,0)+
   ' mg q12h ; AUC '+fmt(shift.revised.auc,1)+' mg·h/L ; C0 '+fmt(shift.revised.c0,2)+' mg/L\n'+
  tr('CONCLUSION\n','CONCLUSION\n')+
  (a.meets.auc?tr('L’exposition MAP atteint le seuil AUC inférieur indiqué. ','The MAP exposure meets the stated lower AUC threshold. '):
   tr('L’exposition MAP n’atteint pas le seuil AUC inférieur indiqué. ','The MAP exposure falls below the stated lower AUC threshold. '))+
  tr('La sensibilité aux hypothèses d’IIV, de RUV et de prior et les intervalles de CL/F limitent l’interprétation individuelle. Le C0 n’est pas utilisé comme substitution à l’AUC. ',
   'Sensitivity to IIV/RUV/prior assumptions and uncertainty in CL/F limit individual interpretation. Trough is not treated as an AUC substitute. ')+aster+'\n'+
  tr('Suites nécessaires : utiliser un modèle de MPA qualifié pour le schéma et la population, contrôler les dosages et horaires, confronter AUC à clinique/NFS/tolérance et réévaluer en cas de variation de CL/F.',
   'Next steps: use an MPA model qualified for population/formulation, verify sampling/dosing, interpret AUC alongside symptoms/CBC/tolerability, and reassess when CL/F changes.');
}
function stage6(){
 const p=dosePost(),x=doseMetrics(p,selectedDose),a=qualityGate({changingCL:true});
 $('mipd-workspace').innerHTML=story(
  'Vous avez évalué une exposition individuelle, exploré la sensibilité du posterior et testé deux schémas. Concluez en confrontant les résultats à une cible documentée et aux éléments qui manquent à l’interprétation clinique.',
  'You assessed individual exposure, tested prior and residual-error sensitivity, and compared dosing scenarios. Write a conclusion consistent with the target evidence and available clinical information.',
  'RAPPORT D’ANALYSE','ANALYSIS REPORT')+
  metrics([[tr('Dose étudiée','Evaluated dose'),fmt(selectedDose,0)+' mg q12h'],
   ['MAP AUC₀–₁₂h',fmt(x.auc,1)+' mg·h/L'],
   ['MAP CL/F',fmt(p.mapCL,1)+' L/h'],
   [tr('Incertitude CL/F','CL/F uncertainty'),fmt(p.clCI[0],1)+'–'+fmt(p.clCI[1],1)]])+
  '<p class="career-note">'+tr('Quelle conclusion peut être défendue avec les résultats disponibles ?',
   'Which conclusion is justified by these data?')+'</p>'+
  options([['conditional','Rapporter la valeur MAP, les intervalles, le choix d’AUC, la sensibilité IIV/RUV et les contrôles cliniques manquants.',
    'Report MAP AUC, uncertainty, IIV/RUV sensitivity, and missing clinical checks.'],
   ['prescribe','Prescrire automatiquement la dose MAP, sans validation du modèle ni NFS.',
    'Prescribe the MAP dose without model validation or blood count review.']],'mipd-report-interpretation')+
  '<pre id="mipd-report" class="career-code">'+safe(caseReport())+'</pre>'+
  '<div class="career-file-actions"><button type="button" class="career-action" id="mipd-copy">'+tr('Copier le compte rendu','Copy case report')+'</button>'+
  '<a href="'+CASE.references.guide+'&lang='+lang()+'" class="career-action" target="_blank" rel="noopener">'+tr('Source cible MPA','MPA target evidence')+'</a></div>';
 $('mipd-copy').addEventListener('click',()=>navigator.clipboard?.writeText(caseReport()));
}
const SCREENS=[stage0,stage1,stage2,stage3,stage4,stage5,stage6];
function render(){
 const st=STEPS[index];
 $('mipd-chapter').textContent=tr(st.chapter[0],st.chapter[1]);
 $('mipd-level').textContent=tr('Étape ','Step ')+(index+1)+' / '+STEPS.length;
 $('mipd-title').textContent=tr(st.title[0],st.title[1]);
 $('mipd-description').textContent=tr(st.desc[0],st.desc[1]);
 $('mipd-feedback').hidden=true;
 $('mipd-validate').disabled=done.includes(index);
 $('mipd-next').hidden=!done.includes(index)||index===STEPS.length-1;
 $('mipd-hint-text').hidden=true;
 const hints=[
  ['Choisissez l’indicateur le plus lié à l’exposition, plutôt que le seul creux.','Choose a measure of total exposure rather than trough alone.'],
  ['Le schéma des prélèvements dépend du modèle et de la formulation.','Sampling depends on model and formulation.'],
  ['Le prior est constant lorsque vous ajoutez des observations.','Adding observations does not change the prior.'],
  ['Une faible RUV peut rapprocher les prédictions des données, mais surestimer leur précision.','Low RUV can pull estimates toward observations while overstating precision.'],
  ['La cible à rechercher est l’AUC ; C0 ne la remplace pas systématiquement.','AUC is the target; trough cannot universally replace it.'],
  ['AUC = dose/(CL/F) pour une administration orale à l’équilibre et une PK linéaire.','Steady-state oral AUC = dose/(CL/F) under linear PK.'],
  ['Une note précise les estimations, les incertitudes et les vérifications indispensables.','A report states estimates, uncertainty and essential verification.']
 ];
 $('mipd-help').textContent=tr(hints[index][0],hints[index][1]);
 $('mipd-hint-text').textContent=tr(hints[index][0],hints[index][1]);
 SCREENS[index]();nav();
}
function select(i){if(i<0||i>=STEPS.length||i>done.length)return;index=i;render();}
function success(fr,en){
 if(index===done.length){done.push(index);try{localStorage.setItem(KEY,JSON.stringify(done));}catch{}}
 $('mipd-feedback').hidden=false;$('mipd-feedback').classList.remove('error');
 $('mipd-feedback').innerHTML='<strong>'+tr('Étape validée','Step complete')+'</strong><p>'+safe(tr(fr,en))+'</p>';
 $('mipd-validate').disabled=true;
 $('mipd-next').hidden=index===STEPS.length-1;nav();
}
function failure(fr,en){
 $('mipd-feedback').hidden=false;$('mipd-feedback').classList.add('error');
 $('mipd-feedback').innerHTML='<strong>'+tr('À réexaminer','Review needed')+'</strong><p>'+safe(tr(fr,en))+'</p>';
}
function chosen(name){return $('mipd-workspace').querySelector('input[name="'+name+'"]:checked')?.value;}
function validate(){
 if(done.includes(index))return;
 if(index===0)return chosen('mipd-choice')==='auc'?
   success('L’AUC₀–₁₂h est privilégiée pour apprécier l’exposition au MPA.','AUC₀–₁₂h is preferred for assessing MPA exposure.'):
   failure('Comparez la corrélation limitée entre C0 et AUC.','Review the limited relationship between trough and AUC.');
 if(index===1)return chosen('mipd-sampling')==='three'?
   success('Le protocole doit rester lié au modèle et à la formulation.','The sampling schedule must match model and formulation.'):
   failure('Les prélèvements ne sont pas universels.','Sampling times are not universal.');
 if(index===2)return [0,1,3].every(x=>sampleView.has(x))&&chosen('mipd-choice')==='likelihood'?
   success('Le prior reste fixe, et le posterior évolue avec la vraisemblance.','The prior stays fixed while likelihood updates the posterior.'):
   failure('Explorez les trois distributions et distinguez prior et posterior.','Explore all three distributions and distinguish prior from posterior.');
 if(index===3)return ['iiv','ruv','prior'].every(k=>sensitivityChanged.has(k))&&chosen('mipd-sensitivity-answer')==='balance'?
   success('IIV, RUV et pondération du prior ont été comparées séparément.','IIV, RUV and prior weighting were varied separately.'):
   failure('Modifiez les trois contrôles, puis expliquez comment ils pondèrent le posterior.','Change all three controls and explain their posterior effects.');
 if(index===4){
  const x=doseMetrics(dosePost(),selectedDose);
  return doseTouched&&x.meets.auc?
   success('La dose saisie atteint le seuil inférieur d’AUC. Interprétez aussi l’incertitude et la tolérance.','Your selected dose meets the lower AUC reference. Also assess uncertainty and tolerability.'):
   failure('Saisissez vous-même une dose et confrontez son AUC au seuil de 36 mg·h/L. Aucune borne supérieure cardiaque n’est imposée.','Enter a dose and compare its AUC with the 36 mg·h/L reference. No validated upper heart-transplant bound is imposed.');
 }
 if(index===5){
  const cmp=scenarioComparison(dosePost(),selectedDose,.6,revisedDose);
  const percent=Math.abs(cmp.revised.auc/cmp.baseline.auc-1)*100;
  return percent<=5&&chosen('mipd-shift-shape')==='shape'?
   success('AUC proche de l’exposition initiale ; la C0 et l’incertitude peuvent changer.','AUC is close to baseline, but trough and uncertainty can change.'):
   failure('Calculez une nouvelle dose correspondant à la réduction de CL/F, puis comparez les deux AUC.','Derive a revised dose for lower CL/F and compare the AUCs.');
 }
 return chosen('mipd-report-interpretation')==='conditional'?
  success('Le rapport restitue les estimations et leurs limites sans extrapolation clinique.','The report states estimates and limitations without unsupported clinical extrapolation.'):
  failure('Évaluez la validité du modèle, l’incertitude et la tolérance, au-delà du MAP.','Assess model validity, uncertainty and tolerability, not MAP alone.');
}
$('mipd-validate').addEventListener('click',validate);
$('mipd-hint').addEventListener('click',()=>{$('mipd-hint-text').hidden=false;});
$('mipd-next').addEventListener('click',()=>select(Math.min(STEPS.length-1,index+1)));
$('mipd-reset').addEventListener('click',()=>{
 if(!confirm(tr('Réinitialiser ce dossier MIPD ?','Reset this MIPD case?')))return;
 done=[];selectedDose=CASE.dose;revisedDose=600;sensitivityIIV=1;sensitivityRUV=.12;priorWeight=1;doseTouched=false;
 sensitivityChanged.clear();sampleView.clear();try{localStorage.setItem(KEY,'[]');}catch{}select(0);
});
window.addEventListener('pmx-game-language-change',()=>render());
select(index);
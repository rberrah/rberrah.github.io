// PMx Game bilingual interface. French is the source language.
// Translate DOM text nodes, including dynamically rendered lessons, without
// touching simulations, user input, chart coordinates or stored progress.
import {FR_EN} from './locale-en.js';
import {FR_EN_LESSONS} from './locale-en-lessons.js';
import {FR_EN_MIPD} from './locale-en-mipd.js';
import {FR_EN_CLASSIC} from './locale-en-classic.js';
import {FR_EN_V3} from './locale-en-v3.js';
import {FR_EN_V4} from './locale-en-v4.js';
import {FR_EN_V5} from './locale-en-v5.js';
import {FR_EN_AUDIT} from './locale-en-audit.js';
const DICTIONARY={...FR_EN,...FR_EN_LESSONS,...FR_EN_MIPD,...FR_EN_CLASSIC,...FR_EN_V3,...FR_EN_V4,...FR_EN_V5,...FR_EN_AUDIT};

const supported=new Set(['fr','en']);
const params=new URLSearchParams(location.search);
const forced=params.get('lang');
let current=supported.has(forced)?forced:(()=>{try{return localStorage.getItem('pharmacometrie-language')||'fr';}catch{return 'fr';}})();
if(!supported.has(current))current='fr';

// Match typographic variants of the same source fragment (including inline markup boundaries).
const normalize=s=>s.trim().replace(/\s+/g,' ').replace(/[’‘]/g,"'");
const normalizedDictionary=new Map(Object.entries(DICTIONARY).map(([fr,en])=>[normalize(fr),en]));
const englishValues=new Set(Object.values(DICTIONARY).map(normalize));
const longKeys=Object.keys(DICTIONARY).filter(k=>k.length>=35).sort((a,b)=>b.length-a.length);
const states=new WeakMap();
const attrStates=new WeakMap();
const phraseRules=[
  ['Étape ','Step '],['Mission ','Mission '],[' / ',' / '],
  ['Sujet S','Subject S'],['Sujet ','Subject '],
  ['Itération ','Iteration '],['Concentration pédagogique','Educational concentration'],
  ['ÉTAPE ','STEP '],['ENQUÊTE N° ','INVESTIGATION NO. '],
  ['DOSSIER ORIGINAL','ORIGINAL STUDY DATA'],
  ['ÉTUDE RÉELLE','REAL STUDY'],['ATELIER SAEM','SAEM WORKSHOP'],
  ['ÉTUDE EXPÉRIMENTALE','EXPERIMENTAL STUDY'],
  ['ENQUÊTE SCIENTIFIQUE','SCIENTIFIC INVESTIGATION'],
  ['Cohorte synthétique','Simulated cohort'],
  ['Cohorte artificielle','Simulated cohort'],
  ['Concentrations de warfarine','Warfarin concentrations'],
  ['Concentrations PK','PK concentrations'],['PCA expérimentale','Observed PCA'],
  ['PCA mesurées','PCA measurements'],['Données de l’étude','Study data'],
  ['Données expérimentales','Experimental data'],
  ['Données et colonnes','Dataset and fields'],
  ['Ajustements individuels','Individual fits'],['populationnelle','population'],
  ['Individuel','Individual'],['individuel','individual'],
  ['Vérifier','Check'],['Importer','Import'],['Activer','Enable'],
  ['Restaurer','Restore'],['Réinitialiser','Reset'],['Choisissez','Choose'],
  ['Choisir','Choose'],['sélectionné','selected'],['sélectionnée','selected'],
  ['Simulation','Simulation'],['Observations','Observations'],
  ['Efficacité','Efficacy'],['Toxicité','Toxicity'],
  ['Covariable','Covariate'],['Clairance','Clearance'],
  ['Variation de la clairance','Clearance change'],
  ['Seuil toxique','Toxicity threshold'],
  ['Moyenne','Mean'],['Écart-type','Standard deviation'],
  ['Sujets','Subjects'],['Volontaires','Volunteers'],['Temps depuis début','Time since start'],
  ['Observation','Observation'],['Doses','Doses'],
  ['une valeur','a value'],
  ['sujets ·','subjects ·'],['observations PK','PK observations'],
  ['mis en évidence','highlighted'],['prélèvements','samples'],
  ['Les segments relient uniquement ses propres observations.','The segments connect that subject\'s observations only.'],
  ['Effectif ·','Count ·'],['État sauvegardé :','Recorded state:'],
  ['À examiner','To review'],['Rejoué','Reviewed'],['Rapport scientifique','Scientific report'],
  ['Comparaison des courbes','Comparison of curves'],
  ['Tutoriel · Étape ','Tutorial · Step '],['Défi ','Challenge '],
  ['Nouvelle mission débloquée','New mission unlocked'],['Mission déjà accomplie','Mission already completed'],
  ['Mission accomplie','Mission complete'],['défis avancés','advanced challenges'],
  ['Départ sélectionné :','Origin selected:'],['. Cliquez sur le nœud d’arrivée.','. Click the destination node.'],
  ['bloc(s) placés','block(s) placed'],['transfert(s). Cliquez sur un départ puis sur une arrivée.','transfer(s). Click an origin then a destination.'],
  ['Certaines équations ne sont pas encore cohérentes :','Some equations are not yet consistent:'],['dérivée(s) à revoir. Vérifiez le sens et le signe des flux.','derivative(s) to review. Check flow directions and signs.'],
  ['Vos résultats : AUC linéaire =','Your results: linear AUC ='],['et AUC saturable =','and saturable AUC ='],
  ['Votre simulation :','Your simulation:'],[' et AUC24 =',' and AUC24 ='],
  [' h⁻¹ entre ',' h⁻¹ between '],[' h et ',' h and '],['Demi-vie apparente locale :','Local apparent half-life:'],
  ['bloc(s) placé(s)','block(s) placed'],['Colonne ','Column '],
  ['mg/L. Sélectionnez un second point.','mg/L. Select a second point.'],
  ['prélèvements). Turquoise = données mesurées ; orange = sujet sélectionné ; violet = médiane et IQR par fenêtre (au moins 4 sujets), sans interpolation.','samples). Turquoise = observed data; orange = selected subject; purple = windowed median and IQR (at least 4 subjects), without interpolation.']
];
function translate(fr){
  const trimmed=fr.trim();
  if(!trimmed)return fr;
  const direct=DICTIONARY[trimmed]??normalizedDictionary.get(normalize(trimmed));
  if(direct!==undefined)return fr.replace(trimmed,direct);
  // Explicit bilingual renderers already supply English; never translate it a second time.
  if(englishValues.has(normalize(trimmed)))return fr;
  // Full explanatory sentences can be followed by computed results, and map labels combine translated fragments.
  const prefix=longKeys.find(k=>trimmed.startsWith(k+' '));
  if(prefix)return fr.replace(trimmed,DICTIONARY[prefix]+translate(trimmed.slice(prefix.length)));
  if(trimmed.includes(' · ')){
    const composite=trimmed.split(' · ').map(translate).join(' · ');
    if(composite!==trimmed)return fr.replace(trimmed,composite);
  }
  let en=fr;
  for(const [from,to] of phraseRules){
    if(en.includes(from))en=en.split(from).join(to);
  }
  return en;
}
function updateText(node){
  if(!node?.nodeValue||!node.parentElement)return;
  if(['SCRIPT','STYLE','TEXTAREA','NOSCRIPT','CODE','PRE'].includes(node.parentElement.tagName))return;
  const old=states.get(node);
  let fr=old?.fr??node.nodeValue;
  if(old && node.nodeValue!==old.last && node.nodeValue!==fr)fr=node.nodeValue;
  const next=current==='en'?translate(fr):fr;
  states.set(node,{fr,last:next});
  if(node.nodeValue!==next)node.nodeValue=next;
}
function updateAttrs(el){
  if(!(el instanceof Element))return;
  const names=['title','aria-label','placeholder','alt','data-tooltip'];
  let old=attrStates.get(el)||{};
  for(const attr of names){
    if(!el.hasAttribute(attr))continue;
    const value=el.getAttribute(attr);
    const stored=old[attr],fr=!stored||stored.last!==value&&stored.fr!==value?value:stored.fr;
    const next=current==='en'?translate(fr):fr;
    old[attr]={fr,last:next};
    if(next!==value)el.setAttribute(attr,next);
  }
  attrStates.set(el,old);
}
function updateNode(root){
  if(root.nodeType===Node.TEXT_NODE){updateText(root);return;}
  if(root.nodeType!==Node.ELEMENT_NODE)return;
  updateAttrs(root);
  const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
  while(walk.nextNode()){
    const node=walk.currentNode;
    if(node.nodeType===Node.TEXT_NODE)updateText(node);
    else updateAttrs(node);
  }
}
function refresh(){
  document.documentElement.lang=current;
  document.getElementById('game-lang-fr')?.setAttribute('aria-pressed',String(current==='fr'));
  document.getElementById('game-lang-en')?.setAttribute('aria-pressed',String(current==='en'));
  updateNode(document.body);
  document.title=current==='en'?'PMx Game · Interactive pharmacokinetics':'PMx Game · Laboratoire de pharmacocinétique';
}
function setLanguage(lang){
  if(!supported.has(lang))return;
  current=lang;
  const url=new URL(location.href);
  if(lang==='fr')url.searchParams.set('lang','fr');else url.searchParams.set('lang','en');
  history.replaceState(history.state,'',url.pathname+url.search+url.hash);
  try{localStorage.setItem('pharmacometrie-language',lang);}catch{}
  refresh();
  window.dispatchEvent(new CustomEvent('pmx-game-language-change',{detail:{lang}}));
}
document.getElementById('game-lang-fr')?.addEventListener('click',()=>setLanguage('fr'));
document.getElementById('game-lang-en')?.addEventListener('click',()=>setLanguage('en'));
const observer=new MutationObserver(records=>{
  for(const record of records){
    if(record.type==='characterData')updateText(record.target);
    else if(record.type==='attributes')updateAttrs(record.target);
    else for(const n of record.addedNodes)updateNode(n);
  }
});
observer.observe(document.body,{subtree:true,childList:true,characterData:true,
  attributes:true,attributeFilter:['title','placeholder','aria-label','alt','data-tooltip']});
refresh();

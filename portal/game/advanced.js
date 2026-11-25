import { isFree, firstIncomplete, canVisit, normalizeCompleted } from './learning-mode.js';
import {
  ADVANCED_MISSIONS,GRAPH_NODES,GRAPH_OPTIONS,GRAPH_EDGES,GRAPH_OBSERVATIONS,ODE_TERMS,ODE_STATES,
  validateGraph,validateOdes,gradeMic,nonlinearChallenge,oneDoseProfile,
  gradeDdi,ddiChallenge,NONLINEAR
} from './advanced-core.js';
import { setupExtended } from './advanced-more.js';

const $=id=>document.getElementById(id);
const STORAGE='pmx-game-advanced-v1';
const fmt=(v,d=1)=>Number(v).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
let progress={completed:[]};
try {
  const parsed=JSON.parse(localStorage.getItem(STORAGE)||'null');
  if(Array.isArray(parsed?.completed)) progress={completed:[...new Set(parsed.completed.filter(v=>ADVANCED_MISSIONS.some(x=>x.id===v)))]};
}catch {/*Local-only progress is optional.*/}
let current=ADVANCED_MISSIONS.findIndex(m=>!progress.completed.includes(m.id));
if(current<0)current=ADVANCED_MISSIONS.length-1;
let completed=false;
let graphNodes=[],graphEdges=[],graphStart=null,graphDelete=false,graphLog=false;
let extended=null;
let odePicks={};
let micDose=100,micTau=8,linearDose=180,mmDose=180,ddiCl=2.5;

const explanations={
 graph:'Le modèle oral 2C est une hypothèse parcimonieuse compatible avec ces DV simulées. Une modification de pente ne suffit pas à prouver la structure : il faut ajuster et comparer les modèles. Les flèches représentent des flux mathématiques.',
 odes:'Les équations de quantités conservent la masse : les échanges entre central et périphérique se compensent, l’absorption quitte le dépôt et rejoint le central, et l’élimination est comptabilisée dans Ae.',
 mic:'Pour ce médicament fictif à distribution 1C après bolus IV, fT > CMI dépend de la fraction libre, de la CMI et de la vitesse de décroissance. La valeur de 70 % et la limite AUC24 sont des objectifs inventés, non des cibles thérapeutiques recommandées.',
 nonlinear:'Pour une élimination linéaire, AUC∞=Dose/CL. Dans l’exemple Michaelis–Menten, la vitesse d’élimination se sature ; AUC∞ croît plus vite que la dose. Les deux doses nécessaires pour une même cible AUC peuvent donc différer.',
 ddi:'Dans ce modèle oral linéaire avec administrations répétées, AUC sur un intervalle varie comme 1/CL, alors que C0 dépend aussi de l’accumulation et de l’absorption. Une même modification de CL n’implique donc pas la même variation relative de C0 et d’AUC.',
 loading:'La dose de charge dépend du volume apparent et de la concentration recherchée immédiatement ; la dose d’entretien dépend de CL, de l’intervalle et de la concentration moyenne visée.',
 accumulation:'À intervalle donné, une élimination plus lente implique davantage d’administrations avant l’état stationnaire.',
 fraction:'Pour une PK linéaire, la dose journalière totale constante préserve AUC24 ; le fractionnement atténue les pics et remonte les creux.',
 ambiguity:'L’AUC après voie orale dépend de F/CL. Une AUC isolée n’identifie donc pas séparément F et CL.'
};
const hints={
 graph:'Le dépôt ne représente pas la clairance. Les tissus doivent pouvoir échanger dans les deux sens avec le central, et la sortie se fait depuis la circulation.',
 odes:'Écrivez les variations des quantités (mg/h), pas celles des concentrations. Un flux retiré d’un état doit apparaître avec le signe opposé dans l’état où il arrive.',
 mic:'L’objectif porte sur la concentration libre pendant un intervalle complet. Une dose trop forte peut respecter fT > CMI mais dépasser la limite AUC du jeu. Testez aussi l’intervalle.',
 nonlinear:'Commencez par le cas linéaire, puis considérez que la vitesse maximale d’élimination du second modèle est limitée. Comparez les AUC plutôt que les Cmax.',
 ddi:'Observez séparément AUC et C0 avant/après. Il suffit de comparer leurs augmentations relatives, vous n’avez pas à calculer un rapport de tête.',
 loading:'Utilisez les deux mesures simulées. Elles ne visent pas le même instant ni la même définition de concentration.',
 accumulation:'Observez la première barre dépassant le seuil 90 % ; comparez l’effet de CL.',
 fraction:'La dose par administration doit diminuer lorsqu’on administre plus fréquemment une même dose totale quotidienne.',
 ambiguity:'Même dose × F / CL : si F diminue, quel changement de CL peut conserver ce rapport ?'
};
function save(){
  try{localStorage.setItem(STORAGE,JSON.stringify(progress));}catch{/*Private browsing*/ }
}
function maxOpen(){
  const i=ADVANCED_MISSIONS.findIndex(m=>!progress.completed.includes(m.id));
  return i<0?ADVANCED_MISSIONS.length-1:i;
}
function nav(){
  $('advanced-count').textContent=progress.completed.length+'/'+ADVANCED_MISSIONS.length;
  $('advanced-xp').textContent=progress.completed.reduce((sum,id)=>sum+ADVANCED_MISSIONS.find(m=>m.id===id).xp,0)+' XP';
  const fragment=document.createDocumentFragment();
  ADVANCED_MISSIONS.forEach((m,i)=>{
    const done=progress.completed.includes(m.id);
    const b=document.createElement('button');b.type='button';b.disabled=!isFree()&&i>maxOpen()&&!done;
    b.classList.toggle('completed',done);
    if(i===current)b.setAttribute('aria-current','step');
    const n=document.createElement('span');n.className='quest-index';n.textContent=done?'✓':String(i+1);
    const title=document.createElement('span'),name=document.createElement('strong'),sub=document.createElement('small');
    name.textContent=m.title;sub.textContent=m.chapter+' · '+(done?'Terminée':b.disabled?'Verrouillée':'À jouer');
    title.append(name,sub);b.append(n,title);b.addEventListener('click',()=>select(i));fragment.append(b);
  });
  $('advanced-list').replaceChildren(fragment);
}
function feedback(correct,message){
  const el=$('advanced-feedback');el.hidden=false;el.classList.toggle('error',!correct);el.replaceChildren();
  const head=document.createElement('strong');head.textContent=correct?'Défi validé':'Essayez encore';
  const text=document.createElement('p');text.textContent=message;
  el.append(head,text);
  if(correct) {
    const reward=document.createElement('div');reward.className='reward';
    reward.textContent=ADVANCED_MISSIONS[current].xp+' XP · '+progress.completed.length+'/'+ADVANCED_MISSIONS.length+' défis avancés';
    el.append(reward);
  }
}
function complete(extra=''){
  if(completed)return;
  completed=true;
  const id=ADVANCED_MISSIONS[current].id;
  if(!progress.completed.includes(id)){progress.completed.push(id);save();}
  $('advanced-check').disabled=true;
  feedback(true,explanations[id]+(extra?' '+extra:''));
  if(current<ADVANCED_MISSIONS.length-1)$('advanced-next').hidden=false;
  nav();
}
function select(i){
  if(!Number.isInteger(i)||i<0||i>=ADVANCED_MISSIONS.length)return;
  if(!isFree()&&i>maxOpen()&&!progress.completed.includes(ADVANCED_MISSIONS[i].id))return;
  current=i;const m=ADVANCED_MISSIONS[i];
  completed=progress.completed.includes(m.id);
  graphNodes=completed&&m.id==='graph'?GRAPH_NODES.map(n=>n.id):[];graphEdges=completed&&m.id==='graph'?[...GRAPH_EDGES]:[];graphStart=null;graphDelete=false;graphLog=false;extended=null;
  odePicks=Object.fromEntries(ODE_STATES.map(s=>[s.id,[]]));
  micDose=100;micTau=8;linearDose=180;mmDose=180;ddiCl=2.5;
  $('advanced-chapter').textContent=m.chapter;
  $('advanced-level').textContent='Défi '+(i+1)+' / '+ADVANCED_MISSIONS.length+' · '+m.xp+' XP';
  $('advanced-title').textContent=m.title;
  $('advanced-intro').textContent=m.summary;
  $('advanced-hint-text').textContent=hints[m.id];
  $('advanced-hint-text').hidden=true;
  $('advanced-feedback').hidden=true;
  $('advanced-next').hidden=!isFree()||i===ADVANCED_MISSIONS.length-1;
  $('advanced-check').disabled=completed;
  $('advanced-teacher').textContent={
    graph:'Déduisez une structure compatible avec les indices. Cliquez sur les blocs que vous retenez, puis dessinez les transferts : un départ et une arrivée par flèche. Des blocs proposés sont inutiles.',
    odes:'Pour chacun des quatre états, assemblez les termes qui appartiennent à son dérivé. Le système entier doit conserver la masse.',
    mic:'Médicament imaginaire : CMI = 2 mg/L, fraction libre 80 %, bolus IV répétés, modèle 1C. Atteignez fT > CMI ≥ 70 % et AUC24 ≤ 150 mg·h/L.',
    nonlinear:'Après un bolus IV, adaptez deux doses pour obtenir une AUC∞ de 60 mg·h/L avec chacune des lois d’élimination.',
    ddi:'Explorez une diminution de CL. Pour le scénario choisi, comparez les augmentations relatives de AUC et de C0, à partir des valeurs et des courbes.',
    loading:'Deux réglages : concentration immédiatement après la première dose et concentration moyenne d’entretien. Observez les mesures simulées.',
    accumulation:'Votre but est de choisir la première dose après laquelle la part de l’état stationnaire atteint 90 %.',
    fraction:'Même dose sur 24 h, mais administrations plus ou moins rapprochées : testez l’amplitude des fluctuations.',
    ambiguity:'Deux personnes ont exactement la même AUC orale : reconstruisez un autre couple F/CL compatible.'
  }[m.id];
  renderStage();
  if(completed){
    extended?.reveal();
    $('advanced-feedback').hidden=false;
    feedback(true,explanations[m.id]);
    $('advanced-next').hidden=i===ADVANCED_MISSIONS.length-1;
  }
  nav();
}
function graphPath(from,to){
  const a=GRAPH_OPTIONS.find(n=>n.id===from),b=GRAPH_OPTIONS.find(n=>n.id===to);
  const vx=b.x-a.x,vy=b.y-a.y,len=Math.hypot(vx,vy);
  if(!len)return '';
  const ux=vx/len,uy=vy/len;
  const cross=from==='central'&&to==='peripheral'?-13:from==='peripheral'&&to==='central'?13:0;
  return 'M '+(a.x+ux*79).toFixed(1)+' '+(a.y+uy*44+cross).toFixed(1)+' L '+
    (b.x-ux*79).toFixed(1)+' '+(b.y-uy*44+cross).toFixed(1);
}
function renderGraph(){
  const svg=$('adv-graph-svg');
  let out='<defs><marker id="adv-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">'+
    '<path d="M0 0 L8 4 L0 8" fill="none" stroke="#9cebd1" stroke-width="2"/></marker></defs>';
  for(const edge of graphEdges){
    const [from,to]=edge.split('>');
    out+='<g data-graph-edge="'+edge+'" role="button" tabindex="'+(graphDelete&&!completed?'0':'-1')+'" aria-label="'+GRAPH_OPTIONS.find(n=>n.id===from).label+' → '+GRAPH_OPTIONS.find(n=>n.id===to).label+'"><path class="graph-edge-hit" d="'+graphPath(from,to)+'" fill="none" stroke="transparent" stroke-width="20"/><path class="graph-edge-line" d="'+graphPath(from,to)+'" fill="none" stroke="#8cd7cf" stroke-width="3.6" marker-end="url(#adv-arrow)"/></g>';
  }
  for(const node of GRAPH_OPTIONS){
    if(!graphNodes.includes(node.id))continue;
    const selected=node.id===graphStart;
    out+='<g data-graph-node="'+node.id+'" role="button" tabindex="0" aria-label="'+node.label+
      '"><rect x="'+(node.x-78)+'" y="'+(node.y-40)+'" width="156" height="80" rx="13" fill="'+
      (selected?'#317968':'#1c4247')+'" stroke="'+(selected?'#d4ffe6':'#78b5a8')+
      '" stroke-width="2.6"/><text x="'+node.x+'" y="'+(node.y+5)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#f3fdf8">'+node.label+'</text></g>';
  }
  svg.innerHTML=out;
  svg.classList.toggle('delete-mode',graphDelete&&!completed);
  $('adv-graph-connect').setAttribute('aria-pressed',String(!graphDelete));$('adv-graph-delete').setAttribute('aria-pressed',String(graphDelete));
  $('adv-graph-connect').disabled=completed;$('adv-graph-delete').disabled=completed;
  $('adv-graph-clear').textContent=completed?'Refaire le dessin':'Recommencer le dessin';
  $('adv-graph-help').textContent=completed?'Schéma validé. Vous pouvez refaire le dessin sans perdre votre progression.':graphDelete?'Mode Supprimer : cliquez sur un bloc ou une flèche. Retirer un bloc retire aussi ses flèches.':'Mode Relier : cliquez sur un bloc de départ puis un bloc d’arrivée.';
  $('adv-graph-status').textContent=graphStart?'Départ sélectionné : '+GRAPH_OPTIONS.find(n=>n.id===graphStart).label+'. Cliquez sur le nœud d’arrivée.':
    graphNodes.length+' bloc(s) placés · '+graphEdges.length+' transfert(s). Cliquez sur un départ puis sur une arrivée.';
  $('adv-graph-palette').querySelectorAll('button').forEach(b=>b.disabled=graphNodes.includes(b.dataset.addNode)||completed);
  const nodesArea=$('adv-graph-nodes');
  nodesArea.replaceChildren(...graphNodes.map(id=>{
    const b=document.createElement('button');b.type='button';b.className='quest-btn';
    b.textContent='Retirer '+GRAPH_OPTIONS.find(n=>n.id===id).label;b.disabled=completed;
    b.addEventListener('click',()=>{graphNodes=graphNodes.filter(n=>n!==id);graphEdges=graphEdges.filter(e=>!e.split('>').includes(id));graphStart=null;renderGraph();});
    return b;
  }));
  $('adv-graph-edges').replaceChildren(...graphEdges.map(edge=>{
    const b=document.createElement('button');b.type='button';b.className='quest-btn';
    const [a,z]=edge.split('>');b.textContent='× '+GRAPH_OPTIONS.find(n=>n.id===a).label+' → '+GRAPH_OPTIONS.find(n=>n.id===z).label;
    b.disabled=completed;
    b.addEventListener('click',()=>{graphEdges=graphEdges.filter(e=>e!==edge);renderGraph();});return b;
  }));
}
function graphClick(node){
  if(completed || !graphNodes.includes(node))return;
  if(graphDelete){graphNodes=graphNodes.filter(n=>n!==node);graphEdges=graphEdges.filter(e=>!e.split('>').includes(node));graphStart=null;renderGraph();return;}
  if(graphStart===null){graphStart=node;renderGraph();return;}
  if(node!==graphStart){
    const key=graphStart+'>'+node;
    if(!graphEdges.includes(key))graphEdges.push(key);
  }
  graphStart=null;renderGraph();
}
function drawGraphDV(){
 const rows=GRAPH_OBSERVATIONS.filter(p=>!graphLog||p.c>0),x=t=>53+t/48*610,y=c=>220-(graphLog?(Math.log10(c)+2)/3:c/8)*186;
 const locale=document.documentElement.lang==='en'?'en-US':'fr-FR';
 let out='<rect x="53" y="34" width="610" height="186" rx="8" fill="#0d2530"/>';
 for(const v of graphLog?[.01,.1,1,10]:[0,2,4,6,8])out+='<path d="M53 '+y(v)+' H663" stroke="#36565d" stroke-dasharray="4 5"/><text x="46" y="'+(y(v)+4)+'" text-anchor="end" font-size="12" fill="#c8ddd7">'+v.toLocaleString(locale)+'</text>';
 for(const t of [0,6,12,24,36,48])out+='<text x="'+x(t)+'" y="238" text-anchor="middle" font-size="12" fill="#c8ddd7">'+t+'</text>';
 for(const p of rows)out+='<circle cx="'+x(p.t)+'" cy="'+y(p.c)+'" r="4.5" fill="#9cebd1" stroke="#123039" stroke-width="1.4"><title>'+p.t.toLocaleString(locale)+' h · '+p.c.toLocaleString(locale,{maximumFractionDigits:3})+' mg/L</title></circle>';
 $('adv-graph-dv').innerHTML=out+'<text x="53" y="22" font-size="13" fill="#c8ddd7">DV (mg/L)</text><text x="358" y="260" text-anchor="middle" font-size="12" fill="#c8ddd7">Temps (h)</text>';
 $('adv-graph-linear').setAttribute('aria-pressed',String(!graphLog));$('adv-graph-log').setAttribute('aria-pressed',String(graphLog));
}
function setupGraph(){
  $('advanced-stage').innerHTML='<p class="advanced-instruction">Une dose orale unique de 100 mg a été administrée à un patient fictif. Observez les DV simulées, puis proposez une structure compartimentale minimale compatible avec ces données.</p>'+
    '<section class="graph-dv-panel"><h3>Concentrations observées (DV)</h3><div class="advanced-palette"><button type="button" id="adv-graph-linear" class="quest-btn">Linéaire</button><button type="button" id="adv-graph-log" class="quest-btn">Semi-log</button></div><svg id="adv-graph-dv" class="advanced-chart" viewBox="0 0 705 270" role="img" aria-label="Concentrations plasmatiques simulées en fonction du temps"></svg><p class="advanced-small">Points = prélèvements simulés avec bruit ; aucune courbe ajustée. Les zéros sont exclus en semi-log.</p></section>'+
    '<h3>Construire le modèle</h3><div class="advanced-palette"><button type="button" id="adv-graph-connect" class="quest-btn">Relier</button><button type="button" id="adv-graph-delete" class="quest-btn">Supprimer</button></div><p id="adv-graph-help" class="advanced-small"></p><h4>Ajouter un bloc</h4>'+
    '<div class="advanced-palette" id="adv-graph-palette">'+GRAPH_OPTIONS.map(n=>'<button data-add-node="'+n.id+'" class="quest-btn">+ '+n.label+'</button>').join('')+'</div>'+
    '<svg id="adv-graph-svg" viewBox="0 0 570 375" class="advanced-graph" role="img" aria-label="Dessinez les compartiments et les flèches du modèle"></svg>'+
    '<p id="adv-graph-status" class="advanced-prompt" role="status"></p><div class="graph-remove-list"><h4>Supprimer un bloc</h4><div class="advanced-arrows" id="adv-graph-nodes"></div><h4>Supprimer une flèche</h4><div id="adv-graph-edges" class="advanced-arrows"></div></div>'+
    '<button type="button" id="adv-graph-clear" class="quest-btn">Recommencer le dessin</button>';
  $('adv-graph-palette').addEventListener('click',ev=>{
    const b=ev.target.closest('[data-add-node]');
    if(!b||completed)return;
    if(!graphNodes.includes(b.dataset.addNode))graphNodes.push(b.dataset.addNode);
    graphDelete=false;graphStart=null;renderGraph();
  });
  $('adv-graph-connect').onclick=()=>{graphDelete=false;graphStart=null;renderGraph();};
  $('adv-graph-delete').onclick=()=>{graphDelete=true;graphStart=null;renderGraph();};
  $('adv-graph-linear').onclick=()=>{graphLog=false;drawGraphDV();};$('adv-graph-log').onclick=()=>{graphLog=true;drawGraphDV();};
  $('adv-graph-svg').addEventListener('click',ev=>{
    const edge=ev.target.closest('[data-graph-edge]');if(edge&&graphDelete&&!completed){graphEdges=graphEdges.filter(e=>e!==edge.dataset.graphEdge);graphStart=null;renderGraph();return;}
    const el=ev.target.closest('[data-graph-node]');if(el)graphClick(el.dataset.graphNode);
  });
  $('adv-graph-svg').addEventListener('keydown',ev=>{
    if(ev.key!=='Enter'&&ev.key!==' ')return;
    const edge=ev.target.closest('[data-graph-edge]');if(edge&&graphDelete&&!completed){ev.preventDefault();graphEdges=graphEdges.filter(e=>e!==edge.dataset.graphEdge);graphStart=null;renderGraph();return;}
    const el=ev.target.closest('[data-graph-node]');
    if(el){ev.preventDefault();graphClick(el.dataset.graphNode);}
  });
  $('adv-graph-clear').addEventListener('click',()=>{
    if(completed){completed=false;$('advanced-check').disabled=false;$('advanced-feedback').hidden=true;}
    graphNodes=[];graphEdges=[];graphStart=null;graphDelete=false;renderGraph();
  });
  drawGraphDV();renderGraph();
}
function drawEquations(){
  for(const row of ODE_STATES){
    const picked=odePicks[row.id];
    const output=$('ode-rhs-'+row.id);
    output.textContent=picked.length?picked.map(t=>ODE_TERMS[t].part).join(' '):'Choisissez les termes ci-dessous';
    const panel=$('ode-'+row.id);
    panel.querySelectorAll('[data-term]').forEach(button=>{
      button.setAttribute('aria-pressed',String(picked.includes(button.dataset.term)));
      button.disabled=completed;
    });
  }
}
function setupOdes(){
  $('advanced-stage').innerHTML='<p class="advanced-instruction">Modèle oral 2C linéaire. Constituez <strong>toutes les équations différentielles</strong> des quantités Ag, Ac, Ap et Ae. Chaque terme peut être utilisé dans plusieurs dérivées avec son signe approprié.</p>'+
    '<div id="ode-editor" class="ode-editor">'+ODE_STATES.map(row=>
      '<section class="ode-row" id="ode-'+row.id+'"><h3>'+row.label+' =</h3>'+
      '<div class="ode-rhs" id="ode-rhs-'+row.id+'"></div>'+
      '<div class="ode-term-options">'+Object.entries(ODE_TERMS).map(([key,term])=>
        '<button type="button" data-term="'+key+'" data-ode-state="'+row.id+'" aria-pressed="false">'+term.label+'</button>').join('')+'</div></section>'
    ).join('')+'</div>';
  $('ode-editor').addEventListener('click',ev=>{
    const button=ev.target.closest('[data-ode-state]');if(!button||completed)return;
    const tokens=odePicks[button.dataset.odeState],idx=tokens.indexOf(button.dataset.term);
    if(idx>=0)tokens.splice(idx,1);else tokens.push(button.dataset.term);
    drawEquations();
  });drawEquations();
}
function polyline(points,maxTime,maxC,{color='#9cebd1',x0=46,y0=18,width=615,height=200}={}){
  const d=points.map(p=>(x0+p.t/maxTime*width).toFixed(2)+','+(y0+height*(1-p.c/maxC)).toFixed(2)).join(' ');
  return '<polyline points="'+d+'" fill="none" stroke="'+color+'" stroke-width="3.3" stroke-linejoin="round"/>';
}
function chartBase(svg,title,maxTime,maxC,paths,threshold){
  const x0=46,y0=18,width=615,height=200;
  let markup='<rect x="46" y="18" width="615" height="200" rx="8" fill="#0d242a"/>';
  if(threshold!==null){
    const y=y0+height*(1-threshold/maxC);
    markup+='<line x1="46" x2="661" y1="'+y+'" y2="'+y+'" stroke="#ecc892" stroke-width="2" stroke-dasharray="8 5"/>'+
      '<text x="642" y="'+(y-7)+'" text-anchor="end" fill="#f4d8a4" font-size="14">CMI</text>';
  }
  for(let i=0;i<=4;i++){
    const x=x0+i*width/4,y=y0+i*height/4;
    markup+='<line x1="46" x2="661" y1="'+y+'" y2="'+y+'" stroke="#2b4a51" stroke-dasharray="3 7"/>'+
      '<text x="37" y="'+(y+4)+'" fill="#b5cec7" text-anchor="end" font-size="12">'+fmt(maxC*(1-i/4),1)+'</text>'+
      '<text x="'+x+'" y="240" fill="#b5cec7" text-anchor="middle" font-size="12">'+fmt(maxTime*i/4,1)+' h</text>';
  }
  svg.innerHTML=markup+paths+'<rect x="46" y="18" width="615" height="200" rx="8" fill="none" stroke="#406068"/>'+
    '<text x="46" y="15" fill="#a9c9c2" font-size="12">'+title+'</text>';
}
function micUpdate(){
  const r=gradeMic({dose:micDose,tau:micTau});
  $('adv-mic-dose-output').textContent=fmt(micDose,0)+' mg';
  $('adv-mic-tau-output').textContent=fmt(micTau,0)+' h';
  $('adv-mic-ft').textContent=fmt(100*r.fT,1)+' %';
  $('adv-mic-auc').textContent=fmt(r.auc24,1)+' mg·h/L';
  const highest=Math.max(r.freePeak*1.08,2.5);
  chartBase($('adv-mic-chart'),'Concentration libre · mg/L',micTau,highest,
    polyline(r.concentrations,micTau,highest),2);
}
function setupMic(){
  $('advanced-stage').innerHTML='<p class="advanced-instruction">Antibiotique <strong>entièrement fictif</strong> : dose IV instantanée à l’état stationnaire, 1C, CL = 5 L/h, V = 20 L, fraction libre = 0,8, <strong>CMI = 2 mg/L</strong>. Objectifs inventés pour le jeu : <strong>fT &gt; CMI ≥ 70 %</strong> et <strong>AUC24 ≤ 150 mg·h/L</strong>. Ce n’est pas un schéma réel de perfusion.</p>'+
    '<div class="advanced-control-grid"><label>Dose / administration <strong id="adv-mic-dose-output"></strong><input id="adv-mic-dose" type="range" min="50" max="350" step="25" value="100"></label>'+
    '<label>Intervalle entre doses <strong id="adv-mic-tau-output"></strong><select id="adv-mic-tau"><option>6</option><option selected>8</option><option>12</option><option>24</option></select></label></div>'+
    '<div class="advanced-metrics"><span>fT &gt; CMI<strong id="adv-mic-ft"></strong></span><span>AUC24<strong id="adv-mic-auc"></strong></span></div>'+
    '<svg id="adv-mic-chart" class="advanced-chart" viewBox="0 0 705 250" role="img" aria-label="Concentrations libres à l’état stationnaire, CMI et intervalle de dose"></svg>';
  $('adv-mic-dose').addEventListener('input',ev=>{micDose=Number(ev.target.value);micUpdate();});
  $('adv-mic-tau').addEventListener('change',ev=>{micTau=Number(ev.target.value);micUpdate();});
  micUpdate();
}
function nonlinearUpdate(){
  const r=nonlinearChallenge({linearDose, saturableDose:mmDose});
  $('adv-linear-dose-label').textContent=fmt(linearDose,0)+' mg';
  $('adv-mm-dose-label').textContent=fmt(mmDose,0)+' mg';
  $('adv-linear-auc').textContent=fmt(r.linear,1)+' mg·h/L';
  $('adv-mm-auc').textContent=fmt(r.saturable,1)+' mg·h/L';
  const a=oneDoseProfile(linearDose,'linear'),b=oneDoseProfile(mmDose,'mm');
  const ymax=Math.max(a[0].c,b[0].c)*1.12;
  chartBase($('adv-nonlinear-chart'),'Concentrations totales · mg/L',32,ymax,
    polyline(a,32,ymax,{color:'#91e8d0'})+polyline(b,32,ymax,{color:'#f3b980'}),null);
}
function setupNonlinear(){
  $('advanced-stage').innerHTML='<p class="advanced-instruction">Deux molécules fictives administrées en bolus IV : la première est éliminée selon une <strong>loi linéaire (CL = 5 L/h)</strong>, l’autre selon <strong>Michaelis–Menten</strong> (Vmax = 30 mg/h, Km = 2 mg/L, V = 20 L). Réglez chacune pour atteindre une <strong>AUC∞ cible = 60 mg·h/L (±6 %)</strong>.</p>'+
    '<div class="advanced-control-grid"><label>Élimination linéaire <strong id="adv-linear-dose-label"></strong><input id="adv-linear-dose" type="range" min="50" max="500" step="10" value="180"></label>'+
    '<label>Élimination saturable <strong id="adv-mm-dose-label"></strong><input id="adv-mm-dose" type="range" min="50" max="500" step="10" value="180"></label></div>'+
    '<div class="advanced-metrics"><span>AUC∞ linéaire<strong id="adv-linear-auc"></strong></span><span>AUC∞ Michaelis–Menten<strong id="adv-mm-auc"></strong></span></div>'+
    '<div class="advanced-legend"><span class="legend-line mint"></span> Linéaire <span class="legend-line peach"></span> Saturable</div>'+
    '<svg id="adv-nonlinear-chart" class="advanced-chart" viewBox="0 0 705 250" role="img" aria-label="Comparaison des concentrations après bolus, loi linéaire et élimination saturable"></svg>';
  $('adv-linear-dose').addEventListener('input',ev=>{linearDose=Number(ev.target.value);nonlinearUpdate();});
  $('adv-mm-dose').addEventListener('input',ev=>{mmDose=Number(ev.target.value);nonlinearUpdate();});
  nonlinearUpdate();
}
function ddiUpdate(){
  const r=ddiChallenge(ddiCl);
  $('adv-ddi-cl-label').textContent=fmt(ddiCl,1)+' L/h';
  $('adv-ddi-auc-ratio').textContent='×'+fmt(r.aucRatio,2);
  $('adv-ddi-c0-before').textContent=fmt(r.before.cmin,2)+' mg/L';
  $('adv-ddi-c0-after').textContent=fmt(r.after.cmin,2)+' mg/L';
  $('adv-ddi-auc-before').textContent=fmt(r.before.auc,1)+' mg·h/L';
  $('adv-ddi-auc-after').textContent=fmt(r.after.auc,1)+' mg·h/L';
  $('adv-ddi-bar-auc').style.width=Math.min(100,r.aucRatio/6*100)+'%';
  $('adv-ddi-bar-c0').style.width=Math.min(100,r.troughRatio/6*100)+'%';
  const ymax=Math.max(...r.after.points.map(p=>p.c),...r.before.points.map(p=>p.c))*1.11;
  chartBase($('adv-ddi-chart'),'Concentration à l’état stationnaire · mg/L',12,ymax,
    polyline(r.before.points,12,ymax,{color:'#92ead5'})+
    polyline(r.after.points,12,ymax,{color:'#f5bf91'}),null);
  $('adv-ddi-c0-ratio').textContent=completed?'×'+fmt(r.troughRatio,2):'À interpréter';
}
function setupDdi(){
  $('advanced-stage').innerHTML='<p class="advanced-instruction">Un médicament <strong>entièrement fictif</strong> est administré à dose constante (100 mg par voie orale toutes les 12 h). Une interaction réduit sa clairance, sans modifier F, Ka ni V. Faites augmenter son AUC d’au moins <strong>70 %</strong>, puis comparez les variations relatives de <strong>l’AUC et de C0</strong> : laquelle est la plus importante ? Aucune division de tête n’est nécessaire.</p>'+
    '<div class="advanced-control-grid"><label>CL après interaction <strong id="adv-ddi-cl-label"></strong><input id="adv-ddi-cl" type="range" min="1.5" max="5" step="0.5" value="2.5"></label>'+
    '<div class="ddi-table"><strong>Vos observations · avant → après</strong>'+
    '<div>AUCτ <span id="adv-ddi-auc-before"></span> → <b id="adv-ddi-auc-after"></b></div>'+
    '<div>C0 <span id="adv-ddi-c0-before"></span> → <b id="adv-ddi-c0-after"></b></div></div></div>'+
    '<div class="advanced-metrics"><span>Augmentation relative de l’AUC<strong id="adv-ddi-auc-ratio"></strong></span>'+
    '<span>Augmentation relative de C0<strong id="adv-ddi-c0-ratio">À interpréter</strong></span></div>'+
    '<div class="ddi-bars"><div><span>AUC</span><div class="advanced-bar-track"><div id="adv-ddi-bar-auc"></div></div></div>'+
    '<div><span>C0</span><div class="advanced-bar-track"><div id="adv-ddi-bar-c0"></div></div></div>'+
    '<p class="advanced-small">Longueur des barres = rapport après/avant, sur la même échelle. Les valeurs initiales sont affichées dans le tableau.</p></div>'+
    '<fieldset class="ddi-comparison"><legend>Quel indicateur subit la plus forte augmentation <em>proportionnelle</em> ?</legend>'+
    '<label><input type="radio" name="ddi-comparison" value="auc"> L’AUC augmente davantage</label>'+
    '<label><input type="radio" name="ddi-comparison" value="trough"> C0 augmente davantage</label>'+
    '<label><input type="radio" name="ddi-comparison" value="same"> Les deux augmentent pareil</label></fieldset>'+
    '<div class="advanced-legend"><span class="legend-line mint"></span> Avant <span class="legend-line peach"></span> Après baisse de CL</div>'+
    '<svg id="adv-ddi-chart" class="advanced-chart" viewBox="0 0 705 250" role="img" aria-label="Courbes comparées avec et sans modification de clairance"></svg>'+
    '<p class="advanced-small">C0 est la concentration pré-dose suivante à l’état stationnaire. Dans une interaction réelle, F et Ka peuvent aussi changer ; ce cas isole uniquement CL.</p>';
  $('adv-ddi-cl').addEventListener('input',ev=>{ddiCl=Number(ev.target.value);ddiUpdate();});
  ddiUpdate();
}
function renderStage(){
  switch(ADVANCED_MISSIONS[current].id){
    case 'graph':return setupGraph();
    case 'odes':return setupOdes();
    case 'mic':return setupMic();
    case 'nonlinear':return setupNonlinear();
    case 'ddi':return setupDdi();
    default:extended=setupExtended(ADVANCED_MISSIONS[current].id,$('advanced-stage'),completed);return;
  }
}
function check(){
  if(completed)return;
  switch(ADVANCED_MISSIONS[current].id){
    case 'graph': {
      const r=validateGraph(graphNodes,graphEdges);
      if(r.ok){complete();renderGraph();}
      else feedback(false,'Votre proposition n’est pas encore cohérente avec le scénario : revoyez les éléments retenus, les échanges éventuels et le sens des flux. Les blocs inutiles sont à retirer.');
      return;
    }
    case 'odes': {
      const r=validateOdes(odePicks);
      if(r.ok)complete();
      else feedback(false,'Certaines équations ne sont pas encore cohérentes : '+r.wrong.length+
        ' dérivée(s) à revoir. Vérifiez le sens et le signe des flux.');
      return;
    }
    case 'mic': {
      const r=gradeMic({dose:micDose,tau:micTau});
      if(r.ok)complete('Votre simulation : fT > CMI = '+fmt(r.fT*100,1)+' % et AUC24 = '+fmt(r.auc24,1)+' mg·h/L.');
      else feedback(false,'Objectif du jeu non atteint : ajustez dose et intervalle pour satisfaire simultanément les deux critères.');
      return;
    }
    case 'nonlinear': {
      const r=nonlinearChallenge({linearDose,saturableDose:mmDose});
      if(r.ok)complete('Vos résultats : AUC linéaire = '+fmt(r.linear,1)+' et AUC saturable = '+fmt(r.saturable,1)+' mg·h/L.');
      else feedback(false,'Les deux AUC doivent être à ±6 % de la cible, pas uniquement l’une d’elles.');
      return;
    }
    case 'ddi': {
      const element=$('advanced-stage').querySelector('input[name="ddi-comparison"]:checked');
      if(!element){$('advanced-stage').querySelector('input[name="ddi-comparison"]')?.focus();return;}
      const r=gradeDdi(ddiCl,element.value);
      if(r.ok){complete('AUC ×'+fmt(r.aucRatio,2)+' ; C0 ×'+fmt(r.troughRatio,2)+'.');ddiUpdate();}
      else feedback(false,'Comparez les changements avant/après pour chaque indicateur : ce sont les variations relatives qui comptent, pas les écarts absolus.');
      return;
    }
    default: {
      const r=extended.check();
      if(r.ok){complete(r.message);extended.reveal();}
      else feedback(false,r.message);
      return;
    }
  }
}
$('advanced-check').addEventListener('click',check);
$('advanced-hint').addEventListener('click',()=>{$('advanced-hint-text').hidden=false;});
$('advanced-next').addEventListener('click',()=>select(isFree()?Math.min(ADVANCED_MISSIONS.length-1,current+1):maxOpen()));
$('advanced-reset').addEventListener('click',()=>{
  if(!confirm(document.documentElement.lang==='en'?'Reset the nine advanced challenges in this browser?':'Réinitialiser les neuf défis avancés sur ce navigateur ?'))return;
  progress={completed:[]};save();select(0);
});
window.addEventListener('pmx-game-learning-mode',()=>{
  if(!isFree()&&current>maxOpen()&&!progress.completed.includes(ADVANCED_MISSIONS[current].id))select(maxOpen());
  else {nav();$('advanced-next').hidden=current===ADVANCED_MISSIONS.length-1||(!completed&&!isFree());}
});
window.addEventListener('pmx-game-language-change',()=>{if(ADVANCED_MISSIONS[current].id==='graph'&&!$('advanced-mode').hidden)drawGraphDV();});
select(current);

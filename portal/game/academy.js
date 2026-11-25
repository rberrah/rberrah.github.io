import { isFree, firstIncomplete, canVisit, normalizeCompleted } from './learning-mode.js';
import { QUESTS, profileFor, grade, validateProgress, unlockedIndex } from './academy-core.js';
import { fmt, renderCurve, renderPhysiology, probeTime, probeSummary } from './academy-visual.js';

const $=id=>document.getElementById(id);
const KEY='pmx-game-quest-progress-v1';
let progress={completed:[],xp:0};
try {progress=validateProgress(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{progress=validateProgress(null);}
let index=unlockedIndex(progress.completed);
let quest, result, scale='linear', t=0, probes=[], tutorialStep=0, solved=false;
let playing=false, lastFrame=0, animation=0;

function save(){
  progress=validateProgress(progress);
  try{localStorage.setItem(KEY,JSON.stringify(progress));}catch{/*Browser-only progress is optional.*/}
}
function pause(){
  playing=false;cancelAnimationFrame(animation);
  $('academy-play').textContent='▶';
  $('academy-play').setAttribute('aria-label','Lecture de la simulation');
}
function tick(now){
  if(!playing)return;
  t=Math.min(result.config.horizon,t+Math.min(.1,(now-lastFrame)/1000)*5);
  lastFrame=now;drawTime();
  if(t>=result.config.horizon)pause();
  else animation=requestAnimationFrame(tick);
}
function togglePlay(){
  if(playing){pause();return;}
  if(t>=result.config.horizon)t=0;
  playing=true;lastFrame=performance.now();
  $('academy-play').textContent='Ⅱ';
  $('academy-play').setAttribute('aria-label','Pause de la simulation');
  animation=requestAnimationFrame(tick);
}
function showMode(name){
  const academy=name==='academy';
  const lab=name==='lab';
  const advanced=name==='advanced';
  const population=name==='population';
  const mipd=name==='mipd';
  const pmetrics=name==='pmetrics';
  $('academy-mode').hidden=!academy;
  $('lab-mode').hidden=!lab;
  $('advanced-mode').hidden=!advanced;
  $('population-mode').hidden=!population;
  $('mipd-mode').hidden=!mipd;
  $('pmetrics-mode').hidden=!pmetrics;
  $('mode-campaign').setAttribute('aria-pressed',String(academy));
  $('mode-lab').setAttribute('aria-pressed',String(lab));
  $('mode-advanced').setAttribute('aria-pressed',String(advanced));
  $('mode-population').setAttribute('aria-pressed',String(population));
  $('mode-mipd').setAttribute('aria-pressed',String(mipd));
  $('mode-pmetrics').setAttribute('aria-pressed',String(pmetrics));
  if(!academy)pause();
  else {
    const play=$('play');
    if(play?.getAttribute('aria-pressed')==='true')play.click();
    drawTime();
  }
}
function updateMap(){
  $('quest-xp').textContent=progress.xp+' XP';
  $('quest-count').textContent=progress.completed.length+'/'+QUESTS.length;
  $('quest-progress').setAttribute('aria-valuenow',String(progress.completed.length));
  $('quest-progress-bar').style.width=(100*progress.completed.length/QUESTS.length)+'%';
  const furthest=unlockedIndex(progress.completed);
  const fragment=document.createDocumentFragment();
  QUESTS.forEach((q,i)=>{
    const done=progress.completed.includes(q.id);
    const button=document.createElement('button');
    button.type='button';button.disabled=!isFree()&&i>furthest&&!done;
    button.classList.toggle('completed',done);
    if(i===index)button.setAttribute('aria-current','step');
    const num=document.createElement('span');num.className='quest-index';num.textContent=done?'✓':String(i+1);
    const label=document.createElement('span');
    const strong=document.createElement('strong');strong.textContent=q.title;
    const small=document.createElement('small');small.textContent=q.tag+' · '+(done?'Terminée':button.disabled?'Verrouillée':'À jouer');
    label.append(strong,small);button.append(num,label);
    button.addEventListener('click',()=>selectQuest(i));fragment.append(button);
  });
  $('quest-list').replaceChildren(fragment);
}
function createAnswers(){
  const parent=$('academy-answers');parent.replaceChildren();
  if(quest.answerMode==='number'){
    parent.className='number-answer';
    const input=document.createElement('input');
    input.type='number';input.id='academy-number';input.name='number';
    input.min='0';input.max=quest.id==='slope'?'5':'6';
    input.step=quest.id==='slope'?'0.01':'0.25';
    input.placeholder='Votre estimation';
    input.setAttribute('aria-label',quest.id==='slope'?'Constante k en h-1':'Tlag en heures');
    const unit=document.createElement('span');unit.textContent=quest.id==='slope'?'h⁻¹':'heures';
    parent.append(input,unit);
  }else{
    parent.className='question-options';
    const choices=quest.options.map((option,i)=>({option,i}));
    for(let n=choices.length-1;n>0;n--){const j=Math.floor(Math.random()*(n+1));[choices[n],choices[j]]=[choices[j],choices[n]];}
    choices.forEach(({option,i})=>{
      const label=document.createElement('label');label.className='answer-option';
      const input=document.createElement('input');input.type='radio';input.name='quest-option';input.value=String(i);
      const text=document.createElement('span');text.textContent=option;
      label.append(input,text);parent.append(label);
    });
  }
}
const tutorialSteps=[
  {title:'Bienvenue dans le corps',text:'Vous allez suivre les quantités après une dose orale. Déplacez le temps en dessous du corps pour observer l’absorption, les échanges et l’élimination.',button:'Continuer'},
  {title:'Regarder autrement',text:'Sur l’échelle linéaire, on perçoit les concentrations fortes. La semi-log permet de voir les changements de pente à faibles concentrations et de reconnaître les exponentielles.',button:'Passer en semi-log'},
  {title:'C’est votre tour',text:'Le tutoriel est terminé : répondez à une première énigme pour débloquer le prochain niveau. Chaque quête comprend un indice et une explication.',button:'Résoudre ma première énigme'}
];
function showTutorial(){
  const q=tutorialSteps[tutorialStep];
  $('tutorial-step').textContent='Tutoriel · Étape '+(tutorialStep+1)+' / 3';
  $('tutorial-title').textContent=q.title;
  $('tutorial-text').textContent=q.text;
  $('tutorial-next').textContent=q.button;
}
function nextTutorial(){
  if(tutorialStep===1){scale='log';drawChart();}
  if(tutorialStep<2){tutorialStep++;showTutorial();}
  else {$('tutorial-panel').hidden=true;$('academy-question').hidden=false;}
}
function disableAnswers(disabled){
  $('academy-verify').disabled=disabled;
  $('academy-hint').disabled=disabled;
  $('academy-answers').querySelectorAll('input').forEach(input=>input.disabled=disabled);
}
function success(reward=true){
  solved=true;disableAnswers(true);
  const output=$('academy-feedback');output.hidden=false;output.classList.remove('error');output.replaceChildren();
  const head=document.createElement('strong');head.textContent=progress.completed.length===QUESTS.length?'Campagne terminée':'Mission accomplie · '+quest.tag;
  const explanation=document.createElement('p');explanation.textContent=quest.explanation;
  const rewardEl=document.createElement('div');rewardEl.className='reward';
  rewardEl.textContent=reward?'+'+quest.xp+' XP':'Mission déjà accomplie · '+quest.xp+' XP';
  output.append(head,explanation,rewardEl);
  if(progress.completed.length===QUESTS.length){
    const badge=document.createElement('div');badge.className='quest-award';
    badge.textContent='Badge « Détective PK » · Vous avez terminé les neuf enquêtes. Relevez maintenant le défi de reconstruction d’une courbe mystère dans l’atelier.';
    output.append(badge);
  }
  $('academy-next').hidden=index===QUESTS.length-1;
  $('academy-explore').hidden=progress.completed.length!==QUESTS.length;
}
function selectQuest(i){
  if(!Number.isInteger(i)||i<0||i>=QUESTS.length)return;
  if(!isFree()&&i>unlockedIndex(progress.completed)&&!progress.completed.includes(QUESTS[i].id))return;
  pause();index=i;quest=QUESTS[i];result=profileFor(quest);
  scale=quest.scale;t=0;probes=[];solved=progress.completed.includes(quest.id);
  tutorialStep=i===0&&!solved?0:2;
  $('academy-chapter').textContent=quest.chapter;
  document.querySelector('.quest-visuals')?.classList.toggle('journey',quest.id==='voyage');
  $('quest-level').textContent='Mission '+(i+1)+' / '+QUESTS.length+' · '+quest.xp+' XP';
  $('academy-title').textContent=quest.title;$('academy-summary').textContent=quest.summary;
  $('academy-tag').textContent=quest.tag;
  $('academy-question-title').textContent='Examinez les indices';
  $('academy-question-text').textContent=quest.question;
  $('academy-hint-text').textContent=quest.hint;
  $('academy-hint-text').hidden=true;
  $('academy-feedback').replaceChildren();$('academy-feedback').hidden=true;
  $('academy-question').hidden=tutorialStep<2;
  $('tutorial-panel').hidden=tutorialStep>=2;
  $('academy-next').hidden=!isFree()||i===QUESTS.length-1;$('academy-explore').hidden=true;
  $('academy-time').max=String(result.config.horizon);
  createAnswers();
  disableAnswers(solved);
  if(i===0&&!solved)showTutorial();
  if(solved)success(false);
  updateMap();drawChart();drawTime();
}
function answer(event){
  event.preventDefault();if(solved)return;
  let value;
  if(quest.answerMode==='number'){
    const input=$('academy-number');
    if(input.value.trim()==='' || !Number.isFinite(input.valueAsNumber)){input.focus();return;}
    value=input.valueAsNumber;
  }else{
    const chosen=$('academy-answers').querySelector('input:checked');
    if(!chosen){$('academy-answers').querySelector('input')?.focus();return;}
    value=Number(chosen.value);
  }
  if(grade(quest,value).correct){
    if(!progress.completed.includes(quest.id)){
      progress.completed.push(quest.id);save();
    }
    success();updateMap();drawChart();
  }else{
    const panel=$('academy-feedback');panel.hidden=false;panel.classList.add('error');panel.replaceChildren();
    const head=document.createElement('strong');head.textContent='Ce n’est pas encore ça.';
    const text=document.createElement('p');text.textContent=quest.hint;
    panel.append(head,text);
  }
}
function drawChart(){
  $('academy-linear').setAttribute('aria-pressed',String(scale==='linear'));
  $('academy-log').setAttribute('aria-pressed',String(scale==='log'));
  $('academy-axis').textContent=scale==='log'?'Axe Y logarithmique · C > 0':'Axe Y linéaire · mg/L';
  renderCurve($('academy-chart'),result,quest,scale,solved,probes);
  $('academy-probe').textContent=probeSummary(result,probes);
}
function drawTime(){
  $('academy-time').value=String(t);$('academy-clock').textContent=fmt(t,1)+' h';
  const p=renderPhysiology($('body-figure'),result,t,quest);
  $('body-gut').textContent=fmt(p.gut,1)+' mg';
  $('body-central').textContent=fmt(p.central,1)+' mg';
  $('body-tissue').textContent=fmt(p.tissue,1)+' mg';
  $('body-eliminated').textContent=fmt(p.eliminated,1)+' mg';
}
function selectProbe(event){
  const moment=probeTime($('academy-chart'),event,result.config.horizon);
  if(moment===null)return;
  if(probes.length>=2)probes=[];
  probes.push(moment);
  drawChart();
}
$('mode-campaign').addEventListener('click',()=>showMode('academy'));
$('mode-lab').addEventListener('click',()=>showMode('lab'));
$('mode-advanced').addEventListener('click',()=>showMode('advanced'));
$('mode-population').addEventListener('click',()=>showMode('population'));
$('mode-pmetrics').addEventListener('click',()=>showMode('pmetrics'));
$('mode-mipd').addEventListener('click',()=>showMode('mipd'));
$('tutorial-next').addEventListener('click',nextTutorial);
$('academy-linear').addEventListener('click',()=>{scale='linear';probes=[];drawChart();});
$('academy-log').addEventListener('click',()=>{scale='log';probes=[];drawChart();});
$('academy-chart').addEventListener('click',selectProbe);
$('academy-time').addEventListener('input',()=>{pause();t=Number($('academy-time').value);drawTime();});
$('academy-play').addEventListener('click',togglePlay);
$('academy-form').addEventListener('submit',answer);
$('academy-hint').addEventListener('click',()=>{$('academy-hint-text').hidden=false;});
$('academy-next').addEventListener('click',()=>selectQuest(isFree()?Math.min(QUESTS.length-1,index+1):unlockedIndex(progress.completed)));
$('academy-explore').addEventListener('click',()=>{
  showMode('lab');
  if($('challenge').getAttribute('aria-pressed')!=='true')$('challenge').click();
  $('lab-mode').scrollIntoView({behavior:'auto',block:'start'});
});
$('quest-reset').addEventListener('click',()=>{
  if(!confirm(document.documentElement.lang==='en'?'Restart the nine quests in this browser?':'Recommencer les neuf quêtes sur ce navigateur ?'))return;
  pause();progress={completed:[],xp:0};save();selectQuest(0);
});
window.addEventListener('resize',()=>{if(!$('academy-mode').hidden)drawTime();});
window.addEventListener('pmx-game-learning-mode',()=>{
  if(!isFree()&&index>unlockedIndex(progress.completed)&&!progress.completed.includes(quest.id))selectQuest(unlockedIndex(progress.completed));
  else {updateMap();$('academy-next').hidden=index===QUESTS.length-1||(!solved&&!isFree());}
});
selectQuest(index);
showMode('academy');

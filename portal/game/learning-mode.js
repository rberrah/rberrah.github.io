// Shared navigation rules. Visiting a step never marks it complete.
export function normalizeCompleted(value,total){
  return Array.isArray(value)?[...new Set(value.filter(i=>Number.isInteger(i)&&i>=0&&i<total))].sort((a,b)=>a-b):[];
}
export function firstIncomplete(completed,total){
  for(let i=0;i<total;i++)if(!completed.includes(i))return i;
  return total-1;
}
export function canVisit(index,completed,total,free=false){
  return Number.isInteger(index)&&index>=0&&index<total&&(free||completed.includes(index)||index<=firstIncomplete(completed,total));
}
export function isFree(){return Boolean(globalThis.document?.getElementById('game-free-mode')?.checked);}
if(typeof document!=='undefined'){
  const toggle=document.getElementById('game-free-mode');
  toggle?.addEventListener('change',()=>window.dispatchEvent(new Event('pmx-game-learning-mode')));
}

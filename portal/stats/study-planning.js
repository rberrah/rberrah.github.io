import { sampleSizeTwoMeans, sampleSizePairedMeans, sampleSizeTwoProportions, sampleSizeCorrelation } from './power-engine.js';

const tr=(fr,en)=>document.documentElement.lang==='en'?en:fr;
const val=id=>Number(document.querySelector(id)?.value);

function fields(design){
  if(design==='two_means')return `<label>${tr('Différence minimale','Minimum difference')}<input id="plan-diff" type="number" step="any" value="5"></label><label>${tr('Écart-type commun','Common SD')}<input id="plan-sd" type="number" step="any" value="10"></label>`;
  if(design==='paired_means')return `<label>${tr('Différence moyenne','Mean difference')}<input id="plan-diff" type="number" step="any" value="5"></label><label>${tr('Écart-type des différences','SD of differences')}<input id="plan-sd-diff" type="number" step="any" value="10"></label>`;
  if(design==='two_proportions')return `<label>${tr('Proportion groupe 1','Group 1 proportion')}<input id="plan-p1" type="number" min="0.001" max="0.999" step="0.01" value="0.40"></label><label>${tr('Proportion groupe 2','Group 2 proportion')}<input id="plan-p2" type="number" min="0.001" max="0.999" step="0.01" value="0.60"></label>`;
  return `<label>${tr('Corrélation attendue |r|','Expected correlation |r|')}<input id="plan-r" type="number" min="0.01" max="0.99" step="0.01" value="0.30"></label>`;
}

function renderFields(){
  const d=document.querySelector('#plan-design')?.value||'two_means';
  document.querySelector('#plan-fields').innerHTML=fields(d);
  document.querySelector('#plan-result').innerHTML='';
}

function calculate(){
  const design=document.querySelector('#plan-design').value;
  const common={alpha:val('#plan-alpha'),power:val('#plan-power'),dropout:val('#plan-dropout')/100};
  const box=document.querySelector('#plan-result');
  try{
    let r;
    if(design==='two_means')r=sampleSizeTwoMeans({difference:val('#plan-diff'),sd:val('#plan-sd'),...common});
    else if(design==='paired_means')r=sampleSizePairedMeans({difference:val('#plan-diff'),sdDifference:val('#plan-sd-diff'),...common});
    else if(design==='two_proportions')r=sampleSizeTwoProportions({p1:val('#plan-p1'),p2:val('#plan-p2'),...common});
    else r=sampleSizeCorrelation({r:val('#plan-r'),...common});
    box.classList.remove('power-error');
    if(r.perGroup)box.innerHTML=`<strong>${r.perGroup} ${tr('par groupe','per group')} · ${r.total} ${tr('au total','total')}</strong><small>${tr('Avant attrition','Before dropout')}: ${r.basePerGroup} ${tr('par groupe','per group')}.</small>`;
    else box.innerHTML=`<strong>${r.total} ${tr('participants au total','participants total')}</strong><small>${tr('Avant attrition','Before dropout')}: ${r.baseTotal}.</small>`;
  }catch{
    box.classList.add('power-error');
    box.innerHTML=`<strong>${tr('Paramètres non valides','Invalid parameters')}</strong>`;
  }
}

function inject(){
  const sidebar=document.querySelector('.tool-sidebar');
  if(!sidebar||document.querySelector('#study-planning'))return;
  const style=document.createElement('style');
  style.textContent='.study-planning{margin-top:18px}.plan-grid{display:grid;gap:9px;margin-top:10px}.plan-grid label{display:grid;gap:4px;font-size:.82rem;font-weight:650}.plan-common{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.study-planning input,.study-planning select{width:100%;box-sizing:border-box}.plan-run{width:100%;margin-top:10px}.plan-result{margin-top:10px;padding:10px;border:1px solid var(--border,#d5e0e1);border-radius:8px}.plan-result strong,.plan-result small{display:block}.plan-result small{margin-top:4px;color:var(--muted,#62777b)}.plan-note{font-size:.75rem;color:var(--muted,#62777b);line-height:1.4}.power-error{color:#9b4533}@media(max-width:760px){.plan-common{grid-template-columns:1fr}}';
  document.head.appendChild(style);
  const section=document.createElement('section');
  section.className='tool-panel study-planning';section.id='study-planning';
  section.innerHTML=`<h2>${tr('Planifier une étude','Plan a study')}</h2><p>${tr('Estimer l’effectif avant l’analyse.','Estimate sample size before analysis.')}</p><label>${tr('Plan','Design')}<select id="plan-design"><option value="two_means">${tr('2 moyennes indépendantes','2 independent means')}</option><option value="paired_means">${tr('Avant / après apparié','Paired before / after')}</option><option value="two_proportions">2 proportions</option><option value="correlation">${tr('Corrélation','Correlation')}</option></select></label><div id="plan-fields" class="plan-grid"></div><div class="plan-common"><label>α<input id="plan-alpha" type="number" step="0.01" value="0.05"></label><label>${tr('Puissance','Power')}<input id="plan-power" type="number" step="0.05" value="0.80"></label><label>${tr('Attrition %','Dropout %')}<input id="plan-dropout" type="number" step="1" value="10"></label></div><button id="plan-run" class="small-button plan-run" type="button">${tr('Calculer l’effectif','Calculate sample size')}</button><div id="plan-result" class="plan-result" aria-live="polite"></div><p class="plan-note">${tr('Approximation bilatérale pour la planification. Pour un essai confirmatoire, documenter les hypothèses et vérifier le calcul dans un logiciel de référence.','Two-sided planning approximation. For confirmatory trials, document assumptions and verify the calculation in reference software.')}</p>`;
  sidebar.appendChild(section);
  section.querySelector('#plan-design').addEventListener('change',renderFields);
  section.querySelector('#plan-run').addEventListener('click',calculate);
  renderFields();
}

inject();

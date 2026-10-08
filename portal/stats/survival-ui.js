import { kaplanMeierSummary, coxBinaryGroup } from './survival-engine.js';

const tr=(fr,en)=>document.documentElement.lang==='en'?en:fr;
const esc=value=>String(value).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=(x,d=3)=>{if(!Number.isFinite(x))return '—';const a=Math.abs(x);if(a!==0&&(a>=10000||a<0.001))return x.toExponential(2);return x.toFixed(d).replace(/\.000$/,'');};
const fmtP=p=>!Number.isFinite(p)?'—':p<0.0001?'< 0.0001':p.toFixed(4);
const pct=x=>Number.isFinite(x)?`${(100*x).toFixed(1).replace('.0','')}%`:'—';

function parseLine(line,delimiter){const out=[];let cur='',quote=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quote&&line[i+1]==='"'){cur+='"';i++;}else quote=!quote;}else if(ch===delimiter&&!quote){out.push(cur.trim());cur='';}else cur+=ch;}out.push(cur.trim());return out;}
function data(){const text=document.querySelector('#data-input')?.value?.trim()||'';const lines=text.split(/\r?\n/).filter(Boolean);if(lines.length<2)return null;const first=lines[0],delimiter=first.includes('\t')?'\t':first.includes(';')?';':',';const headers=parseLine(first,delimiter).map((h,i)=>h||`col_${i+1}`);const rows=lines.slice(1).map(line=>{const vals=parseLine(line,delimiter),row={};headers.forEach((h,i)=>row[h]=vals[i]??'');return row;});return {rows};}
const unique=(rows,key)=>[...new Set(rows.map(r=>String(r[key]??'').trim()).filter(Boolean))];

function injectStyles(){
  if(document.querySelector('#stats-survival-styles'))return;
  const style=document.createElement('style');style.id='stats-survival-styles';style.textContent=`
    .survival-summary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0}
    .survival-summary-card{padding:14px;border:1px solid var(--line,#d5e0e1);border-radius:10px;background:var(--surface,#fff)}
    .survival-summary-card h4{margin:0 0 8px}.survival-summary-card dl{display:grid;grid-template-columns:1fr auto;gap:5px 12px;margin:0;font-size:.85rem}.survival-summary-card dt{color:var(--muted,#5a6c70)}.survival-summary-card dd{margin:0;font-weight:700}
    .survival-note{margin:10px 0 0;color:var(--muted,#5a6c70);font-size:.82rem;line-height:1.5}
    .cox-orientation{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr);gap:5px;margin-top:2px}.cox-orientation label{display:grid;gap:5px;font-size:.82rem}
    .cox-warning{padding:10px 12px;border-left:3px solid #a36b20;background:rgba(163,107,32,.08);font-size:.84rem;line-height:1.5}
    @media(max-width:760px){.survival-summary-grid{grid-template-columns:1fr}}
  `;document.head.appendChild(style);
}

function syncOrientation(){
  document.querySelector('#survival-cox-orientation')?.remove();
  if(document.querySelector('#analysis-mode')?.value!=='survival'||document.querySelector('#mapping')?.hidden)return;
  const parsed=data(),groupKey=document.querySelector('#col-group')?.value;if(!parsed||!groupKey)return;
  const groups=unique(parsed.rows,groupKey);if(groups.length!==2)return;
  const host=document.querySelector('.mapping-options');if(!host)return;
  const box=document.createElement('div');box.id='survival-cox-orientation';box.className='cox-orientation';
  box.innerHTML=`<label><span data-fr="Groupe pour le hazard ratio (vs l’autre groupe)" data-en="Hazard-ratio group (vs the other group)">${esc(tr('Groupe pour le hazard ratio (vs l’autre groupe)','Hazard-ratio group (vs the other group)'))}</span><select id="cox-group1">${groups.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join('')}</select></label>`;
  host.appendChild(box);
}

function enhanceResults(){
  const results=document.querySelector('#results');results?.querySelectorAll('.survival-extended').forEach(el=>el.remove());
  if(document.querySelector('#analysis-mode')?.value!=='survival'||!results?.querySelector('.result-card'))return;
  const parsed=data(),groupKey=document.querySelector('#col-group')?.value,timeKey=document.querySelector('#col-time')?.value,eventKey=document.querySelector('#col-event')?.value;
  if(!parsed||!groupKey||!timeKey||!eventKey)return;
  try{
    const km=kaplanMeierSummary(parsed.rows,groupKey,timeKey,eventKey);
    if(km.groups.length!==2)return;
    const group1=document.querySelector('#cox-group1')?.value||km.groups[0].group;
    const cox=coxBinaryGroup(parsed.rows,groupKey,timeKey,eventKey,group1);
    const summary=document.createElement('section');summary.className='advanced-section survival-extended survival-summary';
    const cards=km.groups.map(g=>`<article class="survival-summary-card"><h4>${esc(g.group)}</h4><dl><dt>n</dt><dd>${g.n}</dd><dt>${esc(tr('Événements','Events'))}</dt><dd>${g.events}</dd><dt>${esc(tr('Censures','Censored'))}</dt><dd>${g.censored}</dd><dt>${esc(tr('Médiane de survie','Median survival'))}</dt><dd>${g.median===null?esc(tr('Non atteinte','Not reached')):fmt(g.median)}</dd></dl></article>`).join('');
    const head=km.riskTimes.map(t=>`<th>${fmt(t)}</th>`).join('');
    const riskRows=km.groups.flatMap(g=>[
      `<tr><td><strong>${esc(g.group)}</strong> · ${esc(tr('à risque','at risk'))}</td>${g.atRiskAt.map(n=>`<td>${n}</td>`).join('')}</tr>`,
      `<tr><td><strong>${esc(g.group)}</strong> · S(t)</td>${g.survivalAt.map(p=>`<td>${pct(p)}</td>`).join('')}</tr>`
    ]).join('');
    summary.innerHTML=`<div class="advanced-head"><div><h3>${esc(tr('Résumé Kaplan–Meier','Kaplan–Meier summary'))}</h3><p>${esc(tr('Médiane observée, événements/censures et effectifs encore à risque à des temps descriptifs répartis sur le suivi.','Observed median, events/censoring and numbers still at risk at descriptive time points across follow-up.'))}</p></div></div><div class="survival-summary-grid">${cards}</div><div class="posthoc-wrap"><table class="posthoc-table survival-risk-table"><thead><tr><th>${esc(timeKey)}</th>${head}</tr></thead><tbody>${riskRows}</tbody></table></div><p class="survival-note">${esc(tr('Les temps de cette table sont des repères automatiques entre 0 et le suivi maximal observé ; ils ne remplacent pas des temps cliniques préspécifiés.','These table times are automatic landmarks between 0 and the maximum observed follow-up; they do not replace prespecified clinical time points.'))}</p>`;
    const coxSection=document.createElement('section');coxSection.className='advanced-section survival-extended cox-section';
    const stable=!cox.separationLikely;
    coxSection.innerHTML=`<div class="advanced-head"><div><h3>Cox PH · ${esc(cox.groupOfInterest)} vs ${esc(cox.reference)}</h3><p>${esc(tr('Modèle de Cox à un prédicteur binaire, cohérent avec le contraste du log-rank. Les ex æquo d’événements utilisent l’approximation de Breslow.','One-predictor binary Cox model matching the log-rank contrast. Tied event times use the Breslow approximation.'))}</p></div></div><div class="metrics"><div class="metric"><span>HR</span><strong>${fmt(cox.hr)}</strong></div><div class="metric"><span>${esc(tr('IC95 % HR','HR 95% CI'))}</span><strong>[${fmt(cox.hrCI[0])} ; ${fmt(cox.hrCI[1])}]</strong></div><div class="metric"><span>p Wald</span><strong>${fmtP(cox.p)}</strong></div><div class="metric"><span>${esc(tr('p rapport de vraisemblance','Likelihood-ratio p'))}</span><strong>${fmtP(cox.pLikelihoodRatio)}</strong></div><div class="metric"><span>${esc(tr('Événements','Events'))}</span><strong>${cox.events}</strong></div><div class="metric"><span>n</span><strong>${cox.n}</strong></div></div>${stable?`<p class="plain-interpretation">${esc(cox.p<0.05?tr('Les données sont peu compatibles avec HR = 1 au seuil de 5 %. L’amplitude et l’IC95 % restent prioritaires pour l’interprétation.','The data are relatively incompatible with HR = 1 at the 5% threshold. Magnitude and the 95% CI remain central to interpretation.'):tr('Les données restent compatibles avec HR = 1 au seuil de 5 %. Cela ne démontre pas l’absence de différence de risque instantané.','The data remain compatible with HR = 1 at the 5% threshold. This does not demonstrate absence of a hazard difference.'))}</p>`:`<p class="cox-warning"><strong>${esc(tr('Estimation instable','Unstable estimate'))}</strong> — ${esc(tr('Convergence ou information événementielle insuffisante dans au moins un groupe. Le HR de Cox standard ne doit pas être interprété comme une estimation fiable.','Convergence or event information is insufficient in at least one group. The standard Cox HR should not be interpreted as a reliable estimate.'))}</p>`}<p class="survival-note"><strong>${esc(tr('Hypothèse clé :','Key assumption:'))}</strong> ${esc(tr('l’interprétation d’un HR unique suppose des hazards approximativement proportionnels dans le temps. Cette version ne transforme pas cette hypothèse en test automatique ; inspectez les courbes et utilisez un diagnostic PH dédié pour une analyse confirmatoire.','interpreting one HR assumes approximately proportional hazards over time. This version does not turn that assumption into an automatic test; inspect the curves and use a dedicated PH diagnostic for confirmatory analysis.'))}</p>`;
    const before=results.querySelector('.assumptions');results.insertBefore(summary,before||null);results.insertBefore(coxSection,before||null);
  }catch(error){console.warn('Extended survival analysis unavailable',error);}
}

injectStyles();
['#parse-data','#load-demo'].forEach(sel=>document.querySelector(sel)?.addEventListener('click',()=>queueMicrotask(syncOrientation)));
document.querySelector('#analysis-mode')?.addEventListener('change',()=>queueMicrotask(syncOrientation));
document.addEventListener('change',event=>{if(event.target?.id==='col-group')queueMicrotask(syncOrientation);if(event.target?.id==='cox-group1'&&document.querySelector('#results .result-card'))queueMicrotask(enhanceResults);});
document.querySelector('#run-analysis')?.addEventListener('click',()=>queueMicrotask(enhanceResults));
document.querySelector('[data-lang-toggle]')?.addEventListener('click',()=>setTimeout(()=>{syncOrientation();if(document.querySelector('#results .result-card'))enhanceResults();},0));

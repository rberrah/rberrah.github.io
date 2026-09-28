import { kendallTauB } from './association-engine.js';

const tr=(fr,en)=>document.documentElement.lang==='en'?en:fr;
const esc=value=>String(value).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=(x,d=3)=>{if(!Number.isFinite(x))return '—';const a=Math.abs(x);if(a!==0&&(a>=10000||a<0.001))return x.toExponential(2);return x.toFixed(d).replace(/\.000$/,'');};
const fmtP=p=>!Number.isFinite(p)?'—':p<0.0001?'< 0.0001':p.toFixed(4);

function parseLine(line,delimiter){const out=[];let cur='',quote=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quote&&line[i+1]==='"'){cur+='"';i++;}else quote=!quote;}else if(ch===delimiter&&!quote){out.push(cur.trim());cur='';}else cur+=ch;}out.push(cur.trim());return out;}
function data(){const text=document.querySelector('#data-input')?.value?.trim()||'';const lines=text.split(/\r?\n/).filter(Boolean);if(lines.length<2)return null;const first=lines[0],delimiter=first.includes('\t')?'\t':first.includes(';')?';':',';const headers=parseLine(first,delimiter).map((h,i)=>h||`col_${i+1}`);const rows=lines.slice(1).map(line=>{const vals=parseLine(line,delimiter),row={};headers.forEach((h,i)=>row[h]=vals[i]??'');return row;});return {rows};}

function renderKendall(){
  const results=document.querySelector('#results');
  results?.querySelector('.kendall-card')?.remove();
  if(document.querySelector('#analysis-mode')?.value!=='association'||!results?.querySelector('.result-card'))return;
  const parsed=data(),xKey=document.querySelector('#col-x')?.value,yKey=document.querySelector('#col-y')?.value;
  if(!parsed||!xKey||!yKey)return;
  let r;
  try{r=kendallTauB(parsed.rows.map(row=>row[xKey]),parsed.rows.map(row=>row[yKey]));}catch{return;}
  const card=document.createElement('article');card.className='result-card kendall-card';
  const interpretation=r.p<0.05
    ? tr('Les données sont peu compatibles avec l’absence d’association monotone au seuil de 5 %. L’amplitude de τ-b reste à interpréter dans le contexte.','The data are relatively incompatible with no monotonic association at the 5% threshold. The magnitude of τ-b still needs contextual interpretation.')
    : tr('Les données restent compatibles avec l’absence d’association monotone au seuil de 5 %. Cela ne prouve pas l’absence d’association.','The data remain compatible with no monotonic association at the 5% threshold. This does not prove absence of association.');
  card.innerHTML=`<div class="result-card-head"><span>${esc(tr('Analyse de rang complémentaire','Additional rank analysis'))}</span><h3>Kendall τ-b</h3></div><div class="metrics"><div class="metric"><span>τ-b</span><strong>${fmt(r.tau)}</strong></div><div class="metric"><span>p</span><strong>${fmtP(r.p)}</strong></div><div class="metric"><span>${esc(tr('Inférence','Inference'))}</span><strong>${esc(r.exact?tr('Exacte','Exact'):tr('Asymptotique','Asymptotic'))}</strong></div><div class="metric"><span>n</span><strong>${r.n}</strong></div></div><p class="plain-interpretation">${esc(interpretation)}</p><p class="association-note">${esc(tr('Kendall τ-b mesure l’ordre concordant entre deux variables et corrige les ex æquo. Il est particulièrement utile lorsque les valeurs sont ordinales ou comportent beaucoup d’ex æquo.','Kendall τ-b measures concordant ordering between two variables and adjusts for ties. It is especially useful for ordinal values or data with many ties.'))}</p>`;
  const cards=[...results.querySelectorAll('.result-card:not(.kendall-card)')];
  const spearman=cards.find(el=>el.querySelector('h3')?.textContent?.includes('Spearman'));
  if(spearman)spearman.after(card);else results.insertBefore(card,results.querySelector('.assumptions')||null);
}

function enhanceGuide(){
  const guide=document.querySelector('#method-guide');
  guide?.querySelector('.kendall-guide')?.remove();
  if(document.querySelector('#analysis-mode')?.value!=='association'||!guide)return;
  const note=document.createElement('small');note.className='kendall-guide';note.textContent=tr('Kendall τ-b est aussi calculé : il est particulièrement adapté aux variables ordinales et aux données avec beaucoup d’ex æquo.','Kendall τ-b is also computed; it is especially suited to ordinal variables and data with many ties.');guide.appendChild(note);
}

document.querySelector('#run-analysis')?.addEventListener('click',()=>queueMicrotask(renderKendall));
document.querySelector('#analysis-mode')?.addEventListener('change',()=>queueMicrotask(enhanceGuide));
document.querySelector('[data-lang-toggle]')?.addEventListener('click',()=>setTimeout(()=>{renderKendall();enhanceGuide();},0));
queueMicrotask(enhanceGuide);

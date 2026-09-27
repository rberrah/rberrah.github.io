const tr = (fr,en) => document.documentElement.lang === 'en' ? en : fr;
const esc = value => String(value).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function parseLine(line,delimiter) {
  const out=[];
  let cur='',quote=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){
      if(quote&&line[i+1]==='"'){cur+='"';i++;}
      else quote=!quote;
    } else if(ch===delimiter&&!quote){out.push(cur.trim());cur='';}
    else cur+=ch;
  }
  out.push(cur.trim());
  return out;
}

function parsedRows() {
  const text=document.querySelector('#data-input')?.value?.trim() || '';
  const lines=text.split(/\r?\n/).filter(Boolean);
  if(lines.length<2)return null;
  const first=lines[0],delimiter=first.includes('\t')?'\t':first.includes(';')?';':',';
  const headers=parseLine(first,delimiter).map((h,i)=>h||`col_${i+1}`);
  const rows=lines.slice(1).map(line=>{
    const vals=parseLine(line,delimiter),row={};
    headers.forEach((h,i)=>row[h]=vals[i]??'');
    return row;
  });
  return {headers,rows};
}

function numeric(values) {
  return values.map(Number).filter(Number.isFinite);
}

function allUnique(values) {
  return new Set(values).size===values.length;
}

function rankInferenceState() {
  const mode=document.querySelector('#analysis-mode')?.value;
  const method=document.querySelector('#method-choice')?.value || 'auto';
  if(method==='parametric' || !['compare2','paired'].includes(mode))return null;
  const parsed=parsedRows();
  if(!parsed)return null;

  if(mode==='compare2'){
    const groupKey=document.querySelector('#col-group')?.value;
    const valueKey=document.querySelector('#col-value')?.value;
    if(!groupKey||!valueKey)return null;
    const groups=[...new Set(parsed.rows.map(r=>String(r[groupKey])).filter(Boolean))];
    if(groups.length!==2)return null;
    const values=groups.flatMap(g=>numeric(parsed.rows.filter(r=>String(r[groupKey])===g).map(r=>r[valueKey])));
    if(values.length<2)return null;
    return {title:'Mann–Whitney',exact:values.length<=24&&allUnique(values)};
  }

  const xKey=document.querySelector('#col-x')?.value;
  const yKey=document.querySelector('#col-y')?.value;
  if(!xKey||!yKey)return null;
  const abs=[];
  for(const row of parsed.rows){
    const x=Number(row[xKey]),y=Number(row[yKey]);
    if(Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x-y)>1e-12)abs.push(Math.abs(x-y));
  }
  if(abs.length<2)return null;
  return {title:'Wilcoxon signed-rank',exact:abs.length<=25&&allUnique(abs)};
}

function injectRankInference() {
  const state=rankInferenceState();
  if(!state)return;
  const cards=[...document.querySelectorAll('#results .result-card')];
  const card=cards.find(c=>c.querySelector('h3')?.textContent?.includes(state.title));
  if(!card)return;
  const metrics=card.querySelector('.metrics');
  if(!metrics)return;
  let block=metrics.querySelector('.rank-inference');
  if(!block){
    block=document.createElement('div');
    block.className='metric rank-inference';
    block.innerHTML='<span></span><strong></strong>';
    metrics.appendChild(block);
  }
  block.querySelector('span').textContent=tr('Inférence','Inference');
  block.querySelector('strong').textContent=state.exact?tr('Exacte','Exact'):tr('Asymptotique','Asymptotic');
  block.title=state.exact
    ? tr('p-value calculée à partir de la distribution exacte des rangs.','p-value computed from the exact rank distribution.')
    : tr('Approximation asymptotique utilisée, notamment en présence d’ex æquo ou pour un effectif plus grand.','Asymptotic approximation used, including when ties are present or the sample is larger.');
}

function resultText() {
  const results = document.querySelector('#results');
  if (!results?.querySelector('.result-card')) return '';
  const clone = results.cloneNode(true);
  clone.querySelectorAll('.stats-report-actions,.help,.stats-tooltip,svg').forEach(el=>el.remove());
  return clone.innerText.replace(/\n{3,}/g,'\n\n').trim();
}

function buildReportHtml() {
  const results = document.querySelector('#results');
  if (!results?.querySelector('.result-card')) return '';
  const clone = results.cloneNode(true);
  clone.querySelectorAll('.stats-report-actions,.help,.stats-tooltip').forEach(el=>el.remove());
  const mode = document.querySelector('#analysis-mode');
  const method = document.querySelector('#method-choice');
  const selectors = [...document.querySelectorAll('#column-selectors select')].map(sel => {
    const label = sel.closest('label')?.querySelector('span')?.textContent?.trim() || sel.id;
    return `<li><strong>${esc(label)}</strong>: ${esc(sel.value)}</li>`;
  }).join('');
  const rows = document.querySelector('#parse-status')?.textContent?.trim() || '';
  return `<!doctype html><html lang="${document.documentElement.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stats report</title><style>body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:980px;margin:40px auto;padding:0 24px;color:#182527;line-height:1.55}h1,h2,h3{line-height:1.2}.meta{background:#f3f7f7;padding:18px;border:1px solid #d5e0e1;border-radius:8px;margin:20px 0}.result-card,.stats-visual-section,.assumptions{border:1px solid #d5e0e1;border-radius:8px;padding:18px;margin:18px 0}.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}.metric{border:1px solid #d5e0e1;padding:10px;border-radius:6px}.metric span,.privacy-note,.chart-caption{font-size:12px;color:#52666b}.metric strong{display:block;margin-top:4px}.stats-svg{width:100%;height:auto}.chart-grid{stroke:#dde5e5}.chart-axis{stroke:#62777b}.chart-point{fill:#14665f}.chart-fit,.chart-mean{stroke:#9b4533}.chart-km-0{stroke:#14665f}.chart-km-1{stroke:#9b4533}.chart-km{fill:none}.chart-bar-0{fill:#14665f}.chart-bar-1{fill:#285e94}.chart-bar-2{fill:#9b4533}.chart-bar-3{fill:#9cafb4}.chart-label,.chart-tick,.chart-matrix-value{fill:#182527}.chart-matrix{fill:#14665f}@media print{body{margin:0;max-width:none}}</style></head><body><p style="font-size:13px;color:#52666b">Stats · rberrah.github.io/stats</p><h1>${esc(tr('Rapport d’analyse statistique','Statistical analysis report'))}</h1><div class="meta"><strong>${esc(tr('Configuration','Configuration'))}</strong><ul><li>${esc(tr('Question','Question'))}: ${esc(mode?.selectedOptions?.[0]?.textContent?.trim() || '')}</li><li>${esc(tr('Méthode choisie','Selected method'))}: ${esc(method?.selectedOptions?.[0]?.textContent?.trim() || tr('Automatique','Automatic'))}</li>${selectors}</ul><p>${esc(rows)}</p><p>${esc(tr('Les données brutes ne sont volontairement pas intégrées à ce rapport. Le rapport est généré localement dans le navigateur.','Raw data are intentionally not embedded in this report. The report is generated locally in the browser.'))}</p></div>${clone.innerHTML}<hr><p style="font-size:12px;color:#52666b">${esc(tr('Outil de recherche et d’enseignement. Une analyse confirmatoire doit être validée avec un logiciel et un plan statistique appropriés.','Research and teaching tool. Confirmatory analysis should be validated with appropriate statistical software and a statistical analysis plan.'))}</p></body></html>`;
}

async function copySummary(status) {
  const text=resultText(); if(!text)return;
  try { await navigator.clipboard.writeText(text); status.textContent=tr('Résumé copié.','Summary copied.'); }
  catch { status.textContent=tr('Copie automatique indisponible.','Automatic copy unavailable.'); }
}

function downloadReport() {
  const html=buildReportHtml(); if(!html)return;
  const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
  const a=document.createElement('a'); a.href=url; a.download='stats-report.html'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function injectActions() {
  const results=document.querySelector('#results'); if(!results?.querySelector('.result-card'))return;
  injectRankInference();
  results.querySelector('.stats-report-actions')?.remove();
  const actions=document.createElement('div'); actions.className='stats-report-actions';
  actions.innerHTML=`<button type="button" class="primary-report" data-report-download>${esc(tr('Télécharger le rapport','Download report'))}</button><button type="button" data-report-copy>${esc(tr('Copier le résumé','Copy summary'))}</button><button type="button" data-report-print>${esc(tr('Imprimer / PDF','Print / PDF'))}</button><small data-report-status>${esc(tr('Rapport sans données brutes','Report excludes raw data'))}</small>`;
  results.appendChild(actions);
  const status=actions.querySelector('[data-report-status]');
  actions.querySelector('[data-report-download]').addEventListener('click',downloadReport);
  actions.querySelector('[data-report-copy]').addEventListener('click',()=>copySummary(status));
  actions.querySelector('[data-report-print]').addEventListener('click',()=>window.print());
}

document.querySelector('#run-analysis')?.addEventListener('click',()=>queueMicrotask(injectActions));
document.querySelector('[data-lang-toggle]')?.addEventListener('click',()=>setTimeout(()=>{if(document.querySelector('#results .result-card'))injectActions();},0));

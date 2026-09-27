const lang = () => document.documentElement.lang === 'en' ? 'en' : 'fr';
const tr = (fr, en) => lang() === 'en' ? en : fr;
const esc = value => String(value).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function parseLine(line, delimiter) {
  const out = []; let cur = '', quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === delimiter && !quoted) { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function parseTable(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return null;
  const first = lines[0];
  const delimiter = first.includes('\t') ? '\t' : first.includes(';') ? ';' : ',';
  const headers = parseLine(first, delimiter).map((h, i) => h || `col_${i + 1}`);
  const rows = lines.slice(1).map(line => {
    const vals = parseLine(line, delimiter); const row = {};
    headers.forEach((h, i) => row[h] = vals[i] ?? '');
    return row;
  });
  return { headers, rows };
}

function numeric(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const n = Number(raw.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function selected(id) { return document.querySelector(`#col-${id}`)?.value; }
function values(rows, key) { return rows.map(r => numeric(r[key])).filter(Number.isFinite); }
function mean(xs) { return xs.reduce((a, b) => a + b, 0) / xs.length; }
function median(xs) { const a = [...xs].sort((a,b)=>a-b), n=a.length; return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2; }

function svgFrame(content, width = 760, height = 330) {
  return `<svg class="stats-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr('Visualisation des données', 'Data visualization'))}">${content}</svg>`;
}
function extent(xs) {
  let lo = Math.min(...xs), hi = Math.max(...xs);
  if (lo === hi) { lo -= 0.5; hi += 0.5; }
  const pad = (hi - lo) * 0.08;
  return [lo - pad, hi + pad];
}
function sy(v, lo, hi, top = 24, bottom = 282) { return bottom - (v - lo) / (hi - lo) * (bottom - top); }
function sx(v, lo, hi, left = 62, right = 730) { return left + (v - lo) / (hi - lo) * (right - left); }
function tickLabel(v) { const a=Math.abs(v); return a >= 10000 || (a > 0 && a < .01) ? v.toExponential(1) : Number(v.toFixed(2)).toString(); }
function yAxis(lo, hi) {
  let s = `<line class="chart-axis" x1="55" y1="24" x2="55" y2="282"/>`;
  for (let i=0;i<=4;i++) { const v=lo+(hi-lo)*i/4, y=sy(v,lo,hi); s += `<line class="chart-grid" x1="55" y1="${y}" x2="735" y2="${y}"/><text class="chart-tick" x="48" y="${y+4}" text-anchor="end">${esc(tickLabel(v))}</text>`; }
  return s;
}

function groupPlot(rows, groupKey, valueKey) {
  const names = [...new Set(rows.map(r => String(r[groupKey] ?? '').trim()).filter(Boolean))];
  const groups = names.map(name => ({ name, vals: rows.filter(r => String(r[groupKey] ?? '').trim() === name).map(r => numeric(r[valueKey])).filter(Number.isFinite) })).filter(g => g.vals.length);
  if (!groups.length) return '';
  const all = groups.flatMap(g => g.vals), [lo, hi] = extent(all), W=760, left=80, right=730;
  let s = yAxis(lo, hi);
  groups.forEach((g, gi) => {
    const x = groups.length === 1 ? W/2 : left + gi*(right-left)/(groups.length-1);
    g.vals.forEach((v, i) => {
      const jitter = ((i * 37) % 17 - 8) * 1.5;
      s += `<circle class="chart-point" cx="${x+jitter}" cy="${sy(v,lo,hi)}" r="4"/>`;
    });
    const m = mean(g.vals), med = median(g.vals);
    s += `<line class="chart-mean" x1="${x-25}" y1="${sy(m,lo,hi)}" x2="${x+25}" y2="${sy(m,lo,hi)}"/><circle class="chart-median" cx="${x}" cy="${sy(med,lo,hi)}" r="5"/><text class="chart-label" x="${x}" y="310" text-anchor="middle">${esc(g.name)}</text>`;
  });
  return svgFrame(s);
}

function pairedPlot(rows, aKey, bKey) {
  const pairs = rows.map(r => [numeric(r[aKey]), numeric(r[bKey])]).filter(([a,b]) => Number.isFinite(a) && Number.isFinite(b));
  if (!pairs.length) return '';
  const all=pairs.flat(), [lo,hi]=extent(all), x1=230, x2=570;
  let s=yAxis(lo,hi);
  pairs.forEach(([a,b]) => { s += `<line class="chart-pair" x1="${x1}" y1="${sy(a,lo,hi)}" x2="${x2}" y2="${sy(b,lo,hi)}"/><circle class="chart-point" cx="${x1}" cy="${sy(a,lo,hi)}" r="4"/><circle class="chart-point" cx="${x2}" cy="${sy(b,lo,hi)}" r="4"/>`; });
  s += `<text class="chart-label" x="${x1}" y="310" text-anchor="middle">${esc(aKey)}</text><text class="chart-label" x="${x2}" y="310" text-anchor="middle">${esc(bKey)}</text>`;
  return svgFrame(s);
}

function scatterPlot(rows, xKey, yKey) {
  const pairs=rows.map(r=>[numeric(r[xKey]),numeric(r[yKey])]).filter(([a,b])=>Number.isFinite(a)&&Number.isFinite(b));
  if(pairs.length<2)return '';
  const xs=pairs.map(p=>p[0]), ys=pairs.map(p=>p[1]), [xlo,xhi]=extent(xs), [ylo,yhi]=extent(ys);
  const mx=mean(xs),my=mean(ys),sxx=xs.reduce((s,x)=>s+(x-mx)**2,0),sxy=pairs.reduce((s,p)=>s+(p[0]-mx)*(p[1]-my),0),slope=sxx?sxy/sxx:0,intercept=my-slope*mx;
  let s=yAxis(ylo,yhi)+`<line class="chart-axis" x1="55" y1="282" x2="735" y2="282"/>`;
  for(let i=0;i<=4;i++){const v=xlo+(xhi-xlo)*i/4,x=sx(v,xlo,xhi);s+=`<line class="chart-grid" x1="${x}" y1="24" x2="${x}" y2="282"/><text class="chart-tick" x="${x}" y="301" text-anchor="middle">${esc(tickLabel(v))}</text>`;}
  pairs.forEach(([x,y])=>s+=`<circle class="chart-point" cx="${sx(x,xlo,xhi)}" cy="${sy(y,ylo,yhi)}" r="4.5"/>`);
  s+=`<line class="chart-fit" x1="${sx(xlo,xlo,xhi)}" y1="${sy(intercept+slope*xlo,ylo,yhi)}" x2="${sx(xhi,xlo,xhi)}" y2="${sy(intercept+slope*xhi,ylo,yhi)}"/><text class="chart-label" x="395" y="326" text-anchor="middle">${esc(xKey)}</text>`;
  return svgFrame(s,760,340);
}

function categoricalPlot(rows, xKey, yKey) {
  const groups=[...new Set(rows.map(r=>String(r[xKey]??'')).filter(Boolean))], outcomes=[...new Set(rows.map(r=>String(r[yKey]??'')).filter(Boolean))];
  if(!groups.length||!outcomes.length)return '';
  const W=760, left=75, right=730, top=30, bottom=275, barW=Math.min(90,(right-left)/(groups.length*1.8));
  let s=`<line class="chart-axis" x1="55" y1="${top}" x2="55" y2="${bottom}"/><line class="chart-axis" x1="55" y1="${bottom}" x2="735" y2="${bottom}"/>`;
  for(let i=0;i<=4;i++){const p=i/4,y=bottom-p*(bottom-top);s+=`<line class="chart-grid" x1="55" y1="${y}" x2="735" y2="${y}"/><text class="chart-tick" x="48" y="${y+4}" text-anchor="end">${Math.round(p*100)}%</text>`;}
  groups.forEach((g,gi)=>{const subset=rows.filter(r=>String(r[xKey]??'')===g),n=subset.length,x=groups.length===1?W/2:left+gi*(right-left)/(groups.length-1);let y0=bottom;outcomes.forEach((o,oi)=>{const count=subset.filter(r=>String(r[yKey]??'')===o).length,p=n?count/n:0,h=p*(bottom-top);s+=`<rect class="chart-bar chart-bar-${oi%4}" x="${x-barW/2}" y="${y0-h}" width="${barW}" height="${h}"/><text class="chart-bar-label" x="${x}" y="${y0-h/2+4}" text-anchor="middle">${count}</text>`;y0-=h;});s+=`<text class="chart-label" x="${x}" y="302" text-anchor="middle">${esc(g)}</text>`;});
  s+=outcomes.map((o,i)=>`<g transform="translate(${80+i*150},320)"><rect class="chart-bar chart-bar-${i%4}" x="0" y="-10" width="12" height="12"/><text class="chart-tick" x="18" y="0">${esc(o)}</text></g>`).join('');
  return svgFrame(s,760,350);
}

function mcnemarPlot(rows,aKey,bKey){
  const cats=[...new Set(rows.flatMap(r=>[String(r[aKey]??''),String(r[bKey]??'')]).filter(Boolean))];if(cats.length!==2)return '';
  const matrix=[[0,0],[0,0]];rows.forEach(r=>{const i=cats.indexOf(String(r[aKey]??'')),j=cats.indexOf(String(r[bKey]??''));if(i>=0&&j>=0)matrix[i][j]++;});
  const max=Math.max(...matrix.flat(),1);let s='';for(let i=0;i<2;i++)for(let j=0;j<2;j++){const x=230+j*180,y=75+i*115,opacity=.15+.75*matrix[i][j]/max;s+=`<rect class="chart-matrix" x="${x}" y="${y}" width="145" height="85" style="opacity:${opacity}"/><text class="chart-matrix-value" x="${x+72}" y="${y+50}" text-anchor="middle">${matrix[i][j]}</text>`;}s+=`<text class="chart-label" x="302" y="55" text-anchor="middle">${esc(cats[0])}</text><text class="chart-label" x="482" y="55" text-anchor="middle">${esc(cats[1])}</text><text class="chart-label" x="200" y="120" text-anchor="end">${esc(cats[0])}</text><text class="chart-label" x="200" y="235" text-anchor="end">${esc(cats[1])}</text><text class="chart-tick" x="390" y="310" text-anchor="middle">${esc(tr('Colonnes = après · lignes = avant','Columns = after · rows = before'))}</text>`;return svgFrame(s,760,330);
}

function kmPlot(rows,groupKey,timeKey,eventKey){
  const names=[...new Set(rows.map(r=>String(r[groupKey]??'')).filter(Boolean))];if(names.length!==2)return '';
  const allTimes=rows.map(r=>numeric(r[timeKey])).filter(Number.isFinite);if(!allTimes.length)return '';const maxT=Math.max(...allTimes)*1.05||1;
  let s=`<line class="chart-axis" x1="55" y1="30" x2="55" y2="280"/><line class="chart-axis" x1="55" y1="280" x2="735" y2="280"/>`;
  for(let i=0;i<=4;i++){const p=i/4,y=280-p*250;s+=`<line class="chart-grid" x1="55" y1="${y}" x2="735" y2="${y}"/><text class="chart-tick" x="48" y="${y+4}" text-anchor="end">${Math.round(p*100)}%</text>`;}
  names.forEach((name,gi)=>{const dat=rows.filter(r=>String(r[groupKey]??'')===name).map(r=>({time:numeric(r[timeKey]),event:Number(r[eventKey])===1})).filter(r=>Number.isFinite(r.time)).sort((a,b)=>a.time-b.time);let atRisk=dat.length,surv=1,lastX=55,lastY=30,points=`${lastX},${lastY}`;for(const time of [...new Set(dat.map(d=>d.time))]){const ev=dat.filter(d=>d.time===time&&d.event).length, cens=dat.filter(d=>d.time===time&&!d.event).length,x=sx(time,0,maxT);points+=` ${x},${lastY}`;if(ev&&atRisk>0)surv*=1-ev/atRisk;const y=280-surv*250;points+=` ${x},${y}`;lastY=y;atRisk-=ev+cens;}points+=` ${735},${lastY}`;s+=`<polyline class="chart-km chart-km-${gi}" points="${points}"/><text class="chart-label" x="${590}" y="${55+gi*22}">${esc(name)}</text><line class="chart-km chart-km-${gi}" x1="555" y1="${50+gi*22}" x2="580" y2="${50+gi*22}"/>`;});
  s+=`<text class="chart-label" x="395" y="318" text-anchor="middle">${esc(timeKey)}</text>`;return svgFrame(s,760,330);
}

function singlePlot(rows,key,reference=null){const xs=values(rows,key);if(!xs.length)return '';const [lo,hi]=extent(xs);let s=`<line class="chart-axis" x1="65" y1="180" x2="725" y2="180"/>`;for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4,x=sx(v,lo,hi,65,725);s+=`<line class="chart-grid" x1="${x}" y1="55" x2="${x}" y2="195"/><text class="chart-tick" x="${x}" y="215" text-anchor="middle">${esc(tickLabel(v))}</text>`;}xs.forEach((v,i)=>{const x=sx(v,lo,hi,65,725),y=155-((i*41)%6)*13;s+=`<circle class="chart-point" cx="${x}" cy="${y}" r="4.5"/>`;});const m=mean(xs),xm=sx(m,lo,hi,65,725);s+=`<line class="chart-mean" x1="${xm}" y1="65" x2="${xm}" y2="180"/><text class="chart-label" x="${xm}" y="50" text-anchor="middle">${esc(tr('moyenne','mean'))} ${tickLabel(m)}</text>`;if(Number.isFinite(reference)&&reference>=lo&&reference<=hi){const xr=sx(reference,lo,hi,65,725);s+=`<line class="chart-reference" x1="${xr}" y1="65" x2="${xr}" y2="180"/><text class="chart-tick" x="${xr}" y="235" text-anchor="middle">${esc(tr('référence','reference'))}</text>`;}return svgFrame(s,760,250);}

function buildVisual() {
  const results=document.querySelector('#results'); if(!results || !results.querySelector('.result-card')) return;
  results.querySelector('.stats-visual-section')?.remove();
  const parsed=parseTable(document.querySelector('#data-input')?.value||''); if(!parsed)return;
  const mode=document.querySelector('#analysis-mode')?.value; let chart=''; let caption='';
  if(mode==='compare2'||mode==='comparek'){chart=groupPlot(parsed.rows,selected('group'),selected('value'));caption=tr('Chaque point est une observation ; la barre horizontale indique la moyenne et le cercle plus large la médiane.','Each point is an observation; the horizontal bar marks the mean and the larger circle marks the median.');}
  else if(mode==='paired'){chart=pairedPlot(parsed.rows,selected('x'),selected('y'));caption=tr('Chaque segment relie les deux mesures d’une même ligne.','Each segment links the two measurements from the same row.');}
  else if(mode==='association'){chart=scatterPlot(parsed.rows,selected('x'),selected('y'));caption=tr('Nuage de points avec droite de régression linéaire descriptive.','Scatter plot with a descriptive linear regression line.');}
  else if(mode==='categorical'){chart=categoricalPlot(parsed.rows,selected('x'),selected('y'));caption=tr('Répartition proportionnelle des catégories dans chaque groupe.','Proportional distribution of outcomes within each group.');}
  else if(mode==='mcnemar'){chart=mcnemarPlot(parsed.rows,selected('x'),selected('y'));caption=tr('Tableau visuel des transitions entre les deux mesures appariées.','Visual transition table between the two paired measurements.');}
  else if(mode==='survival'){chart=kmPlot(parsed.rows,selected('group'),selected('time'),selected('event'));caption=tr('Courbes de Kaplan–Meier descriptives ; le test affiché séparément est le log-rank.','Descriptive Kaplan–Meier curves; the separately reported test is log-rank.');}
  else if(mode==='descriptive'){chart=singlePlot(parsed.rows,selected('value'));caption=tr('Distribution des valeurs avec position de la moyenne.','Distribution of values with the mean position.');}
  else if(mode==='oneSample'){chart=singlePlot(parsed.rows,selected('value'),Number(document.querySelector('#reference-value')?.value));caption=tr('Distribution des valeurs, moyenne observée et valeur de référence lorsqu’elle se situe dans l’échelle affichée.','Distribution of values, observed mean and reference value when it falls within the displayed scale.');}
  if(!chart)return;
  const section=document.createElement('section');section.className='stats-visual-section';section.innerHTML=`<div class="visual-head"><div><p class="eyebrow">${esc(tr('Visualisation','Visualization'))}</p><h3>${esc(tr('Regarder les données avant le test','Look at the data before the test'))}</h3></div><span>${esc(tr('Descriptif · ne remplace pas le modèle','Descriptive · does not replace the model'))}</span></div><div class="stats-chart">${chart}</div><p class="chart-caption">${esc(caption)}</p>`;
  results.insertBefore(section,results.firstChild);
}

document.querySelector('#run-analysis')?.addEventListener('click',()=>queueMicrotask(buildVisual));
document.querySelector('[data-lang-toggle]')?.addEventListener('click',()=>setTimeout(()=>{ if(document.querySelector('#results .result-card')) buildVisual(); },0));

import { normalQuantile } from './power-engine.js';

const lang=()=>document.documentElement.lang==='en'?'en':'fr';
const tr=(fr,en)=>lang()==='en'?en:fr;
const esc=value=>String(value).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function parseLine(line,delimiter){
  const out=[];let cur='',quoted=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){if(quoted&&line[i+1]==='"'){cur+='"';i++;}else quoted=!quoted;}
    else if(ch===delimiter&&!quoted){out.push(cur.trim());cur='';}
    else cur+=ch;
  }
  out.push(cur.trim());return out;
}
function parseTable(){
  const text=document.querySelector('#data-input')?.value?.trim()||'';
  const lines=text.split(/\r?\n/).filter(Boolean);if(lines.length<2)return null;
  const first=lines[0],delimiter=first.includes('\t')?'\t':first.includes(';')?';':',';
  const headers=parseLine(first,delimiter).map((h,i)=>h||`col_${i+1}`);
  const rows=lines.slice(1).map(line=>{const vals=parseLine(line,delimiter),row={};headers.forEach((h,i)=>row[h]=vals[i]??'');return row;});
  return {rows};
}
function numeric(value){const raw=String(value??'').trim();if(!raw)return null;const n=Number(raw.replace(',','.'));return Number.isFinite(n)?n:null;}
function selected(id){return document.querySelector(`#col-${id}`)?.value;}
function mean(xs){return xs.reduce((a,b)=>a+b,0)/xs.length;}
function sd(xs){if(xs.length<2)return NaN;const m=mean(xs);return Math.sqrt(xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1));}
function extent(xs){let lo=Math.min(...xs),hi=Math.max(...xs);if(lo===hi){lo-=1;hi+=1;}const pad=(hi-lo)*.08;return [lo-pad,hi+pad];}
function sx(v,lo,hi,left=54,right=706){return left+(v-lo)/(hi-lo)*(right-left);}
function sy(v,lo,hi,top=24,bottom=250){return bottom-(v-lo)/(hi-lo)*(bottom-top);}
function fmt(v){const a=Math.abs(v);return a!==0&&(a>=1000||a<.01)?v.toExponential(1):Number(v.toFixed(2)).toString();}

function continuousResiduals(mode,rows){
  if(mode==='association'){
    const xKey=selected('x'),yKey=selected('y');
    const pairs=rows.map(r=>[numeric(r[xKey]),numeric(r[yKey])]).filter(([x,y])=>Number.isFinite(x)&&Number.isFinite(y));
    if(pairs.length<3)return null;
    const xs=pairs.map(p=>p[0]),ys=pairs.map(p=>p[1]),mx=mean(xs),my=mean(ys),sxx=xs.reduce((s,x)=>s+(x-mx)**2,0);
    if(sxx===0)return null;
    const slope=pairs.reduce((s,[x,y])=>s+(x-mx)*(y-my),0)/sxx,intercept=my-slope*mx;
    const points=pairs.map(([x,y])=>{const fitted=intercept+slope*x;return {fitted,residual:y-fitted};});
    return {values:points.map(p=>p.residual),points,label:tr('Résidus de la régression linéaire','Linear-regression residuals')};
  }
  if(mode==='compare2'||mode==='comparek'){
    const gKey=selected('group'),vKey=selected('value');
    const names=[...new Set(rows.map(r=>String(r[gKey]??'')).filter(Boolean))];
    const residuals=[];
    names.forEach(name=>{const vals=rows.filter(r=>String(r[gKey]??'')===name).map(r=>numeric(r[vKey])).filter(Number.isFinite);if(!vals.length)return;const m=mean(vals);vals.forEach(v=>residuals.push(v-m));});
    return residuals.length>=3?{values:residuals,label:tr('Résidus autour des moyennes de groupe','Residuals around group means')}:null;
  }
  if(mode==='paired'){
    const xKey=selected('x'),yKey=selected('y');
    const diffs=rows.map(r=>{const a=numeric(r[xKey]),b=numeric(r[yKey]);return Number.isFinite(a)&&Number.isFinite(b)?a-b:null;}).filter(Number.isFinite);
    if(diffs.length<3)return null;const m=mean(diffs);return {values:diffs.map(d=>d-m),label:tr('Différences appariées centrées','Centered paired differences')};
  }
  if(mode==='oneSample'||mode==='descriptive'){
    const key=selected('value'),vals=rows.map(r=>numeric(r[key])).filter(Number.isFinite);if(vals.length<3)return null;const m=mean(vals);return {values:vals.map(v=>v-m),label:tr('Valeurs centrées','Centered values')};
  }
  return null;
}

function qqChart(values){
  const s=sd(values);if(!Number.isFinite(s)||s<=0||values.length<3)return '';
  const m=mean(values),obs=values.map(v=>(v-m)/s).sort((a,b)=>a-b),n=obs.length;
  const theo=obs.map((_,i)=>normalQuantile((i+.5)/n));
  const both=[...obs,...theo],[lo,hi]=extent(both);
  let svg=`<svg class="diagnostic-svg qq-chart" viewBox="0 0 760 290" role="img" aria-label="Q-Q plot"><line class="diag-axis" x1="54" y1="250" x2="706" y2="250"/><line class="diag-axis" x1="54" y1="24" x2="54" y2="250"/><line class="diag-reference" x1="${sx(lo,lo,hi)}" y1="${sy(lo,lo,hi)}" x2="${sx(hi,lo,hi)}" y2="${sy(hi,lo,hi)}"/>`;
  for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4,x=sx(v,lo,hi),y=sy(v,lo,hi);svg+=`<line class="diag-grid" x1="${x}" y1="24" x2="${x}" y2="250"/><line class="diag-grid" x1="54" y1="${y}" x2="706" y2="${y}"/><text class="diag-tick" x="${x}" y="270" text-anchor="middle">${esc(fmt(v))}</text><text class="diag-tick" x="47" y="${y+4}" text-anchor="end">${esc(fmt(v))}</text>`;}
  theo.forEach((q,i)=>svg+=`<circle class="diag-point" cx="${sx(q,lo,hi)}" cy="${sy(obs[i],lo,hi)}" r="4"/>`);
  svg+=`<text class="diag-label" x="380" y="287" text-anchor="middle">${esc(tr('Quantiles normaux théoriques','Theoretical normal quantiles'))}</text></svg>`;
  return svg;
}
function residualChart(points){
  if(!points?.length)return '';
  const xs=points.map(p=>p.fitted),ys=points.map(p=>p.residual),[xlo,xhi]=extent(xs),[ylo,yhi]=extent([...ys,0]);
  let svg=`<svg class="diagnostic-svg residual-chart" viewBox="0 0 760 290" role="img" aria-label="Residuals versus fitted"><line class="diag-axis" x1="54" y1="250" x2="706" y2="250"/><line class="diag-axis" x1="54" y1="24" x2="54" y2="250"/><line class="diag-reference" x1="54" y1="${sy(0,ylo,yhi)}" x2="706" y2="${sy(0,ylo,yhi)}"/>`;
  points.forEach(p=>svg+=`<circle class="diag-point" cx="${sx(p.fitted,xlo,xhi)}" cy="${sy(p.residual,ylo,yhi)}" r="4"/>`);
  svg+=`<text class="diag-label" x="380" y="287" text-anchor="middle">${esc(tr('Valeurs ajustées','Fitted values'))}</text></svg>`;return svg;
}

function injectStyles(){
  if(document.querySelector('#diagnostic-styles'))return;
  const style=document.createElement('style');style.id='diagnostic-styles';style.textContent=`
    .diagnostic-section{margin:20px 0;padding:20px;border:1px solid var(--line,#d5e0e1);border-radius:14px;background:var(--surface,#fff)}
    .diagnostic-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.diagnostic-head h3{margin:0 0 5px}.diagnostic-head p{margin:0;color:var(--muted,#5a6c70);font-size:.88rem;max-width:760px}
    .diagnostic-badge{white-space:nowrap;font-size:.75rem;padding:5px 8px;border-radius:999px;background:color-mix(in srgb,var(--surface,#fff) 80%,#16756b 20%)}
    .diagnostic-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:14px;margin-top:14px}.diagnostic-card{border:1px solid var(--line,#d5e0e1);border-radius:10px;padding:10px;overflow:hidden}.diagnostic-card h4{margin:0 0 5px;font-size:.88rem}.diagnostic-card p{margin:0 0 8px;color:var(--muted,#5a6c70);font-size:.78rem}
    .diagnostic-svg{display:block;width:100%;height:auto}.diag-axis{stroke:currentColor;stroke-width:1.2;opacity:.6}.diag-grid{stroke:currentColor;stroke-width:.6;opacity:.1}.diag-reference{stroke:currentColor;stroke-width:1.5;stroke-dasharray:6 5;opacity:.55}.diag-point{fill:currentColor;opacity:.72}.diag-tick,.diag-label{fill:currentColor;font-size:11px;opacity:.65}.diagnostic-note{margin:12px 0 0;padding:10px 12px;border-left:3px solid #16756b;background:rgba(22,117,107,.07);font-size:.82rem;color:var(--muted,#5a6c70)}
    @media(max-width:760px){.diagnostic-section{padding:15px}.diagnostic-head{display:block}.diagnostic-badge{display:inline-block;margin-top:8px}}
  `;document.head.appendChild(style);
}

function buildDiagnostics(){
  const results=document.querySelector('#results');results?.querySelector('.diagnostic-section')?.remove();
  if(!results?.querySelector('.result-card'))return;
  const mode=document.querySelector('#analysis-mode')?.value,parsed=parseTable();if(!parsed)return;
  const diag=continuousResiduals(mode,parsed.rows);if(!diag)return;
  const qq=qqChart(diag.values);if(!qq)return;
  const residual=mode==='association'?residualChart(diag.points):'';
  const section=document.createElement('section');section.className='diagnostic-section';
  section.innerHTML=`<div class="diagnostic-head"><div><h3>${esc(tr('Diagnostics visuels','Visual diagnostics'))}</h3><p>${esc(diag.label)}. ${esc(tr('Ces graphiques servent à repérer asymétrie, queues extrêmes, non-linéarité ou structure résiduelle ; ils ne constituent pas un interrupteur automatique entre tests.','These plots help identify skewness, heavy tails, non-linearity or residual structure; they are not an automatic switch between tests.'))}</p></div><span class="diagnostic-badge">${esc(tr('Diagnostic · pas un test de décision','Diagnostic · not a decision test'))}</span></div><div class="diagnostic-grid"><div class="diagnostic-card"><h4>Q–Q plot</h4><p>${esc(tr('Les points proches de la diagonale indiquent une distribution résiduelle approximativement compatible avec une forme normale.','Points near the diagonal indicate residuals approximately compatible with a normal shape.'))}</p>${qq}</div>${residual?`<div class="diagnostic-card"><h4>${esc(tr('Résidus vs ajustés','Residuals vs fitted'))}</h4><p>${esc(tr('Une structure courbe ou une dispersion qui change suggère que la relation linéaire ou la variance constante mérite d’être reconsidérée.','Curvature or changing spread suggests that linearity or constant variance should be reconsidered.'))}</p>${residual}</div>`:''}</div><p class="diagnostic-note"><strong>${esc(tr('À retenir :','Take-away:'))}</strong> ${esc(tr('un petit écart au Q–Q plot ne suffit pas à abandonner Welch ou un modèle linéaire. Le plan d’étude, les valeurs influentes, la taille d’échantillon et l’objectif d’estimation restent prioritaires.','a small departure on a Q–Q plot is not by itself a reason to abandon Welch or a linear model. Study design, influential values, sample size and the estimand remain primary.'))}</p>`;
  const visual=results.querySelector('.stats-visual-section');if(visual)visual.after(section);else results.prepend(section);
}

injectStyles();
document.querySelector('#run-analysis')?.addEventListener('click',()=>queueMicrotask(buildDiagnostics));
document.querySelector('[data-lang-toggle]')?.addEventListener('click',()=>setTimeout(()=>{if(document.querySelector('#results .result-card'))buildDiagnostics();},0));

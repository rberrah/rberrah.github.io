import { DEFAULTS, CHALLENGE, simulate, atTime, fitScore } from './engine.js';

const $ = id => document.getElementById(id);
const en=()=>document.documentElement.lang==='en';
const tr=(fr,english)=>en()?english:fr;
const fmt = (x, digits = 1) => Number(x).toLocaleString(en()?'en-US':'fr-FR', { maximumFractionDigits: digits, minimumFractionDigits: digits });
const UNIT = { dose: 'mg', f: '', ka: 'h⁻¹', lag: 'h', cl: 'L/h', vc: 'L', q1: 'L/h', vp1: 'L', q2: 'L/h', vp2: 'L' };
const positions = {
  gut: { x: 138, y: 135 }, central: { x: 386, y: 223 },
  p1: { x: 655, y: 109 }, p2: { x: 655, y: 350 },
  eliminated: { x: 659, y: 230 }
};
let config = { ...DEFAULTS };
let result = simulate(config);
const reference = simulate(CHALLENGE);
let time = 0, playing = false, lastTick = 0, raf = 0, dragging = null, challenge = false;

function syncControls() {
  document.querySelectorAll('[data-name]').forEach(input => {
    const key = input.dataset.name;
    input.value = String(config[key]);
    document.querySelector('[data-out="' + key + '"]').textContent = fmt(config[key], key === 'dose' || key.startsWith('v') ? 0 : key === 'f' ? 2 : 1) + ' ' + UNIT[key];
  });
  document.querySelectorAll('[data-model]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.model) === config.model)));
  document.querySelectorAll('[data-route]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.route === config.route)));
  document.querySelectorAll('[data-p1]').forEach(x => x.hidden = config.model < 2);
  document.querySelectorAll('[data-p2]').forEach(x => x.hidden = config.model < 3);
  document.querySelectorAll('[data-oral]').forEach(x => x.hidden = config.route !== 'oral');
  for (const key of ['doses', 'tau', 'horizon']) $(key).value = String(config[key]);
  $('add').disabled = config.model === 3;
  $('remove').disabled = config.model === 1;
  $('challenge').setAttribute('aria-pressed', String(challenge));
  $('legend-ref').hidden = !challenge;
}
function setModel(n) { config.model = Math.max(1, Math.min(3, n)); recompute(); }
function recompute() {
  result = simulate(config);
  time = Math.min(time, config.horizon);
  syncControls();
  $('time').max = String(config.horizon);
  $('time').value = String(time);
  $('peak').textContent = fmt(result.peak, 2) + ' mg/L';
  $('tpeak').textContent = fmt(result.tPeak, 1) + ' h';
  $('auc').textContent = fmt(result.auc, 1) + ' mg·h/L';
  $('target').textContent = fmt(result.fractionInTarget * 100, 0) + ' %';
  $('mission-title').textContent = challenge ? 'Mission · Retrouver la courbe' : 'Mission libre · Comprendre l’exposition';
  const score = fitScore(result, reference);
  $('mission-text').innerHTML = challenge
    ? 'Reproduisez la courbe dorée en jouant sur les compartiments et les paramètres. <span class="score">Score : ' + score + '/100</span><br>Le score mesure seulement une proximité des courbes : plusieurs modèles peuvent produire des profils semblables.'
    : 'Essayez de doubler la clairance CL : que deviennent Cmax, AUC et la quantité éliminée ?';
  drawChart();
  showTime();
}
function fit(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function endpoints(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, norm = Math.max(1, Math.hypot(dx, dy));
  const ux = dx/norm, uy = dy/norm;
  return { x1: a.x + ux*77, y1: a.y + uy*53, x2: b.x - ux*78, y2: b.y - uy*53 };
}
function line(from, to, label, dual = false) {
  const e = endpoints(positions[from], positions[to]);
  const midX = (e.x1+e.x2)/2, midY = (e.y1+e.y2)/2;
  return '<g><path d="M ' + e.x1 + ' ' + e.y1 + ' L ' + e.x2 + ' ' + e.y2 +
    '" stroke="#5d999b" stroke-width="3" fill="none" marker-end="url(#arrow)" ' +
    (dual ? 'marker-start="url(#back)" ' : '') + '/><text x="' + midX + '" y="' + (midY-11) +
    '" text-anchor="middle" fill="#b1cfc8" font-size="15" font-weight="650">' + label + '</text></g>';
}
function flow(from, to, rate, phase, reverse = false) {
  if (rate < 0) return flow(to, from, -rate, phase, !reverse);
  if (rate < 0.001) return '';
  const e = endpoints(positions[from], positions[to]);
  const count = fit(Math.ceil(rate / Math.max(0.3, config.dose/35)), 1, 5);
  let out = '';
  for (let i = 0; i < count; i++) {
    const fraction = (phase*0.42 + i/count) % 1;
    const x = e.x1 + (e.x2-e.x1) * fraction;
    const y = e.y1 + (e.y2-e.y1) * fraction;
    out += '<circle class="particle" cx="' + x + '" cy="' + y + '" r="4.5" fill="#9cfde2" opacity=".93"/>';
  }
  return out;
}
function node(id, title, subtitle, amount, fill, total) {
  const p = positions[id];
  const active = id !== 'eliminated';
  const w = id === 'central' ? 181 : 161, h = 92;
  const n = fit(Math.round(17*Math.sqrt(amount / Math.max(1,total))), 0, 17);
  let dots = '';
  for (let i=0; i<n; i++) {
    const rx = Math.sin(i*17.11 + id.length*4.77)*0.5 + 0.5;
    const ry = Math.sin(i*9.23 + id.length*8.11)*0.5 + 0.5;
    const x = p.x - w/2 + 15 + rx*(w-30), y = p.y - h/2 + 48 + ry*29;
    dots += '<circle class="particle" cx="' + x + '" cy="' + y + '" r="3.2" fill="#b4fff0" opacity=".85"/>';
  }
  return '<g class="node" data-node="' + id + '" tabindex="' + (active ? '0' : '-1') + '" role="img" aria-label="' + title + ', ' + fmt(amount,1) + ' mg">' +
    '<rect x="' + (p.x-w/2) + '" y="' + (p.y-h/2) + '" width="' + w + '" height="' + h +
    '" rx="17" fill="' + fill + '" stroke="' + (id === 'central' ? '#85e6d5' : '#5b969b') + '" stroke-width="2"/>' +
    dots + '<text x="' + p.x + '" y="' + (p.y-16) + '" text-anchor="middle" fill="#edfffb" font-weight="750" font-size="16">' + title + '</text>' +
    '<text x="' + p.x + '" y="' + (p.y+33) + '" text-anchor="middle" fill="#c5dcd7" font-size="13">' +
    subtitle + ' · ' + fmt(amount,1) + ' mg</text></g>';
}
function drawDiagram(phase = performance.now()/1000) {
  const p = atTime(result, time), c = result.config;
  const total = Math.max(1, result.delivered);
  let svg = '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="none" stroke="#83dcd0" stroke-width="1.7"/></marker>' +
    '<marker id="back" markerWidth="8" markerHeight="8" refX="0" refY="3" orient="auto-start-reverse"><path d="M6 0 L0 3 L6 6" fill="none" stroke="#83dcd0" stroke-width="1.7"/></marker></defs>' +
    '<text x="26" y="32" fill="#6daba8" font-size="14" letter-spacing="1.2">' + tr('MODÈLE ','MODEL ') + c.model + 'C · ' + (c.route === 'oral' ? 'ORAL' : 'IV') + '</text>';
  if (c.route === 'oral') svg += line('gut','central','Ka');
  if (c.model >= 2) svg += line('central','p1','Q1',true);
  if (c.model >= 3) svg += line('central','p2','Q2',true);
  svg += line('central','eliminated','CL');
  const cc = p.central/c.vc;
  if (c.route === 'oral') svg += flow('gut','central',c.ka*p.gut,phase);
  if (c.model >= 2) {
    const r1 = c.q1*(cc-p.p1/c.vp1);
    svg += r1 >= 0 ? flow('central','p1',r1,phase) : flow('p1','central',-r1,phase);
  }
  if (c.model >= 3) {
    const r2 = c.q2*(cc-p.p2/c.vp2);
    svg += r2 >= 0 ? flow('central','p2',r2,phase) : flow('p2','central',-r2,phase);
  }
  svg += flow('central','eliminated',c.cl*cc,phase);
  if (c.route === 'oral') svg += node('gut',tr('Dépôt digestif','Digestive depot'),'Absorption',p.gut,'#23494e',total);
  svg += node('central','Central','Plasma',p.central,'#22574f',total);
  if (c.model >= 2) svg += node('p1',tr('Périphérique 1','Peripheral 1'),'Distribution',p.p1,'#25434f',total);
  if (c.model >= 3) svg += node('p2',tr('Périphérique 2','Peripheral 2'),'Distribution',p.p2,'#25434f',total);
  svg += node('eliminated',tr('Éliminé','Eliminated'),tr('Cumul','Cumulative'),p.eliminated,'#3b3834',total);
  $('diagram').innerHTML = svg;
}
function pathFor(points, height, horizon) {
  const step = Math.max(1, Math.floor(points.length/360));
  let d = '';
  for (let i=0; i<points.length; i+=step) {
    const pt=points[i];
    d += (d ? ' L ' : 'M ') + (57+780*pt.t/horizon).toFixed(2) + ' ' + (265-225*pt.c/height).toFixed(2);
  }
  const last=points.at(-1);
  d += ' L '+(57+780*last.t/horizon).toFixed(2)+' '+(265-225*last.c/height).toFixed(2);
  return d;
}
function drawChart() {
  const top = Math.max(4.5, result.peak, challenge ? reference.peak : 0)*1.16;
  let svg = '<rect x="57" y="' + (265-225*4/top) + '" width="780" height="' + (225*3/top) + '" fill="#28755c" opacity=".24"/>';
  for (let i=0;i<=4;i++) {
    const y=265-i*225/4;
    svg += '<line x1="57" y1="'+y+'" x2="837" y2="'+y+'" stroke="#2c4a52" stroke-dasharray="3 6"/>' +
      '<text x="46" y="'+(y+5)+'" fill="#9ab9b6" text-anchor="end" font-size="13">'+fmt(i*top/4,1)+'</text>';
  }
  for(let i=0;i<=4;i++) {
    const x=57+i*780/4;
    svg+='<text x="'+x+'" y="291" fill="#a8c1be" text-anchor="middle" font-size="13">'+fmt(config.horizon*i/4,0)+' h</text>';
  }
  if (challenge) svg += '<path d="'+pathFor(reference.points,top,config.horizon)+'" fill="none" stroke="#e8bd83" stroke-width="3" stroke-dasharray="9 7"/>';
  svg += '<path d="'+pathFor(result.points,top,config.horizon)+'" fill="none" stroke="#77eed0" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<line id="cursor" x1="57" x2="57" y1="23" y2="265" stroke="#d8ece5" stroke-dasharray="4 6" opacity=".7"/>' +
    '<circle id="cursor-dot" cx="57" cy="265" r="6" fill="#f5eed9" stroke="#236c62" stroke-width="2"/>';
  $('chart').innerHTML = svg;
  updateCursor(top);
}
function updateCursor(top) {
  const x=57+780*time/config.horizon;
  const y=265-225*atTime(result,time).c/top;
  $('cursor').setAttribute('x1',x);$('cursor').setAttribute('x2',x);
  $('cursor-dot').setAttribute('cx',x);$('cursor-dot').setAttribute('cy',y);
}
function showTime() {
  $('time').value=String(time);
  $('clock').textContent=fmt(time,1)+' h';
  const top=Math.max(4.5,result.peak,challenge?reference.peak:0)*1.16;
  updateCursor(top);drawDiagram();
}
function pause() {
  playing=false;
  cancelAnimationFrame(raf);
  $('play').textContent='▶ Lecture';
  $('play').setAttribute('aria-pressed','false');
}
function frame(now) {
  if (!playing) return;
  const elapsed=Math.min(0.1,(now-lastTick)/1000);
  lastTick=now;
  time=Math.min(config.horizon,time+elapsed*6);
  showTime();
  if(time>=config.horizon) pause();
  else raf=requestAnimationFrame(frame);
}
function togglePlay() {
  if(playing) return pause();
  if(time>=config.horizon) time=0;
  playing=true;lastTick=performance.now();
  $('play').textContent='Ⅱ Pause';$('play').setAttribute('aria-pressed','true');
  raf=requestAnimationFrame(frame);
}
document.querySelectorAll('[data-model]').forEach(b=>b.addEventListener('click',()=>setModel(Number(b.dataset.model))));
document.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>{config.route=b.dataset.route;recompute();}));
document.querySelectorAll('[data-name]').forEach(input=>input.addEventListener('input',()=>{
  config[input.dataset.name]=Number(input.value);recompute();
}));
for (const id of ['doses','tau','horizon']) $(id).addEventListener('change',()=>{config[id]=Number($(id).value);recompute();});
$('add').addEventListener('click',()=>setModel(config.model+1));
$('remove').addEventListener('click',()=>setModel(config.model-1));
$('reset').addEventListener('click',()=>{pause();config={...DEFAULTS};time=0;challenge=false;recompute();});
$('challenge').addEventListener('click',()=>{
  challenge=!challenge;
  if(challenge){pause();config={...DEFAULTS,model:2};time=0;}
  recompute();
});
$('play').addEventListener('click',togglePlay);
$('time').addEventListener('input',()=>{pause();time=Number($('time').value);showTime();});
const diagram=$('diagram');
function pointerCoordinates(ev) {
  const screen=diagram.getScreenCTM();
  if(screen){
    const point=diagram.createSVGPoint();
    point.x=ev.clientX; point.y=ev.clientY;
    return point.matrixTransform(screen.inverse());
  }
  const bounds=diagram.getBoundingClientRect();
  return {x:(ev.clientX-bounds.left)*820/bounds.width,y:(ev.clientY-bounds.top)*440/bounds.height};
}
function pickNode(ev) {
  const el=ev.target?.closest?.('[data-node]');
  if (el && el.dataset.node !== 'eliminated') return el.dataset.node;
  // Fallback for SVG touch hit-testing, including letterboxed viewBox sizes.
  const {x,y}=pointerCoordinates(ev);
  return ['gut','central','p1','p2'].find(id=>{
    if(id==='gut' && config.route!=='oral')return false;
    if(id==='p1' && config.model<2)return false;
    if(id==='p2' && config.model<3)return false;
    return Math.abs(x-positions[id].x)<90 && Math.abs(y-positions[id].y)<55;
  }) || null;
}
function beginDrag(ev) {
  const id=pickNode(ev);
  if(!id)return;
  dragging=id;
  if(ev.type==='pointerdown'){
    try{diagram.setPointerCapture(ev.pointerId);}catch{/* Window listeners retain the drag. */}
  }
}
function moveDrag(ev) {
  if(!dragging)return;
  const {x,y}=pointerCoordinates(ev);
  positions[dragging].x=fit(x,100,716);
  positions[dragging].y=fit(y,72,374);
  drawDiagram();
}
function stopDrag(){ dragging=null; }
diagram.addEventListener('pointerdown',beginDrag);
diagram.addEventListener('mousedown',beginDrag);
window.addEventListener('pointermove',moveDrag);
window.addEventListener('mousemove',moveDrag);
window.addEventListener('pointerup',stopDrag);
window.addEventListener('mouseup',stopDrag);
window.addEventListener('pointercancel',stopDrag);
diagram.addEventListener('keydown',ev=>{
  const el=ev.target.closest('[data-node]');
  if(!el || el.dataset.node==='eliminated') return;
  const moves={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]};
  const delta=moves[ev.key];
  if(!delta)return;
  ev.preventDefault();
  const node=el.dataset.node;
  positions[node].x=fit(positions[node].x+delta[0],100,716);
  positions[node].y=fit(positions[node].y+delta[1],72,374);
  drawDiagram();
  diagram.querySelector('[data-node="'+node+'"]')?.focus();
});
recompute();

// Keep plotted labels and numeric formatting in sync without changing the model state.
window.addEventListener('pmx-game-language-change',()=>recompute());

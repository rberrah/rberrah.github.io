<script>
  // @ts-nocheck - canvas geometry is exercised by browser pixel tests.
  import { onMount, createEventDispatcher } from 'svelte';
  import { Play, Pause } from '@lucide/svelte';
  import { molecularLabs } from '$lib/labs/molecular.js';
  export let lab;
  export let p;
  export let state;
  export let time = 0;
  export let en = false;
  export let playing = false;
  export let animateParticles = true;
  let canvas, width = 700, mounted = false;
  const dispatch = createEventDispatcher();
  $: config = molecularLabs[lab];
  $: height = width < 520 ? 470 : 430;

  const pointOn = (edge, fraction, nodes) => {
    const from = nodes[edge.from], to = nodes[edge.to];
    if (!edge.curved) return { x: from.cx + (to.cx - from.cx) * fraction, y: from.cy + (to.cy - from.cy) * fraction };
    const dx = to.cx - from.cx, dy = to.cy - from.cy, length = Math.max(1, Math.hypot(dx, dy));
    const control = { x: (from.cx + to.cx) / 2 - dy / length * 52, y: (from.cy + to.cy) / 2 + dx / length * 52 };
    const one = 1 - fraction;
    return { x: one * one * from.cx + 2 * one * fraction * control.x + fraction * fraction * to.cx, y: one * one * from.cy + 2 * one * fraction * control.y + fraction * fraction * to.cy };
  };

  function draw() {
    if (!canvas || !mounted || !state || width < 100) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * ratio); canvas.height = height * ratio;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = '#edf6f7'; ctx.fillRect(0, 0, width, height);
    const nodeWidth = Math.min(142, Math.max(76, width * .22)), nodeHeight = width < 520 ? 72 : 84;
    const nodes = Object.fromEntries(config.nodes.map(node => [node.id, { ...node, cx: node.x * width, cy: 42 + node.y * (height - 92), w: nodeWidth, h: nodeHeight }]));
    const label = (text, x, y, size = 12, color = '#294651', maxWidth = width) => {
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.font = `600 ${size}px Inter, sans-serif`;
      while (ctx.measureText(text).width > maxWidth && size > 8) ctx.font = `600 ${--size}px Inter, sans-serif`;
      ctx.fillText(text, x, y);
    };
    const line = (x1, y1, x2, y2, color, thickness = 2, dashed = false) => {
      ctx.strokeStyle = color; ctx.lineWidth = thickness; ctx.setLineDash(dashed ? [6, 5] : []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
    };
    const ball = (x, y, color, radius = 4, hollow = false) => {
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = hollow ? '#edf6f7' : color; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = hollow ? 2 : 1; ctx.stroke();
      if (!hollow) { ctx.beginPath(); ctx.arc(x - radius * .28, y - radius * .3, radius * .24, 0, Math.PI * 2); ctx.fillStyle = '#ffffffcc'; ctx.fill(); }
    };
    const edgeRates = config.edges.map(edge => Math.max(0, state.flows[edge.flow] ?? 0)), maxRate = Math.max(1e-9, ...edgeRates);
    for (const [index, edge] of config.edges.entries()) {
      const from = nodes[edge.from], to = nodes[edge.to], color = edge.signal ? '#d26b3a' : edge.gate ? '#a26c2a' : '#5d8996';
      if (edge.curved) {
        const p0 = pointOn(edge, 0, nodes), p1 = pointOn(edge, .5, nodes), p2 = pointOn(edge, 1, nodes);
        ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.setLineDash(edge.dashed ? [6, 5] : []); ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.quadraticCurveTo(2 * p1.x - (p0.x + p2.x) / 2, 2 * p1.y - (p0.y + p2.y) / 2, p2.x, p2.y); ctx.stroke(); ctx.setLineDash([]);
      } else line(from.cx, from.cy, to.cx, to.cy, color, 3, edge.dashed);
      const arrow = pointOn(edge, .72, nodes), before = pointOn(edge, .69, nodes), angle = Math.atan2(arrow.y - before.y, arrow.x - before.x);
      ctx.save(); ctx.translate(arrow.x, arrow.y); ctx.rotate(angle); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -5); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill(); ctx.restore();
      const middle = pointOn(edge, .5, nodes), offset = edge.labelOffset ?? (edge.curved ? 15 : -9);
      label(edge.label, middle.x, middle.y + offset, width < 520 ? 8 : 10, '#355c67', Math.max(70, Math.hypot(to.cx - from.cx, to.cy - from.cy) * .62));
      const rate = edgeRates[index], count = rate <= 1e-10 ? 0 : Math.min(7, 2 + Math.round(4 * Math.sqrt(rate / maxRate)));
      for (let dot = 0; dot < count; dot++) {
        const phase = animateParticles ? (time * (.13 + .025 * index) + dot / count + index * .17) % 1 : (dot + .5) / Math.max(1, count);
        const position = pointOn(edge, .08 + .84 * phase, nodes);
        ball(position.x, position.y, edge.signal ? '#d26b3a' : '#147ea5', width < 520 ? 3.2 : 4.2, edge.signal);
      }
      if (edge.gate) {
        const gate = pointOn(edge, .5, nodes); ctx.save(); ctx.translate(gate.x, gate.y); ctx.rotate(angle); ctx.fillStyle = '#fff5dc'; ctx.strokeStyle = '#a26c2a'; ctx.lineWidth = 2; ctx.fillRect(-10, -16, 20, 32); ctx.strokeRect(-10, -16, 20, 32); ctx.restore();
      }
    }
    const total = Math.max(1e-9, state.administered);
    for (const node of config.nodes) {
      const box = nodes[node.id], value = node.id === 'ce' ? state.ce : state[node.id] ?? state.mass[node.id] ?? 0;
      const fraction = node.target ? Math.min(1, value / p.target0) : node.signal ? Math.min(1, (state.ce ?? 0) / Math.max(.01, state.c, state.ce ?? 0)) : Math.min(1, value / total);
      ctx.fillStyle = '#fff'; ctx.fillRect(box.cx - box.w / 2, box.cy - box.h / 2, box.w, box.h);
      ctx.fillStyle = `${node.color}${Math.round((.1 + .23 * fraction) * 255).toString(16).padStart(2, '0')}`; ctx.fillRect(box.cx - box.w / 2 + 3, box.cy - box.h / 2 + 3, box.w - 6, box.h - 6);
      ctx.strokeStyle = node.color; ctx.lineWidth = node.signal ? 2 : 3; ctx.setLineDash(node.signal ? [5, 4] : []); ctx.strokeRect(box.cx - box.w / 2, box.cy - box.h / 2, box.w, box.h); ctx.setLineDash([]);
      const text = en ? node.label.en : node.label.fr, words = text.split(' '), split = words.length > 2 ? Math.ceil(words.length / 2) : words.length;
      label(words.slice(0, split).join(' '), box.cx, box.cy - 8, width < 520 ? 9 : 12, '#244a55', box.w - 8);
      if (words.length > split) label(words.slice(split).join(' '), box.cx, box.cy + 7, width < 520 ? 9 : 12, '#244a55', box.w - 8);
      const unit = node.id === 'ce' ? 'mg/L' : lab === 'tmdd' ? 'mg-eq' : 'mg';
      label(`${Number(value.toFixed(value < 10 ? 2 : 1))} ${unit}`, box.cx, box.cy + box.h / 2 - 8, 9, '#48656c', box.w - 8);
      const dots = node.signal ? Math.min(10, Math.round(10 * fraction)) : node.target ? Math.min(14, Math.round(14 * fraction)) : Math.min(16, Math.round(16 * value / total));
      for (let i = 0; i < dots; i++) {
        const x = box.cx - box.w * .35 + box.w * .7 * ((i * .618033) % 1), y = box.cy - box.h * .29 + box.h * .37 * ((i * .414214) % 1);
        ball(x, y, node.color, width < 520 ? 2.3 : 3.1, node.signal);
      }
    }
    label(`${time.toFixed(1)} ${config.unit === 'day' ? (en ? 'days' : 'jours') : 'h'}`, width - 55, 24, 14, '#294651', 100);
    if (lab === 'effect-site') label(en ? 'Conceptual biophase: no drug mass is removed from plasma.' : 'Biophase conceptuelle : aucune masse de medicament ne quitte le plasma.', width / 2, height - 13, width < 520 ? 9 : 11, '#7b5b32', width - 20);
  }
  $: if (mounted) { config; state; time; en; animateParticles; width; draw(); }
  onMount(() => { mounted = true; draw(); });
</script>

<div class="scene-tools"><label><input type="checkbox" bind:checked={animateParticles}/><Play size={17}/>{en ? 'Animate particles' : 'Animer les particules'}</label></div>
<div class="scene" bind:clientWidth={width}>
  <canvas bind:this={canvas} style:height={`${height}px`} data-testid="molecular-scene" aria-label={en ? 'Animated molecular journey' : 'Parcours moleculaire anime'}></canvas>
  <button class="scene-play" title={playing ? (en ? 'Pause animation' : "Suspendre l'animation") : (en ? 'Start animation' : "Lancer l'animation")} aria-label={playing ? (en ? 'Pause animation' : "Suspendre l'animation") : (en ? 'Start animation' : "Lancer l'animation")} on:click={() => dispatch('play')}>{#if playing}<Pause size={22}/>{:else}<Play size={22}/>{/if}</button>
</div>
<div class="mass-balance" aria-label={en ? 'Calculated drug mass balance' : 'Bilan de masse medicamenteuse calcule'}>
  <div class="mass-bar">{#each config.mass as key}<span style:width={`${100 * (state.mass[key] ?? 0) / Math.max(1e-9, state.administered)}%`} style:background={config.nodes.find(node => node.id === key)?.color ?? '#888'}></span>{/each}</div>
  <div class="mass-values">{#each config.mass as key}<span><i style:background={config.nodes.find(node => node.id === key)?.color ?? '#888'}></i>{en ? config.nodes.find(node => node.id === key)?.label.en : config.nodes.find(node => node.id === key)?.label.fr} <b>{state.administered ? (100 * (state.mass[key] ?? 0) / state.administered).toFixed(0) : 0} %</b></span>{/each}</div>
</div>

<style>
  .scene { position:relative; width:100%; min-width:0; background:#edf6f7; }
  canvas { display:block; width:100%; }
  .scene-tools { display:flex; align-items:center; min-height:38px; padding:6px 0 10px; }
  .scene-tools label { display:inline-flex; align-items:center; gap:6px; font-size:12px; }
  input { accent-color:#147ea5; }
  .scene-play { position:absolute; top:18px; right:18px; display:grid; place-items:center; width:42px; height:42px; border:1px solid #12627e; border-radius:50%; background:#147ea5; color:#fff; cursor:pointer; }
  .scene-play:focus-visible, input:focus-visible { outline:3px solid #087b83; outline-offset:3px; }
  .mass-balance { padding:12px 0 6px; }
  .mass-bar { display:flex; height:8px; overflow:hidden; background:#e5e9ed; }
  .mass-values { display:flex; flex-wrap:wrap; gap:8px 18px; margin-top:8px; color:var(--text-secondary); font-size:11px; }
  .mass-values i { display:inline-block; width:8px; height:8px; margin-right:5px; }
  .mass-values b { margin-left:4px; color:var(--text-primary); font-variant-numeric:tabular-nums; }
</style>

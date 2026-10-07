<script>
  // @ts-nocheck
  import { scaleLinear } from 'd3-scale';
  import { onMount } from 'svelte';
  export let a = [];
  export let b = [];
  export let state;
  export let time = 0;
  export let config;
  export let en = false;
  export let compare = true;
  let canvas, width = 700;
  const height = 300;

  function draw() {
    if (!canvas || !b.length || !state) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1), left = 54, right = width - 58, top = 34, bottom = height - 43;
    canvas.width = Math.round(width * ratio); canvas.height = height * ratio;
    const ctx = canvas.getContext('2d'); if (!ctx) return; ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height);
    const rows = [...b, ...(compare ? a : [])], primaryMax = Math.max(.001, ...rows.map(row => row.c)), secondaryMax = Math.max(.001, ...rows.map(row => row.secondary));
    const x = scaleLinear().domain([0, b.at(-1).t]).range([left, right]);
    const y1 = scaleLinear().domain([0, primaryMax * 1.12]).nice().range([bottom, top]);
    const y2 = scaleLinear().domain([0, secondaryMax * 1.12]).nice().range([bottom, top]);
    ctx.font = `${width < 430 ? 9 : 11}px Inter, sans-serif`;
    for (const tick of y1.ticks(4)) {
      ctx.strokeStyle = '#e3e8e9'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(left, y1(tick)); ctx.lineTo(right, y1(tick)); ctx.stroke();
      ctx.fillStyle = '#455b60'; ctx.textAlign = 'right'; ctx.fillText(String(Number(tick.toPrecision(3))), left - 7, y1(tick) + 4);
    }
    for (const tick of y2.ticks(4)) { ctx.fillStyle = '#8a4d2d'; ctx.textAlign = 'left'; ctx.fillText(String(Number(tick.toPrecision(3))), right + 7, y2(tick) + 4); }
    for (const tick of x.ticks(width < 430 ? 4 : 7)) { ctx.fillStyle = '#455b60'; ctx.textAlign = 'center'; ctx.fillText(String(Number(tick.toPrecision(4))), x(tick), bottom + 19); }
    ctx.textAlign = 'left'; ctx.fillStyle = '#087b83'; ctx.fillText(en ? 'Primary concentration (mg/L)' : 'Concentration primaire (mg/L)', left, 16);
    ctx.textAlign = 'right'; ctx.fillStyle = '#b2572e'; ctx.fillText(`${en ? config.secondary.en : config.secondary.fr} (${config.secondaryUnit})`, right, 16);
    ctx.fillStyle = '#455b60'; ctx.fillText(config.unit === 'day' ? (en ? 'Time (days)' : 'Temps (jours)') : (en ? 'Time (h)' : 'Temps (h)'), right, height - 6);
    const trace = (rowsToDraw, key, scale, color, dashed) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash(dashed ? [7, 5] : []); ctx.beginPath();
      rowsToDraw.forEach((row, index) => { const px = x(row.t), py = scale(row[key]); if (index) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
      ctx.stroke(); ctx.setLineDash([]);
    };
    if (compare) { trace(a, 'c', y1, '#087b8380', true); trace(a, 'secondary', y2, '#b2572e80', true); }
    trace(b, 'c', y1, '#087b83', false); trace(b, 'secondary', y2, '#b2572e', false);
    ctx.strokeStyle = '#263f45'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x(time), top); ctx.lineTo(x(time), bottom); ctx.stroke(); ctx.setLineDash([]);
    for (const [value, scale, color] of [[state.c, y1, '#087b83'], [state.secondary, y2, '#b2572e']]) {
      ctx.beginPath(); ctx.arc(x(time), scale(value), 4.5, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    }
  }
  $: if (canvas && b.length) { a; b; state; time; config; en; compare; width; draw(); }
  onMount(draw);
</script>

<div class="plot" bind:clientWidth={width}>
  <canvas bind:this={canvas} data-testid="molecular-plot" aria-label={en ? 'Primary concentration and mechanism-specific response over time' : 'Concentration primaire et reponse specifique du mecanisme au cours du temps'}></canvas>
</div>

<style>
  .plot { width:100%; min-width:0; }
  canvas { display:block; width:100%; height:300px; }
</style>

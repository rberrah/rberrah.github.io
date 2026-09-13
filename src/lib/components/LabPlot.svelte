<script>
  import { scaleLinear, scaleLog } from 'd3-scale';
  import { onMount } from 'svelte';
  /** @type {{t:number,c:number}[]} */ export let b = [];
  /** @type {{t:number,c:number}[]} */ export let a = [];
  export let time = 0;
  export let en = false;
  export let compare = true;
  export let concentration = 0;
  export let logarithmic = false;
  /** @type {HTMLCanvasElement} */ let canvas;
  let width = 700;
  const height = 260;
  function draw() {
    if (!canvas || !b.length) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * ratio; canvas.height = height * ratio;
    const ctx = canvas.getContext('2d'); if (!ctx) return; ctx.scale(ratio, ratio);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height);
    const x = scaleLinear().domain([0, b[b.length - 1].t]).range([48, width - 16]);
    const values = [...b, ...(compare ? a : [])].map(p => p.c).filter(c => Number.isFinite(c) && c > 0);
    const low = values.length ? Math.min(...values) : 0.1;
    const high = values.length ? Math.max(...values) : 1;
    const lower = Math.min(low, 10 ** Math.max(-323, Math.floor(Math.log10(low))));
    const upper = 10 ** Math.ceil(Math.log10(high * 1.12));
    const y = (logarithmic ? scaleLog().domain([lower, upper]) : scaleLinear().domain([0, high * 1.12]).nice()).range([height - 42, 26]);
    const firstPower = Math.ceil(Math.log10(lower)), lastPower = Math.floor(Math.log10(upper));
    const powerStep = Math.max(1, Math.ceil((lastPower - firstPower) / 5));
    const ticks = logarithmic ? Array.from({ length: Math.floor((lastPower - firstPower) / powerStep) + 1 }, (_, i) => 10 ** (firstPower + i * powerStep)) : y.ticks(4);
    ctx.font = '11px Inter, sans-serif';
    for (const value of ticks) {
      ctx.strokeStyle = '#e1e7e9'; ctx.beginPath(); ctx.moveTo(48, y(value)); ctx.lineTo(width - 16, y(value)); ctx.stroke();
      ctx.fillStyle = '#455b60'; ctx.textAlign = 'right'; ctx.fillText((value > 0 && value < 0.01) || value >= 10000 ? value.toExponential(0) : String(Number(value.toPrecision(4))), 41, y(value) + 4);
    }
    for (const value of x.ticks(width < 500 ? 4 : 8)) {
      ctx.fillStyle = '#455b60'; ctx.textAlign = 'center'; ctx.fillText(String(value), x(value), height - 23);
    }
    ctx.textAlign = 'left'; ctx.fillText(`C (mg/L) / ${logarithmic ? (en ? 'Semi-log' : 'Semi-logarithmique') : (en ? 'Linear' : 'Lineaire')}`, 48, 14);
    ctx.textAlign = 'right'; ctx.fillText(en ? 'Time (h)' : 'Temps (h)', width - 16, height - 5);
    if (logarithmic && !values.length) {
      ctx.textAlign = 'center'; ctx.fillText(en ? 'No positive concentration' : 'Aucune concentration positive', (width + 32) / 2, 60);
    }
    /** @param {{t:number,c:number}[]} points @param {string} color @param {boolean} dashed */
    const trace = (points, color, dashed) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash(dashed ? [6, 4] : []); ctx.beginPath();
      let connected = false;
      for (const point of points) {
        if (!Number.isFinite(point.c) || (logarithmic && point.c <= 0)) { connected = false; continue; }
        if (connected) ctx.lineTo(x(point.t), y(point.c)); else ctx.moveTo(x(point.t), y(point.c));
        connected = true;
      }
      ctx.stroke(); ctx.setLineDash([]);
    };
    if (compare) trace(a, '#8c4c89', true);
    trace(b, '#b1d6da', false);
    trace([...b.filter(point => point.t < time), { t: time, c: concentration }], '#087b83', false);
    ctx.strokeStyle = '#253d42'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x(time), 20); ctx.lineTo(x(time), height - 42); ctx.stroke(); ctx.setLineDash([]);
    if (Number.isFinite(concentration) && (!logarithmic || concentration > 0)) {
      ctx.beginPath(); ctx.arc(x(time), y(concentration), 4.5, 0, Math.PI * 2); ctx.fillStyle = '#087b83'; ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
    }
  }
  $: if (canvas && b.length) { a; b; time; width; compare; en; concentration; logarithmic; draw(); }
  onMount(draw);
</script>
<div class="plot" bind:clientWidth={width}>
  <canvas bind:this={canvas} aria-label={`${logarithmic ? 'Semi-log. ' : ''}${en ? 'Concentration-time profiles. Current model solid; reference dashed when enabled.' : 'Profils concentration-temps. Modele actuel en continu ; reference en pointilles si activee.'}`} data-testid={logarithmic ? 'lab-log-plot' : 'lab-plot'}></canvas>
</div>
<style>
  .plot { width: 100%; min-width: 0; }
  canvas { width: 100%; height: 260px; display: block; }
</style>

<script>
  // One-compartment IV bolus explorer.
  // C(t) = (Dose / V) * exp(-(CL/V) * t)
  import { scaleLinear, scaleLog } from 'd3-scale';

  export let dose = 100; // mg
  export let v = 30; // L
  export let cl = 5; // L/h

  let logScale = false;

  const W = 460;
  const H = 300;
  const m = { top: 24, right: 18, bottom: 46, left: 60 };
  const tEnd = 24;
  const times = Array.from({ length: 241 }, (_, i) => (i * tEnd) / 240);

  $: k = cl / v; // 1/h
  $: c0 = dose / v; // mg/L
  $: thalf = Math.log(2) / k; // h
  $: auc = dose / cl; // mg·h/L
  $: curve = times.map((t) => ({ t, c: c0 * Math.exp(-k * t) }));

  $: innerW = W - m.left - m.right;
  $: innerH = H - m.top - m.bottom;
  $: x = scaleLinear().domain([0, tEnd]).range([0, innerW]);
  $: yMax = c0 * 1.08 || 1;
  $: yMin = logScale ? Math.max(c0 * Math.exp(-k * tEnd), c0 / 1000) : 0;
  $: y = logScale
    ? scaleLog().domain([Math.max(yMin, 1e-3), yMax]).range([innerH, 0]).clamp(true)
    : scaleLinear().domain([0, yMax]).range([innerH, 0]);

  $: path = curve
    .filter((p) => (logScale ? p.c > 1e-3 : true))
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(1)},${y(p.c).toFixed(1)}`)
    .join(' ');

  // half-life markers at t1/2, 2·t1/2, 3·t1/2
  $: halfMarks = [1, 2, 3]
    .map((n) => ({ n, t: n * thalf, c: c0 * Math.pow(0.5, n) }))
    .filter((p) => p.t <= tEnd);

  $: xTicks = x.ticks(6);
  $: yTicks = logScale ? y.ticks(4) : y.ticks(5);
</script>

<div class="wrap">
  <div class="controls" data-testid="iv-bolus-controls">
    <label class="slider">
      <span>Dose <em>(mg)</em></span><strong>{dose}</strong>
      <input type="range" min="25" max="400" step="5" bind:value={dose} data-testid="slider-dose" />
    </label>
    <label class="slider">
      <span>Volume V <em>(L)</em></span><strong>{v}</strong>
      <input type="range" min="5" max="80" step="1" bind:value={v} data-testid="slider-volume" />
    </label>
    <label class="slider">
      <span>Clearance CL <em>(L/h)</em></span><strong>{cl}</strong>
      <input type="range" min="0.5" max="25" step="0.5" bind:value={cl} data-testid="slider-clearance" />
    </label>

    <div class="readout" data-testid="iv-bolus-readout">
      <div><span>C₀</span><strong>{c0.toFixed(2)}</strong> mg/L</div>
      <div><span>k = CL/V</span><strong>{k.toFixed(3)}</strong> 1/h</div>
      <div><span>t½ = ln2·V/CL</span><strong>{thalf.toFixed(2)}</strong> h</div>
      <div><span>AUC = Dose/CL</span><strong>{auc.toFixed(1)}</strong> mg·h/L</div>
    </div>

    <button class="toggle" class:on={logScale} on:click={() => (logScale = !logScale)} data-testid="toggle-log-scale">
      {logScale ? 'Semi-log view (linear decay)' : 'Linear view'}
    </button>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" data-testid="pkpd-interactive-chart" role="img" aria-label="IV bolus concentration over time">
    <g transform={`translate(${m.left},${m.top})`}>
      {#each yTicks as t}
        <line x1="0" x2={innerW} y1={y(t)} y2={y(t)} class="grid" />
        <text x="-10" y={y(t) + 4} class="ytick">{t >= 1 ? t.toFixed(t < 10 ? 1 : 0) : t.toFixed(2)}</text>
      {/each}
      {#each xTicks as t}
        <text x={x(t)} y={innerH + 22} class="xtick">{t}</text>
      {/each}

      <path d={path} class="pk-line" />

      {#each halfMarks as hm}
        <line x1={x(hm.t)} x2={x(hm.t)} y1={y(hm.c)} y2={innerH} class="halfguide" />
        <circle cx={x(hm.t)} cy={y(hm.c)} r="4.5" class="halfdot" />
        <text x={x(hm.t)} y={y(hm.c) - 8} class="halflabel">{hm.n}·t½</text>
      {/each}

      <line x1="0" x2="0" y1="0" y2={innerH} class="axis" />
      <line x1="0" x2={innerW} y1={innerH} y2={innerH} class="axis" />
      <text x={innerW / 2} y={innerH + 40} class="axislabel">Time (h)</text>
      <text transform={`translate(-46,${innerH / 2}) rotate(-90)`} class="axislabel">Concentration (mg/L)</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 230px 1fr; align-items: center; } }
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-3); }
  .slider { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-family: var(--font-mono); font-size: var(--text-sm); }
  .slider span { color: var(--text-secondary); }
  .slider em { color: var(--text-muted); font-style: normal; }
  .slider strong { color: var(--accent-pk); }
  .slider input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 2px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-family: var(--font-mono); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .toggle { font-family: var(--font-mono); font-size: var(--text-xs); padding: var(--space-2) var(--space-3); border: 1px solid var(--border-strong); background: var(--bg-tertiary); border-radius: var(--radius); cursor: pointer; }
  .toggle.on { background: var(--text-primary); color: var(--bg-primary); border-color: var(--text-primary); }
  .chart { width: 100%; height: auto; }
  .pk-line { fill: none; stroke: var(--accent-pk); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .grid { stroke: var(--border-subtle); stroke-width: 1; stroke-dasharray: 4 4; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .xtick, .ytick { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; }
  .xtick { text-anchor: middle; }
  .ytick { text-anchor: end; }
  .axislabel { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
  .halfguide { stroke: var(--accent-pd); stroke-width: 1; stroke-dasharray: 2 3; }
  .halfdot { fill: var(--accent-pd); }
  .halflabel { fill: var(--accent-pd); font-family: var(--font-mono); font-size: 10px; text-anchor: middle; }
</style>

<script>
  // Oral absorption explorer — first-order absorption (Bateman) with lag time.
  // C(t) = (Dose/V) * Ka/(Ka-k) * (exp(-k(t-Tlag)) - exp(-Ka(t-Tlag))) for t >= Tlag
  import { scaleLinear } from 'd3-scale';

  export let dose = 100; // mg
  export let ka = 1.0; // 1/h
  export let v = 30; // L
  export let cl = 5; // L/h
  export let tlag = 0.5; // h

  const W = 460;
  const H = 300;
  const m = { top: 24, right: 18, bottom: 46, left: 60 };
  const tEnd = 24;
  const times = Array.from({ length: 361 }, (_, i) => (i * tEnd) / 360);

  function conc(/** @type {number} */ t, /** @type {number} */ ka, /** @type {number} */ k, /** @type {number} */ c0coef, /** @type {number} */ tlag) {
    if (t < tlag) return 0;
    const tt = t - tlag;
    let kaEff = ka;
    if (Math.abs(kaEff - k) < 1e-6) kaEff = k + 1e-6;
    return c0coef * (kaEff / (kaEff - k)) * (Math.exp(-k * tt) - Math.exp(-kaEff * tt));
  }

  $: k = cl / v;
  $: c0coef = dose / v;
  $: curve = times.map((t) => ({ t, c: Math.max(0, conc(t, ka, k, c0coef, tlag)) }));
  $: cmaxPoint = curve.reduce((b, p) => (p.c > b.c ? p : b), { t: 0, c: 0 });
  $: flipFlop = ka < k; // absorption slower than elimination

  $: innerW = W - m.left - m.right;
  $: innerH = H - m.top - m.bottom;
  $: x = scaleLinear().domain([0, tEnd]).range([0, innerW]);
  $: yMax = (cmaxPoint.c || 1) * 1.12;
  $: y = scaleLinear().domain([0, yMax]).range([innerH, 0]);
  $: path = curve.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(1)},${y(p.c).toFixed(1)}`).join(' ');
  $: area = `${path} L${x(tEnd).toFixed(1)},${innerH} L0,${innerH} Z`;
  $: xTicks = x.ticks(6);
  $: yTicks = y.ticks(5);
</script>

<div class="wrap">
  <div class="controls" data-testid="oral-controls">
    <label class="slider"><span>Dose <em>(mg)</em></span><strong>{dose}</strong>
      <input type="range" min="25" max="400" step="5" bind:value={dose} data-testid="slider-dose" /></label>
    <label class="slider"><span>Ka <em>(1/h)</em></span><strong>{ka.toFixed(2)}</strong>
      <input type="range" min="0.1" max="3" step="0.05" bind:value={ka} data-testid="slider-absorption-rate" /></label>
    <label class="slider"><span>Tlag <em>(h)</em></span><strong>{tlag.toFixed(1)}</strong>
      <input type="range" min="0" max="4" step="0.1" bind:value={tlag} data-testid="slider-lag" /></label>
    <label class="slider"><span>CL <em>(L/h)</em></span><strong>{cl}</strong>
      <input type="range" min="0.5" max="25" step="0.5" bind:value={cl} data-testid="slider-clearance" /></label>
    <label class="slider"><span>V <em>(L)</em></span><strong>{v}</strong>
      <input type="range" min="5" max="80" step="1" bind:value={v} data-testid="slider-volume" /></label>

    <div class="readout" data-testid="oral-readout">
      <div><span>Cmax</span><strong>{cmaxPoint.c.toFixed(2)}</strong> mg/L</div>
      <div><span>Tmax</span><strong>{cmaxPoint.t.toFixed(2)}</strong> h</div>
      <div><span>k = CL/V</span><strong>{k.toFixed(3)}</strong> 1/h</div>
    </div>

    {#if flipFlop}
      <p class="note" data-testid="flipflop-note">Ka &lt; k: absorption is rate-limiting (flip-flop). The terminal slope reflects Ka, not elimination.</p>
    {/if}
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" data-testid="pkpd-interactive-chart" role="img" aria-label="Oral absorption concentration over time">
    <g transform={`translate(${m.left},${m.top})`}>
      {#each yTicks as t}
        <line x1="0" x2={innerW} y1={y(t)} y2={y(t)} class="grid" />
        <text x="-10" y={y(t) + 4} class="ytick">{t >= 1 ? t.toFixed(1) : t.toFixed(2)}</text>
      {/each}
      {#each xTicks as t}
        <text x={x(t)} y={innerH + 22} class="xtick">{t}</text>
      {/each}

      <path d={area} class="pk-area" />
      <path d={path} class="pk-line" />

      {#if cmaxPoint.c > 0}
        <line x1={x(cmaxPoint.t)} x2={x(cmaxPoint.t)} y1={y(cmaxPoint.c)} y2={innerH} class="cmaxguide" />
        <circle cx={x(cmaxPoint.t)} cy={y(cmaxPoint.c)} r="5" class="cmaxdot" />
        <text x={x(cmaxPoint.t) + 6} y={y(cmaxPoint.c) - 6} class="cmaxlabel">Cmax</text>
      {/if}
      {#if tlag > 0}
        <line x1={x(tlag)} x2={x(tlag)} y1="0" y2={innerH} class="lagguide" />
        <text x={x(tlag) + 4} y="12" class="laglabel">Tlag</text>
      {/if}

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
  .controls { display: grid; gap: var(--space-3); }
  .slider { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-family: var(--font-mono); font-size: var(--text-sm); }
  .slider span { color: var(--text-secondary); }
  .slider em { color: var(--text-muted); font-style: normal; }
  .slider strong { color: var(--accent-pk); }
  .slider input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 2px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-family: var(--font-mono); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .note { font-size: var(--text-xs); color: var(--accent-pk); background: #f6ece6; border-left: 3px solid var(--accent-pk); padding: var(--space-2) var(--space-3); border-radius: 0 6px 6px 0; margin: 0; }
  .chart { width: 100%; height: auto; }
  .pk-line { fill: none; stroke: var(--accent-pk); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .pk-area { fill: rgba(184, 92, 56, 0.08); stroke: none; }
  .grid { stroke: var(--border-subtle); stroke-width: 1; stroke-dasharray: 4 4; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .xtick, .ytick { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; }
  .xtick { text-anchor: middle; }
  .ytick { text-anchor: end; }
  .axislabel { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
  .cmaxguide { stroke: var(--accent-pd); stroke-width: 1; stroke-dasharray: 2 3; }
  .cmaxdot { fill: var(--accent-pd); }
  .cmaxlabel { fill: var(--accent-pd); font-family: var(--font-mono); font-size: 11px; }
  .lagguide { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 2 3; }
  .laglabel { fill: var(--text-muted); font-family: var(--font-mono); font-size: 10px; }
</style>

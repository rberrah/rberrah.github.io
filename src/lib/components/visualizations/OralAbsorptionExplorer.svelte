<script>
  // Absorption orale : 1er ordre (Bateman) + Tlag, comparée à un modèle de
  // COMPARTIMENTS DE TRANSIT (chaîne de n compartiments, intégrée numériquement).
  //   Bateman : C(t) = (Dose/V)·Ka/(Ka−k)·(e^-k(t−Tlag) − e^-Ka(t−Tlag))
  //   Transit : dT1/dt=−ktr·T1 ; dTi/dt=ktr·T(i−1)−ktr·Ti ; dA/dt=ktr·Tn−k·A
  import { scaleLinear } from 'd3-scale';

  export let dose = 100; // mg
  export let ka = 1.0; // 1/h
  export let v = 30; // L
  export let cl = 5; // L/h
  export let tlag = 0.5; // h
  export let nTransit = 3; // nombre de compartiments de transit
  export let mtt = 2.5; // temps de transit moyen (h) ; ktr = n / MTT
  let showTransit = true;

  const W = 460, H = 300;
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
  $: flipFlop = ka < k;

  // Modèle de transit : intégration d'Euler sur une grille fine
  $: transitData = (() => {
    const n = Math.round(nTransit);
    const ktr = n / mtt;
    const dt = tEnd / 1440;
    const T = new Array(n).fill(0);
    T[0] = dose;
    let A = 0;
    const pts = [{ t: 0, c: 0 }];
    for (let s = 1; s <= 1440; s++) {
      const dT = new Array(n);
      dT[0] = -ktr * T[0];
      for (let i = 1; i < n; i++) dT[i] = ktr * T[i - 1] - ktr * T[i];
      const dA = ktr * T[n - 1] - k * A;
      for (let i = 0; i < n; i++) T[i] += dT[i] * dt;
      A += dA * dt;
      pts.push({ t: s * dt, c: Math.max(0, A / v) });
    }
    return pts;
  })();
  $: transitCmax = transitData.reduce((b, p) => (p.c > b.c ? p : b), { t: 0, c: 0 });

  $: innerW = W - m.left - m.right;
  $: innerH = H - m.top - m.bottom;
  $: x = scaleLinear().domain([0, tEnd]).range([0, innerW]);
  $: yMax = Math.max(cmaxPoint.c, showTransit ? transitCmax.c : 0, 0.001) * 1.12;
  $: y = scaleLinear().domain([0, yMax]).range([innerH, 0]);
  $: path = curve.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(1)},${y(p.c).toFixed(1)}`).join(' ');
  $: transitPath = transitData.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(1)},${y(p.c).toFixed(1)}`).join(' ');
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

    <label class="chk"><input type="checkbox" bind:checked={showTransit} /> Comparer aux compartiments de transit</label>
    {#if showTransit}
      <label class="slider"><span>Transit <em>(n)</em></span><strong>{nTransit}</strong>
        <input type="range" min="1" max="8" step="1" bind:value={nTransit} /></label>
      <label class="slider"><span>MTT <em>(h)</em></span><strong>{mtt.toFixed(1)}</strong>
        <input type="range" min="0.5" max="6" step="0.1" bind:value={mtt} /></label>
    {/if}

    <div class="readout" data-testid="oral-readout">
      <div><span>Cmax (1er ordre)</span><strong>{cmaxPoint.c.toFixed(2)}</strong> mg/L</div>
      <div><span>Tmax (1er ordre)</span><strong>{cmaxPoint.t.toFixed(2)}</strong> h</div>
      {#if showTransit}<div><span>Tmax (transit)</span><strong>{transitCmax.t.toFixed(2)}</strong> h</div>{/if}
    </div>

    {#if flipFlop}
      <p class="note" data-testid="flipflop-note">Ka &lt; k : l'absorption est limitante (flip-flop). La pente terminale reflète Ka, pas l'élimination.</p>
    {/if}
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" data-testid="pkpd-interactive-chart" role="img" aria-label="Absorption orale : concentration au cours du temps">
    <g transform={`translate(${m.left},${m.top})`}>
      {#each yTicks as t}
        <line x1="0" x2={innerW} y1={y(t)} y2={y(t)} class="grid" />
        <text x="-10" y={y(t) + 4} class="ytick">{t >= 1 ? t.toFixed(1) : t.toFixed(2)}</text>
      {/each}
      {#each xTicks as t}
        <text x={x(t)} y={innerH + 22} class="xtick">{t}</text>
      {/each}

      <path d={path} class="pk-line" />
      {#if showTransit}<path d={transitPath} class="transit-line" />{/if}

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
      <text x={innerW / 2} y={innerH + 40} class="axislabel">Temps (h)</text>
      <text transform={`translate(-46,${innerH / 2}) rotate(-90)`} class="axislabel">Concentration (mg/L)</text>

      <g class="legend" transform="translate(6,4)">
        <rect x="0" y="0" width="14" height="3" class="pk-line" /><text x="20" y="4" class="leg">1er ordre + Tlag</text>
        {#if showTransit}<rect x="0" y="15" width="14" height="3" class="transit-line" /><text x="20" y="19" class="leg">Transit (n={nTransit})</text>{/if}
      </g>
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
  .chk { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); display: flex; gap: 6px; align-items: center; }
  .readout { display: grid; gap: 2px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-family: var(--font-mono); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .note { font-size: var(--text-xs); color: var(--accent-pk); background: color-mix(in srgb, var(--accent-pk) 8%, var(--bg-tertiary)); border-left: 3px solid var(--accent-pk); padding: var(--space-2) var(--space-3); border-radius: 0 6px 6px 0; margin: 0; }
  .chart { width: 100%; height: auto; }
  .pk-line { fill: none; stroke: var(--accent-pk); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .transit-line { fill: none; stroke: var(--accent-ai); stroke-width: 2.5; stroke-dasharray: 6 4; stroke-linecap: round; }
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
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
</style>

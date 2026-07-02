<script>
  // Doses répétées : superposition de bolus IV toutes les τ heures.
  //   C(t) = Σ (Dose/V)·e^(-ke·(t-nτ))   pour nτ ≤ t,  ke = CL/V
  // Illustre l'accumulation vers l'état d'équilibre (Css) et l'effet de τ.
  let dose = 100; // mg
  let cl = 5;     // L/h
  let v = 35;     // L
  let tau = 8;    // h — intervalle entre doses
  let loading = false; // dose de charge (2×) à t=0

  const W = 470, H = 300, m = { top: 18, right: 16, bottom: 44, left: 50 };
  const tEnd = 48;
  $: ke = cl / v;
  $: thalf = Math.log(2) / ke;
  $: cssAvg = dose / (cl * tau); // concentration moyenne à l'équilibre
  $: cMaxSS = (dose / v) / (1 - Math.exp(-ke * tau)); // pic à l'équilibre (bolus)
  $: cMinSS = cMaxSS * Math.exp(-ke * tau);
  $: rac = 1 / (1 - Math.exp(-ke * tau)); // ratio d'accumulation

  const N = 480;
  $: doseTimes = Array.from({ length: Math.floor(tEnd / tau) + 1 }, (_, i) => i * tau);
  /** @param {number} t */
  function conc(t) {
    let c = 0;
    for (const dt of doseTimes) {
      if (dt <= t) {
        const amt = loading && dt === 0 ? 2 * dose : dose;
        c += (amt / v) * Math.exp(-ke * (t - dt));
      }
    }
    return c;
  }
  $: curve = Array.from({ length: N + 1 }, (_, i) => {
    const t = (i / N) * tEnd;
    return { t, c: conc(t) };
  });

  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  $: cMax = Math.max(cMaxSS * 1.1, (loading ? 2 : 1) * dose / v * 1.05);
  const xt = (/** @type {number} */ t) => (t / tEnd) * (W - m.left - m.right);
  $: yc = (/** @type {number} */ c) => iH - (Math.min(c, cMax) / cMax) * iH;
  $: path = curve.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yc(p.c).toFixed(1)}`).join(' ');
  $: t90 = 3.32 * thalf; // ~90 % de l'équilibre
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Dose (mg)</span><strong>{dose}</strong><input type="range" min="25" max="300" step="5" bind:value={dose} /></label>
    <label class="s"><span>Intervalle τ (h)</span><strong>{tau}</strong><input type="range" min="2" max="24" step="1" bind:value={tau} /></label>
    <label class="s"><span>CL (L/h)</span><strong>{cl}</strong><input type="range" min="1" max="15" step="0.5" bind:value={cl} /></label>
    <label class="s"><span>V (L)</span><strong>{v}</strong><input type="range" min="10" max="70" step="1" bind:value={v} /></label>
    <label class="chk"><input type="checkbox" bind:checked={loading} /> Dose de charge (2×)</label>
    <div class="readout">
      <div><span>t½</span><strong>{thalf.toFixed(1)}</strong> h</div>
      <div><span>Css moyenne</span><strong>{cssAvg.toFixed(2)}</strong> mg/L</div>
      <div><span>Cmax,ss / Cmin,ss</span><strong>{cMaxSS.toFixed(1)} / {cMinSS.toFixed(1)}</strong></div>
      <div><span>Ratio accumulation</span><strong>{rac.toFixed(2)}</strong></div>
    </div>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Doses répétées et accumulation">
    <g transform={`translate(${m.left},${m.top})`}>
      <!-- Css moyenne -->
      <line x1="0" x2={iW} y1={yc(cssAvg)} y2={yc(cssAvg)} class="css" />
      <text x={iW - 2} y={yc(cssAvg) - 4} class="csslabel">Css moy.</text>
      <!-- ~90% équilibre -->
      {#if t90 < tEnd}
        <line x1={xt(t90)} x2={xt(t90)} y1="0" y2={iH} class="t90" />
        <text x={xt(t90) + 3} y="12" class="t90label">≈ 90 % (~4 t½)</text>
      {/if}
      <path d={path} class="line" />
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <text x={iW / 2} y={iH + 36} class="lbl">Temps (h)</text>
      <text transform={`translate(-40,${iH / 2}) rotate(-90)`} class="lbl">Concentration (mg/L)</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 220px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-family: var(--font-mono); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-pk); }
  .s input { grid-column: 1 / -1; }
  .chk { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); display: flex; gap: 6px; align-items: center; }
  .readout { display: grid; gap: 2px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-family: var(--font-mono); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .line { fill: none; stroke: var(--accent-pk); stroke-width: 2.5; stroke-linejoin: round; }
  .css { stroke: var(--accent-pd); stroke-width: 1.5; stroke-dasharray: 6 4; }
  .csslabel { fill: var(--accent-pd); font-family: var(--font-mono); font-size: 10px; text-anchor: end; }
  .t90 { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 2 3; }
  .t90label { fill: var(--text-muted); font-family: var(--font-mono); font-size: 9px; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
</style>

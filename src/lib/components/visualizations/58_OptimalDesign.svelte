<script>
  // Design optimal : où placer 2 prélèvements pour estimer V et k avec précision ?
  // On calcule la matrice de Fisher 2×2 à partir des sensibilités de C(t)=(D/V)e^{-kt},
  // on l'inverse, et on affiche les RSE. Un point précoce (info sur V) + un point tardif
  // (info sur k) minimisent les RSE ; deux points proches rendent la FIM quasi singulière.
  let t1 = 1; // h
  let t2 = 10; // h

  const D = 100, V = 30, k = 0.15, sigma = 0.4; // PK vraie + erreur additive
  const T = 16, dt = 0.05;

  /** @param {number} t @returns {number} */
  const conc = (t) => (D / V) * Math.exp(-k * t);
  /** sensibilités @param {number} t @returns {[number,number]} */
  function sens(t) {
    const C = conc(t);
    return [-C / V, -C * t]; // [∂C/∂V, ∂C/∂k]
  }

  $: fim = (() => {
    let a = 0, b = 0, d = 0;
    for (const t of [t1, t2]) {
      const [sv, sk] = sens(t);
      a += sv * sv; b += sv * sk; d += sk * sk;
    }
    const f = 1 / (sigma * sigma);
    return { a: a * f, b: b * f, d: d * f };
  })();
  $: det = fim.a * fim.d - fim.b * fim.b;
  $: cov = det > 1e-12 ? { v: fim.d / det, k: fim.a / det } : { v: Infinity, k: Infinity };
  $: rseV = Math.min(999, (Math.sqrt(cov.v) / V) * 100);
  $: rseK = Math.min(999, (Math.sqrt(cov.k) / k) * 100);
  $: quality = rseV < 15 && rseK < 15 ? 'bon' : rseV > 40 || rseK > 40 ? 'mauvais' : 'moyen';

  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 40, left: 46 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const cMax = D / V * 1.05;
  $: xt = (/** @type {number} */ t) => (t / T) * iW;
  $: yv = (/** @type {number} */ c) => iH - (c / cMax) * iH;
  $: curve = Array.from({ length: 161 }, (_, i) => (i / 160) * T);
  $: pathC = curve.map((t, i) => `${i ? 'L' : 'M'}${xt(t).toFixed(1)},${yv(conc(t)).toFixed(1)}`).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Prélèvement 1 (h)</span><strong>{t1.toFixed(1)}</strong><input type="range" min="0.2" max="16" step="0.2" bind:value={t1} /></label>
    <label class="s"><span>Prélèvement 2 (h)</span><strong>{t2.toFixed(1)}</strong><input type="range" min="0.2" max="16" step="0.2" bind:value={t2} /></label>
    <div class="readout">
      <div><span>RSE sur V</span><strong>{rseV.toFixed(0)} %</strong></div>
      <div><span>RSE sur k</span><strong>{rseK.toFixed(0)} %</strong></div>
      <div class="verdict" class:ok={quality === 'bon'} class:bad={quality === 'mauvais'}>Design {quality}</div>
    </div>
    <p class="hint">Un point <em>précoce</em> informe sur V, un point <em>tardif</em> sur k. Rapprochez les deux : la matrice de Fisher se dégrade et les RSE explosent.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Placement des prélèvements et précision">
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <path d={pathC} class="cline" />
      {#each [t1, t2] as ts}
        <line x1={xt(ts)} x2={xt(ts)} y1={yv(conc(ts))} y2={iH} class="samp" />
        <circle cx={xt(ts)} cy={yv(conc(ts))} r="5" class="sampdot" />
      {/each}
      <text x={iW / 2} y={iH + 32} class="lbl">Temps (h)</text>
      <text transform={`translate(-34,${iH / 2}) rotate(-90)`} class="lbl">Concentration (mg/L)</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --math: #5b6b7a; }
  @media (min-width: 720px) { .wrap { grid-template-columns: 215px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--math); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div:not(.verdict) { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .verdict { margin-top: 2px; padding: 3px 6px; border-radius: var(--radius); text-align: center; font-weight: 600; background: var(--bg-tertiary); color: var(--text-secondary); }
  .verdict.ok { background: var(--quiz-success-bg); color: var(--quiz-success-text); }
  .verdict.bad { background: var(--quiz-error-bg); color: var(--quiz-error-text); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .cline { fill: none; stroke: var(--math); stroke-width: 2.4; }
  .samp { stroke: var(--accent-pk); stroke-width: 1; stroke-dasharray: 2 2; }
  .sampdot { fill: var(--accent-pk); }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
</style>

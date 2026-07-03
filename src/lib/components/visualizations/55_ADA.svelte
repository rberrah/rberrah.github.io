<script>
  // Immunogénicité (ADA) : après séroconversion, la clairance augmente et les
  // concentrations résiduelles s'effondrent → perte de réponse secondaire.
  //   CL(t) = CL0 · [1 + θ·A(t)],  A(t) = montée logistique après la semaine d'apparition
  let theta = 3; // amplitude de l'effet ADA sur la clairance
  let onset = 6; // semaine d'apparition des ADA

  const V = 5, CL0 = 0.5; // L, L/sem
  const doseAmt = 300, tau = 2; // mg toutes les 2 semaines
  const T = 20, dt = 0.02; // semaines
  const target = 5; // mg/L — résiduelle cible (efficacité)

  $: sim = (() => {
    const n = Math.round(T / dt);
    let C = 0, nextDose = 0;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i * dt;
      if (t >= nextDose - 1e-9) { C += doseAmt / V; nextDose += tau; }
      const A = 1 / (1 + Math.exp(-(t - onset) * 1.2)); // 0→1 autour de `onset`
      const CL = CL0 * (1 + theta * A);
      pts.push({ t, C, A });
      C = Math.max(0, C - (CL / V) * C * dt);
    }
    return pts;
  })();

  // résiduelles (juste avant chaque dose) pour juger l'efficacité
  $: troughs = (() => {
    const out = [];
    for (let k = 1; k * tau < T; k++) {
      const idx = Math.round((k * tau - 0.001) / dt);
      out.push({ t: k * tau, C: sim[idx]?.C ?? 0 });
    }
    return out;
  })();
  $: lastTrough = troughs.length ? troughs[troughs.length - 1].C : 0;
  $: lost = lastTrough < target;

  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 40, left: 46 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  $: yMax = Math.max(...sim.map((p) => p.C)) * 1.05 || 1;
  $: xt = (/** @type {number} */ t) => (t / T) * iW;
  $: yv = (/** @type {number} */ c) => iH - (c / yMax) * iH;
  $: pathC = sim.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yv(p.C).toFixed(1)}`).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Effet ADA (θ)</span><strong>{theta.toFixed(1)}</strong><input type="range" min="0" max="6" step="0.5" bind:value={theta} /></label>
    <label class="s"><span>Apparition (sem)</span><strong>{onset}</strong><input type="range" min="2" max="14" step="1" bind:value={onset} /></label>
    <div class="readout">
      <div><span>Résiduelle finale</span><strong>{lastTrough.toFixed(1)} mg/L</strong></div>
      <div><span>Cible</span><strong>{target} mg/L</strong></div>
      <div class="verdict" class:lost>{lost ? 'Perte de réponse' : 'Exposition maintenue'}</div>
    </div>
    <p class="hint">Sans ADA (θ = 0), les résiduelles restent au-dessus de la cible. Dès la séroconversion, la clairance monte et les creux s'effondrent.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Concentrations sous anticorps avec apparition d'ADA">
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={yv(target)} y2={yv(target)} class="target" />
      <text x="2" y={yv(target) - 4} class="targetlbl">cible</text>
      {#if theta > 0}<line x1={xt(onset)} x2={xt(onset)} y1="0" y2={iH} class="onset" /><text x={xt(onset) + 3} y="12" class="onsetlbl">ADA</text>{/if}
      <path d={pathC} class="cline" />
      {#each troughs as tr}<circle cx={xt(tr.t)} cy={yv(tr.C)} r="3" class:low={tr.C < target} class="trough" />{/each}
      <text x={iW / 2} y={iH + 32} class="lbl">Temps (semaines)</text>
      <text transform={`translate(-34,${iH / 2}) rotate(-90)`} class="lbl">Concentration (mg/L)</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --mab: #a06a2c; }
  @media (min-width: 720px) { .wrap { grid-template-columns: 215px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--mab); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div:not(.verdict) { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .verdict { margin-top: 2px; padding: 3px 6px; border-radius: var(--radius); text-align: center; font-weight: 600; background: var(--quiz-success-bg); color: var(--quiz-success-text); }
  .verdict.lost { background: var(--quiz-error-bg); color: var(--quiz-error-text); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .target { stroke: var(--accent-pd); stroke-width: 1.4; stroke-dasharray: 4 3; }
  .targetlbl { fill: var(--accent-pd); font-family: var(--font-mono); font-size: 9px; }
  .onset { stroke: #b0392b; stroke-width: 1; stroke-dasharray: 3 3; }
  .onsetlbl { fill: #b0392b; font-family: var(--font-mono); font-size: 9px; }
  .cline { fill: none; stroke: var(--mab); stroke-width: 2.2; }
  .trough { fill: var(--mab); }
  .trough.low { fill: #b0392b; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
</style>

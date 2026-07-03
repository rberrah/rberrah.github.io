<script>
  // Modèle JOINT : la dynamique tumorale (TGI) pilote le risque de progression.
  //   Longitudinal :  dTS/dt = KG·TS − K·expo·exp(−λt)·TS
  //   Lien (hasard) :  h(t) = h0 · exp(β · [TS(t)/TS0 − 1])
  //   Survie       :  S(t) = exp(−∫ h)   (survie sans progression, PFS)
  // Plus l'exposition réduit la tumeur, plus le hasard baisse → PFS plus longue.
  let dose = 100; // exposition relative
  let beta = 1.6; // force du lien tumeur → risque

  const TS0 = 60, KG = 0.035, K = 0.06, lambda = 0.02;
  const h0 = 0.04; // hasard de base (1/sem)
  const T = 78, dt = 0.25; // 18 mois

  /** @param {number} d @param {number} b @returns {{t:number,ts:number,S:number}[]} */
  function simulate(d, b) {
    const expo = d / 100;
    const n = Math.round(T / dt);
    let ts = TS0, cumH = 0;
    const pts = [{ t: 0, ts, S: 1 }];
    for (let i = 1; i <= n; i++) {
      const t = i * dt;
      const shrink = K * expo * Math.exp(-lambda * t);
      ts = Math.max(0.5, ts + (KG * ts - shrink * ts) * dt);
      const h = h0 * Math.exp(b * (ts / TS0 - 1));
      cumH += h * dt;
      pts.push({ t, ts, S: Math.exp(-cumH) });
    }
    return pts;
  }

  $: sel = simulate(dose, beta);
  $: ref = simulate(0, beta); // sans traitement
  /** @param {{t:number,S:number}[]} s @returns {number} */
  function medianPFS(s) {
    const hit = s.find((p) => p.S <= 0.5);
    return hit ? hit.t : T;
  }
  $: mSel = medianPFS(sel);
  $: mRef = medianPFS(ref);

  const W = 480, H = 300, m = { top: 18, right: 16, bottom: 44, left: 46 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  $: xt = (/** @type {number} */ t) => (t / T) * iW;
  $: yS = (/** @type {number} */ s) => iH - s * iH; // S de 0 à 1
  $: pathSel = sel.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yS(p.S).toFixed(1)}`).join(' ');
  $: pathRef = ref.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t).toFixed(1)},${yS(p.S).toFixed(1)}`).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Exposition (AUC)</span><strong>{dose}%</strong><input type="range" min="0" max="220" step="5" bind:value={dose} /></label>
    <label class="s"><span>Lien β (tumeur→risque)</span><strong>{beta.toFixed(1)}</strong><input type="range" min="0" max="3" step="0.1" bind:value={beta} /></label>
    <div class="readout">
      <div><span>PFS médiane (traité)</span><strong>{mSel >= T ? '> ' : ''}{mSel.toFixed(0)} sem</strong></div>
      <div><span>PFS médiane (témoin)</span><strong>{mRef.toFixed(0)} sem</strong></div>
      <div><span>Gain</span><strong>{(mSel - mRef).toFixed(0)} sem</strong></div>
    </div>
    <p class="hint">Le modèle <em>joint</em> relie la taille tumorale au risque de progression (β) : réduire la tumeur repousse la courbe de survie.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Courbe de survie sans progression">
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <!-- médiane 50% -->
      <line x1="0" x2={iW} y1={yS(0.5)} y2={yS(0.5)} class="med" />
      <text x="2" y={yS(0.5) - 4} class="medlbl">médiane (S = 0,5)</text>
      <path d={pathRef} class="rline" />
      <path d={pathSel} class="sline" />
      {#if mSel < T}<line x1={xt(mSel)} x2={xt(mSel)} y1={yS(0.5)} y2={iH} class="guide" />{/if}
      <text x={iW / 2} y={iH + 36} class="lbl">Temps (semaines)</text>
      <text transform={`translate(-34,${iH / 2}) rotate(-90)`} class="lbl">Survie sans progression</text>
      <g class="legend" transform={`translate(${iW - 128},4)`}>
        <rect x="0" y="0" width="12" height="3" class="sline" /><text x="18" y="4" class="leg">Traité</text>
        <rect x="0" y="16" width="12" height="3" class="rline" /><text x="18" y="20" class="leg">Témoin</text>
      </g>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --onco: #9c4f6a; }
  @media (min-width: 720px) { .wrap { grid-template-columns: 215px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--onco); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .med { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 2 4; }
  .medlbl { fill: var(--text-muted); font-family: var(--font-mono); font-size: 9px; }
  .sline { fill: none; stroke: var(--onco); stroke-width: 2.6; }
  .rline { fill: none; stroke: var(--text-muted); stroke-width: 1.6; stroke-dasharray: 4 4; }
  .guide { stroke: var(--onco); stroke-width: 1; stroke-dasharray: 2 3; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
</style>

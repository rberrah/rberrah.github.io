<script>
  // Courbes de survie OS et PFS (modèle paramétrique de Weibull) avec effet traitement.
  //   S(t) = exp(−(t/λ)^k) ,  hasard h(t) = (k/λ)(t/λ)^(k−1)
  // La PFS (progression) survient plus tôt que l'OS (décès) : hasard plus élevé.
  // Le hazard ratio (HR) < 1 traduit un bénéfice du traitement (courbes vers la droite).
  let hr = 0.65; // hazard ratio traitement (1 = pas d'effet)

  const T = 48; // mois
  const kW = 1.4; // forme de Weibull
  const lamPFS = 12, lamOS = 26; // échelles (médiane ≈ λ·(ln2)^(1/k))

  /** @param {number} t @param {number} lam @param {number} mult @returns {number} */
  function surv(t, lam, mult) {
    // multiplier le hasard par `mult` revient à S^mult
    return Math.pow(Math.exp(-Math.pow(t / lam, kW)), mult);
  }
  /** @param {number} lam @param {number} mult @returns {number} */
  function median(lam, mult) {
    // S=0.5 → (t/λ)^k = ln2/mult
    return lam * Math.pow(Math.log(2) / mult, 1 / kW);
  }

  const N = 120;
  $: ts = Array.from({ length: N + 1 }, (_, i) => (i / N) * T);
  $: pfsCtrl = ts.map((t) => surv(t, lamPFS, 1));
  $: pfsTrt = ts.map((t) => surv(t, lamPFS, hr));
  $: osCtrl = ts.map((t) => surv(t, lamOS, 1));
  $: osTrt = ts.map((t) => surv(t, lamOS, hr));
  $: mPfsTrt = median(lamPFS, hr);
  $: mOsTrt = median(lamOS, hr);

  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 40, left: 44 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  $: xt = (/** @type {number} */ t) => (t / T) * iW;
  $: yS = (/** @type {number} */ s) => iH - s * iH;
  /** @param {number[]} arr @returns {string} */
  const path = (arr) => arr.map((s, i) => `${i ? 'L' : 'M'}${xt(ts[i]).toFixed(1)},${yS(s).toFixed(1)}`).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Hazard ratio (HR)</span><strong>{hr.toFixed(2)}</strong><input type="range" min="0.3" max="1" step="0.05" bind:value={hr} /></label>
    <div class="readout">
      <div><span>Médiane PFS (traité)</span><strong>{mPfsTrt.toFixed(1)} mois</strong></div>
      <div><span>Médiane OS (traité)</span><strong>{mOsTrt >= T ? '> ' : ''}{Math.min(mOsTrt, T).toFixed(1)} mois</strong></div>
      <div><span>Effet</span><strong>{hr < 1 ? 'bénéfice' : 'nul'}</strong></div>
    </div>
    <p class="hint">La PFS chute avant l'OS. Un HR &lt; 1 (traitement efficace) décale les deux courbes vers la droite : la survie médiane augmente.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Courbes de survie OS et PFS">
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={yS(0.5)} y2={yS(0.5)} class="med" />
      <text x="2" y={yS(0.5) - 4} class="medlbl">médiane</text>
      <path d={path(pfsCtrl)} class="ctrl" />
      <path d={path(osCtrl)} class="ctrl" />
      <path d={path(pfsTrt)} class="pfs" />
      <path d={path(osTrt)} class="os" />
      <text x={iW / 2} y={iH + 32} class="lbl">Temps (mois)</text>
      <text transform={`translate(-32,${iH / 2}) rotate(-90)`} class="lbl">Probabilité de survie</text>
      <g class="legend" transform={`translate(${iW - 118},2)`}>
        <rect x="0" y="0" width="12" height="3" class="pfs" /><text x="18" y="4" class="leg">PFS (traité)</text>
        <rect x="0" y="15" width="12" height="3" class="os" /><text x="18" y="19" class="leg">OS (traité)</text>
        <rect x="0" y="30" width="12" height="3" class="ctrl" /><text x="18" y="34" class="leg">Témoin</text>
      </g>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --pd: #5b8c3a; }
  @media (min-width: 720px) { .wrap { grid-template-columns: 215px 1fr; align-items: center; } }
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--pd); }
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
  .pfs { fill: none; stroke: var(--accent-pk); stroke-width: 2.6; }
  .os { fill: none; stroke: var(--pd); stroke-width: 2.6; }
  .ctrl { fill: none; stroke: var(--text-muted); stroke-width: 1.4; stroke-dasharray: 4 4; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
</style>

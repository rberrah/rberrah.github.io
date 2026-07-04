<script>
  // Diagnostics numériques : test du rapport de vraisemblance (ΔOFV ~ χ²) + AIC/BIC.
  // ΔOFV = baisse de −2·logL en ajoutant des paramètres. Pour des modèles EMBOÎTÉS,
  // ΔOFV suit une loi du χ² à Δdf degrés de liberté sous H0 (« le paramètre est inutile »).
  // AIC = OFV + 2k ; BIC = OFV + k·ln(n) : ils pénalisent la complexité.
  let dOFV = 12; // baisse de l'OFV en ajoutant les paramètres
  let ddf = 1; // nombre de paramètres ajoutés (degrés de liberté)
  let n = 200; // nombre d'observations (pour le BIC)

  // valeurs critiques du χ² à 5 % (df = 1..4)
  /** @type {Record<number, number>} */
  const crit = { 1: 3.84, 2: 5.99, 3: 7.81, 4: 9.49 };
  $: seuil = crit[ddf];
  $: significatif = dOFV > seuil;
  // variation d'AIC/BIC en passant au modèle plus riche (négatif = amélioration)
  $: dAIC = -dOFV + 2 * ddf;
  $: dBIC = -dOFV + ddf * Math.log(n);

  // densité du χ² pour tracer la courbe (Lanczos pour Γ)
  /** @param {number} z @returns {number} */
  function gamma(z) {
    const g = 7;
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    z -= 1; let x = c[0];
    for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }
  /** @param {number} x @param {number} k @returns {number} */
  function chi2pdf(x, k) {
    if (x <= 0) return 0;
    return Math.pow(x, k / 2 - 1) * Math.exp(-x / 2) / (Math.pow(2, k / 2) * gamma(k / 2));
  }

  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 40, left: 40 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const xMax = 20;
  $: xs = Array.from({ length: 161 }, (_, i) => (i / 160) * xMax);
  $: dens = xs.map((x) => chi2pdf(x, ddf));
  $: yMax = Math.max(0.06, ...dens.slice(3)) * 1.1; // ignore le pic en 0 pour df=1
  $: xt = (/** @type {number} */ x) => (x / xMax) * iW;
  $: yv = (/** @type {number} */ y) => iH - (Math.min(y, yMax) / yMax) * iH;
  $: curve = xs.map((x, i) => `${i ? 'L' : 'M'}${xt(x).toFixed(1)},${yv(dens[i]).toFixed(1)}`).join(' ');
  // zone de rejet (x > seuil)
  $: reject = (() => {
    const pts = xs.filter((x) => x >= seuil);
    if (!pts.length) return '';
    const top = pts.map((x, i) => `${i ? 'L' : 'M'}${xt(x).toFixed(1)},${yv(chi2pdf(x, ddf)).toFixed(1)}`).join(' ');
    return `${top} L${xt(xMax).toFixed(1)},${yv(0).toFixed(1)} L${xt(seuil).toFixed(1)},${yv(0).toFixed(1)} Z`;
  })();
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>ΔOFV (baisse)</span><strong>{dOFV.toFixed(1)}</strong><input type="range" min="0" max="20" step="0.5" bind:value={dOFV} /></label>
    <label class="s"><span>Paramètres ajoutés</span><strong>{ddf}</strong><input type="range" min="1" max="4" step="1" bind:value={ddf} /></label>
    <label class="s"><span>Observations n</span><strong>{n}</strong><input type="range" min="50" max="1000" step="50" bind:value={n} /></label>
    <div class="readout">
      <div><span>Seuil χ² (5 %)</span><strong>{seuil.toFixed(2)}</strong></div>
      <div class="verdict" class:ok={significatif} class:no={!significatif}>{significatif ? 'Gain significatif (LRT)' : 'Non significatif'}</div>
      <div><span>ΔAIC</span><strong class:good={dAIC < 0}>{dAIC >= 0 ? '+' : ''}{dAIC.toFixed(1)}</strong></div>
      <div><span>ΔBIC</span><strong class:good={dBIC < 0}>{dBIC >= 0 ? '+' : ''}{dBIC.toFixed(1)}</strong></div>
    </div>
    <p class="hint">ΔOFV à droite du seuil = le modèle plus riche vaut la peine (LRT). AIC/BIC négatifs = ils confirment ; le BIC pénalise plus fort quand n est grand.</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Loi du χ² et statistique observée">
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      {#if reject}<path d={reject} class="reject" />{/if}
      <path d={curve} class="dens" />
      <line x1={xt(seuil)} x2={xt(seuil)} y1="0" y2={iH} class="crit" />
      <text x={xt(seuil)} y="10" class="critlbl">seuil {seuil.toFixed(1)}</text>
      <line x1={xt(dOFV)} x2={xt(dOFV)} y1="0" y2={iH} class="obs" class:ok={significatif} />
      <text x={xt(dOFV)} y={iH - 6} class="obslbl" class:ok={significatif}>ΔOFV</text>
      <text x={iW / 2} y={iH + 32} class="lbl">χ² (Δdf = {ddf})</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --valid: #8a7d3a; }
  @media (min-width: 720px) { .wrap { grid-template-columns: 220px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--valid); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div:not(.verdict) { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .readout strong.good { color: var(--accent-pd); }
  .verdict { margin: 2px 0; padding: 3px 6px; border-radius: var(--radius); text-align: center; font-weight: 600; }
  .verdict.ok { background: var(--quiz-success-bg); color: var(--quiz-success-text); }
  .verdict.no { background: var(--bg-tertiary); color: var(--text-secondary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .dens { fill: none; stroke: var(--valid); stroke-width: 2.4; }
  .reject { fill: #b0392b; opacity: 0.15; }
  .crit { stroke: #b0392b; stroke-width: 1.4; stroke-dasharray: 3 3; }
  .critlbl { fill: #b0392b; font-family: var(--font-mono); font-size: 9px; text-anchor: middle; }
  .obs { stroke: var(--text-muted); stroke-width: 2; }
  .obs.ok { stroke: var(--accent-pd); }
  .obslbl { fill: var(--text-muted); font-family: var(--font-mono); font-size: 9px; text-anchor: middle; }
  .obslbl.ok { fill: var(--accent-pd); }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
</style>

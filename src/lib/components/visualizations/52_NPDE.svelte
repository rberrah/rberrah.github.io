<script>
  // NPDE : les erreurs de prédiction normalisées doivent suivre une loi N(0,1)
  // si le modèle est correct. Un curseur de mauvaise spécification décale/étale
  // la distribution — l'écart à la gaussienne standard signale un problème.
  let mis = 0; // 0 = modèle correct ; augmente le décalage/étalement
  import { language } from '$lib/stores/language';

  /** @param {number} a @returns {() => number} */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /** @param {() => number} r @returns {number} */
  function gauss(r) { return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r()); }

  const N = 600;
  /** @type {number[]} */
  const g0 = [];
  const rng = mulberry32(31);
  for (let i = 0; i < N; i++) g0.push(gauss(rng));

  $: shift = mis * 0.9;
  $: infl = 1 + mis * 0.8;
  $: npde = g0.map((g) => shift + infl * g);
  $: mean = npde.reduce((a, b) => a + b, 0) / N;
  $: sd = Math.sqrt(npde.reduce((a, b) => a + (b - mean) ** 2, 0) / N);

  const nBins = 30, lo = -4, hi = 4;
  $: bins = (() => {
    const arr = new Array(nBins).fill(0);
    for (const v of npde) {
      const idx = Math.floor(((v - lo) / (hi - lo)) * nBins);
      if (idx >= 0 && idx < nBins) arr[idx]++;
    }
    return arr;
  })();
  const binW = (hi - lo) / nBins;
  // densité N(0,1) mise à l'échelle des effectifs
  /** @param {number} x @returns {number} */
  const phi = (x) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  $: bMax = Math.max(...bins, N * phi(0) * binW);

  const W = 480, H = 260, m = { top: 14, right: 14, bottom: 40, left: 40 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  $: bx = (/** @type {number} */ v) => ((v - lo) / (hi - lo)) * iW;
  $: normPath = Array.from({ length: 81 }, (_, i) => {
    const x = lo + (i / 80) * (hi - lo);
    const y = N * phi(x) * binW;
    return `${i ? 'L' : 'M'}${bx(x).toFixed(1)},${(iH - (y / bMax) * iH).toFixed(1)}`;
  }).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>{$language === 'en' ? 'Misspecification' : 'Mauvaise spécification'}</span><strong>{(mis * 100).toFixed(0)}%</strong><input type="range" min="0" max="1" step="0.05" bind:value={mis} /></label>
    <div class="readout">
      <div><span>{$language === 'en' ? 'Mean (target 0)' : 'Moyenne (cible 0)'}</span><strong>{mean.toFixed(2)}</strong></div>
      <div><span>{$language === 'en' ? 'SD (target 1)' : 'Écart-type (cible 1)'}</span><strong>{sd.toFixed(2)}</strong></div>
      <div class="verdict" class:ok={Math.abs(mean) < 0.15 && Math.abs(sd - 1) < 0.15} class:bad={Math.abs(mean) > 0.4 || Math.abs(sd - 1) > 0.4}>{Math.abs(mean) < 0.15 && Math.abs(sd - 1) < 0.15 ? 'Compatible N(0,1)' : ($language === 'en' ? 'Departure from N(0,1)' : 'Écart à N(0,1)')}</div>
    </div>
    <p class="hint">{$language === 'en' ? 'With a correct model, NPDE follow the standard Gaussian curve. A shifted mean or incorrect standard deviation reveals misspecification.' : "Si le modèle est correct, les NPDE suivent la gaussienne standard (courbe). Un décalage de la moyenne ou un étalement de l'écart-type révèle une mauvaise spécification."}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'NPDE distribution vs N(0,1)' : 'Distribution des NPDE vs N(0,1)'}>
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      {#each bins as b, i}
        <rect x={(i / nBins) * iW + 1} y={iH - (b / bMax) * iH} width={iW / nBins - 2} height={(b / bMax) * iH} class="bar" />
      {/each}
      <path d={normPath} class="norm" />
      <line x1={bx(0)} x2={bx(0)} y1="0" y2={iH} class="zero" />
      <text x={iW / 2} y={iH + 32} class="lbl">NPDE</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --valid: #8a7d3a; }
  @media (min-width: 720px) { .wrap { grid-template-columns: 215px 1fr; align-items: center; } }
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
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
  .verdict { margin-top: 2px; padding: 3px 6px; border-radius: var(--radius); text-align: center; font-weight: 600; background: var(--bg-tertiary); color: var(--text-secondary); }
  .verdict.ok { background: var(--quiz-success-bg); color: var(--quiz-success-text); }
  .verdict.bad { background: var(--quiz-error-bg); color: var(--quiz-error-text); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .bar { fill: var(--valid); opacity: 0.5; }
  .norm { fill: none; stroke: var(--accent-pk); stroke-width: 2.2; }
  .zero { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 2 3; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
</style>

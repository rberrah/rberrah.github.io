<script>
  import { language } from '#lib/stores/language.js';
  import { fitLinearSvm } from '#lib/science/visualizationMath.js';
  // Illustration conceptuelle d'un SVM linéaire : deux classes, un hyperplan séparateur
  // à MARGE MAXIMALE, et les vecteurs de support (points dans la marge). Le paramètre C
  // arbitre marge large (soft, tolérante) vs marge étroite (hard, peu tolérante).
  let C = 1; // régularisation : grand C = marge étroite
  let separation = 3.6;

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

  const rnd = mulberry32(11);
  const sd = 1.05;
  /** @type {{nx:number,ny:number,c:number}[]} */
  const base = [];
  for (let i = 0; i < 18; i++) base.push({ nx: gauss(rnd), ny: gauss(rnd), c: 1 });
  for (let i = 0; i < 18; i++) base.push({ nx: gauss(rnd), ny: gauss(rnd), c: -1 });
  $: pts = base.map((point) => ({
    x: 5 - point.c * separation / 2 + point.nx * sd,
    y: 5 + point.c * separation / 2 + point.ny * sd,
    c: point.c
  }));

  $: svm = fitLinearSvm(pts, C);
  $: support = pts.filter((p) => p.c * svm.score(p) <= 1.03);
  $: errors = pts.filter((p) => p.c * svm.score(p) <= 0).length;

  const W = 360, H = 320, mrg = { top: 14, right: 14, bottom: 34, left: 34 };
  $: iW = W - mrg.left - mrg.right;
  $: iH = H - mrg.top - mrg.bottom;
  $: sx = (/** @type {number} */ x) => (x / 10) * iW;
  $: sy = (/** @type {number} */ y) => iH - (y / 10) * iH;

  // Frontière score=0 et marges fonctionnelles score=±1 du SVM ajusté.
  /** @param {number} level @returns {string} */
  function lineFor(level) {
    /** @param {number} X @returns {number} */
    const Y = (X) => 5 + (5 * (level - svm.b) - svm.wx * (X - 5)) / svm.wy;
    return `M${sx(0).toFixed(1)},${sy(Y(0)).toFixed(1)} L${sx(10).toFixed(1)},${sy(Y(10)).toFixed(1)}`;
  }
</script>

<div class="wrap" data-testid="svm-margin-lab">
  <div class="controls">
    <label class="s"><span>{$language === 'en' ? 'Regularization C' : 'Régularisation C'}</span><strong>{C.toFixed(1)}</strong><input type="range" min="0.2" max="8" step="0.2" bind:value={C} /></label>
    <label class="s"><span>{$language === 'en' ? 'Class separation' : 'Séparation des classes'}</span><strong>{separation.toFixed(1)}</strong><input type="range" min="1" max="5" step="0.2" bind:value={separation} /></label>
    <div class="readout">
      <div><span>{$language === 'en' ? 'Training errors' : 'Erreurs d’apprentissage'}</span><strong>{errors}</strong></div>
      <div><span>{$language === 'en' ? 'Support vectors' : 'Vecteurs de support'}</span><strong>{support.length}</strong></div>
    </div>
    <p class="hint">{#if $language === 'en'}Reduce class separation, then compare small and large C. Points on or inside the margin, including violations, are approximate <em>support vectors</em> here; training error is not future performance.{:else}Réduisez la séparation, puis comparez un C petit et un C grand. Les points sur ou dans la marge, violations comprises, sont ici des <em>vecteurs de support</em> approximatifs ; l’erreur d’apprentissage n’est pas la performance future.{/if}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Maximum-margin SVM boundary' : 'Frontière SVM à marge maximale'}>
    <g transform={`translate(${mrg.left},${mrg.top})`}>
      <clipPath id="svmbox"><rect x="0" y="0" width={iW} height={iH} /></clipPath>
      <rect x="0" y="0" width={iW} height={iH} class="frame" />
      <g clip-path="url(#svmbox)">
        <path d={lineFor(1)} class="margin" />
        <path d={lineFor(-1)} class="margin" />
        <path d={lineFor(0)} class="boundary" />
      </g>
      {#each pts as p}
        <circle cx={sx(p.x)} cy={sy(p.y)} r={support.includes(p) ? 5 : 3.5}
          class:pos={p.c === 1} class:neg={p.c === -1} class:sv={support.includes(p)} />
      {/each}
      <text x={iW / 2} y={iH + 26} class="lbl">{$language === 'en' ? 'Covariate 1' : 'Covariable 1'}</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 220px 1fr; align-items: center; } }
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-ai); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; max-width: 360px; }
  .frame { fill: none; stroke: var(--border-strong); stroke-width: 1; }
  .boundary { stroke: var(--accent-ai); stroke-width: 2.4; }
  .margin { stroke: var(--accent-ai); stroke-width: 1; stroke-dasharray: 4 4; opacity: 0.7; }
  .pos { fill: var(--accent-pk); }
  .neg { fill: var(--accent-pd); }
  .sv { stroke: var(--text-primary); stroke-width: 1.6; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
</style>

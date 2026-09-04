<script>
  import { language } from '$lib/stores/language';
  // Graphiques diagnostiques (GOF) : observations vs prédictions + résidus (CWRES).
  // Un curseur de « mauvaise spécification » montre à quoi ressemble un bon vs un
  // mauvais ajustement : nuage sur la diagonale et CWRES centrés = bon modèle.
  let mis = 0; // 0 = bon modèle, 1 = fortement mal spécifié

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

  const N = 48, sd = 0.2, maxV = 100;
  /** @type {{tru:number,g:number}[]} */
  const base = [];
  const rng = mulberry32(9);
  for (let i = 0; i < N; i++) {
    const tru = 3 + Math.pow(10, (i / (N - 1)) * 2); // ~3..103
    base.push({ tru, g: gauss(rng) });
  }

  $: rows = base.map((b) => {
    const pred = b.tru * (1 - mis * 0.45 * (b.tru / maxV)); // le modèle sous-prédit les fortes valeurs
    const obs = b.tru * Math.exp(sd * b.g);
    const cwres = (Math.log(obs) - Math.log(pred)) / sd;
    return { pred, obs, cwres };
  });

  const W = 480, H = 250, pad = 34, gap = 26;
  $: pw = (W - gap) / 2 - pad; // largeur d'un panneau
  $: ph = H - 2 * pad;
  const dMax = 130;
  $: dx = (/** @type {number} */ v) => pad + (Math.min(v, dMax) / dMax) * pw;
  $: dyv = (/** @type {number} */ v) => pad + ph - (Math.min(v, dMax) / dMax) * ph;
  // panneau 2 (CWRES)
  $: p2x0 = pad + pw + gap;
  $: c2x = (/** @type {number} */ v) => p2x0 + (Math.min(v, dMax) / dMax) * pw;
  const cwMax = 5;
  $: c2y = (/** @type {number} */ r) => pad + ph / 2 - (Math.max(-cwMax, Math.min(cwMax, r)) / cwMax) * (ph / 2);
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>{$language === 'en' ? 'Misspecification' : 'Mauvaise spécification'}</span><strong>{(mis * 100).toFixed(0)}%</strong><input type="range" min="0" max="1" step="0.05" bind:value={mis} /></label>
    <div class="readout">
      <div class="verdict" class:ok={mis < 0.2} class:bad={mis >= 0.5}>{mis < 0.2 ? ($language === 'en' ? 'Good fit' : 'Bon ajustement') : mis >= 0.5 ? ($language === 'en' ? 'Biased model' : 'Modèle biaisé') : ($language === 'en' ? 'Monitor' : 'À surveiller')}</div>
    </div>
    <p class="hint">{$language === 'en' ? 'Good model: points follow the diagonal on the left and CWRES are centered on zero without a trend on the right. Increase misspecification to reveal systematic bias at high values.' : 'Bon modèle : nuage sur la diagonale (gauche) et CWRES centrés sur 0 sans tendance (droite). Augmentez le curseur : un biais systématique apparaît aux fortes valeurs.'}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Diagnostic plots' : 'Graphiques diagnostiques'}>
    <!-- Panneau 1 : DV vs PRED -->
    <line x1={pad} y1={pad + ph} x2={pad + pw} y2={pad + ph} class="axis" />
    <line x1={pad} y1={pad} x2={pad} y2={pad + ph} class="axis" />
    <line x1={dx(0)} y1={dyv(0)} x2={dx(dMax)} y2={dyv(dMax)} class="ident" />
    {#each rows as r}<circle cx={dx(r.pred)} cy={dyv(r.obs)} r="3" class="pt" />{/each}
    <text x={pad + pw / 2} y={H - 8} class="lbl">{$language === 'en' ? 'Predictions (PRED)' : 'Prédictions (PRED)'}</text>
    <text transform={`translate(${pad - 22},${pad + ph / 2}) rotate(-90)`} class="lbl">Obs (DV)</text>

    <!-- Panneau 2 : CWRES vs PRED -->
    <line x1={p2x0} y1={pad + ph} x2={p2x0 + pw} y2={pad + ph} class="axis" />
    <line x1={p2x0} y1={pad} x2={p2x0} y2={pad + ph} class="axis" />
    <line x1={p2x0} y1={c2y(0)} x2={p2x0 + pw} y2={c2y(0)} class="zero" />
    <line x1={p2x0} y1={c2y(2)} x2={p2x0 + pw} y2={c2y(2)} class="band" />
    <line x1={p2x0} y1={c2y(-2)} x2={p2x0 + pw} y2={c2y(-2)} class="band" />
    {#each rows as r}<circle cx={c2x(r.pred)} cy={c2y(r.cwres)} r="3" class="pt" />{/each}
    <text x={p2x0 + pw / 2} y={H - 8} class="lbl">{$language === 'en' ? 'Predictions (PRED)' : 'Prédictions (PRED)'}</text>
    <text transform={`translate(${p2x0 - 22},${pad + ph / 2}) rotate(-90)`} class="lbl">CWRES</text>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --valid: #8a7d3a; }
  @media (min-width: 760px) { .wrap { grid-template-columns: 210px 1fr; align-items: center; } }
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--valid); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; }
  .verdict { padding: 4px 8px; border-radius: var(--radius); text-align: center; font-weight: 600; font-size: var(--text-xs); background: var(--bg-secondary); color: var(--text-secondary); }
  .verdict.ok { background: var(--quiz-success-bg); color: var(--quiz-success-text); }
  .verdict.bad { background: var(--quiz-error-bg); color: var(--quiz-error-text); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .ident { stroke: var(--text-muted); stroke-width: 1.2; stroke-dasharray: 4 4; }
  .zero { stroke: var(--valid); stroke-width: 1.4; }
  .band { stroke: var(--border-subtle); stroke-width: 1; stroke-dasharray: 2 3; }
  .pt { fill: var(--valid); opacity: 0.7; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; text-anchor: middle; }
</style>

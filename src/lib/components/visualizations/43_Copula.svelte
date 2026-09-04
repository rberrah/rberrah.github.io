<script>
  import { language } from '$lib/stores/language';
  // Copule gaussienne : deux covariables (poids, ClCr) avec des marges FIXES mais une
  // DÉPENDANCE réglable. On génère (z1, z2) normaux, puis z2' = ρ·z1 + √(1−ρ²)·z2.
  // Les histogrammes marginaux ne changent pas ; seule la corrélation change.
  let rho = 0.6;

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

  const Npts = 160;
  /** @type {{z1:number,z2:number}[]} */
  const base = [];
  const rng = mulberry32(23);
  for (let i = 0; i < Npts; i++) base.push({ z1: gauss(rng), z2: gauss(rng) });

  // marges : poids ~ N(75,14), ClCr ~ N(95,28)
  $: pts = base.map((b) => {
    const zc = rho * b.z1 + Math.sqrt(Math.max(0, 1 - rho * rho)) * b.z2;
    return { x: 75 + 14 * b.z1, y: 95 + 28 * zc };
  });

  const W = 360, H = 320, m = { top: 14, right: 14, bottom: 40, left: 46 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const xDom = [30, 120], yDom = [10, 180];
  $: sx = (/** @type {number} */ x) => ((x - xDom[0]) / (xDom[1] - xDom[0])) * iW;
  $: sy = (/** @type {number} */ y) => iH - ((y - yDom[0]) / (yDom[1] - yDom[0])) * iH;
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>{$language === 'en' ? 'Correlation ρ' : 'Corrélation ρ'}</span><strong>{rho.toFixed(2)}</strong><input type="range" min="-0.9" max="0.9" step="0.05" bind:value={rho} /></label>
    <div class="readout">
      <div><span>{$language === 'en' ? 'Dependence' : 'Dépendance'}</span><strong>{Math.abs(rho) < 0.15 ? ($language === 'en' ? 'almost none' : 'quasi nulle') : rho > 0 ? 'positive' : ($language === 'en' ? 'negative' : 'négative')}</strong></div>
      <div><span>{$language === 'en' ? 'Marginals' : 'Marges'}</span><strong>{$language === 'en' ? 'unchanged' : 'inchangées'}</strong></div>
    </div>
    <p class="hint">{#if $language === 'en'}A copula describes <em>dependence</em> between covariates independently of their marginal distributions. Here, weight and CrCl histograms remain unchanged; only their relationship changes.{:else}Une copule décrit la <em>dépendance</em> entre covariables indépendamment de leurs lois marginales. Ici les histogrammes de poids et de ClCr restent identiques ; seul leur lien change.{/if}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Correlated covariate scatter plot' : 'Nuage de covariables corrélées'}>
    <g transform={`translate(${m.left},${m.top})`}>
      <rect x="0" y="0" width={iW} height={iH} class="frame" />
      {#each pts as p}<circle cx={sx(p.x)} cy={sy(p.y)} r="3" class="pt" />{/each}
      <text x={iW / 2} y={iH + 28} class="lbl">{$language === 'en' ? 'Weight (kg)' : 'Poids (kg)'}</text>
      <text transform={`translate(-32,${iH / 2}) rotate(-90)`} class="lbl">ClCr (mL/min)</text>
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
  .s strong { color: #5b6b7a; }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; max-width: 360px; }
  .frame { fill: none; stroke: var(--border-strong); stroke-width: 1; }
  .pt { fill: #5b6b7a; opacity: 0.65; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
</style>

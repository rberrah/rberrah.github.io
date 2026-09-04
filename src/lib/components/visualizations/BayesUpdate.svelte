<script>
  import { language } from '$lib/stores/language';
  // Mise à jour bayésienne (conjuguée gaussienne) sur un paramètre individuel,
  // ex. la clairance CL d'un patient :
  //   a priori  N(CLpop, ω²)   ×   vraisemblance  N(mesure, σ²)   →   a posteriori
  // Données faibles (σ grand) ⇒ l'a posteriori reste près de la population : shrinkage.
  let clPop = 5; // a priori : clairance typique (population)
  let omega = 1.5; // écart-type a priori (IIV)
  let obs = 8; // clairance suggérée par la mesure du patient
  let sigma = 1.0; // incertitude des données (petit = données riches)

  const W = 470, H = 300, m = { top: 16, right: 14, bottom: 44, left: 32 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;

  // a posteriori conjugué
  $: prec0 = 1 / (omega * omega);
  $: precD = 1 / (sigma * sigma);
  $: muPost = (clPop * prec0 + obs * precD) / (prec0 + precD);
  $: sdPost = Math.sqrt(1 / (prec0 + precD));
  $: shrink = prec0 / (prec0 + precD); // part tirée vers la population

  $: thMax = Math.max(clPop + 3 * omega, obs + 3 * sigma, muPost + 3 * sdPost) * 1.02;
  const NP = 220;
  /** @param {number} th @param {number} mu @param {number} s */
  function g(th, mu, s) {
    return Math.exp(-0.5 * ((th - mu) / s) ** 2); // pic normalisé à 1
  }
  $: xt = (/** @type {number} */ th) => (th / thMax) * iW;
  $: yv = (/** @type {number} */ v) => iH - v * iH;
  /** @param {(th:number)=>number} fn */
  function pathOf(fn) {
    let d = '';
    for (let i = 0; i <= NP; i++) {
      const th = (i / NP) * thMax;
      d += `${i ? 'L' : 'M'}${xt(th).toFixed(1)},${yv(fn(th)).toFixed(1)}`;
    }
    return d;
  }
  $: priorPath = pathOf((th) => g(th, clPop, omega));
  $: likePath = pathOf((th) => g(th, obs, sigma));
  $: postPath = pathOf((th) => g(th, muPost, sdPost));
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>CLpop (a priori)</span><strong>{clPop.toFixed(1)}</strong><input type="range" min="2" max="12" step="0.5" bind:value={clPop} /></label>
    <label class="s"><span>ω (IIV a priori)</span><strong>{omega.toFixed(1)}</strong><input type="range" min="0.5" max="4" step="0.1" bind:value={omega} /></label>
    <label class="s"><span>{$language === 'en' ? 'Patient measurement' : 'Mesure patient'}</span><strong>{obs.toFixed(1)}</strong><input type="range" min="2" max="14" step="0.5" bind:value={obs} /></label>
    <label class="s"><span>σ ({$language === 'en' ? 'data uncertainty' : 'incert. données'})</span><strong>{sigma.toFixed(1)}</strong><input type="range" min="0.3" max="4" step="0.1" bind:value={sigma} /></label>
    <div class="readout">
      <div><span>{$language === 'en' ? 'Posterior CL' : 'CL a posteriori'}</span><strong>{muPost.toFixed(2)}</strong></div>
      <div><span>Shrinkage</span><strong>{(shrink * 100).toFixed(0)} %</strong></div>
    </div>
    <p class="hint">{#if $language === 'en'}Increase σ for sparse or imprecise data: the likelihood flattens and the posterior returns toward the population. This is <em>shrinkage</em>.{:else}Augmentez σ (données pauvres) : la vraisemblance s'aplatit, l'a posteriori revient vers la population — c'est le <em>shrinkage</em>.{/if}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Prior, likelihood and posterior' : 'A priori, vraisemblance et a posteriori'}>
    <g transform={`translate(${m.left},${m.top})`}>
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <path d={priorPath} class="prior" />
      <path d={likePath} class="like" />
      <path d={postPath} class="post" />
      <line x1={xt(clPop)} x2={xt(clPop)} y1={yv(1)} y2={iH} class="mk prior" />
      <line x1={xt(obs)} x2={xt(obs)} y1={yv(1)} y2={iH} class="mk like" />
      <line x1={xt(muPost)} x2={xt(muPost)} y1={yv(1)} y2={iH} class="mk post" />
      <text x={iW / 2} y={iH + 34} class="lbl">{$language === 'en' ? 'Clearance CL (L/h)' : 'Clairance CL (L/h)'}</text>
      <g class="legend" transform="translate(6,2)">
        <rect x="0" y="0" width="12" height="3" class="prior" /><text x="17" y="4" class="leg">{$language === 'en' ? 'prior (pop.)' : 'a priori (pop.)'}</text>
        <rect x="0" y="15" width="12" height="3" class="like" /><text x="17" y="19" class="leg">{$language === 'en' ? 'likelihood' : 'vraisemblance'}</text>
        <rect x="0" y="30" width="12" height="3" class="post" /><text x="17" y="34" class="leg">{$language === 'en' ? 'posterior' : 'a posteriori'}</text>
      </g>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 210px 1fr; align-items: center; } }
  /* Le panneau de chapitre fait ~610 px meme sur grand ecran : on interroge le CONTENEUR,
     pas la fenetre, sinon les controles ecrasent la figure. */
  @container (max-width: 700px) { .wrap { grid-template-columns: 1fr; align-items: stretch; } }
  .controls { display: grid; gap: var(--space-2); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-family: var(--font-mono); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-pd); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 2px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-family: var(--font-mono); font-size: var(--text-xs); }
  .readout div { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  path.prior { fill: none; stroke: var(--text-muted); stroke-width: 2; stroke-dasharray: 5 4; }
  path.like { fill: none; stroke: var(--accent-pk); stroke-width: 2; }
  path.post { fill: none; stroke: var(--accent-pd); stroke-width: 3; }
  .mk { stroke-width: 1; opacity: 0.5; }
  line.mk.prior { stroke: var(--text-muted); stroke-dasharray: 2 3; }
  line.mk.like { stroke: var(--accent-pk); stroke-dasharray: 2 3; }
  line.mk.post { stroke: var(--accent-pd); }
  rect.prior { fill: var(--text-muted); }
  rect.like { fill: var(--accent-pk); }
  rect.post { fill: var(--accent-pd); }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; text-anchor: middle; }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
</style>

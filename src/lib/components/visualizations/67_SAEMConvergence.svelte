<script>
  import { language } from '$lib/stores/language';
  // SAEM = approximation stochastique en deux phases. On suit un paramètre de population
  // (ex. CL_pop) au fil des itérations. Phase 1 « exploratoire » (pas constant) : la valeur
  // saute autour de la vraie (les η sont simulés au hasard). Phase 2 « lissage » (pas
  // décroissant γ_k) : la moyenne se resserre et converge vers le vrai maximum de vraisemblance.
  let K1 = 40; // itération de passage phase exploratoire → lissage
  let seed = 3; // graine (montre le caractère stochastique)

  const Kmax = 90, thetaStar = 5, theta0 = 2, sigma = 0.8;

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

  $: trace = (() => {
    const r = mulberry32(seed * 101 + 7);
    let theta = theta0;
    const pts = [{ k: 0, v: theta }];
    for (let k = 1; k <= Kmax; k++) {
      const target = thetaStar + sigma * gauss(r); // « E-step » : estimation bruitée
      const gamma = k < K1 ? 1 : 1 / (k - K1 + 1); // approximation stochastique
      theta = theta + gamma * (target - theta);
      pts.push({ k, v: theta });
    }
    return pts;
  })();
  $: finalV = trace[trace.length - 1].v;

  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 40, left: 44 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const yLo = 0, yHi = 9;
  $: xk = (/** @type {number} */ k) => (k / Kmax) * iW;
  $: yv = (/** @type {number} */ v) => iH - ((Math.max(yLo, Math.min(v, yHi)) - yLo) / (yHi - yLo)) * iH;
  $: path = trace.map((p, i) => `${i ? 'L' : 'M'}${xk(p.k).toFixed(1)},${yv(p.v).toFixed(1)}`).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>{$language === 'en' ? 'Smoothing starts at K₁' : 'Passage lissage K₁'}</span><strong>{K1}</strong><input type="range" min="15" max="70" step="5" bind:value={K1} /></label>
    <label class="s"><span>{$language === 'en' ? 'Random seed' : 'Graine (aléa)'}</span><strong>{seed}</strong><input type="range" min="1" max="12" step="1" bind:value={seed} /></label>
    <div class="readout">
      <div><span>{$language === 'en' ? 'True value θ*' : 'Vraie valeur θ*'}</span><strong>{thetaStar.toFixed(1)}</strong></div>
      <div><span>{$language === 'en' ? 'Final estimate' : 'Estimation finale'}</span><strong>{finalV.toFixed(2)}</strong></div>
      <div class="verdict" class:ok={Math.abs(finalV - thetaStar) < 0.3}>{Math.abs(finalV - thetaStar) < 0.3 ? ($language === 'en' ? 'Converged to θ*' : 'Convergé vers θ*') : ($language === 'en' ? 'Not yet converged' : 'Pas encore convergé')}</div>
    </div>
    <p class="hint">{#if $language === 'en'}Phase 1 explores: the value <em>jumps</em> around θ* using simulated η. Phase 2 smooths with decreasing steps and <em>converges</em>. Change the seed: a different path, the same destination.{:else}Phase 1 (exploratoire) : la valeur <em>saute</em> autour de θ* (η simulés). Phase 2 (lissage, pas décroissant) : elle <em>converge</em>. Changez la graine : chemin différent, même destination.{/if}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Two-phase SAEM convergence' : 'Convergence du SAEM en deux phases'}>
    <g transform={`translate(${m.left},${m.top})`}>
      <rect x="0" y="0" width={xk(K1)} height={iH} class="phase1" />
      <text x="6" y="12" class="phaselbl">{$language === 'en' ? 'exploration' : 'exploratoire'}</text>
      <text x={xk(K1) + 6} y="12" class="phaselbl">{$language === 'en' ? 'smoothing' : 'lissage'}</text>
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={yv(thetaStar)} y2={yv(thetaStar)} class="truth" />
      <text x={iW - 2} y={yv(thetaStar) - 4} class="truthlbl">θ*</text>
      <line x1={xk(K1)} x2={xk(K1)} y1="0" y2={iH} class="sep" />
      <path d={path} class="trace" />
      <text x={iW / 2} y={iH + 32} class="lbl">{$language === 'en' ? 'SAEM iterations' : 'Itérations SAEM'}</text>
      <text transform={`translate(-32,${iH / 2}) rotate(-90)`} class="lbl">{$language === 'en' ? 'Parameter θ (e.g. CL_pop)' : 'Paramètre θ (ex. CL_pop)'}</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 215px 1fr; align-items: center; } }
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
  .readout div:not(.verdict) { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .verdict { margin-top: 2px; padding: 3px 6px; border-radius: var(--radius); text-align: center; font-weight: 600; background: var(--bg-tertiary); color: var(--text-secondary); }
  .verdict.ok { background: var(--quiz-success-bg); color: var(--quiz-success-text); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .phase1 { fill: var(--accent-ai); opacity: 0.06; }
  .phaselbl { fill: var(--text-muted); font-family: var(--font-mono); font-size: 9px; }
  .truth { stroke: var(--accent-pd); stroke-width: 1.4; stroke-dasharray: 4 3; }
  .truthlbl { fill: var(--accent-pd); font-family: var(--font-mono); font-size: 10px; text-anchor: end; }
  .sep { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 2 3; }
  .trace { fill: none; stroke: var(--accent-ai); stroke-width: 2; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
</style>

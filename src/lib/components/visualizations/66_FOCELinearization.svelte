<script>
  import { language } from '$lib/stores/language';
  // FOCE = linéarisation. Le paramètre individuel est non linéaire en η (ex. CL = CL_pop·e^η).
  // FOCE remplace cette COURBE par sa TANGENTE autour de l'estimation individuelle η̂ :
  // exact au point, mais l'erreur grandit quand la courbure (non-linéarité) augmente.
  let b = 0.6; // courbure : degré de non-linéarité
  let etahat = 0.0; // point de linéarisation (estimation individuelle η̂)

  const base = 4; // CL_pop
  /** @param {number} eta @returns {number} */
  const f = (eta) => base * Math.exp(b * eta); // vraie fonction
  /** @param {number} eta @returns {number} */
  const tangent = (eta) => f(etahat) + base * b * Math.exp(b * etahat) * (eta - etahat);

  // erreur relative de l'approximation à un écart de +1 écart-type d'η
  $: errPct = Math.abs((tangent(etahat + 1) - f(etahat + 1)) / f(etahat + 1)) * 100;

  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 40, left: 44 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const xLo = -2.5, xHi = 2.5, yMax = 26;
  $: sx = (/** @type {number} */ x) => ((x - xLo) / (xHi - xLo)) * iW;
  $: sy = (/** @type {number} */ y) => iH - (Math.max(0, Math.min(y, yMax)) / yMax) * iH;
  $: grid = Array.from({ length: 121 }, (_, i) => xLo + (i / 120) * (xHi - xLo));
  $: curve = grid.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(f(x)).toFixed(1)}`).join(' ');
  $: tang = `M${sx(xLo).toFixed(1)},${sy(tangent(xLo)).toFixed(1)} L${sx(xHi).toFixed(1)},${sy(tangent(xHi)).toFixed(1)}`;
  // zone d'écart entre courbe et tangente
  $: gap = (() => {
    const top = grid.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(f(x)).toFixed(1)}`).join(' ');
    const bot = grid.slice().reverse().map((x) => `L${sx(x).toFixed(1)},${sy(tangent(x)).toFixed(1)}`).join(' ');
    return `${top} ${bot} Z`;
  })();
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>{$language === 'en' ? 'Curvature (nonlinearity)' : 'Courbure (non-linéarité)'}</span><strong>{b.toFixed(2)}</strong><input type="range" min="0.1" max="1.1" step="0.05" bind:value={b} /></label>
    <label class="s"><span>Point η̂</span><strong>{etahat.toFixed(1)}</strong><input type="range" min="-2" max="2" step="0.1" bind:value={etahat} /></label>
    <div class="readout">
      <div><span>{$language === 'en' ? 'Error at η̂+1' : 'Erreur à η̂+1'}</span><strong>{errPct.toFixed(0)} %</strong></div>
      <div class="verdict" class:bad={errPct > 25}>{errPct < 10 ? ($language === 'en' ? 'Accurate approximation' : 'Approximation fidèle') : errPct > 25 ? ($language === 'en' ? 'Poor approximation' : 'Approximation grossière') : ($language === 'en' ? 'Acceptable approximation' : 'Approximation acceptable')}</div>
    </div>
    <p class="hint">{#if $language === 'en'}FOCE replaces the <em>curve</em>, the true response in η, with its <em>tangent</em> at η̂. Increase curvature: away from η̂, the tangent diverges, explaining FOCE bias in highly nonlinear models.{:else}FOCE remplace la <em>courbe</em> (vraie réponse en η) par sa <em>tangente</em> en η̂. Montez la courbure : loin de η̂, la tangente s'écarte — d'où le biais de FOCE sur les modèles très non linéaires.{/if}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'FOCE linearization: curve and tangent' : 'Linéarisation FOCE : courbe et tangente'}>
    <g transform={`translate(${m.left},${m.top})`}>
      <path d={gap} class="gap" />
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <path d={curve} class="curve" />
      <path d={tang} class="tangent" />
      <line x1={sx(etahat)} x2={sx(etahat)} y1={sy(f(etahat))} y2={iH} class="guide" />
      <circle cx={sx(etahat)} cy={sy(f(etahat))} r="4.5" class="dot" />
      <text x={sx(etahat)} y={iH - 6} class="dotlbl">η̂</text>
      <text x={iW / 2} y={iH + 32} class="lbl">{$language === 'en' ? 'Random effect η' : 'Effet aléatoire η'}</text>
      <text transform={`translate(-32,${iH / 2}) rotate(-90)`} class="lbl">{$language === 'en' ? 'Parameter (e.g. CL)' : 'Paramètre (ex. CL)'}</text>
      <g class="legend" transform={`translate(6,2)`}>
        <rect x="0" y="0" width="12" height="3" class="curve" /><text x="18" y="4" class="leg">{$language === 'en' ? 'True function' : 'Vraie fonction'}</text>
        <rect x="0" y="14" width="12" height="3" class="tangent" /><text x="18" y="18" class="leg">{$language === 'en' ? 'Tangent (FOCE)' : 'Tangente (FOCE)'}</text>
      </g>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); --tools: #4d4d5c; }
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
  .verdict { margin-top: 2px; padding: 3px 6px; border-radius: var(--radius); text-align: center; font-weight: 600; background: var(--quiz-success-bg); color: var(--quiz-success-text); }
  .verdict.bad { background: var(--quiz-error-bg); color: var(--quiz-error-text); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .gap { fill: #b0392b; opacity: 0.12; }
  .curve { fill: none; stroke: var(--accent-ai); stroke-width: 2.6; }
  .tangent { fill: none; stroke: var(--accent-pk); stroke-width: 2; stroke-dasharray: 5 4; }
  .guide { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 2 3; }
  .dot { fill: var(--text-primary); }
  .dotlbl { fill: var(--text-primary); font-family: var(--font-mono); font-size: 10px; text-anchor: middle; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
</style>

<script>
  import { language } from '$lib/stores/language';
  // Modèle parent → métabolite (échelle semi-log).
  //   dApar/dt = −k·Apar          (parent, dose IV)
  //   dAmet/dt = fm·k·Apar − km·Amet   (formation depuis le parent, élimination km)
  // Régime clé : si km > k, la pente terminale du métabolite = k (limité par la FORMATION,
  // parallèle au parent) ; si km < k, elle = km (limité par l'ÉLIMINATION, il persiste).
  let k = 0.2; // constante d'élimination du parent (1/h)
  let km = 0.1; // constante d'élimination du métabolite (1/h)
  let fm = 0.6; // fraction du parent transformée en métabolite

  const V = 10, D = 100; // volumes égaux, dose IV
  const T = 48, dt = 0.1;

  /** @param {number} t @returns {number} */
  const cpar = (t) => (D / V) * Math.exp(-k * t);
  /** @param {number} t @returns {number} */
  function cmet(t) {
    if (Math.abs(km - k) < 1e-6) return (fm * k * D / V) * t * Math.exp(-k * t);
    return (fm * k * D) / (V * (km - k)) * (Math.exp(-k * t) - Math.exp(-km * t));
  }

  $: elimLimited = km < k; // le métabolite persiste après le parent
  $: thalfTerm = Math.log(2) / (elimLimited ? km : k);

  const W = 480, H = 300, m = { top: 16, right: 14, bottom: 40, left: 46 };
  $: iW = W - m.left - m.right;
  $: iH = H - m.top - m.bottom;
  const yTop = 2, yBot = -1; // log10
  $: xt = (/** @type {number} */ t) => (t / T) * iW;
  $: yv = (/** @type {number} */ c) => iH - ((Math.log10(Math.max(c, 1e-3)) - yBot) / (yTop - yBot)) * iH;
  $: grid = Array.from({ length: Math.round(T / dt) + 1 }, (_, i) => i * dt);
  $: pathPar = grid.map((t, i) => `${i ? 'L' : 'M'}${xt(t).toFixed(1)},${yv(cpar(t)).toFixed(1)}`).join(' ');
  $: pathMet = grid.map((t, i) => `${i ? 'L' : 'M'}${xt(t).toFixed(1)},${yv(cmet(t)).toFixed(1)}`).join(' ');
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>k parent (1/h)</span><strong>{k.toFixed(2)}</strong><input type="range" min="0.05" max="0.5" step="0.01" bind:value={k} /></label>
    <label class="s"><span>km {$language === 'en' ? 'metabolite' : 'métabolite'} (1/h)</span><strong>{km.toFixed(2)}</strong><input type="range" min="0.02" max="0.6" step="0.01" bind:value={km} /></label>
    <label class="s"><span>Fraction fm</span><strong>{fm.toFixed(1)}</strong><input type="range" min="0.1" max="1" step="0.05" bind:value={fm} /></label>
    <div class="readout">
      <div class="verdict">{elimLimited ? ($language === 'en' ? 'Elimination-rate limited' : 'Limité par l’élimination') : ($language === 'en' ? 'Formation-rate limited' : 'Limité par la formation')}</div>
      <div><span>{$language === 'en' ? 'Terminal slope ≈' : 'Pente terminale ≈'}</span><strong>{elimLimited ? 'km' : 'k'}</strong></div>
      <div><span>t½ terminal</span><strong>{thalfTerm.toFixed(0)} h</strong></div>
    </div>
    <p class="hint">{#if $language === 'en'}If km &lt; k, the metabolite <em>persists</em> after the parent and its slope equals km. If km &gt; k, it follows the parent with slope k: metabolite flip-flop.{:else}Si km &lt; k, le métabolite <em>persiste</em> après le parent (sa pente = km). Si km &gt; k, il suit le parent (pente = k) : « flip-flop » de métabolite.{/if}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Parent and metabolite kinetics on a log scale' : 'Cinétique parent et métabolite en échelle log'}>
    <g transform={`translate(${m.left},${m.top})`}>
      {#each [-1, 0, 1, 2] as g}
        <line x1="0" x2={iW} y1={yv(Math.pow(10, g))} y2={yv(Math.pow(10, g))} class="grid" />
        <text x="-6" y={yv(Math.pow(10, g)) + 3} class="tick">10^{g}</text>
      {/each}
      <line x1="0" x2="0" y1="0" y2={iH} class="axis" />
      <line x1="0" x2={iW} y1={iH} y2={iH} class="axis" />
      <path d={pathPar} class="par" />
      <path d={pathMet} class="met" />
      <text x={iW / 2} y={iH + 32} class="lbl">{$language === 'en' ? 'Time (h)' : 'Temps (h)'}</text>
      <text transform={`translate(-38,${iH / 2}) rotate(-90)`} class="lbl">Concentration (mg/L)</text>
      <g class="legend" transform={`translate(${iW - 116},2)`}>
        <rect x="0" y="0" width="12" height="3" class="par" /><text x="18" y="4" class="leg">Parent</text>
        <rect x="0" y="15" width="12" height="3" class="met" /><text x="18" y="19" class="leg">{$language === 'en' ? 'Metabolite' : 'Métabolite'}</text>
      </g>
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
  .s strong { color: var(--accent-pk); }
  .s input { grid-column: 1 / -1; }
  .readout { display: grid; gap: 3px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout div:not(.verdict) { display: flex; justify-content: space-between; gap: var(--space-2); }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .verdict { padding: 3px 6px; border-radius: var(--radius); text-align: center; font-weight: 600; background: var(--bg-tertiary); color: var(--text-secondary); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .grid { stroke: var(--border-subtle); stroke-width: 0.5; stroke-dasharray: 2 4; }
  .tick { fill: var(--text-muted); font-family: var(--font-mono); font-size: 8px; text-anchor: end; }
  .par { fill: none; stroke: var(--accent-pk); stroke-width: 2.6; }
  .met { fill: none; stroke: var(--accent-ai); stroke-width: 2.6; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
  .leg { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
</style>

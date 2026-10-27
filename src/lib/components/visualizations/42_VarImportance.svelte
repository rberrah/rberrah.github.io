<script>
  import { language } from '#lib/stores/language.js';
  // Importances synthétiques de répétitions d'ajustement. No forest is fitted here:
  // the experiment isolates thresholding and instability between correlated proxies.
  let threshold = 0.2;
  let correlated = false;
  let run = 0;

  const stable = [
    ['ClCr (rénal)', 0.84], ['Génotype CYP', 0.61], ['Âge', 0.45],
    ['Albumine', 0.30], ['Dose', 0.23], ['ALT', 0.14], ['Sexe', 0.09],
    ['Comédication', 0.06], ['Bruit A', 0.035], ['Bruit B', 0.02], ['Bruit C', 0.008]
  ];
  const weightAllocations = [[0.52, 0.40], [0.66, 0.27], [0.38, 0.55], [0.59, 0.34]];
  $: weightPair = correlated ? weightAllocations[run % weightAllocations.length] : [0.92, 0.03];
  $: vars = [
    { name: 'Poids', imp: weightPair[0] },
    { name: 'Proxy masse maigre', imp: weightPair[1] },
    ...stable.map(([name, value], index) => ({
      name,
      imp: Math.max(0, Math.min(1, Number(value) + 0.012 * Math.sin((run + 1) * (index + 2))))
    }))
  ].sort((a, b) => b.imp - a.imp);
  $: selected = vars.filter((v) => v.imp >= threshold);

  const W = 480, rowH = 21, mrg = { top: 14, right: 16, bottom: 34, left: 108 };
  $: H = mrg.top + mrg.bottom + vars.length * rowH;
  $: iW = W - mrg.left - mrg.right;
  const maxImp = 1;
  $: bw = (/** @type {number} */ v) => (v / maxImp) * iW;
  $: xThr = (threshold / maxImp) * iW;
</script>

<div class="wrap" data-testid="variable-importance-lab">
  <div class="controls">
    <label class="s"><span>{$language === 'en' ? 'Importance threshold' : "Seuil d'importance"}</span><strong>{threshold.toFixed(2)}</strong><input type="range" min="0" max="0.6" step="0.01" bind:value={threshold} /></label>
    <label class="toggle"><input type="checkbox" bind:checked={correlated} /> <span>{$language === 'en' ? 'Add a correlated weight proxy' : 'Ajouter un proxy corrélé au poids'}</span></label>
    <button type="button" on:click={() => (run += 1)}>{$language === 'en' ? 'Repeat synthetic fit' : "Répéter l’ajustement synthétique"}</button>
    <div class="readout">
      <div><span>{$language === 'en' ? 'Selected variables' : 'Variables retenues'}</span><strong>{selected.length} / {vars.length}</strong></div>
      <div class="chips">{#each selected as v}<span class="chip">{$language === 'en' ? ({ Poids: 'Weight', 'Proxy masse maigre': 'Lean-mass proxy', 'ClCr (rénal)': 'CrCl (renal)', 'Génotype CYP': 'CYP genotype', 'Âge': 'Age', Albumine: 'Albumin', Sexe: 'Sex', Comédication: 'Comedication', 'Bruit A': 'Noise A', 'Bruit B': 'Noise B', 'Bruit C': 'Noise C' }[v.name] ?? v.name) : v.name}</span>{/each}</div>
    </div>
    <p class="hint">{$language === 'en' ? 'These are constructed importances, not a fitted forest. With a correlated proxy, weight information is shared differently across repeats although the pair remains informative. Importance is neither a causal effect nor proof of biological relevance.' : 'Ces importances sont construites, sans forêt ajustée. Avec un proxy corrélé, l’information du poids se répartit différemment selon les répétitions alors que la paire reste informative. L’importance n’est ni un effet causal ni une preuve de pertinence biologique.'}</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label={$language === 'en' ? 'Variable importance' : 'Importance des variables'}>
    <g transform={`translate(${mrg.left},${mrg.top})`}>
      {#each vars as v, i}
        <text x="-8" y={i * rowH + rowH / 2 + 3} class="name" class:dim={v.imp < threshold}>{$language === 'en' ? ({ Poids: 'Weight', 'Proxy masse maigre': 'Lean-mass proxy', 'ClCr (rénal)': 'CrCl (renal)', 'Génotype CYP': 'CYP genotype', 'Âge': 'Age', Albumine: 'Albumin', Sexe: 'Sex', Comédication: 'Comedication', 'Bruit A': 'Noise A', 'Bruit B': 'Noise B', 'Bruit C': 'Noise C' }[v.name] ?? v.name) : v.name}</text>
        <rect x="0" y={i * rowH + 3} width={bw(v.imp)} height={rowH - 8} rx="2"
          class:keep={v.imp >= threshold} class:drop={v.imp < threshold} />
      {/each}
      <line x1={xThr} x2={xThr} y1="0" y2={vars.length * rowH} class="thr" />
      <text x={xThr} y={vars.length * rowH + 20} class="thrlbl">{$language === 'en' ? 'threshold' : 'seuil'}</text>
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
  .toggle { display: flex; gap: 7px; align-items: center; color: var(--text-secondary); font-size: var(--text-xs); }
  .toggle input { accent-color: var(--accent-ai); }
  button { border: 1px solid var(--border-strong); background: var(--bg-secondary); color: var(--text-primary); border-radius: var(--radius); padding: 7px 9px; cursor: pointer; font: inherit; font-size: var(--text-xs); }
  button:focus-visible, input:focus-visible { outline: 2px solid var(--accent-ai); outline-offset: 2px; }
  .readout { display: grid; gap: 4px; padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); font-size: var(--text-xs); }
  .readout > div:first-child { display: flex; justify-content: space-between; }
  .readout span { color: var(--text-secondary); }
  .readout strong { color: var(--text-primary); }
  .chips { display: flex; flex-wrap: wrap; gap: 3px; }
  .chip { background: var(--accent-ai); color: var(--bg-tertiary); border-radius: 10px; padding: 1px 7px; font-size: 10px; }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .chart { width: 100%; height: auto; }
  .name { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; text-anchor: end; }
  .name.dim { fill: var(--text-muted); opacity: 0.6; }
  .keep { fill: var(--accent-ai); }
  .drop { fill: var(--border-subtle); }
  .thr { stroke: var(--accent-pk); stroke-width: 1.5; stroke-dasharray: 3 3; }
  .thrlbl { fill: var(--accent-pk); font-family: var(--font-mono); font-size: 9px; text-anchor: middle; }
</style>

<script>
  // Sélection de variables par importance (esprit VSURF / OrdinalForest) :
  // une forêt attribue une IMPORTANCE à chaque covariable ; on garde celles au-dessus
  // d'un seuil. Le curseur montre le compromis pertinence vs bruit.
  let threshold = 0.2;

  /** @type {{name:string, imp:number}[]} */
  const vars = [
    { name: 'Poids', imp: 0.92 },
    { name: 'ClCr (rénal)', imp: 0.84 },
    { name: 'Génotype CYP', imp: 0.61 },
    { name: 'Âge', imp: 0.45 },
    { name: 'Albumine', imp: 0.30 },
    { name: 'Dose', imp: 0.23 },
    { name: 'ALT', imp: 0.14 },
    { name: 'Sexe', imp: 0.09 },
    { name: 'Comédication', imp: 0.06 },
    { name: 'Bruit A', imp: 0.035 },
    { name: 'Bruit B', imp: 0.02 },
    { name: 'Bruit C', imp: 0.008 }
  ];
  $: selected = vars.filter((v) => v.imp >= threshold);

  const W = 480, rowH = 21, mrg = { top: 14, right: 16, bottom: 34, left: 108 };
  $: H = mrg.top + mrg.bottom + vars.length * rowH;
  $: iW = W - mrg.left - mrg.right;
  const maxImp = 1;
  $: bw = (/** @type {number} */ v) => (v / maxImp) * iW;
  $: xThr = (threshold / maxImp) * iW;
</script>

<div class="wrap">
  <div class="controls">
    <label class="s"><span>Seuil d'importance</span><strong>{threshold.toFixed(2)}</strong><input type="range" min="0" max="0.6" step="0.01" bind:value={threshold} /></label>
    <div class="readout">
      <div><span>Variables retenues</span><strong>{selected.length} / {vars.length}</strong></div>
      <div class="chips">{#each selected as v}<span class="chip">{v.name}</span>{/each}</div>
    </div>
    <p class="hint">Trop bas → on garde du bruit (surajustement) ; trop haut → on perd des variables utiles. VSURF automatise ce tri en deux étapes (interprétation puis prédiction).</p>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Importance des variables">
    <g transform={`translate(${mrg.left},${mrg.top})`}>
      {#each vars as v, i}
        <text x="-8" y={i * rowH + rowH / 2 + 3} class="name" class:dim={v.imp < threshold}>{v.name}</text>
        <rect x="0" y={i * rowH + 3} width={bw(v.imp)} height={rowH - 8} rx="2"
          class:keep={v.imp >= threshold} class:drop={v.imp < threshold} />
      {/each}
      <line x1={xThr} x2={xThr} y1="0" y2={vars.length * rowH} class="thr" />
      <text x={xThr} y={vars.length * rowH + 20} class="thrlbl">seuil</text>
    </g>
  </svg>
</div>

<style>
  .wrap { display: grid; gap: var(--space-4); }
  @media (min-width: 720px) { .wrap { grid-template-columns: 220px 1fr; align-items: center; } }
  .controls { display: grid; gap: var(--space-2); }
  .readout, .s { font-family: var(--font-mono); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-size: var(--text-sm); }
  .s span { color: var(--text-secondary); }
  .s strong { color: var(--accent-ai); }
  .s input { grid-column: 1 / -1; }
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

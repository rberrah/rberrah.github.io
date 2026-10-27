<script>
  import { language } from '#lib/stores/language.js';
  import { makeValidationData, runValidationStrategy } from '#lib/science/validationSplitLab.js';

  const data = makeValidationData();
  const centers = [0, 1, 2];
  /** @type {'rows'|'patients'|'center'} */
  let strategy = 'rows';
  let revealed = false;

  $: result = runValidationStrategy(strategy);
  $: testRows = new Set(result.test.map((row) => `${row.patient}-${row.visit}`));
  $: trainPatients = new Set(result.train.map((row) => row.patient));
  $: sharedPatientCount = new Set(result.test.filter((row) => trainPatients.has(row.patient)).map((row) => row.patient)).size;
  $: aucValues = result.predictions.flatMap((row) => [row.auc, row.predicted]);
  $: aucMin = Math.floor((Math.min(...aucValues) - 4) / 10) * 10;
  $: aucMax = Math.ceil((Math.max(...aucValues) + 4) / 10) * 10;
  $: interpretation = strategy === 'rows'
    ? ($language === 'en'
      ? `A reproducible random row split (fixed seed) places ${sharedPatientCount} patients in both sets. Their visits resemble each other, so this score is optimistic for a future patient.`
      : `Une répartition aléatoire reproductible des lignes (graine fixe) place ${sharedPatientCount} patients dans les deux jeux. Leurs visites se ressemblent : ce score est optimiste pour un futur patient.`)
    : strategy === 'patients'
      ? ($language === 'en'
        ? 'All visits from each test patient are held out. This estimates internal generalization to new patients from the same centers.'
        : 'Toutes les visites d’un patient test restent hors apprentissage. On estime la généralisation interne à de nouveaux patients des mêmes centres.')
      : ($language === 'en'
        ? 'An entire center is absent from training. The larger error reflects the simulated center shift and probes transportability.'
        : 'Un centre entier est absent de l’apprentissage. L’erreur plus grande révèle le décalage simulé du centre et teste la transportabilité.');

  /** @param {'rows'|'patients'|'center'} next */
  function selectStrategy(next) {
    strategy = next;
    revealed = false;
  }

  const plot = { width: 480, height: 285, left: 51, right: 18, top: 16, bottom: 45 };
  $: plotW = plot.width - plot.left - plot.right;
  $: plotH = plot.height - plot.top - plot.bottom;
  $: px = (/** @type {number} */ value) => (value - aucMin) / (aucMax - aucMin) * plotW;
  $: py = (/** @type {number} */ value) => plotH - (value - aucMin) / (aucMax - aucMin) * plotH;
  $: ticks = Array.from({ length: 5 }, (_, index) => aucMin + index * (aucMax - aucMin) / 4);
</script>

<div class="lab">
  <div class="intro">
    <strong>{$language === 'en' ? 'Choose the question before viewing the score' : 'Choisissez la question avant de regarder le score'}</strong>
    <p>{$language === 'en'
      ? 'The same transparent 1-nearest-neighbour model predicts AUC from concentration and weight. Only the validation split changes.'
      : 'Le même modèle transparent à 1 plus proche voisin prédit l’AUC à partir de la concentration et du poids. Seule la séparation de validation change.'}</p>
  </div>

  <div class="strategy" role="group" aria-label={$language === 'en' ? 'Validation strategy' : 'Stratégie de validation'}>
    <button type="button" class:on={strategy === 'rows'} aria-pressed={strategy === 'rows'} on:click={() => selectStrategy('rows')}>
      {$language === 'en' ? 'Random rows' : 'Lignes aléatoires'}
    </button>
    <button type="button" class:on={strategy === 'patients'} aria-pressed={strategy === 'patients'} on:click={() => selectStrategy('patients')}>
      {$language === 'en' ? 'New patients' : 'Nouveaux patients'}
    </button>
    <button type="button" class:on={strategy === 'center'} aria-pressed={strategy === 'center'} on:click={() => selectStrategy('center')}>
      {$language === 'en' ? 'External center' : 'Centre externe'}
    </button>
  </div>

  <div class="split-panel">
    <svg viewBox="0 0 480 188" role="img" aria-label={$language === 'en' ? 'Training and test allocation by patient and center' : 'Répartition apprentissage et test par patient et centre'}>
      {#each centers as center}
        <text x="9" y={35 + center * 55} class="center-label">{$language === 'en' ? 'Center' : 'Centre'} {String.fromCharCode(65 + center)}</text>
        {#each data.filter((row) => row.center === center && row.visit === 0) as patient, index}
          <g transform={`translate(${116 + index * 45},${30 + center * 55})`}>
            {#each data.filter((row) => row.patient === patient.patient) as row}
              <circle cx={row.visit === 0 ? -5 : 5} cy="0" r="5" class:test={testRows.has(`${row.patient}-${row.visit}`)} class:train={!testRows.has(`${row.patient}-${row.visit}`)} />
            {/each}
            <text x="0" y="17" class="patient-label">P{patient.patient + 1}</text>
          </g>
        {/each}
      {/each}
    </svg>
    <div class="legend">
      <span><i class="train-dot"></i>{$language === 'en' ? 'Training visit' : 'Visite apprentissage'}</span>
      <span><i class="test-dot"></i>{$language === 'en' ? 'Test visit' : 'Visite test'}</span>
    </div>
  </div>

  <button type="button" class="reveal" on:click={() => (revealed = !revealed)}>
    {revealed
      ? ($language === 'en' ? 'Hide result' : 'Masquer le résultat')
      : ($language === 'en' ? 'Lock this split and reveal performance' : 'Verrouiller ce choix et révéler la performance')}
  </button>

  {#if revealed}
    <div class="result">
      <div class="metrics" aria-live="polite">
        <div><span>RMSE AUC</span><strong>{result.metrics.rmse.toFixed(1)}</strong></div>
        <div><span>{$language === 'en' ? 'Bias' : 'Biais'}</span><strong>{result.metrics.bias.toFixed(1)}</strong></div>
        <div><span>{$language === 'en' ? 'Within ±20%' : 'Dans ±20 %'}</span><strong>{result.metrics.within20.toFixed(0)} %</strong></div>
      </div>

      <svg viewBox={`0 0 ${plot.width} ${plot.height}`} class="chart" role="img" aria-label={$language === 'en' ? 'Predicted AUC versus synthetic true AUC' : 'AUC prédite versus AUC vraie synthétique'}>
        <g transform={`translate(${plot.left},${plot.top})`}>
          {#each ticks as tick}
            <line x1="0" x2={plotW} y1={py(tick)} y2={py(tick)} class="gridline" />
            <text x="-8" y={py(tick) + 4} class="tick" text-anchor="end">{tick.toFixed(0)}</text>
            <text x={px(tick)} y={plotH + 18} class="tick" text-anchor="middle">{tick.toFixed(0)}</text>
          {/each}
          <line x1="0" y1={plotH} x2={plotW} y2="0" class="identity" />
          {#each result.predictions as row}
            <circle cx={px(row.auc)} cy={py(row.predicted)} r="4" class="prediction" />
          {/each}
          <line x1="0" x2="0" y1="0" y2={plotH} class="axis" />
          <line x1="0" x2={plotW} y1={plotH} y2={plotH} class="axis" />
          <text x={plotW / 2} y={plotH + 39} class="axis-label" text-anchor="middle">{$language === 'en' ? 'Synthetic true AUC' : 'AUC vraie synthétique'}</text>
          <text transform={`translate(-40,${plotH / 2}) rotate(-90)`} class="axis-label" text-anchor="middle">{$language === 'en' ? 'Predicted AUC' : 'AUC prédite'}</text>
        </g>
      </svg>
      <p class="interpretation">{interpretation}</p>
    </div>
  {:else}
    <p class="prompt">{$language === 'en'
      ? 'Prediction results remain hidden so the evaluation design is chosen before seeing the answer.'
      : 'Les résultats restent cachés afin de choisir le plan d’évaluation avant de voir la réponse.'}</p>
  {/if}

</div>

<style>
  .lab { display: grid; gap: var(--space-3); font-size: var(--text-sm); }
  p { margin: 0; line-height: 1.5; }
  .intro { display: grid; gap: var(--space-2); }
  .intro strong { color: var(--text-primary); }
  .strategy { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 5px; }
  button { font: inherit; border: 1px solid var(--border-strong); background: var(--bg-secondary); color: var(--text-primary); border-radius: var(--radius); padding: 8px 9px; cursor: pointer; }
  button:focus-visible { outline: 2px solid var(--accent-ai); outline-offset: 2px; }
  .strategy button { min-height: 42px; font-size: var(--text-xs); }
  .strategy button.on { background: var(--accent-ai); border-color: var(--accent-ai); color: var(--bg-primary); font-weight: 700; }
  .split-panel { border: 1px solid var(--border-subtle); border-radius: var(--radius); padding: 4px 8px 8px; background: var(--bg-secondary); }
  .split-panel svg, .chart { display: block; width: 100%; height: auto; }
  .center-label, .patient-label, .tick, .axis-label { fill: var(--text-secondary); font-family: var(--font-mono); }
  .center-label { font-size: 11px; font-weight: 700; }
  .patient-label { font-size: 8px; text-anchor: middle; }
  .train { fill: #2563eb; }
  .test { fill: #f59e0b; stroke: var(--text-primary); stroke-width: .6; }
  .legend { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px 18px; color: var(--text-secondary); font-size: var(--text-xs); }
  .legend span { display: inline-flex; align-items: center; gap: 5px; }
  .legend i { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  .train-dot { background: #2563eb; }
  .test-dot { background: #f59e0b; border: 1px solid var(--text-primary); }
  .reveal { justify-self: start; background: var(--accent-ai); border-color: var(--accent-ai); color: var(--bg-primary); font-weight: 700; }
  .result { display: grid; gap: var(--space-3); animation: appear .25s ease-out both; }
  @keyframes appear { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .result { animation: none; } }
  .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .metrics div { display: grid; gap: 2px; padding: 8px; background: var(--bg-secondary); border-radius: var(--radius); text-align: center; }
  .metrics span { color: var(--text-primary); font-size: var(--text-xs); }
  .metrics strong { color: var(--text-primary); font-variant-numeric: tabular-nums; }
  .gridline { stroke: var(--border-strong); stroke-width: .5; opacity: .3; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .identity { stroke: var(--text-muted); stroke-width: 1.4; stroke-dasharray: 5 4; }
  .prediction { fill: #2563eb; stroke: var(--bg-primary); stroke-width: 1; }
  .tick { font-size: 9px; }
  .axis-label { font-size: 10px; }
  .interpretation { padding: var(--space-3); border-left: 3px solid var(--accent-ai); background: color-mix(in srgb, var(--accent-ai) 8%, transparent); }
  .prompt { color: var(--text-muted); font-size: var(--text-xs); }
  @media (max-width: 460px) {
    .strategy { grid-template-columns: 1fr; }
    .strategy button { min-height: 36px; }
    .metrics { grid-template-columns: 1fr; }
    .metrics div { grid-template-columns: 1fr auto; text-align: left; align-items: center; }
  }
</style>

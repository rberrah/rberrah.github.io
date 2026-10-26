<script>
  import { language } from '#lib/stores/language.js';
  import { makeEnsembleLabData, trueResponse, fitEnsembleLab, ensembleRmse } from '#lib/science/treeEnsembleLab.js';

  // Experimental pedagogy: manipulate the model -> inspect training fit ->
  // reveal untouched holdout -> understand the limits. Synthetic data only.
  const { train, test } = makeEnsembleLabData();
  const grid = Array.from({ length: 141 }, (_, i) => i / 14);
  let mode = 'tree';
  let knob = 3;
  let showTest = false;
  let showWhy = false;
  let tried = false;

  $: knobMax = mode === 'tree' ? 6 : 40;
  $: knobLabel = mode === 'tree'
    ? ($language === 'en' ? 'Tree depth' : 'Profondeur de l’arbre')
    : mode === 'forest'
      ? ($language === 'en' ? 'Bootstrap trees' : 'Arbres bootstrap')
      : ($language === 'en' ? 'Boosting rounds' : 'Itérations de boosting');
  $: model = fitEnsembleLab(mode, Number(knob), train);
  $: predictions = grid.map((x) => model.predict(x));
  $: trainingError = ensembleRmse(model, train);
  $: holdoutError = ensembleRmse(model, test);
  $: explanation = mode === 'tree'
    ? ($language === 'en'
      ? 'CART splits the x axis to reduce squared error in the training sample. More depth creates smaller leaves and may learn noise.'
      : 'CART découpe l’axe x pour réduire l’erreur quadratique sur l’échantillon d’apprentissage. Un arbre profond peut apprendre le bruit.')
    : mode === 'forest'
      ? ($language === 'en'
        ? 'We average independently bootstrapped depth-3 trees. With only one input variable, this demonstrates bagging, not the full feature-sampling random forest algorithm.'
        : 'On moyenne des arbres de profondeur 3 construits sur des échantillons bootstrap. Avec une seule variable, cette expérience illustre le bagging, pas une forêt aléatoire complète avec sous-échantillonnage des variables.')
      : ($language === 'en'
        ? 'With squared-error loss, each depth-2 tree fits current residuals (negative gradients); its contribution is scaled by a learning rate of 0.3. This is a simplified gradient boosting model, not XGBoost or CatBoost.'
        : 'Avec une perte quadratique, chaque arbre de profondeur 2 apprend les résidus courants (opposés du gradient). Son effet est pondéré par un taux d’apprentissage de 0,3. C’est un boosting simplifié, pas XGBoost ou CatBoost.');

  function selectMode(next) {
    mode = next;
    knob = next === 'tree' ? 3 : 12;
    showTest = false;
    showWhy = false;
    tried = false;
  }
  function changeKnob() {
    showTest = false;
    tried = true;
  }
  function nextStep() {
    knob = Math.min(knobMax, Number(knob) + 1);
    changeKnob();
  }
  function reset() {
    knob = mode === 'tree' ? 3 : 12;
    showTest = false;
    showWhy = false;
    tried = false;
  }

  const width = 480, height = 305, margin = { top: 16, right: 12, bottom: 42, left: 39 };
  const chartW = width - margin.left - margin.right;
  const chartH = height - margin.top - margin.bottom;
  /** @param {number} x */
  const px = (x) => x / 10 * chartW;
  /** @param {number} y */
  const py = (y) => chartH - Math.max(0, Math.min(20, y)) / 20 * chartH;
  /** @param {number[]} ys */
  const polyline = (ys) => ys.map((y, i) => px(grid[i]).toFixed(1) + ',' + py(y).toFixed(1)).join(' ');
  $: fittedLine = polyline(predictions);
  const trueLine = polyline(grid.map(trueResponse));
</script>

<div class="lab">
  <div class="introduction">
    <strong>{$language === 'en' ? '1. Experiment' : '1. Expérimenter'}</strong>
    <p>{$language === 'en'
      ? 'Select a method, move its slider, and observe how its fitted curve changes.'
      : 'Choisissez une méthode, déplacez le curseur et observez comment la courbe ajustée change.'}</p>
  </div>

  <div class="layout">
    <div class="controls">
      <div class="modes" role="group" aria-label={$language === 'en' ? 'Model family' : 'Famille de modèles'}>
        <button type="button" class:on={mode === 'tree'} aria-pressed={mode === 'tree'} on:click={() => selectMode('tree')}>{$language === 'en' ? 'Tree' : 'Arbre'}</button>
        <button type="button" class:on={mode === 'forest'} aria-pressed={mode === 'forest'} on:click={() => selectMode('forest')}>{$language === 'en' ? 'Bagging' : 'Bagging'}</button>
        <button type="button" class:on={mode === 'boost'} aria-pressed={mode === 'boost'} on:click={() => selectMode('boost')}>Boosting</button>
      </div>
      <label class="range">
        <span>{knobLabel}</span><strong>{knob}</strong>
        <input type="range" min="1" max={knobMax} step="1" bind:value={knob} on:input={changeKnob} />
      </label>
      <div class="small-actions">
        <button type="button" on:click={nextStep} disabled={Number(knob) >= knobMax}>{$language === 'en' ? 'Next step +1' : 'Étape suivante +1'}</button>
        <button type="button" on:click={reset}>{$language === 'en' ? 'Reset' : 'Réinitialiser'}</button>
      </div>
      <div class="measurements" aria-live="polite" aria-atomic="true">
        <strong>{$language === 'en' ? 'Training RMSE' : 'RMSE apprentissage'}</strong>
        <span class="score">{trainingError.toFixed(2)}</span>
        <strong>{$language === 'en' ? 'Holdout RMSE' : 'RMSE test interne'}</strong>
        <span class="score">{showTest ? holdoutError.toFixed(2) : '—'}</span>
      </div>
    </div>

    <div class="chart-area">
      <svg viewBox="0 0 480 305" class="chart" role="img" aria-label={$language === 'en' ? 'Training points, fitted model and optional held-out test points' : 'Points d’apprentissage, modèle ajusté et points test éventuellement révélés'}>
        <g transform="translate(39,16)">
          {#each [0,5,10,15,20] as y}
            <line x1="0" x2={chartW} y1={py(y)} y2={py(y)} class="gridline" />
            <text x="-8" y={py(y) + 4} class="tick" text-anchor="end">{y}</text>
          {/each}
          {#each [0,2,4,6,8,10] as x}
            <text x={px(x)} y={chartH + 16} class="tick" text-anchor="middle">{x}</text>
          {/each}
          <line x1="0" x2="0" y1="0" y2={chartH} class="axis" />
          <line x1="0" x2={chartW} y1={chartH} y2={chartH} class="axis" />
          {#if showTest}
            <polyline points={trueLine} class="true-line" />
          {/if}
          {#each train as point, i (i)}
            <circle cx={px(point.x)} cy={py(point.y)} r="3" class="training-point" />
          {/each}
          {#key mode + "-" + knob}
            <polyline points={fittedLine} class="model-line" />
          {/key}
          {#if showTest}
            {#each test as point, i (i)}
              <circle cx={px(point.x)} cy={py(point.y)} r="4" class="test-point" />
            {/each}
          {/if}
          <text x={chartW / 2} y={chartH + 34} text-anchor="middle" class="axis-label">x</text>
          <text transform="translate(-30,123) rotate(-90)" text-anchor="middle" class="axis-label">y</text>
        </g>
      </svg>
      <div class="legend">
        <span><i class="train-dot"></i>{$language === 'en' ? 'Train' : 'Apprentissage'}</span>
        {#if showTest}<span><i class="test-dot"></i>{$language === 'en' ? 'Holdout' : 'Test interne'}</span>{/if}
        <span><i class="model-line-key"></i>{$language === 'en' ? 'Prediction' : 'Prédiction'}</span>
        {#if showTest}<span><i class="true-line-key"></i>{$language === 'en' ? 'Synthetic truth' : 'Vérité simulée'}</span>{/if}
      </div>
    </div>
  </div>

  <div class="next">
    <div class="step">
      <strong>{$language === 'en' ? '2. Observe: does it generalize?' : '2. Observer : le modèle généralise-t-il ?'}</strong>
      <p>{$language === 'en'
        ? 'The blue dots were used to learn. The orange dots are a separate simulated set, never used for fitting. Choose your complexity before revealing them.'
        : 'Les points bleus servent à apprendre. Les points orange proviennent d’un autre échantillon simulé, jamais utilisé pour ajuster. Choisissez la complexité avant de les révéler.'}</p>
      <button type="button" class="reveal" on:click={() => (showTest = !showTest)}>
        {showTest
          ? ($language === 'en' ? 'Hide holdout' : 'Masquer le test')
          : ($language === 'en' ? 'Reveal holdout and test error' : 'Révéler le test et son erreur')}
      </button>
      {#if showTest}
        <p class="caution">{$language === 'en'
          ? 'This is a synthetic internal holdout, not external or clinical validation. Repeatedly tuning after looking at this score would bias evaluation.'
          : 'Il s’agit d’un test interne synthétique, pas d’une validation externe ou clinique. Régler plusieurs fois le modèle après avoir consulté ce score biaiserait l’évaluation.'}</p>
      {:else if tried}
        <p class="hint">{$language === 'en' ? 'Now compare the training score with unseen points.' : 'Comparez maintenant le score d’apprentissage à des points encore inconnus.'}</p>
      {/if}
    </div>
    <div class="step">
      <strong>{$language === 'en' ? '3. Understand why' : '3. Comprendre pourquoi'}</strong>
      <button type="button" class="why" aria-expanded={showWhy} on:click={() => (showWhy = !showWhy)}>
        {showWhy
          ? ($language === 'en' ? 'Hide explanation' : 'Masquer l’explication')
          : ($language === 'en' ? 'Explain this method' : 'Expliquer cette méthode')}
      </button>
      {#if showWhy}
        <p>{explanation}</p>
        <p class="caution">{$language === 'en'
          ? 'A smaller training error is not by itself evidence of better predictions in new patients.'
          : 'Une erreur plus faible sur l’apprentissage ne prouve pas que les prédictions seront meilleures chez de nouveaux patients.'}</p>
      {/if}
    </div>
  </div>
  <p class="footnote">{$language === 'en'
    ? 'Illustration only: deterministic 1D simulated data, no PK units or patient records. Same distribution for train and internal holdout.'
    : 'Illustration uniquement : données 1D simulées et reproductibles, sans unité PK ni dossier patient. Même distribution pour apprentissage et test interne.'}</p>
</div>

<style>
  .lab { display: grid; gap: var(--space-3); font-size: var(--text-sm); }
  p { margin: 0; line-height: 1.5; }
  .introduction, .step { display: grid; gap: var(--space-2); }
  .introduction strong, .step strong { color: var(--text-primary); }
  .layout { display: grid; gap: var(--space-3); align-items: start; }
  @media (min-width: 700px) { .layout { grid-template-columns: minmax(0, 200px) minmax(0,1fr); } }
  @container (max-width: 720px) { .layout { grid-template-columns: 1fr; } }
  .controls { display: grid; gap: var(--space-3); min-width: 0; }
  .modes { display: flex; flex-wrap: wrap; gap: 4px; }
  button { font: inherit; border: 1px solid var(--border-strong); background: var(--bg-secondary); color: var(--text-primary); border-radius: var(--radius); padding: 7px 9px; cursor: pointer; }
  button:focus-visible, input:focus-visible { outline: 2px solid var(--accent-ai); outline-offset: 2px; }
  button:disabled { opacity: .5; cursor: not-allowed; }
  .modes button { flex: 1; min-width: 55px; padding: 6px 5px; font-size: var(--text-xs); }
  .modes button.on { background: var(--accent-ai); border-color: var(--accent-ai); color: var(--bg-primary); font-weight: 700; }
  .range { display: grid; grid-template-columns: 1fr auto; gap: 8px; font-size: var(--text-xs); }
  .range input { grid-column: 1 / -1; width: 100%; accent-color: var(--accent-ai); }
  .range strong, .score { font-variant-numeric: tabular-nums; }
  .small-actions { display: flex; gap: 5px; flex-wrap: wrap; }
  .small-actions button { font-size: var(--text-xs); flex: 1; }
  .measurements { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 6px; border-radius: var(--radius); padding: var(--space-3); background: var(--bg-secondary); font-size: var(--text-xs); }
  .measurements strong { font-weight: 500; }
  .score { font-weight: 700; color: var(--accent-ai); }
  .chart-area { min-width: 0; }
  .chart { display: block; width: 100%; height: auto; overflow: visible; }
  .gridline { stroke: var(--border-strong); stroke-width: .5; opacity: .35; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .model-line { stroke: var(--accent-ai); fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 900; animation: reveal-fit .65s ease-out both; }
  .test-point { animation: reveal-dots .28s ease-out both; }
  @keyframes reveal-fit { from { stroke-dashoffset: 900; } to { stroke-dashoffset: 0; } }
  @keyframes reveal-dots { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .model-line, .test-point { animation: none; } }
  .true-line { stroke: var(--accent-pk); stroke-width: 1.5; stroke-dasharray: 5 5; fill: none; }
  .training-point { fill: #2563eb; stroke: var(--bg-primary); stroke-width: .8; }
  .test-point { fill: #f59e0b; stroke: var(--text-primary); stroke-width: .7; }
  .axis-label, .tick { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; }
  .legend { display: flex; flex-wrap: wrap; gap: 6px 13px; font-size: var(--text-xs); color: var(--text-secondary); }
  .legend span { display: inline-flex; align-items: center; gap: 4px; }
  .legend i { width: 11px; height: 11px; display: inline-block; border-radius: 50%; }
  .train-dot { background: #2563eb; }
  .test-dot { background: #f59e0b; }
  .legend .model-line-key, .legend .true-line-key { border-radius: 0; height: 3px; width: 15px; background: var(--accent-ai); }
  .legend .true-line-key { background: var(--accent-pk); }
  .next { display: grid; gap: var(--space-3); }
  .step { padding: var(--space-3); border: 1px solid var(--border-strong); border-radius: var(--radius); }
  .step button { justify-self: start; }
  .reveal { border-color: var(--accent-ai); }
  .hint, .caution, .footnote { color: var(--text-secondary); font-size: var(--text-xs); }
</style>

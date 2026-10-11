<script>
  // @ts-nocheck
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { paddedDomain } from '$lib/charts/domain';
  import { language } from '$lib/stores/language';
  import { combineVpcSummaries, simulateVpcDataset, summarizeVpcDataset } from '$lib/science/visualizationMath.js';

  const TIMES = [0.5, 1, 2, 4, 8, 12, 24];
  const SUBJECTS = 60;
  const REPLICATES = 500;
  const DOSE = 500;
  const TRUE_MODEL = { cl: 5, v: 50, omegaCl: 0.3, omegaV: 0.2, prop: 0.15, add: 0.1 };

  let bins = 6;
  let modelCl = 5;
  let modelOmegaCl = 0.3;
  let modelProp = 0.15;

  const design = { times: TIMES, subjects: SUBJECTS, dose: DOSE };
  const observed = simulateVpcDataset(20261010, TRUE_MODEL, design);
  $: fittedModel = { ...TRUE_MODEL, cl: modelCl, omegaCl: modelOmegaCl, prop: modelProp };
  $: observedPercentiles = summarizeVpcDataset(observed, bins, TIMES);
  $: replicatePercentiles = Array.from({ length: REPLICATES }, (_, index) =>
    summarizeVpcDataset(simulateVpcDataset(9001 + index * 7919, fittedModel, design), bins, TIMES)
  );
  $: vpc = combineVpcSummaries(observedPercentiles, replicatePercentiles);

  $: xScale = scaleLinear().domain([0, 24]).range([0, 360]);
  $: yScale = scaleLinear()
    .domain(paddedDomain(vpc.flatMap((row) => [row.p95, row.modelP95.high]), 0.15))
    .range([210, 0]);

  /** @param {'modelP5'|'modelP50'|'modelP95'} key */
  function ribbonPoints(key) {
    const forward = vpc.map((row) => `${xScale(row.t)},${yScale(row[key].high)}`);
    const backward = [...vpc].reverse().map((row) => `${xScale(row.t)},${yScale(row[key].low)}`);
    return [...forward, ...backward].join(' ');
  }
</script>

<div class="vpc">
  <div class="controls">
    <label>
      <span>{$language === 'en' ? 'Model CL (L/h)' : 'CL du modèle (L/h)'}</span>
      <strong>{modelCl.toFixed(1)}</strong>
      <input type="range" min="3" max="8" step="0.25" bind:value={modelCl} />
    </label>
    <label>
      <span>{$language === 'en' ? 'Model omega CL' : 'Oméga CL du modèle'}</span>
      <strong>{(modelOmegaCl * 100).toFixed(0)}%</strong>
      <input type="range" min="0.05" max="0.6" step="0.05" bind:value={modelOmegaCl} />
    </label>
    <label>
      <span>{$language === 'en' ? 'Proportional residual SD' : 'SD résiduelle proportionnelle'}</span>
      <strong>{(modelProp * 100).toFixed(0)}%</strong>
      <input type="range" min="0.05" max="0.35" step="0.025" bind:value={modelProp} />
    </label>
    <label>
      <span>{$language === 'en' ? 'Time bins' : 'Classes de temps'}</span>
      <strong>{bins}</strong>
      <input type="range" min="4" max="7" step="1" bind:value={bins} />
    </label>
  </div>

  <div class="design">
    {$language === 'en'
      ? `${REPLICATES} replicated trials of ${SUBJECTS} patients, simulated from the candidate one-compartment model with the observed design. The observed dataset was generated independently from the reference model (CL 5 L/h, omega CL 30%, residual SD 15%).`
      : `${REPLICATES} essais répliqués de ${SUBJECTS} patients, simulés depuis le modèle candidat à un compartiment avec le plan observé. Le jeu observé a été généré indépendamment depuis le modèle de référence (CL 5 L/h, oméga CL 30 %, SD résiduelle 15 %).`}
  </div>

  <div class="bininfo">
    {#each vpc as row}
      <span>{row.count} obs · {row.from}–{row.to} h</span>
    {/each}
  </div>

  <ChartFrame width={470} height={285} margin={{ top: 18, right: 18, bottom: 52, left: 70 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
      <polygon points={ribbonPoints('modelP5')} class="ribbon outer" />
      <polygon points={ribbonPoints('modelP95')} class="ribbon outer" />
      <polygon points={ribbonPoints('modelP50')} class="ribbon median" />

      <polyline points={vpc.map((row) => `${xScale(row.t)},${yScale(row.modelP5.mid)}`).join(' ')} class="model outer-line" />
      <polyline points={vpc.map((row) => `${xScale(row.t)},${yScale(row.modelP50.mid)}`).join(' ')} class="model median-line" />
      <polyline points={vpc.map((row) => `${xScale(row.t)},${yScale(row.modelP95.mid)}`).join(' ')} class="model outer-line" />

      {#each vpc as row}
        <circle cx={xScale(row.t)} cy={yScale(row.p5)} r="4" class="observed outer-point" />
        <circle cx={xScale(row.t)} cy={yScale(row.p50)} r="4.5" class="observed median-point" />
        <circle cx={xScale(row.t)} cy={yScale(row.p95)} r="4" class="observed outer-point" />
      {/each}

      <Axis orient="bottom" scale={xScale} length={innerWidth} label={$language === 'en' ? 'Time (h)' : 'Temps (h)'} />
      <g transform="translate(-8,0)">
        <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
      </g>
    </svelte:fragment>
  </ChartFrame>

  <div class="legend" aria-label={$language === 'en' ? 'VPC legend' : 'Légende de la VPC'}>
    <span><i class="swatch median-band"></i>{$language === 'en' ? '90% simulation interval for model P50' : 'Intervalle de simulation à 90 % du P50 modèle'}</span>
    <span><i class="swatch outer-band"></i>{$language === 'en' ? '90% simulation intervals for model P5/P95' : 'Intervalles de simulation à 90 % des P5/P95 modèle'}</span>
    <span><i class="dot"></i>{$language === 'en' ? 'Observed P5/P50/P95' : 'P5/P50/P95 observés'}</span>
  </div>

  <p class="note">
    {$language === 'en'
      ? 'A repeated or structured discrepancy is compatible with model, variability, residual-error, design or binning misspecification. A VPC does not identify a unique cause by itself.'
      : "Un écart répété ou structuré peut être compatible avec une mauvaise spécification du modèle, de la variabilité, de l’erreur résiduelle, du plan ou des classes. Une VPC n’identifie pas seule une cause unique."}
  </p>
</div>

<style>
  .vpc { display: grid; gap: 10px; }
  .controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; }
  label { display: grid; grid-template-columns: 1fr auto; gap: 4px 8px; font-size: var(--text-sm); font-weight: 700; }
  label span { color: var(--text-secondary); }
  label input { grid-column: 1 / -1; width: 100%; }
  .design, .note { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .design { padding: 8px 10px; background: var(--bg-secondary); border-radius: var(--radius); }
  .bininfo, .legend { display: flex; flex-wrap: wrap; gap: 6px 12px; color: var(--text-secondary); font-size: var(--text-xs); }
  .ribbon { stroke: none; }
  .ribbon.outer { fill: rgba(14, 165, 233, 0.15); }
  .ribbon.median { fill: rgba(37, 99, 235, 0.24); }
  .model { fill: none; }
  .outer-line { stroke: #0ea5e9; stroke-width: 1.4; stroke-dasharray: 4 3; }
  .median-line { stroke: #2563eb; stroke-width: 2.2; }
  .observed { stroke: var(--bg-primary); stroke-width: 1.2; }
  .outer-point { fill: #b91c1c; }
  .median-point { fill: #7f1d1d; }
  .legend span { display: inline-flex; align-items: center; gap: 6px; }
  .swatch { width: 20px; height: 9px; display: inline-block; border-radius: 2px; }
  .median-band { background: rgba(37, 99, 235, 0.35); border: 1px solid #2563eb; }
  .outer-band { background: rgba(14, 165, 233, 0.22); border: 1px dashed #0ea5e9; }
  .dot { width: 9px; height: 9px; border-radius: 50%; background: #991b1b; display: inline-block; }
</style>

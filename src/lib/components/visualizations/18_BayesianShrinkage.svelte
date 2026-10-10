<script>
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { paddedDomain } from '$lib/charts/domain';
  import { language } from '$lib/stores/language';

  let iiv = 0.3;
  let sigma = 0.1;
  let meas = 8;
  const prior = 6;

  $: weightData = 1 / (sigma * sigma);
  $: weightPrior = 1 / (iiv * iiv);
  $: posterior = (prior * weightPrior + meas * weightData) / (weightPrior + weightData);
  $: priorContribution = (weightPrior / (weightPrior + weightData)) * 100;

  const xDomain = [0, 1];
  $: yScale = scaleLinear().domain(paddedDomain([prior, meas, posterior], 0.2)).range([160, 0]);
  $: xScale = scaleLinear().domain(xDomain).range([0, 60]);
</script>

<div class="bayes">
  <div class="controls">
    <label>{$language === 'en' ? 'Prior SD' : 'SD a priori'} <input type="range" min="0.05" max="1" step="0.05" bind:value={iiv} /></label>
    <label>{$language === 'en' ? 'Observation SD' : "SD d'observation"} <input type="range" min="0.05" max="0.5" step="0.02" bind:value={sigma} /></label>
    <label>{$language === 'en' ? 'Measurement' : 'Mesure'} <input type="range" min="2" max="15" step="0.5" bind:value={meas} /></label>
  </div>

  <div class="cards">
    <div class="card">{$language === 'en' ? 'Prior' : 'A priori'}: {prior}</div>
    <div class="card">{$language === 'en' ? 'Measurement' : 'Mesure'}: {meas}</div>
    <div class="card">{$language === 'en' ? 'Posterior mean' : 'Moyenne a posteriori'}: {posterior.toFixed(2)}</div>
    <div class="card">{$language === 'en' ? 'Prior contribution' : 'Poids du prior'}: {priorContribution.toFixed(0)}%</div>
  </div>

  <ChartFrame width={240} height={220} margin={{ top: 16, right: 14, bottom: 40, left: 60 }} xScale={xScale} yScale={yScale} grid={false}>
    <svelte:fragment let:yScale let:innerHeight>
      <line x1="0" x2="40" y1={yScale(prior)} y2={yScale(prior)} stroke="var(--border-subtle)" stroke-width="6" stroke-linecap="round" />
      <line x1="0" x2="40" y1={yScale(meas)} y2={yScale(meas)} stroke="#f97316" stroke-width="6" stroke-linecap="round" />
      <line x1="0" x2="40" y1={yScale(posterior)} y2={yScale(posterior)} stroke="#22c55e" stroke-width="6" stroke-linecap="round" />
      <text x="45" y={yScale(prior) + 4} font-size="10" fill="var(--text-secondary)">{$language === 'en' ? 'Prior' : 'A priori'}</text>
      <text x="45" y={yScale(meas) + 4} font-size="10" fill="var(--text-secondary)">{$language === 'en' ? 'Measurement' : 'Mesure'}</text>
      <text x="45" y={yScale(posterior) + 4} font-size="10" fill="var(--text-secondary)">Posterior</text>
      <Axis orient="left" scale={yScale} length={innerHeight} label="Valeur" />
    </svelte:fragment>
  </ChartFrame>
  <p class="note">{$language === 'en' ? 'Gaussian conjugate example for one estimate. The prior contribution shown here is not the population eta-shrinkage diagnostic.' : "Exemple gaussien conjugué pour une estimation. Le poids du prior affiché ici n'est pas le diagnostic d'eta-shrinkage de la population."}</p>
</div>

<style>
  .bayes {
    display: grid;
    gap: 10px;
  }
  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 8px;
    font-weight: 700;
  }
  input[type='range'] {
    width: 100%;
    accent-color: #2563eb;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }
  .card {
    padding: 10px;
    border: 1px solid var(--bg-secondary);
    border-radius: 10px;
    background: var(--bg-tertiary);
    font-weight: 700;
  }
  .note { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
</style>

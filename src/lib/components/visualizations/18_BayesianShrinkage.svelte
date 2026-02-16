<script>
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { paddedDomain } from '$lib/charts/domain';

  let iiv = 0.3;
  let sigma = 0.1;
  let meas = 8;
  const prior = 6;

  $: weightData = 1 / (sigma * sigma);
  $: weightPrior = 1 / (iiv * iiv);
  $: ebe = ((prior * weightPrior + meas * weightData) / (weightPrior + weightData)).toFixed(2);
  $: shrink = (1 - weightData / (weightPrior + weightData)) * 100;

  const xDomain = [0, 1];
  $: yScale = scaleLinear().domain(paddedDomain([prior, meas, Number(ebe)], 0.2)).range([160, 0]);
  $: xScale = scaleLinear().domain(xDomain).range([0, 60]);
</script>

<div class="bayes">
  <div class="controls">
    <label>IIV <input type="range" min="0.05" max="1" step="0.05" bind:value={iiv} /></label>
    <label>σ <input type="range" min="0.05" max="0.5" step="0.02" bind:value={sigma} /></label>
    <label>Mesure <input type="range" min="2" max="15" step="0.5" bind:value={meas} /></label>
  </div>

  <div class="cards">
    <div class="card">Prior: {prior}</div>
    <div class="card">Mesure: {meas}</div>
    <div class="card">EBE: {ebe}</div>
    <div class="card">Shrinkage: {shrink.toFixed(0)}%</div>
  </div>

  <ChartFrame width={240} height={220} margin={{ top: 16, right: 14, bottom: 40, left: 60 }} xScale={xScale} yScale={yScale} grid={false}>
    <svelte:fragment let:yScale let:innerHeight>
      <line x1="0" x2="40" y1={yScale(prior)} y2={yScale(prior)} stroke="#cbd5e1" stroke-width="6" stroke-linecap="round" />
      <line x1="0" x2="40" y1={yScale(meas)} y2={yScale(meas)} stroke="#f97316" stroke-width="6" stroke-linecap="round" />
      <line x1="0" x2="40" y1={yScale(ebe)} y2={yScale(ebe)} stroke="#22c55e" stroke-width="6" stroke-linecap="round" />
      <text x="45" y={yScale(prior) + 4} font-size="10" fill="#475569">Prior</text>
      <text x="45" y={yScale(meas) + 4} font-size="10" fill="#475569">Mesure</text>
      <text x="45" y={yScale(ebe) + 4} font-size="10" fill="#475569">EBE</text>
      <Axis orient="left" scale={yScale} length={innerHeight} label="Valeur" />
    </svelte:fragment>
  </ChartFrame>
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
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #fff;
    font-weight: 700;
  }
</style>

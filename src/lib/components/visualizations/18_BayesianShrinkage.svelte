<script>
  let iiv = 0.3;
  let sigma = 0.1;
  let meas = 8;
  const prior = 6;

  $: weightData = 1 / (sigma * sigma);
  $: weightPrior = 1 / (iiv * iiv);
  $: ebe = ((prior * weightPrior + meas * weightData) / (weightPrior + weightData)).toFixed(2);
  $: shrink = (1 - weightData / (weightPrior + weightData)) * 100;
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
</div>

<style>
  .bayes {
    display: grid;
    gap: 10px;
  }
  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

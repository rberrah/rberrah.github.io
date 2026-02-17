<script>
  // @ts-nocheck
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { paddedDomain } from '$lib/charts/domain';
  import { scaleLinear } from 'd3-scale';
  import { simulatePopulation } from '$lib/sim/population';
  import Slider from '$lib/components/ui/Slider.svelte';

  let route = 'oral_1st';
  let nCompartments = 1;
  let dose = 200;
  let infusionDuration = 2;
  let ka = 1.2;
  let lag = 0.5;
  let absorptionMode = 'none'; // none | lag | transit
  let nTransit = 3;
  let mtt = 1.5;
  let cl = 6;
  let vc = 40;
  let q1 = 5;
  let vp1 = 60;
  let q2 = 3;
  let vp2 = 80;

  let iivEnabled = true;
  let omegaCL = 0.3;
  let omegaVc = 0.3;
  let omegaKa = 0.2;
  let omegaQ = 0.2;

  let iovEnabled = false;
  let kappaCL = 0.2;

  let resEnabled = true;
  let sigmaProp = 0.2;
  let sigmaAdd = 0.2;

  let nInd = 80;
  let seed = 7;
  let samplingPreset = 'rich';

  $: samplingTimes = buildTimes(samplingPreset);

  $: modelConfig = {
    dose,
    route,
    nCompartments,
    cl,
    vc,
    q1,
    vp1,
    q2,
    vp2,
    ka,
    lag,
    infusionDuration,
    tEnd: Math.max(...samplingTimes),
    h: 0.05,
    absorptionDelay:
      route === 'oral_1st'
        ? absorptionMode === 'lag'
          ? { type: 'lag', lag }
          : absorptionMode === 'transit'
          ? { type: 'transit', nTransit, mtt }
          : { type: 'none' }
        : { type: 'none' }
  };

  $: population = simulatePopulation({
    n: nInd,
    seed,
    typicalParams: { cl, vc, q1, vp1, q2, vp2, ka },
    iiv: { enabled: iivEnabled, omega: { CL: omegaCL, Vc: omegaVc, Q1: omegaQ, Vp1: omegaQ, Q2: omegaQ, Vp2: omegaQ, Ka: omegaKa } },
    iov: { enabled: iovEnabled, omega: { CL: kappaCL } },
    residual: { enabled: resEnabled, sigmaProp, sigmaAdd },
    modelConfig,
    samplingTimes
  });

  $: spaghetti = population.profiles;
  $: bands = population.summaryBands;
  $: flat = spaghetti.flatMap((p) => p.points);
  $: xScale = scaleLinear().domain([0, Math.max(...samplingTimes)]).range([0, 420]);
  $: yScale = scaleLinear().domain(paddedDomain(flat.map((p) => p.dv), 0.25)).range([340, 0]);

  $: kpi = population.kpis;

  function buildTimes(preset) {
    if (preset === 'rich') return Array.from({ length: 49 }, (_, i) => i * 0.5);
    if (preset === 'sparse') return [0, 1, 2, 4, 8, 12, 24];
    if (preset === 'tdm') return [0, 12, 24];
    return [0, 1, 2, 4, 8, 12, 24];
  }

  function downloadCsv() {
    const header = ['id', 't', 'ipred', 'dv', 'CL', 'Vc', 'Ka'].join(',');
    const rows = population.profiles
      .map((p) =>
        p.points
          .map((pt) => [p.id, pt.t, pt.ipred, pt.dv, p.params.cl, p.params.vc, p.params.ka].join(','))
          .join('\n')
      )
      .join('\n');
    const blob = new Blob([header + '\n' + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poppk_playground.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="playground">
  <aside class="sidebar">
    <h2>Modèle</h2>
    <label>Route
      <select bind:value={route}>
        <option value="oral_1st">Oral 1er ordre</option>
        <option value="iv_bolus">IV bolus</option>
        <option value="iv_infusion">Perfusion</option>
      </select>
    </label>
    <label>Compartiments
      <select bind:value={nCompartments}>
        <option value="1">1 compartiment</option>
        <option value="2">2 compartiments</option>
        <option value="3">3 compartiments</option>
      </select>
    </label>
    <div class="card">
      <Slider label="Dose" min={50} max={800} step={10} bind:value={dose} />
      {#if route === 'iv_infusion'}
        <Slider label="Durée perf (h)" min={0.5} max={8} step={0.1} bind:value={infusionDuration} />
      {/if}
      {#if route === 'oral_1st'}
        <Slider label="Ka (1/h)" min={0.1} max={3} step={0.05} bind:value={ka} />
        <label>Absorption delay
          <select bind:value={absorptionMode}>
            <option value="none">Aucun</option>
            <option value="lag">Lag time</option>
            <option value="transit">Transit</option>
          </select>
        </label>
        {#if absorptionMode === 'lag'}
          <Slider label="Lag (h)" min={0} max={3} step={0.1} bind:value={lag} />
        {:else if absorptionMode === 'transit'}
          <Slider label="n transit" min={1} max={10} step={1} bind:value={nTransit} />
          <Slider label="MTT (h)" min={0.2} max={6} step={0.1} bind:value={mtt} />
        {/if}
      {/if}
      <Slider label="CL (L/h)" min={0.5} max={25} step={0.5} bind:value={cl} />
      <Slider label="Vc (L)" min={5} max={200} step={5} bind:value={vc} />
      {#if nCompartments >= 2}
        <Slider label="Q1 (L/h)" min={0.1} max={20} step={0.2} bind:value={q1} />
        <Slider label="Vp1 (L)" min={5} max={200} step={5} bind:value={vp1} />
      {/if}
      {#if nCompartments >= 3}
        <Slider label="Q2 (L/h)" min={0.1} max={15} step={0.2} bind:value={q2} />
        <Slider label="Vp2 (L)" min={5} max={200} step={5} bind:value={vp2} />
      {/if}
    </div>

    <h2>Variabilité</h2>
    <div class="card toggles">
      <label><input type="checkbox" bind:checked={iivEnabled} /> IIV</label>
      <label><input type="checkbox" bind:checked={iovEnabled} /> IOV</label>
      <label><input type="checkbox" bind:checked={resEnabled} /> Résiduel</label>
    </div>
    <div class="card">
      <Slider label="ω CL" min={0} max={0.8} step={0.05} bind:value={omegaCL} />
      <Slider label="ω Vc" min={0} max={0.8} step={0.05} bind:value={omegaVc} />
      <Slider label="ω Ka" min={0} max={0.8} step={0.05} bind:value={omegaKa} />
      <Slider label="ω Q/Vp" min={0} max={0.8} step={0.05} bind:value={omegaQ} />
      <Slider label="κ CL (IOV)" min={0} max={0.8} step={0.05} bind:value={kappaCL} />
      <Slider label="σ prop" min={0} max={0.5} step={0.02} bind:value={sigmaProp} />
      <Slider label="σ add" min={0} max={1} step={0.05} bind:value={sigmaAdd} />
    </div>

    <h2>Population</h2>
    <div class="card">
      <Slider label="N individus" min={10} max={300} step={10} bind:value={nInd} />
      <Slider label="Seed" min={1} max={999} step={1} bind:value={seed} />
      <label>Échantillonnage
        <select bind:value={samplingPreset}>
          <option value="rich">Riche (q30 min)</option>
          <option value="sparse">Sparse</option>
          <option value="tdm">TDM trough</option>
        </select>
      </label>
    </div>

    <button class="export" on:click={downloadCsv}>Exporter CSV</button>
  </aside>

  <main class="main">
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <div class="title">Spaghetti + bandes (p5/p50/p95)</div>
          <small>Rouge = observations simulées (DV), bande bleue = prédites</small>
        </div>
      </div>
      <ChartFrame width={620} height={380} margin={{ top: 22, right: 24, bottom: 52, left: 78 }} xScale={xScale} yScale={yScale} grid={true}>
        <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
          <polygon
            fill="rgba(59,130,246,0.15)"
            stroke="none"
            points={`${bands.map((d) => `${xScale(d.t)},${yScale(d.p95)}`).join(' ')} ${[...bands]
              .reverse()
              .map((d) => `${xScale(d.t)},${yScale(d.p5)}`)
              .join(' ')}`}
          />
          <polyline
            fill="none"
            stroke="#2563eb"
            stroke-width="2.5"
            points={bands.map((d) => `${xScale(d.t)},${yScale(d.p50)}`).join(' ')}
          />
          {#each spaghetti as prof (prof.id)}
            <polyline
              fill="none"
              stroke="rgba(239,68,68,0.28)"
              stroke-width="1"
              points={prof.points.map((p) => `${xScale(p.t)},${yScale(p.dv)}`).join(' ')}
            />
          {/each}
          <Axis orient="bottom" scale={xScale} length={innerWidth} label="Temps (h)" />
          <g transform={`translate(-10,0)`}>
            <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
          </g>
        </svelte:fragment>
      </ChartFrame>
    </div>
    <div class="kpi-row">
      <div class="kpi"><span>AUC médiane</span><strong>{kpi.aucMed.toFixed(1)}</strong></div>
      <div class="kpi"><span>Cmax médiane</span><strong>{kpi.cmaxMed.toFixed(2)}</strong></div>
      <div class="kpi"><span>Tmax médiane</span><strong>{kpi.tmaxMed.toFixed(2)} h</strong></div>
    </div>
  </main>
</div>

<style>
  .playground {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 16px;
  }
  @media (max-width: 900px) {
    .playground {
      grid-template-columns: 1fr;
    }
  }
  aside.sidebar {
    background: #f8fafc;
    padding: 12px;
    border-radius: 12px;
    display: grid;
    gap: 10px;
    align-content: start;
  }
  .sidebar h2 {
    margin: 4px 0;
    font-size: 1rem;
    color: #0f172a;
  }
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px;
    background: #fff;
    display: grid;
    gap: 8px;
  }
  label {
    display: grid;
    gap: 4px;
    font-weight: 600;
    color: #0f172a;
  }
  select {
    padding: 6px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    background: #fff;
  }
  .toggles {
    grid-auto-flow: row;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  .export {
    padding: 8px 12px;
    border: none;
    background: #2563eb;
    color: #fff;
    border-radius: 8px;
    cursor: pointer;
  }
  .main {
    display: grid;
    gap: 12px;
  }
  .chart-card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    background: #fff;
  }
  .chart-header .title {
    font-weight: 700;
    color: #0f172a;
  }
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 8px;
  }
  .kpi {
    background: #f1f5f9;
    padding: 10px;
    border-radius: 10px;
    display: grid;
    gap: 4px;
  }
  .kpi span {
    color: #475569;
  }
  .kpi strong {
    font-size: 1.2rem;
  }
</style>

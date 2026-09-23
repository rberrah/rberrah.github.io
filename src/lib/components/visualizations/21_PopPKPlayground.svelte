<script>
  // @ts-nocheck
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { paddedDomain } from '$lib/charts/domain';
  import { scaleLinear } from 'd3-scale';
  import { simulatePopulation } from '$lib/sim/population';
  import Slider from '$lib/components/ui/Slider.svelte';
  import { language } from '$lib/stores/language';
  import { onMount } from 'svelte';
  import { Download } from '@lucide/svelte';
  import { takeDraft } from '$lib/workshops/session.js';
  import { downloadText, populationCsv, simulationR, simulationRmd } from '$lib/sim/export.js';

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
  let tEnd = 24;
  let transferred = false;

  onMount(() => {
    const incoming = takeDraft('incoming:simulation');
    if (!incoming) return;
    ({ route, nCompartments, dose, infusionDuration, ka, lag, absorptionMode, nTransit, mtt, cl, vc, q1, vp1, q2, vp2,
      iivEnabled, omegaCL, omegaVc, omegaKa, omegaQ, iovEnabled, kappaCL, resEnabled, sigmaProp, sigmaAdd,
      nInd, seed, samplingPreset, tEnd } = incoming);
    transferred = true;
  });

  $: samplingTimes = buildTimes(samplingPreset, tEnd);

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
  $: exportConfig = { route, nCompartments, dose, infusionDuration, ka, lag, absorptionMode, nTransit, mtt, cl, vc, q1, vp1, q2, vp2,
    iivEnabled, omegaCL, omegaVc, omegaKa, omegaQ, iovEnabled, kappaCL, resEnabled, sigmaProp, sigmaAdd, nInd, seed, tEnd };
  $: rCode = simulationR(exportConfig, samplingTimes);

  function buildTimes(preset, horizon) {
    const end = Math.max(1, Number(horizon) || 24);
    if (preset === 'rich') return Array.from({ length: 49 }, (_, i) => end * i / 48);
    if (preset === 'sparse') return [0, .04, .08, .17, .33, .5, 1].map((fraction) => Number((end * fraction).toPrecision(6)));
    if (preset === 'tdm') return [0, end / 2, end];
    return [0, end];
  }

  function downloadCsv() {
    downloadText('poppk_simulation.csv', populationCsv(population), 'text/csv;charset=utf-8');
  }
  const downloadR = () => downloadText('poppk_simulation.R', rCode, 'text/x-r-source;charset=utf-8');
  const downloadRmd = () => downloadText('poppk_simulation.Rmd', simulationRmd(exportConfig, samplingTimes, $language === 'en'), 'text/markdown;charset=utf-8');
</script>

{#if transferred}<p class="transfer-note" role="status">{$language === 'en' ? 'PK workshop model applied. Adjust the population design or export the reproducible files below.' : 'Modèle de l’atelier PK appliqué. Ajustez le plan de population ou exportez les fichiers reproductibles ci-dessous.'}</p>{/if}
<div class="playground">
  <aside class="sidebar">
    <h2>{$language === 'en' ? 'Model' : 'Modèle'}</h2>
    <label>Route
      <select bind:value={route}>
        <option value="oral_1st">{$language === 'en' ? 'First-order oral' : 'Oral 1er ordre'}</option>
        <option value="iv_bolus">{$language === 'en' ? 'IV bolus' : 'Bolus IV'}</option>
        <option value="iv_infusion">{$language === 'en' ? 'IV infusion' : 'Perfusion'}</option>
      </select>
    </label>
    <label>{$language === 'en' ? 'Compartments' : 'Compartiments'}
      <select bind:value={nCompartments}>
        <option value="1">1 {$language === 'en' ? 'compartment' : 'compartiment'}</option>
        <option value="2">2 {$language === 'en' ? 'compartments' : 'compartiments'}</option>
        <option value="3">3 {$language === 'en' ? 'compartments' : 'compartiments'}</option>
      </select>
    </label>
    <div class="card">
      <Slider numeric label="Dose" min={0.000001} max={1000000} step="any" bind:value={dose} />
      {#if route === 'iv_infusion'}
        <Slider numeric label={$language === 'en' ? 'Infusion duration (h)' : 'Durée perf (h)'} min={0.000001} max={10000} step="any" bind:value={infusionDuration} />
      {/if}
      {#if route === 'oral_1st'}
        <Slider numeric label="Ka (1/h)" min={0.000001} max={10000} step="any" bind:value={ka} />
        <label>{$language === 'en' ? 'Absorption delay' : "Délai d'absorption"}
          <select bind:value={absorptionMode}>
            <option value="none">{$language === 'en' ? 'None' : 'Aucun'}</option>
            <option value="lag">{$language === 'en' ? 'Lag time' : 'Temps de latence'}</option>
            <option value="transit">Transit</option>
          </select>
        </label>
        {#if absorptionMode === 'lag'}
          <Slider numeric label="Lag (h)" min={0} max={10000} step="any" bind:value={lag} />
        {:else if absorptionMode === 'transit'}
          <Slider numeric label="n transit" min={1} max={50} step={1} bind:value={nTransit} />
          <Slider numeric label="MTT (h)" min={0.000001} max={10000} step="any" bind:value={mtt} />
        {/if}
      {/if}
      <Slider numeric label="CL (L/h)" min={0.000001} max={1000000} step="any" bind:value={cl} />
      <Slider numeric label="Vc (L)" min={0.000001} max={1000000} step="any" bind:value={vc} />
      {#if nCompartments >= 2}
        <Slider numeric label="Q1 (L/h)" min={0.000001} max={1000000} step="any" bind:value={q1} />
        <Slider numeric label="Vp1 (L)" min={0.000001} max={1000000} step="any" bind:value={vp1} />
      {/if}
      {#if nCompartments >= 3}
        <Slider numeric label="Q2 (L/h)" min={0.000001} max={1000000} step="any" bind:value={q2} />
        <Slider numeric label="Vp2 (L)" min={0.000001} max={1000000} step="any" bind:value={vp2} />
      {/if}
    </div>

    <h2>{$language === 'en' ? 'Variability' : 'Variabilité'}</h2>
    <div class="card toggles">
      <label><input type="checkbox" bind:checked={iivEnabled} /> IIV</label>
      <label><input type="checkbox" bind:checked={iovEnabled} /> IOV</label>
      <label><input type="checkbox" bind:checked={resEnabled} /> {$language === 'en' ? 'Residual' : 'Résiduel'}</label>
    </div>
    <div class="card">
      <Slider numeric label="ω CL" min={0} max={10} step="any" bind:value={omegaCL} />
      <Slider numeric label="ω Vc" min={0} max={10} step="any" bind:value={omegaVc} />
      <Slider numeric label="ω Ka" min={0} max={10} step="any" bind:value={omegaKa} />
      <Slider numeric label="ω Q/Vp" min={0} max={10} step="any" bind:value={omegaQ} />
      <Slider numeric label="κ CL (IOV)" min={0} max={10} step="any" bind:value={kappaCL} />
      <Slider numeric label="σ prop" min={0} max={10} step="any" bind:value={sigmaProp} />
      <Slider numeric label="σ add" min={0} max={1000000} step="any" bind:value={sigmaAdd} />
    </div>

    <h2>Population</h2>
    <div class="card">
      <Slider numeric label={$language === 'en' ? 'N subjects' : 'N individus'} min={1} max={5000} step={1} bind:value={nInd} />
      <Slider numeric label={$language === 'en' ? 'Seed' : 'Graine'} min={1} max={2147483647} step={1} bind:value={seed} />
      <label>{$language === 'en' ? 'Simulation duration (h)' : 'Durée de simulation (h)'}
        <input class="numeric" type="number" min="1" max="10000" step="any" bind:value={tEnd} />
      </label>
      <label>{$language === 'en' ? 'Sampling' : 'Échantillonnage'}
        <select bind:value={samplingPreset}>
          <option value="rich">{$language === 'en' ? 'Rich (49 points)' : 'Riche (49 points)'}</option>
          <option value="sparse">{$language === 'en' ? 'Sparse (7 points)' : 'Épars (7 points)'}</option>
          <option value="tdm">TDM (3 points)</option>
        </select>
      </label>
    </div>

    <div class="exports" aria-label={$language === 'en' ? 'Simulation downloads' : 'Téléchargements de la simulation'}>
      <button class="export" on:click={downloadCsv}><Download size={16}/>{$language === 'en' ? 'CSV results' : 'Résultats CSV'}</button>
      <button class="export secondary" on:click={downloadR}><Download size={16}/>Code R</button>
      <button class="export secondary" on:click={downloadRmd}><Download size={16}/>R Markdown</button>
    </div>
  </aside>

  <main class="main">
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <div class="title">Spaghetti + {$language === 'en' ? 'bands' : 'bandes'} (p5/p50/p95)</div>
          <small>{$language === 'en' ? 'Red = simulated observations (DV), blue band = predictions' : 'Rouge = observations simulées (DV), bande bleue = prédites'}</small>
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
          <Axis orient="bottom" scale={xScale} length={innerWidth} label={$language === 'en' ? 'Time (h)' : 'Temps (h)'} />
          <g transform={`translate(-10,0)`}>
            <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
          </g>
        </svelte:fragment>
      </ChartFrame>
    </div>
    <div class="kpi-row">
      <div class="kpi"><span>{$language === 'en' ? 'Median AUC' : 'AUC médiane'}</span><strong>{kpi.aucMed.toFixed(1)}</strong></div>
      <div class="kpi"><span>{$language === 'en' ? 'Median Cmax' : 'Cmax médiane'}</span><strong>{kpi.cmaxMed.toFixed(2)}</strong></div>
      <div class="kpi"><span>{$language === 'en' ? 'Median Tmax' : 'Tmax médiane'}</span><strong>{kpi.tmaxMed.toFixed(2)} h</strong></div>
    </div>
    <details class="r-code"><summary>{$language === 'en' ? 'R code used for reproduction' : 'Code R de reproduction'}</summary><pre><code>{rCode}</code></pre></details>
  </main>
</div>

<style>
  .playground {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 16px;
  }
  /* On interroge le CONTENEUR, pas la fenêtre. Dans le panneau collant d'un chapitre
     (~610 px de large même sur un écran 1536 px), un média sur la fenêtre ne se déclenchait
     jamais : les 300 px de contrôles écrasaient le graphe à ~220 px. Sur la page /playground,
     large, aucun conteneur n'est déclaré : la règle ne s'applique pas et les 2 colonnes
     restent — le repli est donc correct dans les deux cas. */
  @container (max-width: 900px) {
    .playground {
      grid-template-columns: 1fr;
    }
  }
  /* Filet pour les fenêtres réellement étroites (usage hors conteneur). */
  @media (max-width: 900px) {
    .playground {
      grid-template-columns: 1fr;
    }
  }
  aside.sidebar {
    background: var(--bg-secondary);
    padding: 12px;
    border-radius: 12px;
    display: grid;
    gap: 10px;
    align-content: start;
  }
  .sidebar h2 {
    margin: 4px 0;
    font-size: 1rem;
    color: var(--text-primary);
  }
  .card {
    border: 1px solid var(--bg-secondary);
    border-radius: 10px;
    padding: 10px;
    background: var(--bg-tertiary);
    display: grid;
    gap: 8px;
  }
  label {
    display: grid;
    gap: 4px;
    font-weight: 600;
    color: var(--text-primary);
  }
  select {
    padding: 6px;
    border-radius: 8px;
    border: 1px solid var(--border-subtle);
    background: var(--bg-tertiary);
  }
  .numeric { box-sizing: border-box; width: 100%; padding: 7px; color: var(--text-primary); background: var(--bg-primary); border: 1px solid var(--border-strong); border-radius: 4px; font: inherit; }
  .toggles {
    grid-auto-flow: row;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  .export {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 8px 12px;
    border: 1px solid #176b66;
    background: #176b66;
    color: white;
    border-radius: 4px;
    cursor: pointer;
  }
  .exports { display: grid; gap: 8px; }
  .export.secondary { background: var(--bg-primary); color: var(--text-primary); border-color: var(--border-strong); }
  .transfer-note { border-left: 3px solid #187c80; background: var(--bg-tertiary); padding: 12px; }
  .main {
    display: grid;
    gap: 12px;
  }
  .chart-card {
    border: 1px solid var(--bg-secondary);
    border-radius: 12px;
    padding: 12px;
    background: var(--bg-tertiary);
  }
  .chart-header .title {
    font-weight: 700;
    color: var(--text-primary);
  }
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 8px;
  }
  .kpi {
    background: var(--bg-secondary);
    padding: 10px;
    border-radius: 10px;
    display: grid;
    gap: 4px;
  }
  .kpi span {
    color: var(--text-secondary);
  }
  .kpi strong {
    font-size: 1.2rem;
  }
  .r-code { border-top: 1px solid var(--border-strong); padding-top: 12px; }
  .r-code summary { cursor: pointer; font-weight: 650; }
  .r-code pre { max-height: 520px; overflow: auto; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 4px; font-size: .78rem; }
</style>

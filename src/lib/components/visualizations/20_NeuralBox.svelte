<script>
  import ChartFrame from '#lib/charts/ChartFrame.svelte';
  import Axis from '#lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { language } from '#lib/stores/language.js';

  const times = Array.from({ length: 101 }, (_, i) => i * 0.2); // 0..20 h
  const baseline = times.map((t) => 10 * Math.exp(-0.35 * t)); // ODE pure
  const bump = times.map((t) => 2.2 * Math.exp(-0.5 * Math.pow((t - 6) / 1.4, 2))); // absorption complexe
  const observed = times.map((t, i) => baseline[i] + bump[i] + 0.25 * Math.sin(i * 0.8));
  // Constructed outputs used to compare model classes; no network is trained here.
  const hybridIllustration = times.map((t, i) => baseline[i] + bump[i] * 0.98 + 0.12 * Math.sin(t * 2));
  const blackIllustration = times.map((t, i) =>
    t <= 12 ? observed[i] : observed[i] + 0.08 * Math.pow(t - 12, 2)
  );

  let mode = 'white'; // white | grey | black
  let inspectTime = 6;
  const trainingEnd = 12;
  $: selectedIndex = Math.round(inspectTime / 0.2);
  $: modelCurve = mode === 'white' ? baseline : mode === 'grey' ? hybridIllustration : blackIllustration;
  $: inspected = {
    observed: observed[selectedIndex],
    predicted: modelCurve[selectedIndex],
    residual: observed[selectedIndex] - modelCurve[selectedIndex]
  };
  const xScale = scaleLinear().domain([0, 20]).range([0, 344]);
  const yScale = scaleLinear()
    .domain([0, Math.max(...observed) * 1.05])
    .range([194, 0]);
</script>

<div class="neural" data-testid="neural-box-lab">
  <div class="toggles">
    <button class:active={mode === 'white'} on:click={() => (mode = 'white')}>White box (ODE)</button>
    <button class:active={mode === 'grey'} on:click={() => (mode = 'grey')}>Grey box (ODE + NN)</button>
    <button class:active={mode === 'black'} on:click={() => (mode = 'black')}>Black box ({$language === 'en' ? 'NN only' : 'NN seule'})</button>
  </div>

  <div class="experiment">
    <label>
      <span>{$language === 'en' ? 'Time to inspect' : 'Temps à examiner'}</span>
      <strong>{inspectTime.toFixed(1)} h</strong>
      <input type="range" min="0" max="20" step="0.2" bind:value={inspectTime} />
    </label>
    <div class="readout">
      <span>{$language === 'en' ? 'Constructed observation' : 'Observation construite'} <strong>{inspected.observed.toFixed(2)}</strong></span>
      <span>{$language === 'en' ? 'Model output' : 'Sortie du modèle'} <strong>{inspected.predicted.toFixed(2)}</strong></span>
      <span>{$language === 'en' ? 'Residual' : 'Résidu'} <strong>{inspected.residual.toFixed(2)}</strong></span>
    </div>
    {#if inspectTime > trainingEnd}
      <p class="warning">{$language === 'en' ? 'Outside the illustrated training domain: the displayed curve is not evidence of generalization.' : "Hors du domaine d’apprentissage illustré : la courbe affichée ne démontre pas une généralisation."}</p>
    {/if}
  </div>

  <ChartFrame width={420} height={260} margin={{ top: 16, right: 16, bottom: 50, left: 60 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
      <rect x="0" y="0" width={xScale(trainingEnd)} height={innerHeight} class="training-domain" />
      <!-- Observé (données avec bump) -->
      {#each observed as c, i}
        <circle cx={xScale(times[i])} cy={yScale(c)} r="2.5" fill="#ef4444" opacity="0.8" />
      {/each}

      <!-- ODE pure -->
      <polyline
        fill="none"
        stroke="#0ea5e9"
        stroke-width={mode === 'white' ? 3 : 2}
        stroke-dasharray="5 4"
        opacity={mode === 'black' ? 0.3 : 1}
        points={baseline.map((c, i) => `${xScale(times[i])},${yScale(c)}`).join(' ')}
      />

      <!-- NN corrigé -->
      {#if mode !== 'white'}
        <polyline
          fill="none"
          stroke={mode === 'grey' ? '#22c55e' : '#8b5cf6'}
          stroke-width="3"
          class:glow={mode === 'grey'}
          points={(mode === 'grey' ? hybridIllustration : blackIllustration)
            .map((c, i) => `${xScale(times[i])},${yScale(c)}`)
            .join(' ')}
        />
      {/if}

      <line x1={xScale(inspectTime)} x2={xScale(inspectTime)} y1="0" y2={innerHeight} class="probe" />
      <circle cx={xScale(inspectTime)} cy={yScale(inspected.predicted)} r="4.5" class="probe-point" />

      <Axis orient="bottom" scale={xScale} length={innerWidth} label={$language === 'en' ? 'Time (h)' : 'Temps (h)'} />
      <g transform="translate(-8,0)">
        <Axis orient="left" scale={yScale} length={innerHeight} label={$language === 'en' ? 'Concentration (mg/L)' : 'Concentration (mg/L)'} />
      </g>
    </svelte:fragment>
  </ChartFrame>

  <div class="legend">
    {#if mode === 'white'}
      dC/dt = -k · C &nbsp; {$language === 'en' ? '(no correction: the bump is missed)' : '(pas de correction → le “bump” est manqué)'}
    {:else if mode === 'grey'}
      dC/dt = -k · C + NN(t) &nbsp; {$language === 'en' ? '(constructed hybrid output; no network is fitted here)' : '(sortie hybride construite ; aucun réseau n’est ajusté ici)'}
    {:else}
      {$language === 'en' ? 'NN(t) alone (black box): constructed fit in-domain, then an arbitrary drift illustrates unconstrained extrapolation; no network is fitted.' : 'NN(t) seul (boîte noire) : ajustement construit dans le domaine, puis dérive arbitraire pour illustrer une extrapolation non contrainte ; aucun réseau n’est ajusté.'}
    {/if}
  </div>
</div>

<style>
  .neural {
    display: grid;
    gap: 10px;
  }
  .toggles {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .experiment { display: grid; gap: 6px; }
  .experiment label { display: grid; grid-template-columns: 1fr auto; gap: 4px 10px; font-size: var(--text-sm); }
  .experiment input { grid-column: 1 / -1; width: 100%; accent-color: var(--accent-ai); }
  .experiment strong { font-variant-numeric: tabular-nums; }
  .readout { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
  .readout span { display: grid; gap: 2px; padding: 6px; background: var(--bg-secondary); color: var(--text-secondary); font-size: var(--text-xs); text-align: center; }
  .readout strong { color: var(--text-primary); }
  .warning { margin: 0; color: var(--warning-text, #9a6700); font-size: var(--text-xs); }
  button {
    border: 1px solid var(--border-subtle);
    background: var(--bg-tertiary);
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
  }
  button.active {
    background: #2563eb;
    color: var(--bg-tertiary);
    border-color: #2563eb;
  }
  .legend {
    background: var(--bg-secondary);
    border: 1px solid var(--bg-secondary);
    padding: 10px;
    border-radius: 10px;
    color: var(--text-primary);
  }
  .glow {
    filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.6));
  }
  .training-domain { fill: color-mix(in srgb, var(--accent-ai) 7%, transparent); }
  .probe { stroke: var(--text-secondary); stroke-width: 1; stroke-dasharray: 3 3; }
  .probe-point { fill: var(--accent-ai); stroke: var(--bg-primary); stroke-width: 1.5; }
  @media (max-width: 480px) { .readout { grid-template-columns: 1fr; } }
</style>

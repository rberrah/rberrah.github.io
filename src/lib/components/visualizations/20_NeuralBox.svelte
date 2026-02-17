<script>
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';

  const times = Array.from({ length: 101 }, (_, i) => i * 0.2); // 0..20 h
  const baseline = times.map((t) => 10 * Math.exp(-0.35 * t)); // ODE pure
  const bump = times.map((t) => 2.2 * Math.exp(-0.5 * Math.pow((t - 6) / 1.4, 2))); // absorption complexe
  const observed = times.map((t, i) => baseline[i] + bump[i] + 0.25 * Math.sin(i * 0.8));
  const nnFit = times.map((t, i) => baseline[i] + bump[i] * 0.98 + 0.12 * Math.sin(t * 2));

  let mode = 'white'; // white | grey | black
  const xScale = scaleLinear().domain([0, 20]).range([0, 320]);
  const yScale = scaleLinear()
    .domain([0, Math.max(...observed) * 1.05])
    .range([200, 0]);
</script>

<div class="neural">
  <div class="toggles">
    <button class:active={mode === 'white'} on:click={() => (mode = 'white')}>White box (ODE)</button>
    <button class:active={mode === 'grey'} on:click={() => (mode = 'grey')}>Grey box (ODE + NN)</button>
    <button class:active={mode === 'black'} on:click={() => (mode = 'black')}>Black box (NN seule)</button>
  </div>

  <ChartFrame width={420} height={260} margin={{ top: 16, right: 16, bottom: 50, left: 60 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
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
          points={(mode === 'grey' ? nnFit : observed)
            .map((c, i) => `${xScale(times[i])},${yScale(c)}`)
            .join(' ')}
        />
      {/if}

      <Axis orient="bottom" scale={xScale} length={innerWidth} label="Temps (h)" />
      <g transform="translate(-8,0)">
        <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
      </g>
    </svelte:fragment>
  </ChartFrame>

  <div class="legend">
    {#if mode === 'white'}
      dC/dt = -k · C &nbsp; (pas de correction → le “bump” est manqué)
    {:else if mode === 'grey'}
      dC/dt = -k · C + NN(t) &nbsp; (le NN apprend la portion manquante et colle au bump)
    {:else}
      NN(t) seul (boîte noire) : flexible mais interprétabilité minimale.
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
  button {
    border: 1px solid #cbd5e1;
    background: #fff;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
  }
  button.active {
    background: #2563eb;
    color: #fff;
    border-color: #2563eb;
  }
  .legend {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 10px;
    border-radius: 10px;
    color: #0f172a;
  }
  .glow {
    filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.6));
  }
</style>

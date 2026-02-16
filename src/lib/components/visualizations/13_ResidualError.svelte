<script>
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { paddedDomain } from '$lib/charts/domain';

  const base = [
    { t: 0, c: 0 },
    { t: 2, c: 9 },
    { t: 4, c: 7.5 },
    { t: 6, c: 6.5 },
    { t: 8, c: 6.2 },
    { t: 12, c: 5.4 }
  ];

  let mode = 'none';

  /** @param {{t:number,c:number}} p */
  const jittered = (p) => {
    if (mode === 'none') return p.c;
    if (mode === 'low') return p.c * (1 + 0.05 * (Math.random() - 0.5));
    return p.c * (1 + 0.12 * (Math.random() - 0.5)) + 0.1 * (Math.random() - 0.5);
  };

  $: points = base.map((p) => ({ ...p, dv: Math.max(0, jittered(p)) }));

  $: xScale = scaleLinear().domain([0, Math.max(...base.map((p) => p.t))]).range([0, 300]);
  $: yScale = scaleLinear()
    .domain(paddedDomain([...points.map((p) => p.dv), ...base.map((p) => p.c)], 0.2))
    .range([160, 0]);
</script>

<div class="res">
  <div class="controls">
    <button class:active={mode === 'none'} on:click={() => (mode = 'none')}>Sans erreur</button>
    <button class:active={mode === 'low'} on:click={() => (mode = 'low')}>Faible</button>
    <button class:active={mode === 'high'} on:click={() => (mode = 'high')}>Forte</button>
  </div>
  <ChartFrame width={360} height={220} margin={{ top: 16, right: 12, bottom: 40, left: 60 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
      <polyline
        fill="none"
        stroke="#2563eb"
        stroke-width="3"
        points={base.map((p) => `${xScale(p.t)},${yScale(p.c)}`).join(' ')}
      />
      {#each points as p}
        <circle cx={xScale(p.t)} cy={yScale(p.dv)} r="4" fill="#ef4444" />
      {/each}
      <Axis orient="bottom" scale={xScale} length={innerWidth} label="Temps (h)" />
      <g transform={`translate(-8,0)`}>
        <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
      </g>
    </svelte:fragment>
  </ChartFrame>
</div>

<style>
  .res {
    display: grid;
    gap: 10px;
  }
  .controls {
    display: flex;
    gap: 8px;
  }
  button {
    border: 1px solid #cbd5e1;
    background: #fff;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
  }
  .active {
    background: #2563eb;
    color: #fff;
    border-color: #2563eb;
  }
</style>

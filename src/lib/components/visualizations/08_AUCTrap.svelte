<script>
  import { aucTrap } from '$lib/utils/math';
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { paddedDomain } from '$lib/charts/domain';

  let points = [
    { t: 0, c: 0 },
    { t: 1, c: 8 },
    { t: 3, c: 6 },
    { t: 6, c: 3 },
    { t: 12, c: 1 }
  ];

  let mode = 'rich';
  $: sampled = mode === 'rich' ? points : points.filter((_, i) => i % 2 === 0);
  $: auc = aucTrap(sampled).toFixed(2);
  $: xScale = scaleLinear().domain([0, Math.max(...sampled.map((p) => p.t))]).range([0, 300]);
  $: yScale = scaleLinear().domain(paddedDomain(sampled.map((p) => p.c), 0.2)).range([160, 0]);
</script>

<div class="auc">
  <div class="controls">
    <button class:active={mode === 'rich'} on:click={() => (mode = 'rich')}>Rich</button>
    <button class:active={mode === 'sparse'} on:click={() => (mode = 'sparse')}>Sparse</button>
    <span>AUC: {auc}</span>
  </div>
  <ChartFrame width={380} height={240} margin={{ top: 16, right: 14, bottom: 40, left: 60 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
      {#if sampled.length}
        <polygon
          fill="rgba(37,99,235,0.15)"
          stroke="none"
          points={`${sampled.map((p) => `${xScale(p.t)},${yScale(p.c)}`).join(' ')} ${xScale(sampled[sampled.length - 1].t)},${yScale(0)} 0,${yScale(0)}`}
        />
      {/if}
      <polyline
        fill="none"
        stroke="#2563eb"
        stroke-width="2.5"
        points={sampled.map((p) => `${xScale(p.t)},${yScale(p.c)}`).join(' ')}
      />
      {#each sampled as p}
        <circle cx={xScale(p.t)} cy={yScale(p.c)} r="4" fill="#2563eb" />
      {/each}
      <Axis orient="bottom" scale={xScale} length={innerWidth} label="Temps (h)" />
      <g transform={`translate(-8,0)`}>
        <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
      </g>
    </svelte:fragment>
  </ChartFrame>
</div>

<style>
  .auc {
    display: grid;
    gap: 10px;
  }
  .controls {
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 700;
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
    color: white;
    border-color: #2563eb;
  }
</style>

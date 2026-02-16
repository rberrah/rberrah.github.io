<script>
  import { percentile } from '$lib/utils/math';
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { paddedDomain } from '$lib/charts/domain';

  const obs = [
    { t: 0, c: 0 },
    { t: 2, c: 9 },
    { t: 4, c: 7.5 },
    { t: 6, c: 6.5 },
    { t: 8, c: 6.2 },
    { t: 12, c: 5.4 }
  ];
  let bins = 6;

  const sims = Array.from({ length: 200 }, (_, i) =>
    obs.map((o, j) => ({
      t: o.t,
      c: Math.max(0, o.c * (0.8 + 0.4 * (((i + j * 7) % 11) / 10)))
    }))
  );

  $: bands = obs.map((o, idx) => {
    const vals = sims.map((s) => s[idx].c);
    return {
      t: o.t,
      p5: percentile(vals, 5),
      p50: percentile(vals, 50),
      p95: percentile(vals, 95)
    };
  });

  $: xScale = scaleLinear().domain([0, Math.max(...obs.map((o) => o.t))]).range([0, 300]);
  $: yScale = scaleLinear().domain(paddedDomain([...bands.map((b) => b.p95), ...obs.map((o) => o.c)], 0.2)).range([160, 0]);
</script>

<div class="vpc">
  <div class="controls">
    <label>Bins <input type="range" min="4" max="12" step="1" bind:value={bins} /></label>
    <span>{bins} bins</span>
  </div>
  <ChartFrame width={360} height={220} margin={{ top: 16, right: 12, bottom: 40, left: 60 }} xScale={xScale} yScale={yScale} grid={true}>
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
      {#each obs as p}
        <circle cx={xScale(p.t)} cy={yScale(p.c)} r="4" fill="#ef4444" />
      {/each}
      <Axis orient="bottom" scale={xScale} length={innerWidth} label="Temps (h)" />
      <g transform={`translate(-8,0)`}>
        <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
      </g>
    </svelte:fragment>
  </ChartFrame>
</div>

<style>
  .vpc {
    display: grid;
    gap: 10px;
  }
  .controls {
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 700;
  }
</style>

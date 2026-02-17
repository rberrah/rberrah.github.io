<script>
  // @ts-nocheck
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

  $: maxT = Math.max(...obs.map((o) => o.t));
  $: binEdges = Array.from({ length: bins + 1 }, (_, i) => (maxT * i) / bins);
  $: bands = binEdges.slice(0, -1).map((edge, i) => {
    const next = binEdges[i + 1];
    const vals = [];
    const times = [];
    sims.forEach((sim) => {
      sim.forEach((pt) => {
        if ((pt.t >= edge && pt.t < next) || (i === bins - 1 && pt.t === next)) {
          vals.push(pt.c);
          times.push(pt.t);
        }
      });
    });
    const tMid = times.length ? times.reduce((a, b) => a + b, 0) / times.length : (edge + next) / 2;
    return {
      t: tMid,
      p5: vals.length ? percentile(vals, 5) : 0,
      p50: vals.length ? percentile(vals, 50) : 0,
      p95: vals.length ? percentile(vals, 95) : 0,
      edge,
      next
    };
  });

  $: xScale = scaleLinear().domain([0, maxT]).range([0, 300]);
  $: yScale = scaleLinear().domain(paddedDomain([...bands.map((b) => b.p95), ...obs.map((o) => o.c)], 0.2)).range([160, 0]);
</script>

<div class="vpc">
  <div class="controls">
    <label>Bins <input type="range" min="4" max="12" step="1" bind:value={bins} /></label>
    <span>{bins} bins</span>
    <small>Regroupe les temps pour stabiliser les percentiles.</small>
  </div>
  <ChartFrame width={360} height={220} margin={{ top: 16, right: 12, bottom: 40, left: 60 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
      {#each binEdges as e}
        <line x1={xScale(e)} x2={xScale(e)} y1={0} y2={innerHeight} stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="1" />
      {/each}
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
    flex-wrap: wrap;
  }
  small {
    font-weight: 400;
    color: #475569;
  }
</style>

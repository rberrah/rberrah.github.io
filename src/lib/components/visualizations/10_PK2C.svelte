<script>
  import Slider from '$lib/components/ui/Slider.svelte';
  import { concTwoComp } from '$lib/utils/math';
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { paddedDomain } from '$lib/charts/domain';

  let dose = 150;
  let cl = 6;
  let q = 8;
  let v1 = 15;
  let v2 = 30;
  const times = Array.from({ length: 30 }, (_, i) => i * 0.5);

  $: curve = times.map((t) => ({ t, c: concTwoComp(t, dose, cl, q, v1, v2) }));
  $: xScale = scaleLinear().domain([0, Math.max(...times)]).range([0, 300]);
  $: yScale = scaleLinear().domain(paddedDomain(curve.map((p) => p.c), 0.2)).range([160, 0]);
</script>

<div class="pk2c">
  <div class="controls">
    <Slider label="CL (L/h)" min={2} max={20} step={0.5} bind:value={cl} />
    <Slider label="Q (L/h)" min={1} max={20} step={0.5} bind:value={q} />
    <Slider label="V1 (L)" min={5} max={40} step={1} bind:value={v1} />
    <Slider label="V2 (L)" min={10} max={100} step={1} bind:value={v2} />
  </div>
  <ChartFrame width={380} height={240} margin={{ top: 16, right: 14, bottom: 40, left: 60 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
      <polyline
        fill="none"
        stroke="#2563eb"
        stroke-width="3"
        points={curve.map((p) => `${xScale(p.t)},${yScale(p.c)}`).join(' ')}
      />
      <Axis orient="bottom" scale={xScale} length={innerWidth} label="Temps (h)" />
      <g transform={`translate(-8,0)`}>
        <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
      </g>
    </svelte:fragment>
  </ChartFrame>
</div>

<style>
  .pk2c {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
  }
</style>

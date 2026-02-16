<script>
  import Slider from '$lib/components/ui/Slider.svelte';
  import { concMono, halfLifeFromClV, aucTrap } from '$lib/utils/math';
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { paddedDomain } from '$lib/charts/domain';

  let dose = 150;
  let v = 25;
  let cl = 6;
  const times = Array.from({ length: 25 }, (_, i) => i);

  $: curve = times.map((t) => ({ t, c: concMono(t, dose, cl, v) }));
  $: cmax = (dose / v).toFixed(2);
  $: auc = aucTrap(curve).toFixed(2);
  $: half = halfLifeFromClV(cl, v).toFixed(2);
  $: xScale = scaleLinear().domain([0, Math.max(...times)]).range([0, 300]);
  $: yScale = scaleLinear().domain(paddedDomain(curve.map((p) => p.c), 0.2)).range([160, 0]);
</script>

<div class="pk1c">
  <div class="controls">
    <Slider label="Dose (mg)" min={25} max={400} step={5} bind:value={dose} />
    <Slider label="Volume (L)" min={10} max={80} step={1} bind:value={v} />
    <Slider label="Clairance (L/h)" min={1} max={20} step={0.5} bind:value={cl} />
    <div class="stats">
      <div>AUC {auc}</div>
      <div>Cmax {cmax}</div>
      <div>t½ {half} h</div>
    </div>
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
  .pk1c {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
    align-items: center;
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    font-weight: 700;
    color: #0f172a;
  }
</style>

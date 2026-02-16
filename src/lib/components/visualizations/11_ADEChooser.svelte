<script>
  import Slider from '$lib/components/ui/Slider.svelte';
  import { simulateOral1C } from '$lib/sim/pk_1c_oral';
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { paddedDomain } from '$lib/charts/domain';

let dose = 200;
let ka = 1.2;
let cl = 6;
let v = 40;
let lag = 0;
let order0 = false;
let transit = false;

  const tEnd = 24;
  const h = 0.1;

  $: curve = order0 ? simulateZeroOrder() : simulateFirstOrder();
  $: concValues = curve.map((p) => p.c);
  $: gutValues = curve.map((p) => p.agut);
  $: xScale = scaleLinear().domain([0, tEnd]).range([0, 300]);
  $: yScale = scaleLinear().domain(paddedDomain(concValues, 0.2)).range([160, 0]);
  $: gutScale = scaleLinear().domain(paddedDomain(gutValues, 0.1)).range([160, 0]);
  $: cmaxPoint = curve.reduce((m, p) => (p.c > m.c ? p : m), { t: 0, c: 0 });

  function simulateFirstOrder() {
    return simulateOral1C({ dose, ka, cl, v, lag, tEnd, h });
  }

function simulateZeroOrder() {
  // simple perfusion zéro ordre : absorption constante sur 2h
  const rate = dose / 2;
  const points = [];
  let Acent = 0;
  for (let t = 0; t <= tEnd; t += h) {
    const k10 = cl / v;
    const inflow = t < 2 ? rate * h : 0;
    Acent += inflow - k10 * Acent * h;
    points.push({ t, c: Acent / v, agut: Math.max(0, dose - rate * t), acent: Acent });
  }
  return points;
}
</script>

<div class="ade">
  <div class="toggles">
    <label><input type="checkbox" bind:checked={order0} /> Ordre 0 (perfusion)</label>
    <label><input type="range" min="0" max="3" step="0.1" bind:value={lag} /> Lag {lag.toFixed(1)} h</label>
  </div>
  <div class="controls">
    <Slider label="Dose" min={50} max={600} step={10} bind:value={dose} />
    <Slider label="Ka (1/h)" min={0.2} max={3} step={0.1} bind:value={ka} />
    <Slider label="CL (L/h)" min={0.5} max={20} step={0.5} bind:value={cl} />
    <Slider label="V (L)" min={5} max={200} step={5} bind:value={v} />
  </div>
  <ChartFrame width={380} height={240} margin={{ top: 20, right: 20, bottom: 40, left: 60 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
      <polyline
        fill="none"
        stroke="#2563eb"
        stroke-width="3"
        points={curve.map((p) => `${xScale(p.t)},${yScale(p.c)}`).join(' ')}
      />
      <polyline
        fill="none"
        stroke="#22c55e"
        stroke-dasharray="4 4"
        stroke-width="2"
        points={curve.map((p) => `${xScale(p.t)},${gutScale(p.agut)}`).join(' ')}
      />
      <circle cx={xScale(cmaxPoint.t)} cy={yScale(cmaxPoint.c)} r="4.5" fill="#ef4444" />
      <text x={xScale(cmaxPoint.t)} y={yScale(cmaxPoint.c) - 8} font-size="10" fill="#ef4444">
        Cmax {cmaxPoint.c.toFixed(2)} mg/L
      </text>
      <Axis orient="bottom" scale={xScale} length={innerWidth} label="Temps (h)" />
      <g transform={`translate(-8,0)`}>
        <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
      </g>
    </svelte:fragment>
  </ChartFrame>
</div>

<style>
  .ade {
    display: grid;
    gap: 10px;
  }
  .toggles {
    display: flex;
    gap: 12px;
    font-weight: 700;
    color: #0f172a;
  }
</style>

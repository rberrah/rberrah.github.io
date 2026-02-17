<script>
  // @ts-nocheck
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
  let infusionDuration = 2;

  const tEnd = 24;
  const h = 0.1;

  $: curve = order0 ? simulateZeroOrder() : simulateFirstOrder();
  $: concValues = curve.map((p) => p.c);
  $: gutValues = curve.map((p) => p.agut);
  $: xScale = scaleLinear().domain([0, tEnd]).range([0, 300]);
  $: yScale = scaleLinear().domain(paddedDomain(concValues, 0.2)).range([160, 0]);
  $: gutScale = scaleLinear().domain(paddedDomain(gutValues, 0.1)).range([160, 0]);
  $: cmaxPoint = curve.reduce((m, p) => (p.c > m.c ? p : m), { t: 0, c: 0 });
  $: auc = trapezoidAUC(curve);
  $: tHalf = (Math.log(2) * v) / cl;

  function simulateFirstOrder() {
    return simulateOral1C({ dose, ka, cl, v, lag, tEnd, h });
  }

  function simulateZeroOrder() {
    const rate = dose / Math.max(infusionDuration, h);
    const points = [];
    let Acent = 0;
    for (let t = 0; t <= tEnd; t += h) {
      const k10 = cl / v;
      const inflow = t < infusionDuration ? rate * h : 0;
      Acent += inflow - k10 * Acent * h;
      points.push({ t, c: Acent / v, agut: Math.max(0, dose - rate * t), acent: Acent });
    }
    return points;
  }

  function trapezoidAUC(arr) {
    let area = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      const dt = arr[i + 1].t - arr[i].t;
      area += ((arr[i].c + arr[i + 1].c) / 2) * dt;
    }
    return area;
  }
</script>

<div class="ade">
  <div class="toggles">
    <label><input type="checkbox" bind:checked={order0} /> Ordre 0 (perfusion)</label>
    {#if order0}
      <Slider label="Durée perf (h)" min={0.5} max={6} step={0.1} bind:value={infusionDuration} />
    {:else}
      <Slider label="Lag (h)" min={0} max={3} step={0.1} bind:value={lag} />
    {/if}
  </div>
  <div class="controls">
    <Slider label="Dose" min={50} max={600} step={10} bind:value={dose} />
    <Slider label="Ka (1/h)" min={0.2} max={3} step={0.1} bind:value={ka} />
    <Slider label="CL (L/h)" min={0.5} max={20} step={0.5} bind:value={cl} />
    <Slider label="V (L)" min={5} max={200} step={5} bind:value={v} />
  </div>
  <ChartFrame width={440} height={280} margin={{ top: 22, right: 20, bottom: 44, left: 66 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
      {#if !order0}
        <rect x={xScale(0)} y={0} width={xScale(lag)} height={innerHeight} fill="rgba(15,23,42,0.05)" />
        <line x1={xScale(lag)} x2={xScale(lag)} y1={0} y2={innerHeight} stroke="#94a3b8" stroke-dasharray="4 4" />
        <text x={xScale(lag) + 4} y={16} font-size="10" fill="#475569">Lag {lag.toFixed(1)} h</text>
      {/if}
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
  <div class="kpis">
    <div><strong>AUC</strong> {auc.toFixed(2)} (mg·h/L)</div>
    <div><strong>Cmax</strong> {cmaxPoint.c.toFixed(2)} mg/L</div>
    <div><strong>Tmax</strong> {cmaxPoint.t.toFixed(2)} h</div>
    <div><strong>t½</strong> {tHalf.toFixed(2)} h</div>
  </div>
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
    flex-wrap: wrap;
  }
  .kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 6px;
    font-size: 0.95rem;
    color: #0f172a;
  }
</style>

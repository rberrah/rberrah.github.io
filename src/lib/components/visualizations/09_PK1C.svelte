<script>
  import Slider from '$lib/components/ui/Slider.svelte';
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { paddedDomain } from '$lib/charts/domain';

  let dose = 150;
  let v = 25;
  let cl = 6;
  let ka = 1.2;
  let tlag = 0.6;

  const times = Array.from({ length: 121 }, (_, i) => i * 0.2); // 0..24h

  $: curve = times.map((t) => ({ t, c: concBateman(t, dose, ka, cl, v, tlag) }));
  $: cmax = Math.max(...curve.map((p) => p.c)).toFixed(2);
  $: tmax = curve.reduce((best, p) => (p.c > best.c ? p : best), { t: 0, c: 0 }).t.toFixed(2);
  $: xScale = scaleLinear().domain([0, Math.max(...times)]).range([0, 300]);
  $: yScale = scaleLinear().domain(paddedDomain(curve.map((p) => p.c), 0.2)).range([160, 0]);

  /**
   * Bateman avec Tlag
   * @param {number} t
   * @param {number} dose
   * @param {number} ka
   * @param {number} cl
   * @param {number} v
   * @param {number} tlag
   */
  function concBateman(t, dose, ka, cl, v, tlag) {
    if (t < tlag) return 0;
    const ke = cl / v;
    if (ka === ke) ka += 1e-6;
    const tt = t - tlag;
    return (dose / v) * (ka / (ka - ke)) * (Math.exp(-ke * tt) - Math.exp(-ka * tt));
  }
</script>

<div class="pk1c">
  <div class="controls">
    <Slider label="Dose (mg)" min={25} max={400} step={5} bind:value={dose} />
    <Slider label="V (L)" min={10} max={80} step={1} bind:value={v} />
    <Slider label="CL (L/h)" min={1} max={20} step={0.5} bind:value={cl} />
    <Slider label="Ka (1/h)" min={0.2} max={3} step={0.05} bind:value={ka} />
    <Slider label="Tlag (h)" min={0} max={3} step={0.1} bind:value={tlag} />
    <div class="stats">
      <div>Cmax {cmax} mg/L</div>
      <div>Tmax {tmax} h</div>
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    font-weight: 700;
    color: #0f172a;
  }
</style>

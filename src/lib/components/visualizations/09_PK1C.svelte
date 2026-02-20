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
  /** @typedef {{t:number, c:number, x:number, y:number}} HoverPoint */

  const times = Array.from({ length: 121 }, (_, i) => i * 0.2); // 0..24h

  $: curve = times.map((t) => ({ t, c: concBateman(t, dose, ka, cl, v, tlag) }));
  $: cmax = Math.max(...curve.map((p) => p.c)).toFixed(2);
  $: tmax = curve.reduce((best, p) => (p.c > best.c ? p : best), { t: 0, c: 0 }).t.toFixed(2);
  $: xScale = scaleLinear().domain([0, Math.max(...times)]).range([0, 300]);
  $: yScale = scaleLinear().domain(paddedDomain(curve.map((p) => p.c), 0.2)).range([160, 0]);
  /** @type {HoverPoint | null} */
  let hover = null;

  /**
   * @param {MouseEvent & { currentTarget: SVGRectElement }} event
   * @param {number} innerWidth
   * @param {number} innerHeight
   */
  function moveTooltip(event, innerWidth, innerHeight) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const t = xScale.invert(x);
    const nearest = curve.reduce((best, p) => (Math.abs(p.t - t) < Math.abs(best.t - t) ? p : best), curve[0]);
    hover = { ...nearest, x: xScale(nearest.t), y: yScale(nearest.c) };
  }

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
  <ChartFrame width={420} height={260} margin={{ top: 18, right: 16, bottom: 46, left: 66 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
      <rect
        class="hoverpane"
        x="0"
        y="0"
        width={innerWidth}
        height={innerHeight}
        fill="transparent"
        role="presentation"
        on:mousemove={(e) => moveTooltip(e, innerWidth, innerHeight)}
        on:mouseleave={() => (hover = null)}
      />
      <polyline
        fill="none"
        stroke="#2563eb"
        stroke-width="3"
        points={curve.map((p) => `${xScale(p.t)},${yScale(p.c)}`).join(' ')}
      />
      <Axis orient="bottom" scale={xScale} length={innerWidth} label="Time (h)" />
      <g transform={`translate(-8,0)`}>
        <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
      </g>

      {#if hover}
        <g>
          <circle cx={hover.x} cy={hover.y} r="4.5" fill="#2563eb" />
          <line x1={hover.x} x2={hover.x} y1={0} y2={innerHeight} stroke="#0ea5e9" stroke-dasharray="3 3" stroke-width="1" />
        </g>
        <foreignObject x={Math.min(innerWidth - 140, Math.max(4, hover.x + 6))} y={14} width="140" height="70">
          <div class="tooltip">
            <div><strong>t</strong> {hover.t.toFixed(2)} h</div>
            <div><strong>C</strong> {hover.c.toFixed(2)} mg/L</div>
          </div>
        </foreignObject>
      {/if}
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
  .hoverpane {
    cursor: crosshair;
  }
  .tooltip {
    background: #0f172a;
    color: #fff;
    padding: 6px 8px;
    border-radius: 8px;
    font-size: 0.85rem;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.2);
  }
</style>

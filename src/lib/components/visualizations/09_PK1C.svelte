<script>
  import Slider from '$lib/components/ui/Slider.svelte';
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import AnimatedPath from '$lib/charts/AnimatedPath.svelte';
  import { scaleLinear } from 'd3-scale';
  import { paddedDomain } from '$lib/charts/domain';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { reducedMotion } from '$lib/motion/reducedMotion';

  let dose = 150;
  let v = 25;
  let cl = 6;
  let ka = 1.2;
  let tlag = 0.6;
  /** @typedef {{t:number, c:number, x:number, y:number}} HoverPoint */

  const times = Array.from({ length: 121 }, (_, i) => i * 0.2); // 0..24h

  $: curve = times.map((t) => ({ t, c: concBateman(t, dose, ka, cl, v, tlag) }));
  $: cmaxPoint = curve.reduce((best, p) => (p.c > best.c ? p : best), { t: 0, c: 0 });
  $: cmax = cmaxPoint.c.toFixed(2);
  $: tmax = cmaxPoint.t.toFixed(2);
  $: xScale = scaleLinear().domain([0, Math.max(...times)]).range([0, 300]);
  $: yScale = scaleLinear().domain(paddedDomain(curve.map((p) => p.c), 0.2)).range([160, 0]);

  // Points projetés en coordonnées SVG (consommés par AnimatedPath).
  $: linePts = curve.map((p) => ({ x: xScale(p.t), y: yScale(p.c) }));
  // Aire AUC : courbe + retour le long de l'axe des abscisses.
  $: areaPts = [
    { x: xScale(0), y: yScale(0) },
    ...linePts,
    { x: xScale(Math.max(...times)), y: yScale(0) }
  ];

  // Marqueur Cmax/Tmax qui glisse en douceur vers sa nouvelle position.
  const marker = tweened({ x: 0, y: 0 }, { duration: 450, easing: cubicOut });
  $: marker.set(
    { x: xScale(cmaxPoint.t), y: yScale(cmaxPoint.c) },
    { duration: $reducedMotion ? 0 : 450 }
  );

  /** @type {HoverPoint | null} */
  let hover = null;

  /**
   * @param {MouseEvent & { currentTarget: SVGRectElement }} event
   */
  function moveTooltip(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const t = xScale.invert(x);
    const nearest = curve.reduce((best, p) => (Math.abs(p.t - t) < Math.abs(best.t - t) ? p : best), curve[0]);
    hover = { ...nearest, x: xScale(nearest.t), y: yScale(nearest.c) };
  }

  /**
   * Bateman avec Tlag
   * @param {number} t @param {number} dose @param {number} ka
   * @param {number} cl @param {number} v @param {number} tlag
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
      <div><span>Cmax</span><strong>{cmax} mg/L</strong></div>
      <div><span>Tmax</span><strong>{tmax} h</strong></div>
    </div>
  </div>
  <ChartFrame width={420} height={260} margin={{ top: 18, right: 16, bottom: 46, left: 66 }} {xScale} {yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
      <!-- Aire AUC ombrée sous la courbe -->
      <AnimatedPath points={areaPts} closed={true} fill="var(--accent-pk)" stroke="none" />

      <!-- Courbe principale animée -->
      <AnimatedPath points={linePts} stroke="var(--accent-pk)" width={3} />

      <Axis orient="bottom" scale={xScale} length={innerWidth} label="Time (h)" />
      <g transform={`translate(-8,0)`}>
        <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
      </g>

      <!-- Marqueur Cmax / Tmax -->
      <g class="cmax-marker">
        <line x1={$marker.x} x2={$marker.x} y1={$marker.y} y2={innerHeight} />
        <circle cx={$marker.x} cy={$marker.y} r="5" />
        <text x={$marker.x} y={Math.max(12, $marker.y - 10)} text-anchor="middle">Cmax</text>
      </g>

      <rect
        class="hoverpane"
        x="0" y="0"
        width={innerWidth} height={innerHeight}
        fill="transparent" role="presentation"
        on:mousemove={moveTooltip}
        on:mouseleave={() => (hover = null)}
      />

      {#if hover}
        <g>
          <circle cx={hover.x} cy={hover.y} r="4.5" fill="var(--accent-pk)" />
          <line x1={hover.x} x2={hover.x} y1={0} y2={innerHeight} stroke="var(--accent-pk)" stroke-dasharray="3 3" stroke-width="1" opacity="0.6" />
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
    gap: 8px;
  }
  .stats div {
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 6px 10px;
  }
  .stats span {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
  }
  .stats strong { color: var(--accent-pk); font-size: 1.05rem; }

  /* L'aire AUC hérite du fill accent mais très atténué. */
  :global(.pk1c path[fill='var(--accent-pk)']) { opacity: 0.12; }

  .cmax-marker circle { fill: var(--accent-pk); stroke: var(--bg-tertiary); stroke-width: 2; }
  .cmax-marker line { stroke: var(--accent-pk); stroke-width: 1; stroke-dasharray: 2 3; opacity: 0.55; }
  .cmax-marker text {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    fill: var(--accent-pk);
    font-weight: 700;
  }

  .hoverpane { cursor: crosshair; }
  .tooltip {
    background: var(--text-primary);
    color: var(--bg-primary);
    padding: 6px 8px;
    border-radius: 8px;
    font-size: 0.85rem;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.2);
  }
</style>

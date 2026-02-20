<script>
  // @ts-nocheck
  import { percentile } from '$lib/utils/math';
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { bin as d3bin } from 'd3-array';
  import { paddedDomain } from '$lib/charts/domain';

  // Observations (temps, concentration)
  const obs = [
    { t: 0, c: 0 },
    { t: 2, c: 9 },
    { t: 4, c: 7.5 },
    { t: 6, c: 6.5 },
    { t: 8, c: 6.2 },
    { t: 12, c: 5.4 }
  ];

  // Simulations simples (200 jeux)
  const pseudo = (i, j) => ((i * 17 + j * 31) % 100) / 100;
  const sims = Array.from({ length: 400 }, (_, i) =>
    obs.map((o, j) => {
      const jitter = (pseudo(i, j) - 0.5) * (o.t === 0 ? 0 : 0.6); // ±0.3 h sauf à t=0
      const t = Math.max(0, o.t + jitter);
      const amp = 0.75 + 0.6 * pseudo(i + 3, j + 5);
      return { t, c: Math.max(0, o.c * amp) };
    })
  );

  let bins = 6;
  let binning = true;

  $: maxT = Math.max(...obs.map((o) => o.t), ...sims.flat().map((p) => p.t));

  // Binning avec d3.bin
  $: binner = d3bin()
    .domain([0, maxT])
    .thresholds(bins)
    .value((d) => d.t);

  $: simFlat = sims.flat();
  $: binned = binner(simFlat).map((bucket) => {
    const vals = bucket.map((d) => d.c);
    const tMid = (bucket.x0 + bucket.x1) / 2;
    return {
      t: tMid,
      p5: vals.length ? percentile(vals, 5) : 0,
      p50: vals.length ? percentile(vals, 50) : 0,
      p95: vals.length ? percentile(vals, 95) : 0,
      x0: bucket.x0,
      x1: bucket.x1,
      count: vals.length
    };
  });

  // Percentiles sans binning (par temps observé)
  const directBands = obs.map((o, idx) => {
    const vals = sims.map((s) => s[idx].c);
    return { t: o.t, p5: percentile(vals, 5), p50: percentile(vals, 50), p95: percentile(vals, 95) };
  });

  $: activeBands = binning ? binned : directBands;

  $: xScale = scaleLinear().domain([0, maxT]).range([0, 320]);
  $: yScale = scaleLinear()
    .domain(paddedDomain([...activeBands.map((b) => b.p95), ...obs.map((o) => o.c)], 0.2))
    .range([200, 0]);

  let hover = null;
  function handleMove(event, innerWidth, innerHeight) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const tTarget = xScale.invert(x);
    const arr = activeBands;
    if (!arr.length) return (hover = null);
    const nearest = arr.reduce((best, d) => (Math.abs(d.t - tTarget) < Math.abs(best.t - tTarget) ? d : best), arr[0]);
    hover = {
      t: nearest.t,
      p50: nearest.p50,
      p5: nearest.p5,
      p95: nearest.p95,
      x: xScale(nearest.t),
      y: yScale(nearest.p50)
    };
  }
</script>

<div class="vpc">
  <div class="controls">
    <label>Bins <input type="range" min="4" max="12" step="1" bind:value={bins} /></label>
    <span>{bins} bins</span>
    <label class="toggle">
      <input type="checkbox" bind:checked={binning} />
      Binning on
    </label>
    <small>Binning groups times to stabilize simulated percentiles.</small>
  </div>

  {#if binning}
    <div class="bininfo">
      {#each binned as b}
        <span>{b.count ?? 0} pts @ {b.x0.toFixed(1)}–{b.x1.toFixed(1)} h</span>
      {/each}
    </div>
  {/if}

  <ChartFrame width={420} height={260} margin={{ top: 16, right: 12, bottom: 50, left: 60 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
      <rect
        class="hoverpane"
        x="0"
        y="0"
        width={innerWidth}
        height={innerHeight}
        fill="transparent"
        role="presentation"
        on:mousemove={(e) => handleMove(e, innerWidth, innerHeight)}
        on:mouseleave={() => (hover = null)}
      />
      {#if binning}
        {#each binned as b}
          <line x1={xScale(b.x0)} x2={xScale(b.x0)} y1={0} y2={innerHeight} stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="1" />
        {/each}
      {/if}

      <polygon
        fill="rgba(59,130,246,0.16)"
        stroke="none"
        points={`${activeBands.map((d) => `${xScale(d.t)},${yScale(d.p95)}`).join(' ')} ${[...activeBands]
          .reverse()
          .map((d) => `${xScale(d.t)},${yScale(d.p5)}`)
          .join(' ')}`}
      />

      <polyline
        fill="none"
        stroke="#2563eb"
        stroke-width="2.5"
        points={activeBands.map((d) => `${xScale(d.t)},${yScale(d.p50)}`).join(' ')}
      />

      {#each obs as p}
        <circle cx={xScale(p.t)} cy={yScale(p.c)} r="4" fill="#ef4444" />
      {/each}

      <Axis orient="bottom" scale={xScale} length={innerWidth} label="Temps (h)" />
      <g transform="translate(-8,0)">
        <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
      </g>

      {#if hover}
        <g>
          <line x1={hover.x} x2={hover.x} y1={0} y2={innerHeight} stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="3 3" />
          <circle cx={hover.x} cy={hover.y} r="5" fill="#0ea5e9" opacity="0.8" />
        </g>
        <foreignObject x={Math.min(innerWidth - 140, Math.max(4, hover.x + 6))} y={12} width="140" height="70">
          <div class="tooltip">
            <div><strong>t</strong> {hover.t.toFixed(2)} h</div>
            <div>P50 {hover.p50.toFixed(2)} mg/L</div>
            <div>P10–P90 {hover.p5.toFixed(2)} – {hover.p95.toFixed(2)}</div>
          </div>
        </foreignObject>
      {/if}
    </svelte:fragment>
  </ChartFrame>

    <div class="note">
      If red points leave the blue tunnel (p10–p90), the model is biased or binning is inappropriate.
    </div>
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
  .bininfo {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 0.85rem;
    color: #334155;
    margin-bottom: 6px;
  }
  .note {
    font-size: 0.95rem;
    color: #0f172a;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 8px 10px;
    border-radius: 10px;
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

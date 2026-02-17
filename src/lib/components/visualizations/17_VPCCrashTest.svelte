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
      x1: bucket.x1
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
</script>

<div class="vpc">
  <div class="controls">
    <label>Bins <input type="range" min="4" max="12" step="1" bind:value={bins} /></label>
    <span>{bins} bins</span>
    <label class="toggle">
      <input type="checkbox" bind:checked={binning} />
      Binning actif
    </label>
    <small>Le binning regroupe les temps pour stabiliser les percentiles simulés.</small>
  </div>

  <ChartFrame width={420} height={260} margin={{ top: 16, right: 12, bottom: 50, left: 60 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
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
    </svelte:fragment>
  </ChartFrame>

  <div class="note">
    Si les points rouges sortent du “tunnel” bleu (p10–p90), le modèle est rejeté ou le binning est mal choisi.
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
  .note {
    font-size: 0.95rem;
    color: #0f172a;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 8px 10px;
    border-radius: 10px;
  }
</style>

<script>
  // @ts-nocheck
  import { percentile } from '$lib/utils/math';
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { paddedDomain } from '$lib/charts/domain';
  import { language } from '$lib/stores/language';

  const TIMES = [0.5, 1, 2, 4, 8, 12, 24];
  const SUBJECTS = 60;
  const REPLICATES = 500;
  const DOSE = 500;
  const TRUE_MODEL = { cl: 5, v: 50, omegaCl: 0.3, omegaV: 0.2, prop: 0.15, add: 0.1 };

  let bins = 6;
  let modelCl = 5;
  let modelOmegaCl = 0.3;
  let modelProp = 0.15;

  /** @param {number} seed */
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** @param {() => number} rng */
  function normal(rng) {
    const u = Math.max(rng(), 1e-12);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
  }

  /** @param {number} seed @param {{cl:number,v:number,omegaCl:number,omegaV:number,prop:number,add:number}} model */
  function simulateDataset(seed, model) {
    const rng = mulberry32(seed);
    const rows = [];
    for (let id = 0; id < SUBJECTS; id += 1) {
      const cl = model.cl * Math.exp(model.omegaCl * normal(rng));
      const v = model.v * Math.exp(model.omegaV * normal(rng));
      for (const t of TIMES) {
        const pred = (DOSE / v) * Math.exp(-(cl / v) * t);
        const dv = Math.max(0, pred * (1 + model.prop * normal(rng)) + model.add * normal(rng));
        rows.push({ t, c: dv });
      }
    }
    return rows;
  }

  /** @param {number} t @param {number} count */
  function binIndex(t, count) {
    const timeIndex = TIMES.indexOf(t);
    return Math.min(count - 1, Math.floor((timeIndex * count) / TIMES.length));
  }

  /** @param {{t:number,c:number}[]} rows @param {number} count */
  function summarize(rows, count) {
    return Array.from({ length: count }, (_, index) => {
      const bucket = rows.filter((row) => binIndex(row.t, count) === index);
      const values = bucket.map((row) => row.c);
      const times = TIMES.filter((t) => binIndex(t, count) === index);
      return {
        t: times.reduce((sum, value) => sum + value, 0) / times.length,
        p5: percentile(values, 5),
        p50: percentile(values, 50),
        p95: percentile(values, 95),
        count: values.length,
        from: times[0],
        to: times[times.length - 1]
      };
    });
  }

  const observed = simulateDataset(20261010, TRUE_MODEL);
  $: fittedModel = { ...TRUE_MODEL, cl: modelCl, omegaCl: modelOmegaCl, prop: modelProp };
  $: observedPercentiles = summarize(observed, bins);
  $: replicatePercentiles = Array.from({ length: REPLICATES }, (_, index) =>
    summarize(simulateDataset(9001 + index * 7919, fittedModel), bins)
  );
  $: vpc = observedPercentiles.map((observedBin, index) => {
    const band = (key) => {
      const values = replicatePercentiles.map((replicate) => replicate[index][key]);
      return { low: percentile(values, 5), mid: percentile(values, 50), high: percentile(values, 95) };
    };
    return { ...observedBin, modelP5: band('p5'), modelP50: band('p50'), modelP95: band('p95') };
  });

  $: xScale = scaleLinear().domain([0, 24]).range([0, 360]);
  $: yScale = scaleLinear()
    .domain(paddedDomain(vpc.flatMap((row) => [row.p95, row.modelP95.high]), 0.15))
    .range([210, 0]);

  /** @param {'modelP5'|'modelP50'|'modelP95'} key */
  function ribbonPoints(key) {
    const forward = vpc.map((row) => `${xScale(row.t)},${yScale(row[key].high)}`);
    const backward = [...vpc].reverse().map((row) => `${xScale(row.t)},${yScale(row[key].low)}`);
    return [...forward, ...backward].join(' ');
  }
</script>

<div class="vpc">
  <div class="controls">
    <label>
      <span>{$language === 'en' ? 'Model CL (L/h)' : 'CL du modèle (L/h)'}</span>
      <strong>{modelCl.toFixed(1)}</strong>
      <input type="range" min="3" max="8" step="0.25" bind:value={modelCl} />
    </label>
    <label>
      <span>{$language === 'en' ? 'Model omega CL' : 'Oméga CL du modèle'}</span>
      <strong>{(modelOmegaCl * 100).toFixed(0)}%</strong>
      <input type="range" min="0.05" max="0.6" step="0.05" bind:value={modelOmegaCl} />
    </label>
    <label>
      <span>{$language === 'en' ? 'Proportional residual SD' : 'SD résiduelle proportionnelle'}</span>
      <strong>{(modelProp * 100).toFixed(0)}%</strong>
      <input type="range" min="0.05" max="0.35" step="0.025" bind:value={modelProp} />
    </label>
    <label>
      <span>{$language === 'en' ? 'Time bins' : 'Classes de temps'}</span>
      <strong>{bins}</strong>
      <input type="range" min="4" max="7" step="1" bind:value={bins} />
    </label>
  </div>

  <div class="design">
    {$language === 'en'
      ? `${REPLICATES} replicated trials of ${SUBJECTS} patients, simulated from the candidate one-compartment model with the observed design. The observed dataset was generated independently from the reference model (CL 5 L/h, omega CL 30%, residual SD 15%).`
      : `${REPLICATES} essais répliqués de ${SUBJECTS} patients, simulés depuis le modèle candidat à un compartiment avec le plan observé. Le jeu observé a été généré indépendamment depuis le modèle de référence (CL 5 L/h, oméga CL 30 %, SD résiduelle 15 %).`}
  </div>

  <div class="bininfo">
    {#each vpc as row}
      <span>{row.count} obs · {row.from}–{row.to} h</span>
    {/each}
  </div>

  <ChartFrame width={470} height={285} margin={{ top: 18, right: 18, bottom: 52, left: 70 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
      <polygon points={ribbonPoints('modelP5')} class="ribbon outer" />
      <polygon points={ribbonPoints('modelP95')} class="ribbon outer" />
      <polygon points={ribbonPoints('modelP50')} class="ribbon median" />

      <polyline points={vpc.map((row) => `${xScale(row.t)},${yScale(row.modelP5.mid)}`).join(' ')} class="model outer-line" />
      <polyline points={vpc.map((row) => `${xScale(row.t)},${yScale(row.modelP50.mid)}`).join(' ')} class="model median-line" />
      <polyline points={vpc.map((row) => `${xScale(row.t)},${yScale(row.modelP95.mid)}`).join(' ')} class="model outer-line" />

      {#each vpc as row}
        <circle cx={xScale(row.t)} cy={yScale(row.p5)} r="4" class="observed outer-point" />
        <circle cx={xScale(row.t)} cy={yScale(row.p50)} r="4.5" class="observed median-point" />
        <circle cx={xScale(row.t)} cy={yScale(row.p95)} r="4" class="observed outer-point" />
      {/each}

      <Axis orient="bottom" scale={xScale} length={innerWidth} label={$language === 'en' ? 'Time (h)' : 'Temps (h)'} />
      <g transform="translate(-8,0)">
        <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
      </g>
    </svelte:fragment>
  </ChartFrame>

  <div class="legend" aria-label={$language === 'en' ? 'VPC legend' : 'Légende de la VPC'}>
    <span><i class="swatch median-band"></i>{$language === 'en' ? '90% simulation interval for model P50' : 'Intervalle de simulation à 90 % du P50 modèle'}</span>
    <span><i class="swatch outer-band"></i>{$language === 'en' ? '90% simulation intervals for model P5/P95' : 'Intervalles de simulation à 90 % des P5/P95 modèle'}</span>
    <span><i class="dot"></i>{$language === 'en' ? 'Observed P5/P50/P95' : 'P5/P50/P95 observés'}</span>
  </div>

  <p class="note">
    {$language === 'en'
      ? 'A repeated or structured discrepancy is compatible with model, variability, residual-error, design or binning misspecification. A VPC does not identify a unique cause by itself.'
      : "Un écart répété ou structuré peut être compatible avec une mauvaise spécification du modèle, de la variabilité, de l’erreur résiduelle, du plan ou des classes. Une VPC n’identifie pas seule une cause unique."}
  </p>
</div>

<style>
  .vpc { display: grid; gap: 10px; }
  .controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; }
  label { display: grid; grid-template-columns: 1fr auto; gap: 4px 8px; font-size: var(--text-sm); font-weight: 700; }
  label span { color: var(--text-secondary); }
  label input { grid-column: 1 / -1; width: 100%; }
  .design, .note { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  .design { padding: 8px 10px; background: var(--bg-secondary); border-radius: var(--radius); }
  .bininfo, .legend { display: flex; flex-wrap: wrap; gap: 6px 12px; color: var(--text-secondary); font-size: var(--text-xs); }
  .ribbon { stroke: none; }
  .ribbon.outer { fill: rgba(14, 165, 233, 0.15); }
  .ribbon.median { fill: rgba(37, 99, 235, 0.24); }
  .model { fill: none; }
  .outer-line { stroke: #0ea5e9; stroke-width: 1.4; stroke-dasharray: 4 3; }
  .median-line { stroke: #2563eb; stroke-width: 2.2; }
  .observed { stroke: var(--bg-primary); stroke-width: 1.2; }
  .outer-point { fill: #b91c1c; }
  .median-point { fill: #7f1d1d; }
  .legend span { display: inline-flex; align-items: center; gap: 6px; }
  .swatch { width: 20px; height: 9px; display: inline-block; border-radius: 2px; }
  .median-band { background: rgba(37, 99, 235, 0.35); border: 1px solid #2563eb; }
  .outer-band { background: rgba(14, 165, 233, 0.22); border: 1px dashed #0ea5e9; }
  .dot { width: 9px; height: 9px; border-radius: 50%; background: #991b1b; display: inline-block; }
</style>

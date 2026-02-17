<script>
  // @ts-nocheck
  import Slider from '$lib/components/ui/Slider.svelte';
  import { concMono } from '$lib/utils/math';
  import { generateProfiles } from '$lib/sim/variability';
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { paddedDomain } from '$lib/charts/domain';

  /** @type {'sans' | 'faible' | 'forte'} */
  let preset = 'faible';
  let omega = 0.2;
  let kappa = 0;
  let sigma = 0.1;
  let iivEnabled = true;
  let iovEnabled = true;
  let resEnabled = true;

  const times = Array.from({ length: 25 }, (_, i) => i);
  const base = { dose: 100, cl: 6, v: 25 };

  const presets = {
    sans: { omega: 0, sigma: 0, kappa: 0 },
    faible: { omega: 0.2, sigma: 0.1, kappa: 0 },
    forte: { omega: 0.6, sigma: 0.3, kappa: 0.3 }
  };

  /** @param {number} t */
  const structFn = (t) => concMono(t, base.dose, base.cl, base.v);

  function applyPreset(value) {
    preset = value;
    const p = presets[value];
    omega = p.omega;
    sigma = p.sigma;
    kappa = p.kappa;
  }

  applyPreset(preset);

  $: profiles = generateProfiles({
    n: 120,
    times,
    structFn,
    omega: iivEnabled ? omega : 0,
    kappa: iovEnabled ? kappa : 0,
    sigmaProp: resEnabled ? sigma : 0,
    sigmaAdd: resEnabled ? 0 : 0,
    seed: 42
  });

  $: median = times.map((t, idx) => {
    const vals = profiles.map((p) => p[idx].dv);
    const sorted = [...vals].sort((a, b) => a - b);
    const mid = sorted[Math.floor(sorted.length / 2)];
    return { t, c: mid };
  });

  $: cmaxList = profiles.map((p) => Math.max(...p.map((pt) => pt.dv)));
  $: aucList = profiles.map((p) => {
    let auc = 0;
    for (let i = 1; i < p.length; i++) {
      const dt = p[i].t - p[i - 1].t;
      auc += ((p[i].dv + p[i - 1].dv) / 2) * dt;
    }
    return auc;
  });
  $: cvCmax = (std(cmaxList) / mean(cmaxList)) * 100;
  $: cvAuc = (std(aucList) / mean(aucList)) * 100;

  $: flat = profiles.flat();
  $: xScale = scaleLinear().domain([0, Math.max(...times)]).range([0, 300]);
  $: yScale = scaleLinear().domain(paddedDomain(flat.map((p) => p.dv), 0.2)).range([160, 0]);

  /** @param {number[]} arr */
  function mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  /** @param {number[]} arr */
  function std(arr) {
    const m = mean(arr);
    const v = mean(arr.map((x) => (x - m) ** 2));
    return Math.sqrt(v);
  }
</script>

<div class="var">
  <div class="controls">
    <label>
      Preset
      <select bind:value={preset} on:change={(e) => applyPreset(e.target.value)}>
        <option value="sans">Sans variabilité</option>
        <option value="faible">Faible</option>
        <option value="forte">Forte</option>
      </select>
    </label>
    <Slider label="omega (IIV)" min={0} max={1} step={0.05} bind:value={omega} />
    <Slider label="kappa (IOV)" min={0} max={1} step={0.05} bind:value={kappa} />
    <Slider label="sigma (résiduel prop)" min={0} max={0.5} step={0.02} bind:value={sigma} />
    <label class="toggle"><input type="checkbox" bind:checked={iivEnabled} /> IIV on/off</label>
    <label class="toggle"><input type="checkbox" bind:checked={iovEnabled} /> IOV on/off</label>
    <label class="toggle"><input type="checkbox" bind:checked={resEnabled} /> Résiduel on/off</label>
  </div>
  <ChartFrame width={380} height={240} margin={{ top: 16, right: 14, bottom: 40, left: 60 }} xScale={xScale} yScale={yScale} grid={true}>
    <svelte:fragment let:xScale let:yScale let:innerWidth let:innerHeight>
      {#each profiles as c, i (i)}
        <polyline
          fill="none"
          stroke="rgba(59,130,246,0.15)"
          stroke-width="1.4"
          points={c.map((p) => `${xScale(p.t)},${yScale(p.dv)}`).join(' ')}
        />
      {/each}
      <polyline
        fill="none"
        stroke="#ef4444"
        stroke-width="3"
        points={median.map((p) => `${xScale(p.t)},${yScale(p.c)}`).join(' ')}
      />
      <Axis orient="bottom" scale={xScale} length={innerWidth} label="Temps (h)" />
      <g transform={`translate(-8,0)`}>
        <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
      </g>
    </svelte:fragment>
  </ChartFrame>
  <div class="kpi">
    <span>CV% Cmax: {cvCmax.toFixed(0)}%</span>
    <span>CV% AUC: {cvAuc.toFixed(0)}%</span>
  </div>
</div>

<style>
  .var {
    display: grid;
    gap: 12px;
  }
  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    align-items: center;
  }
  select {
    width: 100%;
    padding: 6px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
  }
  .toggle {
    display: flex;
    gap: 6px;
    align-items: center;
    font-weight: 700;
  }
</style>

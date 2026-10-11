<script>
  // @ts-nocheck
  import Slider from '$lib/components/ui/Slider.svelte';
  import { concMono } from '$lib/utils/math';
  import { normalSample, seededRng } from '$lib/science/visualizationMath.js';
  import ChartFrame from '$lib/charts/ChartFrame.svelte';
  import Axis from '$lib/charts/Axis.svelte';
  import { scaleLinear } from 'd3-scale';
  import { paddedDomain } from '$lib/charts/domain';
  import { language } from '$lib/stores/language';

  /** @type {'sans' | 'faible' | 'forte'} */
  let preset = 'faible';
  let omega = 0.2;
  let kappa = 0.3;
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

  function applyPreset(value) {
    preset = value;
    const p = presets[value];
    omega = p.omega;
    sigma = p.sigma;
    kappa = p.kappa;
  }

  applyPreset(preset);

  $: profiles = (() => {
    const rng = seededRng(42);
    return Array.from({ length: 120 }, () => {
      const etaCl = iivEnabled ? omega * normalSample(rng) : 0;
      const individualCl = base.cl * Math.exp(etaCl);
      return times.map((t) => {
        const ipred = concMono(t, base.dose, individualCl, base.v);
        const dv = resEnabled ? Math.max(0, ipred * (1 + sigma * normalSample(rng))) : ipred;
        return { t, ipred, dv };
      });
    });
  })();

  // Même patient, trois effets d'occasion standardisés appliqués à CL.
  const occasions = ['1', '2', '3'];
  const occasionZ = [-1.1, 0.1, 1.0];
  $: iovCurves = occasions.map((_, idx) => {
    const occasionCl = base.cl * Math.exp(iovEnabled ? kappa * occasionZ[idx] : 0);
    return {
      cl: occasionCl,
      points: times.map((t) => ({ t, dv: concMono(t, base.dose, occasionCl, base.v) }))
    };
  });
  $: iovMax = Math.max(...iovCurves.flatMap((curve) => curve.points.map((point) => point.dv))) * 1.05;
  $: iovX = (t) => 20 + (t / Math.max(...times)) * 250;
  $: iovY = (value) => 100 - (value / iovMax) * 82;

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
      {$language === 'en' ? 'Preset' : 'Préréglage'}
      <select bind:value={preset} on:change={(e) => applyPreset(e.target.value)}>
        <option value="sans">{$language === 'en' ? 'No variability' : 'Sans variabilité'}</option>
        <option value="faible">{$language === 'en' ? 'Low' : 'Faible'}</option>
        <option value="forte">{$language === 'en' ? 'High' : 'Forte'}</option>
      </select>
    </label>
    <Slider label="omega (IIV)" min={0} max={1} step={0.05} bind:value={omega} />
    <Slider label="kappa (IOV)" min={0} max={1} step={0.05} bind:value={kappa} />
    <Slider label="sigma (résiduel prop)" min={0} max={0.5} step={0.02} bind:value={sigma} />
    <label class="toggle"><input type="checkbox" bind:checked={iivEnabled} /> IIV on/off</label>
    <label class="toggle"><input type="checkbox" bind:checked={iovEnabled} /> IOV on/off</label>
    <label class="toggle"><input type="checkbox" bind:checked={resEnabled} /> {$language === 'en' ? 'Residual' : 'Résiduel'} on/off</label>
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
      <Axis orient="bottom" scale={xScale} length={innerWidth} label={$language === 'en' ? 'Time (h)' : 'Temps (h)'} />
      <g transform={`translate(-8,0)`}>
        <Axis orient="left" scale={yScale} length={innerHeight} label="Concentration (mg/L)" />
      </g>
    </svelte:fragment>
  </ChartFrame>
  <div class="iov">
    <div class="label">IOV ({$language === 'en' ? 'same patient, 3 occasions' : 'même patient, 3 occasions'})</div>
    <svg viewBox="0 0 360 120">
      {#each iovCurves as curve, idx}
        <polyline
          fill="none"
          stroke={idx === 0 ? '#ef4444' : idx === 1 ? '#22c55e' : '#2563eb'}
          stroke-width="2"
          points={curve.points.map((p) => `${iovX(p.t)},${iovY(p.dv)}`).join(' ')}
        />
        <text x="284" y={20 + idx * 18} font-size="10" fill="var(--text-primary)">{$language === 'en' ? 'Occasion' : 'Occasion'} {occasions[idx]} · CL {curve.cl.toFixed(1)}</text>
      {/each}
    </svg>
    <p class="note">{$language === 'en' ? 'The same patient keeps the same population parameters; only the occasion random effect on CL changes.' : 'Le même patient conserve ses paramètres individuels ; seul l’effet aléatoire d’occasion sur CL change.'}</p>
  </div>
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
    border: 1px solid var(--border-subtle);
  }
  .toggle {
    display: flex;
    gap: 6px;
    align-items: center;
    font-weight: 700;
  }
  .iov {
    border: 1px solid var(--bg-secondary);
    border-radius: 10px;
    padding: 8px;
    background: var(--bg-secondary);
  }
  .iov .label {
    font-size: 0.9rem;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  .note { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
</style>

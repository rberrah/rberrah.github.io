<script>
  import Slider from '$lib/components/ui/Slider.svelte';
  import { concMono } from '$lib/utils/math';
  import { generateProfiles } from '$lib/sim/variability';

  /** @type {'sans' | 'faible' | 'forte'} */
  let preset = 'faible';
  let omega = 0.2;
  let kappa = 0;
  let sigma = 0.1;

  const times = Array.from({ length: 25 }, (_, i) => i);
  const base = { dose: 100, cl: 6, v: 25 };

  const presets = {
    sans: { omega: 0, sigma: 0, kappa: 0 },
    faible: { omega: 0.2, sigma: 0.1, kappa: 0 },
    forte: { omega: 0.6, sigma: 0.3, kappa: 0.3 }
  };

  /** @param {number} t */
  const structFn = (t) => concMono(t, base.dose, base.cl, base.v);

  $: ({ omega, sigma, kappa } = { ...presets[preset] });
  $: profiles = generateProfiles({
    n: 120,
    times,
    structFn,
    omega,
    kappa,
    sigmaProp: sigma,
    sigmaAdd: 0,
    seed: 42
  });

  $: median = times.map((t, idx) => {
    const vals = profiles.map((p) => p[idx].dv);
    const sorted = [...vals].sort((a, b) => a - b);
    const mid = sorted[Math.floor(sorted.length / 2)];
    return { t, c: mid };
  });
</script>

<div class="var">
  <div class="controls">
    <label>
      Preset
      <select bind:value={preset}>
        <option value="sans">Sans variabilité</option>
        <option value="faible">Faible</option>
        <option value="forte">Forte</option>
      </select>
    </label>
    <Slider label="ω (IIV)" min={0} max={1} step={0.05} bind:value={omega} />
    <Slider label="κ (IOV)" min={0} max={1} step={0.05} bind:value={kappa} />
    <Slider label="σ (résiduel)" min={0} max={0.5} step={0.02} bind:value={sigma} />
  </div>
  <svg viewBox="0 0 360 200">
    <line x1="30" y1="170" x2="330" y2="170" stroke="#0f172a" />
    <line x1="30" y1="20" x2="30" y2="170" stroke="#0f172a" />
    {#each profiles as c}
      <polyline
        fill="none"
        stroke="rgba(59,130,246,0.25)"
        stroke-width="1.5"
        points={c.map((p) => `${30 + p.t * 12},${170 - p.dv * 8}`).join(' ')}
      ></polyline>
    {/each}
    <polyline
      fill="none"
      stroke="#ef4444"
      stroke-width="3"
      points={median.map((p) => `${30 + p.t * 12},${170 - p.c * 8}`).join(' ')}
    ></polyline>
  </svg>
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
  svg {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }
</style>

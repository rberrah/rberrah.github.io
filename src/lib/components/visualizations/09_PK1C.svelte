<script>
  import Slider from '$lib/components/ui/Slider.svelte';
  import { concMono, halfLifeFromClV, aucTrap } from '$lib/utils/math';

  let dose = 150;
  let v = 25;
  let cl = 6;
  const times = Array.from({ length: 25 }, (_, i) => i);

  $: curve = times.map((t) => ({ t, c: concMono(t, dose, cl, v) }));
  $: cmax = (dose / v).toFixed(2);
  $: auc = aucTrap(curve).toFixed(2);
  $: half = halfLifeFromClV(cl, v).toFixed(2);
</script>

<div class="pk1c">
  <div class="controls">
    <Slider label="Dose (mg)" min={25} max={400} step={5} bind:value={dose} />
    <Slider label="Volume (L)" min={10} max={80} step={1} bind:value={v} />
    <Slider label="Clairance (L/h)" min={1} max={20} step={0.5} bind:value={cl} />
    <div class="stats">
      <div>AUC {auc}</div>
      <div>Cmax {cmax}</div>
      <div>t½ {half} h</div>
    </div>
  </div>
  <svg viewBox="0 0 360 200">
    <line x1="30" y1="170" x2="330" y2="170" stroke="#0f172a" />
    <line x1="30" y1="20" x2="30" y2="170" stroke="#0f172a" />
    <polyline
      fill="none"
      stroke="#2563eb"
      stroke-width="3"
      points={curve.map((p) => `${30 + p.t * 12},${170 - p.c * 12}`).join(' ')}
    ></polyline>
  </svg>
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    font-weight: 700;
    color: #0f172a;
  }
  svg {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }
</style>

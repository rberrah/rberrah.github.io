<script>
  import Slider from '$lib/components/ui/Slider.svelte';
  import { concTwoComp } from '$lib/utils/math';

  let dose = 150;
  let cl = 6;
  let q = 8;
  let v1 = 15;
  let v2 = 30;
  const times = Array.from({ length: 30 }, (_, i) => i * 0.5);

  $: curve = times.map((t) => ({ t, c: concTwoComp(t, dose, cl, q, v1, v2) }));
</script>

<div class="pk2c">
  <div class="controls">
    <Slider label="CL (L/h)" min={2} max={20} step={0.5} bind:value={cl} />
    <Slider label="Q (L/h)" min={1} max={20} step={0.5} bind:value={q} />
    <Slider label="V1 (L)" min={5} max={40} step={1} bind:value={v1} />
    <Slider label="V2 (L)" min={10} max={100} step={1} bind:value={v2} />
  </div>
  <svg viewBox="0 0 360 200">
    <line x1="30" y1="170" x2="330" y2="170" stroke="#0f172a" />
    <line x1="30" y1="20" x2="30" y2="170" stroke="#0f172a" />
    <polyline
      fill="none"
      stroke="#2563eb"
      stroke-width="3"
      points={curve.map((p) => `${30 + p.t * 6},${170 - p.c * 10}`).join(' ')}
    ></polyline>
  </svg>
</div>

<style>
  .pk2c {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
  }
  svg {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }
</style>

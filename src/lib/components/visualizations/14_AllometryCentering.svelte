<script>
  import Slider from '$lib/components/ui/Slider.svelte';
  import { clAllo } from '$lib/utils/math';

  let weight = 70;
  let median = 70;
  let exponent = 0.75;
  let clPop = 6;

  const weights = Array.from({ length: 41 }, (_, i) => 40 + i * 2);

  $: curve = weights.map((w) => ({
    w,
    cl: clPop * Math.pow(w / median, exponent)
  }));

  $: patientCl = clAllo(clPop, weight).toFixed(2);
</script>

<div class="allo">
  <div class="controls">
    <Slider label="Poids patient" min={40} max={140} step={1} bind:value={weight} />
    <Slider label="Médiane" min={50} max={90} step={1} bind:value={median} />
    <Slider label="Exposant" min={0.5} max={1} step={0.05} bind:value={exponent} />
    <div class="stat">CL patient: {patientCl} L/h</div>
  </div>
  <svg viewBox="0 0 360 200">
    <line x1="30" y1="170" x2="330" y2="170" stroke="#0f172a" />
    <line x1="30" y1="20" x2="30" y2="170" stroke="#0f172a" />
    <polyline
      fill="none"
      stroke="#2563eb"
      stroke-width="3"
      points={curve.map((p, i) => `${30 + i * 8},${170 - p.cl * 8}`).join(' ')}
    ></polyline>
    <circle
      cx={30 + ((weight - 40) / 2) * 8}
      cy={170 - Number(patientCl) * 8}
      r="5"
      fill="#ef4444"
    ></circle>
  </svg>
</div>

<style>
  .allo {
    display: grid;
    gap: 10px;
  }
  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
    align-items: center;
  }
  .stat {
    font-weight: 700;
    color: #0f172a;
  }
  svg {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }
</style>

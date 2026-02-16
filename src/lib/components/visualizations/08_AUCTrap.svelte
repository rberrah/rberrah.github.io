<script>
  import { aucTrap } from '$lib/utils/math';

  let points = [
    { t: 0, c: 0 },
    { t: 1, c: 8 },
    { t: 3, c: 6 },
    { t: 6, c: 3 },
    { t: 12, c: 1 }
  ];

  let mode = 'rich';
  $: sampled = mode === 'rich' ? points : points.filter((_, i) => i % 2 === 0);
  $: auc = aucTrap(sampled).toFixed(2);
</script>

<div class="auc">
  <div class="controls">
    <button class:active={mode === 'rich'} on:click={() => (mode = 'rich')}>Rich</button>
    <button class:active={mode === 'sparse'} on:click={() => (mode = 'sparse')}>Sparse</button>
    <span>AUC: {auc}</span>
  </div>
  <svg viewBox="0 0 360 200">
    <polyline
      fill="rgba(37,99,235,0.12)"
      stroke="#2563eb"
      stroke-width="2.5"
      points={sampled.map((p) => `${30 + p.t * 20},${170 - p.c * 10}`).join(' ')}
    ></polyline>
    {#each sampled as p}
      <circle cx={30 + p.t * 20} cy={170 - p.c * 10} r="4" fill="#2563eb"></circle>
    {/each}
  </svg>
</div>

<style>
  .auc {
    display: grid;
    gap: 10px;
  }
  .controls {
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 700;
  }
  button {
    border: 1px solid #cbd5e1;
    background: #fff;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
  }
  .active {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
  }
  svg {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }
</style>

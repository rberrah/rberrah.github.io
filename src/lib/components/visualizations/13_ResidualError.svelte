<script>
  const basePoints = [
    { t: 0, c: 0 },
    { t: 2, c: 9 },
    { t: 4, c: 7.5 },
    { t: 6, c: 6.5 },
    { t: 8, c: 6.2 },
    { t: 12, c: 5.4 }
  ];
  let mode = 'none';

  /** @param {{t:number,c:number}} p */
  const jittered = (p) => {
    if (mode === 'none') return p.c;
    if (mode === 'low') return p.c * (1 + 0.05 * (Math.random() - 0.5));
    return p.c * (1 + 0.12 * (Math.random() - 0.5)) + 0.1 * (Math.random() - 0.5);
  };

  $: points = basePoints.map((p) => ({ ...p, c: jittered(p) }));
</script>

<div class="res">
  <div class="controls">
    <button class:active={mode === 'none'} on:click={() => (mode = 'none')}>Sans erreur</button>
    <button class:active={mode === 'low'} on:click={() => (mode = 'low')}>Faible</button>
    <button class:active={mode === 'high'} on:click={() => (mode = 'high')}>Forte</button>
  </div>
  <svg viewBox="0 0 320 180">
    <line x1="30" y1="150" x2="300" y2="150" stroke="#0f172a" />
    <line x1="30" y1="20" x2="30" y2="150" stroke="#0f172a" />
    <polyline
      fill="none"
      stroke="#2563eb"
      stroke-width="3"
      points={basePoints.map((p) => `${30 + p.t * 20},${150 - p.c * 10}`).join(' ')}
    ></polyline>
    {#each points as p}
      <circle cx={30 + p.t * 20} cy={150 - p.c * 10} r="4" fill="#ef4444"></circle>
    {/each}
  </svg>
</div>

<style>
  .res {
    display: grid;
    gap: 10px;
  }
  .controls {
    display: flex;
    gap: 8px;
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
    color: #fff;
    border-color: #2563eb;
  }
  svg {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }
</style>

<script>
  import { percentile } from '$lib/utils/math';

  const obs = [
    { t: 0, c: 0 },
    { t: 2, c: 9 },
    { t: 4, c: 7.5 },
    { t: 6, c: 6.5 },
    { t: 8, c: 6.2 },
    { t: 12, c: 5.4 }
  ];
  let bins = 6;

  const sims = Array.from({ length: 200 }, (_, i) =>
    obs.map((o, j) => ({
      t: o.t,
      c: Math.max(0, o.c * (0.8 + 0.4 * (((i + j * 7) % 11) / 10)))
    }))
  );

  $: bands = obs.map((o, idx) => {
    const vals = sims.map((s) => s[idx].c);
    return {
      t: o.t,
      p5: percentile(vals, 5),
      p50: percentile(vals, 50),
      p95: percentile(vals, 95)
    };
  });
</script>

<div class="vpc">
  <div class="controls">
    <label>Bins <input type="range" min="4" max="12" step="1" bind:value={bins} /></label>
    <span>{bins} bins</span>
  </div>
  <svg viewBox="0 0 320 180">
    <line x1="30" y1="150" x2="300" y2="150" stroke="#0f172a" />
    <line x1="30" y1="20" x2="30" y2="150" stroke="#0f172a" />
    <polygon
      fill="rgba(59,130,246,0.15)"
      stroke="none"
      points={`${bands.map((d) => `${30 + d.t * 20},${150 - d.p95 * 10}`).join(' ')} ${[...bands]
        .reverse()
        .map((d) => `${30 + d.t * 20},${150 - d.p5 * 10}`)
        .join(' ')}`}
    ></polygon>
    <polyline
      fill="none"
      stroke="#2563eb"
      stroke-width="2.5"
      points={bands.map((d) => `${30 + d.t * 20},${150 - d.p50 * 10}`).join(' ')}
    ></polyline>
    {#each obs as p}
      <circle cx={30 + p.t * 20} cy={150 - p.c * 10} r="4" fill="#ef4444"></circle>
    {/each}
  </svg>
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
  }
  svg {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
  }
</style>

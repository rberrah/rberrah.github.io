<script>
  import Tooltip from '$lib/components/ui/Tooltip.svelte';
  import { clAllo, concMono } from '$lib/utils/math';

  let showWeight = true;
  const people = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    weight: 45 + Math.random() * 50
  }));

  $: sorted = [...people].sort((a, b) => (showWeight ? a.weight - b.weight : a.id - b.id));
  const clPop = 6;
  const dose = 100;
  const v = 25;
  const times = Array.from({ length: 25 }, (_, i) => i);

  $: curves = ['low', 'mid', 'high'].map((tier, idx) => {
    const w = [50, 70, 100][idx];
    const cl = clAllo(clPop, w);
    return {
      label: tier,
      weight: w,
      points: times.map((t) => concMono(t, dose, cl, v))
    };
  });
</script>

<div class="pop">
  <div class="controls">
    <label>
      <input type="checkbox" bind:checked={showWeight} />
      Effet du poids (tri dynamique)
    </label>
    <Tooltip text="CL = CLpop × (Poids/70)^0.75">
      <span class="formula">CL = CLpop × (Poids/70)^0.75</span>
    </Tooltip>
  </div>

  <div class="grid">
    {#each sorted as person, i}
      <div
        class="avatar"
        style={`--w:${person.weight}; transform: translateY(${(person.weight - 70) * 0.4}px);`}
        title={`Poids ${person.weight.toFixed(1)} kg`}
      ></div>
    {/each}
  </div>

  <svg viewBox="0 0 320 180" class="chart">
    {#each curves as curve, idx}
      <polyline
        fill="none"
        stroke={['#22c55e', '#2563eb', '#f97316'][idx]}
        stroke-width="2.5"
        points={curve.points.map((c, t) => `${20 + t * 10},${160 - c * 8}`).join(' ')}
      />
    {/each}
    <text x="24" y="22" font-size="11" fill="#0f172a">Courbes par poids</text>
  </svg>
</div>

<style>
  .pop {
    display: grid;
    gap: 12px;
  }
  .controls {
    display: flex;
    gap: 12px;
    align-items: center;
    font-weight: 600;
    color: #0f172a;
  }
  .formula {
    padding: 4px 8px;
    background: #e0f2fe;
    border-radius: 8px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(20, minmax(8px, 1fr));
    gap: 4px;
    min-height: 120px;
  }
  .avatar {
    height: 12px;
    background: linear-gradient(180deg, #c7d2fe, #6366f1);
    border-radius: 6px;
    transition: transform 0.3s ease;
  }
  .chart {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
  }
</style>

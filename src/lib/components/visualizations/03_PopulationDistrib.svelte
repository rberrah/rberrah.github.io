<script>
  import Tooltip from '$lib/components/ui/Tooltip.svelte';
  import { clAllo, concMono } from '$lib/utils/math';
  import { makeRng } from '$lib/sim/random';
  import { language } from '$lib/stores/language';

  let showWeight = true;
  // PRNG SEEDÉ, pas Math.random() : le composant est prérendu (SSR) puis hydraté côté client.
  // Avec Math.random(), le serveur et le client tirent des poids différents → mismatch
  // d'hydratation. Une graine fixe garantit le même nuage des deux côtés.
  const rng = makeRng(20260714);
  const people = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    weight: 45 + rng() * 50
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
  // Échelle Y AJUSTÉE AUX DONNÉES : avec un facteur fixe (160 − c·8), des concentrations ~4
  // n'occupaient que 32 px sur 160 et les trois courbes se confondaient en bas du cadre.
  $: cMax = Math.max(...curves.flatMap((cu) => cu.points)) * 1.1 || 1;
  const plotH = 150; // hauteur utile dans le viewBox (0..180, marge basse 30)
  /** @param {number} c */
  function yOf(c) {
    return 160 - (c / cMax) * plotH;
  }
</script>

<div class="pop">
  <div class="controls">
    <label>
      <input type="checkbox" bind:checked={showWeight} />
      {$language === 'en' ? 'Weight effect (dynamic sorting)' : 'Effet du poids (tri dynamique)'}
    </label>
    <Tooltip text={`CL = CLpop × (${$language === 'en' ? 'Weight' : 'Poids'}/70)^0.75`}>
      <span class="formula">CL = CLpop × ({$language === 'en' ? 'Weight' : 'Poids'}/70)^0.75</span>
    </Tooltip>
  </div>

  <div class="grid">
    {#each sorted as person, i}
      <div
        class="avatar"
        style={`--w:${person.weight}; transform: translateY(${(person.weight - 70) * 0.4}px);`}
        title={`${$language === 'en' ? 'Weight' : 'Poids'} ${person.weight.toFixed(1)} kg`}
      ></div>
    {/each}
  </div>

  <svg viewBox="0 0 320 180" class="chart">
    {#each curves as curve, idx}
      <polyline
        fill="none"
        stroke={['#22c55e', '#2563eb', '#f97316'][idx]}
        stroke-width="2.5"
        points={curve.points.map((c, t) => `${20 + t * 10},${yOf(c).toFixed(1)}`).join(' ')}
      />
    {/each}
    <text x="24" y="22" font-size="11" fill="var(--text-primary)">{$language === 'en' ? 'Curves by weight' : 'Courbes par poids'}</text>
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
    color: var(--text-primary);
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
    border: 1px solid var(--bg-secondary);
    border-radius: 12px;
    background: var(--bg-tertiary);
  }
</style>

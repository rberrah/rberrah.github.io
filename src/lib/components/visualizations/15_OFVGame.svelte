<script>
  import { language } from '$lib/stores/language';

  const comparisons = [
    { baseFr: 'Modèle de base', baseEn: 'Base model', richFr: '+ poids sur CL', richEn: '+ weight on CL', delta: 5.0, df: 1 },
    { baseFr: 'Modèle avec poids', baseEn: 'Weight model', richFr: '+ créatinine sur CL', richEn: '+ creatinine on CL', delta: 7.2, df: 1 },
    { baseFr: 'Poids + créatinine', baseEn: 'Weight + creatinine', richFr: '+ âge sur V', richEn: '+ age on V', delta: 2.5, df: 1 },
    { baseFr: 'Poids + créatinine + âge', baseEn: 'Weight + creatinine + age', richFr: '+ sexe sur V', richEn: '+ sex on V', delta: 1.0, df: 1 }
  ];
  /** @type {Record<number, number>} */
  const thresholds = { 1: 3.84, 2: 5.99, 3: 7.81, 4: 9.49 };
  let selected = 0;
  $: comparison = comparisons[selected];
  $: threshold = thresholds[comparison.df];
  $: favored = comparison.delta > threshold;
</script>

<div class="ofv">
  <div class="steps" role="tablist" aria-label={$language === 'en' ? 'Successive nested comparisons' : 'Comparaisons emboîtées successives'}>
    {#each comparisons as item, index}
      <button class:selected={selected === index} on:click={() => (selected = index)} aria-pressed={selected === index}>
        <span>{index + 1}</span>
        <strong>{$language === 'en' ? item.richEn : item.richFr}</strong>
      </button>
    {/each}
  </div>

  <div class="comparison">
    <p><strong>{$language === 'en' ? comparison.baseEn : comparison.baseFr}</strong> → <strong>{$language === 'en' ? comparison.richEn : comparison.richFr}</strong></p>
    <div class="numbers">
      <span>ΔOFV = {comparison.delta.toFixed(1)}</span>
      <span>Δdf = {comparison.df}</span>
      <span>{$language === 'en' ? '5% threshold' : 'Seuil à 5 %'} = {threshold.toFixed(2)}</span>
    </div>
    <p class:favored class="decision">{favored
      ? ($language === 'en' ? 'The richer model is favored by this LRT comparison.' : 'Le modèle plus riche est favorisé par cette comparaison LRT.')
      : ($language === 'en' ? 'This comparison does not favor the richer model.' : 'Cette comparaison ne favorise pas le modèle plus riche.')}</p>
  </div>

  <p class="hint">{$language === 'en'
    ? 'Each ΔOFV belongs to one exact pair of nested models. Values from separate steps are illustrative and must not be added. The χ² reference requires regularity conditions.'
    : 'Chaque ΔOFV appartient à une paire précise de modèles emboîtés. Les valeurs illustratives de plusieurs étapes ne doivent pas être additionnées. La référence au χ² suppose des conditions de régularité.'}</p>
</div>

<style>
  .ofv { display: grid; gap: var(--space-3); }
  .steps { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  button { display: grid; grid-template-columns: 22px 1fr; align-items: center; gap: 7px; min-height: 48px; border: 1px solid var(--border-subtle); background: var(--bg-tertiary); color: var(--text-primary); padding: 7px 9px; border-radius: var(--radius); cursor: pointer; text-align: left; }
  button span { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--bg-secondary); font-family: var(--font-mono); }
  button strong { font-size: var(--text-xs); }
  button.selected { border-color: var(--accent-pk); box-shadow: inset 3px 0 var(--accent-pk); }
  .comparison { padding: var(--space-3); border: 1px solid var(--border-subtle); border-radius: var(--radius); background: var(--bg-secondary); }
  .comparison p { margin: 0; }
  .numbers { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0; font-family: var(--font-mono); font-size: var(--text-xs); }
  .numbers span { padding: 3px 6px; background: var(--bg-tertiary); border-radius: var(--radius); }
  .decision { color: var(--text-secondary); font-size: var(--text-sm); }
  .decision.favored { color: var(--quiz-success-text); }
  .hint { margin: 0; color: var(--text-muted); font-size: var(--text-xs); line-height: 1.5; }
  @container (max-width: 520px) { .steps { grid-template-columns: 1fr; } }
</style>

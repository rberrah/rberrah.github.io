<script lang="ts">
  import { untrack } from 'svelte';
  import { RotateCcw } from '@lucide/svelte';
  import { language } from '$lib/stores/language';
  import CovariatePlot from '../CovariatePlot.svelte';
  import { experimentDefinitions, parameterLabels, parameterBounds, experimentCurve, validExperiment } from '$lib/learning/experiments';
  import { displayUnit } from '$lib/learning/activityContent';
  let { experiment, initialSettings, onchange }: { experiment: import('$lib/learning/types').Experiment; initialSettings?: Record<string, number>; onchange: (v: { settings: Record<string, number>; valid: boolean }) => void } = $props();
  const definition = untrack(() => experimentDefinitions[experiment.kind]);
  const reference = untrack(() => ({ ...definition.defaults, ...experiment.settings }));
  let settings = $state(untrack(() => ({ ...reference, ...initialSettings })));
  let valid = $derived(validExperiment(experiment.kind, settings));
  const t = (fr: string, en: string) => $language === 'en' ? en : fr;
  $effect(() => { onchange({ settings: { ...settings }, valid }); });
</script>

<div class="experiment" data-testid="activity-experiment">
  <CovariatePlot title={t(definition.title.fr, definition.title.en)} xLabel={t(definition.x.fr, definition.x.en)} yLabel={definition.y} series={[
    { points: experimentCurve(experiment.kind, reference), color: '#c45f88', label: t('Référence', 'Reference'), dashed: true },
    { points: valid ? experimentCurve(experiment.kind, settings) : [], color: '#18998d', label: t('Paramètres modifiés', 'Changed parameters') }
  ]}/>
  <div class="controls">
    {#each experiment.controls as key}<label>{displayUnit(parameterLabels[key], $language ?? 'fr')}<input data-testid={`experiment-${key}`} type="number" min={parameterBounds[key][0]} max={parameterBounds[key][1]} step="any" value={settings[key]} oninput={e => settings[key] = e.currentTarget.valueAsNumber}/></label>{/each}
    <button onclick={() => settings = { ...reference }} title={t('Réinitialiser', 'Reset')} aria-label={t('Réinitialiser', 'Reset')}><RotateCcw size={17}/></button>
  </div>
  {#if !valid}<p role="alert">{t('Valeurs manquantes ou hors des limites indiquées.', 'Missing values or values outside the specified limits.')}</p>{/if}
</div>

<style>
  .controls { display: flex; flex-wrap: wrap; align-items: end; gap: 12px; margin-top: 14px; }
  label { display: grid; gap: 5px; font-size: .85rem; }
  input { width: 110px; max-width: 100%; padding: 8px; color: var(--text-primary); background: var(--bg-primary); border: 1px solid var(--border-strong); border-radius: 4px; }
  button { display: grid; place-items: center; width: 38px; height: 38px; color: var(--text-primary); background: var(--bg-secondary); border: 1px solid var(--border-strong); border-radius: 4px; cursor: pointer; }
  p { color: var(--text-secondary); font-size: .85rem; } :is(input, button):focus-visible { outline: 2px solid #18998d; outline-offset: 3px; }
</style>

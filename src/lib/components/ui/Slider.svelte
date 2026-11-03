<script>
  import { language } from '#lib/stores/language.js';
  import { vizText } from '#lib/i18n/visualizations.js';

  export let label = '';
  export let min = 0;
  export let max = 100;
  export let step = 1;
  export let value = 0;
  export let unit = '';
  export let disabled = false;
  export let numeric = false;
  /** @type {number | null} */
  export let displayDecimals = null;
  $: localizedLabel = vizText($language, label);
  // Formatting is display-only: preserve the underlying full-precision value.
  $: shownValue = displayDecimals === null ? value : Number(value).toFixed(displayDecimals);
</script>

<label class="slider">
  <div class="slider__top">
    <span>{localizedLabel}</span>
    <strong>{shownValue}{unit}</strong>
  </div>
  {#if numeric}
    <input type="number" bind:value min={min} max={max} step={step} {disabled} aria-label={localizedLabel} />
  {:else}
    <input type="range" bind:value min={min} max={max} step={step} {disabled} aria-label={localizedLabel} />
  {/if}
</label>

<style>
  .slider {
    display: block;
    font-weight: 600;
    color: var(--text-primary);
  }
  .slider__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.95rem;
    margin-bottom: 6px;
  }
  .slider__top strong {
    color: var(--text-primary);
  }
  input[type='range'] {
    width: 100%;
    accent-color: #2563eb;
  }
  input[type='number'] {
    box-sizing: border-box;
    width: 100%;
    padding: 7px;
    color: var(--text-primary);
    background: var(--bg-primary);
    border: 1px solid var(--border-strong);
    border-radius: 4px;
    font: inherit;
  }
</style>

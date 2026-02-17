<script>
  export let label = '';
  export let min = 0;
  export let max = 100;
  export let step = 1;
  export let value = 0;
  export let unit = '';
  export let disabled = false;
</script>

<label class="slider">
  <div class="slider__top">
    <span>{label}</span>
    <strong>{value}{unit}</strong>
  </div>
  <input type="range" bind:value min={min} max={max} step={step} {disabled} aria-label={label} />
</label>

<style>
  .slider {
    display: block;
    font-weight: 600;
    color: #0f172a;
  }
  .slider__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.95rem;
    margin-bottom: 6px;
  }
  input[type='range'] {
    width: 100%;
    accent-color: #2563eb;
  }
</style>

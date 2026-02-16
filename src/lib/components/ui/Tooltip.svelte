<script>
  export let text = '';
</script>

<span class="tip" aria-label={text}>
  <slot />
  <span class="tip__bubble">{text}</span>
</span>

<style>
  .tip {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .tip__bubble {
    position: absolute;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    background: #0f172a;
    color: white;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
  }
  .tip:hover .tip__bubble,
  .tip:focus .tip__bubble {
    opacity: 1;
  }
</style>

<script>
  import katex from 'katex';

  export let tex = '';
  export let displayMode = true;
  let html = tex;

  $: html = katex.renderToString(tex, { displayMode, throwOnError: false });
</script>

<div class="math" class:display={displayMode} aria-label="formule math">
  {@html html}
</div>

<style>
  .math {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 8px 10px;
    overflow-x: auto;
  }
  .math.display {
    text-align: center;
  }
</style>

<script>
  import { onMount } from 'svelte';
  export let tex = '';
  export let displayMode = true;
  let html = tex;

  onMount(async () => {
    if (typeof window === 'undefined') return;
    const w = /** @type {any} */ (window);
    if (w.katex) {
      html = w.katex.renderToString(tex, { displayMode, throwOnError: false });
      return;
    }
    await ensureKatex();
    if (w.katex) {
      html = w.katex.renderToString(tex, { displayMode, throwOnError: false });
    }
  });

  async function ensureKatex() {
    if (document.getElementById('katex-css')) return;
    const link = document.createElement('link');
    link.id = 'katex-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
    script.defer = true;
    document.head.appendChild(script);
    await new Promise((resolve) => (script.onload = resolve));
  }
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

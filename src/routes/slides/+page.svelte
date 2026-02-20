<script>
  import { base } from '$app/paths';
  import catalog from '../../content/slides/slide_catalog.json';
  import SlideImage from '$lib/components/SlideImage.svelte';

  let query = '';
  $: filtered = catalog.filter((s) => {
    const hay = `${s.title} ${s.purpose} ${s.tags?.join(' ') ?? ''}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });
</script>

<h1>Slides catalog</h1>
<p>
  Source of truth: <code>src/content/slides/slide_catalog.yaml</code>. PNGs must live in <code>static/slides/</code>.
  PPTX link: <a href={`${base}/pharmacometrie-pratique.pptx`} download>Download the PPTX</a>
</p>

<input
  aria-label="Search a slide"
  class="search"
  type="search"
  placeholder="Title, tag, module…"
  bind:value={query}
/>

<div class="grid">
  {#each filtered as s}
    <article class="card">
      <header>
        <span class="id">#{s.id}</span>
        <div>
          <h3>{s.title || `Slide ${s.slide}`}</h3>
          <small>{s.purpose || 'To fill'}</small>
        </div>
      </header>
      <SlideImage n={s.slide} alt={s.title} caption={s.title || s.file} />
      <ul class="meta">
        <li><strong>Tags</strong> {s.tags?.join(', ') || '—'}</li>
        <li><strong>Suggested module</strong> {s.suggested_module || '—'}</li>
        <li><strong>Key points</strong> {s.key_points?.join(' · ') || '—'}</li>
      </ul>
    </article>
  {/each}
</div>

<style>
  .search {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    margin: 12px 0 16px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 10px;
    background: #fff;
    display: grid;
    gap: 8px;
  }
  header {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .id {
    background: #eef2ff;
    color: #4338ca;
    font-weight: 700;
    padding: 4px 6px;
    border-radius: 8px;
  }
  h3 {
    margin: 0;
  }
  small {
    color: #475569;
  }
  .meta {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.95rem;
    color: #334155;
    display: grid;
    gap: 4px;
  }
</style>

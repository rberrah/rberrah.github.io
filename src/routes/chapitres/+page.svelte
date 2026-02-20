<script>
  import { base } from '$app/paths';
  import chapters from '$lib/content/loadChapters';
</script>

<h1>Chapters</h1>
<p>Scrollytelling through 12 modules inspired by “Pharmacométrie Pratique”.</p>

<div class="grid">
  {#each chapters as c}
    <article class="card">
      <p class="tag">#{c.id}</p>
      <h3>{c.title}</h3>
      <p class="desc">{c.description}</p>
      <a class="cta" href={`${base}/chapitres/${c.slug}`}>Open</a>
    </article>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
  }
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    background: #fff;
    display: grid;
    gap: 6px;
  }
  .tag {
    color: #2563eb;
    font-weight: 700;
    margin: 0;
  }
  .desc {
    color: #475569;
  }
  .cta {
    justify-self: start;
    padding: 8px 12px;
    border-radius: 10px;
    background: #2563eb;
    color: #fff;
    text-decoration: none;
    font-weight: 700;
  }
</style>

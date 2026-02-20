<script>
  import { base } from '$app/paths';
  import chapters from '$lib/content/loadChapters';
  const featured = chapters.slice(0, 6);
</script>

<section class="hero">
  <div>
    <p class="eyebrow">Visual pharmacometrics</p>
    <h1>From ODEs to Neural ODEs</h1>
    <p class="lede">
      Interactive path (English) to understand PK/PD, PopPK, diagnostics, TDM and applied AI.
      Inspired by the “Pharmacométrie Pratique” deck, expanded for newcomers.
    </p>
    <div class="cta-row">
      <a class="cta primary" href={`${base}/chapitres/${chapters[0]?.slug ?? ''}`}>Start</a>
      <a class="cta ghost" href={`${base}/playground`}>PK/PD playground</a>
    </div>
  </div>
  <div class="card">
    <p class="tiny">Chapitres</p>
    <ul>
      {#each featured as c}
        <li><a href={`${base}/chapitres/${c.slug}`}>{c.title}</a></li>
      {/each}
    </ul>
  </div>
</section>

<section class="grid">
  {#each chapters as c}
    <article class="card">
      <p class="tag">{c.tags?.[0] || 'Module'}</p>
      <h3>{c.title}</h3>
      <p>{c.description}</p>
      <a class="link" href={`${base}/chapitres/${c.slug}`}>Open</a>
    </article>
  {/each}
</section>

<section class="pill">
  <h2>Use case: Tacrolimus / TDM</h2>
  <p>A single clinical case anchors variability, VPC, and Bayesian updates.</p>
</section>

<style>
  .hero {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    align-items: center;
    margin-bottom: 32px;
  }
  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #2563eb;
    font-weight: 700;
    margin: 0;
  }
  .lede {
    color: #334155;
    line-height: 1.6;
  }
  .cta-row {
    display: flex;
    gap: 10px;
    margin: 16px 0;
  }
  .cta {
    padding: 10px 14px;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 700;
  }
  .primary {
    background: linear-gradient(120deg, #2563eb, #10b981);
    color: white;
  }
  .ghost {
    border: 1px solid #cbd5e1;
    color: #0f172a;
  }
  .card {
    padding: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: white;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
  }
  .tiny {
    margin: 0 0 8px;
    color: #475569;
  }
  .card ul {
    margin: 0;
    padding-left: 16px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }
  .tag {
    font-size: 0.85rem;
    color: #2563eb;
    margin: 0;
  }
  .link {
    color: #2563eb;
    font-weight: 700;
  }
  .pill {
    margin-top: 24px;
    padding: 16px;
    border-radius: 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }
</style>

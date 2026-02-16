<script>
  import { base } from '$app/paths';
  import chapters from '$lib/content/chapters';
  const featured = chapters.slice(0, 6);
</script>

<section class="hero">
  <div>
    <p class="eyebrow">Pharmacométrie visuelle</p>
    <h1>Des ODE aux Neural ODEs</h1>
    <p class="lede">
      Parcours interactif en français pour comprendre PK/PD, PopPK, diagnostics, TDM et IA appliquée.
      Inspiré du deck “Pharmacométrie Pratique”, enrichi pour un lecteur néophyte.
    </p>
    <div class="cta-row">
      <a class="cta primary" href={`${base}/chapitres/introduction-variabilite`}>Commencer</a>
      <a class="cta ghost" href={`${base}/playground`}>Playground PK/PD</a>
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
      <p class="tag">{c.tag}</p>
      <h3>{c.title}</h3>
      <p>{c.summary}</p>
      <a class="link" href={`${base}/chapitres/${c.slug}`}>Lire</a>
    </article>
  {/each}
</section>

<section class="pill">
  <h2>Fil rouge : Tacrolimus / TDM</h2>
  <p>Un cas clinique traverse plusieurs chapitres pour ancrer les concepts : variabilité, VPC, bayésien.</p>
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

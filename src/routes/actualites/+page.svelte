<script>
  import { resolve } from '$app/paths';
  import { language } from '#lib/stores/language.js';
  import { newsEntries, newsDate, newsHref } from '#lib/content/news.js';
  const base = resolve('/').replace(/\/$/, '');
  let category = 'all';
  /** @type {'fr' | 'en'} */
  let lang = 'fr';
  $: lang = $language === 'en' ? 'en' : 'fr';
  $: labels = lang === 'en'
    ? {all:'All updates', learning:'Learning', tools:'Tools', maintenance:'Maintenance'}
    : {all:'Toutes les actualités', learning:'Pédagogie', tools:'Outils', maintenance:'Maintenance'};
  $: filtered = category === 'all' ? newsEntries : newsEntries.filter(entry => entry.category === category);
</script>

<section class="news-page">
  <header class="news-header">
    <p class="eyebrow">PMx Explain</p>
    <h1>{lang === 'en' ? 'News and updates' : 'Actualités'}</h1>
    <p class="intro">{lang === 'en' ? 'Follow the development of PMx Explain: new lessons, interactive tools and improvements. This journal records changes available on the public site, not work in progress.' : 'Suivez les évolutions de PMx Explain : nouveaux cours, outils interactifs et améliorations. Ce journal présente les changements disponibles sur le site public, et non les travaux en cours.'}</p>
    <p class="last-update">{lang === 'en' ? 'Latest published update' : 'Dernière mise à jour publiée'} : <time datetime={newsEntries[0].date}>{newsDate(newsEntries[0].date, lang)}</time></p>
  </header>

  <div class="filters" role="group" aria-label={lang === 'en' ? 'Filter updates' : 'Filtrer les actualités'}>
    {#each ['all','learning','tools','maintenance'] as key}
      {@const label = key === 'all' ? labels.all : key === 'learning' ? labels.learning : key === 'tools' ? labels.tools : labels.maintenance}
      <button type="button" class:active={category === key} aria-pressed={category === key} onclick={() => category = key}>{label}</button>
    {/each}
  </div>

  <p class="result-count" aria-live="polite">{filtered.length} {lang === 'en' ? (filtered.length === 1 ? 'update' : 'updates') : (filtered.length === 1 ? 'actualité' : 'actualités')}</p>
  <div class="timeline">
    {#each filtered as entry (entry.id)}
      <article class="update" id={entry.id}>
        <div class="meta">
          <time datetime={entry.date}>{newsDate(entry.date, lang)}</time>
          <span>{entry.category === 'learning' ? labels.learning : entry.category === 'tools' ? labels.tools : labels.maintenance}</span>
        </div>
        <h2>{entry[lang].title}</h2>
        <p>{entry[lang].summary}</p>
        <div class="update-links">
          <a class="primary-link" href={base + newsHref(entry.path, lang)} data-sveltekit-reload={entry.path.startsWith('/game/') ? '' : undefined}>{entry[lang].action}</a>
          <a href={'https://github.com/rberrah/rberrah.github.io/pull/' + entry.pr} target="_blank" rel="noopener noreferrer">{lang === 'en' ? 'Technical details' : 'Détails techniques'}</a>
          <a href={'https://github.com/rberrah/rberrah.github.io/actions/runs/' + entry.deploy} target="_blank" rel="noopener noreferrer">{lang === 'en' ? 'Deployment' : 'Déploiement'}</a>
        </div>
      </article>
    {:else}
      <p>{lang === 'en' ? 'No published updates in this category yet.' : 'Aucune actualité publiée dans cette catégorie pour le moment.'}</p>
    {/each}
  </div>
  <p class="end-note">{lang === 'en' ? 'Have a suggestion or found an issue?' : 'Une suggestion ou un problème à signaler ?'} <a href="https://github.com/rberrah/rberrah.github.io/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a>.</p>
</section>

<style>
  .news-page { max-width: 900px; margin: 0 auto; }
  .news-header { padding: var(--space-8) 0 var(--space-6); }
  h1 { font-size: var(--text-4xl); margin: 0 0 var(--space-4); }
  .intro { max-width: 68ch; color: var(--text-secondary); font-size: var(--text-lg); }
  .last-update, .result-count { color: var(--text-secondary); font-size: var(--text-sm); }
  .filters { display:flex; flex-wrap:wrap; gap:8px; margin: var(--space-5) 0; }
  .filters button { font:inherit; font-size:var(--text-sm); padding:8px 14px; border:1px solid var(--border-strong); border-radius:6px; background:var(--bg-secondary); color:var(--text-primary); cursor:pointer; }
  .filters button.active { background:var(--text-primary); color:var(--bg-primary); }
  .timeline { border-left:2px solid var(--border-strong); margin:var(--space-5) 0; padding-left:var(--space-6); }
  .update { position:relative; padding:0 0 var(--space-8); margin:0 0 var(--space-6); border-bottom:1px solid var(--border-subtle); }
  .update::before { content:''; position:absolute; left:calc(-1 * var(--space-6) - 6px); top:6px; height:10px; width:10px; border-radius:50%; background:var(--accent-pk); }
  .meta { display:flex; flex-wrap:wrap; align-items:center; gap:12px; font-size:var(--text-sm); color:var(--text-secondary); }
  .meta span { border:1px solid var(--border-subtle); border-radius:4px; padding:2px 8px; }
  h2 { font-size:var(--text-xl); margin:var(--space-3) 0; }
  .update p { color:var(--text-secondary); max-width:72ch; }
  .update-links { display:flex; gap:8px 20px; flex-wrap:wrap; align-items:center; font-size:var(--text-sm); }
  .primary-link { font-weight:600; }
  .end-note { color:var(--text-secondary); }
  @media(max-width:760px) { h1 {font-size:var(--text-3xl);} .timeline {padding-left:var(--space-4);} .update::before {left:calc(-1 * var(--space-4) - 6px);} }
</style>

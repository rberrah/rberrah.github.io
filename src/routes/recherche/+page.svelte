<script>
  // @ts-nocheck
  import { get } from 'svelte/store';
  import { base } from '$app/paths';
  import chapters from '$lib/content/loadChapters';
  import { exercises } from '$lib/content/exercises';
  import { guidedActivities } from '$lib/content/guidedActivities';
  import { molecularLabIds, molecularLabs } from '$lib/labs/molecular';
  import { glossary } from '$lib/stores/glossary';
  import { language } from '$lib/stores/language';
  import { localizeChapter } from '$lib/i18n/translations';

  const glossaryItems = get(glossary);
  const fundamentalLabs = [
    { id: 'distribution', fr: 'Distribution a deux compartiments', en: 'Two-compartment distribution' },
    { id: 'accumulation', fr: 'Doses repetees et accumulation', en: 'Repeated doses and accumulation' },
    { id: 'absorption', fr: 'Absorption orale et biodisponibilite', en: 'Oral absorption and bioavailability' },
    { id: 'infusion', fr: 'Perfusion IV et decroissance', en: 'IV infusion and washout' }
  ];
  const norm = (value) => (value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const localized = (value) => value?.[$language] ?? '';
  const chapterTrack = new Map(chapters.map(chapter => [chapter.slug, chapter.track]));
  let query = '';

  $: index = [
    ...chapters.map(chapter => {
      const item = localizeChapter(chapter, $language).chapter;
      return { type: $language === 'en' ? 'Course' : 'Cours', title: item.title, description: item.description, href: `${base}/chapitres/${chapter.slug}/?lang=${$language}` };
    }),
    ...glossaryItems.map(item => {
      const view = $language === 'en' ? item.en : item;
      return { type: $language === 'en' ? 'Glossary' : 'Glossaire', title: view?.term ?? item.term, description: `${view?.full ?? ''} ${view?.def ?? ''}`.trim(), href: `${base}/glossaire/?lang=${$language}&q=${encodeURIComponent(view?.term ?? item.term)}` };
    }),
    ...fundamentalLabs.map(item => ({ type: $language === 'en' ? 'Laboratory' : 'Laboratoire', title: item[$language], description: $language === 'en' ? 'Interactive mechanism and concentration curves.' : 'Mecanisme interactif et courbes de concentration.', href: `${base}/laboratoires/?lang=${$language}&lab=${item.id}` })),
    ...molecularLabIds.map(id => ({ type: $language === 'en' ? 'Laboratory' : 'Laboratoire', title: localized(molecularLabs[id].title), description: localized(molecularLabs[id].summary), href: `${base}/laboratoires/?lang=${$language}&lab=${id}` })),
    ...guidedActivities.map(activity => ({ type: activity.kind === 'synthesis' ? ($language === 'en' ? 'Synthesis case' : 'Cas de synthese') : ($language === 'en' ? 'Guided activity' : 'Activite guidee'), title: localized(activity.title), description: localized(activity.objective), href: `${base}/exercices/?lang=${$language}&track=${activity.track ?? chapterTrack.get(activity.chapter) ?? ''}` })),
    ...exercises.map(exercise => ({ type: $language === 'en' ? 'Calculation' : 'Calcul', title: $language === 'en' ? exercise.en.q : exercise.q, description: exercise.unit ?? '', href: `${base}/exercices/?lang=${$language}&track=${chapterTrack.get(exercise.chapter) ?? ''}` }))
  ].map(item => ({ ...item, haystack: norm(`${item.type} ${item.title} ${item.description}`) }));
  $: words = norm(query).trim().split(/\s+/).filter(Boolean);
  $: results = words.length ? index.filter(item => words.every(word => item.haystack.includes(word))).slice(0, 60) : [];
  $: grouped = [...new Set(results.map(item => item.type))].map(type => ({ type, items: results.filter(item => item.type === type) }));
</script>

<svelte:head><title>{$language === 'en' ? 'Search' : 'Recherche'} | PMx Explain</title></svelte:head>

<header class="head">
  <p class="eyebrow">PMx Explain</p>
  <h1>{$language === 'en' ? 'Search all learning resources' : 'Rechercher dans toutes les ressources'}</h1>
  <p>{$language === 'en' ? 'Courses, glossary definitions, laboratories and exercises are searched together.' : 'Les cours, definitions du glossaire, laboratoires et exercices sont recherches ensemble.'}</p>
  <input type="search" bind:value={query} placeholder={$language === 'en' ? 'Clearance, Emax, Bayesian...' : 'Clairance, Emax, Bayes...'} aria-label={$language === 'en' ? 'Search all resources' : 'Rechercher dans toutes les ressources'} data-testid="global-search"/>
</header>

{#if words.length}
  <p class="count" role="status">{results.length}{results.length === 60 ? '+' : ''} {$language === 'en' ? 'results' : 'resultats'}</p>
  {#if grouped.length}
    {#each grouped as group}
      <section class="group">
        <h2>{group.type} <span>{group.items.length}</span></h2>
        <ul>{#each group.items as item}<li><a href={item.href}><strong>{item.title}</strong>{#if item.description}<span>{item.description}</span>{/if}</a></li>{/each}</ul>
      </section>
    {/each}
  {:else}<p class="empty">{$language === 'en' ? 'No resource matches these terms.' : 'Aucune ressource ne correspond a ces termes.'}</p>{/if}
{:else}
  <p class="empty">{$language === 'en' ? 'Enter one or more terms.' : 'Saisissez un ou plusieurs termes.'}</p>
{/if}

<style>
  .head { max-width:760px; }
  h1 { margin:var(--space-2) 0; font-size:var(--text-3xl); }
  .head p { color:var(--text-secondary); }
  input { width:100%; margin-top:var(--space-4); padding:12px 14px; border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary); background:var(--bg-primary); font:inherit; }
  input:focus { outline:3px solid var(--focus-ring); border-color:var(--accent-pk); }
  .count,.empty { margin-top:var(--space-6); color:var(--text-muted); font-family:var(--font-mono); font-size:var(--text-sm); }
  .group { margin-top:var(--space-8); }
  .group h2 { display:flex; align-items:center; gap:8px; padding-bottom:8px; border-bottom:1px solid var(--border-strong); font-size:var(--text-lg); }
  .group h2 span { color:var(--text-muted); font:400 var(--text-xs)/1 var(--font-mono); }
  ul { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:8px; padding:0; list-style:none; }
  a { display:grid; gap:5px; height:100%; box-sizing:border-box; padding:12px; border-left:3px solid var(--accent-pk); color:inherit; background:var(--bg-secondary); text-decoration:none; }
  a:hover { background:var(--bg-tertiary); }
  a strong { font-size:var(--text-sm); }
  a span { color:var(--text-secondary); font-size:var(--text-xs); line-height:1.45; }
</style>

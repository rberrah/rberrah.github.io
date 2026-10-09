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
  const plain = (value) => (value ?? '').replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  const localized = (value) => value?.[$language] ?? '';
  const chapterTrack = new Map(chapters.map(chapter => [chapter.slug, chapter.track]));
  const synonymGroups = [
    ['cl', 'clairance', 'clearance'],
    ['t1/2', 't½', 'demi-vie', 'half-life'],
    ['iiv', 'bsv', 'variabilite interindividuelle', 'between subject variability'],
    ['ruv', 'erreur residuelle', 'residual error'],
    ['poppk', 'population pk', 'pharmacocinetique de population'],
    ['mipd', 'precision dosing', 'model informed precision dosing']
  ].map(group => group.map(norm));
  let query = '', typeFilter = '', levelFilter = '', trackFilter = '';

  $: index = [
    ...chapters.map(chapter => {
      const item = localizeChapter(chapter, $language).chapter;
      const content = [item.summary, ...(chapter.tags ?? []), ...(chapter.glossary ?? []), ...(item.steps ?? []).flatMap(step => [step.title, plain(step.html)])].join(' ');
      return { typeKey: 'course', type: $language === 'en' ? 'Course' : 'Cours', title: item.title, description: item.description, content, level: chapter.level, track: chapter.track, href: `${base}/chapitres/${chapter.slug}/?lang=${$language}` };
    }),
    ...glossaryItems.map(item => {
      const view = $language === 'en' ? item.en : item;
      return { typeKey: 'glossary', type: $language === 'en' ? 'Glossary' : 'Glossaire', title: view?.term ?? item.term, description: `${view?.full ?? ''} ${view?.def ?? ''}`.trim(), content: (item.details?.aliases ?? []).join(' '), href: `${base}/glossaire/?lang=${$language}&q=${encodeURIComponent(view?.term ?? item.term)}` };
    }),
    ...fundamentalLabs.map(item => ({ typeKey: 'laboratory', type: $language === 'en' ? 'Laboratory' : 'Laboratoire', title: item[$language], description: $language === 'en' ? 'Interactive mechanism and concentration curves.' : 'Mécanisme interactif et courbes de concentration.', track: 'core', href: `${base}/laboratoires/?lang=${$language}&lab=${item.id}` })),
    ...molecularLabIds.map(id => ({ typeKey: 'laboratory', type: $language === 'en' ? 'Laboratory' : 'Laboratoire', title: localized(molecularLabs[id].title), description: localized(molecularLabs[id].summary), track: chapterTrack.get(molecularLabs[id].related) ?? '', href: `${base}/laboratoires/?lang=${$language}&lab=${id}` })),
    ...guidedActivities.map(activity => ({ typeKey: activity.kind === 'synthesis' ? 'synthesis' : 'guided', type: activity.kind === 'synthesis' ? ($language === 'en' ? 'Synthesis case' : 'Cas de synthèse') : ($language === 'en' ? 'Guided activity' : 'Activité guidée'), title: localized(activity.title), description: localized(activity.objective), track: activity.track ?? chapterTrack.get(activity.chapter) ?? '', href: `${base}/parcours/${activity.track ?? chapterTrack.get(activity.chapter) ?? ''}/?lang=${$language}&chapter=${activity.chapter}#activity-${activity.id}` })),
    ...exercises.map(exercise => ({ typeKey: 'calculation', type: $language === 'en' ? 'Calculation' : 'Calcul', title: $language === 'en' ? exercise.en.q : exercise.q, description: exercise.unit ?? '', track: chapterTrack.get(exercise.chapter) ?? '', href: `${base}/parcours/${chapterTrack.get(exercise.chapter) ?? ''}/?lang=${$language}&chapter=${exercise.chapter}#practice` }))
  ].map(item => ({ ...item, haystack: norm(`${item.type} ${item.title} ${item.description} ${item.content ?? ''} ${item.level ?? ''} ${item.track ?? ''}`) }));
  $: words = norm(query).trim().split(/\s+/).filter(Boolean);
  const includesAlias = (haystack, alias) => alias.length > 3
    ? haystack.includes(alias)
    : new RegExp(`(^|[^a-z0-9])${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9])`).test(haystack);
  const matchesWord = (haystack, word) => {
    const aliases = synonymGroups.find(group => group.some(alias => alias === word));
    return aliases ? aliases.some(alias => includesAlias(haystack, alias)) : haystack.includes(word);
  };
  $: results = words.length ? index.filter(item =>
    words.every(word => matchesWord(item.haystack, word)) &&
    (!typeFilter || item.typeKey === typeFilter) &&
    (!levelFilter || item.level === levelFilter) &&
    (!trackFilter || item.track === trackFilter)
  ) : [];
  $: grouped = [...new Set(results.map(item => item.type))].map(type => ({ type, items: results.filter(item => item.type === type) }));
  $: trackOptions = [...new Set(index.map(item => item.track).filter(Boolean))].sort();
</script>

<svelte:head><title>{$language === 'en' ? 'Search' : 'Recherche'} | PMx Explain</title></svelte:head>

<header class="head">
  <p class="eyebrow">PMx Explain</p>
  <h1>{$language === 'en' ? 'Search all learning resources' : 'Rechercher dans toutes les ressources'}</h1>
  <p>{$language === 'en' ? 'Courses, glossary definitions, laboratories and exercises are searched together.' : 'Les cours, définitions du glossaire, laboratoires et exercices sont recherchés ensemble.'}</p>
  <input type="search" bind:value={query} placeholder={$language === 'en' ? 'Clearance, Emax, Bayesian...' : 'Clairance, Emax, Bayes...'} aria-label={$language === 'en' ? 'Search all resources' : 'Rechercher dans toutes les ressources'} data-testid="global-search"/>
  <div class="filters">
    <label>{$language === 'en' ? 'Type' : 'Type'}<select bind:value={typeFilter}><option value="">{$language === 'en' ? 'All' : 'Tous'}</option><option value="course">{$language === 'en' ? 'Courses' : 'Cours'}</option><option value="glossary">{$language === 'en' ? 'Glossary' : 'Glossaire'}</option><option value="laboratory">{$language === 'en' ? 'Laboratories' : 'Laboratoires'}</option><option value="guided">{$language === 'en' ? 'Guided activities' : 'Activités guidées'}</option><option value="synthesis">{$language === 'en' ? 'Synthesis cases' : 'Cas de synthèse'}</option><option value="calculation">{$language === 'en' ? 'Calculations' : 'Calculs'}</option></select></label>
    <label>{$language === 'en' ? 'Level' : 'Niveau'}<select bind:value={levelFilter}><option value="">{$language === 'en' ? 'All' : 'Tous'}</option><option value="beginner">{$language === 'en' ? 'Beginner' : 'Débutant'}</option><option value="intermediate">{$language === 'en' ? 'Intermediate' : 'Intermédiaire'}</option><option value="advanced">{$language === 'en' ? 'Advanced' : 'Avancé'}</option></select></label>
    <label>{$language === 'en' ? 'Track' : 'Parcours'}<select bind:value={trackFilter}><option value="">{$language === 'en' ? 'All' : 'Tous'}</option>{#each trackOptions as track}<option value={track}>{track}</option>{/each}</select></label>
  </div>
</header>

{#if words.length}
  <p class="count" role="status">{results.length} {$language === 'en' ? 'results' : 'résultats'}</p>
  {#if grouped.length}
    {#each grouped as group}
      <section class="group">
        <h2>{group.type} <span>{group.items.length}</span></h2>
        <ul>{#each group.items as item}<li><a href={item.href}><strong>{item.title}</strong><small>{[item.track, item.level].filter(Boolean).join(' · ')}</small>{#if item.description}<span>{item.description}</span>{/if}</a></li>{/each}</ul>
      </section>
    {/each}
  {:else}<p class="empty">{$language === 'en' ? 'No resource matches these terms.' : 'Aucune ressource ne correspond à ces termes.'}</p>{/if}
{:else}
  <p class="empty">{$language === 'en' ? 'Enter one or more terms.' : 'Saisissez un ou plusieurs termes.'}</p>
{/if}

<style>
  .head { max-width:760px; }
  h1 { margin:var(--space-2) 0; font-size:var(--text-3xl); }
  .head p { color:var(--text-secondary); }
  input { width:100%; margin-top:var(--space-4); padding:12px 14px; border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary); background:var(--bg-primary); font:inherit; }
  .filters { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin-top:10px; }
  .filters label { color:var(--text-secondary); font-size:var(--text-xs); }
  .filters select { display:block; width:100%; margin-top:4px; padding:8px; border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary); background:var(--bg-primary); }
  :is(input,select):focus { outline:3px solid var(--focus-ring); border-color:var(--accent-pk); }
  .count,.empty { margin-top:var(--space-6); color:var(--text-muted); font-family:var(--font-mono); font-size:var(--text-sm); }
  .group { margin-top:var(--space-8); }
  .group h2 { display:flex; align-items:center; gap:8px; padding-bottom:8px; border-bottom:1px solid var(--border-strong); font-size:var(--text-lg); }
  .group h2 span { color:var(--text-muted); font:400 var(--text-xs)/1 var(--font-mono); }
  ul { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:8px; padding:0; list-style:none; }
  a { display:grid; gap:5px; height:100%; box-sizing:border-box; padding:12px; border-left:3px solid var(--accent-pk); color:inherit; background:var(--bg-secondary); text-decoration:none; }
  a:hover { background:var(--bg-tertiary); }
  a strong { font-size:var(--text-sm); }
  a small { color:var(--text-muted); font-family:var(--font-mono); font-size:var(--text-xs); }
  a span { color:var(--text-secondary); font-size:var(--text-xs); line-height:1.45; }
  @media (max-width:600px) { .filters { grid-template-columns:1fr; } }
</style>

<script>
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { glossary, glossaryCategories } from '$lib/stores/glossary';
  import { categoryEnglish } from '$lib/content/glossaryMeta';
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';

  const items = get(glossary);
  const cats = get(glossaryCategories);
  let query = '';

  // Lien profond depuis un chapitre : /glossaire?q=terme pré-remplit la recherche.
  onMount(() => {
    const q = $page.url.searchParams.get('q');
    if (q) query = q;
  });

  const norm = (/** @type {string} */ s) =>
    (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  $: copy = ui($language);
  $: q = norm(query);
  $: filtered = q
    ? items.filter((it) => norm(`${it.term} ${it.full ?? ''} ${it.def} ${it.en?.full ?? ''} ${it.en?.def ?? ''} ${(it.details?.aliases ?? []).join(' ')}`).includes(q))
    : items;
  $: groups = cats
    .map((c) => ({ cat: c, list: filtered.filter((it) => it.cat === c) }))
    .filter((g) => g.list.length);
  const local = (/** @type {any} */ value) => $language === 'en' ? value?.en : value?.fr;
  const shown = (/** @type {any} */ item) => $language === 'en'
    ? { term: item.en?.term || item.term, full: item.en?.full, def: item.en?.def }
    : item;
  const relationLabel = (/** @type {string} */ relation) => ({
    prerequisite_of: $language === 'en' ? 'Prerequisite for' : 'Prérequis de',
    related_to: $language === 'en' ? 'Related concepts' : 'Concepts associés',
    used_in: $language === 'en' ? 'Used in' : 'Utilisé dans',
    diagnosed_by: $language === 'en' ? 'Diagnosed by' : 'Diagnostiqué par'
  })[relation] ?? relation;
</script>

<header class="head">
  <h1>{copy.pages.glossaryTitle}</h1>
  <p class="lede">{copy.pages.glossaryIntro}</p>
  <input
    class="search"
    type="search"
    bind:value={query}
    placeholder={copy.pages.glossarySearch}
    aria-label={copy.pages.glossarySearch}
  />
  <p class="count">{filtered.length} / {items.length}</p>
</header>

{#if groups.length === 0}
  <p class="empty">{copy.pages.glossaryEmpty}</p>
{/if}

{#each groups as g}
  {@const category = $language === 'en' ? categoryEnglish[g.cat] : g.cat}
  <section class="cat">
    <h2>{category}</h2>
    <dl>
      {#each g.list as it}
        {@const view = shown(it)}
        <div class="entry">
          <dt>{view.term}{#if view.full}<span class="full">· {view.full}</span>{/if}</dt>
          <dd>
            <p>{view.def}</p>
            {#if it.details}
              <dl class="details">
                {#if it.details.unit}<div><dt>{$language === 'en' ? 'Unit' : 'Unité'}</dt><dd>{it.details.unit}</dd></div>{/if}
                {#if it.details.equation}<div><dt>{$language === 'en' ? 'Equation' : 'Équation'}</dt><dd><code>{it.details.equation}</code></dd></div>{/if}
                {#if it.details.intuition}<div><dt>Intuition</dt><dd>{local(it.details.intuition)}</dd></div>{/if}
                {#if it.details.assumption}<div><dt>{$language === 'en' ? 'Assumption' : 'Hypothèse'}</dt><dd>{local(it.details.assumption)}</dd></div>{/if}
                {#if it.details.mistake}<div><dt>{$language === 'en' ? 'Common error' : 'Erreur fréquente'}</dt><dd>{local(it.details.mistake)}</dd></div>{/if}
                {#if it.details.limitation}<div><dt>{$language === 'en' ? 'Do not infer' : 'Ne pas conclure'}</dt><dd>{local(it.details.limitation)}</dd></div>{/if}
                {#if it.details.example}<div><dt>{$language === 'en' ? 'Example' : 'Exemple'}</dt><dd>{local(it.details.example)}</dd></div>{/if}
                {#if it.details.aliases?.length}<div><dt>{$language === 'en' ? 'Aliases' : 'Alias'}</dt><dd>{it.details.aliases.join(' · ')}</dd></div>{/if}
              </dl>
              <nav class="links" aria-label={$language === 'en' ? 'Related resources' : 'Ressources associées'}>
                {#if it.details.chapter}<a href={`${base}/chapitres/${it.details.chapter}/`}>{$language === 'en' ? 'Course and sources' : 'Cours et sources'}</a>{/if}
                {#if it.details.lab}<a href={`${base}/laboratoires/?lang=${$language}&lab=${it.details.lab}`}>{$language === 'en' ? 'Interactive laboratory' : 'Laboratoire interactif'}</a>{/if}
                {#if it.details.exercise}<a href={`${base}/chapitres/${it.details.exercise}/#chapter-exercises`}>{$language === 'en' ? 'Related exercise' : 'Exercice associé'}</a>{/if}
              </nav>
              {#if it.details.relations}
                <div class="relations">
                  {#each Object.entries(it.details.relations) as [relation, targets]}
                    <span class="relation-label">{relationLabel(relation)}</span>
                    {#each targets as target}<a href={`${base}/glossaire/?q=${encodeURIComponent(target)}`}>{target}</a>{/each}
                  {/each}
                </div>
              {/if}
            {/if}
          </dd>
        </div>
      {/each}
    </dl>
  </section>
{/each}

<style>
  .head { max-width: 760px; margin-bottom: var(--space-8); }
  h1 { font-size: var(--text-3xl); margin-bottom: var(--space-2); }
  .lede { color: var(--text-secondary); font-size: var(--text-lg); margin-bottom: var(--space-4); }
  .search {
    width: 100%; max-width: 460px; font-size: var(--text-base);
    padding: var(--space-3) var(--space-4); border: 1px solid var(--border-strong);
    border-radius: var(--radius); background: var(--bg-primary); color: var(--text-primary);
  }
  .search:focus { outline: 2px solid var(--accent-pk); border-color: var(--accent-pk); }
  .count { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-2); }
  .empty { color: var(--text-muted); }
  .cat { margin-bottom: var(--space-8); }
  .cat h2 {
    font-size: var(--text-sm); font-family: var(--font-mono); text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--accent-pk); border-bottom: 1px solid var(--border-subtle);
    padding-bottom: var(--space-2); margin-bottom: var(--space-4);
  }
  dl { margin: 0; display: grid; gap: var(--space-4); }
  .entry { display: grid; gap: 2px; }
  dt { font-family: var(--font-heading); font-weight: 700; color: var(--text-primary); font-size: var(--text-lg); }
  .full { font-family: var(--font-mono); font-weight: 400; font-size: var(--text-xs); color: var(--text-muted); margin-left: var(--space-2); }
  dd { margin: 0; color: var(--text-secondary); line-height: var(--line-height-body); max-width: 68ch; }
  dd p { margin:0; }
  .details { display:grid; gap:5px; margin-top:10px; padding-top:9px; border-top:1px solid var(--border-subtle); font-size:var(--text-sm); }
  .details div { display:grid; grid-template-columns:110px 1fr; gap:8px; }
  .details dt { font:700 var(--text-xs)/1.5 var(--font-mono); color:var(--text-muted); text-transform:uppercase; }
  .details dd { color:var(--text-secondary); }
  .links { display:flex; flex-wrap:wrap; gap:12px; margin-top:10px; font-size:var(--text-sm); }
  .links a { color:var(--accent-pk); }
  .relations { display:flex; align-items:center; flex-wrap:wrap; gap:6px 10px; margin-top:9px; font-size:var(--text-xs); }
  .relation-label { font-family:var(--font-mono); font-weight:700; color:var(--text-muted); }
  .relations a { color:var(--text-secondary); text-decoration:underline; text-decoration-color:var(--border-strong); }
  @media (min-width: 760px) {
    .entry { grid-template-columns: 220px 1fr; gap: var(--space-4); align-items: baseline; }
    dt { position: sticky; }
  }
</style>

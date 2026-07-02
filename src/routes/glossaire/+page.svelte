<script>
  import { get } from 'svelte/store';
  import { glossary, glossaryCategories } from '$lib/stores/glossary';
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';

  const items = get(glossary);
  const cats = get(glossaryCategories);
  let query = '';

  const norm = (/** @type {string} */ s) =>
    (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  $: copy = ui($language);
  $: q = norm(query);
  $: filtered = q
    ? items.filter((it) => norm(`${it.term} ${it.full ?? ''} ${it.def}`).includes(q))
    : items;
  $: groups = cats
    .map((c) => ({ cat: c, list: filtered.filter((it) => it.cat === c) }))
    .filter((g) => g.list.length);
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
  <section class="cat">
    <h2>{g.cat}</h2>
    <dl>
      {#each g.list as it}
        <div class="entry">
          <dt>{it.term}{#if it.full}<span class="full">· {it.full}</span>{/if}</dt>
          <dd>{it.def}</dd>
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
  @media (min-width: 760px) {
    .entry { grid-template-columns: 220px 1fr; gap: var(--space-4); align-items: baseline; }
    dt { position: sticky; }
  }
</style>

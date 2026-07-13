<script>
  import { referenceGroups, refIdentifier } from '$lib/content/references';
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';

  $: copy = ui($language);
  $: isEn = $language === 'en';
  /** @type {Record<string,{fr:string,en:string}>} */
  const kindLabel = {
    book: { fr: 'livre', en: 'book' },
    article: { fr: 'article', en: 'article' },
    guideline: { fr: 'texte officiel', en: 'official text' },
    tool: { fr: 'logiciel', en: 'software' },
    course: { fr: 'ressource', en: 'resource' }
  };
  /** @param {{fr:string,en:string}} o */
  const pick = (o) => (isEn ? o.en : o.fr);
</script>

<header class="head">
  <h1>{copy.pages.referencesTitle}</h1>
  <p class="lede">{copy.pages.referencesIntro}</p>
</header>

<div class="groups">
  {#each referenceGroups as g}
    <section class="group" class:muted={g.id === 'liens'}>
      <h2>{pick(g.title)}</h2>
      {#if g.note}<p class="note">{pick(g.note)}</p>{/if}
      <ul>
        {#each g.items as r}
          <li>
            <a href={r.url} target="_blank" rel="noopener noreferrer">
              <span class="kind kind-{r.kind}">{pick(kindLabel[r.kind] ?? kindLabel.article)}</span>
              <span class="body">
                <span class="title">{r.title}</span>
                {#if r.authors || r.where}<span class="meta">{[r.authors, r.where].filter(Boolean).join(' · ')}</span>{/if}
                {#if refIdentifier(r)}<span class="id">{refIdentifier(r)}</span>{/if}
              </span>
              <span class="ext" aria-hidden="true">↗</span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</div>

<style>
  .head { max-width: 760px; margin-bottom: var(--space-8); }
  h1 { font-size: var(--text-3xl); margin-bottom: var(--space-2); }
  .lede { color: var(--text-secondary); font-size: var(--text-lg); }
  .groups { display: grid; gap: var(--space-8); max-width: 820px; }
  .group h2 { font-size: var(--text-sm); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-pk); border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2); margin: 0 0 var(--space-4); }
  ul { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-2); }
  a { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--space-3); text-decoration: none; color: inherit; padding: var(--space-3) var(--space-4); border: 1px solid var(--border-subtle); border-radius: var(--radius); background: var(--bg-tertiary); transition: border-color 0.2s ease, transform 0.2s ease; }
  a:hover { border-color: var(--accent-pk); transform: translateY(-1px); }
  .kind { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 7px; border-radius: 10px; white-space: nowrap; }
  .kind-book { background: color-mix(in srgb, var(--accent-pk) 15%, #fff); color: var(--accent-pk); }
  .kind-article { background: color-mix(in srgb, var(--accent-ai) 15%, #fff); color: var(--accent-ai); }
  .kind-guideline { background: color-mix(in srgb, var(--accent-pd) 12%, #fff); color: var(--accent-pd); }
  .kind-tool { background: var(--bg-secondary); color: var(--text-muted); }
  .kind-course { background: var(--bg-secondary); color: var(--text-secondary); }
  .body { display: grid; gap: 1px; }
  .title { color: var(--text-primary); font-weight: 600; font-size: var(--text-sm); line-height: 1.35; }
  .meta { color: var(--text-muted); font-size: var(--text-xs); font-family: var(--font-mono); }
  .id { justify-self: start; margin-top: 3px; font-family: var(--font-mono); font-size: 10px; color: var(--accent-pk); background: color-mix(in srgb, var(--accent-pk) 10%, transparent); border-radius: 999px; padding: 1px 7px; }
  .ext { color: var(--text-muted); font-size: var(--text-sm); }
  .note { max-width: 62ch; margin: calc(-1 * var(--space-2)) 0 var(--space-4); font-size: var(--text-sm); line-height: 1.5; color: var(--text-muted); border-left: 2px solid var(--border-strong); padding-left: var(--space-3); }
  .muted a { background: transparent; }
  .muted .title { font-weight: 500; color: var(--text-secondary); }
</style>

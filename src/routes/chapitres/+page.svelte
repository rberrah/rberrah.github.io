<script>
  import { base } from '$app/paths';
  import chapters from '$lib/content/loadChapters';
  import { tracks, chaptersByTrack, trackById } from '$lib/content/tracks';
  import { language } from '$lib/stores/language';
  import { localizeChapter, localizeTrack, ui } from '$lib/i18n/translations';

  const grouped = chaptersByTrack(chapters);
  $: copy = ui($language);

  let query = '';
  // Index de recherche localisé (titre + description + tags + parcours)
  $: index = chapters.map((c) => {
    const loc = localizeChapter(c, $language).chapter;
    const tr = trackById(c.track);
    const trTitle = tr ? localizeTrack(tr, $language).title : '';
    return {
      slug: c.slug,
      track: c.track,
      trackTitle: trTitle,
      accent: tr?.accent ?? 'var(--accent-pk)',
      title: loc.title,
      description: loc.description,
      hay: `${loc.title} ${loc.description} ${(c.tags ?? []).join(' ')} ${trTitle}`.toLowerCase()
    };
  });
  $: q = query.trim().toLowerCase();
  $: results = q ? index.filter((c) => c.hay.includes(q)) : [];
</script>

<header class="head">
  <p class="eyebrow">{copy.chapters.eyebrow}</p>
  <h1>{copy.chapters.title}</h1>
  <p class="lede">{copy.chapters.lede}</p>
  <div class="search">
    <input
      type="search"
      bind:value={query}
      placeholder={copy.chapters.search}
      aria-label={copy.chapters.search}
      data-testid="chapter-search"
    />
    {#if q}<span class="count" data-testid="search-count">{copy.chapters.searchResults(results.length)}</span>{/if}
  </div>
</header>

{#if q}
  <!-- Résultats de recherche (à plat, tous parcours confondus) -->
  {#if results.length}
    <ol class="grid results" data-testid="search-results">
      {#each results as r}
        <li>
          <a class="card card-hover chap" style={`--track:${r.accent}`} href={`${base}/chapitres/${r.slug}`} data-testid="chapter-card">
            <span class="rtrack">{r.trackTitle}</span>
            <h3>{r.title}</h3>
            <p class="desc">{r.description}</p>
          </a>
        </li>
      {/each}
    </ol>
  {:else}
    <p class="empty" data-testid="search-empty">{copy.chapters.searchNone}</p>
  {/if}
{:else}
  {#each tracks as track}
    {@const localizedTrack = localizeTrack(track, $language)}
    {@const list = grouped[track.id] ?? []}
    <section class="track" style={`--track:${track.accent}`} data-testid={`track-section-${track.id}`}>
      <div class="track-head">
        <span class="badge">{localizedTrack.label}</span>
        <h2>{localizedTrack.title}</h2>
        {#if track.status !== 'available'}<span class="soon">{copy.chapters.soon}</span>{/if}
      </div>
      <p class="tagline">{localizedTrack.tagline}</p>

      {#if list.length}
        <ol class="grid">
          {#each list as c, i}
            {@const localized = localizeChapter(c, $language).chapter}
            <li>
              <a class="card card-hover chap" href={`${base}/chapitres/${c.slug}`} data-testid="chapter-card">
                <span class="num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{localized.title}</h3>
                <p class="desc">{localized.description}</p>
                <span class="meta">{copy.chapters.meta(localized.steps?.length ?? 0, localized.quiz?.length ?? 0)}</span>
              </a>
            </li>
          {/each}
        </ol>
      {:else}
        <p class="empty">{copy.chapters.empty}</p>
      {/if}
    </section>
  {/each}
{/if}

<style>
  .head { max-width: 720px; margin-bottom: var(--space-8); }
  h1 { font-size: var(--text-3xl); margin: var(--space-2) 0; }
  .lede { color: var(--text-secondary); font-size: var(--text-lg); }
  .search { margin-top: var(--space-6); display: flex; align-items: center; gap: var(--space-3); }
  .search input { flex: 1; padding: var(--space-3) var(--space-4); border: 1px solid var(--border-strong); border-radius: var(--radius); background: var(--bg-tertiary); color: var(--text-primary); font-size: var(--text-base); }
  .search input:focus { outline: none; border-color: var(--accent-pk); box-shadow: 0 0 0 3px var(--focus-ring); }
  .count { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); white-space: nowrap; }
  .track { margin-top: var(--space-12); border-top: 1px solid var(--border-subtle); padding-top: var(--space-6); }
  .track-head { display: flex; align-items: center; gap: var(--space-3); }
  .badge { font-family: var(--font-mono); font-size: var(--text-xs); background: var(--track); color: #fff; padding: 2px 8px; border-radius: 4px; }
  .track-head h2 { margin: 0; font-size: var(--text-2xl); }
  .soon { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); border: 1px solid var(--border-subtle); padding: 2px 8px; border-radius: 4px; }
  .tagline { color: var(--text-secondary); margin: var(--space-2) 0 var(--space-6); }
  .grid { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-4); grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
  .results { margin-top: var(--space-6); }
  .chap { display: block; text-decoration: none; color: inherit; border-left: 3px solid var(--track); }
  .num { font-family: var(--font-mono); color: var(--track); font-weight: 600; }
  .rtrack { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--track); font-weight: 600; }
  .chap h3 { margin: var(--space-2) 0; font-size: var(--text-lg); }
  .desc { color: var(--text-secondary); font-size: var(--text-sm); margin: 0 0 var(--space-3); }
  .meta { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); }
  .empty { color: var(--text-muted); font-style: italic; margin-top: var(--space-6); }
</style>

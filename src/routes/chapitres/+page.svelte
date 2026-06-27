<script>
  import { base } from '$app/paths';
  import chapters from '$lib/content/loadChapters';
  import { tracks, chaptersByTrack } from '$lib/content/tracks';

  const grouped = chaptersByTrack(chapters);
</script>

<header class="head">
  <p class="eyebrow">Course outline</p>
  <h1>Chapters</h1>
  <p class="lede">A guided path through pharmacometrics. Each chapter is a scroll-driven essay with a sticky, interactive visualization and a short checkpoint.</p>
</header>

{#each tracks as track}
  {@const list = grouped[track.id] ?? []}
  <section class="track" style={`--track:${track.accent}`} data-testid={`track-section-${track.id}`}>
    <div class="track-head">
      <span class="badge">{track.label}</span>
      <h2>{track.title}</h2>
      {#if track.status !== 'available'}<span class="soon">Coming soon</span>{/if}
    </div>
    <p class="tagline">{track.tagline}</p>

    {#if list.length}
      <ol class="grid">
        {#each list as c, i}
          <li>
            <a class="card card-hover chap" href={`${base}/chapitres/${c.slug}`} data-testid="chapter-card">
              <span class="num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{c.title}</h3>
              <p class="desc">{c.description}</p>
              <span class="meta">{c.steps?.length ?? 0} steps · {c.quiz?.length ?? 0} quiz</span>
            </a>
          </li>
        {/each}
      </ol>
    {:else}
      <p class="empty">Chapters for this track are in preparation.</p>
    {/if}
  </section>
{/each}

<style>
  .head { max-width: 720px; margin-bottom: var(--space-8); }
  h1 { font-size: var(--text-3xl); margin: var(--space-2) 0; }
  .lede { color: var(--text-secondary); font-size: var(--text-lg); }
  .track { margin-top: var(--space-12); border-top: 1px solid var(--border-subtle); padding-top: var(--space-6); }
  .track-head { display: flex; align-items: center; gap: var(--space-3); }
  .badge { font-family: var(--font-mono); font-size: var(--text-xs); background: var(--track); color: #fff; padding: 2px 8px; border-radius: 4px; }
  .track-head h2 { margin: 0; font-size: var(--text-2xl); }
  .soon { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); border: 1px solid var(--border-subtle); padding: 2px 8px; border-radius: 4px; }
  .tagline { color: var(--text-secondary); margin: var(--space-2) 0 var(--space-6); }
  .grid { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-4); grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
  .chap { display: block; text-decoration: none; color: inherit; border-left: 3px solid var(--track); }
  .num { font-family: var(--font-mono); color: var(--track); font-weight: 600; }
  .chap h3 { margin: var(--space-2) 0; font-size: var(--text-lg); }
  .desc { color: var(--text-secondary); font-size: var(--text-sm); margin: 0 0 var(--space-3); }
  .meta { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); }
  .empty { color: var(--text-muted); font-style: italic; }
</style>

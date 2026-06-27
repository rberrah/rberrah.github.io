<script>
  import { base } from '$app/paths';
  import chapters from '$lib/content/loadChapters';
  import { tracks, chaptersByTrack } from '$lib/content/tracks';

  const grouped = chaptersByTrack(chapters);
  const firstCore = grouped.core[0];
  const coreCount = grouped.core.length;
</script>

<section class="hero" data-testid="hero">
  <p class="eyebrow">A visual course in pharmacometrics</p>
  <h1>Reading the <span class="hl">concentration–time</span> curve, one idea at a time.</h1>
  <p class="lede">
    Scroll-driven essays that turn PK/PD theory into something you can <em>see</em>: clearance and volume,
    variability between and within patients, and where modern AI fits — always with units, always with the
    uncertainty in view.
  </p>
  <div class="cta">
    {#if firstCore}
      <a class="btn btn-primary" href={`${base}/chapitres/${firstCore.slug}`} data-testid="cta-start">Start the course</a>
    {/if}
    <a class="btn btn-outline" href={`${base}/chapitres`} data-testid="cta-browse">Browse chapters</a>
  </div>
  <p class="disclaim-inline" data-testid="hero-disclaimer">Educational content only · not medical advice.</p>
</section>

<section class="tracks" data-testid="tracks">
  <h2 class="section-title">Two tracks</h2>
  <div class="track-grid">
    {#each tracks as track}
      {@const list = grouped[track.id] ?? []}
      <article class="track card card-hover" data-testid="course-track-card" style={`--track:${track.accent}`}>
        <div class="thumb" style={`background-image:url(${track.thumbnail})`}>
          <span class="track-tag">{track.label}</span>
          {#if track.status !== 'available'}<span class="soon">Coming soon</span>{/if}
        </div>
        <div class="track-body">
          <h3>{track.title}</h3>
          <p>{track.tagline}</p>
          <p class="count">{list.length} chapter{list.length === 1 ? '' : 's'}</p>
          {#if track.status === 'available' && list[0]}
            <a class="btn btn-outline sm" href={`${base}/chapitres/${list[0].slug}`} data-testid={`track-open-${track.id}`}>Open track →</a>
          {:else}
            <span class="btn btn-outline sm disabled" aria-disabled="true">In preparation</span>
          {/if}
        </div>
      </article>
    {/each}
  </div>
</section>

<section class="chapters" data-testid="featured-chapters">
  <div class="section-head">
    <h2 class="section-title">Core pharmacometrics</h2>
    <span class="muted">{coreCount} chapters</span>
  </div>
  <ol class="chap-list">
    {#each grouped.core as c, i}
      <li>
        <a class="chap card card-hover" href={`${base}/chapitres/${c.slug}`} data-testid="chapter-link">
          <span class="num">{String(i + 1).padStart(2, '0')}</span>
          <span class="chap-text">
            <strong>{c.title}</strong>
            <span class="desc">{c.description}</span>
          </span>
          <span class="arrow">→</span>
        </a>
      </li>
    {/each}
  </ol>
</section>

<style>
  .hero { max-width: 820px; padding: var(--space-16) 0 var(--space-12); }
  .hl { color: var(--accent-pk); }
  h1 { font-size: var(--text-4xl); font-weight: 900; margin: var(--space-3) 0 var(--space-6); }
  .lede { font-size: var(--text-lg); color: var(--text-secondary); max-width: 60ch; }
  .cta { display: flex; gap: var(--space-3); flex-wrap: wrap; margin-top: var(--space-8); }
  .disclaim-inline { margin-top: var(--space-4); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); }

  .section-title { font-size: var(--text-2xl); }
  .section-head { display: flex; align-items: baseline; justify-content: space-between; }
  .tracks { margin-top: var(--space-12); }
  .track-grid { display: grid; gap: var(--space-6); grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); margin-top: var(--space-6); }
  .track { padding: 0; overflow: hidden; border-top: 4px solid var(--track); }
  .thumb { height: 150px; background-size: cover; background-position: center; position: relative; }
  .thumb::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(26,28,29,0) 40%, rgba(26,28,29,0.55)); }
  .track-tag { position: absolute; top: var(--space-3); left: var(--space-3); z-index: 1; font-family: var(--font-mono); font-size: var(--text-xs); background: var(--track); color: #fff; padding: 2px 8px; border-radius: 4px; }
  .soon { position: absolute; bottom: var(--space-3); right: var(--space-3); z-index: 1; font-family: var(--font-mono); font-size: var(--text-xs); background: rgba(255,255,255,0.92); color: var(--text-primary); padding: 2px 8px; border-radius: 4px; }
  .track-body { padding: var(--space-6); }
  .track-body h3 { margin: 0 0 var(--space-2); font-size: var(--text-xl); }
  .track-body p { color: var(--text-secondary); margin: 0 0 var(--space-3); }
  .count { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted) !important; }
  .btn.sm { padding: var(--space-2) var(--space-4); font-size: var(--text-sm); }
  .btn.disabled { opacity: 0.5; cursor: not-allowed; }

  .chapters { margin-top: var(--space-12); }
  .chap-list { list-style: none; padding: 0; margin: var(--space-6) 0 0; display: grid; gap: var(--space-3); }
  .chap { display: flex; align-items: center; gap: var(--space-4); text-decoration: none; color: inherit; padding: var(--space-4) var(--space-6); }
  .num { font-family: var(--font-mono); font-weight: 600; color: var(--accent-pk); font-size: var(--text-lg); }
  .chap-text { display: flex; flex-direction: column; flex: 1; }
  .chap-text strong { font-family: var(--font-heading); font-size: var(--text-lg); }
  .desc { color: var(--text-secondary); font-size: var(--text-sm); }
  .arrow { color: var(--text-muted); font-size: var(--text-lg); transition: transform 0.2s ease; }
  .chap:hover .arrow { transform: translateX(4px); color: var(--accent-pk); }
  @media (max-width: 760px) { h1 { font-size: var(--text-3xl); } }
</style>

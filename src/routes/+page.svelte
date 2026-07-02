<script>
  import { base } from '$app/paths';
  import chapters from '$lib/content/loadChapters';
  import { tracks, chaptersByTrack } from '$lib/content/tracks';
  import { language } from '$lib/stores/language';
  import { localizeChapter, localizeTrack, ui } from '$lib/i18n/translations';

  const grouped = chaptersByTrack(chapters);
  const firstCore = grouped.core[0];
  const coreCount = grouped.core.length;
  $: copy = ui($language);
</script>

<section class="hero" data-testid="hero">
  <p class="eyebrow">{copy.home.eyebrow}</p>
  <h1>{copy.home.titlePrefix} <span class="hl">{copy.home.titleHighlight}</span> {copy.home.titleSuffix}</h1>
  <p class="lede">{copy.home.lede}</p>
  <div class="cta">
    {#if firstCore}
      <a class="btn btn-primary" href={`${base}/chapitres/${firstCore.slug}`} data-testid="cta-start">{copy.home.start}</a>
    {/if}
    <a class="btn btn-outline" href={`${base}/chapitres`} data-testid="cta-browse">{copy.home.browse}</a>
  </div>
  <p class="disclaim-inline" data-testid="hero-disclaimer">{copy.home.disclaimer}</p>
</section>

<section class="resource-band" data-testid="teaching-resources">
  <div>
    <h2>{copy.home.resourcesTitle}</h2>
    <p>{copy.home.resourcesText}</p>
  </div>
  <a class="btn btn-outline" href={`${base}/downloads/pharmacometrie-pratique.pptx`} download>{copy.home.downloadSlides}</a>
</section>

<section class="tracks" data-testid="tracks">
  <h2 class="section-title">{copy.home.tracksTitle}</h2>
  <div class="track-grid">
    {#each tracks as track}
      {@const localizedTrack = localizeTrack(track, $language)}
      {@const list = grouped[track.id] ?? []}
      <article class="track card card-hover" data-testid="course-track-card" style={`--track:${track.accent}`}>
        <div class={`thumb ${track.visual}`}>
          <span class="track-tag">{localizedTrack.label}</span>
          {#if track.status !== 'available'}<span class="soon">{copy.home.comingSoon}</span>{/if}
        </div>
        <div class="track-body">
          <h3>{localizedTrack.title}</h3>
          <p>{localizedTrack.tagline}</p>
          <p class="count">{copy.home.chapterCount(list.length)}</p>
          {#if track.status === 'available' && list[0]}
            <a class="btn btn-outline sm" href={`${base}/chapitres/${list[0].slug}`} data-testid={`track-open-${track.id}`}>{copy.home.openTrack}</a>
          {:else}
            <span class="btn btn-outline sm disabled" aria-disabled="true">{copy.home.inPreparation}</span>
          {/if}
        </div>
      </article>
    {/each}
  </div>
</section>

<section class="chapters" data-testid="featured-chapters">
  <div class="section-head">
    <h2 class="section-title">{copy.home.featuredTitle}</h2>
    <span class="muted">{copy.home.chapterCount(coreCount)}</span>
  </div>
  <ol class="chap-list">
    {#each grouped.core as c, i}
      {@const localized = localizeChapter(c, $language).chapter}
      <li>
        <a class="chap card card-hover" href={`${base}/chapitres/${c.slug}`} data-testid="chapter-link">
          <span class="num">{String(i + 1).padStart(2, '0')}</span>
          <span class="chap-text">
            <strong>{localized.title}</strong>
            <span class="desc">{localized.description}</span>
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
  .resource-band {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    border-top: 1px solid var(--border-subtle);
    border-bottom: 1px solid var(--border-subtle);
    padding: var(--space-5) 0;
  }
  .resource-band h2 { margin: 0 0 var(--space-2); font-size: var(--text-xl); }
  .resource-band p { margin: 0; color: var(--text-secondary); max-width: 68ch; }
  .tracks { margin-top: var(--space-12); }
  .track-grid { display: grid; gap: var(--space-6); grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); margin-top: var(--space-6); }
  .track { padding: 0; overflow: hidden; border-top: 4px solid var(--track); }
  .thumb { height: 150px; position: relative; overflow: hidden; }
  .thumb.core-visual { background: linear-gradient(135deg, #f5efe8 0%, #c97a48 48%, #384b34 100%); }
  .thumb.ai-visual { background: linear-gradient(135deg, #eef4f8 0%, #4f6f8f 45%, #222f44 100%); }
  .thumb::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 22% 32%, rgba(255,255,255,0.32) 0 3px, transparent 4px),
      radial-gradient(circle at 72% 48%, rgba(255,255,255,0.24) 0 3px, transparent 4px),
      linear-gradient(90deg, transparent 0 18%, rgba(255,255,255,0.22) 18% 19%, transparent 19% 42%, rgba(255,255,255,0.18) 42% 43%, transparent 43%);
  }
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
  @media (max-width: 760px) {
    h1 { font-size: var(--text-3xl); }
    .resource-band { align-items: flex-start; flex-direction: column; }
  }
</style>

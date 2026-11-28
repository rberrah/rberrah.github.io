<script>
  import { resolve } from '$app/paths';
  const base = resolve('/').replace(/\/$/, '');
  import { BookOpen, FlaskConical, Blocks, ChartNoAxesCombined, GraduationCap, ArrowRight } from '@lucide/svelte';
  import chapters from '#lib/content/loadChapters.js';
  import { newsEntries, newsDate } from '#lib/content/news.js';
  $: latestNews = newsEntries[0][$language === 'en' ? 'en' : 'fr'];
  import { beginnerTrack, tracks, chaptersByTrack } from '#lib/content/tracks.js';
  import { language } from '#lib/stores/language.js';
  import { localizeChapter, localizeTrack, ui } from '#lib/i18n/translations.js';
  import { AUTHOR, COURSE_NAME, jsonLdScript, LICENSE_URL, SITE_URL, SITE_ORIGIN } from '#lib/site.js';

  const grouped = chaptersByTrack(chapters);
  const coreCount = grouped.core.length;
  const layerOrder = ['tronc', 'approfondissement', 'domaine', 'reference'];
  const layerIcons = [BookOpen, Blocks, FlaskConical, GraduationCap];
  const layerLabels = [{fr:'01 · APPRENDRE',en:'01 · LEARN'},{fr:'02 · MODÉLISER',en:'02 · MODEL'},{fr:'03 · APPLIQUER',en:'03 · APPLY'},{fr:'04 · CONSULTER',en:'04 · REFERENCE'}];
  $: copy = ui($language);
  $: goals = [
    { icon: BookOpen, fr: 'Comprendre un concept', en: 'Understand a concept', href: '/chapitres/' },
    { icon: FlaskConical, fr: 'Explorer une expérience', en: 'Explore an experiment', href: '/laboratoires/' },
    { icon: Blocks, fr: 'Construire un modèle', en: 'Build a model', href: '/pk/' },
    { icon: ChartNoAxesCombined, fr: 'Analyser une exposition', en: 'Analyze an exposure', href: '/tdm/' },
    { icon: ChartNoAxesCombined, fr: 'Consulter les cibles TDM', en: 'Browse TDM target references', href: '/cibles-tdm/' },
    { icon: GraduationCap, fr: 'Préparer un cours', en: 'Prepare a lesson', href: '/laboratoires/?lab=distribution&teacher=1&hide=1' },
    { icon: Blocks, fr: 'Explorer l’écosystème', en: 'Explore the ecosystem', href: '/ecosystem/' }
  ];

  // Le seul JSON-LD `Course` du site : il décrit le cours ENTIER. Chaque chapitre se
  // rattache à lui par `isPartOf` — le déclarer deux fois créerait deux cours distincts.
  const courseJsonLd = jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: COURSE_NAME,
    description:
      "Cours visuel et interactif de pharmacométrie : PK/PD, modélisation de population, analyse non-compartimentale, PBPK, suivi thérapeutique, validation de modèle et IA appliquée.",
    url: SITE_URL,
    inLanguage: ['fr', 'en'],
    isAccessibleForFree: true,
    license: LICENSE_URL,
    author: {
      '@type': 'Person',
      name: AUTHOR.name,
      identifier: AUTHOR.orcid,
      url: AUTHOR.url
    },
    provider: {
      '@type': 'Person',
      name: AUTHOR.name,
      url: AUTHOR.url
    }
  });
</script>

<svelte:head>
  {@html courseJsonLd}
</svelte:head>

<section class="hero" data-testid="hero">
  <div class="hero-intro">
    <a class="home-back" href="https://rberrah.github.io/" data-sveltekit-reload data-testid="home-main-site">← {$language === 'en' ? 'Personal website' : 'Site personnel'}</a>
    <p class="eyebrow">{copy.home.eyebrow}</p>
    <h1>{copy.home.titlePrefix} <span class="hl">{copy.home.titleHighlight}</span> {copy.home.titleSuffix}</h1>
    <p class="lede">{copy.home.lede}</p>
    <div class="cta">
      <a class="btn btn-primary" href={`${base}/game/?lang=${$language}`} data-sveltekit-reload data-testid="cta-game">{$language === 'en' ? 'Play PMx Game · interactive PK' : 'Jouer à PMx Game · la PK interactive'}</a>
      <a class="btn btn-outline" href={`${base}/parcours/${beginnerTrack.id}/?lang=${$language}`} data-testid="cta-start">{$language === 'en' ? 'Guided beginner track' : 'Parcours débutant guidé'}</a>
      <a class="btn btn-outline" href={`${base}/chapitres`} data-testid="cta-browse">{copy.home.browse}</a>
    </div>
    <p class="disclaim-inline" data-testid="hero-disclaimer">{copy.home.disclaimer}</p>
  </div>
  <aside class="news-strip" aria-label={$language === 'en' ? 'Latest update' : 'Dernière actualité'} data-testid="latest-news">
    <p class="eyebrow">{$language === 'en' ? 'LATEST UPDATE' : 'DERNIÈRE ACTUALITÉ'}</p>
    <time datetime={newsEntries[0].date}>{newsDate(newsEntries[0].date, $language === 'en' ? 'en' : 'fr')}</time>
    <h2 class="news-title">{latestNews.title}</h2>
    <a href={`${base}/actualites/?lang=${$language}`} data-testid="home-news-link">{$language === 'en' ? 'All updates' : 'Toutes les actualités'} <ArrowRight size={16} aria-hidden="true" /></a>
  </aside>
</section>

<!-- Primary interactive-learning entry; older guided chapter track remains available. -->
<section class="beginner-feature" data-testid="pmx-game-feature" aria-labelledby="game-feature-title">
  <div class="beginner-feature-body">
    <p class="eyebrow">PMx GAME · {$language === 'en' ? 'LEARN BY DOING' : 'APPRENDRE EN JOUANT'}</p>
    <h2 id="game-feature-title">{$language === 'en' ? 'Five interactive pharmacometrics journeys' : 'Cinq parcours de pharmacométrie interactifs'}</h2>
    <p class="beginner-feature-description">{$language === 'en' ? 'From concentration-time curves and compartment models to population pharmacokinetics, diagnostic plots, variability, residual error and Bayesian dose individualization. Educational examples, not clinical advice.' : 'Des courbes et modèles compartimentaux à la pharmacométrie de population, ses diagnostics, l’IIV, l’erreur résiduelle et l’individualisation bayésienne. Exemples pédagogiques, sans valeur de prescription.'}</p>
    <div class="beginner-feature-details">
      <span><GraduationCap size={17} aria-hidden="true" /> {$language === 'en' ? 'Five progressive tracks' : 'Cinq parcours progressifs'}</span>
      <span><FlaskConical size={17} aria-hidden="true" /> {$language === 'en' ? 'Simulations and decisions' : 'Simulations et décisions'}</span>
      <span><BookOpen size={17} aria-hidden="true" /> {$language === 'en' ? 'PopPK, Pmetrics and MIPD' : 'PopPK, Pmetrics et MIPD'}</span>
    </div>
  </div>
  <a class="btn btn-primary beginner-feature-link" href={`${base}/game/?lang=${$language}`} data-sveltekit-reload data-testid="game-feature-open">
    {$language === 'en' ? 'Open PMx Game' : 'Ouvrir PMx Game'}
    <ArrowRight size={18} aria-hidden="true" />
  </a>
</section>
<!-- A dedicated entry point for first-time learners, separate from the advanced track catalog. -->
<section class="beginner-feature" data-testid="beginner-track-feature" aria-labelledby="beginner-track-title">
  <div class="beginner-feature-body">
    <p class="eyebrow">{$language === 'en' ? 'START HERE · BEGINNER TRACK' : 'COMMENCER ICI · PARCOURS DÉBUTANT'}</p>
    <h2 id="beginner-track-title">{localizeTrack(beginnerTrack, $language).title}</h2>
    <p class="beginner-feature-description">{localizeTrack(beginnerTrack, $language).tagline}</p>
    <div class="beginner-feature-details">
      <span><BookOpen size={17} aria-hidden="true" /> {beginnerTrack.chapterSlugs.length} {$language === 'en' ? 'guided chapters' : 'chapitres guidés'}</span>
      <span><FlaskConical size={17} aria-hidden="true" /> {$language === 'en' ? 'Interactive activities' : 'Activités interactives'}</span>
      <span><GraduationCap size={17} aria-hidden="true" /> {$language === 'en' ? 'Before / after self-assessment' : 'Autoévaluation avant / après'}</span>
    </div>
  </div>
  <a class="btn btn-primary beginner-feature-link" href={`${base}/parcours/${beginnerTrack.id}/?lang=${$language}`} data-testid="beginner-track-open">
    {$language === 'en' ? 'Explore the Beginner Track' : 'Découvrir le parcours débutant'}
    <ArrowRight size={18} aria-hidden="true" />
  </a>
</section>

<section class="objectives" aria-labelledby="objectives-title">
  <h2 id="objectives-title">{$language === 'en' ? 'What is your objective?' : 'Quel est votre objectif ?'}</h2>
  <div>{#each goals as goal}<a href={goal.href==='/ecosystem/'?SITE_ORIGIN+'/ecosystem/?lang='+$language:`${base}${goal.href}`} data-sveltekit-reload={goal.href==='/ecosystem/'?'':undefined}><svelte:component this={goal.icon} size={21}/><span>{$language === 'en' ? goal.en : goal.fr}</span><ArrowRight size={17}/></a>{/each}</div>
</section>

<section class="resource-band" data-testid="teaching-resources">
  <div>
    <h2>{copy.home.resourcesTitle}</h2>
    <p>{copy.home.resourcesText}</p>
  </div>
  <a class="btn btn-outline" href={`${base}/downloads/pharmacometrie-pratique.pptx`} download>{copy.home.downloadSlides}</a>
</section>

<section class="tracks" data-testid="tracks" aria-labelledby="track-guide-title">
  <div class="section-head guide-heading">
    <div>
      <p class="eyebrow">{$language === 'en' ? 'YOUR LEARNING MAP' : 'VOTRE CARTE D’APPRENTISSAGE'}</p>
      <h2 id="track-guide-title" class="section-title">{copy.home.tracksTitle}</h2>
      <p class="guide-intro">{$language === 'en' ? 'Start with the essentials, deepen a method or go directly to a clinical application. Use the reference toolbox as needed.' : 'Commencez par les bases, approfondissez une méthode ou explorez directement une application clinique. Les ressources de référence vous accompagnent à chaque étape.'}</p>
    </div>
    <a class="guide-browse" href={`${base}/chapitres/?lang=${$language}`} data-testid="home-all-chapters">{copy.home.browse} <ArrowRight size={17} aria-hidden="true" /></a>
  </div>
  <div class="learning-map">
    {#each layerOrder as layerId, i}
      {@const inLayer = tracks.filter(t => t.layer === layerId)}
      {#if inLayer.length}
        <section class="layer {layerId}" data-testid={`layer-${layerId}`} aria-labelledby={`layer-title-${layerId}`}>
          <div class="layer-head">
            <div class="layer-kicker"><svelte:component this={layerIcons[i]} size={19} aria-hidden="true" /> <span>{layerLabels[i][$language === 'en' ? 'en' : 'fr']}</span></div>
            <h3 id={`layer-title-${layerId}`}>{copy.home.layers[layerId].title}</h3>
            <p>{copy.home.layers[layerId].desc}</p>
          </div>
          <div class="track-grid">
            {#each inLayer as track}
              {@const localized = localizeTrack(track, $language)}
              {@const count = (grouped[track.id] ?? []).length}
              <article class="track" data-testid="course-track-card" style={`--track:${track.accent}`}>
                {#if track.status === 'available' && count > 0}
                  <a href={`${base}/parcours/${track.id}/?lang=${$language}`} data-testid={`track-open-${track.id}`} class="track-link">
                    <div class="track-text"><h4>{localized.title}</h4>{#if layerId === 'tronc'}<p>{localized.tagline}</p>{/if}<span class="count">{copy.home.chapterCount(count)}</span></div>
                    <ArrowRight size={18} aria-hidden="true" />
                  </a>
                {:else}
                  <div class="track-link"><div class="track-text"><h4>{localized.title}</h4><span class="count">{copy.home.inPreparation}</span></div></div>
                {/if}
              </article>
            {/each}
          </div>
          {#if layerId === 'tronc'}
            <svg class="foundation-figure" viewBox="0 0 240 105" aria-hidden="true" focusable="false">
              <path d="M12 12V93H231" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4" />
              <path d="M12 93C31 93 34 20 69 20S133 68 174 80S210 88 231 90" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
              <path d="M12 93C31 93 34 20 69 20S133 68 174 80S210 88 231 90L231 93Z" fill="currentColor" opacity=".1"/>
              {#each [[25,71],[45,35],[69,20],[100,39],[135,65],[174,80],[212,88]] as point}
                <circle cx={point[0]} cy={point[1]} r="3.3" fill="currentColor"/>
              {/each}
            </svg>
          {/if}
        </section>
      {/if}
    {/each}
  </div>
</section>

<section class="chapters" data-testid="featured-chapters" aria-labelledby="core-chapters-title">
  <details class="chapter-disclosure">
    <summary>
      <div><h2 id="core-chapters-title">{copy.home.featuredTitle}</h2><p>{copy.home.chapterCount(coreCount)} · {$language === 'en' ? 'Full outline of the core track' : 'Sommaire du parcours fondamental'}</p></div>
      <span class="chapter-toggle" aria-hidden="true">+</span>
    </summary>
    <ol class="chap-list">
      {#each grouped.core as c, i}
        {@const localized = localizeChapter(c, $language).chapter}
        <li><a class="chap" href={`${base}/chapitres/${c.slug}/?lang=${$language}`} data-testid="chapter-link">
          <span class="num">{String(i + 1).padStart(2,'0')}</span><strong>{localized.title}</strong><ArrowRight size={15} aria-hidden="true"/>
        </a></li>
      {/each}
    </ol>
  </details>
</section>

<style>
  .beginner-feature {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-8);
    margin: 0 0 var(--space-10);
    padding: var(--space-8);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-strong);
    border-left: 4px solid var(--accent-pk);
    border-radius: 12px;
  }
  .beginner-feature-body { min-width: 0; }
  .beginner-feature h2 { margin: 0 0 var(--space-2); font-size: var(--text-2xl); letter-spacing: -0.025em; }
  .beginner-feature-description { margin: 0; max-width: 65ch; color: var(--text-secondary); }
  .beginner-feature-details {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    margin-top: var(--space-5);
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }
  .beginner-feature-details span { display: inline-flex; align-items: center; gap: var(--space-2); }
  .beginner-feature-details :global(svg) { flex-shrink: 0; color: var(--accent-pk); }
  .beginner-feature-link { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); white-space: nowrap; }
  .news-strip { min-width:0; padding:14px; margin-top:var(--space-8); background:var(--bg-tertiary); border:1px solid var(--border-strong); border-top:3px solid var(--accent-pk); border-radius:10px; }
  .news-strip .eyebrow { margin:0 0 8px; }
  .news-strip time { display:block; font-size:var(--text-xs); color:var(--text-secondary); margin-bottom:10px; }
  .news-title { margin:0 0 8px; font-size:1rem; line-height:1.35; font-weight:700; color:var(--text-primary); }
  .news-strip a { display:inline-flex; gap:8px; align-items:center; font-weight:600; font-size:var(--text-sm); }
  .news-strip a :global(svg) { flex-shrink:0; }
  @media(max-width:980px) { .news-strip { margin-top:0; max-width:100%; } }
  .objectives { padding: 24px 0; border-block: 1px solid var(--border-strong); margin-bottom: 24px; }
  .objectives h2 { font-size: 22px; letter-spacing: 0; }
  .objectives > div { display: grid; grid-template-columns: repeat(auto-fit,minmax(205px,1fr)); gap: 12px 24px; }
  .objectives a { display: flex; align-items: center; gap: 10px; padding: 12px 0; color: var(--text-primary); font-size: 14px; text-decoration: none; border-bottom: 2px solid #087b83; }
  .objectives a :global(svg) { flex-shrink: 0; } .objectives a span { flex: 1; }
  .hero { display:grid; grid-template-columns:minmax(0,1fr) minmax(185px,210px); align-items:start; gap:clamp(18px,2.4vw,32px); padding:var(--space-16) 0 var(--space-12); }
  .hero-intro { min-width:0; max-width:820px; }
  @media(max-width:980px) { .hero { grid-template-columns:minmax(0,1fr); gap:var(--space-5); } }
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
  .home-back { display:inline-block; color:var(--text-secondary); font-size:var(--text-sm); margin-bottom:var(--space-5); text-decoration:none; }
  .home-back:hover { color:var(--accent-pk); text-decoration:underline; }
  .tracks { margin-top:var(--space-12); }
  .guide-heading { gap:var(--space-5); align-items:flex-end; }
  .guide-heading .section-title { margin:var(--space-2) 0; }
  .guide-intro { max-width:65ch; margin:0; color:var(--text-secondary); }
  .guide-browse { display:inline-flex; align-items:center; gap:8px; font-weight:600; white-space:nowrap; }
  .learning-map { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:var(--space-5); margin-top:var(--space-6); }
  .layer { min-width:0; padding:clamp(16px,2.5vw,30px); border:1px solid var(--border-strong); border-radius:14px; background:var(--bg-tertiary); }
  .layer.tronc { grid-column:1/-1; position:relative; overflow:hidden; padding-right:clamp(140px,28%,300px); border-left:4px solid var(--accent-pk); }
  .layer.reference { grid-column:1/-1; }
  .layer-kicker { display:flex; align-items:center; gap:8px; font-size:var(--text-xs); color:var(--text-secondary); font-weight:700; letter-spacing:.06em; }
  .layer-kicker :global(svg) { color:var(--accent-pk); flex-shrink:0; }
  .layer-head h3 { font-size:var(--text-xl); letter-spacing:-.025em; margin:var(--space-3) 0 var(--space-2); }
  .layer-head p { color:var(--text-secondary); margin:0; font-size:var(--text-sm); max-width:64ch; }
  .track-grid { display:grid; gap:8px; margin-top:var(--space-4); }
  .reference .track-grid { grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr)); }
  .track { min-width:0; }
  .track-link { display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:64px; padding:10px 12px; color:var(--text-primary); background:var(--bg-primary); border:1px solid var(--border-subtle); border-left:3px solid var(--track); border-radius:7px; text-decoration:none; }
  a.track-link:hover { border-color:var(--track); }
  .track-link :global(svg) { color:var(--track); flex-shrink:0; }
  .track-text { min-width:0; overflow-wrap:anywhere; }
  .track-text h4 { font-size:var(--text-sm); font-weight:700; margin:0 0 4px; }
  .track-text p { color:var(--text-secondary); font-size:var(--text-sm); margin:0 0 5px; }
  .count { font-size:var(--text-xs); color:var(--text-secondary); }
  .foundation-figure { position:absolute; right:4%; width:24%; top:50%; transform:translateY(-50%); color:var(--accent-pk); pointer-events:none; }
  .chapters { margin-top:var(--space-6); }
  .chapter-disclosure { border:1px solid var(--border-strong); border-radius:10px; background:var(--bg-tertiary); }
  .chapter-disclosure summary { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:var(--space-5); cursor:pointer; list-style:none; }
  .chapter-disclosure summary::-webkit-details-marker { display:none; }
  .chapter-disclosure h2 { font-size:var(--text-lg); margin:0 0 4px; }
  .chapter-disclosure p { margin:0; color:var(--text-secondary); font-size:var(--text-sm); }
  .chapter-toggle { font-size:1.5rem; color:var(--accent-pk); line-height:1; }
  .chapter-disclosure[open] .chapter-toggle { transform:rotate(45deg); }
  .chap-list { list-style:none; margin:0; padding:0 var(--space-5) var(--space-5); display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 20px; }
  .chap { display:flex; gap:10px; align-items:center; padding:12px 0; color:inherit; text-decoration:none; border-top:1px solid var(--border-subtle); font-size:var(--text-sm); }
  .chap strong { flex:1; min-width:0; }
  .chap :global(svg) { flex-shrink:0; color:var(--text-secondary); }
  .num { font-family:var(--font-mono); color:var(--accent-pk); font-weight:600; }
  @media(max-width:760px) { .guide-heading { align-items:flex-start; flex-direction:column; } .guide-browse { white-space:normal; } .learning-map { grid-template-columns:minmax(0,1fr); } .layer.tronc { padding-right:var(--space-5); } .foundation-figure { display:none; } .chap-list { grid-template-columns:minmax(0,1fr); } }
  @media (max-width: 760px) {
    .beginner-feature { grid-template-columns: minmax(0, 1fr); padding: var(--space-5); gap: var(--space-5); }
    .beginner-feature-link { justify-self: start; white-space: normal; }
    h1 { font-size: var(--text-3xl); }
    .resource-band { align-items: flex-start; flex-direction: column; }
  }
</style>

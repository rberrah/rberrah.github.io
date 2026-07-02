<script>
  import { base } from '$app/paths';
  import { onMount, onDestroy, tick } from 'svelte';
  import { page } from '$app/stores';
  import chapters from '$lib/content/loadChapters';
  import Quiz from '$lib/components/ui/Quiz.svelte';
  import { language } from '$lib/stores/language';
  import { localizeChapter, ui } from '$lib/i18n/translations';

  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { reducedMotion } from '$lib/motion/reducedMotion';
  import SlideFigure from '$lib/components/visualizations/SlideFigure.svelte';

  // Registre AUTOMATIQUE : tout composant déposé dans
  // src/lib/components/visualizations/ est utilisable via viz="..." sans éditer
  // ce fichier. Voir src/lib/content/vizRegistry.js.
  import vizMap, { availableVizKeys } from '$lib/content/vizRegistry';

  $: slug = $page.params.slug;
  $: chapter = chapters.find((c) => c.slug === slug);
  $: localizedResult = localizeChapter(chapter, $language);
  $: displayChapter = localizedResult.chapter;
  $: isFallback = localizedResult.isFallback;
  $: copy = ui($language);
  $: idx = chapters.findIndex((c) => c.slug === slug);
  $: prev = idx > 0 ? chapters[idx - 1] : null;
  $: next = idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null;
  $: prevDisplay = localizeChapter(prev, $language).chapter;
  $: nextDisplay = localizeChapter(next, $language).chapter;

  let activeIndex = 0;
  /** @type {HTMLElement[]} */
  let stepEls = [];
  /** @type {HTMLElement} */
  let articleEl;
  let progress = 0;

  $: currentStep = displayChapter?.steps?.[activeIndex];
  $: activeSlideIds = currentStep?.slides?.length ? currentStep.slides : [];
  // last step that defines a viz (so the panel persists while scrolling text-only steps)
  $: activeViz = (() => {
    if (!displayChapter) return null;
    for (let i = activeIndex; i >= 0; i--) {
      const v = displayChapter.steps[i]?.viz;
      if (v && vizMap[v]) return v;
    }
    for (const s of displayChapter.steps) {
      if (s.viz && vizMap[s.viz]) return s.viz;
    }
    return null;
  })();
  // Clé de viz demandée (même non résolue) : affiche un message d'aide explicite
  // en cas de faute de frappe dans un bloc step (viz="...").
  $: requestedViz = (() => {
    if (!displayChapter) return null;
    for (let i = activeIndex; i >= 0; i--) {
      const v = displayChapter.steps[i]?.viz;
      if (v) return v;
    }
    return null;
  })();

  /** @type {IntersectionObserver | null} */
  let observer = null;

  function setupObserver() {
    if (observer) observer.disconnect();
    if (typeof IntersectionObserver === 'undefined') return;
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number(/** @type {HTMLElement} */ (e.target).dataset.index);
            if (!Number.isNaN(i)) activeIndex = i;
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    stepEls.forEach((el) => el && observer && observer.observe(el));
  }

  function onScroll() {
    if (!articleEl) return;
    const rect = articleEl.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const passed = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
    progress = total > 0 ? passed / total : 0;
  }

  onMount(async () => {
    await tick();
    setupObserver();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  onDestroy(() => {
    if (observer) observer.disconnect();
    if (typeof window !== 'undefined') window.removeEventListener('scroll', onScroll);
  });

  // re-run observer + math when the chapter changes (client-side nav)
  let lastSlug = '';
  $: if (slug && slug !== lastSlug) {
    lastSlug = slug;
    activeIndex = 0;
    tick().then(() => {
      setupObserver();
    });
  }
</script>

{#if !displayChapter}
  <div class="missing" data-testid="chapter-missing">
    <h1>{copy.chapter.missingTitle}</h1>
    <a class="btn btn-outline" href={`${base}/chapitres`}>{copy.chapter.backMissing}</a>
  </div>
{:else}
  <div class="progress" style={`--p:${progress}`} data-testid="reading-progress"><div class="bar"></div></div>

  <header class="chap-head">
    <a class="back" href={`${base}/chapitres`} data-testid="back-link">{copy.chapter.back}</a>
    <p class="eyebrow">{copy.chapter.label(String(idx + 1).padStart(2, '0'))}</p>
    <h1 data-testid="chapter-title">{displayChapter.title}</h1>
    <p class="desc">{displayChapter.description}</p>
    {#if isFallback}
      <p class="fallback-notice" data-testid="chapter-language-fallback">{copy.chapter.fallbackNotice}</p>
    {/if}
  </header>

  <div class="scrolly">
    <div class="narrative" bind:this={articleEl}>
      {#each displayChapter.steps as step, i}
        <section
          class="step"
          class:active={i === activeIndex}
          data-index={i}
          data-testid="scrollytelling-step"
          bind:this={stepEls[i]}
        >
          <p class="step-kicker">{String(i + 1).padStart(2, '0')} · {step.title}</p>
          <div class="prose">{@html step.html}</div>
        </section>
      {/each}

      {#if displayChapter.quiz?.length}
        <section class="step quiz-step" data-testid="chapter-quiz">
          <p class="step-kicker">{copy.chapter.checkpoint}</p>
          <Quiz title={copy.chapter.quizTitle} questions={displayChapter.quiz} />
        </section>
      {/if}

      <nav class="chap-nav" data-testid="chapter-nav">
        {#if prev}
          <a class="nav-card" href={`${base}/chapitres/${prev.slug}`} data-testid="prev-chapter">
            <span>{copy.chapter.previous}</span><strong>{prevDisplay.title}</strong>
          </a>
        {:else}<span></span>{/if}
        {#if next}
          <a class="nav-card right" href={`${base}/chapitres/${next.slug}`} data-testid="next-chapter">
            <span>{copy.chapter.next}</span><strong>{nextDisplay.title}</strong>
          </a>
        {/if}
      </nav>
    </div>

    <aside class="viz-panel" data-testid="viz-panel">
      <div class="viz-inner">
        {#if activeViz && vizMap[activeViz]}
          {#key activeViz}
            <div
              class="viz-swap"
              in:fly={{ y: $reducedMotion ? 0 : 14, duration: $reducedMotion ? 0 : 320, easing: cubicOut }}
              out:fade={{ duration: $reducedMotion ? 0 : 120 }}
            >
              <svelte:component this={vizMap[activeViz]} />
            </div>
          {/key}
        {:else if activeSlideIds.length}
          <SlideFigure slideIds={activeSlideIds} />
        {:else if requestedViz && !vizMap[requestedViz]}
          <div class="viz-empty">
            <p><strong>Visualisation introuvable&nbsp;:</strong> <code>{requestedViz}</code></p>
            <p class="hint">Vérifiez le nom du composant dans <code>src/lib/components/visualizations/</code>. Clés disponibles&nbsp;:</p>
            <p class="keys">{availableVizKeys.join(' · ')}</p>
          </div>
        {:else}
          <div class="viz-empty">
            <p>{copy.chapter.emptyViz}</p>
          </div>
        {/if}
      </div>
    </aside>
  </div>
{/if}

<style>
  .progress { position: sticky; top: 56px; z-index: 40; height: 3px; background: var(--border-subtle); margin: 0 0 var(--space-6); }
  .progress .bar { height: 100%; width: calc(var(--p) * 100%); background: var(--accent-pk); transition: width 0.1s linear; }

  .chap-head { max-width: 720px; margin-bottom: var(--space-8); }
  .back { font-family: var(--font-mono); font-size: var(--text-sm); text-decoration: none; color: var(--text-secondary); }
  .chap-head h1 { font-size: var(--text-3xl); margin: var(--space-2) 0; }
  .chap-head .desc { color: var(--text-secondary); font-size: var(--text-lg); }
  .fallback-notice { color: var(--text-muted); font-family: var(--font-mono); font-size: var(--text-xs); margin: var(--space-4) 0 0; }

  .scrolly { display: grid; grid-template-columns: 1fr; gap: var(--space-8); }
  @media (min-width: 920px) {
    .scrolly { grid-template-columns: minmax(0, 1fr) minmax(420px, 1.1fr); gap: var(--space-12); align-items: start; }
  }

  .narrative { display: flex; flex-direction: column; }
  .step { padding: var(--space-6) 0; transition: opacity 0.3s ease; }
  @media (min-width: 920px) { .step { min-height: 62vh; display: flex; flex-direction: column; justify-content: center; opacity: 0.4; } .step.active { opacity: 1; } }
  .step-kicker { font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-pk); margin: 0 0 var(--space-3); }
  .prose { font-size: var(--text-base); line-height: var(--line-height-body); color: var(--text-primary); }
  .prose :global(p) { margin: 0 0 var(--space-4); color: var(--text-secondary); }
  .prose :global(strong) { color: var(--text-primary); }
  .prose :global(ul) { color: var(--text-secondary); padding-left: 1.2em; }
  .prose :global(li) { margin-bottom: var(--space-2); }
  .prose :global(.math-rendered) { overflow-x: auto; }
  .prose :global(.math-display) { margin: var(--space-6) 0; padding: var(--space-4); background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius); }
  .prose :global(.katex-display) { margin: var(--space-6) 0; padding: var(--space-4); background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius); overflow-x: auto; }
  .prose :global(.math-display .katex-display) { margin: 0; padding: 0; background: transparent; border: 0; }

  /* --- Encadrés pédagogiques (:::pitfall, :::key, :::clinical, :::note, :::math) --- */
  .prose :global(.callout) {
    margin: var(--space-5) 0;
    padding: var(--space-4) var(--space-4) var(--space-4) var(--space-6);
    border-left: 3px solid var(--border-strong);
    border-radius: 0 var(--radius) var(--radius) 0;
    background: var(--bg-tertiary);
  }
  .prose :global(.callout p) { margin: 0 0 var(--space-2); }
  .prose :global(.callout p:last-child) { margin-bottom: 0; }
  .prose :global(.callout-label) {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
    margin-bottom: var(--space-2) !important;
  }
  .prose :global(.callout-pitfall) { border-left-color: var(--accent-pk); background: color-mix(in srgb, var(--accent-pk) 6%, var(--bg-tertiary)); }
  .prose :global(.callout-pitfall .callout-label) { color: var(--accent-pk); }
  .prose :global(.callout-key) { border-left-color: var(--accent-pd); background: color-mix(in srgb, var(--accent-pd) 6%, var(--bg-tertiary)); }
  .prose :global(.callout-key .callout-label) { color: var(--accent-pd); }
  .prose :global(.callout-clinical) { border-left-color: var(--accent-ai); background: color-mix(in srgb, var(--accent-ai) 6%, var(--bg-tertiary)); }
  .prose :global(.callout-clinical .callout-label) { color: var(--accent-ai); }
  .prose :global(.callout-math) { border-left-color: var(--border-strong); }
  .prose :global(.callout-math .callout-label) { color: var(--text-secondary); }
  .prose :global(.callout-note .callout-label) { color: var(--text-muted); }

  .viz-panel { position: relative; }
  @media (min-width: 920px) {
    .viz-panel { position: sticky; top: 80px; height: calc(100vh - 110px); display: flex; align-items: center; }
  }
  .viz-inner { width: 100%; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: var(--space-6); box-shadow: 0 14px 40px rgba(26, 28, 29, 0.07); }
  .viz-swap { width: 100%; }
  .viz-empty { color: var(--text-muted); text-align: center; padding: var(--space-12) var(--space-4); }
  .viz-empty .hint { font-size: var(--text-sm); margin-top: var(--space-2); }
  .viz-empty .keys { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); margin-top: var(--space-3); line-height: 1.9; }
  .viz-empty code { background: var(--bg-secondary); padding: 0.05em 0.35em; border-radius: 4px; }

  .quiz-step { min-height: auto; opacity: 1; }
  .chap-nav { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-top: var(--space-8); }
  .nav-card { display: flex; flex-direction: column; gap: 2px; text-decoration: none; padding: var(--space-4); border: 1px solid var(--border-subtle); border-radius: var(--radius); background: var(--bg-tertiary); transition: border-color 0.2s ease, transform 0.2s ease; }
  .nav-card:hover { border-color: var(--accent-pk); transform: translateY(-2px); }
  .nav-card.right { text-align: right; }
  .nav-card span { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); }
  .nav-card strong { color: var(--text-primary); }
  .missing { text-align: center; padding: var(--space-24) 0; display: grid; gap: var(--space-4); place-items: center; }
</style>

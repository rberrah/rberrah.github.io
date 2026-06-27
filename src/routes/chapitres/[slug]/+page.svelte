<script>
  import { base } from '$app/paths';
  import { onMount, onDestroy, tick } from 'svelte';
  import { page } from '$app/stores';
  import chapters from '$lib/content/loadChapters';
  import Quiz from '$lib/components/ui/Quiz.svelte';

  // visualization registry
  import HumanBody from '$lib/components/visualizations/01_HumanBody.svelte';
  import BucketSim from '$lib/components/visualizations/02_BucketSim.svelte';
  import ThreeApproaches from '$lib/components/visualizations/04_ThreeApproaches.svelte';
  import PK1C from '$lib/components/visualizations/09_PK1C.svelte';
  import Variability from '$lib/components/visualizations/12_VariabilitySandbox.svelte';
  import Allometry from '$lib/components/visualizations/14_AllometryCentering.svelte';
  import VPC from '$lib/components/visualizations/17_VPCCrashTest.svelte';
  import NeuralBox from '$lib/components/visualizations/20_NeuralBox.svelte';
  import IVBolus from '$lib/components/visualizations/IVBolusExplorer.svelte';
  import OralAbsorption from '$lib/components/visualizations/OralAbsorptionExplorer.svelte';

  /** @type {Record<string, any>} */
  const vizMap = {
    '01_HumanBody': HumanBody,
    '02_BucketSim': BucketSim,
    '04_ThreeApproaches': ThreeApproaches,
    '09_PK1C': PK1C,
    '12_VariabilitySandbox': Variability,
    '14_AllometryCentering': Allometry,
    '17_VPCCrashTest': VPC,
    '20_NeuralBox': NeuralBox,
    IVBolus,
    OralAbsorption
  };

  $: slug = $page.params.slug;
  $: chapter = chapters.find((c) => c.slug === slug);
  $: idx = chapters.findIndex((c) => c.slug === slug);
  $: prev = idx > 0 ? chapters[idx - 1] : null;
  $: next = idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null;

  let activeIndex = 0;
  /** @type {HTMLElement[]} */
  let stepEls = [];
  /** @type {HTMLElement} */
  let articleEl;
  let progress = 0;

  $: currentStep = chapter?.steps?.[activeIndex];
  // last step that defines a viz (so the panel persists while scrolling text-only steps)
  $: activeViz = (() => {
    if (!chapter) return null;
    for (let i = activeIndex; i >= 0; i--) {
      const v = chapter.steps[i]?.viz;
      if (v && vizMap[v]) return v;
    }
    for (const s of chapter.steps) {
      if (s.viz && vizMap[s.viz]) return s.viz;
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

  let katexReady = false;
  async function loadKatex() {
    if (typeof window === 'undefined') return;
    const w = /** @type {any} */ (window);
    if (w.renderMathInElement) return (katexReady = true);
    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link');
      link.id = 'katex-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      document.head.appendChild(link);
    }
    await loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js');
    katexReady = true;
  }
  function loadScript(/** @type {string} */ src) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
  }
  async function renderMath() {
    await tick();
    const w = /** @type {any} */ (window);
    if (!w.renderMathInElement || !articleEl) return;
    w.renderMathInElement(articleEl, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false
    });
  }

  onMount(async () => {
    await tick();
    setupObserver();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    await loadKatex();
    await renderMath();
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
      if (katexReady) renderMath();
    });
  }
</script>

{#if !chapter}
  <div class="missing" data-testid="chapter-missing">
    <h1>Chapter not found</h1>
    <a class="btn btn-outline" href={`${base}/chapitres`}>Back to chapters</a>
  </div>
{:else}
  <div class="progress" style={`--p:${progress}`} data-testid="reading-progress"><div class="bar"></div></div>

  <header class="chap-head">
    <a class="back" href={`${base}/chapitres`} data-testid="back-link">← All chapters</a>
    <p class="eyebrow">Chapter {String(idx + 1).padStart(2, '0')}</p>
    <h1 data-testid="chapter-title">{chapter.title}</h1>
    <p class="desc">{chapter.description}</p>
  </header>

  <div class="scrolly">
    <div class="narrative" bind:this={articleEl}>
      {#each chapter.steps as step, i}
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

      {#if chapter.quiz?.length}
        <section class="step quiz-step" data-testid="chapter-quiz">
          <p class="step-kicker">Checkpoint</p>
          <Quiz title="Check your understanding" questions={chapter.quiz} />
        </section>
      {/if}

      <nav class="chap-nav" data-testid="chapter-nav">
        {#if prev}
          <a class="nav-card" href={`${base}/chapitres/${prev.slug}`} data-testid="prev-chapter">
            <span>← Previous</span><strong>{prev.title}</strong>
          </a>
        {:else}<span></span>{/if}
        {#if next}
          <a class="nav-card right" href={`${base}/chapitres/${next.slug}`} data-testid="next-chapter">
            <span>Next →</span><strong>{next.title}</strong>
          </a>
        {/if}
      </nav>
    </div>

    <aside class="viz-panel" data-testid="viz-panel">
      <div class="viz-inner">
        {#if activeViz && vizMap[activeViz]}
          <svelte:component this={vizMap[activeViz]} />
        {:else}
          <div class="viz-empty">
            <p>Scroll to explore the interactive figures for this chapter.</p>
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
  .prose :global(.katex-display) { margin: var(--space-6) 0; padding: var(--space-4); background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius); overflow-x: auto; }

  .viz-panel { position: relative; }
  @media (min-width: 920px) {
    .viz-panel { position: sticky; top: 80px; height: calc(100vh - 110px); display: flex; align-items: center; }
  }
  .viz-inner { width: 100%; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: var(--space-6); box-shadow: 0 14px 40px rgba(26, 28, 29, 0.07); }
  .viz-empty { color: var(--text-muted); text-align: center; padding: var(--space-12) var(--space-4); }

  .quiz-step { min-height: auto; opacity: 1; }
  .chap-nav { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-top: var(--space-8); }
  .nav-card { display: flex; flex-direction: column; gap: 2px; text-decoration: none; padding: var(--space-4); border: 1px solid var(--border-subtle); border-radius: var(--radius); background: var(--bg-tertiary); transition: border-color 0.2s ease, transform 0.2s ease; }
  .nav-card:hover { border-color: var(--accent-pk); transform: translateY(-2px); }
  .nav-card.right { text-align: right; }
  .nav-card span { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); }
  .nav-card strong { color: var(--text-primary); }
  .missing { text-align: center; padding: var(--space-24) 0; display: grid; gap: var(--space-4); place-items: center; }
</style>

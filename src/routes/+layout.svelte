<script>
  import 'katex/dist/katex.min.css';
  import '$lib/styles/theme.css';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import LanguageToggle from '$lib/components/LanguageToggle.svelte';
  import { ui } from '$lib/i18n/translations';
  import { language } from '$lib/stores/language';
  let { children } = $props();

  let copy = $derived(ui($language));
  let links = $derived([
    { href: '/', key: 'home', label: copy.nav.home },
    { href: '/chapitres', key: 'course', label: copy.nav.course },
    { href: '/exemple', key: 'example', label: copy.nav.example },
    { href: '/exercices', key: 'exercises', label: copy.nav.exercises },
    { href: '/lego', key: 'lego', label: copy.nav.lego },
    { href: '/playground', key: 'playground', label: copy.nav.playground },
    { href: '/glossaire', key: 'glossary', label: copy.nav.glossary },
    { href: '/references', key: 'references', label: copy.nav.references },
    { href: '/a-propos', key: 'about', label: copy.nav.about }
  ]);

  let menuOpen = $state(false);
  const isActive = (/** @type {string} */ href) =>
    href === '/' ? $page.url.pathname === `${base}/` || $page.url.pathname === base + '/' : $page.url.pathname.startsWith(`${base}${href}`);
</script>

<div class="app">
  <header data-testid="site-header">
    <a class="logo" href={`${base}/`} data-testid="logo-link">
      <span class="mark">Pk</span>
      <span class="word">Pharmacométrie<em>Explain</em></span>
    </a>
    <button class="burger" aria-label="Menu" onclick={() => (menuOpen = !menuOpen)} data-testid="nav-toggle">
      <span></span><span></span><span></span>
    </button>
    <nav class:open={menuOpen} aria-label={copy.nav.primary}>
      {#each links as link}
        <a
          class:active={isActive(link.href)}
          href={`${base}${link.href}`}
          onclick={() => (menuOpen = false)}
          data-testid={`nav-${link.key}`}
        >{link.label}</a>
      {/each}
      <LanguageToggle />
    </nav>
  </header>

  <main>
    {@render children()}
  </main>

  <footer>
    <span>{copy.footer.license}</span>
    <span class="muted">
      {copy.footer.author} ·
      <a href={copy.footer.reportUrl} target="_blank" rel="noopener noreferrer">{copy.footer.report}</a>
    </span>
    <span class="muted">{copy.footer.built}</span>
  </footer>

  <div class="disclaimer" data-testid="educational-disclaimer" role="note">
    {copy.footer.disclaimer}
  </div>
</div>

<style>
  .app { min-height: 100vh; display: flex; flex-direction: column; }
  header {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-6);
    position: sticky; top: 0; z-index: 50;
    background: rgba(249, 248, 246, 0.85);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border-subtle);
  }
  .logo { display: flex; align-items: center; gap: var(--space-3); text-decoration: none; color: var(--text-primary); }
  .mark {
    font-family: var(--font-heading); font-weight: 900; color: var(--bg-primary);
    background: var(--accent-pk); width: 34px; height: 34px; border-radius: 8px;
    display: grid; place-items: center; font-size: 0.95rem; letter-spacing: -0.04em;
  }
  .word { font-family: var(--font-heading); font-weight: 700; font-size: 1.05rem; letter-spacing: -0.02em; }
  .word em { font-style: normal; color: var(--accent-pk); }
  nav { display: flex; gap: var(--space-1); }
  nav :global(.language-toggle) { margin-left: var(--space-2); }
  nav a {
    text-decoration: none; color: var(--text-secondary);
    padding: var(--space-2) var(--space-3); border-radius: 6px; font-weight: 600;
    font-size: var(--text-sm); transition: background-color 0.2s ease, color 0.2s ease;
  }
  nav a:hover { color: var(--text-primary); background: var(--bg-secondary); }
  nav a.active { color: var(--accent-pk); background: rgba(184, 92, 56, 0.1); }
  .burger { display: none; flex-direction: column; gap: 4px; background: none; border: none; cursor: pointer; padding: 8px; }
  .burger span { width: 22px; height: 2px; background: var(--text-primary); display: block; }
  main { flex: 1; width: 100%; max-width: var(--maxw); margin: 0 auto; padding: var(--space-8) var(--space-6) var(--space-24); }
  footer {
    display: flex; flex-direction: column; gap: 2px; text-align: center;
    padding: var(--space-8) var(--space-6) calc(var(--space-12) + 16px);
    color: var(--text-secondary); font-size: var(--text-sm);
    border-top: 1px solid var(--border-subtle); background: var(--bg-secondary);
  }
  .disclaimer {
    position: fixed; bottom: 0; left: 0; width: 100%; z-index: 100;
    background: var(--disclaimer-bg); color: var(--disclaimer-text);
    text-align: center; padding: 6px var(--space-4);
    font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: 0.02em;
  }
  @media (max-width: 760px) {
    .burger { display: flex; }
    nav { position: absolute; top: 100%; right: 0; left: 0; flex-direction: column;
      background: var(--bg-primary); border-bottom: 1px solid var(--border-subtle);
      padding: var(--space-3) var(--space-6); display: none; }
    nav.open { display: flex; }
    nav :global(.language-toggle) { margin: var(--space-2) 0 0; width: max-content; }
    main { padding: var(--space-6) var(--space-4) var(--space-24); }
  }
</style>

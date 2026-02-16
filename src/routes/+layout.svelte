<script>
  import favicon from '$lib/assets/favicon.svg';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  let { children } = $props();
  const links = [
    { href: '/', label: 'Accueil' },
    { href: '/chapitres/intro-pk-pd', label: 'Chapitres' },
    { href: '/playground', label: 'Playground' },
    { href: '/glossaire', label: 'Glossaire' },
    { href: '/a-propos', label: 'À propos' }
  ];
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
  <header>
    <div class="logo"><span>Pharmaco Explain</span></div>
    <nav aria-label="Navigation principale">
      {#each links as link}
        <a class:active={$page.url.pathname === link.href} href={`${base}${link.href}`}>
          {link.label}
        </a>
      {/each}
    </nav>
  </header>
  <main>
    {@render children()}
  </main>
  <footer>
    <span>CC-BY-SA (texte) · Code MIT · 2026</span>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
    background: radial-gradient(circle at 20% 20%, #eef4ff 0, #f8f9ff 35%, #ffffff 70%);
    color: #0f172a;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #e2e8f0;
    z-index: 10;
  }
  nav {
    display: flex;
    gap: 12px;
  }
  nav a {
    text-decoration: none;
    color: #0f172a;
    padding: 8px 10px;
    border-radius: 10px;
    font-weight: 600;
  }
  nav a.active,
  nav a:hover {
    background: #2563eb10;
    color: #2563eb;
  }
  .logo {
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #2563eb;
  }
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 20px 60px;
  }
  footer {
    text-align: center;
    padding: 16px;
    color: #475569;
    font-size: 0.9rem;
  }
</style>

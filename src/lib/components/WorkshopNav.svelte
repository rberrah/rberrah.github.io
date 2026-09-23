<script>
  import { base } from '$app/paths';
  import { language } from '$lib/stores/language';
  import { CodeXml, Pill, Activity, Network, Blocks } from '@lucide/svelte';
  let { active } = $props();
  let items = $derived([
    { id: 'translator', label: $language === 'en' ? 'Model Translator' : 'Traducteur de modèles', icon: CodeXml },
    { id: 'pk', label: $language === 'en' ? 'PK Builder' : 'Atelier PK', icon: Pill },
    { id: 'pd', label: $language === 'en' ? 'PD Builder' : 'Atelier PD', icon: Activity },
    { id: 'ddi', label: $language === 'en' ? 'DDI Builder' : 'Atelier DDI', icon: Network },
    { id: 'advanced', label: $language === 'en' ? 'Advanced Builder' : 'Modélisation avancée', icon: Blocks }
  ]);
</script>

<nav class="workshops" aria-label={$language === 'en' ? 'Model workshops' : 'Ateliers de modelisation'} data-testid="workshop-nav">
  {#each items as item}
    <a href={`${base}/${item.id}/`} aria-current={active === item.id ? 'page' : undefined}><item.icon size={17}/>{item.label}</a>
  {/each}
</nav>

<style>
  .workshops { display: flex; flex-wrap: wrap; gap: 4px 16px; border-bottom: 1px solid var(--border-strong); margin-bottom: 24px; }
  a { display: inline-flex; align-items: center; gap: 7px; padding: 12px 4px; color: var(--text-secondary); text-decoration: none; border-bottom: 3px solid transparent; font-size: 0.9rem; letter-spacing: 0; }
  a[aria-current] { color: var(--text-primary); border-color: #158477; font-weight: 650; }
  a:hover { color: var(--text-primary); } a:focus-visible { outline: 2px solid #158477; outline-offset: 2px; }
  @media (max-width: 440px) { .workshops { gap: 4px 10px; } a { font-size: 0.8rem; gap: 4px; } }
</style>

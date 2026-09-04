<script>
  // Redirection : le chapitre « L'état d'équilibre » a été FUSIONNÉ dans
  // « Doses répétées et état d'équilibre » (doublon supprimé). On préserve
  // l'ancienne URL pour ne casser aucun lien enregistré.
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import { language } from '$lib/stores/language';

  const target = `${base}/chapitres/doses-repetees`;
  onMount(() => { window.location.replace(target); });
</script>

<svelte:head>
  <title>{$language === 'en' ? 'Redirect → Repeated doses and steady state' : "Redirection → Doses répétées et état d'équilibre"}</title>
  <meta name="robots" content="noindex" />
  <meta http-equiv="refresh" content={`0; url=${target}`} />
</svelte:head>

<div class="redir">
  <p class="eyebrow">{$language === 'en' ? 'Merged chapter' : 'Chapitre fusionné'}</p>
  <h1>{$language === 'en' ? 'This chapter has moved' : 'Ce chapitre a déménagé'}</h1>
  {#if $language === 'en'}
    <p>“Steady state” was merged into <strong>“Repeated doses and steady state”</strong>, which now covers accumulation, Css, infusion, and loading doses.</p>
  {:else}
    <p>« L'état d'équilibre » a été fusionné avec <strong>« Doses répétées et état d'équilibre »</strong>, qui couvre désormais l'accumulation, la Css, la perfusion et la dose de charge.</p>
  {/if}
  <p><a class="btn btn-primary" href={target}>{$language === 'en' ? 'Go to chapter →' : 'Aller au chapitre →'}</a></p>
</div>

<style>
  .redir { max-width: 640px; margin: var(--space-16) auto; text-align: center; }
  .eyebrow { font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); }
  h1 { margin: var(--space-3) 0; }
  p { color: var(--text-secondary); }
</style>

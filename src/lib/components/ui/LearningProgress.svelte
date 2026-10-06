<script>
  import { onMount } from 'svelte';
  import { Trash2 } from '@lucide/svelte';
  import { language } from '$lib/stores/language';
  import { learning, loadLearning, enableLearning, clearLearning } from '$lib/stores/learning';
  let confirm = false;
  const t = (/** @type {string} */ fr, /** @type {string} */ en) => $language === 'en' ? en : fr;
  onMount(loadLearning);
</script>

<div class="learning-options">
  <label><input type="checkbox" checked={$learning.enabled} disabled={!$learning.ready} on:change={e => enableLearning(e.currentTarget.checked)} data-testid="save-learning" />{t('Mémoriser ma progression sur cet appareil', 'Remember my progress on this device')}</label>
  <p>{t('Seuls les états pédagogiques sont conservés. Aucune réponse libre, donnée patient ou modèle saisi. Sans cette option, la progression est temporaire. Désactiver supprime la sauvegarde.', 'Only learning statuses are stored. No free-text responses, patient data or entered models. Without this option, progress is temporary. Disabling removes the saved record.')}</p>
  {#if $learning.error}<p role="alert">{t('Le stockage local est indisponible ou invalide. La progression fonctionne sans garantie de sauvegarde ; vérifiez les réglages du navigateur.', 'Local storage is unavailable or invalid. Progress works without guaranteed persistence; check your browser settings.')}</p>{/if}
  {#if confirm}
    <span>{t('Effacer toute la progression ?', 'Clear all progress?')}</span>
    <button on:click={() => { clearLearning(); confirm = false; }}>{t('Confirmer', 'Confirm')}</button>
    <button on:click={() => confirm = false}>{t('Annuler', 'Cancel')}</button>
  {:else}<button on:click={() => confirm = true}><Trash2 size={15}/>{t('Effacer ma progression', 'Clear my progress')}</button>{/if}
</div>

<style>
  .learning-options { border-block: 1px solid var(--border-subtle); padding: 16px 0; margin: 20px 0; font-size: .82rem; }
  label { display: flex; align-items: start; gap: 8px; } input { margin-top: 3px; } p { color: var(--text-secondary); line-height: 1.6; max-width: 80ch; } p[role='alert'] { color: var(--text-primary); }
  button { display: inline-flex; gap: 6px; align-items: center; min-height: 34px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-strong); border-radius: 4px; padding: 6px 9px; font: inherit; cursor: pointer; }
</style>

<script>
  import { labHandoff } from '$lib/labs/handoff.js';
  import { language } from '$lib/stores/language';
  import { ArrowRight, X } from '@lucide/svelte';
  /** @type {string} */ export let destination;
  /** @type {(spec: ReturnType<typeof import('$lib/labs/model.js').laboratorySpec>) => void} */ export let apply;
  export let note = '';
  let applied = false;
  let error = '';
  function confirm() {
    if (!pending) return;
    try { apply(pending.spec); applied = true; labHandoff.set(null); error = ''; }
    catch { error = en ? 'Transfer failed. The experiment is still available; review the destination.' : 'Transfert impossible. L\'experience reste disponible ; verifier la destination.'; }
  }
  $: pending = $labHandoff?.destination === destination ? $labHandoff : null;
  $: en = $language === 'en';
</script>

{#if pending}
  <section class="transfer" aria-label={en ? 'Pending transfer' : 'Transfert en attente'} data-testid="lab-transfer">
    <strong>{en ? 'Resume the laboratory experiment?' : "Reprendre l'experience du laboratoire ?"}</strong>
    <p>{pending.spec.lab === 'absorption' ? (en ? 'Oral' : 'Orale') : pending.spec.lab === 'infusion' ? (en ? 'IV infusion' : 'Perfusion IV') : 'IV bolus'} · mg · L · h · CL = {pending.spec.parameters.cl} L/h · V = {pending.spec.parameters.vc} L</p>
    <p>{note}</p>
    <div>
      <button on:click={confirm}><ArrowRight size={17}/>{en ? 'Apply experiment' : "Appliquer l'experience"}</button>
      <button on:click={() => labHandoff.set(null)}><X size={17}/>{en ? 'Discard' : 'Ignorer'}</button>
    </div>
    {#if error}<p role="alert">{error}</p>{/if}
  </section>
{:else if applied}
  <p role="status">{en ? 'Laboratory parameters applied. No data saved.' : 'Parametres du laboratoire appliques. Aucune donnee sauvegardee.'}</p>
{/if}

<style>
  .transfer { border-left: 3px solid #187c80; background: var(--bg-tertiary); padding: 16px; margin: 16px 0; }
  p { margin: 6px 0; font-size: 14px; }
  .transfer div { display: flex; gap: 12px; flex-wrap: wrap; }
  button { display: inline-flex; align-items: center; gap: 8px; padding: 9px 12px; border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; cursor: pointer; }
</style>

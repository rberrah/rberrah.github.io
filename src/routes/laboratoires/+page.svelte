<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { afterNavigate } from '$app/navigation';
  import Laboratory from '#lib/components/Laboratory.svelte';
  import LaboratoryHome from '#lib/components/LaboratoryHome.svelte';
  import MolecularLaboratory from '#lib/components/MolecularLaboratory.svelte';
  import { molecularLabIds } from '#lib/labs/molecular.js';
  import { language } from '#lib/stores/language.js';
  const fundamental = ['distribution', 'accumulation', 'absorption', 'infusion'];
  const allowed = [...fundamental, ...molecularLabIds];
  let selectedLab = '';
  const readLocation = (/** @type {{ searchParams: { get(name: string): string | null }, hash: string }} */ url) => {
    const queryLab = url.searchParams.get('lab') ?? '';
    const hashLab = new URLSearchParams(url.hash.replace(/^#/, '')).get('lab') ?? '';
    selectedLab = allowed.includes(queryLab) ? queryLab : allowed.includes(hashLab) ? hashLab : '';
  };
  afterNavigate(() => readLocation(page.url));
  onMount(() => {
    const readHash = () => readLocation(new URL(window.location.href));
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  });
</script>
<svelte:head><title>{$language === 'en' ? 'PK laboratories' : 'Laboratoires PK'} | PMx Explain</title></svelte:head>
{#if fundamental.includes(selectedLab)}<Laboratory />{:else if molecularLabIds.includes(selectedLab)}<MolecularLaboratory lab={selectedLab}/>{:else}<LaboratoryHome />{/if}

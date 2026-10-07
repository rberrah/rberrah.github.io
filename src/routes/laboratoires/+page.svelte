<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import Laboratory from '$lib/components/Laboratory.svelte';
  import LaboratoryHome from '$lib/components/LaboratoryHome.svelte';
  import { language } from '$lib/stores/language';
  const allowed = ['distribution', 'accumulation', 'absorption', 'infusion'];
  let hashLab = '';
  $: queryLab = $page.url.searchParams.get('lab') ?? '';
  $: selectedLab = allowed.includes(queryLab) ? queryLab : hashLab;
  onMount(() => {
    const readHash = () => { const value = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('lab') ?? ''; hashLab = allowed.includes(value) ? value : ''; };
    readHash(); window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  });
</script>
<svelte:head><title>{$language === 'en' ? 'PK laboratories' : 'Laboratoires PK'} | PMx Explain</title></svelte:head>
{#if selectedLab}<Laboratory />{:else}<LaboratoryHome />{/if}

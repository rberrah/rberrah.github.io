<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import Laboratory from '$lib/components/Laboratory.svelte';
  import LaboratoryHome from '$lib/components/LaboratoryHome.svelte';
  import { language } from '$lib/stores/language';
  const allowed = ['distribution', 'accumulation', 'absorption', 'infusion'];
  let selectedLab = '';
  onMount(() => {
    const readLocation = (url = new URL(window.location.href)) => {
      const queryLab = url.searchParams.get('lab') ?? '';
      const hashLab = new URLSearchParams(url.hash.replace(/^#/, '')).get('lab') ?? '';
      selectedLab = allowed.includes(queryLab) ? queryLab : allowed.includes(hashLab) ? hashLab : '';
    };
    const unsubscribe = page.subscribe(({ url }) => readLocation(url));
    const readHash = () => readLocation();
    window.addEventListener('hashchange', readHash);
    return () => { unsubscribe(); window.removeEventListener('hashchange', readHash); };
  });
</script>
<svelte:head><title>{$language === 'en' ? 'PK laboratories' : 'Laboratoires PK'} | PMx Explain</title></svelte:head>
{#if selectedLab}<Laboratory />{:else}<LaboratoryHome />{/if}

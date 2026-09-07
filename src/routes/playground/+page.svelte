<script>
  import PopPKPlayground from '$lib/components/visualizations/21_PopPKPlayground.svelte';
  import { language } from '$lib/stores/language';
</script>

<svelte:head>
  <title>{$language === 'en' ? 'PopPK / PKPD simulation' : 'Simulation PopPK / PKPD'} · Pharmacométrie Pratique</title>
</svelte:head>

<h1>{$language === 'en' ? 'PopPK / PKPD simulation' : 'Simulation PopPK / PKPD'}</h1>
<p>{$language === 'en' ? 'Simulate compartments, administration route, IIV/IOV, residual error, sampling, and CSV export in real time.' : 'Simule en direct : nombre de compartiments, voie d’administration, IIV/IOV, erreur résiduelle, sampling, export CSV.'}</p>

<PopPKPlayground />

<style>
  h1 {
    margin-bottom: 4px;
  }
  p {
    margin-bottom: 12px;
  }
</style>

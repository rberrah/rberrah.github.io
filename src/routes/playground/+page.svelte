<script>
  import PopPKPlayground from '$lib/components/visualizations/21_PopPKPlayground.svelte';
  import { language } from '$lib/stores/language';
</script>

<h1>{$language === 'en' ? 'PopPK / PKPD playground' : 'Playground PopPK / PKPD'}</h1>
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

<script>
  import PopPKPlayground from '$lib/components/visualizations/21_PopPKPlayground.svelte';
  import { language } from '$lib/stores/language';
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>{$language === 'en' ? 'PopPK / PKPD simulation' : 'Simulation PopPK / PKPD'} · PMx Explain</title>
</svelte:head>

<h1>{$language === 'en' ? 'PopPK / PKPD simulation' : 'Simulation PopPK / PKPD'}</h1>
<p>{$language === 'en' ? 'Use the real-time guided model, or edit unrestricted mrgsolve code and export a reproducible R, Rmd and CSV workflow.' : 'Utilisez le modèle guidé en temps réel, ou modifiez un code mrgsolve libre et exportez un flux reproductible R, Rmd et CSV.'}</p>

<PopPKPlayground />
<p><a href={`${base}/laboratoires/`}>{$language === 'en' ? 'Explore distribution and accumulation in the animated laboratories' : 'Explorer la distribution et l\'accumulation dans les laboratoires animes'}</a></p>

<style>
  h1 {
    margin-bottom: 4px;
  }
  p {
    margin-bottom: 12px;
  }
</style>

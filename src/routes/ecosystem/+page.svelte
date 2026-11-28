<script>
  import { onMount } from 'svelte';
  import { language } from '#lib/stores/language.js';
  const destination='/ecosystem/';
  onMount(()=>{
    const lang=new URLSearchParams(location.search).get('lang');
    location.replace(destination+(lang==='fr'||lang==='en'?'?lang='+lang:''));
  });
</script>
<svelte:head>
  <title>Explain ecosystem</title>
  <meta name="robots" content="noindex,follow"/>
  <meta http-equiv="refresh" content="2;url=/ecosystem/"/>
</svelte:head>
<h1>{$language==='en'?'The ecosystem has moved':'L’écosystème a déménagé'}</h1>
<p><a href={destination+'?lang='+$language} data-sveltekit-reload>{$language==='en'?'Open the Explain ecosystem':'Ouvrir l’écosystème Explain'}</a></p>

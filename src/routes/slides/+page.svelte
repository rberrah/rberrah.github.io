<script>
  import slideIndex from '../../content/slide_index.json';
  import SlideImage from '$lib/components/SlideImage.svelte';
  import { base } from '$app/paths';
  import { onMount } from 'svelte';

  let viewerUrl = '';

  onMount(() => {
    const origin = window.location.origin;
    const pptxUrl = `${origin}${base}/pharmacometrie-pratique.pptx`;
    viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptxUrl)}`;
  });
</script>

<h1>Slides du PPTX</h1>
<p>
  Liste des 74 slides exportées. Si une vignette est absente, utilisez le lien PPTX ou la visionneuse en ligne.
  <a href={`${base}/pharmacometrie-pratique.pptx`} download>⭳ Télécharger le PPTX</a>
</p>

{#if viewerUrl}
  <div class="viewer">
    <iframe title="Visionneuse PPTX" src={viewerUrl} loading="lazy"></iframe>
  </div>
{/if}

<div class="grid">
  {#each slideIndex as s}
    <div class="card">
      <SlideImage n={s.slide} alt={`Slide ${s.slide}`} caption={s.title || `Slide ${s.slide}`} />
    </div>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
  }
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 6px;
    background: #fff;
  }
  .viewer {
    margin: 12px 0;
    aspect-ratio: 16 / 9;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>

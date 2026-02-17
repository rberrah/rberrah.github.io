<script>
  import slideIndex from '../../content/slide_index.json';
  import SlideImage from '$lib/components/SlideImage.svelte';
</script>

<h1>Slides du PPTX</h1>
<p>Liste des 74 slides exportées. Si une vignette est absente, utilisez le lien PPTX.</p>

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
</style>

<script>
  import { base } from '$app/paths';
  import catalog from '../../content/slides/slide_catalog.json';
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';

  export let n;
  export let alt = 'Slide PPTX';
  export let caption = '';

  const num = String(n).padStart(2, '0');
  const src = `${base}/slides/slide-${num}.png`;
  const pptxHref = `${base}/downloads/pharmacometrie-pratique.pptx`;
  const entry = catalog.find((s) => s.slide === Number(n));
  const slideTitle = entry?.title || '';

  let missing = false;
  $: copy = ui($language);
</script>

<figure class="slide-img">
  {#if !missing}
    <img
      src={src}
      alt={alt}
      loading="lazy"
      on:error={() => (missing = true)}
    />
  {:else}
    <div class="placeholder" role="img" aria-label={copy.pages.slideMissing(num)}>
      <span>{copy.pages.slideMissing(num)}</span>
      <a href={pptxHref}>{copy.pages.openPptx}</a>
    </div>
  {/if}
  <figcaption>{caption || slideTitle || `Slide ${num}`}</figcaption>
</figure>

<style>
  .slide-img {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 6px;
    background: #fff;
  }
  img {
    width: 100%;
    display: block;
    border-radius: 8px;
  }
  .placeholder {
    display: grid;
    place-items: center;
    gap: 6px;
    min-height: 180px;
    color: #475569;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 8px;
    text-align: center;
    font-size: 0.95rem;
  }
  figcaption {
    font-size: 0.9rem;
    color: #475569;
    margin-top: 4px;
    text-align: center;
  }
</style>

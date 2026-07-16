<script>
  import { base } from '$app/paths';
  import catalog from '../../../content/slides/slide_catalog.json';

  /**
   * @typedef {{ id:string, slide:number, file:string, title?:string, purpose?:string }} SlideEntry
   */

  /** @type {string[]} */
  export let slideIds = [];

  /** @type {SlideEntry[]} */
  $: entries = slideIds.reduce((acc, id) => {
    const slide = catalog.find((item) => item.id === id);
    if (slide) acc.push(slide);
    return acc;
  }, /** @type {SlideEntry[]} */ ([]));
</script>

<section class="slide-figure" aria-label="PowerPoint illustration">
  {#if entries.length}
    {#each entries as slide}
      <figure>
        <img
          src={`${base}/slides/${slide.file}`}
          alt={slide.title || `Slide ${slide.slide}`}
          loading="lazy"
        />
        <figcaption>
          <strong>{slide.title || `Slide ${slide.slide}`}</strong>
          {#if slide.purpose && slide.purpose !== 'TODO'}
            <span>{slide.purpose}</span>
          {/if}
        </figcaption>
      </figure>
    {/each}
  {:else}
    <div class="empty">No PowerPoint illustration linked to this step.</div>
  {/if}
</section>

<style>
  .slide-figure {
    display: grid;
    gap: var(--space-4);
  }

  figure {
    margin: 0;
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    overflow: hidden;
  }

  img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: contain;
    background: var(--bg-tertiary);
  }

  figcaption {
    display: grid;
    gap: 2px;
    padding: var(--space-3);
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  figcaption strong {
    color: var(--text-primary);
    font-size: var(--text-base);
  }

  .empty {
    color: var(--text-muted);
    text-align: center;
    padding: var(--space-8);
    border: 1px dashed var(--border-subtle);
    border-radius: 8px;
  }
</style>

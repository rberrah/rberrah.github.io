<script>
  export let n;
  export let alt = 'Slide PPTX';
  export let caption = '';

  const num = String(n).padStart(2, '0');
  const src = `/slides/slide-${num}.png`;
</script>

<figure class="slide-img">
  <img
    src={src}
    alt={alt}
    loading="lazy"
    on:error={(e) => {
      const el = /** @type {HTMLImageElement} */ (e.target);
      if (el) el.style.display = 'none';
    }}
  />
  {#if caption}
    <figcaption>{caption}</figcaption>
  {/if}
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
  figcaption {
    font-size: 0.9rem;
    color: #475569;
    margin-top: 4px;
  }
</style>

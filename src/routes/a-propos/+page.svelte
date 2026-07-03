<script>
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';

  $: copy = ui($language);
</script>

<div class="about">
  <h1>{copy.pages.aboutTitle}</h1>

  <p class="lede">{copy.pages.aboutLede}</p>

  <p class="text">{copy.pages.aboutText}</p>

  <ul>
    {#each copy.pages.aboutItems as item}
      <li>{item}</li>
    {/each}
  </ul>

  <p class="thanks">{copy.pages.aboutThanks}</p>
  <p class="signature">{copy.pages.aboutSignature}</p>
</div>

<style>
  .about { max-width: 680px; }
  h1 { font-size: var(--text-3xl); margin-bottom: var(--space-4); }
  .lede {
    font-size: var(--text-lg);
    color: var(--text-primary);
    line-height: var(--line-height-body);
    border-left: 3px solid var(--accent-pk);
    background: color-mix(in srgb, var(--accent-pk) 5%, var(--bg-tertiary));
    padding: var(--space-4) var(--space-6);
    border-radius: 0 var(--radius) var(--radius) 0;
    margin-bottom: var(--space-6);
  }
  .text { color: var(--text-secondary); line-height: var(--line-height-body); }
  ul { color: var(--text-secondary); line-height: var(--line-height-body); padding-left: 1.2em; margin: var(--space-6) 0; }
  li { margin-bottom: var(--space-2); }
  .thanks { color: var(--text-secondary); font-style: italic; margin-top: var(--space-6); }
  .signature { font-family: var(--font-mono); color: var(--text-primary); font-weight: 600; margin-top: var(--space-2); }
</style>

<script>
  // @ts-nocheck
  // Signature d'auteur en TÊTE de chapitre : qui écrit, dans quel cours, révisé quand.
  // Une seule ligne de texte secondaire — ni encadré, ni photo, ni titre.
  // La date vient du frontmatter (`reviewed_on`) : absente, la mention entière disparaît
  // plutôt que d'afficher une date inventée.
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';
  import { AUTHOR, COURSE_NAME } from '$lib/site';

  /** @type {string} */
  export let reviewedOn = '';

  $: copy = ui($language);
</script>

<p class="signature" data-testid="author-signature">
  <a class="who" href={AUTHOR.url}>{AUTHOR.name}</a>, {AUTHOR.credential}
  <span class="sep" aria-hidden="true">·</span>
  <span class="course">{COURSE_NAME}</span>
  {#if reviewedOn}
    <span class="sep" aria-hidden="true">·</span>
    <span class="rev">{copy.chapter.reviewedOn} : <time datetime={reviewedOn}>{reviewedOn}</time></span>
  {/if}
  <span class="sep" aria-hidden="true">·</span>
  <a class="orcid" href={AUTHOR.orcid} rel="me noopener noreferrer" target="_blank">ORCID</a>
</p>

<style>
  .signature {
    margin: var(--space-3) 0 0;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    line-height: 1.7;
    color: var(--text-muted);
  }
  .signature a { color: var(--text-secondary); text-decoration: none; border-bottom: 1px solid var(--border-subtle); }
  .signature a:hover { color: var(--accent-pk); border-color: var(--accent-pk); }
  .sep { margin: 0 4px; color: var(--border-strong); }
  .orcid { letter-spacing: 0.06em; }
</style>

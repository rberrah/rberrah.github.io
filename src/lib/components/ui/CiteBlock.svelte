<script>
  // @ts-nocheck
  // « Citer cette page » : citation rédigée + entrée BibTeX @misc, en pied de chapitre,
  // après les sources. Bilingue via le store de langue.
  //
  // Aucune balise <meta name="citation_*"> (Highwire) n'est posée ici : les règles
  // d'indexation de Google Scholar excluent le matériel de cours, et déclarer ces
  // balises sur un chapitre pédagogique expose le site à un rejet.
  import { onMount } from 'svelte';
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';
  import { AUTHOR, COURSE_NAME, SITE_YEAR } from '$lib/site';

  /** Chapitre AFFICHÉ (titre dans la langue courante). @type {any} */
  export let chapter = null;
  /** URL canonique absolue de la page. @type {string} */
  export let url = '';

  $: copy = ui($language);
  $: title = chapter?.title ?? '';
  // Année : celle de la dernière révision si le frontmatter la porte, sinon l'année
  // du site. Jamais `new Date()` — la valeur serait figée au prérendu puis recalculée
  // à l'hydratation, et les deux pourraient diverger.
  $: year = /^\d{4}/.test(chapter?.reviewed_on ?? '') ? chapter.reviewed_on.slice(0, 4) : String(SITE_YEAR);
  // Un titre qui se termine déjà par une ponctuation forte n'en reçoit pas une seconde
  // (« Pourquoi la pharmacométrie ?. » serait fautif).
  $: titleStop = /[.?!]$/.test(title.trim()) ? '' : '.';
  $: citation = `${AUTHOR.citationName} ${title}${titleStop} ${COURSE_NAME}, ${year}. ${url}`;
  // Clé BibTeX : ASCII strict, sinon certains moteurs LaTeX refusent l'entrée.
  $: bibKey = `berrah${year}${String(chapter?.slug ?? '').replace(/[^a-z0-9]/gi, '')}`;
  $: bibtex = [
    `@misc{${bibKey},`,
    `  author       = {${AUTHOR.bibtexName}},`,
    // Double accolade : préserve la casse du titre quel que soit le style bibliographique.
    `  title        = {{${title}}},`,
    `  howpublished = {${COURSE_NAME}},`,
    `  year         = {${year}},`,
    `  url          = {${url}},`,
    `  note         = {${copy.chapter.citeNote}}`,
    '}'
  ].join('\n');

  // Le presse-papiers n'existe ni hors navigateur, ni en contexte non sécurisé :
  // dans ce cas le bouton n'est simplement pas rendu (repli silencieux), plutôt
  // qu'affiché et inopérant.
  let canCopy = false;
  onMount(() => {
    canCopy = Boolean(navigator?.clipboard?.writeText);
  });

  /** @type {string | null} */
  let copied = null;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let resetTimer;

  /**
   * @param {string} text
   * @param {string} which
   */
  async function copy(text, which) {
    try {
      await navigator.clipboard.writeText(text);
      copied = which;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => (copied = null), 2000);
    } catch (e) {
      // Refus de permission : on ne dérange pas le lecteur, le texte reste sélectionnable.
    }
  }
</script>

<section class="cite" data-testid="cite-block">
  <h3>{copy.chapter.citeTitle}</h3>

  <div class="row">
    <p class="citation" data-testid="cite-citation">{citation}</p>
    {#if canCopy}
      <button type="button" class="copy" onclick={() => copy(citation, 'citation')}>
        {copied === 'citation' ? copy.chapter.citeCopied : copy.chapter.citeCopy}
      </button>
    {/if}
  </div>

  <div class="row">
    <pre class="bibtex" data-testid="cite-bibtex">{bibtex}</pre>
    {#if canCopy}
      <button type="button" class="copy" onclick={() => copy(bibtex, 'bibtex')}>
        {copied === 'bibtex' ? copy.chapter.citeCopied : copy.chapter.citeCopy}
      </button>
    {/if}
  </div>
</section>

<style>
  .cite { margin-top: var(--space-8); padding-top: var(--space-6); border-top: 1px solid var(--border-subtle); max-width: 760px; }
  h3 { font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin: 0 0 var(--space-3); }
  .row { display: flex; align-items: flex-start; gap: var(--space-3); margin-bottom: var(--space-3); }
  .citation { margin: 0; flex: 1; font-size: var(--text-sm); line-height: 1.6; color: var(--text-secondary); }
  .bibtex {
    margin: 0; flex: 1; min-width: 0;
    padding: var(--space-3) var(--space-4);
    background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius);
    font-family: var(--font-mono); font-size: var(--text-xs); line-height: 1.7;
    color: var(--text-secondary); white-space: pre; overflow-x: auto;
  }
  .copy {
    flex: none; cursor: pointer;
    padding: var(--space-2) var(--space-3);
    background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius);
    font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary);
    transition: border-color 0.2s ease, color 0.2s ease;
  }
  .copy:hover { color: var(--accent-pk); border-color: var(--accent-pk); }
  @media (max-width: 620px) {
    .row { flex-direction: column; }
    .copy { align-self: flex-start; }
  }
</style>

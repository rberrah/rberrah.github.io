<script>
  // @ts-nocheck
  // Pied de chapitre : sources vérifiables (pool fermé de references.js), date de
  // dernière révision, statut de relecture, signalement d'erreur pré-rempli.
  // Bilingue (FR/EN) via le store de langue.
  import { resolveSources } from '$lib/content/references';
  import { language } from '$lib/stores/language';

  /** @type {any} */
  export let chapter = null;

  const T = {
    fr: { sources: 'Sources', reviewed: 'Dernière révision', report: 'Signaler une erreur',
          brouillon: 'Brouillon', relu: 'Relu', valide: 'Validé',
          body: (t, s) => `Chapitre : ${t} (\`${s}\`)\n\nDécrivez l'erreur ou l'imprécision :\n\n` },
    en: { sources: 'Sources', reviewed: 'Last reviewed', report: 'Report an error',
          brouillon: 'Draft', relu: 'Reviewed', valide: 'Validated',
          body: (t, s) => `Chapter: ${t} (\`${s}\`)\n\nDescribe the error or inaccuracy:\n\n` }
  };
  $: t = T[$language] ?? T.fr;

  $: sources = resolveSources(chapter?.sources);
  $: issueUrl =
    'https://github.com/rberrah/rberrah.github.io/issues/new?title=' +
    encodeURIComponent(`[${chapter?.slug ?? ''}] erreur / error`) +
    '&body=' + encodeURIComponent(t.body(chapter?.title ?? '', chapter?.slug ?? ''));

  $: st = chapter?.status && t[chapter.status]
    ? { label: t[chapter.status], cls: chapter.status === 'valide' ? 'ok' : chapter.status === 'relu' ? 'read' : 'draft' }
    : null;
</script>

<footer class="chfoot">
  {#if sources.length}
    <section class="sources">
      <h3>{t.sources}</h3>
      <ul>
        {#each sources as s}
          <li>
            <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
            {#if s.authors}<span class="au">— {s.authors}</span>{/if}
            {#if s.where}<span class="wh">, {s.where}</span>{/if}
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <div class="meta">
    {#if st}<span class="badge {st.cls}">{st.label}</span>{/if}
    {#if chapter?.reviewed_on}<span class="rev">{t.reviewed} : {chapter.reviewed_on}</span>{/if}
    <a class="report" href={issueUrl} target="_blank" rel="noopener noreferrer">{t.report}</a>
  </div>
</footer>

<style>
  .chfoot { margin-top: var(--space-12); padding-top: var(--space-6); border-top: 1px solid var(--border-subtle); max-width: 760px; }
  .sources h3 { font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin: 0 0 var(--space-3); }
  .sources ul { list-style: none; margin: 0 0 var(--space-4); padding: 0; display: grid; gap: var(--space-2); }
  .sources li { font-size: var(--text-sm); line-height: 1.5; color: var(--text-secondary); padding-left: 1em; position: relative; }
  .sources li::before { content: '▸'; position: absolute; left: 0; color: var(--accent-pk); }
  .sources a { color: var(--text-primary); font-weight: 600; text-decoration: none; border-bottom: 1px solid var(--border-strong); }
  .sources a:hover { color: var(--accent-pk); border-color: var(--accent-pk); }
  .au, .wh { color: var(--text-muted); font-size: var(--text-xs); }
  .meta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); font-family: var(--font-mono); font-size: var(--text-xs); }
  .badge { padding: 2px 8px; border-radius: 999px; font-weight: 700; }
  .badge.ok { background: color-mix(in srgb, var(--accent-pk) 16%, var(--bg-primary)); color: var(--accent-pk); }
  .badge.read { background: var(--bg-secondary); color: var(--text-secondary); }
  .badge.draft { background: color-mix(in srgb, #c0392b 12%, var(--bg-primary)); color: #c0392b; }
  .rev { color: var(--text-muted); }
  .report { margin-left: auto; color: var(--accent-pk); text-decoration: none; }
  .report:hover { text-decoration: underline; }
</style>

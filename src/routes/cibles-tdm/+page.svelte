<script>
  import { resolve } from '$app/paths';
  import { Search, ExternalLink, ArrowRight, X } from '@lucide/svelte';
  import { language } from '#lib/stores/language.js';
  import { tdmDrugs, tdmTargetSources, tdmInstitutionalResources, formatTdmTarget, TDM_REFERENCE_REVIEW_DATE } from '#lib/content/tdmTargets.js';
  import { tdmManualCatalog } from '#lib/content/tdmManualCatalog.js';
  import { searchTdmMolecules } from '#lib/content/tdmSearchView.js';

  const base = resolve('/').replace(/\/$/, '');
  const suggestions = [...new Set([
    ...tdmDrugs.map((drug) => drug.fr),
    ...tdmManualCatalog.map((entry) => entry.name)
  ])].sort((a, b) => a.localeCompare(b, 'fr'));

  let query = $state('');
  let en = $derived($language === 'en');
  let results = $derived(searchTdmMolecules(query));
  let hasQuery = $derived(Boolean(query.trim()));
</script>

<svelte:head>
  <title>{en ? 'TDM targets by drug' : 'Cibles thérapeutiques par molécule'} · PMx Explain</title>
  <meta name="description" content={en
    ? 'Search a medication to find its published TDM exposure targets by indication, with direct source links and expandable evidence details.'
    : 'Recherchez une molécule pour retrouver ses cibles thérapeutiques par indication et leurs sources, avec détails bibliographiques à la demande.'} />
</svelte:head>

<div class="tdm-page" data-testid="tdm-targets-guide">
  <header class="page-header">
    <p class="eyebrow">{en ? 'ANALYZE · TDM REFERENCE' : 'ANALYSER · RÉFÉRENTIEL STP'}</p>
    <h1>{en ? 'Therapeutic drug monitoring targets' : 'Cibles thérapeutiques'}</h1>
    <p>{en ? 'One drug, its indications, its published targets.' : 'Une molécule, ses indications et ses cibles publiées.'}</p>
  </header>

  <section class="search-section" aria-label={en ? 'Search by molecule' : 'Recherche par molécule'}>
    <label for="tdm-query">{en ? 'Medication name' : 'Nom de la molécule'}</label>
    <div class="search-field">
      <Search size={21} aria-hidden="true" />
      <input id="tdm-query" data-testid="tdm-target-search" type="search" bind:value={query}
        list="tdm-drug-options" autocomplete="off" spellcheck="false"
        placeholder={en ? 'e.g. tacrolimus, MMF, lithium…' : 'Ex. tacrolimus, MMF, lithium…'} />
      {#if hasQuery}
        <button class="clear-button" type="button" aria-label={en ? 'Clear search' : 'Effacer la recherche'}
          onclick={() => { query = ''; }}><X size={18} aria-hidden="true" /></button>
      {/if}
    </div>
    <datalist id="tdm-drug-options">
      {#each suggestions as name (name)}
        <option value={name}></option>
      {/each}
    </datalist>
  </section>

  {#if hasQuery}
    {#if results.groups.length}
      <div class="drug-results" data-testid="tdm-drug-results" aria-live="polite">
        {#each results.groups as group (group.drug.id)}
          <section class="drug-section" data-testid="tdm-drug-group">
            <div class="drug-heading">
              <h2>{en ? group.drug.en : group.drug.fr}</h2>
              <span>{group.indications.length} {en ? 'indication(s) / context(s)' : 'indication(s) / contexte(s)'}</span>
            </div>
            <div class="indication-list">
              {#each group.indications as item (item.id)}
                {@const primary = item.primary}
                {@const source = tdmTargetSources[primary.source]}
                <article class="indication-card" data-testid="tdm-target-card">
                  <div class="target-overview">
                    <div class="indication-label">
                      <h3>{en ? item.indicationEn : item.indicationFr}</h3>
                      <span>{item.metric}</span>
                    </div>
                    <p class="target-number"><strong>{formatTdmTarget(primary, en ? 'en' : 'fr')}</strong> <span>{item.unit}</span></p>
                    <div class="source-actions">
                      <a class="main-source" href={source.url} target="_blank" rel="noopener noreferrer"
                        aria-label={(en ? 'Original source: ' : 'Source originale : ') + source.citation}>
                        {source.citation} <ExternalLink size={14} aria-hidden="true" />
                      </a>
                      {#if primary.status === 'study'}
                        <span class="study-note">{en ? 'Local protocol / study' : 'Étude / protocole local'}</span>
                      {/if}
                    </div>
                  </div>

                  <details class="detail-panel" data-testid="tdm-target-details">
                    <summary>{en ? 'Details' : 'Détails'}{#if item.alternatives.length} <span>· {item.alternatives.length} {en ? 'other source(s)' : 'autre(s) source(s)'}</span>{/if}</summary>
                    <div class="detail-content">
                      <dl>
                        <div><dt>{en ? 'Clinical context and limitations' : 'Contexte et limites'}</dt><dd>{en ? primary.contextEn : primary.contextFr}</dd></div>
                        <div><dt>{en ? 'Sample / analyte' : 'Prélèvement / analyte'}</dt><dd>{en ? primary.matrixEn : primary.matrixFr}</dd></div>
                        <div><dt>{en ? 'Evidence' : 'Niveau de preuve'}</dt><dd>{en ? primary.evidenceEn : primary.evidenceFr}</dd></div>
                        <div><dt>{en ? 'Primary publication' : 'Publication principale'}</dt><dd>{source.title}<span class="reference-location">{source.evidenceSection}</span></dd></div>
                        <div><dt>{en ? 'Access' : 'Accès'}</dt><dd>{source.access === 'open_full_text'
                          ? (en ? 'Open full text' : 'Texte intégral accessible')
                          : (en ? 'Public abstract (full text may be restricted)' : 'Résumé public (texte intégral parfois réservé)')}</dd></div>
                      </dl>
                      {#if source.doi}
                        <a class="doi-link" href={'https://doi.org/' + source.doi} target="_blank" rel="noopener noreferrer">DOI : {source.doi} <ExternalLink size={13} aria-hidden="true" /></a>
                      {/if}
                      {#if source.newerConsensusUrl}
                        <p class="updated-guideline">
                          {en ? 'More recent consensus: recheck this numerical range before clinical use.' : 'Consensus plus récent : vérifier cette valeur avant toute utilisation clinique.'}
                          <a href={source.newerConsensusUrl} target="_blank" rel="noopener noreferrer">
                            {source.newerConsensusTitle} <ExternalLink size={13} aria-hidden="true" />
                          </a>
                        </p>
                      {/if}

                      {#if item.alternatives.length}
                        <div class="other-sources" data-testid="tdm-other-sources">
                          <h4>{en ? 'Other published sources' : 'Autres sources publiées'}</h4>
                          {#each item.alternatives as alternative (alternative.id)}
                            {@const altSource = tdmTargetSources[alternative.source]}
                            <div class="alternative">
                              <div class="alternative-head">
                                <strong>{formatTdmTarget(alternative, en ? 'en' : 'fr')} {alternative.unit}</strong>
                                <a href={altSource.url} target="_blank" rel="noopener noreferrer">
                                  {altSource.citation} <ExternalLink size={13} aria-hidden="true" />
                                </a>
                              </div>
                              <p>{en ? alternative.contextEn : alternative.contextFr}</p>
                              <p class="alternative-evidence">{en ? alternative.evidenceEn : alternative.evidenceFr} · {altSource.evidenceSection}</p>
                              {#if alternative.matrixFr !== primary.matrixFr}
                                <p class="matrix-warning">{en ? 'Different sample matrix: ' : 'Matrice de prélèvement différente : '}{en ? alternative.matrixEn : alternative.matrixFr}</p>
                              {/if}
                              {#if altSource.doi}
                                <a class="doi-link" href={'https://doi.org/' + altSource.doi} target="_blank" rel="noopener noreferrer">DOI : {altSource.doi}</a>
                              {/if}
                            </div>
                          {/each}
                        </div>
                      {/if}
                    </div>
                  </details>
                </article>
              {/each}
            </div>
          </section>
        {/each}
      </div>
    {:else if results.withoutTargets.length}
      <section class="missing-targets" data-testid="tdm-no-target-results">
        <h2>{en ? 'No referenced therapeutic target yet' : 'Aucune cible thérapeutique référencée pour le moment'}</h2>
        <p>{en ? 'These medications appear in the reviewed CHU Limoges documents, but no validated numeric target has been added.' : 'Ces molécules figurent dans les documents consultés du CHU de Limoges, mais aucune cible numérique qualifiée n’a encore été ajoutée.'}</p>
        <ul>
          {#each results.withoutTargets.slice(0, 8) as entry (entry.id)}
            <li data-testid="tdm-manual-entry"><strong>{entry.name}</strong>
              <a href={entry.originalUrl} target="_blank" rel="noopener noreferrer">{en ? 'CHU document' : 'Document CHU'} <ExternalLink size={13} aria-hidden="true" /></a>
            </li>
          {/each}
        </ul>
        {#if results.withoutTargets.length > 8}<p>{en ? 'Refine the medication name to narrow the list.' : 'Précisez le nom de la molécule pour affiner la liste.'}</p>{/if}
      </section>
    {:else}
      <div class="no-results" role="status">
        {en ? 'No medication found. Try another name or synonym.' : 'Aucune molécule trouvée. Essayez un autre nom ou synonyme.'}
      </div>
    {/if}
  {/if}

  <footer class="page-footer">
    <p>{en
      ? 'Bibliographic targets, not a dosing protocol. Verify indication, matrix and sampling schedule before interpretation.'
      : 'Cibles bibliographiques, non protocole posologique. Vérifier indication, matrice et horaire de prélèvement avant toute interprétation.'}</p>
    <details class="institutional-details">
      <summary>{en ? 'Reference policy and scientific societies' : 'Référentiels et sociétés savantes'}</summary>
      <p>{en ? 'SFT and SFPT references are prioritized when they provide numerical targets. Otherwise, source-linked recommendations and studies are used. The CHU Limoges manual indexes assays, not therapeutic targets.' : 'La SFT et la SFPT sont privilégiées lorsqu’elles publient des valeurs chiffrées. Sinon, les cibles proviennent des recommandations et études explicitement citées. Le manuel du CHU de Limoges recense des examens, pas des cibles thérapeutiques.'}</p>
      <ul>
        {#each tdmInstitutionalResources as item (item.id)}
          <li><a href={item.url} target="_blank" rel="noopener noreferrer">{item.organization} · {en ? item.titleEn : item.titleFr}</a></li>
        {/each}
      </ul>
      <p>{en ? 'Last source review:' : 'Dernière revue des sources :'} {TDM_REFERENCE_REVIEW_DATE}.</p>
    </details>
    <a class="mipd-link" href={base + '/tdm/'}>{en ? 'MIPD model library' : 'Bibliothèque de modèles MIPD'} <ArrowRight size={14} aria-hidden="true" /></a>
  </footer>
</div>

<style>
  .tdm-page { max-width: 1040px; margin: 0 auto; padding: 1.5rem 0 3rem; }
  .page-header { margin: 0 0 1.6rem; }
  .page-header h1 { font: 700 clamp(2rem, 4vw, 2.85rem)/1.16 var(--font-heading); margin: .45rem 0 .5rem; }
  .page-header > p:last-child { color: var(--text-secondary); margin: 0; font-size: .98rem; }
  .search-section { max-width: 720px; margin-bottom: 1.7rem; }
  .search-section > label { display: block; font-weight: 600; margin-bottom: .5rem; }
  .search-field { display: flex; gap: .7rem; align-items: center; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 11px; padding: .2rem .8rem; }
  .search-field:focus-within { outline: 2px solid var(--accent-pk); outline-offset: 2px; }
  .search-field > svg { color: var(--text-secondary); flex: 0 0 auto; }
  .search-field input { width: 100%; min-width: 0; border: 0; background: transparent; color: var(--text-primary); padding: .85rem 0; font: inherit; font-size: 1rem; outline: 0; }
  .clear-button { border: 0; background: transparent; color: var(--text-secondary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; flex: 0 0 auto; }
  .clear-button:focus-visible, .detail-panel summary:focus-visible, .institutional-details summary:focus-visible { outline: 2px solid var(--accent-pk); outline-offset: 3px; }
  .drug-section { margin: 0 0 1.7rem; }
  .drug-heading { display: flex; justify-content: space-between; align-items: baseline; gap: .75rem; flex-wrap: wrap; margin-bottom: .75rem; }
  .drug-heading h2 { font: 700 1.5rem var(--font-heading); margin: 0; }
  .drug-heading span { font-size: .8rem; color: var(--text-secondary); }
  .indication-list { display: flex; flex-direction: column; gap: .65rem; }
  .indication-card { border: 1px solid var(--border-subtle); border-radius: 10px; background: var(--bg-tertiary); overflow: hidden; }
  .target-overview { padding: 1rem 1.2rem; display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(175px, .85fr) minmax(190px, 1fr); align-items: center; gap: .75rem 1rem; }
  .indication-label h3 { font: 600 1rem/1.4 var(--font-body); margin: 0 0 .25rem; }
  .indication-label span { color: var(--text-secondary); font-size: .86rem; }
  .target-number { margin: 0; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .target-number strong { font: 700 1.45rem var(--font-heading); }
  .target-number span { font-size: .83rem; color: var(--text-secondary); }
  .source-actions { display: flex; flex-direction: column; gap: .2rem; align-items: flex-start; }
  .main-source { display: inline-flex; gap: .3rem; align-items: center; font-size: .84rem; line-height: 1.5; overflow-wrap: anywhere; }
  .study-note { font-size: .72rem; color: var(--text-secondary); }
  .detail-panel { border-top: 1px solid var(--border-subtle); }
  .detail-panel summary { cursor: pointer; padding: .65rem 1.2rem; font-size: .85rem; font-weight: 600; color: var(--text-secondary); }
  .detail-panel summary span { font-weight: 400; }
  .detail-panel[open] summary { color: var(--text-primary); }
  .detail-content { padding: .2rem 1.2rem 1.1rem; background: var(--bg-secondary); }
  .detail-content dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem 1.4rem; margin: .8rem 0; }
  .detail-content dt { font-weight: 650; font-size: .78rem; margin-bottom: .25rem; }
  .detail-content dd { margin: 0; color: var(--text-secondary); font-size: .85rem; line-height: 1.55; overflow-wrap: anywhere; }
  .reference-location { display: block; margin-top: .35rem; }
  .updated-guideline { color: var(--text-secondary); font-size: .82rem; line-height: 1.5; padding: .65rem .8rem; border-left: 2px solid var(--border-subtle); margin: .75rem 0; }
  .updated-guideline a { display: inline-flex; gap: .3rem; align-items: center; margin-left: .35rem; }
  .doi-link { display: inline-flex; align-items: center; gap: .25rem; font-size: .78rem; overflow-wrap: anywhere; }
  .other-sources { margin-top: 1.15rem; padding-top: .8rem; border-top: 1px solid var(--border-subtle); }
  .other-sources h4 { margin: .15rem 0 .8rem; font: 650 1rem var(--font-body); }
  .alternative { padding: .75rem 0; border-top: 1px solid var(--border-subtle); }
  .alternative-head { display: flex; align-items: baseline; justify-content: space-between; gap: .5rem; flex-wrap: wrap; }
  .alternative-head strong { font-variant-numeric: tabular-nums; }
  .alternative-head a { display: inline-flex; gap: .3rem; align-items: center; }
  .alternative p { font-size: .83rem; line-height: 1.5; color: var(--text-secondary); margin: .45rem 0; }
  .alternative .matrix-warning { font-weight: 600; }
  .missing-targets, .no-results { border: 1px solid var(--border-subtle); border-radius: 10px; padding: 1rem 1.2rem; }
  .missing-targets h2 { font-size: 1.15rem; margin: .15rem 0 .45rem; }
  .missing-targets p, .no-results { color: var(--text-secondary); font-size: .9rem; }
  .missing-targets ul { list-style: none; padding: 0; margin: .7rem 0 0; }
  .missing-targets li { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .5rem; padding: .6rem 0; border-top: 1px solid var(--border-subtle); }
  .missing-targets li a { display: inline-flex; gap: .3rem; align-items: center; }
  .page-footer { margin-top: 2.1rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); color: var(--text-secondary); font-size: .81rem; }
  .page-footer > p { max-width: 760px; margin: 0 0 .65rem; }
  .institutional-details { margin: .4rem 0 .85rem; }
  .institutional-details summary { cursor: pointer; width: fit-content; }
  .institutional-details p, .institutional-details ul { max-width: 820px; line-height: 1.55; }
  .institutional-details ul { padding-left: 1.2rem; }
  .institutional-details li { margin-bottom: .45rem; }
  .mipd-link { display: inline-flex; align-items: center; gap: .3rem; }
  @media (max-width: 760px) {
    .tdm-page { padding-top: .5rem; }
    .target-overview { grid-template-columns: minmax(0, 1fr) auto; padding: .85rem 1rem; }
    .indication-label { grid-column: 1 / -1; }
    .source-actions { grid-column: 1 / -1; }
    .detail-content dl { grid-template-columns: 1fr; }
    .detail-panel summary { padding: .65rem 1rem; }
    .detail-content { padding: .25rem 1rem 1rem; }
  }
  @media (max-width: 430px) {
    .target-overview { grid-template-columns: 1fr; }
    .indication-label, .source-actions { grid-column: auto; }
    .target-number { white-space: normal; }
  }
</style>

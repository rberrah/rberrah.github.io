<script>
  import { resolve } from '$app/paths';
  import { Search, BookOpen, ArrowRight, ExternalLink } from '@lucide/svelte';
  import { language } from '#lib/stores/language.js';
  import { tdmDrugs, tdmTargets, tdmTargetSources, tdmInstitutionalResources, TDM_REFERENCE_REVIEW_DATE, searchTdmTargets, formatTdmTarget } from '#lib/content/tdmTargets.js';
  import { collectTdmComparisons } from '#lib/content/tdmComparisons.js';
  import { tdmManualCatalog, manualCatalogSources, searchManualCatalog } from '#lib/content/tdmManualCatalog.js';

  const base = resolve('/').replace(/\/$/, '');
  let query = $state('');
  let selectedDrug = $state('all');
  let selectedIndication = $state('all');
  let en = $derived($language === 'en');
  let results = $derived(searchTdmTargets({ query, drug: selectedDrug, indication: selectedIndication }));
  let comparisons = $derived(collectTdmComparisons(results));
  let manualHits = $derived(searchManualCatalog({ query }).filter((entry) =>
    selectedDrug === 'all' || entry.drugKey === selectedDrug
  ));
  let expandedManual = $state(false);
  let visibleManual = $derived(query.trim() || expandedManual ? manualHits : manualHits.slice(0, 12));
  const indicationOptions = Array.from(new Map(tdmTargets.map((row) => [row.indication, {
    key: row.indication,
    fr: row.indicationFr.split(' ·')[0],
    en: row.indicationEn.split(' ·')[0]
  }])).values());
  const drugById = new Map(tdmDrugs.map((item) => [item.id, item]));
</script>

<svelte:head>
  <meta name="description" content={en
    ? 'Source-attributed therapeutic drug monitoring targets by drug, indication and exposure metric. Educational reference, not a dosing protocol.'
    : 'Référentiel bibliographique de cibles de suivi thérapeutique par médicament, indication et métrique PK. À visée pédagogique uniquement.'} />
</svelte:head>

<section class="reference-hero" data-testid="tdm-targets-guide">
  <p class="eyebrow">{en ? 'ANALYZE · SCIENTIFIC REFERENCE' : 'ANALYSER · RÉFÉRENTIEL SCIENTIFIQUE'}</p>
  <h1>{en ? 'Therapeutic drug monitoring targets' : 'Cibles thérapeutiques du suivi pharmacologique'}</h1>
  <p class="lede">{en
    ? 'Search for a medication, then compare published exposure targets across indications, regimens, sampling metrics and sources.'
    : 'Recherchez une molécule, puis comparez les cibles d’exposition publiées selon la greffe, l’indication, le traitement associé et le type de mesure.'}</p>
  <p class="notice"><strong>{en ? 'Curated pilot catalogue — not exhaustive.' : 'Catalogue pilote documenté — non exhaustif.'}</strong>
    {en
      ? ' Scientific author review is pending. This reference is intended for education and literature orientation, not clinical decisions, patient-specific dosing or automated interpretation.'
      : ' Validation scientifique par l’auteur en attente. Ce guide sert à l’enseignement et au repérage bibliographique, pas à l’interprétation clinique individuelle ni à la décision posologique.'}</p>
</section>

<section class="search-panel" aria-labelledby="target-search-title">
  <h2 id="target-search-title"><Search size={21} aria-hidden="true" /> {en ? 'Find an exposure target' : 'Rechercher une cible d’exposition'}</h2>
  <div class="filters">
    <label class="search-field">
      <span>{en ? 'Medication, synonym or indication' : 'Médicament, synonyme ou indication'}</span>
      <input data-testid="tdm-target-search" type="search" bind:value={query} autocomplete="off"
        placeholder={en ? 'e.g. mycophenolate, MMF, heart…' : 'Ex. mycophenolate, MMF, cardiaque…'} />
    </label>
    <label>
      <span>{en ? 'Medication' : 'Médicament'}</span>
      <select data-testid="tdm-target-drug" bind:value={selectedDrug}>
        <option value="all">{en ? 'All medications' : 'Tous les médicaments'}</option>
        {#each tdmDrugs as molecule (molecule.id)}
          <option value={molecule.id}>{en ? molecule.en : molecule.fr}</option>
        {/each}
      </select>
    </label>
    <label>
      <span>{en ? 'Indication' : 'Indication'}</span>
      <select data-testid="tdm-target-indication" bind:value={selectedIndication}>
        <option value="all">{en ? 'All indications' : 'Toutes les indications'}</option>
        {#each indicationOptions as item (item.key)}
          <option value={item.key}>{en ? item.en : item.fr}</option>
        {/each}
      </select>
    </label>
  </div>
  <p class="result-count" role="status">{results.length} {en ? 'scientifically referenced target(s)' : 'cible(s) scientifiquement documentée(s)'} · {tdmDrugs.length} {en ? 'medications with targets' : 'médicaments disposant de cibles documentées'}</p>
</section>

<section class="manual-catalogue" data-testid="tdm-manual-catalogue" aria-labelledby="manual-catalogue-title">
  <h2 id="manual-catalogue-title">{en ? 'CHU Limoges · sampling and assay catalogue' : 'CHU de Limoges · catalogue des dosages et prélèvements'}</h2>
  <p>{en
    ? 'Indexed from individually accessible examination records and two official pharmacology documents. The full laboratory manual cannot be certified as exhaustively indexed; its thousands of non-drug tests are outside this TDM guide.'
    : 'Inventaire établi à partir de fiches d’examens accessibles et de deux documents officiels de pharmacologie. Le manuel complet n’a pas pu être indexé exhaustivement : les analyses non médicamenteuses ne sont pas des cibles de STP.'}</p>
  <p class="manual-count">{tdmManualCatalog.length} {en ? 'named medicines in the verified document subset' : 'molécules nommées dans ce sous-ensemble de documents vérifiés'} · {manualHits.length} {en ? 'matching the search' : 'correspondant à la recherche'}</p>
  <div class="manual-grid">
    {#each visibleManual as item (item.id)}
      {@const manualSource = manualCatalogSources[item.sourceId]}
      {@const withTargets = tdmTargets.some((entry) => entry.drug === item.drugKey)}
      <article class="manual-card" data-testid="tdm-manual-entry">
        <h3>{item.name}</h3>
        <p>{withTargets
          ? (en ? 'Target evidence available above' : 'Cibles scientifiques disponibles ci-dessus')
          : (en ? 'No reviewed numeric target in this guide' : 'Aucune cible numérique qualifiée dans ce guide')}</p>
        <p class="manual-type">{item.status === 'request_form_only'
          ? (en ? 'Request form (assay confirmation needed)' : 'Formulaire de demande (dosage à confirmer)')
          : item.status === 'outsourced_exam'
            ? (en ? 'Outsourced laboratory examination' : 'Examen sous-traité')
            : (en ? 'Documented assay / laboratory sampling' : 'Dosage / prélèvement documenté')}</p>
        <a href={manualSource.url} target="_blank" rel="noopener noreferrer">{en ? 'Original CHU document' : 'Document officiel du CHU'} <ExternalLink size={13} aria-hidden="true"/></a>
      </article>
    {/each}
  </div>
  {#if !query.trim() && manualHits.length > visibleManual.length}
    <button class="btn btn-outline manual-more" data-testid="tdm-manual-show-all" onclick={() => expandedManual = true}>
      {en ? 'Show all documented medicines' : 'Afficher toutes les molécules documentées'} ({manualHits.length})
    </button>
  {/if}
  {#if query.trim() && !manualHits.length}
    <p>{en ? 'No drug identified in this audited CHU subset. The source catalogue may contain additional exams.' : 'Aucune molécule trouvée dans ce sous-ensemble audité du CHU. Le catalogue officiel peut contenir d’autres examens.'}</p>
  {/if}
  <p class="manual-notice">{en
    ? 'The CHU sources confirm analytical availability or request procedures, not therapeutic targets. They may evolve: always check the live examination record. No batch copy of the protected manual is embedded.'
    : 'Les documents du CHU attestent de dosages ou de formulaires, pas des cibles thérapeutiques. Les fiches sont susceptibles de changer : vérifier l’original en ligne. Aucune copie intégrale du manuel protégé n’est intégrée.'}</p>
</section>

{#if comparisons.length}
  <section class="comparison-section" data-testid="tdm-comparisons" aria-labelledby="comparison-title">
    <h2 id="comparison-title">{en ? 'Compare published targets' : 'Comparer les cibles selon les sources'}</h2>
    <p>{en
      ? 'Same medication, indication, exposure metric and unit. Differences in study design, treatment regimen, timing or serum/plasma matrix still matter: equal numbers do not establish clinical equivalence.'
      : 'Même molécule, indication, métrique d’exposition et unité. Les différences de schéma, de méthode, de temporalité ou de matrice sérum/plasma restent déterminantes : des chiffres identiques n’impliquent pas une équivalence clinique.'}</p>
    {#each comparisons as comparison (comparison.id)}
      <article class="comparison-block">
        <div class="comparison-heading">
          <h3>{en ? comparison.drugEn : comparison.drugFr} · {en ? comparison.indicationEn : comparison.indicationFr}</h3>
          <p>{comparison.metric} · {comparison.unit} · {comparison.entries.length} {en ? 'sources' : 'sources'}</p>
        </div>
        <p class="compare-status">{comparison.distinctNumericValues
          ? (en ? 'Different published figures — interpret their contexts' : 'Valeurs publiées différentes — comparer les contextes')
          : (en ? 'Same published figures, check assumptions' : 'Valeurs publiées identiques, vérifier les conditions')}
          {comparison.matrixDifference
            ? (en ? ' · Caution: serum/plasma matrix differs' : ' · Attention : matrice sérum/plasma différente')
            : ''}</p>
        <div class="comparison-table-wrap">
          <table class="comparison-table">
            <thead><tr>
              <th>{en ? 'Source' : 'Source'}</th>
              <th>{en ? 'Reported target' : 'Cible rapportée'}</th>
              <th>{en ? 'Applicability' : 'Conditions d’application'}</th>
            </tr></thead>
            <tbody>
              {#each comparison.entries as entry (entry.id)}
                <tr>
                  <td><a href={entry.source.url} target="_blank" rel="noopener noreferrer">{entry.source.organization} · {entry.source.year}</a><div class="comparison-kind">{entry.status === 'study' ? (en ? 'Study' : 'Étude') : entry.status === 'review' ? (en ? 'Literature review' : 'Revue scientifique') : entry.status === 'regulatory' ? (en ? 'Product label' : 'RCP officiel') : (en ? 'Guideline / consensus' : 'Recommandation / consensus')}</div></td>
                  <td class="comparison-value">{en ? entry.valueEn : entry.valueFr} <small>{comparison.unit}</small></td>
                  <td>{en ? entry.contextEn : entry.contextFr}<div class="comparison-kind">{en ? entry.matrixEn : entry.matrixFr}</div></td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </article>
    {/each}
  </section>
{/if}

<section class="results" aria-label={en ? 'Documented targets' : 'Cibles documentées'}>
  {#if !results.length}
    <div class="empty">
      <h2>{en ? 'No reference found' : 'Aucune référence trouvée'}</h2>
      <p>{en
        ? 'This does not mean the drug has no target. Try a synonym, reset the filters or consult a specialist reference.'
        : 'Cela ne signifie pas que le médicament n’a pas de cible. Essayez un synonyme, modifiez les filtres ou consultez une source spécialisée.'}</p>
      <button class="btn btn-outline" onclick={() => { query = ''; selectedDrug = 'all'; selectedIndication = 'all'; }}>
        {en ? 'Reset filters' : 'Réinitialiser les filtres'}
      </button>
    </div>
  {:else}
    <div class="target-list">
      {#each results as item (item.id)}
        {@const molecule = drugById.get(item.drug)}
        {@const source = tdmTargetSources[item.source]}
        <article class="target-card" data-testid="tdm-target-card">
          <div class="card-heading">
            <div>
              <p class="drug-name">{en ? molecule?.en : molecule?.fr}</p>
              <h2>{en ? item.indicationEn : item.indicationFr}</h2>
            </div>
            <span class="source-type">{item.status === 'study'
              ? (en ? 'Study / local protocol' : 'Étude / protocole')
              : item.status === 'review'
                ? (en ? 'Literature review' : 'Revue scientifique')
                : item.status === 'regulatory'
                  ? (en ? 'Official product label' : 'RCP officiel')
                  : (en ? 'Guideline / consensus' : 'Recommandation / consensus')}</span>
          </div>
          <div class="value-line">
            <div class="value"><strong>{formatTdmTarget(item, en ? 'en' : 'fr')}</strong><span>{item.unit}</span></div>
            <div class="metric"><span>{en ? 'Exposure metric' : 'Mesure de l’exposition'}</span><strong>{item.metric}</strong></div>
          </div>
          <dl>
            <div><dt>{en ? 'Analyte / sample' : 'Analyte / prélèvement'}</dt><dd>{en ? item.matrixEn : item.matrixFr}</dd></div>
            <div><dt>{en ? 'Context / limitations' : 'Contexte / limites'}</dt><dd>{en ? item.contextEn : item.contextFr}</dd></div>
            <div><dt>{en ? 'Level of evidence' : 'Niveau de preuve'}</dt><dd>{en ? item.evidenceEn : item.evidenceFr}</dd></div>
          </dl>
          <div class="provenance" data-testid="tdm-target-provenance">
            <p><strong>{en ? 'Exact numeric source' : 'Source exacte de la valeur'} :</strong> {source.organization} · {source.year}</p>
            <p><strong>{en ? 'Where to find the number' : 'Où trouver la valeur'} :</strong> {source.evidenceSection}</p>
            <p><strong>{en ? 'Access' : 'Accessibilité'} :</strong> {source.access === 'open_full_text'
              ? (en ? 'Open full text' : 'Texte intégral en accès libre')
              : (en ? 'Open abstract (full article may require subscription)' : 'Résumé accessible (article intégral éventuellement payant)')}</p>
          </div>
          <a class="reference" href={source.url} target="_blank" rel="noopener noreferrer">
            <BookOpen size={16} aria-hidden="true" /> {source.title} <ExternalLink size={14} aria-hidden="true" />
          </a>
          {#if source.doi}
            <p class="doi-reference"><a href={`https://doi.org/${source.doi}`} target="_blank" rel="noopener noreferrer">DOI : {source.doi}</a></p>
          {/if}
          {#if source.newerConsensusUrl}
            <p class="followup-reference">{en ? 'Updated consensus also available' : 'Consensus plus récent à consulter'} :
              <a href={source.newerConsensusUrl} target="_blank" rel="noopener noreferrer">{source.newerConsensusTitle}</a>
            </p>
          {/if}
        </article>
      {/each}
    </div>
  {/if}
</section>

<section class="societies" aria-labelledby="society-references-title">
  <h2 id="society-references-title">{en ? 'Priority French scientific societies' : 'Sociétés savantes françaises prioritaires'}</h2>
  <p>{en
    ? 'SFT and SFPT references are checked first. Institutional resources below explain the context of TDM. They do not necessarily publish a numerical target; each numeric card above cites the publication that explicitly supports its value.'
    : 'La SFT et la SFPT sont vérifiées en premier. Les documents institutionnels ci-dessous expliquent le contexte du STP, mais ne donnent pas nécessairement de cible numérique : chaque fiche chiffrée ci-dessus cite la publication apportant directement la valeur.'}</p>
  <div class="society-grid">
    {#each tdmInstitutionalResources as society (society.id)}
      <article class="society-card">
        <p class="society-org">{society.organization}</p>
        <h3><a href={society.url} target="_blank" rel="noopener noreferrer">{en ? society.titleEn : society.titleFr} <ExternalLink size={13} aria-hidden="true"/></a></h3>
        <p>{en ? society.scopeEn : society.scopeFr}</p>
      </article>
    {/each}
  </div>
  <p class="review-date">{en ? 'Last bibliographic link and claim review' : 'Dernière vérification des sources et des valeurs'} : {TDM_REFERENCE_REVIEW_DATE} · {en ? 'Scientific author approval pending.' : 'Approbation scientifique par l’auteur en attente.'}</p>
</section>

<section class="method-note">
  <h2>{en ? 'How to read this reference' : 'Comment interpréter ce référentiel ?'}</h2>
  <p>{en
    ? 'An AUC is an exposure over a defined time interval; a trough (C₀) is a concentration at a specific time. They are not interchangeable. The matrix (serum, plasma or whole blood), formulation, sampling timing, concomitant treatments and post-transplant period must match the source before a target can be interpreted.'
    : 'Une AUC est une exposition intégrée sur un intervalle donné ; une résiduelle (C₀) est une concentration à un instant précis. Elles ne sont pas interchangeables. La matrice (sérum, plasma ou sang total), la formulation, le temps de prélèvement, les traitements associés et le délai post-greffe doivent correspondre aux conditions de la source.'}</p>
  <p>{en
    ? 'For mycophenolate, the measured analyte is mycophenolic acid (MPA), not the administered prodrug MMF. The cardiac cut-point near 50 mg·h/L is identified as study-derived, whereas the >36 mg·h/L threshold comes from a practice guideline.'
    : 'Pour le mycophénolate, le dosage porte sur l’acide mycophénolique (MPA), et non sur la prodrogue MMF. Le seuil cardiaque proche de 50 mg·h/L est identifié comme un résultat d’étude, tandis que le seuil >36 mg·h/L provient d’une recommandation.'}</p>
  <a href={`${base}/tdm/`} class="back-link">{en ? 'Explore the separate MIPD model library' : 'Accéder à la bibliothèque de modèles MIPD'} <ArrowRight size={16} aria-hidden="true" /></a>
</section>

<style>
  .manual-catalogue, .comparison-section { padding: 1.5rem 0 2rem; margin: 1rem 0 2rem; border-top: 1px solid var(--border-subtle); }
  .manual-catalogue > h2, .comparison-section > h2 { font-family: var(--font-heading); font-size: 1.65rem; }
  .manual-catalogue > p, .comparison-section > p { color: var(--text-secondary); }
  .manual-count { font-weight: 600; }
  .manual-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px,100%),1fr)); gap: .75rem; }
  .manual-card { border: 1px solid var(--border-subtle); border-radius: 8px; padding: .85rem; min-width: 0; }
  .manual-card h3 { font-family: var(--font-body); font-size: .96rem; margin: 0 0 .5rem; }
  .manual-card p { font-size: .8rem; color: var(--text-secondary); margin: .25rem 0; line-height: 1.5; }
  .manual-card .manual-type { font-style: italic; }
  .manual-card a { display: inline-flex; align-items: center; gap: .35rem; font-size: .8rem; margin-top: .45rem; }
  .manual-more { margin-top: 1rem; }
  .manual-notice { font-size: .82rem; }
  .comparison-block { background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 1rem; margin: 1rem 0; }
  .comparison-heading { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: .5rem; }
  .comparison-heading h3 { font-family: var(--font-heading); font-size: 1.25rem; margin: .1rem 0; }
  .comparison-heading p, .compare-status { font-size: .82rem; color: var(--text-secondary); margin: .35rem 0; }
  .compare-status { font-weight: 600; }
  .comparison-table-wrap { overflow-x: auto; }
  .comparison-table { border-collapse: collapse; width: 100%; min-width: 480px; font-size: .85rem; }
  .comparison-table th { text-align: left; background: var(--bg-secondary); color: var(--text-secondary); padding: .65rem; }
  .comparison-table td { border-top: 1px solid var(--border-subtle); padding: .75rem .65rem; vertical-align: top; }
  .comparison-table th:nth-child(1) { width: 25%; }
  .comparison-table th:nth-child(2) { width: 20%; }
  .comparison-value { font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .comparison-value small, .comparison-kind { font-size: .72rem; font-weight: 400; color: var(--text-secondary); margin-top: .3rem; }
  .reference-hero { max-width: 860px; margin: 0 auto 2rem; }
  .reference-hero h1 { font-family: var(--font-heading); font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1.15; margin: .5rem 0 1rem; }
  .reference-hero .lede { max-width: 780px; }
  .notice { padding: 1rem 1.15rem; border-left: 3px solid var(--accent-pk); background: var(--bg-secondary); border-radius: 0 .45rem .45rem 0; color: var(--text-secondary); font-size: .93rem; }
  .notice strong { color: var(--text-primary); }
  .search-panel { padding: 1.35rem; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; margin-bottom: 2rem; }
  .search-panel h2 { font-family: var(--font-heading); font-size: 1.4rem; display: flex; align-items: center; gap: .6rem; margin: 0 0 1.1rem; }
  .filters { display: grid; grid-template-columns: minmax(220px, 2fr) minmax(160px, 1fr) minmax(160px, 1fr); gap: 1rem; }
  .filters label { display: flex; flex-direction: column; gap: .4rem; min-width: 0; font-size: .88rem; font-weight: 600; }
  .filters input, .filters select { width: 100%; min-width: 0; box-sizing: border-box; padding: .75rem .7rem; font: inherit; color: var(--text-primary); background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 7px; }
  .filters input:focus-visible, .filters select:focus-visible { outline: 3px solid var(--accent-pk); outline-offset: 2px; }
  .result-count { font-size: .86rem; color: var(--text-secondary); margin: 1rem 0 0; }
  .target-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.1rem; }
  .target-card { min-width: 0; padding: 1.35rem; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; }
  .card-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .drug-name { font-size: .8rem; letter-spacing: .02em; color: var(--text-secondary); font-weight: 600; margin: 0 0 .25rem; }
  .card-heading h2 { font-family: var(--font-heading); font-size: 1.35rem; line-height: 1.25; margin: 0; }
  .source-type { border: 1px solid var(--border-subtle); border-radius: 20px; padding: .2rem .55rem; color: var(--text-secondary); font-size: .72rem; }
  .value-line { display: flex; justify-content: space-between; align-items: flex-end; gap: .8rem; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); padding: .8rem 0; margin: 1rem 0; }
  .value { display: flex; flex-direction: column; gap: .1rem; }
  .value strong { font-size: 2.15rem; font-family: var(--font-heading); line-height: 1.2; font-variant-numeric: tabular-nums; }
  .value span, .metric span { color: var(--text-secondary); font-size: .83rem; }
  .metric { display: flex; flex-direction: column; text-align: right; gap: .2rem; white-space: nowrap; }
  .metric strong { font-size: 1.1rem; }
  dl { margin: 0 0 1rem; }
  dl > div { margin-bottom: .75rem; }
  dt { font-weight: 600; font-size: .8rem; margin-bottom: .15rem; }
  dd { margin: 0; font-size: .91rem; line-height: 1.55; color: var(--text-secondary); }
  .provenance { margin: .75rem 0 .9rem; padding: .7rem .8rem; border-left: 2px solid var(--border-subtle); background: var(--bg-secondary); font-size: .8rem; color: var(--text-secondary); line-height: 1.5; }
  .provenance p { margin: .2rem 0; }
  .provenance strong { color: var(--text-primary); }
  .doi-reference { font-size: .79rem; margin: .5rem 0; overflow-wrap: anywhere; }
  .followup-reference { margin: .7rem 0 0; font-size: .8rem; color: var(--text-secondary); }
  .societies { margin: 2.4rem auto 0; padding-top: 1.25rem; border-top: 1px solid var(--border-subtle); }
  .societies h2 { font-family: var(--font-heading); }
  .societies > p { max-width: 900px; color: var(--text-secondary); }
  .society-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem; }
  .society-card { border: 1px solid var(--border-subtle); border-radius: 9px; padding: 1rem; }
  .society-card h3 { font: 600 1rem var(--font-body); line-height: 1.5; margin: .3rem 0; }
  .society-card h3 a { display: inline; }
  .society-org { font-weight: 700; letter-spacing: .06em; font-size: .75rem; margin: 0; }
  .society-card > p:last-child, .review-date { font-size: .85rem; color: var(--text-secondary); }
  .reference { display: inline-flex; align-items: flex-start; gap: .45rem; line-height: 1.45; font-size: .83rem; overflow-wrap: anywhere; }
  .method-note { padding-top: 1.6rem; margin: 2rem auto; max-width: 860px; border-top: 1px solid var(--border-subtle); }
  .method-note h2 { font-family: var(--font-heading); }
  .method-note p { color: var(--text-secondary); }
  .back-link { display: inline-flex; align-items: center; gap: .5rem; margin-top: .7rem; }
  .empty { text-align: center; padding: 2rem; border: 1px solid var(--border-subtle); border-radius: 12px; }
  @media (max-width: 760px) { .filters, .target-list, .society-grid { grid-template-columns: 1fr; } .reference-hero h1 { font-size: 2rem; } .target-card { padding: 1rem; } }
</style>

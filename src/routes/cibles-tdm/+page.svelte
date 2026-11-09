<script>
  import { resolve } from '$app/paths';
  import { Search, BookOpen, ArrowRight, ExternalLink } from '@lucide/svelte';
  import { language } from '#lib/stores/language.js';
  import { tdmDrugs, tdmTargets, tdmTargetSources, searchTdmTargets, formatTdmTarget } from '#lib/content/tdmTargets.js';

  const base = resolve('/').replace(/\/$/, '');
  let query = $state('');
  let selectedDrug = $state('all');
  let selectedIndication = $state('all');
  let en = $derived($language === 'en');
  let results = $derived(searchTdmTargets({ query, drug: selectedDrug, indication: selectedIndication }));
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
  <p class="result-count" role="status">{results.length} {en ? 'referenced target(s)' : 'cible(s) documentée(s)'} · {tdmDrugs.length} {en ? 'medications in this pilot catalogue' : 'médicaments dans ce catalogue pilote'}</p>
</section>

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
          <a class="reference" href={source.url} target="_blank" rel="noopener noreferrer">
            <BookOpen size={16} aria-hidden="true" /> {source.title} <ExternalLink size={14} aria-hidden="true" />
          </a>
        </article>
      {/each}
    </div>
  {/if}
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
  .reference { display: inline-flex; align-items: flex-start; gap: .45rem; line-height: 1.45; font-size: .83rem; overflow-wrap: anywhere; }
  .reference svg { flex-shrink: 0; margin-top: .12rem; }
  .method-note { padding-top: 1.6rem; margin: 2rem auto; max-width: 860px; border-top: 1px solid var(--border-subtle); }
  .method-note h2 { font-family: var(--font-heading); }
  .method-note p { color: var(--text-secondary); }
  .back-link { display: inline-flex; align-items: center; gap: .5rem; margin-top: .7rem; }
  .empty { text-align: center; padding: 2rem; border: 1px solid var(--border-subtle); border-radius: 12px; }
  @media (max-width: 760px) { .filters, .target-list { grid-template-columns: 1fr; } .reference-hero h1 { font-size: 2rem; } .target-card { padding: 1rem; } }
</style>

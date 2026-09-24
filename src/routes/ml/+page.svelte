<script>
  // @ts-nocheck
  import { base } from '$app/paths';
  import { Activity, ArrowRight, ArrowUpRight, Database, GitBranch, ShieldCheck } from '@lucide/svelte';
  import benchmark from '$lib/content/mlBenchmark.generated.json';
  import { language } from '$lib/stores/language';
  import { tdmEngineUrl } from '$lib/tdm/engine';

  let scope = $state('current');
  let query = $state('');
  let drug = $state('all');

  const text = {
    fr: {
      title: 'Machine learning pour le TDM',
      lead: "Une estimation expérimentale de l’AUC24 par XGBoost, entraînée sur des profils PopPK simulés et toujours présentée à côté de l’estimation MAP bayésienne.",
      open: 'Ouvrir dans le moteur TDM', course: 'Voir le chapitre pédagogique',
      simulated: 'Profils simulés', sparse: 'Prélèvements limités', features: 'Variables structurées', model: 'XGBoost', output: 'AUC24 ML',
      evidence: 'Point de départ publié', articleTitle: "L’article de simulation du tacrolimus",
      articleBody: "Woillard et al. ont simulé 9 000 profils riches de tacrolimus à l’état stationnaire à partir d’un modèle PopPK publié. Des modèles XGBoost utilisant deux ou trois concentrations ont été entraînés sur 75 % des profils, testés sur les 25 % restants, puis évalués dans quatre jeux externes de patients.",
      articleResult: 'Dans ces validations externes : biais relatif < 5 % et RMSE relative < 10 %, avec des performances comparables au MAP-BE.',
      relatedTitle: 'Données cliniques antérieures',
      relatedBody: "Une étude complémentaire avait entraîné des modèles sur 4 997 AUC de tacrolimus biquotidien et 1 452 AUC de tacrolimus quotidien, puis les avait évalués dans six jeux de PK riches indépendants.",
      adaptation: 'Adaptation dans PMx Explain',
      adaptationBody: "Le pipeline de la bibliothèque reprend le principe de l’article, pas son niveau de validation clinique. Chaque couple modèle–voie possède son propre prédicteur. Il apprend le logarithme du rapport entre l’AUC24 individuelle simulée et l’AUC24 populationnelle du même schéma.",
      target: 'Cible apprise', inputs: 'Entrées', validation: 'Validation interne', explanation: 'Explication locale',
      targetText: 'log(AUC24 individuelle / AUC24 populationnelle)',
      inputsText: 'Dose, intervalle, concentrations, horaires, prédictions populationnelles et covariables du modèle.',
      validationText: 'Validation croisée répétée, jeu de test non touché et test sur un autre modèle PopPK lorsque possible.',
      explanationText: 'DALEX décompose la prédiction par rapport à 200 profils synthétiques. Les contributions ne sont pas causales.',
      benchmark: 'Benchmark de la bibliothèque',
      benchmarkLead: "Résultats du dernier entraînement complet. Le statut « disponible dans le TDM » exige aussi que le modèle soit un prior MAP éligible et que son empreinte soit inchangée.",
      current: 'Disponibles dans le TDM', snapshot: 'Tous les artefacts du benchmark', search: 'Rechercher un modèle', allDrugs: 'Toutes les molécules',
      artifacts: 'artefacts évalués', available: 'actuellement compatibles', research: 'franchissent les seuils internes', clinical: 'validation clinique pour les extensions',
      median: 'RMSE médiane sur test', chart: 'RMSE relative sur le jeu de test non touché', logScale: 'Largeur en échelle logarithmique · seuil interne RMSE = 15 %',
      noRows: 'Aucun résultat ne correspond aux filtres.',
      modelCol: 'Modèle', modeCol: 'Mode', cvCol: 'RMSE CV', holdoutCol: 'RMSE test', biasCol: 'Biais test', withinCol: 'Dans ±20 %', alternateCol: 'RMSE autre PopPK', statusCol: 'Statut',
      internalResearch: 'Seuils internes atteints', experimental: 'Expérimental', unavailable: 'Hors analyse TDM', stale: 'À réentraîner', na: 'N/A',
      interpretation: 'Comment lire ces résultats',
      limits: [
        "Le benchmark est entièrement synthétique : il mesure une reconstruction de l’AUC dans le monde défini par les modèles, pas un bénéfice clinique.",
        "Une bonne performance sur le modèle générateur ne garantit pas la transportabilité vers une autre population ou un autre modèle PopPK.",
        "L’AUC24 ML n’est pas utilisée pour la recommandation de dose. La trajectoire, les scénarios et la recommandation restent fondés sur le MAP-BE.",
        "Deux concentrations dans un même intervalle et un schéma déclaré à l’état stationnaire sont nécessaires. Une sortie hors domaine déclenche un avertissement."
      ],
      mapTitle: 'Pourquoi afficher MAP et ML ensemble ?',
      mapBody: "La concordance apporte un contrôle de cohérence utile ; une divergence attire l’attention sur le modèle, les horaires, les covariables ou le domaine d’apprentissage. Elle ne permet pas de choisir automatiquement la méthode correcte.",
      date: 'Entraînement du benchmark'
    },
    en: {
      title: 'Machine learning for TDM',
      lead: 'An experimental XGBoost AUC24 estimate trained on simulated PopPK profiles and always displayed alongside MAP Bayesian estimation.',
      open: 'Open in the TDM engine', course: 'Read the learning chapter',
      simulated: 'Simulated profiles', sparse: 'Sparse samples', features: 'Structured features', model: 'XGBoost', output: 'ML AUC24',
      evidence: 'Published starting point', articleTitle: 'The tacrolimus simulation article',
      articleBody: 'Woillard et al. simulated 9,000 rich steady-state tacrolimus profiles from a published PopPK model. XGBoost models using two or three concentrations were trained on 75% of profiles, tested on the remaining 25%, then evaluated in four external patient datasets.',
      articleResult: 'In these external validations: relative bias < 5% and relative RMSE < 10%, with performance comparable to MAP-BE.',
      relatedTitle: 'Earlier clinical data',
      relatedBody: 'A related study had trained models on 4,997 twice-daily and 1,452 once-daily tacrolimus AUCs, then evaluated them in six independent rich-PK datasets.',
      adaptation: 'Adaptation in PMx Explain',
      adaptationBody: 'The library pipeline adapts the article’s principle, not its level of clinical validation. Each model–route pair has its own predictor. It learns the log ratio between simulated individual AUC24 and population AUC24 under the same regimen.',
      target: 'Learning target', inputs: 'Inputs', validation: 'Internal validation', explanation: 'Local explanation',
      targetText: 'log(individual AUC24 / population AUC24)',
      inputsText: 'Dose, interval, concentrations, times, population predictions and model covariates.',
      validationText: 'Repeated cross-validation, untouched holdout and testing on another PopPK model when possible.',
      explanationText: 'DALEX decomposes the prediction against 200 synthetic profiles. Contributions are not causal.',
      benchmark: 'Library benchmark',
      benchmarkLead: 'Results from the latest full training run. “Available in TDM” also requires an eligible MAP prior and an unchanged model fingerprint.',
      current: 'Available in TDM', snapshot: 'All benchmark artifacts', search: 'Search models', allDrugs: 'All drugs',
      artifacts: 'evaluated artifacts', available: 'currently compatible', research: 'pass internal gates', clinical: 'clinical validation for extensions',
      median: 'Median holdout RMSE', chart: 'Relative RMSE on the untouched holdout', logScale: 'Logarithmic width · internal RMSE threshold = 15%',
      noRows: 'No result matches the filters.',
      modelCol: 'Model', modeCol: 'Mode', cvCol: 'CV RMSE', holdoutCol: 'Holdout RMSE', biasCol: 'Holdout bias', withinCol: 'Within ±20%', alternateCol: 'Other-PopPK RMSE', statusCol: 'Status',
      internalResearch: 'Internal gates passed', experimental: 'Experimental', unavailable: 'Outside TDM analysis', stale: 'Retraining required', na: 'N/A',
      interpretation: 'How to read these results',
      limits: [
        'The benchmark is entirely synthetic: it measures AUC reconstruction in the world defined by the models, not clinical benefit.',
        'Good performance on the generating model does not guarantee transportability to another population or PopPK model.',
        'ML AUC24 is not used for dose recommendation. Trajectories, scenarios and recommendations remain MAP-BE based.',
        'Two concentrations in one dosing interval and a declared steady-state regimen are required. Out-of-domain input triggers a warning.'
      ],
      mapTitle: 'Why show MAP and ML together?',
      mapBody: 'Agreement provides a useful consistency check; disagreement draws attention to the model, times, covariates or training domain. It cannot automatically identify the correct method.',
      date: 'Benchmark training date'
    }
  };

  let copy = $derived(text[$language === 'en' ? 'en' : 'fr']);
  let currentArtifacts = $derived(benchmark.artifacts.filter((item) => item.availableInTdm));
  let scopeArtifacts = $derived(scope === 'current' ? currentArtifacts : benchmark.artifacts);
  let drugs = $derived(Array.from(new Set(scopeArtifacts.map((item) => item.drug))).sort());
  let rows = $derived.by(() => scopeArtifacts
    .filter((item) => drug === 'all' || item.drug === drug)
    .filter((item) => `${item.drug} ${item.model} ${item.modelId}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (a.validation.untouchedHoldout?.relativeRmsePct ?? Infinity) - (b.validation.untouchedHoldout?.relativeRmsePct ?? Infinity)));
  let chartMax = $derived(Math.max(60, ...rows.map((item) => item.validation.untouchedHoldout?.relativeRmsePct ?? 0)));
  const value = (item, block, metric) => Number(item.validation?.[block]?.[metric]);
  const format = (number) => Number.isFinite(number) ? `${number.toFixed(1)} %` : copy.na;
  const median = (values) => {
    const clean = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!clean.length) return NaN;
    const middle = Math.floor(clean.length / 2);
    return clean.length % 2 ? clean[middle] : (clean[middle - 1] + clean[middle]) / 2;
  };
  let medianHoldout = $derived(median(scopeArtifacts.map((item) => value(item, 'untouchedHoldout', 'relativeRmsePct'))));
  const barWidth = (number) => `${Math.min(100, Math.log1p(Math.max(0, number)) / Math.log1p(chartMax) * 100)}%`;
  const status = (item) => !item.analysisEligible ? copy.unavailable : !item.hashMatches ? copy.stale : item.releaseLevel === 'research' ? copy.internalResearch : copy.experimental;
  const statusClass = (item) => !item.availableInTdm ? 'muted' : item.releaseLevel === 'research' ? 'research' : 'experimental';
  const modeLabel = (item) => item.administrationMode === 'continuous' ? 'IV continue' : item.administrationMode === 'intermittent' ? 'IV discontinue' : item.administrationMode;
</script>

<svelte:head>
  <title>{copy.title} | PMx Explain</title>
  <meta name="description" content={copy.lead}/>
</svelte:head>

<section class="hero">
  <div>
    <p class="eyebrow">TDM · XGBoost · DALEX</p>
    <h1>{copy.title}</h1>
    <p class="lead">{copy.lead}</p>
    <div class="actions">
      <a class="btn btn-primary" href={`${tdmEngineUrl}/?lang=${$language}`} target="_blank" rel="noopener noreferrer"><Activity size={18}/>{copy.open}</a>
      <a class="btn btn-outline" href={`${base}/chapitres/ai-ml-tdm/`}><ArrowRight size={18}/>{copy.course}</a>
    </div>
  </div>
  <div class="pipeline" aria-label={$language === 'en' ? 'Machine-learning pipeline' : 'Pipeline de machine learning'}>
    {#each [
      [Database, copy.simulated, 'PopPK'],
      [Activity, copy.sparse, 'C1 · C2'],
      [GitBranch, copy.features, 'dose · t · cov'],
      [GitBranch, copy.model, 'boosted trees'],
      [ShieldCheck, copy.output, 'estimate']
    ] as [Icon, label, detail], index}
      <div class="pipeline-step"><Icon size={23}/><strong>{label}</strong><span>{detail}</span></div>
      {#if index < 4}<span class="pipeline-arrow"><ArrowRight size={18}/></span>{/if}
    {/each}
  </div>
</section>

<section class="evidence">
  <header><p class="eyebrow">{copy.evidence}</p><h2>{copy.articleTitle}</h2></header>
  <div class="evidence-grid">
    <div>
      <p>{copy.articleBody}</p>
      <strong class="result">{copy.articleResult}</strong>
      <a href="https://doi.org/10.1016/j.phrs.2021.105578" target="_blank" rel="noopener noreferrer">Pharmacological Research 2021 · DOI 10.1016/j.phrs.2021.105578 <ArrowUpRight size={15}/></a>
    </div>
    <div>
      <h3>{copy.relatedTitle}</h3>
      <p>{copy.relatedBody}</p>
      <a href="https://doi.org/10.1002/cpt.2123" target="_blank" rel="noopener noreferrer">Clinical Pharmacology &amp; Therapeutics 2021 · DOI 10.1002/cpt.2123 <ArrowUpRight size={15}/></a>
    </div>
  </div>
</section>

<section class="method">
  <div class="section-intro"><p class="eyebrow">PMx Explain</p><h2>{copy.adaptation}</h2><p>{copy.adaptationBody}</p></div>
  <div class="method-grid">
    <article><span>01</span><h3>{copy.target}</h3><p>{copy.targetText}</p></article>
    <article><span>02</span><h3>{copy.inputs}</h3><p>{copy.inputsText}</p></article>
    <article><span>03</span><h3>{copy.validation}</h3><p>{copy.validationText}</p></article>
    <article><span>04</span><h3>{copy.explanation}</h3><p>{copy.explanationText}</p></article>
  </div>
</section>

<section class="benchmark">
  <div class="section-head">
    <div><p class="eyebrow">{copy.date} · {benchmark.benchmarkDate}</p><h2>{copy.benchmark}</h2><p>{copy.benchmarkLead}</p></div>
    <div class="scope" role="group" aria-label={$language === 'en' ? 'Benchmark scope' : 'Périmètre du benchmark'}>
      <button class:active={scope === 'current'} onclick={() => { scope = 'current'; drug = 'all'; }}>{copy.current}</button>
      <button class:active={scope === 'snapshot'} onclick={() => { scope = 'snapshot'; drug = 'all'; }}>{copy.snapshot}</button>
    </div>
  </div>

  <div class="stats">
    <div><strong>{benchmark.artifacts.length}</strong><span>{copy.artifacts}</span></div>
    <div><strong>{currentArtifacts.length}</strong><span>{copy.available}</span></div>
    <div><strong>{currentArtifacts.filter((item) => item.releaseLevel === 'research').length}</strong><span>{copy.research}</span></div>
    <div><strong>0</strong><span>{copy.clinical}</span></div>
    <div><strong>{format(medianHoldout)}</strong><span>{copy.median}</span></div>
  </div>

  <div class="filters">
    <label><span>{copy.search}</span><input bind:value={query} type="search" placeholder="XGBoost / Revilla / vancomycine…"/></label>
    <label><span>{$language === 'en' ? 'Drug' : 'Molécule'}</span><select bind:value={drug}><option value="all">{copy.allDrugs}</option>{#each drugs as item}<option value={item}>{item}</option>{/each}</select></label>
  </div>

  <div class="chart-head"><h3>{copy.chart}</h3><span>{copy.logScale}</span></div>
  {#if rows.length}
    <div class="rmse-chart">
      {#each rows as item}
        {@const rmse = value(item, 'untouchedHoldout', 'relativeRmsePct')}
        <div class="chart-row">
          <div class="chart-label"><strong>{item.model}</strong><span>{item.drug} · {modeLabel(item)}</span></div>
          <div class="track"><span class="threshold" style={`left:${barWidth(15)}`}></span><span class={`bar ${statusClass(item)}`} style={`width:${barWidth(rmse)}`}></span></div>
          <strong class="chart-value">{format(rmse)}</strong>
        </div>
      {/each}
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>{copy.modelCol}</th><th>{copy.modeCol}</th><th>{copy.cvCol}</th><th>{copy.holdoutCol}</th><th>{copy.biasCol}</th><th>{copy.withinCol}</th><th>{copy.alternateCol}</th><th>{copy.statusCol}</th></tr></thead>
        <tbody>{#each rows as item}<tr>
          <td><strong>{item.model}</strong><span>{item.drug}</span></td><td>{modeLabel(item)}</td>
          <td>{format(value(item, 'repeatedCv', 'relativeRmsePct'))}</td><td>{format(value(item, 'untouchedHoldout', 'relativeRmsePct'))}</td>
          <td>{format(value(item, 'untouchedHoldout', 'relativeBiasPct'))}</td><td>{format(value(item, 'untouchedHoldout', 'within20Pct'))}</td>
          <td>{format(value(item, 'alternatePopPk', 'relativeRmsePct'))}</td><td><span class={`status ${statusClass(item)}`}>{status(item)}</span></td>
        </tr>{/each}</tbody>
      </table>
    </div>
  {:else}<p class="empty">{copy.noRows}</p>{/if}
</section>

<section class="interpretation">
  <div><p class="eyebrow">MAP-BE + ML</p><h2>{copy.mapTitle}</h2><p>{copy.mapBody}</p></div>
  <div><h2>{copy.interpretation}</h2><ul>{#each copy.limits as limit}<li>{limit}</li>{/each}</ul></div>
</section>

<style>
  .eyebrow { margin: 0 0 var(--space-2); color: var(--accent-ai); font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; }
  h1 { max-width: 760px; margin: 0; font-size: clamp(2.4rem, 6vw, 5rem); line-height: .98; letter-spacing: 0; }
  h2 { margin: 0; }
  .lead { max-width: 760px; color: var(--text-secondary); font-size: var(--text-xl); }
  .hero { min-height: min(720px, calc(100vh - 120px)); display: grid; align-content: center; gap: var(--space-10); }
  .actions { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-6); }
  .actions a, .evidence a { display: inline-flex; align-items: center; gap: var(--space-2); }
  .pipeline { display: grid; grid-template-columns: repeat(4, minmax(115px, 1fr) auto) minmax(115px, 1fr); align-items: center; border-block: 1px solid var(--border-subtle); padding: var(--space-5) 0; }
  .pipeline-step { min-height: 105px; display: grid; align-content: center; gap: 4px; padding: var(--space-3); border-left: 3px solid var(--accent-pk); }
  .pipeline-step:nth-of-type(3), .pipeline-step:nth-of-type(4) { border-color: var(--accent-ai); }
  .pipeline-step strong { font-size: var(--text-sm); }
  .pipeline-step span { color: var(--text-muted); font-family: var(--font-mono); font-size: var(--text-xs); }
  .pipeline-arrow { display: grid; place-items: center; color: var(--text-muted); }
  .evidence, .method, .benchmark, .interpretation { margin-top: var(--space-16); padding-top: var(--space-8); border-top: 1px solid var(--border-subtle); }
  .evidence-grid { display: grid; grid-template-columns: 1.2fr .8fr; gap: var(--space-10); margin-top: var(--space-6); }
  .evidence-grid > div { padding-left: var(--space-5); border-left: 3px solid var(--accent-pd); }
  .evidence-grid p, .section-intro p, .section-head p, .interpretation p { color: var(--text-secondary); }
  .evidence-grid a { margin-top: var(--space-4); font-family: var(--font-mono); font-size: var(--text-xs); }
  .result { display: block; color: var(--text-primary); }
  .section-intro, .section-head > div:first-child { max-width: 850px; }
  .method-grid { display: grid; grid-template-columns: repeat(4, 1fr); margin-top: var(--space-7); border-top: 1px solid var(--border-subtle); border-left: 1px solid var(--border-subtle); }
  .method-grid article { min-height: 215px; padding: var(--space-5); border-right: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); }
  .method-grid article > span { color: var(--accent-pk); font-family: var(--font-mono); }
  .method-grid h3 { margin: var(--space-5) 0 var(--space-2); font-size: var(--text-lg); }
  .method-grid p { color: var(--text-secondary); font-size: var(--text-sm); }
  .section-head { display: flex; align-items: end; justify-content: space-between; gap: var(--space-6); }
  .scope { display: inline-flex; border: 1px solid var(--border-strong); padding: 3px; }
  .scope button { border: 0; background: transparent; color: var(--text-secondary); padding: var(--space-2) var(--space-3); font: inherit; font-size: var(--text-sm); cursor: pointer; }
  .scope button.active { background: var(--text-primary); color: var(--bg-primary); }
  .stats { display: grid; grid-template-columns: repeat(5, 1fr); margin: var(--space-7) 0; border-block: 1px solid var(--border-subtle); }
  .stats div { min-height: 110px; display: grid; align-content: center; gap: 3px; padding: var(--space-4); border-right: 1px solid var(--border-subtle); }
  .stats div:last-child { border-right: 0; }
  .stats strong { font-family: var(--font-heading); font-size: var(--text-2xl); }
  .stats span { color: var(--text-muted); font-size: var(--text-xs); }
  .filters { display: grid; grid-template-columns: minmax(220px, 1fr) minmax(180px, 280px); gap: var(--space-4); margin: var(--space-6) 0; }
  label { display: grid; gap: var(--space-2); color: var(--text-primary); font-weight: 650; }
  label span { font-size: var(--text-sm); }
  input, select { width: 100%; border: 1px solid var(--border-strong); border-radius: var(--radius); background: var(--bg-tertiary); color: var(--text-primary); padding: var(--space-3); font: inherit; }
  .chart-head { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-4); margin: var(--space-8) 0 var(--space-4); }
  .chart-head h3 { margin: 0; }
  .chart-head span { color: var(--text-muted); font-family: var(--font-mono); font-size: var(--text-xs); }
  .rmse-chart { display: grid; gap: var(--space-2); }
  .chart-row { display: grid; grid-template-columns: minmax(150px, 230px) minmax(160px, 1fr) 64px; align-items: center; gap: var(--space-3); min-height: 42px; }
  .chart-label { min-width: 0; display: grid; }
  .chart-label strong, .chart-label span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .chart-label strong { font-size: var(--text-sm); }
  .chart-label span { color: var(--text-muted); font-size: 11px; }
  .track { position: relative; height: 12px; background: var(--bg-secondary); }
  .threshold { position: absolute; z-index: 2; top: -4px; bottom: -4px; border-left: 1px dashed var(--text-primary); }
  .bar { position: absolute; inset: 0 auto 0 0; min-width: 2px; background: var(--accent-pk); }
  .bar.research { background: var(--accent-pd); }
  .bar.muted { background: var(--text-muted); opacity: .55; }
  .chart-value { text-align: right; font-family: var(--font-mono); font-size: var(--text-xs); }
  .table-wrap { overflow-x: auto; margin-top: var(--space-8); border-top: 1px solid var(--border-strong); }
  table { width: 100%; border-collapse: collapse; font-size: var(--text-xs); }
  th, td { padding: var(--space-3); border-bottom: 1px solid var(--border-subtle); text-align: right; white-space: nowrap; }
  th { color: var(--text-muted); font-family: var(--font-mono); font-weight: 500; }
  th:first-child, td:first-child, th:last-child, td:last-child { text-align: left; }
  td:first-child { display: grid; }
  td:first-child span { color: var(--text-muted); }
  .status { display: inline-block; border-left: 3px solid var(--accent-pk); padding-left: var(--space-2); }
  .status.research { border-color: var(--accent-pd); }
  .status.muted { border-color: var(--text-muted); color: var(--text-muted); }
  .empty { color: var(--text-muted); padding: var(--space-8) 0; }
  .interpretation { display: grid; grid-template-columns: .8fr 1.2fr; gap: var(--space-10); }
  .interpretation > div:first-child { padding-right: var(--space-8); border-right: 1px solid var(--border-subtle); }
  .interpretation ul { margin: var(--space-4) 0 0; padding-left: 1.2rem; }
  .interpretation li { margin-bottom: var(--space-3); color: var(--text-secondary); }
  @media (max-width: 900px) {
    .pipeline { grid-template-columns: 1fr; gap: 0; }
    .pipeline-arrow { margin: var(--space-2) auto; transform: rotate(90deg); }
    .evidence-grid, .interpretation { grid-template-columns: 1fr; }
    .method-grid { grid-template-columns: repeat(2, 1fr); }
    .stats { grid-template-columns: repeat(2, 1fr); }
    .section-head { align-items: start; flex-direction: column; }
    .interpretation > div:first-child { padding: 0 0 var(--space-6); border-right: 0; border-bottom: 1px solid var(--border-subtle); }
  }
  @media (max-width: 620px) {
    .hero { min-height: auto; }
    .method-grid, .filters, .stats { grid-template-columns: 1fr; }
    .stats div { border-right: 0; border-bottom: 1px solid var(--border-subtle); }
    .chart-row { grid-template-columns: minmax(120px, .8fr) minmax(100px, 1fr) 58px; }
    .scope { width: 100%; display: grid; grid-template-columns: 1fr; }
  }
</style>

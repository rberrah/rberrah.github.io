<script>
  // @ts-nocheck
  import { base } from '$app/paths';
  import { Activity, ArrowRight, ArrowUpRight, Database, GitBranch, ShieldCheck } from '@lucide/svelte';
  import benchmark from '$lib/content/mlBenchmark.generated.json';
  import { language } from '$lib/stores/language';
  import { tdmEngineUrl } from '$lib/tdm/engine';

  let scope = $state('snapshot');
  let query = $state('');
  let drug = $state('all');

  const text = {
    fr: {
      title: 'Machine learning pour le TDM',
      lead: "Une estimation expérimentale de l’AUC24 par XGBoost, entraînée sur des profils PopPK simulés et toujours présentée à côté de l’estimation MAP bayésienne.",
      open: 'Ouvrir dans le moteur TDM', course: 'Voir le chapitre pédagogique',
      simulated: 'Profils simulés', sparse: 'Prélèvements limités', features: 'Variables structurées', model: 'XGBoost', output: 'AUC24 ML',
      evidence: 'Point de départ publié', articleTitle: "L’article de simulation du tacrolimus",
      articleBody: "Woillard et al. ont simulé 9 000 profils riches de tacrolimus biquotidien à l’état stationnaire : neuf doses, un intervalle de 12 h et une concentration toutes les 30 minutes. L’AUC cible était l’AUC0–12. Le modèle à deux prélèvements utilisait C0 et C3 ; le modèle à trois prélèvements utilisait C0, C1 et C3, avec une faible incertitude simulée sur les horaires.",
      articleResult: 'Jeu de test simulé de l’article : RMSE relative de 4,60 % avec C0+C3 et de 2,61 % avec C0+C1+C3. En validation clinique externe, la RMSE relative du modèle à deux prélèvements variait de 8,55 % à 12,9 % selon la cohorte.',
      relatedTitle: 'Données cliniques antérieures',
      relatedBody: "Une étude complémentaire avait entraîné des modèles sur 4 997 AUC de tacrolimus biquotidien et 1 452 AUC de tacrolimus quotidien, puis les avait évalués dans six jeux de PK riches indépendants.",
      adaptation: 'Adaptation dans PMx Explain',
      adaptationBody: "Le pipeline de la bibliothèque reprend le principe de l’article, pas son niveau de validation clinique. Chaque couple modèle–voie possède son propre prédicteur. Il apprend le logarithme du rapport entre l’AUC24 individuelle simulée et l’AUC24 populationnelle du même schéma.",
      target: 'Cible apprise', inputs: 'Entrées', validation: 'Validation interne', explanation: 'Explication locale',
      targetText: 'log(AUC24 individuelle / AUC24 populationnelle)',
      inputsText: 'Dose, intervalle, concentrations, horaires, prédictions populationnelles et covariables du modèle.',
      validationText: 'Validation croisée répétée, jeu de test non touché et test sur un autre modèle PopPK lorsque possible.',
      explanationText: 'DALEX décompose la prédiction par rapport à 200 profils synthétiques. Les contributions ne sont pas causales.',
      samplingWarningTitle: 'Deux plans de prélèvement comparés',
      samplingWarningBody: "Chaque modèle est évalué sur les mêmes patients virtuels avec C0 seul, puis avec C0 et une concentration une heure après la fin de perfusion. Pour l’oral et le bolus, la fin de perfusion vaut 0 : le second prélèvement est donc C1. Pour une perfusion intermittente de durée Tinf, il est réalisé à Tinf+1 h. L’erreur résiduelle SIGMA du modèle est appliquée aux concentrations.",
      protocolPublishedTitle: 'Article tacrolimus',
      protocolPublishedBody: 'Dose toutes les 12 h · AUC0–12 · C0+C3 ou C0+C1+C3 · 9 000 profils avant filtrage · distributions et filtres spécifiques à l’article.',
      protocolPmxTitle: 'Benchmark PMx actuel',
      protocolPmxBody: 'Intervalle tiré parmi 12 ou 24 h pour le tacrolimus · AUC24 · C0 seul comparé à C0+C1 · 1 000 profils · population issue du modèle Woillard 2011.',
      tacroBenchmarkTitle: 'Tacrolimus : C0 seul versus C0+C1',
      tacroBenchmarkBody: "Sur le jeu de test PMx tacrolimus, la RMSE relative est de 37,1 % pour l’AUC populationnelle, 14,3 % avec C0 seul et 12,2 % avec C0+C1. Le deuxième prélèvement apporte donc un gain modeste par rapport à C0 seul. Ces valeurs ne sont pas directement comparables aux 4,60 % de l’article C0+C3, car la cible, les horaires, les intervalles, les covariables, les filtres et l’effectif diffèrent.",
      benchmark: 'Benchmark de la bibliothèque',
      benchmarkLead: "Pour chaque couple modèle–mode, le même jeu de test compare l’AUC populationnelle, XGBoost avec C0 seul et XGBoost avec C0 plus un prélèvement une heure après la fin de perfusion. Le statut « disponible dans le TDM » exige aussi un prior MAP éligible et une empreinte inchangée.",
      current: 'Disponibles dans le TDM', snapshot: 'Tous les modèles benchmarkés', search: 'Rechercher un modèle', allDrugs: 'Toutes les molécules',
      artifacts: 'artefacts évalués', available: 'actuellement compatibles', research: 'franchissent les seuils internes', clinical: 'validation clinique pour les extensions',
      improved: 'améliorés avec C0+1 h', medianNoMl: 'RMSE médiane sans ML', medianWithMl: 'RMSE médiane C0+1 h', chart: 'RMSE relative de l’AUC sur le jeu de test non touché', logScale: 'Largeur en échelle logarithmique · seuil interne RMSE ML = 15 %',
      noRows: 'Aucun résultat ne correspond aux filtres.',
      modelCol: 'Modèle', modeCol: 'Mode', noMlBiasCol: 'Biais sans ML', noMlRmseCol: 'RMSE sans ML', c0BiasCol: 'Biais C0', c0RmseCol: 'RMSE C0', mlBiasCol: 'Biais C0+1 h', mlRmseCol: 'RMSE C0+1 h', gainCol: 'Gain RMSE', statusCol: 'Statut',
      internalResearch: 'Seuils internes atteints', experimental: 'Expérimental', unavailable: 'Hors analyse TDM', stale: 'À réentraîner', na: 'N/A',
      interpretation: 'Comment lire ces résultats',
      metricTitle: 'Ce que signifie « sans ML »',
      metricBody: "Il s’agit de l’AUC populationnelle du même modèle et du même schéma, avec effets aléatoires individuels inconnus. Ce n’est ni la qualité de publication du modèle ni une estimation MAP. La RMSE relative est RMSE(AUC estimée − AUC vraie) divisée par la moyenne des AUC vraies.",
      baselineLegend: 'AUC populationnelle sans ML', c0Legend: 'XGBoost avec C0 seul', mlLegend: 'XGBoost avec C0 + 1 h après fin de perfusion',
      limits: [
        "Le benchmark est entièrement synthétique : il mesure une reconstruction de l’AUC dans le monde défini par les modèles, pas un bénéfice clinique.",
        "Les covariables sont simulées à partir des plages, distributions ou statistiques descriptives de la population source. Toute hypothèse de distribution est déclarée ; une covariable insuffisamment documentée reste à la valeur de référence du modèle.",
        "Les covariables dépendantes du temps sont actuellement maintenues constantes pendant le profil simulé ; leur évolution longitudinale devra faire l’objet d’un benchmark séparé.",
        "Un modèle PopPK publié décrit une distribution de patients ; il ne garantit pas que deux concentrations bruitées identifient les effets aléatoires du patient. Même avec le même modèle générateur, cette information peut rester partiellement non identifiable.",
        "Une RMSE élevée peut être dominée par quelques profils extrêmes lorsque la variabilité interindividuelle, les doses et les AUC couvrent une plage très large. Le biais moyen peut alors rester faible.",
        "Une bonne performance sur le modèle générateur ne garantit pas la transportabilité vers une autre population ou un autre modèle PopPK.",
        "L’AUC24 ML n’est pas utilisée pour la recommandation de dose. La trajectoire, les scénarios et la recommandation restent fondés sur le MAP-BE.",
        "Le prédicteur principal exige un C0 pré-dose et un prélèvement post-dose dans l’intervalle suivant. La perfusion continue est exclue de ce comparatif, faute de fin de perfusion et de C0 pré-dose définis. Une sortie hors domaine déclenche un avertissement."
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
      articleBody: 'Woillard et al. simulated 9,000 rich steady-state twice-daily tacrolimus profiles: nine doses, a 12-hour interval and one concentration every 30 minutes. The target was AUC0–12. The two-sample model used C0 and C3; the three-sample model used C0, C1 and C3, with small simulated timing uncertainty.',
      articleResult: 'Article simulated test set: relative RMSE was 4.60% with C0+C3 and 2.61% with C0+C1+C3. In external clinical validation, relative RMSE for the two-sample model ranged from 8.55% to 12.9% across cohorts.',
      relatedTitle: 'Earlier clinical data',
      relatedBody: 'A related study had trained models on 4,997 twice-daily and 1,452 once-daily tacrolimus AUCs, then evaluated them in six independent rich-PK datasets.',
      adaptation: 'Adaptation in PMx Explain',
      adaptationBody: 'The library pipeline adapts the article’s principle, not its level of clinical validation. Each model–route pair has its own predictor. It learns the log ratio between simulated individual AUC24 and population AUC24 under the same regimen.',
      target: 'Learning target', inputs: 'Inputs', validation: 'Internal validation', explanation: 'Local explanation',
      targetText: 'log(individual AUC24 / population AUC24)',
      inputsText: 'Dose, interval, concentrations, times, population predictions and model covariates.',
      validationText: 'Repeated cross-validation, untouched holdout and testing on another PopPK model when possible.',
      explanationText: 'DALEX decomposes the prediction against 200 synthetic profiles. Contributions are not causal.',
      samplingWarningTitle: 'Two sampling designs compared',
      samplingWarningBody: 'Each model is evaluated on the same virtual patients using C0 alone, then C0 plus one concentration one hour after infusion end. For oral and bolus dosing, infusion end is time zero, so the second sample is C1. For an intermittent infusion lasting Tinf, it is collected at Tinf+1 hour. Model SIGMA residual error is applied to the concentrations.',
      protocolPublishedTitle: 'Tacrolimus article',
      protocolPublishedBody: 'Dose every 12 h · AUC0–12 · C0+C3 or C0+C1+C3 · 9,000 profiles before filtering · article-specific distributions and filters.',
      protocolPmxTitle: 'Current PMx benchmark',
      protocolPmxBody: 'Tacrolimus interval sampled from 12 or 24 h · AUC24 · C0 alone compared with C0+C1 · 1,000 profiles · population based on the 2011 Woillard model.',
      tacroBenchmarkTitle: 'Tacrolimus: C0 alone versus C0+C1',
      tacroBenchmarkBody: 'On the PMx tacrolimus holdout, relative RMSE is 37.1% for population AUC, 14.3% with C0 alone and 12.2% with C0+C1. The second sample therefore provides a modest gain over C0 alone. These values are not directly comparable with the article’s 4.60% for C0+C3 because the target, sampling times, intervals, covariates, filters and sample size differ.',
      benchmark: 'Library benchmark',
      benchmarkLead: 'For each model–mode pair, the same holdout compares population AUC, XGBoost with C0 alone, and XGBoost with C0 plus one sample one hour after infusion end. “Available in TDM” also requires an eligible MAP prior and an unchanged fingerprint.',
      current: 'Available in TDM', snapshot: 'All benchmarked models', search: 'Search models', allDrugs: 'All drugs',
      artifacts: 'evaluated artifacts', available: 'currently compatible', research: 'pass internal gates', clinical: 'clinical validation for extensions',
      improved: 'improved with C0+1 h', medianNoMl: 'Median RMSE without ML', medianWithMl: 'Median C0+1 h RMSE', chart: 'Relative AUC RMSE on the untouched holdout', logScale: 'Logarithmic width · internal ML RMSE threshold = 15%',
      noRows: 'No result matches the filters.',
      modelCol: 'Model', modeCol: 'Mode', noMlBiasCol: 'Bias without ML', noMlRmseCol: 'RMSE without ML', c0BiasCol: 'C0 bias', c0RmseCol: 'C0 RMSE', mlBiasCol: 'C0+1 h bias', mlRmseCol: 'C0+1 h RMSE', gainCol: 'RMSE gain', statusCol: 'Status',
      internalResearch: 'Internal gates passed', experimental: 'Experimental', unavailable: 'Outside TDM analysis', stale: 'Retraining required', na: 'N/A',
      interpretation: 'How to read these results',
      metricTitle: 'What “without ML” means',
      metricBody: 'It is the population AUC from the same model and regimen, with individual random effects unknown. It is neither the publication quality of the model nor a MAP estimate. Relative RMSE is RMSE(estimated AUC − true AUC) divided by mean true AUC.',
      baselineLegend: 'Population AUC without ML', c0Legend: 'XGBoost with C0 alone', mlLegend: 'XGBoost with C0 + 1 h after infusion end',
      limits: [
        'The benchmark is entirely synthetic: it measures AUC reconstruction in the world defined by the models, not clinical benefit.',
        'Covariates are simulated from ranges, distributions or summary statistics reported for each source population. Any distributional assumption is declared; an insufficiently documented covariate remains at the model reference value.',
        'Time-varying covariates are currently held constant over each simulated profile; their longitudinal evolution requires a separate benchmark.',
        'A published PopPK model describes a patient distribution; it does not guarantee that two noisy concentrations identify the patient random effects. Even under the same generating model, that information may remain partly non-identifiable.',
        'A high RMSE can be dominated by a few extreme profiles when interindividual variability, doses and AUCs span a wide range. Mean bias can nevertheless remain small.',
        'Good performance on the generating model does not guarantee transportability to another population or PopPK model.',
        'ML AUC24 is not used for dose recommendation. Trajectories, scenarios and recommendations remain MAP-BE based.',
        'The primary predictor requires a pre-dose C0 and a post-dose sample in the following interval. Continuous infusion is excluded because infusion end and pre-dose C0 are not defined. Out-of-domain input triggers a warning.'
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
    .sort((a, b) => strategyValue(a, 'c0PlusOneHourPostInfusion', 'relativeRmsePct') - strategyValue(b, 'c0PlusOneHourPostInfusion', 'relativeRmsePct')));
  const baselineValue = (item, block, metric) => Number(item.validation?.populationBaseline?.[block]?.[metric]);
  const strategyValue = (item, strategy, metric) => Number(item.validation?.samplingStrategies?.[strategy]?.untouchedHoldout?.[metric]);
  const c0Value = (item, metric) => strategyValue(item, 'c0Only', metric);
  const primaryValue = (item, metric) => strategyValue(item, 'c0PlusOneHourPostInfusion', metric);
  const gainValue = (item) => {
    const baseline = baselineValue(item, 'untouchedHoldout', 'relativeRmsePct');
    const primary = primaryValue(item, 'relativeRmsePct');
    return Number.isFinite(baseline) && baseline > 0 && Number.isFinite(primary) ? 100 * (baseline - primary) / baseline : NaN;
  };
  let chartMax = $derived(Math.max(60, ...rows.flatMap((item) => [
    primaryValue(item, 'relativeRmsePct') || 0,
    c0Value(item, 'relativeRmsePct') || 0,
    item.validation.populationBaseline?.untouchedHoldout?.relativeRmsePct ?? 0
  ])));
  const format = (number) => Number.isFinite(number) ? `${number.toFixed(1)} %` : copy.na;
  const median = (values) => {
    const clean = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!clean.length) return NaN;
    const middle = Math.floor(clean.length / 2);
    return clean.length % 2 ? clean[middle] : (clean[middle - 1] + clean[middle]) / 2;
  };
  let medianWithoutMl = $derived(median(scopeArtifacts.map((item) => baselineValue(item, 'untouchedHoldout', 'relativeRmsePct'))));
  let medianWithMl = $derived(median(scopeArtifacts.map((item) => primaryValue(item, 'relativeRmsePct'))));
  let improvedCount = $derived(scopeArtifacts.filter((item) => gainValue(item) > 0).length);
  const barWidth = (number) => Number.isFinite(number) ? `${Math.min(100, Math.log1p(Math.max(0, number)) / Math.log1p(chartMax) * 100)}%` : '0%';
  const status = (item) => !item.analysisEligible ? copy.unavailable : !item.hashMatches ? copy.stale : item.releaseLevel === 'research' ? copy.internalResearch : copy.experimental;
  const statusClass = (item) => !item.availableInTdm ? 'muted' : item.releaseLevel === 'research' ? 'research' : 'experimental';
  const gainClass = (item) => !Number.isFinite(gainValue(item)) ? 'unavailable' : gainValue(item) >= 0 ? 'improved' : 'degraded';
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
      [Activity, copy.sparse, 'C0 · post+1 h'],
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
  <aside class="metric-note sampling-note">
    <h3>{copy.samplingWarningTitle}</h3>
    <p>{copy.samplingWarningBody}</p>
  </aside>
  <div class="protocol-comparison">
    <div><strong>{copy.protocolPublishedTitle}</strong><p>{copy.protocolPublishedBody}</p></div>
    <div><strong>{copy.protocolPmxTitle}</strong><p>{copy.protocolPmxBody}</p></div>
  </div>
  <aside class="metric-note comparison-note">
    <h3>{copy.tacroBenchmarkTitle}</h3>
    <p>{copy.tacroBenchmarkBody}</p>
  </aside>
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
    <div><strong>{improvedCount}/{scopeArtifacts.length}</strong><span>{copy.improved}</span></div>
    <div><strong>{scopeArtifacts.filter((item) => item.releaseLevel === 'research').length}</strong><span>{copy.research}</span></div>
    <div><strong>{format(medianWithoutMl)}</strong><span>{copy.medianNoMl}</span></div>
    <div><strong>{format(medianWithMl)}</strong><span>{copy.medianWithMl}</span></div>
  </div>

  <div class="filters">
    <label><span>{copy.search}</span><input bind:value={query} type="search" placeholder="XGBoost / Revilla / vancomycine…"/></label>
    <label><span>{$language === 'en' ? 'Drug' : 'Molécule'}</span><select bind:value={drug}><option value="all">{copy.allDrugs}</option>{#each drugs as item}<option value={item}>{item}</option>{/each}</select></label>
  </div>

  <div class="metric-note"><h3>{copy.metricTitle}</h3><p>{copy.metricBody}</p></div>
  <div class="chart-head"><div><h3>{copy.chart}</h3><div class="legend"><span class="baseline-key"></span>{copy.baselineLegend}<span class="c0-key"></span>{copy.c0Legend}<span class="ml-key"></span>{copy.mlLegend}</div></div><span>{copy.logScale}</span></div>
  {#if rows.length}
    <div class="rmse-chart">
      {#each rows as item}
        {@const rmse = primaryValue(item, 'relativeRmsePct')}
        {@const c0Rmse = c0Value(item, 'relativeRmsePct')}
        {@const baselineRmse = baselineValue(item, 'untouchedHoldout', 'relativeRmsePct')}
        <div class="chart-row">
          <div class="chart-label"><strong>{item.model}</strong><span>{item.drug} · {modeLabel(item)}</span></div>
          <div class="bar-pair">
            <div class="track"><span class="threshold" style={`left:${barWidth(15)}`}></span><span class="bar baseline" style={`width:${barWidth(baselineRmse)}`}></span></div>
            <div class="track"><span class="threshold" style={`left:${barWidth(15)}`}></span><span class="bar c0" style={`width:${barWidth(c0Rmse)}`}></span></div>
            <div class="track"><span class="threshold" style={`left:${barWidth(15)}`}></span><span class={`bar ml ${gainClass(item)}`} style={`width:${barWidth(rmse)}`}></span></div>
          </div>
          <strong class={`chart-value ${gainClass(item)}`}>{format(baselineRmse)}<br/>{format(c0Rmse)}<br/>{format(rmse)}</strong>
        </div>
      {/each}
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>{copy.modelCol}</th><th>{copy.modeCol}</th><th>{copy.noMlBiasCol}</th><th>{copy.noMlRmseCol}</th><th>{copy.c0BiasCol}</th><th>{copy.c0RmseCol}</th><th>{copy.mlBiasCol}</th><th>{copy.mlRmseCol}</th><th>{copy.gainCol}</th><th>{copy.statusCol}</th></tr></thead>
        <tbody>{#each rows as item}<tr>
          <td><strong>{item.model}</strong><span>{item.drug}</span></td><td>{modeLabel(item)}</td>
          <td>{format(baselineValue(item, 'untouchedHoldout', 'relativeBiasPct'))}</td><td>{format(baselineValue(item, 'untouchedHoldout', 'relativeRmsePct'))}</td>
          <td>{format(c0Value(item, 'relativeBiasPct'))}</td><td>{format(c0Value(item, 'relativeRmsePct'))}</td>
          <td>{format(primaryValue(item, 'relativeBiasPct'))}</td><td>{format(primaryValue(item, 'relativeRmsePct'))}</td>
          <td><strong class={gainClass(item)}>{format(gainValue(item))}</strong></td><td><span class={`status ${statusClass(item)}`}>{status(item)}</span></td>
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
  .stats { display: grid; grid-template-columns: repeat(6, 1fr); margin: var(--space-7) 0; border-block: 1px solid var(--border-subtle); }
  .stats div { min-height: 110px; display: grid; align-content: center; gap: 3px; padding: var(--space-4); border-right: 1px solid var(--border-subtle); }
  .stats div:last-child { border-right: 0; }
  .stats strong { font-family: var(--font-heading); font-size: var(--text-2xl); }
  .stats span { color: var(--text-muted); font-size: var(--text-xs); }
  .filters { display: grid; grid-template-columns: minmax(220px, 1fr) minmax(180px, 280px); gap: var(--space-4); margin: var(--space-6) 0; }
  label { display: grid; gap: var(--space-2); color: var(--text-primary); font-weight: 650; }
  label span { font-size: var(--text-sm); }
  input, select { width: 100%; border: 1px solid var(--border-strong); border-radius: var(--radius); background: var(--bg-tertiary); color: var(--text-primary); padding: var(--space-3); font: inherit; }
  .metric-note { max-width: 850px; margin: var(--space-7) 0; padding-left: var(--space-4); border-left: 3px solid var(--accent-ai); }
  .sampling-note { border-left-color: var(--accent-pk); }
  .comparison-note { border-left-color: var(--accent-pd); }
  .metric-note h3 { margin: 0 0 var(--space-2); }
  .metric-note p { margin: 0; color: var(--text-secondary); }
  .protocol-comparison { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-6); max-width: 1000px; }
  .protocol-comparison > div { padding-top: var(--space-4); border-top: 2px solid var(--border-strong); }
  .protocol-comparison p { margin-bottom: 0; color: var(--text-secondary); }
  .chart-head { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-4); margin: var(--space-8) 0 var(--space-4); }
  .chart-head h3 { margin: 0; }
  .chart-head span { color: var(--text-muted); font-family: var(--font-mono); font-size: var(--text-xs); }
  .legend { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); margin-top: var(--space-2); color: var(--text-muted); font-size: var(--text-xs); }
  .legend .baseline-key, .legend .c0-key, .legend .ml-key { width: 18px; height: 6px; background: var(--text-muted); }
  .legend .c0-key { margin-left: var(--space-2); background: var(--accent-ai); }
  .legend .ml-key { margin-left: var(--space-2); background: var(--accent-pd); }
  .rmse-chart { display: grid; gap: var(--space-2); }
  .chart-row { display: grid; grid-template-columns: minmax(150px, 230px) minmax(160px, 1fr) 64px; align-items: center; gap: var(--space-3); min-height: 42px; }
  .chart-label { min-width: 0; display: grid; }
  .chart-label strong, .chart-label span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .chart-label strong { font-size: var(--text-sm); }
  .chart-label span { color: var(--text-muted); font-size: 11px; }
  .bar-pair { display: grid; gap: 3px; }
  .track { position: relative; height: 8px; background: var(--bg-secondary); }
  .threshold { position: absolute; z-index: 2; top: -4px; bottom: -4px; border-left: 1px dashed var(--text-primary); }
  .bar { position: absolute; inset: 0 auto 0 0; min-width: 2px; }
  .bar.baseline { background: var(--text-muted); opacity: .7; }
  .bar.c0 { background: var(--accent-ai); }
  .bar.ml { background: var(--accent-pd); }
  .bar.ml.degraded { background: var(--accent-pk); }
  .chart-value { text-align: right; font-family: var(--font-mono); font-size: var(--text-xs); }
  .improved { color: var(--accent-pd); }
  .degraded { color: var(--accent-pk); }
  .unavailable { color: var(--text-muted); }
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
    .evidence-grid, .interpretation, .protocol-comparison { grid-template-columns: 1fr; }
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

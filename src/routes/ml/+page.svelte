<script>
  // @ts-nocheck
  import { base } from '$app/paths';
  import { ArrowRight, ArrowUpRight, Activity } from '@lucide/svelte';
  import benchmark from '$lib/content/mlBenchmark.generated.json';
  import { language } from '$lib/stores/language';
  import { tdmEngineUrl } from '$lib/tdm/engine';

  let design = $state('c0PlusOneHourPostInfusion');
  let query = $state('');
  let drug = $state('all');
  let en = $derived($language === 'en');
  let data = $derived(benchmark.pairedBenchmark ?? { results: [] });
  let drugs = $derived([...new Set(data.results.map((row) => row.drug))].sort());
  let rows = $derived(data.results.filter((row) => (drug === 'all' || row.drug === drug)
    && `${row.model} ${row.drug}`.toLowerCase().includes(query.toLowerCase())));
  const metrics = (row, method) => row.strategies?.[design]?.paired?.n
    ? row.strategies[design].paired[method] : row.strategies?.[design]?.[method];
  const format = (value) => typeof value === 'number' && Number.isFinite(value) ? `${value.toFixed(1)} %` : 'N/A';
  let maxRmse = $derived(Math.max(1, ...rows.flatMap((row) => ['map', 'ml'].map((method) => metrics(row, method)?.relativeRmsePct ?? 0))));
  const width = (value) => `${100 * Math.log1p(Math.max(0, value ?? 0)) / Math.log1p(maxRmse)}%`;
  const mode = (row) => row.administrationMode === 'oral' ? (en ? 'Oral' : 'Orale')
    : row.administrationMode === 'continuous' ? (en ? 'Continuous IV' : 'IV continue') : (en ? 'Intermittent IV' : 'IV discontinue');
  const heading = (row, method) => `${row.model}, ${method === 'map' ? 'MAP-BE' : 'XGBoost'}: ${format(metrics(row, method)?.relativeRmsePct)}`;
</script>

<svelte:head>
  <title>{en ? 'Machine learning for TDM' : 'Machine learning pour le TDM'} | PMx Explain</title>
  <meta name="description" content={en ? 'Paired MAP Bayesian and XGBoost AUC estimation with C0 or C0+C1.' : 'Comparaison des estimations d’AUC par MAP bayésien et XGBoost avec C0 ou C0+C1.'}/>
</svelte:head>

<section class="intro">
  <p class="eyebrow">TDM · MAP-BE · XGBoost</p>
  <h1>{en ? 'Machine learning for TDM' : 'Machine learning pour le TDM'}</h1>
  <p class="lead">{en ? 'Two methods, the same patients, the same concentrations: estimating individual AUC from sparse sampling.' : 'Deux méthodes, les mêmes patients, les mêmes concentrations : estimer l’AUC individuelle à partir de prélèvements limités.'}</p>
  <div class="actions">
    <a class="btn btn-primary" href={`${tdmEngineUrl}/?lang=${$language}`} target="_blank" rel="noopener noreferrer"><Activity size={18}/>{en ? 'Open TDM engine' : 'Ouvrir le moteur TDM'}</a>
    <a class="btn btn-outline" href={`${base}/chapitres/ai-ml-tdm/`}><ArrowRight size={18}/>{en ? 'Learning chapter' : 'Chapitre pédagogique'}</a>
  </div>
</section>

<section>
  <h2>{en ? 'Published methodology' : 'Méthodologie publiée'}</h2>
  <p>{en ? 'Woillard et al. (2021) trained XGBoost directly on tacrolimus AUC using simulated profiles: 75% training, 25% testing, with ten-fold cross-validation for hyperparameter selection. Their sampling designs were C0+C3 and C0+C1+C3, not C0 alone or C0+C1.' : 'Woillard et al. (2021) ont entraîné XGBoost directement sur l’AUC du tacrolimus à partir de profils simulés : 75 % pour l’apprentissage, 25 % pour le test, avec sélection des hyperparamètres par validation croisée à dix groupes. Leurs plans de prélèvement étaient C0+C3 et C0+C1+C3, pas C0 seul ou C0+C1.'}</p>
  <p>{en ? 'The article reports simulated-test relative RMSE of 4.60% with C0+C3 and 2.61% with C0+C1+C3. It used AUC0–12, Prograf every 12 hours, strongly reduced residual error and tacrolimus-specific profile filters. These figures cannot be transferred to a different sampling design or treated as expected results for every library model.' : 'L’article rapporte une RMSE relative de 4,60 % avec C0+C3 et de 2,61 % avec C0+C1+C3 sur le jeu de test simulé. Il utilisait l’AUC0–12, Prograf toutes les 12 heures, une erreur résiduelle fortement réduite et des filtres de profils propres au tacrolimus. Ces chiffres ne sont pas transposables à un autre plan de prélèvement ni attendus pour tous les modèles de la bibliothèque.'}</p>
  <p>{en ? 'ESM4 reports the selected two-sample settings: tree depth 1, minimum node size 40, mtry 7 and learning rate 0.0261. The complete candidate grid is not published.' : 'L’ESM4 rapporte les réglages retenus avec deux dosages : profondeur 1, taille minimale de nœud 40, mtry 7 et taux d’apprentissage 0,0261. La grille complète des candidats n’est pas publiée.'} <a class="source" href="https://ars.els-cdn.com/content/image/1-s2.0-S1043661821001626-mmc4.docx" target="_blank" rel="noopener noreferrer">ESM4 <ArrowUpRight size={15}/></a></p>
  <a class="source" href="https://doi.org/10.1016/j.phrs.2021.105578" target="_blank" rel="noopener noreferrer">Woillard et al. · Pharmacological Research 2021 <ArrowUpRight size={15}/></a>
</section>

<section>
  <h2>{en ? 'Paired benchmark protocol' : 'Protocole du benchmark apparié'}</h2>
  <div class="method-grid">
    <div><h3>01 · Simulation</h3><p>{en ? 'Steady-state profiles with model-specific covariate distributions and the full OMEGA prior: 9,000 for Woillard and 3,000 per other model/mode. The central 90% is retained before the 75/25 split. Paired evaluation uses 1,098 untouched Woillard holdout patients and 300 for each other scope. Each residual-error standard deviation is divided by ten.' : 'Profils à l’état stationnaire avec distributions de covariables propres au modèle et prior OMEGA complet : 9 000 pour Woillard et 3 000 par autre couple modèle/mode. Les 90 % centraux sont conservés avant le partage 75/25. L’évaluation appariée utilise 1 098 patients Woillard non touchés et 300 pour chaque autre périmètre. Chaque écart-type résiduel est divisé par dix.'}</p></div>
    <div><h3>02 · {en ? 'Samples' : 'Prélèvements'}</h3><p>{en ? 'C0 alone, or C0+C1. C1 means one hour after infusion end. The reference infusion duration is zero for oral dosing, bolus and continuous infusion. In continuous infusion the pump stays on: samples are collected at t=0 and t=1 h.' : 'C0 seul, ou C0+C1. C1 désigne une concentration une heure après la fin de perfusion. La durée de référence vaut zéro pour l’oral, le bolus et la perfusion continue. En perfusion continue, la pompe reste active : prélèvements à t=0 et t=1 h.'}</p></div>
    <div><h3>03 · MAP-BE</h3><p>{en ? 'mapbayr estimates the individual random effects using exactly these samples and the known covariates. The posterior PK profile gives AUC24. This is not an unadjusted population AUC.' : 'mapbayr estime les effets aléatoires individuels à partir de ces mêmes dosages et des covariables connues. Le profil PK postérieur fournit l’AUC24. Il ne s’agit pas d’une AUC populationnelle sans ajustement.'}</p></div>
    <div><h3>04 · XGBoost</h3><p>{en ? 'Direct AUC24 regression using dose, interval, concentrations, times and covariates. Ten-fold tuning is confined to training patients. The article-informed one/two-sample grid includes its published two-sample optimum and tests depths 1, 2 and 4 at learning rates 0.0261 and 0.05.' : 'Régression directe de l’AUC24 à partir de la dose, de l’intervalle, des concentrations, des horaires et des covariables. Le réglage à dix groupes reste limité aux patients d’apprentissage. La grille à un/deux dosages inspirée de l’article inclut son optimum publié à deux dosages et teste les profondeurs 1, 2 et 4 avec les taux 0,0261 et 0,05.'}</p></div>
  </div>
  <aside><strong>{en ? 'Residual-error scenario' : 'Scénario d’erreur résiduelle'}</strong><p>{en ? 'The ten-fold reduction preserves each model’s error structure. It is consistent with the direction studied by Berrah et al., where a 1% proportional error improved MAP-BE precision, but it is not the same setting for every model.' : 'La réduction par dix conserve la structure d’erreur de chaque modèle. Elle va dans le sens étudié par Berrah et al., où une erreur proportionnelle à 1 % améliorait la précision du MAP-BE, mais elle ne constitue pas un réglage identique pour tous les modèles.'}</p><a class="source" href="https://doi.org/10.1097/FTD.0000000000001413" target="_blank" rel="noopener noreferrer">Berrah et al. · Therapeutic Drug Monitoring <ArrowUpRight size={15}/></a></aside>
  <h3>{en ? 'Remaining differences from Woillard 2021' : 'Différences restantes avec Woillard 2021'}</h3>
  <ul>
    <li>{en ? 'Sampling is C0 or C0+C1 here, versus C0+C3 or C0+C1+C3 in the article.' : 'Les prélèvements sont ici C0 ou C0+C1, contre C0+C3 ou C0+C1+C3 dans l’article.'}</li>
    <li>{en ? 'The target is AUC24, versus interdose AUC0–12.' : 'La cible est l’AUC24, contre l’AUC0–12 interdose.'}</li>
    <li>{en ? 'The generic filter removes the lowest and highest 5% of AUC24 values. The article applied fixed tacrolimus concentration, AUC0–12 and profile-shape rules.' : 'Le filtre générique retire les 5 % d’AUC24 les plus basses et les plus hautes. L’article appliquait des règles fixes de concentration, d’AUC0–12 et de forme du profil propres au tacrolimus.'}</li>
    <li>{en ? 'Woillard profiles include Prograf q12h and Advagraf q24h with ST forced to the matching formulation. The article simulated Prograf q12h only with nine specific doses.' : 'Les profils Woillard incluent Prograf q12h et Advagraf q24h avec ST imposé selon la formulation. L’article simulait uniquement Prograf q12h avec neuf doses précises.'}</li>
    <li>{en ? 'Residual standard deviations are divided by ten here; the article used 0.1 µg/L additive and 0.01% proportional error. Sampling-time jitter and dose-dependent CYP3A5 prevalence are also not reproduced.' : 'Les écarts-types résiduels sont ici divisés par dix ; l’article utilisait 0,1 µg/L d’erreur additive et 0,01 % d’erreur proportionnelle. Le bruit sur les horaires et la prévalence de CYP3A5 dépendante de la dose ne sont pas reproduits.'}</li>
  </ul>
</section>

<section>
  <div class="section-head"><div><p class="eyebrow">{data.benchmarkDate ?? ''}</p><h2>{en ? 'Library results' : 'Résultats de la bibliothèque'}</h2></div>
    <div class="segments" role="group" aria-label={en ? 'Sampling design' : 'Plan de prélèvement'}>
      <button class:active={design === 'c0Only'} aria-pressed={design === 'c0Only'} onclick={() => design = 'c0Only'}>{en ? 'C0 alone' : 'C0 seul'}</button>
      <button class:active={design === 'c0PlusOneHourPostInfusion'} aria-pressed={design === 'c0PlusOneHourPostInfusion'} onclick={() => design = 'c0PlusOneHourPostInfusion'}>C0 + C1</button>
    </div>
  </div>
  <p>{en ? 'Bias and relative RMSE below use the same patients with successful estimates from both methods. The ±20% success rate uses all test patients, counting failed estimates as unsuccessful. If no MAP comparison is available, only standalone ML performance is reported. Numbers of failures are shown explicitly.' : 'Le biais et la RMSE relative ci-dessous utilisent les mêmes patients estimés avec succès par les deux méthodes. Le taux de réussite à ±20 % porte sur tous les patients du test : une estimation échouée compte comme un échec. Si aucun comparatif MAP n’est disponible, seule la performance ML est rapportée. Les nombres d’échecs sont affichés explicitement.'}</p>
  <div class="filters"><label>{en ? 'Model' : 'Modèle'}<input type="search" bind:value={query}/></label><label>{en ? 'Drug' : 'Molécule'}<select bind:value={drug}><option value="all">{en ? 'All drugs' : 'Toutes les molécules'}</option>{#each drugs as item}<option value={item}>{item}</option>{/each}</select></label></div>
  <div class="legend"><span><i class="map"></i>MAP-BE</span><span><i class="ml"></i>XGBoost</span><small>{en ? 'Relative RMSE · logarithmic bar width' : 'RMSE relative · largeur logarithmique des barres'}</small></div>
  {#if rows.length}
    <div class="chart">{#each rows as row}
      <div class="chart-row"><div><strong>{row.model}</strong><small>{row.drug} · {mode(row)}</small></div><div class="bars">{#each ['map', 'ml'] as method}<div class="bar-line"><div class="track" aria-label={heading(row, method)}><span class={method} style={`width:${width(metrics(row, method)?.relativeRmsePct)}`}></span></div><span>{format(metrics(row, method)?.relativeRmsePct)}</span></div>{/each}</div></div>
    {/each}</div>
    <div class="table-wrap"><table><caption>{en ? 'AUC24 estimation on the untouched test set' : 'Estimation de l’AUC24 sur le jeu de test non touché'}</caption><thead><tr><th>{en ? 'Model / mode' : 'Modèle / mode'}</th><th>{en ? 'Train / test' : 'Apprentissage / test'}</th><th>{en ? 'Method' : 'Méthode'}</th><th>{en ? 'Bias' : 'Biais'}</th><th>rRMSE</th><th>AUC ±20 %</th><th>{en ? 'Failures' : 'Échecs'}</th></tr></thead>
      <tbody>{#each rows as row}{#each ['map', 'ml'] as method}<tr>
        {#if method === 'map'}<th rowspan="2"><strong>{row.model}</strong><small>{row.drug} · {mode(row)}</small>{#if row.mapUnavailableReason}<small>{en ? 'MAP unavailable: unsupported residual-error structure. ML only, no comparison.' : 'MAP indisponible : structure d’erreur résiduelle non prise en charge. ML seul, sans comparaison.'}</small>{/if}{#if !row.analysisEligible}<small>{en ? 'Outside TDM analysis: exploratory' : 'Hors analyse TDM : exploratoire'}</small>{/if}{#if !row.hashMatches}<small>{en ? 'Model changed since benchmark' : 'Modèle modifié depuis le benchmark'}</small>{/if}</th><td rowspan="2">{row.nTraining} / {row.nHoldout}<small>{row.nIncluded ?? row.nTraining + row.nHoldout} / {row.nSimulated ?? row.nTraining + row.nHoldout} {en ? 'profiles retained' : 'profils conservés'}</small><small>{en ? 'Paired' : 'Appariés'} : {row.strategies[design].paired.n}</small></td>{/if}
        <td>{method === 'map' ? 'MAP-BE' : 'XGBoost'}</td><td>{format(metrics(row, method)?.relativeBiasPct)}</td><td>{format(metrics(row, method)?.relativeRmsePct)}</td><td>{method === 'map' && row.mapUnavailableReason ? 'N/A' : format(row.strategies[design][method].within20Pct)}</td><td>{method === 'map' && row.mapUnavailableReason ? 'N/A' : `${row.strategies[design][method].nFailed} / ${row.nHoldout}`}</td>
      </tr>{/each}{/each}</tbody></table></div>
  {:else}<p>{en ? 'No paired results available for this selection.' : 'Aucun résultat apparié disponible pour cette sélection.'}</p>{/if}
</section>

<section>
  <h2>{en ? 'Reading the metrics' : 'Lire les indicateurs'}</h2>
  <p><code>e = (AUC estimée − AUC vraie) / AUC vraie</code></p>
  <ul><li>{en ? 'Bias = 100 × mean(e). Positive bias means overestimation.' : 'Biais = 100 × moyenne(e). Un biais positif signifie une surestimation.'}</li><li>{en ? 'Relative RMSE = 100 × √mean(e²), not RMSE divided by mean AUC.' : 'RMSE relative = 100 × √moyenne(e²), et non RMSE divisée par l’AUC moyenne.'}</li><li>{en ? 'AUC within ±20% = 100 × number of estimates between 0.8 and 1.2 times true AUC / total test patients.' : 'AUC à ±20 % = 100 × nombre d’estimations comprises entre 0,8 et 1,2 fois l’AUC vraie / effectif total du test.'}</li></ul>
  <p>{en ? 'Simulating with the same model does not make sparse observations sufficient to identify every individual parameter. Residual error, sampling times and prior information still matter. Agreement between MAP and ML is a consistency check, not clinical validation. Dose recommendations remain MAP-based.' : 'Simuler avec le même modèle ne rend pas les prélèvements limités suffisants pour identifier tous les paramètres individuels. L’erreur résiduelle, les horaires et l’information a priori restent déterminants. La concordance MAP/ML constitue un contrôle de cohérence, pas une validation clinique. Les recommandations de dose restent fondées sur le MAP.'}</p>
</section>

<style>
  section { padding: 2rem 0; border-bottom: 1px solid var(--border-subtle); }
  h1 { font-size: 2.5rem; line-height: 1.15; margin: 0; }
  h2 { font-size: 1.65rem; margin: 0 0 1rem; }
  h3 { font-size: 1.1rem; }
  p { line-height: 1.65; max-width: 100ch; }
  .eyebrow { color: var(--text-secondary); font-size: .85rem; }
  .lead { font-size: 1.15rem; }
  .actions, .source, .section-head, .legend, .legend span { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
  .section-head { justify-content: space-between; }
  .method-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem 2rem; }
  aside { border-left: 3px solid var(--accent-ai); padding: 1rem 1.25rem; background: var(--bg-secondary); }
  aside p { margin-bottom: 0; }
  .segments { display: inline-flex; border: 1px solid var(--border-subtle); border-radius: 6px; overflow: hidden; }
  .segments button { padding: .65rem .85rem; background: var(--bg-secondary); color: var(--text-primary); border: 0; cursor: pointer; }
  .segments button.active { background: var(--text-primary); color: var(--bg-primary); }
  .filters { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1rem 0; }
  label { display: grid; gap: .4rem; min-width: 0; flex: 1 1 220px; }
  input, select { padding: .65rem; color: var(--text-primary); background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 4px; width: 100%; }
  .legend { margin: 1.5rem 0; }
  .legend i { width: 18px; height: 8px; display: inline-block; }
  .map { background: #a7651f; }
  .ml { background: #168577; }
  .chart-row { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(200px, 2fr); gap: 1rem; padding: .75rem 0; border-bottom: 1px solid var(--border-subtle); }
  small { display: block; color: var(--text-secondary); font-size: .8rem; font-weight: 400; }
  .bar-line { display: grid; grid-template-columns: 1fr 80px; gap: .65rem; align-items: center; font-size: .85rem; font-variant-numeric: tabular-nums; min-height: 24px; }
  .track { background: var(--bg-secondary); height: 9px; }
  .track span { display: block; height: 100%; }
  .table-wrap { overflow-x: auto; margin-top: 2rem; }
  table { width: 100%; border-collapse: collapse; font-size: .9rem; font-variant-numeric: tabular-nums; }
  caption { text-align: left; font-weight: 600; padding-bottom: .75rem; }
  th, td { padding: .7rem; text-align: left; border-bottom: 1px solid var(--border-subtle); }
  thead { background: var(--bg-secondary); }
  tbody th { font-weight: 400; min-width: 180px; }
  li { margin: .6rem 0; }
  code { white-space: normal; }
  @media (max-width: 640px) { h1 { font-size: 2rem; } .method-grid { grid-template-columns: 1fr; } .chart-row { grid-template-columns: 1fr; gap: .4rem; } }
</style>

<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { Download, ArrowRight, BookOpen } from '@lucide/svelte';
  import { language } from '$lib/stores/language';
  import { writeDraft } from '$lib/workshops/session';
  import WorkshopNav from '$lib/components/WorkshopNav.svelte';
  import CovariatePlot from '$lib/components/CovariatePlot.svelte';
  import { methods, defaults, domain, validParameters, clearance, covariateCurves, covariateCode } from '$lib/covariates/models';

  let method = $state('transformed');
  let mounted = $state(false);
  onMount(() => { mounted = true; });
  let p = $state(defaults('transformed'));
  let format = $state('mrgsolve');
  let en = $derived($language === 'en');
  const tr = (fr: string, english: string) => en ? english : fr;
  let names: Record<string, string> = $derived({ transformed: tr('Effets transformés · Monolix', 'Transformed effects · Monolix'), groups: tr('Catégories et paliers', 'Categories and thresholds'), physiology: tr('Physiologie · Hill', 'Physiology · Hill'), symbolic: tr('NN et régression symbolique', 'NN and symbolic regression') });
  let descriptions: Record<string, string> = $derived({
    transformed: tr('Le poids déplace la valeur typique de CL. Bêta décrit cet effet systématique ; ETA est un écart individuel sur l’échelle logarithmique. Les corrélations entre ETA sont une autre composante du modèle.', 'Weight shifts typical CL. Beta describes this systematic effect; ETA is an individual deviation on the log scale. Correlations between ETA are a separate model component.'),
    groups: tr('Une catégorie connue peut modifier CL par un ratio. Un palier impose une discontinuité à une variable continue : les seuils 60 et 90 kg ci-dessous sont purement illustratifs. Un cluster appris ou une classe latente exige une procédure supplémentaire, décrite dans le cours.', 'A known category can modify CL through a ratio. Thresholding makes a continuous variable discontinuous: the 60 and 90 kg thresholds below are purely illustrative. A learned cluster or latent class requires an additional procedure, covered in the course.'),
    physiology: tr('La maturation est représentée ici par une fonction de Hill de l’âge post-menstruel. CLmax est une asymptote à taille fixée, pas une valeur adulte universelle. Une fonction sigmoïde seule ne constitue pas un modèle PBPK.', 'Maturation is represented here by a Hill function of postmenstrual age. CLmax is an asymptote at fixed body size, not a universal adult value. A sigmoid alone does not constitute a PBPK model.'),
    symbolic: tr('Un réseau peut proposer une relation non linéaire, puis une régression symbolique une équation lisible. Cette formule est un exemple construit, pas le résultat d’un entraînement. Sa précision et sa validité clinique ne sont pas démontrées.', 'A network can propose a nonlinear relationship, then symbolic regression a readable equation. This formula is a constructed example, not a trained result. Its accuracy and clinical validity have not been established.')
  });
  let formula = $derived(method === 'transformed' ? 'CL = θ · (WT / WTref)^β · exp(η)' : method === 'groups' ? 'CL = θ · ratio(groupe) · exp(η)' : method === 'physiology' ? 'CL = CLmax · PMA^h / (PMA50^h + PMA^h) · exp(η)' : 'z = REN / RENref ; CL = θ · exp(β · log(z) + b · (z − 1)² + η)');
  let xLabel = $derived(method === 'groups' && p.grouping === 'category' ? tr('Groupe', 'Group') : method === 'physiology' ? tr('PMA (semaines)', 'PMA (weeks)') : method === 'symbolic' ? tr('Fonction rénale relative (sans unité)', 'Relative renal function (unitless)') : tr('Poids (kg)', 'Weight (kg)'));
  let limits = $derived(domain(method, p));
  let valid = $derived(validParameters(method, p));
  let curves = $derived(covariateCurves(method, p));
  let code = $derived(covariateCode(method, p, format));
  let lessons = $derived([
    ['covariates-basics', tr('Effets fixes, ETA et transformations', 'Fixed effects, ETA and transformations')],
    ['covariates-groups', tr('Catégories, paliers et clusters', 'Categories, thresholds and clusters')],
    ['covariates-physiology', tr('Relations physiologiques et PBPK', 'Physiological relationships and PBPK')],
    ['covariates-symbolic', tr('Des réseaux aux équations', 'From networks to equations')],
    ['covariates-implementation', tr('Implémentation et validation', 'Implementation and validation')]
  ]);

  function selectMethod() { p = defaults(method); }
  function selectGrouping() { p.value = p.grouping === 'category' ? 2 : 50; p.reference = p.grouping === 'category' ? 1 : 70; }
  function download() {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `covariates-${method}.${format === 'mrgsolve' ? 'cpp' : 'txt'}`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function useInPd() {
    writeDraft('incoming:pd:pk', { side: '1', model: { source: 'code', id: '', code: covariateCode(method, p), route: 'IV', time_unit: 'h', concentration_scale: 1 } });
    goto(`${base}/pd/`);
  }
</script>

<svelte:head>
  <title>{tr('Covariables', 'Covariates')} | PMx Explain</title>
  <meta name="description" content={tr('Comprendre et implémenter les covariables : Monolix, catégories, physiologie et régression symbolique.', 'Understand and implement covariates: Monolix, categories, physiology and symbolic regression.')} />
</svelte:head>

<WorkshopNav active="covariates" />
<header>
  <h1>{tr('Covariables', 'Covariates')}</h1>
  <p>{tr('De la caractéristique du patient aux paramètres PK/PD.', 'From patient characteristics to PK/PD parameters.')}</p>
  <a href="#courses"><BookOpen size={17}/>{tr('Parcours Covariables', 'Covariates learning track')}</a>
</header>

<section class="experiment" inert={!mounted} aria-label={tr('Atelier des covariables', 'Covariates workshop')}>
  <div class="intro">
    <label>{tr('Méthode', 'Method')}<select bind:value={method} onchange={selectMethod} disabled={!mounted} data-testid="covariate-method">{#each methods as item}<option value={item}>{names[item]}</option>{/each}</select></label>
    <p>{descriptions[method]}</p>
    <p class="formula">{formula}</p>
  </div>
  <div class="workspace">
    <div class="controls">
      <h2>{tr('Relation covariable → CL', 'Covariate → CL relationship')}</h2>
      {#if method === 'groups'}
        <label>{tr('Définition des groupes', 'Group definition')}<select bind:value={p.grouping} onchange={selectGrouping}><option value="category">{tr('Catégories connues', 'Known categories')}</option><option value="threshold">{tr('Paliers de poids (illustration)', 'Weight thresholds (illustration)')}</option></select></label>
      {/if}
      <div class="fields">
        {#if method === 'groups' && p.grouping === 'category'}
          <label>{tr('Groupe comparé', 'Selected group')}<select bind:value={p.value}><option value={0}>A</option><option value={1}>B</option><option value={2}>C</option></select></label>
          <label>{tr('Groupe de référence', 'Reference group')}<select bind:value={p.reference}><option value={0}>A</option><option value={1}>B</option><option value={2}>C</option></select></label>
        {:else}
          <label>{xLabel}<input type="number" min={limits[0]} max={limits[1]} step="any" bind:value={p.value} data-testid="covariate-value" /></label>
          <label>{tr('Référence comparée', 'Comparison reference')}<input type="number" min={limits[0]} max={limits[1]} step="any" bind:value={p.reference} /></label>
        {/if}
        <label>{method === 'physiology' ? 'CLmax (L/h)' : 'θ (L/h)'}<input type="number" min="0.01" max="100" step="any" bind:value={p.theta} /></label>
        {#if method === 'transformed' || method === 'symbolic'}<label>β<input type="number" min="-3" max="3" step="0.05" bind:value={p.beta} /></label>{/if}
        {#if method === 'symbolic'}<label>{tr('Courbure b', 'Curvature b')}<input type="number" min="-2" max="2" step="0.05" bind:value={p.curvature} /></label>{/if}
        {#if method === 'physiology'}
          <label>{tr('PMA50 (semaines)', 'PMA50 (weeks)')}<input type="number" min="1" max="200" step="any" bind:value={p.half} /></label>
          <label>Hill h<input type="number" min="0.1" max="8" step="any" bind:value={p.hill} /></label>
        {/if}
        {#if method === 'groups'}
          <label>{tr('Ratio A / B', 'A / B ratio')}<input type="number" min="0.01" max="5" step="any" bind:value={p.low} /></label>
          <label>{tr('Ratio C / B', 'C / B ratio')}<input type="number" min="0.01" max="5" step="any" bind:value={p.high} /></label>
        {/if}
      </div>
      <h2>{tr('Conséquence PK · bolus IV', 'PK consequence · IV bolus')}</h2>
      <div class="fields">
        <label>Dose (mg)<input type="number" min="0.01" max="10000" step="any" bind:value={p.dose} /></label>
        <label>V (L)<input type="number" min="0.01" max="1000" step="any" bind:value={p.volume} /></label>
        <label>{tr('ETA du profil comparé', 'ETA for selected profile')}<input type="number" min="-2" max="2" step="0.05" bind:value={p.eta} /></label>
      </div>
      {#if !valid}<p role="alert">{tr('Renseignez des valeurs finies dans les bornes indiquées.', 'Enter finite values within the indicated bounds.')}</p>{/if}
      {#if valid}<dl><dt>{tr('CL comparée', 'Selected CL')}</dt><dd data-testid="covariate-clearance">{clearance(method, p.value, p, p.eta).toFixed(3)} L/h</dd><dt>{tr('CL de référence (ETA = 0)', 'Reference CL (ETA = 0)')}</dt><dd>{clearance(method, p.reference, p).toFixed(3)} L/h</dd></dl>{/if}
    </div>
    <div class="plots">
      <CovariatePlot title={tr('Effet typique sur la clairance (ETA = 0)', 'Typical effect on clearance (ETA = 0)')} {xLabel} yLabel="CL (L/h)" categories={method === 'groups' && p.grouping === 'category'} series={[{ points: curves.effect, color: '#b85275', label: names[method] }]} />
      <CovariatePlot title={tr('Concentration après un bolus IV', 'Concentration after an IV bolus')} xLabel={tr('Temps (h)', 'Time (h)')} yLabel="C (mg/L)" series={[{ points: curves.selected, color: '#18998d', label: tr('Profil comparé', 'Selected profile') }, { points: curves.reference, color: '#b85275', dashed: true, label: tr('Référence', 'Reference') }]} />
    </div>
  </div>
  <p class="notice">{tr('Exemples pédagogiques, sans données patients ni estimation. Les plages et coefficients ne sont pas des recommandations cliniques. Les profils n’incluent pas de bruit résiduel.', 'Educational examples, with no patient data or estimation. Ranges and coefficients are not clinical recommendations. Profiles do not include residual noise.')}</p>
</section>

<section class="implementation" inert={!mounted}>
  <h2>{tr('Implémentation', 'Implementation')}</h2>
  <div class="actions">
    <label>{tr('Langage', 'Language')}<select bind:value={format}><option value="mrgsolve">mrgsolve</option><option value="mlxtran">MLXTRAN (Monolix)</option></select></label>
    <button onclick={download} disabled={!valid}><Download size={17}/>{tr('Télécharger le modèle', 'Download model')}</button>
    <button onclick={useInPd} disabled={!valid}><ArrowRight size={17}/>{tr('Utiliser ce modèle en PD', 'Use this model in PD')}</button>
  </div>
  <p>{format === 'mrgsolve' ? tr('IIV illustrative : variance de log(CL) = 0,09. Erreur proportionnelle : variance = 0,01 ; erreur additive nulle. ETA est tiré lors des simulations de population, et non fixé à sa valeur d’illustration.', 'Illustrative IIV: log(CL) variance = 0.09. Proportional error variance = 0.01; zero additive error. Population simulations draw ETA rather than fixing it to the illustrative value.') : tr('Ce fichier décrit la structure. Dans Monolix, fixer ou estimer Cl0 et V, configurer la variabilité de Cl0 et le modèle d’erreur séparément. Ne pas ajouter deux fois le même effet de covariable.', 'This file defines the structure. In Monolix, fix or estimate Cl0 and V and configure Cl0 variability and the error model separately. Do not add the same covariate effect twice.')}</p>
  <pre><code>{code}</code></pre>
</section>

<section id="courses">
  <h2>{tr('Parcours Covariables', 'Covariates learning track')}</h2>
  <ol>{#each lessons as [slug, title]}<li><a href={`${base}/chapitres/${slug}/${en ? '?lang=en' : ''}`}>{title}<ArrowRight size={16}/></a></li>{/each}</ol>
  <h3>{tr('Autres approches', 'Other approaches')}</h3>
  <p>{tr('Splines et GAM pour des relations souples ; interactions entre covariables ; régularisation pour stabiliser la sélection ; covariables dépendantes du temps ; modèles d’erreur de mesure ou imputation pour des covariables imparfaites. Ces choix se combinent aux quatre familles et nécessitent une validation au niveau du patient.', 'Splines and GAMs for flexible relationships; covariate interactions; regularization to stabilize selection; time-varying covariates; measurement-error models or imputation for imperfect covariates. These choices can complement the four families and require patient-level validation.')}</p>
  <p class="sources"><a href="https://monolixsuite.slp-software.com/monolix/2024R1/covariate-model">Monolix</a> · <a href="https://doi.org/10.1146/annurev.pharmtox.48.113006.094708">Anderson &amp; Holford</a> · <a href="https://doi.org/10.1007/s10928-023-09887-3">Wahlquist et al.</a></p>
</section>

<style>
  header { margin: 8px 0 28px; } h1 { font-size: 2rem; margin: 0 0 8px; } h2 { font-size: 1.2rem; } h3 { font-size: 1rem; }
  header a, button, li a { display: inline-flex; align-items: center; gap: 8px; }
  p { color: var(--text-secondary); line-height: 1.6; max-width: 85ch; }
  section { border-top: 1px solid var(--border-strong); padding: 22px 0; }
  .intro { margin-bottom: 22px; } .intro label { max-width: 390px; }
  .formula { font-family: 'JetBrains Mono Variable', monospace; color: var(--text-primary); overflow-wrap: anywhere; }
  .workspace { display: grid; grid-template-columns: minmax(250px, 320px) minmax(0, 1fr); gap: 36px; }
  .fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  label { display: flex; flex-direction: column; gap: 6px; font-size: .86rem; color: var(--text-secondary); }
  input, select { width: 100%; min-width: 0; padding: 8px; border: 1px solid var(--border-strong); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); font: inherit; }
  .controls > h2 { margin: 0 0 16px; } .controls > h2:not(:first-child) { margin-top: 25px; } .controls > label { margin-bottom: 14px; }
  .plots { display: grid; gap: 30px; min-width: 0; }
  dl { display: grid; grid-template-columns: 1fr auto; gap: 8px; font-size: .85rem; margin-top: 24px; } dd { margin: 0; font-weight: 650; }
  .notice { font-size: .85rem; border-left: 3px solid #b85275; padding-left: 14px; margin-top: 26px; }
  .actions { display: flex; align-items: end; flex-wrap: wrap; gap: 12px; } .actions label { min-width: 190px; }
  button { padding: 10px 13px; border: 1px solid var(--border-strong); border-radius: 4px; color: var(--text-primary); background: var(--bg-secondary); font: inherit; font-size: .85rem; cursor: pointer; }
  button:disabled { opacity: .5; cursor: not-allowed; } :is(button, a, input, select):focus-visible { outline: 2px solid #18998d; outline-offset: 3px; }
  pre { max-height: 440px; overflow: auto; background: var(--bg-secondary); padding: 18px; border: 1px solid var(--border-subtle); font-size: .82rem; line-height: 1.6; }
  ol { display: grid; gap: 14px; padding-left: 24px; } li a { justify-content: space-between; width: min(100%, 620px); } li :global(svg) { flex-shrink: 0; }
  @media (max-width: 760px) { .workspace { grid-template-columns: 1fr; gap: 25px; } .controls { max-width: 560px; } h1 { font-size: 1.75rem; } }
</style>

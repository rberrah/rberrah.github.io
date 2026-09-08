<script>
  import { language } from '$lib/stores/language';

  const translations = {
    fr: {
      metaTitle: 'Interactions médicamenteuses | Pharmacométrie Pratique',
      metaDescription: 'Simulation dynamique des interactions médicamenteuses par modèles mrgsolve.',
      eyebrow: 'Modélisation DDI',
      title: 'Interactions médicamenteuses',
      lede: "Ce module permettra d'assembler un médicament victime, un mécanisme et un médicament interagissant, puis de simuler l'introduction, le plateau et la récupération après l'arrêt.",
      inProgress: 'Interactions en cours de développement',
      builder: 'Atelier DDI',
      victim: 'Modèle 1',
      mechanism: 'Interaction',
      perpetrator: 'Modèle 2',
      affected: 'Molécule affectée',
      interacting: 'Molécule interagissante',
      modelSource: 'Bibliothèque, Lego ou TDM',
      tdi: 'Paramètre cible + relation + valeurs',
      validation: 'Périmètre',
      validationTitle: 'Assemblage générique de deux modèles',
      validationText: "Le module applique une relation choisie à un paramètre du modèle 1, pilotée si besoin par la concentration du modèle 2. Cette relation reste une hypothèse de simulation et ne constitue pas une interaction clinique validée.",
      workflowTitle: 'Une interface, trois décisions',
      workflow: [
        ['Modèle 1', "Choisir un modèle de la bibliothèque, un modèle Lego ou reprendre son ajustement TDM."],
        ['Interaction', "Choisir le paramètre cible, un facteur constant, une inhibition Emax ou une induction Emax."],
        ['Modèle 2', "Choisir indépendamment ses valeurs populationnelles ou son propre ajustement TDM, puis simuler et exporter le rapport."]
      ],
      privacy: "Les données patient et les simulations restent dans la session Shiny. Elles ne sont ni envoyées au dépôt GitHub ni conservées par le site.",
      status: "Prototype de recherche et d'enseignement, non enregistré comme dispositif médical."
    },
    en: {
      metaTitle: 'Drug interactions | Practical Pharmacometrics',
      metaDescription: 'Dynamic drug-interaction simulation using mrgsolve models.',
      eyebrow: 'DDI modelling',
      title: 'Drug interactions',
      lede: 'This module will assemble a victim drug, a mechanism, and a perpetrator drug, then simulate introduction, plateau, and recovery after discontinuation.',
      inProgress: 'Interactions are under development',
      builder: 'DDI builder',
      victim: 'Model 1',
      mechanism: 'Interaction',
      perpetrator: 'Model 2',
      affected: 'Affected drug',
      interacting: 'Interacting drug',
      modelSource: 'Library, Lego, or TDM',
      tdi: 'Target parameter + relationship + values',
      validation: 'Scope',
      validationTitle: 'Generic assembly of two models',
      validationText: 'The module applies a selected relationship to one parameter in model 1, optionally driven by model 2 concentration. This relationship remains a simulation assumption and is not a validated clinical interaction.',
      workflowTitle: 'One interface, three decisions',
      workflow: [
        ['Model 1', 'Choose a library or Lego model, or reuse its individual TDM fit.'],
        ['Interaction', 'Select the target parameter, a constant factor, Emax inhibition, or Emax induction.'],
        ['Model 2', 'Independently use population values or its own TDM fit, then simulate and export the report.']
      ],
      privacy: 'Patient data and simulations remain in the Shiny session. They are neither sent to GitHub nor retained by the site.',
      status: 'Research and teaching prototype, not registered as a medical device.'
    }
  };

  let copy = $derived($language === 'en' ? translations.en : translations.fr);
</script>

<svelte:head>
  <title>{copy.metaTitle}</title>
  <meta name="description" content={copy.metaDescription} />
</svelte:head>

<section class="intro">
  <p class="eyebrow">{copy.eyebrow}</p>
  <h1>{copy.title}</h1>
  <p class="lede">{copy.lede}</p>
  <div class="actions">
    <span class="status"><i></i><strong>{copy.inProgress}</strong></span>
  </div>
</section>

<section class="builder-band" aria-labelledby="builder-title" data-testid="ddi-builder">
  <div class="band-heading">
    <p class="eyebrow">{copy.builder}</p>
    <h2 id="builder-title">{copy.victim} + {copy.mechanism} + {copy.perpetrator}</h2>
  </div>
  <div class="chain">
    <div class="block victim">
      <span>{copy.victim}</span>
      <strong>{copy.affected}</strong>
      <small>{copy.modelSource}</small>
    </div>
    <b aria-hidden="true">→</b>
    <div class="block mechanism">
      <span>{copy.mechanism}</span>
      <strong>{copy.mechanism}</strong>
      <small>{copy.tdi}</small>
    </div>
    <b aria-hidden="true">→</b>
    <div class="block perpetrator">
      <span>{copy.perpetrator}</span>
      <strong>{copy.interacting}</strong>
      <small>{copy.modelSource}</small>
    </div>
  </div>
</section>

<section class="evidence" aria-labelledby="validation-title">
  <div>
    <p class="eyebrow">{copy.validation}</p>
    <h2 id="validation-title">{copy.validationTitle}</h2>
  </div>
  <p>{copy.validationText}</p>
</section>

<section class="workflow" aria-labelledby="workflow-title">
  <h2 id="workflow-title">{copy.workflowTitle}</h2>
  <div>
    {#each copy.workflow as step, index}
      <article>
        <span>{index + 1}</span>
        <h3>{step[0]}</h3>
        <p>{step[1]}</p>
      </article>
    {/each}
  </div>
</section>

<section class="privacy" role="note">
  <strong>{copy.status}</strong>
  <span>{copy.privacy}</span>
</section>

<style>
  .intro { max-width: 900px; padding: var(--space-12) 0 var(--space-10); }
  h1 { margin: var(--space-3) 0 var(--space-5); font-size: var(--text-4xl); }
  .lede { max-width: 72ch; color: var(--text-secondary); font-size: var(--text-lg); }
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-4); margin-top: var(--space-7); }
  .status { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--text-secondary); font-size: var(--text-sm); }
  .status i { width: 9px; height: 9px; border-radius: 50%; background: var(--accent-pd); }

  .builder-band { display: grid; grid-template-columns: minmax(190px, 0.42fr) minmax(0, 1.58fr); gap: var(--space-8); align-items: center; padding: var(--space-8) 0; border-block: 1px solid var(--border-subtle); }
  .band-heading h2 { margin: var(--space-2) 0 0; font-size: var(--text-2xl); }
  .chain { display: grid; grid-template-columns: minmax(0, 1fr) 30px minmax(0, 1.25fr) 30px minmax(0, 1fr); gap: var(--space-2); align-items: stretch; }
  .chain > b { display: grid; place-items: center; color: var(--text-muted); font-size: var(--text-xl); }
  .block { display: grid; align-content: center; min-width: 0; min-height: 118px; padding: var(--space-4); border: 1px solid var(--border-subtle); border-top: 3px solid var(--accent-pk); background: var(--bg-tertiary); text-align: center; }
  .block.mechanism { border-top-color: var(--accent-pd); }
  .block.perpetrator { border-top-color: var(--accent-ai); }
  .block span, .block small { color: var(--text-muted); font-size: var(--text-xs); }
  .block strong { margin: 3px 0; overflow-wrap: anywhere; }

  .evidence { display: grid; grid-template-columns: minmax(230px, 0.7fr) minmax(0, 1.3fr); gap: var(--space-8); padding: var(--space-10) 0; }
  .evidence h2, .workflow h2 { margin: var(--space-2) 0 0; }
  .evidence > p { margin: 0; padding-left: var(--space-5); border-left: 3px solid var(--accent-pd); color: var(--text-secondary); }

  .workflow { padding: var(--space-8) 0; border-top: 1px solid var(--border-subtle); }
  .workflow > div { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); margin-top: var(--space-6); }
  .workflow article { padding-top: var(--space-4); border-top: 2px solid var(--accent-pk); }
  .workflow article > span { color: var(--accent-pk); font-family: var(--font-mono); }
  .workflow h3 { margin: var(--space-2) 0; font-size: var(--text-lg); }
  .workflow p { margin: 0; color: var(--text-secondary); }

  .privacy { display: grid; gap: var(--space-2); margin-top: var(--space-8); padding: var(--space-5); border-left: 4px solid var(--accent-pd); background: var(--bg-secondary); }
  .privacy span { color: var(--text-secondary); }

  @media (max-width: 860px) {
    .builder-band, .evidence { grid-template-columns: 1fr; }
    .workflow > div { grid-template-columns: 1fr; }
  }
  @media (max-width: 620px) {
    .chain { grid-template-columns: 1fr; }
    .chain > b { min-height: 22px; transform: rotate(90deg); }
    .block { min-height: 92px; }
  }
</style>

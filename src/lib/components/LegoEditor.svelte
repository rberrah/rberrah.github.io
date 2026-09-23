<script>
  // Atelier « Lego » — constructeur de modèles LIBRE.
  // On ajoute des compartiments (dépôt, transit, central, périphérique, métabolite, PD)
  // et des flèches (constantes de transfert) entre N'IMPORTE quels compartiments.
  // Sortie : diagramme éditable + EDO générées + nlmixr2/mrgsolve/MLXTRAN/NONMEM + simulation (RK4).
  import { onMount, onDestroy, tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { ArrowRight, Play, Plus } from '@lucide/svelte';
  import { readDraft, writeDraft, takeDraft, isPkDiagram, pkKinds } from '$lib/workshops/session.js';
  import { language } from '$lib/stores/language';
  import LabTransfer from '$lib/components/LabTransfer.svelte';
  import { legoSpec } from '$lib/labs/model.js';
  import { ui } from '$lib/i18n/translations';
  import { tdmEngineUrl } from '$lib/tdm/engine';
  import { advancedDefaults, advancedFields, advancedDerivative, interactionFactor, advancedExpressions, advancedGraphValid } from '$lib/lego/advanced.js';
  import { ddiMechanisms } from '$lib/tdm/workbenches.js';
  import { parseModelCode } from '$lib/lego/mlxtran.js';
  import { legoSimulationConfig } from '$lib/sim/lego.js';
  $: copy = ui($language);
  /** @type {'pk' | 'advanced' | 'translator'} */
  export let profile = 'advanced';
  $: workshopTitle = profile === 'pk' ? 'PK' : profile === 'translator' ? 'Translator' : 'Advanced';
  $: availableKinds = profile === 'pk' ? pkKinds : order;

  const LEGO_UI = {
    fr: {
      lede: "Construisez n'importe quel modèle : ajoutez des compartiments et reliez-les par des flèches (constantes de transfert). Transit en chaîne, périphériques multiples, métabolite, blocs PD… sans bibliothèque figée.",
      kinds: { depot: 'Dépôt', transit: 'Transit', central: 'Central', periph: 'Périph.', metab: 'Métabolite', effect: 'Effet (ke0)', response: 'Réponse', tumor: 'TGI', interaction: 'Interaction' },
      add: 'Ajouter', arrow: 'Flèche', templates: 'Modèles types', clickSource: 'Cliquez la source…', clickTarget: 'Cliquez la cible…', connect: 'Relier deux compartiments',
      parentMetabolite: 'Parent/métabolite', clear: 'Effacer', duration: 'Durée (h)', editorAria: 'Éditeur de modèle compartimental', eliminationShort: 'élim.',
      emptyCanvas: 'Ajoutez un compartiment, ou choisissez un modèle type ci-dessus.', chartAria: 'Simulation du modèle et comparaison des covariables', time: 'Temps (h)', legendAria: 'Légende des courbes',
      reference: 'référence', rescaled: 'rééch.', name: 'Nom', source: 'Source', addElimination: 'Ajouter une élimination', remove: 'Supprimer',
      editorTip: "Cliquez un compartiment pour l'éditer (nom, volume, dose…), puis glissez-le pour le déplacer.", transferRates: 'Flux de transfert', rateAria: 'Paramètre de transfert', to: 'vers',
      covariates: 'Covariables', addContinuousAria: 'Ajouter une covariable continue', addCategoricalAria: 'Ajouter une covariable catégorielle', continuous: 'Continue', categorical: 'Catégorielle',
      covariateHelp: "Continue : P = TV × (COV/réf)^β. Catégorielle : P = TV × exp(β) pour la modalité comparée. Une même covariable peut cibler plusieurs paramètres, avec un β propre à chacun. Une covariable d'administration peut changer à chaque dose dans le TDM.", type: 'Type', targetParameter: 'Paramètre cible', addTargetParameter: 'Ajouter un effet', covariateDefinition: 'Définition de la covariable', covariateEffects: 'Effets sur les paramètres', duplicateCovariateName: 'Ce nom est déjà utilisé par une autre covariable.',
      categoryReference: 'Modalité réf.', referenceValue: 'Référence', categoryComparison: 'Modalité comparée', comparisonValue: 'Valeur comparée', compareCurve: 'Comparer sur la courbe',
      inputSettings: 'Administration dans ce compartiment', inputType: "Type d'entrée", bolusInput: 'Bolus / entrée instantanée', zeroOrderInput: "Entrée d'ordre zéro", inputDuration: "Durée d'entrée (h)", lagTime: 'Délai Tlag (h)', doseFraction: 'Fraction de dose (%)',
      inputHelp: "Plusieurs compartiments dosés créent des voies parallèles. Les fractions s'appliquent à une même dose et doivent totaliser 100 %. Reliez les compartiments en chaîne pour une absorption séquentielle.",
      complementaryFraction: 'Complément de la fraction', independentFraction: 'Fraction indépendante', durationLinked: 'Durée égale au Tlag de', independentDuration: 'Durée indépendante',
      kinetics: 'Cinétique', firstOrder: 'Premier ordre', michaelisMenten: 'Michaelis-Menten', hill: 'Saturable de Hill', eliminationParameter: "Paramètre d'élimination", transferParameter: 'Paramètre de transfert', rateConstant: 'Constante k', clearance: 'Clairance CL', intercompartmentalClearance: 'Clairance Q', clickArrow: 'Cliquer pour modifier ce flux',
      covariateScope: 'Moment de mesure', patientCovariate: 'Patient / prélèvement', administrationCovariate: 'Administration / occasion',
      populationModel: 'Modèle populationnel', populationHelp: "Activez les effets aléatoires puis renseignez Ω. Les termes hors diagonale sont des covariances ; la matrice doit être positive.", randomEffects: 'Effets aléatoires', variance: 'Variance', covarianceMatrix: 'Matrice variance-covariance Ω', residualError: 'Erreur résiduelle', additive: 'Additive', proportional: 'Proportionnelle', combined: 'Combinée', standardDeviation: 'Écart-type', invalidOmega: "La matrice Ω n'est pas positive. Réduisez les covariances.",
      dualAbsorption: 'Double absorption', koka: 'KOKA (Samtani)', pp6m: "PP6M (T'jollyn)", tdmMultiRoute: "Le pont TDM accepte aussi les voies parallèles; une dose est répartie automatiquement selon les fractions.",
      kokaNote: "Structure d'absorption KOKA : f2 entre directement dans le central par un processus d'ordre zéro; 1−f2 entre dans le dépôt après Tlag1, avec D2 = Tlag1. L'IOV aléatoire publiée doit être codée dans le logiciel d'estimation selon la définition des occasions.",
      pp6mNote: "Structure PP6M : deux dépôts parallèles avec absorption saturable dépendante de la quantité. Les valeurs proposées sont exprimées en mg, mg/h et litres.",
      emptyEquations: '(ajoutez des compartiments)'
    },
    en: {
      lede: 'Build any model: add compartments and connect them with arrows (transfer rate constants). Transit chains, multiple peripheral compartments, metabolites and PD blocks are not restricted to a fixed library.',
      kinds: { depot: 'Depot', transit: 'Transit', central: 'Central', periph: 'Peripheral', metab: 'Metabolite', effect: 'Effect (ke0)', response: 'Response', tumor: 'TGI', interaction: 'Interaction' },
      add: 'Add', arrow: 'Arrow', templates: 'Templates', clickSource: 'Select the source…', clickTarget: 'Select the target…', connect: 'Connect two compartments',
      parentMetabolite: 'Parent/metabolite', clear: 'Clear', duration: 'Duration (h)', editorAria: 'Compartmental model editor', eliminationShort: 'elim.',
      emptyCanvas: 'Add a compartment or choose a template above.', chartAria: 'Model simulation and covariate comparison', time: 'Time (h)', legendAria: 'Curve legend',
      reference: 'reference', rescaled: 'rescaled', name: 'Name', source: 'Source', addElimination: 'Add elimination', remove: 'Remove',
      editorTip: 'Select a compartment to edit its name, volume or dose, then drag it to reposition it.', transferRates: 'Transfer flows', rateAria: 'Transfer parameter', to: 'to',
      covariates: 'Covariates', addContinuousAria: 'Add a continuous covariate', addCategoricalAria: 'Add a categorical covariate', continuous: 'Continuous', categorical: 'Categorical',
      covariateHelp: 'Continuous: P = TV × (COV/ref)^β. Categorical: P = TV × exp(β) for the compared category. One covariate can target several parameters, with a separate β for each. An administration covariate can change at each dose in TDM.', type: 'Type', targetParameter: 'Target parameter', addTargetParameter: 'Add effect', covariateDefinition: 'Covariate definition', covariateEffects: 'Parameter effects', duplicateCovariateName: 'This name is already used by another covariate.',
      categoryReference: 'Reference category', referenceValue: 'Reference', categoryComparison: 'Compared category', comparisonValue: 'Compared value', compareCurve: 'Compare on chart',
      inputSettings: 'Administration into this compartment', inputType: 'Input type', bolusInput: 'Bolus / instantaneous input', zeroOrderInput: 'Zero-order input', inputDuration: 'Input duration (h)', lagTime: 'Tlag (h)', doseFraction: 'Dose fraction (%)',
      inputHelp: 'Multiple dosed compartments create parallel pathways. Fractions apply to one common dose and must total 100%. Connect compartments in a chain for sequential absorption.',
      complementaryFraction: 'Complement of fraction', independentFraction: 'Independent fraction', durationLinked: 'Duration equals Tlag of', independentDuration: 'Independent duration',
      kinetics: 'Kinetics', firstOrder: 'First order', michaelisMenten: 'Michaelis-Menten', hill: 'Saturable Hill', eliminationParameter: 'Elimination parameter', transferParameter: 'Transfer parameter', rateConstant: 'Rate constant k', clearance: 'Clearance CL', intercompartmentalClearance: 'Clearance Q', clickArrow: 'Click to edit this flow',
      covariateScope: 'Measurement time', patientCovariate: 'Patient / sample', administrationCovariate: 'Administration / occasion',
      populationModel: 'Population model', populationHelp: 'Enable random effects, then enter Ω. Off-diagonal terms are covariances; the matrix must be positive.', randomEffects: 'Random effects', variance: 'Variance', covarianceMatrix: 'Variance-covariance matrix Ω', residualError: 'Residual error', additive: 'Additive', proportional: 'Proportional', combined: 'Combined', standardDeviation: 'Standard deviation', invalidOmega: 'The Ω matrix is not positive. Reduce the covariances.',
      dualAbsorption: 'Dual absorption', koka: 'KOKA (Samtani)', pp6m: "PP6M (T'jollyn)", tdmMultiRoute: 'The TDM bridge also accepts parallel pathways; one dose is automatically split according to the fractions.',
      kokaNote: 'KOKA absorption structure: f2 enters the central compartment directly by a zero-order process; 1−f2 enters the depot after Tlag1, with D2 = Tlag1. The published random IOV must be coded in the estimation software according to the occasion definition.',
      pp6mNote: 'PP6M structure: two parallel depots with amount-dependent saturable absorption. Suggested values use mg, mg/h and litres.',
      emptyEquations: '(add compartments)'
    }
  };
  const MODEL_IMPORT_UI = {
    fr: {
      importModel: 'Importer un modèle', modelCode: 'Code du modèle', placeholder: 'Collez le code MLXTRAN, mrgsolve ou NONMEM…',
      modelFile: 'Choisir un fichier modèle', format: 'Format source', applyImport: 'Construire le schéma', importExact: 'Modèle Lego restauré exactement.',
      importRecognized: 'Structure reconnue et convertie en schéma Lego.', importWarnings: 'Points à vérifier',
      errors: { emptyOrTooLarge: 'Le code est vide ou dépasse 200 ko.', invalidEmbeddedSpec: 'La spécification Lego embarquée est invalide.', unsupportedStructure: "Aucune structure PK compatible n'a été reconnue dans ce format." },
      warnings: { populationDefaults: 'Valeurs populationnelles absentes ou incomplètes : valeurs initiales proposées pour', multipleAdministrations: "Plusieurs identifiants d'administration détectés; seule la voie adm retenue est", bioavailabilityNotTransferred: "La biodisponibilité d'une voie unique ne peut pas encore être représentée et doit être vérifiée.", covariateTargetNotMapped: 'Effet de covariable non rattaché au schéma', categoricalCollapsed: 'Covariable à plus de deux modalités réduite à la première comparaison', categoricalLabelsMapped: 'Modalités textuelles remplacées par 0 et 1 pour', covariateFormApproximated: 'Forme de covariable approchée localement par une relation puissance pour', templatePlaceholdersIgnored: 'Les blocs de gabarit {{…}} ne sont pas exécutables et ont été ignorés.', customOdeReview: 'Des EDO personnalisées sont présentes : vérifiez le schéma reconstruit avant export.' }
    },
    en: {
      importModel: 'Import a model', modelCode: 'Model code', placeholder: 'Paste MLXTRAN, mrgsolve, or NONMEM code…',
      modelFile: 'Choose a model file', format: 'Source format', applyImport: 'Build the diagram', importExact: 'Lego model restored exactly.',
      importRecognized: 'Structure recognized and converted into a Lego diagram.', importWarnings: 'Items to review',
      errors: { emptyOrTooLarge: 'The code is empty or larger than 200 kB.', invalidEmbeddedSpec: 'The embedded Lego specification is invalid.', unsupportedStructure: 'No compatible PK structure was recognized in this format.' },
      warnings: { populationDefaults: 'Population values were absent or incomplete; suggested initial values were used for', multipleAdministrations: 'Several administration identifiers were detected; the retained adm route is', bioavailabilityNotTransferred: 'Single-route bioavailability cannot yet be represented and must be reviewed.', covariateTargetNotMapped: 'Covariate effect could not be mapped to the diagram', categoricalCollapsed: 'Covariate with more than two categories reduced to the first comparison', categoricalLabelsMapped: 'Text categories replaced with 0 and 1 for', covariateFormApproximated: 'Covariate form locally approximated by a power relationship for', templatePlaceholdersIgnored: 'Template blocks {{…}} are not executable and were ignored.', customOdeReview: 'Custom ODEs are present: review the reconstructed diagram before export.' }
    }
  };
  $: lego = LEGO_UI[$language === 'en' ? 'en' : 'fr'];
  Object.assign(MODEL_IMPORT_UI.fr.errors, {
    unsupportedEquation: "L'importeur Lego ne prend pas encore en charge une équation ou une condition de ce modèle. Cela ne signifie pas que le code source est invalide. Le schéma précédent est conservé ; aucune conversion partielle n'est appliquée. Consultez le détail ci-dessous et utilisez le logiciel du format source pour ce modèle.",
    unsupportedAdministration: "Cette biodisponibilité ou cette logique d'administration n'est pas encore représentable dans Lego. Le schéma précédent est conservé. Utilisez le logiciel du format source pour ce modèle."
  });
  Object.assign(MODEL_IMPORT_UI.en.errors, {
    unsupportedEquation: 'The Lego importer does not yet support an equation or condition in this model. This does not mean the source code is invalid. The previous diagram is retained; no partial conversion is applied. Review the detail below and use the software for the source format for this model.',
    unsupportedAdministration: 'This bioavailability or administration logic cannot yet be represented in Lego. The previous diagram is retained. Use the software for the source format for this model.'
  });
  Object.assign(MODEL_IMPORT_UI.fr.warnings, {
    populationDefaults: 'Paramètres absents initialisés à 1, à remplacer par vos estimations avant simulation :',
    populationGraph: "Structure populationnelle : les effets aléatoires, l'erreur résiduelle, les changements de covariables dans le temps et les unités de sortie ne sont pas importés. Vérifiez-les dans le logiciel d'estimation.",
    derivedParameters: 'Paramètres dérivés : les coefficients de covariables sur Km dépendent du Hill importé. Si Hill change, ces coefficients doivent être recalculés ou le code original réimporté.'
  });
  Object.assign(MODEL_IMPORT_UI.en.warnings, {
    populationDefaults: 'Missing parameters initialized to 1; replace with your estimates before simulation:',
    populationGraph: 'Population structure: random effects, residual error, time-varying covariates and output units are not imported. Review these in the estimation software.',
    derivedParameters: 'Derived parameters: covariate coefficients on Km depend on the imported Hill value. If Hill changes, recalculate these coefficients or reimport the original code.'
  });
  $: importUi = MODEL_IMPORT_UI[$language === 'en' ? 'en' : 'fr'];

  /** @typedef {{id:number, kind:string, name:string, x:number, y:number, vol?:number, dose?:number, inputType?:'bolus'|'zero_order', inputDuration?:number, inputDurationTlagOf?:number, tlag?:number, doseFraction?:number, fractionComplementOf?:number, ke0?:number, kin?:number, kout?:number, smax?:number, sc50?:number, source?:number, growth?:string, t0?:number, kg?:number, cap?:number, kill?:number, ec50?:number, res?:number, mechanism?:string, factor?:number, strength?:number, c50?:number, hill?:number, kdeg?:number, kinact?:number, targetFrom?:number, targetTo?:number|'OUT'}} Node */
  /** @typedef {{id:number, from:number, to:number|'OUT', k:number, kinetics?:'first_order'|'michaelis_menten'|'hill', vmax?:number, km?:number, gamma?:number, eliminationParameterization?:'rate'|'clearance', cl?:number, transferParameterization?:'rate'|'clearance', q?:number}} Edge */
  /** @typedef {{id:number, name:string, type:'continuous'|'categorical', scope?:'patient'|'administration', target:string, reference:number, comparison:number, beta:number, compare:boolean}} Covariate */

  /** @type {Record<string, {color:string, vol:boolean, plot:boolean, special?:string}>} */
  const KINDS = {
    depot:    { color: '#2a4b7c', vol: false, plot: false },
    transit:  { color: '#4f6f8f', vol: false, plot: false },
    central:  { color: '#b85c38', vol: true,  plot: true },
    periph:   { color: '#4a5d23', vol: true,  plot: false },
    metab:    { color: '#9c4f6a', vol: true,  plot: true },
    effect:   { color: '#7a8084', vol: false, plot: true, special: 'effect' },
    tumor: { color: '#11756c', vol: false, plot: true, special: 'tumor' },
    interaction: { color: '#9c4160', vol: false, plot: true, special: 'interaction' },
    response: { color: '#5b8c3a', vol: false, plot: true, special: 'turnover' }
  };
  const kindLabel = (/** @type {string} */ kind) => /** @type {Record<string, string>} */ (lego.kinds)[kind] ?? kind;
  const order = ['depot', 'transit', 'central', 'periph', 'metab', 'effect', 'response', 'tumor', 'interaction'];
  const isMassNode = (/** @type {Node} */ node) => !['effect', 'response', 'tumor', 'interaction'].includes(node.kind);

  let uid = 1;
  /** @type {Node[]} */
  let nodes = [];
  /** @type {Edge[]} */
  let edges = [];
  /** @type {Covariate[]} */
  let covariates = [];
  /** @type {Record<string, number>} */
  let iivVariances = {};
  /** @type {Record<string, number>} */
  let iivCovariances = {};
  let residualError = { type: 'combined', additive: 0.1, proportional: 0.2 };
  let mode = 'select'; // 'select' | 'connect'
  /** @type {number|null} */ let selectedId = null;
  /** @type {number|null} */ let connectFrom = null;
  let tMax = 24;
  let activePreset = '';
  let importFormat = 'mlxtran';
  let importText = '';
  /** @type {{kind:'ok'|'error', format?:string, mode?:string, warnings?:{code:string, detail?:string}[], code?:string, detail?:string}|null} */
  let modelImportStatus = null;
  let mounted = false;
  let stopTransfer = () => {};
  let handoffRoute = '';
  let handoffSide = '1';
  $: purePk = isPkDiagram({ nodes });
  $: massOnly = nodes.length > 0 && nodes.every(isMassNode);

  function snapshot() {
    return { nodes, edges, covariates, iivVariances, iivCovariances, residualError, uid, tMax, activePreset, selectedId, codeTab, importText, importFormat, modelImportStatus, handoffRoute };
  }

  onMount(() => {
    const draft = takeDraft(`incoming:${profile}`) ?? readDraft(`diagram:${profile}`);
    if (draft) {
      ({ nodes, edges, covariates, uid, tMax, activePreset, selectedId, codeTab, importText, importFormat, modelImportStatus, handoffRoute } = draft);
      iivVariances = draft.iivVariances ?? {};
      iivCovariances = draft.iivCovariances ?? {};
      residualError = draft.residualError ?? residualError;
    } else if (profile === 'pk') preset('oral1');
    if (profile === 'translator') {
      const source = takeDraft('source:translator');
      if (source) { importText = source.code; importFormat = 'mrgsolve'; modelImportStatus = null; }
    }
    mounted = true;
  });
  onDestroy(() => {
    stopTransfer();
    clearTimeout(copyTimer);
    if (mounted) writeDraft(`diagram:${profile}`, snapshot());
  });

  /** @param {'pk'|'advanced'|'pd'|'ddi'|'simulation'} destination */
  function continueIn(destination) {
    if (!tdmReady || (destination === 'pk' && !purePk)) return;
    if (destination === 'simulation') {
      if (!simulationConfig) return;
      writeDraft('incoming:simulation', simulationConfig);
      goto(`${base}/playground/`);
      return;
    }
    if (['pd', 'ddi'].includes(destination) && !massOnly) return;
    if (['pd', 'ddi'].includes(destination) && !['IV', 'Oral'].includes(handoffRoute)) return;
    if (destination === 'pk' || destination === 'advanced') {
      writeDraft(`incoming:${destination}`, snapshot());
    } else {
      writeDraft(`incoming:${destination}:pk`, {
        side: handoffSide,
        model: { source: 'code', id: '', code: codeMrgsolve, route: handoffRoute, time_unit: 'h', concentration_scale: 1 }
      });
    }
    goto(`${base}/${destination}/`);
  }

  const VBW = 620, VBH = 320, NW = 88, NH = 42;

  function firstPlotSource() {
    const c = nodes.find((n) => n.kind === 'central') ?? nodes.find((n) => KINDS[n.kind].vol);
    return c ? c.id : (nodes[0]?.id ?? 0);
  }
  /** @param {any} spec */
  function applyLaboratory(spec) {
    hydrateLegoSpec(legoSpec(spec.lab, spec.parameters));
    handoffRoute = spec.lab === 'absorption' ? 'Oral' : 'IV';
  }
  /** @param {string} kind */
  function defaultName(kind) {
    const n = nodes.filter((x) => x.kind === kind).length + 1;
    return { depot: 'depot', transit: 'T' + n, central: 'centr', periph: 'p' + n, metab: 'met', effect: 'Ce', response: 'R', tumor: 'TGI', interaction: 'DDI' }[kind] ?? kind + n;
  }
  /** @param {string} kind */
  function addNode(kind) {
    const i = nodes.length;
    /** @type {Node} */
    const n = { id: uid++, kind, name: defaultName(kind), x: 40 + (i % 5) * 116, y: 40 + Math.floor(i / 5) * 100 };
    if (KINDS[kind].vol) n.vol = kind === 'central' ? 30 : kind === 'metab' ? 20 : 40;
    if (isMassNode(n)) {
      n.dose = kind === 'depot' ? 100 : 0;
      n.inputType = 'bolus';
      n.inputDuration = 1;
      n.tlag = 0;
      n.doseFraction = 100;
    }
    if (kind === 'effect') { n.ke0 = 0.4; n.source = firstPlotSource(); }
    if (kind === 'response') { n.kin = 10; n.kout = 0.15; n.smax = 3; n.sc50 = 3; n.source = firstPlotSource(); }
    if (kind === 'tumor' || kind === 'interaction') {
      Object.assign(n, advancedDefaults[kind], { source: firstPlotSource() });
      if (kind === 'interaction') {
        const target = edges.find(e => e.to === 'OUT') ?? edges[0];
        n.targetFrom = target?.from; n.targetTo = target?.to;
      }
    }
    nodes = [...nodes, n];
    selectedId = n.id;
  }
  /** @param {number} id */
  function deleteNode(id) {
    nodes = nodes.filter((n) => n.id !== id);
    edges = edges.filter((e) => e.from !== id && e.to !== id);
    nodes = nodes.map((n) => ({
      ...n,
      source: n.source === id ? undefined : n.source,
      fractionComplementOf: n.fractionComplementOf === id ? undefined : n.fractionComplementOf,
      inputDurationTlagOf: n.inputDurationTlagOf === id ? undefined : n.inputDurationTlagOf
    }));
    reconcileCovariates();
    if (selectedId === id) selectedId = null;
  }
  /** @param {number} id */
  function nodeClick(id) {
    if (mode === 'connect') {
      if (connectFrom === null) connectFrom = id;
      else {
        const source = nodes.find(n => n.id === connectFrom), target = nodes.find(n => n.id === id);
        if (source && target && source.id !== target.id) {
          if (!isMassNode(target) && (KINDS[source.kind].vol || source.kind === 'effect')) {
            target.source = source.id; nodes = [...nodes];
          } else if (isMassNode(source) && isMassNode(target) && !edges.some(e => e.from === source.id && e.to === target.id)) {
            edges = [...edges, { id: uid++, from: source.id, to: target.id, k: 0.5, kinetics: 'first_order' }];
          }
          selectedId = target.id;
        }
        reconcileCovariates();
        connectFrom = null; mode = 'select';
      }
    } else selectedId = id;
  }
  /** @param {number} id */
  function addElim(id) {
    if (edges.some(e => e.from === id && e.to === 'OUT')) return;
    edges = [...edges, { id: uid++, from: id, to: 'OUT', k: 0.2, kinetics: 'first_order', eliminationParameterization: 'rate', cl: 5 }];
    reconcileCovariates();
  }
  /** @param {number} id */
  function deleteEdge(id) {
    edges = edges.filter((e) => e.id !== id);
    reconcileCovariates();
  }
  function updateEdge(/** @type {Edge} */ edge) {
    if (['michaelis_menten', 'hill'].includes(edgeKinetics(edge))) {
      edge.vmax = Number(edge.vmax ?? 10);
      edge.km = Number(edge.km ?? 10);
      if (edgeKinetics(edge) === 'hill') edge.gamma = Number(edge.gamma ?? 1);
    }
    if (eliminationParameterization(edge) === 'clearance') edge.cl = Number(edge.cl ?? 5);
    if (transferParameterization(edge) === 'clearance') setTransferClearance(edge, Number(edge.q ?? defaultTransferClearance(edge)));
    edges = [...edges];
    reconcileCovariates();
  }
  function clearAll() { nodes = []; edges = []; covariates = []; selectedId = null; activePreset = ''; }

  function importWarningText(/** @type {{code:string, detail?:string}} */ warning) {
    const messages = /** @type {Record<string, string>} */ (importUi.warnings);
    const base = messages[warning.code] ?? warning.code;
    return warning.detail ? `${base} : ${warning.detail}` : base;
  }

  function hydrateLegoSpec(/** @type {any} */ specification) {
    if (!Array.isArray(specification?.nodes) || !specification.nodes.length || specification.nodes.length > 20) throw new Error('unsupportedStructure');
    const importedNodes = specification.nodes.map((/** @type {any} */ node, /** @type {number} */ index) => {
      if (!KINDS[node.kind]) throw new Error('unsupportedStructure');
      const id = Number(node.id);
      if (!Number.isInteger(id) || id <= 0) throw new Error('unsupportedStructure');
      const hydrated = {
        ...(node.kind === 'tumor' ? advancedDefaults.tumor : node.kind === 'interaction' ? advancedDefaults.interaction : {}),
        ...node, id, name: rid(node.name),
        x: Number.isFinite(Number(node.x)) ? Number(node.x) : 35 + (index % 5) * 116,
        y: Number.isFinite(Number(node.y)) ? Number(node.y) : 45 + Math.floor(index / 5) * 92
      };
      if (isMassNode(hydrated)) {
        hydrated.dose = Number(node.dose ?? 0);
        hydrated.inputType = node.inputType === 'zero_order' ? 'zero_order' : 'bolus';
        hydrated.inputDuration = Number(node.inputDuration ?? 1);
        hydrated.tlag = Number(node.tlag ?? 0);
        hydrated.doseFraction = Number(node.doseFraction ?? 100);
      }
      if (KINDS[node.kind].vol) hydrated.vol = Number(node.vol ?? 1);
      return hydrated;
    });
    const ids = new Set(importedNodes.map((/** @type {any} */ node) => node.id));
    if (ids.size !== importedNodes.length) throw new Error('unsupportedStructure');
    let next = Math.max(...ids) + 1;
    const importedEdges = (specification.edges ?? []).map((/** @type {any} */ edge) => {
      const from = Number(edge.from);
      const to = edge.to === 'OUT' ? 'OUT' : Number(edge.to);
      if (!ids.has(from) || (to !== 'OUT' && !ids.has(to))) throw new Error('unsupportedStructure');
      return {
        ...edge, id: next++, from, to,
        kinetics: ['michaelis_menten', 'hill'].includes(edge.kinetics) ? edge.kinetics : 'first_order',
        k: Number(edge.k ?? 0.2), vmax: Number(edge.vmax ?? 10), km: Number(edge.km ?? 10), gamma: Number(edge.gamma ?? 1),
        eliminationParameterization: edge.eliminationParameterization === 'clearance' ? 'clearance' : 'rate', cl: Number(edge.cl ?? 5),
        transferParameterization: edge.transferParameterization === 'clearance' ? 'clearance' : 'rate', q: Number(edge.q ?? 5)
      };
    });
    if (!Array.isArray(specification.covariates ?? []) || (specification.covariates?.length ?? 0) > 50) throw new Error('unsupportedStructure');
    const importedCovariates = (specification.covariates ?? []).map((/** @type {any} */ covariate) => ({
      ...covariate, id: next++, type: covariate.type === 'categorical' ? 'categorical' : 'continuous',
      scope: covariate.scope === 'administration' ? 'administration' : 'patient',
      reference: Number(covariate.reference), comparison: Number(covariate.comparison), beta: Number(covariate.beta), compare: covariate.compare !== false
    }));
    if (!advancedGraphValid(importedNodes, importedEdges)) throw new Error('unsupportedStructure');
    nodes = importedNodes;
    edges = importedEdges;
    covariates = importedCovariates;
    iivVariances = specification.population?.iivVariances ?? {};
    iivCovariances = specification.population?.iivCovariances ?? {};
    residualError = specification.population?.residualError ?? { type: 'combined', additive: 0.1, proportional: 0.2 };
    uid = next;
    selectedId = nodes[0]?.id ?? null;
    activePreset = ['oral1', 'iv2', 'transit', 'metab', 'effect', 'dual', 'koka', 'pp6m', 'tgi', 'autoinhibition'].includes(specification.simulation?.preset) ? specification.simulation.preset : '';
    const horizon = Number(specification.simulation?.horizon);
    if (Number.isFinite(horizon) && horizon >= 1) tMax = horizon;
    reconcileCovariates();
  }

  function importerModel() {
    try {
      const result = parseModelCode(importText, importFormat);
      hydrateLegoSpec(result.spec);
      handoffRoute = '';
      codeTab = importFormat;
      modelImportStatus = { kind: 'ok', format: importFormat, mode: result.mode, warnings: result.warnings };
    } catch (error) {
      const failure = /** @type {any} */ (error);
      modelImportStatus = { kind: 'error', format: importFormat, code: failure?.code ?? failure?.message ?? 'unsupportedStructure', detail: failure?.detail };
    }
  }

  async function lireFichierModele(/** @type {Event} */ event) {
    const input = /** @type {HTMLInputElement} */ (event.currentTarget);
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 200000) {
      modelImportStatus = { kind: 'error', format: importFormat, code: 'emptyOrTooLarge' };
      return;
    }
    importText = await file.text();
    importerModel();
    input.value = '';
  }

  // ── presets (points de départ, entièrement modifiables ensuite) ──
  /** @param {string} name */
  function preset(name) {
    clearAll();
    handoffRoute = ['iv2', 'metab', 'effect'].includes(name) ? 'IV' : ['oral1', 'transit', 'dual'].includes(name) ? 'Oral' : '';
    tMax = name === 'koka' ? 1500 : name === 'pp6m' ? 5000 : 24;
    const mk = (/** @type {string} */ kind, /** @type {number} */ x, /** @type {number} */ y, /** @type {any} */ extra = {}) => {
      const n = { id: uid++, kind, name: defaultName(kind), x, y, ...extra };
      if (KINDS[kind].vol && n.vol === undefined) n.vol = kind === 'central' ? 30 : 40;
      if (isMassNode(n)) {
        n.dose ??= 0;
        n.inputType ??= 'bolus';
        n.inputDuration ??= 1;
        n.tlag ??= 0;
        n.doseFraction ??= 100;
      }
      nodes = [...nodes, n];
      return n.id;
    };
    if (name === 'oral1') {
      const d = mk('depot', 40, 140, { dose: 100 }); const c = mk('central', 260, 140, { vol: 30 });
      edges = [{ id: uid++, from: d, to: c, k: 1.0 }, { id: uid++, from: c, to: 'OUT', k: 0.17 }];
    } else if (name === 'iv2') {
      const c = mk('central', 200, 140, { vol: 30, dose: 100 }); const p = mk('periph', 420, 140, { vol: 60 });
      edges = [{ id: uid++, from: c, to: p, k: 0.3 }, { id: uid++, from: p, to: c, k: 0.15 }, { id: uid++, from: c, to: 'OUT', k: 0.17 }];
    } else if (name === 'transit') {
      const t1 = mk('transit', 30, 140), t2 = mk('transit', 150, 140), t3 = mk('transit', 270, 140), c = mk('central', 420, 140, { vol: 30 });
      nodes = nodes.map((n) => (n.id === t1 ? { ...n, dose: 100 } : n));
      edges = [{ id: uid++, from: t1, to: t2, k: 1.5 }, { id: uid++, from: t2, to: t3, k: 1.5 }, { id: uid++, from: t3, to: c, k: 1.5 }, { id: uid++, from: c, to: 'OUT', k: 0.17 }];
    } else if (name === 'metab') {
      const c = mk('central', 180, 140, { vol: 30, dose: 100 }); const m = mk('metab', 420, 140, { vol: 20 });
      edges = [{ id: uid++, from: c, to: m, k: 0.12 }, { id: uid++, from: c, to: 'OUT', k: 0.1 }, { id: uid++, from: m, to: 'OUT', k: 0.05 }];
    } else if (name === 'effect') {
      const c = mk('central', 160, 90, { vol: 30, dose: 100 }); mk('effect', 400, 200, { ke0: 0.4, source: c });
      edges = [{ id: uid++, from: c, to: 'OUT', k: 0.2 }];
    } else if (name === 'tgi' || name === 'autoinhibition') {
      const c = mk('central', 90, 80, { name: 'CENT', vol: 30, dose: 100 });
      const ce = mk('effect', 270, 80, { name: 'Ce', ke0: 0.2, source: c });
      mk('tumor', 460, 80, { name: 'TGI', ...advancedDefaults.tumor, growth: 'gompertz', source: ce });
      edges = [{ id: uid++, from: c, to: 'OUT', k: 0.05, eliminationParameterization: 'clearance', cl: 1.5 }];
      if (name === 'autoinhibition') mk('interaction', 270, 220, { name: 'DDI', ...advancedDefaults.interaction, mechanism: 'tdi', source: c, targetFrom: c, targetTo: 'OUT' });
      tMax = 168; handoffRoute = 'IV';
    } else if (name === 'dual') {
      const rapid = mk('depot', 30, 80, { name: 'rapid', dose: 100, inputType: 'zero_order', inputDuration: 1.5, doseFraction: 30 });
      const slow = mk('depot', 30, 210, { name: 'slow', dose: 100, inputType: 'bolus', tlag: 1.5, doseFraction: 70 });
      const c = mk('central', 330, 140, { vol: 30 });
      edges = [
        { id: uid++, from: rapid, to: c, k: 2, kinetics: 'first_order' },
        { id: uid++, from: slow, to: c, k: 0.35, kinetics: 'first_order' },
        { id: uid++, from: c, to: 'OUT', k: 0.17, kinetics: 'first_order', eliminationParameterization: 'clearance', cl: 5.1 }
      ];
    } else if (name === 'koka') {
      const central = mk('central', 330, 140, { name: 'central', vol: 391, dose: 100, inputType: 'zero_order', inputDuration: 319, doseFraction: 16.8 });
      const slow = mk('depot', 50, 210, { name: 'slow', dose: 100, inputType: 'bolus', tlag: 319, doseFraction: 83.2, fractionComplementOf: central });
      nodes = nodes.map((node) => node.id === central ? { ...node, inputDurationTlagOf: slow } : node);
      edges = [
        { id: uid++, from: slow, to: central, k: 0.000488, kinetics: 'first_order' },
        { id: uid++, from: central, to: 'OUT', k: 0.005, kinetics: 'first_order', eliminationParameterization: 'clearance', cl: 4.95 }
      ];
    } else if (name === 'pp6m') {
      const slow = mk('depot', 35, 80, { name: 'slow', dose: 1000, doseFraction: 79.1 });
      const rapid = mk('depot', 35, 220, { name: 'rapid', dose: 1000, doseFraction: 20.9, fractionComplementOf: slow });
      const central = mk('central', 350, 140, { name: 'central', vol: 1960 });
      edges = [
        { id: uid++, from: slow, to: central, k: 0.1, kinetics: 'hill', vmax: 0.0904, km: 120, gamma: 1.44 },
        { id: uid++, from: rapid, to: central, k: 0.1, kinetics: 'hill', vmax: 0.149, km: 23.8, gamma: 1 },
        { id: uid++, from: central, to: 'OUT', k: 0.002, kinetics: 'first_order', eliminationParameterization: 'clearance', cl: 3.9 }
      ];
    }
    activePreset = name;
    selectedId = null;
  }

  // ── drag ──
  /** @type {SVGSVGElement} */ let svgEl;
  let dragId = /** @type {number|null} */ (null);
  let dragOff = { x: 0, y: 0 };
  /** @param {PointerEvent} e */
  function toSvg(e) {
    const r = svgEl.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * VBW, y: ((e.clientY - r.top) / r.height) * VBH };
  }
  /** @param {PointerEvent} e @param {Node} n */
  function startDrag(e, n) {
    if (mode === 'connect') return;
    const p = toSvg(e); dragId = n.id; dragOff = { x: p.x - n.x, y: p.y - n.y };
    /** @type {Element} */ (e.target).setPointerCapture?.(e.pointerId);
  }
  /** @param {PointerEvent} e */
  function moveDrag(e) {
    if (dragId === null) return;
    const p = toSvg(e);
    nodes = nodes.map((n) => (n.id === dragId ? { ...n, x: Math.max(0, Math.min(VBW - NW, p.x - dragOff.x)), y: Math.max(0, Math.min(VBH - NH, p.y - dragOff.y)) } : n));
  }
  function endDrag() { dragId = null; }

  $: selected = nodes.find((n) => n.id === selectedId) ?? null;
  const concSources = () => nodes.filter((n) => KINDS[n.kind].vol);
  const SCENARIO_COLORS = ['#2a4b7c', '#4a5d23', '#9c4f6a', '#b85c38', '#59636e', '#7b5b2e'];

  // ── simulation (RK4) ──
  function covariateType(/** @type {Covariate} */ covariate) {
    return covariate.type === 'categorical' ? 'categorical' : 'continuous';
  }

  function covariateFactor(/** @type {Covariate} */ covariate, /** @type {number} */ value) {
    if (covariateType(covariate) === 'categorical') {
      return value === Number(covariate.comparison) ? Math.exp(Number(covariate.beta)) : 1;
    }
    return Math.pow(value / Number(covariate.reference), Number(covariate.beta));
  }

  function uniqueCovariates(/** @type {Covariate[]} */ items) {
    return items.filter((item, index) => items.findIndex((candidate) => covariateName(candidate.name) === covariateName(item.name)) === index);
  }

  const dosedNodes = (currentNodes = nodes) => currentNodes.filter((node) => isMassNode(node) && Number(node.dose ?? 0) > 0);
  const linkedNode = (/** @type {Node[]} */ currentNodes, /** @type {number|undefined} */ id) => currentNodes.find((node) => node.id === id);
  const doseFractionValue = (/** @type {Node} */ node, currentNodes = nodes) => {
    const source = linkedNode(currentNodes, node.fractionComplementOf);
    return source ? 100 - Number(source.doseFraction ?? 100) : Number(node.doseFraction ?? 100);
  };
  const fractionParameterName = (/** @type {Node} */ node, currentNodes = nodes) => {
    const source = linkedNode(currentNodes, node.fractionComplementOf);
    return `f_${rid((source ?? node).name)}`;
  };
  const doseFractionExpression = (/** @type {Node} */ node, currentNodes = nodes) =>
    linkedNode(currentNodes, node.fractionComplementOf) ? `(1-${fractionParameterName(node, currentNodes)})` : fractionParameterName(node, currentNodes);
  const durationParameterName = (/** @type {Node} */ node, currentNodes = nodes) => {
    const source = linkedNode(currentNodes, node.inputDurationTlagOf);
    return source ? `tlag_${rid(source.name)}` : `tk0_${rid(node.name)}`;
  };
  const needsDoseRouter = (currentNodes = nodes) => {
    const dosed = dosedNodes(currentNodes);
    return dosed.length > 1 || dosed.some((node) => node.inputType === 'zero_order' || Number(node.tlag ?? 0) > 0);
  };

  function simulateModel(currentNodes = nodes, currentEdges = edges, currentCovariates = covariates, horizon = tMax, referenceLabel = 'reference') {
    const N = currentNodes.length;
    if (!N) return { out: [], series: [] };
    const parameters = modelParams(currentNodes, currentEdges);
    const usableCovariates = validCovariates(parameters, currentCovariates);
    const plotNodes = currentNodes.filter((node) => KINDS[node.kind].plot);

    const run = (/** @type {Map<string, number>} */ values, untreated = false) => {
      const adjusted = (/** @type {string} */ name, /** @type {number} */ base) => usableCovariates
        .filter((covariate) => covariate.target === name)
        .reduce((value, covariate) => value * covariateFactor(covariate, values.get(covariateName(covariate.name)) ?? Number(covariate.reference)), base);
      let localNodes = currentNodes.map((node) => {
        const name = rid(node.name);
        return {
          ...node,
          ...Object.fromEntries(advancedFields(node).map(f => [f.key, untreated && f.key === 'kill' ? 0 : adjusted(`${f.key}_${name}`, Number(/** @type {any} */ (node)[f.key]))])),
          vol: node.vol === undefined ? undefined : adjusted(`v_${name}`, Number(node.vol)),
          ke0: node.ke0 === undefined ? undefined : adjusted(`ke0_${name}`, Number(node.ke0)),
          kin: node.kin === undefined ? undefined : adjusted(`kin_${name}`, Number(node.kin)),
          kout: node.kout === undefined ? undefined : adjusted(`kout_${name}`, Number(node.kout)),
          smax: node.smax === undefined ? undefined : adjusted(`smax_${name}`, Number(node.smax)),
          sc50: node.sc50 === undefined ? undefined : adjusted(`sc50_${name}`, Number(node.sc50)),
          inputDuration: adjusted(`tk0_${name}`, Number(node.inputDuration ?? 1)),
          tlag: adjusted(`tlag_${name}`, Number(node.tlag ?? 0)),
          doseFraction: adjusted(`f_${name}`, Number(node.doseFraction ?? 100))
        };
      });
      localNodes = localNodes.map((node) => {
        const fractionSource = linkedNode(localNodes, node.fractionComplementOf);
        const durationSource = linkedNode(localNodes, node.inputDurationTlagOf);
        return {
          ...node,
          doseFraction: fractionSource ? 100 - Number(fractionSource.doseFraction ?? 100) : node.doseFraction,
          inputDuration: durationSource ? Number(durationSource.tlag ?? 0) : node.inputDuration
        };
      });
      const localEdges = currentEdges.map((edge) => {
        const from = rid(currentNodes.find((node) => node.id === edge.from)?.name ?? 'x');
        const to = edge.to === 'OUT' ? 'e' : rid(currentNodes.find((node) => node.id === edge.to)?.name ?? 'x');
        return {
          ...edge,
          kinetics: edge.kinetics ?? 'first_order',
          eliminationParameterization: edge.eliminationParameterization ?? 'rate',
          transferParameterization: edge.transferParameterization ?? 'rate',
          k: adjusted(`k_${from}_${to}`, Number(edge.k)),
          cl: adjusted(`cl_${from}`, Number(edge.cl ?? edge.k)),
          q: adjusted(transferParameterName(edge, currentNodes), Number(edge.q ?? defaultTransferClearance(edge, currentNodes))),
          vmax: adjusted(`vmax_${from}_${to}`, Number(edge.vmax ?? 10)),
          km: adjusted(`km_${from}_${to}`, Number(edge.km ?? 10)),
          gamma: adjusted(`gamma_${from}_${to}`, Number(edge.gamma ?? 1))
        };
      });
      const idx = new Map(localNodes.map((node, index) => [node.id, index]));
      const y0 = localNodes.map((node) => node.kind === 'tumor' ? Number(node.t0) : node.kind === 'interaction' ? 1 : (node.kind === 'response' ? (node.kin ?? 0) / (node.kout || 1) : 0));
      const driver = (/** @type {Node} */ n, /** @type {number[]} */ y) => {
        const si = idx.get(n.source ?? -1);
        return si === undefined ? 0 : y[si] / (localNodes[si].vol || 1);
      };

    /** @param {number} time @param {number[]} y */
    function deriv(time, y) {
      const dy = new Array(N).fill(0);
        localNodes.forEach((node, index) => {
          if ((node.dose ?? 0) <= 0 || node.inputType !== 'zero_order') return;
          const start = Number(node.tlag ?? 0);
          const duration = Math.max(Number(node.inputDuration ?? 1), 1e-9);
          if (time >= start && time < start + duration) dy[index] += Number(node.dose) * Number(node.doseFraction ?? 100) / 100 / duration;
        });
        for (const e of localEdges) {
        const fi = idx.get(e.from); if (fi === undefined) continue;
          if (!isMassNode(localNodes[fi])) continue;
        const amount = Math.max(0, y[fi]);
        let rate = e.kinetics === 'hill'
          ? e.vmax * Math.pow(amount, e.gamma) / Math.max(Math.pow(e.km, e.gamma) + Math.pow(amount, e.gamma), 1e-12)
          : e.kinetics === 'michaelis_menten'
            ? e.vmax * amount / Math.max(e.km + amount, 1e-12)
          : e.to === 'OUT' && e.eliminationParameterization === 'clearance'
            ? e.cl * amount / Math.max(Number(localNodes[fi].vol ?? 1), 1e-12)
            : e.to !== 'OUT' && e.transferParameterization === 'clearance'
              ? e.q * amount / Math.max(Number(localNodes[fi].vol ?? 1), 1e-12)
            : e.k * amount;
        for (const modifier of localNodes.filter(n => n.kind === 'interaction' && n.targetFrom === e.from && n.targetTo === e.to)) {
          rate *= interactionFactor(modifier, driver(modifier, y), y[idx.get(modifier.id) ?? 0]);
        }
        dy[fi] -= rate;
          if (e.to !== 'OUT') { const ti = idx.get(e.to); if (ti !== undefined && isMassNode(localNodes[ti])) dy[ti] += rate; }
      }
        localNodes.forEach((n, i) => {
          if (n.kind === 'tumor' || n.kind === 'interaction') { dy[i] = advancedDerivative(n, driver(n, y), y[i], time); }
          else if (n.kind === 'effect') { const si = idx.get(n.source ?? -1); const cp = si !== undefined ? (localNodes[si].vol ? y[si] / (localNodes[si].vol || 1) : y[si]) : 0; dy[i] = (n.ke0 ?? 0) * (cp - y[i]); }
          else if (n.kind === 'response') { const si = idx.get(n.source ?? -1); const cp = si !== undefined ? (localNodes[si].vol ? y[si] / (localNodes[si].vol || 1) : y[si]) : 0; dy[i] = (n.kin ?? 0) * (1 + (n.smax ?? 0) * cp / ((n.sc50 || 1) + cp)) - (n.kout ?? 0) * y[i]; }
      });
      return dy;
    }
      const steps = 800, dt = horizon / steps;
    let y = y0.slice();
    const administeredBolus = new Set();
    /** @type {{t:number, y:number[]}[]} */
    const out = [];
    for (let s = 0; s <= steps; s++) {
      const time = s * dt;
      localNodes.forEach((node, index) => {
        if ((node.dose ?? 0) <= 0 || node.inputType === 'zero_order' || administeredBolus.has(node.id) || time + 1e-9 < Number(node.tlag ?? 0)) return;
        y[index] += Number(node.dose) * Number(node.doseFraction ?? 100) / 100;
        administeredBolus.add(node.id);
      });
      out.push({ t: time, y: y.slice() });
      const k1 = deriv(time, y);
      const k2 = deriv(time + dt / 2, y.map((v, i) => v + (dt / 2) * k1[i]));
      const k3 = deriv(time + dt / 2, y.map((v, i) => v + (dt / 2) * k2[i]));
      const k4 = deriv(time + dt, y.map((v, i) => v + dt * k3[i]));
      y = y.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    }
      const series = plotNodes.map((n) => {
        const i = localNodes.findIndex((node) => node.id === n.id);
        const local = localNodes[i];
      const isResp = ['response','tumor','interaction'].includes(n.kind);
        const vals = out.map((o) => n.kind === 'interaction' ? interactionFactor(local, driver(local,o.y), o.y[i]) : (local.vol ? o.y[i] / (local.vol || 1) : o.y[i]));
      return { nodeId: n.id, kind: n.kind, name: n.name, color: KINDS[n.kind].color, resp: isResp, vals };
    });
    return { out, series };
    };

    const referenceValues = new Map(usableCovariates.map((covariate) => [covariateName(covariate.name), Number(covariate.reference)]));
    const comparisons = uniqueCovariates(usableCovariates).filter((covariate) =>
      usableCovariates.some((candidate) => covariateName(candidate.name) === covariateName(covariate.name) && candidate.compare)
    );
    const reference = run(referenceValues);
    const referenceSeries = reference.series.map((serie) => ({
      ...serie,
      label: comparisons.length ? `${serie.name} · ${referenceLabel}` : serie.name,
      dash: false
    }));
    const comparisonSeries = comparisons.flatMap((covariate, scenarioIndex) => {
      const values = new Map(referenceValues);
      values.set(covariateName(covariate.name), Number(covariate.comparison));
      return run(values).series.map((serie, serieIndex) => ({
        ...serie,
        color: SCENARIO_COLORS[(scenarioIndex * Math.max(1, plotNodes.length) + serieIndex) % SCENARIO_COLORS.length],
        label: `${serie.name} · ${covariateName(covariate.name)} = ${fmt(Number(covariate.comparison))}`,
        dash: true
      }));
    });
    const untreatedSeries = plotNodes.some(n => n.kind === 'tumor')
      ? run(referenceValues, true).series.filter(s => s.kind === 'tumor').map(s => ({ ...s, color: '#62686c', label: `${s.name} · ${$language === 'en' ? 'untreated' : 'sans traitement'}`, dash: true }))
      : [];
    return { out: reference.out, series: [...referenceSeries, ...comparisonSeries, ...untreatedSeries] };
  }

  $: sim = simulateModel(nodes, edges, covariates, tMax, lego.reference);
  $: simulationValid = Number.isFinite(tMax) && tMax > 0 && sim.series.every(s => s.vals.every(Number.isFinite));
  $: chartGroups = [
    { key: 'PK', unit: 'mg/L', series: sim.series.filter(s => !s.resp) },
    ...nodes.filter(n => KINDS[n.kind].plot && !isMassNode(n) && n.kind !== 'effect').map(n => ({
      key: n.name, unit: n.kind === 'tumor' ? 'mm' : n.kind === 'interaction' ? ($language === 'en' ? 'flux / baseline flux' : 'flux / flux initial') : 'u',
      series: sim.series.filter(s => s.nodeId === n.id)
    }))
  ].filter(group => group.series.length);

  // échelles : concentrations (mg/L) sur l'axe ; réponses (turnover) rééchelonnées
  $: concMax = Math.max(0.01, ...sim.series.filter((s) => !s.resp).flatMap((s) => s.vals));
  $: respMax = Math.max(0.01, ...sim.series.filter((s) => s.resp).flatMap((s) => s.vals));
  const CW = 560, CH = 240, cm = { top: 12, right: 12, bottom: 32, left: 42 };
  $: ciW = CW - cm.left - cm.right;
  $: ciH = CH - cm.top - cm.bottom;
  $: cx = (/** @type {number} */ t) => (t / tMax) * ciW;
  /** @param {{resp:boolean, vals:number[]}} s */
  function pathOf(s, maximum = s.resp ? respMax : concMax) {
    const mx = maximum;
    return s.vals.map((v, i) => `${i ? 'L' : 'M'}${cx((i / (s.vals.length - 1)) * tMax).toFixed(1)},${(ciH - (Math.min(v, mx) / (mx * 1.08)) * ciH).toFixed(1)}`).join(' ');
  }

  // ── EDO générées ──
  $: odes = (() => {
    if (!nodes.length) return [lego.emptyEquations];
    const nm = (/** @type {number} */ id) => nodes.find((n) => n.id === id)?.name ?? '?';
    return nodes.map((n) => {
      if (n.kind === 'tumor' || n.kind === 'interaction') {
        const ex = special(n, 'mlx');
        return n.kind === 'interaction' ? `${n.name}: flux × ${ex.factor}; d${n.name}/dt = ${ex.derivative}` : `d${n.name}/dt = ${ex.derivative}`;
      }
      if (n.kind === 'effect') return `dCe/dt = ke0·(${nodes.find((s) => s.id === n.source)?.name ?? 'Cp'}/V − Ce)`;
      if (n.kind === 'response') return `dR/dt = kin·(1 + Smax·Cp/(SC50+Cp)) − kout·R`;
      const displayFlux = (/** @type {Edge} */ edge, /** @type {string} */ amount) => {
        if (edgeKinetics(edge) === 'hill') return `Vmax·${amount}^γ/(A50^γ+${amount}^γ)`;
        if (edgeKinetics(edge) === 'michaelis_menten') return `Vmax·${amount}/(Km+${amount})`;
        if (eliminationParameterization(edge) === 'clearance') return `CL·${amount}/V_${n.name}`;
        if (transferParameterization(edge) === 'clearance') return `Q·${amount}/V_${n.name}`;
        return `k·${amount}`;
      };
      const inflow = edges.filter((e) => e.to === n.id).map((e) => `+ ${displayFlux(e, nm(e.from))}${nodes.filter(n => n.kind === 'interaction' && n.targetFrom === e.from && n.targetTo === e.to).map(n => ` × M_${n.name}`).join('')}`);
      const outflow = edges.filter((e) => e.from === n.id).map((e) => `− ${displayFlux(e, n.name)}${nodes.filter(n => n.kind === 'interaction' && n.targetFrom === e.from && n.targetTo === e.to).map(n => ` × M_${n.name}`).join('')}`);
      return `d${n.name}/dt = ${[...inflow, ...outflow].join(' ') || '0'}`;
    }).concat(concSources().map((n) => `C_${n.name} = ${n.name} / V_${n.name}`));
  })();

  // ── génération de code ───────────────────────────────────────────────────────────
  // Quatre cibles synchronisées : nlmixr2 et NONMEM pour l'estimation, mrgsolve pour
  // la simulation et le pont TDM, MLXTRAN pour MonolixSuite. Chaque sortie reprend
  // les paramètres, la variabilité, l'erreur résiduelle et les covariables du graphe.
  // L'ancien générateur n'émettait qu'un bloc `model({…})` : illisible pour R.

  /** Identifiant sûr en R comme en C++ : sans accent, sans espace, jamais initié par un chiffre. */
  const rid = (/** @type {string} */ s) =>
    String(s ?? 'x').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9_]/g, '_').replace(/^(?=\d)/, 'c_').slice(0, 32) || 'x';

  /** Nombre lisible : ni notation exponentielle, ni décimales inutiles. */
  const fmt = (/** @type {number} */ v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return '0';
    return String(Number(n.toPrecision(12)));
  };

  const nmOf = (/** @type {number} */ id) => rid(nodes.find((n) => n.id === id)?.name ?? 'x');

  const edgeKinetics = (/** @type {Edge} */ edge) => edge.kinetics === 'hill' ? 'hill' : edge.kinetics === 'michaelis_menten' ? 'michaelis_menten' : 'first_order';
  const eliminationParameterization = (/** @type {Edge} */ edge) => edge.to === 'OUT' && edge.eliminationParameterization === 'clearance' ? 'clearance' : 'rate';
  const transferParameterization = (/** @type {Edge} */ edge) => edge.to !== 'OUT' && edge.transferParameterization === 'clearance' ? 'clearance' : 'rate';
  const transferParameterName = (/** @type {Edge} */ edge, currentNodes = nodes) => {
    const names = [edge.from, edge.to].map((id) => rid(currentNodes.find((node) => node.id === id)?.name ?? 'x')).sort();
    return `q_${names.join('_')}`;
  };
  const defaultTransferClearance = (/** @type {Edge} */ edge, currentNodes = nodes) => {
    const source = currentNodes.find((node) => node.id === edge.from);
    return Number(edge.k ?? 0.2) * Number(source?.vol ?? 1);
  };
  const reciprocalEdge = (/** @type {Edge} */ edge) => edge.to === 'OUT' ? undefined : edges.find((candidate) => candidate.from === edge.to && candidate.to === edge.from);
  const canUseTransferClearance = (/** @type {Edge} */ edge) => {
    if (edge.to === 'OUT') return false;
    const source = nodes.find((node) => node.id === edge.from);
    const target = nodes.find((node) => node.id === edge.to);
    return Boolean(source && target && KINDS[source.kind].vol && KINDS[target.kind].vol);
  };

  function setTransferClearance(/** @type {Edge} */ edge, /** @type {number} */ value) {
    edge.q = Number(value);
    const reciprocal = reciprocalEdge(edge);
    if (reciprocal) {
      reciprocal.transferParameterization = 'clearance';
      reciprocal.q = Number(value);
    }
  }

  function setTransferParameterization(/** @type {Edge} */ edge, /** @type {string} */ value) {
    const pair = [edge, reciprocalEdge(edge)].filter(Boolean);
    if (value === 'clearance') {
      const q = Number(edge.q ?? pair.find((candidate) => Number.isFinite(Number(candidate?.q)))?.q ?? defaultTransferClearance(edge));
      pair.forEach((candidate) => {
        if (!candidate) return;
        candidate.transferParameterization = 'clearance';
        candidate.q = q;
      });
    } else {
      pair.forEach((candidate) => {
        if (!candidate) return;
        const source = nodes.find((node) => node.id === candidate.from);
        candidate.transferParameterization = 'rate';
        candidate.k = Number(candidate.q ?? qFallback(candidate)) / Math.max(Number(source?.vol ?? 1), 1e-12);
      });
    }
    edges = [...edges];
    reconcileCovariates();
  }

  const qFallback = (/** @type {Edge} */ edge) => defaultTransferClearance(edge);

  async function editEdge(/** @type {Edge} */ edge) {
    await tick();
    const input = /** @type {HTMLInputElement|null} */ (document.getElementById(`edge-value-${edge.id}`));
    input?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    input?.focus();
    input?.select();
  }
  const edgeSuffix = (/** @type {Edge} */ edge, currentNodes = nodes) => {
    const from = rid(currentNodes.find((node) => node.id === edge.from)?.name ?? 'x');
    const to = edge.to === 'OUT' ? 'e' : rid(currentNodes.find((node) => node.id === edge.to)?.name ?? 'x');
    return { from, to };
  };

  function baseEdgeFlux(/** @type {Edge} */ edge, /** @type {string} */ amount, currentNodes = nodes, power = 'caret') {
    const { from, to } = edgeSuffix(edge, currentNodes);
    if (edgeKinetics(edge) === 'hill') {
      const raised = (/** @type {string} */ base) => power === 'pow' ? `pow(${base}, gamma_${from}_${to})` : `(${base})^gamma_${from}_${to}`;
      return `vmax_${from}_${to}*${raised(amount)}/(${raised(`km_${from}_${to}`)} + ${raised(amount)})`;
    }
    if (edgeKinetics(edge) === 'michaelis_menten') return `vmax_${from}_${to}*${amount}/(km_${from}_${to} + ${amount})`;
    if (eliminationParameterization(edge) === 'clearance') return `cl_${from}*${amount}/v_${from}`;
    if (transferParameterization(edge) === 'clearance') return `${transferParameterName(edge, currentNodes)}*${amount}/v_${from}`;
    return `k_${from}_${to}*${amount}`;
  }

  function special(/** @type {Node} */ n, /** @type {'cpp'|'r'|'mlx'|'nonmem'} */ lang = 'cpp') {
    return advancedExpressions(n, driverConc(n), rid(n.name), key => `${key}_${rid(n.name)}`, lang);
  }
  function edgeFlux(/** @type {Edge} */ edge, /** @type {string} */ amount, currentNodes = nodes, power = 'caret') {
    const factors = currentNodes.filter(n => n.kind === 'interaction' && n.targetFrom === edge.from && n.targetTo === edge.to)
      .map(n => special(n, power === 'pow' ? 'cpp' : 'mlx').factor);
    return baseEdgeFlux(edge, amount, currentNodes, power) + factors.map(f => `*(${f})`).join('');
  }

  /**
   * Tous les paramètres du graphe courant, avec leur valeur, leur unité et un
   * commentaire. `iiv` marque ceux qui reçoivent une variabilité inter-individuelle
   * par défaut — clairance et volume, les deux seuls qu'un jeu de données ordinaire
   * permet d'identifier.
   */
  function modelParams(currentNodes = nodes, currentEdges = edges) {
    /** @type {{name:string, value:number, unit:string, note:string, iiv:boolean}[]} */
    const out = [];
    const localName = (/** @type {number} */ id) => rid(currentNodes.find((node) => node.id === id)?.name ?? 'x');
    for (const e of currentEdges) {
      const from = localName(e.from);
      const to = e.to === 'OUT' ? 'e' : localName(e.to);
      if (['michaelis_menten', 'hill'].includes(edgeKinetics(e))) {
        out.push({ name: `vmax_${from}_${to}`, value: e.vmax ?? 10, unit: 'mg/h', note: `vitesse maximale ${from} -> ${to}`, iiv: false });
        out.push({ name: `km_${from}_${to}`, value: e.km ?? 10, unit: 'mg', note: `${edgeKinetics(e) === 'hill' ? 'quantite a mi-vitesse' : 'constante de Michaelis'} ${from} -> ${to}`, iiv: false });
        if (edgeKinetics(e) === 'hill') out.push({ name: `gamma_${from}_${to}`, value: e.gamma ?? 1, unit: '-', note: `exposant de Hill ${from} -> ${to}`, iiv: false });
      } else if (eliminationParameterization(e) === 'clearance') {
        out.push({ name: `cl_${from}`, value: e.cl ?? 5, unit: 'L/h', note: `clairance depuis ${from}`, iiv: true });
      } else if (transferParameterization(e) === 'clearance') {
        const name = transferParameterName(e, currentNodes);
        if (!out.some((parameter) => parameter.name === name)) {
          out.push({ name, value: e.q ?? defaultTransferClearance(e, currentNodes), unit: 'L/h', note: `clairance intercompartimentale ${from} <-> ${to}`, iiv: false });
        }
      } else {
        out.push({
          name: `k_${from}_${to}`, value: e.k, unit: '1/h',
          note: e.to === 'OUT' ? `elimination depuis ${from}` : `transfert ${from} -> ${to}`,
          iiv: e.to === 'OUT'
        });
      }
    }
    for (const n of currentNodes.filter((node) => KINDS[node.kind].vol)) {
      out.push({ name: `v_${rid(n.name)}`, value: n.vol ?? 1, unit: 'L', note: `volume de ${rid(n.name)}`, iiv: n.kind === 'central' });
    }
    const localDosed = dosedNodes(currentNodes);
    for (const n of currentNodes) {
      const b = rid(n.name);
      for (const field of advancedFields(n)) out.push({ name: `${field.key}_${b}`, value: Number(/** @type {any} */ (n)[field.key]), unit: field.unit, note: `${field.key} ${b}`, iiv: false });
      if ((n.dose ?? 0) > 0) {
        if ((n.tlag ?? 0) > 0) out.push({ name: `tlag_${b}`, value: n.tlag ?? 0, unit: 'h', note: `delai d'administration vers ${b}`, iiv: false });
        if (n.inputType === 'zero_order' && !n.inputDurationTlagOf) out.push({ name: `tk0_${b}`, value: n.inputDuration ?? 1, unit: 'h', note: `duree d'administration vers ${b}`, iiv: false });
        if (localDosed.length > 1 && !n.fractionComplementOf) out.push({ name: `f_${b}`, value: (n.doseFraction ?? 100) / 100, unit: '-', note: `fraction de dose vers ${b}`, iiv: false });
      }
      if (n.kind === 'effect') out.push({ name: `ke0_${b}`, value: n.ke0 ?? 0.4, unit: '1/h', note: `equilibrage du compartiment d'effet ${b}`, iiv: false });
      if (n.kind === 'response') {
        out.push({ name: `kin_${b}`, value: n.kin ?? 10, unit: 'u/h', note: `production de ${b}`, iiv: false });
        out.push({ name: `kout_${b}`, value: n.kout ?? 0.15, unit: '1/h', note: `degradation de ${b}`, iiv: false });
        out.push({ name: `smax_${b}`, value: n.smax ?? 3, unit: '-', note: `effet maximal sur ${b}`, iiv: false });
        out.push({ name: `sc50_${b}`, value: n.sc50 ?? 3, unit: 'mg/L', note: `concentration a 50 % de l'effet`, iiv: false });
      }
    }
    return out;
  }

  const covariateName = (/** @type {string} */ value) => rid(value).toUpperCase();

  /** @param {ReturnType<typeof modelParams>} [parameters] */
  function validCovariates(parameters = modelParams(), currentCovariates = covariates) {
    const targets = new Set(parameters.map((parameter) => parameter.name));
    return currentCovariates.filter((covariate) =>
      targets.has(covariate.target) &&
      ['continuous', 'categorical'].includes(covariateType(covariate)) &&
      String(covariate.name ?? '').trim().length > 0 &&
      /^[A-Z][A-Z0-9_]{0,23}$/.test(covariateName(covariate.name)) &&
      Number.isFinite(Number(covariate.reference)) &&
      (covariateType(covariate) === 'categorical' || Number(covariate.reference) > 0) &&
      Number.isFinite(Number(covariate.comparison)) &&
      (covariateType(covariate) === 'categorical'
        ? Number(covariate.comparison) !== Number(covariate.reference)
        : Number(covariate.comparison) > 0) &&
      Number.isFinite(Number(covariate.beta))
    );
  }

  /** @param {ReturnType<typeof modelParams>} [parameters] */
  function covariatesAreValid(parameters = modelParams(), currentCovariates = covariates) {
    const valid = validCovariates(parameters, currentCovariates);
    const effects = valid.map((covariate) => `${covariateName(covariate.name)}::${covariate.target}`);
    const definitions = new Map();
    for (const covariate of valid) {
      const name = covariateName(covariate.name);
      const signature = [covariateType(covariate), covariate.scope ?? 'patient', Number(covariate.reference), Number(covariate.comparison)].join('::');
      if (definitions.has(name) && definitions.get(name) !== signature) return false;
      definitions.set(name, signature);
    }
    return valid.length === currentCovariates.length && new Set(effects).size === effects.length;
  }

  function reconcileCovariates() {
    const targets = modelParams().map((parameter) => parameter.name);
    if (!targets.length) {
      covariates = [];
      return;
    }
    covariates = covariates.map((covariate) => ({
      ...covariate,
      type: covariateType(covariate),
      scope: covariate.scope === 'administration' ? 'administration' : 'patient',
      target: targets.includes(covariate.target) ? covariate.target : targets[0],
      comparison: Number.isFinite(Number(covariate.comparison))
        ? Number(covariate.comparison)
        : covariateType(covariate) === 'categorical' ? 1 : Number(covariate.reference) * 1.25,
      compare: covariate.compare !== false
    }));
  }

  function addCovariate(/** @type {'continuous'|'categorical'} */ type = 'continuous') {
    const target = modelParams()[0]?.name;
    if (!target || covariates.length >= 50) return;
    let index = covariates.length + 1;
    const existing = new Set(covariates.map((covariate) => covariateName(covariate.name)));
    let name = type === 'categorical'
      ? (existing.has('SEX') ? `CAT${index}` : 'SEX')
      : (existing.has('WT') ? `COV${index}` : 'WT');
    while (existing.has(name)) name = `${type === 'categorical' ? 'CAT' : 'COV'}${++index}`;
    const reference = type === 'continuous' && name === 'WT' ? 70 : type === 'continuous' ? 1 : 0;
    covariates = [...covariates, {
      id: uid++, name, type, scope: 'patient', target, reference,
      comparison: type === 'continuous' ? reference * 1.25 : 1,
      beta: type === 'continuous' ? 0.75 : 0.2,
      compare: true
    }];
  }

  function nextCovariateTarget(/** @type {Covariate} */ covariate) {
    const name = covariateName(covariate.name);
    const used = new Set(covariates.filter((candidate) => covariateName(candidate.name) === name).map((candidate) => candidate.target));
    return parameterChoices.find((parameter) => !used.has(parameter.name))?.name;
  }

  function addCovariateTarget(/** @type {Covariate} */ covariate) {
    const target = nextCovariateTarget(covariate);
    if (!target || covariates.length >= 50) return;
    covariates = [...covariates, { ...covariate, id: uid++, target }];
  }

  function covariateEffects(/** @type {Covariate} */ covariate) {
    const name = covariateName(covariate.name);
    return covariates.filter((candidate) => covariateName(candidate.name) === name);
  }

  function updateCovariateDefinition(/** @type {Covariate} */ covariate, /** @type {Partial<Covariate>} */ updates) {
    const name = covariateName(covariate.name);
    covariates = covariates.map((candidate) => covariateName(candidate.name) === name ? { ...candidate, ...updates } : candidate);
  }

  function renameCovariate(/** @type {Covariate} */ covariate, /** @type {Event} */ event) {
    const input = /** @type {HTMLInputElement} */ (event.currentTarget);
    const currentName = covariateName(covariate.name);
    const nextName = covariateName(input.value);
    const duplicate = nextName && covariates.some((candidate) => {
      const candidateName = covariateName(candidate.name);
      return candidateName === nextName && candidateName !== currentName;
    });
    input.setCustomValidity(duplicate ? lego.duplicateCovariateName : '');
    if (duplicate) {
      input.value = covariate.name;
      input.reportValidity();
      return;
    }
    updateCovariateDefinition(covariate, { name: input.value });
  }

  function setCovariateType(/** @type {Covariate} */ covariate, /** @type {'continuous'|'categorical'} */ type) {
    const reference = type === 'categorical' ? 0 : covariateName(covariate.name) === 'WT' ? 70 : 1;
    updateCovariateDefinition(covariate, {
      type,
      reference,
      comparison: type === 'categorical' ? 1 : reference * 1.25
    });
  }

  /** @param {number} id */
  function deleteCovariate(id) {
    covariates = covariates.filter((covariate) => covariate.id !== id);
  }

  function deleteCovariateGroup(/** @type {Covariate} */ covariate) {
    const name = covariateName(covariate.name);
    covariates = covariates.filter((candidate) => covariateName(candidate.name) !== name);
  }

  $: parameterChoices = modelParams(nodes, edges);
  $: randomParameterChoices = randomParameters(parameterChoices, iivVariances);

  function iivVariance(/** @type {{name:string, iiv:boolean}} */ parameter, variances = iivVariances) {
    return Object.hasOwn(variances, parameter.name)
      ? Number(variances[parameter.name])
      : parameter.iiv ? 0.09 : 0;
  }

  function setIiv(/** @type {{name:string, iiv:boolean}} */ parameter, /** @type {boolean} */ enabled) {
    iivVariances = { ...iivVariances, [parameter.name]: enabled ? Math.max(iivVariance(parameter), 0.09) : 0 };
    if (!enabled) {
      iivCovariances = Object.fromEntries(Object.entries(iivCovariances).filter(([key]) => !key.split('::').includes(parameter.name)));
    }
  }

  function setIivVariance(/** @type {{name:string, iiv:boolean}} */ parameter, /** @type {string|number} */ value) {
    iivVariances = { ...iivVariances, [parameter.name]: Math.max(0.000001, Number(value) || 0.000001) };
  }

  const covarianceKey = (/** @type {string} */ left, /** @type {string} */ right) => [left, right].sort().join('::');
  const covariance = (/** @type {string} */ left, /** @type {string} */ right, covariances = iivCovariances) => Number(covariances[covarianceKey(left, right)] ?? 0);
  function setCovariance(/** @type {string} */ left, /** @type {string} */ right, /** @type {string|number} */ value) {
    iivCovariances = { ...iivCovariances, [covarianceKey(left, right)]: Number(value) || 0 };
  }

  /** @param {ReturnType<typeof modelParams>} [parameters] */
  function randomParameters(parameters = modelParams(), variances = iivVariances) {
    return parameters.filter((parameter) => iivVariance(parameter, variances) > 0);
  }

  /** Positive-definite check used before exporting Ω to estimation software. */
  function omegaIsValid(parameters = randomParameters(), variances = iivVariances, covariances = iivCovariances) {
    if (!parameters.length) return true;
    const lower = parameters.map(() => parameters.map(() => 0));
    for (let row = 0; row < parameters.length; row += 1) {
      for (let column = 0; column <= row; column += 1) {
        let value = row === column
          ? iivVariance(parameters[row], variances)
          : covariance(parameters[row].name, parameters[column].name, covariances);
        for (let index = 0; index < column; index += 1) value -= lower[row][index] * lower[column][index];
        if (row === column) {
          if (value <= 1e-12) return false;
          lower[row][column] = Math.sqrt(value);
        } else {
          lower[row][column] = value / lower[column][column];
        }
      }
    }
    return true;
  }

  function residualUses(/** @type {'additive'|'proportional'} */ kind) {
    return residualError.type === kind || residualError.type === 'combined';
  }

  function residualExpression(prediction = 'IPRED', proportionalIndex = 1, additiveIndex = 2) {
    if (residualError.type === 'additive') return `${prediction} + EPS(${additiveIndex === 2 ? 1 : additiveIndex})`;
    if (residualError.type === 'proportional') return `${prediction} * (1 + EPS(${proportionalIndex}))`;
    return `${prediction} * (1 + EPS(${proportionalIndex})) + EPS(${additiveIndex})`;
  }

  /** Termes de l'EDO d'un compartiment de masse, dans la syntaxe passée en argument. */
  function massTerms(/** @type {any} */ n, power = 'caret') {
    const b = rid(n.name);
    const terms = [];
    for (const e of edges.filter((x) => x.to === n.id)) terms.push(`+ ${edgeFlux(e, nmOf(e.from), nodes, power)}`);
    for (const e of edges.filter((x) => x.from === n.id)) terms.push(`- ${edgeFlux(e, b, nodes, power)}`);
    return terms.join(' ') || '0';
  }

  /**
   * Concentration pilotant un bloc PD : celle de son compartiment source.
   * Toujours PARENTHÉSÉE — l'expression est insérée au milieu d'un produit et d'un
   * quotient (`smax*C/(sc50+C)`), où une division nue changerait le résultat dès que
   * la source cesse d'être un simple rapport.
   */
  function driverConc(/** @type {any} */ n) {
    const src = nodes.find((s) => s.id === n.source);
    if (!src) return '0';
    return KINDS[src.kind]?.vol ? `(${rid(src.name)}/v_${rid(src.name)})` : rid(src.name);
  }

  /** Compartiment observé : le central si présent, sinon la première concentration. */
  $: observed = nodes.find((n) => n.kind === 'central') ?? concSources()[0] ?? null;

  // Le serveur public ne compile jamais le texte C++ recu. Cette specification est
  // validee puis transformee en code mrgsolve cote R, ce qui rend le pont Lego sur.
  function tdmModelSpec() {
    const safeNodes = nodes.map((n) => {
      /** @type {Record<string, string|number>} */
      const item = { id: n.id, kind: n.kind, name: rid(n.name), dose: Number(n.dose ?? 0) };
      if (KINDS[n.kind].vol) item.vol = Number(n.vol ?? 1);
      if (isMassNode(n)) {
        item.inputType = n.inputType ?? 'bolus';
        item.inputDuration = Number(n.inputDuration ?? 1);
        if (n.inputDurationTlagOf) item.inputDurationTlagOf = Number(n.inputDurationTlagOf);
        item.tlag = Number(n.tlag ?? 0);
        item.doseFraction = Number(n.doseFraction ?? 100);
        if (n.fractionComplementOf) item.fractionComplementOf = Number(n.fractionComplementOf);
      }
      if (n.kind === 'effect') {
        item.ke0 = Number(n.ke0 ?? 0.4);
        item.source = Number(n.source ?? 0);
      }
      if (n.kind === 'response') {
        item.kin = Number(n.kin ?? 10);
        item.kout = Number(n.kout ?? 0.15);
        item.smax = Number(n.smax ?? 3);
        item.sc50 = Number(n.sc50 ?? 3);
        item.source = Number(n.source ?? 0);
      }
      if (n.kind === 'tumor' || n.kind === 'interaction') {
        Object.assign(item, Object.fromEntries(advancedFields(n).map(f => [f.key, Number(/** @type {any} */ (n)[f.key])])));
        item.source = Number(n.source ?? 0);
        if (n.kind === 'tumor') item.growth = n.growth ?? 'exponential';
        else { item.mechanism = n.mechanism ?? 'reversible'; item.targetFrom = Number(n.targetFrom ?? 0); item.targetTo = n.targetTo ?? 'OUT'; }
      }
      return item;
    });
    return {
      version: nodes.some(n => n.kind === 'tumor' || n.kind === 'interaction') ? 4 : 3,
      nodes: safeNodes,
      edges: edges.map((e) => ({
        from: e.from,
        to: e.to,
        kinetics: edgeKinetics(e),
        k: Number(e.k),
        vmax: Number(e.vmax ?? 10),
        km: Number(e.km ?? 10),
        gamma: Number(e.gamma ?? 1),
        eliminationParameterization: eliminationParameterization(e),
        cl: Number(e.cl ?? 5),
        transferParameterization: transferParameterization(e),
        q: Number(e.q ?? defaultTransferClearance(e))
      })),
      covariates: validCovariates(modelParams(), covariates).map((covariate) => ({
        name: covariateName(covariate.name),
        type: covariateType(covariate),
        scope: covariate.scope === 'administration' ? 'administration' : 'patient',
        target: covariate.target,
        reference: Number(covariate.reference),
        comparison: Number(covariate.comparison),
        beta: Number(covariate.beta)
      })),
      population: {
        iivVariances: Object.fromEntries(randomParameters().map((parameter) => [parameter.name, iivVariance(parameter)])),
        iivCovariances: Object.fromEntries(Object.entries(iivCovariances).filter(([key]) => key.split('::').every((name) => randomParameters().some((parameter) => parameter.name === name)))),
        residualError: { ...residualError }
      }
    };
  }

  function legoExportSpec(/** @type {number} */ horizon, /** @type {string} */ presetName) {
    const specification = tdmModelSpec();
    return {
      ...specification,
      simulation: { horizon, preset: presetName },
      nodes: specification.nodes.map((node, index) => ({ ...node, x: nodes[index].x, y: nodes[index].y })),
      covariates: specification.covariates.map((covariate, index) => ({
        ...covariate, compare: validCovariates()[index].compare !== false
      }))
    };
  }

  // ── nlmixr2 (estimation) ──
  $: codeNlmixr = (() => {
    void iivVariances; void iivCovariances; void residualError;
    if (!nodes.length) return '# Ajoutez des compartiments : le code se génère au fur et à mesure.';
    const P = modelParams();
    const C = validCovariates(P, covariates);
    const dosed = nodes.filter((n) => (n.dose ?? 0) > 0);
    const w = Math.max(...P.map((p) => p.name.length), 6);
    const L = [];

    L.push('library(nlmixr2)');
    L.push('');
    L.push('# ---------------------------------------------------------------------------');
    L.push('# Jeu de donnees attendu : une ligne par enregistrement, colonnes');
    L.push('#   ID, TIME, DV, AMT, EVID, CMT  (+ vos covariables, p. ex. WT)');
    if (dosed.length) {
      L.push(`#   Les lignes de dose portent EVID = 1 et CMT = "${rid(dosed[0].name)}"` +
        (dosed.length > 1 ? `. Dupliquez chaque dose vers ${dosed.slice(1).map((n) => rid(n.name)).join(', ')}; f() applique les fractions.` : '.'));
      if (dosed.some((node) => node.inputType === 'zero_order')) L.push('#   Pour une entree d ordre zero modelisee par dur(), utilisez RATE = -2.');
    } else {
      L.push('#   Aucun compartiment ne porte de dose dans l\'atelier : réglez-en une.');
    }
    if (observed) L.push(`#   Les lignes d'observation portent EVID = 0 et CMT = "C_${rid(observed.name)}"`);
    L.push('# ---------------------------------------------------------------------------');
    L.push('');
    L.push('lego_model <- function() {');
    L.push('  ini({');
    L.push('    # Effets fixes estimes sur l\'echelle log : la valeur reste positive.');
    for (const p of P) L.push(p.value > 0
      ? `    l${p.name.padEnd(w)} <- log(${fmt(p.value)}) # ${p.note} (${p.unit})`
      : `    TV_${p.name} <- fixed(${fmt(p.value)}) # zero/non-positive baseline, fixed on natural scale`);
    const iiv = randomParameters(P);
    if (iiv.length) {
      L.push('');
      L.push('    # Variabilite inter-individuelle : matrice variance-covariance Omega.');
      if (iiv.length === 1) {
        L.push(`    eta_${iiv[0].name.padEnd(w)} ~ ${fmt(iivVariance(iiv[0]))}`);
      } else {
        const omega = [];
        for (let row = 0; row < iiv.length; row += 1) {
          for (let column = 0; column <= row; column += 1) {
            omega.push(fmt(row === column ? iivVariance(iiv[row]) : covariance(iiv[row].name, iiv[column].name)));
          }
        }
        L.push(`    ${iiv.map((parameter) => `eta_${parameter.name}`).join(' + ')} ~ c(${omega.join(', ')})`);
      }
    }
    if (C.length) {
      L.push('');
      L.push('    # Covariables : effet puissance pour une continue, effet exponentiel pour une categorie.');
      for (const covariate of C) {
        const name = covariateName(covariate.name);
        L.push(`    beta_${name}_${covariate.target} <- ${fmt(covariate.beta)}`);
      }
    }
    L.push('');
    L.push(`    # Erreur residuelle ${residualError.type}.`);
    if (residualUses('additive')) L.push(`    add_err <- ${fmt(residualError.additive)}      # ecart-type, unite de DV`);
    if (residualUses('proportional')) L.push(`    prop_err <- ${fmt(residualError.proportional)}      # ecart-type relatif`);
    L.push('  })');
    L.push('');
    L.push('  model({');
    L.push('    # Retour a l\'echelle naturelle, eta compris.');
    for (const p of P) {
      const eta = iiv.some((parameter) => parameter.name === p.name) ? ` + eta_${p.name}` : '';
      const effects = C
        .filter((covariate) => covariate.target === p.name)
        .map((covariate) => {
          const name = covariateName(covariate.name);
          return covariateType(covariate) === 'categorical'
            ? ` + beta_${name}_${p.name}*(${name} == ${fmt(covariate.comparison)})`
            : ` + beta_${name}_${p.name}*log(${name}/${fmt(covariate.reference)})`;
        })
        .join('');
      L.push(`    ${p.name.padEnd(w)} <- ${p.value > 0 ? `exp(l${p.name}${effects}${eta})` : `TV_${p.name}*exp(0${effects}${eta})`}`);
    }
    if (dosed.length) {
      L.push('');
      L.push('    # Administration : fraction, delai et duree modelisee par voie.');
      for (const node of dosed) {
        const name = rid(node.name);
        if (dosed.length > 1) L.push(`    f(${name}) <- ${doseFractionExpression(node)}`);
        if ((node.tlag ?? 0) > 0) L.push(`    alag(${name}) <- tlag_${name}`);
        if (node.inputType === 'zero_order') L.push(`    dur(${name}) <- ${durationParameterName(node)}`);
      }
    }
    const resp = nodes.filter((n) => n.kind === 'response');
    if (resp.length) {
      L.push('');
      L.push('    # Etat initial des reponses : le systeme part de son equilibre.');
      for (const n of resp) L.push(`    ${rid(n.name)}(0) <- kin_${rid(n.name)}/kout_${rid(n.name)}`);
    }
    L.push('');
    for (const n of nodes.filter(n => n.kind === 'tumor' || n.kind === 'interaction')) L.push(`    ${rid(n.name)}(0) <- ${special(n, 'r').initial}`);
    for (const n of nodes) {
      const b = rid(n.name);
      if (n.kind === 'effect') { L.push(`    d/dt(${b}) = ke0_${b}*(${driverConc(n)} - ${b})`); continue; }
      if (n.kind === 'response') { L.push(`    d/dt(${b}) = kin_${b}*(1 + smax_${b}*${driverConc(n)}/(sc50_${b} + ${driverConc(n)})) - kout_${b}*${b}`); continue; }
      L.push(`    d/dt(${b}) = ${n.kind === 'tumor' || n.kind === 'interaction' ? special(n, 'r').derivative : massTerms(n)}`);
    }
    L.push('');
    for (const n of concSources()) L.push(`    C_${rid(n.name)} <- ${rid(n.name)}/v_${rid(n.name)}`);
    if (observed) {
      L.push('');
      const error = residualError.type === 'additive' ? 'add(add_err)'
        : residualError.type === 'proportional' ? 'prop(prop_err)'
          : 'add(add_err) + prop(prop_err)';
      L.push(`    C_${rid(observed.name)} ~ ${error}`);
    }
    L.push('  })');
    L.push('}');
    L.push('');
    L.push('# ---------------------------------------------------------------------------');
    L.push('fit <- nlmixr2(lego_model, data, est = "saem",');
    L.push('               control = saemControl(print = 0),');
    L.push('               table   = tableControl(cwres = TRUE, npde = TRUE))');
    L.push('print(fit)');
    L.push('plot(fit)   # diagnostics : GOF, VPC-like, distributions des eta');
    return L.join('\n');
  })();

  // ── mrgsolve compatible avec le moteur TDM/mapbayr ──
  function advancedInputsAreValid() {
    const dosed = dosedNodes();
    if (!dosed.length || !advancedGraphValid(nodes, edges)) return false;
    if (dosed.some((node) => {
      const fractionSource = linkedNode(dosed, node.fractionComplementOf);
      const durationSource = linkedNode(dosed, node.inputDurationTlagOf);
      return Number(node.tlag ?? 0) < 0 || doseFractionValue(node, dosed) <= 0 ||
        Boolean(node.fractionComplementOf && (!fractionSource || fractionSource.fractionComplementOf)) ||
        Boolean(node.inputDurationTlagOf && (!durationSource || Number(durationSource.tlag ?? 0) <= 0)) ||
        (node.inputType === 'zero_order' && Number(durationSource?.tlag ?? node.inputDuration ?? 0) <= 0);
    })) return false;
    if (dosed.length > 1 && Math.abs(dosed.reduce((total, node) => total + doseFractionValue(node, dosed), 0) - 100) > 0.001) return false;
    return edges.every((edge) => {
      if (['michaelis_menten', 'hill'].includes(edgeKinetics(edge))) {
        return Number(edge.vmax ?? 0) > 0 && Number(edge.km ?? 0) > 0 &&
          (edgeKinetics(edge) !== 'hill' || Number(edge.gamma ?? 0) > 0);
      }
      if (eliminationParameterization(edge) === 'clearance') {
        const source = nodes.find((node) => node.id === edge.from);
        return Boolean(source && KINDS[source.kind].vol && Number(edge.cl ?? 0) > 0);
      }
      if (transferParameterization(edge) === 'clearance') {
        return canUseTransferClearance(edge) && Number(edge.q ?? 0) > 0;
      }
      return Number(edge.k ?? -1) >= 0;
    });
  }

  $: tdmReady = Boolean(observed && modelParams().length && covariatesAreValid(modelParams(), covariates) && omegaIsValid(randomParameterChoices, iivVariances, iivCovariances) && advancedInputsAreValid());
  $: codeMrgsolve = (() => {
    void iivVariances; void iivCovariances; void residualError;
    if (!nodes.length) return '# Ajoutez des compartiments : le code se génère au fur et à mesure.';
    if (!observed) return '# Ajoutez un compartiment central, périphérique ou métabolite pour définir la concentration observée.';
    const P = modelParams();
    const C = validCovariates(P, covariates);
    const U = uniqueCovariates(C);
    const dosed = dosedNodes();
    const router = needsDoseRouter();
    const adm = dosed[0] ?? nodes.find((n) => n.kind !== 'effect' && n.kind !== 'response') ?? nodes[0];
    const randomParams = randomParameters(P);
    const etaIndex = new Map(randomParams.map((p, index) => [p.name, index + 1]));
    const w = Math.max(...P.map((p) => `TV_${p.name}`.length), 8);
    const L = [];

    L.push(`// PK_LEGO_SPEC_V1:${encodeURIComponent(JSON.stringify(legoExportSpec(tMax, activePreset)))}`);
    if (router) L.push('$PLUGIN evtools');
    L.push('$PARAM @annotated');
    for (const p of P) L.push(`${`TV_${p.name}`.padEnd(w)} : ${fmt(p.value)} : valeur typique, ${p.note} (${p.unit})`);
    for (const covariate of C) {
      const name = covariateName(covariate.name);
      const effect = covariateType(covariate) === 'categorical' ? 'effet categoriel' : 'effet puissance';
      L.push(`BETA_${name}_${covariate.target} : ${fmt(covariate.beta)} : ${effect} de ${name} sur ${covariate.target}`);
    }
    for (const [index, p] of randomParams.entries()) {
      L.push(`${`ETA${index + 1}`.padEnd(w)} : 0 : effet individuel sur ${p.name}`);
    }
    if (C.length) {
      L.push('');
      L.push('$PARAM @covariates @annotated');
      for (const covariate of U) {
        const name = covariateName(covariate.name);
        const description = covariateType(covariate) === 'categorical'
          ? `covariable categorielle, reference ${fmt(covariate.reference)}, modalite avec effet ${fmt(covariate.comparison)}`
          : 'covariable continue, valeur de reference';
        const scope = covariate.scope === 'administration' ? ' [administration]' : '';
        L.push(`${name} : ${fmt(covariate.reference)} : ${description}${scope}`);
      }
    }
    L.push('');
    L.push('$OMEGA @block');
    if (randomParams.length) {
      for (let row = 0; row < randomParams.length; row += 1) {
        const values = [];
        for (let column = 0; column <= row; column += 1) values.push(fmt(row === column ? iivVariance(randomParams[row]) : covariance(randomParams[row].name, randomParams[column].name)));
        L.push(`${values.join(' ')} // ETA(${row + 1}) -> IIV ${randomParams[row].name}`);
      }
    } else L.push('0 FIX // aucune variabilite interindividuelle selectionnee');
    L.push('');
    L.push('$SIGMA @annotated');
    if (residualUses('proportional')) L.push(`PROP : ${fmt(residualError.proportional ** 2)} : variance de l'erreur proportionnelle`);
    if (residualUses('additive')) L.push(`ADD  : ${fmt(residualError.additive ** 2)} : variance de l'erreur additive`);
    L.push('');
    L.push('$CMT @annotated');
    if (router) L.push(`${'LEGO_INPUT'.padEnd(w)} : entree de dose repartie [ADM]`);
    for (const n of nodes) {
      const b = rid(n.name);
      const u = n.kind === 'effect' ? 'concentration a l\'effet (mg/L)'
        : n.kind === 'response' ? 'reponse (unites du marqueur)'
        : n.kind === 'tumor' ? 'tumor size (mm)' : n.kind === 'interaction' ? 'interaction activity (dimensionless)' : `quantite dans ${b} (mg)`;
      const tags = [];
      if (n.id === observed.id) tags.push('OBS');
      if (!router && n.id === adm.id) tags.push('ADM');
      L.push(`${b.padEnd(w)} : ${u}${tags.length ? ` [${tags.join(', ')}]` : ''}`);
    }
    L.push('');
    L.push('$MAIN');
    L.push('// Parametres individuels et effets simples de covariables.');
    if (router) L.push('F_LEGO_INPUT = 0;');
    for (const p of P) {
      const eta = etaIndex.get(p.name);
      const effects = C
        .filter((covariate) => covariate.target === p.name)
        .map((covariate) => {
          const name = covariateName(covariate.name);
          return covariateType(covariate) === 'categorical'
            ? ` * exp(BETA_${name}_${p.name} * (${name} == ${fmt(covariate.comparison)}))`
            : ` * pow(${name}/${fmt(covariate.reference)}, BETA_${name}_${p.name})`;
        })
        .join('');
      L.push(`double ${p.name} = TV_${p.name}${effects}${eta ? ` * exp(ETA${eta} + ETA(${eta}))` : ''};`);
    }
    const resp = nodes.filter((n) => n.kind === 'response');
    if (resp.length) {
      L.push('');
      L.push('// Le systeme de turnover demarre a son equilibre, pas a zero.');
      for (const n of resp) L.push(`${rid(n.name)}_0 = kin_${rid(n.name)}/kout_${rid(n.name)};`);
    }
    for (const n of nodes.filter(n => n.kind === 'tumor' || n.kind === 'interaction')) L.push(`${rid(n.name)}_0 = ${special(n).initial};`);
    L.push('');
    L.push('$ODE');
    if (router) L.push('dxdt_LEGO_INPUT = 0;');
    // Les concentrations qui pilotent un bloc PD sont écrites en toutes lettres dans
    // l'équation : déclarer un `double` intermédiaire ici le laisserait inutilisé.
    for (const n of nodes) {
      const b = rid(n.name);
      if (n.kind === 'effect') { L.push(`dxdt_${b} = ke0_${b}*(${driverConc(n).replace('/', '/')} - ${b});`); continue; }
      if (n.kind === 'response') { L.push(`dxdt_${b} = kin_${b}*(1 + smax_${b}*${driverConc(n)}/(sc50_${b} + ${driverConc(n)})) - kout_${b}*${b};`); continue; }
      L.push(`dxdt_${b} = ${n.kind === 'tumor' || n.kind === 'interaction' ? special(n).derivative : massTerms(n, 'pow')};`);
    }
    if (router) {
      L.push('');
      L.push('$EVENT');
      L.push('if ((EVID == 1 || EVID == 4) && CMT == 1) {');
      dosed.forEach((node, index) => {
        const name = rid(node.name);
        const amount = dosed.length > 1 ? `AMT*${doseFractionExpression(node)}` : 'AMT';
        const cmt = nodes.findIndex((candidate) => candidate.id === node.id) + 2;
        const variable = `route_${index + 1}`;
        if (node.inputType === 'zero_order') {
          L.push(`  evt::ev ${variable} = evt::infuse(${amount}, ${cmt}, ${amount}/${durationParameterName(node)});`);
        } else {
          L.push(`  evt::ev ${variable} = evt::bolus(${amount}, ${cmt});`);
        }
        if ((node.tlag ?? 0) > 0) L.push(`  evt::retime(${variable}, TIME + tlag_${name});`);
        L.push(`  self.push(${variable});`);
      });
      L.push('}');
    }
    if (concSources().length) {
      L.push('');
      L.push('$TABLE');
      for (const n of concSources()) L.push(`double CONC_${rid(n.name)} = ${rid(n.name)}/v_${rid(n.name)};`);
      for (const n of nodes.filter(n => n.kind === 'interaction')) L.push(`double MOD_${rid(n.name)} = ${special(n).factor};`);
      L.push(`double IPRED = CONC_${rid(observed.name)};`);
      L.push(`double DV = ${residualExpression()};`);
      L.push('if (DV < 0) DV = 0;');
    }
    L.push('');
    L.push('$CAPTURE @annotated');
    L.push('DV : concentration simulee avec erreur residuelle (mg/L)');
    for (const n of concSources()) L.push(`CONC_${rid(n.name)} : concentration dans ${rid(n.name)} (mg/L)`);
    for (const n of nodes.filter(n => n.kind === 'interaction')) L.push(`MOD_${rid(n.name)} : flux divided by baseline flux`);
    // Compartment states, including PD, are already returned by mrgsolve.
    return L.join('\n');
  })();

  // ── MLXTRAN complet (Monolix / Simulx) ──
  $: codeMlxtran = (() => {
    void iivVariances; void iivCovariances; void residualError;
    if (!nodes.length) return '; Ajoutez des compartiments : le code se génère au fur et à mesure.';
    if (!observed) return '; Ajoutez un compartiment central, périphérique ou métabolite pour définir la concentration observée.';
    const P = modelParams();
    const C = validCovariates(P, covariates);
    const U = uniqueCovariates(C);
    const dosed = dosedNodes();
    const continuous = U.filter((covariate) => covariateType(covariate) === 'continuous');
    const categorical = U.filter((covariate) => covariateType(covariate) === 'categorical');
    const random = randomParameters(P);
    const correlations = [];
    for (let row = 1; row < random.length; row += 1) {
      for (let column = 0; column < row; column += 1) {
        const left = random[column], right = random[row];
        const value = covariance(left.name, right.name) / Math.sqrt(iivVariance(left) * iivVariance(right));
        if (Math.abs(value) > 1e-12) correlations.push({ left, right, value, name: `corr_${left.name}_${right.name}` });
      }
    }
    const betaName = (/** @type {Covariate} */ covariate) => `beta_${covariateName(covariate.name)}_${covariate.target}`;
    const transformedName = (/** @type {Covariate} */ covariate) => `logt_${covariateName(covariate.name)}`;
    const individualInputs = [
      ...P.map((parameter) => `${parameter.name}_pop`),
      ...random.map((parameter) => `omega_${parameter.name}`),
      ...correlations.map((correlation) => correlation.name),
      ...C.map(betaName),
      ...continuous.map(transformedName),
      ...categorical.map((covariate) => covariateName(covariate.name))
    ];
    const L = [];

    L.push(`; PK_LEGO_SPEC_V1:${encodeURIComponent(JSON.stringify(legoExportSpec(tMax, activePreset)))}`);
    L.push('');
    L.push('DESCRIPTION:');
    L.push('Modele genere par l\'Atelier Lego de Pharmacometrie Pratique.');
    L.push('');
    L.push('; Valeurs initiales suggerees pour les parametres de population :');
    for (const parameter of P) {
      L.push(`;   ${parameter.name}_pop = ${fmt(parameter.value)} ; ${parameter.note} (${parameter.unit})`);
      if (random.some((candidate) => candidate.name === parameter.name)) L.push(`;   omega_${parameter.name} = ${fmt(Math.sqrt(iivVariance(parameter)))} ; ecart-type interindividuel`);
    }
    for (const correlation of correlations) L.push(`;   ${correlation.name} = ${fmt(correlation.value)} ; correlation des effets aleatoires`);
    for (const covariate of C) L.push(`;   ${betaName(covariate)} = ${fmt(covariate.beta)}`);
    if (residualUses('additive')) L.push(`;   a = ${fmt(residualError.additive)} ; ecart-type de l'erreur additive`);
    if (residualUses('proportional')) L.push(`;   b = ${fmt(residualError.proportional)} ; ecart-type de l'erreur proportionnelle`);

    if (C.length) {
      L.push('');
      L.push('[COVARIATE]');
      L.push(`input = {${U.map((covariate) => covariateName(covariate.name)).join(', ')}}`);
      for (const covariate of categorical) {
        const name = covariateName(covariate.name);
        L.push(`${name} = {type=categorical, categories={${fmt(covariate.reference)}, ${fmt(covariate.comparison)}}}`);
      }
      if (continuous.length) {
        L.push('');
        L.push('EQUATION:');
        for (const covariate of continuous) {
          const name = covariateName(covariate.name);
          L.push(`${transformedName(covariate)} = log(${name}/${fmt(covariate.reference)})`);
        }
      }
    }

    L.push('');
    L.push('[INDIVIDUAL]');
    L.push(`input = {${individualInputs.join(', ')}}`);
    for (const covariate of categorical) {
      const name = covariateName(covariate.name);
      L.push(`${name} = {type=categorical, categories={${fmt(covariate.reference)}, ${fmt(covariate.comparison)}}}`);
    }
    L.push('');
    L.push('DEFINITION:');
    for (const parameter of P) {
      const effects = C.filter((covariate) => covariate.target === parameter.name);
      const options = [
        parameter.value > 0 ? 'distribution=logNormal' : 'distribution=normal',
        `typical=${parameter.name}_pop`
      ];
      if (effects.length) {
        const covariateTerms = effects.map((covariate) => covariateType(covariate) === 'continuous'
          ? transformedName(covariate)
          : covariateName(covariate.name));
        const coefficientTerms = effects.map((covariate) => covariateType(covariate) === 'continuous'
          ? betaName(covariate)
          : `{0, ${betaName(covariate)}}`);
        options.push(`covariate=${effects.length === 1 ? covariateTerms[0] : `{${covariateTerms.join(', ')}}`}`);
        options.push(`coefficient=${effects.length === 1 ? coefficientTerms[0] : `{${coefficientTerms.join(', ')}}`}`);
      }
      options.push(random.some((candidate) => candidate.name === parameter.name) ? `sd=omega_${parameter.name}` : 'no-variability');
      L.push(`${parameter.name} = {${options.join(', ')}}`);
    }
    for (const correlation of correlations) L.push(`correlation = {level=id, r(${correlation.left.name}, ${correlation.right.name})=${correlation.name}}`);

    L.push('');
    L.push('[LONGITUDINAL]');
    const residualInputs = [residualUses('additive') ? 'a' : '', residualUses('proportional') ? 'b' : ''].filter(Boolean);
    L.push(`input = {${[...P.map((parameter) => parameter.name), ...residualInputs].join(', ')}}`);
    L.push('');
    L.push('PK:');
    if (dosed.length) {
      dosed.forEach((node) => {
        const name = rid(node.name);
        const options = [`target=${name}`];
        if (dosed.length > 1) options.push('adm=1', `p=${doseFractionExpression(node)}`);
        if ((node.tlag ?? 0) > 0) options.push(`Tlag=tlag_${name}`);
        if (node.inputType === 'zero_order') options.push(`Tk0=${durationParameterName(node)}`);
        L.push(`depot(${options.join(', ')})`);
      });
    } else {
      L.push('; Aucun compartiment dose : attribuez une dose dans l\'atelier.');
    }
    L.push('');
    L.push('EQUATION:');
    L.push('odeType = stiff');
    L.push('t_0 = 0');
    for (const node of nodes) {
      const name = rid(node.name);
      const initial = node.kind === 'tumor' || node.kind === 'interaction' ? special(node, 'mlx').initial : node.kind === 'response' ? `kin_${name}/kout_${name}` : '0';
      L.push(`${name}_0 = ${initial}`);
    }
    L.push('');
    for (const node of nodes) {
      const name = rid(node.name);
      if (node.kind === 'effect') {
        L.push(`ddt_${name} = ke0_${name}*(${driverConc(node)} - ${name})`);
      } else if (node.kind === 'response') {
        L.push(`ddt_${name} = kin_${name}*(1 + smax_${name}*${driverConc(node)}/(sc50_${name} + ${driverConc(node)})) - kout_${name}*${name}`);
      } else {
        L.push(`ddt_${name} = ${node.kind === 'tumor' || node.kind === 'interaction' ? special(node, 'mlx').derivative : massTerms(node)}`);
      }
    }
    L.push('');
    for (const node of concSources()) L.push(`C_${rid(node.name)} = ${rid(node.name)}/v_${rid(node.name)}`);
    L.push('');
    L.push('DEFINITION:');
    const mlxError = residualError.type === 'additive' ? 'constant(a)'
      : residualError.type === 'proportional' ? 'proportional(b)'
        : 'combined1(a, b)';
    L.push(`DV = {distribution=normal, prediction=C_${rid(observed.name)}, errorModel=${mlxError}}`);
    L.push('');
    L.push('OUTPUT:');
    L.push('output = {DV}');
    const tableOutputs = [
      ...concSources().map((node) => `C_${rid(node.name)}`),
      ...nodes.filter((node) => !isMassNode(node)).map((node) => rid(node.name))
    ];
    if (tableOutputs.length) L.push(`table = {${tableOutputs.join(', ')}}`);
    return L.join('\n');
  })();

  // ── NONMEM / NM-TRAN : ODE générales avec ADVAN13 ──
  $: codeNonmem = (() => {
    void iivVariances; void iivCovariances; void residualError;
    if (!nodes.length) return '; Ajoutez des compartiments : le control stream se génère au fur et à mesure.';
    if (!observed) return '; Ajoutez un compartiment central, périphérique ou métabolite pour définir la concentration observée.';
    const P = modelParams();
    const C = validCovariates(P, covariates);
    const U = uniqueCovariates(C);
    const dosed = dosedNodes();
    const adm = dosed[0] ?? nodes.find((node) => node.kind !== 'effect' && node.kind !== 'response') ?? nodes[0];
    const nodeIndex = new Map(nodes.map((node, index) => [node.id, index + 1]));
    const rateColumn = dosed.some((node) => node.inputType === 'zero_order') ? ' RATE' : '';
    const parameterVariable = new Map(P.map((parameter, index) => [parameter.name, `P${index + 1}`]));
    const thetaIndex = new Map(P.map((parameter, index) => [parameter.name, index + 1]));
    const betaIndex = new Map(C.map((covariate, index) => [covariate.id, P.length + index + 1]));
    const random = randomParameters(P);
    const etaIndex = new Map(random.map((parameter, index) => [parameter.name, index + 1]));
    const categorical = C.filter((covariate) => covariateType(covariate) === 'categorical');
    const categoryIndicator = new Map(categorical.map((covariate, index) => [covariate.id, `CAT${index + 1}`]));
    const nonmemDataName = new Map(U.map((covariate, index) => {
      const name = covariateName(covariate.name);
      return [name, name.length <= 20 ? name : `COV${index + 1}_${name.slice(0, 13)}`];
    }));
    const nonmemCovariate = new Map(C.map((covariate) => [covariate.id, nonmemDataName.get(covariateName(covariate.name))]));
    const pvar = (/** @type {string} */ name) => parameterVariable.get(name) ?? '0';
    const state = (/** @type {number} */ id) => `A(${nodeIndex.get(id) ?? 1})`;
    const nonmemDriver = (/** @type {Node} */ node) => {
      const source = nodes.find((candidate) => candidate.id === node.source);
      if (!source) return '0';
      const amount = state(source.id);
      return KINDS[source.kind]?.vol ? `(${amount}/${pvar(`v_${rid(source.name)}`)})` : amount;
    };
    const nonmemSpecial = (/** @type {Node} */ n) => advancedExpressions(n, nonmemDriver(n), state(n.id), key => pvar(`${key}_${rid(n.name)}`), 'nonmem');
    const nonmemMassTerms = (/** @type {Node} */ node) => {
      const terms = [];
      for (const edge of edges.filter(e => e.from === node.id || e.to === node.id)) {
        let flux = baseEdgeFlux(edge, state(edge.from)).replace(/\^/g, '**');
        flux = flux.replace(/\b[A-Za-z_]\w*\b/g, name => parameterVariable.get(name) ?? name);
        const factors = nodes.filter(n => n.kind === 'interaction' && n.targetFrom === edge.from && n.targetTo === edge.to)
          .map(n => `*(${nonmemSpecial(n).factor})`).join('');
        terms.push(`${edge.from === node.id ? '-' : '+'} ${flux}${factors}`);
      }
      return terms.join(' ') || '0';
    };
    const L = [];

    L.push(`; PK_LEGO_SPEC_V1:${encodeURIComponent(JSON.stringify(legoExportSpec(tMax, activePreset)))}`);
    L.push('$PROBLEM Atelier Lego - modele PK/PD genere');
    L.push('; Donnees attendues : une ligne par evenement dans data.csv.');
    L.push('; Colonnes minimales : ID TIME DV AMT EVID MDV CMT' + rateColumn + (U.length ? ` ${U.map((covariate) => nonmemCovariate.get(covariate.id)).join(' ')}` : ''));
    L.push(`; Compartiment dose par defaut : ${nodeIndex.get(adm.id)} (${rid(adm.name)}). Observation : ${nodeIndex.get(observed.id)} (${rid(observed.name)}).`);
    if (dosed.length > 1) L.push(`; Voies paralleles : dupliquez chaque dose vers CMT ${dosed.map((node) => nodeIndex.get(node.id)).join(', ')}; F1, F2, ... appliquent les fractions.`);
    if (dosed.some((node) => node.inputType === 'zero_order')) L.push('; Pour chaque voie d ordre zero, utilisez RATE=-2 afin que Dn fixe la duree.');
    for (const covariate of C) {
      const sourceName = covariateName(covariate.name);
      const dataName = nonmemCovariate.get(covariate.id);
      if (sourceName !== dataName) L.push(`; Renommer la colonne ${sourceName} en ${dataName} pour NONMEM.`);
    }
    L.push(`$INPUT ID TIME DV AMT EVID MDV CMT${rateColumn}${U.length ? ` ${U.map((covariate) => nonmemCovariate.get(covariate.id)).join(' ')}` : ''}`);
    L.push('$DATA data.csv IGNORE=@');
    L.push('$SUBROUTINES ADVAN13 TOL=9');
    L.push('$MODEL');
    for (const node of nodes) {
      const tags = [];
      if (node.id === adm.id) tags.push('DEFDOSE');
      if (node.id === observed.id) tags.push('DEFOBS');
      const compartmentName = `C${nodeIndex.get(node.id)}_${rid(node.name).toUpperCase().slice(0, 12)}`;
      L.push(`COMP=(${compartmentName}${tags.length ? `,${tags.join(',')}` : ''})`);
    }
    L.push('');
    L.push('$PK');
    L.push('; P1, P2, ... correspondent aux parametres listes dans $THETA.');
    for (const covariate of categorical) {
      const indicator = categoryIndicator.get(covariate.id);
      const name = nonmemCovariate.get(covariate.id);
      L.push(`${indicator}=0`);
      L.push(`IF (${name}.EQ.${fmt(covariate.comparison)}) ${indicator}=1`);
    }
    for (const parameter of P) {
      const typical = `TV${parameterVariable.get(parameter.name)}`;
      const effects = C
        .filter((covariate) => covariate.target === parameter.name)
        .map((covariate) => {
          const beta = `THETA(${betaIndex.get(covariate.id)})`;
          return covariateType(covariate) === 'categorical'
            ? `*EXP(${beta}*${categoryIndicator.get(covariate.id)})`
            : `*(${nonmemCovariate.get(covariate.id)}/${fmt(covariate.reference)})**${beta}`;
        })
        .join('');
      L.push(`${typical}=THETA(${thetaIndex.get(parameter.name)})${effects}`);
      const eta = etaIndex.get(parameter.name);
      L.push(`${parameterVariable.get(parameter.name)}=${typical}${eta ? `*EXP(ETA(${eta}))` : ''}`);
    }
    for (const node of dosed) {
      const index = nodeIndex.get(node.id);
      const name = rid(node.name);
      if (dosed.length > 1) {
        const fraction = pvar(fractionParameterName(node));
        L.push(`F${index}=${node.fractionComplementOf ? `1-${fraction}` : fraction}`);
      }
      if ((node.tlag ?? 0) > 0) L.push(`ALAG${index}=${pvar(`tlag_${name}`)}`);
      if (node.inputType === 'zero_order') L.push(`D${index}=${pvar(durationParameterName(node))}`);
    }
    const responseNodes = nodes.filter((candidate) => ['response','tumor','interaction'].includes(candidate.kind));
    if (responseNodes.length) {
      L.push('IF (A_0FLG.EQ.1) THEN');
      for (const node of responseNodes) {
        const name = rid(node.name);
        L.push(`  A_0(${nodeIndex.get(node.id)})=${node.kind === 'response' ? `${pvar(`kin_${name}`)}/${pvar(`kout_${name}`)}` : nonmemSpecial(node).initial}`);
      }
      L.push('ENDIF');
    }
    L.push('');
    L.push('$DES');
    for (const node of nodes) {
      const name = rid(node.name);
      const index = nodeIndex.get(node.id);
      if (node.kind === 'effect') {
        L.push(`DADT(${index})=${pvar(`ke0_${name}`)}*(${nonmemDriver(node)}-A(${index}))`);
      } else if (node.kind === 'response') {
        const driver = nonmemDriver(node);
        L.push(`DADT(${index})=${pvar(`kin_${name}`)}*(1+${pvar(`smax_${name}`)}*${driver}/(${pvar(`sc50_${name}`)}+${driver}))-${pvar(`kout_${name}`)}*A(${index})`);
      } else {
        L.push(`DADT(${index})=${node.kind === 'tumor' || node.kind === 'interaction' ? nonmemSpecial(node).derivative : nonmemMassTerms(node)}`);
      }
    }
    L.push('');
    L.push('$ERROR');
    L.push(`IPRED=A(${nodeIndex.get(observed.id)})/${pvar(`v_${rid(observed.name)}`)}`);
    L.push(`Y=${residualExpression()}`);
    L.push('');
    L.push('$THETA');
    for (const parameter of P) {
      L.push(`(0, ${fmt(parameter.value)}) ; THETA(${thetaIndex.get(parameter.name)}) -> ${parameterVariable.get(parameter.name)} = ${parameter.name}, ${parameter.note} (${parameter.unit})`);
    }
    for (const covariate of C) {
      L.push(`(-10, ${fmt(covariate.beta)}, 10) ; THETA(${betaIndex.get(covariate.id)}) -> effet ${covariateName(covariate.name)} sur ${covariate.target}`);
    }
    L.push('');
    L.push(random.length > 1 ? `$OMEGA BLOCK(${random.length})` : '$OMEGA');
    if (random.length) {
      for (let row = 0; row < random.length; row += 1) {
        const values = [];
        for (let column = 0; column <= row; column += 1) values.push(fmt(row === column ? iivVariance(random[row]) : covariance(random[row].name, random[column].name)));
        L.push(`${values.join(' ')} ; ETA(${row + 1}) -> IIV ${random[row].name}`);
      }
    } else {
      L.push('0 FIX ; aucune variabilite interindividuelle selectionnee');
    }
    L.push('');
    L.push('$SIGMA');
    if (residualUses('proportional')) L.push(`${fmt(residualError.proportional ** 2)} ; variance proportionnelle`);
    if (residualUses('additive')) L.push(`${fmt(residualError.additive ** 2)} ; variance additive`);
    L.push('');
    L.push('$ESTIMATION METHOD=1 INTERACTION MAXEVAL=9999 PRINT=5 SIGDIGITS=3');
    L.push('$COVARIANCE PRINT=E MATRIX=S');
    L.push('$TABLE ID TIME DV IPRED CWRES NOPRINT ONEHEADER FILE=lego_results.csv');
    return L.join('\n');
  })();

  // ── onglets + copie ──
  // ATTENTION : ne PAS nommer cette fonction `copy` — ce nom est déjà celui de la
  // variable réactive d'internationalisation ci-dessus, et la collision casse
  // l'hydratation de toute la page.
  let codeTab = 'nlmixr2';
  let copiedTab = '';
  let transferredCode = '';
  $: guidedSimulationConfig = tdmReady ? legoSimulationConfig(tdmModelSpec(), tMax, codeMrgsolve) : null;
  $: simulationConfig = tdmReady ? {
    mode: guidedSimulationConfig ? 'guided' : 'code',
    guided: guidedSimulationConfig,
    modelCode: codeMrgsolve,
    dose: Number(nodes.find((node) => Number(node.dose) > 0)?.dose ?? 100),
    tEnd: Math.max(1, Number(tMax) || 24)
  } : null;
  /** @type {ReturnType<typeof setTimeout> | undefined} */ let copyTimer;
  $: activeCode = codeTab === 'nlmixr2' ? codeNlmixr
    : codeTab === 'mrgsolve' ? codeMrgsolve
      : codeTab === 'mlxtran' ? codeMlxtran
        : codeNonmem;
  $: activeCodeNote = codeTab === 'nlmixr2' ? copy.pages.legoNoteNlmixr
    : codeTab === 'mrgsolve' ? copy.pages.legoNoteMrgsolve
      : codeTab === 'mlxtran' ? copy.pages.legoNoteMlxtran
        : copy.pages.legoNoteNonmem;
  async function copierCode() {
    try {
      await navigator.clipboard.writeText(activeCode);
      copiedTab = codeTab;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => (copiedTab = ''), 2000);
    } catch (e) {
      // Presse-papiers refusé : le texte reste sélectionnable à la main.
    }
  }

  async function ouvrirDansTdm() {
    if (!tdmReady) return;
    stopTransfer();
    codeTab = 'mrgsolve';
    const code = codeMrgsolve;

    try {
      await navigator.clipboard.writeText(code);
      copiedTab = 'mrgsolve';
    } catch (e) {
      // Le transfert direct reste disponible si le presse-papiers est refusé.
    }

    const targetUrl = new URL(tdmEngineUrl, window.location.href);
    targetUrl.searchParams.set('source', 'custom');
    targetUrl.searchParams.set('bridge', 'lego');
    targetUrl.searchParams.set('lang', $language === 'en' ? 'en' : 'fr');
    const targetWindow = window.open(targetUrl.toString(), 'pk_tdm_engine');
    if (!targetWindow) return;

    const targetOrigin = targetUrl.origin;
    const message = { type: 'pk-lego-model', name: 'lego_model', code, spec: tdmModelSpec() };
    let attempts = 0;
    /** @type {ReturnType<typeof setInterval> | undefined} */
    let transferTimer;

    const cleanup = () => {
      if (transferTimer) clearInterval(transferTimer);
      window.removeEventListener('message', acknowledge);
    };
    stopTransfer = cleanup;
    /** @param {MessageEvent} event */
    const acknowledge = (event) => {
      if (event.source !== targetWindow || event.origin !== targetOrigin || event.data?.type !== 'pk-lego-model-ack') return;
      transferredCode = code;
      cleanup();
    };
    const transmit = () => {
      attempts += 1;
      if (attempts > 40 || targetWindow.closed) return cleanup();
      targetWindow.postMessage(message, targetOrigin);
    };

    window.addEventListener('message', acknowledge);
    transmit();
    transferTimer = setInterval(transmit, 500);
  }

  /** @param {Node} n */
  const cxn = (n) => n.x + NW / 2;
  /** @param {Node} n */
  const cyn = (n) => n.y + NH / 2;
</script>

<svelte:head><title>{workshopTitle} | Pharmacometrie Pratique</title></svelte:head>

<div inert={!mounted}>
<header class="head">
  <p class="eyebrow">{copy.pages.legoEyebrow}</p>
  <h1>{workshopTitle}</h1>
  <LabTransfer destination="lego" apply={applyLaboratory} note={$language === 'en' ? 'Transfers structure, PK parameters, units, horizon and first dose. Lego simulates a single dose; use TDM for the full repeated-dose schedule. Existing diagram will be replaced.' : 'Transfert de la structure, des parametres PK, des unites, de l\'horizon et de la premiere dose. Lego simule une dose unique ; utiliser TDM pour le calendrier complet. Le schema actuel sera remplace.'}/>
  <p class="lede">{profile === 'pk'
    ? ($language === 'en' ? 'Absorption, distribution and elimination. A compartmental PK model, with continuous or categorical covariates.' : 'Absorption, distribution et elimination. Un modele PK compartimental, avec covariables continues ou categorielles.')
    : profile === 'translator'
      ? ($language === 'en' ? 'MLXTRAN, mrgsolve or NONMEM: from source code to a compartmental diagram. Unsupported equations are reported without replacing the previous model.' : 'MLXTRAN, mrgsolve ou NONMEM : du code source au schema compartimental. Les equations non prises en charge sont signalees sans remplacer le modele precedent.')
      : lego.lede}</p>
</header>

{#if profile === 'translator'}
<details class="mlxtran-import" open>
  <summary>{importUi.importModel}</summary>
  <div class="mlxtran-import-body">
    <div class="import-formats" role="tablist" aria-label={importUi.format}>
      {#each [['mlxtran', 'MLXTRAN'], ['mrgsolve', 'mrgsolve'], ['nonmem', 'NONMEM']] as format}
        <button
          type="button"
          role="tab"
          aria-selected={importFormat === format[0]}
          class:on={importFormat === format[0]}
          on:click={() => { importFormat = format[0]; modelImportStatus = null; }}
        >{format[1]}</button>
      {/each}
    </div>
    <label>
      <span>{importUi.modelCode} · {importFormat === 'mlxtran' ? 'MLXTRAN' : importFormat === 'mrgsolve' ? 'mrgsolve' : 'NONMEM'}</span>
      <textarea rows="9" bind:value={importText} placeholder={importUi.placeholder}></textarea>
    </label>
    <div class="mlxtran-import-actions">
      <label class="file-button">
        <input type="file" accept=".txt,.mlxtran,.cpp,.cc,.cxx,.mod,.ctl,text/plain" on:change={lireFichierModele} />
        <span>{importUi.modelFile}</span>
      </label>
      <button class="import-button" disabled={!importText.trim()} on:click={importerModel}>{importUi.applyImport}</button>
    </div>
    {#if modelImportStatus?.kind === 'error'}
      <p class="import-status error" role="alert">{/** @type {Record<string, string>} */ (importUi.errors)[modelImportStatus.code ?? 'unsupportedStructure'] ?? importUi.errors.unsupportedStructure}{#if modelImportStatus.detail} <code>{modelImportStatus.detail}</code>{/if}</p>
    {:else if modelImportStatus?.kind === 'ok'}
      <div class="import-status ok" role="status">
        <strong>{modelImportStatus.mode === 'exact' ? importUi.importExact : importUi.importRecognized}</strong>
        {#if modelImportStatus.warnings?.length}
          <span>{importUi.importWarnings}</span>
          <ul>{#each modelImportStatus.warnings as warning}<li>{importWarningText(warning)}</li>{/each}</ul>
        {/if}
      </div>
    {/if}
  </div>
</details>
{/if}

<fieldset class="toolbar" disabled={!mounted}>
  <div class="tgroup">
    <span class="tlabel">{lego.add}</span>
    {#each availableKinds as kind}
      <button class="add" style={`--c:${KINDS[kind].color}`} on:click={() => addNode(kind)}><Plus size={13}/>{kindLabel(kind)}</button>
    {/each}
  </div>
  <div class="tgroup">
    <span class="tlabel">{lego.arrow}</span>
    <button class:on={mode === 'connect'} on:click={() => { mode = mode === 'connect' ? 'select' : 'connect'; connectFrom = null; }}>
      {mode === 'connect' ? (connectFrom === null ? lego.clickSource : lego.clickTarget) : `↳ ${lego.connect}`}
    </button>
  </div>
  <div class="tgroup">
    <span class="tlabel">{lego.templates}</span>
    <button on:click={() => preset('oral1')}>Oral 1-cpt</button>
    <button on:click={() => preset('iv2')}>IV 2-cpt</button>
    <button on:click={() => preset('transit')}>Transit ×3</button>
    <button on:click={() => preset('dual')}>{lego.dualAbsorption}</button>
    {#if profile !== 'pk'}
    <button on:click={() => preset('koka')}>{lego.koka}</button>
    <button on:click={() => preset('pp6m')}>{lego.pp6m}</button>
    <button on:click={() => preset('metab')}>{lego.parentMetabolite}</button>
    <button on:click={() => preset('effect')}>{kindLabel('effect')}</button>
    <button data-testid="preset-tgi" on:click={() => preset('tgi')}>PK + Ce + TGI</button>
    <button data-testid="preset-autoinhibition" on:click={() => preset('autoinhibition')}>{$language === 'en' ? 'PK + auto-inhibition + TGI' : 'PK + auto-inhibition + TGI'}</button>
    {/if}
    <button class="clear" on:click={clearAll}>{lego.clear}</button>
  </div>
  <label class="s"><span>{lego.duration}</span><input class="num" type="number" min="1" step="1" bind:value={tMax} /></label>
</fieldset>


{#if activePreset === 'koka' || activePreset === 'pp6m'}
  <p class="template-note">
    {activePreset === 'koka' ? lego.kokaNote : lego.pp6mNote}
    <a href={activePreset === 'koka' ? 'https://doi.org/10.2165/11316870-000000000-00000' : 'https://doi.org/10.1007/s13318-024-00899-z'} target="_blank" rel="noopener noreferrer">DOI</a>
  </p>
{/if}

<div class="continuity" data-testid="model-continuity">
  <button disabled={!simulationConfig} on:click={() => continueIn('simulation')} title={$language === 'en' ? 'Send the complete mrgsolve code to Simulation' : 'Envoyer le code mrgsolve complet vers Simulation'}><Play size={15}/> Simulation</button>
  {#if profile !== 'advanced'}<button disabled={!tdmReady} on:click={() => continueIn('advanced')}><ArrowRight size={15}/> Advanced</button>{/if}
  {#if profile !== 'pk'}<button disabled={!tdmReady || !purePk} on:click={() => continueIn('pk')}><ArrowRight size={15}/> PK</button>{/if}
  <label>{$language === 'en' ? 'Route for PD / DDI' : 'Voie pour PD / DDI'}<select bind:value={handoffRoute}><option value="">{$language === 'en' ? 'Select route' : 'Choisir la voie'}</option><option>Oral</option><option>IV</option></select></label>
  <button disabled={!tdmReady || !massOnly || !handoffRoute} on:click={() => continueIn('pd')}><ArrowRight size={15}/> PD</button>
  <label>{$language === 'en' ? 'DDI destination' : 'Destination DDI'}<select bind:value={handoffSide}><option value="1">PK 1</option><option value="2">PK 2</option></select></label>
  <button disabled={!tdmReady || !massOnly || !handoffRoute} on:click={() => continueIn('ddi')}><ArrowRight size={15}/> DDI</button>
  {#if nodes.length && !purePk}<span>{$language === 'en' ? 'Metabolite / PD blocks remain editable in Advanced and exportable to the engine.' : 'Les blocs metabolite / PD restent editables dans Advanced et exportables vers le moteur.'}</span>{/if}
</div>

{#if nodes.some(n => !isMassNode(n))}
  <p class="template-note">{$language === 'en'
    ? 'Dashed links carry a concentration signal, not drug mass. TGI: size in mm and time in hours. Interaction multiplies a selected PK flux; a same-drug source represents auto-inhibition. Parallel dose inputs still share one common dose. Independent drug schedules remain in DDI.'
    : 'Les liens pointilles transmettent une concentration, pas une masse de medicament. TGI : taille en mm et temps en heures. Interaction multiplie un flux PK ; une source issue du meme medicament represente une auto-inhibition. Les entrees paralleles partagent toujours une dose commune. Les calendriers de deux medicaments independants restent dans DDI.'}</p>
  {#if !advancedGraphValid(nodes, edges)}<p class="graph-error" role="alert">{$language === 'en' ? 'Check block sources, target fluxes and parameters before exporting.' : 'Verifiez les sources des blocs, les flux cibles et les parametres avant export.'}</p>{/if}
{/if}
<div class="builder">
  <div class="stage">
    <svg bind:this={svgEl} viewBox={`0 0 ${VBW} ${VBH}`} class="canvas" on:pointermove={moveDrag} on:pointerup={endDrag} on:pointerleave={endDrag} role="application" aria-label={lego.editorAria}>
      <defs>
        <marker id="arw" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="var(--text-secondary)" /></marker>
      </defs>
      <!-- flèches -->
      {#each edges as e}
        {@const from = nodes.find((n) => n.id === e.from)}
        {#if from}
          {#if e.to === 'OUT'}
            <g class="edge-action">
              <title>{lego.clickArrow}</title>
              <line x1={cxn(from)} y1={from.y + NH} x2={cxn(from)} y2={from.y + NH + 30} class="edge-hitline" />
              <circle cx={cxn(from)} cy={from.y + NH + 15} r="12" class="edge-hitarea" role="button" tabindex="0" aria-label={lego.clickArrow} on:click={() => editEdge(e)} on:keydown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); editEdge(e); } }} />
              <line x1={cxn(from)} y1={from.y + NH} x2={cxn(from)} y2={from.y + NH + 30} class="edge" marker-end="url(#arw)" />
              <text x={cxn(from) + 20} y={from.y + NH + 18} class="klbl">{edgeKinetics(e) === 'hill' ? 'Hill' : edgeKinetics(e) === 'michaelis_menten' ? 'MM' : eliminationParameterization(e) === 'clearance' ? `CL=${Number(e.cl ?? 0).toFixed(1)}` : `k=${Number(e.k).toFixed(2)}`}</text>
              <text x={cxn(from) - 14} y={from.y + NH + 34} class="elim">{lego.eliminationShort}</text>
            </g>
          {:else}
            {@const to = nodes.find((n) => n.id === e.to)}
            {#if to}
              <g class="edge-action">
                <title>{lego.clickArrow}</title>
                <line x1={cxn(from)} y1={cyn(from)} x2={cxn(to)} y2={cyn(to)} class="edge-hitline" />
                <circle cx={(cxn(from) + cxn(to)) / 2} cy={(cyn(from) + cyn(to)) / 2} r="12" class="edge-hitarea" role="button" tabindex="0" aria-label={lego.clickArrow} on:click={() => editEdge(e)} on:keydown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); editEdge(e); } }} />
                <line x1={cxn(from)} y1={cyn(from)} x2={cxn(to)} y2={cyn(to)} class="edge" marker-end="url(#arw)" />
                <text x={(cxn(from) + cxn(to)) / 2} y={(cyn(from) + cyn(to)) / 2 - 4} class="klbl">{edgeKinetics(e) === 'hill' ? 'Hill' : edgeKinetics(e) === 'michaelis_menten' ? 'MM' : transferParameterization(e) === 'clearance' ? `Q=${Number(e.q ?? 0).toFixed(1)}` : `k=${Number(e.k).toFixed(2)}`}</text>
              </g>
            {/if}
          {/if}
        {/if}
      {/each}
      {#each nodes.filter(n => !isMassNode(n)) as node}
        {@const source = nodes.find(n => n.id === node.source)}
        {#if source}<path data-testid="effect-link" d={`M${cxn(source)},${cyn(source)} L${cxn(node)},${cyn(node)}`} class="information-link" marker-end="url(#arw)" />{/if}
        {#if node.kind === 'interaction'}
          {@const target = edges.find(e => e.from === node.targetFrom && e.to === node.targetTo)}
          {@const from = nodes.find(n => n.id === target?.from)}
          {@const to = nodes.find(n => n.id === target?.to)}
          {#if from && target}<path data-testid="modifier-link" d={`M${cxn(node)},${node.y + NH} Q${cxn(node)},${node.y + NH + 30} ${to ? (cxn(from)+cxn(to))/2 : cxn(from)},${to ? (cyn(from)+cyn(to))/2 : from.y+NH+22}`} class="modifier-link" marker-end="url(#arw)" />{/if}
        {/if}
      {/each}
      <!-- compartiments -->
      {#each nodes as n}
        <g transform={`translate(${n.x},${n.y})`} class="node" class:sel={selectedId === n.id} class:cf={connectFrom === n.id}
           on:pointerdown={(e) => startDrag(e, n)} on:click={() => nodeClick(n.id)}
           on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nodeClick(n.id); } }} role="button" tabindex="0">
          <rect width={NW} height={NH} rx="7" style={`fill:color-mix(in srgb, ${KINDS[n.kind].color} 15%, var(--bg-tertiary)); stroke:${KINDS[n.kind].color}`} />
          <text x={NW / 2} y={17} class="nname">{n.name}</text>
          <text x={NW / 2} y={31} class="nkind">{kindLabel(n.kind)}{n.dose ? ` · ${n.dose}mg` : ''}</text>
        </g>
      {/each}
      {#if !nodes.length}<text x={VBW / 2} y={VBH / 2} class="hintxt">{lego.emptyCanvas}</text>{/if}
    </svg>

    <!-- courbe simulée -->
    {#if !simulationValid}<p class="graph-error" role="alert">{$language === 'en' ? 'Simulation is not finite. Check parameters and simulation duration.' : 'Simulation non finie. Verifiez les parametres et la duree de simulation.'}</p>{/if}
    {#each simulationValid ? chartGroups : [] as group}
    {@const maximum = Math.max(0.01, ...group.series.flatMap(s => s.vals))}
    <div class="chart-panel" data-chart={group.key}>
      <h3 class="chart-title">{group.key} <span>({group.unit})</span></h3>
      <svg viewBox={`0 0 ${CW} ${CH}`} class="chart" role="img" aria-label={`${group.key} · ${lego.chartAria}`}>
        <g transform={`translate(${cm.left},${cm.top})`}>
          <line x1="0" x2="0" y1="0" y2={ciH} class="axis" />
          <line x1="0" x2={ciW} y1={ciH} y2={ciH} class="axis" />
          {#each [0, 0.5, 1] as tick}
            <text x="-5" y={ciH - tick * ciH / 1.08 + 4} class="lbl" text-anchor="end">{Number((maximum * tick).toPrecision(3))}</text>
            <text x={tick * ciW} y={ciH + 14} class="lbl" text-anchor="middle">{Number((tMax * tick).toPrecision(3))}</text>
          {/each}
          {#each group.series as s}
            <path d={pathOf(s, maximum)} style={`stroke:${s.color}`} class="serie" class:dash={s.dash} />
          {/each}
          <text x={ciW / 2} y={ciH + 30} class="lbl">{lego.time}</text>
        </g>
      </svg>
        <div class="chart-legend" aria-label={lego.legendAria}>
          {#each group.series as s}
            <span class="legend-item">
              <i style={`--series-color:${s.color}`} class:dash={s.dash}></i>
              <span>{s.label} · {tMax} h: <output data-node={s.nodeId} data-value={s.vals.at(-1)}>{Number((s.vals.at(-1) ?? 0).toPrecision(4))}</output></span>
            </span>
          {/each}
        </div>
    </div>
    {/each}
  </div>

  <div class="side">
    {#if selected}
      <div class="editor">
        <div class="ehead"><strong>{selected.name}</strong><span>{kindLabel(selected.kind)}</span></div>
        <label class="s"><span>{lego.name}</span><input class="txt" bind:value={selected.name} on:input={() => { nodes = nodes; reconcileCovariates(); }} /></label>
        {#if KINDS[selected.kind].vol}<label class="s"><span>Volume (L)</span><input class="num" type="number" min="0.001" step="0.1" bind:value={selected.vol} on:input={() => (nodes = nodes)} /></label>{/if}
        {#if isMassNode(selected)}
          <div class="input-settings">
            <strong>{lego.inputSettings}</strong>
            <label class="s"><span>Dose (mg)</span><input class="num" type="number" min="0" step="1" bind:value={selected.dose} on:input={() => { nodes = nodes; reconcileCovariates(); }} /></label>
            <label class="s"><span>{lego.inputType}</span><select bind:value={selected.inputType} on:change={() => { nodes = nodes; reconcileCovariates(); }}><option value="bolus">{lego.bolusInput}</option><option value="zero_order">{lego.zeroOrderInput}</option></select></label>
            {#if selected.inputType === 'zero_order'}
              <label class="s"><span>{lego.durationLinked}</span><select value={selected.inputDurationTlagOf ?? 0} on:change={(event) => { selected.inputDurationTlagOf = Number(event.currentTarget.value) || undefined; nodes = nodes; reconcileCovariates(); }}><option value={0}>{lego.independentDuration}</option>{#each dosedNodes().filter((node) => node.id !== selected.id) as node}<option value={node.id}>{node.name}</option>{/each}</select></label>
              <label class="s"><span>{lego.inputDuration}</span><input class="num" type="number" min="0.001" step="0.1" value={selected.inputDurationTlagOf ? linkedNode(nodes, selected.inputDurationTlagOf)?.tlag : selected.inputDuration} disabled={Boolean(selected.inputDurationTlagOf)} on:input={(event) => { selected.inputDuration = Number(event.currentTarget.value); nodes = nodes; reconcileCovariates(); }} /></label>
            {/if}
            <label class="s"><span>{lego.lagTime}</span><input class="num" type="number" min="0" step="0.1" bind:value={selected.tlag} on:input={() => { nodes = nodes; reconcileCovariates(); }} /></label>
            <label class="s"><span>{lego.complementaryFraction}</span><select value={selected.fractionComplementOf ?? 0} on:change={(event) => { selected.fractionComplementOf = Number(event.currentTarget.value) || undefined; nodes = nodes; reconcileCovariates(); }}><option value={0}>{lego.independentFraction}</option>{#each dosedNodes().filter((node) => node.id !== selected.id && !node.fractionComplementOf) as node}<option value={node.id}>1 − f_{node.name}</option>{/each}</select></label>
            <label class="s"><span>{lego.doseFraction}</span><input class="num" type="number" min="0.001" max="100" step="1" value={doseFractionValue(selected)} disabled={Boolean(selected.fractionComplementOf)} on:input={(event) => { selected.doseFraction = Number(event.currentTarget.value); nodes = nodes; reconcileCovariates(); }} /></label>
            <p>{lego.inputHelp}</p>
          </div>
        {/if}
        {#if selected.kind === 'tumor' || selected.kind === 'interaction'}
          {#if selected.kind === 'tumor'}
            <label class="s"><span>{$language === 'en' ? 'Tumor growth' : 'Croissance tumorale'}</span><select bind:value={selected.growth} on:change={() => { nodes = nodes; reconcileCovariates(); }}><option value="exponential">{$language === 'en' ? 'Exponential' : 'Exponentielle'}</option><option value="logistic">{$language === 'en' ? 'Logistic' : 'Logistique'}</option><option value="gompertz">Gompertz</option></select></label>
          {:else}
            <label class="s"><span>{$language === 'en' ? 'Mechanism' : 'Mecanisme'}</span><select bind:value={selected.mechanism} on:change={() => { if (selected?.mechanism?.includes('inhibition')) selected.strength = Math.min(1, selected.strength ?? 1); nodes = nodes; reconcileCovariates(); }}>{#each ddiMechanisms as m}<option value={m.id}>{$language === 'en' ? m.en : m.fr}</option>{/each}</select></label>
            <label class="s"><span>{$language === 'en' ? 'Modified flux (k / CL / Vmax)' : 'Flux module (k / CL / Vmax)'}</span><select value={`${selected.targetFrom}->${selected.targetTo}`} on:change={event => { const e = edges.find(e => `${e.from}->${e.to}` === event.currentTarget.value); if (e && selected) { selected.targetFrom = e.from; selected.targetTo = e.to; nodes = nodes; } }}><option value="">{$language === 'en' ? 'Select flux' : 'Choisir un flux'}</option>{#each edges as e}<option value={`${e.from}->${e.to}`}>{nodes.find(n => n.id === e.from)?.name} → {e.to === 'OUT' ? lego.eliminationShort : nodes.find(n => n.id === e.to)?.name}</option>{/each}</select></label>
          {/if}
          {#each advancedFields(selected) as field}
            <label class="s"><span>{field.key.toUpperCase()} ({field.unit})</span><input class="num" type="number" min={field.min} max={field.max} step="any" value={Reflect.get(selected, field.key)} on:input={event => { if (selected) { Reflect.set(selected, field.key, event.currentTarget.value === '' ? NaN : Number(event.currentTarget.value)); nodes = nodes; } }} /></label>
          {/each}
        {/if}
        {#if !isMassNode(selected)}
          <label class="s src"><span>{lego.source}</span><select bind:value={selected.source} on:change={() => (nodes = nodes)}><option value={undefined}>{$language === 'en' ? 'Select concentration' : 'Choisir la concentration'}</option>{#each nodes.filter(n => n.id !== selected.id && (KINDS[n.kind].vol || n.kind === 'effect')) as c}<option value={c.id}>{c.name}{KINDS[c.kind].vol ? ' / V' : ''}</option>{/each}</select></label>
        {/if}
        {#if selected.kind === 'effect'}
          <label class="s"><span>ke0 (1/h)</span><input class="num" type="number" min="0" step="0.01" bind:value={selected.ke0} on:input={() => (nodes = nodes)} /></label>
        {/if}
        {#if selected.kind === 'response'}
          <label class="s"><span>kin</span><input class="num" type="number" min="0" step="0.1" bind:value={selected.kin} on:input={() => (nodes = nodes)} /></label>
          <label class="s"><span>kout (1/h)</span><input class="num" type="number" min="0.0001" step="0.01" bind:value={selected.kout} on:input={() => (nodes = nodes)} /></label>
          <label class="s"><span>Smax</span><input class="num" type="number" step="0.1" bind:value={selected.smax} on:input={() => (nodes = nodes)} /></label>
          <label class="s"><span>SC50 (mg/L)</span><input class="num" type="number" min="0.0001" step="0.1" bind:value={selected.sc50} on:input={() => (nodes = nodes)} /></label>
        {/if}
        <div class="ebtns">
          {#if isMassNode(selected)}<button on:click={() => addElim(selected.id)}>+ {lego.addElimination}</button>{/if}
          <button class="del" on:click={() => deleteNode(selected.id)}>{lego.remove}</button>
        </div>
      </div>
    {:else}
      <p class="tip">{lego.editorTip}</p>
    {/if}

    {#if edges.length}
      <div class="rates">
        <span class="rlabel">{lego.transferRates}</span>
        {#each edges as e}
          {@const from = nodes.find((n) => n.id === e.from)}
          {@const to = e.to === 'OUT' ? { name: lego.eliminationShort } : nodes.find((n) => n.id === e.to)}
          {#if from && to}
            <div class="rate">
              <span class="rn">{from.name}→{to.name}</span>
              <label><span>{lego.kinetics}</span><select bind:value={e.kinetics} on:change={() => updateEdge(e)}><option value="first_order">{lego.firstOrder}</option><option value="michaelis_menten">{lego.michaelisMenten}</option><option value="hill">{lego.hill}</option></select></label>
              {#if ['michaelis_menten', 'hill'].includes(edgeKinetics(e))}
                <label><span>Vmax (mg/h)</span><input id={`edge-value-${e.id}`} class="num" type="number" min="0.000001" step="0.1" bind:value={e.vmax} on:input={() => { edges = edges; reconcileCovariates(); }} /></label>
                <label><span>{edgeKinetics(e) === 'hill' ? 'A50' : 'Km'} (mg)</span><input class="num" type="number" min="0.000001" step="0.1" bind:value={e.km} on:input={() => { edges = edges; reconcileCovariates(); }} /></label>
                {#if edgeKinetics(e) === 'hill'}<label><span>γ</span><input class="num" type="number" min="0.000001" step="0.1" bind:value={e.gamma} on:input={() => { edges = edges; reconcileCovariates(); }} /></label>{/if}
              {:else}
                {#if e.to === 'OUT' && KINDS[from.kind].vol}
                  <label><span>{lego.eliminationParameter}</span><select bind:value={e.eliminationParameterization} on:change={() => updateEdge(e)}><option value="rate">{lego.rateConstant}</option><option value="clearance">{lego.clearance}</option></select></label>
                {/if}
                {#if e.to !== 'OUT' && canUseTransferClearance(e)}
                  <label><span>{lego.transferParameter}</span><select value={transferParameterization(e)} on:change={(event) => setTransferParameterization(e, event.currentTarget.value)}><option value="rate">{lego.rateConstant}</option><option value="clearance">{lego.intercompartmentalClearance}</option></select></label>
                {/if}
                {#if eliminationParameterization(e) === 'clearance'}
                  <label><span>CL (L/h)</span><input id={`edge-value-${e.id}`} class="num" type="number" min="0.000001" step="0.1" bind:value={e.cl} on:input={() => { edges = edges; reconcileCovariates(); }} /></label>
                {:else if transferParameterization(e) === 'clearance'}
                  <label><span>Q (L/h)</span><input id={`edge-value-${e.id}`} class="num" type="number" min="0.000001" step="0.1" value={e.q} on:input={(event) => { setTransferClearance(e, Number(event.currentTarget.value)); edges = [...edges]; reconcileCovariates(); }} aria-label={`${lego.rateAria} ${from.name} ${lego.to} ${to.name}`} /></label>
                {:else}
                  <label><span>k (1/h)</span><input id={`edge-value-${e.id}`} class="num" type="number" min="0" step="0.01" bind:value={e.k} on:input={() => { edges = edges; reconcileCovariates(); }} aria-label={`${lego.rateAria} ${from.name} ${lego.to} ${to.name}`} /></label>
                {/if}
              {/if}
              <button class="rx" on:click={() => deleteEdge(e.id)}>×</button>
            </div>
          {/if}
        {/each}
      </div>
    {/if}

    {#if profile !== 'translator' && parameterChoices.length}
      <details class="population-editor" open>
        <summary>{lego.populationModel}</summary>
        <div class="population-body">
          <p>{lego.populationHelp}</p>
          <fieldset>
            <legend>{lego.randomEffects}</legend>
            <div class="iiv-list">
              {#each parameterChoices as parameter}
                <label class="iiv-row">
                  <input type="checkbox" checked={iivVariance(parameter, iivVariances) > 0} on:change={(event) => setIiv(parameter, event.currentTarget.checked)} />
                  <span>{parameter.name}</span>
                  <span>{lego.variance}</span>
                  <input class="num" type="number" min="0.000001" step="0.01" value={iivVariance(parameter, iivVariances) || 0.09} disabled={iivVariance(parameter, iivVariances) <= 0} on:input={(event) => setIivVariance(parameter, event.currentTarget.value)} />
                </label>
              {/each}
            </div>
          </fieldset>
          {#if randomParameterChoices.length > 1}
            <fieldset>
              <legend>{lego.covarianceMatrix}</legend>
              <div class="omega-wrap">
                <table class="omega-table">
                  <thead><tr><th></th>{#each randomParameterChoices as parameter}<th>{parameter.name}</th>{/each}</tr></thead>
                  <tbody>
                    {#each randomParameterChoices as row, rowIndex}
                      <tr><th>{row.name}</th>{#each randomParameterChoices as column, columnIndex}<td>
                        {#if rowIndex === columnIndex}
                          <output>{fmt(iivVariance(row, iivVariances))}</output>
                        {:else if columnIndex < rowIndex}
                          <input aria-label={`${row.name} ${column.name}`} type="number" step="0.001" value={covariance(row.name, column.name, iivCovariances)} on:input={(event) => setCovariance(row.name, column.name, event.currentTarget.value)} />
                        {:else}
                          <output>{fmt(covariance(row.name, column.name, iivCovariances))}</output>
                        {/if}
                      </td>{/each}</tr>
                    {/each}
                  </tbody>
                </table>
              </div>
              {#if !omegaIsValid(randomParameterChoices, iivVariances, iivCovariances)}<p class="population-error" role="alert">{lego.invalidOmega}</p>{/if}
            </fieldset>
          {/if}
          <fieldset>
            <legend>{lego.residualError}</legend>
            <label class="residual-type"><span>{lego.type}</span><select value={residualError.type} on:change={(event) => (residualError = { ...residualError, type: event.currentTarget.value })}><option value="additive">{lego.additive}</option><option value="proportional">{lego.proportional}</option><option value="combined">{lego.combined}</option></select></label>
            <div class="residual-values">
              {#if residualError.type !== 'proportional'}<label><span>{lego.additive} · {lego.standardDeviation}</span><input class="num" type="number" min="0.000001" step="0.01" value={residualError.additive} on:input={(event) => (residualError = { ...residualError, additive: Math.max(0.000001, Number(event.currentTarget.value) || 0.000001) })} /></label>{/if}
              {#if residualError.type !== 'additive'}<label><span>{lego.proportional} · {lego.standardDeviation}</span><input class="num" type="number" min="0.000001" step="0.01" value={residualError.proportional} on:input={(event) => (residualError = { ...residualError, proportional: Math.max(0.000001, Number(event.currentTarget.value) || 0.000001) })} /></label>{/if}
            </div>
          </fieldset>
        </div>
      </details>
    {/if}

    <div class="covariates-editor">
      <div class="cov-head">
        <strong>{lego.covariates}</strong>
        <div class="cov-add">
          <button on:click={() => addCovariate('continuous')} disabled={!parameterChoices.length || covariates.length >= 50} aria-label={lego.addContinuousAria}>+ {lego.continuous}</button>
          <button on:click={() => addCovariate('categorical')} disabled={!parameterChoices.length || covariates.length >= 50} aria-label={lego.addCategoricalAria}>+ {lego.categorical}</button>
        </div>
      </div>
      <p class="cov-help">{lego.covariateHelp}</p>
      {#each uniqueCovariates(covariates) as covariate (covariate.id)}
        <div class="cov-row">
          <div class="cov-row-head">
            <label><span>{lego.name}</span><input class="txt" maxlength="24" value={covariate.name} on:input={(event) => renameCovariate(covariate, event)} /></label>
            <button class="rx" on:click={() => deleteCovariateGroup(covariate)} aria-label={`${lego.remove} ${covariate.name}`}>×</button>
          </div>
          <section class="cov-definition">
            <h3>{lego.covariateDefinition}</h3>
            <div class="cov-fields">
              <label><span>{lego.type}</span><select value={covariate.type} on:change={(event) => setCovariateType(covariate, /** @type {'continuous'|'categorical'} */ (event.currentTarget.value))}><option value="continuous">{lego.continuous}</option><option value="categorical">{lego.categorical}</option></select></label>
              <label><span>{lego.covariateScope}</span><select value={covariate.scope} on:change={(event) => updateCovariateDefinition(covariate, { scope: /** @type {'patient'|'administration'} */ (event.currentTarget.value) })}><option value="patient">{lego.patientCovariate}</option><option value="administration">{lego.administrationCovariate}</option></select></label>
              <label><span>{covariate.type === 'categorical' ? lego.categoryReference : lego.referenceValue}</span><input class="num" type="number" min={covariate.type === 'continuous' ? 0.000001 : undefined} step={covariate.type === 'categorical' ? 1 : 0.1} value={covariate.reference} on:input={(event) => updateCovariateDefinition(covariate, { reference: Number(event.currentTarget.value) })} /></label>
              <label><span>{covariate.type === 'categorical' ? lego.categoryComparison : lego.comparisonValue}</span><input class="num" type="number" min={covariate.type === 'continuous' ? 0.000001 : undefined} step={covariate.type === 'categorical' ? 1 : 0.1} value={covariate.comparison} on:input={(event) => updateCovariateDefinition(covariate, { comparison: Number(event.currentTarget.value) })} /></label>
              <label class="cov-toggle"><input type="checkbox" checked={covariate.compare} on:change={(event) => updateCovariateDefinition(covariate, { compare: event.currentTarget.checked })} /><span>{lego.compareCurve}</span></label>
            </div>
          </section>
          <section class="cov-effects">
            <div class="cov-effects-head">
              <h3>{lego.covariateEffects}</h3>
              <button class="cov-target-add" on:click={() => addCovariateTarget(covariate)} disabled={!nextCovariateTarget(covariate) || covariates.length >= 50}>+ {lego.addTargetParameter}</button>
            </div>
            {#each covariateEffects(covariate) as effect (effect.id)}
              <div class="cov-effect">
                <label class="cov-target"><span>{lego.targetParameter}</span><select bind:value={effect.target} on:change={() => (covariates = [...covariates])}>{#each parameterChoices as parameter}<option value={parameter.name} disabled={parameter.name !== effect.target && covariates.some((candidate) => candidate.id !== effect.id && covariateName(candidate.name) === covariateName(effect.name) && candidate.target === parameter.name)}>{parameter.name}</option>{/each}</select></label>
                <label><span>β</span><input class="num" type="number" step="0.05" bind:value={effect.beta} on:input={() => (covariates = [...covariates])} /></label>
                <button class="rx" on:click={() => deleteCovariate(effect.id)} aria-label={`${lego.remove} ${lego.targetParameter} ${effect.target}`}>×</button>
              </div>
            {/each}
          </section>
        </div>
      {/each}
    </div>
  </div>
</div>

<div class="outputs">
  <section class="out">
    <h2>{copy.pages.legoEquations}</h2>
    <pre class="eqs"><code>{odes.join('\n')}</code></pre>
  </section>
  <section class="out">
    <div class="codehead">
      <h2>{copy.pages.legoCode}</h2>
      <div class="tabs" role="tablist" aria-label={copy.pages.legoCode}>
        <button role="tab" aria-selected={codeTab === 'nlmixr2'} class:on={codeTab === 'nlmixr2'} on:click={() => (codeTab = 'nlmixr2')}>nlmixr2</button>
        <button role="tab" aria-selected={codeTab === 'mrgsolve'} class:on={codeTab === 'mrgsolve'} on:click={() => (codeTab = 'mrgsolve')}>mrgsolve</button>
        <button role="tab" aria-selected={codeTab === 'mlxtran'} class:on={codeTab === 'mlxtran'} on:click={() => (codeTab = 'mlxtran')}>MLXTRAN</button>
        <button role="tab" aria-selected={codeTab === 'nonmem'} class:on={codeTab === 'nonmem'} on:click={() => (codeTab = 'nonmem')}>NONMEM</button>
      </div>
      <button class="cp" on:click={copierCode}>{copiedTab === codeTab ? copy.pages.legoCopied : copy.pages.legoCopy}</button>
      <button
        class="tdm-launch"
        disabled={!tdmReady}
        title={tdmReady ? copy.pages.legoOpenTdm : copy.pages.legoTdmUnavailable}
        on:click={ouvrirDansTdm}
      >{transferredCode === codeMrgsolve ? copy.pages.legoTdmSent : copy.pages.legoOpenTdm}</button>
    </div>
    <p class="codenote">{activeCodeNote}</p>
    <pre class="codeblk"><code>{activeCode}</code></pre>
  </section>
</div>

</div>

<style>
  .chart-title { font-size: 0.9rem; margin: 12px 0 4px; letter-spacing: 0; }
  .chart-title span { font-size: 0.8rem; font-weight: normal; color: var(--text-secondary); }
  fieldset.toolbar { min-width: 0; border: 0; margin-inline: 0; }

  .information-link { fill: none; stroke: #11756c; stroke-width: 2; stroke-dasharray: 6 4; }
  .modifier-link { fill: none; stroke: #9c4160; stroke-width: 2; stroke-dasharray: 3 3; }
  .graph-error { color: var(--error, #b42318); border-left: 3px solid currentColor; padding: 10px; }
  .continuity { display: flex; gap: 12px; flex-wrap: wrap; align-items: end; padding: 16px 0; margin-bottom: 16px; border-block: 1px solid var(--border-subtle); }
  .continuity label { display: grid; gap: 4px; font-size: 0.75rem; }
  .continuity button, .continuity select { padding: 8px; min-height: 36px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-strong); border-radius: 4px; font: inherit; font-size: 0.8rem; }
  .continuity button, .add { display: inline-flex; align-items: center; gap: 5px; }
  .continuity button:disabled { opacity: 0.45; cursor: not-allowed; }
  .continuity span { width: 100%; font-size: 0.8rem; }
  .head { max-width: 800px; margin-bottom: var(--space-5); }
  .eyebrow { font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-pk); }
  h1 { font-size: var(--text-3xl); margin: var(--space-2) 0 var(--space-3); }
  .lede { color: var(--text-secondary); font-size: var(--text-lg); }
  .toolbar { display: flex; flex-wrap: wrap; gap: var(--space-3) var(--space-6); align-items: center; padding: var(--space-3) var(--space-4); background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; margin-bottom: var(--space-4); }
  .tgroup { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
  .tlabel { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); }
  .toolbar button { font-size: var(--text-xs); padding: 5px 9px; border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 999px; cursor: pointer; color: var(--text-secondary); font-family: var(--font-mono); }
  .toolbar button.add { border-color: var(--c); color: var(--c); }
  .toolbar button.on { background: var(--accent-pk); color: #fff; border-color: var(--accent-pk); }
  .toolbar button.clear { color: #b0392b; border-color: #b0392b; }
  .template-note { margin: calc(-1 * var(--space-2)) 0 var(--space-4); padding-left: var(--space-3); border-left: 3px solid var(--accent-pk); color: var(--text-secondary); font-size: var(--text-xs); line-height: 1.5; }
  .template-note a { margin-left: 0.4em; font-family: var(--font-mono); }
  .toolbar .s { display: grid; grid-template-columns: auto auto; gap: 0 var(--space-2); align-items: center; font-family: var(--font-mono); font-size: var(--text-xs); margin-left: auto; }
  .toolbar .s input { grid-column: 1 / -1; }
  .mlxtran-import { margin: 0 0 var(--space-4); border: 1px solid var(--border-subtle); border-radius: 6px; background: var(--bg-tertiary); }
  .mlxtran-import summary { padding: 10px 13px; cursor: pointer; color: var(--text-secondary); font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 700; }
  .mlxtran-import-body { display: grid; gap: var(--space-3); padding: 0 13px 13px; }
  .import-formats { display: inline-grid; grid-template-columns: repeat(3, minmax(0, 1fr)); width: min(100%, 360px); border: 1px solid var(--border-strong); border-radius: 4px; overflow: hidden; }
  .import-formats button { min-height: 34px; border: 0; border-right: 1px solid var(--border-strong); border-radius: 0; background: var(--bg-primary); color: var(--text-secondary); font-family: var(--font-mono); font-size: var(--text-xs); }
  .import-formats button:last-child { border-right: 0; }
  .import-formats button.on { background: var(--text-primary); color: var(--bg-primary); }
  .mlxtran-import-body > label { display: grid; gap: 5px; color: var(--text-secondary); font-family: var(--font-mono); font-size: var(--text-xs); }
  .mlxtran-import textarea { width: 100%; resize: vertical; padding: 9px; border: 1px solid var(--border-strong); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); font-family: var(--font-mono); font-size: var(--text-xs); }
  .mlxtran-import-actions { display: flex; flex-wrap: wrap; gap: var(--space-2); }
  .mlxtran-import-actions button, .file-button span { display: inline-flex; align-items: center; min-height: 34px; padding: 6px 10px; border: 1px solid var(--border-strong); border-radius: 4px; background: var(--bg-primary); color: var(--text-secondary); cursor: pointer; font-family: var(--font-mono); font-size: var(--text-xs); }
  .mlxtran-import-actions .import-button { border-color: var(--accent-pk); background: var(--accent-pk); color: #fff; }
  .mlxtran-import-actions .import-button:disabled { cursor: not-allowed; opacity: 0.45; }
  .file-button input { position: absolute; width: 1px; height: 1px; opacity: 0; }
  .import-status { margin: 0; padding: 9px 10px; border-left: 3px solid var(--accent-pd); background: var(--bg-primary); font-size: var(--text-xs); overflow-wrap: anywhere; }
  .import-status.error { border-left-color: #b0392b; color: #8b3026; }
  .import-status strong, .import-status span { display: block; }
  .import-status ul { margin: 5px 0 0; padding-left: 18px; }
  .builder { display: grid; gap: var(--space-4); }
  @media (min-width: 980px) { .builder { grid-template-columns: minmax(0, 1fr) 330px; align-items: start; } }
  .stage { display: grid; gap: var(--space-4); min-width: 0; }
  .canvas { width: 100%; height: auto; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; touch-action: none; }
  .node { cursor: grab; }
  .node rect { stroke-width: 2; transition: filter 0.15s; }
  .node.sel rect { stroke-width: 3; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2)); }
  .node.cf rect { stroke-dasharray: 4 3; }
  .nname { text-anchor: middle; font-family: var(--font-mono); font-size: 12px; font-weight: 700; fill: var(--text-primary); }
  .nkind { text-anchor: middle; font-family: var(--font-mono); font-size: 8px; fill: var(--text-muted); }
  .edge { stroke: var(--text-secondary); stroke-width: 1.6; }
  .edge-action { cursor: pointer; }
  .edge-hitarea:focus { outline: none; }
  .edge-action:has(.edge-hitarea:focus) .edge { stroke: var(--accent-pk); stroke-width: 3; }
  .edge-action .edge, .edge-action text { pointer-events: none; }
  .edge-hitline { stroke: var(--text-primary); stroke-opacity: 0.001; stroke-width: 16; pointer-events: stroke; }
  .edge-hitarea { fill: var(--text-primary); fill-opacity: 0.001; cursor: pointer; }
  .klbl { font-family: var(--font-mono); font-size: 9px; fill: var(--text-secondary); text-anchor: middle; }
  .elim { font-family: var(--font-mono); font-size: 8px; fill: var(--accent-pk); text-anchor: middle; }
  .hintxt { text-anchor: middle; fill: var(--text-muted); font-size: 13px; }
  .chart-panel { min-width: 0; }
  .chart { display: block; width: 100%; height: auto; }
  .axis { stroke: var(--border-strong); stroke-width: 1; }
  .serie { fill: none; stroke-width: 2.4; }
  .serie.dash { stroke-dasharray: 5 3; }
  .lbl { fill: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; text-anchor: middle; }
  .chart-legend { display: flex; flex-wrap: wrap; gap: 6px var(--space-4); padding: 0 var(--space-3); }
  .legend-item { display: inline-flex; align-items: center; gap: 6px; min-width: 0; color: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
  .legend-item i { width: 18px; flex: 0 0 18px; border-top: 3px solid var(--series-color); }
  .legend-item i.dash { border-top-style: dashed; }
  .side { display: grid; gap: var(--space-4); align-content: start; min-width: 0; }
  .editor, .rates, .covariates-editor, .population-editor { background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: var(--space-4); }
  .population-editor > summary { cursor: pointer; color: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
  .population-body { display: grid; gap: 12px; padding-top: 12px; }
  .population-body > p { margin: 0; color: var(--text-muted); font-size: 11px; line-height: 1.45; }
  .population-body fieldset { min-width: 0; margin: 0; padding: 10px; border: 1px solid var(--border-subtle); border-radius: 6px; }
  .population-body legend { padding: 0 5px; color: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
  .iiv-list { display: grid; gap: 7px; }
  .iiv-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto 82px; align-items: center; gap: 7px; color: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
  .iiv-row .num { width: 100%; }
  .omega-wrap { overflow-x: auto; }
  .omega-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 9px; }
  .omega-table th, .omega-table td { min-width: 62px; padding: 4px; text-align: center; border: 1px solid var(--border-subtle); }
  .omega-table input { width: 58px; padding: 4px; border: 1px solid var(--border-strong); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); font: inherit; }
  .population-error { margin: 8px 0 0; color: var(--error, #b42318); font-size: 11px; }
  .residual-type, .residual-values label { display: grid; gap: 4px; color: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
  .residual-type select { width: 100%; padding: 5px 7px; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font: inherit; }
  .residual-values { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 8px; }
  .residual-values .num { width: 100%; }
  .ehead { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-3); }
  .ehead strong { font-family: var(--font-mono); }
  .ehead span { font-size: var(--text-xs); color: var(--text-muted); }
  .s { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 var(--space-2); font-family: var(--font-mono); font-size: var(--text-xs); margin-bottom: var(--space-2); }
  .s span { color: var(--text-secondary); }
  .txt, .num, .s select, .cov-row select { padding: 5px 7px; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-family: var(--font-mono); font-size: var(--text-xs); min-width: 0; }
  .txt, .s select { grid-column: 1 / -1; width: 100%; }
  .num { width: 92px; }
  .src select { grid-column: auto; }
  .input-settings { margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--border-subtle); }
  .input-settings > strong { display: block; margin-bottom: var(--space-2); color: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; }
  .input-settings p { margin: var(--space-2) 0 0; color: var(--text-muted); font-size: 11px; line-height: 1.45; }
  .ebtns { display: flex; gap: var(--space-2); margin-top: var(--space-3); }
  .ebtns button { flex: 1; font-size: var(--text-xs); padding: 6px; border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 6px; cursor: pointer; font-family: var(--font-mono); }
  .ebtns .del { color: #b0392b; border-color: #b0392b; }
  .tip { color: var(--text-muted); font-size: var(--text-sm); line-height: 1.5; }
  .rlabel { display: block; font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: var(--space-2); }
  .rate { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 7px; padding: 9px 0; border-top: 1px solid var(--border-subtle); font-family: var(--font-mono); font-size: var(--text-xs); }
  .rn { color: var(--text-secondary); white-space: nowrap; }
  .rate label { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(110px, 1fr); align-items: center; gap: var(--space-2); color: var(--text-muted); font-size: 10px; }
  .rate label select, .rate .num { width: 100%; min-width: 0; padding: 5px 7px; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-family: var(--font-mono); font-size: var(--text-xs); }
  .rate .rx { grid-column: 2; grid-row: 1; }
  .rx { border: none; background: none; color: #b0392b; cursor: pointer; font-size: 15px; }
  .cov-head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: var(--space-2); margin-bottom: var(--space-2); }
  .cov-head strong { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); }
  .cov-add { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; width: 100%; }
  .cov-head button { min-width: 0; min-height: 28px; padding: 5px 7px; border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--accent-pk); border-radius: 6px; cursor: pointer; font-family: var(--font-mono); font-size: 10px; line-height: 1.2; }
  .cov-head button:disabled { opacity: 0.45; cursor: not-allowed; }
  .cov-help { margin: 0 0 var(--space-2); color: var(--text-muted); font-size: 11px; line-height: 1.45; }
  .cov-row { padding: 12px; border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--bg-primary); }
  .cov-row + .cov-row { margin-top: 10px; }
  .cov-row-head { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 7px; margin-bottom: 10px; }
  .cov-target-add { min-height: 28px; padding: 5px 7px; border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--accent-pk); border-radius: 6px; cursor: pointer; font-family: var(--font-mono); font-size: 10px; }
  .cov-target-add:disabled { opacity: 0.45; cursor: not-allowed; }
  .cov-definition, .cov-effects { padding-top: 9px; border-top: 1px solid var(--border-subtle); }
  .cov-effects { margin-top: 10px; }
  .cov-definition h3, .cov-effects h3 { margin: 0 0 8px; color: var(--text-muted); font-family: var(--font-mono); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
  .cov-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
  .cov-effects-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
  .cov-effects-head h3 { margin: 0; }
  .cov-effect { display: grid; grid-template-columns: minmax(0, 1fr) minmax(80px, 0.55fr) auto; align-items: end; gap: 7px; padding: 7px 0; }
  .cov-effect + .cov-effect { border-top: 1px dashed var(--border-subtle); }
  .cov-row label { display: grid; align-content: end; gap: 3px; min-width: 0; font-family: var(--font-mono); font-size: 10px; color: var(--text-secondary); }
  .cov-fields .cov-toggle { grid-column: 1 / -1; }
  .cov-row .txt, .cov-row select { width: 100%; }
  .cov-row .num { width: 100%; }
  .cov-toggle { grid-template-columns: auto minmax(0, 1fr); align-items: center; justify-content: start; padding-top: 2px; }
  .cov-toggle input { width: 16px; height: 16px; margin: 0; accent-color: var(--accent-pk); }
  .outputs { display: grid; gap: var(--space-4); margin-top: var(--space-6); min-width: 0; }
  @media (min-width: 900px) { .outputs { grid-template-columns: 1fr 1fr; } }
  .out { min-width: 0; }
  .out h2 { font-size: var(--text-sm); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent-pk); margin-bottom: var(--space-2); }
  .eqs, .codeblk { width: 100%; max-width: 100%; border-radius: var(--radius); padding: var(--space-4); overflow-x: auto; font-family: var(--font-mono); font-size: var(--text-xs); line-height: 1.6; }
  .eqs { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-subtle); }
  .codeblk { background: #1a1f2b; color: #e6edf3; }
  .eqs code, .codeblk code { white-space: pre; background: transparent; color: inherit; padding: 0; }
  .codehead { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2) var(--space-3); margin-bottom: var(--space-2); }
  .codehead h2 { margin: 0; }
  .tabs { display: flex; flex-wrap: wrap; gap: 4px; }
  .tabs button {
    font-family: var(--font-mono); font-size: var(--text-xs); padding: 4px 10px; cursor: pointer;
    border: 1px solid var(--border-strong); background: var(--bg-primary);
    color: var(--text-secondary); border-radius: 999px;
  }
  .tabs button.on { background: var(--accent-pk); border-color: var(--accent-pk); color: #fff; }
  .cp {
    margin-left: auto; font-family: var(--font-mono); font-size: var(--text-xs);
    padding: 4px 10px; cursor: pointer; border: 1px solid var(--border-strong);
    background: var(--bg-primary); color: var(--text-secondary); border-radius: 6px;
  }
  .cp:hover { border-color: var(--accent-pk); color: var(--accent-pk); }
  .tdm-launch {
    font-family: var(--font-mono); font-size: var(--text-xs); padding: 5px 11px; cursor: pointer;
    border: 1px solid var(--accent-pd); border-radius: 6px; background: var(--accent-pd); color: #fff;
  }
  .tdm-launch:disabled { cursor: not-allowed; opacity: 0.45; }
  .codenote { font-size: var(--text-xs); color: var(--text-muted); margin: 0 0 var(--space-2); max-width: 70ch; }
  @media (max-width: 640px) {
    .codehead { align-items: flex-start; }
    .cp { margin-left: 0; }
  }
</style>

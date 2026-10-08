/**
 * Conservative scientific evidence gate for the local multi-omics prototype.
 * This is NOT a validation certificate: a successful run, a small p-value,
 * or an installed R package cannot prove a study design is publishable.
 * Never grant a "publication-ready" status automatically.
 */
/** @param {any} result @param {{demo?: boolean}} [options] */
export function assessScientificAssurance(result, { demo = false } = {}) {
  const layers = Object.entries(result?.layers || {});
  const protocol = result?.protocol || {};
  const exploratory = protocol.objective === 'explore';
  /** @type {Array<{code:string,fr:string,en:string,level:string}>} */
  const notes = [];
  /** @param {string} code @param {string} fr @param {string} en @param {string} [level] */
  const add = (code, fr, en, level = 'caution') => notes.push({ code, fr, en, level });
  const n = Number(result?.metadataSummary?.subjects || 0);
  if (demo) add('synthetic_demo',
    'Données synthétiques : aucune découverte biologique n’est validée.',
    'Synthetic data: no biological finding is validated.');
  if (exploratory) add('exploratory_only',
    'ACP et visualisations : structures descriptives, sans test d’hypothèse biologique.',
    'PCA and plots describe patterns, not tests of a biological hypothesis.');
  else {
    add('independent_confirmation',
      'Les associations et les q-values du moteur navigateur doivent être confirmées par la méthode statistique de référence adaptée au plan.',
      'Browser-model associations and q-values need confirmation with the design-appropriate reference statistical method.',
      'requires_confirmation');
    if (n < 20) add('sample_size', 
      'Effectif inférieur à 20 sujets : estimation de variance, puissance et modèles multivariés potentiellement instables.',
      'Fewer than 20 subjects: variance, power and multivariable models may be unstable.',
      'requires_confirmation');
  }
  const matched = result?.referenceBackend?.status === 'ok'
    ? Object.entries(result.referenceBackend.methods || {}).filter(([, method]) => method?.status === 'ok').map(([name])=>name)
    : [];
  if (!exploratory && matched.length === 0) add('no_reference_engine',
    'Aucune méthode R de référence n’a été exécutée : les résultats principaux restent exploratoires.',
    'No R reference method was executed: primary statistical results remain exploratory.',
    'requires_confirmation');
  if (matched.length) add('reference_not_certificate',
    'Méthodes R exécutées : ' + matched.join(', ') + '. Leur exécution ne prouve pas que le design et les hypothèses sont corrects.',
    'Executed R methods: ' + matched.join(', ') + '. Execution does not prove the study design or assumptions are valid.');
  for (const [layer, data] of layers) {
    const qc = data?.qc || {};
    if (qc?.inferenceTier?.level === 'screening') add(layer + '_count_screening',
      'RNA-seq en comptages : le calcul navigateur sur log2-CPM ne remplace pas DESeq2/limma-voom sur comptages bruts.',
      'RNA-seq counts: browser log2-CPM screening is not a substitute for count-aware DESeq2/limma-voom.',
      'requires_confirmation');
    for (const warning of qc.warnings || []) {
      add(layer + '_qc_warning_' + notes.length,
        layer + ' : ' + warning, layer + ': ' + warning, 'requires_confirmation');
    }
    if (layer === 'metabolomics') {
      const ms = qc.msQc || {};
      if (ms.qcAssays === 0 && ms.biologicalAssays > 0) add('ms_no_pooled_qc',
        'Aucun pooled-QC MS renseigné : stabilité analytique et dérive instrumentale non vérifiables.',
        'No pooled MS QC annotated: instrumental stability and drift cannot be assessed.',
        'requires_confirmation');
      if (ms.driftCorrection?.applied) add('ms_drift_sensitivity',
        'Correction de dérive MS appliquée : comparer aussi aux résultats sans correction.',
        'MS drift correction applied: include a no-drift-correction sensitivity analysis.');
      if (ms.mnar?.imputedValues > 0) add('ms_mnar_sensitivity',
        'Valeurs manquantes MS imputées : vérifier la stabilité des conclusions sans imputation.',
        'MS missing values imputed: evaluate findings without imputation.',
        'requires_confirmation');
    }
  }
  if (result?.predictiveOutcome?.status === 'ok') add('cv_preprocessing_limit',
    'La CV est interne ; sélection des variables recalculée dans chaque pli, mais certains prétraitements omiques sont effectués avant la séparation. Une validation externe indépendante reste nécessaire.',
    'Internal CV refits feature selection per fold, but some omics preprocessing occurs before splitting. Independent external validation is still needed.',
    'requires_confirmation');
  if (layers.length > 1 && !exploratory) add('separate_fdr_families',
    'Les q-values sont corrigées par couche omique, pas globalement sur toutes les couches et analyses de voies : préspécifier les familles de tests.',
    'BH q-values are adjusted within each omics layer, not globally across omics and pathway tests: prespecify the tested families.',
    'requires_confirmation');
  if (result?.reactome) add('pathway_hypotheses',
    'Les annotations de voies et réseaux servent à générer des hypothèses, pas à établir une causalité.',
    'Pathway and network annotations generate hypotheses; they do not establish causality.');
  if (!layers.length) add('no_results', 'Aucun résultat statistique exploitable.', 'No usable statistical result.', 'requires_confirmation');
  const status = exploratory ? 'descriptive' : notes.some((item) => item.level === 'requires_confirmation')
    ? 'needs_reference_confirmation' : 'exploratory_inference';
  return {
    status,
    publicationReady: false,
    referenceMethodsExecuted: matched,
    notes,
    version: 'scientific-assurance-v1',
    limitation: 'Automatic statistical quality checks are not external validation or a publication approval.'
  };
}

/**
 * Conservative scientific evidence gate for the local multi-omics prototype.
 * This is NOT a validation certificate: a successful run, a small p-value,
 * or an installed R package cannot prove a study design is publishable.
 * Never grant a "publication-ready" status automatically.
 */
/**
 * "Confirmatory" is a scientific-workflow request, not a certificate.
 * Rules deliberately never auto-authorise a publication or clinical claim.
 * R methods must match EVERY actual input layer and the declared design.
 */
export function evaluateConfirmatoryReadiness(result, { demo = false } = {}) {
  const protocol = result?.protocol || {};
  const requested = protocol.analysisIntent === 'confirmatory';
  const layers = Object.entries(result?.layers || {});
  const methods = result?.referenceBackend?.status === 'ok'
    ? result.referenceBackend.methods || {} : {};
  const checks = [];
  const add = (code, status, fr, en) => checks.push({ code, status, fr, en });
  if (!requested) return {
    requested: false, status: 'not_requested', checks: [],
    certified: false, scope: 'No automatic scientific certification.'
  };

  if (demo) add('demo', 'blocked',
    'Démo synthétique : aucune conclusion biologique confirmatoire.',
    'Synthetic demonstration: no confirmatory biological inference.');
  if (!layers.length) add('empty', 'blocked',
    'Aucune omique analysée.', 'No analysed omics layer.');
  const eligibleDesign = protocol.objective === 'groups' &&
    protocol.designType === 'independent' && !protocol.longitudinal &&
    (result?.metadataSummary?.conditions || []).length === 2;
  if (!eligibleDesign) add('design', 'blocked',
    'La voie confirmatoire vérifiée actuellement couvre uniquement deux groupes indépendants. Autres plans : revue méthodologique nécessaire, sans validation automatique.',
    'The currently audited confirmatory route covers only two independent groups. Other designs require method-specific review, without automatic validation.');
  else add('design', 'pass',
    'Plan à deux groupes indépendants reconnu.',
    'Two-independent-group design recognised.');

  if (!Object.keys(methods).length) add('backend', 'blocked',
    'Aucun moteur R de référence exécuté. Lancez le backend R pour toutes les omiques.',
    'No executed reference R backend. Run the R backend for every omics layer.');
  for (const [layer, data] of layers) {
    const qc = data?.qc || {};
    const declared = qc.preprocessingAudit?.declaredValueType;
    const key = layer === 'transcriptomics' && declared === 'raw_counts'
      ? layer + '_differential_deseq2'
      : layer + '_differential';
    const status = methods[key]?.status;
    if (status !== 'ok') add('reference_'+layer, 'blocked',
      layer + ' : modèle R primaire compatible non exécuté (' + key + ').',
      layer + ': matching primary R model not executed (' + key + ').');
    else add('reference_'+layer,'pass',
      layer + ' : modèle R de référence exécuté (' + key + ').',
      layer + ': reference R model executed (' + key + ').');
    for (const warning of qc.warnings || []) {
      add('qc_'+layer, 'review',
        layer + ' : contrôle qualité à examiner — ' + warning,
        layer + ': quality control requires review — ' + warning);
    }
    if (layer === 'metabolomics') add('metabolomics_validation','review',
      'Métabolomique : vérifier blancs, pooled-QC, identification et analyses de sensibilité MS.',
      'Metabolomics: review blanks, pooled QC, compound identification and MS sensitivity analyses.');
    if (layer === 'transcriptomics' && declared === 'raw_counts') add('rnaseq_design','review',
      'RNA-seq : vérifier indépendamment la dispersion, les facteurs d'ajustement et les contrastes DESeq2.',
      'RNA-seq: independently check dispersion, adjustment variables and DESeq2 contrasts.');
  }
  if ((result?.preAnalysisDiagnostics?.blockers || []).length) add('study_design', 'blocked',
    'Le diagnostic préalable contient des blocages.', 'Pre-analysis diagnostics report blockers.');
  if (result?.predictiveOutcome?.status === 'ok') add('prediction', 'review',
    'La prédiction interne ne constitue pas une validation externe du biomarqueur.',
    'Internal prediction is not external biomarker validation.');
  if (layers.length > 1) add('multiplicity','review',
    'Préspécifier les familles de tests et le critère principal ; des q-values par omique ne contrôlent pas automatiquement l’erreur globale.',
    'Prespecify testing families and the primary endpoint; per-layer BH q-values do not automatically control study-wide error.');
  add('preregistration','review',
    'Vérifier le protocole préspécifié, l’indépendance des réplicats, les exclusions et les facteurs de confusion.',
    'Review the prespecified protocol, replicate independence, exclusions and confounders.');
  add('external_review','review',
    'Une vérification humaine indépendante reste nécessaire avant une conclusion scientifique confirmatoire.',
    'Independent human review is still required before confirmatory scientific claims.');

  return {
    requested: true,
    status: checks.some(x => x.status === 'blocked') ? 'blocked' : 'independent_review_required',
    checks,
    certified: false,
    scope: 'Software eligibility checks; not confirmation of hypotheses, clinical validation or publication approval.'
  };
}

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
  if (protocol.objective === 'time' && protocol.longitudinal) add('longitudinal_browser_uncalibrated',
    'Le modèle longitudinal navigateur ne fournit plus de p-value, q-value ou intervalle de confiance : une simulation nulle a révélé une inflation possible des faux positifs. Les effets affichés restent descriptifs. Pour conclure, utilisez lmerTest sur le plan complet.',
    'The browser longitudinal model no longer reports p-values, q-values or confidence intervals: null simulation suggested possible type-I inflation. Effects are descriptive only. Use lmerTest with the full study design for inference.',
    'requires_confirmation');
  if (result?.predictiveOutcome?.status === 'ok') {
    if (result.predictiveOutcome.preprocessingLeakageRisk !== false) add('cv_preprocessing_limit',
      'La validation croisée reste exploratoire : au moins une omique peut subir un prétraitement global avant la séparation des sujets.',
      'Cross-validation remains exploratory: at least one modality may undergo global preprocessing before splitting subjects.',
      'requires_confirmation');
    else add('cv_fold_local_preparation',
      'Pour les échelles prises en charge, le moteur ne filtre plus les variables sur la cohorte entière avant la CV. Les prétraitements réalisés avant import, la conception de l’étude et la validation externe restent à vérifier.',
      'For supported scales, the engine no longer filters features on the full cohort before CV. Pre-import processing, study design and external validation still need review.',
      'requires_confirmation');
  }
  if (layers.length > 1 && !exploratory) add('separate_fdr_families',
    'Les q-values sont corrigées par couche omique, pas globalement sur toutes les couches et analyses de voies : préspécifier les familles de tests.',
    'BH q-values are adjusted within each omics layer, not globally across omics and pathway tests: prespecify the tested families.',
    'requires_confirmation');
  if (result?.reactome) {
    add('pathway_hypotheses',
      'Les enrichissements Reactome génèrent des hypothèses, sans preuve causale. Une sélection préalable des variables sur les mêmes données empêche de les interpréter comme validation indépendante.',
      'Reactome enrichments generate hypotheses, not causal evidence. Feature selection on the same data prevents independent confirmatory interpretation.');
    const responses = [result.reactome.combined, ...Object.values(result.reactome.perLayer || {})];
    const incomplete = responses.filter((response) => response?.assayUniverse?.multiplicityStatus !== 'full_assay_universe_family');
    if (incomplete.length) add('pathway_fdr_not_estimable',
      'Au moins un enrichissement Reactome n’a pas d’univers de voies complet ou cohérent : sa FDR spécifique à l’étude n’est pas calculable, et la FDR Reactome d’origine ne peut pas la remplacer.',
      'At least one Reactome enrichment has an incomplete/inconsistent pathway universe: study-specific FDR is unavailable and cannot be replaced by Reactome default FDR.',
      'requires_confirmation');
    else add('pathway_family_validated',
      'FDR Reactome calculée sur toutes les voies associées à l’univers mesuré ; les dépendances entre voies et le biais de sélection des variables restent des limites.',
      'Reactome FDR is calculated over all pathways in the measured assay universe; pathway dependence and prior feature selection remain limitations.');
  }
  if (!layers.length) add('no_results', 'Aucun résultat statistique exploitable.', 'No usable statistical result.', 'requires_confirmation');
  const status = exploratory ? 'descriptive' : notes.some((item) => item.level === 'requires_confirmation')
    ? 'needs_reference_confirmation' : 'exploratory_inference';
  const confirmatoryReadiness = evaluateConfirmatoryReadiness(result, { demo });
  return {
    status,
    confirmatoryReadiness,
    publicationReady: false,
    referenceMethodsExecuted: matched,
    notes,
    version: 'scientific-assurance-v1',
    limitation: 'Automatic statistical quality checks are not external validation or a publication approval.'
  };
}

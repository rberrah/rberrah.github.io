// @ts-nocheck
// MIC-dependent PK/PD objectives are separate from fixed-concentration TDM ranges.
// Source: Abdul-Aziz et al., Intensive Care Medicine (2020), Table 4 and sections
// "Beta-lactam antibacterials", "Aminoglycosides", "Fluoroquinolones", "Daptomycin".
// Adult ICU expert position paper; these are NOT validated patient-specific dosing rules.
// Do not conflate free with total concentration, AUC with trough, or class objectives
// with molecule-specific clinical efficacy evidence.
export const antibioticPdSource = Object.freeze({
  citation: 'ESICM / ESCMID / IATDMCT / ISAC · 2020',
  title: 'Antimicrobial therapeutic drug monitoring in critically ill adult patients: a Position Paper',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7223855/',
  doi: '10.1007/s00134-020-06050-1',
  evidenceSection: 'Table 4, and drug-class pharmacodynamic sections',
  scopeFr: 'Adultes en réanimation ; objectifs de groupes de molécules, non cibles universelles ni recommandations françaises individualisées.',
  scopeEn: 'Adults in critical care; drug-class targets, not universal or patient-specific French dosing recommendations.'
});

export const betaLactamIds = Object.freeze([
  'amoxicillin', 'aztreonam', 'cefazolin', 'cefepime', 'cefotaxime',
  'ceftaroline', 'ceftazidime', 'ceftobiprole', 'ceftolozane',
  'ceftriaxone', 'cloxacillin', 'ertapenem', 'meropenem',
  'oxacillin', 'piperacillin', 'ticarcillin'
]);
export const aminoglycosideIds = Object.freeze(['amikacin', 'gentamicin', 'tobramycin']);
export const fluoroquinoloneIds = Object.freeze([
  'ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'ofloxacin'
]);

/**
 * One row is one class-derived scenario, NOT one new independent drug-specific study.
 * kind:
 * - beta_trough: criterion 100% fT>MIC (Cmin,free > MIC as surrogate only
 *   when it really is the minimum over the dosing interval).
 * - beta_continuous: free Css > MIC (steady-state continuous infusion).
 * - peak_ratio: Cmax / MIC >= 8–10 (aminoglycosides).
 * - free_auc_ratio: fAUC24 / MIC >= 80 (fluoroquinolone ICU reference).
 * - total_auc_ratio: AUC24 / MIC > 666 (daptomycin conditional reference).
 * - vancomycin_mic1: fixed AUC24 400–600 only at BMD MIC=1 mg/L.
 */
export const antibioticPdTargets = Object.freeze([
  ...betaLactamIds.flatMap((drug) => [
    {
      id: drug + ':icu-beta-intermittent', drug, kind: 'beta_trough',
      labelFr: 'Réanimation adulte · perfusion intermittente ou prolongée',
      labelEn: 'Adult ICU · intermittent or extended infusion',
      metric: '100 % fT>CMI', unit: '% du temps de l’intervalle',
      criterionFr: 'Concentration libre au-dessus de la CMI pendant tout l’intervalle',
      criterionEn: 'Unbound concentration above MIC throughout the dosing interval',
      contextFr: 'Objectif PK/PD de classe proposé en réanimation. Une résiduelle libre > CMI n’est un substitut valable que si elle représente réellement le minimum de concentration ; un prélèvement isolé ne démontre pas l’atteinte sur tout l’intervalle. Comparer la CMI mesurée, sa méthode et la fraction libre.',
      contextEn: 'ICU class-level PK/PD proposal. An unbound trough > MIC is a surrogate only if it is the true interval minimum; one sample does not prove full-interval attainment. MIC method and free fraction matter.',
      evidenceSection: 'Table 4, Beta-lactams: 100% fT>MIC; text mentions more aggressive 2–5×MIC targets as possible, not universal',
      status: 'consensus-class'
    },
    {
      id: drug + ':icu-beta-continuous', drug, kind: 'beta_continuous',
      labelFr: 'Réanimation adulte · perfusion continue',
      labelEn: 'Adult ICU · continuous infusion',
      metric: 'fCss>CMI', unit: 'mg/L (concentration libre)',
      criterionFr: 'Concentration libre stable supérieure à la CMI',
      criterionEn: 'Steady-state unbound concentration above the MIC',
      contextFr: 'Objectif de classe pour perfusion continue à l’état stable. Si le laboratoire mesure la concentration totale, ne pas la comparer directement à la CMI sans estimer ou mesurer la fraction libre.',
      contextEn: 'ICU class-level continuous-infusion target at steady state. Do not equate total-drug assay concentration to the unbound MIC threshold.',
      evidenceSection: 'Table 4, Beta-lactams: continuous infusion Css>MIC; unbound drug emphasized in pharmacodynamic section',
      status: 'consensus-class'
    }
  ]),
  ...aminoglycosideIds.map((drug) => ({
    id: drug + ':icu-peak-mic', drug, kind: 'peak_ratio',
    labelFr: 'Infection bactérienne · réanimation adulte (efficacité)',
    labelEn: 'Bacterial infection · adult ICU (efficacy)',
    metric: 'Cmax/CMI', unit: 'ratio',
    criterionFr: 'Cmax/CMI ≥ 8–10 (intervalle d’objectifs proposés)',
    criterionEn: 'Cmax/MIC ≥ 8–10 (proposed target interval)',
    contextFr: 'Cible d’efficacité liée au pic, distincte de la sécurité de la résiduelle. Limites de sécurité résiduelle dans le même consensus : amikacine <2,5 mg/L, gentamicine/tobramycine <0,5 mg/L, surtout si traitement >3 jours. Interpréter selon schéma de dose, moment du pic et microbiologie.',
    contextEn: 'Efficacy peak target, separate from trough toxicity. Same consensus cites safety troughs: amikacin <2.5 mg/L, gentamicin/tobramycin <0.5 mg/L, especially after >3 days. Sampling, regimen and pathogen matter.',
    evidenceSection: 'Table 4 and Aminoglycosides pharmacodynamics: Cmax/MIC ≥8–10; Cmin safety separately',
    status: 'consensus-class'
  })),
  ...fluoroquinoloneIds.map((drug) => ({
    id: drug + ':icu-free-auc-mic', drug, kind: 'free_auc_ratio',
    labelFr: 'Infection bactérienne · réanimation adulte (proposition PK/PD)',
    labelEn: 'Bacterial infection · adult ICU (PK/PD proposal)',
    metric: 'fAUC₀–₂₄/CMI', unit: 'ratio',
    criterionFr: 'fAUC₀–₂₄/CMI ≥ 80',
    criterionEn: 'fAUC₀–₂₄/MIC ≥ 80',
    contextFr: 'Proposition du tableau 4 pour la classe ; la cible peut différer selon pathogène, site infectieux et espèce (les rapports AUC/CMI pour bactéries Gram négatif peuvent être plus élevés). Le panel ne préconise ni ne déconseille le STP systématique des fluoroquinolones.',
    contextEn: 'Table 4 proposed class target; species, site and pathogen can require different AUC/MIC ratios, particularly Gram-negative infections. The panel neither recommends nor discourages routine fluoroquinolone TDM.',
    evidenceSection: 'Table 4 Fluoroquinolones: fAUC24/MIC ≥80; efficacy section discusses pathogen-dependent ranges',
    status: 'conditional-class'
  })),
  {
    id: 'daptomycin:icu-auc-mic', drug: 'daptomycin', kind: 'total_auc_ratio',
    labelFr: 'Infection bactérienne · réanimation adulte (proposition PK/PD)',
    labelEn: 'Bacterial infection · adult ICU (PK/PD proposal)',
    metric: 'AUC₀–₂₄/CMI', unit: 'ratio',
    criterionFr: 'AUC₀–₂₄/CMI > 666',
    criterionEn: 'AUC₀–₂₄/MIC > 666',
    contextFr: 'Objectif proposé à partir d’études d’exposition en réanimation. Ne pas confondre avec les seuils de toxicité : Cmin ≥24 mg/L est associé à une élévation de CPK. Le panel ne recommande ni ne déconseille le STP systématique.',
    contextEn: 'Suggested ICU exposure target, not an efficacy guarantee. Distinguish from toxicity: trough ≥24 mg/L associated with elevated creatine phosphokinase. Routine TDM neither recommended nor discouraged.',
    evidenceSection: 'Table 4 Daptomycin and section Daptomycin: AUC/MIC >666, safety Cmin <24 mg/L',
    status: 'conditional-class'
  },
  {
    id: 'vancomycin:serious-mrsa-mic', drug: 'vancomycin', kind: 'vancomycin_mic1',
    labelFr: 'Infection grave à SARM · CMI en microdilution',
    labelEn: 'Serious MRSA infection · broth microdilution MIC',
    metric: 'AUC₀–₂₄/CMI', unit: 'ratio',
    criterionFr: 'AUC₀–₂₄/CMI 400–600 (hypothèse CMI = 1 mg/L)',
    criterionEn: 'AUC₀–₂₄/MIC 400–600 (assumed MIC = 1 mg/L)',
    contextFr: 'Ne pas multiplier automatiquement 400–600 par une CMI >1 mg/L : une AUC excessive peut augmenter la néphrotoxicité. Le consensus ASHP/IDSA/PIDS/SIDP 2020 recommande une AUC24 400–600 mg·h/L en supposant une CMI de 1 mg/L pour les infections graves à SARM.',
    contextEn: 'Do not mechanically increase AUC 400–600 when MIC exceeds 1 mg/L: higher AUC may increase nephrotoxicity. 2020 ASHP/IDSA/PIDS/SIDP consensus recommends AUC24 400–600 mg·h/L assuming MIC=1 mg/L for serious MRSA infection.',
    evidenceSection: 'ASHP/IDSA/PIDS/SIDP 2020 Executive Summary; not a linear MIC-based dose escalation rule',
    status: 'specific-guideline',
    source: {
      citation: 'ASHP / IDSA / PIDS / SIDP · 2020',
      title: 'Therapeutic monitoring of vancomycin for serious MRSA infections',
      url: 'https://www.idsociety.org/practice-guideline/vancomycin/',
      doi: '10.1093/ajhp/zxaa036'
    }
  }
]);

export function parseMic(value) {
  const raw = String(value ?? '').trim();
  if (!/^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(raw)) return null;
  const mic = Number(raw.replace(',', '.'));
  return Number.isFinite(mic) && mic > 0 && mic <= 1024 ? mic : null;
}

export function formatMicCalculation(target, mic, lang = 'fr') {
  if (!Number.isFinite(mic) || mic <= 0) return null;
  const number = (v) => new Intl.NumberFormat(lang === 'en' ? 'en' : 'fr', {
    maximumFractionDigits: 4
  }).format(v);
  const value = number(mic);
  switch (target.kind) {
    case 'beta_trough':
      return (lang === 'fr' ? 'Repère : fCmin > ' : 'Surrogate: unbound Cmin > ') + value + ' mg/L';
    case 'beta_continuous':
      return (lang === 'fr' ? 'À l’état stable : fCss > ' : 'At steady state: unbound Css > ') + value + ' mg/L';
    case 'peak_ratio':
      return 'Cmax ≥ ' + number(8 * mic) + '–' + number(10 * mic) + ' mg/L';
    case 'free_auc_ratio':
      return 'fAUC₀–₂₄ ≥ ' + number(80 * mic) + ' mg·h/L';
    case 'total_auc_ratio':
      return 'AUC₀–₂₄ > ' + number(666 * mic) + ' mg·h/L';
    case 'vancomycin_mic1':
      return mic === 1
        ? 'AUC₀–₂₄ : 400–600 mg·h/L (CMI = 1 mg/L)'
        : (lang === 'fr'
          ? 'Pas de recalcul linéaire pour cette CMI : réévaluer l’antibiotique, la CMI et le risque toxique.'
          : 'Do not linearly scale AUC to this MIC; reassess MIC method, drug choice and toxicity.');
    default: throw new Error('Unknown antibiotic PK/PD target kind: ' + target.kind);
  }
}

export function antibioticPdForDrug(drugId) {
  return antibioticPdTargets.filter((row) => row.drug === drugId);
}

export function antibioticPdReference(target) {
  return target.source ?? antibioticPdSource;
}

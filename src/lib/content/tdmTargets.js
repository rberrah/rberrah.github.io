// Curated bibliographic targets for the PMx Explain educational reference.
// This catalogue is deliberately separate from the executable MIPD-Engine model library.
// Scientific author review: PENDING. Do not use as a clinical dosing protocol.
export const tdmTargetSources = {
  mpa2025: {
    title: 'Liu et al. (2025) · Practice guideline for MPA TDM in solid-organ transplantation',
    url: 'https://doi.org/10.1631/jzus.B2400069',
    year: 2025
  },
  mpa2015heart: {
    title: 'Woillard et al. (2015) · Mycophenolate PK and exposure–effect in heart transplant recipients',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26192348/',
    year: 2015
  },
  tac2025: {
    title: 'Therapeutic drug monitoring of tacrolimus after kidney transplantation (2025) · centre-specific Table 1',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12122127/',
    year: 2025
  },
  everolimus2016: {
    title: 'Therapeutic Drug Monitoring of Everolimus: A Consensus Report (2016)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26982492/',
    year: 2016
  },
  vancomycin2020: {
    title: 'ASHP/IDSA/PIDS/SIDP vancomycin monitoring consensus (2020)',
    url: 'https://www.idsociety.org/practice-guideline/vancomycin/',
    year: 2020
  },
  lithium2019: {
    title: 'ISBD/IGSLI Task Force · Optimal lithium levels in bipolar maintenance (2019)',
    url: 'https://doi.org/10.1111/bdi.12805',
    year: 2019
  }
};

export const tdmDrugs = [
  { id: 'mpa', fr: 'Mycophénolate (MPA)', en: 'Mycophenolate (MPA)', aliases: ['mycophenolate', 'mycophénolate', 'acide mycophénolique', 'mycophenolic acid', 'MPA', 'MMF', 'mycophenolate mofetil', 'Cellcept', 'Myfortic'] },
  { id: 'tac', fr: 'Tacrolimus', en: 'Tacrolimus', aliases: ['tacrolimus', 'Prograf', 'Adport', 'FK506'] },
  { id: 'everolimus', fr: 'Évérolimus', en: 'Everolimus', aliases: ['évérolimus', 'everolimus', 'Certican', 'Zortress'] },
  { id: 'vancomycin', fr: 'Vancomycine', en: 'Vancomycin', aliases: ['vancomycine', 'vancomycin', 'vanco'] },
  { id: 'lithium', fr: 'Lithium', en: 'Lithium', aliases: ['lithium', 'lithémie', 'lithiemie'] }
];

// Every entry is a specific drug × indication × exposure metric × regimen.
// Bounds are bibliographic claims, not patient-level dose recommendations.
// 'approx' denotes a proposed study cut-point, not a therapeutic window.
export const tdmTargets = [
  {
    id: 'mpa-kidney-auc', drug: 'mpa', indication: 'kidney',
    indicationFr: 'Greffe rénale', indicationEn: 'Kidney transplant',
    metric: 'AUC₀–₁₂h', unit: 'mg·h/L', matrixFr: 'Plasma, MPA total', matrixEn: 'Plasma, total MPA',
    relation: 'range', min: 30, max: 60, status: 'guideline', source: 'mpa2025',
    contextFr: 'Immunosuppression après greffe rénale ; interpréter selon le protocole et le traitement associé.',
    contextEn: 'Post-kidney-transplant immunosuppression; consider the local protocol and co-medication.',
    evidenceFr: 'Recommandation forte ; certitude des preuves faible.',
    evidenceEn: 'Strong recommendation; low certainty of evidence.'
  },
  {
    id: 'mpa-heart-auc', drug: 'mpa', indication: 'heart',
    indicationFr: 'Greffe cardiaque', indicationEn: 'Heart transplant',
    metric: 'AUC₀–₁₂h', unit: 'mg·h/L', matrixFr: 'Plasma, MPA total', matrixEn: 'Plasma, total MPA',
    relation: 'above', min: 36, max: null, status: 'guideline', source: 'mpa2025',
    contextFr: 'Seuil indicatif ; pas de borne supérieure consensuelle dans cette recommandation.',
    contextEn: 'Indicative lower threshold; no consensual upper bound in this guideline.',
    evidenceFr: 'Déclaration de bonne pratique (GPS).', evidenceEn: 'Good practice statement (GPS).'
  },
  {
    id: 'mpa-heart-auc-study', drug: 'mpa', indication: 'heart',
    indicationFr: 'Greffe cardiaque', indicationEn: 'Heart transplant',
    metric: 'AUC₀–₁₂h', unit: 'mg·h/L', matrixFr: 'Plasma, MPA total', matrixEn: 'Plasma, total MPA',
    relation: 'approx', min: 50, max: null, status: 'study', source: 'mpa2015heart',
    contextFr: 'Point de coupure proposé par une étude exposition–rejet ; ne constitue pas une cible universellement validée.',
    contextEn: 'Cut-point proposed in an exposure–rejection study; not a universally validated target.',
    evidenceFr: 'Résultat d’une étude, à distinguer des recommandations.',
    evidenceEn: 'Study-derived finding; distinct from a practice guideline.'
  },
  {
    id: 'mpa-liver-auc', drug: 'mpa', indication: 'liver',
    indicationFr: 'Greffe hépatique', indicationEn: 'Liver transplant',
    metric: 'AUC₀–₁₂h', unit: 'mg·h/L', matrixFr: 'Plasma, MPA total', matrixEn: 'Plasma, total MPA',
    relation: 'range', min: 30, max: 60, status: 'guideline', source: 'mpa2025',
    contextFr: 'Tenir compte de la stratégie immunosuppressive, notamment de la co-prescription de tacrolimus.',
    contextEn: 'Account for the immunosuppressive regimen, including concomitant tacrolimus.',
    evidenceFr: 'Déclaration de bonne pratique (GPS).', evidenceEn: 'Good practice statement (GPS).'
  },
  {
    id: 'mpa-lung-auc', drug: 'mpa', indication: 'lung',
    indicationFr: 'Greffe pulmonaire', indicationEn: 'Lung transplant',
    metric: 'AUC₀–₁₂h', unit: 'mg·h/L', matrixFr: 'Plasma, MPA total', matrixEn: 'Plasma, total MPA',
    relation: 'range', min: 22.73, max: 40.46, status: 'guideline', source: 'mpa2025',
    contextFr: 'Fenêtre issue d’études limitées ; ne pas extrapoler aux autres organes.',
    contextEn: 'Range drawn from limited studies; do not extrapolate to other organs.',
    evidenceFr: 'Recommandation faible ; certitude modérée.',
    evidenceEn: 'Weak recommendation; moderate certainty.'
  },
  {
    id: 'tac-kidney-early', drug: 'tac', indication: 'kidney',
    indicationFr: 'Greffe rénale · moins de 6 semaines', indicationEn: 'Kidney transplant · under 6 weeks',
    metric: 'C₀', unit: 'ng/mL', matrixFr: 'Sang total', matrixEn: 'Whole blood',
    relation: 'range', min: 8, max: 10, status: 'study', source: 'tac2025',
    contextFr: 'Tacrolimus à libération immédiate, MPA ± prednisone, induction basiliximab ; cible publiée pour un centre.',
    contextEn: 'Immediate-release tacrolimus, MPA ± prednisone, basiliximab induction; published centre-specific target.',
    evidenceFr: 'Exemple de protocole, non universel.', evidenceEn: 'Example centre protocol, not universal.'
  },
  {
    id: 'tac-kidney-mid', drug: 'tac', indication: 'kidney',
    indicationFr: 'Greffe rénale · 6 semaines à 6 mois', indicationEn: 'Kidney transplant · 6 weeks to 6 months',
    metric: 'C₀', unit: 'ng/mL', matrixFr: 'Sang total', matrixEn: 'Whole blood',
    relation: 'range', min: 5, max: 7, status: 'study', source: 'tac2025',
    contextFr: 'Tacrolimus à libération immédiate, MPA ± prednisone, induction basiliximab ; protocole spécifique.',
    contextEn: 'Immediate-release tacrolimus, MPA ± prednisone, basiliximab induction; protocol-specific.',
    evidenceFr: 'Exemple de protocole, non universel.', evidenceEn: 'Example centre protocol, not universal.'
  },
  {
    id: 'tac-kidney-late', drug: 'tac', indication: 'kidney',
    indicationFr: 'Greffe rénale · après 6 mois', indicationEn: 'Kidney transplant · after 6 months',
    metric: 'C₀', unit: 'ng/mL', matrixFr: 'Sang total', matrixEn: 'Whole blood',
    relation: 'range', min: 3, max: 5, status: 'study', source: 'tac2025',
    contextFr: 'Tacrolimus immédiat, MPA ± prednisone. La source conditionne C₀ < 5 à une AUC₀–₁₂h > 75 µg·h/L ; ne pas appliquer isolément.',
    contextEn: 'Immediate-release tacrolimus with MPA ± prednisone. Source conditions C₀ < 5 on AUC₀–₁₂h > 75 µg·h/L; do not use in isolation.',
    evidenceFr: 'Exemple de protocole, non universel.', evidenceEn: 'Example centre protocol, not universal.'
  },
  {
    id: 'everolimus-cni', drug: 'everolimus', indication: 'transplant',
    indicationFr: 'Transplantation · avec inhibiteur de calcineurine', indicationEn: 'Transplant · with calcineurin inhibitor',
    metric: 'C₀', unit: 'ng/mL', matrixFr: 'Sang total', matrixEn: 'Whole blood',
    relation: 'range', min: 3, max: 8, status: 'guideline', source: 'everolimus2016',
    contextFr: 'Association à un inhibiteur de calcineurine et/ou autres immunosuppresseurs ; interpréter selon la méthode analytique.',
    contextEn: 'Concomitant calcineurin inhibitor and/or other immunosuppressants; account for assay method.',
    evidenceFr: 'Consensus TDM.', evidenceEn: 'TDM consensus.'
  },
  {
    id: 'everolimus-no-cni', drug: 'everolimus', indication: 'transplant',
    indicationFr: 'Transplantation · sans inhibiteur de calcineurine', indicationEn: 'Transplant · without calcineurin inhibitor',
    metric: 'C₀', unit: 'ng/mL', matrixFr: 'Sang total', matrixEn: 'Whole blood',
    relation: 'range', min: 6, max: 10, status: 'guideline', source: 'everolimus2016',
    contextFr: 'Schéma sans inhibiteur de calcineurine ; non interchangeable avec la cible en association.',
    contextEn: 'Calcineurin-inhibitor-free regimen; not interchangeable with combination target.',
    evidenceFr: 'Consensus TDM.', evidenceEn: 'TDM consensus.'
  },
  {
    id: 'vancomycin-mrsa', drug: 'vancomycin', indication: 'infection',
    indicationFr: 'Infection invasive grave à SARM', indicationEn: 'Serious invasive MRSA infection',
    metric: 'AUC₂₄', unit: 'mg·h/L', matrixFr: 'Plasma ou sérum', matrixEn: 'Plasma or serum',
    relation: 'range', min: 400, max: 600, status: 'guideline', source: 'vancomycin2020',
    contextFr: 'AUC₂₄ sous hypothèse de CMI = 1 mg/L (microdilution) ; cible AUC/CMI 400–600. Pas une cible C₀ 15–20 mg/L.',
    contextEn: 'AUC₂₄ with assumed MIC = 1 mg/L (broth microdilution); AUC/MIC target 400–600. Not a C₀ target of 15–20 mg/L.',
    evidenceFr: 'Consensus ASHP/IDSA/PIDS/SIDP ; spécifique aux infections graves à SARM.',
    evidenceEn: 'ASHP/IDSA/PIDS/SIDP consensus; specific to serious MRSA infections.'
  },
  {
    id: 'lithium-maintenance', drug: 'lithium', indication: 'bipolar',
    indicationFr: 'Trouble bipolaire · entretien adulte', indicationEn: 'Bipolar disorder · adult maintenance',
    metric: 'C₁₂h', unit: 'mmol/L', matrixFr: 'Sérum', matrixEn: 'Serum',
    relation: 'range', min: 0.6, max: 0.8, status: 'guideline', source: 'lithium2019',
    contextFr: 'Prélèvement 12 ± 1 h après la dose du soir ; cible standard chez l’adulte.',
    contextEn: 'Sample at 12 ± 1 h after the evening dose; standard adult target.',
    evidenceFr: 'Consensus ISBD/IGSLI.', evidenceEn: 'ISBD/IGSLI consensus.'
  },
  {
    id: 'lithium-tolerability', drug: 'lithium', indication: 'bipolar',
    indicationFr: 'Trouble bipolaire · bonne réponse, mauvaise tolérance', indicationEn: 'Bipolar disorder · good response, poor tolerability',
    metric: 'C₁₂h', unit: 'mmol/L', matrixFr: 'Sérum', matrixEn: 'Serum',
    relation: 'range', min: 0.4, max: 0.6, status: 'guideline', source: 'lithium2019',
    contextFr: 'Option du consensus chez l’adulte en entretien ; ne pas extrapoler à une phase aiguë.',
    contextEn: 'Adult-maintenance consensus alternative; do not extrapolate to acute treatment.',
    evidenceFr: 'Consensus conditionnel ISBD/IGSLI.', evidenceEn: 'Conditional ISBD/IGSLI consensus.'
  },
  {
    id: 'lithium-response', drug: 'lithium', indication: 'bipolar',
    indicationFr: 'Trouble bipolaire · réponse insuffisante, bonne tolérance', indicationEn: 'Bipolar disorder · insufficient response, good tolerability',
    metric: 'C₁₂h', unit: 'mmol/L', matrixFr: 'Sérum', matrixEn: 'Serum',
    relation: 'range', min: 0.8, max: 1, status: 'guideline', source: 'lithium2019',
    contextFr: 'Option du consensus chez l’adulte en entretien ; discussion clinique requise.',
    contextEn: 'Adult-maintenance consensus alternative; clinical assessment required.',
    evidenceFr: 'Consensus conditionnel ISBD/IGSLI.', evidenceEn: 'Conditional ISBD/IGSLI consensus.'
  }
];

export function normalizeTdmSearch(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
}

export function searchTdmTargets({ query = '', drug = 'all', indication = 'all' } = {}) {
  const needle = normalizeTdmSearch(query);
  // Exact drug names/aliases take precedence over incidental co-medication mentions.
  // Otherwise typing "MPA" would also retrieve tacrolimus entries that merely mention MPA.
  const exactDrugIds = needle ? tdmDrugs.filter((item) =>
    [item.fr, item.en, ...item.aliases].some((name) => normalizeTdmSearch(name) === needle)
  ).map((item) => item.id) : [];
  return tdmTargets.filter((entry) => {
    if (exactDrugIds.length && !exactDrugIds.includes(entry.drug)) return false;
    if (drug !== 'all' && entry.drug !== drug) return false;
    if (indication !== 'all' && entry.indication !== indication) return false;
    if (!needle) return true;
    const molecule = tdmDrugs.find((item) => item.id === entry.drug);
    const terms = [
      molecule?.fr, molecule?.en, ...(molecule?.aliases ?? []),
      entry.indicationFr, entry.indicationEn, entry.metric,
      entry.contextFr, entry.contextEn, entry.matrixFr, entry.matrixEn
    ].join(' ');
    return normalizeTdmSearch(terms).includes(needle);
  });
}

export function formatTdmTarget(entry, lang = 'fr') {
  const value = (number) => new Intl.NumberFormat(lang === 'en' ? 'en' : 'fr', { maximumFractionDigits: 2 }).format(number);
  if (entry.relation === 'range') return `${value(entry.min)}–${value(entry.max)}`;
  if (entry.relation === 'above') return `>${value(entry.min)}`;
  if (entry.relation === 'approx') return `≈${value(entry.min)}`;
  throw new Error(`Unknown TDM target relation: ${entry.relation}`);
}

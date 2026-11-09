// Curated bibliographic targets for the PMx Explain educational reference.
// This catalogue is deliberately separate from the executable MIPD-Engine model library.
// Scientific author review: PENDING. Do not use as a clinical dosing protocol.
// The numeric source must contain the numeric claim itself, not merely discuss TDM.
// Access means the claim is visible in full text or an open bibliographic abstract.
export const TDM_REFERENCE_REVIEW_DATE = '2026-11-09';
export const tdmInstitutionalResources = [
  {
    id: 'sfpt-stp',
    organization: 'SFPT',
    titleFr: 'SFPT · Groupe Suivi thérapeutique pharmacologique et personnalisation des traitements',
    titleEn: 'SFPT · Therapeutic drug monitoring and treatment personalization working group',
    url: 'https://www.sfpt-fr.org/groupes-de-travail/stp-personnalisation-des-traitements',
    scopeFr: 'Référence institutionnelle prioritaire pour le STP ; cette page ne donne pas de cible chiffrée.',
    scopeEn: 'Priority French TDM institutional resource; this page does not specify a numeric target.'
  },
  {
    id: 'sft-stp',
    organization: 'SFT',
    titleFr: 'SFT · Fiche pharmacien « Traitement immunosuppresseur en transplantation rénale » (2022)',
    titleEn: 'SFT · Pharmacist information sheet on kidney transplant immunosuppression (2022)',
    url: 'https://www.transplantation-francophone.org/wp-content/uploads/Traitement-immunosuppresseur-en-transplantation-renale-Fiche-pharmacien.pdf',
    scopeFr: 'Pages 4–5 : choix de C₀ pour les anticalcineurines/mTOR et AUC₀–₁₂h pour le mycophénolate ; aucune cible numérique dans cette fiche.',
    scopeEn: 'Pages 4–5: trough monitoring for CNI/mTOR and MPA AUC₀–₁₂h; no numeric target range stated in this sheet.'
  },
  {
    id: 'sfpt-book',
    organization: 'SFPT',
    titleFr: 'SFPT · Suivi Thérapeutique Pharmacologique : Pour la personnalisation des traitements médicamenteux (2025)',
    titleEn: 'SFPT · Therapeutic drug monitoring handbook (2025)',
    url: 'https://www.sfpt-fr.org/?catid=78&id=2145%3Apublication-du-livre-suivi-th%C3%A9rapeutique-pharmacologique-pour-la-personnalisation-des-traitements-m%C3%A9dicamenteux&view=article',
    scopeFr: 'Ouvrage de référence pertinent, mais contenu intégral payant : pas utilisé pour attribuer les chiffres tant que les passages ne sont pas consultables.',
    scopeEn: 'Relevant handbook but full content is paid: not used to attribute numeric values without accessible passages.'
  },
  {
    id: 'sft-iatdmct',
    organization: 'SFT / IATDMCT',
    titleFr: 'SFT · Comité scientifique des immunosuppresseurs de l’IATDMCT',
    titleEn: 'SFT · IATDMCT Immunosuppressive Drugs Scientific Committee',
    url: 'https://www.transplantation-francophone.org/partenaires-reseaux/societes-savantes/immunosuppressive-drugs-scientific-committee-iatdmct/',
    scopeFr: 'Présentation des consensus tacrolimus, MPA et évérolimus ; cette page n’est pas elle-même la preuve chiffrée.',
    scopeEn: 'Links to tacrolimus, MPA and everolimus consensus work; this page does not itself establish a numeric target.'
  }
];

export const tdmTargetSources = {
  mpa2025: {
    title: 'Liu et al. (2025) · Recommandations MPA en transplantation d’organes solides',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12456993/',
    doi: '10.1631/jzus.B2400069',
    year: 2025, organization: 'Practice guideline / international',
    access: 'open_full_text', evidenceSection: 'Recommendation 6, Table 3 (AUC₀–₁₂h)',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  mpa2015heart: {
    title: 'Woillard et al. (2015) · PK et exposition–rejet après transplantation cardiaque',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26192348/',
    doi: '10.1016/j.phrs.2015.07.012',
    year: 2015, organization: 'Original peer-reviewed cohort study',
    access: 'open_abstract', evidenceSection: 'Abstract / Results; n=40, sensitivity 77%, specificity 25%',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  tac2025: {
    title: 'Tacrolimus after kidney transplantation (2025) · Exemple de protocole local',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12122127/',
    year: 2025, organization: 'Peer-reviewed review / single-centre targets',
    access: 'open_full_text', evidenceSection: 'Table 1 (immediate-release tacrolimus), notes and AUC condition',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  everolimus2025: {
    title: 'Masuda et al. (2025) · Deuxième consensus IATDMCT sur l’évérolimus',
    url: 'https://doi.org/10.1097/FTD.0000000000001250',
    doi: '10.1097/FTD.0000000000001250',
    year: 2025, organization: 'IATDMCT / Immunosuppressive Drugs Scientific Committee',
    access: 'open_full_text', evidenceSection: 'Table 1 and kidney/heart-transplantation recommendations',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  vancomycin2020: {
    title: 'ASHP/IDSA/PIDS/SIDP (2020) · Consensus vancomycine',
    url: 'https://www.idsociety.org/practice-guideline/vancomycin/',
    doi: '10.1093/ajhp/zxaa036',
    year: 2020, organization: 'ASHP / IDSA / PIDS / SIDP',
    access: 'open_full_text', evidenceSection: 'Executive summary, AUC24 400–600 for serious MRSA at MIC 1 mg/L',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  lithium2019: {
    title: 'Nolen et al. (2019) · Consensus ISBD/IGSLI sur le lithium',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6688930/',
    doi: '10.1111/bdi.12805',
    year: 2019, organization: 'ISBD / IGSLI expert task force',
    access: 'open_full_text', evidenceSection: 'Table 5 and conclusion (adult maintenance, 12 ± 1 h samples)',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
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
    contextFr: 'Seuil ROC exploratoire (40 adultes transplantés cardiaques ; sensibilité 77 %, spécificité 25 %), non validé comme cible thérapeutique de consensus.',
    contextEn: 'Exploratory ROC cut-point (40 adult heart recipients; sensitivity 77%, specificity 25%), not a consensus-validated therapeutic target.',
    evidenceFr: 'Étude observationnelle ; valeur à distinguer des recommandations.',
    evidenceEn: 'Observational study finding; distinct from a practice guideline.'
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
    id: 'everolimus-kidney-cni', drug: 'everolimus', indication: 'kidney',
    indicationFr: 'Greffe rénale · avec ICN à exposition réduite', indicationEn: 'Kidney transplant · reduced-exposure CNI',
    metric: 'C₀', unit: 'ng/mL', matrixFr: 'Sang total', matrixEn: 'Whole blood',
    relation: 'range', min: 3, max: 8, status: 'guideline', source: 'everolimus2025',
    contextFr: 'Évérolimus avec inhibiteur de calcineurine à exposition réduite ; la méthode analytique doit être prise en compte.',
    contextEn: 'Everolimus with reduced-exposure calcineurin inhibitor; analytical assay matters.',
    evidenceFr: 'Consensus IATDMCT 2025, greffe rénale.', evidenceEn: 'IATDMCT 2025 consensus, kidney transplant.'
  },
  {
    id: 'everolimus-kidney-no-cni', drug: 'everolimus', indication: 'kidney',
    indicationFr: 'Greffe rénale · sans ICN', indicationEn: 'Kidney transplant · CNI-free',
    metric: 'C₀', unit: 'ng/mL', matrixFr: 'Sang total', matrixEn: 'Whole blood',
    relation: 'range', min: 6, max: 10, status: 'guideline', source: 'everolimus2025',
    contextFr: 'Schéma sans ICN décrit dans le tableau 1 ; ne pas confondre avec la greffe cardiaque sans ICN.',
    contextEn: 'CNI-free regimen from Table 1; not the same target as CNI-free heart transplantation.',
    evidenceFr: 'Consensus IATDMCT 2025, greffe rénale.', evidenceEn: 'IATDMCT 2025 consensus, kidney transplant.'
  },
  {
    id: 'everolimus-heart-cni', drug: 'everolimus', indication: 'heart',
    indicationFr: 'Greffe cardiaque · avec ICN réduit', indicationEn: 'Heart transplant · reduced-exposure CNI',
    metric: 'C₀', unit: 'ng/mL', matrixFr: 'Sang total', matrixEn: 'Whole blood',
    relation: 'range', min: 3, max: 8, status: 'guideline', source: 'everolimus2025',
    contextFr: 'Cible de l’évérolimus avec ICN réduit ; un schéma quadruple peut avoir une cible différente (3–6 ng/mL).',
    contextEn: 'Everolimus with reduced CNI; a quadruple regimen may have a different target (3–6 ng/mL).',
    evidenceFr: 'Consensus IATDMCT 2025, greffe cardiaque.', evidenceEn: 'IATDMCT 2025 consensus, heart transplant.'
  },
  {
    id: 'everolimus-heart-no-cni', drug: 'everolimus', indication: 'heart',
    indicationFr: 'Greffe cardiaque · sans ICN, avec MPA et corticoïdes', indicationEn: 'Heart transplant · CNI-free, with MPA and steroids',
    metric: 'C₀', unit: 'ng/mL', matrixFr: 'Sang total', matrixEn: 'Whole blood',
    relation: 'range', min: 5, max: 10, status: 'guideline', source: 'everolimus2025',
    contextFr: 'Schéma sans ICN associant MPA et glucocorticoïdes ; le consensus recommande d’éviter C₀ <5 ng/mL.',
    contextEn: 'CNI-free regimen combined with MPA and glucocorticoids; the consensus recommends avoiding C₀ below 5 ng/mL.',
    evidenceFr: 'Consensus IATDMCT 2025, greffe cardiaque.', evidenceEn: 'IATDMCT 2025 consensus, heart transplant.'
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

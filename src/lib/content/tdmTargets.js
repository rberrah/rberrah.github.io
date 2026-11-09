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
    scopeFr: 'Ouvrage collectif commercialisé ; seul l’extrait libre du chapitre 35 (tableau 35.2, valproate) est utilisé pour une cible chiffrée.',
    scopeEn: 'The complete handbook is commercial; only the freely accessible chapter 35 excerpt (valproate, Table 35.2) supports a numerical target here.'
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

/** @type {Record<string, {title: string, url: string, doi?: string, year: number, organization: string, citation: string, access: 'open_full_text'|'open_abstract', evidenceSection: string, verifiedOn: string, newerConsensusUrl?: string, newerConsensusTitle?: string}>} */
export const tdmTargetSources = {
  thaiKT2026: {
    title: "Udomkarnjananun et al. (2026) · Thai Transplant Care, greffe rénale adulte",
    citation: "Thai Transplant 2026",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13624913/",
    doi: "10.1111/nep.70268",
    year: 2026, organization: "Thai transplantation society / guideline",
    access: 'open_full_text',
    evidenceSection: "Table 5, CsA + MPA column; C0 and C2 by 0–3, 3–6 and >6 months",
    verifiedOn: TDM_REFERENCE_REVIEW_DATE,
  },
  sirolimus2022: {
    title: "Hartinger et al. (2022) · Individualisation des inhibiteurs mTOR",
    citation: "Hartinger 2022",
    url: "https://onlinelibrary.wiley.com/doi/full/10.1111/jcpt.13753",
    doi: "10.1111/jcpt.13753",
    year: 2022, organization: "Peer-reviewed pharmacokinetics review",
    access: 'open_full_text',
    evidenceSection: "Section 3.5, sirolimus with cyclosporine 4–12 µg/L, following cyclosporine discontinuation 12–20 µg/L",
    verifiedOn: TDM_REFERENCE_REVIEW_DATE,
  },
  icuTdm2020: {
    title: "Abdul-Aziz et al. (2020) · Position paper STP en réanimation adulte",
    citation: "ICU TDM 2020",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7223855/",
    doi: "10.1007/s00134-020-06050-1",
    year: 2020, organization: "International multidisciplinary critical-care TDM position paper",
    access: 'open_full_text',
    evidenceSection: "Table 3 and antifungal sections (posaconazole prophylaxis/treatment and voriconazole)",
    verifiedOn: TDM_REFERENCE_REVIEW_DATE,
  },
  antidepressant2025: {
    title: "Schoretsanitis & Paulzen (2025/2026) · TDM des antidépresseurs",
    citation: "Schoretsanitis 2025",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12672037/",
    doi: "10.1097/YCO.0000000000001046",
    year: 2025, organization: "Peer-reviewed open-access narrative review",
    access: 'open_full_text',
    evidenceSection: "Table 1, therapeutic reference ranges in blood for adults with major depressive disorder; sampling and active-metabolite notes",
    verifiedOn: TDM_REFERENCE_REVIEW_DATE,
    newerConsensusUrl: "https://pubmed.ncbi.nlm.nih.gov/42392224/",
    newerConsensusTitle: "Hart et al. 2026 — AGNP update; revalidation of individual numeric ranges pending",
  },
  psychReview2024: {
    title: "Biso et al. (2024) · TDM en psychiatrie",
    citation: "Biso 2024",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11124530/",
    doi: "10.3390/ph17050642",
    year: 2024, organization: "Peer-reviewed open-access pharmacology review",
    access: 'open_full_text',
    evidenceSection: "Table 3, ranges for duloxetine, escitalopram and vortioxetine; Table 1 for antiseizure agents",
    verifiedOn: TDM_REFERENCE_REVIEW_DATE,
  },
  levetiLimoges2022: {
    title: "Couderc, Chouchane & Saint-Marcoux (2022) · Référence lévétiracétam",
    citation: "Couderc / CHU Limoges 2022",
    url: "https://pubmed.ncbi.nlm.nih.gov/35239286/",
    doi: "10.1097/FTD.0000000000000972",
    year: 2022, organization: "Peer-reviewed commentary by CHU Limoges pharmacology investigators",
    access: 'open_abstract',
    evidenceSection: "Public abstract: historical AGNP/erratum 10–40 mg/L; discussion of wider individual range",
    verifiedOn: TDM_REFERENCE_REVIEW_DATE,
  },
  levetiReview2016: {
    title: "Jacob & Nair (2016) · STP des nouveaux antiépileptiques",
    citation: "Jacob / Nair 2016",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5114206/",
    year: 2016, organization: "Peer-reviewed open-access review",
    access: 'open_full_text',
    evidenceSection: "Levetiracetam section and table: 12–46 mg/L; drug concentrations mostly used for specific clinical questions",
    verifiedOn: TDM_REFERENCE_REVIEW_DATE,
  },
  oxcarb2018: {
    title: "Reimers et al. (2018) · Valeurs de référence antiépileptiques",
    citation: "Reimers 2018",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5811172/",
    year: 2018, organization: "Peer-reviewed clinical reference proposal",
    access: 'open_full_text',
    evidenceSection: "Oxcarbazepine section: active 10-hydroxycarbazepine/licarbazepine (MHD) reference intervals",
    verifiedOn: TDM_REFERENCE_REVIEW_DATE,
  },
  phenytoinFDA: {
    title: "FDA / DailyMed · Dilantin-125 prescribing information",
    citation: "FDA / Dilantin",
    url: "https://dailymed-beta.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=f339f9e4-b289-4efe-82b9-46c57d1dc277&type=display",
    year: 2023, organization: "Official US prescribing information",
    access: 'open_full_text',
    evidenceSection: "Dosage and Administration 2.4 and 2.6: total phenytoin 10–20 µg/mL; free fraction 1–2",
    verifiedOn: TDM_REFERENCE_REVIEW_DATE,
  },
  phenobarbNHS: {
    title: "Newcastle Hospitals (2024) · Phenobarbitone serum test",
    citation: "NHS Newcastle 2024",
    url: "https://laboratories.newcastle-hospitals.nhs.uk/test-directory/phenobarbitone-serum/",
    year: 2024, organization: "NHS institutional laboratory reference",
    access: 'open_full_text',
    evidenceSection: "Reference ranges: therapeutic 10–40 mg/L; monitoring and sampling caveats",
    verifiedOn: TDM_REFERENCE_REVIEW_DATE,
  },
  digoxinAHA2013: {
    title: "ACCF/AHA (2013) · Heart failure guideline, digoxin",
    citation: "AHA / ACCF 2013",
    url: "https://www.jacc.org/doi/10.1016/j.jacc.2013.05.019",
    doi: "10.1016/j.jacc.2013.05.019",
    year: 2013, organization: "ACCF/AHA clinical guideline",
    access: 'open_full_text',
    evidenceSection: "Section 7.3.2.7.2: plasma digoxin concentration 0.5–0.9 ng/mL in heart failure",
    verifiedOn: TDM_REFERENCE_REVIEW_DATE,
  },
  mpa2025: {
    citation: 'Liu et al. · 2025',
    title: 'Liu et al. (2025) · Recommandations MPA en transplantation d’organes solides',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12456993/',
    doi: '10.1631/jzus.B2400069',
    year: 2025, organization: 'Practice guideline / international',
    access: 'open_full_text', evidenceSection: 'Recommendation 6, Table 3 (AUC₀–₁₂h)',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  mpa2015heart: {
    citation: 'Woillard et al. · 2015',
    title: 'Woillard et al. (2015) · PK et exposition–rejet après transplantation cardiaque',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26192348/',
    doi: '10.1016/j.phrs.2015.07.012',
    year: 2015, organization: 'Original peer-reviewed cohort study',
    access: 'open_abstract', evidenceSection: 'Abstract / Results; n=40, sensitivity 77%, specificity 25%',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  tac2025: {
    citation: 'van Gelder et al. · 2025',
    title: 'van Gelder et al. (2025) · Tacrolimus, C₀ et AUC en greffe rénale (protocole local)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12122127/',
    doi: '10.1111/bcp.16098',
    year: 2025, organization: 'Peer-reviewed review / single-centre targets',
    access: 'open_full_text', evidenceSection: 'Table 1 (immediate-release tacrolimus), notes and AUC condition',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  everolimus2025: {
    citation: 'IATDMCT · 2025',
    title: 'Masuda et al. (2025) · Deuxième consensus IATDMCT sur l’évérolimus',
    url: 'https://doi.org/10.1097/FTD.0000000000001250',
    doi: '10.1097/FTD.0000000000001250',
    year: 2025, organization: 'IATDMCT / Immunosuppressive Drugs Scientific Committee',
    access: 'open_full_text', evidenceSection: 'Table 1 and kidney/heart-transplantation recommendations',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  mpa2021: {
    citation: 'IATDMCT · 2021',
    title: 'Bergan et al. (2021) · Consensus IATDMCT pour le MPA',
    url: 'https://research.dial.uclouvain.be/bitstreams/0c98746c-847b-4e2d-8e96-c788c25851e9/download',
    doi: '10.1097/FTD.0000000000000871',
    year: 2021, organization: 'IATDMCT / Immunosuppressive Drugs Scientific Committee',
    access: 'open_full_text',
    evidenceSection: 'p. 161, Summary of recommended MPA target concentration ranges — Kidney transplantation, points 1–3',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  valproateRcp: {
    citation: 'ANSM · RCP',
    title: 'ANSM · RCP du valproate de sodium Biogaran LP 500 mg (MAJ 23/01/2025)',
    url: 'https://base-donnees-publique.medicaments.gouv.fr/medicament/67025516/extrait',
    year: 2025, organization: 'ANSM / official French SmPC',
    access: 'open_full_text', evidenceSection: 'Rubriques 4.2 et 5.2 : fourchette sérique habituelle 40–100 mg/L en épilepsie',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  valproateTdm: {
    citation: 'STP / SFPT · 2025',
    title: 'Ait Tayeb et al. (2025) · Suivi thérapeutique pharmacologique du valproate, chapitre 35',
    url: 'https://www.elsevier-masson.fr/media/wysiwyg/PDF/FR/9782294787935_valproate_pharm.pdf',
    year: 2025, organization: 'Ouvrage STP présenté par la SFPT / Elsevier Masson',
    access: 'open_full_text', evidenceSection: 'Chapitre 35, p. 239, tableau 35.2 : Cmin 50–100 mg/L',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  valproateSfpt2010: {
    citation: 'SFPT · 2010',
    title: 'Bentué-Ferrer, Tribut & Verdier (2010) · STP du valproate, groupe SFPT',
    url: 'https://pubmed.ncbi.nlm.nih.gov/20699076/',
    doi: '10.2515/therapie/2010029',
    year: 2010, organization: 'Groupe STP de la SFPT · Thérapie',
    access: 'open_abstract', evidenceSection: 'Résumé PubMed : intervalle thérapeutique 50–100 mg/L',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  lithiumNice: {
    citation: 'NICE · 2025',
    title: 'NICE CG185 · Bipolar disorder: assessment and management',
    url: 'https://www.nice.org.uk/guidance/cg185/chapter/recommendations',
    year: 2025, organization: 'NICE / United Kingdom clinical guideline',
    access: 'open_full_text', evidenceSection: 'Recommendations 1.10.15 and 1.10.16; wording originally issued 2014',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  linezolid2022: {
    citation: 'Consensus d’experts · 2022',
    title: 'Expert consensus statement on TDM and individualization of linezolid (2022)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9399604/',
    year: 2022, organization: 'Peer-reviewed expert consensus',
    access: 'open_full_text', evidenceSection: 'Expert panel recommendation, question 1: Ctrough 2–8 mg/L',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  vancomycin2020: {
    citation: 'ASHP / IDSA · 2020',
    title: 'ASHP/IDSA/PIDS/SIDP (2020) · Consensus vancomycine',
    url: 'https://www.idsociety.org/practice-guideline/vancomycin/',
    doi: '10.1093/ajhp/zxaa036',
    year: 2020, organization: 'ASHP / IDSA / PIDS / SIDP',
    access: 'open_full_text', evidenceSection: 'Executive summary, AUC24 400–600 for serious MRSA at MIC 1 mg/L',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  },
  lithium2019: {
    citation: 'ISBD / IGSLI · 2019',
    title: 'Nolen et al. (2019) · Consensus ISBD/IGSLI sur le lithium',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6688930/',
    doi: '10.1111/bdi.12805',
    year: 2019, organization: 'ISBD / IGSLI expert task force',
    access: 'open_full_text', evidenceSection: 'Table 5 and conclusion (adult maintenance, 12 ± 1 h samples)',
    verifiedOn: TDM_REFERENCE_REVIEW_DATE
  }
};

export const tdmDrugs = [
  { id: 'cyclosporine', fr: "Ciclosporine", en: "Cyclosporine", aliases: ["Ciclosporine","Cyclosporine","cyclosporine","ciclosporine","CsA","Sandimmun","Neoral"] },
  { id: 'sirolimus', fr: "Sirolimus", en: "Sirolimus", aliases: ["Sirolimus","sirolimus","rapamycine","rapamycin","Rapamune"] },
  { id: 'posaconazole', fr: "Posaconazole", en: "Posaconazole", aliases: ["Posaconazole","posaconazole","noxafil","posa"] },
  { id: 'voriconazole', fr: "Voriconazole", en: "Voriconazole", aliases: ["Voriconazole","voriconazole","vfend","vori"] },
  { id: 'carbamazepine', fr: "Carbamazépine", en: "Carbamazepine", aliases: ["Carbamazépine","Carbamazepine","carbamazepine","tegretol","tegretol LP"] },
  { id: 'lamotrigine', fr: "Lamotrigine", en: "Lamotrigine", aliases: ["Lamotrigine","lamotrigine","lamictal"] },
  { id: 'oxcarbazepine', fr: "Oxcarbazépine (MHD)", en: "Oxcarbazepine (MHD)", aliases: ["Oxcarbazépine (MHD)","Oxcarbazepine (MHD)","oxcarbazepine","trileptal","licarbazepine","10-hydroxycarbazepine","mhd"] },
  { id: 'levetiracetam', fr: "Lévétiracétam", en: "Levetiracetam", aliases: ["Lévétiracétam","Levetiracetam","levetiracetam","keppra"] },
  { id: 'phenytoin', fr: "Phénytoïne", en: "Phenytoin", aliases: ["Phénytoïne","Phenytoin","phenytoin","dilantin","di-hydan"] },
  { id: 'phenobarbital', fr: "Phénobarbital", en: "Phenobarbital", aliases: ["Phénobarbital","Phenobarbital","phenobarbital","gardenal"] },
  { id: 'digoxin', fr: "Digoxine", en: "Digoxin", aliases: ["Digoxine","Digoxin","digoxin","digoxine","lanoxin"] },
  { id: 'amitriptyline', fr: "Amitriptyline", en: "Amitriptyline", aliases: ["Amitriptyline","amitriptyline"] },
  { id: 'citalopram', fr: "Citalopram", en: "Citalopram", aliases: ["Citalopram","citalopram"] },
  { id: 'clomipramine', fr: "Clomipramine", en: "Clomipramine", aliases: ["Clomipramine","clomipramine"] },
  { id: 'imipramine', fr: "Imipramine", en: "Imipramine", aliases: ["Imipramine","imipramine"] },
  { id: 'nortriptyline', fr: "Nortriptyline", en: "Nortriptyline", aliases: ["Nortriptyline","nortriptyline"] },
  { id: 'desipramine', fr: "Désipramine", en: "Désipramine", aliases: ["Désipramine","desipramine"] },
  { id: 'dosulepine', fr: "Dosulépine (dothiépine)", en: "Dosulépine (dothiépine)", aliases: ["Dosulépine (dothiépine)","dosulepine"] },
  { id: 'doxepine', fr: "Doxépine", en: "Doxépine", aliases: ["Doxépine","doxepine"] },
  { id: 'duloxetine', fr: "Duloxétine", en: "Duloxétine", aliases: ["Duloxétine","duloxetine"] },
  { id: 'escitalopram', fr: "Escitalopram", en: "Escitalopram", aliases: ["Escitalopram","escitalopram"] },
  { id: 'fluvoxamine', fr: "Fluvoxamine", en: "Fluvoxamine", aliases: ["Fluvoxamine","fluvoxamine"] },
  { id: 'maprotiline', fr: "Maprotiline", en: "Maprotiline", aliases: ["Maprotiline","maprotiline"] },
  { id: 'milnacipran', fr: "Milnacipran", en: "Milnacipran", aliases: ["Milnacipran","milnacipran"] },
  { id: 'mirtazapine', fr: "Mirtazapine", en: "Mirtazapine", aliases: ["Mirtazapine","mirtazapine"] },
  { id: 'sertraline', fr: "Sertraline", en: "Sertraline", aliases: ["Sertraline","sertraline"] },
  { id: 'trimipramine', fr: "Trimipramine", en: "Trimipramine", aliases: ["Trimipramine","trimipramine"] },
  { id: 'venlafaxine', fr: "Venlafaxine", en: "Venlafaxine", aliases: ["Venlafaxine","venlafaxine"] },
  { id: 'vortioxetine', fr: "Vortioxétine", en: "Vortioxétine", aliases: ["Vortioxétine","vortioxetine"] },
  { id: 'fluoxetine', fr: "Fluoxétine", en: "Fluoxétine", aliases: ["Fluoxétine","fluoxetine"] },
  { id: 'mianserine', fr: "Miansérine", en: "Miansérine", aliases: ["Miansérine","mianserine"] },
  { id: 'moclobemide', fr: "Moclobémide", en: "Moclobémide", aliases: ["Moclobémide","moclobemide"] },
  { id: 'paroxetine', fr: "Paroxétine", en: "Paroxétine", aliases: ["Paroxétine","paroxetine"] },
  { id: 'tianeptine', fr: "Tianeptine", en: "Tianeptine", aliases: ["Tianeptine","tianeptine"] },
  { id: 'mpa', fr: 'Mycophénolate (MPA)', en: 'Mycophenolate (MPA)', aliases: ['mycophenolate', 'mycophénolate', 'acide mycophénolique', 'mycophenolic acid', 'MPA', 'MMF', 'mycophenolate mofetil', 'Cellcept', 'Myfortic'] },
  { id: 'tac', fr: 'Tacrolimus', en: 'Tacrolimus', aliases: ['tacrolimus', 'Prograf', 'Adport', 'FK506'] },
  { id: 'everolimus', fr: 'Évérolimus', en: 'Everolimus', aliases: ['évérolimus', 'everolimus', 'Certican', 'Zortress'] },
  { id: 'vancomycin', fr: 'Vancomycine', en: 'Vancomycin', aliases: ['vancomycine', 'vancomycin', 'vanco'] },
  { id: 'valproate', fr: 'Acide valproïque (valproate)', en: 'Valproic acid (valproate)', aliases: ['valproate', 'valproic acid', 'acide valproique', 'acide valproïque', 'Depakine', 'Depakote', 'Depamide'] },
  { id: 'linezolid', fr: 'Linézolide', en: 'Linezolid', aliases: ['linézolide', 'linezolid', 'zyvoxid'] },
  { id: 'lithium', fr: 'Lithium', en: 'Lithium', aliases: ['lithium', 'lithémie', 'lithiemie'] }
];

// Every entry is a specific drug × indication × exposure metric × regimen.
// Bounds are bibliographic claims, not patient-level dose recommendations.
// 'approx' denotes a proposed study cut-point, not a therapeutic window.
export const tdmTargets = [
  {
    id: 'mpa-kidney-auc', drug: 'mpa', indication: 'kidney',
    comparisonGroup: 'mpa-kidney-auc',
    indicationFr: 'Greffe rénale', indicationEn: 'Kidney transplant',
    metric: 'AUC₀–₁₂h', unit: 'mg·h/L', matrixFr: 'Plasma, MPA total', matrixEn: 'Plasma, total MPA',
    relation: 'range', min: 30, max: 60, status: 'guideline', source: 'mpa2025',
    contextFr: 'Immunosuppression après greffe rénale ; interpréter selon le protocole et le traitement associé.',
    contextEn: 'Post-kidney-transplant immunosuppression; consider the local protocol and co-medication.',
    evidenceFr: 'Recommandation forte ; certitude des preuves faible.',
    evidenceEn: 'Strong recommendation; low certainty of evidence.'
  },
  {
    id: 'mpa-kidney-auc-iatdmct-2021', drug: 'mpa', indication: 'kidney',
    indicationFr: 'Greffe rénale', indicationEn: 'Kidney transplant',
    metric: 'AUC₀–₁₂h', unit: 'mg·h/L', matrixFr: 'Plasma, MPA total', matrixEn: 'Plasma, total MPA',
    relation: 'range', min: 30, max: 60, status: 'guideline', source: 'mpa2021',
    comparisonGroup: 'mpa-kidney-auc', contextFr: 'Adulte, MMF avec tacrolimus ou ciclosporine A, avec ou sans glucocorticoïdes ; consensus ne définit pas de cible spécifique après un an.',
    contextEn: 'Adults on MMF plus tacrolimus or cyclosporine A, with or without glucocorticoids; no evidence-based separate target beyond one year.',
    evidenceFr: 'Consensus IATDMCT 2021, recommandation B/II.', evidenceEn: 'IATDMCT 2021 consensus, B/II recommendation.'
  },
  {
    id: 'mpa-heart-auc', drug: 'mpa', indication: 'heart',
    comparisonGroup: 'mpa-heart-auc',
    indicationFr: 'Greffe cardiaque', indicationEn: 'Heart transplant',
    metric: 'AUC₀–₁₂h', unit: 'mg·h/L', matrixFr: 'Plasma, MPA total', matrixEn: 'Plasma, total MPA',
    relation: 'above', min: 36, max: null, status: 'guideline', source: 'mpa2025',
    contextFr: 'Seuil indicatif ; pas de borne supérieure consensuelle dans cette recommandation.',
    contextEn: 'Indicative lower threshold; no consensual upper bound in this guideline.',
    evidenceFr: 'Déclaration de bonne pratique (GPS).', evidenceEn: 'Good practice statement (GPS).'
  },
  {
    id: 'mpa-heart-auc-study', drug: 'mpa', indication: 'heart',
    comparisonGroup: 'mpa-heart-auc',
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
    id: 'valproate-epilepsy-rcp', drug: 'valproate', indication: 'epilepsy',
    comparisonGroup: 'valproate-epilepsy',
    indicationFr: 'Épilepsie · concentration totale', indicationEn: 'Epilepsy · total concentration',
    metric: 'Concentration totale', unit: 'mg/L', matrixFr: 'Sérum / plasma, valproate total', matrixEn: 'Serum / plasma, total valproate',
    relation: 'range', min: 40, max: 100, status: 'regulatory', source: 'valproateRcp',
    contextFr: 'RCP français d’une spécialité de valproate ; intervalle habituel, sans caractère de cible universelle. Timing et fraction libre à considérer.',
    contextEn: 'French product label; customary range, not a universal target. Sampling timing and free fraction need consideration.',
    evidenceFr: 'RCP officiel, valeurs indicatives en épilepsie.', evidenceEn: 'Official SmPC, indicative epilepsy values.'
  },
  {
    id: 'valproate-epilepsy-tdm-review', drug: 'valproate', indication: 'epilepsy',
    comparisonGroup: 'valproate-epilepsy',
    indicationFr: 'Épilepsie · concentration totale', indicationEn: 'Epilepsy · total concentration',
    metric: 'Concentration totale', unit: 'mg/L', matrixFr: 'Sérum / plasma, valproate total', matrixEn: 'Serum / plasma, total valproate',
    relation: 'range', min: 50, max: 100, status: 'review', source: 'valproateTdm',
    contextFr: 'Fourchette conventionnelle décrite par une revue française ; comparer à la valeur 40–100 du RCP, sans en déduire une décision automatique.',
    contextEn: '2025 reference chapter reports Cmin 50–100; compare with 40–100 in the SmPC, without automatic dosing decisions.',
    evidenceFr: 'Revue scientifique française ; fenêtre non universellement prédictive.', evidenceEn: 'French scientific review; range is not universally predictive.'
  },
  {
    id: 'valproate-epilepsy-sfpt-2010', drug: 'valproate', indication: 'epilepsy',
    comparisonGroup: 'valproate-epilepsy',
    indicationFr: 'Épilepsie · concentration totale', indicationEn: 'Epilepsy · total concentration',
    metric: 'Concentration totale', unit: 'mg/L', matrixFr: 'Sérum / plasma, valproate total', matrixEn: 'Serum / plasma, total valproate',
    relation: 'range', min: 50, max: 100, status: 'review', source: 'valproateSfpt2010',
    contextFr: 'Résumé du groupe STP SFPT 2010 ; mesure totale, intervalle historique dont la valeur prédictive de la réponse reste limitée.',
    contextEn: '2010 SFPT TDM group abstract; total level, historical range with limited individual outcome prediction.',
    evidenceFr: 'Revue scientifique issue du groupe STP SFPT.', evidenceEn: 'Review from the SFPT TDM working group.'
  },
  {
    id: 'linezolid-trough-consensus', drug: 'linezolid', indication: 'infection',
    indicationFr: 'Infections traitées par linézolide', indicationEn: 'Infections treated with linezolid',
    metric: 'C₀', unit: 'mg/L', matrixFr: 'Plasma / sérum', matrixEn: 'Plasma / serum',
    relation: 'range', min: 2, max: 8, status: 'guideline', source: 'linezolid2022',
    contextFr: 'Fourchette d’un consensus d’experts 2022 ; interpréter selon le type d’infection, la CMI, le dosage et la toxicité hématologique.',
    contextEn: '2022 expert consensus range; interpret with infection type, MIC, schedule and hematological toxicity.',
    evidenceFr: 'Consensus d’experts, recommandation question 1.', evidenceEn: 'Expert consensus, recommendation question 1.'
  },
  {
    id: 'lithium-maintenance', drug: 'lithium', indication: 'bipolar',
    comparisonGroup: 'lithium-maintenance',
    indicationFr: 'Trouble bipolaire · entretien adulte', indicationEn: 'Bipolar disorder · adult maintenance',
    metric: 'C₁₂h', unit: 'mmol/L', matrixFr: 'Sérum', matrixEn: 'Serum',
    relation: 'range', min: 0.6, max: 0.8, status: 'guideline', source: 'lithium2019',
    contextFr: 'Prélèvement 12 ± 1 h après la dose du soir ; cible standard chez l’adulte.',
    contextEn: 'Sample at 12 ± 1 h after the evening dose; standard adult target.',
    evidenceFr: 'Consensus ISBD/IGSLI.', evidenceEn: 'ISBD/IGSLI consensus.'
  },
  {
    id: 'lithium-nice-first-line', drug: 'lithium', indication: 'bipolar',
    comparisonGroup: 'lithium-maintenance',
    indicationFr: 'Trouble bipolaire · entretien adulte', indicationEn: 'Bipolar disorder · adult maintenance',
    metric: 'C₁₂h', unit: 'mmol/L', matrixFr: 'Plasma', matrixEn: 'Plasma',
    relation: 'range', min: 0.6, max: 0.8, status: 'guideline', source: 'lithiumNice',
    contextFr: 'NICE : traitement par lithium prescrit pour la première fois ; cible plasmatique. La population est plus restrictive que dans le consensus ISBD/IGSLI.',
    contextEn: 'NICE: first-time lithium treatment; plasma target. Population narrower than the ISBD/IGSLI consensus.',
    evidenceFr: 'Recommandation NICE 1.10.15.', evidenceEn: 'NICE recommendation 1.10.15.'
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

/** @param {unknown} value */
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
  // Prefer matching the indication label over an incidental mention in a clinical note.
  const indicationIds = needle && !exactDrugIds.length
    ? tdmTargets.filter((entry) => [entry.indicationFr, entry.indicationEn]
      .some((label) => normalizeTdmSearch(label).includes(needle))).map((entry) => entry.id)
    : [];
  return tdmTargets.filter((entry) => {
    if (indicationIds.length && !indicationIds.includes(entry.id)) return false;
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

/** @param {{relation: string, min: number, max: number|null}} entry
 *  @param {'fr'|'en'} [lang]
 */
export function formatTdmTarget(entry, lang = 'fr') {
  const value = (/** @type {number} */ number) => new Intl.NumberFormat(lang === 'en' ? 'en' : 'fr', { maximumFractionDigits: 2 }).format(number);
  if (entry.relation === 'range') {
    if (entry.max === null) throw new Error('Range target missing upper bound');
    return `${value(entry.min)}–${value(entry.max)}`;
  }
  if (entry.relation === 'above') return `>${value(entry.min)}`;
  if (entry.relation === 'approx') return `≈${value(entry.min)}`;
  throw new Error(`Unknown TDM target relation: ${entry.relation}`);
}

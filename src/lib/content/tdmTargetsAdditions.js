// Evidence-reviewed additions, kept separate from the original 75 audited claims.
// These are educational, indication-specific published references, not prescriptions.
// Reviewed 2026-11-10. See docs/tdm-extension-audit-2026-11-10.md.
/** @type {Record<string, { title: string, citation: string, url: string, doi?: string, year: number, organization: string, access: 'open_full_text'|'open_abstract', evidenceSection: string, verifiedOn: string, newerConsensusUrl?: string, newerConsensusTitle?: string }>} */
export const additionalTdmSources = {
  teicoplaninANSM2026: {
    title: 'ANSM · RCP teicoplanine (mesures résiduelles selon méthode analytique)',
    citation: 'ANSM · téicoplanine RCP',
    url: 'https://base-donnees-publique.medicaments.gouv.fr/medicament/64196782/extrait',
    year: 2026, organization: 'ANSM · Base de données publique des médicaments',
    access: 'open_full_text',
    evidenceSection: 'RCP, rubrique 4.2, Mesure des concentrations sériques : endocardite/infections sévères, HPLC 15–30 mg/L et FPIA 30–40 mg/L',
    verifiedOn: '2026-11-10'
  },
  clozapineRCPA2024: {
    title: 'Royal College of Pathologists of Australasia · Clozapine, pathology manual',
    citation: 'RCPA · clozapine 2024',
    url: 'https://www.rcpa.edu.au/Manuals/RCPA-Manual/Pathology-Tests/C/Clozapine',
    year: 2024, organization: 'Royal College of Pathologists of Australasia · reference laboratory manual',
    access: 'open_full_text',
    evidenceSection: 'Therapeutic Interval: clozapine 350–600 µg/L; specimen, trough sampling and interpretation',
    verifiedOn: '2026-11-10',
    newerConsensusUrl: 'https://pubmed.ncbi.nlm.nih.gov/42392224/',
    newerConsensusTitle: 'AGNP 2026 · valeurs actualisées à recouper dans le texte intégral'
  },
  busulfanEBMT2026: {
    title: 'EBMT/ESID (2026) · HSCT for inborn errors of immunity and metabolism',
    citation: 'EBMT/ESID · 2026',
    url: 'https://doi.org/10.1038/s41409-026-02906-0',
    doi: '10.1038/s41409-026-02906-0',
    year: 2026, organization: 'EBMT / ESID professional society guidelines',
    access: 'open_full_text',
    evidenceSection: 'Busulfan subsection, Fig. 1 and Table 3: cumulative AUC 85–95 mg·h/L protocol A, 60–70 mg·h/L protocol C',
    verifiedOn: '2026-11-10'
  }
};

export const additionalTdmDrugs = [
  { id: 'teicoplanin', fr: 'Téicoplanine', en: 'Teicoplanin',
    aliases: ['teicoplanine', 'téicoplanine', 'teicoplanin', 'targocid'] },
  { id: 'clozapine', fr: 'Clozapine', en: 'Clozapine',
    aliases: ['clozapine', 'leponex', 'clozaril'] },
  { id: 'busulfan', fr: 'Busulfan', en: 'Busulfan',
    aliases: ['busulfan', 'busilvex', 'busulfex'] }
];

export const additionalTdmTargets = [
  {
    id: 'teicoplanin-severe-hplc', drug: 'teicoplanin', indication: 'severe-infection',
    indicationFr: 'Endocardite / infection sévère · dosage HPLC',
    indicationEn: 'Endocarditis / severe infection · HPLC assay',
    metric: 'C₀', unit: 'mg/L', matrixFr: 'Sérum · HPLC', matrixEn: 'Serum · HPLC',
    relation: 'range', min: 15, max: 30, status: 'regulatory', source: 'teicoplaninANSM2026',
    contextFr: 'RCP : concentration résiduelle après la charge, à interpréter selon le type d’infection. Fenêtre HPLC uniquement ; la cible FPIA est différente et n’est pas interchangeable.',
    contextEn: 'SmPC: post-loading trough, interpreted according to infection. HPLC-only range; FPIA requires a different assay-specific window.',
    evidenceFr: 'RCP ANSM, rubrique 4.2, méthode HPLC ; endocardite et infections sévères.',
    evidenceEn: 'ANSM SmPC section 4.2, HPLC assay; endocarditis and severe infections.'
  },
  {
    id: 'teicoplanin-severe-fpia', drug: 'teicoplanin', indication: 'severe-infection',
    indicationFr: 'Endocardite / infection sévère · dosage FPIA',
    indicationEn: 'Endocarditis / severe infection · FPIA assay',
    metric: 'C₀', unit: 'mg/L', matrixFr: 'Sérum · FPIA', matrixEn: 'Serum · FPIA',
    relation: 'range', min: 30, max: 40, status: 'regulatory', source: 'teicoplaninANSM2026',
    contextFr: 'RCP : concentration résiduelle après la charge, méthode immunologique FPIA. Ne pas appliquer les valeurs HPLC à une mesure FPIA ; surveiller la fonction rénale.',
    contextEn: 'SmPC: trough after loading measured with FPIA immunoassay. Do not transfer HPLC ranges to FPIA; monitor renal function.',
    evidenceFr: 'RCP ANSM, rubrique 4.2, méthode FPIA ; endocardite et infections sévères.',
    evidenceEn: 'ANSM SmPC section 4.2, FPIA assay; endocarditis and severe infections.'
  },
  {
    id: 'clozapine-maintenance-reference', drug: 'clozapine', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · suivi de la clozapine', indicationEn: 'Schizophrenia · clozapine monitoring',
    metric: 'C₀', unit: 'ng/mL', matrixFr: 'Sérum / plasma · clozapine seule', matrixEn: 'Serum / plasma · parent clozapine',
    relation: 'range', min: 350, max: 600, status: 'institutional', source: 'clozapineRCPA2024',
    contextFr: 'Référence analytique RCPA 350–600 µg/L (équivaut exactement à 350–600 ng/mL). Prélèvement avant la dose ; ne pas confondre avec la norclozapine. Inflammation, tabac, interactions et tolérance influencent l’interprétation ; nouveau consensus AGNP 2026 à vérifier.',
    contextEn: 'RCPA laboratory interval 350–600 µg/L (exactly 350–600 ng/mL). Predose sample; norclozapine is distinct. Inflammation, smoking, interactions and tolerability affect interpretation; review updated AGNP 2026.',
    evidenceFr: 'Manuel professionnel de laboratoire RCPA, révision 2024 ; référence clinique à individualiser.',
    evidenceEn: 'RCPA professional laboratory manual, revised 2024; individual clinical assessment required.'
  },
  {
    id: 'busulfan-iei-protocol-a', drug: 'busulfan', indication: 'hsct-iei',
    indicationFr: 'Allogreffe · déficit immunitaire inné (IEI) · protocole A myéloablatif',
    indicationEn: 'Allogeneic HSCT · inborn error of immunity · myeloablative protocol A',
    metric: 'AUC cumulée', unit: 'mg·h/L', matrixFr: 'Plasma · busulfan ; exposition totale du conditionnement',
    matrixEn: 'Plasma · busulfan; total conditioning exposure',
    relation: 'range', min: 85, max: 95, status: 'guideline', source: 'busulfanEBMT2026',
    contextFr: 'Recommandation EBMT/ESID 2026 pour les IEI : AUC totale cumulée du conditionnement, pas une AUC par dose ni une cible applicable aux autres indications de greffe. Adapter selon protocole et durée.',
    contextEn: '2026 EBMT/ESID IEI-specific recommendation: total conditioning AUC, not a per-dose AUC or general HSCT target. Regimen and schedule must match.',
    evidenceFr: 'EBMT/ESID 2026, section busulfan, figure 1 et tableau 3.',
    evidenceEn: 'EBMT/ESID 2026, busulfan section, Figure 1 and Table 3.'
  },
  {
    id: 'busulfan-iei-protocol-c', drug: 'busulfan', indication: 'hsct-iei',
    indicationFr: 'Allogreffe · déficit immunitaire inné (IEI) · protocole C intensité réduite',
    indicationEn: 'Allogeneic HSCT · inborn error of immunity · reduced-intensity protocol C',
    metric: 'AUC cumulée', unit: 'mg·h/L', matrixFr: 'Plasma · busulfan ; exposition totale du conditionnement',
    matrixEn: 'Plasma · busulfan; total conditioning exposure',
    relation: 'range', min: 60, max: 70, status: 'guideline', source: 'busulfanEBMT2026',
    contextFr: 'Recommandation EBMT/ESID 2026 limitée au protocole C pour IEI ; cible cumulative. Ne pas la substituer au protocole A ou à d’autres schémas de transplantation.',
    contextEn: '2026 EBMT/ESID: IEI protocol C only; cumulative exposure. Do not substitute for protocol A or other transplant regimens.',
    evidenceFr: 'EBMT/ESID 2026, section busulfan, figure 1 et tableau 3.',
    evidenceEn: 'EBMT/ESID 2026, busulfan section, Figure 1 and Table 3.'
  }
];

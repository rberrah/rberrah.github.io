// Evidence-reviewed additions, kept separate from the original 75 audited claims.
// These are educational, indication-specific published references, not prescriptions.
// Reviewed 2026-11-10. See docs/tdm-extension-audit-2026-11-10.md.
/** @type {Record<string, { title: string, citation: string, url: string, doi?: string, year: number, organization: string, access: 'open_full_text'|'open_abstract', evidenceSection: string, verifiedOn: string, newerConsensusUrl?: string, newerConsensusTitle?: string }>} */
export const additionalTdmSources = {
  flucytosineUKHSA: {
    title: 'UKHSA · National Mycology Reference Laboratory, service user handbook',
    citation: 'UKHSA · flucytosine',
    url: 'https://www.gov.uk/government/publications/mycology-reference-laboratory-mrl-service-user-handbook/mycology-reference-laboratory-service-user-handbook',
    year: 2023, organization: 'UK Health Security Agency · Mycology Reference Laboratory',
    access: 'open_full_text',
    evidenceSection: 'Interpretation of assay results, Flucytosine: trough 20–40 mg/L; oral peak 2 h or IV peak 30 min: 50–100 mg/L',
    verifiedOn: '2026-11-10'
  },
  itraconazoleIDSA2016: {
    title: 'IDSA · Practice Guidelines for the Diagnosis and Management of Aspergillosis (2016)',
    citation: 'IDSA · aspergillose 2016',
    url: 'https://www.idsociety.org/practice-guideline/aspergillosis',
    doi: '10.1093/cid/ciw326',
    year: 2016, organization: 'Infectious Diseases Society of America',
    access: 'open_full_text',
    evidenceSection: 'Triazole Drug Interactions and Therapeutic Drug Monitoring; Itraconazole section: combined itraconazole/hydroxyitraconazole trough >1.5 µg/mL',
    verifiedOn: '2026-11-10'
  },
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
  { id: 'flucytosine', fr: 'Flucytosine (5-fluorocytosine)', en: 'Flucytosine (5-fluorocytosine)',
    aliases: ['flucytosine', '5-fluorocytosine', 'ancotil', '5-fc'] },
  { id: 'itraconazole', fr: 'Itraconazole', en: 'Itraconazole',
    aliases: ['itraconazole', 'sporanox'] },
  { id: 'teicoplanin', fr: 'Téicoplanine', en: 'Teicoplanin',
    aliases: ['teicoplanine', 'téicoplanine', 'teicoplanin', 'targocid'] },
  { id: 'clozapine', fr: 'Clozapine', en: 'Clozapine',
    aliases: ['clozapine', 'leponex', 'clozaril'] },
  { id: 'busulfan', fr: 'Busulfan', en: 'Busulfan',
    aliases: ['busulfan', 'busilvex', 'busulfex'] }
];

export const additionalTdmTargets = [
  {
    id: 'flucytosine-trough-ukhsa', drug: 'flucytosine', indication: 'fungal-infection',
    indicationFr: 'Infection fongique · prélèvement avant dose', indicationEn: 'Fungal infection · predose sampling',
    metric: 'C₀', unit: 'mg/L', matrixFr: 'Sérum · flucytosine', matrixEn: 'Serum · flucytosine',
    relation: 'range', min: 20, max: 40, status: 'institutional', source: 'flucytosineUKHSA',
    contextFr: 'Référence du laboratoire national britannique UKHSA : prélever immédiatement avant la dose. Les cibles et la sécurité dépendent notamment de la fonction rénale et du schéma thérapeutique. Pas de conversion avec le pic.',
    contextEn: 'UKHSA national reference laboratory interval: collect immediately before the next dose. Consider renal function and regimen; do not substitute the post-dose peak.',
    evidenceFr: 'Recommandation institutionnelle UKHSA, intervalle résiduel ; pas un consensus universel.',
    evidenceEn: 'UKHSA laboratory advice, predose range; not a universal consensus.'
  },
  {
    id: 'flucytosine-peak-ukhsa', drug: 'flucytosine', indication: 'fungal-infection',
    indicationFr: 'Infection fongique · pic 2 h per os / 30 min IV',
    indicationEn: 'Fungal infection · peak 2 h oral / 30 min IV',
    metric: 'Cmax (prélèvement post-dose)', unit: 'mg/L', matrixFr: 'Sérum · flucytosine', matrixEn: 'Serum · flucytosine',
    relation: 'range', min: 50, max: 100, status: 'institutional', source: 'flucytosineUKHSA',
    contextFr: 'Référence UKHSA : prélèvement à 2 h après une dose orale ou 30 min après une dose intraveineuse. Le dépassement de 100 mg/L expose à une toxicité ; ne pas appliquer cette fourchette à une C₀.',
    contextEn: 'UKHSA laboratory: sample 2 hours after oral dosing or 30 minutes after IV dosing. Levels above 100 mg/L may be toxic; this is not a trough target.',
    evidenceFr: 'Recommandation institutionnelle UKHSA ; timing et voie d’administration requis.',
    evidenceEn: 'UKHSA laboratory recommendation; timing and route essential.'
  },
  {
    id: 'itraconazole-combined-ia-idsa', drug: 'itraconazole', indication: 'aspergillosis',
    indicationFr: 'Aspergillose · somme itraconazole + hydroxy-itraconazole',
    indicationEn: 'Aspergillosis · itraconazole + hydroxy-itraconazole sum',
    metric: 'C₀ (somme des deux analytes)', unit: 'mg/L',
    matrixFr: 'Sérum / plasma · itraconazole + hydroxy-itraconazole', matrixEn: 'Serum / plasma · itraconazole + hydroxy-itraconazole',
    relation: 'above', min: 1.5, max: null, status: 'guideline', source: 'itraconazoleIDSA2016',
    contextFr: 'IDSA 2016, aspergillose : cible d’efficacité dérivée principalement des données de prophylaxie. Seuil supérieur à 1,5 µg/mL pour la SOMME des deux analytes, soit >1,5 mg/L. Ne pas confondre avec la cible de la molécule mère seule ; formulations et interactions modifient l’exposition.',
    contextEn: 'IDSA 2016 aspergillosis guidance, largely based on prophylaxis: combined parent + hydroxy-itraconazole trough >1.5 µg/mL (= mg/L). Not applicable to parent-only concentration. Formulation and interactions matter.',
    evidenceFr: 'IDSA 2016, section Itraconazole et suivi thérapeutique des triazolés ; preuve principalement observationnelle.',
    evidenceEn: 'IDSA 2016, Itraconazole and azole TDM sections; largely observational evidence.'
  }
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

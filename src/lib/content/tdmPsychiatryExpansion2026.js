// Historical antipsychotic reference intervals (2020), not an AGNP 2026 transcription.
// Each number appears in Table 2 of the 2020 joint clinical consensus; updated AGNP 2026
// ranges have not yet been verified molecule by molecule. Visible UI warning is mandatory.
// Not evidence that these drugs are assayed at CHU Limoges.
// Source review: 2026-11-10. See docs/tdm-expansion-psychiatry-2026-11-10.md.
/** @type {Record<string, { title: string, citation: string, url: string, doi?: string, year: number, organization: string, access: 'open_full_text'|'open_abstract', evidenceSection: string, verifiedOn: string, newerConsensusUrl?: string, newerConsensusTitle?: string }>} */
export const psychiatryTdmSources = {
  antipsychoticJoint2020: {
    title: 'Schoretsanitis et al. (2020) · Joint antipsychotic TDM consensus (ASCP/AGNP)',
    citation: 'ASCP / AGNP · 2020 (historique)',
    url: 'https://www.psychiatrist.com/pdf/blood-levels-to-optimize-antipsychotic-treatment-in-clinical-practice-a-joint-consensus-statement-of-the-american-society-of-clinical-psychopharmacology-and-the-therapeutic-drug-monitoring-task-force/',
    doi: '10.4088/JCP.19cs13169', year: 2020,
    organization: 'ASCP / AGNP joint international consensus',
    access: 'open_full_text',
    evidenceSection: 'Table 2, p. e5: antipsychotic-specific intervals, footnotes e/f and sampling limitations',
    verifiedOn: '2026-11-10',
    newerConsensusUrl: 'https://pubmed.ncbi.nlm.nih.gov/42392224/',
    newerConsensusTitle: 'Hart et al. · AGNP 2026 (160 molécules ; intervalles non recoupés ici)'
  }
};
export const psychiatryTdmDrugs = [
  { id: 'fluphenazine', fr: "Fluphénazine", en: "Fluphenazine", aliases: ["fluphenazine", "Fluphénazine", "Fluphenazine"] },
  { id: 'haloperidol', fr: "Halopéridol", en: "Haloperidol", aliases: ["haloperidol", "Halopéridol", "Haloperidol"] },
  { id: 'olanzapine', fr: "Olanzapine", en: "Olanzapine", aliases: ["olanzapine", "Olanzapine", "Olanzapine"] },
  { id: 'perazine', fr: "Pérazine", en: "Perazine", aliases: ["perazine", "Pérazine", "Perazine"] },
  { id: 'perphenazine', fr: "Perphénazine", en: "Perphenazine", aliases: ["perphenazine", "Perphénazine", "Perphenazine"] },
  { id: 'aripiprazole', fr: "Aripiprazole", en: "Aripiprazole", aliases: ["aripiprazole", "Aripiprazole", "Aripiprazole"] },
  { id: 'chlorpromazine', fr: "Chlorpromazine", en: "Chlorpromazine", aliases: ["chlorpromazine", "Chlorpromazine", "Chlorpromazine"] },
  { id: 'flupentixol', fr: "Flupentixol (isomère cis)", en: "Flupenthixol (cis-isomer)", aliases: ["flupentixol", "Flupentixol (isomère cis)", "Flupenthixol (cis-isomer)"] },
  { id: 'paliperidone', fr: "Palipéridone", en: "Paliperidone", aliases: ["paliperidone", "Palipéridone", "Paliperidone"] },
  { id: 'quetiapine', fr: "Quétiapine", en: "Quetiapine", aliases: ["quetiapine", "Quétiapine", "Quetiapine"] },
  { id: 'risperidone', fr: "Rispéridone (+ 9-OH-rispéridone)", en: "Risperidone (+ 9-OH-risperidone)", aliases: ["risperidone", "Rispéridone (+ 9-OH-rispéridone)", "Risperidone (+ 9-OH-risperidone)"] },
  { id: 'sertindole', fr: "Sertindole", en: "Sertindole", aliases: ["sertindole", "Sertindole", "Sertindole"] },
  { id: 'ziprasidone', fr: "Ziprasidone", en: "Ziprasidone", aliases: ["ziprasidone", "Ziprasidone", "Ziprasidone"] },
  { id: 'brexpiprazole', fr: "Brexpiprazole", en: "Brexpiprazole", aliases: ["brexpiprazole", "Brexpiprazole", "Brexpiprazole"] },
  { id: 'chlorprothixene', fr: "Chlorprothixène", en: "Chlorprothixene", aliases: ["chlorprothixene", "Chlorprothixène", "Chlorprothixene"] },
  { id: 'iloperidone', fr: "Ilopéridone", en: "Iloperidone", aliases: ["iloperidone", "Ilopéridone", "Iloperidone"] },
  { id: 'loxapine', fr: "Loxapine", en: "Loxapine", aliases: ["loxapine", "Loxapine", "Loxapine"] },
  { id: 'lurasidone', fr: "Lurasidone", en: "Lurasidone", aliases: ["lurasidone", "Lurasidone", "Lurasidone"] },
  { id: 'melperone', fr: "Melpérone", en: "Melperone", aliases: ["melperone", "Melpérone", "Melperone"] },
  { id: 'pimozide', fr: "Pimozide", en: "Pimozide", aliases: ["pimozide", "Pimozide", "Pimozide"] },
  { id: 'asenapine', fr: "Asénapine", en: "Asenapine", aliases: ["asenapine", "Asénapine", "Asenapine"] }
];
export const psychiatryTdmTargets = [
  {
    id: 'aps-fluphenazine-schizophrenia-2020', drug: 'fluphenazine', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 1, max: 10, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 1). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 1). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 1 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 1. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-haloperidol-schizophrenia-2020', drug: 'haloperidol', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 1, max: 10, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 1). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 1). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 1 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 1. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-olanzapine-schizophrenia-2020', drug: 'olanzapine', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 20, max: 80, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 1). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 1). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 1 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 1. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-perazine-schizophrenia-2020', drug: 'perazine', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 100, max: 230, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 1). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 1). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 1 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 1. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-perphenazine-schizophrenia-2020', drug: 'perphenazine', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 0.6, max: 2.4, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 1). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 1). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 1 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 1. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-aripiprazole-schizophrenia-2020', drug: 'aripiprazole', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 100, max: 350, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 2). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 2). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 2 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 2. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-chlorpromazine-schizophrenia-2020', drug: 'chlorpromazine', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 30, max: 300, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 2). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 2). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 2 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 2. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-flupentixol-schizophrenia-2020', drug: 'flupentixol', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀ (isomère cis)", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · cis-flupentixol", matrixEn: "Plasma / serum · cis-flupenthixol",
    relation: 'range', min: 0.5, max: 5, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 2). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier. L'intervalle concerne l'isomère cis, pas une somme d'isomères.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 2). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review. Cis-isomer only, not total isomers.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 2 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 2. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-paliperidone-schizophrenia-2020', drug: 'paliperidone', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 20, max: 60, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 2). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 2). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 2 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 2. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-quetiapine-schizophrenia-2020', drug: 'quetiapine', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 100, max: 500, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 2). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 2). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 2 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 2. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-risperidone-schizophrenia-2020', drug: 'risperidone', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀ (somme active)", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · rispéridone + 9-OH-rispéridone", matrixEn: "Plasma / serum · risperidone + 9-hydroxyrisperidone",
    relation: 'range', min: 20, max: 60, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 2). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier. Le seuil s'applique à la fraction active combinée, jamais à la rispéridone seule.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 2). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review. Combined active moiety, not risperidone alone.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 2 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 2. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-sertindole-schizophrenia-2020', drug: 'sertindole', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 50, max: 100, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 2). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 2). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 2 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 2. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-ziprasidone-schizophrenia-2020', drug: 'ziprasidone', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 50, max: 200, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 2). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 2). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 2 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 2. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-brexpiprazole-schizophrenia-2020', drug: 'brexpiprazole', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 40, max: 140, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 3). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 3). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 3 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 3. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-chlorprothixene-schizophrenia-2020', drug: 'chlorprothixene', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 20, max: 300, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 3). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 3). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 3 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 3. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-iloperidone-schizophrenia-2020', drug: 'iloperidone', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 5, max: 10, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 3). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 3). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 3 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 3. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-loxapine-schizophrenia-2020', drug: 'loxapine', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 5, max: 10, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 3). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 3). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 3 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 3. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-lurasidone-schizophrenia-2020', drug: 'lurasidone', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 15, max: 40, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 3). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 3). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 3 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 3. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-melperone-schizophrenia-2020', drug: 'melperone', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 30, max: 100, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 3). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 3). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 3 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 3. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-pimozide-schizophrenia-2020', drug: 'pimozide', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 15, max: 20, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 3). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 3). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 3 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 3. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-asenapine-schizophrenia-2020', drug: 'asenapine', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · référence historique (2020)', indicationEn: 'Schizophrenia · historical reference (2020)',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · molécule mère", matrixEn: "Plasma / serum · parent compound",
    relation: 'range', min: 1, max: 5, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: "Fourchette du consensus conjoint ASCP/AGNP 2020 (niveau 4). Référence historique, PAS une valeur transcrite du consensus AGNP 2026. Prélèvement résiduel à l'état stable, surtout d'après formulations orales ; modalités spécifiques aux formes injectables prolongées, interactions, tabac, inflammation et autres facteurs à vérifier.",
    contextEn: "2020 ASCP/AGNP joint consensus range (level 4). Historical reference, NOT a verified AGNP 2026 value. Steady-state trough, mostly derived from oral formulations; long-acting injectable schedules and interactions, smoking, inflammation and other factors require review.",
    evidenceFr: "Consensus conjoint 2020, tableau 2 ; niveau de recommandation 4 en 2020. Revalidation selon AGNP 2026 requise.",
    evidenceEn: "2020 joint consensus, Table 2; 2020 recommendation level 4. Re-check against AGNP 2026 required."
  },
  {
    id: 'aps-aripiprazole-active-moiety-2020', drug: 'aripiprazole', indication: 'schizophrenia',
    indicationFr: 'Schizophrénie · somme active (2020)', indicationEn: 'Schizophrenia · active moiety (2020)',
    metric: 'C₀ (somme active)', unit: 'ng/mL',
    matrixFr: 'Plasma / sérum · aripiprazole + déhydroaripiprazole',
    matrixEn: 'Plasma / serum · aripiprazole + dehydroaripiprazole',
    relation: 'range', min: 150, max: 500, status: 'review', source: 'antipsychoticJoint2020',
    contextFr: 'Le tableau 2, note e, propose 150–500 ng/mL pour la somme active (aripiprazole et déhydroaripiprazole) ; différent du 100–350 ng/mL de la molécule mère. Historique 2020, révision AGNP 2026 à recouper.',
    contextEn: 'Table 2 footnote e gives 150–500 ng/mL for combined active aripiprazole + dehydroaripiprazole, not the 100–350 ng/mL parent-only range. Historical 2020; re-check AGNP 2026.',
    evidenceFr: 'ASCP/AGNP 2020, tableau 2, note e.', evidenceEn: 'ASCP/AGNP 2020, Table 2, footnote e.'
  }
];

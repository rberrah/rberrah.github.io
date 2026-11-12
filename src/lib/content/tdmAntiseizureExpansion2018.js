// Historically documented therapeutic reference ranges in epilepsy.
// Source: Reimers et al. 2018 DOI 10.2147/DDDT.S154388, Table 1.
// Serum concentrations from drug-fasting, steady-state sampling (often 12–24 h).
// These are NOT universal efficacy thresholds and NOT claims of current CHU assay availability.
// Vigabatrin is deliberately omitted from numeric entries because the source reports NA.
export const additionalAntiseizureDrugs = [
  { id: 'brivaracetam', fr: "Brivaracétam", en: "Brivaracetam", aliases: ["brivaracetam", "Brivaracétam", "Brivaracetam"] },
  { id: 'clobazam', fr: "Clobazam", en: "Clobazam", aliases: ["clobazam", "Clobazam", "Clobazam"] },
  { id: 'clonazepam', fr: "Clonazépam", en: "Clonazepam", aliases: ["clonazepam", "Clonazépam", "Clonazepam", "Rivotril"] },
  { id: 'eslicarbazepine', fr: "Eslicarbazépine (S-licarbazépine)", en: "Eslicarbazepine (S-licarbazepine)", aliases: ["eslicarbazepine", "Eslicarbazépine (S-licarbazépine)", "Eslicarbazepine (S-licarbazepine)"] },
  { id: 'ethosuximide', fr: "Éthosuximide", en: "Ethosuximide", aliases: ["ethosuximide", "Éthosuximide", "Ethosuximide"] },
  { id: 'felbamate', fr: "Felbamate", en: "Felbamate", aliases: ["felbamate", "Felbamate", "Felbamate"] },
  { id: 'gabapentin', fr: "Gabapentine", en: "Gabapentin", aliases: ["gabapentin", "Gabapentine", "Gabapentin"] },
  { id: 'lacosamide', fr: "Lacosamide", en: "Lacosamide", aliases: ["lacosamide", "Lacosamide", "Lacosamide"] },
  { id: 'perampanel', fr: "Pérampanel", en: "Perampanel", aliases: ["perampanel", "Pérampanel", "Perampanel"] },
  { id: 'pregabalin', fr: "Prégabaline", en: "Pregabalin", aliases: ["pregabalin", "Prégabaline", "Pregabalin"] },
  { id: 'rufinamide', fr: "Rufinamide", en: "Rufinamide", aliases: ["rufinamide", "Rufinamide", "Rufinamide"] },
  { id: 'stiripentol', fr: "Stiripentol", en: "Stiripentol", aliases: ["stiripentol", "Stiripentol", "Stiripentol"] },
  { id: 'sulthiame', fr: "Sultiame (sulthiame)", en: "Sulthiame", aliases: ["sulthiame", "Sultiame (sulthiame)", "Sulthiame"] },
  { id: 'topiramate', fr: "Topiramate", en: "Topiramate", aliases: ["topiramate", "Topiramate", "Topiramate"] },
  { id: 'zonisamide', fr: "Zonisamide", en: "Zonisamide", aliases: ["zonisamide", "Zonisamide", "Zonisamide"] }
];
export const additionalAntiseizureTargets = [
  {
    id: 'aed-brivaracetam-norway2018', drug: 'brivaracetam', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'mg/L', matrixFr: "Sérum · Brivaracétam", matrixEn: "Serum · Brivaracetam",
    relation: 'range', min: 0.2, max: 2, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  },
  {
    id: 'aed-clobazam-norway2018', drug: 'clobazam', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'mg/L', matrixFr: "Sérum · Clobazam", matrixEn: "Serum · Clobazam",
    relation: 'range', min: 0.03, max: 0.3, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  },
  {
      id: 'aed-clobazam-active-metabolite-norway2018', drug: 'clobazam', indication: 'epilepsy',
      indicationFr: 'Épilepsie · métabolite actif N-desméthylclobazam (2018)',
      indicationEn: 'Epilepsy · active N-desmethylclobazam metabolite (2018)',
      metric: 'C₀ (N-desméthylclobazam)', unit: 'mg/L',
      matrixFr: "Sérum · N-desméthylclobazam, métabolite actif", matrixEn: "Serum · N-desmethylclobazam active metabolite",
      relation: 'range', min: 0.3, max: 3, status: 'review', source: 'oxcarb2018',
      contextFr: 'Reimers et al. 2018, tableau 1 et section Clobazam : la référence 0,3–3 mg/L concerne le métabolite actif, distincte des 0,03–0,3 mg/L de clobazam parent ; CYP2C19 affecte le rapport métabolite/parent. Ne pas additionner les concentrations.',
      contextEn: 'Reimers et al. 2018, Table 1 and Clobazam section: active-metabolite range 0.3–3 mg/L versus 0.03–0.3 mg/L for clobazam parent. CYP2C19 affects this ratio. Do not add concentrations.',
      evidenceFr: 'Reimers et al. 2018 · tableau 1 et section Clobazam.',
      evidenceEn: 'Reimers et al. 2018 · Table 1 and Clobazam section.'
    },
  {
    id: 'aed-clonazepam-norway2018', drug: 'clonazepam', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'ng/mL', matrixFr: "Sérum · Clonazépam", matrixEn: "Serum · Clonazepam",
    relation: 'range', min: 13, max: 38, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  },
  {
    id: 'aed-eslicarbazepine-norway2018', drug: 'eslicarbazepine', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'mg/L', matrixFr: "Sérum · S-licarbazépine (forme active)", matrixEn: "Serum · S-licarbazepine active metabolite",
    relation: 'range', min: 3, max: 26, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges. Métabolite actif S-licarbazépine ; ne pas confondre avec le MHD racémique dosé sous oxcarbazépine.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital. Active S-licarbazepine; do not conflate with racemic MHD after oxcarbazepine.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  },
  {
    id: 'aed-ethosuximide-norway2018', drug: 'ethosuximide', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'mg/L', matrixFr: "Sérum · Éthosuximide", matrixEn: "Serum · Ethosuximide",
    relation: 'range', min: 39, max: 99, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  },
  {
    id: 'aed-felbamate-norway2018', drug: 'felbamate', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'mg/L', matrixFr: "Sérum · Felbamate", matrixEn: "Serum · Felbamate",
    relation: 'range', min: 30, max: 60, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  },
  {
    id: 'aed-gabapentin-norway2018', drug: 'gabapentin', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'mg/L', matrixFr: "Sérum · Gabapentine", matrixEn: "Serum · Gabapentin",
    relation: 'range', min: 3, max: 21, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  },
  {
    id: 'aed-lacosamide-norway2018', drug: 'lacosamide', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'mg/L', matrixFr: "Sérum · Lacosamide", matrixEn: "Serum · Lacosamide",
    relation: 'range', min: 3, max: 10, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  },
  {
    id: 'aed-perampanel-norway2018', drug: 'perampanel', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'mg/L', matrixFr: "Sérum · Pérampanel", matrixEn: "Serum · Perampanel",
    relation: 'range', min: 0.1, max: 1, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  },
  {
    id: 'aed-pregabalin-norway2018', drug: 'pregabalin', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'mg/L', matrixFr: "Sérum · Prégabaline", matrixEn: "Serum · Pregabalin",
    relation: 'range', min: 2, max: 6, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  },
  {
    id: 'aed-rufinamide-norway2018', drug: 'rufinamide', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'mg/L', matrixFr: "Sérum · Rufinamide", matrixEn: "Serum · Rufinamide",
    relation: 'range', min: 4, max: 31, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  },
  {
    id: 'aed-stiripentol-norway2018', drug: 'stiripentol', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'mg/L', matrixFr: "Sérum · Stiripentol", matrixEn: "Serum · Stiripentol",
    relation: 'range', min: 4, max: 22, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  },
  {
    id: 'aed-sulthiame-norway2018', drug: 'sulthiame', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'mg/L', matrixFr: "Sérum · Sultiame (sulthiame)", matrixEn: "Serum · Sulthiame",
    relation: 'range', min: 2, max: 10, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  },
  {
    id: 'aed-topiramate-norway2018', drug: 'topiramate', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'mg/L', matrixFr: "Sérum · Topiramate", matrixEn: "Serum · Topiramate",
    relation: 'range', min: 2, max: 10, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  },
  {
    id: 'aed-zonisamide-norway2018', drug: 'zonisamide', indication: 'epilepsy',
    indicationFr: 'Épilepsie · intervalle de référence norvégien 2018',
    indicationEn: 'Epilepsy · Norwegian reference interval 2018',
    metric: 'C₀ (résiduelle à l’équilibre)', unit: 'mg/L', matrixFr: "Sérum · Zonisamide", matrixEn: "Serum · Zonisamide",
    relation: 'range', min: 10, max: 38, status: 'review', source: 'oxcarb2018',
    contextFr: "Le tableau 1 du référentiel norvégien Reimers et al. (2018) propose cet intervalle pour des concentrations sériques résiduelles à l'équilibre, dans l'épilepsie. Repère populationnel historique, pas une cible individualisée validée et pas une preuve de dosage au CHU Limoges.",
    contextEn: "Reimers et al. (2018) Norwegian reference interval, Table 1, for predose steady-state serum concentration in epilepsy. Historical population guide, not an individually validated therapeutic target or proof of availability at Limoges University Hospital.",
    evidenceFr: 'Reimers et al. 2018 · tableau 1, valeurs nouvelles ou harmonisées selon les données nationales.',
    evidenceEn: 'Reimers et al. 2018 · Table 1, nationally harmonized or newly proposed reference interval.'
  }
];

export const labByChapter = {
  'clairance-volume-demi-vie': 'distribution',
  'micro-macro': 'distribution',
  'doses-repetees': 'accumulation',
  'absorption-orale': 'absorption',
  'voies-absorption': 'absorption',
  'perfusion': 'infusion',
  'covariates-basics': 'covariate-volume',
  'allometrie': 'covariate-volume',
  'covariates-physiology': 'covariate-clearance',
  'parent-metabolite': 'parent-metabolite',
  'pd-effect-compartment': 'effect-site',
  'pd-direct': 'pd-general',
  'pkpd': 'pd-general',
  'infectio-pkpd': 'pd-infectiology',
  'onco-tgi': 'pd-oncology',
  'mab-tmdd': 'tmdd'
};

export const labNames = {
  distribution: { fr: 'Distribution à deux compartiments', en: 'Two-compartment distribution' },
  accumulation: { fr: 'Doses répétées et accumulation', en: 'Repeated doses and accumulation' },
  absorption: { fr: 'Absorption orale et biodisponibilité', en: 'Oral absorption and bioavailability' },
  infusion: { fr: 'Perfusion et décroissance', en: 'Infusion and washout' },
  'covariate-volume': { fr: 'Poids et volume de distribution', en: 'Body weight and distribution volume' },
  'covariate-clearance': { fr: 'DFG et clairance rénale', en: 'GFR and renal clearance' },
  'parent-metabolite': { fr: 'Parent et métabolite', en: 'Parent and metabolite' },
  'effect-site': { fr: "Équilibration au site d'effet", en: 'Effect-site equilibration' },
  'pd-general': { fr: 'De la concentration à la réponse', en: 'From concentration to response' },
  'pd-infectiology': { fr: 'Antibiotique, CMI et réponse bactérienne', en: 'Antibiotic, MIC and bacterial response' },
  'pd-oncology': { fr: 'Inhibition de la croissance tumorale', en: 'Tumour growth inhibition' },
  tmdd: { fr: 'Disposition médiée par la cible', en: 'Target-mediated disposition' }
};

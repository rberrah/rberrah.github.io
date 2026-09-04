// @ts-nocheck

const entries = [
  ['Temps (h)', 'Time (h)'],
  ['Temps (semaines)', 'Time (weeks)'],
  ['Concentration (mg/L)', 'Concentration (mg/L)'],
  ['Clairance CL (L/h)', 'Clearance CL (L/h)'],
  ['Poids (kg)', 'Weight (kg)'],
  ['Poids patient (kg)', 'Patient weight (kg)'],
  ['Dose', 'Dose'],
  ['Dose (mg)', 'Dose (mg)'],
  ['Volume V (L) — largeur', 'Volume V (L) — width'],
  ['Clairance CL (L/h) — robinet', 'Clearance CL (L/h) — tap'],
  ['Durée perf (h)', 'Infusion duration (h)'],
  ['Exposant allométrique', 'Allometric exponent'],
  ['sigma (résiduel prop)', 'sigma (proportional residual)'],
  ['kappa (IOV)', 'kappa (IOV)'],
  ['Valeur', 'Value'],
  ['A priori, vraisemblance et a posteriori', 'Prior, likelihood and posterior'],
  ['Absorption orale : concentration au cours du temps', 'Oral absorption: concentration over time'],
  ['Ajustement du modèle aux données', 'Model fit to data'],
  ["Ajustement d'un ensemble d'arbres", 'Tree ensemble fit'],
  ['AUC par la méthode des trapèzes', 'AUC by the trapezoidal rule'],
  ["Boucle d'hystérèse", 'Hysteresis loop'],
  ['Charge virale au cours du temps (échelle log)', 'Viral load over time (log scale)'],
  ['Cinétique parent et métabolite en échelle log', 'Parent and metabolite kinetics on a log scale'],
  ['Clustering des paramètres individuels par type de cancer', 'Clustering of individual parameters by cancer type'],
  ['Concentration et réponse au cours du temps', 'Concentration and response over time'],
  ["Concentration plasma et site d'effet", 'Plasma and effect-site concentrations'],
  ['Concentration vs CMI', 'Concentration vs MIC'],
  ["Concentrations sous anticorps avec apparition d'ADA", 'Antibody concentrations with ADA development'],
  ['Convergence du SAEM en deux phases', 'Two-phase SAEM convergence'],
  ['Courbe concentration-temps', 'Concentration-time curve'],
  ['Courbe de survie sans progression', 'Progression-free survival curve'],
  ['Courbe effet-concentration Emax/Hill', 'Emax/Hill concentration-effect curve'],
  ['Courbes de survie OS et PFS', 'OS and PFS survival curves'],
  ["Distribution bootstrap d'un paramètre", 'Bootstrap distribution of a parameter'],
  ['Distribution des NPDE vs N(0,1)', 'NPDE distribution vs N(0,1)'],
  ['Doses répétées et accumulation', 'Repeated doses and accumulation'],
  ['Forest plot des effets de covariables', 'Forest plot of covariate effects'],
  ['Frontière SVM à marge maximale', 'Maximum-margin SVM boundary'],
  ['Graphiques diagnostiques', 'Diagnostic plots'],
  ['Importance des variables', 'Variable importance'],
  ["Levier de l'erreur résiduelle en MAPBE", 'Residual-error lever in MAPBE'],
  ['Linéarisation FOCE : courbe et tangente', 'FOCE linearization: curve and tangent'],
  ['Modèle bi-compartimental', 'Two-compartment model'],
  ['Modèle hydraulique : réservoir et robinet', 'Hydraulic model: tank and tap'],
  ['Motifs de résidus', 'Residual patterns'],
  ['Neutrophiles et concentration au cours du temps', 'Neutrophils and concentration over time'],
  ['Nuage de covariables corrélées', 'Correlated covariate scatter plot'],
  ['Perfusion IV', 'IV infusion'],
  ['PK non linéaire (TMDD) en échelle log', 'Nonlinear PK (TMDD) on a log scale'],
  ['Placement des prélèvements et précision', 'Sample timing and precision'],
  ['Profil TDM : population vs individuel', 'TDM profile: population vs individual'],
  ['Spectre des valeurs propres vs Marchenko-Pastur', 'Eigenvalue spectrum vs Marchenko-Pastur'],
  ['Taille tumorale au cours du temps', 'Tumor size over time'],
  ['Tolérance et rebond de la réponse', 'Tolerance and response rebound']
];

const dictionary = new Map();
for (const [fr, en] of entries) {
  dictionary.set(fr, { fr, en });
  dictionary.set(en, { fr, en });
}

export function vizText(language, text) {
  const translated = dictionary.get(text);
  return translated?.[language === 'en' ? 'en' : 'fr'] ?? text;
}


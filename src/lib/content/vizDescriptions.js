// Descriptions des animations (une par composant de visualisation).
// Affichées sous le panneau interactif de chaque chapitre. Bilingue { fr, en }.
// La clé est le nom de fichier (stem) ; describeViz() résout aussi les alias
// (ex. "IVBolus" → "IVBolusExplorer", "AUCTrap" → "08_AUCTrap").

/** @type {Record<string, {fr:string, en:string}>} */
const D = {
  '01_HumanBody': {
    fr: "Schéma du corps en organes reliés par la circulation. Situe où le médicament se distribue et où il est éliminé (foie, reins) — la logique de la PBPK.",
    en: "A body diagram of organs linked by the circulation. Shows where the drug distributes and where it is eliminated (liver, kidneys) — the PBPK logic."
  },
  '02_BucketSim': {
    fr: "Analogie hydraulique : la largeur du réservoir = le volume, l'ouverture du robinet = la clairance, le niveau = la concentration. Élargissez ou ouvrez le robinet et regardez la courbe.",
    en: "A hydraulic analogy: tank width = volume, tap opening = clearance, liquid level = concentration. Widen the tank or open the tap and watch the curve."
  },
  '03_PopulationDistrib': {
    fr: "Distribution d'un paramètre (ex. clairance) dans une population. Montre la variabilité inter-individuelle et pourquoi les paramètres positifs suivent une loi log-normale.",
    en: "The distribution of a parameter (e.g. clearance) across a population. Shows inter-individual variability and why positive parameters are log-normal."
  },
  '04_ThreeApproaches': {
    fr: "Compare NCA, PopPK et PBPK sur un même problème : ce que chaque approche suppose, mesure et permet d'extrapoler.",
    en: "Compares NCA, PopPK and PBPK on the same problem: what each approach assumes, measures and can extrapolate."
  },
  '08_AUCTrap': {
    fr: "Calcul de l'AUC par la méthode des trapèzes. Ajoutez/déplacez les points d'échantillonnage et voyez l'aire estimée changer.",
    en: "AUC computed by the trapezoidal method. Add/move sampling points and watch the estimated area change."
  },
  '09_PK1C': {
    fr: "Courbe concentration–temps d'un modèle à un compartiment. Faites varier dose, ka, CL et V pour voir Cmax, Tmax et la pente d'élimination.",
    en: "The concentration–time curve of a one-compartment model. Vary dose, ka, CL and V to see Cmax, Tmax and the elimination slope."
  },
  '10_PK2C': {
    fr: "Profil bi-compartimental en échelle semi-logarithmique : deux pentes (distribution α rapide, élimination β lente). Basculez linéaire/log pour les distinguer.",
    en: "A two-compartment profile on a semi-log scale: two slopes (fast α distribution, slow β elimination). Toggle linear/log to tell them apart."
  },
  '12_VariabilitySandbox': {
    fr: "Génère une population virtuelle de profils. Réglez la variabilité inter-individuelle et l'erreur résiduelle pour voir le nuage de courbes s'élargir.",
    en: "Generates a virtual population of profiles. Adjust inter-individual variability and residual error to see the cloud of curves widen."
  },
  '13_ResidualError': {
    fr: "Illustre l'erreur résiduelle : additive (bruit constant) vs proportionnelle (bruit ∝ concentration). Montre pourquoi le choix change la pondération.",
    en: "Illustrates residual error: additive (constant noise) vs proportional (noise ∝ concentration). Shows why the choice changes weighting."
  },
  '14_AllometryCentering': {
    fr: "Effet du poids sur la clairance par loi puissance (exposant 0,75), centrée sur 70 kg. Déplacez le poids et voyez la clairance typique s'ajuster.",
    en: "The weight effect on clearance via a power law (exponent 0.75), centred at 70 kg. Move the weight and watch the typical clearance adjust."
  },
  '17_VPCCrashTest': {
    fr: "Visual Predictive Check : compare les percentiles observés aux bandes simulées sous le modèle. Si les points sortent des tunnels, le modèle simule mal.",
    en: "A Visual Predictive Check: compares observed percentiles to the simulated bands under the model. Points leaving the tunnels mean the model simulates poorly."
  },
  '18_BayesianShrinkage': {
    fr: "Montre le rétrécissement (shrinkage) : avec peu de données, les estimations individuelles (EBE) se replient vers la population. Réduisez l'information et voyez le nuage se contracter.",
    en: "Shows shrinkage: with sparse data, individual estimates (EBEs) collapse toward the population. Reduce the information and watch the cloud contract."
  },
  '15_OFVGame': {
    fr: "Minimiser la fonction objective (OFV = −2 log L) : déplacez les paramètres pour rapprocher le modèle des données et faire baisser l'OFV.",
    en: "Minimising the objective function (OFV = −2 log L): move the parameters to bring the model closer to the data and lower the OFV."
  },
  '16_SAEMCycle': {
    fr: "Le cycle de l'algorithme SAEM : alternance simulation des effets individuels (E) et mise à jour des paramètres de population (M), jusqu'à convergence.",
    en: "The SAEM algorithm cycle: alternating simulation of individual effects (E) and update of population parameters (M), until convergence."
  },
  '21_PopPKPlayground': {
    fr: "Bac à sable PopPK : réglez modèle, doses, variabilité et plan de prélèvement pour simuler une population et voir le faisceau de profils.",
    en: "A PopPK sandbox: set the model, doses, variability and sampling design to simulate a population and see the bundle of profiles."
  },
  '20_NeuralBox': {
    fr: "Représente un réseau de neurones comme une boîte qui transforme des entrées en sortie. Sert d'image aux modèles d'apprentissage (Neural ODE, LLM).",
    en: "Represents a neural network as a box transforming inputs into an output. A visual stand-in for learning models (Neural ODE, LLMs)."
  },
  '30_TumorGrowth': {
    fr: "Modèle de croissance tumorale (Claret) : montez l'exposition et voyez la tumeur régresser puis ré-échapper quand la résistance épuise l'effet. Bandes RECIST en repère.",
    en: "A tumour growth model (Claret): raise the exposure to see the tumour shrink then re-escape as resistance depletes the effect. RECIST bands for reference."
  },
  '31_JointSurvival': {
    fr: "Modèle joint : la taille tumorale pilote le risque de progression. Réduire la tumeur (exposition, lien β) repousse la courbe de survie sans progression vers la droite.",
    en: "A joint model: tumour size drives the progression risk. Shrinking the tumour (exposure, link β) pushes the progression-free survival curve to the right."
  },
  '32_Myelosuppression': {
    fr: "Modèle de Friberg : le nadir des neutrophiles survient plusieurs jours après le pic plasmatique (maturation, MTT). Jouez sur dose, MTT et rétrocontrôle.",
    en: "The Friberg model: the neutrophil nadir occurs several days after the plasma peak (maturation, MTT). Play with dose, MTT and feedback."
  },
  '40_TreeEnsemble': {
    fr: "Régression 1D : arbre unique (marches), forêt (moyenne lissée) ou boosting (affinage séquentiel). Basculez de mode et observez l'ajustement.",
    en: "1D regression: single tree (steps), forest (smoothed average) or boosting (sequential refinement). Switch modes and watch the fit."
  },
  '41_SVMMargin': {
    fr: "SVM : la frontière à marge maximale entre deux classes ; seuls les vecteurs de support la définissent. Réglez C pour élargir/rétrécir la marge.",
    en: "SVM: the maximal-margin boundary between two classes; only support vectors define it. Adjust C to widen/narrow the margin."
  },
  '42_VarImportance': {
    fr: "Importance des variables d'une forêt, avec un seuil de sélection (esprit VSURF). Déplacez le seuil : trop bas garde du bruit, trop haut perd des variables utiles.",
    en: "A forest's variable importance, with a selection threshold (VSURF spirit). Move the threshold: too low keeps noise, too high drops useful variables."
  },
  '43_Copula': {
    fr: "Copule : deux covariables corrélées dont les histogrammes (marges) restent fixes tandis que la corrélation ρ change. Illustre « dépendance ≠ marges ».",
    en: "A copula: two correlated covariates whose histograms (margins) stay fixed while the correlation ρ changes. Illustrates 'dependence ≠ margins'."
  },
  '44_Survival': {
    fr: "Courbes de survie OS et PFS (Weibull). La PFS chute avant l'OS ; un hazard ratio < 1 décale les deux vers la droite (survie médiane plus longue).",
    en: "OS and PFS survival curves (Weibull). PFS falls before OS; a hazard ratio < 1 shifts both to the right (longer median survival)."
  },
  '45_ViralKinetics': {
    fr: "Charge virale sous traitement en échelle log : décroissance biphasique (clairance du virus puis perte des cellules infectées). Réglez efficacité ε et perte δ.",
    en: "Viral load under treatment on a log scale: biphasic decline (virus clearance then loss of infected cells). Adjust efficacy ε and loss δ."
  },
  '50_GOFPlots': {
    fr: "Graphiques diagnostiques : observations vs prédictions et résidus CWRES. Montez la « mauvaise spécification » pour voir apparaître un biais systématique.",
    en: "Diagnostic plots: observations vs predictions and CWRES residuals. Raise the 'misspecification' to see a systematic bias appear."
  },
  '51_Bootstrap': {
    fr: "Distribution bootstrap d'un paramètre. Augmentez la taille du jeu de données : la distribution se resserre, l'IC 95 % et le RSE diminuent.",
    en: "The bootstrap distribution of a parameter. Increase the dataset size: the distribution tightens, the 95% CI and RSE shrink."
  },
  '52_NPDE': {
    fr: "Histogramme des NPDE comparé à la loi normale standard N(0,1). Un décalage de moyenne ou un étalement signale une mauvaise spécification du modèle.",
    en: "A histogram of NPDE compared to the standard normal N(0,1). A shifted mean or a spread signals a misspecified model."
  },
  '53_ForestPlot': {
    fr: "Forest plot des effets de covariables (ratio vs référence) avec IC 95 %. La ligne à 1 = pas d'effet ; la bande = zone sans conséquence clinique.",
    en: "A forest plot of covariate effects (ratio vs reference) with 95% CI. The line at 1 = no effect; the band = the clinically inconsequential zone."
  },
  '54_TMDD': {
    fr: "PK non linéaire (TMDD) en semi-log : à faible dose la cible sature vite (chute rapide), à forte dose la pente s'allonge — la clairance diminue quand la dose monte.",
    en: "Nonlinear PK (TMDD) on semi-log: at low dose the target saturates fast (rapid drop), at high dose the slope lengthens — clearance falls as dose rises."
  },
  '55_ADA': {
    fr: "Immunogénicité : après la séroconversion, la clairance augmente et les concentrations résiduelles s'effondrent sous la cible (perte de réponse). Réglez θ et l'apparition.",
    en: "Immunogenicity: after seroconversion, clearance rises and trough concentrations collapse below target (loss of response). Adjust θ and the onset."
  },
  '56_PKPDIndex': {
    fr: "Concentration vs CMI : bascule entre T>CMI, Cmax/CMI et AUC/CMI. Montre quel indice chaque famille d'antibiotiques cherche à optimiser.",
    en: "Concentration vs MIC: toggle between T>MIC, Cmax/MIC and AUC/MIC. Shows which index each antibiotic family aims to optimise."
  },
  '57_Tolerance': {
    fr: "Tolérance : sous exposition constante l'effet s'atténue (un modérateur monte) ; à l'arrêt, la réponse plonge sous la base (rebond). Réglez la vitesse de tolérance.",
    en: "Tolerance: under constant exposure the effect fades (a moderator rises); on withdrawal, the response dips below baseline (rebound). Adjust the tolerance speed."
  },
  '58_OptimalDesign': {
    fr: "Design optimal : placez deux prélèvements sur la courbe et voyez le RSE de V et k. Un point précoce + un tardif minimisent l'incertitude (matrice de Fisher).",
    en: "Optimal design: place two samples on the curve and see the RSE of V and k. One early + one late sample minimises uncertainty (Fisher matrix)."
  },
  '60_WarfarinFit': {
    fr: "Les vraies observations du jeu de données Warfarin (251 points, 32 sujets) avec un modèle 1-compartiment ajustable. Mode « Profil » (nuage + courbe) ou « Obs vs préd » (GoF réel).",
    en: "The real Warfarin dataset observations (251 points, 32 subjects) with an adjustable one-compartment model. 'Profile' mode (scatter + curve) or 'Obs vs pred' mode (real GoF)."
  },
  '66_FOCELinearization': {
    fr: "FOCE illustré : le paramètre est non linéaire en η (courbe), et FOCE le remplace par sa tangente en η̂. Montez la courbure pour voir l'erreur d'approximation grandir loin de η̂.",
    en: "FOCE illustrated: the parameter is non-linear in η (curve), and FOCE replaces it by its tangent at η̂. Raise the curvature to see the approximation error grow away from η̂."
  },
  '67_SAEMConvergence': {
    fr: "Convergence du SAEM : la valeur d'un paramètre au fil des itérations. Phase 1 exploratoire (elle saute autour de θ*), phase 2 de lissage (pas décroissant → converge). Changez la graine : même destination.",
    en: "SAEM convergence: a parameter's value across iterations. Phase 1 exploratory (it jumps around θ*), phase 2 smoothing (decreasing step → converges). Change the seed: same destination."
  },
  '65_ParentMetabolite': {
    fr: "Cinétique parent → métabolite (échelle log) : le parent décroît, le métabolite se forme puis décroît. Réglez k, km et fm : si km < k, le métabolite persiste (limité par l'élimination).",
    en: "Parent → metabolite kinetics (log scale): the parent decays, the metabolite forms then decays. Adjust k, km and fm: if km < k, the metabolite persists (elimination-limited)."
  },
  '63_ClusterPCA': {
    fr: "Paramètres individuels (CL, V) de patients de 3 types de cancer. Basculez « Vrai type » ↔ « Clusters (k-means) » et réglez la séparation : quand elle est nette, le clustering retrouve les groupes.",
    en: "Individual parameters (CL, V) of patients from 3 cancer types. Toggle 'True type' ↔ 'Clusters (k-means)' and adjust the separation: when clear, clustering recovers the groups."
  },
  '64_RMT': {
    fr: "Random Matrix Theory : spectre des valeurs propres d'une matrice de corrélation. Sous λ₊ = bruit (loi de Marchenko-Pastur) ; au-dessus = vraies corrélations. Réglez le nombre de facteurs et de patients.",
    en: "Random Matrix Theory: the eigenvalue spectrum of a correlation matrix. Below λ₊ = noise (Marchenko-Pastur law); above = real correlations. Adjust the number of factors and patients."
  },
  '62_ResidualPatterns': {
    fr: "Galerie de motifs de résidus (CWRES) : aléatoire (bon), U / U inversé (structure), trompette (modèle d'erreur), pente (covariable). Chaque motif affiche sa cause et son remède.",
    en: "A gallery of residual patterns (CWRES): random (good), U / inverted U (structure), trumpet (error model), slope (covariate). Each pattern shows its cause and fix."
  },
  '61_ResidualError': {
    fr: "Modèle d'erreur résiduelle sur les vraies données Warfarin : bande à ±1,96·SD (additive, proportionnelle ou combinée) autour de la courbe. On lit le % de points réels dans la bande (cible ≈ 95 %).",
    en: "Residual-error model on the real Warfarin data: a ±1.96·SD band (additive, proportional or combined) around the curve. Read the % of real points inside the band (target ≈ 95%)."
  },
  '59_ModelSelection': {
    fr: "Sélection de modèle : la baisse d'OFV (ΔOFV) comparée à la loi du χ² (test du rapport de vraisemblance), plus l'AIC et le BIC. Réglez ΔOFV, le nombre de paramètres et n.",
    en: "Model selection: the OFV drop (ΔOFV) compared to the χ² law (likelihood-ratio test), plus AIC and BIC. Adjust ΔOFV, the number of parameters and n."
  },
  'BayesUpdate': {
    fr: "Mise à jour bayésienne : le prior (population) et la vraisemblance (données) se combinent en un posterior. Ajoutez des mesures et voyez la distribution se resserrer.",
    en: "Bayesian updating: the prior (population) and the likelihood (data) combine into a posterior. Add measurements and watch the distribution tighten."
  },
  'BuildingBlocksPKPD': {
    fr: "Assemble les briques PK et PD : la concentration (PK) alimente l'effet (PD). Vue d'ensemble avant de détailler chaque bloc.",
    en: "Assembles the PK and PD blocks: concentration (PK) feeds the effect (PD). An overview before detailing each block."
  },
  'EmaxHill': {
    fr: "Courbe concentration–effet Emax/Hill : effet croissant puis saturé. Réglez Emax, EC50 et le coefficient de Hill pour voir le plateau et la raideur.",
    en: "The Emax/Hill concentration–effect curve: effect rising then saturating. Adjust Emax, EC50 and the Hill coefficient to see the plateau and steepness."
  },
  'EstimationFit': {
    fr: "Ajustement d'un modèle aux données : déplacez CL et V pour minimiser le critère (OFV). Montre la « vallée » de la vraisemblance autour de l'optimum.",
    en: "Fitting a model to data: move CL and V to minimise the criterion (OFV). Shows the likelihood 'valley' around the optimum."
  },
  'IVBolusExplorer': {
    fr: "Bolus IV à un compartiment : la dose fixe C₀ = Dose/V, la décroissance est exponentielle. Faites glisser dose, V et CL pour voir la courbe entière monter/descendre.",
    en: "A one-compartment IV bolus: the dose sets C₀ = Dose/V, decay is exponential. Slide dose, V and CL to see the whole curve rise/fall."
  },
  'Infusion': {
    fr: "Perfusion IV : montée vers un plateau Css = R₀/CL, puis décroissance à l'arrêt. Le débit fixe le niveau, la demi-vie fixe le temps d'atteinte.",
    en: "IV infusion: a rise toward a plateau Css = R₀/CL, then decay at stop. The rate sets the level, the half-life sets the time to reach it."
  },
  'MultiDose': {
    fr: "Doses répétées : accumulation jusqu'à un état d'équilibre. Réglez dose et intervalle pour voir la Css moyenne et le ratio d'accumulation.",
    en: "Repeated doses: accumulation up to steady state. Adjust dose and interval to see the average Css and the accumulation ratio."
  },
  'OralAbsorptionExplorer': {
    fr: "Absorption orale : montée (ka) puis descente (ke), avec temps de latence et compartiments de transit. Réglez ka et Tlag pour déplacer le pic (Cmax, Tmax).",
    en: "Oral absorption: rise (ka) then fall (ke), with lag time and transit compartments. Adjust ka and Tlag to move the peak (Cmax, Tmax)."
  },
  'SheinerEffect': {
    fr: "Compartiment d'effet (Sheiner) : l'effet suit une concentration au site (Ce) en retard sur le plasma. Un petit ke0 crée une boucle d'hystérèse.",
    en: "Effect compartment (Sheiner): the effect follows an effect-site concentration (Ce) lagging the plasma. A small ke0 creates a hysteresis loop."
  },
  'TDMProfile': {
    fr: "Suivi thérapeutique : une concentration mesurée met à jour le profil individuel, puis on ajuste la dose vers la cible. Déplacez le prélèvement et la dose.",
    en: "Therapeutic drug monitoring: a measured concentration updates the individual profile, then the dose is adjusted toward target. Move the sample and the dose."
  },
  'Turnover': {
    fr: "Réponse indirecte (turnover) : le médicament agit sur la production (kin) ou l'élimination (kout) d'une réponse. Le délai vient de kout, pas de la PK.",
    en: "Indirect response (turnover): the drug acts on the production (kin) or elimination (kout) of a response. The delay comes from kout, not the PK."
  }
};

// Construit une table alias → stem (réplique la logique de vizRegistry).
/** @type {Record<string,string>} */
const aliasToStem = {};
for (const stem of Object.keys(D)) {
  const set = new Set([stem]);
  const noPrefix = stem.replace(/^\d+[_-]/, '');
  set.add(noPrefix);
  const noExplorer = noPrefix.replace(/Explorer$/, '');
  if (noExplorer) set.add(noExplorer);
  for (const a of set) if (!(a in aliasToStem)) aliasToStem[a] = stem;
}

/**
 * Description localisée d'une visualisation, ou null si absente.
 * @param {string | null | undefined} key
 * @param {string | null | undefined} lang
 * @returns {string | null}
 */
export function describeViz(key, lang) {
  if (!key) return null;
  const stem = D[key] ? key : aliasToStem[key];
  const d = stem ? D[stem] : null;
  if (!d) return null;
  return lang === 'en' ? d.en : d.fr;
}

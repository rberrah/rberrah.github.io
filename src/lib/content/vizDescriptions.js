// Descriptions des animations (une par composant de visualisation).
// Affichées sous le panneau interactif de chaque chapitre. Bilingue { fr, en }.
// La clé est le nom de fichier (stem) ; describeViz() résout aussi les alias
// (ex. "IVBolus" → "IVBolusExplorer", "AUCTrap" → "08_AUCTrap").

/** @type {Record<string, {fr:string, en:string}>} */
export const visualizationDescriptions = {
  'CovariateEffects': {
    fr: 'Poids versus clairance : distinguer la relation typique décrite par bêta, la dispersion des ETA et le déplacement d’un individu.',
    en: 'Weight versus clearance: distinguish the typical beta relationship, ETA dispersion and the shift of one individual.'
  },
  'CovariateGroups': {
    fr: 'Catégorie ou poids versus clairance : comparer des catégories sans interpolation et des paliers de poids fictifs.',
    en: 'Category or weight versus clearance: compare categories without interpolation and illustrative weight thresholds.'
  },
  'CovariatePhysiology': {
    fr: 'Âge post-menstruel versus clairance : une maturation de Hill à taille fixée, avec PMA50 et pente réglables.',
    en: 'Postmenstrual age versus clearance: Hill maturation at fixed body size, with adjustable PMA50 and slope.'
  },
  'CovariateSymbolic': {
    fr: 'Poids versus clairance : 42 patients simulés entre 40 et 90 kg, des approximations symboliques et des zones d’extrapolation non validée. Aucun réseau n’est entraîné dans cette illustration.',
    en: 'Weight versus clearance: 42 simulated patients between 40 and 90 kg, symbolic approximations and unvalidated extrapolation regions. No network is trained in this illustration.'
  },
  'CovariateImplementation': {
    fr: 'Poids versus CL ou V : retrouver les équations du cours, l’effet spécifique du génotype sur CL et la variabilité définie par OMEGA.',
    en: 'Weight versus CL or V: reproduce the course equations, the genotype effect specific to CL and OMEGA-defined variability.'
  },
  'MipdResidualLever': {
    fr: "Proxy gaussien de pondération prior-données : réduire le sigma supposé augmente le poids heuristique des prélèvements simulés. Ce n'est pas une optimisation MAP par mapbayr.",
    en: "A Gaussian prior-data weighting proxy: lowering assumed sigma increases the heuristic weight of simulated samples. This is not a MAP optimization by mapbayr."
  },
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
    fr: "Tirages résiduels illustratifs autour d'un profil fixe. Ils montrent comment le bruit déplace les observations, sans constituer un diagnostic du modèle d'erreur.",
    en: "Illustrative residual draws around a fixed profile. They show how noise displaces observations without constituting an error-model diagnostic."
  },
  '14_AllometryCentering': {
    fr: "Effet du poids sur la clairance par modèle puissance centré sur 70 kg. L'exposant est une hypothèse et la plage simulée 40–120 kg borne l'interprétation.",
    en: "The weight effect on clearance via a power model centred at 70 kg. The exponent is an assumption and the simulated 40–120 kg range bounds interpretation."
  },
  '17_VPCCrashTest': {
    fr: "VPC issue d'un vrai modèle à un compartiment : 500 essais sont simulés avec le plan observé, puis les P5/P50/P95 observés sont comparés aux intervalles des percentiles simulés. Un écart structuré suggère une inadéquation sans en identifier seul la cause.",
    en: "A VPC generated from a one-compartment model: 500 trials use the observed design, then observed P5/P50/P95 are compared with intervals for simulated percentiles. A structured discrepancy suggests misspecification without identifying its cause by itself."
  },
  '18_BayesianShrinkage': {
    fr: "Eta-shrinkage sur 100 patients simulés : quand l'information individuelle diminue, la distribution des EBE se contracte vers zéro et 1 − SD(eta estimé)/oméga augmente.",
    en: "Eta-shrinkage in 100 simulated patients: as individual information decreases, the EBE distribution contracts toward zero and 1 - SD(estimated eta)/omega increases."
  },
  '15_OFVGame': {
    fr: "Compare une séquence de modèles emboîtés. Chaque ΔOFV et son Δdf appartiennent à une comparaison précise et ne s'additionnent pas entre les étapes.",
    en: "Compares a sequence of nested models. Each ΔOFV and its Δdf belongs to one exact comparison and must not be added across steps."
  },
  '16_SAEMCycle': {
    fr: "Cycle conceptuel SAEM : simulation des effets latents, approximation stochastique des statistiques suffisantes puis maximisation. Exploration et lissage décrivent l'évolution du pas entre itérations.",
    en: "Conceptual SAEM cycle: simulation of latent effects, stochastic approximation of sufficient statistics, then maximization. Exploration and smoothing describe the step-size schedule across iterations."
  },
  '19_VSURF': {
    fr: "Workflow conceptuel inspiré de VSURF : seuillage, interprétation et prédiction. Les barres sont illustratives ; aucune forêt, importance ni stabilité de sélection n'est calculée.",
    en: "A conceptual workflow inspired by VSURF: thresholding, interpretation and prediction. Bars are illustrative; no forest, importance or selection stability is computed."
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
    fr: "Exemple de copule gaussienne : les marges simulées du poids et de la ClCr restent fixes tandis que le paramètre de dépendance change. La corrélation empirique finie peut différer légèrement de rho.",
    en: "A Gaussian-copula example: simulated weight and CrCl margins remain fixed while the dependence parameter changes. Finite-sample empirical correlation may differ slightly from rho."
  },
  '44_Survival': {
    fr: "Courbes PFS et OS de Weibull illustratives. Un même hazard ratio proportionnel est imposé aux deux processus ; le déplacement obtenu est conditionnel au modèle et ne démontre aucun effet causal d'une dose.",
    en: "Illustrative Weibull PFS and OS curves. The same proportional hazard ratio is imposed on both processes; the resulting shift is conditional on the model and does not demonstrate a causal dose effect."
  },
  '45_ViralKinetics': {
    fr: "Modèle viral réduit après traitement, sans cellules cibles ni nouvelles infections : la décroissance biphasique dépend de la clairance du virus libre et de la perte des cellules infectées, sous ces hypothèses.",
    en: "A reduced post-treatment viral model without target cells or new infection: biphasic decline depends on free-virus clearance and infected-cell loss under those assumptions."
  },
  '50_GOFPlots': {
    fr: "Graphiques diagnostiques illustratifs : observations versus prédictions et proxy de résidu standardisé sur l'échelle logarithmique. Ce proxy n'est pas un CWRES FOCE.",
    en: "Illustrative diagnostic plots: observations versus predictions and a standardized residual proxy on the log scale. This proxy is not a FOCE CWRES."
  },
  '51_Bootstrap': {
    fr: "Vrai bootstrap non paramétrique de la moyenne d'un jeu synthétique : 400 échantillons avec remise produisent une distribution, un intervalle percentile et un RSE illustratifs. Ce n'est pas un bootstrap NLME.",
    en: "An actual nonparametric bootstrap of a synthetic-sample mean: 400 with-replacement samples produce an illustrative distribution, percentile interval and RSE. This is not an NLME bootstrap."
  },
  '52_NPDE': {
    fr: "Histogramme illustratif des NPDE comparé à N(0,1). Sous leurs hypothèses, un décalage de moyenne ou de dispersion suggère une inadéquation prédictive sans en identifier seul la cause.",
    en: "An illustrative NPDE histogram compared with N(0,1). Under their assumptions, a shifted mean or spread suggests predictive misspecification without identifying its cause by itself."
  },
  '53_ForestPlot': {
    fr: "Forest plot illustratif : la ligne à 1, l'IC 95 % et une bande clinique prédéfinie répondent à des questions distinctes. La bande doit être justifiée et aucun critère ne prouve seul l'importance clinique.",
    en: "An illustrative forest plot: the no-effect line, 95% CI and a prespecified clinical band answer different questions. The band requires justification and no criterion alone proves clinical importance."
  },
  '54_TMDD': {
    fr: "Approximation de Michaelis–Menten d'une élimination saturable liée à la cible. Elle montre une clairance apparente dépendante de la concentration, sans représenter un TMDD mécanistique complet.",
    en: "A Michaelis–Menten approximation of saturable target-related elimination. It shows concentration-dependent apparent clearance without representing a full mechanistic TMDD model."
  },
  '55_ADA': {
    fr: "Scénario conditionnel où un effet ADA choisi augmente la clairance après une date donnée. L'effet réel dépend du titre, de la persistance, de l'assay et de la molécule ; passer sous la cible illustrative ne prouve pas une perte de réponse.",
    en: "A conditional scenario where a selected ADA effect raises clearance after a chosen onset. Real effects depend on titre, persistence, assay and molecule; crossing the illustrative target does not prove loss of response."
  },
  '56_PKPDIndex': {
    fr: "Profil bolus IV à un compartiment et calcul illustratif de T>CMI, Cmax/CMI et AUC24/CMI sur concentrations totales. L'indice et la cible applicables dépendent du médicament, de la souche, de la méthode et de la population.",
    en: "A one-compartment IV-bolus profile with illustrative total-concentration T>MIC, Cmax/MIC and AUC24/MIC calculations. Applicable index and target depend on drug, pathogen, method and population."
  },
  '57_Tolerance': {
    fr: "Dans ce modèle illustratif à rétrocontrôle, l'effet s'atténue sous exposition constante et les équations peuvent produire un rebond à l'arrêt. D'autres mécanismes exigent d'autres modèles.",
    en: "In this illustrative feedback model, effect wanes under constant exposure and the equations can generate rebound after withdrawal. Other mechanisms require other models."
  },
  '58_OptimalDesign': {
    fr: "Illustration locale de la matrice de Fisher pour deux prélèvements dans un modèle simple. Les RSE supposent le modèle et l'erreur connus ; ils ne constituent pas un design optimal complet.",
    en: "A local Fisher-information illustration for two samples in a simple model. The RSE values assume known model and error and are not a complete optimal design."
  },
  '60_WarfarinFit': {
    fr: "Observations Warfarin réelles regroupées sur 32 sujets et courbe typique réglée manuellement. La comparaison Obs–PRED est pédagogique, pas un GoF PopPK estimé.",
    en: "Real Warfarin observations pooled across 32 subjects with a manually adjusted typical curve. The Obs–PRED comparison is educational, not an estimated PopPK GoF."
  },
  '66_FOCELinearization': {
    fr: "Approximation locale de Taylor d'une transformation non linéaire autour de eta estimé. L'écart en eta estimé + 1 illustre la linéarisation, sans constituer un calcul complet ni un seuil de validité FOCE.",
    en: "A local Taylor approximation of a nonlinear transform around estimated eta. The gap at estimated eta + 1 illustrates linearization without being a full FOCE calculation or validity threshold."
  },
  '67_SAEMConvergence': {
    fr: "Schéma simplifié d'approximation stochastique : un pas décroissant stabilise progressivement une trajectoire bruitée. Ce n'est ni un SAEM complet ni un diagnostic de convergence.",
    en: "A simplified stochastic-approximation scheme: a decreasing step progressively stabilizes a noisy trajectory. It is neither a full SAEM nor a convergence diagnostic."
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
    fr: "Random Matrix Theory : spectre des valeurs propres d'une matrice de corrélation. Sous λ₊ = compatible avec un bruit idéal ; au-dessus = signal statistique possible à confirmer. Réglez le nombre de facteurs et de patients.",
    en: "Random Matrix Theory: the eigenvalue spectrum of a correlation matrix. Below λ₊ = compatible with ideal noise; above = possible statistical signal to confirm. Adjust the number of factors and patients."
  },
  '62_ResidualPatterns': {
    fr: "Galerie de motifs synthétiques ressemblant à des CWRES : chaque forme génère plusieurs hypothèses et vérifications possibles, sans identifier seule une cause.",
    en: "A gallery of synthetic CWRES-like patterns: each shape generates several possible hypotheses and checks without identifying a cause by itself."
  },
  '61_ResidualError': {
    fr: "Forme de l'écart-type résiduel selon PRED : constant pour l'additif, proportionnel à PRED, ou combinaison quadratique des deux. Ce graphe ne teste pas l'adéquation du modèle.",
    en: "Residual standard deviation versus PRED: constant for additive error, proportional to PRED, or the quadratic combination of both. This graph does not test model adequacy."
  },
  '59_ModelSelection': {
    fr: "Sélection de modèle sous hypothèses explicites : LRT pour modèles emboîtés et réguliers, puis AIC/BIC comme critères de comparaison, sans valeur de confirmation.",
    en: "Model selection under explicit assumptions: LRT for regular nested models, then AIC/BIC as comparison criteria rather than confirmation."
  },
  'BayesUpdate': {
    fr: "Mise à jour gaussienne conjuguée d'un paramètre individuel : prior et vraisemblance forment le posterior. Le poids du prior affiché n'est pas l'eta-shrinkage populationnel.",
    en: "A conjugate Gaussian update for one individual parameter: prior and likelihood form the posterior. The displayed prior contribution is not population eta-shrinkage."
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
for (const stem of Object.keys(visualizationDescriptions)) {
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
  const stem = visualizationDescriptions[key] ? key : aliasToStem[key];
  const d = stem ? visualizationDescriptions[stem] : null;
  if (!d) return null;
  return lang === 'en' ? d.en : d.fr;
}

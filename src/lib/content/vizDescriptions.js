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
    fr: "Repère anatomique simplifié des étapes ADME. Les zones localisent des fonctions générales ; elles ne représentent ni une anatomie quantitative ni un modèle PBPK relié par des débits.",
    en: "A simplified anatomical landmark for ADME steps. Regions locate broad functions; they represent neither quantitative anatomy nor a flow-connected PBPK model."
  },
  '02_BucketSim': {
    fr: "Analogie d’un bolus IV mono-compartimental linéaire : largeur = V, ouverture = CL et niveau = C(t). La courbe suit C(t)=Dose/V×exp(−CL/V×t) ; le réservoir n’est pas une représentation physiologique.",
    en: "An analogy for a linear one-compartment IV bolus: width = V, opening = CL and level = C(t). The curve follows C(t)=Dose/V×exp(−CL/V×t); the tank is not a physiological representation."
  },
  '03_PopulationDistrib': {
    fr: "Cent poids simulés uniformément entre 45 et 95 kg illustrent une covariable allométrique sur CL ; les trois courbes gardent V fixe. Ce n'est ni une distribution clinique de poids ni une démonstration de log-normalité.",
    en: "One hundred weights simulated uniformly from 45 to 95 kg illustrate an allometric covariate on CL; the three curves keep V fixed. This is neither a clinical weight distribution nor a demonstration of log-normality."
  },
  '04_ThreeApproaches': {
    fr: "Comparaison conceptuelle : la NCA résume le profil (AUC par trapèzes, Cmax observée, pente terminale pour la demi-vie), la PopPK estime un modèle de population et la PBPK encode une structure physiologique. La figure ne compare pas leurs performances.",
    en: "A conceptual comparison: NCA summarizes a profile (trapezoidal AUC, observed Cmax, terminal slope for half-life), PopPK estimates a population model and PBPK encodes physiological structure. The figure does not compare performance."
  },
  '11_ADEChooser': {
    fr: "Comparaison pédagogique entre entrée orale d’ordre 1 avec Tlag et perfusion IV d’ordre zéro, dans un modèle mono-compartimental linéaire. L’intégration est numérique sur une grille de 0,1 h et l’AUC est tronquée à 24 h.",
    en: "A teaching comparison of first-order oral input with Tlag versus zero-order IV infusion in a linear one-compartment model. Integration uses a 0.1 h grid and AUC is truncated at 24 h."
  },
  '08_AUCTrap': {
    fr: "AUC d'une courbe de Bateman par trapèzes linéaires sous trois plans fixes. L'extrapolation ajoute Clast/lambda-z en supposant ici la pente terminale vraie connue ; en pratique lambda-z doit être estimée et qualifiée.",
    en: "A Bateman-curve AUC using linear trapezoids under three fixed designs. Extrapolation adds Clast/lambda-z while assuming the true terminal slope is known; in practice lambda-z must be estimated and qualified."
  },
  '09_PK1C': {
    fr: "Dose orale unique, biodisponibilité fixée à 1, absorption et élimination d'ordre 1 avec Tlag. Les Cmax et Tmax sont lus sur une grille de 0,2 h, donc approximatifs.",
    en: "Single oral dose with bioavailability fixed at 1, first-order absorption and elimination, and Tlag. Cmax and Tmax are read from a 0.2 h grid and are therefore approximate."
  },
  '10_PK2C': {
    fr: "Bolus IV bi-compartimental défini par CL, Q, V1 et V2. Les pentes macro α et β sont hybrides : la phase terminale dépend de l'élimination et des échanges, pas de CL seule.",
    en: "A two-compartment IV bolus defined by CL, Q, V1 and V2. Macro-slopes alpha and beta are hybrid: the terminal phase depends on elimination and distribution, not CL alone."
  },
  '12_VariabilitySandbox': {
    fr: "Population virtuelle à un compartiment : ETA gaussien log-normal sur CL, erreur proportionnelle normale et, séparément, trois effets d'occasion sur CL chez un même patient. Les CV de Cmax/AUC sont descriptifs de ces simulations.",
    en: "A virtual one-compartment population: Gaussian log-normal ETA on CL, normal proportional error and, separately, three occasion effects on CL in the same patient. Cmax/AUC CVs describe these simulations only."
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
    fr: "Eta-shrinkage sur 100 patients simulés : quand l'information individuelle diminue, la distribution des EBE se contracte vers zéro et 1 − SD(eta estimé)/oméga augmente. La définition n'est pas bornée à zéro.",
    en: "Eta-shrinkage in 100 simulated patients: as individual information decreases, the EBE distribution contracts toward zero and 1 - SD(estimated eta)/omega increases. The definition is not bounded below by zero."
  },
  '15_OFVGame': {
    fr: "Compare une séquence de modèles emboîtés. Chaque ΔOFV et son Δdf appartiennent à une comparaison précise et ne s'additionnent pas entre les étapes.",
    en: "Compares a sequence of nested models. Each ΔOFV and its Δdf belongs to one exact comparison and must not be added across steps."
  },
  '16_SAEMCycle': {
    fr: "Cycle conceptuel SAEM : simulation des effets latents, approximation stochastique des statistiques suffisantes puis maximisation. L'étape affichée n'est pas une mesure de log-vraisemblance.",
    en: "Conceptual SAEM cycle: simulation of latent effects, stochastic approximation of sufficient statistics, then maximization. The displayed step is not a log-likelihood measure."
  },
  '19_VSURF': {
    fr: "Workflow conceptuel VSURF : élimination par seuil d'importance, ensemble pertinent pour l'interprétation, puis réduction de la redondance pour la prédiction. Les barres sont illustratives ; aucune forêt n'est ajustée.",
    en: "Conceptual VSURF workflow: importance thresholding, a relevant interpretation set, then redundancy reduction for prediction. Bars are illustrative; no forest is fitted."
  },
  '21_PopPKPlayground': {
    fr: "Simulateur PopPK pédagogique de 1 à 3 compartiments avec ETA log-normaux et erreur combinée. Le réglage IOV représente un tirage pour l'unique occasion affichée ; il ne permet pas d'estimer visuellement l'IOV intra-individuelle.",
    en: "An educational one- to three-compartment PopPK simulator with log-normal ETAs and combined error. The IOV setting draws one effect for the single displayed occasion; it does not visually estimate within-subject IOV."
  },
  '20_NeuralBox': {
    fr: "Compare conceptuellement modèle ODE, hybride ODE+NN et boîte noire sur des courbes construites. Déplacez le temps d’examen dans puis hors du domaine illustré (0–12 h). Aucun réseau n’est entraîné et la figure ne mesure pas la généralisation.",
    en: "Conceptually compares an ODE, a hybrid ODE+NN and a black box using constructed curves. Move the inspection time within and beyond the illustrated 0–12 h domain. No network is trained, and the figure does not measure generalization."
  },
  '30_TumorGrowth': {
    fr: "Modèle TGI réduit de type Claret, conditionnel à une exposition constante. Les repères −30 % depuis la référence et +20 % avec +5 mm depuis le nadir concernent les lésions cibles et ne constituent pas un RECIST complet.",
    en: "A reduced Claret-type TGI model conditional on constant exposure. The −30% from baseline and +20% with +5 mm from nadir landmarks concern target lesions and are not a complete RECIST assessment."
  },
  '31_JointSurvival': {
    fr: "Modèle joint pédagogique associant une trajectoire tumorale à un risque d’événement de progression. Les courbes sont des prédictions conditionnelles aux équations et ne prouvent aucun effet causal de la dose ; le décès n’étant pas modélisé, il ne s’agit pas d’une PFS complète.",
    en: "A teaching joint model associating a tumor trajectory with a progression-event hazard. Curves are conditional on the equations and prove no causal dose effect; because death is not modeled, this is not a complete PFS endpoint."
  },
  '32_Myelosuppression': {
    fr: "Modèle de Friberg réduit avec trois compartiments de transit, effet linéaire borné et PK mono-exponentielle imposée. Les seuils d’ANC affichés sont des repères illustratifs, pas une gradation CTCAE ni une recommandation clinique.",
    en: "A reduced Friberg model with three transit compartments, bounded linear effect and imposed mono-exponential PK. Displayed ANC thresholds are illustrative markers, not CTCAE grading or a clinical recommendation."
  },
  '40_TreeEnsemble': {
    fr: "Expérience sur 44 observations synthétiques d’apprentissage et 16 observations synthétiques de test interne : CART 1D, bagging bootstrap (sans tirage aléatoire de variables) ou boosting sur les résidus. Le test reste hors de l’ajustement ; RMSE affichées uniquement pour illustrer l’écart apprentissage/test, sans validation clinique ni externe.",
    en: "Experiment using 44 synthetic training observations and 16 synthetic internal holdout observations: 1D CART, bootstrap bagging (without feature subsampling), or residual-based boosting. The holdout never enters fitting; RMSE illustrates train/test differences, not clinical or external validation."
  },
  '41_SVMMargin': {
    fr: "SVM linéaire soft-margin ajusté par descente de gradient sur deux classes synthétiques. Modifiez leur chevauchement et C ; les points de marge fonctionnelle ≤1 sont signalés comme vecteurs de support approximatifs.",
    en: "A linear soft-margin SVM fitted by gradient descent to two synthetic classes. Change their overlap and C; points with functional margin ≤1 are marked as approximate support vectors."
  },
  '46_ValidationSplit': {
    fr: "Expérience de validation sur 24 patients synthétiques avec deux visites et trois centres construits. Un modèle 1-plus-proche-voisin identique est évalué après répartition aléatoire reproductible des lignes, séparation par patients ou centre ; l'exemple illustre la dépendance intra-patient et le décalage de domaine, sans constituer une validation clinique.",
    en: "Validation experiment using 24 synthetic patients with two visits and three constructed centers. The same 1-nearest-neighbour model is evaluated after a reproducible random row split, a patient split or a center split; the example illustrates within-patient dependence and domain shift, not clinical validation."
  },
  '42_VarImportance': {
    fr: "Importances construites pour illustrer le seuillage et l’instabilité entre covariables corrélées. Aucun modèle n’est ajusté : répétez l’expérience et observez comment poids et proxy se partagent l’information.",
    en: "Constructed importances illustrate thresholding and instability between correlated covariates. No model is fitted: repeat the experiment and observe how weight and its proxy share information."
  },
  '47_TokenAttention': {
    fr: "Poids d’attention construits pour une séquence de six tokens. Choisissez la requête et la tête illustrative ; le masque causal annule les tokens futurs. Ce ne sont ni des poids extraits d’un LLM ni une explication causale.",
    en: "Constructed attention weights for a six-token sequence. Choose the query and illustrative head; the causal mask zeros future tokens. These are neither weights extracted from an LLM nor a causal explanation."
  },
  '43_Copula': {
    fr: "Exemple de copule gaussienne : les lois marginales théoriques du poids et de la ClCr restent fixes tandis que la dépendance change. Dans un échantillon fini, histogrammes et corrélation empiriques peuvent varier légèrement.",
    en: "A Gaussian-copula example: theoretical weight and CrCl marginal laws stay fixed while dependence changes. In a finite sample, empirical histograms and correlation may vary slightly."
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
    fr: "Forest plot illustratif : l'IC 95 % est classé selon qu'il est entièrement dans la bande clinique, en chevauche une limite ou se situe entièrement au-delà. La ligne à 1 répond séparément à la question de l'absence d'effet.",
    en: "An illustrative forest plot: the 95% CI is classified as entirely within the clinical band, overlapping a boundary, or entirely beyond it. The no-effect line separately addresses absence of effect."
  },
  '54_TMDD': {
    fr: "Approximation de Michaelis–Menten d'une élimination saturable liée à la cible. Elle montre une clairance apparente dépendante de la concentration, sans représenter un TMDD mécanistique complet.",
    en: "A Michaelis–Menten approximation of saturable target-related elimination. It shows concentration-dependent apparent clearance without representing a full mechanistic TMDD model."
  },
  '55_ADA': {
    fr: "Scénario conditionnel où un effet ADA choisi augmente la clairance après une date donnée. Les résiduelles sont mesurées juste avant la dose suivante ; l'effet réel dépend notamment du titre, de la persistance, du dosage analytique et de la molécule.",
    en: "A conditional scenario where a selected ADA effect raises clearance after a chosen onset. Troughs are measured immediately before the next dose; real effects depend on titre, persistence, assay and molecule."
  },
  '56_PKPDIndex': {
    fr: "Profil bolus IV à un compartiment sur [0, 24 h[ avec choix des concentrations totales ou libres via fu. Le temps au-dessus de la CMI est interpolé analytiquement et une dose à 24 h n'entre pas dans les indices.",
    en: "A one-compartment IV-bolus profile over [0, 24 h), with total or fu-derived unbound concentrations. Time above MIC is computed analytically and a dose at 24 h does not enter the indices."
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
    fr: "Parent IV et métabolite formé selon fm·k, avec volumes supposés égaux. La pente terminale du métabolite tend vers la plus lente de k et km ; ce modèle omet les autres voies de formation et d'élimination.",
    en: "An IV parent and metabolite formed at fm·k, assuming equal volumes. The metabolite terminal slope tends toward the slower of k and km; other formation and elimination pathways are omitted."
  },
  '63_ClusterPCA': {
    fr: "Estimations CL/V synthétiques de trois groupes construits. Comparez étiquettes, k-means avec ou sans standardisation et projection PCA ; la pureté n’est calculable que parce que les étiquettes simulées sont connues.",
    en: "Synthetic CL/V estimates from three constructed groups. Compare labels, k-means with or without standardization, and PCA projection; purity is computable only because simulated labels are known."
  },
  '64_RMT': {
    fr: "Spectre propre synthétique comparé à la borne de Marchenko–Pastur. Réglez facteurs et effectif, puis répétez l’échantillon : un dépassement dépend des hypothèses et n’est pas une preuve biologique.",
    en: "A synthetic eigenvalue spectrum compared with the Marchenko–Pastur edge. Set factors and sample size, then resample: an exceedance depends on assumptions and is not biological proof."
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
    fr: "Carte conceptuelle des briques PK et PD : elle distingue le devenir du médicament de ses réponses bénéfiques ou toxiques. Ce schéma d’orientation ne définit aucune équation ni causalité clinique.",
    en: "A conceptual map of PK and PD building blocks: it separates drug disposition from beneficial or toxic responses. This orientation diagram defines neither equations nor clinical causality."
  },
  'SlideFigure': {
    fr: "Composant de présentation des diapositives associées au cours. Il affiche l’image et sa légende de catalogue sans effectuer de calcul scientifique.",
    en: "A renderer for course-associated slides. It displays the image and catalogue caption without performing any scientific calculation."
  },
  'EmaxHill': {
    fr: "Modèle Emax/Hill phénoménologique : EC50 produit la moitié de l'incrément Emax, quel que soit Hill. Le plateau d'effet n'implique pas à lui seul une saturation de récepteurs.",
    en: "A phenomenological Emax/Hill model: EC50 gives half of the Emax increment for any Hill value. An effect plateau alone does not imply receptor saturation."
  },
  'EstimationFit': {
    fr: "Ajustement analytique d'un bolus IV mono-exponentiel par régression log-linéaire. Le critère affiché est un SSE non pondéré sur log(C), pas une OFV, une vraisemblance ni une estimation NLME.",
    en: "Analytical fit of a mono-exponential IV bolus by log-linear regression. The displayed criterion is an unweighted SSE on log(C), not an OFV, likelihood or NLME estimate."
  },
  'IVBolusExplorer': {
    fr: "Bolus IV linéaire à un compartiment : C0=Dose/V, k=CL/V, demi-vie=ln(2)/k et AUC0-inf=Dose/CL. Ces identités supposent une élimination linéaire et une disponibilité IV complète.",
    en: "A linear one-compartment IV bolus: C0=Dose/V, k=CL/V, half-life=ln(2)/k and AUC0-inf=Dose/CL. These identities assume linear elimination and complete IV availability."
  },
  'Infusion': {
    fr: "Perfusion IV d'ordre zéro dans un modèle linéaire à un compartiment. R0/CL est le plateau asymptotique d'une perfusion maintenue ; une perfusion finie peut s'arrêter avant de l'atteindre.",
    en: "Zero-order IV infusion in a linear one-compartment model. R0/CL is the asymptotic plateau for a maintained infusion; a finite infusion may stop before reaching it."
  },
  'MultiDose': {
    fr: "Superposition de bolus IV identiques sous PK linéaire à un compartiment. Les formules de Cmax,ss, Cmin,ss, Css moyenne et dose de charge Dose×Rac ne s'appliquent qu'à ce schéma.",
    en: "Superposition of identical IV boluses under linear one-compartment PK. The Cmax,ss, Cmin,ss, mean Css and Dose×Rac loading formulas apply only to this regimen."
  },
  'OralAbsorptionExplorer': {
    fr: "Compare une absorption d'ordre 1 avec Tlag à une chaîne de n transits de temps moyen MTT, sous F=1 et PK mono-compartimentale. Ce sont deux modèles alternatifs, pas deux processus simultanés.",
    en: "Compares first-order absorption with Tlag against an n-transit chain with mean transit time MTT, under F=1 and one-compartment PK. These are alternative models, not simultaneous processes."
  },
  'SheinerEffect': {
    fr: "Compartiment d'effet : dCe/dt=ke0(Cp−Ce) produit une concentration Ce retardée et une boucle Ce-Cp. Ce n'est pas encore un effet : une fonction PD doit relier Ce à la réponse.",
    en: "Effect compartment: dCe/dt=ke0(Cp−Ce) produces delayed Ce and a Ce-Cp loop. Ce is not yet an effect; a PD function must link it to response."
  },
  'TDMProfile': {
    fr: "Mise à jour MAP pédagogique de CL à partir d'un prélèvement, avec V fixé et modèle bolus IV mono-compartimental. Elle illustre prior+donnée mais ne calcule pas à elle seule une recommandation posologique.",
    en: "An educational one-sample MAP update of CL with fixed V and a one-compartment IV-bolus model. It illustrates prior plus data but does not by itself calculate a dosing recommendation."
  },
  'NPAGSupportPoints': {
    fr: "Distribution jointe discrète CL-V synthétique. La surface des points code leur poids ; une concentration patient actualise ces poids par une vraisemblance gaussienne proportionnelle simplifiée. Le nuage log-normal et le lissage sont illustratifs : cette démonstration explique les résumés d'une distribution NPAG sans exécuter NPAG ni une dispersion locale Pmetrics.",
    en: "A synthetic discrete joint CL-V distribution. Point area encodes weight; one patient concentration updates the weights through a simplified proportional Gaussian likelihood. The lognormal cloud and smoothing are illustrative: this demonstration explains NPAG summaries without running NPAG or a Pmetrics local-dispersion model."
  },
  'Turnover': {
    fr: "Deux modèles de réponse indirecte qui augmentent R : stimulation de kin ou inhibition de kout, avec R0=kin/kout. Le délai dépend du turnover ; d'autres mécanismes exigent les deux autres familles de modèles indirects.",
    en: "Two indirect-response models that increase R: stimulation of kin or inhibition of kout, with R0=kin/kout. Delay depends on turnover; other mechanisms require the two other indirect-response families."
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

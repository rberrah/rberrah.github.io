import { readable } from 'svelte/store';

// Dictionnaire de pharmacométrie (français). Chaque entrée : terme, nom complet
// éventuel (full), catégorie (cat) et une définition explicative (def).
const items = [
  // ── Paramètres PK ──────────────────────────────────────────────────────────
  { term: 'PK', full: 'Pharmacocinétique', cat: 'Fondamentaux', def: "Ce que l'organisme fait au médicament : absorption, distribution, métabolisme et élimination (ADME). Décrit l'évolution des concentrations au cours du temps." },
  { term: 'PD', full: 'Pharmacodynamie', cat: 'Fondamentaux', def: "Ce que le médicament fait à l'organisme : la relation entre concentration et effet (thérapeutique ou toxique)." },
  { term: 'ADME', full: 'Absorption, Distribution, Métabolisme, Élimination', cat: 'Fondamentaux', def: "Les quatre étapes du devenir d'un médicament dans l'organisme, base de tout modèle structural PK." },
  { term: 'CL', full: 'Clairance', cat: 'Paramètres PK', def: "Volume de plasma totalement épuré du médicament par unité de temps (L/h). C'est une capacité d'épuration, pas une vitesse : elle gouverne l'exposition à l'équilibre (AUC = Dose/CL)." },
  { term: 'CLr', full: 'Clairance rénale', cat: 'Paramètres PK', def: "Part de la clairance assurée par le rein (filtration, sécrétion, réabsorption). Clairance totale = CL_r + CL_nr (non rénale). Estimée en pratique via la clairance de la créatinine." },
  { term: 'E', full: 'Coefficient d’extraction', cat: 'Paramètres PK', def: "Fraction du médicament extraite par un organe à chaque passage : CL = Q_organe · E, où Q est le débit sanguin de l'organe. Un E proche de 1 rend la clairance dépendante du débit." },
  { term: 'DFG', full: 'Débit de filtration glomérulaire', cat: 'Paramètres PK', def: "Volume de plasma filtré par les glomérules par unité de temps (~120 mL/min chez l'adulte sain). Repère clé de la fonction rénale, approché par la clairance de la créatinine." },
  { term: 'V', full: 'Volume de distribution', cat: 'Paramètres PK', def: "Volume apparent reliant la quantité de médicament dans l'organisme à sa concentration plasmatique (C = A/V). Un V grand signifie une forte distribution tissulaire, pas un volume physiologique réel." },
  { term: 'Vss', full: 'Volume à l’état d’équilibre', cat: 'Paramètres PK', def: "Volume de distribution à l'équilibre de distribution ; somme des volumes central et périphériques dans un modèle multi-compartimental." },
  { term: 'Q', full: 'Clairance inter-compartimentale', cat: 'Paramètres PK', def: "Débit d'échange du médicament entre le compartiment central (V1) et un compartiment périphérique (V2) dans un modèle bi-compartimental." },
  { term: 'Ka', full: 'Constante d’absorption', cat: 'Paramètres PK', def: "Constante de vitesse d'absorption d'ordre 1 (1/h) : plus Ka est grand, plus le pic (Cmax) arrive tôt et haut." },
  { term: 'ke', full: 'Constante d’élimination', cat: 'Paramètres PK', def: "Constante de vitesse d'élimination d'ordre 1 (1/h), égale à CL/V. Fixe la pente de décroissance sur une courbe semi-logarithmique." },
  { term: 'C0', full: 'Concentration initiale', cat: 'Paramètres PK', def: "Concentration juste après un bolus IV, égale à Dose/V. Point de départ de la courbe concentration-temps." },
  { term: 'Cmax / Tmax', cat: 'Paramètres PK', def: "Concentration maximale observée et l'instant où elle survient. Ce sont des résumés de la courbe, pas des paramètres du modèle : un Cmax bas peut venir d'un long Tlag, pas forcément d'une faible biodisponibilité." },
  { term: 't½', full: 'Demi-vie', cat: 'Paramètres PK', def: "Temps nécessaire pour que la concentration diminue de moitié : t½ = ln(2)·V/CL. Se déduit de V et CL — une demi-vie longue peut venir d'un grand V ou d'une faible CL." },
  { term: 'AUC', full: 'Aire sous la courbe', cat: 'Paramètres PK', def: "Aire sous la courbe concentration-temps, mesure de l'exposition totale. Calculée par la règle des trapèzes en NCA ; AUC = Dose/CL pour une cinétique linéaire." },
  { term: 'F', full: 'Biodisponibilité', cat: 'Paramètres PK', def: "Fraction de la dose administrée qui atteint la circulation systémique sous forme inchangée (0–1). Vaut 1 pour une voie IV." },
  { term: 'Tlag', full: 'Temps de latence', cat: 'Paramètres PK', def: "Délai entre l'administration et le début de l'absorption (dissolution, vidange gastrique). Avant Tlag, la concentration reste nulle." },
  { term: 'Compartiments de transit', full: 'MTT, ktr', cat: 'Modèles', def: "Chaîne de n compartiments traversés au rythme ktr modélisant une absorption progressive. Le temps de transit moyen MTT = n/ktr ; alternative souple au Tlag." },
  { term: 'Michaelis-Menten', full: 'Vmax, Km', cat: 'Modèles', def: "Élimination saturable : vitesse = Vmax·C/(Km+C). Aux fortes concentrations l'élimination sature (cinétique non linéaire) ; Km est la concentration donnant la moitié de Vmax." },
  { term: 'Phases α et β', full: 'Modèle bi-compartimental', cat: 'Modèles', def: "Sur une courbe semi-log à deux compartiments, la phase α (rapide) traduit la distribution vers les tissus, la phase β (lente) l'élimination réelle. La demi-vie terminale suit la phase β." },

  // ── Modèles structuraux ─────────────────────────────────────────────────────
  { term: 'Modèle compartimental', cat: 'Modèles', def: "Représentation de l'organisme par un ou plusieurs compartiments bien mélangés reliés par des débits, décrits par des équations différentielles." },
  { term: 'Modèle structural', cat: 'Modèles', def: "La partie déterministe d'un modèle de population : nombre de compartiments, type d'absorption et d'élimination, décrivant le patient « typique »." },
  { term: 'EDO', full: 'Équation différentielle ordinaire', cat: 'Modèles', def: "Décrit la vitesse de transfert entre compartiments (dA/dt). Analogie hydraulique : réservoirs reliés par des tuyaux dont le débit dépend du niveau et du diamètre (clairance)." },
  { term: 'NCA', full: 'Analyse non compartimentale', cat: 'Approches', def: "Approche descriptive « model-independent » : calcule AUC, Cmax, t½ par géométrie/algèbre sans supposer de modèle. Robuste mais non prédictive." },
  { term: 'PopPK', full: 'Pharmacocinétique de population', cat: 'Approches', def: "Approche top-down à effets mixtes : estime les paramètres typiques ET leur variabilité sur une population, permet la simulation et l'individualisation. Standard du domaine." },
  { term: 'PBPK', full: 'PK physiologiquement fondée', cat: 'Approches', def: "Approche bottom-up : un compartiment par organe relié par les débits sanguins. Puissante pour extrapoler et prédire les interactions, mais gourmande en hypothèses." },

  // ── Variabilité & erreur ────────────────────────────────────────────────────
  { term: 'Effets mixtes', full: 'Modèle non linéaire à effets mixtes', cat: 'Variabilité', def: "Modèle combinant effets fixes (valeurs typiques de population) et effets aléatoires (écarts individuels), base de la PopPK." },
  { term: 'θ', full: 'Thêta — effet fixe', cat: 'Variabilité', def: "Paramètre de population « typique » (ex. CL_pop, V_pop) : la tendance moyenne dans la population." },
  { term: 'η', full: 'Êta — effet aléatoire', cat: 'Variabilité', def: "Écart individuel d'un patient par rapport à la valeur typique, souvent log-normal : CLᵢ = CL_pop·e^ηᵢ. De moyenne nulle et de variance ω²." },
  { term: 'IIV', full: 'Variabilité inter-individuelle', cat: 'Variabilité', def: "Différences entre patients (via les η) ; approximativement constante pour un patient donné. Expliquée en partie par les covariables." },
  { term: 'IOV', full: 'Variabilité inter-occasion', cat: 'Variabilité', def: "Variabilité chez un même patient d'une occasion à l'autre (κ). Si l'IOV dépasse l'IIV, le suivi thérapeutique devient difficile." },
  { term: 'ω / Ω', full: 'Oméga', cat: 'Variabilité', def: "Écart-type (ω) ou matrice de variance-covariance (Ω) des effets aléatoires η : quantifie l'ampleur de l'IIV." },
  { term: 'ε / σ', full: 'Epsilon / sigma — erreur résiduelle', cat: 'Variabilité', def: "Écart inexpliqué entre l'observation et la prédiction individuelle. σ en est l'écart-type. À ne pas confondre avec l'IIV." },
  { term: 'Erreur additive', cat: 'Variabilité', def: "Bruit d'amplitude constante (y = f + ε_add), pertinent près de la limite de quantification." },
  { term: 'Erreur proportionnelle', cat: 'Variabilité', def: "Bruit croissant avec la concentration (y = f·(1+ε_prop)), typique des dosages analytiques." },
  { term: 'Erreur combinée', cat: 'Variabilité', def: "Somme d'une composante additive et proportionnelle : y = f + (f·ε_prop + ε_add). Souvent le modèle d'erreur le plus réaliste." },

  // ── Covariables ─────────────────────────────────────────────────────────────
  { term: 'Covariable', cat: 'Covariables', def: "Caractéristique mesurée (poids, âge, créatinine, génotype…) qui explique une partie de la variabilité d'un paramètre." },
  { term: 'Allométrie', cat: 'Covariables', def: "Mise à l'échelle des paramètres par le poids selon une loi de puissance : CL = CL_std·(WT/70)^0,75 ; V exposant ≈ 1. La physiologie n'est pas linéaire avec le poids." },
  { term: 'Centrage', cat: 'Covariables', def: "Rapporter une covariable à une valeur de référence (ex. 70 kg) pour garder les paramètres typiques interprétables et décorréler θ et effet covariable." },
  { term: 'Sélection forward/backward', cat: 'Covariables', def: "Ajout puis retrait de covariables selon le ΔOFV (forward p<0,05 → ΔOFV<−3,84 ; backward p<0,01 → ΔOFV>6,63). À compléter par plausibilité et diagnostics." },

  // ── Estimation ──────────────────────────────────────────────────────────────
  { term: 'Vraisemblance', full: 'Likelihood', cat: 'Estimation', def: "Plausibilité des données observées sous le modèle. L'estimation cherche les paramètres qui la maximisent." },
  { term: 'OFV', full: '-2 log-vraisemblance', cat: 'Estimation', def: "Objective Function Value ≈ −2·log(vraisemblance). Un ΔOFV entre deux modèles emboîtés suit un χ² (test du rapport de vraisemblance)." },
  { term: 'FOCE-I', full: 'First-Order Conditional Estimation w/ Interaction', cat: 'Estimation', def: "Algorithme d'estimation déterministe (NONMEM historique). Rapide sur modèles simples, mais peut rester bloqué dans un minimum local." },
  { term: 'SAEM', full: 'Stochastic Approximation Expectation-Maximization', cat: 'Estimation', def: "Algorithme stochastique (Monolix, nlmixr2) : cycle Exploration → Approximation → Maximisation. Robuste pour les modèles complexes, explore l'espace pour éviter les minima locaux." },
  { term: 'MCMC', full: 'Markov Chain Monte Carlo', cat: 'Estimation', def: "Échantillonnage utilisé en estimation bayésienne complète (Stan, WinBUGS) pour approcher la distribution a posteriori des paramètres." },
  { term: 'AIC / BIC', full: 'Critères d’information', cat: 'Estimation', def: "AIC = −2logL + 2p ; BIC pénalise davantage le nombre de paramètres p. Plus bas = meilleur compromis ajustement/parcimonie — utile mais insuffisant seul." },
  { term: 'DoF', full: 'Degrés de liberté', cat: 'Estimation', def: "Nombre d'informations indépendantes disponibles pour estimer les paramètres (DoF = N points − P paramètres). Sans DoF suffisants, les paramètres ne sont pas identifiables." },
  { term: 'Identifiabilité', cat: 'Estimation', def: "Possibilité d'estimer de façon unique les paramètres à partir des données. Une FIM mal conditionnée signale une sur-paramétrisation." },
  { term: 'FIM', full: 'Matrice d’information de Fisher', cat: 'Estimation', def: "Mesure l'information apportée par les données sur les paramètres ; son inverse donne les erreurs standard (RSE). Un conditionnement élevé indique des paramètres corrélés." },
  { term: 'RSE', full: 'Erreur standard relative', cat: 'Estimation', def: "Incertitude d'un paramètre en % de sa valeur. On vise typiquement RSE < 30 % (effets fixes) à 50 % (variances)." },
  { term: 'Bootstrap', cat: 'Estimation', def: "Rééchantillonnage de l'étude (avec remise) pour créer de nombreuses études virtuelles et estimer l'intervalle de confiance des paramètres. Un IC étroit = modèle robuste." },

  // ── Diagnostics & validation ────────────────────────────────────────────────
  { term: 'GOF', full: 'Goodness-of-fit', cat: 'Diagnostics', def: "Graphes d'adéquation : observé vs prédit, résidus vs temps/prédiction, etc. Un premier contrôle visuel de la qualité du modèle." },
  { term: 'PRED / IPRED', cat: 'Diagnostics', def: "Prédiction de population (patient typique, dispersion normale car l'IIV existe) vs prédiction individuelle après adaptation bayésienne (doit tomber sur la diagonale)." },
  { term: 'Résidus (WRES/CWRES/IWRES/NPDE)', cat: 'Diagnostics', def: "Écarts pondérés entre observation et prédiction. On attend un « bruit blanc » centré sur 0 (entre −2 et +2) ; une forme en banane ou en éventail trahit un défaut de modèle." },
  { term: 'VPC', full: 'Visual Predictive Check', cat: 'Diagnostics', def: "Simulation de nombreuses études virtuelles à partir du modèle ajusté ; on vérifie que les percentiles observés tombent dans les intervalles simulés. Le juge visuel du modèle." },
  { term: 'Binning', cat: 'Diagnostics', def: "Regroupement des temps en intervalles pour calculer des percentiles stables sur une VPC. Trop large lisse les problèmes ; trop fin ajoute du bruit." },

  // ── Bayésien & TDM ──────────────────────────────────────────────────────────
  { term: 'Théorème de Bayes', cat: 'Bayésien & TDM', def: "A posteriori ∝ Vraisemblance × A priori. Fondement de l'estimation individuelle : on combine ce que l'on sait de la population et ce que l'on mesure chez le patient." },
  { term: 'A priori / prior', cat: 'Bayésien & TDM', def: "Connaissance préalable, ici le modèle de population (valeurs typiques et variabilité) avant de voir les données du patient." },
  { term: 'A posteriori / posterior', cat: 'Bayésien & TDM', def: "Distribution mise à jour d'un paramètre après avoir observé les données du patient ; fournit l'estimation individuelle avec son incertitude." },
  { term: 'MAP', full: 'Maximum A Posteriori', cat: 'Bayésien & TDM', def: "Valeur la plus probable de la distribution a posteriori ; méthode d'estimation individuelle utilisée en TDM." },
  { term: 'EBE', full: 'Empirical Bayes Estimate', cat: 'Bayésien & TDM', def: "Estimation bayésienne empirique du paramètre individuel (η̂), obtenue en combinant a priori de population et données du patient." },
  { term: 'Shrinkage', cat: 'Bayésien & TDM', def: "Rétrécissement : quand les données individuelles sont pauvres, les EBE sont tirés vers la moyenne de population. Au-delà de ~30 %, les diagnostics basés sur les EBE deviennent trompeurs." },
  { term: 'TDM', full: 'Suivi thérapeutique pharmacologique', cat: 'Bayésien & TDM', def: "Mesurer → Estimer (Bayes) → Ajuster : on interprète une concentration mesurée dans son contexte (dose, horaire) pour individualiser la posologie. Aide à la décision, pas substitut au clinicien." },
  { term: 'Precision dosing', cat: 'Bayésien & TDM', def: "Individualisation de la dose à partir d'un modèle a priori et de quelques prélèvements (ex. package mapbayR), pour maximiser l'efficacité et limiter la toxicité." },

  // ── PK/PD ───────────────────────────────────────────────────────────────────
  { term: 'Emax', cat: 'PK/PD', def: "Effet maximal atteignable : E = E0 + Emax·C/(EC50+C). Au-delà de l'EC50, augmenter la concentration apporte peu d'effet mais peut accroître la toxicité (plateau/saturation)." },
  { term: 'EC50 / CE50', cat: 'PK/PD', def: "Concentration produisant la moitié de l'effet maximal. Mal estimée si les données ne couvrent que 20–80 % de l'effet." },
  { term: 'Coefficient de Hill', full: 'γ, n', cat: 'PK/PD', def: "Facteur de forme de la courbe sigmoïde Emax : plus il est grand, plus la réponse est « tout ou rien » (raide autour de l'EC50)." },
  { term: 'Réponse indirecte / turnover', cat: 'PK/PD', def: "Le médicament agit sur la production (kin) ou l'élimination (kout) d'une variable de réponse : dR/dt = kin − kout·R. Explique un effet retardé (délai PD, non PK)." },
  { term: 'Compartiment d’effet (ke0)', full: 'Modèle de Sheiner', cat: 'PK/PD', def: "Compartiment hypothétique reliant concentration et effet avec un retard d'équilibrage ke0, pour modéliser l'hystérèse entre concentration et effet." },
  { term: 'Hystérèse', cat: 'PK/PD', def: "Boucle observée quand on trace l'effet en fonction de la concentration : le décalage temporel entre PK et PD fait que l'effet « retarde » sur la concentration." },

  // ── IA en pharmacométrie ────────────────────────────────────────────────────
  { term: 'White / black / grey box', cat: 'IA', def: "Modèle mécaniste (white, tout en équations), purement appris (black, réseau de neurones) ou hybride (grey) combinant structure connue et composant flexible." },
  { term: 'Neural ODE', cat: 'IA', def: "Équation différentielle où un réseau de neurones apprend une correction : dA/dt = f_PK(A,θ) + f_NN(A,x). La partie NN doit rester contrainte, vérifiée et interprétée." },
  { term: 'VSURF', cat: 'IA', def: "Sélection de variables par forêts aléatoires : trie des dizaines de covariables et repère les plus influentes, au-delà du forward/backward manuel." },
  { term: 'XGBoost', cat: 'IA', def: "Modèle d'arbres boostés utilisé pour prédire directement une cible (ex. concentration → AUC) sans passer par une équation différentielle." },
  { term: 'Jumeau numérique', cat: 'IA', def: "Réplique virtuelle du patient fusionnant physiologie et IA pour simuler et individualiser (ex. consortium DIGPHAT). Horizon de la pharmacométrie assistée par IA." },

  // ── Outils ──────────────────────────────────────────────────────────────────
  { term: 'NONMEM', cat: 'Outils', def: "Logiciel historique d'estimation PopPK, référence réglementaire, piloté par du code (modèle en langage NM-TRAN)." },
  { term: 'Monolix', cat: 'Outils', def: "Logiciel PopPK à interface graphique, fondé sur l'algorithme SAEM ; adapté à la visualisation et à l'apprentissage." },
  { term: 'nlmixr2 / rxode2', cat: 'Outils', def: "Écosystème open-source en R pour l'estimation (nlmixr2) et la simulation d'EDO (rxode2) de modèles PK/PD à effets mixtes." },
  { term: 'mrgsolve', cat: 'Outils', def: "Package R de simulation rapide de modèles PK/PD par EDO, très utilisé pour les simulations d'essais et le precision dosing." },
  { term: 'Flip-flop', cat: 'Concepts', def: "Situation où l'absorption est plus lente que l'élimination (Ka < ke) : la pente terminale reflète alors l'absorption, faussant l'estimation de la demi-vie d'élimination." }
];

export const glossary = readable(items);
export const glossaryCategories = readable([
  'Fondamentaux', 'Paramètres PK', 'Modèles', 'Approches', 'Variabilité',
  'Covariables', 'Estimation', 'Diagnostics', 'Bayésien & TDM', 'PK/PD', 'IA', 'Outils', 'Concepts'
]);

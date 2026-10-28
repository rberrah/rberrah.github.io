// Audited rationale for each option in every guided multi-select step (FR/EN).
// Indices and correctness remain defined by the activity's `correct` list.
// The learner sees these rationales only after checking correctly or revealing the solution.
export const choiceRationales = {
  "practice-trois-approches": {
    "choice": [
      {
        "fr": "Pour calculer une AUC à partir des prises de sang, il faut suffisamment de mesures dans le temps.",
        "en": "To calculate AUC from blood samples, we need enough measurements over time."
      },
      {
        "fr": "En PopPK, les données d’autres patients aident à estimer les paramètres d’un patient peu prélevé.",
        "en": "In population PK, data from other patients help estimate parameters for a patient with few samples."
      },
      {
        "fr": "La PBPK utilise la physiologie, mais ses prédictions doivent quand même être vérifiées.",
        "en": "PBPK uses physiology, but its predictions still need to be checked."
      }
    ]
  },
  "practice-validation-vpc": {
    "causes": [
      {
        "fr": "Si le modèle prévoit trop peu de différences entre patients, sa zone de prédiction sera trop étroite.",
        "en": "If the model predicts too little variation between patients, its prediction band will be too narrow."
      },
      {
        "fr": "Le problème peut venir des équations ou de la façon dont les patients ont été simulés.",
        "en": "The problem may come from the equations or from how patients were simulated."
      },
      {
        "fr": "Ce graphique ne prouve pas que la clairance est la seule responsable.",
        "en": "This plot does not prove that clearance alone is responsible."
      }
    ]
  },
  "practice-math-stats": {
    "conditions": [
      {
        "fr": "Vérifiez d’abord que les deux calculs ont trouvé une solution stable.",
        "en": "First, check that both calculations reached a stable solution."
      },
      {
        "fr": "Le seuil 3,84 repose sur des hypothèses statistiques. Elles ne sont pas toujours remplies.",
        "en": "The 3.84 threshold relies on statistical assumptions. They do not always hold."
      },
      {
        "fr": "Une variance ne peut pas être négative. Tester si elle vaut zéro demande donc une méthode particulière.",
        "en": "A variance cannot be negative. Testing whether it is zero therefore needs a special method."
      }
    ]
  },
  "practice-nca-absorption": {
    "interval": [
      {
        "fr": "la borne 0,79 est inférieure à la limite 0,80.",
        "en": "the 0.79 bound falls below the 0.80 limit."
      },
      {
        "fr": "le critère concerne l'ensemble de l'intervalle à 90 %, pas seulement l'estimation ponctuelle.",
        "en": "the criterion applies to the entire 90% interval, not just its point estimate."
      },
      {
        "fr": "l'intervalle dépasse une borne du critère préspécifié.",
        "en": "the interval crosses a prespecified acceptance boundary."
      }
    ]
  },
  "practice-pd-tolerance": {
    "hypotheses": [
      {
        "fr": "Le corps peut s’adapter au médicament ou produire une substance qui réduit son effet.",
        "en": "The body may adapt to the drug or produce something that reduces its effect."
      },
      {
        "fr": "L’état du patient a peut-être changé. Une erreur de mesure est aussi possible.",
        "en": "The patient’s condition may have changed. A measurement error is also possible."
      },
      {
        "fr": "Deux mesures ne suffisent pas pour prouver une seule cause. Il faut d’autres données.",
        "en": "Two measurements cannot prove a single cause. More data are needed."
      }
    ]
  },
  "practice-neural-ode": {
    "constraints": [
      {
        "fr": "Ici, un taux d’élimination négatif ferait augmenter le médicament dans le corps sans nouvel apport.",
        "en": "Here, a negative elimination rate would make the drug amount increase without a new input."
      },
      {
        "fr": "Vérifiez aussi que le médicament ne se crée pas tout seul et que le modèle reste plausible hors des données.",
        "en": "Also check that the drug does not appear from nowhere and the model stays plausible beyond the data."
      },
      {
        "fr": "Bien prédire les données utilisées pour apprendre ne garantit pas de bonnes prédictions ailleurs.",
        "en": "Predicting training data well does not guarantee good predictions elsewhere."
      }
    ]
  },
  "practice-ai-trees": {
    "limits": [
      {
        "fr": "Deux arbres peuvent faire les mêmes erreurs. Leur moyenne ne les efface donc pas toujours.",
        "en": "Two trees can make the same mistakes. Averaging them does not always remove those mistakes."
      },
      {
        "fr": "Des arbres qui prédisent des valeurs différentes ne donnent pas automatiquement une marge d’erreur fiable à 95 %.",
        "en": "Different tree predictions do not automatically give a reliable 95% uncertainty range."
      },
      {
        "fr": "Hors des valeurs vues pendant l’entraînement, la forêt ne connaît pas forcément la bonne tendance à suivre.",
        "en": "Beyond values seen during training, the forest may not know which trend to follow."
      }
    ]
  },
  "practice-ai-featselect": {
    "workflow": [
      {
        "fr": "Toutes les mesures d’un patient doivent rester dans le même groupe : entraînement ou test.",
        "en": "All samples from one patient must stay in the same group: training or test."
      },
      {
        "fr": "À chaque test interne, il faut choisir les variables sans regarder les patients testés.",
        "en": "For each internal check, choose features without looking at held-out patients."
      },
      {
        "fr": "Utiliser le test final pour choisir les variables rend le score trop optimiste.",
        "en": "Using the final test to choose features makes its score too optimistic."
      }
    ]
  },
  "practice-ai-llm": {
    "audit": [
      {
        "fr": "une affirmation biomédicale doit pouvoir être rattachée à une source vérifiable.",
        "en": "a biomedical claim needs a verifiable supporting source."
      },
      {
        "fr": "unités, sens physiologique et hypothèses sont à vérifier indépendamment du style du texte.",
        "en": "units, physiological plausibility and assumptions must be checked independently of writing style."
      },
      {
        "fr": "une formulation assurée n'apporte aucune preuve de validité scientifique.",
        "en": "confident wording is not evidence of scientific validity."
      }
    ]
  },
  "practice-valid-gof": {
    "interpret": [
      {
        "fr": "les observations dépassent ici les prédictions, ce qui caractérise une sous-prédiction locale.",
        "en": "observations exceed predictions here, indicating local underprediction."
      },
      {
        "fr": "le graphique seul ne permet pas d'attribuer avec certitude le biais à la clairance.",
        "en": "this plot alone cannot attribute the bias to clearance with certainty."
      },
      {
        "fr": "unités, doses, temps et valeur de référence sont des causes alternatives à contrôler.",
        "en": "units, doses, timing and baseline are alternative causes to check."
      }
    ]
  },
  "practice-valid-vpc": {
    "reading": [
      {
        "fr": "La médiane mesurée est dans la plage simulée : c’est rassurant pour le centre des données.",
        "en": "The measured median lies within the simulated range: reassuring for the center of the data."
      },
      {
        "fr": "Les valeurs les plus élevées sont moins bien reproduites. Il faut chercher pourquoi.",
        "en": "The highest values are less well reproduced. We need to find out why."
      },
      {
        "fr": "Bien prédire la médiane ne prouve pas que les valeurs basses et hautes sont bien prédites.",
        "en": "Predicting the median well does not prove that low and high values are well predicted."
      }
    ]
  },
  "practice-valid-diagnostics": {
    "prioritize": [
      {
        "fr": "Une VPC compare les mesures à des simulations. Vérifiez donc comment ces simulations ont été faites.",
        "en": "A VPC compares measurements with simulations. Check how those simulations were produced."
      },
      {
        "fr": "Quand le shrinkage est important, les paramètres estimés des patients sont attirés vers la moyenne : attention à leur interprétation.",
        "en": "With high shrinkage, estimated patient parameters are drawn toward the average: interpret them carefully."
      },
      {
        "fr": "IPRED mesure l’ajustement chez les patients étudiés, pas la fiabilité chez de nouveaux patients.",
        "en": "IPRED measures fit in the studied patients, not reliability in new patients."
      }
    ]
  },
  "practice-valid-interpretation": {
    "hypotheses": [
      {
        "fr": "une cinétique mal représentée peut produire des écarts dépendant du temps.",
        "en": "misspecified kinetics can produce time-dependent discrepancies."
      },
      {
        "fr": "une erreur d'horodatage ou d'événement peut générer un motif similaire.",
        "en": "incorrect timing or events can generate a similar pattern."
      },
      {
        "fr": "le nombre de mesures ne démontre pas le nombre de compartiments nécessaires.",
        "en": "the number of observations does not prove the required compartment count."
      }
    ]
  },
  "practice-tools-algorithms": {
    "compare": [
      {
        "fr": "Deux logiciels peuvent calculer l’OFV différemment. Vérifiez ce que mesure chaque nombre.",
        "en": "Two programs may calculate OFV differently. Check what each number means."
      },
      {
        "fr": "Comparez les mêmes données et vérifiez que les deux logiciels ont terminé leurs calculs correctement.",
        "en": "Compare the same data and ensure both programs completed their calculations properly."
      },
      {
        "fr": "Changer la couleur des graphiques ne change pas le calcul statistique.",
        "en": "Changing plot colors does not change the statistical calculation."
      }
    ]
  },
  "synthesis-start": {
    "predict": [
      {
        "fr": "à dose identique, l'AUC décroît si la clairance augmente en PK linéaire.",
        "en": "at identical dose, AUC decreases when clearance increases in linear PK."
      },
      {
        "fr": "la réponse PD peut être saturable, retardée ou non proportionnelle à l'AUC.",
        "en": "PD response may be saturable, delayed or nonproportional to AUC."
      },
      {
        "fr": "les couples CL/V du scénario conduisent au même rapport d'élimination.",
        "en": "the scenario's CL/V pairs yield the same elimination-rate ratio."
      }
    ],
    "noise": [
      {
        "fr": "une variation de CL individuelle peut modifier la concentration à dose identique.",
        "en": "individual CL variation can change concentrations at the same dose."
      },
      {
        "fr": "un écart de mesure ou d'heure de prélèvement peut expliquer l'observation.",
        "en": "a measurement or sampling-time error can explain the observation."
      },
      {
        "fr": "la dose, sans autres observations, ne démontre pas une erreur de structure.",
        "en": "dose alone, without other observations, does not prove structural error."
      }
    ]
  },
  "synthesis-math": {
    "uncertainty": [
      {
        "fr": "Pour mesurer l’incertitude, il faut savoir comment les erreurs de mesure se répartissent.",
        "en": "To measure uncertainty, we need to know how measurement errors are distributed."
      },
      {
        "fr": "Le nombre de mesures et les moments où elles sont faites influencent la précision des résultats.",
        "en": "The number and timing of measurements affect precision."
      },
      {
        "fr": "Afficher plus de décimales ne rend pas une estimation plus fiable.",
        "en": "Displaying more decimals does not make an estimate more reliable."
      }
    ]
  },
  "synthesis-nca": {
    "terminal": [
      {
        "fr": "une fraction extrapolée importante indique un mauvais support des données terminales.",
        "en": "a large extrapolated fraction signals inadequate terminal data support."
      },
      {
        "fr": "une biodisponibilité supérieure à 1 n'est pas nécessaire pour expliquer le problème.",
        "en": "bioavailability greater than 1 is not required to explain this issue."
      }
    ]
  },
  "synthesis-pbpk": {
    "mechanism": [
      {
        "fr": "la liaison protéique influe notamment sur la fraction libre et la disposition.",
        "en": "protein binding affects unbound fraction and drug disposition."
      },
      {
        "fr": "débit et clairance intrinsèque conditionnent l'extraction hépatique.",
        "en": "blood flow and intrinsic clearance govern hepatic extraction."
      },
      {
        "fr": "la couleur d'un schéma ne définit aucun mécanisme pharmacocinétique.",
        "en": "a diagram's color is not a pharmacokinetic mechanism."
      }
    ],
    "validate": [
      {
        "fr": "confronter les concentrations totales et libres détecte certaines erreurs de liaison ou distribution.",
        "en": "checking total and free concentrations may reveal binding or distribution errors."
      },
      {
        "fr": "le modèle doit prévoir des observations pertinentes pour la population visée.",
        "en": "the model should predict relevant outcomes in the target population."
      },
      {
        "fr": "une conservation de masse correcte ne démontre pas la validité externe.",
        "en": "correct mass conservation does not establish external validity."
      }
    ]
  },
  "synthesis-pd": {
    "delay": [
      {
        "fr": "Le compartiment d’effet permet de représenter le temps nécessaire au médicament pour atteindre son site d’action.",
        "en": "An effect compartment represents the time a drug needs to reach its site of action."
      },
      {
        "fr": "Une réponse indirecte peut être lente parce que l’organisme doit produire ou éliminer le biomarqueur.",
        "en": "An indirect response can be slow because the body must produce or remove the biomarker."
      },
      {
        "fr": "Un effet immédiat ne suffit pas à expliquer une réponse retardée.",
        "en": "An immediate effect alone cannot explain a delayed response."
      }
    ],
    "choice": [
      {
        "fr": "Il faut comparer les concentrations et les effets au fil du temps, pas seulement à un instant.",
        "en": "Compare concentrations and effects over time, not just at one instant."
      },
      {
        "fr": "Si le modèle prédit des événements, vérifiez si leurs fréquences et leurs risques sont bien estimés.",
        "en": "If the model predicts events, check whether their frequencies and risks are well estimated."
      },
      {
        "fr": "Un AIC faible ne prouve pas que le modèle prédit bien chez de nouveaux patients.",
        "en": "A low AIC does not prove that the model predicts well in new patients."
      }
    ]
  },
  "synthesis-covariates": {
    "eta": [
      {
        "fr": "ETA encode l'écart individuel non expliqué par les effets fixes du modèle.",
        "en": "ETA encodes the individual deviation not explained by model fixed effects."
      },
      {
        "fr": "le DFG est une covariable observée, pas la réalisation d'ETA.",
        "en": "GFR is an observed covariate, not an ETA realization."
      }
    ]
  },
  "synthesis-onco": {
    "dose": [
      {
        "fr": "aucune amélioration de survie ne découle automatiquement d'une augmentation de dose.",
        "en": "improved survival does not automatically follow dose escalation."
      },
      {
        "fr": "réduire la tumeur dans un modèle n'établit pas à lui seul un bénéfice de survie.",
        "en": "modeled tumor shrinkage alone does not establish a survival benefit."
      }
    ],
    "data": [
      {
        "fr": "les trajectoires de taille tumorale renseignent la dynamique de réponse.",
        "en": "tumor-size trajectories inform response dynamics."
      },
      {
        "fr": "les interruptions et changements de dose conditionnent l'exposition réelle.",
        "en": "interruptions and dose changes determine actual exposure."
      },
      {
        "fr": "les dates d'événement et de censure sont nécessaires aux analyses de survie.",
        "en": "event and censoring times are required for survival analysis."
      },
      {
        "fr": "une mesure finale unique efface la dynamique et les événements intermédiaires.",
        "en": "one final measurement discards temporal dynamics and intervening events."
      }
    ]
  },
  "synthesis-mab": {
    "tmdd": [
      {
        "fr": "la saturation d'une voie d'élimination par la cible peut rendre la PK non linéaire.",
        "en": "saturation of target-mediated elimination can produce nonlinear PK."
      },
      {
        "fr": "une clairance constante strictement linéaire ne suffit pas à expliquer une relation non linéaire.",
        "en": "constant, strictly linear clearance alone does not explain nonlinear kinetics."
      }
    ],
    "measure": [
      {
        "fr": "mesurer médicament libre et total peut distinguer des mécanismes de liaison.",
        "en": "measuring free and total drug may distinguish binding mechanisms."
      },
      {
        "fr": "cible et complexes peuvent renseigner les interactions médicament-cible.",
        "en": "target and complexes can inform drug-target interactions."
      },
      {
        "fr": "la chronologie des ADA et leur titre permettent d'étudier une variation de clairance.",
        "en": "ADA timing and titer help investigate clearance changes."
      },
      {
        "fr": "une simple positivité ADA sans chronologie ou méthode ne démontre pas son effet.",
        "en": "ADA positivity alone, without timing or method details, does not prove an effect."
      }
    ]
  },
  "synthesis-ai": {
    "claims": [
      {
        "fr": "Une simulation montre ce qui arrive avec les hypothèses choisies, pas forcément dans la réalité.",
        "en": "A simulation shows what happens under the chosen assumptions, not necessarily in real life."
      },
      {
        "fr": "Un bon score sur des patients simulés ne prouve pas un bénéfice clinique.",
        "en": "A good score in simulated patients does not prove clinical benefit."
      },
      {
        "fr": "Il faut également tester le modèle sur des données indépendantes, idéalement issues de nouveaux patients.",
        "en": "We also need to test the model on independent data, ideally from new patients."
      }
    ]
  },
  "synthesis-valid": {
    "retain": [
      {
        "fr": "l'AIC n'est qu'un élément parmi les diagnostics et la plausibilité.",
        "en": "AIC is only one element alongside diagnostics and plausibility."
      },
      {
        "fr": "un AIC inférieur ne garantit pas une solution convergée ou un modèle utilisable.",
        "en": "lower AIC does not guarantee a converged solution or usable model."
      }
    ],
    "next": [
      {
        "fr": "structure et erreur résiduelle peuvent toutes deux expliquer des écarts diagnostiques.",
        "en": "structure and residual error can both explain diagnostic discrepancies."
      },
      {
        "fr": "une VPC doit reproduire fidèlement le plan de données et peut nécessiter une stratification.",
        "en": "VPC simulations must reproduce the data design and may require stratification."
      },
      {
        "fr": "ignorer la VPC supprime une information prédictive utile.",
        "en": "ignoring VPC discards useful predictive evidence."
      }
    ]
  },
  "synthesis-trials": {
    "pos": [
      {
        "fr": "L’assurance tient compte du fait que l’effet réel du traitement est encore incertain.",
        "en": "Assurance accounts for uncertainty about the treatment’s true effect."
      },
      {
        "fr": "Une fréquence calculée pour un effet supposé connu ne tient pas compte de cette incertitude.",
        "en": "A frequency calculated for a fixed assumed effect does not include that uncertainty."
      }
    ]
  },
  "synthesis-tools": {
    "fixed": [
      {
        "fr": "THETA(1) représente ici la valeur populationnelle de référence.",
        "en": "THETA(1) is the reference population parameter here."
      },
      {
        "fr": "Cl_pop désigne ici la clairance typique du modèle Monolix.",
        "en": "Cl_pop denotes typical clearance in this Monolix model."
      },
      {
        "fr": "exp(tcl) remet un effet fixe logarithmique sur l'échelle naturelle.",
        "en": "exp(tcl) maps a log-scale fixed effect to the natural scale."
      },
      {
        "fr": "EPS(1) correspond ici à l'erreur résiduelle, pas à la clairance typique.",
        "en": "EPS(1) represents residual error here, not typical clearance."
      }
    ],
    "random": [
      {
        "fr": "ETA(1) représente ici un écart individuel dans NONMEM.",
        "en": "ETA(1) represents an individual deviation in NONMEM here."
      },
      {
        "fr": "eta_Cl joue le rôle d'effet individuel dans Monolix.",
        "en": "eta_Cl acts as an individual random effect in Monolix."
      },
      {
        "fr": "eta.cl désigne l'écart individuel dans le code nlmixr2.",
        "en": "eta.cl denotes the individual deviation in nlmixr2 code."
      },
      {
        "fr": "IPRED est une prédiction individuelle, pas le paramètre aléatoire ETA.",
        "en": "IPRED is an individual prediction, not the ETA random effect."
      }
    ],
    "residual": [
      {
        "fr": "EPS et SIGMA définissent ici l'erreur d'observation proportionnelle de NONMEM.",
        "en": "EPS and SIGMA define NONMEM's proportional observation error here."
      },
      {
        "fr": "b et eps paramètrent ici le bruit de mesure Monolix.",
        "en": "b and eps parameterize Monolix observation noise here."
      },
      {
        "fr": "prop(0.15) spécifie ici un terme d'erreur proportionnelle nlmixr2.",
        "en": "prop(0.15) specifies a proportional residual error in nlmixr2 here."
      },
      {
        "fr": "OMEGA et eta.cl décrivent la variabilité entre individus, pas l'erreur résiduelle.",
        "en": "OMEGA and eta.cl describe between-subject variability, not residual error."
      }
    ]
  },
  "cov-dispersion": {
    "predict": [
      {
        "fr": "l'exposant bêta reste inchangé, donc la courbe typique aussi.",
        "en": "beta is unchanged, so the typical curve is unchanged."
      },
      {
        "fr": "omega = 0 supprime la composante ETA de variabilité interindividuelle de ce modèle.",
        "en": "omega = 0 removes this model's ETA between-subject variation."
      },
      {
        "fr": "la relation au poids dépend de bêta, pas d'omega.",
        "en": "the weight relationship depends on beta, not omega."
      },
      {
        "fr": "l'erreur de mesure SIGMA est un autre niveau de variabilité.",
        "en": "measurement error SIGMA is a separate variation component."
      }
    ]
  },
  "cov-threshold": {
    "validation": [
      {
        "fr": "transformations et groupes sont estimés exclusivement sur l'entraînement.",
        "en": "transformations and groups are fitted only to training data."
      },
      {
        "fr": "la règle d'affectation doit être figée avant l'évaluation sur données indépendantes.",
        "en": "the assignment rule must be frozen before independent evaluation."
      },
      {
        "fr": "utiliser l'AUC test pour former les groupes introduit une fuite de données.",
        "en": "using test AUC to form groups causes information leakage."
      },
      {
        "fr": "une validation croisée doit réajuster les étapes apprises dans chaque pli d'entraînement.",
        "en": "cross-validation must refit learned steps within each training fold."
      }
    ]
  },
  "cov-extrapolation": {
    "domain": [
      {
        "fr": "des modèles proches dans le domaine observé peuvent diverger à ses extrêmes.",
        "en": "models close in the observed domain may diverge at the extremes."
      },
      {
        "fr": "une formule concise n'est pas une preuve de validité à 200 kg.",
        "en": "a compact equation is not evidence of validity at 200 kg."
      },
      {
        "fr": "il faut justifier et évaluer séparément l'extrapolation hors domaine.",
        "en": "out-of-domain extrapolation needs separate justification and evaluation."
      },
      {
        "fr": "l'accord entre deux courbes n'évalue pas le bénéfice clinique.",
        "en": "agreement between curves does not evaluate clinical benefit."
      }
    ]
  },
  "cov-symbolic-validation": {
    "split": [
      {
        "fr": "garder tous les prélèvements d'un patient du même côté évite une fuite intra-patient.",
        "en": "keeping one patient's samples in one split prevents within-patient leakage."
      },
      {
        "fr": "choisir l'équation sur le test réutilise indûment le jeu final.",
        "en": "choosing an equation with the test set improperly reuses the final set."
      },
      {
        "fr": "toute standardisation ou sélection doit être apprise sur l'entraînement.",
        "en": "all standardization or selection must be fitted on training only."
      },
      {
        "fr": "figer la formule avant le test protège la validité de l'évaluation.",
        "en": "freezing the formula before testing protects evaluation validity."
      }
    ]
  },
  "cov-code-check": {
    "bugs": [
      {
        "fr": "le poids est en kilogrammes dans ce contrat, pas en minutes.",
        "en": "weight is measured in kilograms in this contract, not minutes."
      },
      {
        "fr": "le dénominateur 70 doit être dans la puissance pour calculer (WT/70)^0,75.",
        "en": "70 must be inside the power to compute (WT/70)^0.75."
      },
      {
        "fr": "le contrat impose ici que le génotype agisse sur CL, pas sur V.",
        "en": "this contract specifies a genotype effect on CL, not V."
      },
      {
        "fr": "CL et V peuvent avoir des exposants allométriques différents.",
        "en": "CL and V can have different allometric exponents."
      }
    ]
  },
  "cov-omega-time": {
    "time": [
      {
        "fr": "à 6 h, une mesure réalisée à 12 h appartient encore au futur.",
        "en": "at 6 hours, a sample at 12 hours is still in the future."
      },
      {
        "fr": "le report de la dernière valeur connue est une hypothèse utilisable si elle est déclarée.",
        "en": "carrying the last observed value forward is an option if disclosed."
      },
      {
        "fr": "une interpolation mobilisant la mesure future entraînerait une fuite pour une prédiction à 6 h.",
        "en": "interpolation using a future value would leak information for a 6-hour prediction."
      },
      {
        "fr": "LOCF est une convention de modélisation, pas la preuve d'une fonction d'organe constante.",
        "en": "LOCF is a modeling convention, not evidence of constant organ function."
      }
    ]
  },
  "practice-nonmem-moteur": {
    "checks": [
      {
        "fr": "les points de départ et limites numériques peuvent influencer l'optimum trouvé.",
        "en": "starting values and numerical bounds can affect the fitted optimum."
      },
      {
        "fr": "diagnostics et stabilité permettent de juger la fiabilité d'une solution.",
        "en": "diagnostics and numerical stability help assess solution reliability."
      },
      {
        "fr": "la dernière exécution peut être non convergée ou dominée par un optimum local.",
        "en": "the last execution may be nonconverged or trapped at a local optimum."
      }
    ]
  },
  "practice-monolix-moteur": {
    "checks": [
      {
        "fr": "les points de départ et limites numériques peuvent influencer l'optimum trouvé.",
        "en": "starting values and numerical bounds can affect the fitted optimum."
      },
      {
        "fr": "diagnostics et stabilité permettent de juger la fiabilité d'une solution.",
        "en": "diagnostics and numerical stability help assess solution reliability."
      },
      {
        "fr": "la dernière exécution peut être non convergée ou dominée par un optimum local.",
        "en": "the last execution may be nonconverged or trapped at a local optimum."
      }
    ]
  },
  "practice-nlmixr2-moteur": {
    "checks": [
      {
        "fr": "les points de départ et limites numériques peuvent influencer l'optimum trouvé.",
        "en": "starting values and numerical bounds can affect the fitted optimum."
      },
      {
        "fr": "diagnostics et stabilité permettent de juger la fiabilité d'une solution.",
        "en": "diagnostics and numerical stability help assess solution reliability."
      },
      {
        "fr": "la dernière exécution peut être non convergée ou dominée par un optimum local.",
        "en": "the last execution may be nonconverged or trapped at a local optimum."
      }
    ]
  }
};

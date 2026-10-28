// Audited rationale for each option in every guided multi-select step (FR/EN).
// Indices and correctness remain defined by the activity's `correct` list.
// The learner sees these rationales only after checking correctly or revealing the solution.
export const choiceRationales = {
  "practice-trois-approches": {
    "choice": [
      {
        "fr": "Oui : la qualité et la durée des prélèvements conditionnent l'AUC estimée sans modèle.",
        "en": "Yes: sampling quality and duration condition model-independent AUC estimation."
      },
      {
        "fr": "Oui : les effets mixtes exploitent l'information collective pour les profils individuels clairsemés.",
        "en": "Yes: mixed-effects methods borrow information across patients for sparse individual profiles."
      },
      {
        "fr": "Non : une extrapolation PBPK dépend des paramètres physiologiques et de la vérification des hypothèses.",
        "en": "No: PBPK extrapolation depends on physiological parameters and verified assumptions."
      }
    ]
  },
  "practice-validation-vpc": {
    "causes": [
      {
        "fr": "Oui : une variabilité trop faible rend les bandes prédictives artificiellement étroites.",
        "en": "Yes: underestimated variability makes predictive bands artificially narrow."
      },
      {
        "fr": "Oui : une mauvaise structure ou une simulation non conforme au plan d'étude peut dégrader la couverture.",
        "en": "Yes: structural misspecification or incorrect simulation design may impair coverage."
      },
      {
        "fr": "Non : le défaut de couverture ne désigne pas une valeur précise de clairance.",
        "en": "No: inadequate coverage does not identify a specific clearance error."
      }
    ]
  },
  "practice-math-stats": {
    "conditions": [
      {
        "fr": "Oui : un optimum non convergé ne permet pas de comparer valablement deux vraisemblances.",
        "en": "Yes: nonconverged optima cannot support a valid likelihood comparison."
      },
      {
        "fr": "Oui : les approximations asymptotiques dépendent de conditions de régularité.",
        "en": "Yes: asymptotic approximations require regularity conditions."
      },
      {
        "fr": "Non : tester une variance nulle pose un problème de frontière ; le seuil usuel n'est pas automatique.",
        "en": "No: testing zero variance is a boundary problem; the usual threshold need not apply."
      }
    ]
  },
  "practice-nca-absorption": {
    "interval": [
      {
        "fr": "Oui : la borne 0,79 est inférieure à la limite 0,80.",
        "en": "Yes: the 0.79 bound falls below the 0.80 limit."
      },
      {
        "fr": "Non : le critère concerne l'ensemble de l'intervalle à 90 %, pas seulement l'estimation ponctuelle.",
        "en": "No: the criterion applies to the entire 90% interval, not just its point estimate."
      },
      {
        "fr": "Oui : l'intervalle dépasse une borne du critère préspécifié.",
        "en": "Yes: the interval crosses a prespecified acceptance boundary."
      }
    ]
  },
  "practice-pd-tolerance": {
    "hypotheses": [
      {
        "fr": "Oui : une adaptation ou un médiateur antagoniste peut diminuer l'effet à concentration identique.",
        "en": "Yes: adaptation or an antagonistic mediator can reduce effect at the same concentration."
      },
      {
        "fr": "Oui : antécédents, évolution de la maladie et erreur de mesure sont des explications concurrentes.",
        "en": "Yes: history, disease evolution and measurement error are alternative explanations."
      },
      {
        "fr": "Non : deux observations ne permettent pas d'identifier à elles seules un mécanisme unique.",
        "en": "No: two observations alone cannot identify a unique mechanism."
      }
    ]
  },
  "practice-neural-ode": {
    "constraints": [
      {
        "fr": "Oui : un taux d'élimination négatif produirait un flux d'accumulation sans entrée.",
        "en": "Yes: a negative elimination rate would create accumulation without input."
      },
      {
        "fr": "Oui : bilans et extrapolation doivent être contrôlés au-delà de l'ajustement local.",
        "en": "Yes: balances and extrapolation require checks beyond local fit."
      },
      {
        "fr": "Non : une faible erreur d'entraînement ne garantit ni admissibilité physique ni généralisation.",
        "en": "No: low training error guarantees neither physical admissibility nor generalization."
      }
    ]
  },
  "practice-ai-trees": {
    "limits": [
      {
        "fr": "Oui : les prédictions des arbres peuvent rester corrélées malgré le bootstrap ; le gain de variance en dépend.",
        "en": "Yes: tree predictions may remain correlated despite bootstrapping; variance reduction depends on this."
      },
      {
        "fr": "Non : la dispersion entre arbres n'est pas un intervalle de confiance à 95 % calibré pour un patient.",
        "en": "No: between-tree spread is not a calibrated patient-level 95% confidence interval."
      },
      {
        "fr": "Oui : la moyenne des arbres n'impose aucune contrainte mécanistique sur les valeurs hors domaine.",
        "en": "Yes: averaging trees imposes no mechanistic constraint on out-of-domain predictions."
      }
    ]
  },
  "practice-ai-featselect": {
    "workflow": [
      {
        "fr": "Oui : séparer par patient évite que ses autres prélèvements contaminent le test.",
        "en": "Yes: splitting by patient prevents that patient's other samples leaking into testing."
      },
      {
        "fr": "Oui : la sélection doit être refaite à l'intérieur de chaque pli d'apprentissage.",
        "en": "Yes: feature selection must be refit inside each training fold."
      },
      {
        "fr": "Non : exploiter le test final pour sélectionner les variables biaise son estimation de performance.",
        "en": "No: using the final test to select features biases its performance estimate."
      }
    ]
  },
  "practice-ai-llm": {
    "audit": [
      {
        "fr": "Oui : une affirmation biomédicale doit pouvoir être rattachée à une source vérifiable.",
        "en": "Yes: a biomedical claim needs a verifiable supporting source."
      },
      {
        "fr": "Oui : unités, sens physiologique et hypothèses sont à vérifier indépendamment du style du texte.",
        "en": "Yes: units, physiological plausibility and assumptions must be checked independently of writing style."
      },
      {
        "fr": "Non : une formulation assurée n'apporte aucune preuve de validité scientifique.",
        "en": "No: confident wording is not evidence of scientific validity."
      }
    ]
  },
  "practice-valid-gof": {
    "interpret": [
      {
        "fr": "Oui : les observations dépassent ici les prédictions, ce qui caractérise une sous-prédiction locale.",
        "en": "Yes: observations exceed predictions here, indicating local underprediction."
      },
      {
        "fr": "Non : le graphique seul ne permet pas d'attribuer avec certitude le biais à la clairance.",
        "en": "No: this plot alone cannot attribute the bias to clearance with certainty."
      },
      {
        "fr": "Oui : unités, doses, temps et valeur de référence sont des causes alternatives à contrôler.",
        "en": "Yes: units, doses, timing and baseline are alternative causes to check."
      }
    ]
  },
  "practice-valid-vpc": {
    "reading": [
      {
        "fr": "Oui : la médiane observée se situe dans l'intervalle simulé pour cette statistique.",
        "en": "Yes: the observed median lies within the simulated interval for that statistic."
      },
      {
        "fr": "Oui : un désaccord en queue haute peut révéler un problème de dispersion ou de modèle.",
        "en": "Yes: high-tail disagreement may reveal a spread or model problem."
      },
      {
        "fr": "Non : la couverture de la médiane ne valide pas les autres quantiles.",
        "en": "No: median coverage does not validate other quantiles."
      }
    ]
  },
  "practice-valid-diagnostics": {
    "prioritize": [
      {
        "fr": "Oui : une VPC doit être lue avec le plan de simulation qui l'a produite.",
        "en": "Yes: a VPC must be interpreted with its simulation design."
      },
      {
        "fr": "Oui : les EBE fortement shrinkés ne reflètent pas fidèlement la variabilité individuelle.",
        "en": "Yes: heavily shrunken EBEs do not faithfully reflect individual variability."
      },
      {
        "fr": "Non : IPRED mesure l'ajustement individuel, pas l'intégralité des propriétés prédictives du modèle.",
        "en": "No: IPRED assesses individual fit, not the model's full predictive behavior."
      }
    ]
  },
  "practice-valid-interpretation": {
    "hypotheses": [
      {
        "fr": "Oui : une cinétique mal représentée peut produire des écarts dépendant du temps.",
        "en": "Yes: misspecified kinetics can produce time-dependent discrepancies."
      },
      {
        "fr": "Oui : une erreur d'horodatage ou d'événement peut générer un motif similaire.",
        "en": "Yes: incorrect timing or events can generate a similar pattern."
      },
      {
        "fr": "Non : le nombre de mesures ne démontre pas le nombre de compartiments nécessaires.",
        "en": "No: the number of observations does not prove the required compartment count."
      }
    ]
  },
  "practice-tools-algorithms": {
    "compare": [
      {
        "fr": "Oui : les constantes incluses dans l'objectif et sa définition influencent la comparaison des OFV.",
        "en": "Yes: objective-function definitions and included constants affect OFV comparisons."
      },
      {
        "fr": "Oui : il faut comparer les ajustements sur les mêmes données, sous contraintes et convergences compatibles.",
        "en": "Yes: fits should use comparable data, constraints and convergence criteria."
      },
      {
        "fr": "Non : l'aspect graphique ne modifie pas la vraisemblance calculée.",
        "en": "No: plot colors do not change the computed likelihood."
      }
    ]
  },
  "synthesis-start": {
    "predict": [
      {
        "fr": "Oui : à dose identique, l'AUC décroît si la clairance augmente en PK linéaire.",
        "en": "Yes: at identical dose, AUC decreases when clearance increases in linear PK."
      },
      {
        "fr": "Non : la réponse PD peut être saturable, retardée ou non proportionnelle à l'AUC.",
        "en": "No: PD response may be saturable, delayed or nonproportional to AUC."
      },
      {
        "fr": "Oui : les couples CL/V du scénario conduisent au même rapport d'élimination.",
        "en": "Yes: the scenario's CL/V pairs yield the same elimination-rate ratio."
      }
    ],
    "noise": [
      {
        "fr": "Oui : une variation de CL individuelle peut modifier la concentration à dose identique.",
        "en": "Yes: individual CL variation can change concentrations at the same dose."
      },
      {
        "fr": "Oui : un écart de mesure ou d'heure de prélèvement peut expliquer l'observation.",
        "en": "Yes: a measurement or sampling-time error can explain the observation."
      },
      {
        "fr": "Non : la dose, sans autres observations, ne démontre pas une erreur de structure.",
        "en": "No: dose alone, without other observations, does not prove structural error."
      }
    ]
  },
  "synthesis-math": {
    "uncertainty": [
      {
        "fr": "Oui : la distribution des erreurs conditionne la vraisemblance et l'incertitude.",
        "en": "Yes: error distribution governs the likelihood and uncertainty."
      },
      {
        "fr": "Oui : les observations et leur plan de collecte déterminent l'information disponible.",
        "en": "Yes: observations and their collection design determine the available information."
      },
      {
        "fr": "Non : afficher davantage de chiffres ne quantifie aucune incertitude.",
        "en": "No: extra decimal places do not quantify uncertainty."
      }
    ]
  },
  "synthesis-nca": {
    "terminal": [
      {
        "fr": "Oui : une fraction extrapolée importante indique un mauvais support des données terminales.",
        "en": "Yes: a large extrapolated fraction signals inadequate terminal data support."
      },
      {
        "fr": "Non : une biodisponibilité supérieure à 1 n'est pas nécessaire pour expliquer le problème.",
        "en": "No: bioavailability greater than 1 is not required to explain this issue."
      }
    ]
  },
  "synthesis-pbpk": {
    "mechanism": [
      {
        "fr": "Oui : la liaison protéique influe notamment sur la fraction libre et la disposition.",
        "en": "Yes: protein binding affects unbound fraction and drug disposition."
      },
      {
        "fr": "Oui : débit et clairance intrinsèque conditionnent l'extraction hépatique.",
        "en": "Yes: blood flow and intrinsic clearance govern hepatic extraction."
      },
      {
        "fr": "Non : la couleur d'un schéma ne définit aucun mécanisme pharmacocinétique.",
        "en": "No: a diagram's color is not a pharmacokinetic mechanism."
      }
    ],
    "validate": [
      {
        "fr": "Oui : confronter les concentrations totales et libres détecte certaines erreurs de liaison ou distribution.",
        "en": "Yes: checking total and free concentrations may reveal binding or distribution errors."
      },
      {
        "fr": "Oui : le modèle doit prévoir des observations pertinentes pour la population visée.",
        "en": "Yes: the model should predict relevant outcomes in the target population."
      },
      {
        "fr": "Non : une conservation de masse correcte ne démontre pas la validité externe.",
        "en": "No: correct mass conservation does not establish external validity."
      }
    ]
  },
  "synthesis-pd": {
    "delay": [
      {
        "fr": "Oui : un compartiment d'effet introduit une cinétique d'équilibration vers le site d'action.",
        "en": "Yes: an effect compartment introduces equilibration kinetics toward the effect site."
      },
      {
        "fr": "Oui : la réponse indirecte introduit un turnover physiologique susceptible de retarder le signal.",
        "en": "Yes: indirect response introduces physiological turnover that can delay the signal."
      },
      {
        "fr": "Non : un effet direct instantané ne décrit pas à lui seul un retard du biomarqueur.",
        "en": "No: instantaneous direct effect alone cannot describe a biomarker delay."
      }
    ],
    "choice": [
      {
        "fr": "Oui : il faut examiner conjointement les profils temporels des concentrations et effets.",
        "en": "Yes: temporal PK and PD profiles must be assessed together."
      },
      {
        "fr": "Oui : si des événements sont prédits, leur calibration et leur discrimination doivent être étudiées.",
        "en": "Yes: if events are predicted, their calibration and discrimination need assessment."
      },
      {
        "fr": "Non : l'AIC seul ne renseigne pas suffisamment sur la prédiction et la plausibilité.",
        "en": "No: AIC alone does not adequately assess prediction and plausibility."
      }
    ]
  },
  "synthesis-covariates": {
    "eta": [
      {
        "fr": "Oui : ETA encode l'écart individuel non expliqué par les effets fixes du modèle.",
        "en": "Yes: ETA encodes the individual deviation not explained by model fixed effects."
      },
      {
        "fr": "Non : le DFG est une covariable observée, pas la réalisation d'ETA.",
        "en": "No: GFR is an observed covariate, not an ETA realization."
      }
    ]
  },
  "synthesis-onco": {
    "dose": [
      {
        "fr": "Oui : aucune amélioration de survie ne découle automatiquement d'une augmentation de dose.",
        "en": "Yes: improved survival does not automatically follow dose escalation."
      },
      {
        "fr": "Non : réduire la tumeur dans un modèle n'établit pas à lui seul un bénéfice de survie.",
        "en": "No: modeled tumor shrinkage alone does not establish a survival benefit."
      }
    ],
    "data": [
      {
        "fr": "Oui : les trajectoires de taille tumorale renseignent la dynamique de réponse.",
        "en": "Yes: tumor-size trajectories inform response dynamics."
      },
      {
        "fr": "Oui : les interruptions et changements de dose conditionnent l'exposition réelle.",
        "en": "Yes: interruptions and dose changes determine actual exposure."
      },
      {
        "fr": "Oui : les dates d'événement et de censure sont nécessaires aux analyses de survie.",
        "en": "Yes: event and censoring times are required for survival analysis."
      },
      {
        "fr": "Non : une mesure finale unique efface la dynamique et les événements intermédiaires.",
        "en": "No: one final measurement discards temporal dynamics and intervening events."
      }
    ]
  },
  "synthesis-mab": {
    "tmdd": [
      {
        "fr": "Oui : la saturation d'une voie d'élimination par la cible peut rendre la PK non linéaire.",
        "en": "Yes: saturation of target-mediated elimination can produce nonlinear PK."
      },
      {
        "fr": "Non : une clairance constante strictement linéaire ne suffit pas à expliquer une relation non linéaire.",
        "en": "No: constant, strictly linear clearance alone does not explain nonlinear kinetics."
      }
    ],
    "measure": [
      {
        "fr": "Oui : mesurer médicament libre et total peut distinguer des mécanismes de liaison.",
        "en": "Yes: measuring free and total drug may distinguish binding mechanisms."
      },
      {
        "fr": "Oui : cible et complexes peuvent renseigner les interactions médicament-cible.",
        "en": "Yes: target and complexes can inform drug-target interactions."
      },
      {
        "fr": "Oui : la chronologie des ADA et leur titre permettent d'étudier une variation de clairance.",
        "en": "Yes: ADA timing and titer help investigate clearance changes."
      },
      {
        "fr": "Non : une simple positivité ADA sans chronologie ou méthode ne démontre pas son effet.",
        "en": "No: ADA positivity alone, without timing or method details, does not prove an effect."
      }
    ]
  },
  "synthesis-ai": {
    "claims": [
      {
        "fr": "Oui : une simulation démontre au mieux un résultat conditionnel au générateur et au protocole.",
        "en": "Yes: simulation demonstrates at most a result conditional on generator and protocol."
      },
      {
        "fr": "Non : une performance simulée ne démontre aucun bénéfice clinique prospectif.",
        "en": "No: simulated performance does not establish prospective clinical benefit."
      },
      {
        "fr": "Oui : la généralisation doit être évaluée sur des données indépendantes pertinentes.",
        "en": "Yes: generalization needs evaluation on relevant independent data."
      }
    ]
  },
  "synthesis-valid": {
    "retain": [
      {
        "fr": "Oui : l'AIC n'est qu'un élément parmi les diagnostics et la plausibilité.",
        "en": "Yes: AIC is only one element alongside diagnostics and plausibility."
      },
      {
        "fr": "Non : un AIC inférieur ne garantit pas une solution convergée ou un modèle utilisable.",
        "en": "No: lower AIC does not guarantee a converged solution or usable model."
      }
    ],
    "next": [
      {
        "fr": "Oui : structure et erreur résiduelle peuvent toutes deux expliquer des écarts diagnostiques.",
        "en": "Yes: structure and residual error can both explain diagnostic discrepancies."
      },
      {
        "fr": "Oui : une VPC doit reproduire fidèlement le plan de données et peut nécessiter une stratification.",
        "en": "Yes: VPC simulations must reproduce the data design and may require stratification."
      },
      {
        "fr": "Non : ignorer la VPC supprime une information prédictive utile.",
        "en": "No: ignoring VPC discards useful predictive evidence."
      }
    ]
  },
  "synthesis-trials": {
    "pos": [
      {
        "fr": "Oui : l'assurance intègre l'incertitude pertinente sur l'effet dans la probabilité de succès.",
        "en": "Yes: assurance integrates relevant effect uncertainty into success probability."
      },
      {
        "fr": "Non : une fréquence sous paramètres fixés correspond à une probabilité conditionnelle, pas automatiquement à l'assurance.",
        "en": "No: frequencies under fixed parameters are conditional probabilities, not automatically assurance."
      }
    ]
  },
  "synthesis-tools": {
    "fixed": [
      {
        "fr": "Oui : THETA(1) représente ici la valeur populationnelle de référence.",
        "en": "Yes: THETA(1) is the reference population parameter here."
      },
      {
        "fr": "Oui : Cl_pop désigne ici la clairance typique du modèle Monolix.",
        "en": "Yes: Cl_pop denotes typical clearance in this Monolix model."
      },
      {
        "fr": "Oui : exp(tcl) remet un effet fixe logarithmique sur l'échelle naturelle.",
        "en": "Yes: exp(tcl) maps a log-scale fixed effect to the natural scale."
      },
      {
        "fr": "Non : EPS(1) correspond ici à l'erreur résiduelle, pas à la clairance typique.",
        "en": "No: EPS(1) represents residual error here, not typical clearance."
      }
    ],
    "random": [
      {
        "fr": "Oui : ETA(1) représente ici un écart individuel dans NONMEM.",
        "en": "Yes: ETA(1) represents an individual deviation in NONMEM here."
      },
      {
        "fr": "Oui : eta_Cl joue le rôle d'effet individuel dans Monolix.",
        "en": "Yes: eta_Cl acts as an individual random effect in Monolix."
      },
      {
        "fr": "Oui : eta.cl désigne l'écart individuel dans le code nlmixr2.",
        "en": "Yes: eta.cl denotes the individual deviation in nlmixr2 code."
      },
      {
        "fr": "Non : IPRED est une prédiction individuelle, pas le paramètre aléatoire ETA.",
        "en": "No: IPRED is an individual prediction, not the ETA random effect."
      }
    ],
    "residual": [
      {
        "fr": "Oui : EPS et SIGMA définissent ici l'erreur d'observation proportionnelle de NONMEM.",
        "en": "Yes: EPS and SIGMA define NONMEM's proportional observation error here."
      },
      {
        "fr": "Oui : b et eps paramètrent ici le bruit de mesure Monolix.",
        "en": "Yes: b and eps parameterize Monolix observation noise here."
      },
      {
        "fr": "Oui : prop(0.15) spécifie ici un terme d'erreur proportionnelle nlmixr2.",
        "en": "Yes: prop(0.15) specifies a proportional residual error in nlmixr2 here."
      },
      {
        "fr": "Non : OMEGA et eta.cl décrivent la variabilité entre individus, pas l'erreur résiduelle.",
        "en": "No: OMEGA and eta.cl describe between-subject variability, not residual error."
      }
    ]
  },
  "cov-dispersion": {
    "predict": [
      {
        "fr": "Oui : l'exposant bêta reste inchangé, donc la courbe typique aussi.",
        "en": "Yes: beta is unchanged, so the typical curve is unchanged."
      },
      {
        "fr": "Oui : omega = 0 supprime la composante ETA de variabilité interindividuelle de ce modèle.",
        "en": "Yes: omega = 0 removes this model's ETA between-subject variation."
      },
      {
        "fr": "Non : la relation au poids dépend de bêta, pas d'omega.",
        "en": "No: the weight relationship depends on beta, not omega."
      },
      {
        "fr": "Non : l'erreur de mesure SIGMA est un autre niveau de variabilité.",
        "en": "No: measurement error SIGMA is a separate variation component."
      }
    ]
  },
  "cov-threshold": {
    "validation": [
      {
        "fr": "Oui : transformations et groupes sont estimés exclusivement sur l'entraînement.",
        "en": "Yes: transformations and groups are fitted only to training data."
      },
      {
        "fr": "Oui : la règle d'affectation doit être figée avant l'évaluation sur données indépendantes.",
        "en": "Yes: the assignment rule must be frozen before independent evaluation."
      },
      {
        "fr": "Non : utiliser l'AUC test pour former les groupes introduit une fuite de données.",
        "en": "No: using test AUC to form groups causes information leakage."
      },
      {
        "fr": "Oui : une validation croisée doit réajuster les étapes apprises dans chaque pli d'entraînement.",
        "en": "Yes: cross-validation must refit learned steps within each training fold."
      }
    ]
  },
  "cov-extrapolation": {
    "domain": [
      {
        "fr": "Oui : des modèles proches dans le domaine observé peuvent diverger à ses extrêmes.",
        "en": "Yes: models close in the observed domain may diverge at the extremes."
      },
      {
        "fr": "Non : une formule concise n'est pas une preuve de validité à 200 kg.",
        "en": "No: a compact equation is not evidence of validity at 200 kg."
      },
      {
        "fr": "Oui : il faut justifier et évaluer séparément l'extrapolation hors domaine.",
        "en": "Yes: out-of-domain extrapolation needs separate justification and evaluation."
      },
      {
        "fr": "Non : l'accord entre deux courbes n'évalue pas le bénéfice clinique.",
        "en": "No: agreement between curves does not evaluate clinical benefit."
      }
    ]
  },
  "cov-symbolic-validation": {
    "split": [
      {
        "fr": "Oui : garder tous les prélèvements d'un patient du même côté évite une fuite intra-patient.",
        "en": "Yes: keeping one patient's samples in one split prevents within-patient leakage."
      },
      {
        "fr": "Non : choisir l'équation sur le test réutilise indûment le jeu final.",
        "en": "No: choosing an equation with the test set improperly reuses the final set."
      },
      {
        "fr": "Oui : toute standardisation ou sélection doit être apprise sur l'entraînement.",
        "en": "Yes: all standardization or selection must be fitted on training only."
      },
      {
        "fr": "Oui : figer la formule avant le test protège la validité de l'évaluation.",
        "en": "Yes: freezing the formula before testing protects evaluation validity."
      }
    ]
  },
  "cov-code-check": {
    "bugs": [
      {
        "fr": "Non : le poids est en kilogrammes dans ce contrat, pas en minutes.",
        "en": "No: weight is measured in kilograms in this contract, not minutes."
      },
      {
        "fr": "Oui : le dénominateur 70 doit être dans la puissance pour calculer (WT/70)^0,75.",
        "en": "Yes: 70 must be inside the power to compute (WT/70)^0.75."
      },
      {
        "fr": "Oui : le contrat impose ici que le génotype agisse sur CL, pas sur V.",
        "en": "Yes: this contract specifies a genotype effect on CL, not V."
      },
      {
        "fr": "Non : CL et V peuvent avoir des exposants allométriques différents.",
        "en": "No: CL and V can have different allometric exponents."
      }
    ]
  },
  "cov-omega-time": {
    "time": [
      {
        "fr": "Non : à 6 h, une mesure réalisée à 12 h appartient encore au futur.",
        "en": "No: at 6 hours, a sample at 12 hours is still in the future."
      },
      {
        "fr": "Oui : le report de la dernière valeur connue est une hypothèse utilisable si elle est déclarée.",
        "en": "Yes: carrying the last observed value forward is an option if disclosed."
      },
      {
        "fr": "Oui : une interpolation mobilisant la mesure future entraînerait une fuite pour une prédiction à 6 h.",
        "en": "Yes: interpolation using a future value would leak information for a 6-hour prediction."
      },
      {
        "fr": "Non : LOCF est une convention de modélisation, pas la preuve d'une fonction d'organe constante.",
        "en": "No: LOCF is a modeling convention, not evidence of constant organ function."
      }
    ]
  },
  "practice-nonmem-moteur": {
    "checks": [
      {
        "fr": "Oui : les points de départ et limites numériques peuvent influencer l'optimum trouvé.",
        "en": "Yes: starting values and numerical bounds can affect the fitted optimum."
      },
      {
        "fr": "Oui : diagnostics et stabilité permettent de juger la fiabilité d'une solution.",
        "en": "Yes: diagnostics and numerical stability help assess solution reliability."
      },
      {
        "fr": "Non : la dernière exécution peut être non convergée ou dominée par un optimum local.",
        "en": "No: the last execution may be nonconverged or trapped at a local optimum."
      }
    ]
  },
  "practice-monolix-moteur": {
    "checks": [
      {
        "fr": "Oui : les points de départ et limites numériques peuvent influencer l'optimum trouvé.",
        "en": "Yes: starting values and numerical bounds can affect the fitted optimum."
      },
      {
        "fr": "Oui : diagnostics et stabilité permettent de juger la fiabilité d'une solution.",
        "en": "Yes: diagnostics and numerical stability help assess solution reliability."
      },
      {
        "fr": "Non : la dernière exécution peut être non convergée ou dominée par un optimum local.",
        "en": "No: the last execution may be nonconverged or trapped at a local optimum."
      }
    ]
  },
  "practice-nlmixr2-moteur": {
    "checks": [
      {
        "fr": "Oui : les points de départ et limites numériques peuvent influencer l'optimum trouvé.",
        "en": "Yes: starting values and numerical bounds can affect the fitted optimum."
      },
      {
        "fr": "Oui : diagnostics et stabilité permettent de juger la fiabilité d'une solution.",
        "en": "Yes: diagnostics and numerical stability help assess solution reliability."
      },
      {
        "fr": "Non : la dernière exécution peut être non convergée ou dominée par un optimum local.",
        "en": "No: the last execution may be nonconverged or trapped at a local optimum."
      }
    ]
  }
};

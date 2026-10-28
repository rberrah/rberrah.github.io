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
        "fr": "À dose identique, si le corps élimine le médicament plus vite, l'exposition totale diminue.",
        "en": "At the same dose, faster drug elimination means lower total exposure."
      },
      {
        "fr": "L'effet ne suit pas forcément l'AUC : il peut atteindre un maximum ou apparaître plus tard.",
        "en": "Effect does not always follow AUC: it may reach a maximum or appear later."
      },
      {
        "fr": "Les deux rapports CL/V sont égaux : la vitesse de diminution après un bolus IV est donc identique.",
        "en": "Both CL/V ratios are equal: the decline rate after an IV bolus is therefore the same."
      }
    ],
    "noise": [
      {
        "fr": "Deux patients peuvent avoir des clairances différentes et donc des concentrations différentes.",
        "en": "Two patients may have different clearances, leading to different concentrations."
      },
      {
        "fr": "Un prélèvement pris trop tôt ou une erreur de mesure peuvent expliquer la valeur élevée.",
        "en": "A sample taken too early or a measurement error may explain the high value."
      },
      {
        "fr": "Connaître la dose ne suffit pas à prouver que le modèle est faux.",
        "en": "Knowing the dose alone is not enough to prove that the model is wrong."
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
        "fr": "Si une grande partie de l'AUC est calculée après le dernier prélèvement, le résultat dépend beaucoup d'une extrapolation.",
        "en": "If much of the AUC is calculated beyond the last sample, the result depends heavily on extrapolation."
      },
      {
        "fr": "Le problème est le manque de données en fin de courbe, pas la nécessité d'une biodisponibilité supérieure à 100 %.",
        "en": "The problem is missing late samples, not any need for bioavailability above 100%."
      }
    ]
  },
  "synthesis-pbpk": {
    "mechanism": [
      {
        "fr": "Seule une partie du médicament circule librement : la liaison aux protéines modifie cette fraction.",
        "en": "Only part of the drug circulates freely: protein binding changes that fraction."
      },
      {
        "fr": "Le débit sanguin et la capacité du foie à éliminer le médicament influencent son extraction.",
        "en": "Blood flow and the liver's ability to remove the drug affect hepatic extraction."
      },
      {
        "fr": "La couleur d'un dessin ne change pas ce qui se passe dans le corps.",
        "en": "The color of a diagram does not change what happens in the body."
      }
    ],
    "validate": [
      {
        "fr": "Quand les mesures existent, comparez les concentrations totales et libres aux prédictions du modèle.",
        "en": "When available, compare measured total and unbound concentrations with model predictions."
      },
      {
        "fr": "Le modèle doit être confronté à des données de la population dans laquelle il sera utilisé.",
        "en": "Test the model against data from the population in which it will be used."
      },
      {
        "fr": "Un modèle peut conserver correctement la quantité de médicament tout en prédisant mal les concentrations.",
        "en": "A model can conserve drug amount correctly and still predict concentrations poorly."
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
        "fr": "ETA représente ce qui distingue encore un patient de la valeur attendue après prise en compte des covariables.",
        "en": "ETA represents the patient's remaining deviation from the expected value after accounting for covariates."
      },
      {
        "fr": "Le DFG est une mesure de fonction rénale. Il ne correspond pas à l'effet aléatoire ETA.",
        "en": "GFR is a measure of kidney function. It is not the random effect ETA."
      }
    ]
  },
  "synthesis-onco": {
    "dose": [
      {
        "fr": "Augmenter la dose peut aussi augmenter la toxicité. La survie ne s'améliore donc pas automatiquement.",
        "en": "A higher dose can also increase toxicity. Survival does not automatically improve."
      },
      {
        "fr": "Une diminution de tumeur simulée ne prouve pas que les patients vivront plus longtemps.",
        "en": "Simulated tumor shrinkage does not prove that patients will live longer."
      }
    ],
    "data": [
      {
        "fr": "Plusieurs mesures de la tumeur montrent comment elle évolue au fil du traitement.",
        "en": "Repeated tumor measurements show how it changes during treatment."
      },
      {
        "fr": "Une dose interrompue ou réduite change le traitement réellement reçu.",
        "en": "An interrupted or reduced dose changes the treatment actually received."
      },
      {
        "fr": "Il faut savoir quand un événement survient et quand le suivi s'arrête pour étudier la survie.",
        "en": "To study survival, we need to know when an event occurs and when follow-up ends."
      },
      {
        "fr": "La dernière taille tumorale seule ne raconte pas toutes les étapes du traitement.",
        "en": "The final tumor size alone does not tell the full treatment history."
      }
    ]
  },
  "synthesis-mab": {
    "tmdd": [
      {
        "fr": "Si une voie d'élimination liée à la cible se sature, la clairance peut changer avec la concentration.",
        "en": "When target-mediated elimination becomes saturated, clearance may change with concentration."
      },
      {
        "fr": "Une clairance toujours constante ne suffit pas à expliquer une pharmacocinétique non linéaire.",
        "en": "Clearance that always stays constant cannot explain nonlinear pharmacokinetics on its own."
      }
    ],
    "measure": [
      {
        "fr": "Mesurer la forme libre et la quantité totale de médicament peut aider à comprendre sa liaison.",
        "en": "Measuring free and total drug may help explain binding."
      },
      {
        "fr": "Mesurer la cible et ses complexes avec le médicament renseigne sur leur interaction.",
        "en": "Measuring the target and drug–target complexes informs us about their interaction."
      },
      {
        "fr": "La date d'apparition et la quantité d'anticorps anti-médicament (ADA) aident à rechercher leur effet.",
        "en": "The timing and amount of anti-drug antibodies (ADA) help investigate their impact."
      },
      {
        "fr": "Un résultat ADA positif, isolé et sans date, ne prouve pas que ces anticorps ont modifié la PK.",
        "en": "A positive ADA result with no timing does not prove the antibodies changed PK."
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
        "fr": "Un AIC plus bas est utile, mais il faut aussi vérifier la fiabilité des calculs et des prédictions.",
        "en": "A lower AIC is useful, but we must also check calculations and predictions."
      },
      {
        "fr": "Un modèle peut avoir un bon AIC tout en étant instable ou peu plausible.",
        "en": "A model may have a good AIC while still being unstable or implausible."
      }
    ],
    "next": [
      {
        "fr": "Une erreur peut venir des équations du modèle ou de la façon dont les mesures varient autour de ses prédictions.",
        "en": "An error may come from the model equations or from the way measurements vary around predictions."
      },
      {
        "fr": "Une VPC doit simuler des patients et prélèvements comparables à ceux de l'étude.",
        "en": "A VPC must simulate patients and samples comparable to those in the study."
      },
      {
        "fr": "Ignorer la VPC revient à ne pas vérifier si le modèle reproduit la répartition observée.",
        "en": "Ignoring the VPC means not checking whether the model reproduces the observed distribution."
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
        "fr": "Dans cet exemple NONMEM, THETA(1) est la clairance de référence de la population.",
        "en": "Here, THETA(1) is the reference population clearance in NONMEM."
      },
      {
        "fr": "Dans cet exemple Monolix, Cl_pop représente cette même clairance typique.",
        "en": "Here, Cl_pop represents the same typical clearance in Monolix."
      },
      {
        "fr": "Dans cet exemple nlmixr2, exp(tcl) convertit la clairance de l'échelle logarithmique à l'échelle habituelle.",
        "en": "Here, exp(tcl) converts clearance from the log scale to its usual scale in nlmixr2."
      },
      {
        "fr": "EPS(1) décrit une erreur de mesure, pas la clairance habituelle des patients.",
        "en": "EPS(1) describes measurement error, not typical patient clearance."
      }
    ],
    "random": [
      {
        "fr": "ETA(1) représente dans NONMEM la différence propre à un patient par rapport à la population.",
        "en": "ETA(1) represents a patient's deviation from the population in NONMEM."
      },
      {
        "fr": "eta_Cl joue ce rôle pour la clairance dans Monolix.",
        "en": "eta_Cl plays that role for clearance in Monolix."
      },
      {
        "fr": "eta.cl joue ce rôle dans le code nlmixr2 montré ici.",
        "en": "eta.cl plays that role in the nlmixr2 code shown here."
      },
      {
        "fr": "IPRED est une concentration prédite pour un patient. Ce n'est pas une variation individuelle du paramètre.",
        "en": "IPRED is a predicted concentration for one patient. It is not a patient parameter deviation."
      }
    ],
    "residual": [
      {
        "fr": "EPS et SIGMA décrivent dans cet exemple NONMEM l'écart des mesures autour des prédictions.",
        "en": "Here, EPS and SIGMA describe how measurements differ from predictions in NONMEM."
      },
      {
        "fr": "Dans cet exemple Monolix, b et eps décrivent cette erreur de mesure.",
        "en": "Here, b and eps describe that measurement error in Monolix."
      },
      {
        "fr": "Dans cet exemple nlmixr2, prop(0.15) définit une erreur qui grandit avec la concentration.",
        "en": "Here, prop(0.15) defines an error that grows with concentration in nlmixr2."
      },
      {
        "fr": "OMEGA et eta.cl concernent les différences entre patients, pas les erreurs de mesure.",
        "en": "OMEGA and eta.cl concern differences between patients, not measurement errors."
      }
    ]
  },
  "cov-dispersion": {
    "predict": [
      {
        "fr": "Bêta ne change pas : la relation moyenne entre poids et clairance reste identique.",
        "en": "Beta does not change: the average relationship between weight and clearance stays the same."
      },
      {
        "fr": "Avec omega = 0, les patients n'ont plus d'écarts ETA autour de cette moyenne dans le modèle.",
        "en": "With omega = 0, patients have no ETA deviations around that average in the model."
      },
      {
        "fr": "C'est bêta qui décrit l'effet du poids. Modifier omega ne supprime pas cet effet.",
        "en": "Beta describes the weight effect. Changing omega does not remove it."
      },
      {
        "fr": "L'erreur de mesure, représentée par SIGMA, n'est pas supprimée par omega = 0.",
        "en": "Measurement error, represented by SIGMA, is not removed by omega = 0."
      }
    ]
  },
  "cov-threshold": {
    "validation": [
      {
        "fr": "Calculez les seuils et les groupes uniquement avec les données d'entraînement.",
        "en": "Calculate thresholds and groups using training data only."
      },
      {
        "fr": "Fixez la règle avant de l'essayer sur les patients réservés au test.",
        "en": "Set the rule before trying it on patients reserved for testing."
      },
      {
        "fr": "Si vous utilisez l'AUC des patients du test pour créer les groupes, le test n'est plus indépendant.",
        "en": "If you use test patients' AUC to create groups, the test is no longer independent."
      },
      {
        "fr": "À chaque division de validation, recréez les groupes sans utiliser les patients réservés.",
        "en": "At every validation split, rebuild groups without using held-out patients."
      }
    ]
  },
  "cov-extrapolation": {
    "domain": [
      {
        "fr": "Deux modèles peuvent donner des résultats proches pour 40–90 kg, puis différents à 200 kg.",
        "en": "Two models can agree for 40–90 kg but differ at 200 kg."
      },
      {
        "fr": "Une équation courte n'est pas forcément correcte pour un poids jamais étudié.",
        "en": "A short equation is not necessarily right for a weight never studied."
      },
      {
        "fr": "Avant de prédire hors de la plage connue, vérifiez les hypothèses et cherchez des données adaptées.",
        "en": "Before predicting beyond the known range, check assumptions and look for suitable data."
      },
      {
        "fr": "Deux courbes qui se ressemblent ne prouvent pas qu'une stratégie aide réellement les patients.",
        "en": "Two similar curves do not prove that a strategy benefits patients."
      }
    ]
  },
  "cov-symbolic-validation": {
    "split": [
      {
        "fr": "Gardez les prélèvements d'un même patient ensemble pour éviter de lui faire passer le test avec des données déjà vues.",
        "en": "Keep one patient's samples together so the test does not include data already seen during training."
      },
      {
        "fr": "Choisir l'équation grâce aux résultats du test final rend le score trop optimiste.",
        "en": "Choosing the equation from final-test results makes the score too optimistic."
      },
      {
        "fr": "Calculez les transformations, comme la standardisation, uniquement sur l'entraînement.",
        "en": "Fit transformations, such as standardization, using training data only."
      },
      {
        "fr": "Choisissez puis fixez la formule avant de mesurer ses performances sur le test.",
        "en": "Choose and lock the formula before measuring its performance on the test."
      }
    ]
  },
  "cov-code-check": {
    "bugs": [
      {
        "fr": "Le poids est exprimé en kilogrammes dans cet exercice. La minute n'est pas la bonne unité.",
        "en": "Weight is measured in kilograms in this exercise. Minutes are the wrong unit."
      },
      {
        "fr": "Le bon calcul est (WT/70)^0,75 : toute la fraction doit être élevée à la puissance.",
        "en": "The correct calculation is (WT/70)^0.75: the entire fraction must be raised to the power."
      },
      {
        "fr": "Le contrat de cet exercice prévoit un effet du génotype sur CL seulement, pas sur V.",
        "en": "This exercise specifies a genotype effect on CL only, not on V."
      },
      {
        "fr": "L'exposant du poids peut être différent pour CL et pour V.",
        "en": "The weight exponent can differ for CL and V."
      }
    ]
  },
  "cov-omega-time": {
    "time": [
      {
        "fr": "À 6 heures, le résultat de 12 heures n'est pas encore connu.",
        "en": "At 6 hours, the 12-hour result is not available yet."
      },
      {
        "fr": "On peut provisoirement conserver la dernière valeur connue, à condition de préciser cette hypothèse.",
        "en": "We may carry forward the last known value if we clearly state this assumption."
      },
      {
        "fr": "Utiliser la mesure future de 12 heures pour prédire à 6 heures revient à connaître le futur.",
        "en": "Using the future 12-hour measurement to predict at 6 hours is like knowing the future."
      },
      {
        "fr": "LOCF ne prouve pas que la fonction du rein est restée constante : c'est une hypothèse pratique.",
        "en": "LOCF does not prove kidney function stayed constant: it is a practical assumption."
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

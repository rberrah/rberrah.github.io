/** Bilingual explanations of the individual course questions (core topics). */
export const coreQuizRationales = {
  "pourquoi-pharmacometrie": [
    {
      "fr": "La PK suit le devenir du médicament dans le corps : absorption, distribution et élimination. La PD décrit ses effets.",
      "en": "PK follows the drug through absorption, distribution and elimination. PD describes the effects produced by the drug."
    },
    {
      "fr": "La PD correspond à l’effet obtenu : c’est la construction terminée, pas le trajet des blocs.",
      "en": "PD concerns the resulting effect: the finished construction, not how blocks travel around the room."
    },
    {
      "fr": "Une même dose peut produire des réponses différentes selon le patient : c’est une variabilité entre individus.",
      "en": "The same dose may produce different responses in different patients: this is between-person variability."
    }
  ],
  "covariates-basics": [
    {
      "fr": "Bêta décrit l’effet moyen d’une caractéristique comme le poids sur CL. ETA décrit ce qui reste propre à chaque patient.",
      "en": "Beta describes the average effect of a characteristic such as weight on CL. ETA is the remaining individual deviation."
    },
    {
      "fr": "Le logit permet de modéliser une fraction tout en garantissant une valeur finale entre 0 et 1.",
      "en": "The logit lets us model a fraction while keeping its final value between 0 and 1."
    },
    {
      "fr": "L’effet du poids sur la clairance peut être différent de celui sur le volume : deux coefficients sont possibles.",
      "en": "Weight may affect clearance differently from volume, so separate coefficients can be used."
    }
  ],
  "trois-approches": [
    {
      "fr": "La NCA calcule des résumés comme l’AUC à partir des concentrations mesurées, sans choisir des compartiments.",
      "en": "NCA calculates summaries such as AUC from measured concentrations without choosing a compartment model."
    },
    {
      "fr": "La PopPK combine les profils de plusieurs patients pour estimer une valeur moyenne et les différences individuelles.",
      "en": "PopPK combines profiles from multiple patients to estimate typical values and individual differences."
    },
    {
      "fr": "La PBPK décrit des organes. Si les données renseignent mal de nombreux paramètres, les extrapolations restent fragiles.",
      "en": "PBPK describes organs. If many parameters are poorly informed by data, extrapolations remain uncertain."
    }
  ],
  "covariates-groups": [
    {
      "fr": "Dans une relation exponentielle, exp(bêta) = 0,7 : on prend le logarithme pour obtenir bêta = log(0,7).",
      "en": "In an exponential relationship, exp(beta) = 0.7: taking the logarithm gives beta = log(0.7)."
    },
    {
      "fr": "Un cluster est un regroupement calculé à partir des données, pas une preuve de génotype ou de mécanisme biologique.",
      "en": "A cluster is a group derived from data, not proof of a genotype or biological mechanism."
    },
    {
      "fr": "Choisir et tester un seuil sur les mêmes patients favorise un résultat trop optimiste : il faut une évaluation indépendante.",
      "en": "Choosing and testing a threshold in the same patients makes performance look too good: independent testing is needed."
    }
  ],
  "micro-macro": [
    {
      "fr": "La clairance rapporte une quantité éliminée à une concentration. Dans un compartiment, kₑ = CL/V.",
      "en": "Clearance relates an elimination rate to concentration. In one compartment, kₑ = CL/V."
    },
    {
      "fr": "CL, Q et V restent des paramètres du modèle, mais on peut les relier plus facilement à l’élimination et aux échanges.",
      "en": "CL, Q and V are still model parameters, but they relate more clearly to elimination and exchange."
    },
    {
      "fr": "k₁₂ décrit la vitesse de transfert entre deux compartiments théoriques ; il ne correspond pas à une mesure directe chez le patient.",
      "en": "k₁₂ describes transfer between two model compartments; it is not a direct patient measurement."
    }
  ],
  "clairance-volume-demi-vie": [
    {
      "fr": "Dans ce modèle après bolus IV, C₀ = dose/V : la quantité administrée se répartit dans le volume.",
      "en": "In this IV bolus model, C₀ = dose/V: the administered amount is distributed in the volume."
    },
    {
      "fr": "La demi-vie vaut 0,693 × V/CL : elle dépend de la distribution et de l’élimination.",
      "en": "Half-life is 0.693 × V/CL: both distribution volume and elimination matter."
    },
    {
      "fr": "À dose identique, plus V est grand, plus la concentration initiale C₀ = dose/V est faible.",
      "en": "At the same dose, a larger V gives a smaller initial concentration C₀ = dose/V."
    }
  ],
  "covariates-physiology": [
    {
      "fr": "PMA50 est l’âge auquel la maturation atteint la moitié de sa valeur maximale : le facteur vaut 0,5.",
      "en": "PMA50 is the age at which maturation reaches half its maximum: the factor equals 0.5."
    },
    {
      "fr": "Une courbe de maturation de CL reste une covariable. Un modèle PBPK décrit aussi organes, volumes et débits.",
      "en": "A maturation curve for CL is still a covariate. PBPK also describes organs, volumes and flows."
    },
    {
      "fr": "La fonction rénale influence surtout la clairance rénale : les autres voies d’élimination ne doivent pas être modifiées sans raison.",
      "en": "Renal function mostly affects renal clearance: other elimination routes should not be changed without justification."
    }
  ],
  "absorption-orale": [
    {
      "fr": "Ka décrit la vitesse de passage vers la circulation ; CL décrit l’élimination et F la fraction absorbée disponible.",
      "en": "Ka describes absorption speed; CL describes elimination and F the fraction reaching circulation."
    },
    {
      "fr": "Tlag est le temps d’attente avant le début de l’absorption, pas l’heure du pic Tmax.",
      "en": "Tlag is the waiting time before absorption begins, not the peak time Tmax."
    },
    {
      "fr": "Quand l’absorption est plus lente que l’élimination, elle peut commander la pente finale : c’est le flip-flop.",
      "en": "When absorption is slower than elimination, it may govern the terminal slope: this is flip-flop."
    }
  ],
  "covariates-symbolic": [
    {
      "fr": "Imiter une prédiction informatique ne prouve pas que la formule fonctionne sur des observations réelles ni qu’elle explique une cause.",
      "en": "Imitating a computer prediction does not prove the formula works on real observations or explains causation."
    },
    {
      "fr": "Les mesures d’un même patient doivent rester ensemble pour éviter que le test réutilise des informations de l’entraînement.",
      "en": "A patient's samples must stay together so the test does not reuse information from training."
    },
    {
      "fr": "Une formule seule ne calcule pas les différences entre patients : il faut modéliser et estimer cette variabilité OMEGA.",
      "en": "A formula alone does not estimate between-patient differences: OMEGA requires a fitted variability model."
    }
  ],
  "voies-absorption": [
    {
      "fr": "Une injection IV entre directement dans la circulation : par définition, toute la dose est disponible, donc F = 1.",
      "en": "An IV injection enters circulation directly: by definition the entire dose is available, so F = 1."
    },
    {
      "fr": "La voie buccale ou sublinguale peut éviter une partie du premier passage hépatique avant l’arrivée dans le sang.",
      "en": "Buccal or sublingual delivery can bypass much of the first pass through the liver before reaching blood."
    },
    {
      "fr": "Un patch vise souvent une libération prolongée à débit assez constant, plutôt qu’un pic rapide.",
      "en": "A patch often aims for prolonged delivery at a fairly constant rate rather than a rapid peak."
    }
  ],
  "doses-repetees": [
    {
      "fr": "À l’équilibre en PK linéaire avec F = 1, la dose par intervalle est égale à CL × concentration moyenne × τ.",
      "en": "At linear steady state with F = 1, dose per interval equals CL × mean concentration × τ."
    },
    {
      "fr": "Le temps d’approche de l’équilibre dépend de la demi-vie : augmenter la dose ne rend pas l’élimination plus rapide.",
      "en": "Time to steady state depends on half-life: raising dose does not accelerate elimination."
    },
    {
      "fr": "En perfusion stable, le débit entrant R0 égale le débit éliminé CL × Css : Css = R0/CL.",
      "en": "During steady infusion, input R0 equals elimination CL × Css: Css = R0/CL."
    },
    {
      "fr": "Une dose de charge vise à atteindre rapidement une concentration utile ; elle ne change pas la demi-vie.",
      "en": "A loading dose aims to reach a useful concentration quickly; it does not change half-life."
    }
  ],
  "perfusion": [
    {
      "fr": "Un débit d’ordre zéro apporte une quantité fixe de médicament par heure, quelle que soit sa concentration.",
      "en": "A zero-order input delivers a fixed amount of drug per hour, regardless of its concentration."
    },
    {
      "fr": "À l’équilibre, le débit entrant R0 égale la clairance multipliée par Css, donc Css = R0/CL.",
      "en": "At steady state, input rate R0 equals clearance multiplied by Css, so Css = R0/CL."
    },
    {
      "fr": "En PK linéaire, doubler R0 double le plateau, mais pas la vitesse relative d’approche fixée par la demi-vie.",
      "en": "In linear PK, doubling R0 doubles the plateau but not the relative approach rate set by half-life."
    }
  ],
  "parent-metabolite": [
    {
      "fr": "Le métabolite est fabriqué à partir du médicament parent : sa concentration monte donc progressivement après celle du parent.",
      "en": "A metabolite forms from the parent drug: its concentration builds up progressively after the parent appears."
    },
    {
      "fr": "Si le métabolite est éliminé plus lentement que le parent, son élimination peut gouverner la pente terminale.",
      "en": "If the metabolite is eliminated more slowly than the parent, its elimination may govern the terminal slope."
    },
    {
      "fr": "Un métabolite actif peut produire lui aussi un effet pharmacologique, favorable ou toxique.",
      "en": "An active metabolite can itself produce pharmacological effects, beneficial or toxic."
    }
  ],
  "variabilite-iiv-iov": [
    {
      "fr": "L’IIV compare les différences habituelles entre patients, pas les variations d’une visite à l’autre.",
      "en": "IIV describes habitual differences between patients, not changes between visits."
    },
    {
      "fr": "L’IOV décrit les variations chez un même patient entre deux visites ou cures.",
      "en": "IOV describes changes in the same patient between visits or treatment occasions."
    },
    {
      "fr": "L’erreur résiduelle correspond à l’écart restant pour chaque mesure, par exemple le bruit analytique.",
      "en": "Residual error is the difference remaining for each measurement, for example assay noise."
    }
  ],
  "covariates-implementation": [
    {
      "fr": "La corrélation vaut covariance divisée par les deux écarts-types : 0,03/(0,3 × 0,2) = 0,5.",
      "en": "Correlation is covariance divided by the two standard deviations: 0.03/(0.3 × 0.2) = 0.5."
    },
    {
      "fr": "Dans l’exemple Monolix, les effets aléatoires sont sur Cl0 et V0 ; le poids et bêta sont des termes fixes.",
      "en": "In this Monolix example, random effects apply to Cl0 and V0; weight and beta are fixed-effect terms."
    },
    {
      "fr": "Une prédiction faite aujourd’hui ne doit pas utiliser un prélèvement de demain : ce serait une fuite d’information.",
      "en": "A prediction made today must not use a sample measured tomorrow: that is information leakage."
    }
  ],
  "erreur-residuelle": [
    {
      "fr": "En erreur proportionnelle, le bruit grandit avec la concentration prédite au lieu de rester constant.",
      "en": "With proportional error, noise increases with predicted concentration instead of staying constant."
    },
    {
      "fr": "Une dispersion en entonnoir suggère que la taille du bruit est mal décrite : vérifiez aussi les autres graphiques.",
      "en": "Funnel-shaped spread suggests the error magnitude is misspecified: also check other diagnostics."
    },
    {
      "fr": "L’erreur combinée associe un bruit minimal fixe à une composante proportionnelle à la concentration.",
      "en": "Combined error includes a fixed baseline noise and another part proportional to concentration."
    }
  ],
  "allometrie": [
    {
      "fr": "Une bonne covariable explique une partie des différences de paramètres entre patients ; la p-value seule ne suffit pas.",
      "en": "A useful covariate explains some patient differences in parameters; a p-value alone is not enough."
    },
    {
      "fr": "Référencer le poids à 70 kg fait correspondre le paramètre typique à une personne de 70 kg, sans annuler l’effet du poids.",
      "en": "Referencing weight to 70 kg makes the typical parameter refer to a 70-kg person without removing the weight effect."
    },
    {
      "fr": "L’exposant 0,75 est une hypothèse allométrique fréquente pour la clairance, à adapter au médicament et à la population.",
      "en": "An exponent of 0.75 is a common allometric assumption for clearance, to be checked for the drug and population."
    }
  ],
  "pkpd": [
    {
      "fr": "Dans le modèle Emax simple, EC50 est la concentration donnant la moitié de l’effet maximal du médicament.",
      "en": "In a simple Emax model, EC50 is the concentration producing half of the drug's maximal effect."
    },
    {
      "fr": "Un Hill supérieur à 1 rend la transition d’un effet faible à élevé plus abrupte autour d’EC50.",
      "en": "Hill greater than 1 makes the transition from low to high effect steeper near EC50."
    },
    {
      "fr": "Un modèle de turnover décrit la production et la disparition d’un biomarqueur : sa réponse peut être retardée même si la concentration change vite.",
      "en": "A turnover model describes production and removal of a biomarker: the response may lag despite rapid concentration changes."
    }
  ],
  "outils-estimation": [
    {
      "fr": "Estimer consiste à retrouver les paramètres compatibles avec les données ; simuler prédit les données à partir de paramètres fixés.",
      "en": "Estimation finds parameters compatible with data; simulation predicts data from fixed parameters."
    },
    {
      "fr": "FOCE-I et SAEM sont des algorithmes qui cherchent les paramètres d’un modèle, pas des scores de qualité.",
      "en": "FOCE-I and SAEM are algorithms used to estimate model parameters, not quality scores."
    },
    {
      "fr": "L’AIC pénalise la complexité en plus de mesurer l’ajustement ; il ne prouve pas la validité clinique.",
      "en": "AIC penalizes complexity while assessing fit; it does not prove clinical validity."
    }
  ],
  "parametric-vs-nonparametric": [
    {
      "fr": "Dans ce contexte, on parle de la distribution des paramètres entre patients, pas du nombre de compartiments.",
      "en": "Here, the distinction concerns the distribution of parameters across patients, not the number of compartments."
    },
    {
      "fr": "Deux groupes de points estimés ne prouvent pas deux phénotypes : données et choix du modèle peuvent les produire.",
      "en": "Two estimated point clusters do not prove two phenotypes: data and model choices can produce them."
    },
    {
      "fr": "Ne pas imposer de loi normale n’enlève pas les hypothèses sur la structure du modèle, les erreurs et les données.",
      "en": "Avoiding a normal-distribution assumption does not remove assumptions about model structure, errors and data."
    }
  ],
  "pmetrics-nonparametric": [
    {
      "fr": "ab(0.02, 0.5) donne des bornes de recherche du paramètre dans NPAG, pas un intervalle de confiance.",
      "en": "ab(0.02, 0.5) sets parameter search bounds in NPAG, not a confidence interval."
    },
    {
      "fr": "PM_data prépare les observations pour Pmetrics, tandis que PM_model décrit le modèle.",
      "en": "PM_data prepares observations for Pmetrics, while PM_model describes the model."
    },
    {
      "fr": "Un code généré doit encore être contrôlé : unités, bornes, erreur résiduelle et données conditionnent l’analyse.",
      "en": "Generated code still needs checking: units, bounds, residual error and data affect the analysis."
    },
    {
      "fr": "Deux groupes de points peuvent indiquer plusieurs modes, mais pas forcément deux profils biologiques réels.",
      "en": "Two point groups may indicate multiple modes but not necessarily two real biological profiles."
    }
  ],
  "validation-vpc": [
    {
      "fr": "Une VPC compare des observations à de nombreux jeux simulés avec le modèle, pas seulement à une prédiction individuelle.",
      "en": "A VPC compares observations with many datasets simulated from the model, not just individual predictions."
    },
    {
      "fr": "Un modèle doit reproduire les motifs et la dispersion des données ; une OFV basse ne suffit pas.",
      "en": "A model should reproduce patterns and variability in data; a low objective function is not enough."
    },
    {
      "fr": "Un seul diagnostic encourageant ne suffit pas : plusieurs méthodes complémentaires peuvent révéler des défauts différents.",
      "en": "One encouraging diagnostic is not enough: complementary checks can reveal different problems."
    }
  ],
  "bayes-ebes": [
    {
      "fr": "Un EBE estime à partir des mesures du patient son écart individuel par rapport au modèle de population.",
      "en": "An EBE uses patient measurements to estimate their individual deviation from the population model."
    },
    {
      "fr": "Avec peu de prélèvements informatifs, les estimations individuelles reviennent vers la moyenne de population : c’est le shrinkage.",
      "en": "With few informative samples, individual estimates shrink toward the population average."
    },
    {
      "fr": "Le MAP utilise l’information de population et celle des mesures individuelles, en les pondérant selon leur incertitude.",
      "en": "MAP combines population information and individual measurements, weighting them by uncertainty."
    }
  ],
  "tdm": [
    {
      "fr": "Le TDM associe concentration, dose, horaire et contexte clinique pour guider le suivi thérapeutique.",
      "en": "TDM combines concentration, dose, timing and clinical context to guide therapy."
    },
    {
      "fr": "Le résultat d’une concentration dépend du temps depuis la dernière prise ; ce temps est indispensable à son interprétation.",
      "en": "A concentration result depends on time since the last dose; this timing is essential for interpretation."
    },
    {
      "fr": "Le site sert à apprendre les méthodes : il n’est pas destiné à prescrire une dose à un patient réel.",
      "en": "The site teaches methods and is not intended to prescribe doses for a real patient."
    }
  ]
};

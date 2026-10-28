/** Bilingual explanations of the individual course questions (PD, PBPK, NCA and clinical validation). */
export const validationQuizRationales = {
  "pd-indirect": [
    {
      "fr": "Le biomarqueur change au rythme de sa production et de son élimination : ce renouvellement peut retarder l’effet.",
      "en": "The biomarker changes according to its production and removal rates: this turnover can delay the effect."
    },
    {
      "fr": "Quatre mécanismes de base existent : stimuler ou inhiber soit la production kin, soit l’élimination kout.",
      "en": "There are four basic mechanisms: stimulate or inhibit either production kin or removal kout."
    },
    {
      "fr": "À l’équilibre, production = élimination : kin = kout × R0, donc R0 = kin/kout.",
      "en": "At baseline, production equals removal: kin = kout × R0, so R0 = kin/kout."
    }
  ],
  "pd-effect-compartment": [
    {
      "fr": "La concentration dans le plasma peut changer avant celle au site d’action ; ce délai crée une boucle concentration–effet.",
      "en": "Plasma concentration can change before the effect-site concentration; this lag creates a concentration–effect loop."
    },
    {
      "fr": "ke0 commande la vitesse de rapprochement entre concentration plasmatique et concentration au site d’effet.",
      "en": "ke0 controls how quickly effect-site concentration approaches plasma concentration."
    },
    {
      "fr": "Si l’effet ne suit pas immédiatement la concentration, les mêmes concentrations peuvent correspondre à des effets différents selon le temps.",
      "en": "If effect does not follow concentration immediately, the same concentration can yield different effects at different times."
    }
  ],
  "pd-tolerance": [
    {
      "fr": "La tolérance signifie qu’une exposition comparable provoque progressivement un effet plus faible.",
      "en": "Tolerance means that a similar exposure gradually produces a weaker effect."
    },
    {
      "fr": "Un système de compensation peut augmenter pendant le traitement puis rester actif après l’arrêt, provoquant un rebond.",
      "en": "A compensating system can build up during treatment and remain active after stopping, causing rebound."
    },
    {
      "fr": "Un réservoir de précurseurs peut se vider pendant le traitement puis se remplir à nouveau, créant récupération et délai.",
      "en": "A precursor pool may be depleted during treatment and later refill, creating delay and recovery."
    }
  ],
  "pd-survival": [
    {
      "fr": "L’OS s’arrête au décès quelle qu’en soit la cause ; la PFS s’arrête à la progression ou au décès, selon sa définition.",
      "en": "OS ends at death from any cause; PFS ends at progression or death, according to its definition."
    },
    {
      "fr": "On censure à droite si le patient n’a pas présenté l’événement pendant la période observée ou cesse d’être suivi.",
      "en": "Right censoring applies when the event has not occurred by the last observed time or follow-up ends."
    },
    {
      "fr": "Un modèle de hasard relie l’exposition au risque instantané d’événement ; la simulation reste conditionnelle aux hypothèses retenues.",
      "en": "A hazard model links exposure to instantaneous event risk; simulations still depend on the model assumptions."
    }
  ],
  "pbpk-intro": [
    {
      "fr": "La PBPK représente des organes et tissus reliés par le sang, plutôt que des compartiments purement mathématiques.",
      "en": "PBPK represents organs and tissues connected by blood, rather than purely mathematical compartments."
    },
    {
      "fr": "Quand les échanges avec un organe sont rapides, c’est le débit sanguin qui limite la vitesse d’entrée.",
      "en": "When tissue exchange is rapid, blood flow limits how quickly drug reaches the organ."
    },
    {
      "fr": "La physiologie permet d’explorer d’autres populations ou doses, mais seulement après vérification du modèle pour cet usage.",
      "en": "Physiology supports exploring other populations or doses, but only after checking the model for that use."
    }
  ],
  "pbpk-distribution": [
    {
      "fr": "Kp,T est le rapport entre concentration dans le tissu et concentration dans le plasma à l’équilibre.",
      "en": "Kp,T is the tissue-to-plasma concentration ratio at equilibrium."
    },
    {
      "fr": "Une molécule très lipophile peut se répartir davantage dans les graisses, augmentant parfois son volume apparent.",
      "en": "A highly lipophilic drug may distribute more into fat tissue, sometimes increasing apparent volume."
    },
    {
      "fr": "La forme libre n’est pas retenue par les protéines plasmatiques et reste directement disponible pour de nombreux échanges.",
      "en": "Unbound drug is not held by plasma proteins and remains directly available for many exchanges."
    }
  ],
  "pbpk-absorption": [
    {
      "fr": "ACAT/ADAM décrivent successivement les segments intestinaux et les étapes de dissolution, passage et transit du médicament.",
      "en": "ACAT/ADAM model intestinal segments and the steps of dissolution, transport and transit."
    },
    {
      "fr": "Le foie peut transformer une partie de la dose absorbée avant son arrivée dans le sang systémique, ce qui réduit F.",
      "en": "The liver may metabolize some absorbed drug before it enters systemic blood, reducing F."
    },
    {
      "fr": "La classe BCS dépend de deux caractéristiques : capacité à se dissoudre dans l’eau et capacité à traverser l’intestin.",
      "en": "BCS classification uses two properties: solubility in aqueous fluid and intestinal permeability."
    }
  ],
  "pbpk-applications": [
    {
      "fr": "L’IVIVE utilise des résultats obtenus au laboratoire pour estimer, avec des hypothèses, l’élimination dans un organisme vivant.",
      "en": "IVIVE uses laboratory measurements to predict elimination in a living organism under stated assumptions."
    },
    {
      "fr": "Un inhibiteur ou un inducteur modifie l’activité d’une enzyme : la PBPK traduit ce changement en exposition prévue.",
      "en": "An inhibitor or inducer changes enzyme activity: PBPK translates that change into predicted exposure."
    },
    {
      "fr": "Les organes, les débits sanguins et l’activité des enzymes changent avec l’âge : la pédiatrie exige plus qu’un simple ajustement au poids.",
      "en": "Organs, blood flow and enzyme activity change with age: pediatric PBPK needs more than weight scaling."
    }
  ],
  "nca-intro": [
    {
      "fr": "La NCA résume un profil concentration–temps sans définir les compartiments internes du corps.",
      "en": "NCA summarizes a concentration–time profile without defining internal body compartments."
    },
    {
      "fr": "Dose/AUC se lit comme une clairance constante seulement si la relation dose–exposition est suffisamment linéaire dans le domaine étudié.",
      "en": "Dose/AUC represents a constant clearance only when the dose–exposure relation is sufficiently linear over the studied range."
    }
  ],
  "nca-auc": [
    {
      "fr": "La méthode des trapèzes additionne des surfaces calculées entre deux concentrations mesurées successives.",
      "en": "The trapezoidal method adds areas between successive measured concentrations."
    },
    {
      "fr": "La pente terminale s’estime avec des points tardifs suivant approximativement une droite sur l’échelle logarithmique.",
      "en": "The terminal slope is estimated from late points that form an approximately straight line on a log scale."
    },
    {
      "fr": "Si beaucoup de l’AUC est estimé après le dernier prélèvement, la mesure dépend fortement d’une extrapolation incertaine.",
      "en": "If much of AUC is estimated after the last sample, the result relies on uncertain extrapolation."
    }
  ],
  "nca-params": [
    {
      "fr": "Après une dose IV avec élimination linéaire, l’exposition AUC∞ vérifie AUC∞ = dose/CL : on isole CL.",
      "en": "After an IV dose with linear elimination, AUC∞ = dose/CL, so CL = dose/AUC∞."
    },
    {
      "fr": "AUMC pondère les concentrations par le temps ; la division AUMC/AUC donne le temps moyen de séjour.",
      "en": "AUMC weights concentrations by time; dividing by AUC gives mean residence time."
    },
    {
      "fr": "Dans le cadre IV approprié, Vss = CL × MRT : un volume s’obtient en multipliant débit clairé et temps.",
      "en": "In the appropriate IV setting, Vss = CL × MRT: clearance times residence time has volume units."
    }
  ],
  "nca-absorption": [
    {
      "fr": "L’IV est disponible à 100 % ; comparer les AUC normalisées par leur dose permet d’estimer la fraction disponible par voie orale.",
      "en": "IV drug is 100% available; comparing dose-normalized AUCs estimates the orally available fraction."
    },
    {
      "fr": "Cmax et Tmax donnent surtout des indices sur la rapidité et la forme de l’absorption, mais ne suffisent pas à identifier tous ses mécanismes.",
      "en": "Cmax and Tmax mainly reflect absorption rate and shape, but cannot identify all absorption mechanisms."
    }
  ],
  "valid-objective": [
    {
      "fr": "L’OFV est −2 log L : un modèle qui rend les données plus vraisemblables a en principe une valeur plus faible.",
      "en": "OFV is −2 log L: a model making observations more likely generally has a lower value."
    },
    {
      "fr": "Dans deux modèles emboîtés optimisés au maximum global, un paramètre supplémentaire ne peut pas dégrader le meilleur ajustement, mais augmente la complexité.",
      "en": "For globally optimized nested models, adding a parameter cannot worsen the best achievable fit, but increases complexity."
    },
    {
      "fr": "Le test ΔOFV requiert notamment des modèles emboîtés, les mêmes données et les conditions statistiques adaptées.",
      "en": "The ΔOFV test requires nested models, comparable data and appropriate statistical conditions."
    }
  ],
  "valid-gof": [
    {
      "fr": "Quand les prédictions sont proches des observations sans motif systématique, les points entourent la diagonale, avec une dispersion normale.",
      "en": "When predictions agree with observations without a systematic pattern, points scatter around the identity line."
    },
    {
      "fr": "Une tendance des CWRES avec le temps signale un motif à expliquer ; plusieurs causes restent possibles.",
      "en": "A time trend in CWRES signals a pattern worth investigating; multiple causes remain possible."
    },
    {
      "fr": "Des résidus pondérés bien décrits oscillent autour de zéro sans motif marqué ; beaucoup doivent être compris dans ±2.",
      "en": "Well-described weighted residuals fluctuate around zero without clear patterns; many should lie within ±2."
    }
  ],
  "valid-uncertainty": [
    {
      "fr": "Le RSE compare l’erreur-type d’estimation à la taille du paramètre ; il renseigne sa précision, pas la différence entre patients.",
      "en": "RSE compares estimation standard error with the parameter value; it measures precision, not between-patient variability."
    },
    {
      "fr": "Le bootstrap refait l’analyse sur des échantillons de patients tirés avec remise pour observer la variabilité des estimations.",
      "en": "Bootstrap refits the model on resampled patients to assess variation in estimates."
    },
    {
      "fr": "Un RSE élevé signifie que l’estimation est peu précise au regard de sa valeur, compte tenu des données disponibles.",
      "en": "A high RSE indicates poor precision relative to the estimate, given the available data."
    }
  ],
  "valid-npde": [
    {
      "fr": "Après décorrélation et transformation, les NPDE devraient ressembler à une normale de moyenne zéro et variance un si le modèle est bien spécifié.",
      "en": "After decorrelation and transformation, NPDE should approximate a standard normal distribution if the model is well specified."
    },
    {
      "fr": "On situe chaque observation parmi des valeurs simulées avec le modèle, plutôt que de regarder uniquement sa prédiction individuelle.",
      "en": "Each observation is compared with a distribution simulated from the model rather than with only its individual prediction."
    },
    {
      "fr": "Une moyenne des NPDE loin de zéro suggère que le modèle prédit systématiquement trop haut ou trop bas.",
      "en": "An NPDE mean far from zero suggests systematic overprediction or underprediction."
    }
  ],
  "valid-vpc": [
    {
      "fr": "Une VPC compare les quantiles observés à ceux obtenus en simulant plusieurs jeux sous le modèle ajusté.",
      "en": "A VPC compares observed quantiles with those from many datasets simulated under the fitted model."
    },
    {
      "fr": "La pcVPC réduit l’effet des différences de prédictions typiques liées au schéma de dose ou aux covariables entre observations.",
      "en": "A pcVPC adjusts for differences in typical predictions caused by dose schedules or covariates across observations."
    },
    {
      "fr": "Si les percentiles observés sortent régulièrement des bandes simulées, vérifiez la structure du modèle, sa variabilité et le plan de simulation.",
      "en": "If observed percentiles repeatedly fall outside simulated bands, check model structure, variability and the simulation design."
    }
  ],
  "valid-shrinkage": [
    {
      "fr": "Les EBE sont ramenés vers la valeur moyenne quand les données propres au patient sont peu informatives.",
      "en": "EBEs move toward the population mean when a patient's data contain little information."
    },
    {
      "fr": "Un shrinkage résiduel élevé peut atténuer artificiellement les IWRES et compliquer leur interprétation.",
      "en": "High residual shrinkage can artificially narrow individual residuals and make IWRES harder to interpret."
    },
    {
      "fr": "Le shrinkage ETA compare la dispersion des EBE estimés à la dispersion prévue par OMEGA : 1 − SD(η̂)/ω.",
      "en": "ETA shrinkage compares estimated EBE spread with the spread implied by OMEGA: 1 − SD(η̂)/ω."
    }
  ],
  "valid-diagnostics": [
    {
      "fr": "Les graphiques donnent des indices différents : ils doivent être interprétés ensemble plutôt que par un seul chiffre.",
      "en": "Diagnostic plots offer different clues and should be interpreted together rather than relying on one number."
    },
    {
      "fr": "Si la taille des résidus augmente avec la prédiction, le modèle d’erreur peut être inadapté, sans preuve d’une cause unique.",
      "en": "If residual size grows with prediction, the error model may be unsuitable, but the cause is not proven."
    },
    {
      "fr": "Les ETA décrivent des écarts par rapport à zéro sur l’échelle du modèle ; leur distribution supposée est souvent approximativement normale.",
      "en": "ETAs represent deviations around zero on the model scale; their assumed distribution is often approximately normal."
    }
  ],
  "valid-interpretation": [
    {
      "fr": "Un motif en U indique que les résidus ne sont pas répartis au hasard ; une structure mal décrite est une hypothèse à tester.",
      "en": "A U-shaped pattern indicates non-random residuals; structural misspecification is one possibility to test."
    },
    {
      "fr": "Un entonnoir de résidus montre que leur dispersion change avec les prédictions, ce qui appelle une révision du modèle d’erreur.",
      "en": "A residual funnel shows spread changing with predictions, suggesting that the error model needs review."
    },
    {
      "fr": "Des résidus biaisés dans un sous-groupe peuvent suggérer un effet non modélisé de sa fonction d’organe ou d’une autre covariable.",
      "en": "Biased residuals in one subgroup may suggest an unmodeled organ-function or other covariate effect."
    }
  ],
  "trials-fih": [
    {
      "fr": "MABEL repose sur le premier effet biologique anticipé, notamment l’activité sur la cible, avec une approche prudente.",
      "en": "MABEL is based on the minimum anticipated biological effect, including target activity, with a cautious approach."
    },
    {
      "fr": "NOAEL vient des études toxicologiques : c’est la dose sans effet indésirable observé dans les conditions de l’étude.",
      "en": "NOAEL comes from toxicology: it is the dose without observed adverse effects under study conditions."
    },
    {
      "fr": "Pour un médicament très actif, confronter MABEL, doses pharmacologiques et NOAEL est plus prudent que de retenir une seule valeur.",
      "en": "For potent drugs, considering MABEL, pharmacologically active doses and NOAEL is safer than relying on one estimate."
    }
  ],
  "trials-cts": [
    {
      "fr": "La simulation peut comparer en amont différentes doses et tailles d’étude ; elle ne remplace pas un essai clinique réel.",
      "en": "Simulation can compare doses and study designs in advance; it does not replace a real clinical trial."
    },
    {
      "fr": "Une population virtuelle réaliste doit tenir compte de la variabilité des patients et des liens entre covariables, pas seulement des moyennes.",
      "en": "A realistic virtual population needs patient variability and relationships between covariates, not just averages."
    },
    {
      "fr": "La probabilité de succès dépend de la taille de l’effet recherché, du bruit des mesures et du nombre de participants.",
      "en": "Success probability depends on effect size, measurement variability and participant numbers."
    }
  ],
  "trials-interpretation": [
    {
      "fr": "Un forest plot montre, pour chaque covariable, une estimation de son effet et l’incertitude qui l’entoure.",
      "en": "A forest plot shows each covariate effect estimate and its associated uncertainty."
    },
    {
      "fr": "Un effet utile pour décider doit avoir une taille et une incertitude compatibles avec la décision clinique, pas seulement p < 0,05.",
      "en": "An effect that matters for decisions needs relevant magnitude and uncertainty, not just p < 0.05."
    },
    {
      "fr": "Si l’intervalle du ratio contient 1, les données restent compatibles avec l’absence d’effet selon ce test.",
      "en": "If a ratio interval includes 1, the data remain compatible with no effect under that test."
    }
  ],
  "trials-adaptive": [
    {
      "fr": "Un modèle dose–réponse utilise les informations de plusieurs doses pour mieux estimer une tendance, sous ses hypothèses.",
      "en": "A dose-response model combines information across doses to estimate a trend under its assumptions."
    },
    {
      "fr": "Une étude adaptative peut changer selon des règles fixées avant de voir les résultats, pas au gré d’un résultat favorable.",
      "en": "An adaptive trial can change according to rules set in advance, not whenever a favorable result appears."
    },
    {
      "fr": "MCP-Mod teste plusieurs tendances dose–réponse puis utilise la modélisation pour étudier la dose pertinente.",
      "en": "MCP-Mod tests several dose-response trends and then uses modeling to assess suitable doses."
    }
  ],
  "tools-algorithms": [
    {
      "fr": "Avec des effets individuels non observés, la vraisemblance exige une intégrale souvent impossible à calculer exactement.",
      "en": "With unobserved individual effects, likelihood includes an integral that is often not analytically solvable."
    },
    {
      "fr": "FOCE rapproche le modèle d’une équation linéaire autour des estimations individuelles afin d’approcher cette intégrale.",
      "en": "FOCE linearizes the model around individual estimates to approximate the integral."
    },
    {
      "fr": "SAEM simule les effets individuels puis met à jour les paramètres en répétant ces deux étapes, sans linéariser le modèle structural.",
      "en": "SAEM simulates individual effects and updates parameters repeatedly without linearizing the structural model."
    }
  ]
};

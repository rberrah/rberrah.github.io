/** Bilingual explanations of the individual course questions (methods and applied PK/PD). */
export const methodsQuizRationales = {
  "neural-ode": [
    {
      "fr": "Un modèle grey-box conserve des équations connues et apprend les parties mal décrites à partir des données.",
      "en": "A grey-box model keeps known equations while learning poorly understood parts from data."
    },
    {
      "fr": "Une Neural ODE apprend une partie de la dynamique tout en utilisant une équation différentielle pour suivre le temps.",
      "en": "A Neural ODE learns part of the dynamics while using a differential equation to follow time."
    },
    {
      "fr": "Un modèle peut bien reproduire l’entraînement puis mal prédire de nouveaux patients ou des situations extrêmes.",
      "en": "A model can fit training data yet predict poorly in new patients or extreme situations."
    }
  ],
  "ai-ml-tdm": [
    {
      "fr": "Le ML peut estimer une AUC avec quelques prélèvements ; cela ne dispense pas de vérifier sa précision chez de nouveaux patients.",
      "en": "ML can estimate AUC from a few samples; accuracy still needs checking in new patients."
    },
    {
      "fr": "Un hybride associe les connaissances du modèle PK à la souplesse du ML ; il ne remplace pas forcément la PopPK.",
      "en": "A hybrid combines PK model knowledge with ML flexibility; it does not necessarily replace PopPK."
    }
  ],
  "ai-trees": [
    {
      "fr": "Chaque feuille d’un arbre donne une valeur fixe : la prédiction change par marches entre les groupes.",
      "en": "Each tree leaf gives a fixed value: predictions change in steps between groups."
    },
    {
      "fr": "Une forêt moyenne plusieurs arbres entraînés différemment ; leurs erreurs peuvent en partie se compenser.",
      "en": "A forest averages differently trained trees, allowing some of their errors to cancel out."
    },
    {
      "fr": "L’importance d’une variable renseigne sa valeur prédictive dans ce modèle, pas son effet causal sur le patient.",
      "en": "Variable importance shows predictive usefulness in that model, not a causal effect on the patient."
    }
  ],
  "ai-boosting": [
    {
      "fr": "Le boosting ajoute les arbres successivement : chaque nouvel arbre cherche à corriger les erreurs du modèle déjà construit.",
      "en": "Boosting adds trees sequentially: each new tree aims to correct errors left by the current model."
    },
    {
      "fr": "XGBoost limite la complexité et utilise la forme de la fonction d’erreur pour calculer des corrections efficaces.",
      "en": "XGBoost limits complexity and uses information from the loss function to calculate effective corrections."
    },
    {
      "fr": "CatBoost traite spécialement les variables sous forme de catégories, comme un centre hospitalier ou un génotype.",
      "en": "CatBoost handles categorical variables such as hospital center or genotype with dedicated methods."
    }
  ],
  "ai-svm": [
    {
      "fr": "Un SVM linéaire cherche une frontière qui laisse une grande marge entre les classes, ce qui peut aider la généralisation.",
      "en": "A linear SVM seeks a boundary with a large margin between classes, which can help generalization."
    },
    {
      "fr": "Les points proches de la frontière, appelés vecteurs de support, déterminent sa position.",
      "en": "Points near or inside the margin, called support vectors, determine the decision boundary."
    },
    {
      "fr": "Le noyau calcule des ressemblances équivalentes à celles d’un espace plus riche sans construire explicitement toutes les dimensions.",
      "en": "A kernel computes similarities corresponding to a richer feature space without explicitly building every dimension."
    }
  ],
  "ai-featselect": [
    {
      "fr": "VSURF utilise successivement un tri de variables, une sélection pour interpréter et une sélection plus stricte pour prédire.",
      "en": "VSURF progressively screens variables, selects an interpretable set, then selects a smaller predictive set."
    },
    {
      "fr": "Une réponse ordinale a plusieurs catégories avec un ordre, par exemple toxicité légère, modérée et sévère.",
      "en": "An ordinal outcome has ordered categories, such as mild, moderate and severe toxicity."
    },
    {
      "fr": "Une variable inutile peut rendre le modèle plus instable ou moins généralisable ; l’effet dépend du jeu de données.",
      "en": "An irrelevant variable may make a model less stable or less generalizable; the effect depends on the data."
    }
  ],
  "ai-llm": [
    {
      "fr": "Le pré-entraînement auto-régressif apprend à prévoir un token à partir du contexte précédent, pas à consulter systématiquement une vérité.",
      "en": "Autoregressive pretraining predicts the next token from earlier context, not a guaranteed factual answer."
    },
    {
      "fr": "L’attention attribue des poids différents aux tokens selon leur lien avec le contexte en cours.",
      "en": "Attention assigns different weights to tokens according to their relevance to the current context."
    },
    {
      "fr": "Un LLM peut formuler une réponse plausible mais fausse : chaque affirmation clinique importante doit être vérifiée.",
      "en": "An LLM can produce plausible but false claims: important clinical statements require verification."
    }
  ],
  "ai-clustering": [
    {
      "fr": "Si des EBE diffèrent selon le cancer, cela suggère une association à vérifier ; une différence graphique n’en prouve pas la cause.",
      "en": "EBE differences by cancer type suggest an association to investigate, not proof of causation."
    },
    {
      "fr": "La PCA résume plusieurs variables en directions qui conservent autant que possible leur variabilité, sans utiliser de classe connue.",
      "en": "PCA summarizes variables along directions preserving much of their variation, without known class labels."
    },
    {
      "fr": "Une grande valeur propre peut dépasser ce qu’expliquerait un bruit aléatoire, sous les hypothèses de Marchenko–Pastur.",
      "en": "A large eigenvalue may exceed what random noise predicts under Marchenko–Pastur assumptions."
    }
  ],
  "math-edo": [
    {
      "fr": "Avec une élimination proportionnelle à la quantité, une fraction constante disparaît chaque heure : la solution est exponentielle.",
      "en": "When elimination is proportional to the amount, a constant fraction disappears per hour: the solution is exponential."
    },
    {
      "fr": "Le logarithme d’une exponentielle décroissante est une fonction linéaire du temps : on obtient une droite en semi-log.",
      "en": "The logarithm of exponential decay is linear in time, producing a straight line on a semilog plot."
    }
  ],
  "math-regression": [
    {
      "fr": "Le maximum de vraisemblance cherche le paramètre qui rend les observations les plus compatibles avec la distribution d’erreur supposée.",
      "en": "Maximum likelihood finds parameters making the observations most compatible with the assumed error distribution."
    },
    {
      "fr": "Dans une élimination exponentielle, ln(C) est une droite de pente −k et d’ordonnée ln(C₀).",
      "en": "For exponential elimination, ln(C) is a line with slope −k and intercept ln(C₀)."
    }
  ],
  "math-bayes": [
    {
      "fr": "Bayes actualise une connaissance initiale (a priori) avec l’information apportée par les données (vraisemblance).",
      "en": "Bayes updates initial knowledge (prior) with information from observed data (likelihood)."
    },
    {
      "fr": "Le MAP choisit le point où la distribution après prise en compte des données est maximale.",
      "en": "MAP selects the highest point of the distribution after incorporating the observations."
    },
    {
      "fr": "Quand les mesures apportent peu d’information, l’a priori de population pèse davantage dans le résultat.",
      "en": "When measurements are weakly informative, the population prior carries more weight in the result."
    }
  ],
  "math-stats": [
    {
      "fr": "Une loi log-normale impose une clairance positive et permet des valeurs élevées plus rares, contrairement à une normale symétrique.",
      "en": "A log-normal distribution keeps clearance positive and allows a long upper tail, unlike a symmetric normal."
    },
    {
      "fr": "Sur de nombreuses études répétées, la méthode construit un intervalle contenant la vraie valeur environ 95 % du temps.",
      "en": "Across repeated studies, the interval-building method contains the true value about 95% of the time."
    },
    {
      "fr": "Une p-value faible indique des données peu compatibles avec l’hypothèse nulle ; elle ne mesure ni l’importance clinique ni la probabilité que l’hypothèse soit vraie.",
      "en": "A small p-value indicates data poorly compatible with the null hypothesis; it does not measure clinical importance or the probability the null is true."
    }
  ],
  "math-fisher": [
    {
      "fr": "La FIM anticipe la précision des paramètres à partir du modèle et des temps de prélèvement ; elle aide à concevoir l’étude.",
      "en": "The FIM predicts parameter precision from the model and sampling schedule, helping plan a study."
    },
    {
      "fr": "La borne de Cramér–Rao donne une limite minimale de variance pour les estimateurs non biaisés, sous les hypothèses requises.",
      "en": "The Cramér–Rao bound gives a minimum variance for unbiased estimators under the required assumptions."
    },
    {
      "fr": "Un prélèvement bien placé peut informer davantage qu’un prélèvement répété à un temps peu utile.",
      "en": "A well-timed sample may provide more information than another sample at an uninformative time."
    }
  ],
  "math-copula": [
    {
      "fr": "La copule représente comment les variables varient ensemble, indépendamment de la forme de chaque distribution marginale.",
      "en": "A copula represents how variables depend on one another separately from their individual marginal distributions."
    },
    {
      "fr": "Tirer poids et fonction rénale indépendamment peut créer des patients virtuels dont l’association de valeurs est irréaliste.",
      "en": "Sampling weight and renal function independently may create unrealistic combinations in virtual patients."
    },
    {
      "fr": "Le théorème de Sklar décompose une distribution jointe en ses marges et une fonction décrivant leur dépendance.",
      "en": "Sklar's theorem decomposes a joint distribution into marginal distributions and their dependence function."
    }
  ],
  "math-covariates": [
    {
      "fr": "Une covariable utile peut expliquer certaines différences entre patients et réduire la variance interindividuelle restante, sans garantie automatique.",
      "en": "A useful covariate may explain some patient differences and reduce remaining between-subject variance, though not automatically."
    },
    {
      "fr": "Pour la clairance, l’allométrie utilise souvent une puissance du rapport de poids, par exemple (WT/70)^0,75.",
      "en": "Clearance allometry often uses a power of a weight ratio, for example (WT/70)^0.75."
    },
    {
      "fr": "La sélection pas à pas répète des tests sur les mêmes données : les effets retenus peuvent être exagérés ou instables.",
      "en": "Stepwise selection repeatedly tests the same data: selected effects may become exaggerated or unstable."
    }
  ],
  "onco-tgi": [
    {
      "fr": "Dans ce modèle, l’effet antitumoral peut diminuer avec le temps malgré la poursuite du traitement : il représente une résistance acquise.",
      "en": "In this model, antitumor activity can weaken over time despite continued dosing, representing acquired resistance."
    },
    {
      "fr": "Un modèle conjoint compare l’évolution tumorale au risque d’événement pour relier la réponse précoce à la survie.",
      "en": "A joint model links tumor-size evolution to event risk, connecting early response with survival."
    },
    {
      "fr": "Bêta quantifie comment la mesure de la tumeur influence le risque instantané d’événement dans ce modèle.",
      "en": "Beta quantifies how tumor size affects instantaneous event risk in this model."
    }
  ],
  "onco-tox": [
    {
      "fr": "Les neutrophiles ont besoin de temps pour mûrir : leur niveau minimal peut arriver après le maximum de concentration.",
      "en": "Neutrophils need time to mature: the lowest count may occur after peak drug concentration."
    },
    {
      "fr": "Quand les neutrophiles baissent, le rétrocontrôle stimule leur production afin de favoriser la récupération.",
      "en": "When neutrophil counts fall, feedback stimulates production to support recovery."
    }
  ],
  "onco-models": [
    {
      "fr": "Gompertz décrit une croissance rapide au début qui ralentit à mesure que la tumeur grossit.",
      "en": "Gompertz models growth that is rapid at first and slows as the tumor becomes larger."
    },
    {
      "fr": "Séparer cellules sensibles et résistantes permet d’expliquer pourquoi la tumeur peut repartir malgré le traitement.",
      "en": "Separating sensitive and resistant cells can explain why a tumor regrows during treatment."
    },
    {
      "fr": "Un modèle TGI–OS utilise l’histoire de la taille tumorale pour modéliser le risque de décès, pas seulement la concentration sanguine.",
      "en": "A TGI–OS model uses tumor-size history to model death risk, not merely blood concentrations."
    }
  ],
  "infectio-pkpd": [
    {
      "fr": "Pour les bêta-lactamines, l’efficacité dépend surtout du temps pendant lequel la concentration libre dépasse la CMI.",
      "en": "For beta-lactams, activity chiefly depends on time during which unbound concentration exceeds MIC."
    },
    {
      "fr": "Les aminosides ont une activité fortement liée au pic ; une concentration maximale élevée par rapport à la CMI est recherchée.",
      "en": "Aminoglycoside activity is strongly peak-dependent, so a high peak relative to MIC is often targeted."
    }
  ],
  "infectio-tdm": [
    {
      "fr": "Pour une infection grave à MRSA et une CMI de 1 mg/L déterminée par microdilution, l’AUC24/CMI cible est généralement 400–600.",
      "en": "For serious MRSA infection with a broth-microdilution MIC of 1 mg/L, the usual AUC24/MIC target is 400–600."
    },
    {
      "fr": "Une clairance rénale augmentée élimine plus vite certains antibiotiques hydrophiles et peut réduire leur exposition.",
      "en": "Augmented renal clearance removes some hydrophilic antibiotics faster and can lower their exposure."
    }
  ],
  "infectio-viral": [
    {
      "fr": "Dans le modèle simple, le virus libre disparaît vite, puis la baisse reflète la perte plus lente des cellules encore infectées.",
      "en": "In the simple model, free virus falls quickly before a slower decline governed by loss of infected cells."
    },
    {
      "fr": "ε est la fraction de production virale bloquée par le traitement ; ce n’est ni le taux de clairance ni la perte des cellules.",
      "en": "ε is the fraction of viral production blocked by treatment, not viral clearance or infected-cell loss."
    },
    {
      "fr": "Si le virus continue à se multiplier sous traitement, des variants résistants peuvent être sélectionnés.",
      "en": "When virus continues replicating under treatment, resistant variants may be selected."
    }
  ],
  "mab-pk": [
    {
      "fr": "Le récepteur FcRn protège une partie des IgG de leur dégradation en les recyclant, ce qui allonge leur demi-vie.",
      "en": "FcRn protects some IgG from degradation through recycling, extending their half-life."
    },
    {
      "fr": "Les anticorps sont de grosses molécules qui restent surtout dans le plasma et l’espace interstitiel : leur volume est souvent faible.",
      "en": "Antibodies are large molecules found mainly in plasma and interstitial fluid, so their distribution volume is often small."
    }
  ],
  "mab-tmdd": [
    {
      "fr": "À faible concentration, la fixation à la cible peut éliminer une part notable du médicament ; cette voie peut saturer.",
      "en": "At low concentrations, target binding may remove substantial drug; this elimination pathway can saturate."
    },
    {
      "fr": "Quand la cible est saturée, ajouter du médicament ne renforce plus proportionnellement cette élimination : la PK paraît plus linéaire.",
      "en": "When the target is saturated, adding drug no longer increases that elimination proportionally, making PK more nearly linear."
    }
  ],
  "mab-ada": [
    {
      "fr": "Les ADA sont produits par le patient contre un médicament biologique. Ils peuvent modifier son devenir ou son action.",
      "en": "ADAs are produced by the patient against a biologic medicine. They may change its disposition or activity."
    },
    {
      "fr": "Certains ADA forment des complexes éliminés plus vite, réduisant l’exposition ; ce n’est pas systématique.",
      "en": "Some ADAs form complexes removed more quickly, reducing exposure; this is not universal."
    },
    {
      "fr": "Un anticorps neutralisant empêche directement le médicament d’exercer sa fonction, et pas seulement sa concentration de changer.",
      "en": "A neutralizing antibody directly blocks drug activity rather than only changing its concentration."
    }
  ],
  "pd-direct": [
    {
      "fr": "Dans un modèle direct, l’effet est calculé à partir de la concentration présente au même instant, sans délai ajouté.",
      "en": "In a direct-response model, effect is calculated from concentration at the same time without an added delay."
    },
    {
      "fr": "Dans Emax, EC50 correspond à la moitié de l’effet maximal du médicament, pas à la moitié de la concentration maximale.",
      "en": "In Emax, EC50 corresponds to half the maximum drug effect, not half the peak concentration."
    },
    {
      "fr": "Le coefficient de Hill change la pente de la relation concentration–effet autour d’EC50, pas la hauteur maximale du plateau.",
      "en": "The Hill coefficient changes curve steepness near EC50, not the maximum plateau height."
    }
  ]
};

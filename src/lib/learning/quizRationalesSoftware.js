/** Bilingual explanations for NONMEM, Monolix, nlmixr2 and model-informed dosing. */
export const softwareQuizRationales = {
  "tools-simulation": [
    {
      "fr": "mrgsolve et rxode2 calculent les courbes prévues par des équations PK/PD ; ajuster les paramètres demande une étape d’estimation distincte.",
      "en": "mrgsolve and rxode2 simulate PK/PD equations; estimating parameters from observed data is a separate task."
    },
    {
      "fr": "Une VPC simule de nombreux jeux d’observations afin de comparer la variabilité prédite à celle des données réelles.",
      "en": "A VPC simulates many datasets to compare predicted variability with real observations."
    },
    {
      "fr": "Des essais virtuels permettent de comparer des stratégies avant recrutement, mais ne démontrent pas une efficacité réelle.",
      "en": "Virtual trials compare strategies before recruitment but cannot establish real-world efficacy."
    }
  ],
  "tools-mipd": [
    {
      "fr": "Le MAP confronte les concentrations du patient au modèle de population pour obtenir une estimation individualisée.",
      "en": "MAP combines individual concentrations with a population model to estimate patient-specific parameters."
    },
    {
      "fr": "mapbayr s’appuie sur un modèle mrgsolve pour calculer les prédictions et ajuster les paramètres individuels.",
      "en": "mapbayr uses an mrgsolve model to simulate predictions and estimate individual parameters."
    },
    {
      "fr": "Le MIPD utilise un modèle et des données individuelles pour éclairer une dose adaptée, sous supervision clinique.",
      "en": "MIPD uses a model and individual data to inform tailored dosing under clinical supervision."
    }
  ],
  "residual-mipd": [
    {
      "fr": "Dans l’objectif MAP, réduire σ rend les observations plus influentes : le modèle cherche à les suivre davantage.",
      "en": "In a MAP objective, reducing σ gives observations more weight, so the model follows them more closely."
    },
    {
      "fr": "Si σ est presque nul, le modèle peut apprendre du bruit analytique comme s’il s’agissait d’un vrai signal du patient.",
      "en": "When σ is almost zero, the model may treat assay noise as a real patient-specific signal."
    },
    {
      "fr": "Le scénario Flat1 utilise environ 1 % d’erreur proportionnelle comme choix pragmatique dans les conditions étudiées, sans en faire une règle universelle.",
      "en": "Flat1 uses about 1% proportional error as a pragmatic choice under studied conditions, not a universal rule."
    }
  ],
  "tools-nonmem": [
    {
      "fr": "NONMEM est historiquement piloté par un fichier texte décrivant données, équations et estimation, lu via NM-TRAN.",
      "en": "NONMEM is traditionally driven by a text control stream describing data, equations and estimation, processed by NM-TRAN."
    },
    {
      "fr": "FOCE-I appartient aux méthodes historiques de NONMEM ; SAEM est une méthode stochastique distincte également disponible.",
      "en": "FOCE-I is a historic NONMEM estimation method; SAEM is a different stochastic method that is also available."
    }
  ],
  "nonmem-modele-structural": [
    {
      "fr": "ADVAN2 utilise la solution analytique d’un modèle oral à un compartiment : pas besoin d’intégrer numériquement les équations.",
      "en": "ADVAN2 uses the analytical solution for a one-compartment oral model, avoiding numerical ODE integration."
    },
    {
      "fr": "Avec TRANS2, CL et V peuvent recevoir séparément leurs effets de poids ou d’autres covariables, ce qui facilite l’interprétation.",
      "en": "With TRANS2, CL and V can have separate weight or other covariate effects, making interpretation easier."
    },
    {
      "fr": "A(2)/V donne des mg/L. Pour obtenir des ng/mL, il faut multiplier par 1000, ce qui revient à S2 = V/1000.",
      "en": "A(2)/V gives mg/L. Converting to ng/mL multiplies by 1000, equivalent to S2 = V/1000."
    }
  ],
  "nonmem-variabilite": [
    {
      "fr": "Le bloc OMEGA donne une variance : racine de 0,09 = 0,3 d’écart-type sur l’échelle des ETA.",
      "en": "OMEGA specifies a variance: square root of 0.09 gives an ETA standard deviation of 0.3."
    },
    {
      "fr": "Un bloc de taille deux estime deux variances et leur covariance ; une matrice diagonale ne contient pas cette covariance.",
      "en": "A two-effect BLOCK estimates two variances and their covariance; a diagonal matrix excludes covariance."
    },
    {
      "fr": "SAME réutilise la structure de variance pour plusieurs occasions, sans forcer les valeurs individuelles des ETA à être identiques.",
      "en": "SAME reuses the variance structure across occasions without forcing individual ETA values to be identical."
    },
    {
      "fr": "Un shrinkage ETA de 47 % signifie que les estimations individuelles sont fortement rapprochées de zéro : leur corrélation apparente est fragile.",
      "en": "ETA shrinkage of 47% means individual estimates are pulled markedly toward zero, making apparent correlations unreliable."
    }
  ],
  "nonmem-erreur-residuelle": [
    {
      "fr": "Avec INTER, le calcul de l’erreur dépend de la prédiction propre au patient et de ses ETA estimés, ce qui compte pour une erreur proportionnelle.",
      "en": "INTER evaluates residual error at each patient's estimated ETAs, which matters when error depends on predictions."
    },
    {
      "fr": "Pour un point sous la LOQ, M3 utilise la probabilité d’être sous cette limite, plutôt que d’inventer une concentration égale à LOQ/2.",
      "en": "For an observation below LOQ, M3 uses the probability of falling below that limit instead of inventing a LOQ/2 value."
    },
    {
      "fr": "Le graphique |IWRES| selon IPRED permet d’observer si la taille des erreurs individuelles change avec la concentration prévue.",
      "en": "Plotting |IWRES| against IPRED shows whether individual residual magnitude changes with predicted concentration."
    }
  ],
  "nonmem-moteur": [
    {
      "fr": "FO et FOCE-I n’approchent pas la même intégrale de la même manière : la différence d’OFV ne mesure donc pas un simple gain entre modèles.",
      "en": "FO and FOCE-I approximate the integral differently, so the OFV difference does not measure a simple improvement between models."
    },
    {
      "fr": "INTER tient compte du niveau d’erreur au paramètre individuel estimé, au lieu de le calculer seulement pour ETA = 0.",
      "en": "INTER evaluates residual error at the estimated individual ETA rather than only at ETA = 0."
    },
    {
      "fr": "Un arrêt pour erreurs d’arrondi signale une limite de précision numérique ; il faut vérifier les résultats, pas conclure immédiatement que le modèle est faux.",
      "en": "Termination due to rounding errors signals numerical precision limits; inspect results before deciding the model is wrong."
    }
  ],
  "nonmem-avance": [
    {
      "fr": "MU-referencing expose clairement la relation entre THETA et ETA, ce qui facilite certaines étapes de simulation et d’estimation.",
      "en": "MU-referencing makes THETA–ETA relationships explicit and helps certain simulation and estimation steps."
    },
    {
      "fr": "La transformation logit ramène n’importe quelle valeur réelle sur une fraction entre zéro et un : elle convient pour F.",
      "en": "The logit transformation maps real values to fractions between zero and one, making it suitable for F."
    },
    {
      "fr": "Un a priori externe est particulièrement utile quand les nouvelles données renseignent mal un paramètre, à condition d’en documenter la source et l’incertitude.",
      "en": "An external prior is most useful when new data poorly inform a parameter, provided its source and uncertainty are documented."
    }
  ],
  "tools-monolix": [
    {
      "fr": "Monolix utilise notamment SAEM pour estimer des modèles de population sans linéariser systématiquement leur structure.",
      "en": "Monolix uses SAEM to estimate population models without routinely linearizing their structure."
    },
    {
      "fr": "mlxtran décrit les équations et les paramètres du modèle ; ce n’est ni le jeu de données ni l’algorithme d’estimation.",
      "en": "mlxtran describes model equations and parameters, not the dataset or estimation algorithm."
    },
    {
      "fr": "Monolix propose une interface graphique et des diagnostics intégrés. La qualité scientifique dépend toujours du modèle et des données.",
      "en": "Monolix provides a graphical interface and integrated diagnostics. Scientific quality still depends on the model and data."
    }
  ],
  "monolix-modele-structural": [
    {
      "fr": "LONGITUDINAL contient les équations de la réponse mesurée au fil du temps, comme les concentrations en fonction des paramètres.",
      "en": "LONGITUDINAL contains equations describing measured outcomes over time, such as concentrations from model parameters."
    },
    {
      "fr": "Si les équations EDO sont écrites manuellement, la macro depot indique dans quel compartiment les doses entrent.",
      "en": "With manually written ODEs, a depot macro tells Monolix which compartment receives doses."
    },
    {
      "fr": "Dans pkmodel(), les noms ka, Cl et V suffisent à reconnaître le modèle oral à un compartiment attendu.",
      "en": "In pkmodel(), parameter names ka, Cl and V identify the intended one-compartment oral model."
    }
  ],
  "monolix-variabilite": [
    {
      "fr": "NONMEM attend dans OMEGA une variance de 0,09 ; Monolix attend l’écart-type correspondant, racine de 0,09 = 0,3.",
      "en": "NONMEM OMEGA uses variance 0.09; Monolix uses its standard deviation, square root of 0.09 = 0.3."
    },
    {
      "fr": "r(cl,v) est le coefficient de corrélation des effets individuels, compris entre −1 et 1, pas leur covariance.",
      "en": "r(cl,v) is the correlation of individual random effects between −1 and 1, not their covariance."
    },
    {
      "fr": "gamma_cl décrit la dispersion entre occasions du même patient, tandis qu’omega_cl décrit celle entre patients.",
      "en": "gamma_cl describes variability between occasions within a patient, while omega_cl describes differences between patients."
    },
    {
      "fr": "Avec log(WT), le paramètre de référence est celui d’un poids de 1 kg ; log(WT/70) le ramène à 70 kg.",
      "en": "With log(WT), the reference parameter corresponds to 1 kg; log(WT/70) gives a 70-kg reference."
    }
  ],
  "monolix-erreur-residuelle": [
    {
      "fr": "combined1 additionne les deux erreurs alors que combined2 combine leurs carrés : leur rapport est maximal lorsque a = b × f, et vaut alors √2.",
      "en": "combined1 adds the two errors while combined2 combines their squares: their ratio is greatest when a = b × f, and then equals √2."
    },
    {
      "fr": "Avec distribution=logNormal, constant(a) agit sur le logarithme des observations : a = 0,15 représente une dispersion relative d’environ 15 %.",
      "en": "With distribution=logNormal, constant(a) acts on log observations: a = 0.15 represents roughly 15% relative variability."
    },
    {
      "fr": "Le point censuré contribue via la probabilité que sa valeur soit inférieure à la LOQ, plutôt que par une valeur inventée.",
      "en": "A censored point contributes through its probability of lying below LOQ, rather than a fabricated value."
    },
    {
      "fr": "Des IWRES plus dispersés aux petites concentrations suggèrent que l’erreur proportionnelle seule oublie le bruit de base additif.",
      "en": "Wider IWRES at low concentrations suggest that proportional error alone misses a baseline additive-noise component."
    }
  ],
  "monolix-moteur": [
    {
      "fr": "La phase de lissage de SAEM réduit progressivement son pas : une courbe plate ne prouve pas à elle seule la bonne convergence.",
      "en": "SAEM's smoothing phase gradually reduces its step size: a flat curve alone does not prove good convergence."
    },
    {
      "fr": "SAEM met à jour les paramètres via les statistiques du modèle complété, sans recalculer à chaque étape la vraisemblance marginale exacte.",
      "en": "SAEM updates parameters through complete-data statistics without recomputing exact marginal likelihood at each step."
    },
    {
      "fr": "Les valeurs −2LL et OFV de logiciels différents peuvent avoir des approximations ou conventions distinctes : vérifiez avant toute comparaison.",
      "en": "−2LL and OFV from different software may use distinct approximations and conventions: check before comparing."
    }
  ],
  "monolix-avance": [
    {
      "fr": "Pour une fraction logitNormal, omega décrit la dispersion sur l’échelle logit, pas un pourcentage directement lisible.",
      "en": "For a logitNormal fraction, omega measures variation on the logit scale, not a directly interpretable percentage."
    },
    {
      "fr": "Un export traduit le modèle mais ne garantit ni la même méthode d’estimation ni des résultats identiques après relance.",
      "en": "An export translates the model but cannot guarantee identical estimation methods or identical fitted results."
    },
    {
      "fr": "L’auto-initialisation propose des valeurs de départ ; elle ne vérifie pas automatiquement les unités ni la pertinence du modèle.",
      "en": "Automatic initialization proposes starting values; it does not automatically check units or model suitability."
    }
  ],
  "tools-nlmixr2": [
    {
      "fr": "nlmixr2 est un ensemble d’outils libre et ouvert de l’écosystème R pour la modélisation PK de population.",
      "en": "nlmixr2 is an open-source collection of R tools for population PK modeling."
    },
    {
      "fr": "nlmixr2 propose plusieurs méthodes, dont SAEM et FOCEI, permettant différentes approches du même modèle.",
      "en": "nlmixr2 offers methods including SAEM and FOCEI, allowing different approaches to the same model."
    },
    {
      "fr": "rxode2 résout les équations PK/PD et peut aussi fonctionner seul pour des simulations.",
      "en": "rxode2 solves PK/PD equations and can also be used independently for simulation."
    }
  ],
  "nlmixr2-modele-structural": [
    {
      "fr": "Dans ini(), eta.cl ~ 0.09 fixe une variance initiale de 0,09 : l’écart-type correspondant vaut 0,3.",
      "en": "In ini(), eta.cl ~ 0.09 sets initial variance 0.09, corresponding to standard deviation 0.3."
    },
    {
      "fr": "linCmt() infère les compartiments selon les noms des paramètres : ka, cl et v décrivent un modèle oral à un compartiment.",
      "en": "linCmt() infers compartments from parameter names: ka, cl and v describe a one-compartment oral model."
    },
    {
      "fr": "cp ~ prop(prop.sd) relie la prédiction cp aux mesures avec une erreur relative dont prop.sd est l’écart-type.",
      "en": "cp ~ prop(prop.sd) links prediction cp to observations with relative error whose standard deviation is prop.sd."
    }
  ],
  "nlmixr2-variabilite": [
    {
      "fr": "eta.cl ~ 0.1 correspond à une variance initiale de 0,1 : racine de 0,1 vaut environ 0,32 d’écart-type.",
      "en": "eta.cl ~ 0.1 sets initial variance 0.1: its square root is about 0.32 standard deviation."
    },
    {
      "fr": "Dans cette écriture triangulaire, 0,05 est placé entre les deux variances : c’est la covariance des ETA.",
      "en": "In this triangular notation, 0.05 sits between the two variances: it is ETA covariance."
    },
    {
      "fr": "Le niveau occ partage une variance d’IOV pour toutes les occasions ; il n’ajoute pas quatre variances indépendantes.",
      "en": "The occ level shares one IOV variance across occasions rather than adding four independent variances."
    },
    {
      "fr": "La borne tka ≥ 0 s’applique au logarithme de ka : comme ka = exp(tka), elle impose ka ≥ 1 h⁻¹.",
      "en": "The bound tka ≥ 0 applies to log(ka): since ka = exp(tka), it forces ka ≥ 1 h⁻¹."
    }
  ],
  "nlmixr2-erreur-residuelle": [
    {
      "fr": "La façon de combiner erreurs additive et proportionnelle dépend d’addProp dans les contrôles ; la formule seule ne la fixe pas.",
      "en": "How additive and proportional errors combine depends on the addProp control setting; the model expression alone does not fix it."
    },
    {
      "fr": "prop.err = 0,118 est un écart-type relatif, soit environ 11,8 % de CV pour l’erreur proportionnelle.",
      "en": "prop.err = 0.118 is a relative standard deviation, corresponding to about 11.8% proportional CV."
    },
    {
      "fr": "Une observation censurée utilise DV comme limite de quantification : la vraisemblance intègre la probabilité de se trouver en dessous.",
      "en": "A censored observation stores the quantification limit in DV: likelihood includes the probability of falling below it."
    },
    {
      "fr": "Dans ini(), les paramètres fixes s’écrivent avec <- ; c’est leur usage dans prop() ou add() qui leur donne leur rôle résiduel.",
      "en": "In ini(), fixed parameters use <-; using them in prop() or add() makes them residual-error parameters."
    }
  ],
  "nlmixr2-moteur": [
    {
      "fr": "Des ajustements par SAEM et FOCEI peuvent donner des OFV calculées selon des approximations différentes ; leur soustraction n’est pas un LRT valide.",
      "en": "SAEM and FOCEI fits may produce OFVs using different approximations; subtracting them is not a valid likelihood-ratio test."
    },
    {
      "fr": "posthoc garde fixes les paramètres de population et estime seulement les écarts individuels, sans ré-estimer toute la population.",
      "en": "posthoc keeps population parameters fixed and estimates only individual deviations without refitting the population."
    },
    {
      "fr": "SAEM simule les effets individuels plutôt que de rechercher à chaque fois un mode conditionnel ; cela peut aider pour certains modèles difficiles.",
      "en": "SAEM simulates individual effects rather than repeatedly finding a conditional mode, which may help with difficult models."
    }
  ],
  "nlmixr2-avance": [
    {
      "fr": "La fonction expit transforme une valeur réelle en fraction entre 0 et 1 : nlmixr2 exige d’écrire ce lien dans le modèle.",
      "en": "The expit function maps any real number into a fraction between 0 and 1; nlmixr2 requires writing the link in the model."
    },
    {
      "fr": "Si b_cr n’est pas déclaré dans ini(), le logiciel peut l’interpréter comme une colonne de données attendue plutôt que comme un paramètre.",
      "en": "If b_cr is not declared in ini(), the software may interpret it as a required data column rather than a parameter."
    },
    {
      "fr": "Une graine fixe rend deux exécutions semblables ; varier la graine du SAEM aide à vérifier la stabilité, et rxode2 a ses propres réglages.",
      "en": "A fixed seed makes runs reproducible; varying SAEM seeds checks robustness, while rxode2 has separate controls."
    },
    {
      "fr": "babelmixr2 appelle une installation externe de NONMEM sous licence : il ne réimplémente pas NONMEM dans R.",
      "en": "babelmixr2 calls an external licensed NONMEM installation; it does not reimplement NONMEM inside R."
    }
  ]
};

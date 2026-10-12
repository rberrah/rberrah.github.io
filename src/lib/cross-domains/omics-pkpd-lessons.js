// Pure educational calculator. No observed individual PK, raw patient
// profiles or omics measurements are used here; nothing predicts a dose.
export const DEMO_REFERENCE = Object.freeze({
  doseMg: 5,
  apparentClearanceLPerHour: 25
});

/**
 * Hypothetical oral linear PK with a dimensionless, standardized molecular
 * score fixed before observing PK outcomes. Illustrative only.
 *
 * CL/F = (CL/F)_reference * exp(beta * signature).
 * AUC(0-infinity) = Dose / (CL/F), under linear kinetics and complete AUC
 * coverage; no effect on F can be separately inferred from oral samples.
 *
 * @param {{signature:number,beta:number,doseMg?:number,apparentClearanceLPerHour?:number}} args
 */
export function calculateSignatureExposure(args) {
  const {signature,beta,doseMg=DEMO_REFERENCE.doseMg,
    apparentClearanceLPerHour=DEMO_REFERENCE.apparentClearanceLPerHour}=args||{};
  if(![signature,beta,doseMg,apparentClearanceLPerHour].every(Number.isFinite)||
    Math.abs(signature)>3 || Math.abs(beta)>1 ||
    doseMg<=0 || apparentClearanceLPerHour<=0)
    throw new Error('Educational omics–PK/PD parameters must be finite and in the safe example range.');
  const apparentClearance=apparentClearanceLPerHour*Math.exp(beta*signature);
  const aucMgHourPerL=doseMg/apparentClearance;
  return {
    apparentClearanceLPerHour:apparentClearance,
    aucMgHourPerL,
    aucNgHourPerMl:aucMgHourPerL*1000,
    aucRatioToReference:Math.exp(-beta*signature),
    apparentClearanceRatioToReference:Math.exp(beta*signature),
    educationalOnly:true
  };
}

export const crossDomainLessons=[
  {
    id:'match',minutes:9,
    title:{
      fr:'Associer les bonnes données : patient, échantillon et temps',
      en:'Match the right data: patient, sample and time'
    },
    tagline:{
      fr:'Avant toute analyse, vérifier qui a été mesuré, quand et dans quel tissu.',
      en:'Before any analysis, identify who was measured, when, and in which tissue.'
    },
    steps:{
      fr:[
        'La pharmacométrie suit des doses, des concentrations et des effets dans le temps. Les omiques mesurent des gènes, protéines ou métabolites dans un échantillon biologique.',
        'La correspondance utilise subject_id, sample_id, omic, tissu, instant du prélèvement, heures des doses et période de l’AUC. Plusieurs échantillons d’un patient ne sont pas plusieurs patients.',
        'Une signature prétraitement peut être candidate pour expliquer la PK. Une signature mesurée après administration peut au contraire être une conséquence de l’exposition ou de la maladie.'
      ],
      en:[
        'Pharmacometrics follows doses, concentrations and effects over time. Omics measures genes, proteins or metabolites in biological specimens.',
        'Matching requires subject_id, sample_id, omic layer, tissue, collection time, dose times and the AUC window. Multiple samples from one patient are not additional patients.',
        'A pretreatment signature may help explain PK. A signature collected after dosing may instead reflect drug exposure or disease.'
      ]
    },
    takeaway:{
      fr:'Un appariement temporel incorrect peut créer une association trompeuse, même avec une excellente méthode statistique.',
      en:'Incorrect time alignment can produce misleading associations even with excellent statistical methods.'
    },
    quiz:{
      fr:{q:'Un patient a fourni trois prélèvements. Combien de sujets indépendants cela représente-t-il ?',a:['Trois','Un','Cela dépend du nombre de gènes'],correct:1,why:'Les prélèvements sont corrélés au sein du même patient.'},
      en:{q:'A patient supplied three specimens. How many independent people is that?',a:['Three','One','It depends on the number of genes'],correct:1,why:'Specimens remain clustered within that same person.'}
    },
    links:[{slug:'variabilite-iiv-iov',label:{fr:'Variabilité entre patients',en:'Between-patient variability'}}]
  },
  {
    id:'covariate',minutes:13,
    title:{
      fr:'Des signatures omiques aux covariables PopPK',
      en:'From omics signatures to PopPK covariates'
    },
    tagline:{
      fr:'Tester une signature sur CL/F ou un paramètre PD, sans confondre sélection et validation.',
      en:'Test a signature on CL/F or a PD parameter without confusing selection with validation.'
    },
    steps:{
      fr:[
        'MultiOmics peut identifier une signature moléculaire candidate. Le score de signature doit être défini avec une échelle explicite : par exemple une moyenne pondérée de gènes standardisés.',
        'Dans le modèle PopPK, la signature est une covariable systématique. Les ETA décrivent la variabilité individuelle restante. Une corrélation avec les ETA estimés sert au dépistage, pas de preuve finale.',
        'La liste des gènes, la standardisation, les poids du score et la sélection du modèle doivent être appris dans les seules données d’entraînement. On réestime ensuite le modèle et on évalue l’AUC prédite sur des patients indépendants.'
      ],
      en:[
        'MultiOmics can identify a candidate molecular signature. Define its score on an explicit scale, such as a weighted sum of standardized genes.',
        'In PopPK, the signature is a systematic covariate. ETAs describe remaining individual variability. Correlation with estimated ETAs is a screening aid, not final evidence.',
        'Learn gene selection, standardization, score weights and model selection using training data only. Refit the model and assess predicted AUC in independent patients.'
      ]
    },
    takeaway:{
      fr:'Une association omique–CL/F doit améliorer une prédiction externe au-delà des covariables cliniques, pas seulement un ajustement interne.',
      en:'An omics–CL/F association must improve external prediction beyond routine clinical covariates, not merely internal model fit.'
    },
    quiz:{
      fr:{q:'À quel moment faut-il choisir les gènes composant une signature si on utilise une validation croisée ?',a:['Sur toutes les données avant les plis','Dans chaque jeu d’entraînement','Après avoir vu le jeu de test'],correct:1,why:'Sinon les informations du test contaminent l’apprentissage (data leakage).'},
      en:{q:'When should signature genes be selected during cross-validation?',a:['On the full dataset before splitting','Within each training fold','After looking at the test fold'],correct:1,why:'Otherwise test information leaks into model development.'}
    },
    links:[{slug:'covariates-basics',label:{fr:'Covariables PopPK',en:'PopPK covariates'}},{slug:'valid-vpc',label:{fr:'Validation des modèles',en:'Model validation'}}]
  },
  {
    id:'pd',minutes:12,
    title:{
      fr:'De l’exposition PK aux omiques et à la réponse PD',
      en:'From PK exposure through omics to PD response'
    },
    tagline:{
      fr:'Utiliser les biomarqueurs dynamiques sans inverser causes et conséquences.',
      en:'Use dynamic biomarkers without reversing causes and consequences.'
    },
    steps:{
      fr:[
        'On estime d’abord l’exposition dans une fenêtre temporelle justifiée : concentration, AUC ou exposition libre. Une AUC prédite possède de l’incertitude.',
        'On teste ensuite si une signature biologique mesurée au bon moment est associée à cette exposition et à une réponse, par exemple la toxicité.',
        'L’inflammation, la fonction rénale et les traitements associés peuvent influencer simultanément exposition, omiques et toxicité. Une association exposition–signature–événement ne démontre pas une médiation causale.'
      ],
      en:[
        'First estimate exposure over a scientifically justified time window: concentration, AUC or unbound exposure. A model-predicted AUC carries uncertainty.',
        'Then test whether a molecular signature collected at the appropriate time relates to exposure and to a response such as toxicity.',
        'Inflammation, kidney function and concomitant therapy can influence exposure, omics and toxicity together. Exposure–signature–event association alone is not proof of causal mediation.'
      ]
    },
    takeaway:{
      fr:'Le temps des prélèvements et les facteurs de confusion doivent être modélisés avant toute conclusion sur le mécanisme.',
      en:'Sampling time and confounding must be handled before making mechanistic claims.'
    },
    quiz:{
      fr:{q:'Une protéine augmente après le traitement et prédit la toxicité. Que peut-on conclure immédiatement ?',a:['La protéine cause la toxicité','Une association temporelle à explorer','Elle prouve que la clairance a diminué'],correct:1,why:'Il faut examiner le temps, les facteurs de confusion et la causalité inverse.'},
      en:{q:'A protein increases after dosing and predicts toxicity. What can you conclude immediately?',a:['The protein causes toxicity','A temporal association worth testing','Clearance must have decreased'],correct:1,why:'Timing, confounding and reverse causation still need investigation.'}
    },
    links:[{slug:'pkpd',label:{fr:'Introduction PK/PD',en:'PK/PD introduction'}},{slug:'pd-indirect',label:{fr:'Réponse indirecte',en:'Indirect response'}}]
  },
  {
    id:'mechanistic',minutes:12,
    title:{
      fr:'Des protéines et voies biologiques aux modèles PBPK/QSP',
      en:'From proteins and pathways to PBPK/QSP models'
    },
    tagline:{
      fr:'Passer d’une association à un mécanisme vérifiable.',
      en:'Move from association toward a testable mechanism.'
    },
    steps:{
      fr:[
        'Un réseau de voies biologiques peut suggérer une enzyme, un transporteur ou une cible PD à examiner. Une suggestion n’est pas un paramètre mécanistique déjà quantifié.',
        'Pour PBPK, des quantités protéiques calibrées, une activité enzymatique mesurée et les informations physiologiques permettent éventuellement de renseigner une clairance intrinsèque. Expression ARN et activité enzymatique ne sont pas équivalentes.',
        'En QSP, on peut relier exposition, occupation de cible, réponse cellulaire et biomarqueurs. Les paramètres doivent rester identifiables, avec une validation sur des observations indépendantes.'
      ],
      en:[
        'A biological-pathway network can nominate enzymes, transporters or PD targets for investigation. A nomination is not an already-quantified mechanistic parameter.',
        'For PBPK, calibrated protein abundance, functional enzyme activity and physiological information may inform intrinsic clearance. RNA expression is not the same as enzyme activity.',
        'QSP can connect exposure, target occupancy, cellular response and biomarkers. Parameters must remain identifiable and models evaluated on independent observations.'
      ]
    },
    takeaway:{
      fr:'Le lien mécanistique exige des données fonctionnelles et une vérification quantitative, pas seulement une voie enrichie.',
      en:'Mechanistic linking requires functional measurements and quantitative checks, not merely an enriched pathway.'
    },
    quiz:{
      fr:{q:'Un gène CYP est deux fois plus exprimé en ARN. Quelle information manque pour doubler une clairance PBPK ?',a:['Aucune','L’activité/abondance fonctionnelle et la physiologie','La p-value seule'],correct:1,why:'L’ARN ne détermine pas directement l’abondance et l’activité de l’enzyme.'},
      en:{q:'CYP RNA expression doubles. What else is needed before doubling a PBPK clearance?',a:['Nothing','Functional abundance/activity and physiology','Only the p-value'],correct:1,why:'RNA does not directly establish enzyme protein abundance or catalytic function.'}
    },
    links:[{slug:'pbpk-intro',label:{fr:'Introduction PBPK',en:'PBPK introduction'}},{slug:'pd-direct',label:{fr:'Relation concentration–effet',en:'Concentration–effect relationship'}}]
  }
];

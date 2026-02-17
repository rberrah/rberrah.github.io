/** @type {import("./chapters.d").Chapter[]} */
const chapters = [
  {
    slug: 'introduction-variabilite',
    title: 'Introduction : PK vs PD et variabilité',
    tag: 'Chapitre 0',
    summary: 'PK (exposition) vs PD (réponse), pourquoi la variabilité impose des modèles.',
    slides: [1, 2, 3],
    formulas: ['AUC = \\int C(t) dt', 'CL = Dose / AUC'],
    steps: [
      { title: 'PK vs PD', body: 'PK = exposition (AUC, Cmax, CL, V). PD = réponse (Emax, EC50). Variabilité inter/intra.', viz: '01_HumanBody' },
      { title: 'Variabilité', body: 'IIV = variabilité inter-individuelle, IOV = inter-occasion, erreur résiduelle = σ analytique/modèle. Piège : ne pas confondre erreur analytique et variabilité biologique.', viz: '12_VariabilitySandbox' },
      { title: 'Fil rouge tacrolimus', body: 'Cas clinique TDM utilisé tout au long du cours.', viz: '13_ResidualError' }
    ],
    quiz: [
      { prompt: 'PK décrit ?', options: ['Ce que fait le corps au médicament', 'Ce que fait le médicament au corps'], correct: 0 },
      { prompt: 'PD décrit ?', options: ['Exposition', 'Réponse'], correct: 1 }
    ]
  },
  {
    slug: 'trois-approches',
    title: 'NCA vs PopPK vs PBPK',
    tag: 'Chapitre 1',
    summary: 'Choisir la bonne approche selon données et objectifs.',
    slides: [3, 6],
    steps: [
      { title: 'Comparer', body: 'NCA : descriptif, pas prédictif. PopPK : variabilité + simulation. PBPK : organes, interactions, extrapolation.', viz: '04_ThreeApproaches' }
    ],
    quiz: [{ prompt: 'PBPK utile pour ?', options: ['Données riches uniquement', 'Interactions/organe'], correct: 1 }]
  },
  {
    slug: 'nca',
    title: 'NCA : AUC, Cmax, Tmax, limites',
    tag: 'Chapitre 2',
    summary: 'Trapèzes, richesse d’échantillonnage, pourquoi NCA ne prédit pas.',
    slides: [4, 5],
    formulas: ['AUC_{trapèze} = \\sum (C_i + C_{i+1})/2 \cdot \Delta t'],
    steps: [
      { title: 'AUC trapèze', body: 'Rich vs sparse : impact sur AUC/Cmax/Tmax.', viz: '08_AUCTrap' }
    ],
    quiz: [{ prompt: 'NCA prédit un nouveau schéma ?', options: ['Oui', 'Non'], correct: 1 }]
  },
  {
    slug: 'modele-pk-mecanistique',
    title: 'Modèle PK : empirique vs mécanistique',
    tag: 'Chapitre 3',
    summary: 'Pourquoi préférer CL/V interprétables.',
    slides: [7, 8, 9],
    steps: [
      { title: '1C interprétable', body: 'CL/V définissent la pente et t1/2.', viz: '09_PK1C' },
      { title: 'Hydraulique', body: 'Réservoir + tuyau pour visualiser CL/V.', viz: '02_BucketSim' }
    ],
    formulas: ['C(t)=\\frac{Dose}{V}e^{-k t}', 't_{1/2}=\\ln 2 \cdot V/CL'],
    quiz: [{ prompt: 'Empirique vs mécanistique ?', options: ['Paramètres biologiques', 'Simple corrélation'], correct: 0 }]
  },
  {
    slug: 'ode-compartiments',
    title: 'ODE et compartiments',
    tag: 'Chapitre 4',
    summary: 'Flux, équations différentielles, 1C bolus.',
    slides: [10],
    steps: [
      { title: '1C bolus', body: 'dA/dt = -kA, k=CL/V. C(t) visualisée.', viz: '09_PK1C' }
    ],
    formulas: ['AUC = Dose/CL'],
    quiz: [{ prompt: 'k = ?', options: ['CL/V', 'V/CL'], correct: 0 }]
  },
  {
    slug: 'workflow-identifiabilite',
    title: 'Workflow modèle & identifiabilité',
    tag: 'Chapitre 5',
    summary: 'Enchaînement structure → variabilité → covariables → validation, et limites liées aux données.',
    slides: [11, 12, 18],
    steps: [
      { title: 'Étapes', body: 'Structure, variabilité, erreur, covariables, diagnostics.', viz: '15_OFVGame' }
    ],
    quiz: [{ prompt: 'ΔOFV seuil backward ?', options: ['3.84', '6.63'], correct: 1 }]
  },
  {
    slug: 'adme-structural',
    title: 'ADME : Absorption, Distribution, Élimination, Métabolisme',
    tag: 'Chapitre 6',
    summary: 'Choix des formes d’absorption, distribution, élimination.',
    slides: [13, 14, 15, 16, 17],
    steps: [
      { title: 'Absorption', body: 'Gut → central, ordre 1 vs ordre 0, lag time.', viz: '11_ADEChooser' },
      { title: 'Distribution 2C', body: 'Phase de distribution vs élimination.', viz: '10_PK2C' }
    ],
    quiz: [{ prompt: 'Lag time fait ?', options: ['Décale Tmax', 'Augmente CL'], correct: 0 }]
  },
  {
    slug: 'poppk-variabilite',
    title: 'PopPK et variabilité',
    tag: 'Chapitre 7',
    summary: 'Modèles mixtes, hiérarchie IIV/IOV, shrinkage.',
    slides: [20, 21],
    steps: [
      { title: 'Variabilité', body: 'Spaghetti + médiane, IIV/IOV, résiduel.', viz: '12_VariabilitySandbox' }
    ],
    formulas: ['CL_i = CL_{pop} e^{\eta_i}'],
    quiz: [{ prompt: 'Shrinkage haut =>', options: ['Infos riches', 'Infos pauvres'], correct: 1 }]
  },
  {
    slug: 'erreur-residuelle',
    title: 'Erreur résiduelle',
    tag: 'Chapitre 8',
    summary: 'Additive, proportionnelle, combinée et impact sur DV.',
    slides: [23, 24],
    steps: [{ title: 'DV vs IPRED', body: 'Points bruités vs courbe vraie.', viz: '13_ResidualError' }],
    quiz: [{ prompt: 'Erreur prop dépend de ?', options: ['Concentration', 'Temps seulement'], correct: 0 }]
  },
  {
    slug: 'covariables',
    title: 'Covariables et OFV',
    tag: 'Chapitre 9',
    summary: 'Allométrie, forward/backward, pièges.',
    slides: [26, 27, 28, 29],
    steps: [
      { title: 'Allométrie', body: 'CL ~ (WT/70)^0.75 ; V ~ (WT/70)^1.', viz: '14_AllometryCentering' },
      { title: 'Jeu ΔOFV', body: 'Décision p<0.05 / p<0.01.', viz: '15_OFVGame' }
    ],
    formulas: ['CL_i = CL_{std}(WT_i/70)^{0.75}'],
    quiz: [{ prompt: 'Seuil forward ?', options: ['3.84', '6.63'], correct: 0 }]
  },
  {
    slug: 'validation-diagnostics',
    title: 'Validation & diagnostics',
    tag: 'Chapitre 10',
    summary: 'GOF, VPC, bootstrap, shrinkage, FIM.',
    slides: [31, 48, 49, 50, 51, 52, 53, 54, 55, 56],
    steps: [
      { title: 'VPC', body: 'Bandes prédictives vs observations.', viz: '17_VPCCrashTest' },
      { title: 'SAEM convergence', body: 'Trace paramètres.', viz: '16_SAEMCycle' }
    ],
    quiz: [{ prompt: 'Si obs > bande 95%', options: ['OK', 'Modèle insuffisant'], correct: 1 }]
  },
  {
    slug: 'pkpd',
    title: 'PK/PD : effets directs et indirects',
    tag: 'Chapitre 11',
    summary: 'Emax, compartiment effet, turnover.',
    slides: [32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
    steps: [{ title: 'Grey box PD', body: 'Termes inconnus corrigés.', viz: '07_NeuralODE' }],
    formulas: ['E = E0 + \\frac{Emax \cdot C}{EC50 + C}'],
    quiz: [{ prompt: 'Compartiment effet sert à ?', options: ['Décaler la réponse', 'Augmenter CL'], correct: 0 }]
  },
  {
    slug: 'outils-estimation',
    title: 'Outils & estimation',
    tag: 'Chapitre 12',
    summary: 'Format de données, FOCE vs SAEM.',
    slides: [43, 44, 45, 46, 47],
    steps: [{ title: 'Cycle SAEM', body: 'S → A → M, phases stochastiques puis maximisation.', viz: '16_SAEMCycle' }],
    quiz: [{ prompt: 'FOCE-I est ?', options: ['Stochastique', 'Déterministe'], correct: 1 }]
  },
  {
    slug: 'bayes-ebes',
    title: 'Bayésien, EBEs, shrinkage',
    tag: 'Chapitre 13',
    summary: 'Posterior = prior × likelihood, MAP vs ML, shrinkage.',
    slides: [57, 58, 59, 60, 61, 62, 63, 64, 65],
    steps: [
      { title: 'Posterior', body: 'Prior × vraisemblance = posterior (intuition visuelle).', viz: '05_BayesianFit' },
      { title: 'EBE & shrinkage', body: 'Influence IIV et σ : données pauvres → EBEs “tirés” vers le prior.', viz: '18_BayesianShrinkage' }
    ],
    formulas: ['p(\\theta|y) \propto p(y|\\theta)p(\\theta)'],
    quiz: [{ prompt: 'Shrinkage bas =>', options: ['EBE ~ prior', 'EBE ~ data'], correct: 1 }]
  },
  {
    slug: 'clustering-ml-hybrides',
    title: 'Clustering EBEs, ML & hybrides',
    tag: 'Chapitre 14',
    summary: 'EBE clustering, VSURF, Neural ODE concept.',
    slides: [65, 66, 67, 68, 69, 70, 72],
    steps: [
      { title: 'Arbre décision', body: 'Chemins cachés.', viz: '06_DecisionTree' },
      { title: 'VSURF', body: 'Importance par étapes.', viz: '19_VSURF' },
      { title: 'Neural box', body: 'White/grey/black.', viz: '20_NeuralBox' }
    ],
    quiz: [{ prompt: 'Grey box =', options: ['NN seul', 'ODE + NN'], correct: 1 }]
  },
  {
    slug: 'tdm-conclusion',
    title: 'TDM & conclusion',
    tag: 'Chapitre 15',
    summary: 'TDM, adaptation de dose, messages clés.',
    slides: [71, 73, 74],
    steps: [
      { title: 'TDM tacrolimus', body: 'Objectifs C0 7–10 µg/L, adaptation dose.', viz: '18_BayesianShrinkage' }
    ],
    quiz: [{ prompt: 'Cible C0 tacro greffe rénale ?', options: ['7–10 µg/L', '>20 µg/L'], correct: 0 }]
  }
];

export default chapters;


const chapters = [
  {
    slug: 'intro-pk-pd',
    title: 'Introduction PK/PD et variabilité',
    tag: 'Chapitre 1',
    summary: 'Pourquoi la pharmacométrie, PK vs PD, variabilité inter/intra.',
    steps: [
      {
        title: 'PK vs PD',
        body:
          'PK (exposition) : AUC, Cmax, CL, V, Ka. PD (réponse) : Emax, EC50. Variabilité inter- et intra-patients => besoin de modèles.',
        viz: '01_HumanBody'
      },
      {
        title: 'Variabilité',
        body: 'IIV (η), IOV (κ), erreur résiduelle (σ). <strong>Piège :</strong> confondre variabilité intra et erreur analytique.',
        viz: '12_VariabilitySandbox'
      },
      { title: 'Fil rouge tacrolimus', body: 'Cas clinique TDM qui revient plus loin.', viz: '13_ResidualError' }
    ],
    quiz: [
      { prompt: 'PK décrit ?', options: ['Ce que fait le corps au médicament', 'Ce que fait le médicament au corps'], correct: 0 },
      { prompt: 'PD décrit ?', options: ['Exposition', 'Réponse'], correct: 1 }
    ]
  },
  {
    slug: 'nca',
    title: 'NCA et AUC trapezoïdale',
    tag: 'Chapitre 2',
    summary: 'AUC, Cmax, Tmax, forces et limites de la NCA.',
    steps: [
      { title: 'AUC trapèze', body: 'Différence riche vs sparse.', viz: '08_AUCTrap' }
    ],
    quiz: [{ prompt: 'La NCA prédit ?', options: ['Oui', 'Non'], correct: 1 }]
  },
  {
    slug: 'pk-compartiments-ode',
    title: 'Modèles à compartiments et ODE',
    tag: 'Chapitre 3',
    summary: '1C/2C, CL, V, Q, phases.',
    steps: [
      { title: '1 compartiment', body: 'Bolus IV, t½, AUC.', viz: '09_PK1C' },
      { title: '2 compartiments', body: 'Phase de distribution vs élimination.', viz: '10_PK2C' },
      { title: 'Hydraulique', body: 'Analogie réservoir/tuyau.', viz: '02_BucketSim' }
    ],
    quiz: [{ prompt: 'La phase rapide reflète ?', options: ['Distribution', 'Élimination'], correct: 0 }]
  },
  {
    slug: 'absorption',
    title: "Absorption : lag, transit, ordre 0/1",
    tag: 'Chapitre 4',
    summary: 'Ka, lag, transit, ordre zéro vs un.',
    steps: [
      {
        title: 'Formes d’absorption',
        body:
          "Ordre 1 : dA_gut/dt = -Ka·A_gut ; dA_c/dt = Ka·A_gut - (CL/V)·A_c. Lag time décale l'arrivée. Ordre 0 : perfusion constante. Transit : compartiments en série.",
        viz: '11_ADEChooser'
      }
    ],
    quiz: [{ prompt: 'Ordre 0 =', options: ['Perfusion', 'Diffusion passive'], correct: 0 }]
  },
  {
    slug: 'distribution',
    title: 'Distribution : V1/V2 et Q',
    tag: 'Chapitre 5',
    summary: 'Phases alpha/bêta, Q, volumes.',
    steps: [{ title: 'V1/V2/Q', body: 'Impact sur la pente initiale.', viz: '10_PK2C' }],
    quiz: [{ prompt: 'Q relie ?', options: ['V1 et V2', 'CL et V'], correct: 0 }]
  },
  {
    slug: 'elimination',
    title: 'Élimination : clairance et t½',
    tag: 'Chapitre 6',
    summary: 'CL, t½, métabolites, Michaelis-Menten.',
    steps: [{ title: 'CL et t½', body: 'Relation ke = CL/V.', viz: '09_PK1C' }],
    quiz: [{ prompt: 't½ = ln2 / ?', options: ['ka', 'ke'], correct: 1 }]
  },
  {
    slug: 'poppk-mixed-effects',
    title: 'PopPK et effets mixtes',
    tag: 'Chapitre 7',
    summary: 'θ, η, IIV/IOV, shrinkage.',
    steps: [
      {
        title: 'Variabilité',
        body: 'Spaghetti plot, η~N(0,ω²), κ pour IOV, σ pour résiduel. Shrinkage ↑ quand données pauvres.',
        viz: '12_VariabilitySandbox'
      }
    ],
    quiz: [{ prompt: 'Shrinkage élevé =>', options: ['Infos riches', 'Infos pauvres'], correct: 1 }]
  },
  {
    slug: 'covariables',
    title: 'Covariables et OFV',
    tag: 'Chapitre 8',
    summary: 'Allométrie, catégoriels, forward/backward.',
    steps: [
      { title: 'Allométrie', body: 'CL = CLpop (Poids/70)^0.75.', viz: '14_AllometryCentering' },
      { title: 'OFV', body: 'Seuils 3.84 / 6.63.', viz: '15_OFVGame' }
    ],
    quiz: [{ prompt: 'Seuil backward ?', options: ['3.84', '6.63'], correct: 1 }]
  },
  {
    slug: 'estimation',
    title: 'Estimation (FOCE-I vs SAEM)',
    tag: 'Chapitre 9',
    summary: 'Intuition des algos, convergence.',
    steps: [{ title: 'Cycle SAEM', body: 'S → A1 → A2 → M.', viz: '16_SAEMCycle' }],
    quiz: [{ prompt: 'SAEM : étape S ?', options: ['Simulation', 'Smoothing'], correct: 0 }]
  },
  {
    slug: 'diagnostics-validation',
    title: 'Diagnostics & validation',
    tag: 'Chapitre 10',
    summary: 'Obs/Pred, IWRES, VPC, bootstrap, FIM.',
    steps: [{ title: 'VPC', body: 'Crash test prédictif.', viz: '17_VPCCrashTest' }],
    quiz: [{ prompt: 'Si obs sortent des bandes ?', options: ['OK', 'Modèle à revoir'], correct: 1 }]
  },
  {
    slug: 'pkpd',
    title: 'PK/PD : effets directs et indirects',
    tag: 'Chapitre 11',
    summary: 'Emax, compartiment effet, turnover.',
    steps: [{ title: 'Grey box PD', body: 'Termes inconnus corrigés.', viz: '07_NeuralODE' }],
    quiz: [{ prompt: 'Compartiment effet sert à ?', options: ['Décaler la réponse', 'Augmenter CL'], correct: 0 }]
  },
  {
    slug: 'bayes-tdm',
    title: 'Bayésien & TDM',
    tag: 'Chapitre 12',
    summary: 'Prior/mesure → EBE, shrinkage, TDM.',
    steps: [
      { title: 'Posterior', body: 'Prior + likelihood.', viz: '05_BayesianFit' },
      { title: 'EBE et shrinkage', body: 'Influence IIV/σ.', viz: '18_BayesianShrinkage' }
    ],
    quiz: [{ prompt: 'Shrinkage bas =>', options: ['EBE proches prior', 'EBE proches data'], correct: 1 }]
  },
  {
    slug: 'ml-et-hybrides',
    title: 'ML & hybrides',
    tag: 'Chapitre 13',
    summary: 'RF/VSURF, Neural ODE, digital twin.',
    steps: [
      { title: 'Arbre décision', body: 'Chemins cachés.', viz: '06_DecisionTree' },
      { title: 'VSURF', body: 'Importance par étapes.', viz: '19_VSURF' },
      { title: 'Neural box', body: 'White/grey/black.', viz: '20_NeuralBox' }
    ],
    quiz: [{ prompt: 'Grey box =', options: ['NN seul', 'ODE + NN'], correct: 1 }]
  },
  {
    slug: 'cas-clinique-tacrolimus',
    title: 'Cas clinique Tacrolimus / TDM',
    tag: 'Chapitre 14',
    summary: 'Fil rouge : objectifs C0, variabilité, VPC, dose.',
    steps: [
      { title: 'Courbe patient', body: 'Observation tacro.', viz: '13_ResidualError' },
      { title: 'Bayésien TDM', body: 'Ajuster dose.', viz: '18_BayesianShrinkage' }
    ],
    quiz: [{ prompt: 'Objectif C0 tacro greffe rénale ?', options: ['7–10 µg/L', '20–25 µg/L'], correct: 0 }]
  }
];

export default chapters;

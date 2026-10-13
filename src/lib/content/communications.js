import { z } from 'zod';

const localizedText = z.object({ en: z.string().min(1), fr: z.string().min(1) });
const link = z.object({ label: localizedText, url: z.string().min(1) });

export const communicationSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: z.enum(['poster', 'oral']),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  authors: z.array(z.string().min(1)).min(1),
  presenter: z.string().optional(),
  affiliations: z.array(z.string().min(1)).default([]),
  event: z.string().min(1).optional(),
  eventUrl: z.string().url().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  year: z.number().int().min(1900).optional(),
  location: z.string().optional(),
  language: z.enum(['en', 'fr']),
  summary: localizedText,
  topics: z.array(z.string().min(1)).min(1),
  status: z.enum(['presented', 'upcoming', 'available']),
  pdf: z.string().startsWith('/').optional(),
  pptx: z.string().startsWith('/').optional(),
  image: z.string().startsWith('/').optional(),
  imageWidth: z.number().int().positive().optional(),
  imageHeight: z.number().int().positive().optional(),
  sourceRepository: z.string().min(1),
  sourcePath: z.string().min(1),
  sourceSha: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  relatedProject: link.optional(),
  doi: z.string().optional(),
  publication: link.optional(),
  video: link.optional(),
  notes: localizedText.optional()
});

export const pendingCommunicationSchema = z.object({
  sourcePath: z.string().min(1),
  sourceSha: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  estimatedType: z.enum(['poster', 'oral']),
  title: z.string().optional(),
  reason: localizedText
});

export const communications = z.array(communicationSchema).parse([
  {
    id: 'netpk-peprsn-2026',
    slug: 'netpk-peprsn-2026',
    type: 'poster',
    title: 'NetPK: fusing published biological knowledge into pharmacokinetic models through network diffusion',
    subtitle: 'A literature-augmented population PK framework — tacrolimus as proof of concept, built to generalize',
    authors: ['Racym Berrah', 'Pierre Marquet', 'Jean-Baptiste Woillard'],
    presenter: 'Racym Berrah',
    affiliations: [
      'Pharmacology & Transplantation, INSERM U1248, University of Limoges',
      'Department of Pharmacology, Toxicology and Pharmacovigilance, CHU Limoges'
    ],
    event: 'PEPR Santé Numérique — Journées annuelles 2026',
    eventUrl: 'https://pepr-santenum.fr/evenements/',
    date: '2026-10-13',
    dateEnd: '2026-10-15',
    year: 2026,
    location: 'Marseille, France',
    language: 'en',
    status: 'upcoming',
    summary: {
      en: 'NetPK encodes published tacrolimus pharmacology as network-prioritised, literature-fixed covariate modules in a nonlinear mixed-effects model. The poster reports an external sparse-sampling evaluation and virtual-patient use case, while identifying module ablation, uncertainty propagation and prospective dose-adjustment validation as next steps.',
      fr: 'NetPK encode la pharmacologie publiée du tacrolimus sous forme de modules de covariables fixés par la littérature et priorisés par diffusion sur réseau dans un modèle non linéaire à effets mixtes. Le poster présente une évaluation externe en prélèvements limités et un usage pour générer des patients virtuels, tout en identifiant l’ablation des modules, la propagation de l’incertitude et la validation prospective de l’adaptation posologique comme étapes suivantes.'
    },
    topics: ['NetPK', 'pharmacometrics', 'PopPK', 'tacrolimus', 'network diffusion', 'RWR', 'precision dosing', 'Bayesian estimation', 'virtual patients', 'digital health'],
    pdf: '/communications/files/netpk-peprsn-2026.pdf',
    pptx: '/communications/files/netpk-peprsn-2026.pptx',
    image: '/communications/previews/netpk-peprsn-2026.png',
    sourceRepository: 'Communication',
    sourcePath: 'NetPK_Poster_PEPRSN2026_A0.pptx',
    sourceSha: 'sha256:89fe61808e1d1c03f258871ba4b903e66d34b3a2e3b0061bfa29a47c6392a3a0'
  },
  {
    id: 'missed-dose-iatdmct-sfpt-2026',
    slug: 'missed-dose-iatdmct-sfpt-2026',
    type: 'oral',
    title: 'Missed dose management: Beyond “Skip or Take”',
    subtitle: 'A universal population half-life rule for missed and delayed oral doses',
    authors: ['Racym Berrah', 'Caroline Monchaud', 'Antoine Humeau', 'Jean-Baptiste Woillard', 'Pierre Marquet'],
    presenter: 'Racym Berrah',
    affiliations: [
      'Pharmacology & Transplantation, INSERM U1248, University of Limoges',
      'Department of Pharmacology, Toxicology and Pharmacovigilance, CHU Limoges',
      'FHU SUPORT, Limoges, France'
    ],
    event: 'IATDMCT & SFPT 2026',
    eventUrl: 'https://www.iatdmct-sfpt2026.org/schedule.aspx?culture=en-GB&e=2000',
    date: '2026-09-27',
    dateEnd: '2026-09-30',
    year: 2026,
    location: 'Rennes, France',
    language: 'en',
    status: 'presented',
    summary: {
      en: 'This oral presentation evaluates a population half-life rule for delayed or missed oral doses in simulations from 11 drug or formulation models. The reported target attainment is model based; complete missed doses, peak-related toxicity, available strengths and prospective clinical validation remain drug-specific safeguards.',
      fr: 'Cette communication orale évalue par simulation une règle fondée sur la demi-vie populationnelle pour les prises orales retardées ou oubliées, à partir de 11 modèles de médicaments ou de formulations. L’atteinte de cible rapportée est issue des modèles ; les oublis complets, la toxicité liée au pic, les dosages disponibles et la validation clinique prospective restent des précautions propres à chaque médicament.'
    },
    topics: ['missed doses', 'PopPK simulation', 'half-life', 'oral dosing', 'target attainment', 'precision dosing'],
    pdf: '/communications/files/missed-dose-iatdmct-sfpt-2026.pdf',
    pptx: '/communications/files/missed-dose-iatdmct-sfpt-2026.pptx',
    image: '/communications/previews/missed-dose-iatdmct-sfpt-2026.png',
    sourceRepository: 'Communication',
    sourcePath: 'Berrah_IATDMCT2026_MissedDose_Oral_v4.pptx',
    sourceSha: 'sha256:c7213c02cdb5573072c6aa0c46343a5f50303cc5061ad1e1c844ea3403075dba',
    relatedProject: {
      label: { en: 'Open MissedDose', fr: 'Ouvrir MissedDose' },
      url: 'https://tdmhub.shinyapps.io/MissedDoseApp/'
    }
  },
  {
    id: 'autonomous-pharmacometrics-page-2026',
    slug: 'autonomous-pharmacometrics-page-2026',
    type: 'poster',
    title: 'Toward autonomous pharmacometrics: a multi agent framework for structure discovery, covariate selection and gray-box modeling',
    authors: ['Racym Berrah', 'Jean-Baptiste Woillard'],
    presenter: 'Racym Berrah',
    affiliations: [
      'Pharmacology & Transplantation, INSERM U1248, University of Limoges',
      'Department of Pharmacology, Toxicology and Pharmacovigilance, CHU Limoges',
      'FHU SUPORT, Limoges, France'
    ],
    event: 'PAGE 2026',
    eventUrl: 'https://www.page-meeting.org/default.asp?id=52&keuze=meeting&meeting=2026',
    date: '2026-06-02',
    dateEnd: '2026-06-05',
    year: 2026,
    location: 'Dubrovnik, Croatia',
    language: 'en',
    status: 'presented',
    summary: {
      en: 'This proof of concept combines language-model agents with a custom SAEM engine for iterative population-PK structure and covariate exploration. Simulated and clinical tacrolimus examples showed feasibility, while code instability, execution safeguards, computational cost and continued pharmacometric supervision remained explicit limitations.',
      fr: 'Cette preuve de concept associe des agents fondés sur des modèles de langage à un moteur SAEM spécifique pour explorer de manière itérative la structure et les covariables d’un modèle PK de population. Les exemples simulés et cliniques de tacrolimus montrent la faisabilité, tout en maintenant comme limites explicites l’instabilité du code, les garde-fous d’exécution, le coût de calcul et la nécessité d’une supervision pharmacométrique.'
    },
    topics: ['pharmacometrics', 'multi-agent systems', 'SAEM', 'structure discovery', 'covariate selection', 'gray-box modeling', 'tacrolimus'],
    pdf: '/communications/files/autonomous-pharmacometrics-page-2026.pdf',
    pptx: '/communications/files/autonomous-pharmacometrics-page-2026.pptx',
    image: '/communications/previews/autonomous-pharmacometrics-page-2026.png',
    sourceRepository: 'Communication',
    sourcePath: 'Poster JUMPharma LLM.pptx',
    sourceSha: 'sha256:49b0502440b61955638a39689363cd152cdc745d289aab4457e13e56975e86d1',
    publication: {
      label: { en: 'PAGE 2026 conference abstract', fr: 'Résumé de conférence PAGE 2026' },
      url: 'https://www.page-meeting.org/Abstracts/toward-autonomous-pharmacometrics-a-multi-agent-framework-for-structure-discovery-covariate-selection-and-gray-box-modeling/'
    }
  },
  {
    id: 'residual-error-mipd-poster',
    slug: 'residual-error-mipd-poster',
    type: 'poster',
    title: 'Impact of Residual Error Handling on Model Informed Precision Dosing and AUC Calculation',
    authors: ['Racym Berrah', 'Mélanie Labriffe', 'Pierre Marquet', 'Caroline Monchaud', 'Jean-Baptiste Woillard'],
    presenter: 'Racym Berrah',
    affiliations: [
      'Pharmacology & Transplantation, INSERM U1248, University of Limoges',
      'Department of Pharmacology, Toxicology and Pharmacovigilance, CHU Limoges',
      'FHU SUPORT, Limoges, France'
    ],
    language: 'en',
    status: 'available',
    summary: {
      en: 'This poster explores how residual-error assumptions influence maximum a posteriori Bayesian estimation of AUC from rich tacrolimus, iohexol and mycophenolate mofetil profiles. It compares the published error models with scaled, 5%, 1% and near-zero proportional-error settings. The displayed analyses favor 1% or near-zero error in these datasets, while also reporting rare overfitting and warning that a near-zero setting attributes almost all observed variability to structural parameters rather than measurement noise.',
      fr: 'Ce poster explore l’influence des hypothèses d’erreur résiduelle sur l’estimation bayésienne maximale a posteriori de l’AUC à partir de profils riches de tacrolimus, d’iohexol et de mycophénolate mofétil. Il compare les modèles d’erreur publiés à des erreurs proportionnelles réduites, fixées à 5 %, 1 % ou presque nulles. Les analyses affichées favorisent 1 % ou une erreur presque nulle dans ces jeux de données, tout en signalant de rares surajustements et le fait qu’une erreur presque nulle attribue l’essentiel de la variabilité observée aux paramètres structurels plutôt qu’au bruit de mesure.'
    },
    topics: ['residual error', 'MAP Bayesian estimation', 'AUC', 'precision dosing', 'tacrolimus', 'iohexol', 'mycophenolate mofetil'],
    pdf: '/communications/files/residual-error-mipd-poster.pdf',
    pptx: '/communications/files/residual-error-mipd-poster.pptx',
    image: '/communications/previews/residual-error-mipd-poster.png',
    imageWidth: 1600,
    imageHeight: 2262,
    sourceRepository: 'Communication',
    sourcePath: 'Poster Residual.pptx',
    sourceSha: 'sha256:5da8f4eff444f802a4bc4cf9d99fea396de829e7b7f0732cdcd40d2bbdaacd0f',
    publication: {
      label: { en: 'Related peer-reviewed article', fr: 'Article scientifique associé' },
      url: 'https://doi.org/10.1097/FTD.0000000000001413'
    },
    notes: {
      en: 'The source poster does not state its meeting or presentation date. It is therefore published here without inferred event metadata.',
      fr: 'Le poster source ne précise ni son congrès ni sa date de présentation. Il est donc publié ici sans métadonnées d’événement déduites.'
    }
  }
]);

export const pendingCommunications = z.array(pendingCommunicationSchema).parse([
  {
    sourcePath: 'Berrah_IATDMCT2026_MissedDose_Oral_v3_CM.pptx',
    sourceSha: 'sha256:cf9a2b6ea915d19388b22b494a1be75f870717dbad10772beba3f61f485628ce',
    estimatedType: 'oral',
    title: 'Missed dose management: Beyond “Skip or Take”',
    reason: {
      en: 'Superseded working version; v4 is the retained conference file.',
      fr: 'Version de travail remplacée ; la v4 est le fichier de conférence retenu.'
    }
  }
]);

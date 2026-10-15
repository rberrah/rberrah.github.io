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
  eventStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  eventEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  presentationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
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
  sourceCollection: z.string().min(1),
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
    eventStart: '2026-10-13',
    eventEnd: '2026-10-15',
    presentationDate: '2026-10-14',
    location: 'Marseille, France',
    language: 'en',
    status: 'presented',
    summary: {
      en: 'NetPK encodes published tacrolimus pharmacology as network-prioritised, literature-fixed covariate modules in a nonlinear mixed-effects model. The poster reports an external sparse-sampling evaluation and virtual-patient use case, while identifying module ablation, uncertainty propagation and prospective dose-adjustment validation as next steps.',
      fr: 'NetPK encode la pharmacologie publiée du tacrolimus sous forme de modules de covariables fixés par la littérature et priorisés par diffusion sur réseau dans un modèle non linéaire à effets mixtes. Le poster présente une évaluation externe en prélèvements limités et un usage pour générer des patients virtuels, tout en identifiant l’ablation des modules, la propagation de l’incertitude et la validation prospective de l’adaptation posologique comme étapes suivantes.'
    },
    topics: ['NetPK', 'pharmacometrics', 'PopPK', 'tacrolimus', 'network diffusion', 'RWR', 'precision dosing', 'Bayesian estimation', 'virtual patients', 'digital health'],
    pdf: '/communications/files/netpk-peprsn-2026.pdf',
    pptx: '/communications/files/netpk-peprsn-2026.pptx',
    image: '/communications/previews/netpk-peprsn-2026.png',
    sourceCollection: 'Communication',
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
    eventStart: '2026-09-27',
    eventEnd: '2026-09-30',
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
    sourceCollection: 'Communication',
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
    eventStart: '2026-06-02',
    eventEnd: '2026-06-05',
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
    sourceCollection: 'Communication',
    sourcePath: 'Poster JUMPharma LLM.pptx',
    sourceSha: 'sha256:49b0502440b61955638a39689363cd152cdc745d289aab4457e13e56975e86d1',
    publication: {
      label: { en: 'PAGE 2026 conference abstract', fr: 'Résumé de conférence PAGE 2026' },
      url: 'https://www.page-meeting.org/Abstracts/toward-autonomous-pharmacometrics-a-multi-agent-framework-for-structure-discovery-covariate-selection-and-gray-box-modeling/'
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
  },
  {
    sourcePath: 'Poster Residual.pptx',
    sourceSha: 'sha256:5da8f4eff444f802a4bc4cf9d99fea396de829e7b7f0732cdcd40d2bbdaacd0f',
    estimatedType: 'poster',
    title: 'Impact of Residual Error Handling on Model Informed Precision Dosing and AUC Calculation',
    reason: {
      en: 'Pending: the meeting, year and public presentation status are not identified with certainty in the source file.',
      fr: 'En attente : le congrès, l’année et le statut public de la présentation ne sont pas identifiés avec certitude dans le fichier source.'
    }
  }
]);

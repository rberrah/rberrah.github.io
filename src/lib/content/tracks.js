// @ts-nocheck
// Définition des parcours (tracks). Chaque chapitre porte un champ `track`
// dans son frontmatter ; le regroupement se fait sur ce champ.

export const tracks = [
  {
    id: 'core',
    layer: 'tronc',
    i18n: {
      en: { label: 'Track 1', title: 'Core pharmacometrics', tagline: "From the body's handling of a drug to clearance, variability and individualized dosing." },
      fr: { label: 'Parcours 1', title: 'Pharmacométrie fondamentale', tagline: "Du devenir du médicament dans l'organisme à la clairance, la variabilité et l'individualisation." }
    },
    accent: 'var(--accent-pk)', status: 'available', visual: 'core-visual'
  },
  {
    id: 'math',
    layer: 'reference',
    i18n: {
      en: { label: 'Track 2', title: 'Mathematics', tagline: 'The math toolbox: differential equations, likelihood, statistics, the Fisher matrix and copulas.' },
      fr: { label: 'Parcours 2', title: 'Mathématiques', tagline: "La boîte à outils : équations différentielles, vraisemblance, statistiques, matrice de Fisher et copules." }
    },
    accent: '#5b6b7a', status: 'available', visual: 'math-visual'
  },
  {
    id: 'nca',
    layer: 'approfondissement',
    i18n: {
      en: { label: 'Track 3', title: 'Non-compartmental analysis', tagline: 'Reading the data without a model: AUC, clearance, half-life and bioavailability.' },
      fr: { label: 'Parcours 3', title: 'Analyse non-compartimentale', tagline: "Lire les données sans modèle : AUC, clairance, demi-vie et biodisponibilité." }
    },
    accent: '#3f7d8c', status: 'available', visual: 'nca-visual'
  },
  {
    id: 'pbpk',
    layer: 'approfondissement',
    i18n: {
      en: { label: 'Track 4', title: 'PBPK', tagline: 'Physiology-based models: organs, blood flows, partition coefficients and IVIVE.' },
      fr: { label: 'Parcours 4', title: 'PBPK', tagline: "Modèles physiologiques : organes, débits sanguins, coefficients de partage et IVIVE." }
    },
    accent: '#7b5aa6', status: 'available', visual: 'pbpk-visual'
  },
  {
    id: 'pd',
    layer: 'approfondissement',
    i18n: {
      en: { label: 'Track 5', title: 'Pharmacodynamics', tagline: 'PD models in depth: direct effect, indirect response, effect-compartment, tolerance and survival (OS/PFS).' },
      fr: { label: 'Parcours 5', title: 'Pharmacodynamie', tagline: "Les modèles PD en détail : effet direct, réponse indirecte, effet-compartiment, tolérance et survie (OS/PFS)." }
    },
    accent: '#5b8c3a', status: 'available', visual: 'pd-visual'
  },
  {
    id: 'onco',
    layer: 'domaine',
    i18n: {
      en: { label: 'Track 6', title: 'Oncology', tagline: 'Tumour growth models, exposure–response, myelosuppression and joint survival models.' },
      fr: { label: 'Parcours 6', title: 'Oncologie', tagline: "Croissance tumorale, relation exposition–réponse, myélosuppression et modèles joints de survie." }
    },
    accent: '#9c4f6a', status: 'available', visual: 'onco-visual'
  },
  {
    id: 'infectio',
    layer: 'domaine',
    i18n: {
      en: { label: 'Track 7', title: 'Infectious diseases', tagline: 'PK/PD indices of anti-infectives and antibiotic therapeutic drug monitoring.' },
      fr: { label: 'Parcours 7', title: 'Infectiologie', tagline: "Indices PK/PD des anti-infectieux et suivi thérapeutique des antibiotiques." }
    },
    accent: '#2f7d6e', status: 'available', visual: 'infectio-visual'
  },
  {
    id: 'mab',
    layer: 'domaine',
    i18n: {
      en: { label: 'Track 8', title: 'Monoclonal antibodies', tagline: 'The particular PK of mAbs, target-mediated drug disposition (TMDD) and immunogenicity (ADA).' },
      fr: { label: 'Parcours 8', title: 'Anticorps monoclonaux', tagline: "La PK particulière des anticorps, la disposition médiée par la cible (TMDD) et l'immunogénicité (ADA)." }
    },
    accent: '#a06a2c', status: 'available', visual: 'mab-visual'
  },
  {
    id: 'ai',
    layer: 'approfondissement',
    i18n: {
      en: { label: 'Track 9', title: 'AI in pharmacometrics', tagline: 'Grey-box models, neural ODEs and machine learning, framed by validation and uncertainty.' },
      fr: { label: 'Parcours 9', title: 'IA en pharmacométrie', tagline: "Modèles grey-box, Neural ODE et apprentissage automatique, avec validation et incertitude." }
    },
    accent: 'var(--accent-ai)', status: 'available', visual: 'ai-visual'
  },
  {
    id: 'valid',
    layer: 'approfondissement',
    i18n: {
      en: { label: 'Track 10', title: 'Model validation', tagline: 'Is the model trustworthy? Precision (RSE), diagnostic plots, NPDE, VPC and bootstrap.' },
      fr: { label: 'Parcours 10', title: 'Validation de modèle', tagline: "Le modèle est-il fiable ? Précision (RSE), graphiques diagnostiques, NPDE, VPC et bootstrap." }
    },
    accent: '#8a7d3a', status: 'available', visual: 'valid-visual'
  },
  {
    id: 'trials',
    layer: 'domaine',
    i18n: {
      en: { label: 'Track 11', title: 'Interpretation & clinical trials', tagline: 'From model to decision: first-in-human (MABEL), clinical trial simulation and interpretation.' },
      fr: { label: 'Parcours 11', title: 'Interprétation et essais cliniques', tagline: "Du modèle à la décision : première dose (MABEL), simulation d'essais et interprétation." }
    },
    accent: '#6a5a8c', status: 'available', visual: 'trials-visual'
  },
  {
    id: 'tools',
    layer: 'reference',
    i18n: {
      en: { label: 'Track 12', title: 'Software & tools', tagline: 'What is common to every tool: estimation algorithms, simulation and model-informed precision dosing.' },
      fr: { label: 'Parcours 12', title: 'Outils & logiciels', tagline: "Ce qui est commun à tous les outils : algorithmes d'estimation, simulation et dosage de précision." }
    },
    accent: '#4d4d5c', status: 'available', visual: 'tools-visual'
  },
  // Un parcours par LOGICIEL, sur une trame identique (présentation → modèle structural →
  // variabilité → erreur résiduelle → la particularité du moteur → pour aller plus loin).
  // La trame commune est délibérée : elle rend les trois outils COMPARABLES chapitre par
  // chapitre. Couche `reference` : on les consulte, on ne les lit pas en linéaire.
  {
    id: 'nonmem',
    layer: 'reference',
    i18n: {
      en: { label: 'Track 13', title: 'NONMEM', tagline: 'The historical standard: control stream, $PK/$ERROR blocks, FOCE-I and the regulatory dossier.' },
      fr: { label: 'Parcours 13', title: 'NONMEM', tagline: "Le standard historique : control stream, blocs \$PK/\$ERROR, FOCE-I et le dossier réglementaire." }
    },
    accent: '#6b4f3a', status: 'available', visual: 'tools-visual'
  },
  {
    id: 'monolix',
    layer: 'reference',
    i18n: {
      en: { label: 'Track 14', title: 'Monolix', tagline: 'The graphical workflow: the mlxtran language, the SAEM engine and built-in diagnostics.' },
      fr: { label: 'Parcours 14', title: 'Monolix', tagline: "Le workflow graphique : le langage mlxtran, le moteur SAEM et les diagnostics intégrés." }
    },
    accent: '#2f6f8c', status: 'available', visual: 'tools-visual'
  },
  {
    id: 'nlmixr2',
    layer: 'reference',
    i18n: {
      en: { label: 'Track 15', title: 'nlmixr2', tagline: 'Open source in R: the ini/model syntax, the rxode2 engine, FOCEI and SAEM in one script.' },
      fr: { label: 'Parcours 15', title: 'nlmixr2', tagline: "L'open source en R : la syntaxe ini/model, le moteur rxode2, FOCEI et SAEM dans un seul script." }
    },
    accent: '#3a6b4f', status: 'available', visual: 'tools-visual'
  }
];

export function trackById(id) {
  return tracks.find((t) => t.id === id);
}

/**
 * Group an ordered chapter list by track id (from each chapter's `track` field).
 * @param {{track?:string}[]} chapters
 * @returns {Record<string, any[]>}
 */
export function chaptersByTrack(chapters) {
  /** @type {Record<string, any[]>} */
  const grouped = {};
  for (const t of tracks) grouped[t.id] = [];
  for (const c of chapters) {
    const id = grouped[c.track] ? c.track : 'core';
    grouped[id].push(c);
  }
  return grouped;
}

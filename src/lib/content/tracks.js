// @ts-nocheck
// Définition des parcours (tracks). Chaque chapitre porte un champ `track`
// dans son frontmatter ; le regroupement se fait sur ce champ.

export const tracks = [
  {
    id: 'core',
    i18n: {
      en: { label: 'Track 1', title: 'Core pharmacometrics', tagline: "From the body's handling of a drug to clearance, variability and individualized dosing." },
      fr: { label: 'Parcours 1', title: 'Pharmacométrie fondamentale', tagline: "Du devenir du médicament dans l'organisme à la clairance, la variabilité et l'individualisation." }
    },
    accent: 'var(--accent-pk)', status: 'available', visual: 'core-visual'
  },
  {
    id: 'math',
    i18n: {
      en: { label: 'Track 2', title: 'Mathematics', tagline: 'The math toolbox: differential equations, exponentials, regression and likelihood.' },
      fr: { label: 'Parcours 2', title: 'Mathématiques', tagline: "La boîte à outils : équations différentielles, exponentielles, régression et vraisemblance." }
    },
    accent: '#5b6b7a', status: 'available', visual: 'math-visual'
  },
  {
    id: 'onco',
    i18n: {
      en: { label: 'Track 3', title: 'Oncology', tagline: 'Tumour growth models, exposure–response and chemotherapy-induced toxicity.' },
      fr: { label: 'Parcours 3', title: 'Oncologie', tagline: "Croissance tumorale, relation exposition–réponse et toxicité des chimiothérapies." }
    },
    accent: '#9c4f6a', status: 'available', visual: 'onco-visual'
  },
  {
    id: 'infectio',
    i18n: {
      en: { label: 'Track 4', title: 'Infectious diseases', tagline: 'PK/PD indices of anti-infectives and antibiotic therapeutic drug monitoring.' },
      fr: { label: 'Parcours 4', title: 'Infectiologie', tagline: "Indices PK/PD des anti-infectieux et suivi thérapeutique des antibiotiques." }
    },
    accent: '#2f7d6e', status: 'available', visual: 'infectio-visual'
  },
  {
    id: 'mab',
    i18n: {
      en: { label: 'Track 5', title: 'Monoclonal antibodies', tagline: 'The particular PK of mAbs and target-mediated drug disposition (TMDD).' },
      fr: { label: 'Parcours 5', title: 'Anticorps monoclonaux', tagline: "La PK particulière des anticorps et la disposition médiée par la cible (TMDD)." }
    },
    accent: '#a06a2c', status: 'available', visual: 'mab-visual'
  },
  {
    id: 'ai',
    i18n: {
      en: { label: 'Track 6', title: 'AI in pharmacometrics', tagline: 'Grey-box models, neural ODEs and machine learning, framed by validation and uncertainty.' },
      fr: { label: 'Parcours 6', title: 'IA en pharmacométrie', tagline: "Modèles grey-box, Neural ODE et apprentissage automatique, avec validation et incertitude." }
    },
    accent: 'var(--accent-ai)', status: 'available', visual: 'ai-visual'
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

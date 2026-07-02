// @ts-nocheck
// Course track definitions. Visuals are local CSS classes to avoid runtime
// dependencies on remote images.

export const tracks = [
  {
    id: 'core',
    i18n: {
      en: {
        label: 'Track 1',
        title: 'Core pharmacometrics',
        tagline: "From the body's handling of a drug to clearance, variability and individualized dosing."
      },
      fr: {
        label: 'Parcours 1',
        title: 'Pharmacométrie fondamentale',
        tagline: "Du devenir du médicament dans l'organisme à la clairance, la variabilité et l'individualisation."
      }
    },
    accent: 'var(--accent-pk)',
    status: 'available',
    visual: 'core-visual'
  },
  {
    id: 'ai',
    i18n: {
      en: {
        label: 'Track 2',
        title: 'AI in pharmacometrics',
        tagline: 'Grey-box models, neural ODEs and machine learning, framed by validation and uncertainty.'
      },
      fr: {
        label: 'Parcours 2',
        title: 'IA en pharmacométrie',
        tagline: "Modèles grey-box, Neural ODE et apprentissage automatique, avec validation et incertitude."
      }
    },
    accent: 'var(--accent-ai)',
    status: 'upcoming',
    visual: 'ai-visual'
  }
];

// Chapters that belong to the AI track; everything else defaults to core.
const aiSlugs = new Set(['neural-ode']);

export function trackOf(slug) {
  return aiSlugs.has(slug) ? 'ai' : 'core';
}

export function trackById(id) {
  return tracks.find((t) => t.id === id);
}

/**
 * Group an ordered chapter list by track id.
 * @param {{slug:string}[]} chapters
 * @returns {Record<string, any[]>}
 */
export function chaptersByTrack(chapters) {
  const grouped = { core: [], ai: [] };
  for (const c of chapters) {
    const id = trackOf(c.slug);
    (grouped[id] ??= []).push(c);
  }
  return grouped;
}

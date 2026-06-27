// @ts-nocheck
// Course track definitions. Tracks group chapters into learning paths.
// Phase 1 ships the "Core pharmacometrics" track; the "AI" track is previewed.

export const tracks = [
  {
    id: 'core',
    label: 'Track 1',
    title: 'Core pharmacometrics',
    tagline: 'From the body’s handling of a drug to clearance, variability and individualized dosing.',
    accent: 'var(--accent-pk)',
    status: 'available',
    thumbnail:
      'https://images.pexels.com/photos/3735705/pexels-photo-3735705.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
  },
  {
    id: 'ai',
    label: 'Track 2',
    title: 'AI in pharmacometrics',
    tagline: 'Grey-box models, neural ODEs and machine learning — framed by validation and uncertainty.',
    accent: 'var(--accent-ai)',
    status: 'upcoming',
    thumbnail:
      'https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwYWJzdHJhY3QlMjBub2RlfGVufDB8fHx8MTc4MjU2MzEwM3ww&ixlib=rb-4.1.0&q=85'
  }
];

// Chapters that belong to the AI track (everything else defaults to core).
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

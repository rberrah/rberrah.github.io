// Génère AUTOMATIQUEMENT la liste des pages à prérendre à partir des chapitres.
// Ajouter un chapitre Markdown suffit : son URL est incluse au build sans
// toucher à svelte.config.js.
import chapters from '$lib/content/loadChapters';

export const prerender = true;

/** @type {() => Array<{ slug: string }>} */
export function entries() {
  return chapters.map((c) => ({ slug: c.slug }));
}

// Prerender every known chapter from the lightweight metadata index.
// The full Markdown body is loaded lazily for the requested slug only.
import chapters from '#lib/content/loadChapters.js';
import { loadChapter } from '#lib/content/loadChapter.js';

export const prerender = true;

/** @type {() => Array<{ slug: string }>} */
export function entries() {
  return chapters.map((chapter) => ({ slug: chapter.slug }));
}

/** @param {{ params: { slug: string } }} event */
export async function load({ params }) {
  return { chapter: await loadChapter(params.slug) };
}

import { parseChapterMarkdown } from './markdown';
import { validateChapter, validateSlidesMapping } from './schema';

const modules = import.meta.glob('/src/content/chapters/*.md', { query: '?raw', import: 'default', eager: true });

/** @type {import('./chapters.d').Chapter[]} */
const chapters = [];

for (const [path, raw] of Object.entries(modules)) {
  const { frontmatter, steps, bodyHtml } = parseChapterMarkdown(/** @type {string} */ (raw));
  validateChapter(frontmatter);
  chapters.push({
    ...frontmatter,
    steps,
    bodyHtml
  });
}

chapters.sort((a, b) => (a.tag || '').localeCompare(b.tag || ''));

validateSlidesMapping(chapters);

export default chapters;

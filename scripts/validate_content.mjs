import fs from 'fs';
import path from 'path';
import { parseChapterMarkdown } from '../src/lib/content/markdown.js';
import { validateChapter, validateSlidesMapping } from '../src/lib/content/schema.js';

const dir = path.join('src', 'content', 'chapters');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

const chapters = [];
for (const file of files) {
  const raw = fs.readFileSync(path.join(dir, file), 'utf8');
  const { frontmatter, steps } = parseChapterMarkdown(raw);
  try {
    validateChapter(frontmatter);
    chapters.push({ ...frontmatter, steps });
  } catch (e) {
    console.error(`Erreur dans ${file}: ${e.message}`);
    process.exit(1);
  }
}

// Slides validation
try {
  validateSlidesMapping(chapters);
} catch (e) {
  console.error('Validation slides échouée:', e.message);
  process.exit(1);
}

// Slides coverage info
const used = new Set(chapters.flatMap((c) => c.slides || []));
const missing = [];
for (let i = 1; i <= 74; i++) {
  if (!used.has(i)) missing.push(i);
}
console.log(`Chapitres chargés: ${chapters.length}`);
console.log(`Slides utilisées: ${used.size}/74`);
if (missing.length) {
  console.log('Slides non couvertes:', missing.join(', '));
} else {
  console.log('Toutes les slides sont référencées.');
}

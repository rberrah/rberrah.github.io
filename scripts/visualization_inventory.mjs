#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { visualizationReview } from '../src/lib/content/visualizationReviews.js';
import { visualizationDescriptions } from '../src/lib/content/vizDescriptions.js';
import { visualizationReviewHash } from './review_hash.mjs';

const root = process.cwd();
const directory = path.join(root, 'src', 'lib', 'components', 'visualizations');
const output = path.join(root, 'docs', 'visualization-review.md');
const files = fs.readdirSync(directory).filter(file => file.endsWith('.svelte')).sort();

function effectiveReview(file) {
  const stem = file.replace(/\.svelte$/, '');
  const review = visualizationReview(stem);
  const raw = fs.readFileSync(path.join(directory, file), 'utf8');
  const current = review.status === 'reviewed' && review.reviewed_hash === visualizationReviewHash(raw, visualizationDescriptions[stem]);
  return {
    ...review,
    stem,
    status: current ? 'reviewed' : 'pending',
    evidence: current ? 'hash current' : review.status === 'reviewed' ? 'content changed' : '—'
  };
}

const reviews = files.map(effectiveReview);
const rows = reviews.map(review =>
  `| ${review.stem} | ${review.status} | ${review.reviewed_on || '—'} | ${review.review_type || '—'} | ${review.evidence} |`
);
const reviewed = reviews.filter(review => review.status === 'reviewed').length;
const content = `# Registre de relecture des visualisations\n\nCe registre couvre les ${files.length} composants de visualisation. Une ligne \`pending\` signifie que le composant est utilisable mais que son texte interprétatif n'a pas encore fait l'objet d'une relecture scientifique consignée, ou qu'il a changé depuis cette relecture. Le hash est recalculé à chaque validation. Le statut ne remplace pas une validation pédagogique ou d'accessibilité sur appareils réels.\n\n- Relues : ${reviewed}\n- En attente : ${files.length - reviewed}\n\n| Visualisation | Statut | Date | Type de relecture | Preuve |\n| --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`;

if (process.argv.includes('--check')) {
  const current = fs.existsSync(output) ? fs.readFileSync(output, 'utf8').replace(/\r\n/g, '\n') : '';
  if (current !== content) {
    console.error('docs/visualization-review.md is stale. Run npm run viz:inventory.');
    process.exit(1);
  }
  console.log(`Visualization registry OK: ${files.length} components, ${reviewed} reviewed.`);
} else {
  fs.writeFileSync(output, content, 'utf8');
  console.log(`Wrote visualization registry: ${files.length} components, ${reviewed} reviewed.`);
}

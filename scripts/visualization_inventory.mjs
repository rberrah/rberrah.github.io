#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { visualizationReview } from '../src/lib/content/visualizationReviews.js';

const root = process.cwd();
const directory = path.join(root, 'src', 'lib', 'components', 'visualizations');
const output = path.join(root, 'docs', 'visualization-review.md');
const files = fs.readdirSync(directory).filter(file => file.endsWith('.svelte')).sort();
const rows = files.map(file => {
  const stem = file.replace(/\.svelte$/, '');
  const review = visualizationReview(stem);
  return `| ${stem} | ${review.status} | ${review.reviewed_on || '—'} | ${review.review_type || '—'} |`;
});
const reviewed = files.filter(file => visualizationReview(file.replace(/\.svelte$/, '')).status === 'reviewed').length;
const content = `# Registre de relecture des visualisations\n\nCe registre couvre les ${files.length} composants de visualisation. Une ligne \`pending\` signifie que le composant est utilisable mais que son texte interprétatif n'a pas encore fait l'objet d'une relecture scientifique consignée. Le statut ne remplace pas une validation pédagogique ou d'accessibilité sur appareils réels.\n\n- Relues : ${reviewed}\n- En attente : ${files.length - reviewed}\n\n| Visualisation | Statut | Date | Type de relecture |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n`;

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

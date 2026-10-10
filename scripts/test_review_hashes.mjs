import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chapterReviewHash, visualizationReviewHash } from './review_hash.mjs';

const chapterUrl = new URL('../src/content/chapters/valid-objective.md', import.meta.url);
const visualizationUrl = new URL('../src/lib/components/visualizations/59_ModelSelection.svelte', import.meta.url);
const chapter = fs.readFileSync(chapterUrl, 'utf8');
const visualization = fs.readFileSync(visualizationUrl, 'utf8');

const changedEvidence = chapter.replace(/^reviewed_hash:.*$/m, 'reviewed_hash: "different-evidence"');
assert.equal(
  chapterReviewHash(changedEvidence),
  chapterReviewHash(chapter),
  'Review evidence must not hash itself'
);
assert.notEqual(
  chapterReviewHash(chapter + '\nScientific change.\n'),
  chapterReviewHash(chapter),
  'A chapter content change must invalidate its review hash'
);
assert.equal(
  visualizationReviewHash(visualization.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')),
  visualizationReviewHash(visualization),
  'Line-ending changes must not invalidate a visualization review'
);
assert.notEqual(
  visualizationReviewHash(visualization + '\n<!-- Scientific change -->\n'),
  visualizationReviewHash(visualization),
  'A visualization source change must invalidate its review hash'
);

console.log('Review-hash invalidation checks passed.');

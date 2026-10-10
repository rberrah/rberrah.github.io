#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { visualizationReviews } from '../src/lib/content/visualizationReviews.js';
import { chapterReviewHash, visualizationReviewHash } from './review_hash.mjs';

const root = process.cwd();
const chapterDirs = [
  path.join(root, 'src', 'content', 'chapters'),
  path.join(root, 'src', 'content', 'chapters', 'en')
];
const visualizationsDir = path.join(root, 'src', 'lib', 'components', 'visualizations');
const visualizationRegistry = path.join(root, 'src', 'lib', 'content', 'visualizationReviews.js');

function setFrontmatterField(raw, field, value) {
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const line = `${field}: "${value}"`;
  const pattern = new RegExp(`^${field}:[^\\r\\n]*`, 'm');
  if (pattern.test(raw)) return raw.replace(pattern, line);
  return raw.replace(/^quiz:/m, `${line}${eol}quiz:`);
}

let chapterCount = 0;
for (const directory of chapterDirs) {
  for (const file of fs.readdirSync(directory).filter(name => name.endsWith('.md') && !name.startsWith('_'))) {
    const filePath = path.join(directory, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = matter(raw).data;
    if (!data.reviewed_on || !data.review_type) continue;
    const updated = setFrontmatterField(raw, 'reviewed_hash', chapterReviewHash(raw));
    if (updated !== raw) fs.writeFileSync(filePath, updated, 'utf8');
    chapterCount += 1;
  }
}

const sealedReviews = {};
for (const [stem, review] of Object.entries(visualizationReviews)) {
  const next = { ...review };
  if (review.status === 'reviewed') {
    const sourcePath = path.join(visualizationsDir, `${stem}.svelte`);
    next.reviewed_hash = visualizationReviewHash(fs.readFileSync(sourcePath, 'utf8'));
  }
  sealedReviews[stem] = next;
}

const registrySource = `// Scientific review provenance for interpretive visualizations.
// Run npm run review:seal only after reviewing the current source.
/** @type {Record<string, { status: string, reviewed_on: string, review_type: string, reviewed_hash: string }>} */
export const visualizationReviews = ${JSON.stringify(sealedReviews, null, 2)};

/** @param {string} stem */
export function visualizationReview(stem) {
  return visualizationReviews[stem] ?? { status: 'pending', reviewed_on: '', review_type: '', reviewed_hash: '' };
}
`;
fs.writeFileSync(visualizationRegistry, registrySource, 'utf8');

console.log(`Sealed ${chapterCount} chapter translations and ${Object.keys(sealedReviews).length} visualization reviews.`);

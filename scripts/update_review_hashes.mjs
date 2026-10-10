#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { visualizationDescriptions } from '../src/lib/content/vizDescriptions.js';
import { visualizationReviews } from '../src/lib/content/visualizationReviews.js';
import { chapterReviewHash, visualizationReviewHash } from './review_hash.mjs';

const root = process.cwd();
const chapterDirs = [
  path.join(root, 'src', 'content', 'chapters'),
  path.join(root, 'src', 'content', 'chapters', 'en')
];
const visualizationsDir = path.join(root, 'src', 'lib', 'components', 'visualizations');
const visualizationRegistry = path.join(root, 'src', 'lib', 'content', 'visualizationReviews.js');
const args = process.argv.slice(2);
const changedMode = args.includes('--changed');
const confirmed = args.includes('--yes');
const requested = args.filter((arg) => !['--changed', '--yes'].includes(arg));

function usage(message) {
  if (message) console.error(message);
  console.error('Usage: npm run review:seal -- <chapter.md|visualization.svelte|visualization-stem> [...]');
  console.error('   or: npm run review:seal -- --changed       # preview stale review evidence');
  console.error('       npm run review:seal -- --changed --yes # seal the previewed files');
  process.exit(2);
}

if ((!changedMode && requested.length === 0) || (changedMode && requested.length > 0)) {
  usage('Refusing an implicit global seal. Select exact files, or use --changed with explicit --yes confirmation.');
}

function setFrontmatterField(raw, field, value) {
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const line = `${field}: "${value}"`;
  const pattern = new RegExp(`^${field}:[^\\r\\n]*`, 'm');
  if (pattern.test(raw)) return raw.replace(pattern, line);
  return raw.replace(/^quiz:/m, `${line}${eol}quiz:`);
}

function chapterFiles() {
  return chapterDirs.flatMap((directory) => fs.readdirSync(directory)
    .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
    .map((name) => path.join(directory, name)));
}

function assertReviewableChapter(filePath, raw) {
  const data = matter(raw).data;
  if (!data.reviewed_on || !data.review_type) throw new Error(`Missing review metadata in ${path.relative(root, filePath)}`);
  if (data.updated_on && String(data.reviewed_on) < String(data.updated_on)) {
    throw new Error(`Refusing to seal ${path.relative(root, filePath)}: reviewed_on ${data.reviewed_on} predates updated_on ${data.updated_on}`);
  }
}

function visualizationHash(stem) {
  const sourcePath = path.join(visualizationsDir, `${stem}.svelte`);
  if (!fs.existsSync(sourcePath)) throw new Error(`Unknown visualization: ${stem}`);
  return visualizationReviewHash(fs.readFileSync(sourcePath, 'utf8'), visualizationDescriptions[stem]);
}

const chapterTargets = new Set();
const visualizationTargets = new Set();

if (changedMode) {
  for (const filePath of chapterFiles()) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = matter(raw).data;
    if (data.reviewed_hash !== chapterReviewHash(raw)) chapterTargets.add(filePath);
  }
  for (const [stem, review] of Object.entries(visualizationReviews)) {
    if (review.status === 'reviewed' && review.reviewed_hash !== visualizationHash(stem)) visualizationTargets.add(stem);
  }

  const preview = [
    ...[...chapterTargets].map((filePath) => path.relative(root, filePath)),
    ...[...visualizationTargets].map((stem) => `visualization:${stem}`)
  ];
  if (preview.length === 0) {
    console.log('No stale scientific review evidence found.');
    process.exit(0);
  }
  console.log(`Stale review evidence (${preview.length}):\n${preview.map((item) => `- ${item}`).join('\n')}`);
  if (!confirmed) usage('Preview only. Re-run with --changed --yes after reviewing every listed item.');
} else {
  for (const target of requested) {
    if (visualizationReviews[target]) {
      visualizationTargets.add(target);
      continue;
    }
    const absolute = path.resolve(root, target);
    const relative = path.relative(root, absolute);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(absolute)) usage(`Unknown review target: ${target}`);
    if (absolute.endsWith('.md') && chapterDirs.some((directory) => absolute.startsWith(`${directory}${path.sep}`))) {
      chapterTargets.add(absolute);
      continue;
    }
    if (absolute.endsWith('.svelte') && path.dirname(absolute) === visualizationsDir) {
      visualizationTargets.add(path.basename(absolute, '.svelte'));
      continue;
    }
    usage(`Unsupported review target: ${target}`);
  }
}

for (const filePath of chapterTargets) {
  const raw = fs.readFileSync(filePath, 'utf8');
  assertReviewableChapter(filePath, raw);
  fs.writeFileSync(filePath, setFrontmatterField(raw, 'reviewed_hash', chapterReviewHash(raw)), 'utf8');
}

if (visualizationTargets.size > 0) {
  const sealedReviews = {};
  for (const [stem, review] of Object.entries(visualizationReviews)) {
    const next = { ...review };
    if (visualizationTargets.has(stem)) {
      if (review.status !== 'reviewed') throw new Error(`Visualization ${stem} is pending; record its review metadata before sealing it.`);
      next.reviewed_hash = visualizationHash(stem);
    }
    sealedReviews[stem] = next;
  }

  const registrySource = `// Scientific review provenance for interpretive visualizations.
// Seal only exact files that were reviewed; implicit global sealing is refused.
/** @type {Record<string, { status: string, reviewed_on: string, review_type: string, reviewed_hash: string }>} */
export const visualizationReviews = ${JSON.stringify(sealedReviews, null, 2)};

/** @param {string} stem */
export function visualizationReview(stem) {
  return visualizationReviews[stem] ?? { status: 'pending', reviewed_on: '', review_type: '', reviewed_hash: '' };
}
`;
  fs.writeFileSync(visualizationRegistry, registrySource, 'utf8');
}

console.log(`Sealed ${chapterTargets.size} chapter translation(s) and ${visualizationTargets.size} visualization(s).`);

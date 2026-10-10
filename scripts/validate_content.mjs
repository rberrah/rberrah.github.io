#!/usr/bin/env node
/**
 * Content validation: slides + chapters.
 * Fails on missing slide images, invalid slide references, incomplete
 * chapter metadata, missing pedagogy sections, incomplete quizzes, and
 * obviously unbalanced inline math delimiters.
 */
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import matter from 'gray-matter';
import { glossaryDetails, glossaryEnglish } from '../src/lib/content/glossaryMeta.js';
import { allRefIds, refById } from '../src/lib/content/references.js';
import { molecularLabIds } from '../src/lib/labs/molecular.js';
import { visualizationReviews } from '../src/lib/content/visualizationReviews.js';
import { chapterReviewHash, visualizationReviewHash } from './review_hash.mjs';

const root = process.cwd();
const slidesDir = path.join(root, 'static', 'slides');
const catalogPath = path.join(root, 'src', 'content', 'slides', 'slide_catalog.yaml');
const chaptersDir = path.join(root, 'src', 'content', 'chapters');
const englishChaptersDir = path.join(chaptersDir, 'en');
const visualizationsDir = path.join(root, 'src', 'lib', 'components', 'visualizations');

const requiredFrontmatter = [
  'id',
  'slug',
  'title',
  'description',
  'summary',
  'track',
  'order',
  'duration',
  'level',
  'tags',
  'prerequisites',
  'glossary',
  'slides',
  'review_type',
  'reviewed_hash'
];
// Squelette pédagogique canonique (langue principale = français).
// Chaque chapitre doit contenir au moins ces sections, dans cet ordre d'esprit :
// motivation → intuition → formule → exemple → piège → synthèse.
// NB : les titres d'étapes ne doivent contenir ni apostrophe ni guillemet
// (le parseur de méta `title="…"` s'arrête au premier ' ou ").
const requiredPedagogy = [
  'Pourquoi ce chapitre',
  'Intuition',
  'La formule décortiquée',
  'Exemple concret',
  'Piège fréquent',
  'À retenir'
];
const quantitativeContractSlugs = new Set([
  'math-stats',
  'nca-absorption',
  'nca-params',
  'pd-direct',
  'valid-objective',
  'valid-shrinkage',
  'valid-uncertainty'
]);

const errors = [];

function fail(msg) {
  errors.push(msg);
}

function loadCatalog() {
  if (!fs.existsSync(catalogPath)) {
    fail(`Missing slide_catalog.yaml at ${catalogPath}`);
    return [];
  }
  const raw = fs.readFileSync(catalogPath, 'utf8');
  const catalog = yaml.load(raw);
  if (!Array.isArray(catalog)) {
    fail('slide_catalog.yaml must contain a list');
    return [];
  }
  return catalog;
}

function validateSlides(catalog) {
  const ids = new Set();
  const numbers = new Set();
  for (const entry of catalog) {
    if (!entry.id || !entry.slide) fail('Slide catalog entry without id or slide number');
    if (ids.has(entry.id)) fail(`Duplicate slide id: ${entry.id}`);
    ids.add(entry.id);
    if (numbers.has(entry.slide)) fail(`Duplicate slide number: ${entry.slide}`);
    numbers.add(entry.slide);

    const expected = `slide-${String(entry.slide).padStart(2, '0')}.png`;
    if (entry.file !== expected) fail(`Slide ${entry.id}: file should be ${expected}`);
    const filePath = path.join(slidesDir, entry.file);
    if (!fs.existsSync(filePath)) fail(`Missing PNG: ${filePath}`);
  }
  return { ids, numbers };
}

function parseSteps(markdown) {
  const steps = [];
  const regex = /<!--\s*step:([^>]*)-->([\s\S]*?)<!--\s*\/step\s*-->/g;
  let m;
  while ((m = regex.exec(markdown)) !== null) {
    const metaRaw = m[1];
    const body = m[2].trim();
    const meta = {};
    const attrRegex = /(\w+)=["']([^"']+)["']/g;
    let attr;
    while ((attr = attrRegex.exec(metaRaw)) !== null) {
      meta[attr[1]] = attr[2];
    }
    steps.push({ meta, body });
  }
  return steps;
}

function validateVisualizationReviews() {
  const stems = new Set(fs.readdirSync(visualizationsDir)
    .filter(file => file.endsWith('.svelte'))
    .map(file => file.replace(/\.svelte$/, '')));
  for (const [stem, review] of Object.entries(visualizationReviews)) {
    if (!stems.has(stem)) fail(`Visualization review references unknown component: ${stem}`);
    if (!['pending', 'reviewed'].includes(review.status)) fail(`Invalid visualization review status for ${stem}`);
    if (review.status === 'reviewed') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(review.reviewed_on ?? '')) fail(`Reviewed visualization ${stem} needs a valid date`);
      if (!['author', 'internal', 'external'].includes(review.review_type)) fail(`Reviewed visualization ${stem} needs a valid review_type`);
      if (!/^[a-f0-9]{64}$/.test(review.reviewed_hash ?? '')) {
        fail(`Reviewed visualization ${stem} needs a valid reviewed_hash`);
      } else {
        const raw = fs.readFileSync(path.join(visualizationsDir, `${stem}.svelte`), 'utf8');
        if (review.reviewed_hash !== visualizationReviewHash(raw)) {
          fail(`Visualization review is stale for ${stem}; review it, then run npm run review:seal`);
        }
      }
    }
  }
}

function validateChapterReview(file, raw, data) {
  for (const field of ['updated_on', 'reviewed_on']) {
    if (data[field] && !/^\d{4}-\d{2}-\d{2}$/.test(String(data[field]))) {
      fail(`Invalid ${field} date in ${file}: ${data[field]}`);
    }
  }
  if (!data.reviewed_on) fail(`Missing reviewed_on in ${file}`);
  if (!['author', 'internal', 'external'].includes(data.review_type)) {
    fail(`Invalid review_type in ${file}: expected author, internal or external`);
  }
  if (!/^[a-f0-9]{64}$/.test(data.reviewed_hash ?? '')) {
    fail(`Missing or invalid reviewed_hash in ${file}`);
  } else if (data.reviewed_hash !== chapterReviewHash(raw)) {
    fail(`Scientific review is stale in ${file}; review this language version, then run npm run review:seal`);
  }
}

function sameValue(left, right) {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
}

function validatePrerequisiteCycles(chapters) {
  const graph = new Map(chapters.map(({ data }) => [data.slug, data.prerequisites ?? []]));
  const state = new Map();
  const stack = [];

  function visit(slug) {
    if (state.get(slug) === 2) return false;
    if (state.get(slug) === 1) {
      const start = stack.indexOf(slug);
      fail(`Prerequisite cycle: ${[...stack.slice(start), slug].join(' -> ')}`);
      return true;
    }
    state.set(slug, 1);
    stack.push(slug);
    for (const prerequisite of graph.get(slug) ?? []) {
      if (graph.has(prerequisite) && visit(prerequisite)) return true;
    }
    stack.pop();
    state.set(slug, 2);
    return false;
  }

  for (const slug of graph.keys()) {
    if (visit(slug)) break;
  }
}

function validateChapters(catalogIds) {
  if (!fs.existsSync(chaptersDir)) {
    fail(`Missing chapters directory: ${chaptersDir}`);
    return;
  }

  // Les fichiers préfixés par « _ » (ex. _TEMPLATE.md) sont des brouillons/modèles
  // ignorés au build (voir loadChapters.js) : ils ne sont pas validés comme des chapitres.
  const files = fs.readdirSync(chaptersDir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  const chapters = files.map((file) => {
    const raw = fs.readFileSync(path.join(chaptersDir, file), 'utf8');
    return { file, raw, ...matter(raw) };
  });
  const slugs = new Set(chapters.map(({ data }) => data.slug));
  const glossaryTerms = new Set(Object.keys(glossaryEnglish));
  const referenceIds = new Set(allRefIds);
  const labIds = new Set(['distribution', 'accumulation', 'absorption', 'infusion', ...molecularLabIds]);
  const english = new Map(fs.readdirSync(englishChaptersDir)
    .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(englishChaptersDir, file), 'utf8');
      const parsed = matter(raw);
      return [parsed.data.slug, { file, raw, ...parsed }];
    }));

  validatePrerequisiteCycles(chapters);

  for (const [term, details] of Object.entries(glossaryDetails)) {
    if (!glossaryTerms.has(term)) fail(`Glossary details without a glossary term: ${term}`);
    for (const field of ['chapter', 'exercise']) {
      if (details[field] && !slugs.has(details[field])) fail(`Unknown ${field} ${details[field]} in glossary details for ${term}`);
    }
    if (details.lab && !labIds.has(details.lab)) fail(`Unknown laboratory ${details.lab} in glossary details for ${term}`);
    for (const [relation, targets] of Object.entries(details.relations ?? {})) {
      if (!Array.isArray(targets)) fail(`Glossary relation ${relation} must be a list for ${term}`);
      else targets.forEach((target) => {
        if (!glossaryTerms.has(target)) fail(`Unknown glossary relation target ${target} for ${term}`);
      });
    }
  }
  for (const reference of Object.values(refById)) {
    if (!/^https:\/\//.test(reference.url ?? '')) fail(`Reference ${reference.id} needs an HTTPS URL`);
    if (reference.doi && !/^10\.\d{4,9}\/.+/.test(reference.doi)) fail(`Invalid DOI format for ${reference.id}`);
    if (reference.pmid && !/^\d+$/.test(reference.pmid)) fail(`Invalid PMID format for ${reference.id}`);
  }

  for (const { file, raw, data, content } of chapters) {

    for (const field of requiredFrontmatter) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        fail(`Incomplete frontmatter in ${file}: ${field}`);
      }
    }
    if (!Array.isArray(data.tags) || data.tags.length === 0) {
      fail(`Frontmatter tags must be a non-empty list in ${file}`);
    }
    if (!Array.isArray(data.prerequisites)) {
      fail(`Frontmatter prerequisites must be a list in ${file}`);
    } else {
      data.prerequisites.forEach((slug) => {
        if (slug === data.slug) fail(`Chapter ${file} cannot require itself`);
        if (!slugs.has(slug)) fail(`Unknown prerequisite ${slug} in ${file}`);
      });
    }
    if (!Array.isArray(data.glossary)) {
      fail(`Frontmatter glossary must be a list in ${file}`);
    } else {
      data.glossary.forEach((term) => {
        if (!glossaryTerms.has(term)) fail(`Unknown glossary term ${term} in ${file}`);
      });
    }
    if (!Array.isArray(data.slides)) {
      fail(`Frontmatter slides must be a list in ${file}`);
    } else {
      data.slides.forEach((id) => {
        if (!catalogIds.has(id)) fail(`Slide ${id} referenced in ${file} is absent from catalog`);
      });
    }
    if (!Array.isArray(data.sources) || data.sources.length === 0) {
      fail(`Frontmatter sources must be a non-empty list in ${file}`);
    } else {
      data.sources.forEach((id) => {
        if (!referenceIds.has(id)) fail(`Unknown source ${id} in ${file}`);
      });
    }
    validateChapterReview(file, raw, data);
    for (const field of ['scientific_values', 'units']) {
      if (data[field] !== undefined && !Array.isArray(data[field]) && typeof data[field] !== 'object') {
        fail(`${field} must be a list or object in ${file}`);
      }
      if (quantitativeContractSlugs.has(data.slug) && (data[field] === undefined || data[field] === null)) {
        fail(`Quantitative chapter ${file} must define ${field}`);
      }
    }

    validateQuiz(file, data.quiz);
    validateMathDelimiters(file, content);

    const steps = parseSteps(content);
    if (steps.length === 0) fail(`No step block in ${file}`);

    const stepTitles = steps.map((step) => step.meta.title ?? '').join('\n');
    for (const title of requiredPedagogy) {
      if (!stepTitles.includes(title)) fail(`Missing pedagogy section in ${file}: ${title}`);
    }

    steps.forEach((step, idx) => {
      if (step.meta.slides) {
        step.meta.slides.split(',').forEach((id) => {
          if (id && !catalogIds.has(id)) fail(`Slide ${id} in step ${idx + 1} of ${file} is absent from catalog`);
        });
      }
    });

    const translation = english.get(data.slug);
    if (!translation) {
      fail(`Missing English translation for ${file}`);
    } else {
      validateChapterReview(`en/${translation.file}`, translation.raw, translation.data);
      for (const field of ['scientific_values', 'units']) {
        if (quantitativeContractSlugs.has(data.slug) && (translation.data[field] === undefined || translation.data[field] === null)) {
          fail(`Quantitative chapter en/${translation.file} must define ${field}`);
        }
      }
      for (const field of ['id', 'slug', 'track', 'level', 'order', 'prerequisites', 'glossary', 'sources', 'slides', 'updated_on', 'status', 'scientific_values', 'units']) {
        if (!sameValue(translation.data[field], data[field])) fail(`English ${field} mismatch for ${file}`);
      }
      if ((translation.data.quiz?.length ?? 0) !== (data.quiz?.length ?? 0)) fail(`English quiz length mismatch for ${file}`);
      (data.quiz ?? []).forEach((question, idx) => {
        const translated = translation.data.quiz?.[idx];
        if (!translated) return;
        if (translated.correct !== question.correct) fail(`English quiz answer mismatch in ${file}, question ${idx + 1}`);
        if ((translated.options?.length ?? 0) !== (question.options?.length ?? 0)) fail(`English quiz option count mismatch in ${file}, question ${idx + 1}`);
        for (const field of ['value', 'unit']) {
          if (!sameValue(translated[field], question[field])) fail(`English quiz ${field} mismatch in ${file}, question ${idx + 1}`);
        }
      });
      const translatedSteps = parseSteps(translation.content);
      if (translatedSteps.length !== steps.length) fail(`English step count mismatch for ${file}`);
      steps.forEach((step, idx) => {
        const translated = translatedSteps[idx];
        if (!translated) return;
        for (const field of ['viz', 'slides']) {
          const sourceValue = field === 'slides' ? (step.meta.slides ?? '').split(',').filter(Boolean) : step.meta[field] ?? null;
          const translatedValue = field === 'slides' ? (translated.meta.slides ?? '').split(',').filter(Boolean) : translated.meta[field] ?? null;
          if (!sameValue(translatedValue, sourceValue)) fail(`English step ${field} mismatch in ${file}, step ${idx + 1}`);
        }
      });
    }
  }

  for (const slug of english.keys()) if (!slugs.has(slug)) fail(`English translation without French source chapter: ${slug}`);
}

function validateQuiz(file, quiz) {
  if (!Array.isArray(quiz) || quiz.length === 0) {
    fail(`Missing quiz in ${file}`);
    return;
  }
  quiz.forEach((q, idx) => {
    if (!q.prompt) fail(`Question ${idx + 1} has no prompt in ${file}`);
    if (!Array.isArray(q.options) || q.options.length < 2) {
      fail(`Question ${idx + 1} needs at least two options in ${file}`);
    }
    if (!Number.isInteger(q.correct)) fail(`Question ${idx + 1} has no integer correct index in ${file}`);
    if (Array.isArray(q.options) && Number.isInteger(q.correct) && (q.correct < 0 || q.correct >= q.options.length)) {
      fail(`Question ${idx + 1} correct index is out of range in ${file}`);
    }
  });
}

function validateMathDelimiters(file, content) {
  // Les blocs de code peuvent contenir des « $ » légitimes (ex. fichiers de contrôle
  // NONMEM : $PROBLEM, $DATA…). On les retire avant de compter les délimiteurs de maths.
  const noCode = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '');
  const withoutDisplayMath = noCode.replace(/\$\$[\s\S]*?\$\$/g, '');
  const dollarCount = (withoutDisplayMath.match(/\$/g) ?? []).length;
  if (dollarCount % 2 !== 0) fail(`Unbalanced inline math delimiters in ${file}`);
}

const catalog = loadCatalog();
const { ids } = validateSlides(catalog);
validateVisualizationReviews();
validateChapters(ids);

if (errors.length) {
  console.error('Validation failed:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}

console.log('Validation OK: slides and pedagogical chapters are coherent.');

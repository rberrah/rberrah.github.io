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

const root = process.cwd();
const slidesDir = path.join(root, 'static', 'slides');
const catalogPath = path.join(root, 'src', 'content', 'slides', 'slide_catalog.yaml');
const chaptersDir = path.join(root, 'src', 'content', 'chapters');

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
  'slides'
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

function validateChapters(catalogIds) {
  if (!fs.existsSync(chaptersDir)) {
    fail(`Missing chapters directory: ${chaptersDir}`);
    return;
  }

  // Les fichiers préfixés par « _ » (ex. _TEMPLATE.md) sont des brouillons/modèles
  // ignorés au build (voir loadChapters.js) : ils ne sont pas validés comme des chapitres.
  const files = fs.readdirSync(chaptersDir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  for (const file of files) {
    const full = path.join(chaptersDir, file);
    const raw = fs.readFileSync(full, 'utf8');
    const { data, content } = matter(raw);

    for (const field of requiredFrontmatter) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        fail(`Incomplete frontmatter in ${file}: ${field}`);
      }
    }
    if (!Array.isArray(data.tags) || data.tags.length === 0) {
      fail(`Frontmatter tags must be a non-empty list in ${file}`);
    }
    if (!Array.isArray(data.slides)) {
      fail(`Frontmatter slides must be a list in ${file}`);
    } else {
      data.slides.forEach((id) => {
        if (!catalogIds.has(id)) fail(`Slide ${id} referenced in ${file} is absent from catalog`);
      });
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
  }
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
validateChapters(ids);

if (errors.length) {
  console.error('Validation failed:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}

console.log('Validation OK: slides and pedagogical chapters are coherent.');

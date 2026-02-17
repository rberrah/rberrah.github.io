#!/usr/bin/env node
/**
 * Validation du contenu : slides + chapitres.
 * - Vérifie la présence des PNG
 * - Vérifie l'unicité et la cohérence des IDs de slides
 * - Vérifie que chaque chapitre référence des slides existantes
 * - Échoue (code 1) en cas d'erreur
 */
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import matter from 'gray-matter';

const root = process.cwd();
const slidesDir = path.join(root, 'static', 'slides');
const catalogPath = path.join(root, 'src', 'content', 'slides', 'slide_catalog.yaml');
const chaptersDir = path.join(root, 'src', 'content', 'chapters');

const errors = [];

function fail(msg) {
  errors.push(msg);
}

function loadCatalog() {
  if (!fs.existsSync(catalogPath)) {
    fail(`slide_catalog.yaml manquant à ${catalogPath}`);
    return [];
  }
  const raw = fs.readFileSync(catalogPath, 'utf8');
  const catalog = yaml.load(raw);
  if (!Array.isArray(catalog)) {
    fail('slide_catalog.yaml doit contenir une liste');
    return [];
  }
  return catalog;
}

function validateSlides(catalog) {
  const ids = new Set();
  const numbers = new Set();
  for (const entry of catalog) {
    if (!entry.id || !entry.slide) fail('Entrée sans id ou slide');
    if (ids.has(entry.id)) fail(`ID de slide dupliqué: ${entry.id}`);
    ids.add(entry.id);
    if (numbers.has(entry.slide)) fail(`Numéro de slide dupliqué: ${entry.slide}`);
    numbers.add(entry.slide);
    const expected = `slide-${String(entry.slide).padStart(2, '0')}.png`;
    if (entry.file !== expected) fail(`Slide ${entry.id}: file devrait être ${expected}`);
    const filePath = path.join(slidesDir, entry.file);
    if (!fs.existsSync(filePath)) fail(`PNG manquant: ${filePath}`);
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
    metaRaw.split(/\s+/).forEach((pair) => {
      const [k, v] = pair.split('=');
      if (k && v) meta[k] = v.replace(/^"|"$/g, '');
    });
    steps.push({ meta, body });
  }
  return steps;
}

function validateChapters(catalogIds) {
  if (!fs.existsSync(chaptersDir)) {
    fail(`Dossier chapitres manquant: ${chaptersDir}`);
    return;
  }
  const files = fs.readdirSync(chaptersDir).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const full = path.join(chaptersDir, file);
    const raw = fs.readFileSync(full, 'utf8');
    const { data, content } = matter(raw);
    if (!data.slug || !data.title) fail(`Frontmatter incomplet dans ${file}`);
    if (!Array.isArray(data.slides)) fail(`Frontmatter slides doit être une liste dans ${file}`);
    data.slides.forEach((id) => {
      if (!catalogIds.has(id)) fail(`Slide ${id} référencée dans ${file} absente du catalogue`);
    });
    const steps = parseSteps(content);
    if (steps.length === 0) fail(`Aucun bloc step dans ${file}`);
    steps.forEach((step, idx) => {
      if (step.meta.slides) {
        step.meta.slides.split(',').forEach((id) => {
          if (id && !catalogIds.has(id)) fail(`Slide ${id} (step ${idx + 1} de ${file}) absente du catalogue`);
        });
      }
    });
  }
}

const catalog = loadCatalog();
const { ids } = validateSlides(catalog);
validateChapters(ids);

if (errors.length) {
  console.error('Validation échouée:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}

console.log('Validation OK : slides + chapitres cohérents.');

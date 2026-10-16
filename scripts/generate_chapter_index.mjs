#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import matter from '../src/lib/content/frontmatter.js';

const root = process.cwd();
const chapterDir = path.join(root, 'src', 'content', 'chapters');
const englishDir = path.join(chapterDir, 'en');
const indexOutput = path.join(root, 'src', 'lib', 'content', 'chapterIndex.generated.json');
const searchOutput = path.join(root, 'src', 'lib', 'content', 'chapterSearch.generated.json');

const chapterFiles = readdirSync(chapterDir)
  .filter(file => file.endsWith('.md') && !file.startsWith('_'))
  .sort();
const englishFiles = readdirSync(englishDir)
  .filter(file => file.endsWith('.md') && !file.startsWith('_'))
  .sort();

function normaliseDate(value) {
  return value ? String(value) : '';
}

function chapterMetadata(file, directory) {
  const raw = readFileSync(path.join(directory, file), 'utf8');
  const { data, content } = matter(raw);
  const stepCount = [...content.matchAll(/<!--\s*step:[^>]*-->/g)].length;
  return {
    metadata: {
      id: data.id,
      track: data.track ?? 'core',
      slug: data.slug,
      title: data.title,
      description: data.description ?? '',
      summary: data.summary ?? '',
      order: Number(data.order ?? 999),
      duration: data.duration ?? '',
      level: data.level ?? '',
      layer: data.layer ?? '',
      tags: data.tags ?? [],
      prerequisites: data.prerequisites ?? [],
      glossary: data.glossary ?? [],
      slides: data.slides ?? [],
      sources: data.sources ?? [],
      updated_on: normaliseDate(data.updated_on),
      software_verified_on: normaliseDate(data.software_verified_on),
      software_version: normaliseDate(data.software_version),
      reviewed_on: normaliseDate(data.reviewed_on),
      reviewed_hash: data.reviewed_hash ?? '',
      review_type: data.review_type ?? '',
      review_pending: data.review_pending === true,
      status: data.status ?? '',
      quiz: data.quiz ?? [],
      stepCount,
      sourceFile: file
    },
    content
  };
}

const english = new Map();
for (const file of englishFiles) {
  const entry = chapterMetadata(file, englishDir);
  assert(entry.metadata.slug, `Missing slug in English chapter ${file}`);
  assert(!english.has(entry.metadata.slug), `Duplicate English chapter slug: ${entry.metadata.slug}`);
  english.set(entry.metadata.slug, entry);
}

const index = [];
const search = {};
const slugs = new Set();
for (const file of chapterFiles) {
  const entry = chapterMetadata(file, chapterDir);
  const { slug } = entry.metadata;
  assert(slug, `Missing slug in chapter ${file}`);
  assert(!slugs.has(slug), `Duplicate chapter slug: ${slug}`);
  slugs.add(slug);
  const translated = english.get(slug);
  const chapter = translated
    ? { ...entry.metadata, translations: { en: translated.metadata } }
    : entry.metadata;
  index.push(chapter);
  search[slug] = {
    fr: entry.content,
    en: translated?.content ?? ''
  };
}

index.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
assert.equal(index.length, chapterFiles.length, 'Chapter index count mismatch');
assert.equal(english.size, englishFiles.length, 'English chapter index count mismatch');
assert(index.every(chapter => Array.isArray(chapter.prerequisites) && Array.isArray(chapter.glossary)), 'Chapter metadata arrays are incomplete');

const indexJson = JSON.stringify(index, null, 2) + '\n';
const searchJson = JSON.stringify(search, null, 2) + '\n';

if (process.argv.includes('--check')) {
  const currentIndex = existsSync(indexOutput) ? readFileSync(indexOutput, 'utf8').replace(/\r\n/g, '\n') : '';
  const currentSearch = existsSync(searchOutput) ? readFileSync(searchOutput, 'utf8').replace(/\r\n/g, '\n') : '';
  assert.equal(currentIndex, indexJson, 'chapterIndex.generated.json is stale; run npm run chapters:index');
  assert.equal(currentSearch, searchJson, 'chapterSearch.generated.json is stale; run npm run chapters:index');
  console.log(`Chapter metadata/search index current: ${index.length} FR, ${english.size} EN.`);
} else {
  writeFileSync(indexOutput, indexJson, 'utf8');
  writeFileSync(searchOutput, searchJson, 'utf8');
  console.log(`Generated chapter metadata/search index: ${index.length} FR, ${english.size} EN.`);
}

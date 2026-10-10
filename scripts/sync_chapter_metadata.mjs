#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const root = process.cwd();
const chaptersDir = path.join(root, 'src', 'content', 'chapters');
const englishDir = path.join(chaptersDir, 'en');
const fields = [
  'id',
  'slug',
  'track',
  'order',
  'level',
  'prerequisites',
  'glossary',
  'slides',
  'sources',
  'updated_on',
  'status',
  'scientific_values',
  'units'
];

function encoded(value) {
  if ((value && typeof value === 'object') || typeof value === 'string') return JSON.stringify(value);
  return String(value);
}

function setField(raw, field, value) {
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const line = `${field}: ${encoded(value)}`;
  const pattern = new RegExp(`^${field}:[^\\r\\n]*`, 'm');
  const updated = pattern.test(raw) ? raw.replace(pattern, line) : raw.replace(/^quiz:/m, `${line}${eol}quiz:`);
  return updated.replace(/\r?\n/g, eol);
}

const files = fs.readdirSync(chaptersDir).filter((file) => file.endsWith('.md') && !file.startsWith('_'));
let changed = 0;

for (const file of files) {
  const sourcePath = path.join(chaptersDir, file);
  let sourceRaw = fs.readFileSync(sourcePath, 'utf8');
  const source = matter(sourceRaw).data;
  const englishPath = path.join(englishDir, file);
  if (!fs.existsSync(englishPath)) continue;
  let englishRaw = fs.readFileSync(englishPath, 'utf8');
  const before = englishRaw;
  for (const field of fields) {
    if (source[field] !== undefined && source[field] !== null && source[field] !== '') {
      englishRaw = setField(englishRaw, field, source[field]);
    }
  }
  if (englishRaw !== before) {
    fs.writeFileSync(englishPath, englishRaw, 'utf8');
    changed += 1;
  }
}

console.log(`Synchronized canonical chapter metadata in ${changed} file(s).`);

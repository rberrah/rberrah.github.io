import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import matter from 'gray-matter';

const root = new URL('../src/content/chapters/', import.meta.url);
const files = readdirSync(root).filter((file) => file.endsWith('.md') && !file.startsWith('_')).sort();
const normalized = (value) => JSON.stringify(value ?? null);
const matches = (raw, pattern) => [...raw.matchAll(pattern)].map((match) => match[1]);
const metadataFields = ['slug', 'track', 'level', 'order', 'prerequisites', 'glossary', 'sources', 'units', 'software_version'];

for (const file of files) {
  const frRaw = readFileSync(new URL(file, root), 'utf8');
  const enRaw = readFileSync(new URL(`en/${file}`, root), 'utf8');
  const fr = matter(frRaw).data, en = matter(enRaw).data;
  for (const field of metadataFields) assert.equal(normalized(en[field]), normalized(fr[field]), `${file}: FR/EN ${field} differs`);
  assert.equal(matches(enRaw, /<!-- step:title="([^"]+)"/g).length, matches(frRaw, /<!-- step:title="([^"]+)"/g).length, `${file}: step count differs`);
  assert.deepEqual(matches(enRaw, /\bviz="([^"]+)"/g), matches(frRaw, /\bviz="([^"]+)"/g), `${file}: visualization structure differs`);
  assert.equal(en.quiz?.length ?? 0, fr.quiz?.length ?? 0, `${file}: quiz length differs`);
  for (let index = 0; index < (fr.quiz?.length ?? 0); index++) {
    assert.equal(en.quiz[index].options?.length ?? 0, fr.quiz[index].options?.length ?? 0, `${file}: quiz ${index + 1} option count differs`);
  }
  const internal = (raw) => matches(raw, /\]\((\/pharmacometrie\/[^)]+|\.\.\/[^)]+|\.\/[^)]+)\)/g).map((link) => link.replace(/[?#].*$/, '')).sort();
  assert.deepEqual(internal(enRaw), internal(frRaw), `${file}: internal links differ`);
}

console.log(`FR/EN structural parity passed: ${files.length} chapters.`);

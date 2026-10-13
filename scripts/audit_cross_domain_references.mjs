import assert from 'node:assert/strict';
import { refById } from '../src/lib/content/references.js';
import { crossDomainLessons } from '../src/lib/cross-domains/omics-pkpd-lessons.js';

const references = [...new Set(crossDomainLessons.flatMap(lesson => lesson.sources.map(source => source.id)))]
  .map(id => refById[id]);
assert(references.every(Boolean), 'A cross-domain lesson uses an unknown reference');

const normalise = value => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .split(/\s+/)
  .filter(token => token.length > 2);

const failures = [];
for (const reference of references) {
  if (!reference.doi) {
    failures.push(`${reference.id}: DOI missing`);
    continue;
  }
  const expectedUrl = `https://doi.org/${reference.doi}`;
  if (reference.url.toLowerCase() !== expectedUrl.toLowerCase()) {
    failures.push(`${reference.id}: URL does not match DOI`);
    continue;
  }
  try {
    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(reference.doi)}`, {
      headers: { 'User-Agent': 'PMxExplain-reference-audit/1.0 (mailto:racym.berrah@unilim.fr)' },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`Crossref HTTP ${response.status}`);
    const record = (await response.json()).message;
    if (String(record.DOI).toLowerCase() !== reference.doi.toLowerCase()) {
      throw new Error(`Crossref returned DOI ${record.DOI}`);
    }
    const expected = new Set(normalise(reference.title));
    const actual = new Set(normalise(record.title?.[0]));
    const overlap = [...expected].filter(token => actual.has(token)).length / Math.max(1, expected.size);
    if (overlap < 0.75) throw new Error(`title mismatch (${Math.round(overlap * 100)}% token overlap)`);
    console.log(`OK ${reference.id}: ${reference.doi}`);
  } catch (error) {
    failures.push(`${reference.id}: ${error.message}`);
  }
}

if (failures.length) throw new Error(`Interdisciplinary reference audit failed:\n- ${failures.join('\n- ')}`);
console.log(`Verified ${references.length} interdisciplinary DOI records against Crossref.`);

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const result = JSON.parse(readFileSync(new URL('tdm-engine/pmetrics/benchmarks/pmetrics-official-example.json', root), 'utf8'));
const chapters = [
  readFileSync(new URL('src/content/chapters/08c_pmetrics-nonparametric.md', root), 'utf8'),
  readFileSync(new URL('src/content/chapters/en/08c_pmetrics-nonparametric.md', root), 'utf8')
];

assert.equal(result.status, 'passed');
assert.equal(result.mode, 'official-full');
assert.equal(result.provenance.package_version, '3.2.6');
assert.equal(result.design.initial_points, 2028);
assert.equal(result.design.cycles, 1000);
assert.equal(result.comparison.tolerance_percent, 2);
assert.equal(result.comparison.passed, true);

const maximumDifference = Math.max(...Object.values(result.comparison.relative_difference_percent));
const displayedDifference = maximumDifference.toFixed(3);
for (const chapter of chapters) {
  for (const value of ['3.2.6', '2028', '1000']) assert.ok(chapter.includes(value), `Pmetrics course is missing ${value}`);
  assert.match(chapter, /tol[ée]rance[^\n]*2\s*%|2\s*%[^\n]*tolerance/i);
  assert.ok(chapter.includes(displayedDifference.replace('.', ',')) || chapter.includes(displayedDifference),
    `Pmetrics course must cite the archived maximum difference (${displayedDifference}%).`);
}

console.log(`Pmetrics course matches official-full artifact: ${displayedDifference}% maximum difference.`);

import assert from 'node:assert/strict';
import {
  tdmTargetSources, tdmDrugs, tdmTargets, normalizeTdmSearch, searchTdmTargets, formatTdmTarget
} from '../src/lib/content/tdmTargets.js';

const ids = new Set();
const drugIds = new Set(tdmDrugs.map((drug) => drug.id));
const validRelations = new Set(['range', 'above', 'approx']);
const validStatuses = new Set(['guideline', 'study']);

for (const target of tdmTargets) {
  assert.ok(!ids.has(target.id), `Duplicate target ID ${target.id}`);
  ids.add(target.id);
  assert.ok(drugIds.has(target.drug), `Unknown drug ${target.drug}`);
  assert.ok(target.indication && target.indicationFr && target.indicationEn);
  assert.ok(validRelations.has(target.relation), `Invalid relation: ${target.id}`);
  assert.ok(validStatuses.has(target.status), `Invalid status: ${target.id}`);
  assert.ok(target.metric && target.unit && target.matrixFr && target.matrixEn);
  assert.ok(target.contextFr && target.contextEn && target.evidenceFr && target.evidenceEn);
  assert.ok(Number.isFinite(target.min) && target.min >= 0);
  if (target.relation === 'range') {
    assert.ok(Number.isFinite(target.max) && target.max > target.min);
  } else {
    assert.equal(target.max, null);
  }
  const source = tdmTargetSources[target.source];
  assert.ok(source, `Missing source: ${target.id}`);
  assert.match(source.url, /^https:\/\//);
  assert.ok(source.title && Number.isInteger(source.year));
  assert.ok(formatTdmTarget(target, 'fr').length);
  assert.ok(formatTdmTarget(target, 'en').length);
}

assert.equal(normalizeTdmSearch('MYCOPHÉNOLATE'), 'mycophenolate');
assert.equal(searchTdmTargets({ query: 'mycophenolate' }).length, 5);
assert.equal(searchTdmTargets({ query: 'MMF' }).length, 5);
assert.equal(searchTdmTargets({ query: 'MPA' }).length, 5);
assert.equal(searchTdmTargets({ query: 'tacrolimus' }).length, 3);
assert.equal(searchTdmTargets({ query: 'lithium' }).length, 3);
assert.equal(searchTdmTargets({ query: 'cardiaque' }).length, 2);
assert.equal(searchTdmTargets({ query: 'heart' }).length, 2);
assert.equal(searchTdmTargets({ query: 'évérolimus' }).length, 2);
assert.equal(searchTdmTargets({ drug: 'mpa', indication: 'kidney' }).length, 1);
assert.equal(searchTdmTargets({ drug: 'vancomycin' }).length, 1);
assert.equal(searchTdmTargets({ query: 'nonexistent-drug-xyz' }).length, 0);

const renalMpa = tdmTargets.find((item) => item.id === 'mpa-kidney-auc');
const heartMpaStudy = tdmTargets.find((item) => item.id === 'mpa-heart-auc-study');
const heartMpaGuideline = tdmTargets.find((item) => item.id === 'mpa-heart-auc');
assert.equal(formatTdmTarget(renalMpa), '30–60');
assert.equal(formatTdmTarget(heartMpaStudy), '≈50');
assert.equal(formatTdmTarget(heartMpaGuideline), '>36');
assert.equal(heartMpaStudy.status, 'study');
assert.equal(heartMpaGuideline.status, 'guideline');
assert.ok(tdmTargets.every((entry) => entry.status !== 'study' || entry.contextFr));

console.log(`TDM target reference: ${tdmTargets.length} entries, ${tdmDrugs.length} drugs and ${Object.keys(tdmTargetSources).length} sources validated.`);

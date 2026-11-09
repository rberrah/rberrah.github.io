import assert from 'node:assert/strict';
import {
  tdmTargetSources, tdmInstitutionalResources, TDM_REFERENCE_REVIEW_DATE,
  tdmDrugs, tdmTargets, normalizeTdmSearch, searchTdmTargets, formatTdmTarget
} from '../src/lib/content/tdmTargets.js';
import { collectTdmComparisons } from '../src/lib/content/tdmComparisons.js';
import { tdmManualCatalog, manualCatalogSources, searchManualCatalog } from '../src/lib/content/tdmManualCatalog.js';

const ids = new Set();
const drugIds = new Set(tdmDrugs.map((drug) => drug.id));
const validRelations = new Set(['range', 'above', 'approx']);
const validStatuses = new Set(['guideline', 'study', 'review', 'regulatory']);

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
  assert.ok(source.organization && source.evidenceSection, `Source has no claim locator: ${target.id}`);
  assert.ok(['open_full_text', 'open_abstract'].includes(source.access), `Source access not audited: ${target.id}`);
  assert.equal(source.verifiedOn, TDM_REFERENCE_REVIEW_DATE, `Source not freshly reviewed: ${target.id}`);
  assert.ok(!source.url.endsWith('/recommandations/'), `Numeric source must target a specific publication: ${target.id}`);
  assert.ok(formatTdmTarget(target, 'fr').length);
  assert.ok(formatTdmTarget(target, 'en').length);
}

assert.ok(tdmInstitutionalResources.length >= 2);
assert.ok(tdmInstitutionalResources.some((source) => source.organization === 'SFT'));
assert.ok(tdmInstitutionalResources.some((source) => source.organization === 'SFPT'));
for (const source of tdmInstitutionalResources) {
  assert.ok(source.titleFr && source.titleEn && source.scopeFr && source.scopeEn);
  assert.match(source.url, /^https:\/\//);
}
assert.equal(normalizeTdmSearch('MYCOPHÉNOLATE'), 'mycophenolate');
assert.equal(searchTdmTargets({ query: 'mycophenolate' }).length, 6);
assert.equal(searchTdmTargets({ query: 'MMF' }).length, 6);
assert.equal(searchTdmTargets({ query: 'MPA' }).length, 6);
assert.equal(searchTdmTargets({ query: 'tacrolimus' }).length, 3);
assert.equal(searchTdmTargets({ query: 'lithium' }).length, 4);
assert.equal(searchTdmTargets({ query: 'cardiaque' }).length, 4);
assert.equal(searchTdmTargets({ query: 'heart' }).length, 4);
assert.equal(searchTdmTargets({ query: 'heart', drug: 'mpa' }).length, 2);
assert.equal(searchTdmTargets({ query: 'évérolimus' }).length, 4);
assert.equal(searchTdmTargets({ drug: 'everolimus', indication: 'heart' }).length, 2);
assert.equal(searchTdmTargets({ drug: 'mpa', indication: 'kidney' }).length, 2);
assert.equal(searchTdmTargets({ drug: 'vancomycin' }).length, 1);
assert.equal(searchTdmTargets({ query: 'valproate' }).length, 3);
assert.equal(searchTdmTargets({ drug: 'linezolid' }).length, 1);
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


const comparisons = collectTdmComparisons(tdmTargets);
const byGroup = (id) => comparisons.find((item) => item.id === id);
assert.equal(byGroup('mpa-kidney-auc').entries.length, 2);
assert.equal(byGroup('mpa-kidney-auc').distinctNumericValues, false);
assert.equal(byGroup('mpa-heart-auc').distinctNumericValues, true);
assert.equal(byGroup('valproate-epilepsy').distinctNumericValues, true);
assert.equal(byGroup('valproate-epilepsy').entries.length, 3);
assert.equal(byGroup('lithium-maintenance').matrixDifference, true);
// Incompatible drugs, indication, exposure metrics, or units cannot be compared.
assert.throws(() => collectTdmComparisons([
  {...tdmTargets[0], comparisonGroup: 'mismatch'},
  {...tdmTargets.find((row) => row.drug === 'vancomycin'), comparisonGroup: 'mismatch'}
]), /Unsafe TDM comparison/);

assert.equal(tdmManualCatalog.length, 74);
assert.equal(new Set(tdmManualCatalog.map((entry) => entry.id)).size, 74);
assert.equal(searchManualCatalog({query: 'céfépime'}).length, 1);
assert.equal(searchManualCatalog({query: 'linézolide'}).length, 1);
assert.equal(searchManualCatalog({query: 'amitriptyline'}).length, 1);
assert.equal(searchManualCatalog({query: 'ibrutinib'}).length, 1);
assert.equal(searchManualCatalog({query: 'tacrolimus'}).length, 1);
assert.equal(searchManualCatalog({family: 'antibiotics'}).length, 36);
assert.equal(searchManualCatalog({family: 'antidepressants'}).length, 26);
assert.ok(tdmManualCatalog.every((entry) => Boolean(manualCatalogSources[entry.sourceId])));
assert.ok(tdmManualCatalog.filter((entry) => entry.status === 'request_form_only').every((entry) =>
  manualCatalogSources[entry.sourceId].type === 'request_form'));
assert.ok(tdmManualCatalog.filter((entry) => !tdmTargets.some((target) => target.drug === entry.drugKey)).length > 50);

console.log(`TDM manual linked index: ${tdmManualCatalog.length} named medicines across ${Object.keys(manualCatalogSources).length} official document types.`);
console.log(`TDM comparisons: ${comparisons.length} source-by-source groups validated.`);
console.log(`TDM target reference: ${tdmTargets.length} entries, ${tdmDrugs.length} drugs, ${Object.keys(tdmTargetSources).length} primary sources and ${tdmInstitutionalResources.length} SFT/SFPT context references validated.`);

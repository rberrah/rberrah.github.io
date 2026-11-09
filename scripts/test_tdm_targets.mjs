import assert from 'node:assert/strict';
import {
  tdmTargetSources, tdmInstitutionalResources, TDM_REFERENCE_REVIEW_DATE,
  tdmDrugs, tdmTargets, normalizeTdmSearch, searchTdmTargets, formatTdmTarget
} from '../src/lib/content/tdmTargets.js';
import { collectTdmComparisons } from '../src/lib/content/tdmComparisons.js';
import { searchTdmMolecules } from '../src/lib/content/tdmSearchView.js';
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
  assert.ok(source.citation && source.citation.length < 70, `Missing concise primary citation: ${target.id}`);
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
assert.equal(searchManualCatalog({query: 'valproate'}).length, 1);
assert.equal(searchManualCatalog({query: 'MMF'}).length, 1);
assert.equal(searchManualCatalog({family: 'antibiotics'}).length, 36);
assert.equal(searchManualCatalog({family: 'antidepressants'}).length, 26);
assert.ok(tdmManualCatalog.every((entry) => Boolean(manualCatalogSources[entry.sourceId])));
assert.ok(tdmManualCatalog.filter((entry) => entry.status === 'request_form_only').every((entry) =>
  manualCatalogSources[entry.sourceId].type === 'request_form'));
assert.ok(tdmManualCatalog.filter((entry) => !tdmTargets.some((target) => target.drug === entry.drugKey)).length > 50);


const reviewedNumericClaims = new Map([
  ["mpa-kidney-auc", ["mpa2025","range",30,60]],
  ["mpa-kidney-auc-iatdmct-2021", ["mpa2021","range",30,60]],
  ["mpa-heart-auc", ["mpa2025","above",36,null]],
  ["mpa-heart-auc-study", ["mpa2015heart","approx",50,null]],
  ["mpa-liver-auc", ["mpa2025","range",30,60]],
  ["mpa-lung-auc", ["mpa2025","range",22.73,40.46]],
  ["tac-kidney-early", ["tac2025","range",8,10]],
  ["tac-kidney-mid", ["tac2025","range",5,7]],
  ["tac-kidney-late", ["tac2025","range",3,5]],
  ["everolimus-kidney-cni", ["everolimus2025","range",3,8]],
  ["everolimus-kidney-no-cni", ["everolimus2025","range",6,10]],
  ["everolimus-heart-cni", ["everolimus2025","range",3,8]],
  ["everolimus-heart-no-cni", ["everolimus2025","range",5,10]],
  ["vancomycin-mrsa", ["vancomycin2020","range",400,600]],
  ["valproate-epilepsy-rcp", ["valproateRcp","range",40,100]],
  ["valproate-epilepsy-tdm-review", ["valproateTdm","range",50,100]],
  ["valproate-epilepsy-sfpt-2010", ["valproateSfpt2010","range",50,100]],
  ["linezolid-trough-consensus", ["linezolid2022","range",2,8]],
  ["lithium-maintenance", ["lithium2019","range",0.6,0.8]],
  ["lithium-nice-first-line", ["lithiumNice","range",0.6,0.8]],
  ["lithium-tolerability", ["lithium2019","range",0.4,0.6]],
  ["lithium-response", ["lithium2019","range",0.8,1]]
]);
assert.equal(reviewedNumericClaims.size, 22);
assert.equal(tdmTargets.length, reviewedNumericClaims.size, 'Any new target requires an explicit source review');
assert.equal(Object.keys(tdmTargetSources).length, 12, 'Any new source requires review');
assert.equal(new Set(Object.values(tdmTargetSources).map((source) => source.citation)).size, 12, 'Every numeric reference needs a distinct citation label');
for (const entry of tdmTargets) {
  assert.ok(reviewedNumericClaims.has(entry.id), `Unreviewed numeric target ${entry.id}`);
  assert.deepEqual([entry.source, entry.relation, entry.min, entry.max], reviewedNumericClaims.get(entry.id), `Reviewed source or value drift for ${entry.id}`);
}
assert.ok(tdmInstitutionalResources.find((e) => e.id === 'sfpt-book').scopeFr.includes('chapitre 35'), 'SFPT preview attribution must remain transparent');
console.log('TDM per-claim audit lock: 22 bibliographic claims tied to their original sources.');

const blankView = searchTdmMolecules('');
assert.equal(blankView.groups.length, 0, 'No unsolicited full catalogue on initial load');
assert.equal(blankView.withoutTargets.length, 0);
for (const alias of ['MPA', 'MMF', 'mycophenolate']) {
  const view = searchTdmMolecules(alias);
  assert.equal(view.groups.length, 1, alias);
  assert.equal(view.groups[0].drug.id, 'mpa');
  assert.equal(view.groups[0].indications.length, 4, 'Kidney, heart, liver and lung must group by organ');
  const heart = view.groups[0].indications.find((row) => row.indicationFr === 'Greffe cardiaque');
  assert.equal(heart.primary.source, 'mpa2025', 'Consensus recommendation must precede exploratory study');
  assert.equal(heart.alternatives.length, 1, 'Other source must stay accessible in Details');
  assert.equal(heart.alternatives[0].source, 'mpa2015heart');
}
const valproateView = searchTdmMolecules('valproate');
assert.equal(valproateView.groups.length, 1);
assert.equal(valproateView.groups[0].indications.length, 1);
assert.equal(valproateView.groups[0].indications[0].primary.source, 'valproateRcp');
assert.equal(valproateView.groups[0].indications[0].alternatives.length, 2);
assert.equal(searchTdmMolecules('everolimus').groups[0].indications.length, 4);
assert.equal(searchTdmMolecules('lithium').groups[0].indications.length, 3);
assert.equal(searchTdmMolecules('cefepime').withoutTargets.length, 1);
assert.equal(searchTdmMolecules('cefepime').groups.length, 0);
assert.equal(searchTdmMolecules('not-a-molecule-xyz').groups.length, 0);
console.log('TDM compact UI grouping: molecule-only search, coherent indications and source details validated.');

console.log(`TDM manual linked index: ${tdmManualCatalog.length} named medicines across ${Object.keys(manualCatalogSources).length} official document types.`);
console.log(`TDM comparisons: ${comparisons.length} source-by-source groups validated.`);
console.log(`TDM target reference: ${tdmTargets.length} entries, ${tdmDrugs.length} drugs, ${Object.keys(tdmTargetSources).length} primary sources and ${tdmInstitutionalResources.length} SFT/SFPT context references validated.`);

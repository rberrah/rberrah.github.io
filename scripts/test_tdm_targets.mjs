import assert from 'node:assert/strict';
import {
  tdmTargetSources, tdmInstitutionalResources, TDM_REFERENCE_REVIEW_DATE,
  tdmDrugs, tdmTargets, normalizeTdmSearch, searchTdmTargets, formatTdmTarget
} from '../src/lib/content/tdmTargets.js';
import { collectTdmComparisons } from '../src/lib/content/tdmComparisons.js';
import { searchTdmMolecules } from '../src/lib/content/tdmSearchView.js';
import { tdmBrowseCategories } from '../src/lib/content/tdmBrowseCategories.js';
import { tdmEvidencePriority, tdmEvidenceForDrug, classifyTdmSource, regulatoryLabelsByDrug } from '../src/lib/content/tdmEvidenceGuide.js';
import { tdmManualCatalog, manualCatalogSources, searchManualCatalog } from '../src/lib/content/tdmManualCatalog.js';
import { tdmSafetySignals, tdmSafetyReferences } from '../src/lib/content/tdmSafetySignals.js';
import { historicalChuAssayForDrug } from '../src/lib/content/tdmChuAssayProvenance.js';
import { report as chuCoverage } from './report_tdm_coverage.mjs';
import { tdmPharmacologyProfiles, tdmPharmacologyForDrug, tdmPharmacologyCoverage, tdmPkReferences } from '../src/lib/content/tdmPharmacologyProfiles.js';

import {
  antibioticPdTargets, betaLactamIds, aminoglycosideIds, fluoroquinoloneIds,
  parseMic, formatMicCalculation, antibioticPdForDrug, antibioticPdReference, antibioticPdSource
} from '../src/lib/content/tdmAntibioticPd.js';
import {
  chuSamplingDocuments, antibioticsWithChuSamplingDocument, chuSamplingForDrug
} from '../src/lib/content/tdmChuSampling.js';


const pkCoverage = tdmPharmacologyCoverage();
assert.equal(pkCoverage.drugs, 132);
assert.equal(Object.keys(tdmPharmacologyProfiles).length, tdmDrugs.length,
  'Every canonical molecule must have a pharmacology record, even when unreviewed');
assert.deepEqual(new Set(Object.keys(tdmPharmacologyProfiles)), new Set(tdmDrugs.map((d) => d.id)));
assert.equal(pkCoverage.safe_automatic_scaling_count, 0,
  'No molecule is allowed to trigger a blind twofold dose scaling');
assert.ok(pkCoverage.with_index > 40 && pkCoverage.with_index < 132,
  'Reviewed indices must be useful, but not extrapolated to every drug');
assert.ok(pkCoverage.with_documented_routes > 20 && pkCoverage.with_documented_routes < 132,
  'Drug/formulation-specific routes must not be invented for the whole catalogue');
assert.ok(pkCoverage.with_reviewed_dose_behavior >= 20);
for (const profile of Object.values(tdmPharmacologyProfiles)) {
  assert.ok(profile.drug && profile.index && profile.practical && profile.administration && profile.proportionality);
  assert.equal(profile.proportionality.directRatioPermitted, false);
  assert.ok(['conditional_linear','nonlinear','complex','unassessed'].includes(profile.proportionality.kind));
  assert.ok(['unassessed','class_reviewed','drug_reviewed'].includes(profile.review));
  assert.ok(Array.isArray(profile.administration.codes));
  assert.equal(new Set(profile.administration.codes).size, profile.administration.codes.length);
  assert.ok(profile.administration.codes.every((code) => ['PO','IV','IM','INH','SC','TOP'].includes(code)));
  for (const sourceId of [
    profile.index.sourceId, profile.practical.sourceId,
    profile.administration.sourceId, profile.proportionality.sourceId
  ]) if (sourceId !== null) {
    assert.ok(tdmPkReferences[sourceId]?.url.startsWith('https://'),
      'Every populated PK dimension needs a URL source: '+profile.drug+'/'+sourceId);
  }
  if (profile.administration.codes.length) {
    assert.ok(profile.administration.sourceId, 'Documented routes require a source: '+profile.drug);
    assert.notEqual(profile.administration.scope, 'unreviewed');
  }
  if (profile.review === 'unassessed') {
    assert.equal(profile.index.key, 'unknown');
    assert.equal(profile.proportionality.kind, 'unassessed');
  }
}
assert.equal(tdmPharmacologyForDrug('nonexistent-drug'), null);
assert.equal(tdmPharmacologyForDrug('cefepime').index.key, 'fT_MIC');
assert.equal(tdmPharmacologyForDrug('cefepime').practical.key, 'Cmin_or_Css');
assert.match(tdmPharmacologyForDrug('cefepime').administration.modeFr, /prolongée ou continue/);
assert.match(tdmPharmacologyForDrug('vancomycin').administration.modeEn, /continuous IV infusion/);
assert.match(tdmPharmacologyForDrug('tac').administration.modeFr, /libération immédiate ou prolongée/);
assert.match(tdmPharmacologyForDrug('mpa').administration.modeFr, /MMF IV chez l’adulte/);
assert.match(tdmPharmacologyForDrug('methotrexate').administration.modeFr, /début de la perfusion/);

assert.equal(tdmPharmacologyForDrug('amikacin').index.key, 'AUC_MIC_and_Cmax_MIC');
assert.equal(tdmPharmacologyForDrug('amikacin').practical.key, 'peak_and_late');
assert.equal(tdmPharmacologyForDrug('ciprofloxacin').index.key, 'fAUC_MIC');
assert.equal(tdmPharmacologyForDrug('vancomycin').index.key, 'AUC24_MIC');
assert.equal(tdmPharmacologyForDrug('vancomycin').practical.key, 'auc_bayesian');
assert.equal(tdmPharmacologyForDrug('linezolid').index.key, 'AUC_MIC');
assert.equal(tdmPharmacologyForDrug('teicoplanin').practical.key, 'Cmin');
assert.equal(tdmPharmacologyForDrug('tac').index.key, 'AUC_interval');
assert.equal(tdmPharmacologyForDrug('tac').proportionality.kind, 'conditional_linear');
assert.equal(tdmPharmacologyForDrug('tac').proportionality.sourceId, 'tacrolimusFDAProportional');
assert.match(tdmPharmacologyForDrug('tac').proportionality.noteFr, /3, 7 et 10 mg/);
assert.equal(tdmPharmacologyForDrug('cyclosporine').proportionality.kind, 'conditional_linear');
assert.equal(tdmPharmacologyForDrug('cyclosporine').proportionality.sourceId, 'neoralFDAProportional');
assert.match(tdmPharmacologyForDrug('cyclosporine').administration.modeFr, /Neoral/);
assert.equal(tdmPharmacologyForDrug('mpa').proportionality.sourceId, 'mpaDoseNonlinear2026');
assert.match(tdmPharmacologyForDrug('mpa').proportionality.noteFr, /0,513/);
assert.match(tdmPharmacologyForDrug('mpa').proportionality.noteFr, /1,43/);
assert.equal(tdmPharmacologyForDrug('tac').practical.key, 'Cmin');
assert.equal(tdmPharmacologyForDrug('mpa').index.key, 'AUC_interval');
assert.equal(tdmPharmacologyForDrug('mpa').proportionality.kind, 'nonlinear');
assert.equal(tdmPharmacologyForDrug('everolimus').index.key, 'Cmin');
assert.equal(tdmPharmacologyForDrug('everolimus').proportionality.kind, 'conditional_linear');
assert.equal(tdmPharmacologyForDrug('voriconazole').proportionality.kind, 'nonlinear');
assert.equal(tdmPharmacologyForDrug('phenytoin').proportionality.kind, 'nonlinear');
assert.equal(tdmPharmacologyForDrug('valproate').proportionality.kind, 'complex');
assert.ok(tdmPharmacologyForDrug('valproate').proportionality.noteFr.includes('valproate libre'));
assert.equal(tdmPharmacologyForDrug('carbamazepine').proportionality.kind, 'complex');
assert.match(tdmPharmacologyForDrug('carbamazepine').proportionality.noteFr, /auto-induction/);
assert.equal(tdmPharmacologyForDrug('rifampicin').proportionality.kind, 'nonlinear');
assert.equal(tdmPharmacologyForDrug('rifampicin').index.key, 'AUC_MIC');
assert.equal(tdmPharmacologyForDrug('rifampicin').proportionality.sourceId, 'rifampicinPK2016');

assert.deepEqual(tdmPharmacologyForDrug('voriconazole').administration.codes, ['PO','IV']);
assert.deepEqual(tdmPharmacologyForDrug('mpa').administration.codes, ['PO','IV']);
assert.deepEqual(tdmPharmacologyForDrug('amoxicillin').administration.codes, ['PO','IV']);
assert.equal(tdmPharmacologyForDrug('amoxicillin').proportionality.kind, 'conditional_linear');
assert.equal(tdmPharmacologyForDrug('agomelatine').index.key, 'Cmax_reference');
assert.equal(tdmPharmacologyForDrug('methotrexate').index.key, 'time_indexed');
assert.equal(tdmPharmacologyForDrug('busulfan').index.key, 'AUC_cumulative');
assert.equal(tdmPharmacologyForDrug('ibrutinib').review, 'unassessed');
assert.equal(tdmPharmacologyForDrug('ibrutinib').administration.codes.length, 0);
assert.equal(searchTdmMolecules('MPA').groups[0].pharmacology.index.key, 'AUC_interval');
assert.equal(searchTdmMolecules('cefepime').groups[0].pharmacology.index.key, 'fT_MIC');
assert.equal(searchTdmMolecules('phenytoin').groups[0].pharmacology.proportionality.kind, 'nonlinear');
assert.equal(searchTdmMolecules('ibrutinib').withoutTargets[0].pharmacology.review, 'unassessed');
console.log('TDM PK/PD profiles: 132 covered, class and molecule indices/route sources audited, no automatic dose scaling.');

assert.equal(chuCoverage.curated_drugs, 132);
assert.equal(chuCoverage.bibliographic_numeric_entries, 131);
assert.equal(chuCoverage.verified_chu_document_names, 74);
assert.equal(chuCoverage.manual_names_indexed, 74, 'All 74 reviewed CHU document names must remain discoverable');
assert.equal(chuCoverage.evidence_types.listed_as_dosed_in_protocol, 36);
assert.equal(chuCoverage.evidence_types.request_form_only, 5);
assert.equal(chuCoverage.evidence_types.external_referral, 1);
assert.equal(chuCoverage.all_chu_document_names_indexed, true);
assert.ok(chuCoverage.scientifically_unresolved_chu_names.every((entry) =>
  entry.provenance && entry.name), 'Every missing reference must retain CHU-document provenance');
console.log('CHU TDM documentary coverage: 74/74 names indexed with status and target/missing-target classification.');

const ids = new Set();
const drugIds = new Set(tdmDrugs.map((drug) => drug.id));
assert.equal(drugIds.size, tdmDrugs.length, 'Canonical drug identifiers must be unique');
const validRelations = new Set(['range', 'above', 'approx', 'target', 'at_most']);
const validStatuses = new Set(['guideline', 'study', 'review', 'regulatory', 'institutional']);

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
assert.equal(searchTdmTargets({ query: 'tacrolimus' }).length, 7);
assert.equal(searchTdmTargets({ query: 'lithium' }).length, 4);
assert.equal(searchTdmTargets({ query: 'cardiaque' }).length, 5);
assert.equal(searchTdmTargets({ query: 'heart' }).length, 5);
assert.equal(searchTdmTargets({ query: 'heart', drug: 'mpa' }).length, 2);
assert.equal(searchTdmTargets({ query: 'évérolimus' }).length, 6);
assert.equal(searchTdmTargets({ drug: 'everolimus', indication: 'heart' }).length, 2);
assert.equal(searchTdmTargets({ drug: 'mpa', indication: 'kidney' }).length, 2);
assert.equal(searchTdmTargets({ drug: 'vancomycin' }).length, 1);
assert.equal(searchTdmTargets({ query: 'valproate' }).length, 3);
assert.equal(searchTdmTargets({ drug: 'linezolid' }).length, 1);
assert.equal(searchTdmTargets({ drug: 'teicoplanin' }).length, 2);
assert.equal(searchTdmTargets({ query: 'Targocid' }).length, 2);
assert.equal(searchTdmTargets({ drug: 'busulfan' }).length, 2);
assert.equal(searchTdmTargets({ drug: 'clozapine' }).length, 1);
assert.equal(searchTdmTargets({ drug: 'flucytosine' }).length, 2);
assert.equal(searchTdmTargets({ drug: 'itraconazole' }).length, 2);
assert.equal(searchTdmTargets({ drug: 'aripiprazole' }).length, 2);
assert.equal(searchTdmTargets({ drug: 'risperidone' }).length, 1);
assert.equal(searchTdmTargets({ drug: 'asenapine' }).length, 1);
assert.equal(searchTdmTargets({ drug: 'brivaracetam' }).length, 1);
assert.ok(tdmTargetSources.oxcarb2018.newerConsensusUrl.includes('42392224'),
  'All 2018 AED historical references must signal the newer 2026 consensus.');

assert.equal(searchTdmTargets({ drug: 'clobazam' }).length, 2);
assert.equal(searchTdmTargets({ drug: 'topiramate' }).length, 1);
assert.equal(tdmTargets.find((r) => r.id === 'aed-clonazepam-norway2018').unit, 'ng/mL');
assert.equal(tdmTargets.find((r) => r.id === 'aed-eslicarbazepine-norway2018').matrixFr, 'Sérum · S-licarbazépine (forme active)');
assert.ok(tdmBrowseCategories.find((g) => g.id === 'antiseizure').medicines.some((d) => d.id === 'topiramate'));

assert.equal(searchTdmTargets({ drug: 'agomelatine' }).length, 1);
assert.equal(searchTdmTargets({ drug: 'bupropion' }).length, 2);
assert.equal(searchTdmTargets({ drug: 'tranylcypromine' }).length, 1);
assert.equal(formatTdmTarget(tdmTargets.find((row) => row.id === 'ad-tranylcypromine-mdd-extension-2025')), '≤50');
assert.equal(tdmTargets.find((row) => row.id === 'ad-agomelatine-mdd-extension-2025').metric, 'Cmax à 1–2 h après prise');
assert.equal(tdmTargets.find((row) => row.id === 'ad-bupropion-hydroxy-mdd-extension-2025').min, 850);

assert.equal(searchTdmTargets({ drug: 'methotrexate' }).length, 0, 'HD-MTX has safety thresholds, not a therapeutic window');
assert.equal(searchTdmMolecules('méthotrexate').groups[0].safetySignals.length, 4);
assert.equal(searchTdmMolecules('haloperidol').groups[0].indications.length, 1);
assert.ok(tdmTargetSources.antipsychoticJoint2020.newerConsensusUrl.includes('42392224'));
assert.equal(tdmTargets.find((r) => r.id === 'aps-risperidone-schizophrenia-2020').metric, 'C₀ (somme active)');
assert.equal(tdmTargets.find((r) => r.id === 'aps-flupentixol-schizophrenia-2020').metric, 'C₀ (isomère cis)');
assert.equal(tdmTargets.find((r) => r.id === 'aps-aripiprazole-active-moiety-2020').min, 150);

assert.equal(searchTdmTargets({ query: 'Sporanox' }).length, 2);
assert.equal(tdmTargets.find((r) => r.id === 'flucytosine-peak-ukhsa').min, 50);
assert.equal(tdmTargets.find((r) => r.id === 'flucytosine-peak-ukhsa').metric, 'Cmax (prélèvement post-dose)');
assert.equal(tdmTargets.find((r) => r.id === 'itraconazole-combined-ia-idsa').metric, 'C₀ (somme des deux analytes)');
assert.equal(tdmTargets.find((r) => r.id === 'itraconazole-parent-histo-idsa2025').metric, 'C₀ (itraconazole seul)');
assert.equal(formatTdmTarget(tdmTargets.find((r) => r.id === 'busulfan-iei-protocol-a')), '85–95');
assert.equal(tdmTargets.find((r) => r.id === 'busulfan-iei-protocol-a').metric, 'AUC cumulée');
assert.equal(tdmTargets.find((r) => r.id === 'teicoplanin-severe-hplc').matrixFr, 'Sérum · HPLC');
assert.equal(tdmTargets.find((r) => r.id === 'teicoplanin-severe-fpia').matrixFr, 'Sérum · FPIA');
assert.equal(tdmEvidenceForDrug('teicoplanin').byTier[0].id, 'regulatory');
assert.equal(tdmEvidenceForDrug('busulfan').byTier[0].id, 'society');
assert.equal(tdmEvidenceForDrug('busulfan').exposure.tagFr, 'AUC cumulée prioritaire');
for (const [id, category] of [['teicoplanin','antibiotics'],['clozapine','psychotropics'],['busulfan','oncology'],['flucytosine','antifungals'],['itraconazole','antifungals']]) {
  assert.ok(tdmBrowseCategories.find((item) => item.id === category).medicines.some((item) => item.id === id));
}
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
assert.equal(searchManualCatalog({query: 'agomelatine'})[0].drugKey, 'agomelatine');
for (const [name, id] of [
  ['Amoxapine','amoxapine'],['Iproniazide','iproniazid'],
  ['Lidocaïne','lidocaine'],['Bupivacaïne','bupivacaine'],
  ['Ropivacaïne','ropivacaine'],['Mépivacaïne','mepivacaine'],
  ['Ibrutinib','ibrutinib']
]) {
  assert.equal(searchManualCatalog({query: name})[0].drugKey, id,
    'A CHU-only drug needs a canonical ID even when no numeric target exists');
  assert.equal(searchTdmMolecules(name).withoutTargets.length, 1,
    'Unqualified manual evidence must appear without a fabricated target');
  assert.equal(searchTdmTargets({drug: id}).length, 0);
}
assert.equal(searchManualCatalog({query: 'ibrutinib'}).length, 1);
assert.equal(searchManualCatalog({query: 'tacrolimus'}).length, 1);
assert.equal(searchManualCatalog({query: 'valproate'}).length, 1);
assert.equal(searchManualCatalog({query: 'MMF'}).length, 1);
assert.equal(searchManualCatalog({family: 'antibiotics'}).length, 36);
assert.equal(searchManualCatalog({family: 'antidepressants'}).length, 26);
assert.ok(tdmManualCatalog.every((entry) => Boolean(manualCatalogSources[entry.sourceId])));
assert.ok(tdmManualCatalog.filter((entry) => entry.status === 'request_form_only').every((entry) =>
  manualCatalogSources[entry.sourceId].type === 'request_form'));
assert.ok(tdmManualCatalog.filter((entry) => !tdmTargets.some((target) => target.drug === entry.drugKey)).length > 20);



// Time-dependent safety signals MUST NOT become entries in the therapeutic target registry.
assert.equal(tdmSafetySignals.length, 4);
assert.ok(tdmSafetySignals.every((item) => !tdmTargets.some((entry) => entry.id === item.id)));
assert.deepEqual(tdmSafetySignals.map((item) => item.timeHoursAfterInfusionStart), [24,36,42,48]);
assert.deepEqual(tdmSafetySignals.map((item) => item.value), [50,30,10,5]);
assert.ok(tdmSafetySignals.every((item) => item.kind === 'glucarpidase_consideration' && item.unit === 'µmol/L'));
assert.equal(tdmSafetyReferences.europeanHdMtx2024.url, 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11446969/');

const reviewedNumericClaims = new Map([
  ["tac-kidney-early-auc", ["tac2025","target",160,null]],
  ["tac-kidney-mid-auc", ["tac2025","target",120,null]],
  ["tac-kidney-late-auc", ["tac2025","target",80,null]],
  ["everolimus-kidney-csa-fda", ["fdaZortress2026","range",3,8]],
  ["everolimus-liver-tac-fda", ["fdaZortress2026","range",3,8]],
  ["tac-liver-everolimus-fda", ["fdaZortress2026","range",3,5]],
  ["isoniazid-tb-peak", ["tbTdmMeta2023","range",3,6]],
  ["rifampicin-tb-peak", ["tbTdmMeta2023","range",8,24]],
  ["csa-kidney-c0-0", ["thaiKT2026","range",150,300]],
  ["csa-kidney-c0-3", ["thaiKT2026","range",100,200]],
  ["csa-kidney-c0-6", ["thaiKT2026","range",80,150]],
  ["csa-kidney-c2-0", ["thaiKT2026","range",800,1200]],
  ["csa-kidney-c2-3", ["thaiKT2026","range",600,1000]],
  ["csa-kidney-c2-6", ["thaiKT2026","range",500,800]],
  ["sirolimus-kidney-with-csa", ["sirolimus2022","range",4,12]],
  ["sirolimus-kidney-after-csa", ["sirolimus2022","range",12,20]],
  ["voriconazole-icu", ["icuTdm2020","range",2,6]],
  ["posaconazole-prophylaxis", ["icuTdm2020","above",0.7,null]],
  ["posaconazole-treatment", ["icuTdm2020","above",1,null]],
  ["ad-amitriptyline-mdd-2025", ["antidepressant2025","range",80,200]],
  ["ad-citalopram-mdd-2025", ["antidepressant2025","range",50,110]],
  ["ad-clomipramine-mdd-2025", ["antidepressant2025","range",230,450]],
  ["ad-imipramine-mdd-2025", ["antidepressant2025","range",175,300]],
  ["ad-nortriptyline-mdd-2025", ["antidepressant2025","range",70,170]],
  ["ad-desipramine-mdd-2025", ["antidepressant2025","range",100,300]],
  ["ad-dosulepine-mdd-2025", ["antidepressant2025","range",45,100]],
  ["ad-doxepine-mdd-2025", ["antidepressant2025","range",50,150]],
  ["ad-duloxetine-mdd-2025", ["antidepressant2025","range",20,120]],
  ["ad-escitalopram-mdd-2025", ["antidepressant2025","range",20,40]],
  ["ad-fluvoxamine-mdd-2025", ["antidepressant2025","range",60,230]],
  ["ad-maprotiline-mdd-2025", ["antidepressant2025","range",75,130]],
  ["ad-milnacipran-mdd-2025", ["antidepressant2025","range",100,150]],
  ["ad-mirtazapine-mdd-2025", ["antidepressant2025","range",30,80]],
  ["ad-sertraline-mdd-2025", ["antidepressant2025","range",10,150]],
  ["ad-trimipramine-mdd-2025", ["antidepressant2025","range",150,300]],
  ["ad-venlafaxine-mdd-2025", ["antidepressant2025","range",140,600]],
  ["ad-vortioxetine-mdd-2025", ["antidepressant2025","range",10,40]],
  ["ad-fluoxetine-mdd-2025", ["antidepressant2025","range",120,500]],
  ["ad-mianserine-mdd-2025", ["antidepressant2025","range",15,70]],
  ["ad-moclobemide-mdd-2025", ["antidepressant2025","range",300,1000]],
  ["ad-paroxetine-mdd-2025", ["antidepressant2025","range",20,65]],
  ["ad-tianeptine-mdd-2025", ["antidepressant2025","range",30,80]],
  ["ad-duloxetine-mdd-2024", ["psychReview2024","range",30,120]],
  ["ad-escitalopram-mdd-2024", ["psychReview2024","range",15,80]],
  ["ad-vortioxetine-mdd-2024", ["psychReview2024","range",15,60]],
  ["carbamazepine-epilepsy", ["psychReview2024","range",4,12]],
  ["lamotrigine-epilepsy", ["psychReview2024","range",3,15]],
  ["oxcarbazepine-mhd-epilepsy", ["oxcarb2018","range",3,36]],
  ["levetiracetam-limoges", ["levetiLimoges2022","range",10,40]],
  ["levetiracetam-2016", ["levetiReview2016","range",12,46]],
  ["phenytoin-total-epilepsy", ["phenytoinFDA","range",10,20]],
  ["phenobarbital-epilepsy", ["phenobarbNHS","range",10,40]],
  ["digoxin-heart-failure", ["digoxinAHA2013","range",0.5,0.9]],
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
  ["lithium-response", ["lithium2019","range",0.8,1]],
  ["teicoplanin-severe-hplc", ["teicoplaninANSM2026","range",15,30]],
  ["teicoplanin-severe-fpia", ["teicoplaninANSM2026","range",30,40]],
  ["clozapine-maintenance-reference", ["clozapineRCPA2024","range",350,600]],
  ["busulfan-iei-protocol-a", ["busulfanEBMT2026","range",85,95]],
  ["busulfan-iei-protocol-c", ["busulfanEBMT2026","range",60,70]],
  ["flucytosine-trough-ukhsa", ["ukhsaMycology","range",20,40]],
  ["flucytosine-peak-ukhsa", ["ukhsaMycology","range",50,100]],
  ["itraconazole-parent-histo-idsa2025", ["itraconazoleIDSA2025","above",1,null]],
  ["itraconazole-combined-ia-idsa", ["itraconazoleIDSA2016","above",1.5,null]],
  ["aps-fluphenazine-schizophrenia-2020", ["antipsychoticJoint2020","range",1,10]],
  ["aps-haloperidol-schizophrenia-2020", ["antipsychoticJoint2020","range",1,10]],
  ["aps-olanzapine-schizophrenia-2020", ["antipsychoticJoint2020","range",20,80]],
  ["aps-perazine-schizophrenia-2020", ["antipsychoticJoint2020","range",100,230]],
  ["aps-perphenazine-schizophrenia-2020", ["antipsychoticJoint2020","range",0.6,2.4]],
  ["aps-aripiprazole-schizophrenia-2020", ["antipsychoticJoint2020","range",100,350]],
  ["aps-chlorpromazine-schizophrenia-2020", ["antipsychoticJoint2020","range",30,300]],
  ["aps-flupentixol-schizophrenia-2020", ["antipsychoticJoint2020","range",0.5,5]],
  ["aps-paliperidone-schizophrenia-2020", ["antipsychoticJoint2020","range",20,60]],
  ["aps-quetiapine-schizophrenia-2020", ["antipsychoticJoint2020","range",100,500]],
  ["aps-risperidone-schizophrenia-2020", ["antipsychoticJoint2020","range",20,60]],
  ["aps-sertindole-schizophrenia-2020", ["antipsychoticJoint2020","range",50,100]],
  ["aps-ziprasidone-schizophrenia-2020", ["antipsychoticJoint2020","range",50,200]],
  ["aps-brexpiprazole-schizophrenia-2020", ["antipsychoticJoint2020","range",40,140]],
  ["aps-chlorprothixene-schizophrenia-2020", ["antipsychoticJoint2020","range",20,300]],
  ["aps-iloperidone-schizophrenia-2020", ["antipsychoticJoint2020","range",5,10]],
  ["aps-loxapine-schizophrenia-2020", ["antipsychoticJoint2020","range",5,10]],
  ["aps-lurasidone-schizophrenia-2020", ["antipsychoticJoint2020","range",15,40]],
  ["aps-melperone-schizophrenia-2020", ["antipsychoticJoint2020","range",30,100]],
  ["aps-pimozide-schizophrenia-2020", ["antipsychoticJoint2020","range",15,20]],
  ["aps-asenapine-schizophrenia-2020", ["antipsychoticJoint2020","range",1,5]],
  ["aps-aripiprazole-active-moiety-2020", ["antipsychoticJoint2020","range",150,500]],
  ["ad-agomelatine-mdd-extension-2025", ["antidepressant2025","range",7,300]],
  ["ad-trazodone-mdd-extension-2025", ["antidepressant2025","range",700,1000]],
  ["ad-desvenlafaxine-mdd-extension-2025", ["antidepressant2025","range",85,380]],
  ["ad-levomilnacipran-mdd-extension-2025", ["antidepressant2025","range",80,120]],
  ["ad-reboxetine-mdd-extension-2025", ["antidepressant2025","range",60,350]],
  ["ad-vilazodone-mdd-extension-2025", ["antidepressant2025","range",15,45]],
  ["ad-bupropion-mdd-extension-2025", ["antidepressant2025","range",10,100]],
  ["ad-tranylcypromine-mdd-extension-2025", ["antidepressant2025","at_most",50,null]],
  ["ad-bupropion-hydroxy-mdd-extension-2025", ["antidepressant2025","range",850,1500]],
  ["aed-brivaracetam-norway2018", ["oxcarb2018","range",0.2,2]],
  ["aed-clobazam-norway2018", ["oxcarb2018","range",0.03,0.3]],
  ["aed-clonazepam-norway2018", ["oxcarb2018","range",13,38]],
  ["aed-eslicarbazepine-norway2018", ["oxcarb2018","range",3,26]],
  ["aed-ethosuximide-norway2018", ["oxcarb2018","range",39,99]],
  ["aed-felbamate-norway2018", ["oxcarb2018","range",30,60]],
  ["aed-gabapentin-norway2018", ["oxcarb2018","range",3,21]],
  ["aed-lacosamide-norway2018", ["oxcarb2018","range",3,10]],
  ["aed-perampanel-norway2018", ["oxcarb2018","range",0.1,1]],
  ["aed-pregabalin-norway2018", ["oxcarb2018","range",2,6]],
  ["aed-rufinamide-norway2018", ["oxcarb2018","range",4,31]],
  ["aed-stiripentol-norway2018", ["oxcarb2018","range",4,22]],
  ["aed-sulthiame-norway2018", ["oxcarb2018","range",2,10]],
  ["aed-topiramate-norway2018", ["oxcarb2018","range",2,10]],
  ["aed-zonisamide-norway2018", ["oxcarb2018","range",10,38]],
  ["aed-clobazam-active-metabolite-norway2018", ["oxcarb2018","range",0.3,3]]
]);
assert.equal(reviewedNumericClaims.size, 131);
assert.equal(tdmTargets.length, reviewedNumericClaims.size, 'Any new target requires an explicit source review');
assert.equal(Object.keys(tdmTargetSources).length, 32, 'Any new source requires review');
assert.equal(new Set(Object.values(tdmTargetSources).map((source) => source.citation)).size, 32, 'Every numeric reference needs a distinct citation label');
for (const entry of tdmTargets) {
  assert.ok(reviewedNumericClaims.has(entry.id), `Unreviewed numeric target ${entry.id}`);
  assert.deepEqual([entry.source, entry.relation, entry.min, entry.max], reviewedNumericClaims.get(entry.id), `Reviewed source or value drift for ${entry.id}`);
}
assert.ok(tdmInstitutionalResources.find((e) => e.id === 'sfpt-book').scopeFr.includes('chapitre 35'), 'SFPT preview attribution must remain transparent');
console.log('TDM per-claim audit lock: 131 bibliographic claims tied to their original sources.');

// The sources are as important as the numeric claims: a changed target hyperlink or
// DOI must be explicitly reviewed rather than silently retaining a valid-looking value.
const reviewedSourceIdentifiers = {
  "fdaZortress2026": ["https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e082a024-7850-400b-a5c2-2a140612562a", null],
  "thaiKT2026": ["https://pmc.ncbi.nlm.nih.gov/articles/PMC13624913/", "10.1111/nep.70268"],
  "sirolimus2022": ["https://onlinelibrary.wiley.com/doi/full/10.1111/jcpt.13753", "10.1111/jcpt.13753"],
  "icuTdm2020": ["https://pmc.ncbi.nlm.nih.gov/articles/PMC7223855/", "10.1007/s00134-020-06050-1"],
  "antidepressant2025": ["https://pmc.ncbi.nlm.nih.gov/articles/PMC12672037/", "10.1097/YCO.0000000000001046"],
  "psychReview2024": ["https://pmc.ncbi.nlm.nih.gov/articles/PMC11124530/", "10.3390/ph17050642"],
  "levetiLimoges2022": ["https://pubmed.ncbi.nlm.nih.gov/35239286/", "10.1097/FTD.0000000000000972"],
  "levetiReview2016": ["https://pmc.ncbi.nlm.nih.gov/articles/PMC5114206/", null],
  "oxcarb2018": ["https://pmc.ncbi.nlm.nih.gov/articles/PMC5811172/", null],
  "phenytoinFDA": ["https://dailymed-beta.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=f339f9e4-b289-4efe-82b9-46c57d1dc277&type=display", null],
  "phenobarbNHS": ["https://laboratories.newcastle-hospitals.nhs.uk/test-directory/phenobarbitone-serum/", null],
  "digoxinAHA2013": ["https://www.jacc.org/doi/10.1016/j.jacc.2013.05.019", "10.1016/j.jacc.2013.05.019"],
  "tbTdmMeta2023": ["https://pmc.ncbi.nlm.nih.gov/articles/PMC10622255/", null],
  "mpa2025": [
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC12456993/",
    "10.1631/jzus.B2400069"
  ],
  "mpa2015heart": [
    "https://pubmed.ncbi.nlm.nih.gov/26192348/",
    "10.1016/j.phrs.2015.07.012"
  ],
  "tac2025": [
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC12122127/",
    "10.1111/bcp.16098"
  ],
  "everolimus2025": [
    "https://doi.org/10.1097/FTD.0000000000001250",
    "10.1097/FTD.0000000000001250"
  ],
  "mpa2021": [
    "https://research.dial.uclouvain.be/bitstreams/0c98746c-847b-4e2d-8e96-c788c25851e9/download",
    "10.1097/FTD.0000000000000871"
  ],
  "valproateRcp": [
    "https://base-donnees-publique.medicaments.gouv.fr/medicament/67025516/extrait",
    null
  ],
  "valproateTdm": [
    "https://www.elsevier-masson.fr/media/wysiwyg/PDF/FR/9782294787935_valproate_pharm.pdf",
    null
  ],
  "valproateSfpt2010": [
    "https://pubmed.ncbi.nlm.nih.gov/20699076/",
    "10.2515/therapie/2010029"
  ],
  "lithiumNice": [
    "https://www.nice.org.uk/guidance/cg185/chapter/recommendations",
    null
  ],
  "linezolid2022": [
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC9399604/",
    null
  ],
  "vancomycin2020": [
    "https://www.idsociety.org/practice-guideline/vancomycin/",
    "10.1093/ajhp/zxaa036"
  ],
  "lithium2019": [
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC6688930/",
    "10.1111/bdi.12805"
  ],
  "teicoplaninANSM2026": [
    "https://base-donnees-publique.medicaments.gouv.fr/medicament/64196782/extrait",
    null
  ],
  "clozapineRCPA2024": [
    "https://www.rcpa.edu.au/Manuals/RCPA-Manual/Pathology-Tests/C/Clozapine",
    null
  ],
  "busulfanEBMT2026": [
    "https://doi.org/10.1038/s41409-026-02906-0",
    "10.1038/s41409-026-02906-0"
  ],
  "ukhsaMycology": [
    "https://www.gov.uk/government/publications/mycology-reference-laboratory-mrl-service-user-handbook/mycology-reference-laboratory-service-user-handbook",
    null
  ],
  "itraconazoleIDSA2016": [
    "https://www.idsociety.org/practice-guideline/aspergillosis",
    "10.1093/cid/ciw326"
  ],
  "itraconazoleIDSA2025": [
    "https://www.idsociety.org/practice-guideline/histoplasmosis/",
    null
  ],
  "antipsychoticJoint2020": [
    "https://www.psychiatrist.com/pdf/blood-levels-to-optimize-antipsychotic-treatment-in-clinical-practice-a-joint-consensus-statement-of-the-american-society-of-clinical-psychopharmacology-and-the-therapeutic-drug-monitoring-task-force/",
    "10.4088/JCP.19cs13169"
  ]
};
assert.equal(Object.keys(tdmTargetSources).length, Object.keys(reviewedSourceIdentifiers).length);
for (const [key, [url, doi]] of Object.entries(reviewedSourceIdentifiers)) {
  assert.ok(tdmTargetSources[key], `Missing audited source ${key}`);
  assert.equal(tdmTargetSources[key].url, url, `Unreviewed source URL for ${key}`);
  assert.equal(tdmTargetSources[key].doi ?? null, doi, `Unreviewed DOI for ${key}`);
  assert.ok(tdmTargetSources[key].evidenceSection.length >= 18, `Missing exact claim locator for ${key}`);
}
console.log('TDM source link integrity: all 32 reviewed URLs and DOI identifiers pinned.');


assert.equal(tdmTargets.filter((row)=>row.source === 'antidepressant2025').length, 32);
assert.ok(tdmTargetSources.antidepressant2025.newerConsensusUrl?.includes('42392224'),
  'Require explicit referral to the newer 2026 AGNP consensus for unresolved updates');
assert.equal(searchTdmMolecules('ciclosporine').groups[0].indications.length, 6);
assert.equal(searchTdmMolecules('sirolimus').groups[0].indications.length, 2);
assert.equal(searchTdmMolecules('posaconazole').groups[0].indications.length, 2);
assert.equal(searchTdmMolecules('voriconazole').groups[0].indications.length, 1);
assert.equal(searchTdmMolecules('amitriptyline').groups[0].indications.length, 1);
assert.equal(searchTdmMolecules('doxépine').groups[0].indications.length, 1);
assert.equal(searchTdmMolecules('venlafaxine').groups[0].indications.length, 1);
assert.equal(searchTdmMolecules('levetiracetam').groups[0].indications.length, 1);
assert.equal(searchTdmMolecules('levetiracetam').groups[0].indications[0].alternatives.length, 1);
assert.equal(searchTdmMolecules('escitalopram').groups[0].indications[0].alternatives.length, 1);
assert.equal(searchTdmMolecules('phenobarbital').groups[0].indications.length, 1);
assert.equal(searchTdmMolecules('digoxin').groups[0].indications.length, 1);
const mpaByDrug = tdmTargets.filter((row) => row.drug === 'mpa');
assert.equal(mpaByDrug.length, 6, 'Existing MPA original values unchanged');
assert.ok(tdmTargets.filter((row) => row.source === 'icuTdm2020' && row.drug === 'posaconazole')
 .every((row) => row.status === 'review'), 'Do not imply ICU panel recommends systematic posaconazole TDM');
assert.equal(tdmTargets.find((row) => row.id === 'phenobarbital-epilepsy').status, 'institutional');

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
assert.equal(searchTdmMolecules('everolimus').groups[0].indications.length, 6);
assert.equal(searchTdmMolecules('lithium').groups[0].indications.length, 3);
assert.equal(searchTdmMolecules('cefepime').withoutTargets.length, 0);
assert.equal(searchTdmMolecules('cefepime').groups.length, 1);
assert.equal(searchTdmMolecules('not-a-molecule-xyz').groups.length, 0);

const allGroups = tdmBrowseCategories;
assert.ok(allGroups.length >= 8);
assert.ok(allGroups.every((group) => group.medicines.length && group.fr && group.en));
const listedKeys = allGroups.flatMap((group) => group.medicines.map((entry) => entry.id));
assert.equal(listedKeys.length, new Set(listedKeys).size, 'Each molecule should appear in exactly one category');
assert.ok(tdmDrugs.every((drug) => listedKeys.includes(drug.id)), 'All searchable drugs need a family');
assert.ok(tdmBrowseCategories.find((group) => group.id === 'psychotropics').medicines.some((d) => d.id === 'haloperidol'));
assert.equal(tdmBrowseCategories.find((group) => group.id === 'psychotropics').medicines.find((d) => d.id === 'clozapine').historicallyAssayedAtChu, true);
assert.equal(historicalChuAssayForDrug('clozapine').period, '2010–2022');
assert.equal(historicalChuAssayForDrug('haloperidol'), null);
assert.equal(tdmBrowseCategories.find((group) => group.id === 'antibiotics').medicines.find((d) => d.id === 'amikacin').chuEvidenceStatus, 'listed_as_dosed');
assert.equal(tdmBrowseCategories.find((group) => group.id === 'immunosuppressants').medicines.find((d) => d.id === 'tac').chuEvidenceStatus, 'request_form_only');

assert.ok(tdmBrowseCategories.find((group) => group.id === 'oncology').medicines.some((d) => d.id === 'methotrexate'));

assert.ok(tdmManualCatalog.every((entry) => listedKeys.includes(entry.drugKey) || listedKeys.includes(entry.id)),
  'All reviewed CHU assay names must be discoverable in the directory');
assert.ok(allGroups.some((group) => group.id === 'antibiotics' && group.medicines.length === 37),
  '36 CHU-listed antibiotics plus teicoplanin from the official ANSM SmPC');
assert.ok(allGroups.some((group) => group.id === 'antidepressants' && group.medicines.length === 33),
  '26 CHU-listed antidepressants plus seven additional drugs; agomelatine is not duplicated');
assert.ok(allGroups.some((group) => group.id === 'immunosuppressants' && group.medicines.length === 5));
assert.deepEqual(tdmEvidencePriority.map((tier) => tier.id),
  ['society', 'regulatory', 'limoges', 'other']);
assert.equal(classifyTdmSource('everolimus2025'), 'society');
assert.equal(classifyTdmSource('valproateRcp'), 'regulatory');
assert.equal(classifyTdmSource('fdaZortress2026'), 'regulatory');
assert.equal(classifyTdmSource('levetiLimoges2022'), 'limoges');
assert.equal(classifyTdmSource('tac2025'), 'other');
assert.deepEqual(regulatoryLabelsByDrug.tac.map((label) => label.authority), ['ANSM','EMA','FDA']);
assert.ok(regulatoryLabelsByDrug.mpa.some((label) => label.authority === 'EMA'));
assert.ok(regulatoryLabelsByDrug.everolimus.some((label) => label.authority === 'FDA'));
const tacEvidence = tdmEvidenceForDrug('tac');
assert.equal(tacEvidence.byTier[0].id, 'society');
assert.ok(tacEvidence.byTier[0].papers.some((p) => p.url === 'https://pubmed.ncbi.nlm.nih.gov/31045868/'),
  'Tacrolimus must link the original IATDMCT 2019 second consensus before RCP and Limoges research');
assert.match(tacEvidence.exposure.detailFr, /C₀/);
assert.ok(tacEvidence.byTier.some((tier) => tier.id === 'regulatory'));
assert.deepEqual(tacEvidence.byTier.find((tier) => tier.id === 'regulatory').papers.slice(0,2)
  .map((paper) => paper.citation.split(' · ')[0]), ['ANSM', 'EMA'],
  'Inside regulatory tier, prioritize French RCP then EMA SmPC before FDA label');
assert.ok(tacEvidence.byTier.find((tier) => tier.id === 'limoges').papers.some((p) => p.citation.includes('Woillard')));
assert.ok(tdmEvidenceForDrug('mpa').exposure.tagFr.includes('AUC'));
assert.ok(tdmEvidenceForDrug('everolimus').exposure.tagFr.includes('C₀'));
const tacTargets = searchTdmMolecules('tacrolimus').groups[0].indications;
assert.equal(tacTargets.length, 7);
assert.ok(tacTargets[0].metric.startsWith('AUC'), 'Tacrolimus AUC targets before C0 proxy on screen');
assert.deepEqual(tacTargets.filter((row) => row.metric.startsWith('AUC')).map((row) => row.primary.min), [160,120,80]);
assert.equal(tdmTargets.filter((row) => row.source === 'fdaZortress2026').length, 3);
assert.equal(formatTdmTarget(tdmTargets.find((row) => row.id === 'tac-kidney-early-auc')), '160');
console.log('TDM navigation and priority: all drugs indexed, society/RCP/Limoges order, AUC/C0 distinction validated.');

console.log('TDM compact UI grouping: molecule-only search, coherent indications and source details validated.');


const chuAntibiotics = searchManualCatalog({ family: 'antibiotics' });
assert.equal(chuAntibiotics.length, 36, 'Official CHU document lists 36 antibiotics');
assert.equal(antibioticsWithChuSamplingDocument.length, 36);
assert.equal(new Set(antibioticsWithChuSamplingDocument).size, 36);
assert.equal(new Set(chuAntibiotics.map((entry) => entry.drugKey)).size, 36);
assert.ok(chuAntibiotics.every((entry) =>
  entry.drugKey && chuSamplingForDrug(entry.drugKey)?.url === chuSamplingDocuments.ptpAntibiotics2026.url),
  'Every official listed antibiotic must have precisely the verified sampling-times document');
assert.equal(chuSamplingDocuments.ptpAntibiotics2026.url,
  'https://chu-limoges.manuelprelevement.fr/DocumentNew.aspx?idDoc=41157');
assert.equal(chuSamplingDocuments.ptpAntibiotics2026.kind, 'sampling_times');
assert.equal(chuSamplingForDrug('lithium'), null);
assert.equal(chuSamplingForDrug('mpa'), null,
  'The immunosuppressant prescription is not a sampling-times-only document');
assert.equal(chuSamplingForDrug('amitriptyline'), null,
  'The antidepressant examination is not a verified sampling-times document');
assert.equal(chuSamplingForDrug('nonexistent'), null);

assert.equal(antibioticPdTargets.length, 2 * 16 + 3 + 4 + 1 + 1);
assert.equal(betaLactamIds.length, 16);
assert.equal(aminoglycosideIds.length, 3);
assert.equal(fluoroquinoloneIds.length, 4);
assert.equal(new Set(antibioticPdTargets.map((entry) => entry.id)).size,
  antibioticPdTargets.length);
const validPdKinds = new Set([
  'beta_trough', 'beta_continuous', 'peak_ratio', 'free_auc_ratio',
  'total_auc_ratio', 'vancomycin_mic1'
]);
for (const pd of antibioticPdTargets) {
  assert.ok(validPdKinds.has(pd.kind), pd.id);
  assert.ok(drugIds.has(pd.drug), 'MIC target not searchable: ' + pd.drug);
  assert.ok(chuSamplingForDrug(pd.drug), 'MIC target not associated with an official CHU antibiotic sampling document: ' + pd.drug);
  assert.ok(pd.criterionFr && pd.contextFr && pd.criterionEn && pd.contextEn, pd.id);
  assert.ok(pd.evidenceSection && pd.evidenceSection.length > 20, pd.id);
  assert.match(antibioticPdReference(pd).url, /^https:\/\//);
}
assert.equal(antibioticPdSource.url, 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7223855/');
assert.equal(antibioticPdSource.doi, '10.1007/s00134-020-06050-1');
assert.equal(antibioticPdForDrug('cefepime').length, 2);
assert.equal(antibioticPdForDrug('avibactam').length, 0,
  'Avibactam inhibitor does not get an invented beta-lactam active-drug target');
assert.equal(antibioticPdForDrug('tazobactam').length, 0,
  'Tazobactam inhibitor does not get an invented PK/PD target');
assert.equal(antibioticPdForDrug('amikacin').length, 1);
assert.equal(antibioticPdForDrug('ciprofloxacin').length, 1);
assert.equal(antibioticPdForDrug('daptomycin').length, 1);
assert.equal(antibioticPdForDrug('vancomycin').length, 1);
assert.equal(searchTdmMolecules('céfépime').groups[0].pdTargets.length, 2);
assert.equal(searchTdmMolecules('cefepime').groups[0].samplingDocument.code, 'PTP PREA 0059 C');
assert.equal(searchTdmMolecules('amikacine').groups[0].pdTargets.length, 1);
assert.equal(searchTdmMolecules('gentamicine').groups[0].pdTargets.length, 1);
assert.equal(searchTdmMolecules('ciprofloxacine').groups[0].pdTargets.length, 1);
assert.equal(searchTdmMolecules('vancomycine').groups[0].pdTargets.length, 1);
assert.equal(searchTdmMolecules('vancomycine').groups[0].indications.length, 1);
assert.equal(searchTdmMolecules('tazobactam').withoutTargets.length, 1);
assert.equal(searchTdmMolecules('tazobactam').withoutTargets[0].samplingDocument.code, 'PTP PREA 0059 C');
assert.equal(searchTdmMolecules('lithium').groups[0].samplingDocument, null);

assert.equal(parseMic('0,5'), 0.5);
assert.equal(parseMic('0.125'), 0.125);
assert.equal(parseMic(' 2 '), 2);
for (const invalid of ['', '0', '-1', 'NaN', 'Infinity', '1e5', '1,2,3', '1025']) {
  assert.equal(parseMic(invalid), null, 'Invalid MIC: ' + invalid);
}
const pdByKind = (kind) => antibioticPdTargets.find((entry) => entry.kind === kind);
assert.equal(formatMicCalculation(pdByKind('beta_trough'), 2, 'fr'), 'Repère : fCmin > 2 mg/L');
assert.equal(formatMicCalculation(pdByKind('beta_continuous'), 2, 'fr'), 'À l’état stable : fCss ≥ 8 mg/L (4 × CMI)');
assert.equal(formatMicCalculation(pdByKind('peak_ratio'), 0.5, 'fr'), 'Cmax ≥ 4–5 mg/L');
assert.equal(formatMicCalculation(pdByKind('free_auc_ratio'), 0.5, 'fr'), 'fAUC₀–₂₄ ≥ 40 mg·h/L');
assert.equal(formatMicCalculation(pdByKind('total_auc_ratio'), 0.5, 'fr'), 'AUC₀–₂₄ > 333 mg·h/L');
assert.equal(formatMicCalculation(pdByKind('vancomycin_mic1'), 1, 'fr'), 'AUC₀–₂₄ : 400–600 mg·h/L (CMI = 1 mg/L)');
assert.match(formatMicCalculation(pdByKind('vancomycin_mic1'), 2, 'fr'), /Pas de recalcul linéaire/);
assert.equal(formatMicCalculation(pdByKind('beta_trough'), 0), null);

assert.equal(searchTdmMolecules('isoniazid').groups[0].indications.length, 1);
assert.equal(searchTdmMolecules('rifampicin').groups[0].indications.length, 1);
assert.equal(tdmTargets.find((row) => row.id === 'isoniazid-tb-peak').metric, 'C₂h (pic approximatif)');
assert.equal(tdmTargets.find((row) => row.id === 'rifampicin-tb-peak').status, 'review');
assert.equal(chuSamplingForDrug('isoniazid')?.code, 'PTP PREA 0059 C');
assert.equal(chuSamplingForDrug('rifampicin')?.code, 'PTP PREA 0059 C');
assert.equal(antibioticPdForDrug('cefepime')[0].source.doi, '10.1002/phar.70181');
assert.equal(antibioticPdForDrug('cefepime')[1].source.doi, '10.1002/phar.2842');
assert.equal(antibioticPdForDrug('cefepime')[0].source.citation.includes('2026'), true);
assert.match(antibioticPdForDrug('cefepime')[0].contextFr, /ECOFF/);
assert.match(antibioticPdForDrug('cefepime')[0].contextFr, /preuves très faible/);
assert.match(antibioticPdForDrug('cefepime')[0].contextFr, /4×CMI/);
assert.match(antibioticPdForDrug('cefepime')[1].criterionFr, /4 × CMI/);
assert.equal(antibioticPdForDrug('cefepime')[1].source.url, 'https://accpjournals.onlinelibrary.wiley.com/doi/10.1002/phar.2842');
assert.equal(antibioticPdForDrug('amikacin')[0].source, undefined,
  'Aminoglycosides retain their independently checked 2020 ICU source, not beta-lactam guidance');
assert.equal(formatMicCalculation(pdByKind('beta_continuous'), 0.5, 'fr'), 'À l’état stable : fCss ≥ 2 mg/L (4 × CMI)');

console.log('TDM antibiotic MIC objectives: 41 source-scoped contexts, 36 CHU sampling-time links, calculator and safety gates validated.');

console.log(`TDM manual linked index: ${tdmManualCatalog.length} named medicines across ${Object.keys(manualCatalogSources).length} official document types.`);
console.log(`TDM comparisons: ${comparisons.length} source-by-source groups validated.`);
console.log(`TDM target reference: ${tdmTargets.length} entries, ${tdmDrugs.length} drugs, ${Object.keys(tdmTargetSources).length} primary sources and ${tdmInstitutionalResources.length} SFT/SFPT context references validated.`);

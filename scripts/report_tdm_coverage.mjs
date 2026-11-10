// Audit of the curated TDM catalogue against individually verified CHU documents.
// Does not prove exhaustive or currently active CHU assays; never invent numeric targets.
// node scripts/report_tdm_coverage.mjs [--json]
// No remote network requests, patient data, or output artifacts.
import { tdmDrugs, tdmTargets } from '../src/lib/content/tdmTargets.js';
import { tdmManualCatalog, manualCatalogSources } from '../src/lib/content/tdmManualCatalog.js';
import { antibioticPdTargets } from '../src/lib/content/tdmAntibioticPd.js';
import { tdmSafetySignals } from '../src/lib/content/tdmSafetySignals.js';
import { tdmBrowseCategories } from '../src/lib/content/tdmBrowseCategories.js';
import { tdmPharmacologyCoverage } from '../src/lib/content/tdmPharmacologyProfiles.js';
import { agnp2026ReviewSummary } from '../src/lib/content/tdmAgnpReview2026.js';
import { semanticReadinessReport } from './report_tdm_semantic_readiness.mjs';

const drugIds = new Set(tdmDrugs.map((drug) => drug.id));
const fixedIds = new Set(tdmTargets.map((row) => row.drug));
const micIds = new Set(antibioticPdTargets.map((row) => row.drug));
const safetyIds = new Set(tdmSafetySignals.map((row) => row.drug));

const searchable = new Set(tdmBrowseCategories.flatMap((g) => g.medicines.map((m) => m.id)));
const statuses = new Map();
const missing = [];
const manualRows = tdmManualCatalog.map((entry) => {
  const source = manualCatalogSources[entry.sourceId];
  const canonicalDrug = entry.drugKey && drugIds.has(entry.drugKey) ? entry.drugKey : null;
  const metric = !canonicalDrug ? 'no_qualified_target'
    : fixedIds.has(canonicalDrug) && micIds.has(canonicalDrug) ? 'fixed_plus_mic'
    : fixedIds.has(canonicalDrug) ? 'fixed_reference'
    : micIds.has(canonicalDrug) ? 'mic_dependent'
    : safetyIds.has(canonicalDrug) ? 'timed_safety_only'
    : 'no_qualified_target';
  const provenance = source.type === 'public_list' ? 'listed_as_dosed_in_protocol'
    : source.type === 'request_form' ? 'request_form_only'
    : source.type === 'external_exam' ? 'external_referral'
    : source.type === 'single_exam' ? 'individual_exam_page'
    : source.type === 'exam_group' ? 'group_exam_page'
    : 'other_document';
  statuses.set(provenance, (statuses.get(provenance) ?? 0) + 1);
  if (metric === 'no_qualified_target') {
    missing.push({ name: entry.name, id: entry.id, provenance, drug_id: canonicalDrug });
  }
  return {
    name: entry.name, document: entry.sourceId, provenance,
    drug_id: canonicalDrug, scientific_target: metric,
    indexed: searchable.has(canonicalDrug ?? entry.id)
  };
});
const listed = new Set(manualRows.map((row) => row.name));
const uniqueDrugCount = new Set(tdmDrugs.map((row) => row.id)).size;
const allRowsIndexed = manualRows.every((row) => row.indexed);
export const report = {
  schema: 'pmx.tdm.coverage-audit.v1',
  limitation: 'Partial PUBLIC CHU documents (not an authorized complete export or evidence of current test availability)',
  curated_drugs: uniqueDrugCount,
  pharmacology_evidence_coverage: tdmPharmacologyCoverage(),
  agnp2026_historical_reconciliation: agnp2026ReviewSummary(),
  structured_scientific_readiness: Object.fromEntries(Object.entries(semanticReadinessReport).filter(([k])=>k!=='claims')),
  complete_institutional_assay_export_available: false,
  human_scientific_approval_of_full_catalogue: false,
  publication_ready_for_automatic_clinical_interpretation: false,
  bibliographic_numeric_entries: tdmTargets.length,
  drugs_with_fixed_reference: fixedIds.size,
  antibiotic_mic_contexts: antibioticPdTargets.length,
  drugs_with_mic_target: micIds.size,
  time_indexed_safety_signals: tdmSafetySignals.length,
  verified_chu_document_names: listed.size,
  evidence_types: Object.fromEntries([...statuses].sort(([a],[b]) => a.localeCompare(b))),
  manual_names_indexed: manualRows.filter((row) => row.indexed).length,
  manual_names_without_numeric_reference: missing.length,
  scientifically_unresolved_chu_names: missing.sort((a,b) => a.name.localeCompare(b.name,'fr')),
  manual_rows: manualRows,
  category_sizes: Object.fromEntries(tdmBrowseCategories.map(({id,medicines}) => [id, medicines.length])),
  all_chu_document_names_indexed: allRowsIndexed
};
if (process.argv[1]?.endsWith('report_tdm_coverage.mjs')) {
  if (process.argv.includes('--json')) console.log(JSON.stringify(report,null,2));
  else {
    const { manual_rows, scientifically_unresolved_chu_names, ...summary } = report;
    console.log(JSON.stringify(summary,null,2));
    console.log('CHU names lacking a qualified numeric target (not all require one):');
    for (const row of scientifically_unresolved_chu_names) {
      console.log(`- ${row.name} [${row.provenance}]`);
    }
  }
}

// Reproducible per-claim readiness audit for future model-to-reference matching.
// A free-text matrix note is NOT equivalent to structured analyte/method IDs.
// This deliberately refuses to infer unspecified semantics from prose.
import { tdmTargets, tdmDrugs } from '../src/lib/content/tdmTargets.js';
import { tdmPharmacologyForDrug } from '../src/lib/content/tdmPharmacologyProfiles.js';
import { agnp2026ReviewForDrug } from '../src/lib/content/tdmAgnpReview2026.js';
import { TDM_COMPARABILITY_FIELDS, isMeaningfulTdmIdentityValue } from '../src/lib/content/tdmReferenceIdentity.js';

const semanticRequired = TDM_COMPARABILITY_FIELDS;
export const semanticReadinessRows = tdmTargets.map((entry)=>{
  const missing = semanticRequired.filter((field)=>
    !isMeaningfulTdmIdentityValue(entry[field]));
  const pk=tdmPharmacologyForDrug(entry.drug);
  const historicalNeuro=Boolean(agnp2026ReviewForDrug(entry.drug) &&
    agnp2026ReviewForDrug(entry.drug).historicalReferenceIds.includes(entry.id));
  const humanApproved = entry.humanReview?.status==='approved' &&
    Boolean(entry.humanReview?.reviewer && entry.humanReview?.date);
  return {
    targetId:entry.id,drugId:entry.drug,sourceId:entry.source,
    indication:entry.indication,metric:entry.metric,unit:entry.unit,
    matrixAsPublished:entry.matrixFr??null,
    missingSemanticFields:missing,
    hasDrugSpecificPkIndex:pk?.review==='drug_reviewed',
    agnp2026ComparisonPending:historicalNeuro,
    humanApproved,
    eligibleForAutomaticClinicalInterpretation:false,
    nextAction:!humanApproved?'human_reference_review':
      missing.length?'structured_analyte_and_sampling_mapping':'separate_model_validation'
  };
});
export const semanticReadinessReport = {
  schema:'pmx.tdm.semantic-readiness.v1',
  totalCuratedDrugs:tdmDrugs.length,
  numericReferenceClaims:tdmTargets.length,
  fullyStructuredClaims:semanticReadinessRows.filter((r)=>r.missingSemanticFields.length===0).length,
  humanApprovedClaims:semanticReadinessRows.filter((r)=>r.humanApproved).length,
  eligibleForAutomaticClinicalInterpretation:0,
  unresolvedByField:Object.fromEntries(semanticRequired.map((field)=>[
    field,semanticReadinessRows.filter((r)=>r.missingSemanticFields.includes(field)).length
  ])),
  claims:semanticReadinessRows
};
// Reviewable CSV for signed pharmacological curation. Read-only; no patient data.
const csvFields = Object.freeze([
  'targetId','drugId','sourceId','indication','metric','unit',
  'matrixAsPublished','missingSemanticFields','hasDrugSpecificPkIndex',
  'agnp2026ComparisonPending','humanApproved','nextAction'
]);
const escapeCsv = (value) => '"' + String(value ?? '').replaceAll('"','""') + '"';
export function generateTdmSemanticReviewCsv() {
  return [csvFields.join(','), ...semanticReadinessRows.map((row) =>
    csvFields.map((field) => escapeCsv(field === 'missingSemanticFields'
      ? row.missingSemanticFields.join(';') : row[field])).join(','))].join('\n') + '\n';
}

if(process.argv[1]?.endsWith('report_tdm_semantic_readiness.mjs')) {
  if(process.argv.includes('--csv')) process.stdout.write(generateTdmSemanticReviewCsv());
  else if(process.argv.includes('--json')) console.log(JSON.stringify(semanticReadinessReport,null,2));
  else {
    const {claims,...summary}=semanticReadinessReport;
    console.log(JSON.stringify(summary,null,2));
    console.log('All targets remain non-interpretable until human scientific review and model mapping.');
  }
}

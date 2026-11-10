// @ts-nocheck
// Explicit audit QUEUE for the AGNP 2026 update. No numerical values from
// AGNP 2026 are transcribed or claimed verified by this module.
// The PubMed abstract confirms 160 neuropsychotropic reference ranges,
// 30 new drugs, 88 revised ranges, but does not provide the full per-drug table.
// Historical source values remain visible with their original provenance.
import { tdmTargets, tdmTargetSources, tdmDrugs } from './tdmTargets.js';
import { psychiatryTdmDrugs } from './tdmPsychiatryExpansion2026.js';
import { additionalAntiseizureDrugs } from './tdmAntiseizureExpansion2018.js';
import { extraAntidepressantDrugs } from './tdmAntidepressantExpansion2026.js';

export const agnp2026Update = Object.freeze({
  title:'Consensus Guidelines for Therapeutic Drug Monitoring in Neuropsychopharmacology: Update 2026',
  authors:'Hart et al. · AGNP TDM task force',
  year:2026,
  publicationDate:'2026-07-02',
  doi:'10.1055/a-2860-7861',
  url:'https://pubmed.ncbi.nlm.nih.gov/42392224/',
  fullText:'https://doi.org/10.1055/a-2860-7861',
  ranges:160,
  newlyIncludedDrugs:30,
  revisedDrugRanges:88,
  evidence:'Public abstract confirmed; molecule-specific table not independently transcribed or verified.',
  reviewStatus:'PENDING_HUMAN_SOURCE_RECONCILIATION'
});
const relevantIds = new Set([
  ...psychiatryTdmDrugs.map((drug)=>drug.id),
  ...additionalAntiseizureDrugs.map((drug)=>drug.id),
  ...extraAntidepressantDrugs.map((drug)=>drug.id),
  'lithium','valproate','carbamazepine','lamotrigine','levetiracetam',
  'oxcarbazepine','phenobarbital','phenytoin','amitriptyline',
  'citalopram','clomipramine','escitalopram','fluoxetine','venlafaxine',
  'mirtazapine','paroxetine','duloxetine','fluvoxamine','tramadol'
]);
export const agnp2026ReviewQueue = Object.freeze(tdmDrugs
  .filter((drug)=>relevantIds.has(drug.id))
  .map((drug)=>{
    const historical = tdmTargets.filter((row)=>row.drug===drug.id &&
      (tdmTargetSources[row.source]?.year??0)<2026);
    return {
      drugId:drug.id,
      moleculeFr:drug.fr,
      historicalReferenceIds:historical.map((entry)=>entry.id),
      historicalSourceIds:[...new Set(historical.map((entry)=>entry.source))].sort(),
      historicalYears:[...new Set(historical.map((entry)=>tdmTargetSources[entry.source]?.year))].sort(),
      comparator:'AGNP_2026_TABLE_5_REVIEW_REQUIRED',
      agnp2026NumericalRangeVerified:false,
      clinicalInterpretationAllowed:false,
      reviewState:'pending_primary_source_comparison',
      requiredVerification:[
        '2026 source confirms this specific molecule/indication',
        'exact parent, active metabolite, active sum or free analyte',
        'plasma/serum matrix and sampling time',
        'new 2026 numerical range, method and recommendation level',
        'reviewer decision: retain historical alongside or replace as separate evidence'
      ]
    };
  })
  .filter((item)=>item.historicalReferenceIds.length>0));
export const agnp2026ReviewByDrug = Object.freeze(Object.fromEntries(
  agnp2026ReviewQueue.map((item)=>[item.drugId,item])
));
export function agnp2026ReviewForDrug(drugId){
  return agnp2026ReviewByDrug[drugId]??null;
}
export function agnp2026ReviewSummary(){
  return {
    agnp2026_abstract_range_count:agnp2026Update.ranges,
    agnp2026_abstract_revised_count:agnp2026Update.revisedDrugRanges,
    historical_drugs_to_reconcile:agnp2026ReviewQueue.length,
    historical_numeric_entries_to_reconcile:agnp2026ReviewQueue.reduce((acc,item)=>acc+item.historicalReferenceIds.length,0),
    confirmed_2026_numeric_values:0,
    automatic_replacements:0
  };
}

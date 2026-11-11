// @ts-nocheck
// Presentation-only grouping for the concise, molecule-first TDM guide.
// Original scientific values, context, and source metadata remain untouched.
import { tdmDrugs, tdmTargets, normalizeTdmSearch } from './tdmTargets.js';
import { searchManualCatalog, tdmManualCatalog } from './tdmManualCatalog.js';
import { antibioticPdForDrug } from './tdmAntibioticPd.js';
import { chuSamplingForDrug } from './tdmChuSampling.js';
import { tdmEvidenceForDrug } from './tdmEvidenceGuide.js';
import { tdmSafetySignalsForDrug } from './tdmSafetySignals.js';
import { historicalChuAssayForDrug } from './tdmChuAssayProvenance.js';
import { tdmPharmacologyForDrug } from './tdmPharmacologyProfiles.js';
import { agnp2026ReviewForDrug } from './tdmAgnpReview2026.js';
import { societyMonitoringForDrug } from './tdmSocietyMonitoring2026.js';
import { hasCompleteTdmIdentity } from './tdmReferenceIdentity.js';
export { hasCompleteTdmIdentity, TDM_COMPARABILITY_FIELDS } from './tdmReferenceIdentity.js';

// Grouping by a drug/indication/metric alone is unsafe:
// identical concentration units may refer to the parent, active metabolite,
// active-moiety sum, free fraction, different assay or formulation.
// Published references can share a visually concise indication card even
// when their clinical comparability has NOT been established. Only references
// whose complete analytical identity is explicitly typed are alternatives;
// other references are separately flagged for independent review. An absent
// dimension is NEVER evidence of equality.
export function groupTdmReferenceEntries(entries) {
  const indications = new Map();
  for (const entry of entries) {
    const key = JSON.stringify([
      entry.drug, entry.indication, entry.indicationFr, entry.indicationEn,
      entry.metric, entry.unit, entry.matrixFr, entry.matrixEn,
      entry.matrixId ?? null,
      entry.analyteId ?? null, entry.analyteBasis ?? null,
      entry.formulationId ?? null, entry.assayMethod ?? null,
      entry.samplingTime ?? null
    ]);
    if (!indications.has(key)) {
      indications.set(key, {
        id: entry.id,
        indicationFr: entry.indicationFr,
        indicationEn: entry.indicationEn,
        metric: entry.metric,
        unit: entry.unit,
        primary: entry,
        alternatives: [],
        // Same published context is not the same as analytically comparable.
        relatedReferences: []
      });
    } else {
      const group = indications.get(key);
      if (hasCompleteTdmIdentity(group.primary) && hasCompleteTdmIdentity(entry)) {
        group.alternatives.push(entry);
      } else {
        group.relatedReferences.push(entry);
      }
    }
  }
  return Array.from(indications.values());
}

export function searchTdmMolecules(query = '') {
  const needle = normalizeTdmSearch(query);
  if (!needle) return { groups: [], withoutTargets: [] };

  // An exact international nonproprietary name or known alias must win over
  // incidental substrings (MPA in perampanel; venlafaxine in desvenlafaxine).
  // Retain fuzzy matching only when no exact match exists.
  const exactMatches = tdmDrugs.filter((drug) =>
    [drug.fr, drug.en, ...drug.aliases].some((value) =>
      normalizeTdmSearch(value) === needle));
  const matchedDrugs = exactMatches.length ? exactMatches : tdmDrugs.filter((drug) =>
    [drug.fr, drug.en, ...drug.aliases].some((value) =>
      normalizeTdmSearch(value).includes(needle)));

  const groups = matchedDrugs.map((drug) => {
    const indications = groupTdmReferenceEntries(tdmTargets.filter((entry) => entry.drug === drug.id));
    return { drug, pharmacology: tdmPharmacologyForDrug(drug.id),
      societyMonitoring: societyMonitoringForDrug(drug.id),
      manualExam: tdmManualCatalog.find((row)=>row.drugKey===drug.id &&
        ['individual_exam','outsourced_exam'].includes(row.status)) || null,
      agnpReview: agnp2026ReviewForDrug(drug.id), indications,
      pdTargets: antibioticPdForDrug(drug.id), safetySignals: tdmSafetySignalsForDrug(drug.id),
      historicalChuAssay: historicalChuAssayForDrug(drug.id),
      samplingDocument: chuSamplingForDrug(drug.id), evidence: tdmEvidenceForDrug(drug.id) };
  }).filter((group) => group.indications.length > 0 || group.pdTargets.length > 0 ||
    group.safetySignals.length > 0 || Boolean(group.societyMonitoring));

  const alreadyListed = new Set(groups.map((group) => group.drug.id));
  const withoutTargets = searchManualCatalog({ query }).filter((entry) =>
    !entry.drugKey || !alreadyListed.has(entry.drugKey)
  ).map((entry) => ({
    ...entry, pharmacology: tdmPharmacologyForDrug(entry.drugKey), samplingDocument: chuSamplingForDrug(entry.drugKey)
  }));

  return { groups, withoutTargets };
}

// @ts-nocheck
// Presentation-only grouping for the concise, molecule-first TDM guide.
// Original scientific values, context, and source metadata remain untouched.
import { tdmDrugs, tdmTargets, normalizeTdmSearch } from './tdmTargets.js';
import { searchManualCatalog } from './tdmManualCatalog.js';
import { antibioticPdForDrug } from './tdmAntibioticPd.js';
import { chuSamplingForDrug } from './tdmChuSampling.js';
import { tdmEvidenceForDrug } from './tdmEvidenceGuide.js';
import { tdmSafetySignalsForDrug } from './tdmSafetySignals.js';
import { historicalChuAssayForDrug } from './tdmChuAssayProvenance.js';
import { tdmPharmacologyForDrug } from './tdmPharmacologyProfiles.js';
import { agnp2026ReviewForDrug } from './tdmAgnpReview2026.js';

// Grouping by a drug/indication/metric alone is unsafe:
// identical concentration units may refer to the parent, active metabolite,
// active-moiety sum, free fraction, different assay or formulation.
// Preserve independently sourced ranges as alternatives only if every known
// scientific identity dimension matches. Missing dimensions are NOT inferred.
export function groupTdmReferenceEntries(entries) {
  const indications = new Map();
  for (const entry of entries) {
    const key = JSON.stringify([
      entry.drug, entry.indication, entry.indicationFr, entry.indicationEn,
      entry.metric, entry.unit, entry.matrixFr, entry.matrixEn,
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
        alternatives: []
      });
    } else {
      indications.get(key).alternatives.push(entry);
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
    return { drug, pharmacology: tdmPharmacologyForDrug(drug.id), agnpReview: agnp2026ReviewForDrug(drug.id), indications, pdTargets: antibioticPdForDrug(drug.id), safetySignals: tdmSafetySignalsForDrug(drug.id), historicalChuAssay: historicalChuAssayForDrug(drug.id), samplingDocument: chuSamplingForDrug(drug.id), evidence: tdmEvidenceForDrug(drug.id) };
  }).filter((group) => group.indications.length > 0 || group.pdTargets.length > 0 || group.safetySignals.length > 0);

  const alreadyListed = new Set(groups.map((group) => group.drug.id));
  const withoutTargets = searchManualCatalog({ query }).filter((entry) =>
    !entry.drugKey || !alreadyListed.has(entry.drugKey)
  ).map((entry) => ({
    ...entry, pharmacology: tdmPharmacologyForDrug(entry.drugKey), samplingDocument: chuSamplingForDrug(entry.drugKey)
  }));

  return { groups, withoutTargets };
}

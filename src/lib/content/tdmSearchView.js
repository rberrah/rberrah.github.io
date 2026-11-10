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

export function searchTdmMolecules(query = '') {
  const needle = normalizeTdmSearch(query);
  if (!needle) return { groups: [], withoutTargets: [] };

  const matchedDrugs = tdmDrugs.filter((drug) =>
    [drug.fr, drug.en, ...drug.aliases].some((value) =>
      normalizeTdmSearch(value).includes(needle)));

  const groups = matchedDrugs.map((drug) => {
    const indications = new Map();
    for (const entry of tdmTargets) {
      if (entry.drug !== drug.id) continue;
      // Deliberately never mix different indications, exposure metrics or units.
      const key = [entry.indicationFr, entry.metric, entry.unit].join('\u0000');
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
    return { drug, indications: Array.from(indications.values()), pdTargets: antibioticPdForDrug(drug.id), safetySignals: tdmSafetySignalsForDrug(drug.id), historicalChuAssay: historicalChuAssayForDrug(drug.id), samplingDocument: chuSamplingForDrug(drug.id), evidence: tdmEvidenceForDrug(drug.id) };
  }).filter((group) => group.indications.length > 0 || group.pdTargets.length > 0 || group.safetySignals.length > 0);

  const alreadyListed = new Set(groups.map((group) => group.drug.id));
  const withoutTargets = searchManualCatalog({ query }).filter((entry) =>
    !entry.drugKey || !alreadyListed.has(entry.drugKey)
  ).map((entry) => ({
    ...entry, samplingDocument: chuSamplingForDrug(entry.drugKey)
  }));

  return { groups, withoutTargets };
}

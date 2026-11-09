// @ts-nocheck
import { tdmTargetSources, tdmDrugs, formatTdmTarget } from './tdmTargets.js';

// The comparison key is editorially curated; never compare targets just because
// they are for the same drug. The metrics and units must also match.
export function collectTdmComparisons(targets) {
  const groups = new Map();
  for (const entry of targets) {
    if (!entry.comparisonGroup) continue;
    const key = entry.comparisonGroup;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  return Array.from(groups.entries()).filter(([, entries]) => entries.length > 1)
    .map(([id, entries]) => {
      const anchor = entries[0];
      if (!entries.every((entry) => entry.drug === anchor.drug &&
        entry.indication === anchor.indication &&
        entry.metric === anchor.metric && entry.unit === anchor.unit)) {
        throw new Error(`Unsafe TDM comparison with mixed drug/indication/metric/unit: ${id}`);
      }
      const matrixDifference = new Set(entries.map((e) => e.matrixFr)).size > 1;
      const distinctNumericValues = new Set(entries.map((e) =>
        `${e.relation}|${e.min}|${e.max}`)).size > 1;
      const sorted = entries.slice().sort((a, b) => {
        const priority = { guideline: 0, regulatory: 1, review: 2, study: 3 };
        const statusDiff = (priority[a.status] ?? 4) - (priority[b.status] ?? 4);
        return statusDiff || (tdmTargetSources[b.source].year - tdmTargetSources[a.source].year);
      });
      const drug = tdmDrugs.find((item) => item.id === anchor.drug);
      return {
        id,
        drugFr: drug?.fr ?? anchor.drug,
        drugEn: drug?.en ?? anchor.drug,
        indicationFr: anchor.indicationFr,
        indicationEn: anchor.indicationEn,
        metric: anchor.metric,
        unit: anchor.unit,
        matrixDifference,
        distinctNumericValues,
        entries: sorted.map((entry) => ({
          id: entry.id,
          valueFr: formatTdmTarget(entry, 'fr'),
          valueEn: formatTdmTarget(entry, 'en'),
          matrixFr: entry.matrixFr, matrixEn: entry.matrixEn,
          contextFr: entry.contextFr, contextEn: entry.contextEn,
          status: entry.status,
          source: tdmTargetSources[entry.source]
        }))
      };
    });
}

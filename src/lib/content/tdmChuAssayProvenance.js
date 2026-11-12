// Historical assay evidence, never a claim of current CHU Limoges availability.
// Verified 2026-11-10, NOT part of the current authorized CHU exam manual export.
/** @type {Record<string, {status: string, period: string, reference: string, url: string, fr: string, en: string}>} */
export const historicalChuAssayEvidence = Object.freeze({
  clozapine: {
    status: 'historically_assayed',
    period: '2010–2022',
    reference: 'Health Data Hub · étude CH Esquirol / CHU Limoges, clozapinémie',
    url: 'https://www.health-data-hub.fr/projets/evaluation-du-respect-des-bonnes-pratiques-des-dosages-plasmatiques-de-clozapine-sur-le-ch',
    fr: 'Le projet Health Data Hub documente des clozapinémies réalisées au laboratoire du CHU de Limoges entre 2010 et 2022. Ce document ne prouve pas que cet examen est actuellement disponible.',
    en: 'A Health Data Hub study documents clozapine assays performed at Limoges University Hospital in 2010–2022. This historical evidence does not confirm current availability.'
  }
});
/** @param {string} drugId */
export function historicalChuAssayForDrug(drugId) {
  return historicalChuAssayEvidence[drugId] || null;
}

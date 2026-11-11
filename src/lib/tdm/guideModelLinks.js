// @ts-nocheck
// Draft-only navigation; drug identity is NOT a patient-specific target match.
import { mipdDrugToTdmId } from './mipdDrugCrosswalk.preview.v1.js';
import { tdmModels } from '../content/tdmModels.js';

const modelDrugKeys = new Set(tdmModels.map((model) => model.drugKey));
const crosswalkKeys = new Set(Object.keys(mipdDrugToTdmId));
const mappedTdmIds = Object.values(mipdDrugToTdmId);
const ambiguousTdmIds = new Set(
  mappedTdmIds.filter((id, index) => mappedTdmIds.indexOf(id) !== index)
);

/**
 * Pure crosswalk drift report, exported so the evolution scenarios are testable
 * without rebuilding the pinned model snapshot.
 * @param {Iterable<string>} drugKeys drugKey of every model in the pinned catalogue
 * @param {Record<string,string>} crosswalk reviewed drugKey -> TDM Guide id map
 */
export function computeMipdCrosswalkDrift(drugKeys, crosswalk) {
  const keys = new Set(drugKeys);
  const mapped = Object.keys(crosswalk);
  const ids = Object.values(crosswalk);
  return Object.freeze({
    unmappedModelDrugKeys: Object.freeze([...keys].filter((k) => !mapped.includes(k)).sort()),
    crosswalkKeysWithoutModel: Object.freeze(mapped.filter((k) => !keys.has(k)).sort()),
    ambiguousTdmIds: Object.freeze(
      [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort()
    )
  });
}

/** @param {ReturnType<typeof computeMipdCrosswalkDrift>} drift */
export function isMipdCrosswalkExact(drift) {
  return (
    drift.unmappedModelDrugKeys.length === 0 &&
    drift.crosswalkKeysWithoutModel.length === 0 &&
    drift.ambiguousTdmIds.length === 0
  );
}

/**
 * Actionable CI diagnostic; empty string when the crosswalk is exact.
 * @param {ReturnType<typeof computeMipdCrosswalkDrift>} [drift]
 */
export function describeMipdCrosswalkDrift(drift = mipdCrosswalkDrift) {
  if (isMipdCrosswalkExact(drift)) return '';
  const parts = [];
  if (drift.unmappedModelDrugKeys.length)
    parts.push(
      'MIPD model drugKey absent from the reviewed crosswalk (add a canonical TDM Guide id): ' +
        drift.unmappedModelDrugKeys.join(', ')
    );
  if (drift.crosswalkKeysWithoutModel.length)
    parts.push(
      'Crosswalk entry without any MIPD model (remove it or pin the new catalogue): ' +
        drift.crosswalkKeysWithoutModel.join(', ')
    );
  if (drift.ambiguousTdmIds.length)
    parts.push(
      'Several MIPD drugKeys mapped to one TDM Guide id, deep links disabled for it: ' +
        drift.ambiguousTdmIds.join(', ')
    );
  return parts.join(' | ');
}

// Crosswalk drift is reported, never thrown at module load: an unrelated new MIPD
// model must not break every page that imports this navigation helper.
// Adding a model for an ALREADY mapped molecule is supported automatically and
// reports no drift. Adding a model for a NEW molecule is reported here, which fails
// scripts/test_tdm_model_export_preview.mjs in CI, so a reviewed crosswalk entry is
// required before any deep link is offered for that molecule.
export const mipdCrosswalkDrift = computeMipdCrosswalkDrift(modelDrugKeys, mipdDrugToTdmId);
export const mipdCrosswalkIsExact = isMipdCrosswalkExact(mipdCrosswalkDrift);

// Only unambiguous, model-backed molecules can ever produce a deep link.
export const mipdDrugKeyByTdmId = Object.freeze(
  Object.fromEntries(
    Object.entries(mipdDrugToTdmId)
      .filter(([key, id]) => !ambiguousTdmIds.has(id) && modelDrugKeys.has(key))
      .map(([key, id]) => [id, key])
  )
);

/** @param {string} tdmId */
export function mipdModelsForTdmDrug(tdmId) {
  const key = mipdDrugKeyByTdmId[tdmId];
  return key ? tdmModels.filter((model) => model.drugKey === key) : [];
}

/** @param {string} tdmId */
export function mipdDrugKeyForTdmDrug(tdmId) {
  const key = mipdDrugKeyByTdmId[tdmId];
  return key && modelDrugKeys.has(key) ? key : null;
}

/** @param {string} base @param {string} tdmId @param {'fr'|'en'} lang */
export function mipdCatalogueHrefForTdmDrug(base, tdmId, lang = 'fr') {
  const key = mipdDrugKeyForTdmDrug(tdmId);
  if (!key) return null;
  return (
    base.replace(/\/$/, '') +
    '/tdm/?drug=' +
    encodeURIComponent(key) +
    '&lang=' +
    encodeURIComponent(lang === 'en' ? 'en' : 'fr') +
    '#modeles'
  );
}

/** @param {string|null} requested */
export function mipdDrugFilterFromDeepLink(requested) {
  if (requested === null || requested === '') return { drugKey: 'all', invalid: false };
  const ok =
    typeof requested === 'string' && crosswalkKeys.has(requested) && modelDrugKeys.has(requested);
  return { drugKey: ok ? requested : 'all', invalid: !ok };
}

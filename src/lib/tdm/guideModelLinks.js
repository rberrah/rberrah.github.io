// @ts-nocheck
// Draft-only navigation; drug identity is NOT a patient-specific target match.
import { mipdDrugToTdmId } from './mipdDrugCrosswalk.preview.v1.js';
import { tdmModels } from '../content/tdmModels.js';
const modelDrugKeys = new Set(tdmModels.map(model=>model.drugKey));
const crosswalkKeys = new Set(Object.keys(mipdDrugToTdmId));
if (modelDrugKeys.size!==crosswalkKeys.size ||
  [...modelDrugKeys].some(key=>!crosswalkKeys.has(key)) ||
  new Set(Object.values(mipdDrugToTdmId)).size!==crosswalkKeys.size) {
  throw new Error('Stale or ambiguous MIPD crosswalk: no model deep links allowed');
}
export const mipdDrugKeyByTdmId = Object.freeze(Object.fromEntries(
  Object.entries(mipdDrugToTdmId).map(([key,id])=>[id,key])
));
/** @param {string} tdmId */
export function mipdModelsForTdmDrug(tdmId) {
  const key=mipdDrugKeyByTdmId[tdmId];
  return key ? tdmModels.filter(model=>model.drugKey===key) : [];
}
/** @param {string} tdmId */
export function mipdDrugKeyForTdmDrug(tdmId) {
  const key=mipdDrugKeyByTdmId[tdmId];
  return key && modelDrugKeys.has(key) ? key : null;
}
/** @param {string} base @param {string} tdmId @param {'fr'|'en'} lang */
export function mipdCatalogueHrefForTdmDrug(base,tdmId,lang='fr') {
  const key=mipdDrugKeyForTdmDrug(tdmId);
  if (!key) return null;
  return base.replace(/\/$/,'')+'/tdm/?drug='+encodeURIComponent(key)+
    '&lang='+encodeURIComponent(lang==='en'?'en':'fr')+'#modeles';
}
/** @param {string|null} requested */
export function mipdDrugFilterFromDeepLink(requested) {
  if (requested===null||requested==='') return {drugKey:'all',invalid:false};
  const ok=typeof requested==='string' && crosswalkKeys.has(requested) && modelDrugKeys.has(requested);
  return {drugKey:ok ? requested : 'all',invalid:!ok};
}

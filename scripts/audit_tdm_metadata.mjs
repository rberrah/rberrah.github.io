import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const metadata = JSON.parse(await readFile(new URL('static/tdm/model-metadata.json', root), 'utf8')).models;
const catalog = JSON.parse(await readFile(new URL('tdm-engine/models/catalog.json', root), 'utf8')).models;
const required = ['citation', 'doi', 'population', 'populationTags', 'modelType', 'sourceStatus',
  'verificationStatus', 'validationStatus', 'contextOfUse', 'analysisEligible'];
const enums = {
  verificationStatus: ['NOT_TESTED', 'SOFTWARE_TESTED', 'NUMERICALLY_REPRODUCED'],
  validationStatus: ['NONE', 'INTERNAL', 'EXTERNAL'],
  contextOfUse: ['TEACHING_RESEARCH', 'EXPLORATORY_MIPD', 'CLINICALLY_VALIDATED']
};

assert.equal(catalog.length, 46, 'The published model inventory changed; review the expected count and this audit.');
for (const model of catalog) {
  const source = metadata[model.id];
  assert(source, `${model.id}: source metadata missing`);
  for (const field of required) assert(Object.hasOwn(source, field), `${model.id}: explicit ${field} missing`);
  assert(/^10\.\d{4,9}\//i.test(source.doi), `${model.id}: invalid DOI`);
  assert(Array.isArray(source.populationTags) && source.populationTags.length, `${model.id}: population tags missing`);
  assert.equal(typeof source.analysisEligible, 'boolean', `${model.id}: analysisEligible must be boolean`);
  for (const [field, values] of Object.entries(enums)) assert(values.includes(source[field]), `${model.id}: invalid ${field}`);
  if (/adapté|module/i.test(source.modelType)) assert(source.note?.trim(), `${model.id}: adapted/module model needs an explicit note`);
  assert(!/PopPK Model|DDI Manager/i.test(`${source.citation} ${source.note ?? ''}`), `${model.id}: application name cannot be a scientific source`);
}

console.log(`Offline TDM provenance audit passed: ${catalog.length} published models.`);

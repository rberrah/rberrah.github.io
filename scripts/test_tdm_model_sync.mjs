import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8').replace(/\r/g, '');
const generated = JSON.parse(read('src/lib/content/tdmModels.generated.json'));
const engineCatalog = JSON.parse(read('tdm-engine/models/catalog.json'));
const metadata = JSON.parse(read('static/tdm/model-metadata.json')).models;
const english = JSON.parse(read('static/tdm/model-i18n.en.json')).models;

assert.deepEqual(engineCatalog, generated, 'Browser and engine catalogs differ');
assert.equal(generated.models.length, 46, 'The published TDM catalog must contain 46 models');

const engineFiles = readdirSync(new URL('tdm-engine/models/', root)).filter((file) => file.endsWith('.cpp')).sort();
const catalogFiles = generated.models.map((model) => model.file).sort();
assert.deepEqual(engineFiles, catalogFiles, 'Engine model copies differ from the generated catalog');

for (const model of generated.models) {
  assert.equal(read(`tdm-engine/models/${model.file}`), read(`static/tdm/models/${model.file}`), `${model.id} source copies differ`);
  assert.ok(metadata[model.id], `${model.id} is missing French metadata`);
  assert.ok(english[model.id], `${model.id} is missing English metadata`);
}

console.log(`TDM model sources, catalogs and metadata are synchronized: ${generated.models.length} models.`);

import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = new URL('../', import.meta.url);
const read = (relative) => readFileSync(new URL(relative, root), 'utf8').replace(/\r/g, '');
const generated = JSON.parse(read('src/lib/content/tdmModels.generated.json'));
const metadata = JSON.parse(read('static/tdm/model-metadata.json')).models;
const english = JSON.parse(read('static/tdm/model-i18n.en.json')).models;
const snapshotRoot = new URL('static/tdm/models/', root);

assert.equal(generated.models.length, 46, 'The PMx TDM consumer snapshot must contain 46 models');
const catalogFiles = generated.models.map((model) => model.file).sort();
const snapshotFiles = readdirSync(snapshotRoot)
  .filter((file) => file.endsWith('.cpp'))
  .filter((file) => metadata[file.replace(/\.cpp$/i, '')]?.listed !== false)
  .sort();
assert.deepEqual(snapshotFiles, catalogFiles,
  'Published PMx browser model snapshot differs from its generated catalogue');

for (const model of generated.models) {
  assert.ok(metadata[model.id], `${model.id} is missing French metadata`);
  assert.ok(english[model.id], `${model.id} is missing English metadata`);
}

if (process.env.MIPD_ENGINE_DIR) {
  const engineRoot = path.resolve(process.env.MIPD_ENGINE_DIR);
  const readEngine = (relative) => readFileSync(path.join(engineRoot, relative), 'utf8').replace(/\r/g, '');
  const engineCatalog = JSON.parse(readEngine('models/catalog.json'));
  assert.deepEqual(engineCatalog, generated, 'PMx browser catalogue differs from pinned standalone MIPD catalogue');

  const engineFiles = readdirSync(path.join(engineRoot, 'models')).filter((file) => file.endsWith('.cpp')).sort();
  assert.deepEqual(engineFiles, catalogFiles, 'Standalone MIPD model files differ from PMx consumer snapshot');
  for (const model of generated.models) {
    assert.equal(readEngine(`models/${model.file}`), read(`static/tdm/models/${model.file}`),
      `${model.id} source differs between PMx snapshot and pinned MIPD release`);
  }
  console.log(`TDM external parity PASS: ${generated.models.length} PMx snapshot models match pinned MIPD Engine.`);
} else {
  console.log(`TDM PMx snapshot PASS: ${generated.models.length} models; external parity is enforced by the mipd-consumer CI job.`);
}

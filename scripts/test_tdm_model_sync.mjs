import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = new URL('../', import.meta.url);
const read = (relative) => readFileSync(new URL(relative, root), 'utf8').replace(/\r/g, '');
const generated = JSON.parse(read('src/lib/content/tdmModels.generated.json'));
const metadata = JSON.parse(read('static/tdm/model-metadata.json')).models;
const english = JSON.parse(read('static/tdm/model-i18n.en.json')).models;
const sourceReview = JSON.parse(read('src/lib/content/tdmSourceReview.generated.json'));
const modelDetailsFr = JSON.parse(read('src/lib/content/tdmModelDetails.fr.generated.json'));
const pdfInventory = JSON.parse(read('src/lib/content/tdmPdfInventory.generated.json'));
const mlSummary = JSON.parse(read('src/lib/content/mlBenchmark.generated.json'));
const snapshotRoot = new URL('static/tdm/models/', root);

assert.equal(generated.models.length, 46, 'The PMx TDM consumer snapshot must contain 46 models');
const catalogFiles = generated.models.map((model) => model.file).sort();
const snapshotFiles = readdirSync(snapshotRoot)
  .filter((file) => file.endsWith('.cpp'))
  .sort();
assert.deepEqual(snapshotFiles, catalogFiles,
  'PMx browser snapshot must contain exactly the deployed MIPD catalogue files, with no legacy extras');

assert.equal(sourceReview.reviewed.length, generated.models.length,
  'Source-review contract must cover every published model');
assert.equal(new Set(sourceReview.reviewed.map((item) => item.id)).size, generated.models.length,
  'Source-review contract contains duplicate or missing model ids');
assert.deepEqual(sourceReview.reviewed.map((item) => item.id).sort(), generated.models.map((item) => item.id).sort(),
  'Source-review ids differ from the published model catalogue');
for (const item of sourceReview.reviewed) {
  assert.ok(['ARTICLE_ALIGNED', 'DOCUMENTED_ADAPTATION_CONFIRMED', 'SOURCE_AMBIGUITY_DOCUMENTED'].includes(item.result),
    `Unexpected source-review status for ${item.id}: ${item.result}`);
  if (item.result !== 'ARTICLE_ALIGNED') {
    assert.ok(modelDetailsFr.details?.[item.id], `Missing French adaptation/source-ambiguity detail for ${item.id}`);
  }
}

for (const model of generated.models) {
  assert.ok(metadata[model.id], `${model.id} is missing French metadata`);
  assert.ok(english[model.id], `${model.id} is missing English metadata`);
}

if (process.env.MIPD_ENGINE_DIR) {
  const engineRoot = path.resolve(process.env.MIPD_ENGINE_DIR);
  const readEngine = (relative) => readFileSync(path.join(engineRoot, relative), 'utf8').replace(/\r/g, '');
  const engineCatalog = JSON.parse(readEngine('models/catalog.json'));
  assert.deepEqual(engineCatalog, generated, 'PMx browser catalogue differs from pinned standalone MIPD catalogue');
  assert.deepEqual(JSON.parse(readEngine('models/source-review.json')), sourceReview,
    'PMx source-review snapshot differs from pinned standalone MIPD source review');
  assert.deepEqual(JSON.parse(readEngine('models/model-details.fr.json')), modelDetailsFr,
    'PMx French model-detail snapshot differs from pinned standalone MIPD details');
  assert.deepEqual(JSON.parse(readEngine('models/pdf-inventory.json')), pdfInventory,
    'PMx source-document inventory differs from pinned standalone MIPD inventory');
  assert.deepEqual(JSON.parse(readEngine('ml/catalog-summary.generated.json')), mlSummary,
    'PMx ML availability summary differs from pinned standalone MIPD release');

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

// This repository is a consumer, not the scientific source-of-truth.
// The traceability files are imported byte-for-byte from the immutable MIPD
// release defined by integration/mipd-release.json. Recomputing them with
// stale PMx generator logic would silently rewrite scientific evidence.
// This command is now a deterministic offline SHA/DOI/catalog validator.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = async (name) => JSON.parse(await readFile(path.join(root, name), 'utf8'));
const [source, catalog, report, sourceReview, summary] = await Promise.all([
  load('integration/mipd-release.json'),
  load('src/lib/content/tdmModels.generated.json'),
  load('docs/tdm-model-traceability.json'),
  load('src/lib/content/tdmSourceReview.generated.json'),
  load('src/lib/content/mlBenchmark.generated.json')
]);
assert.equal(source.schema, 'mipd-site-source.v1');
assert.match(source.sha, /^[0-9a-f]{40}$/);
assert.equal(catalog.models.length, source.expectedModelCount);
assert.equal(report.models.length, source.expectedModelCount);
assert.equal(sourceReview.reviewed.length, source.expectedModelCount);
assert.equal(summary.artifacts.length, source.expectedModelCount);
const models = new Map(catalog.models.map((model) => [model.id, model]));
const reviews = new Map(sourceReview.reviewed.map((entry) => [entry.id, entry]));
const sourceIds = [...models.keys()].sort();
assert.deepEqual([...new Set(report.models.map((entry) => entry.id))].sort(), sourceIds,
  'Imported traceability IDs differ from the pinned browser model catalogue');
assert.deepEqual([...reviews.keys()].sort(), sourceIds,
  'Source-review records do not cover all 46 published models');
const listing = (await readdir(path.join(root, 'static/tdm/models')))
  .filter(name => name.endsWith('.cpp'))
  .filter(name => models.has(name.slice(0, -4))).sort();
assert.deepEqual(listing, catalog.models.map(entry => entry.file).sort(),
  'The imported 46-file browser snapshot differs from the catalog');
for (const entry of report.models) {
  const record = models.get(entry.id);
  assert(record, 'Unknown traceability ID ' + entry.id);
  assert.equal(entry.primarySource?.doi, record.doi, entry.id + ': source DOI drift');
  const contents = (await readFile(path.join(root, 'static/tdm/models', record.file), 'utf8'))
    .replaceAll('\r', '');
  const digest = createHash('sha256').update(contents).digest('hex');
  assert.equal(entry.sourceSha256, digest, entry.id + ': traceability/C++ SHA mismatch');
  assert(reviews.has(entry.id), entry.id + ': missing original article source review');
}
for (const artifact of summary.artifacts) {
  assert(models.has(artifact.modelId), artifact.modelId + ': ML model not catalogued');
  assert.equal(typeof artifact.hashMatches, 'boolean');
  assert.equal(typeof artifact.availableInTdm, 'boolean');
  if (!artifact.hashMatches) assert.equal(artifact.availableInTdm, false,
    artifact.modelId + ': mismatched ML source must remain disabled');
}
console.log('PASS: 46 imported MIPD traceability/C++ source hashes, DOIs, source-review records and ML fail-closed flags; pinned SHA ' + source.sha);

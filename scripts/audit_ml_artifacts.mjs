import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const engineRootValue = process.env.MIPD_ENGINE_DIR;
assert(engineRootValue, 'MIPD_ENGINE_DIR is required: ML artifacts are owned by standalone MIPD Engine');
const engineRoot = path.resolve(engineRootValue);
const mlRoot = path.join(engineRoot, 'ml');
const manifest = JSON.parse(await readFile(path.join(mlRoot, 'registry.json'), 'utf8'));
const catalog = JSON.parse(await readFile(path.join(engineRoot, 'models', 'catalog.json'), 'utf8'));
const models = new Map(catalog.models.map((model) => [model.id, model]));
const valueAt = (object, dottedPath) => dottedPath.split('.').reduce((value, key) => value?.[key], object);
const required = [
  'id', 'releaseLevel', 'baseModelId', 'baseModelSha256', 'artifactPath', 'artifactSha256',
  'route', 'administrationMode', 'samplingProtocol.strategy', 'samplingProtocol.minimumObservations',
  'samplingProtocol.target', 'prediction.type', 'prediction.metric', 'prediction.unit',
  'prediction.horizonHours', 'featureSchema', 'methodology.sourcePopulation',
  'methodology.regimenConfiguration', 'methodology.populationConfiguration', 'training.seed',
  'training.nVirtualDevelopment', 'training.nTraining', 'training.nUntouchedHoldout',
  'training.nUnseenPopPk', 'training.split.unit', 'training.split.method',
  'training.split.holdoutUntouched', 'training.software', 'trainingDomain.features',
  'validation.untouchedHoldout.relativeRmsePct', 'validation.untouchedHoldout.relativeBiasPct',
  'validation.untouchedHoldout.within20Pct'
];

function present(value) {
  return value !== null && value !== undefined && value !== '' &&
    (!Array.isArray(value) || value.length > 0) &&
    (typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length > 0);
}

async function sha256(file, canonicalText = false) {
  let content = await readFile(file);
  if (canonicalText) content = Buffer.from(content.toString('utf8').replaceAll('\r', ''));
  return createHash('sha256').update(content).digest('hex');
}

function safeArtifactPath(relative, label) {
  assert.equal(typeof relative, 'string', `${label}: path must be a string`);
  const absolute = path.resolve(mlRoot, relative);
  assert(absolute.startsWith(`${mlRoot}${path.sep}`), `${label}: path escapes the ML directory`);
  return absolute;
}

assert.equal(manifest.version, 3, 'Unsupported ML registry version');
assert.equal(manifest.artifacts.length, 46, 'The ML registry must describe the 46 published artifacts');
assert.equal(new Set(manifest.artifacts.map((artifact) => artifact.id)).size, manifest.artifacts.length, 'Duplicate ML artifact id');

for (const artifact of manifest.artifacts) {
  const label = artifact.id ?? '<unknown>';
  const missing = required.filter((field) => !present(valueAt(artifact, field)));
  assert.deepEqual(missing, [], `${label}: incomplete ML contract (${missing.join(', ')})`);
  assert(models.has(artifact.baseModelId), `${label}: unknown base model`);
  assert(['IV', 'Oral'].includes(artifact.route), `${label}: unsupported route`);
  assert(['intermittent', 'oral', 'continuous'].includes(artifact.administrationMode), `${label}: unsupported administration mode`);
  assert.equal(artifact.samplingProtocol.target, artifact.prediction.metric, `${label}: sampling and prediction targets differ`);
  assert.equal(artifact.prediction.metric, 'AUC24', `${label}: unsupported prediction target`);
  assert(Number.isFinite(artifact.prediction.horizonHours) && artifact.prediction.horizonHours > 0, `${label}: invalid prediction horizon`);
  assert(Number.isInteger(artifact.training.seed), `${label}: training seed must be an integer`);
  assert.equal(artifact.training.split.unit, 'simulated_patient', `${label}: split unit must be the simulated patient`);
  assert.equal(artifact.training.split.holdoutUntouched, true, `${label}: holdout must remain untouched during fitting`);
  assert.equal(
    artifact.training.nTraining + artifact.training.nUntouchedHoldout,
    artifact.training.nVirtualDevelopment,
    `${label}: development split counts are inconsistent`
  );

  const featureNames = artifact.featureSchema.map((feature) => feature.name);
  assert(featureNames.every(Boolean), `${label}: unnamed feature`);
  assert.equal(new Set(featureNames).size, featureNames.length, `${label}: duplicate feature`);
  assert.deepEqual(
    Object.keys(artifact.trainingDomain.features).sort(),
    [...featureNames].sort(),
    `${label}: training-domain features differ from the feature schema`
  );
  for (const name of featureNames) {
    const bounds = artifact.trainingDomain.features[name];
    assert(Number.isFinite(bounds.min) && Number.isFinite(bounds.max) && bounds.min <= bounds.max, `${label}: invalid domain for ${name}`);
  }
  for (const metric of ['relativeRmsePct', 'relativeBiasPct', 'within20Pct']) {
    const value = artifact.validation.untouchedHoldout[metric];
    assert(Number.isFinite(value), `${label}: invalid holdout ${metric}`);
    if (metric === 'within20Pct') assert(value >= 0 && value <= 100, `${label}: invalid holdout within20Pct`);
  }

  const modelFile = path.join(engineRoot, 'models', models.get(artifact.baseModelId).file);
  assert.equal(await sha256(modelFile, true), artifact.baseModelSha256.toLowerCase(), `${label}: base-model SHA-256 mismatch`);
  const artifactFile = safeArtifactPath(artifact.artifactPath, label);
  assert((await stat(artifactFile)).isFile(), `${label}: missing RDS artifact`);
  assert.equal(await sha256(artifactFile), artifact.artifactSha256.toLowerCase(), `${label}: artifact SHA-256 mismatch`);
  if (artifact.explanation) {
    const background = safeArtifactPath(artifact.explanation.backgroundPath, `${label} DALEX`);
    assert.equal(await sha256(background), artifact.explanation.backgroundSha256.toLowerCase(), `${label}: DALEX SHA-256 mismatch`);
  }
}

console.log(`ML artifact contracts passed: ${manifest.artifacts.length} schemas, splits, domains, metrics and file hashes verified.`);

/**
 * Materialize the PMx browser-only TDM snapshot from the immutable,
 * independently qualified MIPD-Engine revision.
 *
 * No R/Shiny engine code or independent scientific model source lives in PMx.
 * Generated files are not tracked; the published Pages artifact still includes
 * the model definitions needed by offline teaching and Lego import.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, mkdtemp, readFile, readdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'integration/mipd-release.json'), 'utf8'));
assert.equal(manifest.schema, 'mipd-site-source.v1');
assert.equal(manifest.repository, 'rberrah/MIPD-Engine');
assert.match(manifest.sha, /^[0-9a-f]{40}$/);
assert.equal(manifest.expectedModelCount, 46);

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

const cacheRoot = path.join(root, '.cache', 'mipd-source');
const cacheDir = path.join(cacheRoot, manifest.sha);
let engineRoot = process.env.MIPD_ENGINE_DIR ? path.resolve(process.env.MIPD_ENGINE_DIR) : cacheDir;

if (!process.env.MIPD_ENGINE_DIR && !existsSync(path.join(cacheDir, '.git'))) {
  await mkdir(cacheRoot, { recursive: true });
  const temporary = await mkdtemp(path.join(cacheRoot, '.fetch-'));
  try {
    git(['init', '-q', temporary]);
    git(['-C', temporary, 'remote', 'add', 'origin', 'https://github.com/rberrah/MIPD-Engine.git']);
    git(['-C', temporary, 'fetch', '--depth', '1', 'origin', manifest.sha]);
    git(['-C', temporary, 'checkout', '--detach', '-q', 'FETCH_HEAD']);
    assert.equal(git(['-C', temporary, 'rev-parse', 'HEAD']), manifest.sha);
    await rename(temporary, cacheDir);
  } catch (error) {
    await rm(temporary, { recursive: true, force: true });
    if (!existsSync(path.join(cacheDir, '.git'))) {
      throw new Error('Cannot retrieve immutable MIPD source. Supply MIPD_ENGINE_DIR pointing at the pinned checkout. ' + error.message);
    }
  }
}
const actualSha = git(['-C', engineRoot, 'rev-parse', 'HEAD']);
assert.equal(actualSha, manifest.sha, 'MIPD checkout does not match the immutable public release');
const catalog = JSON.parse(await readFile(path.join(engineRoot, 'models/catalog.json'), 'utf8'));
assert.equal(catalog.models.length, manifest.expectedModelCount);
const modelNames = catalog.models.map(model => model.file);
assert.equal(new Set(modelNames).size, manifest.expectedModelCount, 'Duplicate MIPD model filenames');
assert(modelNames.every(name => /^[a-zA-Z0-9_-]+\.cpp$/.test(name)), 'Unsafe MIPD model filename');
const upstreamNames = (await readdir(path.join(engineRoot, 'models')))
  .filter(name => name.endsWith('.cpp')).sort();
assert.deepEqual([...modelNames].sort(), upstreamNames, 'MIPD source and catalog disagree');

const targetDir = path.join(root, 'static/tdm/models');
await mkdir(targetDir, { recursive: true });
for (const name of await readdir(targetDir)) {
  if (name.endsWith('.cpp') && !modelNames.includes(name)) {
    await rm(path.join(targetDir, name));
  }
}
for (const name of modelNames) {
  const source = path.join(engineRoot, 'models', name);
  const target = path.join(targetDir, name);
  await copyFile(source, target);
  const digest = content => createHash('sha256').update(content).digest('hex');
  assert.equal(digest(await readFile(target)), digest(await readFile(source)), 'Copy mismatch: ' + name);
}
const imports = [
  ['models/metadata.json', 'static/tdm/model-metadata.json'],
  ['models/i18n.en.json', 'static/tdm/model-i18n.en.json'],
  ['models/catalog.json', 'src/lib/content/tdmModels.generated.json'],
  ['models/source-review.json', 'src/lib/content/tdmSourceReview.generated.json'],
  ['models/model-details.fr.json', 'src/lib/content/tdmModelDetails.fr.generated.json'],
  ['models/pdf-inventory.json', 'src/lib/content/tdmPdfInventory.generated.json'],
  ['ml/catalog-summary.generated.json', 'src/lib/content/mlBenchmark.generated.json']
];
for (const [source, destination] of imports) {
  const target = path.join(root, destination);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(engineRoot, source), target);
}
assert.equal(
  JSON.parse(await readFile(path.join(root, 'src/lib/content/tdmModels.generated.json'), 'utf8')).models.length,
  manifest.expectedModelCount
);
console.log('PMx browser-only MIPD snapshot: ' + modelNames.length + ' models, SHA ' + manifest.sha + ', generated from standalone repository.');

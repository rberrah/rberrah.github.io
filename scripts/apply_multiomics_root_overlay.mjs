// Apply the independently built direct-root MultiOmics payload to PMx Pages.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, lstat, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const sourceRoot = path.resolve(process.argv[2] || '');
const distRoot = path.resolve(process.argv[3] || 'dist');
const manifest = JSON.parse(await readFile(path.join(sourceRoot, 'manifest.json'), 'utf8'));
assert.equal(manifest.schema, 'multiomics.root-short-url-overlay.v1');
assert.equal(manifest.source, 'rberrah/MultiOmics');
assert.equal(manifest.basePath, '');
assert.equal(manifest.deployment, 'NOT_DEPLOYED_BY_SOURCE_REPOSITORY');
assert.deepEqual(manifest.directories, ['multiomics', '_multiomics_app']);
assert.deepEqual(manifest.routes, ['/multiomics/', '/multiomics/tool/', '/multiomics/learn/', '/multiomics/demo/', '/multiomics/ecosystem/', '/multiomics/disciplines/', '/multiomics/resources/']);
assert(Array.isArray(manifest.files) && manifest.files.length > 15);

const payloadRoot = path.join(sourceRoot, 'site');
const sourcePaths = new Set();
function allowed(name) {
  return typeof name === 'string' &&
    !name.includes('\\') && !name.split('/').includes('..') &&
    !name.split('/').includes('.') &&
    (name.startsWith('multiomics/') || name.startsWith('_multiomics_app/')) &&
    path.posix.normalize(name) === name;
}
for (const entry of manifest.files) {
  assert(allowed(entry.path), 'unapproved root payload path: ' + entry.path);
  assert(!sourcePaths.has(entry.path), 'duplicate root payload path: ' + entry.path);
  sourcePaths.add(entry.path);
  assert(/^[0-9a-f]{64}$/.test(entry.sha256) && Number.isSafeInteger(entry.bytes));
  const abs = path.join(payloadRoot, ...entry.path.split('/'));
  assert((await lstat(abs)).isFile(), 'unexpected root payload member: ' + entry.path);
  const bytes = await readFile(abs);
  assert.equal(bytes.length, entry.bytes, 'payload byte count changed: ' + entry.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256,
    'payload SHA-256 differs: ' + entry.path);
}
for (const required of ['multiomics/index.html','multiomics/tool/index.html','multiomics/learn/index.html','multiomics/demo/index.html','multiomics/ecosystem/index.html','multiomics/disciplines/index.html','multiomics/resources/index.html','multiomics/glossary/index.html','multiomics/references/index.html']) {
  assert(sourcePaths.has(required), 'critical direct route absent: ' + required);
}
assert([...sourcePaths].some(p => p.startsWith('_multiomics_app/')),
  'missing separated MultiOmics Svelte asset bundle');

async function walk(dir) {
  for (const child of await readdir(dir)) {
    const abs = path.join(dir, child);
    const st = await lstat(abs);
    assert(!st.isSymbolicLink(), 'symlink in root payload: ' + abs);
    if (st.isDirectory()) { await walk(abs); continue; }
    assert(st.isFile(), 'non-file in root payload: ' + abs);
    const rel = path.relative(payloadRoot, abs).split(path.sep).join('/');
    assert(sourcePaths.has(rel), 'unmanifested root payload file: ' + rel);
  }
}
await walk(payloadRoot);

assert((await lstat(path.join(distRoot, 'index.html'))).isFile(), 'portal root missing');
assert((await lstat(path.join(distRoot, 'pharmacometrie', 'index.html'))).isFile(), 'PMx root missing');

for (const dir of manifest.directories) {
  const destination = path.join(distRoot, dir);
  await rm(destination, { recursive: true, force: true });
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(payloadRoot, dir), destination,
    { recursive: true, force: false, errorOnExist: true });
}
for (const item of manifest.files) {
  const bytes = await readFile(path.join(distRoot, ...item.path.split('/')));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256,
    'post-overlay digest mismatch: ' + item.path);
}
console.log('PASS: mounted', sourcePaths.size, 'verified MultiOmics files at canonical /multiomics/.');
console.log('PMx /_app, portal root, Stats and other applications remain untouched.');

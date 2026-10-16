// Apply the independently built MultiOmics payload to PMx Pages, never its root.
// Input has already been built from a validated, immutable rberrah/MultiOmics SHA.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, lstat, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const sourceRoot = path.resolve(process.argv[2] || '');
const distRoot = path.resolve(process.argv[3] || 'dist');
const manifest = JSON.parse(await readFile(path.join(sourceRoot, 'manifest.json'), 'utf8'));
assert.equal(manifest.schema, 'multiomics.compat-overlay.v1');
assert.equal(manifest.source, 'rberrah/MultiOmics');
assert.equal(manifest.urlBase, '/pharmacometrie');
assert.equal(manifest.deployPolicy, 'APPEND_ONLY_NAMESPACED_PAYLOAD_NO_AUTOMATIC_PUBLISH');
assert.deepEqual(manifest.directories, ['multiomics', '_multiomics_app']);
assert(Array.isArray(manifest.files) && manifest.files.length > 15);

const payloadRoot = path.join(sourceRoot, 'site');
const required = [
  'pharmacometrie/multiomics/index.html',
  'pharmacometrie/multiomics/tool/index.html',
  'pharmacometrie/multiomics/learn/index.html',
  'pharmacometrie/multiomics/README.txt',
  'pharmacometrie/multiomics/demo_metadata.csv'
];
const sourcePaths = new Set();
function allowed(name) {
  return typeof name === 'string' &&
    !name.includes('\\') && !name.split('/').includes('..') &&
    !name.split('/').includes('.') &&
    (name.startsWith('pharmacometrie/multiomics/') ||
     name.startsWith('pharmacometrie/_multiomics_app/')) &&
    path.posix.normalize(name) === name;
}
for (const entry of manifest.files) {
  assert(allowed(entry.path), 'unapproved payload path: ' + entry.path);
  assert(!sourcePaths.has(entry.path), 'duplicate payload path: ' + entry.path);
  sourcePaths.add(entry.path);
  assert(/^[0-9a-f]{64}$/.test(entry.sha256) && Number.isSafeInteger(entry.bytes));
  const abs = path.join(payloadRoot, ...entry.path.split('/'));
  assert((await lstat(abs)).isFile(), 'unexpected payload member: ' + entry.path);
  const bytes = await readFile(abs);
  assert.equal(bytes.length, entry.bytes, 'payload byte count changed: ' + entry.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256,
    'payload SHA-256 differs: ' + entry.path);
}
for (const requiredFile of required) {
  assert(sourcePaths.has(requiredFile), 'critical legacy file absent: ' + requiredFile);
}
assert([...sourcePaths].some(p => p.startsWith('pharmacometrie/_multiomics_app/')),
  'missing separated SvelteKit asset bundle');
// A secure handoff also rejects additional unmanifested files and symlinks.
async function walk(dir) {
  const children = await readdir(dir);
  for (const child of children) {
    const abs = path.join(dir, child);
    const st = await lstat(abs);
    assert(!st.isSymbolicLink(), 'symlink in release payload: ' + abs);
    if (st.isDirectory()) { await walk(abs); continue; }
    assert(st.isFile(), 'non-file in release payload: ' + abs);
    const rel = path.relative(payloadRoot, abs).split(path.sep).join('/');
    assert(sourcePaths.has(rel), 'unmanifested release file: ' + rel);
  }
}
await walk(payloadRoot);

// Fail before touching the existing site if the layout is unexpected.
assert((await lstat(path.join(distRoot, 'pharmacometrie', 'index.html'))).isFile(),
  'PMx root has not been assembled');
assert((await lstat(path.join(distRoot, 'index.html'))).isFile(),
  'academic portal root has not been assembled');

// Only these two directories are ever replaced; no root files or other apps.
for (const dir of manifest.directories) {
  const destination = path.join(distRoot, 'pharmacometrie', dir);
  await rm(destination, { recursive: true, force: true });
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(payloadRoot, 'pharmacometrie', dir), destination,
    { recursive: true, force: false, errorOnExist: true });
}
for (const item of manifest.files) {
  const bytes = await readFile(path.join(distRoot, ...item.path.split('/')));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256,
    'post-deployment overlay digest mismatch: ' + item.path);
}
console.log('PASS: applied', sourcePaths.size, 'verified MultiOmics files only at existing /pharmacometrie/multiomics/ URLs');
console.log('PMx root, /_app bundle, portal and all other applications remain owned by PMx Explain.');

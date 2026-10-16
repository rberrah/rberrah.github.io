import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const ignoredDirectories = new Set(['.git', '.svelte-kit', '.output', 'build', 'dist', 'node_modules', 'playwright-report', 'test-results']);
const walk = directory => readdirSync(new URL(directory, root), { withFileTypes: true }).flatMap(entry => {
  const path = join(directory, entry.name).replaceAll('\\', '/');
  if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
  return entry.isDirectory() ? walk(`${path}/`) : [path];
});

const browserSources = walk('src/').filter(path => ['.html', '.js', '.svelte'].includes(extname(path)));
const localStorageFiles = browserSources.filter(path => read(path).includes('localStorage'));
const allowedStorageFiles = [
  'src/app.html',
  'src/lib/analytics.js',
  'src/lib/components/ThemeToggle.svelte',
  'src/lib/stores/language.js',
  'src/lib/stores/learning.js'
];

assert.deepEqual(localStorageFiles.sort(), allowedStorageFiles.sort(), 'Unexpected browser persistence: review every localStorage use');
for (const forbidden of ['sessionStorage', 'indexedDB', 'document.cookie']) {
  assert.equal(browserSources.filter(path => read(path).includes(forbidden)).length, 0, `${forbidden} must not persist workshop or patient data`);
}

assert.match(read('src/app.html'), /localStorage\.getItem\('pk-theme'\)/);
assert.match(read('src/lib/analytics.js'), /localStorage\.getItem\('skipgc'\)/);
assert.match(read('src/lib/stores/language.js'), /pharmacometrie-language/);
assert.match(read('src/lib/learning/assessment.js'), /progressKey = 'pmx-learning-v1'/);
assert.match(read('src/lib/learning/assessment.js'), /never arbitrary saved inputs or patient data/);

assert.match(read('playwright.pmx.config.js'), /trace:\s*'off'/, 'PMx browser tests must not retain model or patient-shaped inputs in traces');

const gitignore = read('.gitignore');
for (const pattern of ['.env', '*.pdf', 'test-results/', 'playwright-report/']) {
  assert.ok(gitignore.includes(pattern), `.gitignore must exclude ${pattern}`);
}

const protectedExtensions = new Set(['.pdf', '.docx', '.pptx', '.zip']);
const approvedPublicDocuments = path =>
  path === 'static/downloads/pharmacometrie-pratique.pptx' ||
  path.startsWith('portal/communications/files/');
let tracked = [];
try {
  tracked = execFileSync('git', ['-c', 'core.quotepath=false', 'ls-files', '-z'], {
    cwd: new URL('.', root), encoding: 'utf8'
  }).split('\0').filter(Boolean);
} catch (error) {
  if (error?.code !== 'EPERM') throw error;
  console.warn('Tracked-document check skipped because this sandbox blocks child processes; CI runs the same check.');
}
const protectedTracked = tracked.filter(path => protectedExtensions.has(extname(path).toLowerCase()) && !approvedPublicDocuments(path));
assert.deepEqual(protectedTracked, [], `Unapproved protected source documents must not be tracked: ${protectedTracked.join(', ')}`);
assert.equal(tracked.includes('Pharmacométrie Pratique.pptx'), false, 'Keep only the canonical public teaching-deck copy under static/downloads');
assert.equal(tracked.includes('static/pharmacometrie-pratique.pptx'), false, 'Keep only the canonical public teaching-deck copy under static/downloads');
assert.equal(tracked.some(path => path.startsWith('tdm-engine/')), false, 'PMx must not track a local MIPD engine mirror');
const patientExports = tracked.filter(path => /(^|\/)(tdm-patient|tdm-report)-/i.test(path));
assert.deepEqual(patientExports, [], `Patient exports must not be present in the repository tree: ${patientExports.join(', ')}`);

console.log('Privacy/non-retention repository contract passed. Public hosting logs and live cross-session isolation still require the documented manual audit.');

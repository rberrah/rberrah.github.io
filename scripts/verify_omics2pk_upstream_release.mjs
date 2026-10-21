// Fail closed: PMx links only to a pinned Omics2PK site revision whose native site CI and Pages publish passed.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = JSON.parse(await readFile('integration/omics2pk-release.json', 'utf8'));
const requiredNames = [
  'Offline contract tests',
  'Omics2PK static UI qualification',
  'Publish Omics2PK website to GitHub Pages (manual)'
];

if (source.schema !== 'omics2pk-site-source.v1' ||
    source.repository !== 'rberrah/Omics2PK' ||
    !/^[0-9a-f]{40}$/.test(source.sha) ||
    source.publicUrl !== 'https://rberrah.github.io/Omics2PK/' ||
    JSON.stringify(source.requiredWorkflows) !== JSON.stringify(requiredNames)) {
  throw new Error('Unexpected Omics2PK source, moving ref, public URL or workflow gate');
}

const pmxLayout = await readFile('src/routes/+layout.svelte', 'utf8');
assert.ok(pmxLayout.includes(source.publicUrl), 'PMx Ecosystem link differs from Omics2PK release contract');
const mountedMultiomicsTest = await readFile('tests/e2e/multiomics-assembled-mount.spec.js', 'utf8');
assert.ok(mountedMultiomicsTest.includes(source.publicUrl), 'Mounted MultiOmics Omics2PK navigation contract differs from PMx release contract');

const url = 'https://api.github.com/repos/rberrah/Omics2PK/actions/runs?head_sha=' +
  encodeURIComponent(source.sha) + '&per_page=100';
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'pmx-omics2pk-qualified-site-gate',
  'X-GitHub-Api-Version': '2022-11-28'
};
if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;

const artworkResponse = await fetch(
  'https://api.github.com/repos/rberrah/Omics2PK/contents/site/assets/ecosystem-graphical-abstract.svg?ref=' +
    encodeURIComponent(source.sha),
  { headers }
);
if (!artworkResponse.ok) {
  throw new Error('Cannot verify Omics2PK ecosystem graphical abstract: HTTP ' + artworkResponse.status);
}
const artwork = await artworkResponse.json();
if (artwork?.encoding !== 'base64' || typeof artwork?.content !== 'string') {
  throw new Error('Unexpected Omics2PK ecosystem graphical-abstract payload');
}
const [pmxEcosystem, omics2pkEcosystem] = [
  await readFile('static/ecosystem-graphical-abstract.svg'),
  Buffer.from(artwork.content.replace(/\\n/g, ''), 'base64')
];
if (!pmxEcosystem.equals(omics2pkEcosystem)) {
  throw new Error('Release blocked: PMx and pinned Omics2PK ecosystem graphical abstracts differ');
}
console.log('PASS shared PMx/Omics2PK ecosystem graphical abstract');
const response = await fetch(url, { headers });
if (!response.ok) throw new Error('Cannot verify independent Omics2PK workflows: HTTP ' + response.status);
const data = await response.json();
if (!Array.isArray(data.workflow_runs) || data.total_count > 100) {
  throw new Error('Missing or incomplete GitHub Actions evidence for pinned Omics2PK SHA');
}
for (const name of requiredNames) {
  const runs = data.workflow_runs.filter((run) =>
    run.name === name && run.head_sha === source.sha && run.event === 'push'
  );
  if (!runs.some((run) => run.status === 'completed' && run.conclusion === 'success')) {
    throw new Error('Release blocked: authentic Omics2PK push CI not successful for ' + name);
  }
  if (runs.some((run) => ['failure', 'cancelled', 'timed_out'].includes(run.conclusion))) {
    throw new Error('Release blocked: adverse Omics2PK CI for ' + name);
  }
  console.log('PASS independent Omics2PK workflow:', name);
}
console.log('Pinned Omics2PK public site is qualified:', source.sha, source.publicUrl);

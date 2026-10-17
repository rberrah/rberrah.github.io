// Fail closed: PMx publishes only a pinned MultiOmics commit whose native CI passed.
import { readFile } from 'node:fs/promises';

const source = JSON.parse(await readFile('integration/multiomics-release.json', 'utf8'));
const requiredNames = [
  "MultiOmics standalone software qualification",
  "Public Airway native-R replay and R Markdown",
  "Multi-omics real public Nutrimouse DIABLO biological validation",
  "Multi-omics real Nutrimouse MOFA2 factor and experimental-effect audit",
  "Frozen R reference — calibration and negative-control qualification",
  "MultiOmics fixed-URL integration artifact",
  "Omics2PK consumer contract - native MultiOmics synthetic ZIP",
  "Independent external GEO GSE22871 source qualification"
];
if (source.schema !== 'multiomics-site-source.v1' ||
    source.repository !== 'rberrah/MultiOmics' ||
    !/^[0-9a-f]{40}$/.test(source.sha) ||
    source.basePath !== '' ||
    source.legacyBasePath !== '/pharmacometrie' ||
    source.canonicalPath !== '/multiomics/' ||
    JSON.stringify(source.requiredWorkflows) !== JSON.stringify(requiredNames)) {
  throw new Error('Unexpected MultiOmics source, moving ref, route contract or workflow gate');
}
const url = 'https://api.github.com/repos/rberrah/MultiOmics/actions/runs?head_sha=' +
  encodeURIComponent(source.sha) + '&per_page=100';
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'pmx-multiomics-qualified-release-gate',
  'X-GitHub-Api-Version': '2022-11-28'
};
if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
const response = await fetch(url, { headers });
if (!response.ok) throw new Error('Cannot verify independent MultiOmics workflows: HTTP ' + response.status);
const data = await response.json();
if (!Array.isArray(data.workflow_runs) || data.total_count > 100) {
  throw new Error('Missing or incomplete GitHub Actions evidence for pinned MultiOmics SHA');
}
for (const name of requiredNames) {
  const runs = data.workflow_runs.filter(run => run.name === name &&
    run.head_sha === source.sha && run.event === 'push');
  if (!runs.some(run => run.status === 'completed' && run.conclusion === 'success')) {
    throw new Error('Release blocked: authentic push CI not successful for ' + name);
  }
  if (runs.some(run => ['failure','cancelled','timed_out'].includes(run.conclusion))) {
    throw new Error('Release blocked: adverse CI for ' + name);
  }
  console.log('PASS independent MultiOmics workflow:', name);
}
console.log('Pinned canonical /multiomics/ source is qualified:', source.sha);

import { readFile } from 'node:fs/promises';

const source = JSON.parse(await readFile('integration/mipd-release.json', 'utf8'));
const requiredNames = ['Standalone MIPD qualification'];
if (source.schema !== 'mipd-site-source.v1' ||
    source.repository !== 'rberrah/MIPD-Engine' ||
    !/^[0-9a-f]{40}$/.test(source.sha) ||
    source.publicUrl !== 'https://tdmhub.shinyapps.io/MIPD_Engine' ||
    JSON.stringify(source.requiredWorkflows) !== JSON.stringify(requiredNames)) {
  throw new Error('Unexpected MIPD source, moving ref, public target or workflow gate');
}

const url = 'https://api.github.com/repos/rberrah/MIPD-Engine/actions/runs?head_sha=' +
  encodeURIComponent(source.sha) + '&per_page=100';
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'pmx-mipd-qualified-release-gate',
  'X-GitHub-Api-Version': '2022-11-28'
};
if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
const response = await fetch(url, { headers });
if (!response.ok) throw new Error('Cannot verify independent MIPD workflow: HTTP ' + response.status);
const data = await response.json();
if (!Array.isArray(data.workflow_runs) || data.total_count > 100) {
  throw new Error('Missing or incomplete GitHub Actions evidence for pinned MIPD SHA');
}
for (const name of requiredNames) {
  const runs = data.workflow_runs.filter((run) => run.name === name &&
    run.head_sha === source.sha && run.event === 'push');
  if (!runs.some((run) => run.status === 'completed' && run.conclusion === 'success')) {
    throw new Error('Release blocked: authentic push CI not successful for ' + name);
  }
  if (runs.some((run) => ['failure', 'cancelled', 'timed_out'].includes(run.conclusion))) {
    throw new Error('Release blocked: adverse CI for ' + name);
  }
  console.log('PASS independent MIPD workflow:', name);
}
console.log('Pinned MIPD source is qualified:', source.sha);

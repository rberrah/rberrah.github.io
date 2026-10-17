import { readFile } from 'node:fs/promises';

const source = JSON.parse(await readFile('integration/mipd-release.json', 'utf8'));
const requiredNames = ['Standalone MIPD qualification', 'Bibliographic DOI qualification'];
if (source.schema !== 'mipd-site-source.v1' ||
    source.repository !== 'rberrah/MIPD-Engine' ||
    !/^[0-9a-f]{40}$/.test(source.sha) ||
    source.publicUrl !== 'https://tdmhub.shinyapps.io/MIPD_Engine' ||
    JSON.stringify(source.requiredWorkflows) !== JSON.stringify(requiredNames)) {
  throw new Error('Unexpected MIPD source, moving ref, public target or workflow gate');
}

const deployment = source.publicDeployment;
if (!deployment ||
    deployment.status !== 'verified' ||
    deployment.verifiedSourceSha !== source.sha ||
    deployment.fingerprintUrl !== source.publicUrl + '/deployment-release.json' ||
    !/^\d+$/.test(String(deployment.bundleId))) {
  throw new Error('MIPD public deployment verification state is inconsistent with the pinned source');
}

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'pmx-mipd-qualified-release-gate',
  'X-GitHub-Api-Version': '2022-11-28'
};
if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;

const url = 'https://api.github.com/repos/rberrah/MIPD-Engine/actions/runs?head_sha=' +
  encodeURIComponent(source.sha) + '&per_page=100';
const response = await fetch(url, { headers });
if (!response.ok) throw new Error('Cannot verify independent MIPD workflows: HTTP ' + response.status);
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
  if (runs.some((run) => ['failure','cancelled','timed_out'].includes(run.conclusion))) {
    throw new Error('Release blocked: adverse CI for ' + name);
  }
  console.log('PASS independent MIPD workflow:', name);
}

async function fetchPublic(url, accept) {
  const res = await fetch(url, {
    headers: { Accept: accept, 'User-Agent': 'pmx-mipd-public-release-gate' },
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok) throw new Error('Cannot verify public MIPD release: HTTP ' + res.status + ' at ' + url);
  return res;
}

// Wake a cold Shinyapps instance before checking the immutable release fingerprint.
let lastError;
for (let attempt = 1; attempt <= 3; attempt += 1) {
  try {
    const htmlResponse = await fetchPublic(source.publicUrl + '/?lang=en', 'text/html');
    const html = await htmlResponse.text();
    if (!/<html\b/i.test(html) || !/(shiny|shinyapps)/i.test(html)) {
      throw new Error('Public MIPD URL did not return a recognizable Shiny application');
    }
    const fingerprintResponse = await fetchPublic(deployment.fingerprintUrl, 'application/json');
    const fingerprint = await fingerprintResponse.json();
    const expected = {
      schema: 'mipd-public-release.v1',
      target: 'tdmhub/MIPD_Engine',
      appId: '17776160',
      sourceSha: source.sha,
      modelCount: source.expectedModelCount,
      allowCustomModels: false,
      enablePmetrics: false
    };
    for (const [key, value] of Object.entries(expected)) {
      if (fingerprint[key] !== value) {
        throw new Error(`Public MIPD fingerprint mismatch for ${key}: expected ${JSON.stringify(value)}, received ${JSON.stringify(fingerprint[key])}`);
      }
    }
    console.log('PASS public MIPD immutable release fingerprint:', fingerprint.sourceSha, 'bundle', deployment.bundleId);
    lastError = null;
    break;
  } catch (error) {
    lastError = error;
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 6000));
  }
}
if (lastError) throw lastError;

console.log('Pinned MIPD source, DOI audit and live deployment are qualified:', source.sha);

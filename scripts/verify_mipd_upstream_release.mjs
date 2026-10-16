import { readFile } from 'node:fs/promises';

const source = JSON.parse(await readFile('integration/mipd-engine-release.json', 'utf8'));
const expected = {
  schema: 'mipd-engine-source.v1',
  repository: 'rberrah/MIPD-Engine',
  publicUrl: 'https://tdmhub.shinyapps.io/MIPD_Engine/',
  shinyappsAppId: '17776160',
  expectedModelCount: 46,
  rVersion: '4.6.1',
  pmetricsVersion: '3.2.6',
  requiredWorkflow: 'Standalone MIPD qualification'
};
for (const [key,value] of Object.entries(expected)) {
  if (source[key] !== value) throw new Error('Unexpected MIPD release contract field '+key);
}
if (!/^[0-9a-f]{40}$/.test(source.sha)) throw new Error('MIPD source must be an immutable 40-character SHA');

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'pmx-mipd-qualified-release-gate',
  'X-GitHub-Api-Version': '2022-11-28'
};
if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;

const runsUrl = 'https://api.github.com/repos/'+source.repository+'/actions/runs?head_sha='+encodeURIComponent(source.sha)+'&per_page=100';
const response = await fetch(runsUrl,{headers});
if (!response.ok) throw new Error('Cannot verify MIPD workflow evidence: HTTP '+response.status);
const data = await response.json();
const runs = (data.workflow_runs || []).filter(run =>
  run.name === source.requiredWorkflow &&
  run.head_sha === source.sha &&
  run.head_branch === 'main' &&
  run.event === 'push'
);
if (!runs.some(run => run.status === 'completed' && run.conclusion === 'success')) {
  throw new Error('Release blocked: standalone MIPD qualification has not succeeded on the pinned main SHA');
}
if (runs.some(run => ['failure','cancelled','timed_out'].includes(run.conclusion))) {
  throw new Error('Release blocked: adverse standalone MIPD qualification exists on the pinned SHA');
}

async function raw(path) {
  const url='https://raw.githubusercontent.com/'+source.repository+'/'+source.sha+'/'+path;
  const res=await fetch(url);
  if (!res.ok) throw new Error('Cannot read pinned MIPD '+path+': HTTP '+res.status);
  return res.text();
}
const catalog=JSON.parse(await raw('models/catalog.json'));
if (!Array.isArray(catalog.models) || catalog.models.length !== source.expectedModelCount)
  throw new Error('Pinned MIPD model count differs from consumer contract');

const runtime=JSON.parse(await raw('runtime/reference-runtime.json'));
if (runtime.rVersion !== source.rVersion || runtime.pmetrics?.version !== source.pmetricsVersion)
  throw new Error('Pinned MIPD scientific runtime differs from consumer contract');

const deploy=await raw('scripts/deploy_shiny.R');
for (const required of [
  'Sys.setenv(ALLOW_CUSTOM_MODELS = "false")',
  'appId = "17776160"',
  'appName = "MIPD_Engine"',
  'account = account'
]) {
  if (!deploy.includes(required)) throw new Error('Pinned MIPD deployment safety contract missing: '+required);
}
console.log('PASS pinned MIPD source:', source.sha);
console.log('Models:', catalog.models.length, 'R:', runtime.rVersion, 'Pmetrics:', runtime.pmetrics.version);

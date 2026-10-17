import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const source = JSON.parse(readFileSync('integration/mipd-release.json', 'utf8'));
const engineRoot = path.resolve(process.argv[2] || 'tdm-engine');

const engineUrlSource = readFileSync('src/lib/tdm/engine.js', 'utf8');
assert.ok(engineUrlSource.includes(source.publicUrl), 'PMx public engine URL differs from the release contract');
const toolsPage = readFileSync('portal/tools/index.html', 'utf8');
assert.ok(toolsPage.includes(`https://github.com/${source.repository}`), 'Portal source link does not target standalone MIPD');
const tdmPage = readFileSync('src/routes/tdm/+page.svelte', 'utf8');
assert.ok(tdmPage.includes(`https://github.com/${source.repository}/issues/new`), 'Model proposals do not target standalone MIPD');

const catalog = JSON.parse(readFileSync(path.join(engineRoot, 'models', 'catalog.json'), 'utf8'));
assert.equal(catalog.models.length, source.expectedModelCount, 'Unexpected standalone model-library size');

const runtime = JSON.parse(readFileSync(path.join(engineRoot, 'runtime', 'reference-runtime.json'), 'utf8'));
assert.equal(runtime.rVersion, source.rVersion, 'Standalone R runtime differs from PMx consumer contract');
assert.equal(runtime.pmetrics?.version, source.pmetricsVersion, 'Standalone Pmetrics runtime differs from PMx consumer contract');

const deploySource = readFileSync(path.join(engineRoot, 'scripts', 'deploy_shiny.R'), 'utf8');
assert.ok(deploySource.includes(`appId = "${source.shinyappsAppId}"`), 'Standalone Shinyapps appId changed');
assert.ok(deploySource.includes('appName = "MIPD_Engine"'), 'Standalone public app name changed');
const profileSource = readFileSync(path.join(engineRoot, 'R', 'deployment_profile.R'), 'utf8');
assert.equal(source.productionCustomModels, false, 'Public arbitrary custom C++ must remain disabled');
assert.ok(deploySource.includes('ALLOW_CUSTOM_MODELS = "false"') &&
    deploySource.includes('ENABLE_PMETRICS = "false"') &&
    profileSource.includes('Sys.setenv(ALLOW_CUSTOM_MODELS = "false", ENABLE_PMETRICS = "false")'),
  'Standalone production custom-C++ or Pmetrics safety profile changed');

console.log(`MIPD consumer contract PASS: ${source.sha}, ${catalog.models.length} models, R ${runtime.rVersion}, Pmetrics ${runtime.pmetrics.version}.`);

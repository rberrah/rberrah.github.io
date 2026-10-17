import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const source = JSON.parse(readFileSync('integration/mipd-release.json', 'utf8'));
const engineRootValue = process.argv[2];
assert.ok(engineRootValue, 'Standalone MIPD checkout path is required; PMx no longer carries a local tdm-engine mirror');
const engineRoot = path.resolve(engineRootValue);

const engineUrlSource = readFileSync('src/lib/tdm/engine.js', 'utf8');
assert.ok(engineUrlSource.includes(source.publicUrl), 'PMx public engine URL differs from the release contract');
const toolsPage = readFileSync('portal/tools/index.html', 'utf8');
assert.ok(toolsPage.includes(`https://github.com/${source.repository}`), 'Portal source link does not target standalone MIPD');
const tdmPage = readFileSync('src/routes/tdm/+page.svelte', 'utf8');
assert.ok(tdmPage.includes(`https://github.com/${source.repository}/issues/new`), 'Model proposals do not target standalone MIPD');
const contributionGuide = readFileSync('CONTRIBUTING_TDM_MODELS.md', 'utf8');
assert.ok(contributionGuide.includes(`https://github.com/${source.repository}/issues/new`), 'TDM contribution guide does not target standalone MIPD');
assert.equal(existsSync('.github/ISSUE_TEMPLATE/tdm-model.yml'), false, 'PMx must not own a TDM model submission form after MIPD extraction');

const catalog = JSON.parse(readFileSync(path.join(engineRoot, 'models', 'catalog.json'), 'utf8'));
assert.equal(catalog.models.length, source.expectedModelCount, 'Unexpected standalone model-library size');

const runtime = JSON.parse(readFileSync(path.join(engineRoot, 'runtime', 'reference-runtime.json'), 'utf8'));
assert.equal(runtime.rVersion, source.rVersion, 'Standalone R runtime differs from PMx consumer contract');
assert.equal(runtime.pmetrics?.version, source.pmetricsVersion, 'Standalone Pmetrics runtime differs from PMx consumer contract');

const deploySource = readFileSync(path.join(engineRoot, 'scripts', 'deploy_shiny.R'), 'utf8');
assert.ok(deploySource.includes(`appId = "${source.shinyappsAppId}"`), 'Standalone Shinyapps appId changed');
assert.ok(deploySource.includes('appName = "MIPD_Engine"'), 'Standalone public app name changed');
const customModelsDisabled = /Sys\.setenv\([^)]*ALLOW_CUSTOM_MODELS\s*=\s*"false"/s.test(deploySource);
assert.equal(customModelsDisabled, !source.productionCustomModels,
  'Standalone production custom-model safety policy changed');
assert.ok(/Sys\.setenv\([^)]*ENABLE_PMETRICS\s*=\s*"false"/s.test(deploySource),
  'Standalone public deployment must keep Pmetrics disabled on the current Shinyapps runtime');

console.log(`MIPD consumer contract PASS: ${source.sha}, ${catalog.models.length} models, R ${runtime.rVersion}, Pmetrics ${runtime.pmetrics.version}.`);

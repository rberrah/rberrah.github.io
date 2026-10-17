import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const engineRootValue = process.env.MIPD_ENGINE_DIR;
assert(engineRootValue, 'MIPD_ENGINE_DIR is required: production engine safety is owned by the standalone repository');
const engineRoot = path.resolve(engineRootValue);
const readRepo = (relative) => readFileSync(path.join(repoRoot, relative), 'utf8');
const readEngine = (relative) => readFileSync(path.join(engineRoot, relative), 'utf8');

assert(!existsSync(path.join(repoRoot, 'tdm-engine')), 'PMx must not carry a local MIPD engine mirror after extraction');

const app = readEngine('app.R');
const deploy = readEngine('scripts/deploy_shiny.R');
assert.match(app, /Sys\.getenv\("ALLOW_CUSTOM_MODELS", "false"\)/,
  'Standalone public application must default to ALLOW_CUSTOM_MODELS=false');
assert.match(deploy, /Sys\.setenv\(ALLOW_CUSTOM_MODELS = "false", ENABLE_PMETRICS = "false"\)/,
  'Standalone deployment must jointly disable arbitrary C++ and Pmetrics');
assert.match(app, /Sys\.getenv\("ENABLE_PMETRICS", "auto"\)/,
  'Standalone application must expose an explicit optional Pmetrics mode');
assert.match(deploy, /Sys\.setenv\(ENABLE_PMETRICS = "false"\)/,
  'Current public Shiny deployment must disable Pmetrics');
assert.match(deploy, /!"Pmetrics" %in% deps\$Package/,
  'Public Shiny manifest must reject accidental Pmetrics inclusion');
assert.match(readEngine('R/pmetrics_disabled.R'), /pmetrics_artifact_catalog <- function\(\) data\.frame/,
  'Public profile must provide the disabled Pmetrics adapter');

const deploymentSources = [
  ...readdirSync(path.join(repoRoot, '.github', 'workflows'))
    .filter((file) => /\.ya?ml$/i.test(file))
    .map((file) => [`PMx .github/workflows/${file}`, readRepo(`.github/workflows/${file}`)]),
  ['MIPD scripts/deploy_shiny.R', deploy],
  ['MIPD .github/workflows/deploy-shiny.yml', readEngine('.github/workflows/deploy-shiny.yml')]
];
for (const [label, source] of deploymentSources) {
  assert.doesNotMatch(source, /ALLOW_CUSTOM_MODELS\s*[:=]\s*["']?true/i,
    `${label} enables arbitrary C++ in a production path`);
}
console.log(`Production safety contract PASS across pinned standalone MIPD and ${deploymentSources.length - 2} PMx workflows.`);

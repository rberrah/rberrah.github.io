import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const deploymentFiles = [
  'scripts/deploy_shiny.R',
  ...readdirSync(new URL('.github/workflows/', root))
    .filter(file => /\.ya?ml$/i.test(file))
    .map(file => `.github/workflows/${file}`)
];

assert.match(read('tdm-engine/app.R'), /Sys\.getenv\("ALLOW_CUSTOM_MODELS", "false"\)/,
  'The public application must default to ALLOW_CUSTOM_MODELS=false');
assert.match(read('scripts/deploy_shiny.R'), /Sys\.setenv\(ALLOW_CUSTOM_MODELS = "false"\)/,
  'The Shiny deployment script must force ALLOW_CUSTOM_MODELS=false');
assert.match(read('tdm-engine/app.R'), /Sys\.getenv\("ENABLE_PMETRICS", "auto"\)/,
  'The application must expose an explicit optional Pmetrics mode');
assert.match(read('scripts/deploy_shiny.R'), /Sys\.setenv\(ENABLE_PMETRICS = "false"\)/,
  'The public Shiny deployment must disable Pmetrics');
assert.match(read('scripts/deploy_shiny.R'), /!"Pmetrics" %in% deps\$Package/,
  'The public Shiny manifest must reject an accidental Pmetrics dependency');
assert.match(read('tdm-engine/R/pmetrics_disabled.R'), /pmetrics_artifact_catalog <- function\(\) data\.frame/,
  'The public Shiny profile must provide a disabled Pmetrics adapter');

for (const file of deploymentFiles) {
  assert.doesNotMatch(read(file), /ALLOW_CUSTOM_MODELS\s*[:=]\s*["']?true/i,
    `${file} enables arbitrary C++ in a production path`);
}

console.log(`Production safety contract passed across ${deploymentFiles.length} deployment files.`);

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
assert.equal(catalog.models.length, 46, 'Unexpected standalone model-library size');
console.log(`MIPD consumer contract PASS: ${source.sha}, ${catalog.models.length} models.`);

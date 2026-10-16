import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const forbidden = [
  [/CC BY-SA 4\.0/u, 'legacy CC BY-SA declaration'],
  [/\bCode MIT\b|\bcode MIT\b/u, 'legacy MIT code declaration'],
  [/Commercial reuse is permitted/iu, 'commercial reuse claim'],
  [/including paid teaching/iu, 'paid-teaching reuse claim'],
  [/y compris payant/iu, 'paid-teaching reuse claim (FR)']
];

function walk(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(folder, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

const publicChrome = [
  ...walk('portal').filter((file) => file.endsWith('.html')),
  'src/lib/site.js',
  'src/lib/i18n/translations.js',
  'scripts/generate_communications.mjs'
].filter((file) => !file.startsWith('portal/stats/'));

for (const file of publicChrome) {
  const content = readFileSync(file, 'utf8');
  for (const [pattern, label] of forbidden) {
    assert.equal(pattern.test(content), false, `${label} remains in active public source: ${file}`);
    pattern.lastIndex = 0;
  }
}

const site = readFileSync('src/lib/site.js', 'utf8');
assert.match(site, /CC BY-NC-SA 4\.0/u);
assert.match(site, /PolyForm Noncommercial 1\.0\.0/u);

const reuse = readFileSync('portal/citer/index.html', 'utf8');
assert.match(reuse, /CC BY-NC-SA 4\.0/u);
assert.match(reuse, /PolyForm Noncommercial 1\.0\.0/u);
assert.match(reuse, /earlier licences|earlier versions/iu);

console.log(`License consistency passed across ${publicChrome.length} active public files.`);

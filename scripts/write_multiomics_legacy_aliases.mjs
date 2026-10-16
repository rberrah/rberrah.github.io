// Replace the historical PMx MultiOmics copy with small compatibility aliases.
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const distRoot = path.resolve(process.argv[2] || 'dist');
const legacyRoot = path.join(distRoot, 'pharmacometrie', 'multiomics');
await rm(legacyRoot, { recursive: true, force: true });

const routes = [
  ['', '/multiomics/', 'MultiOmics'],
  ['tool', '/multiomics/tool/', 'MultiOmics analysis tool'],
  ['learn', '/multiomics/learn/', 'MultiOmics methods and courses']
];

function html(target, title) {
  const canonical = 'https://rberrah.github.io' + target;
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — moved</title>
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${canonical}">
  <meta http-equiv="refresh" content="0;url=${target}">
  <script>window.location.replace(${JSON.stringify(target)} + window.location.search + window.location.hash);</script>
</head>
<body><main><h1>${title}</h1><p><a href="${target}">Open the canonical MultiOmics page</a>.</p></main></body>
</html>`;
}
for (const [sub, target, title] of routes) {
  const dir = path.join(legacyRoot, sub);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html(target, title), 'utf8');
}
console.log('PASS: historical /pharmacometrie/multiomics/ routes now redirect to canonical /multiomics/.');

import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'dist');
assert((await stat(root).catch(() => null))?.isDirectory(), `Public artifact directory not found: ${root}`);

const allowedExtensions = new Set([
  '.cpp', '.css', '.csv', '.html', '.ico', '.ipynb', '.js', '.json', '.md', '.otf',
  '.pdf', '.png', '.pptx', '.r', '.rmd', '.svg', '.tsv', '.ttf', '.txt', '.webmanifest', '.webp',
  '.woff', '.woff2', '.xml'
]);
const approvedExtensionlessFiles = new Set([
  'pharmacometrie/.nojekyll',
  'pharmacometrie/slides/.gitkeep'
]);
const forbiddenName = /(^|\/)(?:\.env(?:\.|$)|.*(?:\.bak|\.backup|\.old|\.orig|\.swp|~)$|(?:tdm-)?patient(?:[-_.]|$)|tdm-report(?:[-_.]|$)|secrets?(?:[-_.]|$)|credentials?(?:[-_.]|$)|private[-_.]?key(?:[-_.]|$)|references?(?:[-_.]|$).*(?:\.pdf|\.docx)$)/i;
const forbiddenExtension = new Set(['.7z', '.doc', '.docm', '.docx', '.gz', '.rar', '.tar', '.tmp', '.zip']);
const approvedDocuments = [
  /^communications\/files\/[a-z0-9-]+\.(?:pdf|pptx)$/,
  /^pharmacometrie\/(?:downloads\/)?pharmacometrie-pratique\.pptx$/
];
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{36,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    files.push(...(entry.isDirectory() ? await walk(absolute) : [absolute]));
  }
  return files;
}

const failures = [];
const files = await walk(root);
for (const absolute of files) {
  const relative = path.relative(root, absolute).split(path.sep).join('/');
  const extension = path.extname(relative).toLowerCase();
  if ((!extension && !approvedExtensionlessFiles.has(relative)) ||
      (extension && !allowedExtensions.has(extension)) ||
      forbiddenExtension.has(extension)) {
    failures.push(`${relative}: extension is not allowed in the public artifact`);
  }
  if (forbiddenName.test(relative)) failures.push(`${relative}: suspicious private or temporary filename`);
  if (['.pdf', '.pptx'].includes(extension) && !approvedDocuments.some((pattern) => pattern.test(relative))) {
    failures.push(`${relative}: public document is outside the explicit allowlist`);
  }
  if (['.html', '.js', '.json', '.md', '.r', '.rmd', '.txt', '.xml'].includes(extension)) {
    const content = await readFile(absolute, 'utf8');
    for (const pattern of secretPatterns) if (pattern.test(content)) failures.push(`${relative}: high-confidence secret pattern detected`);
  }
}

assert.equal(failures.length, 0, `Public artifact audit failed:\n${failures.join('\n')}`);
console.log(`Public artifact audit passed: ${files.length} files, no unexpected archive, private input, protected document or high-confidence secret.`);

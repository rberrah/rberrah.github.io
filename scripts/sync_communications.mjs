import { createHash } from 'node:crypto';
import { copyFile, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { communications, pendingCommunications } from '../src/lib/content/communications.js';

const sourceRoot = path.resolve(process.argv.slice(2).find(arg => !arg.startsWith('--')) || '../../Communication');
const copy = process.argv.includes('--copy');
const known = new Map([...communications, ...pendingCommunications].map(item => [item.sourcePath, item]));
const files = (await readdir(sourceRoot, { withFileTypes: true })).filter(item => item.isFile() && /\.(pptx|pdf|png|jpe?g|webp)$/i.test(item.name));

for (const file of files) {
  const item = known.get(file.name);
  if (!item) throw new Error(`Unclassified communication source: ${file.name}`);
  const digest = createHash('sha256').update(await readFile(path.join(sourceRoot, file.name))).digest('hex');
  if (`sha256:${digest}` !== item.sourceSha) throw new Error(`Source changed: ${file.name}`);
}
for (const sourcePath of known.keys()) if (!files.some(file => file.name === sourcePath)) throw new Error(`Missing communication source: ${sourcePath}`);

if (copy) {
  for (const item of communications) {
    if (!item.pptx) continue;
    await copyFile(path.join(sourceRoot, item.sourcePath), path.resolve('portal', item.pptx.slice(1)));
  }
}
console.log(`Communication source inventory matches ${files.length} local files${copy ? '; published PPTX files copied' : ''}.`);

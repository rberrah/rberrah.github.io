import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { communications, pendingCommunications } from '../src/lib/content/communications.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slugs = communications.map(item => item.slug);
assert.equal(new Set(slugs).size, slugs.length, 'Communication slugs must be unique');
assert.equal(new Set(communications.map(item => item.id)).size, communications.length, 'Communication ids must be unique');
assert.equal(new Set(communications.map(item => item.title)).size, communications.length, 'Exact duplicate titles are not allowed');

const pendingPaths = new Set(pendingCommunications.map(item => item.sourcePath));
for (const item of communications) {
  assert(!pendingPaths.has(item.sourcePath), `${item.sourcePath} cannot be both published and pending`);
  assert(item.pdf || item.pptx, `${item.slug} needs a readable source file`);
  if (item.dateEnd) assert(item.date && item.dateEnd >= item.date, `${item.slug} has an invalid date range`);
  for (const value of [item.pdf, item.pptx, item.image].filter(Boolean)) {
    assert(!/\s/.test(value), `${item.slug} has an unsafe public path: ${value}`);
    await access(path.join(root, 'portal', value.slice(1)));
  }
  for (const link of [item.eventUrl, item.relatedProject?.url, item.publication?.url, item.video?.url].filter(Boolean))
    assert(new URL(link).protocol === 'https:', `${item.slug} has a non-HTTPS external link`);
}

for (const item of pendingCommunications) assert(item.reason.en && item.reason.fr, `${item.sourcePath} needs a bilingual exclusion reason`);
console.log(`Communications valid: ${communications.filter(item => item.type === 'poster').length} posters, ${communications.filter(item => item.type === 'oral').length} oral presentations, ${pendingCommunications.length} pending files.`);

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
const today = process.env.COMMUNICATIONS_AS_OF || new Date().toISOString().slice(0, 10);
const staleUpcoming = communications.filter(item => item.status === 'upcoming' && item.presentationDate && item.presentationDate < today);
assert.equal(staleUpcoming.length, 0,
  `${staleUpcoming.map(item => `${item.slug} (${item.presentationDate})`).join(', ')} still marked upcoming after presentation date; verify whether each communication was presented before changing its status.`);
for (const item of communications) {
  assert(!pendingPaths.has(item.sourcePath), `${item.sourcePath} cannot be both published and pending`);
  assert(item.pdf || item.pptx, `${item.slug} needs a readable source file`);
  if (item.eventEnd) assert(item.eventEnd >= item.eventStart, `${item.slug} has an invalid event range`);
  if (item.presentationDate) {
    assert(item.presentationDate >= item.eventStart, `${item.slug} is presented before its event starts`);
    assert(!item.eventEnd || item.presentationDate <= item.eventEnd, `${item.slug} is presented after its event ends`);
  }
  for (const value of [item.pdf, item.pptx, item.image].filter(Boolean)) {
    assert(!/\s/.test(value), `${item.slug} has an unsafe public path: ${value}`);
    await access(path.join(root, 'portal', value.slice(1)));
  }
  for (const link of [item.eventUrl, item.relatedProject?.url, item.publication?.url, item.video?.url].filter(Boolean))
    assert(new URL(link).protocol === 'https:', `${item.slug} has a non-HTTPS external link`);
}

const netpk = communications.find(item => item.id === 'netpk-peprsn-2026');
assert(netpk, 'NetPK communication is missing');
assert.equal(netpk.presentationDate, '2026-10-14');
assert.equal(netpk.eventStart, '2026-10-13');
assert.equal(netpk.eventEnd, '2026-10-15');
for (const key of ['pdf', 'pptx', 'image']) {
  assert(netpk[key], `NetPK ${key} is missing`);
  await access(path.join(root, 'portal', netpk[key].slice(1)));
}

for (const item of pendingCommunications) assert(item.reason.en && item.reason.fr, `${item.sourcePath} needs a bilingual exclusion reason`);
console.log(`Communications valid: ${communications.filter(item => item.type === 'poster').length} posters, ${communications.filter(item => item.type === 'oral').length} oral presentations, ${pendingCommunications.length} pending files.`);

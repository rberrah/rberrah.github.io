import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const inventory = JSON.parse(readFileSync(resolve(root, 'docs/tool-transfer-inventory.json'), 'utf8'));
const allowedStatuses = new Set(['v3', 'legacy-v1/v2', 'not-applicable']);

assert.equal(inventory.schemaVersion, 1);
assert.equal(typeof inventory.scope, 'string');
assert(inventory.scope.length > 0);
assert.deepEqual(Object.keys(inventory.statuses).sort(), [...allowedStatuses].sort());
assert(Array.isArray(inventory.transfers) && inventory.transfers.length > 0);

const ids = inventory.transfers.map((transfer) => transfer.id);
assert.equal(new Set(ids).size, ids.length, 'Transfer IDs must be unique');
assert.deepEqual(ids, [...ids].sort(), 'Transfer inventory must be sorted by ID');

for (const transfer of inventory.transfers) {
  for (const field of ['id', 'source', 'destination', 'transport', 'status']) {
    assert.equal(typeof transfer[field], 'string', `${transfer.id}: ${field} must be a string`);
    assert(transfer[field].length > 0, `${transfer.id}: ${field} must not be empty`);
  }
  assert(allowedStatuses.has(transfer.status), `${transfer.id}: unsupported status`);
  assert(Array.isArray(transfer.transferredFields), `${transfer.id}: transferredFields must be an array`);
  assert(Array.isArray(transfer.omittedFields), `${transfer.id}: omittedFields must be an array`);
  assert(Array.isArray(transfer.implementation) && transfer.implementation.length > 0, `${transfer.id}: implementation evidence is required`);
  if (transfer.status === 'v3') assert.equal(transfer.contractVersion, 3, `${transfer.id}: v3 contract version is required`);
  if (transfer.status === 'legacy-v1/v2') assert([1, 2].includes(transfer.legacyVersion), `${transfer.id}: legacy version is required`);
  if (transfer.status === 'not-applicable') assert.equal(typeof transfer.reason, 'string', `${transfer.id}: not-applicable reason is required`);

  for (const implementation of transfer.implementation) {
    assert(!implementation.path.includes('\\'), `${transfer.id}: use repository-relative POSIX paths`);
    const file = resolve(root, implementation.path);
    assert(existsSync(file), `${transfer.id}: missing implementation file ${implementation.path}`);
    assert(readFileSync(file, 'utf8').includes(implementation.evidence), `${transfer.id}: missing evidence in ${implementation.path}: ${implementation.evidence}`);
  }
}

for (const status of allowedStatuses) {
  assert(inventory.transfers.some((transfer) => transfer.status === status), `Inventory must include status ${status}`);
}

console.log(`Transfer inventory: ${inventory.transfers.length} handoffs/exports, all statuses and implementation evidence PASS.`);

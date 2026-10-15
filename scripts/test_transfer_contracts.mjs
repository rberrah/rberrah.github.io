import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TRANSFER_CONTRACT_VERSION, attachTransferContract, makeTransferContract, readTransferPayload, validateModelTransfer } from '../src/lib/transfers/contract.js';

const schema = JSON.parse(readFileSync(new URL('../src/lib/transfers/transfer-contract.schema.json', import.meta.url), 'utf8'));
assert.equal(schema.properties.version.const, TRANSFER_CONTRACT_VERSION);
assert(schema.required.every((field) => ['version', 'source', 'destination', 'transferredFields', 'units', 'route', 'compartment', 'schedule', 'omittedFields', 'transformations', 'limitations'].includes(field)));

const contract = makeTransferContract({
  source: 'pk-builder', destination: 'tdm', transferredFields: ['code', 'route', 'units'],
  units: { time: 'h', concentration: 'mg/L' }, omittedFields: ['observations'],
  transformations: ['diagram-to-mrgsolve'], limitations: ['no patient data']
});
const envelope = attachTransferContract({ code: '$ODE', route: 'IV' }, contract);
assert.equal(readTransferPayload(envelope).contract.version, 3);
assert.equal(readTransferPayload(envelope).contract.route, null);
assert.equal(readTransferPayload(envelope).contract.compartment, null);
assert.equal(readTransferPayload(envelope).contract.schedule, null);
assert.deepEqual(readTransferPayload(envelope).payload, { code: '$ODE', route: 'IV' });
assert.equal(readTransferPayload({ code: '$ODE' }).contract.version, 1, 'Legacy payloads must remain readable');
assert.equal(readTransferPayload({ code: '$ODE', _transferContract: { version: 1 } }).contract.version, 1);
assert.equal(readTransferPayload({ code: '$ODE', _transferContract: { version: 2 } }).contract.version, 2);
assert.throws(
  () => readTransferPayload({ code: '$ODE', _transferContract: { version: 999 } }),
  /unsupportedTransferContractVersion/
);

const valid = { route: 'IV', time_unit: 'h', concentration_unit: 'mg/L', administration: 'bolus',
  spec: { nodes: [{ name: 'CENT' }] }, outputs: ['DV'] };
const support = { routes: ['IV'], timeUnits: ['h'], concentrationUnits: ['mg/L'], administrations: ['bolus'],
  requiredCompartments: ['CENT'], outputs: ['DV'] };
assert.equal(validateModelTransfer(valid, support), true);

for (const [change, message] of [
  [{ route: 'Oral' }, 'routeIncompatible'],
  [{ time_unit: 'day' }, 'unitIncompatible:time'],
  [{ concentration_unit: 'ng/mL' }, 'unitIncompatible:concentration'],
  [{ administration: 'continuous' }, 'administrationUnsupported'],
  [{ spec: { nodes: [] } }, 'compartmentMissing'],
  [{ outputs: ['UNSUPPORTED'] }, 'outputNotRepresentable']
]) {
  assert.throws(() => validateModelTransfer({ ...valid, ...change }, support), new RegExp(message));
}

assert.throws(
  () => validateModelTransfer({ ...valid, administrations: [{}, {}] }, { ...support, maxAdministrations: 1 }),
  /multipleAdministrationsNotRepresentable/
);
assert.throws(
  () => validateModelTransfer({ ...valid, doseFractions: [0.3, 0.7] }, { ...support, preserveDoseFractions: false }),
  /doseFractionNotPreserved/
);
assert.throws(
  () => validateModelTransfer({ ...valid, pd: {} }, { ...support, requiresPkDriver: true }),
  /pdDriverMissing/
);
assert.equal(validateModelTransfer(
  { ...valid, administrations: [{}], doseFractions: [0.3, 0.7], pd: { driver: 'CENT/V' } },
  { ...support, maxAdministrations: 1, preserveDoseFractions: true, requiresPkDriver: true }
), true);

console.log('Transfer contracts: v1/v2 compatibility, v3 schema and all explicit negative cases PASS.');

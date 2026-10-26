import assert from 'node:assert/strict';
import {
  makeValidationData,
  splitValidationData,
  predictValidationRows,
  validationMetrics,
  runValidationStrategy
} from '../src/lib/science/validationSplitLab.js';

const data = makeValidationData();
assert.equal(data.length, 48, 'The fixed dataset must contain two visits for 24 patients');

for (const strategy of ['rows', 'patients', 'center']) {
  const { train, test, predictions, metrics } = runValidationStrategy(strategy);
  assert.equal(train.length + test.length, data.length, `${strategy}: every row must belong to one split`);
  assert.ok(train.every((row) => !test.includes(row)), `${strategy}: train and test rows must not overlap`);
  assert.ok(predictions.every((row) => Number.isFinite(row.predicted)), `${strategy}: predictions must be finite`);
  assert.ok(Number.isFinite(metrics.rmse) && Number.isFinite(metrics.bias), `${strategy}: metrics must be finite`);
  assert.ok(metrics.within20 >= 0 && metrics.within20 <= 100, `${strategy}: accuracy must be a percentage`);
}

const patientSplit = splitValidationData('patients', data);
assert.ok(patientSplit.test.every((row) => patientSplit.train.every((candidate) => candidate.patient !== row.patient)),
  'Patient validation must keep every visit from a held-out patient outside training');

const centerSplit = splitValidationData('center', data);
assert.ok(centerSplit.test.every((row) => row.center === 2) && centerSplit.train.every((row) => row.center !== 2),
  'External-center validation must hold the entire center out');

const rowResult = runValidationStrategy('rows');
const patientResult = runValidationStrategy('patients');
const centerResult = runValidationStrategy('center');
assert.ok(rowResult.predictions.filter((row) => row.neighborPatient === row.patient).length >= 0.9 * rowResult.predictions.length,
  'Row splitting should expose the intended repeated-patient resemblance in this demonstration');
assert.ok(rowResult.metrics.rmse < patientResult.metrics.rmse,
  'Random-row validation should be more optimistic than new-patient validation in this fixed example');
assert.ok(centerResult.metrics.rmse > rowResult.metrics.rmse,
  'External-center shift should be visible relative to the leaked row split');

const manual = predictValidationRows(patientSplit.train, patientSplit.test);
assert.deepEqual(validationMetrics(manual), patientResult.metrics, 'Metrics must be reproducible from predictions');
assert.throws(() => splitValidationData('unknown', data), /Unknown/);
assert.throws(() => predictValidationRows([], patientSplit.test), /nonempty/);

console.log('Validation-split teaching lab checks passed.');

import assert from 'node:assert/strict';
import {
  makeEnsembleLabData,
  buildRegressionTree,
  predictTree,
  fitEnsembleLab,
  ensembleRmse
} from '../src/lib/science/treeEnsembleLab.js';

const { train, test } = makeEnsembleLabData();
assert.deepEqual(makeEnsembleLabData(), { train, test }, 'The simulation must be reproducible');
assert.equal(train.length, 44);
assert.equal(test.length, 16);
assert.ok(test.every((p) => train.every((q) => p.x !== q.x)), 'Test coordinates must differ from training coordinates');

for (const [mode, max] of [['tree', 6], ['forest', 40], ['boost', 40]]) {
  for (const complexity of [1, 3, max]) {
    const model = fitEnsembleLab(mode, complexity, train);
    assert.ok([0, 3, 6, 10].every((x) => Number.isFinite(model.predict(x))), mode + ': predictions should be finite');
    assert.ok(Number.isFinite(ensembleRmse(model, train)), mode + ': train RMSE should be finite');
    assert.ok(Number.isFinite(ensembleRmse(model, test)), mode + ': holdout RMSE should be finite');
  }
}

const shallow = fitEnsembleLab('tree', 1, train);
const deep = fitEnsembleLab('tree', 6, train);
assert.ok(ensembleRmse(deep, train) <= ensembleRmse(shallow, train),
  'Additional CART depth should not worsen training fit');

const early = fitEnsembleLab('boost', 1, train);
const late = fitEnsembleLab('boost', 35, train);
assert.ok(ensembleRmse(late, train) < ensembleRmse(early, train),
  'Additional boosting rounds should improve this fixed training set');

const singleX = buildRegressionTree([{ x: 1, y: 2 }, { x: 1, y: 4 }], 6);
assert.equal(predictTree(singleX, 1), 3, 'Duplicate x values must produce a finite leaf');

const reference = fitEnsembleLab('forest', 20, train).predict(5);
const editedHoldout = test.map((p) => ({ ...p, y: p.y + 1000 }));
assert.equal(fitEnsembleLab('forest', 20, train).predict(5), reference,
  'The holdout must not influence fitting');
assert.ok(ensembleRmse(fitEnsembleLab('forest', 20, train), editedHoldout) > 900,
  'The holdout error must respond to held-out labels without refitting');
assert.throws(() => fitEnsembleLab('forest', 5, []), /Training set/);
assert.throws(() => fitEnsembleLab('unknown', 5, train), /Unknown/);
console.log('Experiential ensemble teaching lab checks passed.');

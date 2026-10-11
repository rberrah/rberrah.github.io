import assert from 'node:assert/strict';
import {
  calculateGofRows,
  calculatePkpdProfile,
  calculateShrinkage,
  combineVpcSummaries,
  fitLinearSvm,
  sampleSd,
  shrinkagePopulation,
  simulateAdaProfile,
  simulateVpcDataset,
  summarizeVpcDataset
} from '../src/lib/science/visualizationMath.js';

const design = { times: [0.5, 1, 2, 4, 8, 12, 24], subjects: 200, dose: 500 };
const baseModel = { cl: 5, v: 50, omegaCl: 0.3, omegaV: 0.2, prop: 0, add: 0 };
const lowCl = simulateVpcDataset(42, { ...baseModel, cl: 3 }, design).filter((row) => row.t === 24);
const highCl = simulateVpcDataset(42, { ...baseModel, cl: 8 }, design).filter((row) => row.t === 24);
assert.ok(highCl.reduce((sum, row) => sum + row.c, 0) < lowCl.reduce((sum, row) => sum + row.c, 0), 'Higher CL must lower late VPC concentrations');

const lowOmega = simulateVpcDataset(42, { ...baseModel, omegaCl: 0.05, omegaV: 0 }, design).filter((row) => row.t === 24);
const highOmega = simulateVpcDataset(42, { ...baseModel, omegaCl: 0.6, omegaV: 0 }, design).filter((row) => row.t === 24);
assert.ok(sampleSd(highOmega.map((row) => Math.log(row.c))) > sampleSd(lowOmega.map((row) => Math.log(row.c))), 'Higher omega CL must widen late concentrations');

const observedVpc = summarizeVpcDataset(simulateVpcDataset(1, baseModel, design), 6, design.times);
const replicateVpc = [2, 3, 4, 5, 6].map((seed) => summarizeVpcDataset(simulateVpcDataset(seed, baseModel, design), 6, design.times));
const combinedVpc = combineVpcSummaries(observedVpc, replicateVpc);
assert.equal(combinedVpc.length, 6, 'VPC summaries must preserve the requested bins');
assert.ok(combinedVpc.every((row) => row.modelP50.low <= row.modelP50.mid && row.modelP50.mid <= row.modelP50.high), 'VPC simulation intervals must remain ordered');

const population = shrinkagePopulation(20261010, 100);
const sparse = calculateShrinkage({ ...population, omega: 0.3, samples: 1, residualSd: 0.8 });
const rich = calculateShrinkage({ ...population, omega: 0.3, samples: 12, residualSd: 0.8 });
assert.ok(rich.shrinkage < sparse.shrinkage, 'More individual samples must reduce shrinkage in the teaching model');

const gofBase = Array.from({ length: 48 }, (_, index) => ({ tru: 3 + 2 * index, g: 0 }));
const noBias = calculateGofRows(gofBase, 0, 0.2, 100);
const biased = calculateGofRows(gofBase, 1, 0.2, 100);
assert.ok(biased.at(-1).residualProxy > noBias.at(-1).residualProxy, 'Imposed high-value underprediction must raise the residual proxy');

const ada = simulateAdaProfile({ theta: 3, onset: 6, V: 5, CL0: 0.5, dose: 300, tau: 2, T: 20, dt: 0.02 });
assert.equal(ada.troughs.length, 9, 'Only pre-dose troughs strictly before the horizon are retained');
for (const trough of ada.troughs) {
  const postDose = ada.points.find((point) => Math.abs(point.t - trough.t) < 1e-9);
  assert.ok(Math.abs(postDose.C - trough.C - 60) < 1e-9, 'A trough must be captured before the new dose');
}

const pkpd = calculatePkpdProfile({ dose: 750, mic: 2, tau: 8, V: 20, ke: 0.35, T: 24, dt: 0.05, fu: 0.6, basis: 'total' });
assert.deepEqual(pkpd.doseTimes, [0, 8, 16], 'The dose at the right-open 24 h boundary must be excluded');
const expectedAuc = pkpd.doseTimes.reduce((sum, time) => sum + (750 / 20) * (1 - Math.exp(-0.35 * (24 - time))) / 0.35, 0);
assert.ok(Math.abs(pkpd.auc - expectedAuc) < 1e-10, 'AUC0-24 must equal the analytical repeated-bolus AUC');
assert.ok(pkpd.pctTime >= 0 && pkpd.pctTime <= 100, 'Time above MIC must remain within the 24 h window');
const freePkpd = calculatePkpdProfile({ dose: 750, mic: 2, tau: 8, V: 20, ke: 0.35, T: 24, dt: 0.05, fu: 0.6, basis: 'free' });
assert.ok(Math.abs(freePkpd.auc - 0.6 * pkpd.auc) < 1e-10 && freePkpd.timeAbove < pkpd.timeAbove, 'Free indices must use fu times total concentration');

const svmPoints = [
  { x: 2, y: 8, c: 1 }, { x: 3, y: 7, c: 1 }, { x: 8, y: 2, c: -1 }, { x: 7, y: 3, c: -1 }
];
const svm = fitLinearSvm(svmPoints, 2);
assert.ok(svmPoints.every((point) => point.c * svm.score(point) > 0), 'The fitted linear SVM must separate a linearly separable teaching set');

console.log('Scientific visualization calculations: PASS');

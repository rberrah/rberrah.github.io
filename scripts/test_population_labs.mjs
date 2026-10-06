import assert from 'node:assert/strict';
import {
  populationDefaults, samplingDefaults, validatePopulation, validateSampling,
  virtualPopulation, populationAt, populationSeries, syntheticSamples,
  clearancePosterior, concentrationAt
} from '../src/lib/labs/population.js';

const close = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);

for (const changes of [{}, { omegaCl: 0, omegaV: 0, sigma: 0 }, { omegaCl: 1, omegaV: 1, sigma: 0.8, count: 120, end: 168 }, { cl: 0.1, v: 150 }, { cl: 30, v: 5 }]) {
  const parameters = validatePopulation({ ...populationDefaults, ...changes });
  const subjects = virtualPopulation(parameters), repeated = virtualPopulation(parameters);
  assert.deepEqual(subjects, repeated);
  assert.equal(subjects.length, parameters.count);
  const rows = populationAt(parameters, parameters.end / 2), curve = populationSeries(parameters);
  assert.equal(rows.length, parameters.count); assert.equal(curve.length, 161);
  assert.ok(rows.every(row => Object.values(row).every(Number.isFinite) && row.concentration >= 0 && row.observed >= 0));
  assert.ok(curve.every((row, index) => Object.values(row).every(Number.isFinite) && row.q10 <= row.median && row.median <= row.q90 && (!index || row.time > curve[index - 1].time)));
  if (!parameters.omegaCl && !parameters.omegaV) {
    assert.ok(rows.every(row => row.cl === parameters.cl && row.v === parameters.v));
    close(curve[50].q10, curve[50].q90);
  }
  if (!parameters.sigma) rows.forEach(row => close(row.observed, row.concentration));
}

for (const sampleCount of [1, 2]) {
  const parameters = validateSampling({ ...samplingDefaults, sampleCount });
  const samples = syntheticSamples(parameters);
  assert.equal(samples.length, sampleCount);
  assert.ok(samples.every(sample => sample.time <= parameters.end && sample.observed > 0));
  const prior = clearancePosterior(parameters, 0), first = clearancePosterior(parameters, parameters.t1), all = clearancePosterior(parameters, Infinity);
  assert.equal(prior.samples.length, 0); assert.equal(first.samples.length, 1); assert.equal(all.samples.length, sampleCount);
  for (const posterior of [prior, first, all]) {
    assert.ok(posterior.lower > 0 && posterior.lower <= posterior.median && posterior.median <= posterior.upper);
    assert.ok(posterior.grid.every(row => Number.isFinite(row.clearance) && Number.isFinite(row.density) && Number.isFinite(row.prior)));
  }
  assert.ok(first.upper - first.lower < prior.upper - prior.lower);
  if (sampleCount === 2) assert.ok(all.upper - all.lower < first.upper - first.lower);
}

const noError = validateSampling({ ...samplingDefaults, sigma: 0.01, t1: 1, t2: 8 });
const posterior = clearancePosterior(noError, Infinity);
assert.ok(Math.abs(posterior.map - noError.trueCl) / noError.trueCl < 0.08);
close(concentrationAt(noError, 0), noError.dose / noError.v);
assert.throws(() => validatePopulation({ ...populationDefaults, count: 12.5 }));
assert.throws(() => validatePopulation({ ...populationDefaults, sigma: 2 }));
assert.throws(() => validateSampling({ ...samplingDefaults, t2: 30 }));
assert.throws(() => validateSampling({ ...samplingDefaults, patient: 1 }));

console.log('Population laboratories: deterministic subjects, variability, residual error, sampling and one-parameter MAP posterior passed.');

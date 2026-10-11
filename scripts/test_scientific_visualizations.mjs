import assert from 'node:assert/strict';
import { concTwoComp } from '../src/lib/utils/math.js';
import {
  calculateGofRows,
  calculatePkpdProfile,
  calculateShrinkage,
  combineVpcSummaries,
  emaxEffect,
  estimateOneCompartmentMapClearance,
  fitLinearSvm,
  infusionConcentration,
  parentMetaboliteConcentrations,
  repeatedBolusConcentration,
  repeatedBolusSummary,
  sampleSd,
  shrinkagePopulation,
  simulateAdaProfile,
  simulateMyelosuppression,
  simulateTumorGrowth,
  simulateVpcDataset,
  summarizeVpcDataset
} from '../src/lib/science/visualizationMath.js';

const close = (actual, expected, tolerance, message) => assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected}`);
const integrate = (fn, end, step) => {
  let area = 0;
  for (let t = 0; t < end; t += step) area += 0.5 * (fn(t) + fn(t + step)) * step;
  return area;
};

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
const negativeShrinkage = calculateShrinkage({ omega: 0.3, samples: 1, residualSd: 0, trueZ: [-2, 2], noiseZ: [0, 0] });
assert.ok(negativeShrinkage.shrinkage < 0, 'The SD-based shrinkage definition must allow negative values');

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

const twoComp = { dose: 150, cl: 6, q: 8, v1: 15, v2: 40 };
close(concTwoComp(0, twoComp.dose, twoComp.cl, twoComp.q, twoComp.v1, twoComp.v2), twoComp.dose / twoComp.v1, 1e-12, 'Two-compartment C(0) must equal Dose/V1');
assert.ok([0, 1, 6, 24, 72].every((t) => concTwoComp(t, twoComp.dose, twoComp.cl, twoComp.q, twoComp.v1, twoComp.v2) > 0), 'Two-compartment concentrations must remain positive');
const twoCompAuc = integrate((t) => concTwoComp(t, twoComp.dose, twoComp.cl, twoComp.q, twoComp.v1, twoComp.v2), 500, 0.01);
close(twoCompAuc, twoComp.dose / twoComp.cl, 0.01, 'Complete two-compartment AUC must equal Dose/CL');

const infusion = { rate: 30, cl: 5, v: 35, duration: 8 };
const infusionKe = infusion.cl / infusion.v;
const expectedStop = (infusion.rate / infusion.cl) * (1 - Math.exp(-infusionKe * infusion.duration));
close(infusionConcentration(infusion.duration, infusion), expectedStop, 1e-12, 'Infusion concentration at Tinf must follow the analytical solution');
const infusionAuc = integrate((t) => infusionConcentration(t, infusion), 500, 0.01);
close(infusionAuc, (infusion.rate * infusion.duration) / infusion.cl, 0.01, 'Complete infusion AUC must equal total dose/CL');
close((Math.log(10) / infusionKe) / (Math.log(2) / infusionKe), Math.log(10) / Math.log(2), 1e-12, 'Infusion t90 must equal about 3.322 half-lives');

const repeated = { dose: 100, cl: 5, v: 35, tau: 8 };
const repeatedSummary = repeatedBolusSummary(repeated);
close(repeatedSummary.accumulationRatio, 1 / (1 - Math.exp(-(repeated.cl / repeated.v) * repeated.tau)), 1e-12, 'Repeated-dose accumulation ratio must be analytical');
close(repeatedBolusConcentration(0, { ...repeated, loading: true }), repeatedSummary.cMaxSs, 1e-12, 'Analytical loading dose must start at steady-state peak');
close(repeatedBolusConcentration(repeated.tau - 1e-6, { ...repeated, loading: true }), repeatedSummary.cMinSs, 1e-6, 'Loaded first interval must approach the steady-state trough');

for (const rates of [{ parentRate: 0.2, metaboliteRate: 0.1 }, { parentRate: 0.1, metaboliteRate: 0.3 }]) {
  const input = { ...rates, fraction: 0.6, dose: 100, volume: 10 };
  assert.ok([0.1, 1, 12, 48].every((t) => {
    const result = parentMetaboliteConcentrations(t, input);
    return result.parent > 0 && result.metabolite > 0;
  }), 'Parent and metabolite concentrations must remain positive');
  const c1 = parentMetaboliteConcentrations(120, input).metabolite;
  const c2 = parentMetaboliteConcentrations(160, input).metabolite;
  close(-(Math.log(c2) - Math.log(c1)) / 40, Math.min(rates.parentRate, rates.metaboliteRate), 1e-5, 'Metabolite terminal slope must approach the slower rate');
}

for (const hill of [0.5, 1, 2, 5]) {
  close(emaxEffect(20, { baseline: 5, maximum: 100, ec50: 20, hill }), 55, 1e-12, 'Effect at EC50 must equal E0 + Emax/2 for every Hill coefficient');
}

const trueCl = 10;
const tdmInput = { dose: 300, volume: 40, time: 6, observed: (300 / 40) * Math.exp(-(trueCl / 40) * 6), populationCl: 5, omega: 0.4 };
const dataWeightedCl = estimateOneCompartmentMapClearance({ ...tdmInput, sigma: 0.03 });
const priorWeightedCl = estimateOneCompartmentMapClearance({ ...tdmInput, sigma: 3 });
assert.ok(Math.abs(dataWeightedCl - trueCl) < Math.abs(priorWeightedCl - trueCl), 'Low residual error must give more weight to the observation');
assert.ok(Math.abs(priorWeightedCl - tdmInput.populationCl) < Math.abs(dataWeightedCl - tdmInput.populationCl), 'High residual error must pull the MAP estimate toward CLpop');

const untreatedMarrow = simulateMyelosuppression({ dose: 0, mtt: 120, gamma: 0.17 });
assert.ok(untreatedMarrow.every((point) => Math.abs(point.Circ - 5) < 1e-12), 'Zero dose must keep the Friberg baseline stable');
const treatedMarrow = simulateMyelosuppression({ dose: 100, mtt: 120, gamma: 0.17 });
const marrowNadir = treatedMarrow.reduce((lowest, point) => point.Circ < lowest.Circ ? point : lowest);
assert.ok(marrowNadir.t > treatedMarrow[0].t, 'The myelosuppression nadir must occur after the plasma peak');

const untreatedTumor = simulateTumorGrowth({ exposurePercent: 0, growth: 0.035, resistance: 0.02 });
const tumorSteps = untreatedTumor.length - 1;
close(untreatedTumor.at(-1).ts, 60 * (1 + 0.035 * 0.1) ** tumorSteps, 1e-8, 'Zero-exposure tumor growth must follow the displayed exponential Euler model');

console.log('Scientific visualization calculations: PASS');

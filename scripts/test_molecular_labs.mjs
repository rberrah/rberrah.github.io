import assert from 'node:assert/strict';
import {
  decodeMolecularScenario,
  encodeMolecularScenario,
  molecularLabIds,
  molecularLabs,
  molecularSeries,
  molecularStateAt,
  validateMolecularParameters
} from '../src/lib/labs/molecular.js';

const close = (actual, expected, tolerance = 2e-5) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `${actual} != ${expected}`
  );
};

for (const lab of molecularLabIds) {
  const config = molecularLabs[lab];
  const parameters = validateMolecularParameters(lab, config.defaults);
  const rows = molecularSeries(lab, parameters);

  assert.ok(rows.length >= 481, `${lab}: output grid is incomplete`);
  close(rows[0].t, 0);
  close(rows.at(-1).t, parameters.end);

  let previousAuc = -Infinity;
  let previousAdministered = -Infinity;
  for (const row of rows) {
    const values = [row.t, row.c, row.secondary, row.auc, row.administered, ...Object.values(row.mass), ...Object.values(row.flows)];
    assert.ok(values.every(value => Number.isFinite(value) && value >= -1e-8), `${lab}: non-finite or negative result`);
    assert.ok(row.auc >= previousAuc - 1e-8, `${lab}: AUC must be monotone`);
    assert.ok(row.administered >= previousAdministered - 1e-8, `${lab}: administered amount must be monotone`);
    close(Object.values(row.mass).reduce((sum, value) => sum + value, 0), row.administered);
    previousAuc = row.auc;
    previousAdministered = row.administered;
  }

  const middle = molecularStateAt(rows, parameters.end / 2);
  assert.ok(middle && Number.isFinite(middle.c) && Number.isFinite(middle.secondary));

  const encoded = encodeMolecularScenario(lab, parameters, parameters);
  assert.deepEqual(decodeMolecularScenario(encoded), { lab, parameters, reference: parameters });
}

const parent = molecularSeries('parent-metabolite', molecularLabs['parent-metabolite'].defaults);
assert.ok(parent.some(row => row.metabolite > 0));
const fasterParent = molecularSeries('parent-metabolite', { ...molecularLabs['parent-metabolite'].defaults, kmet: 0.4 });
assert.ok(molecularStateAt(fasterParent, 2).metabolite > molecularStateAt(parent, 2).metabolite);

const longActingDefaults = molecularLabs['long-acting'].defaults;
const longActing = molecularSeries('long-acting', longActingDefaults);
close(longActing.at(-1).administered, longActingDefaults.dose * longActingDefaults.count);
assert.equal(longActing.filter(row => row.t === longActingDefaults.tau).length, 2);
close(molecularStateAt(longActing, longActingDefaults.tau - .001).administered, longActingDefaults.dose);
close(molecularStateAt(longActing, longActingDefaults.tau).administered, 2 * longActingDefaults.dose);
close(
  molecularStateAt(longActing, longActingDefaults.tau).depot - longActing.find(row => row.t === longActingDefaults.tau).depot,
  longActingDefaults.dose
);
const slowerRelease = molecularSeries('long-acting', { ...longActingDefaults, krel: 0.03 });
const peak = rows => rows.reduce((best, row) => row.c > best.c ? row : best, rows[0]);
assert.ok(peak(slowerRelease).c < peak(longActing).c);
assert.ok(peak(slowerRelease).t > peak(longActing).t);

const saturableDefaults = molecularLabs.saturable.defaults;
const saturable = molecularSeries('saturable', saturableDefaults);
const doubleDose = molecularSeries('saturable', { ...saturableDefaults, dose: saturableDefaults.dose * 2 });
assert.ok(doubleDose.at(-1).auc / saturable.at(-1).auc > 2, 'Saturable elimination must produce supra-proportional exposure');

const enterohepatic = molecularSeries('enterohepatic', molecularLabs.enterohepatic.defaults);
assert.ok(enterohepatic.some(row => row.bile > 0 && row.gut > 0 && row.flows.reabsorb > 0));

const tmdd = molecularSeries('tmdd', molecularLabs.tmdd.defaults);
assert.ok(tmdd.some(row => row.complex > 0 && row.secondary > 0));

const effectSite = molecularSeries('effect-site', molecularLabs['effect-site'].defaults);
assert.ok(peak(effectSite.map(row => ({ ...row, c: row.secondary }))).t > peak(effectSite).t, 'Effect peak must lag behind plasma after an IV bolus');

const generalPd = molecularSeries('pd-general', molecularLabs['pd-general'].defaults);
assert.ok(peak(generalPd.map(row => ({ ...row, c: row.secondary }))).t > peak(generalPd).t, 'Biological response must lag behind plasma concentration');
assert.ok(generalPd.every(row => row.occupancyPct >= 0 && row.occupancyPct <= 100 + 1e-8));
const directPd = molecularSeries('pd-general', { ...molecularLabs['pd-general'].defaults, model: 1 });
assert.ok(peak(directPd.map(row => ({ ...row, c: row.secondary }))).t <= peak(generalPd.map(row => ({ ...row, c: row.secondary }))).t);

const oncologyDefaults = molecularLabs['pd-oncology'].defaults;
const oncology = molecularSeries('pd-oncology', oncologyDefaults);
assert.ok(oncology.at(-1).untreated > oncology.at(-1).secondary, 'Treatment curve must differ from untreated growth');
assert.equal(oncology.filter(row => row.t === oncologyDefaults.tau).length, 2);
assert.ok(oncology.at(-1).resistantPct > oncology[0].resistantPct, 'Resistant fraction must emerge progressively');
const resistantOncology = molecularSeries('pd-oncology', { ...oncologyDefaults, resistance: 0.06 });
assert.ok(resistantOncology.at(-1).secondary > oncology.at(-1).secondary, 'Faster resistance must impair late tumor control');

const infectionDefaults = molecularLabs['pd-infectiology'].defaults;
const infection = molecularSeries('pd-infectiology', infectionDefaults);
assert.ok(infection.some(row => row.c >= row.mic) && infection.some(row => row.c < row.mic));
assert.ok(infection.at(-1).secondary < infection[0].secondary, 'Default antibiotic exposure must reduce bacterial burden');
const fasterGrowth = molecularSeries('pd-infectiology', { ...infectionDefaults, growth: 0.4 });
assert.ok(fasterGrowth.at(-1).secondary > infection.at(-1).secondary, 'Faster bacterial growth must increase burden at unchanged exposure and killing');
const sparseInfection = molecularSeries('pd-infectiology', { ...infectionDefaults, dose: 100, tau: 8, count: 3 });
const frequentInfection = molecularSeries('pd-infectiology', { ...infectionDefaults, dose: 100, tau: 4, count: 6 });
assert.ok(frequentInfection.at(-1).above / frequentInfection.at(-1).t > sparseInfection.at(-1).above / sparseInfection.at(-1).t, 'More frequent dosing over the horizon must increase time above MIC');

const covariateDefaults = molecularLabs['covariate-volume'].defaults;
const referenceWeight = molecularSeries('covariate-volume', covariateDefaults);
const heavier = molecularSeries('covariate-volume', { ...covariateDefaults, weight: 110 });
assert.ok(heavier[0].volume > referenceWeight[0].volume);
assert.ok(peak(heavier).c < peak(referenceWeight).c, 'A larger weight-scaled volume must lower peak concentration at the same dose');

const clearanceDefaults = molecularLabs['covariate-clearance'].defaults;
const referenceGfr = molecularSeries('covariate-clearance', clearanceDefaults);
const lowerGfr = molecularSeries('covariate-clearance', { ...clearanceDefaults, gfr: 30 });
const higherGfr = molecularSeries('covariate-clearance', { ...clearanceDefaults, gfr: 120 });
assert.ok(higherGfr[0].clearance > lowerGfr[0].clearance);
assert.ok(molecularStateAt(higherGfr, 6).c < molecularStateAt(lowerGfr, 6).c, 'Higher GFR-dependent clearance must lower concentration after the same IV dose');
assert.ok(higherGfr.at(-1).auc < lowerGfr.at(-1).auc, 'Higher GFR-dependent clearance must lower exposure');

for (const invalid of [
  'lab=unknown&mv=1',
  'lab=tmdd&mv=1&dose=NaN',
  'lab=tmdd&mv=1&dose=',
  'lab=tmdd&mv=1&dose=1&dose=2',
  'lab=effect-site&mv=1&ke0=-1',
  'lab=saturable&mv=1&code=abc'
]) assert.throws(() => decodeMolecularScenario(invalid));

assert.throws(() => validateMolecularParameters('long-acting', { count: 1.5 }));
assert.throws(() => validateMolecularParameters('tmdd', { patient: 1 }));

console.log(`Animated molecular laboratories: ${molecularLabIds.length} models, ODE outputs, mass balance, mechanisms and share validation OK.`);

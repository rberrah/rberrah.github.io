import assert from 'node:assert/strict';
import { parseModelCode } from '../src/lib/lego/mlxtran.js';
import { exportPmetrics } from '../src/lib/lego/pmetrics.js';

// Syntax and input numbering from the official Pmetrics 3 model tutorial:
// https://lapkb.github.io/PM_tutorial/models.html
const iv = `#PRI
Ke, 0.1, 0.3
V, 20, 40
#EQN
dX[1] = B[1] + R[1] - Ke*X[1]
#OUT
Y[1] = X[1]/V
#ERR
G=1!
0,0.1,0,0`;
const parse = code => parseModelCode(code, 'pmetrics');
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
const central = result => result.spec.nodes.find(n => n.kind === 'central');
const elimination = result => result.spec.edges.find(e => e.to === 'OUT');
const basic = parse(iv);
near(central(basic).vol, 30);
near(elimination(basic).cl, 6);
assert.equal(basic.spec.nodes.length, 1);
assert.ok(basic.warnings.some(w => w.code === 'pmetricsRanges'));
const infusion = parse(iv.replace('B[1] + R[1]', 'RATEIV[2]'));
assert.equal(central(infusion).inputType, 'zero_order');
assert.equal(central(infusion).inputDuration, 1);
assert.ok(infusion.warnings.some(w => w.detail?.includes('INPUT=2')));
near(elimination(parse(iv.replace('dX[1]', 'XP(1)').replaceAll('X[1]', 'X(1)'))).cl, 6);

const oral = `library(Pmetrics)
mod <- PM_model$new(
  pri = list(CL0 = ab(3, 7), V0 = msd(30, 5), Ka = ab(0.8, 1.2), Q = ab(1, 3), Vp = msd(40, 4), Lag1 = ab(0.2, 0.6)),
  cov = list(WT = interp(), CYP = interp("none")),
  sec = function() {
    CL = CL0 * (WT/70)^0.75 * exp(0.3 * (CYP == 1))
    V = V0 * (WT/70)
  },
  lag = function() { LAG[1] = Lag1 },
  eqn = function() {
    dX[1] <- B[1] - Ka*X[1]
    dX[2] <- R[1] + Ka*X[1] - CL*X[2]/V - Q*X[2]/V + Q*X[3]/Vp
    dX[3] <- Q*X[2]/V - Q*X[3]/Vp
  },
  out = function() { Y[1] = X[2]/V },
  err = list(proportional(1, c(0, 0.1, 0, 0), fixed = TRUE))
)`;
const imported = parse(oral);
assert.equal(imported.spec.nodes.length, 3);
assert.equal(imported.spec.edges.length, 4);
near(central(imported).vol, 30);
near(elimination(imported).cl, 5);
near(imported.spec.nodes.find(n => n.dose > 0).tlag, 0.4);
near(parse(oral.replace('Vp = msd(40, 4)', 'Vp = msd(80, 4)')).spec.nodes.find(n => n.name === 'PM3').vol, 80);
assert.equal(imported.spec.covariates.filter(c => c.name.toLowerCase() === 'wt').length, 3); // CL, V and k to peripheral
assert.ok(imported.spec.covariates.some(c => c.type === 'categorical'));
// Check fluxes away from reference covariates, not just the diagram topology.
for (const wt of [40, 70, 110]) for (const cyp of [0, 1]) {
  const cov = { wt, cyp };
  const adjusted = (target, base) => imported.spec.covariates.filter(c => c.target === target).reduce((v, c) => v * (
    c.type === 'categorical' ? Math.exp(c.beta * Number(cov[c.name.toLowerCase()] === c.comparison))
      : (cov[c.name.toLowerCase()] / c.reference) ** c.beta
  ), base);
  const amounts = [80, 50, 20], derivatives = [0, 0, 0];
  for (const e of imported.spec.edges) {
    const from = imported.spec.nodes.find(n => n.id === e.from);
    const to = imported.spec.nodes.find(n => n.id === e.to);
    const i = imported.spec.nodes.indexOf(from);
    const flux = e.eliminationParameterization === 'clearance'
      ? adjusted(`cl_${from.name}`, e.cl) * amounts[i] / adjusted(`v_${from.name}`, from.vol)
      : adjusted(`k_${from.name}_${to?.name ?? 'e'}`, e.k) * amounts[i];
    derivatives[i] -= flux;
    if (to) derivatives[imported.spec.nodes.indexOf(to)] += flux;
  }
  const v = 30 * wt / 70, cl = 5 * (wt / 70) ** 0.75 * Math.exp(0.3 * cyp);
  [-80, 80 - (cl + 2) * 50 / v + 2 * 20 / 40, 2 * 50 / v - 2 * 20 / 40].forEach((value, i) => near(derivatives[i], value));
}
const saturable = parse(iv.replace('Ke, 0.1, 0.3', 'VM, 8, 12\nKM, 4, 6').replace('Ke*X[1]', 'VM*X[1]/(KM+X[1])'));
assert.equal(elimination(saturable).kinetics, 'michaelis_menten');
near(elimination(saturable).vmax, 10);
near(elimination(saturable).km, 5);
const implicit = parse(iv.replace('dX[1] = B[1] + R[1] - Ke*X[1]', 'one_comp_iv'));
near(elimination(implicit).cl, 6);
assert.equal(central(implicit).inputType, 'zero_order');
near(elimination(parse(iv.replace('#EQN\ndX[1] = B[1] + R[1] - Ke*X[1]\n', ''))).cl, 6);
const legacyOral = parse(iv.replace('#EQN\ndX[1] = B[1] + R[1] - Ke*X[1]\n', '').replace('V, 20, 40', 'V, 20, 40\nKA, 0.8, 1.2\nKCP, 0.1, 0.3\nKPC, 0.1, 0.3').replace('Y[1] = X[1]/V', 'Y[1] = X[2]/V'));
assert.equal(legacyOral.spec.nodes.length, 3);
assert.ok(legacyOral.warnings.some(w => w.code === 'pmetricsVolumes'));
near(elimination(legacyOral).cl, 6);
near(elimination(parse(iv.replace('Ke, 0.1, 0.3', 'Ke'))).cl, 30);
assert.ok(parse(iv.replace('Ke, 0.1, 0.3', 'Ke')).warnings.some(w => w.code === 'populationDefaults'));

// Complete models reproduced from the official NPAG and NPAG_cov tutorials.
const tutorialModel = `library(Pmetrics)
mod1 <- PM_model$new(
  pri = list(
    Ka = ab(0.1, 0.9), Ke = ab(0.001, 0.1), K23 = ab(0, 5),
    K32 = ab(0, 5), V = ab(30, 120), lag1 = ab(0, 4)
  ),
  cov = list(
    wt = interp(), africa = interp("none"), age = interp(),
    gender = interp("none"), height = interp()
  ),
  eqn = function(){ two_comp_bolus },
  lag = function(){ lag[1] = lag1 },
  out = function(){ Y[1] = X[2]/V },
  err = list(proportional(5, c(0.02, 0.05, -0.0002, 0)))
)`;
const tutorialBase = parse(tutorialModel);
assert.equal(tutorialBase.spec.nodes.length, 3);
assert.equal(tutorialBase.spec.nodes.find(n => n.dose > 0).inputType, 'bolus');
near(tutorialBase.spec.nodes.find(n => n.dose > 0).tlag, 2);
near(central(tutorialBase).vol, 75);
near(elimination(tutorialBase).cl, 75 * 0.0505);

const tutorialCov = parse(tutorialModel
  .replace('V = ab(30, 120)', 'V0 = ab(30, 120)')
  .replace('out = function(){ Y[1] = X[2]/V }', 'out = function(){ V = V0 * (wt/70)\nY[1] = X[2]/V }'));
assert.ok(tutorialCov.spec.covariates.some(c => c.name.toLowerCase() === 'wt' && c.target === 'v_PM2'));

const tutorialThree = parse(tutorialModel
  .replace('K23 = ab(0, 5),\n    K32 = ab(0, 5), V = ab(30, 120)', 'K23 = ab(0.001, 0.5), K24 = ab(0.001, 0.5),\n    K32 = ab(0.001, 0.5), K42 = ab(0.001, 0.5), V = ab(30, 120)')
  .replace('two_comp_bolus', 'three_comp_bolus'));
assert.equal(tutorialThree.spec.nodes.length, 4);
assert.equal(tutorialThree.spec.edges.filter(e => e.to !== 'OUT').length, 5);

const libraryCases = [
  ['one_comp_iv', ['Ke', 'V'], 1, 1, 'V', 'zero_order'],
  ['one_comp_iv_cl', ['CL', 'V'], 1, 1, 'V', 'zero_order'],
  ['one_comp_bolus', ['Ka', 'Ke', 'V'], 2, 2, 'V', 'bolus'],
  ['one_comp_bolus_cl', ['Ka', 'CL', 'V'], 2, 2, 'V', 'bolus'],
  ['two_comp_iv', ['Ke', 'K12', 'K21', 'V'], 2, 1, 'V', 'zero_order'],
  ['two_comp_iv_cl', ['CL', 'Q', 'V1', 'V2'], 2, 1, 'V1', 'zero_order'],
  ['two_comp_bolus', ['Ka', 'Ke', 'K23', 'K32', 'V'], 3, 2, 'V', 'bolus'],
  ['two_comp_bolus_cl', ['Ka', 'CL', 'Q', 'V2', 'V3'], 3, 2, 'V2', 'bolus'],
  ['three_comp_iv', ['Ke', 'K12', 'K13', 'K21', 'K31', 'V'], 3, 1, 'V', 'zero_order'],
  ['three_comp_iv_cl', ['CL', 'Q2', 'Q3', 'V1', 'V2', 'V3'], 3, 1, 'V1', 'zero_order'],
  ['three_comp_bolus', ['Ka', 'Ke', 'K23', 'K24', 'K32', 'K42', 'V'], 4, 2, 'V', 'bolus'],
  ['three_comp_bolus_cl', ['Ka', 'CL', 'Q3', 'Q4', 'V2', 'V3', 'V4'], 4, 2, 'V2', 'bolus']
];
for (const [token, names, count, observed, volume, route] of libraryCases) {
  const model = `PM_model$new(
    pri = list(${names.map((name, i) => `${name} = ab(${i + 1}, ${i + 2})`).join(', ')}),
    eqn = function(){ ${token} },
    out = function(){ Y[1] = X[${observed}]/${volume} },
    err = list(proportional(1, c(0, 0.1, 0, 0)))
  )`;
  const result = parse(model);
  assert.equal(result.spec.nodes.length, count, token);
  assert.equal(central(result).inputType, route, token);
}
assert.equal(parse(tutorialModel.replace('two_comp_bolus', 'advan4_trans1')).spec.nodes.length, 3);

// No silent loss of an unsupported output, condition, input or initial state.
for (const invalid of [
  iv.replace('Ke*X[1]', 'UNKNOWN*X[1]'),
  iv.replace('B[1]', '0.5*B[1]'),
  iv.replace('B[1]', '-B[1]'),
  iv.replace('B[1]', 'B[1]+B[1]'),
  iv.replace('X[1]/V', 'log(X[1]/V)'),
  iv.replace('Y[1] = X[1]/V', 'Y[1] = X[1]/V\nY[2] = X[1]'),
  `${iv}\n#INI\nX[1] = 50`,
  `${iv}\n#FA\nFA[1] = 0.7`,
  `${iv}\n#EXTRA\nCALL something`,
  `${iv}\n#SEC\nif (Ke > 0.1) { Ke = 0.2 }`,
  iv.replace('Ke, 0.1, 0.3', 'Ke, 0.3, 0.1'),
  iv.replace('V, 20, 40', 'Ke, 20, 40'),
  oral.replace('CYP = interp("none")', 'WT = interp()'),
  oral.replace('ab(3, 7)', 'system("something")'),
  oral.replace('ab(3, 7)', 'ab(3, 7'),
  ''
]) assert.throws(() => parse(invalid), undefined, invalid);

const spec = {
  version: 3,
  nodes: [{ id: 1, kind: 'central', name: 'Central', vol: 30, dose: 100, inputType: 'bolus', tlag: 0 }],
  edges: [{ from: 1, to: 'OUT', kinetics: 'first_order', k: 0.2 }], covariates: [],
  population: { iivVariances: { k_Central_e: 0.1 }, residualError: { type: 'proportional', proportional: 0.15, additive: 0 } }
};
const config = { spec, parameters: [{ name: 'k_Central_e', value: 0.2 }, { name: 'v_Central', value: 30 }], secondary: ['k_Central_e = TV_k_Central_e', 'v_Central = TV_v_Central'], equations: { Central: '-k_Central_e * Central' }, observed: 'Central' };
const exported = exportPmetrics(config);
assert.equal(exported.issue, '');
assert.match(exported.code, /proportional\(1, c\(0, 0.15, 0, 0\), fixed = TRUE\)/);
assert.deepEqual(parse(exported.code).spec, spec);
near(central(parse(exported.code.replace('msd(30, 0)', 'msd(60, 0)'))).vol, 60);
// Read the actual equations without relying on our embedded round-trip metadata.
const native = exported.code.split('\n').filter(l => !l.startsWith('#')).join('\n').split('\n\n')[0];
near(elimination(parse(native)).cl, 6);
const combined = exportPmetrics({ ...config, spec: { ...spec, population: { residualError: { type: 'combined', additive: 0.1, proportional: 0.2 } } } });
assert.equal(combined.issue, 'pmetricsCombinedError');
assert.match(combined.code, /err = NULL/);
assert.equal(exportPmetrics({ ...config, spec: { ...spec, nodes: [...spec.nodes, { id: 2, kind: 'depot', name: 'Depot', dose: 100 }] } }).issue, 'pmetricsExportUnsupported');
console.log('Pmetrics: text/R import, covariates, dosing guards, structural export and native round trips OK.');

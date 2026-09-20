import assert from 'node:assert/strict';
import { ddiEquilibrium, ddiStepResponse, pdEquilibrium, untreatedTumor, treatedTumor, workshopCurves } from '../src/lib/tdm/workshopCurves.js';
import { ddiMechanisms, oncoDefaults } from '../src/lib/tdm/workbenches.js';
const config = { type: 'tdi', start_day: 1, stop_day: 6, followup_days: 14, c50: 1, kdeg: 0.02, kinact: 0.1, factor: 0.5, strength: 0.8, hill: 2 };
assert.equal(ddiStepResponse(config, 2, 0), 1);
assert.equal(ddiStepResponse(config, 0, 5), 1);
assert.ok(ddiStepResponse(config, 2, 6) < 0.3);
assert.ok(ddiStepResponse(config, 2, 20) > 0.99);
assert.ok(Math.abs(ddiEquilibrium(config, 2) - 3 / 13) < 1e-12);
for (const { id } of ddiMechanisms) for (const curve of workshopCurves('ddi', { ...config, type: id }, 2)) {
  assert.ok(curve.series.every((series) => series.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && p.y >= 0.01)));
}
const onco = { growth: 'exponential', parameters: oncoDefaults, horizon: 84, decision: 42 };
assert.equal(untreatedTumor(onco, 0), 60);
assert.ok(Math.abs(untreatedTumor(onco, 100) - 60 * Math.E) < 1e-10);
for (const growth of ['exponential','logistic','gompertz']) {
  const config = {...onco, growth, history:[{time:0, amount:100, infusion:1}], dose:100, interval:21, infusion:1};
  const treated = treatedTumor(config);
  assert.ok(treated.at(-1).y < untreatedTumor(config, onco.horizon));
  const noKill = {...config, parameters:{...oncoDefaults, KILL:0}};
  for (const point of treatedTumor(noKill)) assert.ok(Math.abs(point.y / untreatedTumor(noKill, point.x) - 1) < 1e-8);
  assert.equal(workshopCurves('onco', {...config, free_pk:true})[0].series.length, 1);
}
for (const growth of ['logistic', 'gompertz']) {
  assert.ok(Math.abs(untreatedTumor({ ...onco, growth }, 0) - 60) < 1e-10);
  assert.ok(Math.abs(untreatedTumor({ ...onco, growth }, 10000) - 300) < 1e-8);
}
const pd = { type: 'emax', parameters: { E0: 10, EMAX: 0.8, EC50: 2, HILL: 2, KE0: 0.5, KOUT: 0.1 }, c0: 10, horizon: 24 };
assert.equal(pdEquilibrium(pd, 0), 10);
assert.equal(pdEquilibrium(pd, 2), 10.4);
assert.equal(pdEquilibrium({ ...pd, type: 'inhibit_in' }, 2), 6);
assert.ok(Math.abs(pdEquilibrium({ ...pd, type: 'inhibit_out' }, 2) - 10 / 0.6) < 1e-12);
const charts = workshopCurves('pd', { ...pd, exposure: 'iv1', v:10, cl:1, regimen:{dose:100,interval:24,infusion:0}, delay: true });
assert.equal(charts[0].key, 'pd_time');
assert.equal(charts[0].y2, 'C (mg/L)');
assert.equal(charts[0].series[0].points[0].y, pd.parameters.E0);
assert.equal(charts[0].series[1].points[0].y, 10);
assert.equal(charts[1].key, 'pd_relation');
assert.equal(charts[1].series[0].points[0].x, 10);
assert.equal(workshopCurves('pd', {...pd,exposure:'pk'}).length, 0);
console.log('Workshop curves: DDI, oncology, PK-driven PD, dual axes and temporal E(C) passed.');

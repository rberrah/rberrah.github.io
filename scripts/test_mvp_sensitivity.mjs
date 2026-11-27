import assert from 'node:assert/strict';
import { defaults, limits, stateAt } from '../src/lib/labs/model.js';
import { sensitivityAnalysis, sensitivityMetric } from '../src/lib/labs/sensitivity.js';

for (const lab of Object.keys(defaults)) {
  const p = { ...defaults[lab] };
  for (const metric of ['auc', 'cmax', 'cend']) {
    const before = JSON.stringify(p);
    const rows = sensitivityAnalysis(lab, p, metric, 0.2);
    assert.ok(rows.length > 0 && rows.length <= 5, lab + '/' + metric);
    assert.deepEqual([...rows].sort((a, b) => b.range - a.range), rows);
    for (const row of rows) {
      assert.ok(row.lowerValue >= limits[row.parameter][0]);
      assert.ok(row.upperValue <= limits[row.parameter][1]);
      assert.ok(row.lowerValue <= row.current && row.current <= row.upperValue);
      assert.ok([row.lower, row.upper, row.reference, row.range].every(Number.isFinite));
      assert.equal(row.reference, sensitivityMetric(lab, p, metric));
    }
    assert.equal(JSON.stringify(p), before, 'Must not mutate parameters');
  }
  assert.equal(sensitivityMetric(lab, p, 'auc'), stateAt(lab, p, p.end).auc);
  assert.equal(sensitivityMetric(lab, p, 'cend'), stateAt(lab, p, p.end, true).c);
}
const dose = sensitivityAnalysis('distribution', defaults.distribution, 'auc').find(row => row.parameter === 'dose');
assert.ok(dose && dose.lowChange < 0 && dose.highChange > 0, 'AUC should scale with dose in a linear model');
const blocked = sensitivityAnalysis('distribution', { ...defaults.distribution, q: 0 });
assert.ok(!blocked.some(row => row.parameter === 'q'), 'A fixed parameter at the physical zero bound is not spuriously varied');
const noBioavailability = sensitivityAnalysis('absorption', { ...defaults.absorption, f: 0 }, 'auc');
assert.ok(noBioavailability.every(row => row.lowChange === null && row.highChange === null), 'Undefined percentage differences must not become zero');
assert.throws(() => sensitivityAnalysis('distribution', defaults.distribution, 'auc', 0));
assert.throws(() => sensitivityAnalysis('distribution', defaults.distribution, 'auc', 0.8));
assert.throws(() => sensitivityAnalysis('distribution', defaults.distribution, 'invalid'));
console.log('MVP-inspired bounded laboratory sensitivity: 4 labs × 3 metrics, physical bounds and zero-baseline guards PASS.');

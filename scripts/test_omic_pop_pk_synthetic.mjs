import assert from 'node:assert/strict';
import fs from 'node:fs';
import { simulateOmicsPopPK } from '../src/lib/cross-domains/omic-pop-pk-synthetic.js';

const base=simulateOmicsPopPK();
assert.deepEqual(base,simulateOmicsPopPK(),'The exercise must be deterministic');
assert.equal(base.type,'synthetic-only-not-a-real-data-validation');
assert.equal(base.NTRAIN,80);
assert.equal(base.NTEST,40);
assert.equal(base.comparator.n,40);
assert.equal(base.signatureModel.n,40);
assert.equal(base.illustrativeOralDoseMg,5);
for(const metric of [base.comparator,base.signatureModel]){
  assert.ok(Number.isFinite(metric.meanAbsolutePercentageError));
  assert.ok(Number.isFinite(metric.medianAbsolutePercentageError));
  assert.ok(metric.meanAbsolutePercentageError>=0);
  assert.ok(metric.within20Percent>=0 && metric.within20Percent<=100);
}
const strong=simulateOmicsPopPK({beta:0.65});
assert.ok(strong.signatureModel.meanAbsolutePercentageError <
  strong.comparator.meanAbsolutePercentageError,
  'A genuinely strong, planted effect should be recoverable in this fixed example');
const nullScenario=simulateOmicsPopPK({beta:0});
assert.ok(Number.isFinite(nullScenario.signatureModel.meanAbsolutePercentageError));
assert.notDeepEqual(base,simulateOmicsPopPK({beta:0.35,seed:20261014}));
for(const beta of [-0.01,0.7,NaN,Infinity])
  assert.throws(()=>simulateOmicsPopPK({beta}));
assert.throws(()=>simulateOmicsPopPK({seed:1.5}));
const route=fs.readFileSync('src/routes/domaines/cas-pratique/+page.svelte','utf8');
assert.ok(route.includes('data-testid="omics-pop-pk-case"'));
assert.ok(route.includes('bind:value={beta}'));
assert.ok(route.includes('data-testid="omics-baseline-mape"'));
assert.ok(route.includes('data-testid="omics-signature-mape"'));
assert.ok(route.includes('entièrement synthétiques'));
assert.ok(route.includes('synthetic'));
assert.ok(route.includes('ne prédit aucune dose clinique'));
assert.ok(route.includes('/multiomics/'));
console.log('SYNTHETIC OMICS-POP PK DIDACTIC EXERCISE: PASS (not a clinical model)');

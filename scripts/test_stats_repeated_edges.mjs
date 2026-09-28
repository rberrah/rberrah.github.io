import assert from 'node:assert/strict';
import { friedmanLong } from '../portal/stats/advanced-engine.js';

const near=(actual,expected,tolerance,label)=>{assert.ok(Number.isFinite(actual),`${label}: expected finite, got ${actual}`);assert.ok(Math.abs(actual-expected)<=tolerance,`${label}: ${actual} != ${expected} within ${tolerance}`);};

const tiedRows=[
  {subject:'S1',condition:'A',value:1},{subject:'S1',condition:'B',value:1},{subject:'S1',condition:'C',value:3},
  {subject:'S2',condition:'A',value:1},{subject:'S2',condition:'B',value:2},{subject:'S2',condition:'C',value:2},
  {subject:'S3',condition:'A',value:1},{subject:'S3',condition:'B',value:2},{subject:'S3',condition:'C',value:3},
  {subject:'S4',condition:'A',value:2},{subject:'S4',condition:'B',value:2},{subject:'S4',condition:'C',value:3}
];
const tied=friedmanLong(tiedRows,'subject','condition','value');
near(tied.Q,6.615384615384615,1e-12,'Tie-corrected Friedman Q');
near(tied.p,0.03660053915427093,3e-8,'Tie-corrected Friedman p');
assert.ok(tied.tieCorrection<1);
assert.equal(tied.n,4);
assert.equal(tied.k,3);

const duplicate=[...tiedRows,{subject:'S1',condition:'A',value:9}];
assert.throws(()=>friedmanLong(duplicate,'subject','condition','value'),/DUPLICATE_REPEATED_CELL/);

const missing=tiedRows.filter(r=>!(r.subject==='S4'&&r.condition==='C'));
const complete=friedmanLong(missing,'subject','condition','value');
assert.equal(complete.n,3);
assert.equal(complete.excludedSubjects,1);

console.log('Stats repeated measures: ties, duplicates and complete-block edge cases PASS');

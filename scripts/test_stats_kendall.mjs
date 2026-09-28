import assert from 'node:assert/strict';
import { kendallTauB } from '../portal/stats/association-engine.js';

const near=(actual,expected,tolerance,label)=>{assert.ok(Number.isFinite(actual),`${label}: expected finite, got ${actual}`);assert.ok(Math.abs(actual-expected)<=tolerance,`${label}: ${actual} != ${expected} within ${tolerance}`);};

const perfect=kendallTauB([1,2,3,4,5],[1,2,3,4,5]);
near(perfect.tau,1,1e-15,'Perfect Kendall tau-b');
near(perfect.p,1/60,1e-15,'Perfect Kendall exact p');
assert.equal(perfect.exact,true);
assert.equal(perfect.inference,'exact');

const crossed=kendallTauB([1,2,3,4,5,6],[1,3,2,5,4,6]);
near(crossed.tau,0.7333333333333333,1e-15,'Kendall tau-b with discordance');
near(crossed.p,0.05555555555555555,1e-15,'Kendall exact p with discordance');
assert.equal(crossed.exact,true);

const tied=kendallTauB([1,1,2,3],[1,2,2,4]);
near(tied.tau,0.8,1e-15,'Tie-corrected Kendall tau-b');
near(tied.p,0.12597116307723114,3e-7,'Tie-corrected Kendall asymptotic p');
assert.equal(tied.exact,false);
assert.equal(tied.inference,'asymptotic');
assert.equal(tied.tiesX,1);
assert.equal(tied.tiesY,1);

assert.throws(()=>kendallTauB([1,2],[1,2]),/N_TOO_SMALL/);
console.log('Stats Kendall tau-b: exact and tie-corrected reference vectors PASS');

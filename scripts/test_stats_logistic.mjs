import assert from 'node:assert/strict';
import { logisticRegression, logisticProbability } from '../portal/stats/regression-engine.js';

const near=(actual,expected,tolerance,label)=>{assert.ok(Number.isFinite(actual),`${label}: expected finite, got ${actual}`);assert.ok(Math.abs(actual-expected)<=tolerance,`${label}: ${actual} != ${expected} within ${tolerance}`);};

// Reference: standard maximum-likelihood binary logit with intercept.
// Equivalent reference fit in statsmodels/R GLM: y ~ x, family=binomial().
const x=[1,2,3,4,5,6,7,8,9,10];
const y=[0,0,0,0,1,0,1,1,1,1];
const fit=logisticRegression(y,x);
assert.equal(fit.converged,true);
assert.equal(fit.separationLikely,false);
assert.equal(fit.n,10);
assert.equal(fit.events,5);
near(fit.intercept,-7.15901068,2e-7,'Logistic intercept');
near(fit.slope,1.30163831,2e-7,'Logistic slope');
near(fit.seSlope,0.84003937,2e-7,'Logistic slope SE');
near(fit.p,0.12126234,4e-7,'Logistic Wald p');
near(fit.oddsRatio,3.67531302,3e-7,'Logistic OR');
near(fit.oddsRatioCI[0],0.70835591,3e-7,'Logistic OR CI lower');
near(fit.oddsRatioCI[1],19.0694050,3e-6,'Logistic OR CI upper');
near(fit.logLik,-2.5090087048,3e-9,'Logistic log-likelihood');
near(fit.likelihoodRatio,8.84492620,3e-7,'Logistic LR statistic');
near(fit.pLikelihoodRatio,0.002939048,4e-7,'Logistic LR p');
near(fit.mcfaddenR2,0.638026558,3e-9,'McFadden R2');
near(logisticProbability(fit,5),0.34280497,3e-7,'Predicted probability at x=5');

const separated=logisticRegression([0,0,0,0,0,1,1,1,1,1],[1,2,3,4,5,6,7,8,9,10]);
assert.equal(separated.separationLikely,true,'Perfect separation must be surfaced, not silently treated as a stable MLE');

assert.throws(()=>logisticRegression([0,0,0,0,1,1,1],[1,2,3,4,5,6,7]),/N_TOO_SMALL/);
assert.throws(()=>logisticRegression([0,0,0,0,0,0,1,1],[1,2,3,4,5,6,7,8]),/LOGISTIC_CLASS_TOO_SMALL/);
assert.throws(()=>logisticRegression([0,0,0,0,1,1,1,1],[2,2,2,2,2,2,2,2]),/PREDICTOR_CONSTANT/);

console.log('Stats logistic regression: MLE, OR/CI, LR test and separation guard PASS');

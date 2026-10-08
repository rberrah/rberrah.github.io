import assert from 'node:assert/strict';
import { multivariableLinearRegression } from '../portal/stats/multivariable-engine.js';

const near=(actual,expected,tolerance,label)=>{
  assert.ok(Number.isFinite(actual),`${label}: expected finite, got ${actual}`);
  assert.ok(Math.abs(actual-expected)<=tolerance,`${label}: ${actual} != ${expected} within ${tolerance}`);
};

const age=[30,35,40,45,50,55,60,65,70,75,38,48,58,68];
const biomarker=[1.2,0.8,1.5,1.1,1.9,1.4,2.2,1.7,2.5,2.0,0.9,1.6,1.3,2.1];
const outcome=[12.1,13.8,14.4,16.2,17.5,18.0,20.7,21.2,23.5,24.1,14.0,17.1,19.0,22.4];

const fit=multivariableLinearRegression(outcome,[age,biomarker],['age','biomarker']);
assert.equal(fit.test,'multivariable_linear_regression');
assert.equal(fit.n,14);
assert.equal(fit.df,11);
assert.equal(fit.droppedRows,0);
near(fit.coefficients[0].estimate,3.80738094,3e-8,'Intercept');
near(fit.coefficients[1].estimate,0.24949054,3e-8,'Age slope');
near(fit.coefficients[2].estimate,0.75775400,3e-8,'Biomarker slope');
near(fit.coefficients[1].se,0.01194937,3e-8,'Age SE');
near(fit.coefficients[2].se,0.33018147,3e-8,'Biomarker SE');
near(fit.coefficients[1].ci[0],0.22319015,4e-8,'Age CI lower');
near(fit.coefficients[1].ci[1],0.27579093,4e-8,'Age CI upper');
near(fit.coefficients[2].ci[0],0.03102949,4e-8,'Biomarker CI lower');
near(fit.coefficients[2].ci[1],1.48447851,4e-8,'Biomarker CI upper');
near(fit.coefficients[1].vif,2.69024178,4e-8,'Age VIF');
near(fit.coefficients[2].vif,2.69024178,4e-8,'Biomarker VIF');
near(fit.r2,0.9921556539503186,2e-12,'R2');
near(fit.adjustedR2,0.9907294092140129,2e-12,'Adjusted R2');
near(fit.f,695.6419390687629,2e-9,'Global F');
near(fit.pGlobal,2.6306734568493084e-12,4e-14,'Global F p');
near(fit.residualSE,0.3688433412862981,2e-12,'Residual SE');
near(fit.maxLeverage,0.3278946136689056,2e-12,'Max leverage');
near(fit.maxCook,0.48349073280498245,2e-12,'Max Cook distance');
assert.equal(fit.influential[0].row,2);

const missingOutcome=[...outcome];missingOutcome[3]='';
const missingBiomarker=[...biomarker];missingBiomarker[5]='NA';
const complete=multivariableLinearRegression(missingOutcome,[age,missingBiomarker],['age','biomarker']);
assert.equal(complete.n,12);
assert.equal(complete.droppedRows,2);

assert.throws(
  ()=>multivariableLinearRegression(outcome,[age],['age']),
  /MULTIVARIABLE_PREDICTORS_TOO_FEW/
);
assert.throws(
  ()=>multivariableLinearRegression(outcome,[age,age.map(x=>2*x)],['age','double_age']),
  /MULTIVARIABLE_COLLINEAR/
);
assert.throws(
  ()=>multivariableLinearRegression(outcome,[age,Array(age.length).fill(2)],['age','constant']),
  /PREDICTOR_CONSTANT/
);

console.log('Stats multivariable regression: OLS, CI, VIF and influence reference vectors PASS');

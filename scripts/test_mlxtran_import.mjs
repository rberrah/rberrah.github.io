import assert from 'node:assert/strict';
import { parseMlxtran, parseMrgsolve, parseNonmem } from '../src/lib/lego/mlxtran.js';

const exactSpec = {
  version: 3,
  nodes: [{ id: 1, kind: 'central', name: 'central', dose: 100, vol: 30 }],
  edges: [{ from: 1, to: 'OUT', kinetics: 'first_order', k: 0.2, eliminationParameterization: 'rate' }],
  covariates: Array.from({ length: 12 }, (_, index) => ({
    name: `COV${index + 1}`, type: 'continuous', scope: 'patient', target: 'k_central_e', reference: 1, comparison: 1.25, beta: 0.1
  }))
};
const exact = parseMlxtran(`; PK_LEGO_SPEC_V1:${encodeURIComponent(JSON.stringify(exactSpec))}\n[LONGITUDINAL]`);
assert.equal(exact.mode, 'exact');
assert.deepEqual(exact.spec, exactSpec);
assert.deepEqual(parseMrgsolve(`// PK_LEGO_SPEC_V1:${encodeURIComponent(JSON.stringify(exactSpec))}\n$ODE`).spec, exactSpec);
assert.deepEqual(parseNonmem(`; PK_LEGO_SPEC_V1:${encodeURIComponent(JSON.stringify(exactSpec))}\n$PROBLEM`).spec, exactSpec);

const commonModel = `
; ka_pop = 1.2
; V_pop = 35
; Cl_pop = 4.5
; Q_pop = 3
; V2_pop = 50
; beta_WT_Cl = 0.6
; beta_SEX_Cl = -0.2
; beta_AGE_V = 0.1
[COVARIATE]
input = {WT, SEX, AGE}
SEX = {type=categorical, categories={0, 1}}
EQUATION:
logt_WT = log(WT/70)

[INDIVIDUAL]
DEFINITION:
Cl = {distribution=logNormal, typical=Cl_pop, covariate={logt_WT, SEX}, coefficient={beta_WT_Cl, {0, beta_SEX_Cl}}, sd=omega_Cl}
V = {distribution=logNormal, typical=V_pop, covariate=AGE, coefficient=beta_AGE_V, sd=omega_V}

[LONGITUDINAL]
input = {ka, V, Cl, Q, V2, a, b}
PK:
Cc = pkmodel(ka, V, Cl, Q, V2)
DEFINITION:
DV = {distribution=normal, prediction=Cc, errorModel=combined1(a,b)}
OUTPUT:
output = {DV}
`;
const common = parseMlxtran(commonModel);
assert.equal(common.mode, 'recognized');
assert.equal(common.spec.nodes.length, 3);
assert.equal(common.spec.edges.length, 4);
assert(common.spec.covariates.some((covariate) => covariate.name === 'WT' && covariate.target === 'cl_central' && covariate.beta === 0.6));
assert(common.spec.covariates.some((covariate) => covariate.name === 'SEX' && covariate.target === 'cl_central' && covariate.beta === -0.2));
assert(common.spec.covariates.some((covariate) => covariate.name === 'AGE' && covariate.type === 'continuous' && covariate.target === 'v_central' && covariate.beta === 0.1));
assert(common.warnings.some((warning) => warning.code === 'covariateFormApproximated' && warning.detail === 'AGE'));

const regressorModel = String.raw`
DESCRIPTION:
PKPD model. The PD part is ignored by the Lego importer.

[LONGITUDINAL]
input = {Vstd, Clstd, POIDS, E0, slope}
POIDS = {use=regressor}
PK:
V = Vstd \* (POIDS / 1.1)
Cl = Clstd \* (POIDS / 1.1)\^0.75
Cc = pkmodel(V, Cl)

EQUATION:
E = E0 + slope \* log(1+max(Cc,0))

OUTPUT:
output = {Cc, E}
`;
const regressor = parseMlxtran(regressorModel);
assert.equal(regressor.spec.nodes.length, 1);
assert.equal(regressor.spec.edges.length, 1);
assert(regressor.spec.covariates.some((covariate) => covariate.name === 'POIDS'
  && covariate.target === 'v_central' && covariate.reference === 1.1 && covariate.beta === 1));
assert(regressor.spec.covariates.some((covariate) => covariate.name === 'POIDS'
  && covariate.target === 'cl_central' && covariate.reference === 1.1 && covariate.beta === 0.75));

const piecewiseModel = `
; V = 30
; V2 = 45
; Q = 2.5
; Cl = 4
; ka = 0.8
[LONGITUDINAL]
input = {V, V2, Q, Cl, ka}
PK:
compartment(cmt=1, amount=Ac, volume=V, concentration=Cc)
absorption(adm=1, cmt=1, ka)
peripheral(k12=Q/V, k21=Q/V2)
elimination(cmt=1, Cl)
OUTPUT:
output = {Cc}
`;
const piecewise = parseMlxtran(piecewiseModel);
assert.equal(piecewise.mode, 'recognized');
assert.equal(piecewise.spec.nodes.length, 3);
assert.equal(piecewise.spec.edges.length, 4);

const kokaWithoutMarker = parseMlxtran(`
; v_central_pop = 391
; k_slow_central_pop = 0.000488
; cl_central_pop = 4.95
; f_central_pop = 0.168
; tlag_slow_pop = 319
; beta_WT_tlag_slow = 0.2
[COVARIATE]
input = {WT}
EQUATION:
logt_WT = log(WT/70)
[INDIVIDUAL]
DEFINITION:
tlag_slow = {distribution=logNormal, typical=tlag_slow_pop, covariate=logt_WT, coefficient=beta_WT_tlag_slow, no-variability}
[LONGITUDINAL]
input = {v_central, k_slow_central, cl_central, f_central, tlag_slow, a, b}
PK:
depot(target=central, adm=1, p=f_central, Tk0=tlag_slow)
depot(target=slow, adm=1, p=(1-f_central), Tlag=tlag_slow)
EQUATION:
ddt_central = + k_slow_central*slow - cl_central*central/v_central
ddt_slow = - k_slow_central*slow
C_central = central/v_central
`);
assert.equal(kokaWithoutMarker.mode, 'recognized');
assert.equal(kokaWithoutMarker.spec.nodes.length, 2);
assert.equal(kokaWithoutMarker.spec.edges.length, 2);
const kokaCentral = kokaWithoutMarker.spec.nodes.find((node) => node.name === 'central');
const kokaSlow = kokaWithoutMarker.spec.nodes.find((node) => node.name === 'slow');
assert.equal(kokaCentral.vol, 391);
assert.equal(kokaCentral.inputType, 'zero_order');
assert.equal(kokaCentral.inputDuration, 319);
assert.equal(kokaCentral.inputDurationTlagOf, kokaSlow.id);
assert(Math.abs(kokaCentral.doseFraction - 16.8) < 1e-12);
assert.equal(kokaSlow.tlag, 319);
assert.equal(kokaSlow.fractionComplementOf, kokaCentral.id);
assert(Math.abs(kokaSlow.doseFraction - 83.2) < 1e-12);
assert.equal(kokaWithoutMarker.spec.edges.find((edge) => edge.to === kokaCentral.id).k, 0.000488);
assert.equal(kokaWithoutMarker.spec.edges.find((edge) => edge.to === 'OUT').cl, 4.95);
assert.deepEqual(kokaWithoutMarker.spec.covariates.map((covariate) => covariate.target), ['tlag_slow']);

const mrgsolveModel = `
$PARAM @annotated
TVCL : 5 : clearance
TVV  : 30 : volume
TVKA : 1.2 : absorption
BETA_WT_CL : 0.75 : weight effect
BETA_SEX_CL : -0.2 : sex effect
$PARAM @covariates @annotated
WT : 70 : weight
SEX : 0 : sex
$CMT @annotated
GUT : depot [ADM]
CENT : central [OBS]
$MAIN
double CL = TVCL * pow(WT/70, BETA_WT_CL) * exp(BETA_SEX_CL * (SEX == 1));
double V = TVV;
double KA = TVKA;
$ODE
dxdt_GUT = -KA*GUT;
dxdt_CENT = KA*GUT - CL*CENT/V;
$TABLE
double DV = CENT/V;
`;
const mrgsolve = parseMrgsolve(mrgsolveModel);
assert.equal(mrgsolve.spec.nodes.length, 2);
assert.equal(mrgsolve.spec.edges.length, 2);
assert(mrgsolve.spec.covariates.some((covariate) => covariate.name === 'WT' && covariate.target.toLowerCase() === 'cl_cent' && covariate.beta === 0.75));
assert(mrgsolve.spec.covariates.some((covariate) => covariate.name === 'SEX' && covariate.type === 'categorical' && covariate.target.toLowerCase() === 'cl_cent' && covariate.beta === -0.2));
const mrgsolveIv = parseMrgsolve(`
$PARAM CL=4, V=25
$CMT @annotated
CENT : central [ADM, OBS]
$ODE
dxdt_CENT=-CL*CENT/V;
`);
assert.equal(mrgsolveIv.spec.nodes[0].kind, 'central');
assert.equal(mrgsolveIv.spec.nodes[0].dose, 100);
assert.equal(mrgsolveIv.spec.edges.length, 1);

const templatedMrgsolve = parseMrgsolve(String.raw`
$PLUGIN tad$SET end = 168, delta = 0.1
$PARAM @annotated
TVCL\_TAC : 21.2 : clearance
TVV1\_TAC : 486 : central volume
TVQ\_TAC : 79 : intercompartmental clearance
TVV2\_TAC : 271 : peripheral volume
TVKTR\_TAC : 3.34 : transit rate
HTCL : -1.14 : haematocrit effect
STV1 : 0.29 : formulation effect on volume
STKTR : 1.53 : formulation effect on transit rate
CYPCL : 2 : genotype ratio
$PARAM @annotated @covariate
HT : 35 : haematocrit
ST : 1 : formulation
CYP : 0 : CYP status
{{PERP_PARAM}}
$CMT @annotated
DEPOT_TAC : depot
TR1_TAC : transit 1
TR2_TAC : transit 2
TR3_TAC : transit 3
CENT_TAC : central [OBS]
PERI_TAC : peripheral
{{PERP_CMT}}
$MAIN
double CL0 = TVCL_TAC * pow(HT/35.0, HTCL) * pow(CYPCL, CYP);
double V1 = TVV1_TAC * pow(STV1, ST);
double Q = TVQ_TAC;
double V2 = TVV2_TAC;
double KTR = TVKTR_TAC * pow(STKTR, ST);
{{PERP_MAIN}}
$ODE
{{PERP_ODE}}
dxdt_DEPOT_TAC = -KTR * DEPOT_TAC;
dxdt_TR1_TAC = KTR * DEPOT_TAC - KTR * TR1_TAC;
dxdt_TR2_TAC = KTR * TR1_TAC - KTR * TR2_TAC;
dxdt_TR3_TAC = KTR * TR2_TAC - KTR * TR3_TAC;
dxdt_CENT_TAC = KTR * TR3_TAC - (CL0 + Q)*(CENT_TAC/V1) + Q*(PERI_TAC/V2);
dxdt_PERI_TAC = Q*(CENT_TAC/V1) - Q*(PERI_TAC/V2);
`);
assert.equal(templatedMrgsolve.spec.nodes.length, 6);
assert.equal(templatedMrgsolve.spec.nodes.filter((node) => node.kind === 'transit').length, 3);
assert.equal(templatedMrgsolve.spec.edges.length, 7);
assert.equal(templatedMrgsolve.spec.nodes.find((node) => node.kind === 'central')?.vol, 486);
assert.equal(templatedMrgsolve.spec.nodes.find((node) => node.kind === 'periph')?.vol, 271);
assert(templatedMrgsolve.spec.covariates.some((covariate) => covariate.name === 'HT'
  && covariate.target.toLowerCase() === 'cl_cent_tac' && covariate.beta === -1.14));
assert(templatedMrgsolve.spec.covariates.some((covariate) => covariate.name === 'CYP'
  && covariate.target.toLowerCase() === 'cl_cent_tac' && Math.abs(covariate.beta - Math.log(2)) < 1e-12));
assert(templatedMrgsolve.spec.covariates.some((covariate) => covariate.name === 'ST'
  && covariate.target.toLowerCase() === 'v_cent_tac' && Math.abs(covariate.beta - Math.log(0.29)) < 1e-12));
assert.equal(templatedMrgsolve.spec.covariates.filter((covariate) => covariate.name === 'ST'
  && covariate.target.toLowerCase().startsWith('k_')).length, 4);
assert(templatedMrgsolve.warnings.some((warning) => warning.code === 'templatePlaceholdersIgnored'));

const nonmemModel = `
$PROBLEM One-compartment oral model
$INPUT ID TIME DV AMT EVID MDV CMT WT SEX
$DATA data.csv IGNORE=@
$SUBROUTINES ADVAN2 TRANS2
$PK
TVCL=THETA(1)*(WT/70)**THETA(4)*EXP(THETA(5)*(SEX.EQ.1))
CL=TVCL*EXP(ETA(1))
V=THETA(2)*EXP(ETA(2))
KA=THETA(3)
$ERROR
Y=F*(1+EPS(1))+EPS(2)
$THETA
(0, 5) ; CL
(0, 30) ; V
(0, 1.2) ; KA
(-2, 0.75, 2) ; weight effect
(-2, -0.2, 2) ; sex effect
$OMEGA 0.09 0.09
$SIGMA 0.04 0.01
`;
const nonmem = parseNonmem(nonmemModel);
assert.equal(nonmem.spec.nodes.length, 2);
assert.equal(nonmem.spec.edges.length, 2);
assert(nonmem.spec.covariates.some((covariate) => covariate.name === 'WT' && covariate.target === 'cl_central' && covariate.beta === 0.75));
assert(nonmem.spec.covariates.some((covariate) => covariate.name === 'SEX' && covariate.type === 'categorical' && covariate.target === 'cl_central' && covariate.beta === -0.2));

console.log('MLXTRAN, mrgsolve, and NONMEM import tests passed.');

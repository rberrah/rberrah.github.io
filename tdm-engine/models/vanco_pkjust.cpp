$PARAM @annotated
TVCL:  0.67 : Clearance
TVV1  : 0.82: Central volume L/kg
ACL: -0.24 :effect of age on cl
CRV: 2.49 :effect of creat on V

ETA1: 0 : Clearance  (L/h)
ETA2: 0 : Central volume (L)

$PARAM @annotated @covariates
AGE : 70 : mean age years
CREAT : 87: creat micromole/l
WT : 80 : mean weight
SEX: 0: 0 homme 1 femme

$OMEGA 0.09 0.053

$SIGMA
0.01// proportional
0.25// additive 4.23

$CMT @annotated
CENT  : Central compartment (mg/L)[ADM, OBS]

$TABLE
double DV = (CENT/V1) * (1 + EPS(1)) + EPS(2);

int i = 0;
while(DV<0 && i <100) {
simeps();
DV = (CENT/V1) *(1 + EPS(1)) + EPS(2);
++i;
}

$MAIN
double A = (CREAT / 88.4 > 1 ? 1 : 0);
double CCLK = ((SEX == 0 ? 1.23 : 1.04) * WT * (140 - AGE) / CREAT)/ WT;
double CL = (((TVCL * CCLK)  + pow(AGE, ACL))* WT * 0.06) * exp(ETA1 + ETA(1)) ;
double V1 = (TVV1 * pow(CRV, A) * WT ) * exp(ETA2 + ETA(2)) ;

$ODE
dxdt_CENT   =  - (CL / V1)  * CENT ;

$CAPTURE DV CL V1

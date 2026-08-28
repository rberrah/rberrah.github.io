$PARAM @annotated
TVCL:  4.58 : Clearance
TVV1  : 1.53: Central volume L/kg

ETA1: 0 : Clearance  (L/h)
ETA2: 0 : Central volume (L)

$PARAM @annotated @covariates
CREAT : 80 : mean  creatinine µM
AGE: 50 : mean age year
WT : 70 : mean wt kg
HT : 175 : mean taille cm
SEX: 0 : 0 = homme 1  = femme

$OMEGA 0.15  0.15

$SIGMA
0.04 // proportional
2.4 // additive

$CMT @annotated
CENT  : Central compartment (mg/L)[ADM, OBS]

$TABLE
double DV = (CENT/V1) *(1 + EPS(1)) + EPS(2);

int i = 0;
while(DV<0 && i <100) {
simeps();
DV = (CENT/V1) *(1 + EPS(1)) + EPS(2);
++i;
}

$MAIN
// Calculate CCL
double CCL = (SEX == 0 ? 1.23 : 1.04) * WT * (140 - AGE) / CREAT;
double CL = TVCL * (CCL/100) * exp(ETA1 + ETA(1));
double V1 = TVV1 * WT * exp(ETA2 + ETA(2)) ;

$ODE
dxdt_CENT   =  - (CL / V1)  * CENT ;

$CAPTURE DV CL V1
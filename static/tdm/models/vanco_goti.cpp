$PARAM @annotated
TVCL:  4.5 : Clearance
TVV1: 58.4 : Central volume
TVV2  : 38.4 : Peripheral volume of distribution
TVQ   :  6.5 : Intercompartmental clearance
CCRCL: 0.8 : effect of Cokroft creat cl on CL
DCL: 0.7 : effect of dialysis on cl
DVC: 0.5 : effect of dialysis on V1

ETA1: 0 : Clearance (L/h)
ETA2: 0 : Central volume (L)
ETA3: 0 : peripheral volume (L)

$PARAM @annotated @covariates
DIAL : 0 : dialysis 1 or not 0
CREAT : 80 : mean  creatinine µM
AGE: 50 : mean age year
WT : 70 : mean wt kg
HT : 175 : mean taille cm
SEX: 0 : 0 = homme 1  = femme

$OMEGA 0.158 0.51 0.28

$SIGMA
0.05 // proportional
3.4 // additive

$CMT @annotated
CENT  : Central compartment (mg/L)[ADM, OBS]
PERIPH: Peripheral compartment (mg)

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
double CCL = (SEX == 0 ? 1.25 : 1.04) * WT * (140 - AGE) / CREAT;
double CL = TVCL * pow(CCL / 120, CCRCL) * pow(DCL, DIAL) * exp(ETA1 + ETA(1));
double V1 = TVV1 * (WT / 70) * pow(DVC, DIAL) * exp(ETA2 + ETA(2)) ;
double V2 = TVV2 * exp(ETA3 + ETA(3)) ;
double Q = TVQ ;
double K12 = Q / V1  ;
double K21 = Q / V2  ;
double K10 = CL / V1 ;

$ODE
dxdt_CENT   =  K21 * PERIPH - (K10 + K12) * CENT ;
dxdt_PERIPH =  K12 * CENT - K21 * PERIPH ;

$CAPTURE DV CL V1 V2 Q
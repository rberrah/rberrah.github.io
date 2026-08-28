[SET] end=100, delta=0.1


$PARAM @annotated
TVCL   : 5.57   : Typical value of clearance (L/h)
TVV    : 96.3   : Typical value of volume of distribution (L)
KA     : 1.6    : value of absorption rate constant (1/h)
CLcrCL : 0.684  : effet of clearance of creatinine on CL
AGECL  : -0.312 : effect of age on CL

ETA1 : 0 : IIV on volume of distribution
ETA2 : 0 : IIV on Clearance


$PARAM @annotated @covariates
AGE  : 61.5 : age (years)
CREAT : 90 : mean  creatinine µM
WT : 70 : mean wt kg
HT : 175 : mean taille cm
SEX: 0 : 0 = homme 1  = femme

$OMEGA 0.080089 0.134689

$SIGMA
0.001  // proportional (modèle multiplicatif) 0.274576
0.0001 // additive


$CMT @annotated
GUT   : Dosing compartment [ADM]
CENT  : Central compartment (mg)[OBS]


$MAIN
// Calculate CCL
double CCL = (SEX == 0 ? 1.25 : 1.04) * WT * (140 - AGE) / CREAT;
double V  = TVV * exp(ETA1 + ETA(1));
double CL = TVCL * pow((CCL/90), CLcrCL) * pow((AGE/61.5), AGECL) * exp(ETA2 + ETA(2));


$ODE
dxdt_GUT   = -KA*GUT;
dxdt_CENT  = KA*GUT - CL*(CENT/V);


$TABLE
double DV = (CENT/V) * (1 + EPS(1)) + EPS(2);
int i = 0;
while(DV<0 && i <100) {
simeps();
DV = (CENT/V) * (1 + EPS(1)) + EPS(2);
++i;
}


$CAPTURE DV CL V KA
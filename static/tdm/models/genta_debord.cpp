$PARAM @annotated
TVCLi:  0.0025 : Clearance intercept
TVCLs: 0.815 : Clearance slope
TVV1  : 0.25: Central volume

ETA1: 0 : Clearance intercept (L/h)
ETA2: 0 : Clearance slope (L/h)
ETA3: 0 : Central volume (L)

$PARAM @annotated @covariates
WT : 70 : mean wt
SEX : 0  : 0 = homme, 1 = femme
AGE : 40 : âge en années
CREAT :88.4  : créatininémie en µmol/L
CREAT2 : 88.4  :créatininémie en µmol/L
$OMEGA 0.06 0.16 0.09
$SIGMA
0.10 // proportional
0.25 // additive
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
  // Définition du % de masse musculaire en fonction du sexe
double MM = (SEX == 0) ? 0.40 : 0.325;
double LM = WT * MM;  // Poids maigre
  // Production de créatinine
double Prod = (SEX == 0) ? (29.3 - 0.203 * AGE) * LM : (25.3 - 0.175 * AGE) * LM;
  // Conversion de la créatinine de µmol/L en mg/dL (1 mg/dL = 88.4 µmol/L)
double CREAT1_mgdl = CREAT / 88.4;
double CREAT2_check = (CREAT2 > 0) ? CREAT2 : CREAT;
double CREAT2_mgdl = CREAT2_check / 88.4;

  // Calcul de la créatininémie moyenne
double CREAT_mean = (CREAT1_mgdl + CREAT2_mgdl) / 2;
  // Production corrigée
double Pc = Prod * (1 - 0.03 * CREAT_mean);
  // Volume de distribution
double V = 0.4 * LM;
  // Calcul de la clairance de la créatinine (CLcr)
double temp_CCLL = (Pc - V * (CREAT1_mgdl - CREAT2_mgdl)) * 100 / (CREAT_mean * 1440);
double CCLL = temp_CCLL * 0.06;
double CLi = TVCLi *  exp(ETA1 + ETA(1));
double CLs = TVCLs * exp(ETA2 + ETA(2));
double CL = CLi + CLs * CCLL;
double V1 = TVV1 * WT * exp(ETA3 + ETA(3)) ;

$ODE
dxdt_CENT   =   - (CL / V1) * CENT ;
$CAPTURE DV CL V1
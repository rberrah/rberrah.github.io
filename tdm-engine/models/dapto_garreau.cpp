[PARAM] @annotated
TVCL :  0.365  : Typical clearance
TVV1 : 3.59 : Typical central volume of distribution (L)
TVQ : 0.752 : Typical intercomp clearance 1 (L/h)
TVV2 : 4.71 : Typical peripheral volume of distribution 1 (L)
CLCR : 0.43 : Effect of creatinine clearance on CL
CLS : 0.232 : Effect of sex on CL
VAG : 0.263 : Effect of age on V
VWT : 0.603 : Effect of WT on V
VS : 0.117 : Effect of sex on V

ETA1 : 0 : ETA on TVCL
ETA2 : 0 : ETA on TVV1
ETA3 : 0 : ETA on TVQ
ETA4 : 0 : ETA on TVV2

[PARAM] @annotated @covariates
WT  : 79.2 : Typical weight (kg)
AGE : 60.4 : Typical age (years)
SEX : 0 : 0 = Male, 1 = Female
CREAT : 88.4 : Serum creatinine (µmol/L)

[CMT] @annotated
CENT : Central compartment (mg) [ADM, OBS]
PERI : First peripheral compartment (mg)

[OMEGA] 0.036 0.015 1.27 0.0841

[MAIN]
// Estimation de la clairance de la créatinine (CRCL) avec la formule MDRD
double CRCL = 186 * pow((CREAT * 0.0113), -1.154) * pow(AGE, -0.203);
if (SEX == 1) {
    CRCL *= 0.742;  // Facteur de correction pour les femmes
}

// Appliquer l'effet du sexe sur CL et V1
double sex_effect_CL = (SEX == 1) ? CLS : 0;
double sex_effect_V = (SEX == 1) ? VS : 0;

// Calcul des paramètres PK
double CL = TVCL * exp((CLCR * CRCL / 109) + sex_effect_CL) * exp(ETA1);
double V1 = TVV1 * exp((VAG * AGE / 60.4) + (VWT * WT / 79.2) + sex_effect_V) * exp(ETA2);
double Q = TVQ * exp(ETA3);
double V2 = TVV2 * exp(ETA4);

[SIGMA] @annotated
PROP : 0.0496 : Proportional residual unexplained variability
ADD : 2.55 : Additive residual unexplained variability

[ODE]
dxdt_CENT = -(CL + Q) * CENT / V1 + Q * PERI / V2;
dxdt_PERI = Q * CENT / V1 - Q * PERI / V2;

[TABLE]
capture DV = (CENT / V1) + (ADD + PROP * (CENT / V1));
$CAPTURE DV CL CRCL
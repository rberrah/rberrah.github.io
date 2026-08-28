$PARAM @annotated @covariates
AGE   : 65   : Âge du patient (années)
WT    : 90   : Poids Total du patient - TBW (kg)
CREAT : 70   : Créatinine Sérique (µmol/L)
SEX   : 0    : Sexe (0 = Homme, 1 = Femme)
IHD   : 0    : Hémodialyse intermittente (0=non; 1=oui, pendant séance)

$PARAM @annotated
THETA1 : 2.29   : CL_rénale — facteur d échelle (L/h/70 kg)
THETA2 : 0.943  : CL_rénale — exposant puissance sur eCrCL
CLOTHR : 0.795  : CL_non-rénale (L/h/70 kg)
V1TV   : 10.7   : Volume central (L/70 kg)
V2TV   : 12.2   : Volume périphérique (L/70 kg)
Q2TV   : 11.0   : Clairance intercomp. (L/h/70 kg)
CLDIAL : 4.48   : Clairance dialyse (L/h)

ETA1 : 0 : ETA on CLT
ETA2 : 0 : ETA on V1
ETA3 : 0 : ETA on V2

$CMT @annotated
CENT   : Compartiment central (mg) [ADM, OBS]
PERIPH : Compartiment périphérique (mg)

$OMEGA @annotated
ECL_REN : 0.0605  : BSV CL_rénale  (CV = 24.6 %)
EV1     : 0.2088  : BSV V1         (CV = 45.7 %)
ECL_OTH : 0.4816  : BSV CL_autre   (CV = 69.4 %)

$SIGMA @annotated
PROP : 0.01638  : Erreur résiduelle proportionnelle (CV ≈ 12.8 %)
ADD  : 0.0      : Additionnel

$MAIN
// 1. Cockcroft-Gault
double sex_factor = (SEX == 1) ? 0.85 : 1.0;
double CL_REN = sex_factor * (1.23 * (140 - AGE) * WT) / CREAT;

double WT_CL = pow(WT / 70.0, 0.75);
double WT_V  = WT / 70.0;

// CL rénale individuelle (absente si dialyse)
if (IHD == 0) {
  CL_REN = THETA1 * pow(CL_REN / 60.0, THETA2) * WT_CL * exp(ECL_REN + ETA1);
}

// CL non-rénale individuelle
double CL_OTH = CLOTHR * WT_CL * exp(ECL_OTH + ETA3);

// CL dialyse (active uniquement pendant séance)
double CL_HD = (IHD == 1) ? CLDIAL : 0.0;

// Clairance totale
double CL = CL_REN + CL_OTH + CL_HD;

// Volumes individuels
double V1 = V1TV * WT_V * exp(EV1 + ETA2);
double V2 = V2TV * WT_V;

// Clairance intercompartimentale
double Q2 = Q2TV * WT_CL;

$ODE
double CP  = CENT   / V1;
double CP2 = PERIPH / V2;

dxdt_CENT   = -CL * CP - Q2 * (CP - CP2);
dxdt_PERIPH =            Q2 * (CP - CP2);

$TABLE
double DV = CP * (1 + EPS(1));

$CAPTURE @annotated
CP    : Conc. plasmatique (mg/L)
CL    : CL totale individuelle (L/h)
V1    : Volume central individuel (L)
DV    : Concentration simulée avec erreur résiduelle (mg/L)

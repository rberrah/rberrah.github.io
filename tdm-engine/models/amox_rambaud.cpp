$PROB
# Modèle : Amoxicilline PopPK (Rambaud)
# Structure : 2 compartiments, administration IV, élimination linéaire.
# Fonction rénale estimée par une équation de type CKD-EPI créatinine.
# Version simplifiée : PK seule, sans PD, sans MIC, sans AUC, sans fT>MIC.
#
# Utilisation :
# - Administration IV dans CENT, cmt = 1.
# - Concentration observée ou simulée : DV.

$PARAM @annotated
TVKe    : 1.69  : Constante d'élimination typique de base (1/h)
TVVc    : 5.70  : Volume central typique (L)
TVK12   : 0.247 : Constante de transfert central vers périphérique (1/h)
TVK21   : 11.43 : Constante de transfert périphérique vers central (1/h)
TVCCRCL : 0.946 : Effet typique de la fonction rénale sur Ke
REF_CRCL: 64.92 : Fonction rénale de référence du modèle

// Mapbayr ETAs
ETA1 : 0.0 : ETA posterior sur Ke
ETA2 : 0.0 : ETA posterior sur Vc
ETA3 : 0.0 : ETA posterior sur K12
ETA4 : 0.0 : ETA posterior sur K21
ETA5 : 0.0 : ETA posterior sur l'effet de la fonction rénale

$PARAM @covariates @annotated
CREAT : 88.4 : Créatininémie sérique (µmol/L)
SEX   : 0.0  : Sexe (0 = Homme, 1 = Femme)
AGE   : 60.0 : Âge du patient (années)
BSA   : 1.73 : Surface corporelle (m2), conservée pour compatibilité
WT    : 72.0 : Poids corporel (kg), conservé pour compatibilité

$OMEGA @annotated @diagonal
ETA_KE    : 0.0367 : Variabilité interindividuelle sur Ke
ETA_VC    : 0.0615 : Variabilité interindividuelle sur Vc
ETA_K12   : 1.1100 : Variabilité interindividuelle sur K12
ETA_K21   : 0.1940 : Variabilité interindividuelle sur K21
ETA_CCRCL : 0.0964 : Variabilité interindividuelle sur l'effet fonction rénale

$SIGMA @annotated @diagonal
PROP : 0.05 : Erreur résiduelle proportionnelle
ADD  : 1.00 : Erreur résiduelle additive

$CMT @annotated
CENT   : Compartiment central (mg) [ADM, OBS]
PERIPH : Compartiment périphérique (mg)

$MAIN
// -----------------------------------------------------------------------------
// 1. Sécurisation des covariables
// -----------------------------------------------------------------------------
double safe_CREAT_umol = CREAT;
double safe_AGE = AGE;

if(safe_CREAT_umol <= 0.0) safe_CREAT_umol = 1.0;

if(safe_AGE < 18.0)  safe_AGE = 18.0;
if(safe_AGE > 120.0) safe_AGE = 120.0;

// Conversion de la créatinine de µmol/L vers mg/dL.
// L'équation source de Rambaud utilise les seuils 0.7 et 0.9 mg/dL.
double creat_mgdl = safe_CREAT_umol / 88.4;

if(creat_mgdl <= 0.0) creat_mgdl = 0.01;

// -----------------------------------------------------------------------------
// 2. Fonction rénale selon l'équation source
//    SEX = 0 : homme
//    SEX = 1 : femme
// -----------------------------------------------------------------------------
double A = 0.0;
double B = 0.0;
double sex_factor = 1.0;

if(SEX == 1.0) {
  if(creat_mgdl <= 0.7) {
    A = 0.7;
    B = -0.241;
  } else {
    A = 0.7;
    B = -1.2;
  }
  sex_factor = 1.012;
} else {
  if(creat_mgdl <= 0.9) {
    A = 0.9;
    B = -0.302;
  } else {
    A = 0.9;
    B = -1.2;
  }
  sex_factor = 1.0;
}

double CRCL = 142.0 * pow(creat_mgdl / A, B) * pow(0.9938, safe_AGE) * sex_factor;

if(CRCL < 1.0)   CRCL = 1.0;
if(CRCL > 250.0) CRCL = 250.0;

// -----------------------------------------------------------------------------
// 3. Paramètres individuels
// -----------------------------------------------------------------------------
double CCRCL = TVCCRCL * exp(ETA(5) + ETA5);
double KE1   = TVKe    * exp(ETA(1) + ETA1);

double K10 = KE1 * pow(CRCL / REF_CRCL, CCRCL);

double Vc  = TVVc  * exp(ETA(2) + ETA2);
double K12 = TVK12 * exp(ETA(3) + ETA3);
double K21 = TVK21 * exp(ETA(4) + ETA4);

// Sécurisation numérique
if(Vc  < 3.0)    Vc  = 3.0;
if(K10 < 0.0001) K10 = 0.0001;
if(K12 < 0.0001) K12 = 0.0001;
if(K21 < 0.0001) K21 = 0.0001;

// Paramètres dérivés
double CL = K10 * Vc;
double Q  = K12 * Vc;
double Vp = Q / K21;

if(CL < 0.001) CL = 0.001;
if(Q  < 0.001) Q  = 0.001;
if(Vp < 0.001) Vp = 0.001;

$ODE
dxdt_CENT   = K21 * PERIPH - (K10 + K12) * CENT;
dxdt_PERIPH = K12 * CENT - K21 * PERIPH;

$TABLE
double CP = CENT / Vc;
double DV = CP * (1.0 + EPS(1)) + EPS(2);

if(DV < 0.0) DV = 0.0;

$CAPTURE @annotated
DV         : Variable dépendante simulée, concentration totale (mg/L)
CP         : Concentration totale prédite sans erreur résiduelle (mg/L)
CL         : Clairance individuelle (L/h)
Vc         : Volume central individuel (L)
Q          : Clairance intercompartimentale individuelle (L/h)
Vp         : Volume périphérique individuel (L)
K10        : Constante d'élimination individuelle (1/h)
K12        : Constante de transfert central vers périphérique (1/h)
K21        : Constante de transfert périphérique vers central (1/h)
CRCL       : Fonction rénale estimée par l'équation source
CCRCL      : Effet individuel de la fonction rénale sur Ke
KE1        : Constante d'élimination de base individuelle (1/h)
creat_mgdl : Créatininémie convertie en mg/dL
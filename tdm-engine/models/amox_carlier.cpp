$PROB
# Modèle : Amoxicilline PopPK (Carlier)
# Structure : 2 compartiments, administration IV, élimination linéaire.
# Fonction rénale estimée par équation de type MDRD à partir de :
# AGE, CREAT, SEX et BSA recalculée depuis WT et HT.
# Version simplifiée : PK seule, sans PD, sans MIC, sans AUC, sans T>MIC.
#
# Utilisation :
# - Administration IV dans CENT, cmt = 1.
# - Concentration observée ou simulée : DV.

$PARAM @annotated
TVQ       : 15.6  : Clairance intercompartimentale typique (L/h)
TVVc      : 13.7  : Volume central typique (L)
TVVp      : 13.7  : Volume périphérique typique (L)
TVCL      : 10.0  : Clairance typique à CRCL 102 mL/min (L/h)
REF_CRCL  : 102.0 : Fonction rénale de référence du modèle (mL/min)

// Mapbayr ETAs
ETA1 : 0.0 : ETA posterior sur CL
ETA2 : 0.0 : ETA posterior sur Vc

$PARAM @covariates @annotated
AGE   : 60.0 : Âge du patient (années)
WT    : 70.0 : Poids corporel du patient (kg)
HT    : 170.0 : Taille du patient (cm)
CREAT : 88.4 : Créatininémie sérique (µmol/L)
SEX   : 0.0  : Sexe (0 = Homme, 1 = Femme)

$OMEGA @annotated @diagonal
ETA_CL : 0.148 : Variabilité interindividuelle sur CL
ETA_VC : 0.140 : Variabilité interindividuelle sur Vc

$SIGMA @annotated @diagonal
PROP : 0.0473 : Erreur résiduelle proportionnelle exponentielle

$CMT @annotated
CENT   : Compartiment central (mg) [ADM, OBS]
PERIPH : Compartiment périphérique (mg)

$MAIN
// -----------------------------------------------------------------------------
// 1. Sécurisation des covariables
// -----------------------------------------------------------------------------
double safe_AGE   = AGE;
double safe_WT    = WT;
double safe_HT    = HT;
double safe_CREAT = CREAT;

if(safe_AGE < 18.0)  safe_AGE = 18.0;
if(safe_AGE > 120.0) safe_AGE = 120.0;

if(safe_WT < 30.0)   safe_WT = 30.0;
if(safe_WT > 250.0)  safe_WT = 250.0;

if(safe_HT < 120.0)  safe_HT = 120.0;
if(safe_HT > 220.0)  safe_HT = 220.0;

if(safe_CREAT <= 0.0) safe_CREAT = 1.0;

// -----------------------------------------------------------------------------
// 2. Conversion créatinine et calcul de la surface corporelle
// -----------------------------------------------------------------------------
// Le modèle source utilise CREAT en mg/dL.
double creat_mgdl = safe_CREAT / 88.4;

if(creat_mgdl <= 0.0) creat_mgdl = 0.01;

// BSA par formule de Du Bois : WT en kg, HT en cm.
double BSA_calc = 0.007184 * pow(safe_WT, 0.425) * pow(safe_HT, 0.725);

if(BSA_calc < 0.5) BSA_calc = 0.5;
if(BSA_calc > 3.5) BSA_calc = 3.5;

// -----------------------------------------------------------------------------
// 3. Fonction rénale selon l'équation source
//    SEX = 0 : homme
//    SEX = 1 : femme
// -----------------------------------------------------------------------------
double sex_factor = (SEX == 1.0) ? 0.742 : 1.0;

double CRCL = 175.0 * pow(creat_mgdl, -1.154) * pow(safe_AGE, -0.203) *
              sex_factor * (BSA_calc / 1.73);

if(CRCL < 1.0)   CRCL = 1.0;
if(CRCL > 300.0) CRCL = 300.0;

// -----------------------------------------------------------------------------
// 4. Paramètres individuels
// -----------------------------------------------------------------------------
double CL = TVCL * (CRCL / REF_CRCL) * exp(ETA(1) + ETA1);
double Vc = TVVc * exp(ETA(2) + ETA2);

double Q  = TVQ;
double Vp = TVVp;

// Sécurisation numérique conforme à l'esprit du modèle source
if(CL > 120.0) CL = 120.0;
if(CL < 0.001) CL = 0.001;

if(Vc < 3.0)   Vc = 3.0;
if(Vp < 0.001) Vp = 0.001;
if(Q  < 0.001) Q  = 0.001;

// Constantes de transfert
double K10 = CL / Vc;
double K12 = Q  / Vc;
double K21 = Q  / Vp;

$ODE
dxdt_CENT   = K21 * PERIPH - (K10 + K12) * CENT;
dxdt_PERIPH = K12 * CENT - K21 * PERIPH;

$TABLE
double CP = CENT / Vc;

// Erreur résiduelle proportionnelle exponentielle comme dans le modèle source
double DV = CP * exp(EPS(1));

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
CRCL       : Fonction rénale estimée par l'équation source (mL/min)
BSA_calc   : Surface corporelle calculée par Du Bois (m2)
creat_mgdl : Créatininémie convertie en mg/dL
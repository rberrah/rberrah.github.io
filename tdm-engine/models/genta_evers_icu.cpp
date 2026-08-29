// =========================================================================
// genta_evers_icu.cpp -- Gentamicin, adult intensive care
//                        (van Lent-Evers & Vinks 1995, "ICU" model)
//
// SOURCE
//   van Lent-Evers NAEM, Vinks AATMM, 1995 -- the "ICU" gentamicin model.
//   Parameters as REPRODUCED in Gomes 2017 Table 3 (PLoS ONE 12(5):e0177324);
//   the original publication was not available to this project.
//   PDF: Pharmacokinetic modeling of gentamicin in
//        treatment of infective endocarditis ... Gomes.pdf
//
// POPULATION
//   Dutch adult INTENSIVE CARE patients. The higher volume coefficient is
//   attributed by the authors to extravasation, i.e. to critical-illness
//   physiology that a stable PJI patient does not share.
//
// SHARED STRUCTURE (Gomes 2017 Table 3 -- three parameter sets, one structure)
//   One compartment, first-order elimination, IV infusion (~30 min).
//     CL = CLm * (BW/70) + fr * CLcr        fr is a DIMENSIONLESS fraction of
//                                           creatinine clearance
//     V  = Vd_coefficient * LBMc            LBMc = lean body mass corrected
//                                           for fat distribution
//   CLm is a non-renal floor, so CL never falls to zero as renal function
//   declines. That is a real advantage over models whose clearance is strictly
//   proportional to CLcr.
//
// -------------------------------------------------------------------------
// LIMITS SHARED BY ALL THREE MODELS OF THIS FAMILY
//
//   1. THE LEAN-BODY-MASS EQUATION IS NOT PRINTED IN THE SOURCE. Gomes cites
//      Chennavasin (ref 27) for LBM and Schwartz (ref 28) for the fat
//      correction but reproduces neither, so V cannot be computed from the
//      paper alone. Implemented here as Devine ideal body weight plus a 0.4
//      fat correction -- the MW\Pharm convention, and the one that reproduces
//      the ~69.6 kg cross-check for a 174 cm male implied by the cohort
//      description. THIS IS AN ASSUMPTION AND MUST BE CONFIRMED against the
//      two original references before the model is trusted quantitatively.
//      The correction factor is exposed as FATC so it can be changed without
//      editing the equations.
//
//   2. THE COCKCROFT-GAULT VARIANT IS NOT SPECIFIED. The paper tabulates both
//      raw and BSA-normalised CLcr, which differ by about 10% in its cohort,
//      and states neither the equation nor which form feeds CL. Standard
//      Cockcroft-Gault on TOTAL body weight with the 0.85 female factor is
//      used here.
//
//   3. UNIT TRAP ON CLcr. fr is dimensionless and CL is in L/h, so CLcr must
//      be converted to L/h. The paper reports it in mL/min. Using mL/min
//      directly would inflate clearance 16.7-fold.
//
//   4. THE THREE MODELS ARE NOT INDEPENDENT. They share this structure and
//      this covariate algebra, and the endocarditis model is a Bayesian
//      re-estimation SEEDED from THIS model. Holding one out and training on
//      another is a weak external validation. The structurally independent
//      partner in this library is `genta_debord`, which drives elimination
//      from a non-steady-state Jelliffe creatinine clearance built on two
//      successive creatinines.
//
//   5. NO PUBLISHED RESIDUAL ERROR MODEL. Gomes applied the EMIT/Architect
//      assay error function SD = 0.0766 + 0.0006*C + 0.0064*C^2 (mg/L) when
//      re-using this model. That polynomial is implemented directly in $TABLE
//      rather than approximated by a proportional term, because its quadratic
//      term dominates at peak concentrations and no proportional/additive
//      pair matches it across the 0.5-20 mg/L range.
//
//   6. IIV IS REPORTED AS AN SD IN NATURAL UNITS, not as a variance and not
//      as a CV%. Table 3 columns are headed "mean" and "SD", and the paper
//      states the random effects are lognormal. $OMEGA below therefore holds
//      ln(1 + (SD/mean)^2); the arithmetic is shown per parameter.
//
//   MODEL-SPECIFIC NOTES
//     - Parameters are SECOND-HAND: taken from Gomes 2017 Table 3, not from
//       the primary publication. No RSE or CI is available for any estimate.
//     - THE LEAST TRANSPORTABLE OF THE THREE to a prosthetic-joint-infection
//       cohort. The highest Vd coefficient (0.335) and the highest fr (0.899)
//       both reflect intensive-care physiology -- capillary leak and augmented
//       renal clearance. Applied to a stable ward patient it will overestimate
//       volume and so DEPRESS the simulated peak, which is the exact quantity
//       the aminoglycoside Cmax/MIC target turns on.
//     - It is also the model the endocarditis fit was SEEDED from, so it is
//       the least independent member of an already dependent family. If only
//       one Evers variant is to be enabled, prefer genta_evers_standard.
//
//   SMOKE EXPECTATION
//     80 kg / 175 cm / 65 y male, CREAT 80 umol/L, 400 mg over 30 min:
//     CL 5.28 L/h, V 24.9 L, peak 16.1 mg/L, t1/2 3.26 h, C24 0.10 mg/L.
// =========================================================================

[SET] end=72, delta=0.1


$PARAM @annotated
TVCLM : 0.277 : Non-renal clearance at 70 kg (L/h)
TVFR  : 0.899 : Renal clearance as a fraction of CLcr (dimensionless)
TVVD  : 0.335 : Volume coefficient (L/kg of corrected lean body mass)
FATC  : 0.4 : Fat correction on ideal body weight -- see LIMITS 1

ETA1 : 0 : IIV on non-renal clearance
ETA2 : 0 : IIV on the renal clearance fraction
ETA3 : 0 : IIV on the volume coefficient


$PARAM @annotated @covariates
WT    : 76.0 : total body weight (kg)
HT    : 174.0 : height (cm)
AGE   : 69.0 : age (years)
SEX   : 0 : 0 = male, 1 = female
CREAT : 86.0 : serum creatinine (umol/L)


// ETA1 CLm : SD 0.138 / mean 0.277 = 49.8% -> ln(1+CV^2) = 0.2217
// ETA2 fr  : SD 0.417 / mean 0.899 = 46.4% -> ln(1+CV^2) = 0.1949
// ETA3 Vd  : SD 0.104 / mean 0.335 = 31.0% -> ln(1+CV^2) = 0.0920
$OMEGA 0.2217 0.1949 0.0920


$SIGMA 1   // unit variance; the assay error polynomial scales it in $TABLE


$CMT @annotated
CENT : Central compartment (mg) [ADM, OBS]


$MAIN
// Corrected lean body mass. Devine ideal body weight plus a fat correction --
// a SUBSTITUTE for the Chennavasin/Schwartz equations the paper omits.
double IBW = (SEX == 0) ? 50.0 + 2.3*(HT/2.54 - 60.0)
                        : 45.5 + 2.3*(HT/2.54 - 60.0);
if (IBW < 1.0) IBW = WT;              // guard: very short stature
double LBMC = IBW + FATC*(WT - IBW);
if (LBMC > WT) LBMC = WT;             // corrected lean mass cannot exceed total

// Cockcroft-Gault. CREAT arrives in umol/L; 1 mg/dL = 88.4 umol/L.
double CRMGDL = CREAT / 88.4;
double CCR_MLMIN = (140.0 - AGE) * WT / (72.0 * CRMGDL) * ((SEX == 0) ? 1.0 : 0.85);
double CCR = CCR_MLMIN * 0.06;        // mL/min -> L/h; fr is dimensionless

double CLM = TVCLM * exp(ETA1 + ETA(1));
double FR  = TVFR  * exp(ETA2 + ETA(2));
double CL  = CLM * (WT/70.0) + FR * CCR;
double V   = TVVD * exp(ETA3 + ETA(3)) * LBMC;


$ODE
dxdt_CENT = - (CL / V) * CENT;


$TABLE
// EMIT/Architect assay error function, implemented exactly rather than
// approximated: SD = 0.0766 + 0.0006*C + 0.0064*C^2 (mg/L). See LIMITS 5.
double CP = CENT / V;
double DV = CP + (0.0766 + 0.0006*CP + 0.0064*CP*CP) * EPS(1);
int i = 0;
while(DV<0 && i <100) {
simeps();
DV = CP + (0.0766 + 0.0006*CP + 0.0064*CP*CP) * EPS(1);
++i;
}


$CAPTURE DV CP CL V CCR LBMC

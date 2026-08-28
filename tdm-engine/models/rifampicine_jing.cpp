$PROB
# Rifampicin PopPK -- Jing et al. (2016)
#
# Source: Table 2 of Ju G et al., "Parametric Population Pharmacokinetics Model
# Repository of Rifampicin", Clin Pharmacol Adv Appl 2025;17 (ref 25 therein,
# Jing 2016, China, n=54 adults, pulmonary TB, 150-450 mg oral).
#
# Structure: one-compartment open model, first-order absorption and elimination,
# NO COVARIATES AT ALL:
#
#   CL = 4.02 L/h   (IIV 64.5 %)
#   Vd = 57.8 L     (IIV 20.9 %)
#   Ka = 1.61 1/h   (fixed)
#
# This is deliberately the plainest family in the rifampicin set, and that is its
# purpose. Held out in a leave-one-model-out split it asks a sharp question: can the
# encoder predict exposure for a population whose between-subject variability is
# explained by NOTHING it can observe? Its 64.5 % CV on clearance is entirely
# unexplained, whereas the Jeremiah and Chang families attribute much of theirs to
# size and diabetes. An encoder that has learned covariate-driven pharmacology should
# do measurably worse here, and the size of that gap is informative rather than a
# defect.
#
# Note the additive residual error is large (6.55 mg/L variance as published,
# i.e. about 2.6 mg/L SD) relative to rifampicin concentrations of order 5-15 mg/L.
# That is what the source reports and it is not adjusted here; it means this family
# also carries the noisiest observations, which is a second reason held-out
# performance on it should be read carefully.
#
# CAVEAT ON TRANSPORTABILITY: pulmonary-tuberculosis population at doses of
# 150-450 mg, which are LOWER than the 600-900 mg used in prosthetic-joint infection.
# Rifampicin exposure rises more than proportionally with dose, so extrapolating this
# family upward is the least safe of the three.
#
#
# POPULATION CAVEAT -- READ WITH rifampicine_marsot.cpp
# This model comes from a PULMONARY TUBERCULOSIS cohort. The library also contains
# `rifampicine_marsot.cpp`, which is Marsot et al., Br J Clin Pharmacol 2017;83:
# 1039-1047, "Population pharmacokinetics of rifampicin in adult patients with
# OSTEOARTICULAR INFECTIONS: interaction with fusidic acid" -- i.e. the SAFEBONE
# population itself. Marsot is therefore the reference model for bone infection and
# this one is the extrapolation, not the other way round.
#
# Note also that the Ju et al. review used to build this file lists Marsot (2017)
# under "Pulmonary tuberculosis" in its Table 1. That is a mis-annotation: the paper
# is osteoarticular. Provenance metadata taken from that review should be treated
# with corresponding caution.
#
# IIV converted from published %CV by omega^2 = ln(1 + CV^2):
#   CL 64.5% -> 0.3479 | Vd 20.9% -> 0.0428

$PARAM @annotated
TVCL : 4.02 : Clearance (L/h)
TVVD : 57.8 : Volume of distribution (L)
TVKA : 1.61 : Absorption rate constant (1/h) - FIXED in the source model

ETA1 : 0 : IIV on clearance (mapbayr)
ETA2 : 0 : IIV on volume (mapbayr)

$PARAM @annotated @covariates
WT : 58.6 : Body weight (kg) - NOT used by this model, carried for interface parity

$OMEGA @annotated @diagonal
ETA_CL : 0.3479 : IIV on CL, from 64.5 %CV
ETA_VD : 0.0428 : IIV on Vd, from 20.9 %CV

$SIGMA @annotated @diagonal
ADD : 6.55 : Additive residual error VARIANCE (mg/L)^2, as published

$CMT @annotated
DEPOT : Absorption compartment (mg) [ADM]
CENT  : Central compartment (mg) [OBS]

$MAIN
// No covariate effects: the source model has none. WT is declared above only so the
// data interface matches the other families in this library.
double CL = TVCL * exp(ETA1 + ETA(1));
double V  = TVVD * exp(ETA2 + ETA(2));
double Ka = TVKA;

if(CL < 0.001) CL = 0.001;
if(V  < 1.0)   V  = 1.0;

$ODE
dxdt_DEPOT = -Ka * DEPOT;
dxdt_CENT  =  Ka * DEPOT - (CL / V) * CENT;

$TABLE
double IPRED = CENT / V;
double DV = IPRED + EPS(1);

int i = 0;
while(DV < 0.0 && i < 1000) {
  simeps();
  DV = IPRED + EPS(1);
  ++i;
}

$CAPTURE @annotated
DV    : Simulated concentration with residual error (mg/L)
IPRED : Individual predicted concentration (mg/L)
CL    : Individual clearance (L/h)
V     : Individual volume of distribution (L)
Ka    : Absorption rate constant (1/h)

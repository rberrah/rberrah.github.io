# Course blueprint — Pharmacométrie Explain

This document defines the target pedagogical structure. It should guide AI-assisted development and prevent the project from becoming a generic landing page.

## Pedagogical principle

Each chapter should follow the same educational pattern:

1. Clinical or scientific motivation.
2. Intuition with a visual analogy.
3. Minimal mathematical formulation.
4. Interactive simulation.
5. Interpretation pitfalls.
6. Short quiz or checkpoint.
7. Link to next chapter.

## Track 1 — Core pharmacometrics

### 1. Why pharmacometrics?

Source material:
- Introduction to pharmacometrics deck.
- Slides on PK, PD, variability, and the failure of one-size-fits-all dosing.

Learning goals:
- Distinguish PK and PD.
- Explain why exposure and response vary between individuals.
- Understand why fixed dosing can fail.

Suggested visualizations:
- Body/drug journey diagram.
- Same-dose/different-exposure animation.
- PK vs PD conceptual split.

### 2. NCA, PopPK, PBPK

Source material:
- Deck sections comparing non-compartmental analysis, population PK, and physiologically based PK.

Learning goals:
- Explain what NCA measures.
- Explain why NCA is descriptive but not predictive.
- Explain why PopPK is useful for variability and simulation.
- Explain what PBPK adds and why it is complex.

Suggested visualizations:
- Three-method comparison cards.
- AUC trapezoidal explorer.
- PopPK spaghetti plot.

### 3. What is a PK model?

Source material:
- Deck sections on compartments, ODEs, flows, and ADME.

Learning goals:
- Understand compartments as simplified physiological spaces.
- Interpret clearance as a flow and volume as a dilution space.
- Connect ODEs to amount and concentration over time.

Suggested visualizations:
- Bucket/tank flow analogy.
- One-compartment IV bolus explorer.
- Clearance/volume/half-life explorer.

### 4. Absorption and oral dosing

Source material:
- ADME slides.
- Tlag, Ka, Bateman curve, Tmax, Cmax.

Learning goals:
- Understand first-order absorption.
- Distinguish Ka, Tlag, CL, V and their effects.
- Interpret Cmax and Tmax.

Suggested visualizations:
- Oral absorption explorer.
- Depot-to-central compartment animation.
- Parameter sliders for Dose, Ka, Tlag, CL, V.

### 5. Warfarin structural model

Source material:
- Warfarin slides.
- Warfarin notebooks and CSV dataset.

Learning goals:
- Translate a dataset into a simple PK model.
- Compare one-compartment and two-compartment assumptions.
- Understand the role of Tlag.
- Interpret AIC/BIC/logLik only as model comparison tools, not clinical truth.

Suggested visualizations:
- Model structure selector.
- Overlay of observed data and simulated predictions.
- Simple model comparison table.

### 6. Variability

Source material:
- IIV, IOV, eta, omega, mixed-effect model slides.

Learning goals:
- Distinguish fixed effects and random effects.
- Understand log-normal individual parameters.
- Distinguish IIV and IOV.
- Understand why high IOV complicates TDM.

Suggested visualizations:
- Population distribution of CL and V.
- Individual curve generator.
- IIV vs IOV comparison animation.

### 7. Residual error

Source material:
- Additive, proportional, and combined residual error slides.

Learning goals:
- Distinguish model prediction from observation.
- Understand additive, proportional, and combined error.
- Understand why residual error is not the same as IIV.

Suggested visualizations:
- Residual error simulator.
- IPRED vs DV scatter.
- Error model comparison.

### 8. Covariates and allometry

Source material:
- Weight, age, sex, allometric scaling, centering.

Learning goals:
- Understand covariates as explainers of variability.
- Interpret allometric scaling.
- Understand why centering matters.
- Avoid naive mg/kg reasoning.

Suggested visualizations:
- Allometry curve explorer.
- Linear vs power-law dosing comparison.
- Covariate effect on CL distribution.

### 9. PK/PD

Source material:
- Emax, EC50, Hill, indirect response, turnover, PK/PD delay.

Learning goals:
- Distinguish concentration from effect.
- Interpret Emax and EC50.
- Understand saturation and Hill coefficient.
- Understand delayed PD response.

Suggested visualizations:
- Emax/Hill curve explorer.
- PK concentration plus PD effect timeline.
- Hysteresis loop.

### 10. Diagnostics and VPC

Source material:
- Goodness-of-fit, VPC, bins, model bias, variability diagnostics.

Learning goals:
- Interpret observed vs predicted plots.
- Understand VPC percentiles and bins.
- Detect bias and poor variability estimation.
- Understand that visual diagnostics require context.

Suggested visualizations:
- VPC crash-test.
- Binning slider.
- Bias and variability toggles.

### 11. Bayesian individualization and TDM

Source material:
- Bayes theorem, prior, likelihood, posterior, EBE, shrinkage, TDM cycle.

Learning goals:
- Understand prior, likelihood, and posterior.
- Interpret EBEs.
- Understand shrinkage and its diagnostic consequences.
- Explain the TDM cycle as measure → estimate → adjust.

Suggested visualizations:
- Prior/likelihood/posterior explorer.
- EBE shrinkage visual.
- TDM dashboard mock simulation.

## Track 2 — AI in pharmacometrics

This track should be introduced only after the core pharmacometrics foundations are clear.

### 1. White box, black box, grey box

Learning goals:
- Distinguish mechanistic, statistical, ML, and hybrid models.
- Understand interpretability tradeoffs.
- Avoid presenting AI as automatically superior.

Suggested visualizations:
- Model paradigm comparison.
- Extrapolation risk demo.

### 2. Neural ODE intuition

Learning goals:
- Understand the idea of adding a learned correction term to a mechanistic ODE.
- Distinguish interpolation from extrapolation.
- Understand why learned dynamics require validation.

Suggested visualizations:
- Mechanistic ODE vs Neural ODE.
- Learned bump/correction animation.
- Out-of-domain warning view.

### 3. ML for covariates and TDM

Learning goals:
- Understand where ML can help.
- Distinguish prediction performance from clinical utility.
- Understand validation and calibration.

Suggested visualizations:
- Feature importance toy example.
- Calibration and uncertainty explorer.

### 4. Validation, uncertainty, and clinical limits

Learning goals:
- Understand calibration.
- Understand external validation.
- Understand uncertainty intervals.
- Identify failure modes.

Suggested visualizations:
- Prediction interval explorer.
- Dataset shift simulator.
- Safety checklist.

## Content conversion rule

Do not copy slides verbatim into chapters.

For each slide group, convert into:

- short narrative text;
- clean formulas;
- one or two visual intuitions;
- one interactive component;
- a checkpoint question.

## Target first implementation phase

Phase 1 should produce:

1. A better home page.
2. A stronger chapter template.
3. A stable course navigation structure.
4. Two complete core chapters:
   - Why pharmacometrics?
   - Clearance, volume, and half-life.
5. Two polished visualizations:
   - One-compartment IV bolus explorer.
   - Oral absorption explorer.
6. Updated documentation.

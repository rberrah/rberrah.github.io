---
id: "math-covariates"
slug: "math-covariates"
title: "Building the covariate model"
description: "Explaining variability: allometry, centering, stepwise selection (SCM) and modern approaches."
summary: "Building a covariate model: parameterisation, allometry, selection (SCM/full model), collinearity pitfalls."
track: "math"
order: 26
duration: "14 min"
level: "advanced"
tags: ["maths", "covariates", "scm", "model-building"]
slides: []
quiz:
  - prompt: "Adding a relevant covariate to a population model..."
    options:
      - "explains part of the inter-individual variability (omega drops)"
      - "always increases variability"
      - "has no effect on omega"
    correct: 0
  - prompt: "Allometry describes the effect of weight on clearance by..."
    options:
      - "a power law with exponent ~0.75"
      - "a linear relationship with exponent 1"
      - "no relationship"
    correct: 0
  - prompt: "Stepwise selection (SCM) risks..."
    options:
      - "over-selecting and biasing effects (data reused)"
      - "always giving the true model"
      - "ignoring covariates"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Inter-individual variability is not pure chance: part of it is **explained** by covariates (weight, renal function, genotype). Identifying them enables dose **individualisation** and understanding of the drug.

Building this covariate model is an art with many pitfalls.
<!-- /step -->

<!-- step:title="Intuition" viz="14_AllometryCentering" -->
A useful covariate **reduces** the unexplained variability: after adding it, patients "resemble" one another more at equal covariate (the $\omega$ decreases).

Two good practices: **centre** the covariate on a reference value (the typical parameter keeps its meaning) and use **physiological** forms (allometry).
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="14_AllometryCentering" -->
The most common form, centred and power-law:

$$ CL_i = CL_{ref}\left(\frac{W_i}{70}\right)^{0.75}\cdot e^{\eta_i} $$

- **Centering** on 70 kg: $CL_{ref}$ = clearance of the reference subject;
- **Allometry**: exponent ~0.75 for clearance, 1 for volumes.

For **selection**, several strategies: **SCM** (stepwise covariate modeling, forward/backward on the OFV), **full model** (include everything then judge relevance), and modern approaches (**SAMBA**, penalised selection) that are faster and less biased.

**Ref —** Jonsson & Karlsson (SCM); Anderson & Holford (allometry); Prague, Mentré et al. — **SAMBA** (IAME) for efficient covariate selection.
<!-- /step -->

<!-- step:title="Worked example" viz="14_AllometryCentering" -->
Adding **weight** (allometry) then **CrCl** on clearance drops the OFV and the clearance $\omega$: variability becomes explainable, and the dose can be adjusted to weight and renal function.

Each covariate is judged not only on the OFV but on its **clinical magnitude** (see forest-plot interpretation).
<!-- /step -->

<!-- step:title="Common pitfall" -->
Stepwise selection traps itself.

**Pitfall —** **SCM** tests many covariates on the **same** data: it **over-selects** and **overestimates** effects (selection bias). **Correlated** covariates (weight, height, CrCl) substitute for one another. Prefer pre-specified forms, physiological allometry, and validate the retained effects.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- A relevant covariate explains part of the IIV (omega decreases).
- Centre the covariate; use allometry (CL ∝ weight^0.75, V ∝ weight).
- Selection: SCM (stepwise), full model, or modern approaches (SAMBA, penalisation).
- SCM over-selects and biases; beware correlated covariates.
<!-- /step -->

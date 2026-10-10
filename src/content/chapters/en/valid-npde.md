---
id: "valid-npde"
slug: "valid-npde"
title: "NPDE: simulation-based residuals"
description: "Residuals expected to be close to a standard normal distribution under the model assumptions: NPDE, a simulation-based diagnostic."
summary: "NPDE (normalized prediction distribution errors): simulation-based construction and reading."
track: "valid"
order: 92
duration: "12 min"
level: "advanced"
tags: ["validation", "npde", "simulation", "residuals"]
slides: []
prerequisites: ["valid-gof"]
glossary: ["Résidus (WRES/CWRES/IWRES/NPDE)","VPC"]
sources: ["brendel-npde","hooker-cwres"]
updated_on: "2026-10-10"
reviewed_on: "2026-10-10"
review_type: "author"
reviewed_hash: "9b89ed81c01b0d8d55dcb76e2396b8ea53c17288a9739d20308f4bf69f5e010d"
scientific_values: {"reference_mean":0,"reference_variance":1}
units: {"npde":"standard_normal_scale","mean":"dimensionless","variance":"dimensionless"}
quiz:
  - prompt: "If the model is correct, NPDE follow a..."
    options:
      - "standard normal law N(0,1), with mean 0 and variance 1"
      - "uniform law on [0,1], like the pde before transformation"
      - "chi-squared law with one degree of freedom, being squares"
    correct: 0
  - prompt: "NPDE are built by..."
    options:
      - "comparing each observation to a distribution simulated under the model"
      - "comparing each observation to its individual prediction IPRED"
      - "standardising weighted residuals by their theoretical SD"
    correct: 0
  - prompt: "A shift of the NPDE mean away from 0 indicates..."
    options:
      - "a systematic model bias (over- or under-prediction)"
      - "over-dispersion, i.e. an NPDE variance above 1"
      - "a departure from normality, mainly in the tails"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Classic residuals rely on **approximations** (linearisation). **NPDE** avoid them: they compare each observation to what the model actually **simulates**, offering a robust diagnostic.

It is the reference tool for simulation-based validation, alongside the VPC.
<!-- /step -->

<!-- step:title="Intuition" viz="52_NPDE" -->
For each observation, we **simulate** many values under the model: where does the real observation sit in that distribution?

Under a correctly specified model and the calculation assumptions, these normalised positions are expected to follow a **standard Gaussian**. A shift or spread suggests predictive mismatch to investigate, without identifying its cause by itself. Raise the misspecification and watch the deviation.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="52_NPDE" -->
We simulate $K$ datasets under the model. For each individual, simulations provide the mean and covariance of repeated observations; observations are therefore centred and **decorrelated** before computing their **position** within the predicted distribution (PDE), then transformed by the inverse normal $\Phi^{-1}$:

$$ npde_{ij} = \Phi^{-1}\big(pde_{ij}\big) $$

Under the true model: $npde \sim \mathcal{N}(0,1)$. We **test** the mean (= 0?), the variance (= 1?) and normality, globally and **by covariate / by time**.

**Ref —** Brendel K. et al., *Pharm Res* 2006 (NPDE); method developed at **IAME** (France Mentré et al.), available in the R package `npde`.
<!-- /step -->

<!-- step:title="Worked example" viz="52_NPDE" -->
A **positive** NPDE mean in the "renal impairment" subgroup is compatible with underprediction of their concentrations. A CrCl covariate on clearance is one hypothesis to test among structural, residual and data-related explanations.

Plotting NPDE **against time** or **against PRED** helps characterize where the discrepancy appears and generate hypotheses about absorption, elimination, covariates or residual error.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A global histogram can hide local deviations.

**Pitfall —** globally N(0,1) NPDE can **mask** opposite biases in two subgroups that cancel out. One must examine **stratified** NPDE (by covariate, by time), not just the overall histogram.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- NPDE compare each observation to a distribution simulated under the model, after within-individual centring and decorrelation.
- Under a correctly specified model and the calculation assumptions, NPDE are expected to be close to N(0,1) (mean, variance and normality).
- Robust because no linearisation; examine stratified (covariate, time).
- A local shift or spread suggests predictive mismatch and opens several diagnostic hypotheses.
<!-- /step -->

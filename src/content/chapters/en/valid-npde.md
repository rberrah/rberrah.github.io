---
id: "valid-npde"
slug: "valid-npde"
title: "NPDE: simulation-based residuals"
description: "Residuals that should follow a normal law: NPDE, a robust simulation-based diagnostic."
summary: "NPDE (normalized prediction distribution errors): simulation-based construction and reading."
track: "valid"
order: 92
duration: "12 min"
level: "advanced"
tags: ["validation", "npde", "simulation", "residuals"]
slides: []
quiz:
  - prompt: "If the model is correct, NPDE follow a..."
    options:
      - "standard normal law N(0,1)"
      - "uniform law"
      - "exponential law"
    correct: 0
  - prompt: "NPDE are built by..."
    options:
      - "comparing each observation to a distribution simulated under the model"
      - "differentiating the concentration curve"
      - "averaging doses"
    correct: 0
  - prompt: "A shift of the NPDE mean away from 0 indicates..."
    options:
      - "a model bias"
      - "a good fit"
      - "only a unit error"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Classic residuals rely on **approximations** (linearisation). **NPDE** avoid them: they compare each observation to what the model actually **simulates**, offering a robust diagnostic.

It is the reference tool for simulation-based validation, alongside the VPC.
<!-- /step -->

<!-- step:title="Intuition" viz="52_NPDE" -->
For each observation, we **simulate** many values under the model: where does the real observation sit in that distribution?

If the model is correct, these (normalised) positions spread like a **standard Gaussian**. A shift or spread betrays a problem. Raise the misspecification and watch the deviation.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="52_NPDE" -->
We simulate $K$ datasets under the model, compute the **position** of each observation within the predicted distribution (pde), then transform it by the inverse normal $\Phi^{-1}$:

$$ npde_{ij} = \Phi^{-1}\big(pde_{ij}\big) $$

Under the true model: $npde \sim \mathcal{N}(0,1)$. We **test** the mean (= 0?), the variance (= 1?) and normality, globally and **by covariate / by time**.

**Ref —** Brendel K. et al., *Pharm Res* 2006 (NPDE); method developed at **IAME** (France Mentré et al.), available in the R package `npde`.
<!-- /step -->

<!-- step:title="Worked example" viz="52_NPDE" -->
A **positive** NPDE mean in the "renal impairment" subgroup signals a model that **underestimates** their concentrations: a CrCl covariate on clearance is probably missing.

Plotting NPDE **against time** or **against PRED** localises the error (absorption, elimination, residual error).
<!-- /step -->

<!-- step:title="Common pitfall" -->
A global histogram can hide local deviations.

**Pitfall —** globally N(0,1) NPDE can **mask** opposite biases in two subgroups that cancel out. One must examine **stratified** NPDE (by covariate, by time), not just the overall histogram.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- NPDE compare each observation to a distribution simulated under the model.
- Correct model ⇒ NPDE ~ N(0,1) (mean, variance, normality tests).
- Robust because no linearisation; examine stratified (covariate, time).
- A local shift/spread reveals a bias (often a missing covariate).
<!-- /step -->

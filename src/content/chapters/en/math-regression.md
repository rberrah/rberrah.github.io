---
id: "math-regression"
slug: "math-regression"
title: "Regression, likelihood and estimation"
description: "From least squares to likelihood: how a model is fitted to data."
summary: "Estimating means finding the most plausible parameters: log-linear regression, OFV, AIC."
track: "math"
order: 21
duration: "13 min"
level: "intermediate"
tags: ["maths", "regression", "likelihood", "estimation"]
slides: []
quiz:
  - prompt: "Estimating a parameter by maximum likelihood means finding the value that..."
    options:
      - "makes the observed data most plausible"
      - "minimises the sum of squared residuals always"
      - "maximises the parameter's prior probability"
    correct: 0
  - prompt: "A log-linear regression of ln(C) vs t directly gives..."
    options:
      - "the elimination rate constant (slope) and C₀ (intercept)"
      - "the volume of distribution (slope) and the clearance (intercept)"
      - "the half-life (slope) and the total AUC (intercept)"
    correct: 0
---

<!-- step:title="Why this chapter" -->
A model without **estimation** is only a hypothesis. Estimating means finding the parameter values that **best fit** the data.

We move from **least squares** (minimise the gap) to **likelihood** (make the data plausible), the foundation of PopPK.
<!-- /step -->

<!-- step:title="Intuition" viz="EstimationFit" -->
Picture sliding a curve until it passes as close as possible to the points.

A **criterion** measures the curve–point distance; estimation finds the minimum of this criterion. That is exactly what the interactive panel does.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="EstimationFit" -->
**Least squares** minimise $\sum (y_i - \hat y_i)^2$. **Likelihood** goes further: it weights each gap by its expected variability, and we minimise:

$$ -2\log L = \sum \frac{(y_i - \hat y_i)^2}{\sigma_i^2} + \dots $$

**Math —** a simple case used in practicals: a **log-linear regression** $\ln C = \ln C_0 - k_e\,t$ gives $k_e$ (slope) and $C_0$ (intercept), hence $V_d = \text{Dose}/C_0$ and $CL = k_e\cdot V_d$.
<!-- /step -->

<!-- step:title="Worked example" viz="AUCTrap" -->
On a semi-log IV profile, the **terminal slope** estimates $k_e$; the intercept estimates $C_0$.

From the concentrations, regression yields $k_e$, $V_d$ and $CL$ — then the AUC by the trapezoidal rule completes the NCA analysis.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Fitting the points is not the ultimate goal.

**Pitfall —** with enough parameters you can pass through **every** point (overfitting) while predicting poorly. AIC/BIC penalise complexity; regression must also respect **weighting** (additive vs proportional error).
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Estimating = finding the most plausible parameters (least squares → likelihood).
- Log-linear regression: slope = kₑ, intercept = C₀ ⇒ Vd and CL.
- The OFV (−2 log L) is minimised; AIC/BIC arbitrate complexity.
- Overfitting ≠ good prediction.
<!-- /step -->

---
id: "nca-auc"
slug: "nca-auc"
title: "AUC: trapezoids, extrapolation and λz"
description: "Computing the area under the curve step by step: linear/log trapezoids, terminal slope and extrapolation."
summary: "The trapezoidal method, linear vs log choice, λz estimation and the AUC extrapolated to infinity."
track: "nca"
order: 81
duration: "12 min"
level: "intermediate"
tags: ["nca", "auc", "trapezoidal", "lambda-z"]
slides: []
quiz:
  - prompt: "The trapezoidal method computes the AUC by..."
    options:
      - "summing the area of trapezoids between successive points"
      - "summing the area of rectangles under each concentration"
      - "multiplying the maximum concentration by the total time"
    correct: 0
  - prompt: "λz (terminal slope) is estimated by log-linear regression..."
    options:
      - "over the last points of the elimination phase"
      - "over the first points of the absorption phase"
      - "over all points, from the peak to the last sample"
    correct: 0
  - prompt: "A too-large extrapolated fraction (> 20%) signals..."
    options:
      - "insufficient terminal sampling, unreliable AUC"
      - "a well-defined terminal phase, a very reliable AUC"
      - "a half-life too short for the sampling window"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The **AUC** is the central exposure measure. Computing it well — and knowing when it is reliable — underpins all of NCA, from bioequivalence to TDM.

This chapter dissects the calculation, trapezoid by trapezoid.
<!-- /step -->

<!-- step:title="Intuition" viz="08_AUCTrap" -->
We approximate the area under the curve by a series of **trapezoids** between measured points. The closer the points, the finer the approximation.

On the descending phase, a **logarithmic** trapezoid fits exponential decay better than a linear one.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="08_AUCTrap" -->
Between two points, the **linear** trapezoid area is:

$$ \Delta\text{AUC} = \frac{(C_i + C_{i+1})}{2}\,(t_{i+1}-t_i) $$

Then we estimate the **terminal slope** $\lambda_z$ by regressing $\ln C$ over the last points, and **extrapolate**:

$$ \text{AUC}_{0-\infty} = \text{AUC}_{0-t_{last}} + \frac{C_{last}}{\lambda_z},\qquad t_{1/2} = \frac{\ln 2}{\lambda_z} $$

**Math —** the **extrapolated fraction** = $\dfrac{C_{last}/\lambda_z}{\text{AUC}_{0-\infty}}$ should stay small (ideally < 20%).
<!-- /step -->

<!-- step:title="Worked example" viz="08_AUCTrap" -->
On an IV profile, we sum the trapezoids up to the last point, read $\lambda_z$ from the last 3–4 points on a semi-log plot, then add $C_{last}/\lambda_z$.

The interactive panel shows how the **choice of terminal points** changes $\lambda_z$ — and thus the extrapolated AUC and half-life.
<!-- /step -->

<!-- step:title="Common pitfall" -->
λz is sensitive to point selection.

**Pitfall —** including points **outside the terminal phase** (still distributing) biases $\lambda_z$. Too few terminal points, or a poor $R^2$, make the half-life and AUC∞ unreliable. A high **extrapolated fraction** is a warning sign.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The AUC is computed by trapezoids (linear, or log on the descending phase).
- λz = terminal slope (log-linear regression of the last points); t½ = ln2/λz.
- AUC∞ = observed AUC + C_last/λz; watch the extrapolated fraction (< 20%).
- The choice of terminal points is critical for λz.
<!-- /step -->

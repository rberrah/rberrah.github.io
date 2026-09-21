---
id: "nca-intro"
slug: "nca-intro"
title: "Principles of non-compartmental analysis"
description: "Estimating exposure without assuming a structure: the assumptions and scope of NCA."
summary: "What NCA is, what it measures, what its interpretations assume and when to prefer it over a model."
track: "nca"
order: 80
duration: "11 min"
level: "beginner"
tags: ["nca", "auc", "exposure", "regulatory"]
slides: []
quiz:
  - prompt: "NCA differs from a compartmental model because it..."
    options:
      - "assumes no particular compartmental structure"
      - "imposes a two-compartment model by default"
      - "estimates transfer constants between compartments"
    correct: 0
  - prompt: "NCA can describe a nonlinear profile, but interpreting Dose/AUC as constant clearance assumes..."
    options:
      - "kinetics sufficiently linear in the studied range"
      - "saturable, of Michaelis-Menten type at high dose"
      - "zero-order, at a constant elimination rate"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Before any model, we want a **robust and simple** measure of exposure. **NCA** (non-compartmental analysis) provides AUC, Cmax, half-life and clearance **without assuming** a compartmental structure.

It is the reference method for **bioequivalence** and in early development.
<!-- /step -->

<!-- step:title="Intuition" viz="04_ThreeApproaches" -->
NCA "lets the data speak": connect the points, measure the area, read the terminal slope.

No compartments, no differential equations to fit — but also no mechanistic extrapolation. It is a **measurement** tool, not a **prediction** tool.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="04_ThreeApproaches" -->
NCA rests on two pillars: the **AUC** (exposure) and the apparent terminal slope $\lambda_z$.

$$ \text{AUC}_{0-\infty} = \text{AUC}_{0-t_{last}} + \frac{C_{last}}{\lambda_z} $$

NCA does not require a compartmental model and can describe a nonlinear profile. However, interpreting Dose/AUC as a constant clearance or extrapolating proportionally between doses assumes kinetics that are sufficiently **linear** in the studied range. Extrapolation to infinity also assumes a well-defined log-linear **terminal phase**.

**Note —** this track deepens the introductory chapter of the core track; the next chapters detail the AUC, derived parameters and the oral case.
<!-- /step -->

<!-- step:title="Worked example" viz="04_ThreeApproaches" -->
In **bioequivalence**, we compare the AUC and Cmax of a generic vs the reference: NCA is enough, because we seek not a mechanism but **exposure equivalence**.

Regulators (EMA, FDA) generally rely on the **90% CI for the test/reference ratio of geometric means** of AUC and Cmax, often after log transformation, within the applicable limits (often 80–125% for non-scaled average bioequivalence).
<!-- /step -->

<!-- step:title="Common pitfall" -->
NCA does not excuse poor sampling.

**Pitfall —** if the **terminal phase** is poorly sampled, $\lambda_z$ and the extrapolated AUC are wrong. NCA can describe nonlinear data, but simple clearance and dose-proportionality interpretations assume linear kinetics: at saturating doses (TMDD, Michaelis-Menten), AUC is no longer proportional to dose.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- NCA estimates exposure without assuming a compartmental structure.
- Pillars: AUC (exposure) and λz (apparent terminal slope).
- Reference method for bioequivalence: 90% CIs for test/reference AUC and Cmax ratios within the applicable limits.
- Caution: a well-sampled terminal phase is needed; CL and dose-proportionality interpretations require reasonable linearity.
<!-- /step -->

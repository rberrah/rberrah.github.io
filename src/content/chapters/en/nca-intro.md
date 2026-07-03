---
id: "nca-intro"
slug: "nca-intro"
title: "Principles of non-compartmental analysis"
description: "Estimating exposure without assuming a structure: the assumptions and scope of NCA."
summary: "What NCA is, what it assumes (linearity, terminal phase) and when to prefer it over a model."
track: "nca"
order: 80
duration: "11 min"
level: "beginner"
tags: ["nca", "auc", "exposure", "regulatory"]
slides: []
quiz:
  - prompt: "NCA differs from a compartmental model because it..."
    options:
      - "assumes no compartmental structure"
      - "always requires 3 compartments"
      - "ignores concentrations"
    correct: 0
  - prompt: "NCA mainly assumes kinetics that are..."
    options:
      - "linear (proportional to dose)"
      - "always non-linear"
      - "without elimination"
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
NCA rests on two pillars: the **AUC** (exposure) and the terminal slope $\lambda_z$ (elimination).

$$ \text{AUC}_{0-\infty} = \text{AUC}_{0-t_{last}} + \frac{C_{last}}{\lambda_z} $$

It assumes **linear** kinetics (AUC proportional to dose) and a well-defined log-linear **terminal phase**.

**Note —** this track deepens the introductory chapter of the core track; the next chapters detail the AUC, derived parameters and the oral case.
<!-- /step -->

<!-- step:title="Worked example" viz="04_ThreeApproaches" -->
In **bioequivalence**, we compare the AUC and Cmax of a generic vs the reference: NCA is enough, because we seek not a mechanism but **exposure equivalence**.

Regulators (EMA, FDA) indeed require NCA criteria (AUC/Cmax ratios within 80–125%).
<!-- /step -->

<!-- step:title="Common pitfall" -->
NCA does not excuse poor sampling.

**Pitfall —** if the **terminal phase** is poorly sampled, $\lambda_z$ and the extrapolated AUC are wrong. And NCA assumes **linearity**: at saturating doses (TMDD, Michaelis-Menten), the AUC is no longer proportional to dose and NCA misleads.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- NCA estimates exposure without assuming a compartmental structure.
- Pillars: AUC (exposure) and λz (terminal elimination slope).
- Reference method for bioequivalence (regulatory criteria).
- Assumes linearity and a well-sampled terminal phase.
<!-- /step -->

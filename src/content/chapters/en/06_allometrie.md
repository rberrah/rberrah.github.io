---
id: "allometrie"
slug: "allometrie"
title: "Covariates and allometry"
description: "How weight, renal function and other covariates explain part of the variability."
summary: "A student-oriented introduction to covariate models, centering and allometric scaling."
track: "core"
order: 6
duration: "14 min"
level: "intermediate"
tags: ["covariates", "allometry", "weight", "model-building"]
slides: ["s18", "s19", "s20", "s21", "s22"]
quiz:
  - prompt: "A covariate is useful when it..."
    options:
      - "explains part of a parameter's variability"
      - "only makes the model longer"
      - "removes the need for diagnostics"
    correct: 0
  - prompt: "Centering weight at 70 kg helps because..."
    options:
      - "the typical parameter stays interpretable"
      - "all patients become 70 kg"
      - "the model no longer needs units"
    correct: 0
  - prompt: "Allometry often scales clearance with weight using an exponent near..."
    options:
      - "0.75"
      - "7.5"
      - "75"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s19" viz="14_AllometryCentering" -->
Random effects tell us patients differ. Covariates ask whether part of that difference is **explainable**.

Weight, renal function, age, genotype, disease status, co-medications can all act on the parameters. A covariate model turns clinical information into a quantitative adjustment.
<!-- /step -->

<!-- step:title="Intuition" slides="s19,s20" viz="14_AllometryCentering" -->
If students have different hand sizes, table space or experience, they build differently.

A covariate is **one measured feature** that helps explain why the same instruction sheet does not work identically for everyone.

**Key point —** weight is like room size; renal function is like cleanup capacity. Covariates do not explain everything, but they reduce the **unexplained** variability.
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s20,s21" viz="14_AllometryCentering" -->
A common allometric model:

$$ CL_i = CL_{70} \left(\frac{WT_i}{70}\right)^{0.75} \qquad V_i = V_{70} \left(\frac{WT_i}{70}\right)^{1} $$

**Math —** the denominator 70 **centers** the model: $CL_{70}$ is the typical clearance for a 70 kg patient. The exponents 0.75 (clearance) and 1 (volume) come from allometric theory.
<!-- /step -->

<!-- step:title="Worked example" slides="s20" viz="14_AllometryCentering" -->
In a pediatric or mixed-weight dataset, weight often explains a visible part of the clearance and volume variability.

After adding allometry, the random effect on clearance can **shrink**: the model has moved variability from "unexplained patient difference" to "explained by weight".
<!-- /step -->

<!-- step:title="Common pitfall" slides="s22" -->
Do not add a covariate just because it is available.

**Pitfall —** a covariate should be biologically plausible, supported by the data and checked with diagnostics. Automated forward/backward selection helps but does not replace interpretation.

**In the clinic —** a statistically significant covariate is not automatically clinically useful: the effect may be real yet negligible against residual variability.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Covariates explain part of a parameter's variability.
- Centering keeps typical values interpretable.
- Allometry is a weight-based power-law scaling rule.
- Significant does not mean clinically relevant.
<!-- /step -->

---
id: "allometrie"
slug: "allometrie"
title: "Covariates and allometry"
description: "How weight, renal function, and other covariates explain part of variability."
summary: "A student-oriented introduction to covariate models, centering, and allometric scaling."
track: "core"
order: 6
duration: "14 min"
level: "intermediate"
tags: ["covariates", "allometry", "weight", "model-building"]
slides: ["s26", "s27", "s28", "s29", "s30"]
quiz:
  - prompt: "A covariate is useful when it..."
    options:
      - "explains part of parameter variability"
      - "only makes the model longer"
      - "removes the need for diagnostics"
    correct: 0
  - prompt: "Centering weight at 70 kg helps because..."
    options:
      - "the typical parameter remains interpretable"
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

<!-- step:title="Why this matters" slides="s26" viz="14_AllometryCentering" -->
Random effects tell us patients differ. Covariates ask whether some of that difference is explainable.

Weight, renal function, age, genotype, disease status, and co-medications can all affect parameters. A covariate model turns clinical information into a quantitative adjustment.
<!-- /step -->

<!-- step:title="Intuition" slides="s26,s29" viz="14_AllometryCentering" -->
If students have different hand sizes, table space, or experience, they may build differently.

A covariate is one measured feature that helps explain why the same instruction sheet does not work identically for everyone.
<!-- /step -->

<!-- step:title="Building-block metaphor" slides="s29" viz="BuildingBlocksPKPD" -->
Weight is like classroom size. A larger classroom may need more space before the same number of blocks looks crowded.

Renal function is like cleanup capacity. A stronger cleanup team removes blocks faster.

Covariates do not explain everything, but they can reduce unexplained variability.
<!-- /step -->

<!-- step:title="Minimal math" slides="s27,s28" viz="14_AllometryCentering" -->
A common allometric model is:

$$ CL_i = CL_{70} \left(\frac{WT_i}{70}\right)^{0.75} $$

and:

$$ V_i = V_{70} \left(\frac{WT_i}{70}\right)^1 $$

The denominator 70 centers the model, so $CL_{70}$ means typical clearance for a 70 kg patient.
<!-- /step -->

<!-- step:title="Worked example" slides="s30" viz="14_AllometryCentering" -->
In a pediatric or mixed-weight dataset, weight often explains a visible part of clearance and volume variability.

After adding allometry, the random effect on clearance may shrink because the model has moved some variability from "unexplained patient difference" to "explained by weight."
<!-- /step -->

<!-- step:title="Common trap" slides="s28" -->
Do not add covariates because they are available.

A covariate should be biologically plausible, supported by data, and checked with diagnostics. Automated forward and backward selection can help, but it cannot replace interpretation.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Covariates explain part of parameter variability.
- Centering keeps typical values interpretable.
- Allometry is a common weight-based scaling rule.
- A statistically significant covariate is not automatically a clinically useful one.
<!-- /step -->

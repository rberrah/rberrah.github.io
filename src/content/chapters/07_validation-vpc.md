---
id: "validation-vpc"
slug: "validation-vpc"
title: "Diagnostics and VPC"
description: "How to check whether a model is useful, not only fitted."
summary: "A practical introduction to observed-versus-predicted plots, residuals, and visual predictive checks."
track: "core"
order: 7
duration: "13 min"
level: "intermediate"
tags: ["diagnostics", "vpc", "residuals", "validation"]
slides: ["s31", "s42", "s45", "s46", "s47", "s48", "s49", "s50", "s51", "s52", "s53", "s54", "s55", "s56"]
quiz:
  - prompt: "A VPC compares observed data with..."
    options:
      - "simulated data from the fitted model"
      - "only the first patient's data"
      - "a table of drug prices"
    correct: 0
  - prompt: "A good diagnostic workflow asks whether..."
    options:
      - "the model reproduces important data patterns"
      - "the objective function is the only thing that matters"
      - "all residuals must be exactly zero"
    correct: 0
  - prompt: "A common diagnostic trap is..."
    options:
      - "checking plots"
      - "declaring success from one metric only"
      - "simulating from the model"
    correct: 1
---

<!-- step:title="Why this matters" slides="s31,s42" viz="17_VPCCrashTest" -->
Fitting a model is not the same as trusting it.

Diagnostics ask whether the model reproduces the patterns that matter for learning and prediction. A model can converge and still be misleading.
<!-- /step -->

<!-- step:title="Intuition" slides="s45" viz="17_VPCCrashTest" -->
After students build their constructions, you compare the instruction sheet with what the class actually produced.

If the model predicts towers but students made bridges, the problem is not a small numerical detail. The instruction sheet is missing the main structure.
<!-- /step -->

<!-- step:title="Building-block metaphor" slides="s46,s47" viz="BuildingBlocksPKPD" -->
Diagnostics are quality control.

- Observed versus predicted: did the instruction sheet aim in the right direction?
- Residuals: where are the mismatches?
- VPC: if we let many simulated classes build from the same instruction sheet, do their results look like the real class?
<!-- /step -->

<!-- step:title="Minimal math" slides="s55" viz="17_VPCCrashTest" -->
A residual is a difference between observation and prediction:

$$ e_{ij} = y_{ij} - \hat{y}_{ij} $$

Weighted residuals scale that difference by expected variability. They help show whether errors are larger than the model expects.
<!-- /step -->

<!-- step:title="Worked example" slides="s48,s49,s54" viz="17_VPCCrashTest" -->
For warfarin, suppose early concentrations are systematically underpredicted.

That could suggest an absorption problem, a lag time issue, or a structural mismatch. A VPC can reveal whether the model captures the median trend and the spread across time.
<!-- /step -->

<!-- step:title="Common trap" slides="s50,s51,s52,s53" -->
Do not validate a model with one plot.

Observed-versus-predicted plots, residuals, parameter precision, shrinkage, VPCs, and clinical plausibility answer different questions. A strong workflow uses them together.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Diagnostics test model usefulness, not just convergence.
- VPCs compare observed data to simulations from the fitted model.
- Systematic residual patterns are clues, not annoyances.
- A model is credible when statistics, plots, and clinical interpretation agree.
<!-- /step -->

---
id: "validation-vpc"
slug: "validation-vpc"
title: "Diagnostics and VPC"
description: "How to check that a model is useful, not just fitted."
summary: "A practical introduction to observed-vs-predicted plots, residuals and visual predictive checks."
track: "core"
order: 9
duration: "13 min"
level: "intermediate"
tags: ["diagnostics", "vpc", "residuals", "validation"]
slides: ["s43", "s44", "s46", "s47", "s48", "s49", "s50", "s51", "s52", "s25"]
quiz:
  - prompt: "A VPC compares observed data with..."
    options:
      - "data simulated from the fitted model"
      - "only the first patient's data"
      - "a table of drug prices"
    correct: 0
  - prompt: "A good diagnostic workflow asks whether..."
    options:
      - "the model reproduces the important patterns in the data"
      - "the objective function is the only thing that matters"
      - "all residuals must be exactly zero"
    correct: 0
  - prompt: "A common diagnostic pitfall is..."
    options:
      - "looking at plots"
      - "declaring success from a single metric"
      - "simulating from the model"
    correct: 1
---

<!-- step:title="Why this chapter" slides="s44" viz="17_VPCCrashTest" -->
Fitting a model is not the same as trusting it.

Diagnostics ask whether the model **reproduces the patterns** that matter for learning and prediction. A model can converge and still be misleading.
<!-- /step -->

<!-- step:title="Intuition" slides="s48" viz="17_VPCCrashTest" -->
Once the constructions are done, you compare the instruction sheet with what the class actually produced.

**Key point —** if the model predicts towers but students made bridges, the problem is not a small numerical detail: the sheet misses the main structure.
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s43" viz="17_VPCCrashTest" -->
A residual is a gap between observation and prediction:

$$ e_{ij} = y_{ij} - \hat{y}_{ij} $$

Weighted residuals scale that gap to the expected variability.

**Math —** a VPC goes further: let **many** simulated classes build from the same sheet, then check whether the simulated median and spread cover the observations, time-bin by time-bin.
<!-- /step -->

<!-- step:title="Worked example" slides="s46,s47" viz="17_VPCCrashTest" -->
For warfarin, suppose early concentrations are systematically under-predicted.

This may point to an absorption issue, a lag time, or a structural mismatch. A VPC reveals whether the model captures both the median trend and the spread over time.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s50,s51,s52" -->
Do not validate a model with a single plot.

**Pitfall —** observed-vs-predicted, residuals, parameter precision, shrinkage, VPC and clinical plausibility answer **different** questions. A good workflow uses them together; being satisfied with one metric is the classic mistake.
<!-- /step -->

<!-- step:title="The bootstrap" slides="s25" -->
How do we know the model is robust, or simply lucky with these patients?

The **bootstrap** resamples the study (with replacement) to create hundreds of virtual studies, then re-fits the model on each.

**Key point —** you get a **confidence interval** for each parameter: a narrow 95% CI signals a stable model; a wide CI reveals a fragile estimate.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Diagnostics test the model's usefulness, not just its convergence.
- VPCs compare observations to simulations from the fitted model.
- A systematic residual pattern is a clue, not a nuisance.
- A model is credible when statistics, plots and clinical interpretation agree.
<!-- /step -->

---
id: "ai-featselect"
slug: "ai-featselect"
title: "Variable selection: VSURF and OrdinalForest"
description: "Choosing the covariates that really matter — and handling an ordinal response — with random forests."
summary: "Variable importance, automatic selection with VSURF, and forests for ordinal responses (OrdinalForest)."
track: "ai"
order: 17
duration: "12 min"
level: "advanced"
tags: ["ai", "feature-selection", "vsurf", "ordinal-forest"]
slides: []
quiz:
  - prompt: "VSURF selects variables by..."
    options:
      - "two steps (interpretation then prediction) based on forest importance"
      - "keeping all variables"
      - "drawing at random"
    correct: 0
  - prompt: "OrdinalForest is designed for a response that is..."
    options:
      - "ordinal (ordered categories, e.g. toxicity grades)"
      - "strictly continuous"
      - "binary only"
    correct: 0
  - prompt: "Keeping noise variables (near-zero importance)..."
    options:
      - "degrades generalisation (overfitting)"
      - "always improves the model"
      - "has no effect"
    correct: 0
---

<!-- step:title="Why this chapter" -->
With dozens of candidate covariates, we want to know **which to keep** for predictive power — for a simpler, more robust, more interpretable model.

Two tools from the random-forest community are especially useful: **VSURF** (selection) and **OrdinalForest** (ordinal response).
<!-- /step -->

<!-- step:title="Intuition" viz="42_VarImportance" -->
A forest assigns each covariate an **importance** (loss of performance when it is scrambled). We rank, then **cut** at the right level.

Too low: we keep noise. Too high: we discard useful variables. Move the threshold and watch which covariates survive.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="42_VarImportance" -->
**Permutation importance** measures the rise in error when variable $j$ is randomly permuted:

$$ VI_j = \frac{1}{B}\sum_{b} \big(\,err_b^{\text{perm}(j)} - err_b\,\big) $$

**VSURF** automates the decision in three steps: (1) **thresholding** (remove noise), (2) **interpretation** (keep all related variables), (3) **prediction** (minimal subset that predicts well).

**OrdinalForest** adapts the forest to an **ordinal** response (ordered categories) by optimising partition scores — ideal for **grades** (toxicity 0→4, RECIST).

**Ref —** Genuer R., Poggi J.-M. & Tuleau-Malot C., *VSURF: Variable Selection Using Random Forests* (Pattern Recognition Letters 2010; R package, R Journal 2015); Hornung R., *Ordinal Forests* (J. Classif. 2020). See also **MLU-Explain**, https://mlu-explain.github.io.
<!-- /step -->

<!-- step:title="Worked example" viz="42_VarImportance" -->
For a **haematological toxicity** model (grades 0 to 4), OrdinalForest respects the order of the grades; VSURF isolates the key covariates (CrCl, weight, genotype) among dozens of candidates.

The result is a **parsimonious** model: fewer variables, better generalisation, a clearer clinical message.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Importance is not causality — and depends on correlations.

**Pitfall —** two **correlated** covariates share their importance (one can mask the other). An important variable is not necessarily **causal**. Finally, redoing selection inside cross-validation is essential to avoid overestimating performance.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Importance (by permutation) ranks covariates by predictive power.
- VSURF selects in two stages: interpretation (all that matters) then prediction (minimal).
- OrdinalForest handles ordinal responses (toxicity grades, RECIST).
- Beware correlations, causality and leakage in validation.
<!-- /step -->

---
id: "ai-boosting"
slug: "ai-boosting"
title: "Gradient boosting: XGBoost and CatBoost"
description: "Adding small trees that progressively correct errors: a powerful family for tabular data."
summary: "Gradient boosting, XGBoost (regularised, second order) and CatBoost (ordered boosting, categories)."
track: "ai"
order: 15
duration: "14 min"
level: "advanced"
tags: ["ai", "xgboost", "catboost", "gradient-boosting"]
slides: []
prerequisites: ["ai-trees"]
glossary: ["XGBoost","White / black / grey box"]
sources: ["friedman-gbm","chen-xgboost","prokhorenkova-catboost","woillard-ml-tacrolimus"]
reviewed_on: "2026-07-09"
review_type: "author"
review_pending: true
reviewed_hash: "6003f34a1b25cf8ac3217eb34b132b29bd8c4a405632474fdd7b466c9fcfa232"
quiz:
  - prompt: "The principle of gradient boosting is to..."
    options:
      - "add trees sequentially that correct the residuals (the gradient)"
      - "average deep trees trained independently in parallel"
      - "train a single very deep tree covering all interactions"
    correct: 0
  - prompt: "Compared with plain gradient boosting, XGBoost mainly adds..."
    options:
      - "regularisation and second-order optimisation"
      - "bootstrap aggregation of the trees to reduce variance"
      - "systematic pruning of each tree after training"
    correct: 0
  - prompt: "CatBoost is particularly suited when..."
    options:
      - "there are many categorical variables"
      - "there are very many continuous numerical variables"
      - "the dataset is too small for any other model"
    correct: 0
---

<!-- step:title="Why this chapter" -->
On **tabular** data, **gradient boosting** methods (XGBoost, CatBoost, LightGBM) are frequent predictive references. Performance nevertheless depends on the dataset, tuning, validation and comparator; they are not intrinsically superior to a pharmacometric model.

They build on the trees of the previous chapter, but assembled differently.
<!-- /step -->

<!-- step:title="Intuition" viz="40_TreeEnsemble" -->
A forest **averages** several trees. **Boosting** works differently: it starts with a prediction, then adds a small tree to improve it. With squared-error loss, the new tree tries to correct the gaps between predicted and observed values (the **residuals**).

**Example:** if the model predicts an AUC of 80 but the observed value is 100, the error is 20. A new tree can learn to correct part of that gap. This does not guarantee equally good predictions in new patients.

Switch the module to "Boosting" mode and increase the iterations: the fit sharpens step by step, like a progressive focus.
<!-- /step -->

<!-- step:title="The formula, unpacked" -->
The **additive** model is built in stages. At iteration $m$:

$$ F_m(x) = F_{m-1}(x) + \nu\, h_m(x) $$

Here, $h_m$ is the next tree, which aims to reduce prediction error, and $\nu$ is a **small multiplier** that limits each added correction (the learning rate). The **gradient** tells us which way to change a prediction to reduce the error; for squared-error loss, it is related to the residuals. **XGBoost** also discourages unnecessarily complex trees (**regularization**) and takes account of how the error curve bends (**second order**):

$$ \mathcal{L} = \sum_i \ell(y_i,\hat y_i) + \sum_k \Omega(f_k),\qquad \Omega(f)=\gamma T + \tfrac{1}{2}\lambda\lVert w\rVert^2 $$

**CatBoost** adds *ordered boosting* and native handling of **categorical variables**, designed in part to limit bias from using the target when encoding them.

**Ref —** Friedman J.H., *Greedy function approximation* (gradient boosting), Ann. Statist. 2001; Chen & Guestrin, *XGBoost*, KDD 2016; Prokhorenkova et al., *CatBoost*, NeurIPS 2018. Tree foundations: **MLU-Explain**, https://mlu-explain.github.io.
<!-- /step -->

<!-- step:title="Worked example" -->
To predict **exposure** from covariates and sparse samples, an XGBoost tuned within training data can be compared with a Bayesian estimator in independent patients. Either may outperform the other for a given design and population; no general hierarchy follows without that comparison.

CatBoost is designed to handle **categorical** covariates directly (centre, formulation, genotype coded as classes), but a centre identifier may also learn an effect that does not transport.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Boosting overfits fast if left unchecked.

**Pitfall —** too many trees, too large a $\nu$, or too deep trees → the model learns the **noise**. You need honest **validation** (early stopping, cross-validation) and must distrust optimistic scores evaluated on the training data.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Boosting adds trees one after another to gradually reduce prediction errors.
- $F_m = F_{m-1} + \nu\,h_m$; the learning rate $\nu$ controls the pace.
- XGBoost: regularised + second-order objective; CatBoost: ordered boosting + categories.
- Powerful on tabular data, but overfits without validation (early stopping).
<!-- /step -->

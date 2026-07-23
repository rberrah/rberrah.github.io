---
id: "ai-boosting"
slug: "ai-boosting"
title: "Gradient boosting: XGBoost and CatBoost"
description: "Adding small trees that fix the previous one's errors: the models that win on tabular data."
summary: "Gradient boosting, XGBoost (regularised, second order) and CatBoost (ordered boosting, categories)."
track: "ai"
order: 15
duration: "14 min"
level: "advanced"
tags: ["ai", "xgboost", "catboost", "gradient-boosting"]
slides: []
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
On **tabular** data, **gradient boosting** methods (XGBoost, CatBoost, LightGBM) are often the top performers — the first reflex in competitions and increasingly used in pharmacometrics (AUC estimation, TDM).

They build on the trees of the previous chapter, but assembled differently.
<!-- /step -->

<!-- step:title="Intuition" viz="40_TreeEnsemble" -->
Where a forest **averages** independent trees, boosting adds them **sequentially**: each new tree corrects the **errors** (residuals) left by the sum of the previous ones.

Switch the module to "Boosting" mode and increase the iterations: the fit sharpens step by step, like a progressive focus.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="40_TreeEnsemble" -->
The **additive** model is built in stages. At iteration $m$:

$$ F_m(x) = F_{m-1}(x) + \nu\, h_m(x) $$

where $h_m$ fits the **negative gradient** of the loss (residuals for squared loss) and $\nu$ is the **learning rate**. **XGBoost** minimises a **regularised** objective with a **second-order** approximation:

$$ \mathcal{L} = \sum_i \ell(y_i,\hat y_i) + \sum_k \Omega(f_k),\qquad \Omega(f)=\gamma T + \tfrac{1}{2}\lambda\lVert w\rVert^2 $$

**CatBoost** adds *ordered boosting* (reduces leakage bias) and native handling of **categorical variables**.

**Ref —** Friedman J.H., *Greedy function approximation* (gradient boosting), Ann. Statist. 2001; Chen & Guestrin, *XGBoost*, KDD 2016; Prokhorenkova et al., *CatBoost*, NeurIPS 2018. Tree foundations: **MLU-Explain**, https://mlu-explain.github.io.
<!-- /step -->

<!-- step:title="Worked example" viz="40_TreeEnsemble" -->
To predict an **exposure** from covariates and sparse samples, a well-tuned XGBoost (shallow depth, small $\nu$, many trees) often reaches better accuracy than a Bayesian model — given a rich training database.

CatBoost shines when covariates are **categorical** (centre, formulation, genotype coded as classes).
<!-- /step -->

<!-- step:title="Common pitfall" -->
Boosting overfits fast if left unchecked.

**Pitfall —** too many trees, too large a $\nu$, or too deep trees → the model learns the **noise**. You need honest **validation** (early stopping, cross-validation) and must distrust optimistic scores evaluated on the training data.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Boosting = trees added sequentially, each correcting the residuals (the gradient).
- $F_m = F_{m-1} + \nu\,h_m$; the learning rate $\nu$ controls the pace.
- XGBoost: regularised + second-order objective; CatBoost: ordered boosting + categories.
- Powerful on tabular data, but overfits without validation (early stopping).
<!-- /step -->

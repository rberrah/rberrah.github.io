---
id: "ai-trees"
slug: "ai-trees"
title: "Decision trees and random forests"
description: "From a single tree (steps) to a random forest (a robust average): the building blocks of tabular ML."
summary: "CART trees, bagging, random forests: how rules are learned from covariates."
track: "ai"
order: 14
duration: "14 min"
level: "intermediate"
tags: ["ai", "random-forest", "decision-tree", "machine-learning"]
slides: []
quiz:
  - prompt: "A single decision tree produces a function that is..."
    options:
      - "piecewise-constant (steps), prone to overfitting"
      - "always linear"
      - "always smooth"
    correct: 0
  - prompt: "A random forest improves on a single tree by..."
    options:
      - "averaging many decorrelated trees (bagging + random feature subsets)"
      - "increasing the depth of one tree"
      - "deleting covariates"
    correct: 0
  - prompt: "A forest's variable importance is used to..."
    options:
      - "spot the most predictive covariates"
      - "set the dose"
      - "compute the AUC by trapezoids"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Pharmacometric data are often **tabular**: covariates (weight, CrCl, genotype…) → a response (AUC, concentration, effect). **Trees** and **forests** learn rules directly from these tables, with no mechanistic model.

They are the building blocks of most "classic" ML methods useful for TDM.
<!-- /step -->

<!-- step:title="Intuition" viz="40_TreeEnsemble" -->
A **tree** asks successive questions ("CrCl < 60?") and splits the space into zones where the response is assumed constant: hence a **step** prediction.

A deep tree fits the noise (overfitting). The **forest** idea: build many slightly different trees and **average** them — the result smooths and generalises better. Try the "Tree" then "Forest" modes.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="40_TreeEnsemble" -->
At each node a tree picks the split that **reduces impurity** the most. For regression, we minimise the residual variance:

$$ \text{split}^\star = \arg\min_{s}\ \big[\,SSE(\text{left}) + SSE(\text{right})\,\big] $$

A **random forest** (Breiman) combines two decorrelation ingredients: **bagging** (each tree on a bootstrap sample) and a **random subset of variables** at each node. The prediction is the average:

$$ \hat y(x) = \frac{1}{B}\sum_{b=1}^{B} T_b(x) $$

**Ref —** Breiman L., *Random Forests*, Machine Learning 2001. Visual explanations: **MLU-Explain** (Amazon Machine Learning University), https://mlu-explain.github.io — see "Decision Trees" and "Random Forest".
<!-- /step -->

<!-- step:title="Worked example" viz="40_TreeEnsemble" -->
To estimate the **AUC** of an immunosuppressant from 2–3 concentrations and covariates, a random forest captures interactions (e.g. genotype × dose) that a linear regression would miss.

It also provides a **variable importance** (next chapter, VSURF), useful to know *which* covariates matter.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A forest does not extrapolate.

**Pitfall —** a tree predicts a **constant** outside the training range: the forest does not guess beyond the observed data. And high importance does not imply a **causal** relationship — only predictive power in this dataset.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- A tree splits the covariate space → step prediction, overfitting if too deep.
- The random forest averages many decorrelated trees (bagging + random variables).
- It captures interactions and provides variable importance.
- It does not extrapolate; importance ≠ causality.
<!-- /step -->

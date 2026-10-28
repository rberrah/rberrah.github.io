---
id: "ai-trees"
slug: "ai-trees"
title: "Decision trees and random forests"
description: "From a single tree (steps) to a random forest (a lower-variance average): the building blocks of tabular ML."
summary: "CART trees, bagging, random forests: how rules are learned from covariates."
track: "ai"
order: 14
duration: "14 min"
level: "intermediate"
tags: ["ai", "random-forest", "decision-tree", "machine-learning"]
slides: []
prerequisites: ["math-stats"]
glossary: ["White / black / grey box","XGBoost"]
sources: ["breiman-rf","efron-bootstrap","hastie-esl"]
reviewed_on: "2026-07-09"
review_type: "author"
review_pending: true
reviewed_hash: "f14d4ab6f8e0e49bcde23bdf2f3ada2a7c6528a5530b04279c815534707b3e1f"
quiz:
  - prompt: "A single decision tree produces a function that is..."
    options:
      - "piecewise-constant (steps), prone to overfitting"
      - "piecewise-linear, with a fitted slope in each region"
      - "smooth and continuous, interpolating between the leaves"
    correct: 0
  - prompt: "A random forest improves on a single tree by..."
    options:
      - "averaging many decorrelated trees (bagging + random feature subsets)"
      - "growing a single very detailed tree without any depth limit"
      - "aggressively pruning a single tree to cut its residual variance"
    correct: 0
  - prompt: "A forest's variable importance is used to..."
    options:
      - "spot the most predictive covariates"
      - "measure the causal effect of each covariate on the response"
      - "rank the patients according to their covariate profile"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Pharmacometric data are often **tabular**: covariates (weight, CrCl, genotype…) → a response (AUC, concentration, effect). **Trees** and **forests** learn rules directly from these tables, with no mechanistic model.

They are the building blocks of most "classic" ML methods useful for TDM.
<!-- /step -->

<!-- step:title="Intuition" viz="40_TreeEnsemble" -->
A **tree** asks successive questions ("CrCl < 60?") and splits the space into zones where the response is assumed constant: hence a **step** prediction.

A very detailed tree may learn peculiarities of the training patients rather than a rule that works elsewhere: this is **overfitting**. A **forest** tackles this problem by building several trees and averaging their predictions. If the trees make different mistakes, some may cancel out. But when all the trees make the same mistake, the average can still be wrong. Try "Tree", then "Forest", then move the patient profile beyond the range used for training.
<!-- /step -->

<!-- step:title="The formula, unpacked" -->
At each step, the tree looks for a split that groups patients with similar outcomes. For example, splitting by weight may make AUC values more alike *within* each group. We measure the remaining differences with the **sum of squared errors (SSE)**:

$$ \text{split}^\star = \arg\min_{s}\ \big[\,SSE(\text{left}) + SSE(\text{right})\,\big] $$

A **random forest** grows trees using different random samples of patients (**bootstrap**). Each question also considers a random subset of variables, so the trees are not identical. For a new patient, we simply **average** their predictions:

$$ \hat y(x) = \frac{1}{B}\sum_{b=1}^{B} T_b(x) $$

**Ref —** Breiman L., *Random Forests*, Machine Learning 2001. Visual explanations: **MLU-Explain** (Amazon Machine Learning University), https://mlu-explain.github.io — see "Decision Trees" and "Random Forest".
<!-- /step -->

<!-- step:title="Worked example" -->
To estimate the **AUC** of an immunosuppressant from 2–3 concentrations and covariates, a random forest can learn interactions (e.g. genotype × dose) that a linear regression without interaction terms would not represent.

It also provides a **variable importance** (next chapter, VSURF), useful to know *which* covariates matter.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A standard regression forest does not naturally extrapolate.

**Pitfall —** a tree predicts a **constant** in each leaf; a standard regression forest averages learned outcomes and does not extend a trend beyond the observed domain. High importance also does not imply a **causal** relationship — only a predictive contribution in this dataset and algorithm.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- A tree splits the covariate space → step prediction, overfitting if too deep.
- A forest averages several different trees: some errors cancel out, but the average can still be wrong.
- It captures interactions and provides variable importance.
- It does not extrapolate; importance ≠ causality.
<!-- /step -->

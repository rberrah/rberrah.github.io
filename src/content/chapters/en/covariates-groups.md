---
id: "covariates-groups"
slug: "covariates-groups"
title: "Categorical covariates, thresholds and clusters"
description: "Distinguish observed categories, imposed cutoffs and latent subpopulations."
summary: "Distinguish observed categories, imposed cutoffs and latent subpopulations."
track: "covariates"
order: 2
duration: "12 min"
level: "intermediate"
tags: ["covariates","PK","PD"]
prerequisites: ["covariates-basics"]
glossary: []
slides: []
sources: ["monolix-covariates","hastie-esl","lavielle"]
reviewed_on: "2026-09-29"
quiz: [{"prompt":"For an exponential A/B ratio of 0.7, beta is…","options":["log(0.7)","0.7","exp(0.7)"],"correct":0},{"prompt":"A cluster is…","options":["a learned group whose relevance needs assessment","necessarily a genotype","proof of a biological mechanism"],"correct":0},{"prompt":"Selecting and validating a cutoff on the same data…","options":["can overstate performance","eliminates overfitting","makes external validation unnecessary"],"correct":0}]
---

<!-- step:title="Why this chapter" viz="CovariateGroups" -->
A genotype is an observed category; a threshold-defined stage is a transformation; a cluster is learned by an algorithm. A mixture model treats membership as latent. These are not interchangeable concepts.
<!-- /step -->

<!-- step:title="Intuition" -->
For categories A, B and C, use a reference and two indicators to avoid confounding contrasts with the reference. Numeric genotype codes do not imply a linear unit effect.

Discretizing a continuous covariate can simplify a decision, but loses information and introduces jumps. Justify physiological thresholds rather than selecting and evaluating them on the same patients.
<!-- /step -->

<!-- step:title="The formula unpacked" -->
With B as reference:
$$ CL_i=CL_B\exp\{\beta_A I(G_i=A)+\beta_C I(G_i=C)+\eta_i\}. $$
A/B and C/B ratios are $\exp(\beta_A)$ and $\exp(\beta_C)$. A ratio of 0.7 therefore requires $\beta_A=\log(0.7)$, not $\beta_A=0.7$.

For latent class $Z_i$, the likelihood integrates membership:
$$ p(y_i\mid x_i)=\sum_k \pi_k(x_i)\,p(y_i\mid Z_i=k,x_i). $$
Assigning the most probable group does not remove classification uncertainty.
<!-- /step -->

<!-- step:title="Worked example" viz="CovariateGroups" -->
Reference CL = 4 L/h and ratios 0.7 / 1 / 1.3 give typical clearances of 2.8 / 4 / 5.2 L/h.

The workshop compares these categories or fictional weight thresholds. It **does not fit a clustering algorithm**. For actual clustering, standardize variables within training data, learn groups there, freeze the assignment rule and apply it to new individuals.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Constructing clusters from observed AUC and then claiming to predict AUC for an unmeasured patient using those clusters leaks outcome information. Even unsupervised clustering belongs within training folds during cross-validation.

Learned groups may reflect center, assay or missingness rather than phenotype. Assess stability, group size and uncertainty of contrasts.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Known category: indicators and an explicit reference.
- Continuous covariate: retain continuity unless justified.
- Learned cluster: reproducible assignment and out-of-training validation.
- Latent class: membership probabilities, not a measured covariate.
<!-- /step -->

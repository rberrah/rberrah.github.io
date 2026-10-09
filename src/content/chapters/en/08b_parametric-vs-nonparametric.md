---
id: "parametric-vs-nonparametric"
slug: "parametric-vs-nonparametric"
title: "Population PK: parametric or nonparametric?"
description: "Two ways to estimate the distribution of individual parameters without necessarily changing the PK model."
summary: "Understand what parametric and nonparametric mean, their assumptions and their diagnostics."
track: "core"
order: 8.2
duration: "15 min"
level: "intermediate"
tags: ["population PK", "parametric", "nonparametric", "NPAG", "distribution"]
prerequisites: ["variabilite-iiv-iov","outils-estimation"]
glossary: ["Effets mixtes","Vraisemblance","NPAG"]
slides: []
sources: ["goutelle-parametric-nonparametric","neely-pmetrics","yamada-npag"]
reviewed_on: "2026-09-28"
review_type: "author"
quiz:
  - prompt: "In this context, parametric or nonparametric mainly describes..."
    options:
      - "how the population distribution of parameters is represented"
      - "the number of compartments in the PK model"
      - "the choice between compartmental analysis and NCA"
    correct: 0
  - prompt: "Does an NPAG distribution with two groups of points prove two biological phenotypes?"
    options:
      - "no, the signal needs confirmation and may reflect the model, data or error"
      - "yes, every estimated multimodal distribution represents two phenotypes"
      - "yes, whenever the groups have different weights"
    correct: 0
  - prompt: "Is a nonparametric method assumption-free?"
    options:
      - "no, structure, covariates, error, bounds and data quality still matter"
      - "yes, it learns the truth directly from observations"
      - "yes, provided enough support points are used"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The term **nonparametric** is often misunderstood. Here it does not mean NCA, the absence of a PK model, or a model without parameters.

Both approaches may use exactly the same compartments, differential equations, covariates and error model. What mainly changes is how the **joint distribution of individual parameters** is represented and estimated.
<!-- /step -->

<!-- step:title="Intuition" viz="03_PopulationDistrib" -->
Imagine that every patient has a pair $(CL_i,V_i)$.

- A **parametric** approach describes the cloud with a distribution family and a finite number of parameters, such as a mean, variances and covariance after log transformation.
- A **nonparametric** approach estimates possible locations in $(CL,V)$ space and their associated weights without imposing a Gaussian shape on the cloud.

**Key point:** the PK model explains concentration-time trajectories. The population distribution explains how its parameters vary among patients. These are distinct model layers.
<!-- /step -->

<!-- step:title="The formula, unpacked" -->
In a common parametric model:

$$ \log(\theta_i) \sim \mathcal N(\mu,\Omega) $$

The distributional shape is selected and its parameters $(\mu,\Omega)$ are estimated.

A nonparametric estimate of the mixing distribution can be written as:

$$ \widehat F = \sum_{k=1}^{K} w_k\,\delta_{\theta_k}, \qquad w_k \ge 0,\quad \sum_k w_k=1 $$

The $\theta_k$ are **support points** and the $w_k$ their probabilities. Both approaches maximise a population likelihood:

$$ L(F)=\prod_i \int p(y_i\mid\theta)\,dF(\theta) $$

**Mathematical detail:** “nonparametric” concerns the shape of $F$. The structure of $p(y_i\mid\theta)$, the error model and the parameter-space limits are still specified by the modeller.
<!-- /step -->

<!-- step:title="Worked example" -->
Suppose two elimination mechanisms are genuinely present and produce two clearance regions.

| Question | Parametric approach | Nonparametric approach |
|---|---|---|
| Initial population shape | often unimodal after transformation | shape not imposed |
| Population result | parameters of the chosen distribution | support points and weights |
| Multimodality | requires an explicit mixture model | may emerge in the estimate |
| Individual summary | posterior/MAP or samples | posterior over support points |

A nonparametric approach can reveal asymmetry, outliers or several modes. A parametric approach can be more parsimonious, regular and easier to communicate when its distributional assumption is adequate.

Compare stability, diagnostics, external validation and fitness for purpose rather than choosing by software preference.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A group of support points is not automatically a clinical subgroup.

An apparent multimodal pattern may result from a small sample, structural misspecification, missing covariates, unsuitable bounds or a misspecified error model. It is a hypothesis to investigate, not biological proof.

Conversely, a log-normal assumption is not wrong by definition. A reasonable parametric assumption may stabilise estimation when data are weakly informative.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Parametric and nonparametric refer here to the **population distribution**, not the PK equations.
- NPAG represents that distribution with weighted support points.
- A nonparametric method relaxes distributional shape but does not remove other assumptions.
- Multimodality requires diagnostics and confirmation before biological interpretation.
- The right choice depends on data, stability and the predictive or clinical objective.
<!-- /step -->

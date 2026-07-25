---
id: "outils-estimation"
slug: "outils-estimation"
title: "Tools and estimation"
description: "What NONMEM, Monolix, nlmixr2, FOCE-I and SAEM are really doing."
summary: "A conceptual guide to estimation tools and objective functions, not a software manual."
track: "core"
order: 8
duration: "12 min"
level: "intermediate"
tags: ["tools", "estimation", "nonmem", "monolix", "nlmixr2"]
slides: ["s10", "s38", "s39", "s40", "s41", "s42"]
quiz:
  - prompt: "Estimation means..."
    options:
      - "finding the parameter values that best explain the data"
      - "simulating concentrations from parameters already known"
      - "fitting one average curve while ignoring between-patient variability"
    correct: 0
  - prompt: "FOCE-I and SAEM are..."
    options:
      - "parameter estimation algorithms"
      - "criteria for selecting between competing models"
      - "methods for graphical model diagnostics"
    correct: 0
  - prompt: "A lower AIC is useful but..."
    options:
      - "must be read with diagnostics and plausibility"
      - "always proves the model is clinically correct"
      - "on its own guarantees good predictions in new patients"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s38" -->
Software does not make modelling automatic.

NONMEM, Monolix and nlmixr2 help **estimate** parameters, but the modeller still chooses the structure, the variability model, the covariates, the diagnostics and the interpretation.
<!-- /step -->

<!-- step:title="Intuition" slides="s41" viz="EstimationFit" -->
Estimation is trying many instruction sheets and asking which best explains the class results.

**Key point —** the computer **searches**; the modeller **decides** whether the answer makes pharmacological sense. A sheet with too many adjustable parts can match the photos while teaching the wrong lesson.
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s42" -->
Many comparisons rest on likelihood: data more plausible under the model = a better fit. AIC adds a complexity penalty:

$$ \mathrm{AIC} = -2 \log L + 2p $$

where $p$ is the number of estimated parameters.

**Math —** lowering $-2\log L$ (fitting better) is good; but each added parameter costs $+2$. AIC trades off fit against parsimony — without guaranteeing clinical relevance.

**Two main families of algorithms** approximate this likelihood, which is hard to compute exactly because of the random effects:

- **FOCE** (*First-Order Conditional Estimation*, with interaction: **FOCE-I**) — the historical method of **NONMEM**. It **linearises** the model around the most likely individual estimate, then maximises the approximate likelihood. Fast and accurate when the model is close to linear, but it can converge poorly on strongly non-linear models.
- **SAEM** (*Stochastic Approximation Expectation-Maximization*) — the method of **Monolix** (also available in NONMEM and nlmixr2). It **samples** the random effects (stochastic step) and updates the parameters over successive iterations, **without linearising**. More robust on highly non-linear models, at the cost of heavier computation.
<!-- /step -->

<!-- step:title="Worked example" slides="s39,s40" -->
In a warfarin model-building exercise, you might compare:

- one compartment vs two compartments;
- additive vs proportional residual error;
- no covariate vs a weight or genotype effect;
- direct response vs turnover response.

The best model is not just the one with the smallest objective function: it must also be **stable, interpretable and diagnostically credible**.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s41" -->
Do not confuse an algorithm with a scientific conclusion.

**Pitfall —** FOCE-I, SAEM and the like are estimation tools. They can fail, converge to a local solution, or support an over-complex model. Always check parameters, uncertainty, diagnostics and biological plausibility.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Estimation finds the model parameters from the data.
- Tools implement algorithms, not judgement.
- AIC and likelihood are useful but not sufficient.
- A stable, interpretable model beats an impressive but fragile fit.

:::note
**Going further.** This chapter is the **entry point** of the core track. The advanced track **"Tools & software"** (7 chapters) gets concrete: NONMEM, Monolix, nlmixr2, estimation algorithms, simulation and Bayesian TDM.
:::
<!-- /step -->

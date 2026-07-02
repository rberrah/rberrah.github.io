---
id: "outils-estimation"
slug: "outils-estimation"
title: "Tools and estimation"
description: "What NONMEM, Monolix, nlmixr2, FOCE-I, and SAEM are trying to do."
summary: "A conceptual guide to estimation tools and objective functions without turning it into a software manual."
track: "core"
order: 9
duration: "12 min"
level: "intermediate"
tags: ["tools", "estimation", "nonmem", "monolix", "nlmixr2"]
slides: ["s43", "s44"]
quiz:
  - prompt: "Estimation means..."
    options:
      - "finding parameter values that make the model plausible for the data"
      - "drawing a curve by hand only"
      - "removing variability from the data"
    correct: 0
  - prompt: "FOCE-I and SAEM are..."
    options:
      - "estimation algorithms"
      - "drug classes"
      - "units of clearance"
    correct: 0
  - prompt: "A lower AIC is useful but..."
    options:
      - "must be interpreted with diagnostics and plausibility"
      - "always proves the model is clinically correct"
      - "removes the need for validation"
    correct: 0
---

<!-- step:title="Why this matters" slides="s43" -->
Software does not make modeling automatic.

NONMEM, Monolix, and nlmixr2 help estimate parameters, but the modeler still chooses the structure, variability model, covariates, diagnostics, and interpretation.
<!-- /step -->

<!-- step:title="Intuition" slides="s44" -->
Estimation is like trying many instruction sheets and asking which one best explains the class results.

The computer searches. The modeler decides whether the answer makes pharmacological sense.
<!-- /step -->

<!-- step:title="Building-block metaphor" slides="s43" viz="BuildingBlocksPKPD" -->
The data are photos of many student constructions.

The estimation algorithm adjusts the instruction sheet until simulated constructions resemble the observed ones. If the instruction sheet has too many adjustable parts, it may fit the photos while teaching the wrong lesson.
<!-- /step -->

<!-- step:title="Minimal math" slides="s44" -->
Many model comparisons use a likelihood idea: more plausible data under the model means a better fit.

AIC adds a penalty for complexity:

$$ AIC = -2 \log L + 2p $$

where $p$ is the number of estimated parameters.
<!-- /step -->

<!-- step:title="Worked example" slides="s43,s44" -->
In a warfarin model-building exercise, you might compare:

- one compartment versus two compartments;
- additive versus proportional residual error;
- no covariates versus weight or genotype effects;
- direct response versus turnover response.

The best model is not just the one with the smallest objective function. It must also be stable, interpretable, and diagnostically credible.
<!-- /step -->

<!-- step:title="Common trap" slides="s44" -->
Do not confuse an algorithm with a scientific conclusion.

FOCE-I, SAEM, and related methods are estimation tools. They can fail, converge to local solutions, or support an over-complex model. Always check parameters, uncertainty, diagnostics, and biological plausibility.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Estimation finds model parameters from data.
- Tools implement algorithms, not judgement.
- AIC and likelihood are useful, but not sufficient.
- A stable, interpretable model beats an impressive but fragile fit.
<!-- /step -->

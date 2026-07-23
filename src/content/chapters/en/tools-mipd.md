---
id: "tools-mipd"
slug: "tools-mipd"
title: "Bayesian TDM in practice: mapbayr"
description: "From model to patient: MAP estimation and individual dose adjustment, with mapbayr."
summary: "TDM/MIPD tools: Bayesian (MAP) estimation from a few samples, with mapbayr (R)."
track: "tools"
order: 205
duration: "11 min"
level: "intermediate"
tags: ["tools", "mapbayr", "tdm", "mipd"]
prerequisites: ["tools-simulation", "bayes-ebes"]
glossary: ["MAP", "TDM", "EBE", "Precision dosing"]
slides: []
quiz:
  - prompt: "MAP (maximum a posteriori) estimation combines..."
    options:
      - "the population model (prior) and the patient's concentrations"
      - "only the measured concentrations, with no population prior"
      - "only the population prior, without the patient's measurements"
    correct: 0
  - prompt: "mapbayr (R) relies on..."
    options:
      - "an mrgsolve model for individual MAP estimation"
      - "an nlmixr2/rxode2 model fitted to the patient's data"
      - "a plain linear regression on the measured concentrations"
    correct: 0
  - prompt: "MIPD (model-informed precision dosing) aims to..."
    options:
      - "individualise the dose from the model and measurements"
      - "apply a fixed nomogram based on weight and renal function"
      - "estimate population parameters across an entire cohort"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The clinical culmination of pharmacometrics is **MIPD** (model-informed precision dosing): using a population model **plus** a few of a patient's samples to adjust **their** dose.

In R, **mapbayr** makes this Bayesian estimation accessible from an mrgsolve model.
<!-- /step -->

<!-- step:title="Intuition" viz="TDMProfile" -->
We start from what the **population** says (the prior). One or two measured **concentrations** update the estimate of the patient's parameters. We then simulate their curve and **adjust the dose** toward the target.

Few data suffice, because the model "fills in" what was not measured.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="BayesUpdate" -->
The **MAP** estimate maximises the posterior: it minimises the data misfit **plus** a pull toward the population:

$$ \hat\eta_i = \arg\min_{\eta}\; \underbrace{\sum_j \frac{(y_j - f_j)^2}{\sigma_j^2}}_{\text{data}} + \underbrace{\eta^\top \Omega^{-1} \eta}_{\text{prior}} $$

- **mapbayr** (R): performs this MAP estimation from an **mrgsolve model** and a few concentrations, then proposes the dose reaching the target.

**Note —** ref.: mapbayr (F. Le Louedec et al.), an open-source R package; part of Bayesian TDM (see the TDM chapter).
<!-- /step -->

<!-- step:title="Worked example" viz="TDMProfile" -->
A patient on vancomycin: a trough is measured. mapbayr estimates **their** clearance (e.g. increased), simulates their AUC₂₄, and proposes the dose reaching the AUC/MIC target — far more reliable than a fixed nomogram.

It is the same reasoning as the TDM chapter, **tooled** for practice.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A good tool does not fix a poor prior model.

**Pitfall —** MIPD inherits the chosen **population model**: an unsuitable prior (wrong population, ignored covariates) biases the estimate. Beware **shrinkage** if the samples are too sparse, and the **sampling time**, which governs the information.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- MIPD individualises the dose from the model (prior) and the patient's measurements.
- MAP estimation = data + pull toward the population; few samples suffice.
- mapbayr (R) performs the MAP from an mrgsolve model and proposes the target dose.
- Depends on the prior's quality; beware shrinkage and the sampling time.
<!-- /step -->

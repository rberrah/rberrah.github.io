---
id: "pbpk-intro"
slug: "pbpk-intro"
title: "Principles of PBPK"
description: "Building a model from physiology: organs, blood flows and mass balances."
summary: "The PBPK logic: compartments = organs linked by the circulation, perfusion vs permeability."
track: "pbpk"
order: 70
duration: "13 min"
level: "advanced"
tags: ["pbpk", "physiology", "blood-flow", "mechanistic"]
slides: []
prerequisites: ["clairance-volume-demi-vie","trois-approches"]
glossary: ["PBPK","CL","V","Q"]
sources: ["jones-rowland-yeo","kuepfer-pbpk","rowland-peck-tucker"]
updated_on: "2026-10-09"
reviewed_on: "2026-10-09"
review_type: "author"
quiz:
  - prompt: "In a PBPK model, compartments represent..."
    options:
      - "real organs linked by the blood circulation"
      - "mathematical abstractions with no physiological meaning"
      - "groups of tissues clustered by their equilibration kinetics"
    correct: 0
  - prompt: "A 'perfusion-limited' organ is limited by..."
    options:
      - "the blood flow that supplies it"
      - "the permeability of its cell membranes"
      - "its enzymatic metabolic capacity"
    correct: 0
  - prompt: "The major strength of PBPK is to..."
    options:
      - "support extrapolation across species, doses and populations when the model is qualified for that use"
      - "empirically fit its parameters to the observed data"
      - "reduce the number of parameters versus empirical models"
    correct: 0
---

<!-- step:title="Why this chapter" -->
**PBPK** (physiologically-based PK) builds the model from **real physiology**: each compartment often represents an organ or tissue, linked to the others by blood. Unlike purely empirical models, many parameters have a **biological meaning**, although scalars, lumping and fitted parameters can still be used.

A PBPK model can **support extrapolation** where data are missing — animal → human, adult → child, drug interactions — when it has been qualified for that intended use.
<!-- /step -->

<!-- step:title="Intuition" viz="01_HumanBody" -->
Picture the body as a network of organs (liver, kidneys, muscle, fat…) supplied by the circulation. The drug **circulates**, **distributes** into each tissue by affinity, and is **eliminated** where the enzymes/kidneys are.

Each organ is a small reservoir with a blood inlet and outlet.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="01_HumanBody" -->
Each tissue follows a **mass balance**. For a *perfusion-limited* organ:

$$ V_T\frac{dC_T}{dt} = Q_T\left(C_{art} - \frac{C_T}{K_{p,T}}\right) $$

- $Q_T$: organ blood flow; $V_T$: its volume;
- $K_{p,T}$: tissue/plasma **partition** coefficient (affinity);
- elimination is added in the clearing organs (liver, kidneys).

When the membrane slows entry, we switch to a *permeability-limited* model (two sub-compartments).

**Ref —** Jones H. & Rowland-Yeo K., *Basic concepts in PBPK modeling* (CPT:PSP 2013). Mechanistic modelling schools: **Leiden** (LACDR) and Simcyp/Certara.
<!-- /step -->

<!-- step:title="Worked example" viz="01_HumanBody" -->
To evaluate a PK scenario in a **child**, we adjust flows, volumes and enzyme maturities by age. The structure may be retained when that assumption is justified and checked for the population of interest.

PBPK can therefore inform selection of a paediatric dose to test or assessment of an interaction, within a defined regulatory context and after qualification for that use.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Mechanistic does not mean infallible.

**Pitfall —** a PBPK model stacks **many parameters** (flows, Kp, free fractions, enzyme activities). Each wrong assumption propagates. Without data to **verify** it (at least partially), complexity gives a false sense of certainty.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- PBPK = physiological compartments (organs) linked by blood flows.
- Perfusion-limited organ: mass balance with Q_T, V_T and the partition Kp.
- Strength: mechanistic support for cross-species, paediatric or interaction extrapolation, subject to fit-for-purpose qualification.
- Weakness: many parameters and assumptions to verify.
<!-- /step -->

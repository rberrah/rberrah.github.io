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
      - "extrapolate across species, doses and populations via physiology"
      - "empirically fit its parameters to the observed data"
      - "reduce the number of parameters versus empirical models"
    correct: 0
---

<!-- step:title="Why this chapter" -->
**PBPK** (physiologically-based PK) builds the model from **real physiology**: each compartment is an organ, linked to the others by blood. Unlike empirical models, its parameters have a **biological meaning**.

This allows **extrapolation** where data are missing: animal → human, adult → child, drug interactions.
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
To predict PK in a **child**, we adjust flows, volumes and enzyme maturities by age — the model structure stays the same.

That is why PBPK is increasingly accepted by **regulators** to justify paediatric doses or assess interactions.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Mechanistic does not mean infallible.

**Pitfall —** a PBPK model stacks **many parameters** (flows, Kp, free fractions, enzyme activities). Each wrong assumption propagates. Without data to **verify** it (at least partially), complexity gives a false sense of certainty.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- PBPK = physiological compartments (organs) linked by blood flows.
- Perfusion-limited organ: mass balance with Q_T, V_T and the partition Kp.
- Strength: cross-species, paediatric, interaction extrapolation (via physiology).
- Weakness: many parameters and assumptions to verify.
<!-- /step -->

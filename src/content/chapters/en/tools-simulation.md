---
id: "tools-simulation"
slug: "tools-simulation"
title: "Simulation: mrgsolve & rxode2"
description: "Quickly generate profiles, VPCs and virtual trials from a model."
summary: "ODE simulators in R (mrgsolve, rxode2): what they are for and how they connect to estimation."
track: "tools"
order: 204
duration: "11 min"
level: "intermediate"
tags: ["tools", "mrgsolve", "rxode2", "simulation"]
prerequisites: ["tools-nlmixr2"]
glossary: ["mrgsolve", "nlmixr2 / rxode2", "VPC", "Jumeau numérique"]
slides: []
quiz:
  - prompt: "mrgsolve and rxode2 mainly serve to..."
    options:
      - "quickly simulate ODEs and large populations (R)"
      - "estimate parameters from data"
      - "draw molecules"
    correct: 0
  - prompt: "A VPC requires..."
    options:
      - "simulating many datasets under the model"
      - "a single typical prediction"
      - "no simulation"
    correct: 0
  - prompt: "Simulating a 'virtual trial' allows one to..."
    options:
      - "evaluate designs and doses before the real trial"
      - "replace pharmacology"
      - "remove variability"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Once a model is estimated, half its value comes from **simulation**: predicting dosing scenarios, building a VPC, generating virtual trials. You need a **fast** engine able to integrate ODEs over large populations.

In R, two tools dominate: **mrgsolve** and **rxode2**.
<!-- /step -->

<!-- step:title="Intuition" viz="21_PopPKPlayground" -->
Simulating means **running the model forward**: give parameters (and their variability), a dosing regimen, and read the predicted concentrations.

Repeated over thousands of virtual patients, this yields **distributions** — the basis of the VPC and simulated trials.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="21_PopPKPlayground" -->
The simulator integrates the model's ODE system:

$$ \frac{dA}{dt} = f(A, \theta_i, t), \qquad \theta_i = \theta\cdot e^{\eta_i} $$

- **mrgsolve**: a very fast C++ integrator, designed for trial simulation and TDM (the basis of mapbayr).
- **rxode2**: the ODE engine under **nlmixr2**, usable standalone to simulate.

**Note —** simulation reuses the **estimated model** (θ, Ω, Σ). Propagate parameter **uncertainty** (not just variability) for honest predictions.
<!-- /step -->

<!-- step:title="Worked example" viz="21_PopPKPlayground" -->
For a **VPC**, we simulate hundreds of datasets under the model and compare the percentiles to the observations. For a **virtual trial**, we test several doses and sample sizes to estimate the probability of success.

mrgsolve makes these simulations near-instant, even on tens of thousands of subjects.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A simulation inherits the model's weaknesses.

**Pitfall —** "garbage in, garbage out": a simulation is reliable only if the model is **validated** and the parameter **uncertainty** is propagated. Simulating outside the data **domain** (unobserved doses, populations) is a risky extrapolation.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- mrgsolve / rxode2: fast ODE integrators in R for simulation.
- Simulating = running the model forward, with variability, over a virtual population.
- Uses: VPC, dosing scenarios, virtual trials; mrgsolve is the basis of mapbayr.
- Propagate uncertainty; do not extrapolate outside the data domain.
<!-- /step -->

---
id: "tools-monolix"
slug: "tools-monolix"
title: "Monolix — interface, mlxtran & SAEM"
description: "The 'point-and-click' software: graphical interface, the mlxtran language and the SAEM engine with built-in diagnostics."
summary: "Monolix: a graphical workflow, models in mlxtran and SAEM estimation, with VPC and diagnostics provided."
track: "tools"
order: 202
duration: "11 min"
level: "intermediate"
tags: ["tools", "monolix", "mlxtran", "saem"]
prerequisites: ["tools-algorithms"]
glossary: ["Monolix", "SAEM"]
slides: []
quiz:
  - prompt: "Monolix's default estimation engine is..."
    options:
      - "SAEM (with built-in diagnostics and VPC)"
      - "FOCE only"
      - "none"
    correct: 0
  - prompt: "mlxtran is..."
    options:
      - "the model-description language in Monolix"
      - "a raw data format"
      - "a spreadsheet"
    correct: 0
  - prompt: "Monolix's main advantage over NONMEM is..."
    options:
      - "a graphical interface and ready-made diagnostics"
      - "the absence of any statistical model"
      - "the inability to simulate"
    correct: 0
---

<!-- step:title="Why this chapter" -->
**Monolix** (Lixoft / Simulations Plus) is the "**point-and-click**" software: where NONMEM asks you to write a control file, Monolix offers a **graphical interface** guiding the whole workflow — data, model, estimation, diagnostics.

Its engine, **SAEM**, and its built-in plots have made it a standard, especially in academia and early phase.
<!-- /step -->

<!-- step:title="Intuition" viz="16_SAEMCycle" -->
You load the data, choose (or write) a model, click **Run**, and Monolix launches **SAEM** then directly shows the **diagnostics**: VPC, parameter distributions, residuals.

Exact estimation (SAEM) + immediate visualisation shorten the "estimate → diagnose → fix" loop.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="16_SAEMCycle" -->
The model is written in **mlxtran**, a readable language separating structure and statistics:

```
[LONGITUDINAL]
input = {ka, cl, v}
EQUATION:
  Cc = pkmodel(ka, V=v, Cl=cl)   ; 1-cpt oral
DEFINITION:
  y = {distribution=normal, prediction=Cc, errorModel=combined1(a,b)}

[INDIVIDUAL]
input = {cl_pop, omega_cl, v_pop, omega_v}
DEFINITION:
  cl = {distribution=logNormal, typical=cl_pop, sd=omega_cl}
  v  = {distribution=logNormal, typical=v_pop,  sd=omega_v}
```

Estimation uses **SAEM** (see the algorithms chapter), with the likelihood computed by importance sampling.

**Note —** ref.: Lixoft / Simulations Plus; Monolix documentation. mlxtran is shared by the whole MonolixSuite (Simulx for simulation).
<!-- /step -->

<!-- step:title="Worked example" viz="16_SAEMCycle" -->
On a difficult model (steep Emax, sparse data), Monolix's **SAEM** converges where FOCE would struggle, and the **built-in VPC** confirms (or refutes) the model in one click.

Many teams prototype and teach with Monolix for its **readability**, then translate to NONMEM if the regulatory dossier requires it.
<!-- /step -->

<!-- step:title="Common pitfall" -->
"Point-and-click" does not mean thoughtless.

**Pitfall —** Monolix's ease can lead to **chaining runs** without understanding. A converging SAEM and a nice VPC do not excuse checking the model's **sense**, identifiability and shrinkage. And Monolix's **OFV** (SAEM) is **not comparable** to a NONMEM FOCE run.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Monolix: graphical "point-and-click" software, SAEM engine, built-in diagnostics/VPC.
- The model is written in mlxtran (readable structure + statistics).
- Ideal for prototyping, teaching, fast iteration; MonolixSuite for simulation (Simulx).
- Do not chain runs without diagnostics; OFV not comparable to FOCE.
<!-- /step -->

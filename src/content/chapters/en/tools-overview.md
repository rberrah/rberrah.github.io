---
id: "tools-overview"
slug: "tools-overview"
title: "The software ecosystem"
description: "Estimate, simulate, individualise: which software for which task (NONMEM, Monolix, nlmixr2, mrgsolve, mapbayr)."
summary: "The map of pharmacometric tools: estimation engines, simulators and Bayesian TDM tools."
track: "tools"
order: 200
duration: "12 min"
level: "intermediate"
tags: ["tools", "software", "ecosystem"]
prerequisites: ["outils-estimation"]
glossary: ["NONMEM", "Monolix", "nlmixr2 / rxode2", "mrgsolve", "SAEM"]
slides: []
quiz:
  - prompt: "To FIT a population model to data, you use an..."
    options:
      - "estimation engine (NONMEM, Monolix, nlmixr2)"
      - "spreadsheet only"
      - "drawing tool"
    correct: 0
  - prompt: "To SIMULATE many profiles quickly (VPC, trials), you favour..."
    options:
      - "mrgsolve or rxode2 (R)"
      - "a word processor"
      - "no tool"
    correct: 0
  - prompt: "mapbayr (R) mainly serves for..."
    options:
      - "Bayesian (MAP) estimation for individual dose adjustment"
      - "drawing molecules"
      - "accounting"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Pharmacometrics relies on **software**. Choosing the right one for the task saves precious time — and avoids errors.

This chapter draws the **map**: each major task (estimate, simulate, individualise) has a family of tools.
<!-- /step -->

<!-- step:title="Intuition" viz="16_SAEMCycle" -->
Three major tasks structure a project:

- **Estimate**: fit a mixed-effects (NLME) model to data;
- **Simulate**: generate profiles, VPCs, virtual trials;
- **Individualise**: estimate a patient's parameters and adjust their dose (TDM/MIPD).

Each tool excels at one of them.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="16_SAEMCycle" -->
The map of tools:

- **Estimation** — **NONMEM** (historical reference, FOCE/SAEM, control files), **Monolix** (SAEM, graphical interface), **nlmixr2** (open-source in **R**, SAEM/FOCEI).
- **Simulation** — **mrgsolve** and **rxode2** (in **R**, very fast for ODEs and large populations).
- **TDM / MIPD** — **mapbayr** (**R**, **MAP** Bayesian estimation from an mrgsolve model), plus dedicated clinical platforms.

**Note —** languages: NONMEM (`.ctl/.mod` files), R (nlmixr2, mrgsolve, rxode2, mapbayr). Open-source (nlmixr2, mrgsolve, mapbayr) vs commercial (NONMEM, Monolix). Links in "Further reading".
<!-- /step -->

<!-- step:title="Worked example" viz="16_SAEMCycle" -->
A typical project chains the tools: **estimate** the PopPK model (NONMEM, Monolix or nlmixr2) → **simulate** the VPC and dosing scenarios (mrgsolve) → deploy **Bayesian TDM** at the bedside (mapbayr).

Many teams combine: an estimation engine **and** the R ecosystem for simulation and graphics.
<!-- /step -->

<!-- step:title="Common pitfall" -->
The tool does not do the science.

**Pitfall —** software that **converges** does not guarantee a **good model**: diagnostics remain essential. Beware also of **method differences** (FOCE-I vs SAEM) that change the OFV, and of **reproducibility** (versions, random seeds). The tool is a means, not a proof.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Three tasks: estimate (NONMEM/Monolix/nlmixr2), simulate (mrgsolve/rxode2), individualise (mapbayr).
- Open-source (R) vs commercial; teams often combine several tools.
- Convergence ≠ a good model; always diagnose and document versions.
- The choice depends on the task, the team and the constraints (regulatory, cost).
<!-- /step -->

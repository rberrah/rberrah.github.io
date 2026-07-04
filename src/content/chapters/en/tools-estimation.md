---
id: "tools-estimation"
slug: "tools-estimation"
title: "Estimation engines"
description: "NONMEM, Monolix, nlmixr2: fitting an NLME model to data, between FOCE and SAEM."
summary: "Comparing population estimation engines: algorithms (FOCE-I, SAEM), languages and ecosystems."
track: "tools"
order: 201
duration: "12 min"
level: "intermediate"
tags: ["tools", "nonmem", "monolix", "nlmixr2", "estimation"]
prerequisites: ["tools-overview", "outils-estimation"]
glossary: ["NONMEM", "Monolix", "SAEM", "FOCE-I", "OFV"]
slides: []
quiz:
  - prompt: "NONMEM is historically..."
    options:
      - "the reference for population estimation (control files, FOCE/SAEM)"
      - "a spreadsheet"
      - "a molecular-drawing tool"
    correct: 0
  - prompt: "nlmixr2 stands out mainly for..."
    options:
      - "being open-source, in R (SAEM/FOCEI)"
      - "having no algorithm at all"
      - "being unable to simulate"
    correct: 0
  - prompt: "SAEM and FOCE-I are two..."
    options:
      - "maximum-likelihood estimation algorithms"
      - "types of dose"
      - "concentration units"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The heart of a PopPK project is **estimation**: finding the population parameters that best explain the data. Three engines dominate — **NONMEM**, **Monolix**, **nlmixr2** — with different algorithms and philosophies.

Knowing what they share and what sets them apart avoids many surprises.
<!-- /step -->

<!-- step:title="Intuition" viz="16_SAEMCycle" -->
They all seek the same thing: minimising the **objective function** (−2 log-likelihood). They differ in **how** they get there.

Two major families: **linearisation** (FOCE-I, fast but approximate) and **stochastic sampling** (**SAEM**, robust on difficult models).
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="15_OFVGame" -->
The common criterion:

$$ OFV = -2\log L $$

- **NONMEM** (ICON): the historical and regulatory **reference**. Control files, FOCE-I and SAEM. Powerful but austere.
- **Monolix** (Lixoft / Simulations Plus): **SAEM** with a **graphical interface** and built-in diagnostics.
- **nlmixr2** (open-source, **R**): SAEM and FOCEI in R, integrating with rxode2/mrgsolve and the whole R ecosystem.

**Note —** results should be **consistent** across engines, but the OFV is comparable only with the **same method** (FOCE-I ≠ SAEM). Refs and links: "Further reading".
<!-- /step -->

<!-- step:title="Worked example" viz="15_OFVGame" -->
On a simple model, FOCE-I and SAEM converge to the same estimates. On a **difficult** model (strong non-linearity, sparse data), FOCE-I may fail where **SAEM** stays robust — hence its growing popularity.

Many teams prototype in **nlmixr2** (free, R) then confirm in NONMEM for the regulatory dossier.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A lower OFV is not always comparable.

**Pitfall —** comparing the OFV across **different methods** (FOCE-I vs SAEM) or **different datasets** is meaningless. And **convergence** (successful minimisation, covariance matrix obtained) says nothing about **accuracy**: diagnostics remain mandatory.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- NONMEM: historical/regulatory reference; Monolix: SAEM + interface; nlmixr2: open-source R.
- Two algorithm families: linearisation (FOCE-I) and stochastic (SAEM, robust).
- All minimise the OFV (−2 log L); OFV comparable only with the same method and data.
- Convergence ≠ a good model; prototype in nlmixr2, confirm in NONMEM.
<!-- /step -->

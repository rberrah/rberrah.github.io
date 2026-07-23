---
id: "trois-approches"
slug: "trois-approches"
title: "NCA vs PopPK vs PBPK"
description: "Three ways to learn from concentration-time data."
summary: "A practical comparison of the descriptive, population and physiology-based approaches."
track: "core"
order: 2
duration: "14 min"
level: "beginner"
tags: ["approaches", "nca", "poppk", "pbpk"]
slides: ["s23", "s34", "s45", "s56", "s73"]
quiz:
  - prompt: "Non-compartmental analysis (NCA) is mainly used to..."
    options:
      - "describe the observed exposure without a model"
      - "simulate unobserved patients with covariates"
      - "build a full physiological model of the body"
    correct: 0
  - prompt: "PopPK is especially useful when you want to..."
    options:
      - "describe one patient's exposure without a model"
      - "estimate typical parameters and their variability"
      - "rebuild the body's full physiology from scratch"
    correct: 1
  - prompt: "A common PBPK risk is..."
    options:
      - "an inability to extrapolate to new scenarios"
      - "too many parameters for what the data support"
      - "a lack of mechanistic physiological basis"
    correct: 1
---

<!-- step:title="Why this chapter" slides="s23" viz="04_ThreeApproaches" -->
The same concentration-time data can answer different questions.

- "What exposure did we observe?" → **NCA** may be enough.
- "Why do patients differ?" → you need **PopPK**.
- "What if the physiology or an interaction changed?" → **PBPK** can help.

**Key point —** choosing the method is choosing the right map scale. All three can be valid; they are not interchangeable.
<!-- /step -->

<!-- step:title="Intuition" slides="s23,s56" viz="04_ThreeApproaches" -->
Imagine each patient builds from the same box of blocks.

- **NCA** measures the finished construction: height, width, total area.
- **PopPK** estimates the instruction sheet *and* how students vary around it.
- **PBPK** rebuilds the whole room: tables, shelves, doors and the routes between them.

NCA is a ruler; PopPK a classroom model; PBPK a building plan — powerful, but every extra room needs assumptions.
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s34" viz="AUCTrap" -->
NCA often summarizes exposure with the area under the curve:

$$ \mathrm{AUC}_{0-\infty} \approx \mathrm{AUC}_{0-t} + \frac{C_t}{\lambda_z} $$

PopPK models individual parameters, e.g.:

$$ CL_i = CL_{\mathrm{typical}} \cdot e^{\eta_i} $$

**Math —** read it as: each patient has a clearance near the typical value, times an individual deviation $e^{\eta_i}$. This is the heart of mixed-effects models.
<!-- /step -->

<!-- step:title="Worked example" slides="s45" viz="12_VariabilitySandbox" -->
Suppose warfarin concentrations vary widely after similar doses.

NCA tells you *which* patients had the highest AUC. PopPK asks whether clearance depends on weight, genotype, age or co-medications. PBPK explores mechanisms (hepatic metabolism, tissue distribution) at the cost of extra physiological assumptions.

The **practical question** decides the tool.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s45" -->
Do not use NCA as if it were predictive.

**Pitfall —** NCA describes observed profiles perfectly, but it has no patient-level random effects, no covariate model and no mechanism to simulate a new dosing schedule. To predict, use a model built to predict.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- NCA describes observed exposure.
- PopPK explains population variability and enables simulation.
- PBPK extrapolates through physiology but depends heavily on assumptions.
- Start from the question, then choose the method.
<!-- /step -->

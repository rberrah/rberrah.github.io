---
id: "trois-approches"
slug: "trois-approches"
title: "NCA vs PopPK vs PBPK"
description: "Three ways to learn from concentration-time data."
summary: "A practical comparison of descriptive, population, and physiology-based approaches."
track: "core"
order: 2
duration: "14 min"
level: "beginner"
tags: ["approaches", "nca", "poppk", "pbpk"]
slides: ["s06", "s07", "s08", "s09"]
quiz:
  - prompt: "NCA is mainly useful to..."
    options:
      - "describe observed exposure"
      - "simulate unobserved patients with covariates"
      - "build a full organ-level physiology model"
    correct: 0
  - prompt: "PopPK is especially useful when you want to..."
    options:
      - "ignore variability"
      - "estimate typical parameters and variability in a population"
      - "avoid using any model"
    correct: 1
  - prompt: "A common PBPK risk is..."
    options:
      - "too few parameters"
      - "over-parameterizing beyond what data can support"
      - "never using physiology"
    correct: 1
---

<!-- step:title="Why this matters" slides="s06" viz="04_ThreeApproaches" -->
The same concentration-time data can answer different questions.

If you ask, "What exposure did we observe?", NCA may be enough. If you ask, "Why do patients differ?", you need PopPK. If you ask, "What would happen in a different physiology or drug-drug interaction?", PBPK may help.

Choosing the method is like choosing the right map scale.
<!-- /step -->

<!-- step:title="Intuition" slides="s06" viz="04_ThreeApproaches" -->
Imagine each patient builds with the same box of blocks.

- **NCA** measures the finished construction: height, width, total area.
- **PopPK** estimates the instruction sheet and how students vary around it.
- **PBPK** rebuilds the whole classroom: tables, shelves, doors, and routes between them.

All three can be valid. They are not interchangeable.
<!-- /step -->

<!-- step:title="Building-block metaphor" slides="s07,s08" viz="04_ThreeApproaches" -->
NCA is a ruler. It can measure the area under the curve, but it does not explain how the construction was built.

PopPK is a classroom model. It says: "Here is the typical instruction sheet, here is how much students differ, and here are covariates that explain part of the difference."

PBPK is a building plan. It represents organs and flows explicitly. It can be powerful, but every extra room needs assumptions.
<!-- /step -->

<!-- step:title="Minimal math" slides="s06" viz="04_ThreeApproaches" -->
NCA often summarizes exposure with AUC:

$$ \mathrm{AUC}_{0-\infty} \approx \mathrm{AUC}_{0-t} + \frac{C_t}{\lambda_z} $$

PopPK often models individual parameters as:

$$ CL_i = CL_{\mathrm{typical}} \cdot e^{\eta_i} $$

Read this as: each patient has a clearance near the typical value, multiplied by an individual deviation.
<!-- /step -->

<!-- step:title="Worked example" slides="s07,s08" viz="12_VariabilitySandbox" -->
Suppose warfarin concentrations differ widely after similar doses.

NCA can tell you which patients had higher AUC. PopPK can ask whether clearance differs with weight, genotype, age, or interacting drugs. PBPK can explore mechanisms such as hepatic metabolism and tissue distribution, but it needs more physiological assumptions.

The practical question decides the tool.
<!-- /step -->

<!-- step:title="Common trap" slides="s09" -->
Do not use NCA as if it were predictive.

NCA is excellent for describing observed profiles, but it has no patient-level random effects, no covariate model, and no mechanistic way to simulate a new dosing schedule. For prediction, use a model designed for prediction.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- NCA describes observed exposure.
- PopPK explains population variability and supports simulation.
- PBPK uses physiology to extrapolate, but it depends heavily on assumptions.
- Start with the question, then choose the method.
<!-- /step -->

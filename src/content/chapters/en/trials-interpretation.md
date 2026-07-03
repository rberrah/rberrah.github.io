---
id: "trials-interpretation"
slug: "trials-interpretation"
title: "Interpreting a model: covariate effects"
description: "From parameter to decision: reading covariate effects, forest plots and their clinical relevance."
summary: "Interpreting covariate effects: forest plots, clinical relevance vs significance, dose adjustment."
track: "trials"
order: 102
duration: "12 min"
level: "intermediate"
tags: ["clinical-trials", "interpretation", "covariates", "forest-plot"]
slides: []
quiz:
  - prompt: "A covariate-effect forest plot shows..."
    options:
      - "the magnitude of each effect (ratio) with its confidence interval"
      - "the concentration over time"
      - "the model structure"
    correct: 0
  - prompt: "A covariate effect is clinically relevant if it..."
    options:
      - "leaves the zone deemed inconsequential (e.g. ±20%)"
      - "is merely statistically significant"
      - "concerns many patients"
    correct: 0
  - prompt: "A confidence interval that crosses 1 (no effect) means..."
    options:
      - "the effect is uncertain"
      - "the effect is strong"
      - "the dose must be increased"
    correct: 0
---

<!-- step:title="Why this chapter" -->
A model is worth something only if it **changes a decision**. Interpreting covariate effects — and judging their **clinical relevance** — tells us whether to adjust the dose by weight, renal function or genotype.

It is the bridge between statistical analysis and practice.
<!-- /step -->

<!-- step:title="Intuition" viz="53_ForestPlot" -->
A **forest plot** lines up the effects: each covariate shifts a parameter (e.g. clearance) by a certain **factor**, with an uncertainty bar.

Two landmarks: the line at **1** (no effect) and a **band** of clinical irrelevance. An effect matters if it **leaves** the band and its bar does not cross 1.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="53_ForestPlot" -->
A covariate effect is expressed as a **ratio** relative to the reference patient, e.g.:

$$ \frac{CL(x)}{CL_{ref}} = \left(\frac{x}{x_{ref}}\right)^{\theta} $$

We judge on **two joint criteria**:

- **statistical**: does the 95% CI of the ratio exclude 1?
- **clinical**: does the ratio exceed the relevance threshold (often ±20%, i.e. the 0.8–1.25 zone)?

**Note —** an effect can be significant (large sample) yet **clinically negligible**, and conversely a relevant effect may remain uncertain (wide CI).
<!-- /step -->

<!-- step:title="Worked example" viz="53_ForestPlot" -->
On the forest plot, a **low CrCl** reduces clearance by 38% (CI outside the band): dose adjustment justified. **Sex** shifts clearance by 5% (inside the band, CI crossing 1): inconsequential.

This is how we build **dosing recommendations** by subgroup.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Significant is not relevant.

**Pitfall —** on a large dataset, almost everything becomes **statistically significant**. The useful question is the **magnitude**: a 5% effect does not change the dose. And beware **correlated** covariates (weight and CrCl), whose effects merge.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The forest plot shows the magnitude and uncertainty of each covariate effect.
- Effect expressed as a ratio vs reference; judge statistical AND clinical.
- Relevant = outside the band (e.g. ±20%) and CI not crossing 1.
- Significant ≠ relevant; caution with correlated covariates.
<!-- /step -->

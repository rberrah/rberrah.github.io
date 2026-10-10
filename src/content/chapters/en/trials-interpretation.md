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
prerequisites: ["covariates-basics","valid-uncertainty"]
glossary: ["Covariable","Centrage","RSE"]
sources: ["fda-poppk","ema-poppk","ribbing-selection-bias","ema-bioequivalence"]
updated_on: "2026-10-09"
reviewed_on: "2026-10-09"
review_type: "author"
reviewed_hash: "e91c2b2e2ce78e3b12e6a0afb259b82a2ff2da239898af9a10c5fdcb07abc53b"
quiz:
  - prompt: "A covariate-effect forest plot shows..."
    options:
      - "the magnitude of each effect (ratio) with its confidence interval"
      - "the predicted concentration-time profile for each patient subgroup"
      - "the correlation matrix between the covariates kept in the model"
    correct: 0
  - prompt: "A covariate effect is clinically relevant if it..."
    options:
      - "has a magnitude and uncertainty compatible with the exposure-response relationship and a prespecified decision"
      - "reaches the threshold of statistical significance (p < 0.05)"
      - "concerns a covariate that is frequent in the studied population"
    correct: 0
  - prompt: "A confidence interval that crosses 1 (no effect) means..."
    options:
      - "the effect is not statistically distinct from no effect at all"
      - "the effect is certain but too small in magnitude to matter"
      - "the effect ratio equals exactly 1 across the whole population"
    correct: 0
---

<!-- step:title="Why this chapter" -->
In a decision setting, a model is useful when it **informs a decision** and makes its uncertainty explicit. Interpreting covariate effects — and judging their **clinical relevance** — helps assess whether dose should be adjusted by weight, renal function or genotype.

It is the bridge between statistical analysis and practice.
<!-- /step -->

<!-- step:title="Intuition" viz="53_ForestPlot" -->
A **forest plot** lines up the effects: each covariate shifts a parameter (e.g. clearance) by a certain **factor**, with an uncertainty bar.

Two landmarks: the line at **1** (no effect) and a **band** of clinical irrelevance, defined in advance from the drug, target and setting. An effect matters when its **magnitude**, **uncertainty** and consequence for exposure/response are compatible with a decision; excluding 1 is not mandatory.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="53_ForestPlot" -->
A covariate effect is expressed as a **ratio** relative to the reference patient, e.g.:

$$ \frac{CL(x)}{CL_{ref}} = \left(\frac{x}{x_{ref}}\right)^{\theta} $$

We judge on a body of evidence:

- **statistical**: what is the effect magnitude and uncertainty?
- **clinical**: does that uncertainty change the decision through the exposure target, therapeutic margin and exposure–response relationship? The 0.8–1.25 zone comes from bioequivalence and can be a teaching landmark, but it is not a universal dosing-relevance rule.

**Note —** an effect can be significant (large sample) yet **clinically negligible**, and conversely a relevant effect may remain uncertain (wide CI).
<!-- /step -->

<!-- step:title="Worked example" viz="53_ForestPlot" -->
On the forest plot, a **low CrCl** reduces clearance by 38% (CI outside the band): this may justify evaluating dose adjustment, depending on the exposure target, therapeutic margin and exposure–response relationship. **Sex** shifts clearance by 5% (inside the band, CI crossing 1): probably inconsequential for dosing.

This is how we build **dosing recommendations** by subgroup.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Significant is not relevant.

**Pitfall —** very small effects can become **statistically significant** in large samples. The useful question is the **magnitude** and its uncertainty: a 5% effect is often inconsequential for dosing, but this depends on the therapeutic margin and decision rule. Also beware **correlated** covariates (weight and CrCl), whose effects may be difficult to separate.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The forest plot shows the magnitude and uncertainty of each covariate effect.
- Effect expressed as a ratio vs reference; judge statistical AND clinical.
- Clinical relevance depends on magnitude, uncertainty, exposure–response, therapeutic margin and a prespecified decision context.
- Significant ≠ relevant; caution with correlated covariates.
<!-- /step -->

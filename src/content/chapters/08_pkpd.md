---
id: "pkpd"
slug: "pkpd"
title: "PK/PD: Emax and turnover"
description: "Link concentration to effect, saturation, steepness, and delays."
summary: "A student-friendly guide to direct Emax models and indirect response models."
track: "core"
order: 8
duration: "16 min"
level: "intermediate"
tags: ["pkpd", "emax", "ec50", "turnover"]
slides: ["s32", "s33", "s34", "s35", "s36", "s37", "s38", "s39", "s40", "s41"]
quiz:
  - prompt: "EC50 is the concentration that produces..."
    options:
      - "half of Emax"
      - "zero effect"
      - "twice the baseline"
    correct: 0
  - prompt: "A Hill coefficient greater than 1 makes the curve..."
    options:
      - "steeper"
      - "flat at all concentrations"
      - "independent of concentration"
    correct: 0
  - prompt: "Turnover models are useful when..."
    options:
      - "effect is delayed because the response variable changes over time"
      - "there is no response variable"
      - "PK data cannot be measured"
    correct: 0
---

<!-- step:title="Why this matters" slides="s32" viz="BuildingBlocksPKPD" -->
Concentration is usually not the final question. The final question is effect.

PK/PD models connect the blocks moving through the body to the construction they produce: benefit, toxicity, biomarker change, or clinical response.
<!-- /step -->

<!-- step:title="Intuition" slides="s32,s33" viz="BuildingBlocksPKPD" -->
Adding more blocks helps only until the construction reaches its maximum useful size.

That plateau is the idea behind Emax. Once all relevant targets are saturated, more concentration gives little extra effect, but may still increase toxicity.
<!-- /step -->

<!-- step:title="Building-block metaphor" slides="s33" viz="BuildingBlocksPKPD" -->
The receptor or target is like a baseplate with a limited number of slots.

- $E_0$ is what the plate does before drug.
- $E_{\max}$ is the largest extra effect the drug can produce.
- $EC_{50}$ is the concentration that fills enough slots for half-maximal effect.
- The Hill coefficient controls how switch-like the construction becomes.
<!-- /step -->

<!-- step:title="Minimal math" slides="s34,s35" viz="BuildingBlocksPKPD" -->
A direct Emax model is:

$$ E = E_0 + \frac{E_{\max} C}{EC_{50} + C} $$

A sigmoid Emax model is:

$$ E = E_0 + \frac{E_{\max} C^h}{EC_{50}^h + C^h} $$

where $h$ is the Hill coefficient.
<!-- /step -->

<!-- step:title="Worked example" slides="s36,s37" viz="BuildingBlocksPKPD" -->
For warfarin, the clinical effect can lag behind concentration because the drug affects clotting factor turnover.

The concentration changes first. The biological system then responds over time. That delay is PD, not necessarily slow distribution.
<!-- /step -->

<!-- step:title="Common trap" slides="s38,s39" -->
Do not call every delay "slow PK".

Sometimes concentration reaches the site quickly, but the measured effect takes time because the biomarker must be produced or removed. Turnover models represent this:

$$ \frac{dR}{dt} = k_{in}(1 + f(C)) - k_{out}R $$
<!-- /step -->

<!-- step:title="Key takeaways" slides="s40,s41" -->
- PK explains concentration over time.
- PD explains effect as a function of concentration and biology.
- Emax models teach saturation.
- Turnover models teach delayed response.
<!-- /step -->

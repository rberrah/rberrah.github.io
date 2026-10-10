---
id: "nca-absorption"
slug: "nca-absorption"
title: "NCA after the oral route: Cmax, Tmax, F"
description: "Reading absorption without a model: peak, time of peak, absolute and relative bioavailability."
summary: "Absorption parameters in NCA: Cmax, Tmax, bioavailability and comparison of formulations."
track: "nca"
order: 83
duration: "11 min"
level: "intermediate"
tags: ["nca", "bioavailability", "cmax", "oral"]
slides: []
prerequisites: ["nca-auc","absorption-orale"]
glossary: ["NCA","F","Cmax / Tmax","AUC"]
sources: ["ema-bioequivalence","fda-bioequivalence","rowland-tozer"]
reviewed_on: "2026-07-09"
review_type: "author"
scientific_values: {"bioequivalence_ci_level":0.90,"usual_ratio_lower":0.80,"usual_ratio_upper":1.25}
units: {"bioequivalence_ci_level":"probability","test_reference_ratio":"ratio"}
reviewed_hash: "fd1d8dfd960693d3f105ab12c1e2d9e92e945e5b24245ab26c5859afe5d065a9"
quiz:
  - prompt: "Absolute bioavailability F is computed by comparing..."
    options:
      - "the oral AUC (dose-normalised) to the IV AUC"
      - "the oral Cmax (dose-normalised) to the IV Cmax"
      - "the oral terminal slope to the IV terminal slope"
    correct: 0
  - prompt: "Cmax and Tmax mainly inform about..."
    options:
      - "the absorption rate"
      - "the elimination route"
      - "the volume of distribution"
    correct: 0
---

<!-- step:title="Why this chapter" -->
By the oral route, the drug must be **absorbed** before it acts. NCA quantifies this absorption without a model: how much (**F**), how high (**Cmax**) and when (**Tmax**).

These parameters are central to **formulation** and **bioequivalence** studies.
<!-- /step -->

<!-- step:title="Intuition" viz="OralAbsorption" -->
After an oral dose, the concentration **rises** (absorption) then **falls** (elimination): the top is **Cmax**, reached at time **Tmax**.

Fast absorption gives a high, early Cmax; an extended-release formulation flattens and delays the peak.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="OralAbsorption" -->
**Absolute bioavailability** compares oral to IV exposure at equal dose:

$$ F = \frac{\text{AUC}_{oral}/\text{Dose}_{oral}}{\text{AUC}_{IV}/\text{Dose}_{IV}} $$

**Relative bioavailability** compares two oral formulations (test vs reference). **Cmax** and **Tmax** are read directly off the curve (no calculation).

**Math —** in **bioequivalence**, the **90% CI for the test/reference ratio of geometric means** for AUC and Cmax, usually after log transformation, must lie within the applicable limits (often **80–125%**).
<!-- /step -->

<!-- step:title="Worked example" viz="OralAbsorption" -->
A generic with equivalent AUC but a **higher Cmax** may fail bioequivalence: same total exposure, but a different absorption rate.

Conversely, an extended-release form aims for a lower Cmax and a delayed Tmax, to smooth the concentrations.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Cmax depends on sampling.

**Pitfall —** Cmax and Tmax are **observed** values: if no sample is taken near the true peak, Cmax is **underestimated** and Tmax shifted. A dense sampling plan around the peak is essential for absorption.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Cmax and Tmax describe the absorption rate (observed values).
- Absolute F = oral vs IV AUC (dose-normalised); relative F = two formulations.
- Bioequivalence: 90% CI for test/reference geometric-mean ratios of AUC and Cmax, usually on the log scale, within the applicable limits.
- Sampling around the peak governs the reliability of Cmax/Tmax.
<!-- /step -->

---
id: "variabilite-iiv-iov"
slug: "variabilite-iiv-iov"
title: "IIV, IOV and residual error"
description: "Separate patient differences, occasion differences, and measurement noise."
summary: "A practical guide to naming the different sources of variability in PopPK."
track: "core"
order: 5
duration: "14 min"
level: "intermediate"
tags: ["variability", "iiv", "iov", "residual-error"]
slides: ["s21", "s22", "s23", "s24"]
quiz:
  - prompt: "IIV means..."
    options:
      - "differences between patients"
      - "differences between assay machines only"
      - "differences between drug names"
    correct: 0
  - prompt: "IOV means..."
    options:
      - "differences within the same patient across occasions"
      - "the typical value"
      - "the structural ODE"
    correct: 0
  - prompt: "Residual error is closest to..."
    options:
      - "unexplained observation-level mismatch"
      - "the full population variability"
      - "the covariate effect"
    correct: 0
---

<!-- step:title="Why this matters" slides="s21" viz="12_VariabilitySandbox" -->
Variability is not a nuisance to hide. It is often the main reason pharmacometrics is useful.

A good model says which differences are between patients, which differences occur within a patient over time, and which differences remain at the measurement level.
<!-- /step -->

<!-- step:title="Intuition" slides="s21,s22" viz="12_VariabilitySandbox" -->
In a classroom, students do not all build at the same speed.

Some are consistently faster. Some are faster on Monday and slower on Friday. Some measurements of the final construction are blurry.

Those are three different problems.
<!-- /step -->

<!-- step:title="Building-block metaphor" slides="s21,s22" viz="12_VariabilitySandbox" -->
- **Fixed effect**: the typical instruction sheet for the class.
- **IIV**: each student has a personal building style.
- **IOV**: the same student changes between sessions.
- **Residual error**: the photo of the construction is imperfect, or the model misses a small detail.

Keeping these layers separate is one of the most important PopPK skills.
<!-- /step -->

<!-- step:title="Minimal math" slides="s21,s22" viz="12_VariabilitySandbox" -->
A common PopPK parameter model is:

$$ CL_i = CL_{\mathrm{typical}} e^{\eta_i} $$

where $\eta_i$ is the patient-specific deviation.

For an occasion-specific parameter:

$$ CL_{ij} = CL_{\mathrm{typical}} e^{\eta_i + \kappa_{ij}} $$

where $\kappa_{ij}$ describes occasion $j$ for patient $i$.
<!-- /step -->

<!-- step:title="Worked example" slides="s23" viz="12_VariabilitySandbox" -->
In a warfarin dataset, two patients may have different typical clearance. That is IIV.

The same patient may also have a different clearance during a later visit because of diet, adherence, liver function, or interacting drugs. That is IOV.

The measured INR or concentration may still deviate from the model. That is residual error.
<!-- /step -->

<!-- step:title="Common trap" slides="s24" -->
Do not use residual error to absorb every mismatch.

If patient curves are systematically different, residual error is the wrong explanation. If the same patient changes by visit, IIV alone is not enough. If the structural model is wrong, adding random effects may only hide the problem.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- IIV is between-patient variability.
- IOV is within-patient, between-occasion variability.
- Residual error is observation-level mismatch.
- Better naming of variability leads to better interpretation.
<!-- /step -->

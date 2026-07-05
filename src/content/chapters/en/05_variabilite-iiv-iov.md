---
id: "variabilite-iiv-iov"
slug: "variabilite-iiv-iov"
title: "IIV, IOV and residual error"
description: "Separating between-patient differences, between-occasion differences and measurement noise."
summary: "A practical guide to naming the sources of variability in PopPK."
track: "core"
order: 5
duration: "14 min"
level: "intermediate"
tags: ["variability", "iiv", "iov", "residual-error"]
slides: ["s11", "s13", "s14", "s15", "s16", "s17"]
quiz:
  - prompt: "IIV means..."
    options:
      - "differences between patients"
      - "differences between assay machines only"
      - "differences between drug names"
    correct: 0
  - prompt: "IOV means..."
    options:
      - "differences within one patient across occasions"
      - "the typical value"
      - "the structural ODE"
    correct: 0
  - prompt: "Residual error is mostly..."
    options:
      - "the unexplained gap at the observation level"
      - "the whole population variability"
      - "a covariate effect"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s14" viz="12_VariabilitySandbox" -->
Variability is not a nuisance to hide. It is often the main reason pharmacometrics is useful.

A good model states **which** differences are between patients, **which** happen within a patient over time, and **which** remain at the measurement level.
<!-- /step -->

<!-- step:title="Intuition" slides="s13,s14" viz="12_VariabilitySandbox" -->
In a classroom, students do not build at the same speed.

Some are consistently faster. Some are fast on Monday and slow on Friday. And some photos of the finished construction are blurry. Three different problems:

- **Fixed effect**: the class's typical instruction sheet.
- **IIV** (inter-individual variability): each student has a personal building style.
- **IOV** (inter-occasion variability): the same student changes from session to session.
- **Residual error**: the photo is imperfect, or the model misses a small detail.

**Key point —** keeping these layers separate is one of the most important PopPK skills.
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s13" viz="12_VariabilitySandbox" -->
A common PopPK parameter model:

$$ CL_i = CL_{\mathrm{typical}}\, e^{\eta_i} $$

where $\eta_i$ is the patient-specific deviation. For an occasion-specific parameter:

$$ CL_{ij} = CL_{\mathrm{typical}}\, e^{\eta_i + \kappa_{ij}} $$

**Math —** $\eta_i$ does not change between visits (that is IIV); $\kappa_{ij}$ describes occasion $j$ of patient $i$ (that is IOV). Residual error acts on each **observation**.
<!-- /step -->

<!-- step:title="Worked example" slides="s17" viz="12_VariabilitySandbox" -->
In a warfarin dataset, two patients can have different typical clearances: that is IIV.

The same patient may have a different clearance at a later visit (diet, adherence, liver function, interactions): that is IOV.

And the measured INR or concentration can still deviate from the model: that is residual error.
<!-- /step -->

<!-- step:title="A numerical case" slides="s17" viz="12_VariabilitySandbox" -->
Take a population with typical clearance $CL_{pop} = 5\ \text{L/h}$, 30% IIV and 10% proportional residual error.

| Source | Deviation | Compute | CL (L/h) |
|---|---|---|---|
| Population | — | $CL_{pop}$ | 5.0 |
| IIV — patient A | $\eta_A = +0.18$ | $5 \cdot e^{0.18}$ | 6.0 |
| IIV — patient B | $\eta_B = -0.36$ | $5 \cdot e^{-0.36}$ | 3.5 |
| IOV — A, occasion 2 | $\kappa = +0.22$ | $5 \cdot e^{\eta_A + \kappa}$ | 7.5 |

Reading it: patient A eliminates faster than typical (6.0 vs 5.0), B slower (3.5) — that is **IIV**. The same patient A moves from 6.0 to 7.5 between occasions — that is **IOV**. And each measured point still scatters ±10% around its individual prediction — that is **residual error**.

**Key point —** three layers, three numbers: $\eta$ places the patient, $\kappa$ shifts an occasion, $\varepsilon$ adds noise to each measurement.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s16" -->
Do not use residual error to absorb every mismatch.

**Pitfall —** if patients' curves differ systematically, residual error is the wrong explanation. If the same patient changes by visit, IIV alone is not enough. And if the structural model is wrong, adding random effects often just **hides** the problem.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- IIV is between-patient variability.
- IOV is within-patient, between-occasion variability.
- Residual error is the observation-level gap.
- Naming variability better means interpreting the model better.
<!-- /step -->

---
id: "nca"
slug: "nca"
title: "Non-compartmental analysis (NCA)"
description: "Describing exposure without a model: AUC, Cmax, λz and the orders of kinetics."
summary: "A deeper look at NCA: primary/secondary parameters, trapezoids, extrapolation and limits."
track: "core"
order: 2.5
duration: "14 min"
level: "beginner"
tags: ["nca", "auc", "approaches"]
slides: ["s23", "s34", "s45"]
quiz:
  - prompt: "NCA mainly needs..."
    options:
      - "the dose and route of administration"
      - "a full physiological model"
      - "a trained neural network"
    correct: 0
  - prompt: "First-order kinetics means the rate..."
    options:
      - "is proportional to concentration"
      - "is constant regardless of concentration"
      - "is zero"
    correct: 0
  - prompt: "Extrapolating the AUC to infinity uses..."
    options:
      - "the last concentration and the terminal slope λz"
      - "only the dose"
      - "the patient's weight"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s23" viz="04_ThreeApproaches" -->
Before building a model, you can already **describe** what you observe. That is the role of **non-compartmental analysis** (NCA).

It only needs the **dose** and the **route**, computes exposure by geometry and algebra, and is often used to **roughly validate** a protocol (order of magnitude of the half-life) before a heavier analysis.
<!-- /step -->

<!-- step:title="Intuition" slides="s34" viz="AUCTrap" -->
NCA "lets the data speak": no compartments, no structural assumption.

You measure the area under the curve (the **exposure**) directly by cutting the profile into **trapezoids** between sampling points.
<!-- /step -->

<!-- step:title="Orders of kinetics" slides="s34" viz="AUCTrap" -->
ADME transfers follow **rates**. Three regimes recur:

- **First order**: the rate is **proportional to concentration** (more drug, faster). Exponential decay.
- **Zero order**: the rate is **constant** (e.g. infusion, saturated enzyme) — more drug, longer it takes.
- **Michaelian**: saturable — first-order at low concentration, zero-order once enzymes/transporters saturate. Saturation often heralds the toxic zone.

**Note —** the same kinetics can **switch** order depending on the concentration.
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s34" viz="AUCTrap" -->
NCA parameters sort into **S-H-A-M**: **S**lope (ke, ka), **H**eight (C0, Cmax, Css), **A**rea (AUC), **M**oment (AUMC).

The trapezoidal area covers the observed points; the tail is **extrapolated** by the terminal slope:

$$ \mathrm{AUC}_{0-\infty} = \mathrm{AUC}_{0-t} + \frac{C_{last}}{\lambda_z} $$

**Math —** this yields the "primary" parameters: clearance $CL/F = \text{Dose}/\mathrm{AUC}$, half-life $t_{1/2} = \ln 2/\lambda_z$, and volume $V_z/F = CL/\lambda_z$.
<!-- /step -->

<!-- step:title="Worked example" slides="s45" viz="AUCTrap" -->
For warfarin, NCA quickly gives each subject's AUC and an approximate half-life.

But as soon as you want to explain **why** patients differ (weight, genotype) or **simulate** another dosing schedule, you must move to a compartmental / PopPK approach.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s45" -->
NCA describes, it does not predict — and it is sensitive to sampling.

**Pitfall —** the **analytical method** matters: a high limit of quantification can hide a decay phase, drastically changing the estimated half-life. Too few late points make λz (and the extrapolated AUC) unreliable.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- NCA is descriptive: dose + route are enough, robust but not predictive.
- Orders of kinetics: 1 (proportional), 0 (constant), Michaelian (saturable).
- Trapezoidal AUC + $C_{last}/\lambda_z$ tail; yields CL/F, t½, Vz/F.
- Reminder: ~5–6 half-lives to eliminate (or reach) most of the drug.
<!-- /step -->

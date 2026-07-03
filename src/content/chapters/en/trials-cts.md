---
id: "trials-cts"
slug: "trials-cts"
title: "Clinical trial simulation"
description: "Testing a trial before running it: virtual populations, dosing schedules and probability of success."
summary: "Clinical trial simulation (CTS): generating virtual patients to compare designs and doses."
track: "trials"
order: 101
duration: "13 min"
level: "advanced"
tags: ["clinical-trials", "simulation", "cts", "power"]
slides: []
quiz:
  - prompt: "Clinical trial simulation (CTS) allows one to..."
    options:
      - "evaluate designs, doses and power before launching the trial"
      - "permanently replace real trials"
      - "measure a concentration"
    correct: 0
  - prompt: "To simulate a realistic virtual population, one needs..."
    options:
      - "a PK/PD model + correlated covariates + variability"
      - "only the mean dose"
      - "a single typical patient"
    correct: 0
  - prompt: "A trial's probability of success (power) depends mainly on..."
    options:
      - "the effect size, the variability and the sample size"
      - "the tablet colour"
      - "the molecule's name"
    correct: 0
---

<!-- step:title="Why this chapter" -->
A clinical trial costs years and millions. **Clinical trial simulation** (CTS) lets us "rehearse" it virtually: which design, dose and sample size give the best chance of success?

It is the culmination of modelling: turning a model into a development **decision**.
<!-- /step -->

<!-- step:title="Intuition" viz="12_VariabilitySandbox" -->
We generate **virtual patients** — each with covariates and variability — then apply the simulated protocol and PK/PD model to them.

By repeating the trial thousands of times, we obtain the **distribution** of possible results, hence the probability of meeting the endpoint (the "power").
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="12_VariabilitySandbox" -->
A CTS chains three blocks:

1. a **virtual population** model (correlated covariates — see copulas);
2. a **PK/PD model** (with IIV, IOV, residual error);
3. a **trial model** (schedule, inclusion criteria, analysis, stopping rules).

We then estimate metrics: **probability of success**, optimal dose, required sample size.

**Ref —** Holford N., Kimko H. et al. — the clinical trial simulation framework; used for adaptive designs and dose selection.
<!-- /step -->

<!-- step:title="Worked example" viz="12_VariabilitySandbox" -->
Before a phase III, we simulate several **doses** and **sample sizes**: the simulation shows that at 200 patients power is only 60%, but reaches 85% at 300 — decisive information for the design.

We can also test robustness to **non-adherence** or protocol deviations.
<!-- /step -->

<!-- step:title="Common pitfall" -->
The simulation inherits the model's weaknesses.

**Pitfall —** a CTS is only as good as its **assumptions**: a poorly validated model, underestimated variability or unrealistic covariates produce false confidence. One must propagate the **parameter uncertainty** (not just variability) for honest predictions.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- CTS "replays" a trial on virtual populations to inform the design.
- Three blocks: virtual population + PK/PD model + trial model.
- Provides probability of success, dose and sample size.
- Propagate parameter uncertainty, otherwise false confidence.
<!-- /step -->

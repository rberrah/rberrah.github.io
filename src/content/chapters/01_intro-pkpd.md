---
id: "pourquoi-pharmacometrie"
slug: "pourquoi-pharmacometrie"
title: "Why pharmacometrics?"
description: "PK vs PD, ADME, and why one dose does not fit everyone."
order: 1
tags: ["intro", "pk", "pd", "variability"]
slides: []
quiz:
  - prompt: "Pharmacokinetics (PK) describes…"
    options:
      - "what the drug does to the body"
      - "what the body does to the drug"
      - "the cost of the drug"
    correct: 1
  - prompt: "Two patients receive the same 100 mg dose but reach very different concentrations. The most likely explanation is…"
    options:
      - "measurement error only"
      - "differences in PK parameters such as clearance and volume"
      - "the drug stopped working"
    correct: 1
  - prompt: "Inter-occasion variability (IOV) refers to differences…"
    options:
      - "between different patients"
      - "within the same patient across occasions"
      - "between two different drugs"
    correct: 1
---

<!-- step:title="One dose, many outcomes" viz="IVBolus" -->
A fixed dose is a single number. The **exposure** it produces is not.

Give the same intravenous dose to two people and you can see very different concentration–time curves. Move the **clearance (CL)** slider: as elimination speeds up, the whole curve drops, even though the dose never changed.

This is the central tension of dosing: we control the **input** (the dose), but the patient controls much of the **output** (the exposure). Pharmacometrics is the discipline that connects the two with explicit, quantitative models.
<!-- /step -->

<!-- step:title="PK — what the body does to the drug" viz="01_HumanBody" -->
**Pharmacokinetics (PK)** follows the drug through the body: **A**bsorption, **D**istribution, **M**etabolism, **E**limination — the ADME cascade.

PK answers questions of *amount and timing*:

- How fast does the drug appear in plasma?
- How widely does it distribute?
- How quickly is it cleared?

Two parameters anchor everything that follows:

- **Clearance** $CL$ — volume of blood cleared of drug per unit time, in $\text{L/h}$.
- **Volume of distribution** $V$ — the apparent space the drug occupies, in $\text{L}$.

A common pitfall is confusing *slow absorption* with *low clearance*: both can keep a drug around longer, but they act at opposite ends of the ADME chain.
<!-- /step -->

<!-- step:title="PD — what the drug does to the body" -->
**Pharmacodynamics (PD)** links **concentration to effect** — efficacy on one side, toxicity on the other.

Measuring a concentration is rarely the goal in itself. The clinical question is the *effect*: blood pressure lowered, bacteria killed, clotting time prolonged. The PK/PD pairing is therefore:

$$ \text{Dose} \;\longrightarrow\; \underbrace{\text{Concentration}}_{\text{PK}} \;\longrightarrow\; \underbrace{\text{Effect}}_{\text{PD}} $$

Effect often **lags** behind concentration, so peak concentration and peak effect need not coincide. Reading effect directly off a concentration, with no model for that delay, is a classic mistake.
<!-- /step -->

<!-- step:title="Where the variability comes from" -->
"Same dose for everyone" fails because patients differ — and a good model names *which kind* of difference it is describing:

- **Structural model** — the equations themselves (e.g. one-compartment elimination).
- **Fixed effects** — the typical (population) parameter values, e.g. a typical $CL$ of $5\ \text{L/h}$.
- **Random effects** — deviations of individuals from the typical value.
- **Inter-individual variability (IIV)** — why patient A clears faster than patient B.
- **Inter-occasion variability (IOV)** — why the *same* patient differs between visits.
- **Residual error** — assay noise and model misspecification on a single measurement.
- **Parameter uncertainty** — how well we even know the typical values, given finite data.

These are *not* interchangeable. Blaming everything on "measurement error" hides IIV and IOV; ignoring uncertainty makes a model look more confident than it is.
<!-- /step -->

<!-- step:title="What a model buys you" viz="IVBolus" -->
A pharmacometric model is a compact, testable story about exposure. Once fitted, it lets you:

- **simulate** dosing regimens before trying them,
- **explain** variability with covariates (weight, renal function, …),
- **individualize** using a patient's own measurements (therapeutic drug monitoring),
- and — crucially — **carry the uncertainty along** instead of pretending it is zero.

What it does **not** do is replace clinical judgement. Everything on this site is educational: it illustrates mechanisms, not patient-specific dosing.
<!-- /step -->

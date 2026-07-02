---
id: "pourquoi-pharmacometrie"
slug: "pourquoi-pharmacometrie"
title: "Why pharmacometrics?"
description: "PK vs PD, ADME, and why one dose does not fit everyone."
summary: "A student-friendly entry point to PK, PD, variability, and model-based dosing."
track: "core"
order: 1
duration: "12 min"
level: "beginner"
tags: ["intro", "pk", "pd", "variability"]
slides: ["s01", "s02", "s03", "s04", "s05"]
quiz:
  - prompt: "Pharmacokinetics (PK) describes..."
    options:
      - "what the drug does to the body"
      - "what the body does to the drug"
      - "the price of a treatment"
    correct: 1
  - prompt: "In the building-block metaphor, PD is closest to..."
    options:
      - "how the bricks travel through the classroom"
      - "what the final construction does"
      - "the color of the box"
    correct: 1
  - prompt: "Two students receive the same kit but finish with different constructions. This is a good image for..."
    options:
      - "inter-individual variability"
      - "a missing axis label"
      - "a fixed effect only"
    correct: 0
---

<!-- step:title="Why this matters" slides="s02" viz="BuildingBlocksPKPD" -->
A dose is easy to write: **100 mg twice daily**. The clinical response is harder: one patient may have too little exposure, another may have toxicity, and a third may land in the useful range.

Pharmacometrics is the discipline that connects those pieces with explicit models:

$$ \text{Dose} \rightarrow \text{Concentration} \rightarrow \text{Effect} $$

The goal is not to memorize equations first. The goal is to understand the story the equation is trying to tell.
<!-- /step -->

<!-- step:title="Intuition" slides="s01,s03" viz="01_HumanBody" -->
Think of the drug as a set of building blocks entering a classroom.

**PK** asks where the blocks go and how long they stay:

- absorption: blocks enter the room;
- distribution: blocks spread across tables and shelves;
- metabolism and elimination: blocks are modified or removed.

**PD** asks what the construction does once enough blocks are in the right place: symptom control, biomarker change, bacterial killing, or toxicity.
<!-- /step -->

<!-- step:title="Building-block metaphor" slides="s04" viz="BuildingBlocksPKPD" -->
The same box of blocks can produce different outcomes.

One student builds quickly, one slowly, one loses pieces under the table. In PK language:

- the **box** is the dose;
- the **delivery path** is absorption;
- the **room size** is volume of distribution;
- the **cleanup speed** is clearance;
- the **finished construction** is the pharmacodynamic effect.

A model is the instruction sheet. It is not the real patient, but it helps us reason about the patient.
<!-- /step -->

<!-- step:title="Minimal math" viz="IVBolus" -->
For an intravenous bolus in a one-compartment model, concentration starts at:

$$ C_0 = \frac{\text{Dose}}{V} $$

and then falls as the body clears drug:

$$ C(t) = \frac{\text{Dose}}{V} e^{-\frac{CL}{V}t} $$

Read this in plain language: **volume sets the initial dilution; clearance sets how fast the blocks are removed relative to that space.**
<!-- /step -->

<!-- step:title="Worked example" viz="IVBolus" -->
Two patients receive the same IV dose.

Patient A has a clearance of $4\ \text{L/h}$. Patient B has a clearance of $8\ \text{L/h}$. If their volumes are similar, patient B removes blocks about twice as fast and will usually have lower exposure.

This is why pharmacometrics often focuses on **parameters**, not only on observed concentrations. Parameters explain why curves differ.
<!-- /step -->

<!-- step:title="Common trap" slides="s05" -->
Do not put every mismatch into one bucket called "noise".

There are different reasons why observations differ:

- **IIV**: different patients are different builders;
- **IOV**: the same patient changes between occasions;
- **residual error**: the measurement is imperfect;
- **model bias**: the instruction sheet is missing something important.

Mixing these up makes the model look simpler, but less useful.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- PK describes what the body does to the drug.
- PD describes what the drug does to the body.
- A pharmacometric model is a simplified instruction sheet linking dose, concentration, effect, and variability.
- Student rule: explain the mechanism in words before trusting the equation.
<!-- /step -->

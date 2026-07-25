---
id: "pourquoi-pharmacometrie"
slug: "pourquoi-pharmacometrie"
title: "Why pharmacometrics?"
description: "PK vs PD, ADME, and why one dose does not fit everyone."
summary: "A student-friendly entry point to PK, PD, variability and model-based dosing."
track: "core"
order: 1
duration: "12 min"
level: "beginner"
tags: ["intro", "pk", "pd", "variability"]
slides: ["s01", "s02"]
quiz:
  - prompt: "Pharmacokinetics (PK) mostly describes..."
    options:
      - "what the drug does to the body"
      - "what the body does to the drug"
      - "how concentration drives effect"
    correct: 1
  - prompt: "In the building-block metaphor, PD is closest to..."
    options:
      - "how the blocks travel through the room"
      - "what the finished construction does"
      - "how fast the blocks leave the room"
    correct: 1
  - prompt: "Two patients get the same dose but respond differently. This illustrates..."
    options:
      - "inter-individual variability"
      - "residual measurement error"
      - "a fixed effect shared by everyone"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s02" viz="BuildingBlocksPKPD" -->
A prescription looks simple: **100 mg twice a day**. The patient's response is not — one patient is under-exposed, another toxic, a third in the useful range.

Pharmacometrics links these pieces with explicit models:

$$ \text{Dose} \rightarrow \text{Concentration} \rightarrow \text{Effect} $$

**Key point —** the goal is not to memorize equations, but to understand the story each equation tells.
<!-- /step -->

<!-- step:title="Intuition" slides="s02" viz="01_HumanBody" -->
Picture the drug as a set of building blocks entering a room.

**PK** asks where the blocks go and how long they stay: absorption (they enter), distribution (they spread over tables and shelves), metabolism and elimination (they are transformed or removed).

**PD** asks what the construction produces once enough blocks are in place: symptom control, biomarker change, antibacterial effect… or toxicity.

**Note —** mnemonic: **PK = what the body does to the drug**, **PD = what the drug does to the body**.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="IVBolus" -->
For an IV bolus in a one-compartment model, concentration starts at:

$$ C_0 = \frac{\text{Dose}}{V} $$

Recall what a **concentration** is: an amount over a volume. The starting concentration is therefore the **dose divided by the volume** it spreads into — a volume that pharmacometrics calls the **volume of distribution** $V$.

Concentration then decays as the body clears the drug:

$$ C(t) = \frac{\text{Dose}}{V}\, e^{-\frac{CL}{V}\,t} $$

This decay is **exponential**: like a geometric sequence, a fixed **percentage** of what remains is removed each time unit — not a fixed amount. Two equivalent ways to quantify that speed:

- **clearance** $CL$ — a cleared flow, a speed relative to the volume;
- the **elimination rate constant** $k_e = CL/V$ — a pure rate (per unit time).

But the most **telling** measure of the decay is the **half-life** $t_{1/2}$: the time to eliminate half of the drug.

**Math —** volume sets the initial dilution; clearance sets how fast the drug is removed relative to that space. The ratio $CL/V = k_e$ drives the slope, and $t_{1/2} = \ln 2 / k_e = 0{,}693\,V/CL$.

In a **linear** model (the simple case) this speed does **not** depend on concentration: the half-life is then a property of the **molecule** (and its volume), not of the dose given.
<!-- /step -->

<!-- step:title="Worked example" viz="IVBolus" -->
Two patients receive the same IV dose. Patient A has $CL = 4\ \text{L/h}$, patient B $CL = 8\ \text{L/h}$. With similar volumes, B removes the blocks about twice as fast and is usually less exposed.

This is why pharmacometrics reasons about **parameters** (CL, V), not just observed concentrations: parameters explain *why* curves differ.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s02" -->
**Every patient is different.** We now know the "one size fits all" — the same dose for everyone — is, sadly, false. But do not, for that reason, put every difference in one bucket called "noise".

A difference between observations may come from very different sources:

- **IIV** (inter-individual variability): patients are different builders;
- **IOV** (inter-occasion variability): the same patient changes between occasions;
- **residual error**: the measurement is imperfect;
- **model bias**: the instruction sheet is missing something.

**Pitfall —** mixing these up makes the model look simpler, but less useful — and sometimes misleading.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- PK describes what the body does to the drug.
- PD describes what the drug does to the body.
- A pharmacometric model is a simplified instruction sheet linking dose, concentration, effect and variability.
- Student rule: be able to tell the mechanism in words before trusting the equation.
<!-- /step -->

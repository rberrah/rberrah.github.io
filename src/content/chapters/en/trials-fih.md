---
id: "trials-fih"
slug: "trials-fih"
title: "First-in-human dose: MABEL and NOAEL"
description: "Choosing a safe starting dose: from the animal NOAEL to the pharmacology-based MABEL."
summary: "Starting-dose approaches for first-in-human trials: NOAEL, MRSD and MABEL."
track: "trials"
order: 100
duration: "12 min"
level: "advanced"
tags: ["clinical-trials", "first-in-human", "mabel", "starting-dose"]
slides: []
quiz:
  - prompt: "The MABEL approach bases the starting dose on..."
    options:
      - "the minimal anticipated biological effect level (pharmacology)"
      - "the maximum tolerated dose"
      - "the patient's weight"
    correct: 0
  - prompt: "The NOAEL comes from..."
    options:
      - "animal toxicology studies (no observed adverse effect level)"
      - "a phase III trial"
      - "the manufacturing file"
    correct: 0
  - prompt: "For highly active molecules (immune agonists), we favour..."
    options:
      - "MABEL over NOAEL, more conservative"
      - "the highest possible dose"
      - "no modelling"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The very first human dose is decided **without human data**: it must be extrapolated from animals and pharmacology. Too high a dose is dangerous (the **TGN1412** disaster showed this), too low delays development.

Pharmacometrics provides a rational framework: NOAEL, MRSD and, above all, **MABEL**.
<!-- /step -->

<!-- step:title="Intuition" viz="EmaxHill" -->
Two philosophies. **Toxicology** starts from the top: the highest dose **without adverse effect** in animals (NOAEL), divided by safety margins.

**Pharmacology** starts from the bottom: the lowest dose producing a detectable **biological effect** (MABEL). For a highly active molecule, this second route is far more prudent.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="EmaxHill" -->
From the animal **NOAEL**, we derive the maximum recommended starting dose (MRSD) via allometric scaling and safety factors:

$$ \text{HED} = \text{NOAEL}\times\left(\frac{W_{animal}}{W_{human}}\right)^{0.33},\qquad \text{MRSD} = \frac{\text{HED}}{\text{safety factor}} $$

The **MABEL** rests on the **exposure–target-occupancy** relationship (often an Emax): we choose a dose giving low occupancy (e.g. 10%), integrating affinity, in-vitro potency and PK/PD.

**Ref —** FDA *Guidance for Estimating the Maximum Safe Starting Dose* (2005); EMA *Guideline on first-in-human clinical trials* (revised 2017, after TGN1412).
<!-- /step -->

<!-- step:title="Worked example" viz="EmaxHill" -->
For an **immune agonist**, the NOAEL can yield a dangerously active human starting dose (poorly predictive species). The **MABEL**, anchored on receptor occupancy, proposes a much lower dose — the right choice.

We generally keep the most **conservative** dose between the approaches.
<!-- /step -->

<!-- step:title="Common pitfall" -->
The NOAEL is not always protective.

**Pitfall —** for **highly potent** biologics or mechanisms absent in animals, the NOAEL can badly **underestimate** the human risk. This is the TGN1412 lesson: favour MABEL and translational PK/PD modelling, not toxicology alone.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The FIH starting dose is extrapolated from animals and pharmacology, without human data.
- NOAEL → HED (allometry) → MRSD (safety factors).
- MABEL: lowest dose with biological effect, based on exposure–occupancy (Emax).
- For highly active molecules, MABEL takes precedence over NOAEL (TGN1412 lesson).
<!-- /step -->

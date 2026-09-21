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
      - "the highest dose with no observed adverse effect in animals"
      - "the exposure equivalent to the established animal therapeutic dose"
    correct: 0
  - prompt: "The NOAEL comes from..."
    options:
      - "animal toxicology studies (no observed adverse effect level)"
      - "in-vitro pharmacology studies (target affinity and potency data)"
      - "modelling of the target-receptor occupancy expected in humans"
    correct: 0
  - prompt: "For highly active molecules (immune agonists), we favour..."
    options:
      - "a cautious integration of MABEL/PAD/NOAEL evidence"
      - "the NOAEL divided by a markedly larger safety factor than usual"
      - "the average of the NOAEL-derived and the MABEL-derived doses"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The very first human dose is decided **without human data**: it must be extrapolated from animals and pharmacology. Too high a dose is dangerous (the **TGN1412** disaster showed this), too low delays development.

Pharmacometrics provides a rational framework integrating several lines of evidence: NOAEL/MRSD, **MABEL** and, depending on context, pharmacologically active dose (PAD).
<!-- /step -->

<!-- step:title="Intuition" viz="EmaxHill" -->
Two philosophies. **Toxicology** starts from the top: the highest dose **without adverse effect** in animals (NOAEL), divided by safety margins.

**Pharmacology** starts from the bottom: the lowest dose expected to produce an anticipated **biological effect** (MABEL/PAD), estimated from potency, target occupancy, PK/PD and translational uncertainty. For a highly active molecule, this route may be more prudent.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="EmaxHill" -->
From the animal **NOAEL**, we derive the maximum recommended starting dose (MRSD) via allometric scaling and safety factors:

$$ \text{HED}_{mg/kg} = \text{NOAEL}_{mg/kg}\times\left(\frac{W_{animal}}{W_{human}}\right)^{0.33},\qquad \text{MRSD} = \frac{\text{HED}}{\text{safety factor}} $$

This expression is a teaching representation of body-surface-area conversion; it is not the only possible method for choosing a starting dose.

The **MABEL** rests on a body of pharmacology data: exposure–target occupancy, in-vitro activity, PK/PD, relevant species and uncertainty. Low occupancy (for example 10%) may be one calculation scenario, but it is not a general rule.

**Ref —** FDA *Guidance for Estimating the Maximum Safe Starting Dose* (2005); EMA *Guideline on first-in-human clinical trials* (revised 2017, after TGN1412).
<!-- /step -->

<!-- step:title="Worked example" viz="EmaxHill" -->
For an **immune agonist**, the NOAEL can yield a dangerously active human starting dose (poorly predictive species). A MABEL/PAD approach anchored in anticipated human pharmacology may propose a much lower dose.

We generally choose a starting dose from a **cautious integration** of approaches, not from a mechanical competition between NOAEL and MABEL.
<!-- /step -->

<!-- step:title="Common pitfall" -->
The NOAEL is not always protective.

**Pitfall —** for **highly potent** biologics or mechanisms absent in animals, the NOAEL can badly **underestimate** the human risk. This is the TGN1412 lesson: integrate MABEL/PAD, translational PK/PD modelling and toxicology, rather than relying on a single rule.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The FIH starting dose is extrapolated from animals and pharmacology, without human data.
- NOAEL → HED (allometry) → MRSD (safety factors).
- MABEL/PAD: pharmacology-based approach integrating exposure, target, potency, PK/PD and uncertainty.
- For highly active molecules, integrate MABEL/PAD and NOAEL cautiously rather than mechanically prioritising one over the other.
<!-- /step -->

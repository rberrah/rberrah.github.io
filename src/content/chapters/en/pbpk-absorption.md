---
id: "pbpk-absorption"
slug: "pbpk-absorption"
title: "Oral absorption and first-pass in PBPK"
description: "From tablet to portal vein: dissolution, permeability, transit and first-pass effect."
summary: "Mechanistic oral absorption models (ACAT/ADAM), BCS classification and hepatic first-pass."
track: "pbpk"
order: 72
duration: "12 min"
level: "advanced"
tags: ["pbpk", "absorption", "first-pass", "bcs"]
slides: []
quiz:
  - prompt: "A mechanistic absorption model (ACAT/ADAM) divides the gut into..."
    options:
      - "successive segments with dissolution, permeability and transit"
      - "a single compartment where dissolution and absorption are instantaneous"
      - "two compartments separating the stomach from the small intestine"
    correct: 0
  - prompt: "The hepatic first-pass effect reduces..."
    options:
      - "the fraction of dose reaching the systemic circulation"
      - "the terminal half-life by speeding up drug elimination"
      - "the volume of distribution by trapping the drug in the liver"
    correct: 0
  - prompt: "In the BCS classification, a molecule depends mainly on its..."
    options:
      - "solubility and permeability"
      - "dissolution and lipophilicity"
      - "bioavailability and half-life"
    correct: 0
---

<!-- step:title="Why this chapter" -->
For an **oral** drug, bioavailability depends on a cascade: dissolution, intestinal permeability, transit, then hepatic **first-pass**. PBPK models each step mechanistically.

This lets us predict the effect of a **formulation**, a meal or an interaction on absorption.
<!-- /step -->

<!-- step:title="Intuition" viz="OralAbsorption" -->
The tablet must first **dissolve**, then the molecule must **cross** the intestinal wall, all while it **transits** along the gut.

Each intestinal segment has its pH, surface and transit: a mechanistic model (ACAT, ADAM) chains them.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="OralAbsorption" -->
Oral bioavailability factorises:

$$ F = f_a \cdot F_g \cdot F_h $$

- $f_a$: fraction dissolved and absorbed (solubility × permeability);
- $F_g$: fraction escaping gut metabolism;
- $F_h$: fraction escaping hepatic **first-pass**, $F_h = 1 - E_h$.

The **BCS classification** (solubility/permeability) predicts the limiting factor.

**Math —** $F_h$ links hepatic extraction and clearance: $E_h = \dfrac{CL_h}{Q_h}$. A high extractor has strong first-pass and low bioavailability.
<!-- /step -->

<!-- step:title="Worked example" viz="OralAbsorption" -->
A **BCS II** molecule (poorly soluble, well permeable) has absorption **limited by dissolution**: a formulation improving solubility increases $f_a$ and hence $F$.

A high hepatic extractor has low, **variable** oral bioavailability (sensitive to enzyme inhibitors/inducers).
<!-- /step -->

<!-- step:title="Common pitfall" -->
Absorption is not bioavailability.

**Pitfall —** a molecule can be **well absorbed** (high $f_a$) yet poorly bioavailable due to strong **first-pass** (low $F_h$). Confusing the two leads to poor formulation decisions. Food, gastric pH and transporters further complicate prediction.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Mechanistic oral absorption chains dissolution, permeability and transit (ACAT/ADAM).
- F = fa · Fg · Fh; hepatic first-pass (Fh = 1 − Eh) can dominate.
- The BCS classification (solubility/permeability) shows the limiting factor.
- Well absorbed ≠ bioavailable; beware first-pass and transporters.
<!-- /step -->

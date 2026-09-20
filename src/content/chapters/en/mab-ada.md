---
id: "mab-ada"
slug: "mab-ada"
title: "Immunogenicity: anti-drug antibodies (ADA)"
description: "When the immune system attacks the drug: ADA formation, impact on PK and efficacy."
summary: "ADA (anti-drug antibodies): mechanism, effect on clearance, neutralisation and modelling."
track: "mab"
order: 52
duration: "12 min"
level: "advanced"
tags: ["mab", "ada", "immunogenicity", "neutralizing"]
slides: []
quiz:
  - prompt: "ADA (anti-drug antibodies) are..."
    options:
      - "the patient's antibodies directed against the biologic drug"
      - "fragments released as the biologic drug is catabolised"
      - "the drug's antibodies directed against the patient's cells"
    correct: 0
  - prompt: "The appearance of ADA often tends to..."
    options:
      - "sometimes increase clearance and reduce the drug's exposure"
      - "decrease clearance by shielding the drug from catabolism"
      - "increase exposure via complexes with a prolonged half-life"
    correct: 0
  - prompt: "A 'neutralising' ADA (NAb)..."
    options:
      - "directly blocks the drug's activity (binding site)"
      - "binds the drug away from its active site, without neutralising it"
      - "speeds up the drug's clearance but leaves its activity intact"
    correct: 0
---

<!-- step:title="Why this chapter" -->
A therapeutic antibody is a **foreign protein**: the patient's immune system may make **anti-drug antibodies** (ADA). This is **immunogenicity**.

It can reduce exposure, effect duration, and even trigger reactions — a major concern for biologics, with an impact that strongly depends on the drug, assay and ADA type.
<!-- /step -->

<!-- step:title="Intuition" viz="55_ADA" -->
After a few administrations, some patients develop ADA that **bind** the drug. The complexes formed may be **eliminated faster** → concentration can drop in these patients.

Typical result: PK that "drops off" after a few weeks, with strong **inter-individual variability**.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="55_ADA" -->
We distinguish two ADA types:

- **Binding**: form complexes → can accelerate **clearance** (exposure ↓), depending on titre, persistence, complexes, assay and molecule.
- **Neutralising (NAb)**: also block the **active site** → the effect falls even at equal concentration.

A simple model may raise clearance after seroconversion:

$$ CL(t) = CL_0\,\big[1 + \theta_{ADA}\cdot A(t)\big] $$

where $A(t)$ captures the (often delayed) appearance of ADA.

**Ref —** EMA/FDA guidance on immunogenicity assessment; antibody PK reviews (Ryman & Meibohm 2017). Related to the "Antibody PK" and "TMDD" chapters.
<!-- /step -->

<!-- step:title="Worked example" viz="55_ADA" -->
A patient on an antibody sees the trough concentration **collapse** in the 3rd month: ADA test positive. Insufficient exposure may explain the **loss of response** (secondary failure), but the link must be confirmed.

Strategies: co-immunosuppression, induction schedules, molecular engineering (de-immunisation) to reduce immunogenicity.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A negative ADA test does not rule everything out.

**Pitfall —** ADA assays are **interfered with** by circulating drug: a high drug level can **mask** ADA (false negatives). Interpretation depends on sampling time, titre, persistence, neutralisation, complexes and assay sensitivity. Some biologics show little or no measurable PK effect from ADA.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- ADA are the patient's antibodies against the biologic drug (immunogenicity).
- Binding → may increase clearance and lower exposure; neutralising → may also block effect.
- Modelling: clearance sometimes increased after seroconversion, strong variability.
- ADA assays are prone to interference (false negatives); suspect on an exposure drop.
<!-- /step -->

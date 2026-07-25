---
id: "voies-absorption"
slug: "voies-absorption"
title: "Routes of absorption & bioavailability"
description: "IV, oral, subcutaneous, transdermal, inhaled: each route shapes the curve and the bioavailability — and without an IV reference, F is not identifiable."
summary: "An overview of administration routes and their PK consequences: absorption rate, first-pass, bioavailability."
track: "core"
order: 4.2
duration: "12 min"
level: "beginner"
tags: ["absorption", "route", "bioavailability", "first-pass"]
prerequisites: ["absorption-orale"]
glossary: ["F", "Ka", "Tlag", "Flip-flop", "Compartiments de transit"]
slides: []
quiz:
  - prompt: "By the intravenous (IV) route, the bioavailability F is..."
    options:
      - "1, since the whole dose reaches the blood"
      - "variable, depending on the hepatic first-pass"
      - "reduced below 1, as with the oral route"
    correct: 0
  - prompt: "The sublingual/buccal route is valuable because it..."
    options:
      - "bypasses the hepatic first-pass"
      - "speeds up the hepatic first-pass"
      - "improves gastrointestinal absorption"
    correct: 0
  - prompt: "A transdermal patch typically produces absorption that is..."
    options:
      - "zero-order, a constant and prolonged rate"
      - "first-order, proportional to the amount left"
      - "fast with an early peak, like the oral route"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The same molecule, given by different **routes**, gives very different curves. The route sets **how much** reaches the blood (bioavailability $F$), **how fast** (absorption), and whether the drug undergoes a hepatic **first-pass**.

Choosing the route is already doing pharmacokinetics.
<!-- /step -->

<!-- step:title="Intuition" viz="OralAbsorption" -->
The **IV** route short-circuits absorption: the whole dose is in the blood at once ($F=1$). Any other route must first **absorb**, which spreads and delays the peak.

The slower the absorption, the lower and later the peak; some routes (patch) impose a **constant** rate.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="OralAbsorption" -->
Oral bioavailability factorises:

$$ F = f_a \cdot F_g \cdot F_h $$

- $f_a$: fraction absorbed; $F_g$: escaping gut metabolism; $F_h = 1 - E_h$: escaping the hepatic **first-pass**.

The table of routes:

- **IV**: $F=1$, no absorption or first-pass — the reference.
- **Oral**: first-order absorption ($k_a$), possible first-pass → $F$ often < 1.
- **Subcutaneous / IM**: slow absorption (lymphatic for large proteins), variable $F$.
- **Sublingual / buccal / (low) rectal**: partly **bypass** the first-pass.
- **Transdermal (patch)**: **zero-order** absorption (constant rate).
- **Inhaled**: fast, local effect, partial systemic absorption.

**Note —** the BCS framework (solubility/permeability) and absorption models (see also the PBPK absorption chapter).
<!-- /step -->

<!-- step:title="Bioavailability and apparent parameters" viz="OralAbsorption" -->
Can we always **measure** $F$? No: it depends on the data at hand.

**With an IV reference.** Absolute bioavailability is computed by comparing exposures, dose-normalised:

$$ F = \frac{\mathrm{AUC}_{po}\,/\,\mathrm{Dose}_{po}}{\mathrm{AUC}_{iv}\,/\,\mathrm{Dose}_{iv}} $$

So you need **both routes** in the same subjects (typically a cross-over trial) to isolate $F$.

**With the oral route only.** In popPK you often have **only** oral data. But the amount that actually enters the blood is $F\cdot\text{Dose}$: $F$ is **confounded** with clearance and volume. You can then estimate only the **ratios**:

$$ \frac{CL}{F} \quad\text{(apparent clearance)}, \qquad \frac{V}{F} \quad\text{(apparent volume)} $$

**Key point —** without an IV reference, $F$ is **not identifiable** on its own: software reports CL/F and V/F. A CL/F that "rises" may come from a genuine increase in clearance **or** a drop in bioavailability — impossible to tell apart from oral data alone.
<!-- /step -->

<!-- step:title="Worked example" viz="Infusion" -->
**Nitroglycerin** given **sublingually** acts within minutes because it avoids the first-pass (which would destroy it orally). A fentanyl **patch** releases at a **constant rate** (zero-order), like a slow infusion — hence a prolonged plateau.

An **antibody** given **subcutaneously** takes days to be absorbed (lymphatic route), with $F$ ≈ 50–80%.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Slow absorption can mask elimination.

**Pitfall —** if absorption is slower than elimination ($k_a < k_e$), the **terminal slope** reflects **absorption**, not elimination: this is **flip-flop** (common in SC, patch, extended-release forms). You then think you are measuring an elimination half-life while reading the absorption rate.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The route sets F (how much), the absorption rate (when) and the first-pass.
- IV: F = 1, the reference. Oral: F = fa·Fg·Fh, possible first-pass.
- Sublingual/low rectal bypass the first-pass; patch = zero-order; SC = slow (lymphatic).
- Beware flip-flop: ka < ke ⇒ the terminal slope reflects absorption.
- F is only measurable with an **IV reference**; from oral data alone, you estimate only the **apparent** clearance and volume (CL/F, V/F).
<!-- /step -->

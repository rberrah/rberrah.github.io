---
id: "infectio-pkpd"
slug: "infectio-pkpd"
title: "PK/PD indices of anti-infectives"
description: "T>MIC, Cmax/MIC, AUC/MIC: the shape of exposure relative to the MIC decides efficacy."
summary: "The three antibiotic PK/PD indices and the bactericidal curve."
track: "infectio"
order: 40
duration: "13 min"
level: "intermediate"
tags: ["infectious-diseases", "pkpd-index", "mic", "antibiotics"]
slides: []
quiz:
  - prompt: "For beta-lactams, the PK/PD index predictive of efficacy is..."
    options:
      - "the time spent above the MIC (T>MIC)"
      - "the patient's weight"
      - "the colour of the solution"
    correct: 0
  - prompt: "A concentration-dependent antibiotic (aminoglycoside) is optimised by..."
    options:
      - "a high Cmax/MIC (large, spaced doses)"
      - "small very frequent doses"
      - "no infusion at all"
    correct: 0
---

<!-- step:title="Why this chapter" -->
For an antibiotic, efficacy depends not only on total exposure but on the **shape** of the concentration relative to the germ's **MIC** (minimum inhibitory concentration).

Three **PK/PD indices** summarise this — and guide the dosing schedule.
<!-- /step -->

<!-- step:title="Intuition" viz="56_PKPDIndex" -->
Plot concentration over time and a horizontal line = the MIC.

Three questions: **how long** do we stay above the MIC? **How high** is the peak relative to the MIC? **What area** lies above the MIC? Each antibiotic family favours one of them.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="56_PKPDIndex" -->
The three indices (Craig, 1998):

- **T > MIC** (time-dependent): beta-lactams. Optimised by **prolonged/continuous infusions**.
- **Cmax / MIC** (concentration-dependent): aminoglycosides, fluoroquinolones. Optimised by **large spaced doses**.
- **AUC / MIC**: fluoroquinolones, glycopeptides (vancomycin: target AUC₂₄/MIC ≥ 400).

$$ \%T_{>MIC}, \qquad \frac{C_{max}}{MIC}, \qquad \frac{AUC_{24}}{MIC} $$

**Ref —** Craig W.A., *Clin Infect Dis* 1998 — the founding framework for PK/PD indices.
<!-- /step -->

<!-- step:title="Worked example" viz="EmaxHill" -->
The **bactericidal curve** links concentration to the rate of bacterial killing — often an **Emax** model: beyond a certain multiple of the MIC, killing faster becomes marginal.

For a beta-lactam, prolonging the infusion increases **T>MIC** without increasing the total dose.
<!-- /step -->

<!-- step:title="Common pitfall" -->
The MIC is not an exact constant.

**Pitfall —** the MIC varies between germs and by two-fold dilutions. One must also reason on the **free fraction** (the only active one) and beware the **inoculum effect**. An index computed on total concentration can overestimate efficacy.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Antibiotic efficacy depends on the shape of exposure vs MIC.
- T>MIC (beta-lactams), Cmax/MIC (aminoglycosides), AUC/MIC (fluoroquinolones, vancomycin).
- Bactericidal killing often follows an Emax; the free fraction is what counts.
- MIC and inoculum introduce uncertainty.
<!-- /step -->

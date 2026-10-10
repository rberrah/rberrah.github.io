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
prerequisites: ["pkpd","nca-auc"]
glossary: ["CMI","PTA","AUC","Cmax / Tmax"]
sources: ["craig-pkpd","rybak-vanco","eucast","goutelle-hill"]
updated_on: "2026-10-10"
reviewed_on: "2026-10-10"
review_type: "author"
reviewed_hash: "6090066b54a8d4c67823c676099209a10aa5eec0d01a4709baeb2b3d2d6abf97"
scientific_values: {"vancomycin_auc24_lower":400,"vancomycin_auc24_upper":600,"reference_mic_mg_l":1,"mic_dilution_factor":2}
units: {"auc24":"mg*h/L","mic":"mg/L","auc_mic":"h","mic_dilution_factor":"fold"}
quiz:
  - prompt: "For beta-lactams, the PK/PD index predictive of efficacy is..."
    options:
      - "the time spent above the MIC (T>MIC)"
      - "the peak concentration over MIC (Cmax/MIC)"
      - "the area under the curve over MIC (AUC/MIC)"
    correct: 0
  - prompt: "A concentration-dependent antibiotic (aminoglycoside) is optimised by..."
    options:
      - "a high Cmax/MIC (large, spaced doses)"
      - "a high T>MIC via prolonged continuous infusion"
      - "small, closely spaced doses to smooth the peak"
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
- **Cmax / MIC** (concentration-dependent): a classic aminoglycoside index; it can also be informative for some fluoroquinolones depending on the drug, pathogen and endpoint.
- **fAUC / MIC**: the principal index most often retained for fluoroquinolones, using unbound exposure when the target was defined that way. For vancomycin in serious MRSA infections, the 2020 consensus recommends an **AUC₂₄ of 400–600 mg·h/L when MIC is 1 mg/L by broth microdilution**. That condition and the MIC method must remain explicit in interpretation.

$$ \%T_{>MIC}, \qquad \frac{C_{max}}{MIC}, \qquad \frac{AUC_{24}}{MIC} $$

**Ref —** Craig W.A., *Clin Infect Dis* 1998 — the founding framework for PK/PD indices.
<!-- /step -->

<!-- step:title="Worked example" viz="EmaxHill" -->
The **bactericidal curve** links concentration to the rate of bacterial killing — often an **Emax** model: beyond a certain multiple of the MIC, killing faster becomes marginal.

For a beta-lactam, prolonging the infusion increases **T>MIC** without increasing the total dose.
<!-- /step -->

<!-- step:title="Common pitfall" -->
The MIC is not an exact constant.

**Pitfall —** the MIC varies between organisms and by two-fold dilutions. Indices are often defined from **free concentration**, but the relationship between binding, free exposure and effect depends on the drug and context. Beware the **inoculum effect**, and state whether an index uses free or total concentration.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Antibiotic efficacy depends on the shape of exposure vs MIC.
- T>MIC (beta-lactams), Cmax/MIC (aminoglycosides), fAUC/MIC as the principal fluoroquinolone index, and AUC/MIC for vancomycin in its validated setting.
- Unbound exposure at the relevant site is often mechanistically active, but unbound fraction, unbound concentration and the validated index are not interchangeable.
- MIC and inoculum introduce uncertainty.
<!-- /step -->

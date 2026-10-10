---
id: "infectio-tdm"
slug: "infectio-tdm"
title: "Therapeutic drug monitoring of antibiotics"
description: "Vancomycin, aminoglycosides, beta-lactams in the ICU: measure, estimate the AUC, adjust."
summary: "Monitoring narrow-index antibiotics, especially in intensive care."
track: "infectio"
order: 41
duration: "12 min"
level: "intermediate"
tags: ["infectious-diseases", "tdm", "vancomycin", "icu"]
slides: []
prerequisites: ["infectio-pkpd","tdm"]
glossary: ["TDM","MAP-BE","CMI","PTA"]
sources: ["rybak-vanco","roberts-dali","minichmayr-mipd","sheiner-forecasting"]
reviewed_on: "2026-07-09"
review_type: "author"
reviewed_hash: "f1aaaf3bbc92f5fafb28027b382f3ac3b3ec91bd52d6965b389624a3ae463025"
quiz:
  - prompt: "For vancomycin in serious MRSA infections, the currently preferred target is..."
    options:
      - "AUC₂₄/MIC 400–600 when MIC is 1 mg/L by broth microdilution"
      - "a steady-state trough of 15–20 mg/L"
      - "a Cmax/MIC ≥ 8 peak on the first sample"
    correct: 0
  - prompt: "In the ICU, augmented renal clearance (ARC) tends to..."
    options:
      - "under-dose hydrophilic antibiotics"
      - "over-expose hydrophilic antibiotics"
      - "affect only lipophilic antibiotics"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Some narrow-**therapeutic-index** antibiotics (vancomycin, aminoglycosides) or highly variable ones (beta-lactams in the ICU) require **therapeutic drug monitoring** (TDM).

The goal: stay effective (above the PK/PD target) without toxicity (renal, auditory).
<!-- /step -->

<!-- step:title="Intuition" viz="TDMProfile" -->
As for any TDM: **measure** a concentration, **estimate** the individual profile by Bayes, **adjust** the dose.

The infectious specificity: the target is a **PK/PD index** (AUC/MIC, Cmax/MIC), not just a trough concentration.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="MultiDose" -->
Vancomycin example: for serious MRSA infections, the 2020 consensus recommends an **AUC₂₄ of 400–600 mg·h/L when MIC is assumed to be 1 mg/L by broth microdilution**. AUC can be estimated with a **Bayesian** approach from 1–2 samples rather than from the trough alone. This range should not be transferred automatically to another MIC method, organism or clinical setting.

$$ \text{AUC}_{24} = \frac{\text{Dose}_{24}}{CL} $$

**Ref —** Rybak M.J. et al., *Am J Health-Syst Pharm* 2020 (vancomycin consensus, AUC/MIC 400–600 target in that setting); Roberts J.A. et al., *Clin Infect Dis* 2014 (DALI study: frequent beta-lactam under-exposure in the ICU).
<!-- /step -->

<!-- step:title="Worked example" viz="TDMProfile" -->
In the ICU, a patient with **augmented renal clearance** (ARC) eliminates fast: at a standard dose they are **under-exposed** — a risk of failure. Bayesian TDM detects the high CL and **increases/shortens** the doses.

Conversely, renal impairment requires reducing the dose to avoid toxicity.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Do not set a dose on a concentration without its context.

**Pitfall —** the **sampling time** and **renal function** (often unstable in the ICU) are critical. Aiming for a trough without estimating the AUC can miss the real target; the germ's MIC must be known or assumed.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- TDM concerns narrow-index or highly variable antibiotics (ICU).
- For vancomycin in serious MRSA infection, the AUC₂₄ range of 400–600 mg·h/L is conditional on an MIC of 1 mg/L by broth microdilution.
- Augmented renal clearance under-doses hydrophilic antibiotics.
- Sampling time, renal function and MIC drive the adjustment.
<!-- /step -->

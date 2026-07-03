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
quiz:
  - prompt: "For vancomycin, the currently preferred target is..."
    options:
      - "AUC₂₄/MIC ≥ 400 (Bayesian-estimated)"
      - "the colour of the urine"
      - "a fixed dose for everyone"
    correct: 0
  - prompt: "In the ICU, augmented renal clearance (ARC) tends to..."
    options:
      - "under-dose hydrophilic antibiotics"
      - "systematically overdose"
      - "change nothing"
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
Vancomycin example: recent guidelines target **AUC₂₄/MIC ≥ 400**, estimated by a **Bayesian** approach from 1–2 samples (rather than the trough alone).

$$ \text{AUC}_{24} = \frac{\text{Dose}_{24}}{CL} $$

**Ref —** Rybak M.J. et al., *Am J Health-Syst Pharm* 2020 (vancomycin consensus, AUC/MIC target); Roberts J.A. et al., *Clin Infect Dis* 2014 (DALI study: frequent beta-lactam under-exposure in the ICU).
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
- The target is a PK/PD index (vancomycin: AUC₂₄/MIC ≥ 400) estimated by Bayes.
- Augmented renal clearance under-doses hydrophilic antibiotics.
- Sampling time, renal function and MIC drive the adjustment.
<!-- /step -->

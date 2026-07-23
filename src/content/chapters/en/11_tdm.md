---
id: "tdm"
slug: "tdm"
title: "Therapeutic drug monitoring (TDM)"
description: "How models support individual dose adjustment without replacing the clinician."
summary: "Measure, estimate (Bayes), adjust: therapeutic drug monitoring and its cautious interpretation."
track: "core"
order: 11
duration: "12 min"
level: "intermediate"
tags: ["tdm", "bayesian", "clinical-use", "conclusion"]
slides: ["s59", "s62", "s72"]
quiz:
  - prompt: "Therapeutic drug monitoring (TDM) uses drug measurements to..."
    options:
      - "inform the interpretation of exposure and future dosing decisions"
      - "confirm only that the patient has taken all their doses"
      - "set the dose automatically without clinical interpretation"
    correct: 0
  - prompt: "For model-based TDM, the sampling time is..."
    options:
      - "crucial information to know"
      - "a secondary detail for the estimate"
      - "useful only for a trough sample"
    correct: 0
  - prompt: "This educational site should be used for..."
    options:
      - "learning concepts, not dosing a specific patient"
      - "prescribing doses directly to real patients"
      - "replacing validated clinical dosing tools"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s59" -->
Therapeutic drug monitoring (TDM) is where pharmacometrics becomes concrete: a dose was given, a concentration was measured, and a decision may follow.

The model helps **interpret** the measurement in context. It does not replace clinical responsibility.
<!-- /step -->

<!-- step:title="Intuition" slides="s62" viz="TDMProfile" -->
A concentration without a time is like a photo without knowing when it was taken.

Was the construction just started, near its peak, or already being dismantled? Timing changes the interpretation.

**Key point —** the model uses the dosing history and the sampling time to tell apart "a patient who builds slowly", "a patient who loses blocks" and "a photo taken too late".
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s59" -->
A Bayesian TDM workflow combines:

$$ \text{population model} + \text{dosing history} + \text{sampling time} + \text{measured concentration} $$

**Math —** the output is an **updated individual estimate with its uncertainty** — not a guaranteed truth. It is the Bayesian chapter applied at the bedside.
<!-- /step -->

<!-- step:title="Worked example" slides="s62" -->
For tacrolimus, vancomycin, aminoglycosides or warfarin-related models, a single measured value is useful only if the context is correct.

Dose, administration times, sampling time, assay details, renal or hepatic function, adherence and interacting drugs can all matter.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s72" -->
Do not treat the model output as a prescription.

**Pitfall —** a model can support reasoning, show uncertainty and simulate scenarios. Individual dosing decisions require validated tools, clinical governance and local protocols.

**In the clinic —** this site teaches concepts only. It is not medical advice and provides no patient-specific dosing.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- TDM interprets measurements in time and context.
- Bayesian models borrow strength from the population while adapting to the patient.
- Uncertainty must stay visible.
- This site is educational; it does not replace clinical judgement.
<!-- /step -->

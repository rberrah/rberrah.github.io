---
id: "tdm"
slug: "tdm"
title: "TDM and conclusion"
description: "How models can support therapeutic drug monitoring without replacing clinicians."
summary: "A final chapter connecting model-based learning to individual monitoring and safe interpretation."
track: "core"
order: 12
duration: "12 min"
level: "intermediate"
tags: ["tdm", "bayesian", "clinical-use", "conclusion"]
slides: ["s71", "s72", "s73", "s74"]
quiz:
  - prompt: "TDM uses drug measurements to..."
    options:
      - "inform interpretation of exposure and future dosing decisions"
      - "replace all clinical judgement"
      - "avoid knowing sample time"
    correct: 0
  - prompt: "For model-based TDM, sample timing is..."
    options:
      - "critical"
      - "irrelevant"
      - "always unknown"
    correct: 0
  - prompt: "This educational site should be used for..."
    options:
      - "learning concepts, not patient-specific dosing"
      - "automatic prescriptions"
      - "ignoring uncertainty"
    correct: 0
---

<!-- step:title="Why this matters" slides="s71" -->
Therapeutic drug monitoring is where pharmacometrics becomes concrete: a dose was given, a concentration was measured, and a decision may follow.

The model helps interpret the measurement in context. It does not replace clinical responsibility.
<!-- /step -->

<!-- step:title="Intuition" slides="s71" -->
A concentration without timing is like a photo without knowing when it was taken.

Was the construction just started, near its peak, or already being dismantled? Timing changes the interpretation.
<!-- /step -->

<!-- step:title="Building-block metaphor" slides="s72" viz="BuildingBlocksPKPD" -->
TDM is like checking a student's construction halfway through.

If fewer blocks are visible than expected, the student may be building slowly, losing blocks, or the photo may have been taken late. The model uses dose history and sample time to separate these possibilities.
<!-- /step -->

<!-- step:title="Minimal math" slides="s72" -->
A Bayesian TDM workflow combines:

$$ \text{population model} + \text{dose history} + \text{sample time} + \text{measured concentration} $$

The output is an updated patient-specific estimate with uncertainty, not a guaranteed truth.
<!-- /step -->

<!-- step:title="Worked example" slides="s73" -->
For tacrolimus, vancomycin, aminoglycosides, or warfarin-related models, one measured value can be useful only if the context is correct.

Dose amount, dosing times, sample time, assay details, renal or liver function, adherence, and interacting drugs can all matter.
<!-- /step -->

<!-- step:title="Common trap" slides="s74" -->
Do not treat the model output as a prescription.

A model can support reasoning, show uncertainty, and simulate scenarios. Patient-specific dosing decisions require validated tools, clinical governance, and local protocols.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- TDM interprets measurements in time and context.
- Bayesian models borrow strength from the population while updating for the patient.
- Uncertainty must remain visible.
- This site teaches concepts only; it is not medical advice.
<!-- /step -->

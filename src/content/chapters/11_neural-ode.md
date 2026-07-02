---
id: "neural-ode"
slug: "neural-ode"
title: "Grey-box models and Neural ODEs"
description: "Where machine learning can help without replacing pharmacology."
summary: "A cautious introduction to hybrid PK models, ML covariates, and Neural ODEs."
track: "ai"
order: 11
duration: "13 min"
level: "advanced"
tags: ["ai", "machine-learning", "neural-ode", "grey-box"]
slides: ["s65", "s66", "s67", "s68", "s69", "s70"]
quiz:
  - prompt: "A grey-box model combines..."
    options:
      - "mechanistic structure and flexible data-driven components"
      - "no assumptions and no data"
      - "only a spreadsheet"
    correct: 0
  - prompt: "A Neural ODE is useful when..."
    options:
      - "we need flexible dynamics but still want an ODE framework"
      - "we want to avoid validation"
      - "we have no time variable"
    correct: 0
  - prompt: "A key risk of ML in pharmacometrics is..."
    options:
      - "overfitting and poor extrapolation"
      - "having too much mechanistic interpretability"
      - "using units"
    correct: 0
---

<!-- step:title="Why this matters" slides="s65" viz="20_NeuralBox" -->
Modern datasets can be large and complex. Machine learning can help detect patterns, but pharmacometrics still needs mechanisms, units, and uncertainty.

The practical goal is not "AI instead of PK." It is better models where flexible components are used carefully.
<!-- /step -->

<!-- step:title="Intuition" slides="s66,s67" viz="20_NeuralBox" -->
Mechanistic PK is an instruction sheet written by a teacher. Machine learning can add a flexible assistant that notices patterns the teacher did not specify.

The danger is letting the assistant invent a rule that works only for yesterday's classroom.
<!-- /step -->

<!-- step:title="Building-block metaphor" slides="s65" viz="BuildingBlocksPKPD" -->
A grey-box model keeps the main classroom layout: blocks enter, distribute, and leave.

It may let a data-driven component learn one uncertain part of the process, such as a nonlinear input, a hidden delay, or a complex covariate effect.
<!-- /step -->

<!-- step:title="Minimal math" slides="s68" viz="20_NeuralBox" -->
A mechanistic ODE might be:

$$ \frac{dA}{dt} = f_{\mathrm{PK}}(A, \theta) $$

A grey-box or Neural ODE can extend it:

$$ \frac{dA}{dt} = f_{\mathrm{PK}}(A, \theta) + f_{\mathrm{NN}}(A, x) $$

The neural part should be constrained, checked, and interpreted with caution.
<!-- /step -->

<!-- step:title="Worked example" slides="s69,s70" viz="20_NeuralBox" -->
A machine-learning model may help rank covariates, detect clusters of EBEs, or capture a nonlinear biomarker pattern.

But for dosing, the model must still answer basic pharmacometric questions: what are the units, where is uncertainty, and what happens outside the training range?
<!-- /step -->

<!-- step:title="Common trap" slides="s67" -->
Do not confuse prediction accuracy inside a dataset with scientific transportability.

A flexible model can fit observed data while failing under a new dose, new population, or new sampling schedule. Extrapolation is where mechanistic structure earns its place.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- AI can support pharmacometrics, not replace it.
- Grey-box models combine mechanism with flexibility.
- Neural ODEs keep a dynamic-system view.
- Extrapolation, uncertainty, and interpretability remain essential.
<!-- /step -->

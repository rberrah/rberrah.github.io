---
id: "neural-ode"
slug: "neural-ode"
title: "Grey-box models and Neural ODEs"
description: "Where machine learning can help without replacing pharmacology."
summary: "A cautious introduction to hybrid PK models, ML covariates and Neural ODEs."
track: "ai"
order: 12
duration: "13 min"
level: "advanced"
tags: ["ai", "machine-learning", "neural-ode", "grey-box"]
slides: ["s63", "s65", "s66", "s68", "s69", "s70", "s71"]
quiz:
  - prompt: "A grey-box model combines..."
    options:
      - "a mechanistic structure and flexible data-driven components"
      - "a fully mechanistic structure that forbids any learned data-driven component"
      - "an unconstrained neural network with no underlying mechanistic structure"
    correct: 0
  - prompt: "A Neural ODE is useful when..."
    options:
      - "you want flexible dynamics while keeping an ODE framework"
      - "you want a closed-form analytic solution without solving any ODE"
      - "you want to replace the ODE with a static network that ignores time"
    correct: 0
  - prompt: "A major risk of ML in pharmacometrics is..."
    options:
      - "overfitting and poor extrapolation"
      - "underfitting caused by an overly constrained model"
      - "excessively slow convergence of the optimization algorithm"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s65" viz="20_NeuralBox" -->
Modern datasets can be vast and complex. Machine learning helps detect patterns, but pharmacometrics still needs mechanisms, units and uncertainty.

**Key point —** the practical goal is not "AI instead of PK", but better models where flexible components are used **with caution**.
<!-- /step -->

<!-- step:title="Intuition" slides="s66" viz="20_NeuralBox" -->
Mechanistic PK is an instruction sheet written by a teacher. Machine learning can add a **flexible assistant** that notices patterns the teacher did not specify.

The danger: letting the assistant invent a rule that only works for yesterday's classroom.
<!-- /step -->

<!-- step:title="Three uses in pharmacometrics" slides="s66,s68,s69" viz="20_NeuralBox" -->
The course distinguishes three concrete roles for AI:

- **Selection** (random forests / VSURF): sift dozens of covariates and flag the truly influential ones, beyond manual forward/backward.
- **Prediction** (e.g. XGBoost): learn a relationship directly — say concentration → AUC — without a differential equation.
- **Hybridization** (Neural ODE): keep the mechanistic structure and let the network handle only the unknown part.

**Note —** a related use: **cluster the EBEs** to discover phenotypes (slow/fast metabolizers) and generate clinical hypotheses.
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s70" viz="20_NeuralBox" -->
A mechanistic ODE might be:

$$ \frac{dA}{dt} = f_{\mathrm{PK}}(A, \theta) $$

A grey-box or Neural ODE extends it:

$$ \frac{dA}{dt} = f_{\mathrm{PK}}(A, \theta) + f_{\mathrm{NN}}(A, x) $$

**Math —** $f_{\mathrm{PK}}$ stays the mechanistic part (interpretable, with units); $f_{\mathrm{NN}}$ is a learned correction. It must be **constrained, checked and interpreted** with caution, not left free.
<!-- /step -->

<!-- step:title="Worked example" slides="s68,s69" viz="20_NeuralBox" -->
An ML model can help rank covariates, detect clusters of EBEs, or capture a nonlinear biomarker pattern.

But to dose, the model must still answer the basic pharmacometric questions: **what units, where is the uncertainty, what happens outside the training domain?**
<!-- /step -->

<!-- step:title="Common pitfall" slides="s71" -->
Do not confuse predictive accuracy within a dataset with scientific transportability.

**Pitfall —** a flexible model can fit the observed data yet fail under a new dose, a new population or a new sampling schedule. **Extrapolation is where mechanistic structure earns its place.**

**In the clinic —** never present AI as superior by default: without external validation and visible uncertainty, a good internal score guarantees nothing at the bedside.
<!-- /step -->

<!-- step:title="Key takeaways" slides="s70,s71" -->
- Three uses: **selection** (VSURF), **prediction** (XGBoost), **hybridization** (Neural ODE).
- Grey-box models combine mechanism and flexibility; Neural ODEs keep a dynamical-system view.
- Horizon: the patient's **digital twin** (DIGPHAT consortium), fusing physiology + AI.
- Clinical conclusion: **AI is not magic, it is useful**. The clinician decides; the algorithm reduces uncertainty. Extrapolation, uncertainty and interpretability remain essential.

:::note
**Going further.** This chapter is the **entry point** of the core track. The **"AI in pharmacometrics"** track is an **advanced, research-oriented** deep dive (trees, boosting, SVM, clustering, feature selection, LLMs). It is a **fast-moving** field: it is not required to master the fundamentals, and its content ages faster than the rest of the site.
:::
<!-- /step -->

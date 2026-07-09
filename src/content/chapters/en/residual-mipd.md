---
id: "residual-mipd"
slug: "residual-mipd"
title: "Residual error in MIPD: a hidden lever"
description: "In precision dosing, residual error is not a fixed constant: it arbitrates how much the patient's data outweigh the population model."
summary: "Why and how to tune σ in MAPBE: the prior ↔ data balance, the gain in AUC precision, the overfitting risk, and practical guidance."
track: "tools"
order: 206
duration: "15 min"
level: "advanced"
tags: ["mipd", "mapbe", "residual", "tdm", "auc", "precision-dosing"]
prerequisites: ["erreur-residuelle", "bayes-ebes", "tools-mipd"]
glossary: ["MAP", "TDM", "RUV", "ε / σ", "Precision dosing"]
slides: []
quiz:
  - prompt: "In the MAP estimation objective, what does a smaller residual error σ do?"
    options:
      - "It increases the weight of observed concentrations: the posterior follows the patient's data more closely."
      - "It increases the weight of the population prior."
      - "It has no effect on the estimation."
    correct: 0
  - prompt: "What is the main risk of a near-zero residual error on noisy or sparse data?"
    options:
      - "Underfitting: the posterior sticks to the prior."
      - "Overfitting: the model reads measurement noise as signal and yields implausible AUCs."
      - "No risk — it is always the best choice."
    correct: 1
  - prompt: "According to Berrah et al., which proportional error is a good pragmatic default in high-quality analytical settings?"
    options:
      - "About 1% (the 'Flat1' scenario)."
      - "Exactly the published model value, always."
      - "50%."
    correct: 0
---

<!-- step:title="Why this chapter" -->
In **model-informed precision dosing** (MIPD), a *published* population model is reused to adapt the dose of a new patient from **a few samples** (TDM). The engine is **MAP** Bayesian estimation: it blends these sparse measurements with the model's prior knowledge.

One parameter usually slips through unnoticed in this transfer: the **residual error** σ. It is carried over "as published", without asking whether it still fits — different lab, different assay, different sampling times. Yet it is no inert constant: it is a **lever** that sets how much the estimation listens to the patient rather than the population.

:::recall
Recall from the "Residual error" chapter: σ models the gap between the individual prediction and the observation (assay imprecision, sampling mishaps, small model flaws). Here we focus on its **role in MAP estimation**, not on its shape (additive/proportional).
:::
<!-- /step -->

<!-- step:title="Intuition" viz="MipdResidualLever" -->
MAP estimation is a **constant compromise** between two voices: the **prior** (what the population says about the "average" patient) and the **data** (*this* patient's samples). Residual error σ is the **volume knob** between them.

A **small σ** turns up the data: the posterior is pulled toward the measured points. A **large σ** lets the prior speak: parameters stay close to the population.

:::howto
**How to read the figure.** The dashed curve is the prior (the "average" patient). The dots are *this* patient's samples (whose clearance differs). Lower σ: weight shifts to the data, the posterior curve leaves the prior to hug the points, and the estimated AUC converges to the true individual exposure.
:::
<!-- /step -->

<!-- step:title="The formula, unpacked" -->
This compromise is exactly what the MAP criterion minimises, balancing **two forces**:

$$ \text{Criterion} \;=\; \underbrace{\sum_{i} \frac{(y_i - \hat{y}_i)^2}{\sigma_i^2}}_{\text{fidelity to data}} \;+\; \underbrace{\sum_{j} \frac{\eta_j^2}{\omega_j^2}}_{\text{fidelity to prior}} $$

- The **first term** penalises the gap between observed $y_i$ and predicted $\hat{y}_i$ concentrations, **weighted by $1/\sigma_i^2$**.
- The **second term** penalises how far individual parameters ($\eta_j$) drift from the population, weighted by $1/\omega_j^2$.

Dividing by $\sigma_i^2$ says it all: the **smaller** σ, the **larger** $1/\sigma_i^2$, the more a given prediction error **costs** — the algorithm is forced to track the data rather than the prior.
<!-- /step -->

<!-- step:title="Worked example" -->
Since the published σ was estimated on *another* population and *other* conditions, keeping it blindly can under-use the patient's measurements. The consequence is direct: **lowering σ improves the precision of the individual AUC**.

This is the central result of **Berrah et al. (2025)**. On rich datasets of tacrolimus, iohexol and mycophenolic acid, with only 3 samples per patient, reducing the proportional error cut the AUC **RMSE by 30–40%** versus the original model. For tacrolimus, RMSE fell from **28.5% to 16.3%** at a 1% error; for iohexol, a near-zero error reached up to **40%** reduction.

:::key
The more reliable the analytics, the more legitimate it is to trust the measurements. Lowering σ **strengthens the influence of observed data** on the posterior, without changing the model structure or collecting extra samples: a "free" gain in precision.
:::

A striking finding: the improvement was largest when the original model was **least precise** — boosting the data's weight partly corrects the imprecision of a model imported from another context (e.g. developed on ICU patients then applied to a general population).
<!-- /step -->

<!-- step:title="Common pitfall" -->
If a little data beats too much prior, should we push σ to **zero**? No — and that is the whole point.

:::pitfall
With **noisy or sparse** data, a near-zero σ makes every measurement fluctuation look like true biological signal. The model **chases the noise**: parameters become unstable and the AUC can turn absurd. Berrah et al. report rare tacrolimus cases with an estimated AUC **> 1000 mcg·h/L** when σ was set to zero. This overfitting is visible: the posterior curve hugs each point too tightly and yields clinically implausible values.
:::

In their analysis the trap stayed rare (3 of 321 patients), but it is a reminder that σ also encodes the **total observation noise** — analytical imprecision *plus* pre-analytical factors (timing, handling) — not just the assay CV. Move the figure's noise slider, bring σ back to 1%: the posterior curve starts to wiggle toward the noisy points and the AUC error blows up.
<!-- /step -->

<!-- step:title="What to choose in practice" -->
The guidance proposed by Berrah et al. is a trade-off between individualisation and robustness:

| Context | Recommended proportional σ |
|---|---|
| High-quality analytics (LC-MS/MS), well-documented sampling | ≈ **1%** ("Flat1"), small but **non-zero** |
| Higher observation noise, looser TDM practice | **2 – 5%** |
| When in doubt | quick sweep **0.5 – 3%** + diagnostics (visual fits, residuals) |
| Imprecise timing / variable handling | add a small **additive** term to the error |

The **Flat1 (1%)** scenario stands out as a good default at the *population* level; at the *individual* level, zero error was often the most accurate for extreme profiles, but at the cost of overfitting risk. A **small but non-zero** σ keeps the prior from crushing sparse data while damping the noise.

:::note
This approach is a **cousin** of Hughes & Keizer's *prior flattening* (inflating $\omega^2$ to lighten the prior): both hand weight back to the data. Berrah et al. act on σ rather than $\omega$ to isolate the residual-error effect. In both cases the study recommends **explicitly documenting** the chosen parameter and its rationale when reusing a published model.
:::
<!-- /step -->

<!-- step:title="Key takeaways" -->
- In MIPD, residual error σ is **not** a fixed constant: it is a lever that sets the weight of the **patient's data** against the population **prior** in MAP estimation.
- **Lowering σ** strengthens the influence of the measurements and **improves AUC precision** — Berrah et al. report 30–40% lower RMSE (tacrolimus: 28.5% → 16.3% at 1%), with no new samples or model redevelopment.
- **σ too small** (≈ 0) on noisy data → **overfitting**: the model follows the noise and produces implausible AUCs.
- Pragmatic default: **≈ 1%** in high-quality settings, **2–5%** otherwise; check with a sensitivity sweep and diagnostics; add an additive term if timing is imprecise.
- **Document** the chosen σ and its rationale when reusing a published model.

:::note
**Reference.** Berrah R, Minichmayr IK, Woillard JB, on behalf of the IATDMCT Pharmacometrics Group. *Better Dosing Through Better Error: Residual Error as a Hidden Lever in Model-Informed Precision Dosing.* Ther Drug Monit. 2025.
:::
<!-- /step -->

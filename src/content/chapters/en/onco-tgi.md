---
id: "onco-tgi"
slug: "onco-tgi"
title: "Tumour growth and joint models"
description: "Modelling tumour size (Claret), linking it to exposure, then to survival via a joint model."
summary: "Tumour growth inhibition (Claret), exposure–response and the joint TGI–survival model."
track: "onco"
order: 30
duration: "15 min"
level: "advanced"
tags: ["oncology", "tumor-growth", "joint-model", "survival"]
slides: []
quiz:
  - prompt: "In the Claret model, the treatment effect on the tumour..."
    options:
      - "fades over time (resistance develops)"
      - "is constant forever"
      - "does not depend on exposure"
    correct: 0
  - prompt: "A joint TGI–survival model links..."
    options:
      - "tumour-size dynamics to the risk of progression/death"
      - "dose to body weight only"
      - "two independent PK models"
    correct: 0
  - prompt: "The joint-model parameter β measures..."
    options:
      - "the strength of the link between tumour size and hazard"
      - "the drug clearance"
      - "the oral bioavailability"
    correct: 0
---

<!-- step:title="Why this chapter" -->
In oncology the "response" is no longer a concentration but the **tumour size**, then **survival**. Pharmacometrics builds the chain: exposure (AUC) → tumour dynamics → clinical benefit.

This is the heart of **joint models**, which assemble PK, tumour size (TGI) and survival to anticipate a trial's results before running it.
<!-- /step -->

<!-- step:title="Intuition" viz="30_TumorGrowth" -->
A tumour **grows spontaneously** (exponential); treatment **kills part of it**, the more so as exposure is high.

But the effect is not eternal: **resistance** appears progressively, the effect fades, and the tumour can **escape again**. Raise the exposure and watch the nadir, then the regrowth.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="30_TumorGrowth" -->
The **Claret** model describes exponential growth curbed by a shrinkage that **fades**:

$$ \frac{dTS}{dt} = K_{G}\,TS \;-\; K\cdot expo\cdot e^{-\lambda t}\,TS $$

- $K_G$: unperturbed growth rate;
- $K\cdot expo$: shrinkage proportional to **exposure** (concentration or AUC);
- $e^{-\lambda t}$: progressive appearance of **resistance** ($\lambda$).

Some variants separate a **sensitive** and a **resistant** cell population (fraction $f$).

**Ref —** Claret L. et al., *J Clin Oncol* 2009 (TGI–OS); Simeoni M. et al., *Cancer Res* 2004 (TGI model with threshold $C_T=\lambda_0/k_2$).
<!-- /step -->

<!-- step:title="The joint model" viz="31_JointSurvival" -->
We then **link** tumour dynamics to the **risk** of progression. The hazard depends on tumour size through a link parameter $\beta$:

$$ h(t) = h_0(t)\cdot e^{\,\beta\, f(TS(t))}, \qquad S(t) = e^{-\int_0^t h} $$

$f$ can be the current size, the change from baseline (CFB), its AUC… The larger $|\beta|$, the stronger the tumour → survival link. Shrinking the tumour **pushes the survival curve to the right**.
<!-- /step -->

<!-- step:title="Worked example" viz="31_JointSurvival" -->
Joint PK–TGI–survival models are widely used for **monoclonal antibodies** in immuno-oncology (anti-PD-1, anti-TIM-3, anti-CD73, anti-NKG2A): they help **predict a trial's results** (e.g. a platform study) before it is run.

By simulating the exposure of each schedule, one predicts tumour shrinkage, hence **progression-free survival (PFS)** — a tool for dose and design choices.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Early tumour size is not survival.

**Pitfall —** a good short-term tumour effect does not guarantee a survival benefit (resistance, toxicity, heterogeneity). The tumour → survival link must be **externally validated**; survival is modelled as **time-to-event** (hazard, censoring), not by a simple correlation.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The oncology response = tumour size then survival; effect depends on exposure (PK).
- Claret model: growth $K_G$ − shrinkage $K\cdot expo\cdot e^{-\lambda t}$ (resistance).
- A joint model links tumour size to the progression hazard via $\beta$ → predicts PFS.
- Application: immuno-oncology antibodies, clinical-trial prediction.
- Caveat: short term ≠ survival; external validation is essential.
<!-- /step -->

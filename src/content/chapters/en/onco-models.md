---
id: "onco-models"
slug: "onco-models"
title: "A catalogue of oncology models"
description: "An overview of the usual models: tumour growth, resistance, toxicity and links to survival."
summary: "A map of oncology models (Gompertz, Simeoni, Claret, Stein, Wang, two-population, Friberg, joint)."
track: "onco"
order: 32
duration: "15 min"
level: "advanced"
tags: ["oncology", "tumor-growth", "models", "catalog"]
slides: []
quiz:
  - prompt: "The Gompertz growth model describes growth that..."
    options:
      - "slows as the tumour approaches a limiting size (plateau)"
      - "stays exponential at a constant rate, never plateauing"
      - "becomes linear once the tumour passes a size threshold"
    correct: 0
  - prompt: "Two-population cell models mainly represent..."
    options:
      - "resistance: treatment-sensitive vs resistant cells"
      - "variability between two patient subgroups (mixture)"
      - "drug distribution across two tissue compartments"
    correct: 0
  - prompt: "A TGI-OS model links..."
    options:
      - "early tumour dynamics to the patient's overall survival"
      - "plasma exposure to the early tumour shrinkage observed"
      - "the haematological nadir depth to the dose received"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Oncology abounds with models; it is easy to get lost. This chapter draws the **map**: unperturbed growth, treatment effect, resistance, toxicity, and links to survival.

The goal is not to memorise every equation, but to know **which to choose** and why.
<!-- /step -->

<!-- step:title="Intuition" viz="30_TumorGrowth" -->
Every TGI model combines two blocks: a **growth** (how the tumour grows alone) and an **effect** (how treatment curbs it).

Models differ by the **growth shape** (exponential, slowing, saturating) and by how the **effect** and **resistance** enter.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="30_TumorGrowth" -->
The classic **growth** forms:

$$ \text{Exponential: } \dot W = \lambda W \quad|\quad \text{Gompertz: } \dot W = \lambda W\ln\!\frac{W_\infty}{W} \quad|\quad \text{Logistic: } \dot W = \lambda W\Big(1-\frac{W}{W_\infty}\Big) $$

The most used **treatment** models:

- **Simeoni**: exponential→linear growth, effect $-k_2\,C\,W$, dying-cell compartments.
- **Claret** (TGI-OS): shrinkage $K\cdot expo$ that **fades** ($e^{-\lambda t}$, resistance).
- **Stein / Wang**: decomposition into a regressing fraction and a regrowing one (SLD).
- **Two-population**: **sensitive** cells (shrink) and **resistant** cells (grow), with possible mutations.

**Ref —** Gompertz (1825); Norton-Simon; Simeoni *Cancer Res* 2004; Claret *J Clin Oncol* 2009; Stein *Clin Cancer Res* 2008; Wang *Clin Pharmacol Ther* 2009; Bonate. Mathematical oncology: the **COMPO** team (Marseille — S. Benzekry, J. Ciccolini).
<!-- /step -->

<!-- step:title="Worked example" viz="31_JointSurvival" -->
Once the tumour is modelled, we **link** it to clinical outcomes:

- **TGI-OS / TGI-PFS**: early tumour dynamics (e.g. reduction at 8 weeks) predict survival.
- **Joint model**: the progression hazard depends continuously on tumour size.
- **Toxicity**: the **Friberg** model (myelosuppression) bounds the deliverable dose.

Together they form the backbone of dose selection in oncology.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A more complex model is not necessarily better.

**Pitfall —** without rich enough data (several doses, long follow-up), a two-population or resistance model is **non-identifiable**: its parameters become arbitrary. Match complexity to the data, and validate externally — especially before extrapolating to survival.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Growth: exponential, Gompertz, logistic (slowdown/plateau).
- With treatment: Simeoni, Claret (resistance), Stein/Wang, two-population.
- Clinical links: TGI-OS/PFS, joint models; toxicity via Friberg.
- Match complexity to the data; validate before extrapolating to survival.
<!-- /step -->

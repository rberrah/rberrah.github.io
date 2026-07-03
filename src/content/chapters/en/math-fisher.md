---
id: "math-fisher"
slug: "math-fisher"
title: "Fisher information matrix and optimal design"
description: "How much information does a protocol carry? The FIM links design, precision and number of samples."
summary: "Fisher matrix, Cramér-Rao bound, standard errors (RSE) and optimisation of sampling times (PFIM)."
track: "math"
order: 24
duration: "13 min"
level: "advanced"
tags: ["maths", "fisher-information", "optimal-design", "precision"]
slides: []
quiz:
  - prompt: "The Fisher information matrix (FIM) is used to..."
    options:
      - "predict parameter estimation precision for a given design"
      - "compute the AUC"
      - "choose the therapeutic dose"
    correct: 0
  - prompt: "The Cramér-Rao bound says the variance of an unbiased estimator is..."
    options:
      - "at least the inverse of the Fisher information"
      - "always zero"
      - "independent of the design"
    correct: 0
  - prompt: "An optimal design aims to..."
    options:
      - "place samples at the most informative times"
      - "add samples at random"
      - "reduce the number of patients to one"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Before launching a study, a crucial question: **where and when to sample** to estimate parameters precisely, without wasting samples? The **Fisher information matrix** (FIM) answers quantitatively.

It is the foundation of **optimal design** of protocols (sparse sampling, fragile populations).
<!-- /step -->

<!-- step:title="Intuition" viz="58_OptimalDesign" -->
Some sampling times are **very informative** (the elimination phase for the slope), others nearly useless (two points on top of each other).

The greater the information, the **narrower** the likelihood "valley" around the optimum → precise estimate. The FIM measures this curvature.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="58_OptimalDesign" -->
The FIM is the expected curvature of the log-likelihood:

$$ I(\theta) = -\,\mathbb{E}\!\left[\frac{\partial^2 \log L}{\partial\theta\,\partial\theta^\top}\right] $$

The **Cramér-Rao bound** follows: for any unbiased estimator,

$$ \mathrm{Var}(\hat\theta) \ge I(\theta)^{-1} $$

**Standard errors** (and hence RSE %) come from $\sqrt{\text{diag}(I^{-1})}$. An **optimal design** (D-optimality) maximises $\det I(\theta)$.

**Ref —** an approach widely developed by the **IAME** team (Inserm / Université Paris Cité, Bichat) — France Mentré et al., the **PFIM** software for optimal design in non-linear mixed-effects models; the **Leiden** school (LACDR) for PK/PD modelling.
<!-- /step -->

<!-- step:title="Worked example" viz="58_OptimalDesign" -->
For a one-compartment model, the FIM shows that placing one **early** sample (absorption/peak) and one **late** sample (elimination slope) estimates $CL$ and $V$ better than three points in the middle.

In paediatrics, where every sample counts, PFIM helps design a **2–3-point** protocol that stays informative.
<!-- /step -->

<!-- step:title="Common pitfall" -->
The FIM predicts precision, not accuracy.

**Pitfall —** the FIM assumes the **model is correct** and often relies on a **linearisation**: it gives **optimistic** precision if the model is wrong or strongly non-linear. It does not protect against bias from a poor structural model.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The FIM links design (times, doses, number of subjects) to estimation precision.
- Cramér-Rao: Var(θ̂) ≥ I(θ)⁻¹; RSEs come from √diag(I⁻¹).
- D-optimal design maximises det(I) → samples at informative times (PFIM, IAME).
- The FIM assumes the model is true: precision ≠ accuracy.
<!-- /step -->

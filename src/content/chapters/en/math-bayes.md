---
id: "math-bayes"
slug: "math-bayes"
title: "Bayesian estimation"
description: "Combining prior knowledge with data: Bayes' theorem, from prior to posterior."
summary: "Prior × likelihood → posterior: Bayesian reasoning, MAP estimation and shrinkage."
track: "math"
order: 22
duration: "13 min"
level: "intermediate"
tags: ["maths", "bayes", "estimation", "prior"]
slides: []
quiz:
  - prompt: "Bayes' theorem combines..."
    options:
      - "prior information and the likelihood of the data"
      - "the posterior distribution and the marginal likelihood of the data"
      - "the maximum-likelihood estimate and the model's residual error"
    correct: 0
  - prompt: "MAP (maximum a posteriori) estimation keeps..."
    options:
      - "the peak of the posterior distribution"
      - "the peak of the likelihood alone, without the prior term"
      - "the mean of the initial prior distribution"
    correct: 0
  - prompt: "When individual data are weakly informative, a Bayesian estimate..."
    options:
      - "moves toward the prior (this is shrinkage)"
      - "follows mainly the few available measurements"
      - "weights the prior and observations equally"
    correct: 0
---

<!-- step:title="Why this chapter" -->
In pharmacometrics we already know **a lot** before seeing a patient: the population tells us what a "typical" clearance or volume looks like. **Bayesian estimation** formalises how to **update** that knowledge with the patient's few measurements.

It is the mathematical basis of Bayesian TDM (therapeutic drug monitoring), EBEs (individual parameter estimates) and MIPD (model-informed precision dosing).
<!-- /step -->

<!-- step:title="Intuition" viz="BayesUpdate" -->
Start from a **prior belief** (the patient resembles the population). Each **measurement** shifts that belief: few data → stay close to the prior; many data → follow the observations.

The result, the **posterior**, is a weighted compromise between the two. Add points and watch the distribution tighten.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="BayesUpdate" -->
**Bayes' theorem** links the three ingredients:

$$ p(\theta \mid y) \;=\; \frac{p(y \mid \theta)\,p(\theta)}{p(y)} \;\propto\; \underbrace{p(y \mid \theta)}_{\text{likelihood}}\;\underbrace{p(\theta)}_{\text{prior}} $$

**How to read it — the coin-flip metaphor.** You believe a coin is fair (prior: 50/50). You flip it 10 times and get 8 heads (data). You conclude neither "50%" (that ignores the data) nor "80%" (that ignores your prior): you settle **in between** — the closer to 80% the weaker your prior belief and the more flips you have.

**On the maths side.** Read the formula right to left: start from the **prior** $p(\theta)$ (what you believe beforehand), **multiply** it by the **likelihood** $p(y\mid\theta)$ (how probable this $\theta$ makes the observed data), and the denominator $p(y)$ merely **renormalises** into a proper probability. The **posterior** $p(\theta\mid y)$ is thus the prior "corrected" by the data.

In the **conjugate Gaussian** case the posterior stays Gaussian and its mean is a **precision-weighted average** (precision = inverse variance):

$$ \hat\theta = \frac{\tau_0\,\mu_0 + \tau_d\,\bar y}{\tau_0 + \tau_d}, \qquad \tau = 1/\sigma^2 $$

**Math —** the **MAP** estimate takes the peak of $p(\theta\mid y)$. In PopPK it amounts to minimising the data misfit **plus** a term pulling toward the prior: $-2\log L + \sum \eta^2/\omega^2$.
<!-- /step -->

<!-- step:title="Worked example" viz="BayesUpdate" -->
A patient has a prior clearance of 5 L/h (population). A measured trough is a little low. The posterior shifts the estimate toward ~4 L/h — **without** blindly trusting a single noisy sample.

With two or three consistent samples, the posterior tightens and moves clearly away from the prior: this is exactly Bayesian dose adjustment.
<!-- /step -->

<!-- step:title="Common pitfall" -->
The prior is not neutral.

**Pitfall —** a **poorly chosen** prior (wrong population model, ignored covariates) pulls the posterior to the wrong place. And when data are sparse, the estimate "sticks" to the prior: this is **shrinkage**. High shrinkage (> 20–30%) makes EBEs uninformative and distorts diagnostic plots.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Bayes: posterior ∝ likelihood × prior — we update a belief with data.
- Gaussian case: the posterior is a precision-weighted average.
- The MAP estimate = peak of the posterior = basis of EBEs and Bayesian TDM.
- Sparse data → shrinkage toward the prior: watch for it.
<!-- /step -->

---
id: "tools-algorithms"
slug: "tools-algorithms"
title: "Estimation algorithms: FOCE and SAEM"
description: "Why the likelihood of mixed-effects models is hard, and how FOCE and SAEM solve it."
summary: "FOCE (linearisation) vs SAEM (stochastic simulation): two ways to estimate an NLME model, explained."
track: "tools"
order: 200
duration: "15 min"
level: "advanced"
tags: ["tools", "saem", "foce", "estimation"]
prerequisites: ["outils-estimation", "math-bayes"]
glossary: ["SAEM", "FOCE-I", "OFV", "Vraisemblance", "Effets mixtes"]
slides: []
quiz:
  - prompt: "The likelihood of an NLME model is hard because..."
    options:
      - "it contains an integral over the random effects, with no closed form"
      - "it has a closed form but is costly to evaluate numerically"
      - "it factorises into a product of independent normal densities"
    correct: 0
  - prompt: "FOCE approximates the likelihood by..."
    options:
      - "linearising the model around the estimated individual effects"
      - "drawing MCMC samples of the random effects at each iteration"
      - "integrating the likelihood numerically by Gauss-Hermite quadrature"
    correct: 0
  - prompt: "SAEM avoids linearisation by..."
    options:
      - "simulating the random effects (E) then updating the parameters (M)"
      - "expanding the model to first order around η̂ (as FOCE does)"
      - "approximating the integral by Laplace's method at the posterior mode"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Estimating a population model means maximising its **likelihood**. But for a **non-linear** mixed-effects model, this likelihood has **no closed form**: it contains an integral over each patient's random effects.

Two major strategies get around this wall: **linearise** (FOCE) or **simulate** (SAEM). Understanding the difference explains all the software behaviour.
<!-- /step -->

<!-- step:title="Intuition" viz="66_FOCELinearization" -->
The problem: for a patient, we do not know their random effects $\eta_i$; we must "integrate" over all their possible values.

- **FOCE** replaces the model curve by its **tangent** around the best individual estimate: the integral becomes Gaussian, computable.
- **SAEM** does not cheat on the shape: it **draws** plausible values of $\eta_i$ and lets the parameters converge through successive averaging.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="67_SAEMConvergence" -->
The likelihood to maximise:

$$ L(\theta) = \prod_i \int p(y_i \mid \eta_i, \theta)\, p(\eta_i \mid \theta)\; d\eta_i $$

The integral (over $\eta_i$) has no analytical solution as soon as the model $f$ is **non-linear** in $\eta_i$. That is where FOCE and SAEM diverge.

**Math —** in practice we maximise $-2\log L$ (the **OFV**). Since the two methods **approximate** this quantity differently, their OFVs are **not comparable** to each other.
<!-- /step -->

<!-- step:title="FOCE: linearisation" viz="66_FOCELinearization" -->
**FOCE-I** (First-Order Conditional Estimation with Interaction) makes a **first-order Taylor expansion** of the model around the estimated individual effects $\hat\eta_i$ (each patient's posterior mode):

$$ f(\eta_i) \approx f(\hat\eta_i) + \left.\frac{\partial f}{\partial \eta}\right|_{\hat\eta_i}(\eta_i - \hat\eta_i) $$

- **Conditional**: we linearise around **each patient's** $\hat\eta_i$ (not around 0 like the old "FO" method).
- **Interaction**: we account for the **residual error** depending on the individual prediction.

**How to read it — the magnifying-glass metaphor.** Too hard to measure a curved road? Replace it, **near you**, by its tangent. Exact at the point, approximate far away.

**Consequence.** FOCE is **fast** but **approximate**: the bias grows when the model is **strongly non-linear** or the data **sparse**, and the algorithm may fail to converge. It is **NONMEM**'s historical method.
<!-- /step -->

<!-- step:title="SAEM: simulation" viz="67_SAEMConvergence" -->
**SAEM** (Stochastic Approximation Expectation-Maximization) is an **EM** algorithm for latent variables (here the $\eta_i$), in two repeated steps:

- **E (simulation)**: since the law $p(\eta_i \mid y_i, \theta)$ is intractable, we **draw** samples from it by MCMC (instead of computing an expectation);
- **M (maximisation)**: we update $\theta, \Omega, \Sigma$ from these simulated $\eta_i$.

The **stochastic approximation** smooths the sampling noise with a decreasing step $\gamma_k$ (Robbins-Monro):

$$ s_{k+1} = s_k + \gamma_k\big(S(\eta^{(k)}) - s_k\big) $$

**How to read it — the polling metaphor.** Rather than computing an impossible exact average, we **poll a sample** at each iteration, and refine the estimate by averaging — ever more finely.

**Consequence.** SAEM does **not** linearise: it converges to the **true** maximum likelihood (asymptotically), and stays **robust** on non-linear, complex models. It is **Monolix**'s engine and an option in **nlmixr2/NONMEM**. The final likelihood is computed separately, by **importance sampling**.
<!-- /step -->

<!-- step:title="Worked example" viz="66_FOCELinearization" -->
On a **simple** model, FOCE-I and SAEM give almost the **same** estimates: the linearisation is faithful.

On a **difficult** model (steep Emax, TMDD, very sparse data), FOCE-I may **diverge** or **bias** the estimates, where SAEM converges calmly — hence its growing popularity.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Comparing OFVs across methods is meaningless.

**Pitfall —** FOCE and SAEM **approximate** the likelihood differently: their **OFVs are not comparable**. Compare the OFV only with the **same method** and **same data**. Finally, an algorithm's **convergence** does not guarantee a **good model**: diagnostics remain mandatory.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The NLME likelihood = an integral over the random effects, with no closed form.
- FOCE: linearises around the individual η̂ — fast, approximate, historical (NONMEM).
- SAEM: simulates the η (E) then updates the parameters (M) — exact (ML), robust (Monolix).
- OFVs compare only with the same method and data; convergence ≠ a good model.
<!-- /step -->

---
id: "bayes-ebes"
slug: "bayes-ebes"
title: "Bayesian thinking, EBEs and shrinkage"
description: "How individual estimates borrow strength from the population."
summary: "A practical explanation of MAP estimates, EBEs and why shrinkage matters."
track: "core"
order: 10
duration: "14 min"
level: "intermediate"
tags: ["bayes", "ebes", "shrinkage", "tdm"]
slides: ["s53", "s54", "s55", "s57", "s58", "s60", "s61"]
quiz:
  - prompt: "An EBE is..."
    options:
      - "an empirical Bayes estimate of an individual's random effect"
      - "the estimate of a fixed effect shared by all patients in the population"
      - "the typical population value before any individual measurement"
    correct: 0
  - prompt: "Shrinkage is high when..."
    options:
      - "individual data are poor and the EBEs are pulled toward the population"
      - "individual data are rich and highly informative about the patient"
      - "the estimated between-patient variability of the parameter is very large"
    correct: 0
  - prompt: "MAP estimation combines..."
    options:
      - "prior population information and the individual observations"
      - "the individual observations alone, without any population prior"
      - "the population prior alone, without the patient's measurements"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s53" -->
Clinical datasets are often **sparse**: one or two concentrations per patient, not a rich curve.

Bayesian reasoning lets the model combine what is known about the population with what is observed in the individual.
<!-- /step -->

<!-- step:title="Intuition" slides="s55" viz="BayesUpdate" -->
If you see only one blurry photo of a student's construction, you should not ignore what you know about the whole class.

The population model is the **prior expectation**; the individual measurement **updates** it.

**Key point —** a Bayesian estimate does not jump to an extreme: it moves the individual estimate away from the class mean only as much as the data justify.
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s53,s54" viz="BayesUpdate" -->
Bayesian reasoning starts from **Bayes' theorem**. For the individual deviation $\eta_i$:

$$ \underbrace{p(\eta_i \mid y_i)}_{\text{posterior}} \;\propto\; \underbrace{p(y_i \mid \eta_i)}_{\text{likelihood}} \;\times\; \underbrace{p(\eta_i)}_{\text{prior}} $$

The **prior** $p(\eta_i)$ is the population model (a Gaussian of variance $\Omega$, the between-patient variability). The **likelihood** $p(y_i \mid \eta_i)$ measures agreement with the observations, weighted by the **residual error** $\sigma$.

**MAP** estimation (*maximum a posteriori*) maximises this posterior, which amounts to minimising the individual objective:

$$ \hat{\eta}_i = \arg\min_{\eta}\;\sum_j \frac{\bigl(y_{ij} - f(\eta)\bigr)^2}{\sigma^2} \;+\; \eta^{\mathsf T}\,\Omega^{-1}\,\eta $$

The individual is then written with its EBE: $CL_i = CL_{\mathrm{typical}}\, e^{\hat{\eta}_i}$.

**Math —** read the **two terms** as a balance:

- the first **fits the data** — the more strongly the **smaller** the residual error $\sigma$;
- the second **pulls back toward the population** ($\eta = 0$) — the more strongly the **smaller** the variability $\Omega$.

When data are poor (or $\sigma$ large), the second term wins and $\hat{\eta}_i \to 0$: that is **shrinkage**.
<!-- /step -->

<!-- step:title="Worked example" slides="s58" -->
In therapeutic drug monitoring, a single concentration after a dose can update a patient's estimated clearance.

If the observed concentration is lower than expected, the model may infer a higher clearance — but the size of the adjustment depends on the **timing** of the sample, the assay error, the prior variability and the whole dosing history.

**Note —** the quality of a Bayesian estimate depends directly on $\sigma$ and $\Omega$. Mis-specifying the residual error biases the individual estimate: too small a $\sigma$ **over-trusts** a noisy measurement (under-shrinkage), too large a $\sigma$ **crushes** the patient's information toward the population. This is the lever studied by Berrah *et al.* — residual error as a "hidden lever" in precision dosing. Symmetrically, Hughes & Keizer show that **selectively flattening the prior** (*flatten the prior*: widening $\Omega$) lets the data speak more and can **outperform** standard MAP Bayesian estimation.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s57" -->
Do not over-interpret EBEs when shrinkage is high.

**Pitfall —** high shrinkage means individual estimates are strongly pulled toward the population because the data do not identify them well. Plotting shrunken EBEs as if they were true patient values can create **false patterns** (spurious covariate–parameter correlations).
<!-- /step -->

<!-- step:title="Key takeaways" -->
- EBEs are individual estimates informed by the population model.
- MAP combines the population prior with the patient's observations (Bayes' theorem).
- Estimation trades off fitting the data (weighted by $\sigma$) against pulling toward the population (weighted by $\Omega$): it depends **strongly** on the chosen residual error and variability.
- Shrinkage warns that individual estimates may be weakly informed.
- Bayesian updating is central to TDM, but depends on data quality and on how $\sigma$ and $\Omega$ are specified.
<!-- /step -->

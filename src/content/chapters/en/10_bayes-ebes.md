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
A simplified MAP idea:

$$ \text{individual estimate} = \text{population expectation} + \text{data-supported deviation} $$

In PopPK notation, individual parameters use EBEs:

$$ CL_i = CL_{\mathrm{typical}}\, e^{\hat{\eta}_i} $$

**Math —** $\hat{\eta}_i$ is the **estimated** individual deviation. When the patient's data are poor, $\hat{\eta}_i$ is pulled toward 0 (toward the population): that is shrinkage.
<!-- /step -->

<!-- step:title="Worked example" slides="s58" -->
In therapeutic drug monitoring, a single concentration after a dose can update a patient's estimated clearance.

If the observed concentration is lower than expected, the model may infer a higher clearance — but the size of the adjustment depends on the **timing** of the sample, the assay error, the prior variability and the whole dosing history.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s57" -->
Do not over-interpret EBEs when shrinkage is high.

**Pitfall —** high shrinkage means individual estimates are strongly pulled toward the population because the data do not identify them well. Plotting shrunken EBEs as if they were true patient values can create **false patterns** (spurious covariate–parameter correlations).
<!-- /step -->

<!-- step:title="Key takeaways" -->
- EBEs are individual estimates informed by the population model.
- MAP combines the population prior with the patient's observations.
- Shrinkage warns that individual estimates may be weakly informed.
- Bayesian updating is central to TDM, but depends on data quality.
<!-- /step -->

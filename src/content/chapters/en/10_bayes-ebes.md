---
id: "bayes-ebes"
slug: "bayes-ebes"
title: "Bayesian thinking, EBEs and shrinkage"
description: "How individual estimates borrow strength from the population."
summary: "A practical explanation of MAP estimates, EBEs, and why shrinkage matters."
track: "core"
order: 10
duration: "14 min"
level: "intermediate"
tags: ["bayes", "ebes", "shrinkage", "tdm"]
slides: ["s57", "s58", "s59", "s60", "s61", "s62", "s63", "s64"]
quiz:
  - prompt: "An EBE is..."
    options:
      - "an empirical Bayes estimate of an individual's random effect"
      - "a slide title"
      - "a unit of concentration"
    correct: 0
  - prompt: "Shrinkage is high when..."
    options:
      - "individual data are weak and estimates move toward the population"
      - "all patients are perfectly observed"
      - "there is no population model"
    correct: 0
  - prompt: "MAP estimation combines..."
    options:
      - "prior population information and individual observations"
      - "only the last observation"
      - "only the dose amount"
    correct: 0
---

<!-- step:title="Why this matters" slides="s57" -->
Clinical datasets are often sparse. You may have one or two concentrations for a patient, not a rich curve.

Bayesian thinking lets the model combine what is known about the population with what is observed in the individual.
<!-- /step -->

<!-- step:title="Intuition" slides="s58" -->
If you see only one photo of a student's construction, you should not ignore what you know about the whole class.

The population model is the prior expectation. The individual measurement updates that expectation.
<!-- /step -->

<!-- step:title="Building-block metaphor" slides="s59" viz="BuildingBlocksPKPD" -->
The class usually builds medium-height towers. One student's partial photo looks a bit taller, but the photo is blurry.

A Bayesian estimate does not jump to an extreme conclusion. It moves the student estimate away from the class average only as much as the data justify.
<!-- /step -->

<!-- step:title="Minimal math" slides="s57,s59" -->
A simplified MAP idea is:

$$ \text{individual estimate} = \text{population expectation} + \text{data-supported deviation} $$

In PopPK notation, individual parameters often use EBEs:

$$ CL_i = CL_{\mathrm{typical}} e^{\hat{\eta}_i} $$

where $\hat{\eta}_i$ is the estimated individual deviation.
<!-- /step -->

<!-- step:title="Worked example" slides="s60" -->
In therapeutic drug monitoring, a single concentration after a dose can update a patient's estimated clearance.

If the observed concentration is lower than expected, the model may infer higher clearance, but the amount of adjustment depends on timing, assay error, prior variability, and the rest of the dosing history.
<!-- /step -->

<!-- step:title="Common trap" slides="s61,s62,s63,s64" -->
Do not over-interpret EBEs when shrinkage is high.

High shrinkage means the individual estimates are pulled strongly toward the population because the data do not identify them well. Plotting shrunken EBEs as if they were true patient values can create false patterns.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- EBEs are individual estimates informed by the population model.
- MAP combines prior population information with patient observations.
- Shrinkage warns that individual estimates may be weakly informed.
- Bayesian updating is central to TDM, but it depends on data quality.
<!-- /step -->

---
id: "math-stats"
slug: "math-stats"
title: "Statistics used in pharmacometrics"
description: "Distributions, variance, confidence intervals, tests and p-values: the statistical language of the field."
summary: "Essential statistics: normal and log-normal laws, variance, CIs, hypothesis tests and correlation."
track: "math"
order: 23
duration: "13 min"
level: "intermediate"
tags: ["maths", "statistics", "distributions", "confidence-interval"]
slides: []
quiz:
  - prompt: "An individual clearance is often modelled with a..."
    options:
      - "log-normal law (positive, skewed)"
      - "normal law centred at zero"
      - "uniform law"
    correct: 0
  - prompt: "A 95% confidence interval means that..."
    options:
      - "the procedure captures the true parameter 95 times out of 100 on repetition"
      - "95% of patients lie inside it"
      - "the parameter equals the bound exactly"
    correct: 0
  - prompt: "A small p-value indicates..."
    options:
      - "data that are unlikely under the null hypothesis"
      - "that the effect is large"
      - "that the model is validated"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Pharmacometrics **is** applied statistics: parameter distributions, variability, estimation uncertainty, covariate tests. Mastering this vocabulary avoids misreadings (confusing variability with uncertainty, effect with significance).

This chapter gathers the tools used throughout the course.
<!-- /step -->

<!-- step:title="Intuition" viz="03_PopulationDistrib" -->
Two ideas to keep apart: **variability** (patients differ) and **uncertainty** (a parameter is poorly estimated from few data).

Positive PK parameters (CL, V) vary **asymmetrically**: hence the **log-normal** law. Measurement errors are often assumed **normal**.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="03_PopulationDistrib" -->
An individual clearance is typically written:

$$ CL_i = CL_{pop}\cdot e^{\eta_i}, \qquad \eta_i \sim \mathcal{N}(0,\omega^2) $$

On the log scale, $\ln CL_i$ is **normal** with variance $\omega^2$; the approximate **CV** is $\sqrt{e^{\omega^2}-1}\approx\omega$ for small $\omega$.

**Math —** a 95% **confidence interval** of a parameter $\hat\theta$: $\hat\theta \pm 1.96\cdot SE(\hat\theta)$. The **SE** comes from estimation precision (see the Fisher matrix, next chapter).
<!-- /step -->

<!-- step:title="Worked example" viz="13_ResidualError" -->
Two nested models are compared with a **likelihood-ratio test**: the OFV difference ($-2\log L$) follows an approximate $\chi^2$. Adding a covariate that drops the OFV by 3.84 (1 df) is "significant" at 5%.

But **significant ≠ relevant**: a tiny effect can be significant on a large dataset.
<!-- /step -->

<!-- step:title="Common pitfall" -->
The p-value is not the probability that the hypothesis is true.

**Pitfall —** a p-value measures the **surprise of the data** under the null, not the effect size or its clinical relevance. And correlation is not explanation: two correlated covariates (weight, CrCl) can substitute for one another. Always look at the **magnitude** and its confidence interval.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Distinguish variability (between patients) from uncertainty (of estimation).
- Positive parameters → log-normal; residual error → often normal.
- 95% CI ≈ estimate ± 1.96·SE; likelihood-ratio test (ΔOFV ~ χ²).
- Significant is not relevant; always look at the effect magnitude.
<!-- /step -->

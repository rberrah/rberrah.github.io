---
id: "pmetrics-nonparametric"
slug: "pmetrics-nonparametric"
title: "Nonparametric modelling with Pmetrics"
description: "Build, compile and fit a first NPAG model with Pmetrics in R."
summary: "A practical route from PM_data and PM_model to the support points estimated by NPAG."
track: "core"
order: 8.3
duration: "18 min"
level: "advanced"
tags: ["Pmetrics", "NPAG", "nonparametric", "R", "population PK"]
prerequisites: ["parametric-vs-nonparametric", "outils-estimation"]
glossary: ["NPAG", "Support point", "Likelihood"]
slides: []
sources: ["pmetrics", "neely-pmetrics", "yamada-npag"]
reviewed_on: "2026-09-28"
quiz:
  - prompt: "In Pmetrics, ab(0.02, 0.5) defines for NPAG..."
    options:
      - "the absolute parameter search bounds"
      - "a 95% confidence interval"
      - "a normal distribution with mean 0.02 and SD 0.5"
    correct: 0
  - prompt: "Which Pmetrics object represents data in the expected format?"
    options:
      - "PM_data"
      - "PM_model"
      - "PM_result"
    correct: 0
  - prompt: "Is code exported by Model Translator sufficient for a definitive NPAG analysis?"
    options:
      - "no, bounds, error, data and statistical choices must be reviewed"
      - "yes, Builder values automatically become definitive priors"
      - "yes, if the model has only one compartment"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Pmetrics provides **parametric and nonparametric** population modelling tools in R. Its NPAG engine estimates a discrete joint parameter distribution represented by weighted support points.

This chapter covers the minimal modern workflow: data, model, compilation, fitting and result interpretation. It does not replace data preparation or model validation.
<!-- /step -->

<!-- step:title="Intuition" -->
The Pmetrics workflow uses three objects:

1. `PM_data` validates and organises events, doses, observations and covariates;
2. `PM_model` holds parameters, equations, outputs and error;
3. `PM_result` holds the fit, including support points and their probabilities.

Creating `PM_model` prepares and compiles the model. Calling `$fit()` then combines model and data with the selected algorithm, NPAG by default.

**Key point:** compilation checks syntax and structure. It does not establish identifiability, pharmacological relevance or transportability.
<!-- /step -->

<!-- step:title="The formula, unpacked" -->
NPAG searches for a distribution:

$$ \widehat F = \sum_{k=1}^{K} w_k\delta_{\theta_k} $$

that maximises the observation likelihood. In Pmetrics, a declaration such as:

```r
Ke = ab(0.02, 0.5)
```

defines the **absolute bounds** explored by NPAG for `Ke`. It is not a confidence interval. Bounds that are too narrow truncate the search; excessively broad bounds may make exploration inefficient or favour implausible solutions.

The error model also weights each observation. It should represent analytical error and residual model discrepancy in a defensible way.
<!-- /step -->

<!-- step:title="Worked example" -->
This one-compartment IV model follows the current Pmetrics interface:

```r
library(Pmetrics)

mod <- PM_model$new(
  pri = list(
    Ke = ab(0.02, 0.5),
    V  = ab(10, 100)
  ),
  eqn = function() {
    one_comp_iv
  },
  out = function() {
    Y[1] = X[1] / V
  },
  err = list(
    proportional(1, c(0.05, 0.10, 0, 0))
  )
)

dat <- PM_data$new(data = "data.csv")
fit <- mod$fit(dat, algorithm = "NPAG", cycles = 100)
```

After fitting, `fit$final$popPoints` contains parameter values for each support point and the `prob` column contains its weight. Convergence, predictions, residuals, support-point plausibility, uncertainty and validation still need to be examined.

**Note:** the final number of points is a numerical estimation result. It should not be interpreted directly as the number of clinical phenotypes.
<!-- /step -->

<!-- step:title="From Translator to Pmetrics" -->
The PMx Explain **Model Translator** can import a Pmetrics model representable with Lego blocks and export a Pmetrics 3 template.

The export preserves the structure, representable covariates, equations, outputs and an explicit error translation when compatible. Builder values are exported as deterministic starting values. Before an NPAG fit, replace or broaden them with scientifically justified `ab(min, max)` ranges.

If a condition or equation cannot be represented faithfully by the blocks, it should remain in Pmetrics. The translator rejects partial conversion instead of silently changing the model.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A converged fit is not necessarily reliable.

Check units, the assignment of `B[]` and `R[]` inputs, observed `Y[]` compartments, `ab()` bounds, error coefficients, covariates and event times. An error at any of these levels may yield a numerically tidy but scientifically wrong distribution.

Do not compare a parametric fit and NPAG by appearance alone. Use comparable diagnostics and validation suited to the intended purpose.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- `PM_data` holds data, `PM_model` the model and `PM_result` the fit.
- `PM_model$new()` prepares and compiles the model; `$fit(..., algorithm = "NPAG")` estimates the distribution.
- `ab(min, max)` sets absolute bounds for the nonparametric search.
- Support points and weights describe the estimated distribution, not automatically biological groups.
- Translator output is a starting point to review, not a publication-ready population analysis.
<!-- /step -->

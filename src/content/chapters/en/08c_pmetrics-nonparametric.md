---
id: "pmetrics-nonparametric"
slug: "pmetrics-nonparametric"
title: "Nonparametric modelling with Pmetrics"
description: "Build, compile and fit a first NPAG model with Pmetrics in R."
summary: "A practical route from PM_data and PM_model to the support points estimated by NPAG."
track: "core"
order: 8.3
duration: "22 min"
level: "advanced"
tags: ["Pmetrics", "NPAG", "NPOD", "nonparametric", "R", "population PK"]
prerequisites: ["parametric-vs-nonparametric","outils-estimation"]
glossary: ["NPAG", "NPOD", "Point de support", "Distribution mélangeante", "Vraisemblance"]
slides: []
sources: ["pmetrics","neely-pmetrics","yamada-npag"]
software_verified_on: "2026-10-12"
software_version: "Pmetrics 3.2.6"
reviewed_on: "2026-10-12"
review_type: "author"
review_pending: true
reviewed_hash: "cc92c0b2b979507184f96c21cf447efe44fd88f3c59f40637b49a6eed5fd0915"
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
  - prompt: "Two support-point regions appear after an NPAG fit. What can be concluded?"
    options:
      - "this is a multimodality signal to investigate, not proof of two phenotypes"
      - "two biological phenotypes have been demonstrated"
      - "the number of regions always equals the number of missing covariates"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Pmetrics provides **parametric and nonparametric** population modelling tools in R. Its NPAG engine estimates a discrete joint parameter distribution represented by weighted support points.

This chapter covers the minimal modern workflow: data, model, compilation, fitting and result interpretation. It does not replace data preparation or model validation.
<!-- /step -->

<!-- step:title="Intuition" viz="NPAGSupportPoints" -->
The Pmetrics workflow uses three objects:

1. `PM_data` validates and organises events, doses, observations and covariates;
2. `PM_model` holds parameters, equations, outputs and error;
3. `PM_result` holds the fit, including support points and their probabilities.

Creating `PM_model` prepares and compiles the model. Calling `$fit()` then combines model and data with the selected algorithm, NPAG by default. `NPrun()` belongs to the legacy interface; this course uses the current `PM_data` / `PM_model` / `PM_result` API.

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

A support point is a **complete parameter vector** with an associated weight. It is not a patient, clinical cluster or phenotype. The final number of points is therefore not a count of subpopulations. Visually separated regions may depend on bounds, the error model, the information in the data and the discretisation; they do not become latent classes without an additional model and hypothesis. The “at most one point per subject” property concerns the NPAG construction and must not be generalized to every nonparametric estimator.
<!-- /step -->

<!-- step:title="Worked example" -->
This one-compartment IV model follows the current Pmetrics interface:

```r
library(Pmetrics)

mod <- PM_model$new(
  pri = list(
    ke = ab(0.02, 0.5),
    v  = ab(10, 100)
  ),
  eqn = function() {
    dx[1] <- b[1] + rateiv[1] - ke * x[1]
  },
  out = function() {
    y[1] <- x[1] / v
  },
  err = list(
    proportional(1, c(0.05, 0.10, 0, 0))
  )
)

dat <- PM_data$new("data.csv", quiet = TRUE)
fit <- mod$fit(
  data = dat, path = "npag-run", run = 1,
  algorithm = "NPAG", cycles = 100,
  prior = "sobol", points = 200, seed = 22
)
```

After fitting, `fit$final$popPoints` contains parameter values for each support point and the `prob` column contains its weight. Convergence, predictions, residuals, support-point plausibility, uncertainty and validation still need to be examined.

`b[1]` accepts boluses (zero duration), whereas `rateiv[1]` accepts infusions. With doses in mg, time in hours, `ke` in h⁻¹ and `v` in L, the output is mg/L. Do not substitute the library shortcut `one_comp_iv` without checking that it handles both inputs.

`msd(m, s)` is another way to specify bounds: for NPAG it gives the range `m ± 3s`, not a required normal distribution. `proportional(1, c(0.05, 0.10, 0, 0))` specifies an assay-error polynomial and an initial gamma factor, not an mrgsolve SIGMA matrix. By default this factor can be estimated during population fitting.

**Note:** the final number of points is a numerical estimation result. It should not be interpreted directly as the number of clinical phenotypes.
<!-- /step -->

<!-- step:title="Reproducible official example" -->
Pmetrics 3.2.6 ships a tutorial dataset with 51 subjects, `bimodal_ke.csv`, and two official formulations of the same one-compartment IV model: the `one_comp_iv` analytical shortcut and an explicit ODE.

**Version actually tested here: 3.2.6.** It was the latest tagged GitHub release when checked on 12 October 2026 and is pinned in the native CI job. Development documentation intended for 3.2.7 announces that the observation-occasion column `block` will be deprecated in favour of `occasion`, with legacy objects upgraded through `PM_upgrade()`; this does not yet describe a published release tested here. No active example in this course uses that column; any new example should use `occasion`, and an older fixture using `block` should only be described as compatible after testing it with the relevant version.

PMx Explain loads the file directly from the installed package and does not copy the data. `benchmarks/pmetrics_official_example.R` in the standalone MIPD-Engine repository reproduces the official `ke = [0.001, 3] h⁻¹` and `v = [25, 250] L` bounds, additive error, seed 22 and NPAG fit. It checks weights and bounds, then compares population means from both formulations.

With the complete official configuration (2028 Sobol points, 1000 cycles), the maximum relative difference observed on 11 October 2026 is **0.025%**, against a prespecified 2% tolerance. This checks software reproduction of both formulations in this environment; it is neither clinical validation nor evidence of biological multimodality.

Redistributable source: [official Pmetrics 3.2.6 examples](https://github.com/LAPKB/Pmetrics/tree/v3.2.6/inst/Examples).
<!-- /step -->

<!-- step:title="NPAG and NPOD" -->
Pmetrics includes two nonparametric algorithms:

| Algorithm | Practical principle | Main caution |
|---|---|---|
| **NPAG** | adaptive search over support points followed by weight optimization | results depend on bounds, the error model and information in the data |
| **NPOD** | nonparametric optimization based on likelihood gradients | a distinct algorithm, still under active development and potentially more vulnerable to local minima |

Both estimate a discrete mixing distribution, but they should not be assumed interchangeable. Compare convergence, stability across initializations, predictive likelihood and fitness for the intended use. Pmetrics uses `algorithm = "NPAG"` by default; NPOD must be requested explicitly and remains experimental in PMx Explain.

**NPAG is a method, not a synonym for Pmetrics.** Pmetrics provides a long-standing, specialised implementation of NPAG as well as NPOD. nlmixr2 7 also provides `est = "npag"` and a nonparametric Bayesian method, `est = "npb"`, currently described by its authors as experimental. Interfaces, diagnostics and maturity differ; similar names do not imply automatic interchangeability or a software ranking.
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

<!-- step:title="Reusing a distribution for TDM" -->
Individualization requires a **structural model, its error model and weighted population support points**. The `ab()` bounds alone are not this distribution.

The TDM Pmetrics backend calls `PM_model$map()` with a weighted prior. Point locations stay fixed; patient concentrations update their probabilities. This is not a new population NPAG fit. The central curve uses posterior mean parameters; uncertainty simulations sample joint parameter vectors with their weights, without replacing them with a normal distribution. Mean parameters, the most probable point and the mean prediction are generally different summaries.

```text
population distribution
        ↓
support points + weights
        ↓
patient concentration
        ↓
posterior weights via PM_model$map()
        ↓
individual distribution
        ↓
exposure prediction
```

A simulation that directly samples a support point preserves the estimated discrete distribution. A semiparametric simulation may add local dispersion around each point; it then creates a continuous mixture that is no longer the original NPAG distribution. The two outputs must be labelled separately.

The three available artifacts are **synthetic demonstrations** for one-compartment IV, one-compartment oral and two-compartment IV models; they are not distributions estimated in publications. Covariates are not yet supported by this backend. Patient data and fitting files are temporary; public demonstration artifacts contain no patient data.

**Availability verified on 12 October 2026:** the native backend is tested locally and included in the repository. A browser test confirms that the public engine does not expose the Pmetrics source. This is not a general incompatibility between Pmetrics and Shiny: the tested Shinyapps.io deployment remains blocked by the build image's Rust/Cargo version. No old Pmetrics version was forced as a workaround. The Pmetrics translator and this course remain accessible on the website.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- `PM_data` holds data, `PM_model` the model and `PM_result` the fit.
- `PM_model$new()` prepares and compiles the model; `$fit(..., algorithm = "NPAG")` estimates the distribution.
- NPAG and NPOD are distinct algorithms; NPOD remains experimental in PMx Explain.
- `ab(min, max)` sets absolute bounds for the nonparametric search.
- Support points and weights describe the estimated distribution, not automatically biological groups.
- Translator output is a starting point to review, not a publication-ready population analysis.
<!-- /step -->

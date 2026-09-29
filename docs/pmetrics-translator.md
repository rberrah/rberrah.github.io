# Pmetrics translation

The Model Translator accepts Pmetrics text blocks (`#PRI`, `#COV`, `#SEC`,
`#EQN`/`#DIF`, `#OUT`, `#LAG`, `#INI`, `#FA`, `#ERR`) and literal Pmetrics 3
R definitions (`PM_model$new(...)` or `list(...)`, with function bodies).
No pasted R code is executed. The structural equations go through the same
expression and mass-balance checks as the other import formats.

## Supported Import

- Explicit compartmental PK ODEs, first-order and supported saturable fluxes.
- Modern `dX[n]`, `X[n]`, `B[n]`, `R[n]` and legacy `XP(n)`, `X(n)` notation.
- The 12 current Pmetrics PK library shorthands (`one|two|three_comp_*`, rate-
  constant and `_cl` forms) and their documented ADVAN aliases. Their equations
  are expanded from the official `R/mod_lib.R` definitions before graph parsing.
  The legacy text convention with no EQN block (Ke/V, optional Ka and Kcp/Kpc)
  is also supported. Other implicit models require explicit ODEs.
- One concentration output `Y[1] = X[n]/V`.
  Unobserved compartments without a declared volume have an explicitly warned
  unit display scale; their curves are amounts, not validated concentrations.
- Continuous and binary categorical covariate effects supported by the builder.
- A selected bolus input and its lag, or an explicit infusion input with a
  placeholder duration of 1 h. Initial dose is illustrative (100 units).
  Dose history, infusion duration, units and covariate history remain data inputs.
- Primary values from range midpoints (`ab`) or means (`msd`); missing numeric
  values in text primary declarations use 1 with an explicit warning.

Unsupported conditions, scaled dose inputs, non-unit bioavailability, nonzero
initial amounts, multiple outputs and custom routines are rejected, retaining
the previous diagram. Only the selected administration is illustrated when
several routes exist; a warning identifies it.

## Statistical Boundary

Search ranges and nonparametric support points are not a Gaussian OMEGA matrix.
Pmetrics assay error is a polynomial SD modified by gamma/lambda, not generally
the builder's sum of independent proportional and additive error variances.
An external Pmetrics import therefore transfers structure, not fitted population
distributions, interpolation policy, error likelihood or estimated posteriors.
The UI explicitly requests review of builder variability and residual settings.

## MIPD Artifact And MAP Backend

Deployment check, 2026-09-29: this backend passes native local R/Pmetrics tests,
but is NOT yet installed in the public Shiny engine. Shinyapps.io's build image
provides Cargo 1.75; Pmetrics 3.2.6 dependencies require newer Rust features
(edition 2024). Bundle 12619306 failed during Pmetrics compilation. An earlier
R 4.6 attempt (12619291) failed on lazyeval. The previous public app is retained.
The website translator does not depend on that server-side installation.

The Shiny engine uses a separate, versioned JSON artifact for patient-level
Pmetrics calculations. It binds together a supported structural template,
parameter search bounds, the Pmetrics polynomial error model, administration
metadata, and weighted nonparametric support points. Runtime validation rejects
unknown templates, parameters outside their bounds, invalid probabilities, and
paths outside the bundled artifact directory.

For an observed patient, the backend creates `PM_data`, writes the weighted
support points to an ephemeral prior CSV, and calls `PM_model$map()`. It extracts
`final$postPoints`, uses the posterior parameter mean for the central profile,
and samples the discrete posterior support distribution for uncertainty. It does
not convert support points into a Gaussian OMEGA. Pmetrics run files are removed
when the call returns; the trusted mrgsolve simulation bridge is scoped to the
Shiny session.

`tdm-engine/pmetrics/artifacts/demo_one_comp_iv.json` is a synthetic integration
fixture, not a published population model. Published artifacts require their
actual estimated support points and error model.

The initial backend supports only the one-compartment IV template without
covariates. Error factors must be fixed at their previously estimated values.
Steady-state warmup covers at least -log(1e-8)/min(ke) hours and scheduled doses
continue through the observation horizon. Predictive additive error uses
sqrt(assaySD^2 + lambda^2), matching pharmsol's implementation; proportional
error uses gamma * assaySD. These conventions are tested rather than inferred
from a translation of SIGMA.

## Export

The Pmetrics tab exports a Pmetrics 3 R structural template for PK models with
one dose entry. Typical values are point ranges (`msd(value, 0)`), not inferred
population priors. Set justified search bounds before population estimation.
Covariates use carry-forward interpolation (`interp("none")`). Put the dose
schedule and infusion duration in `PM_data` as noted in the generated comments.

Pure additive/proportional error maps to a fixed unit gamma and the corresponding
assay polynomial. Combined independent error has no exact polynomial equivalent;
the template leaves `err = NULL` and shows a warning. The constructor is commented
out until this specification is reviewed. PD/DDI blocks and split dose fractions
are explicitly unavailable in this first Pmetrics exporter.

An unchanged PMx export also contains graph metadata to restore builder settings.
An integrity checksum detects edits to the source; edited exports are reparsed
from the actual equations instead of restoring stale metadata.

## Verification

`npm run test:pmetrics` checks text/R imports, covariates, input numbering,
rejected constructs, and native round trips without metadata.
`npm run test:pmetrics-native` sends an exported model to an installed Pmetrics
3 runtime, requires `PM_model$new()` to compile it, and simulates a one-compartment
IV bolus. The resulting concentrations are checked against the analytical curve.
`npm run tdm:test-pmetrics` validates the artifact, runs `PM_model$map()` against
synthetic patient observations, and checks the posterior bridge and predictive
distribution.
`tests/e2e/pmetrics.spec.js` imports the complete `two_comp_bolus` model from the
official NPAG covariate tutorial and checks the UI, `.R` upload, TDM availability,
nonblank curves, guarded failure, and desktop/mobile layouts. These checks and
the native constructor compilation are not a Pmetrics population-fitting validation.

## Official Sources

- [Current model tutorial](https://lapkb.github.io/PM_tutorial/models.html)
- [Legacy text model format](https://lapkb.github.io/Pmetrics/articles/models.html)
- [Pmetrics R implementation](https://github.com/LAPKB/Pmetrics/blob/main/R/PM_model.R)

# Independent scientific review queue

This queue records work that still requires a person other than the author.
It does not claim that an internal or external review has occurred.

As of 2026-10-11, all 64 active visualization components have an author review
record. No visualization remains pending author review. These records document
review by the author; they do not claim independent internal or external
validation.

## Priority 1

- Beginner path: PK/PD foundations and the associated quantitative figures.
- Bayesian estimation and TDM: assumptions, residual error and decision limits.
- Validation: OFV/LRT, AIC/BIC, residual diagnostics, VPC and NPDE.
- Independent review of a targeted sample of central quantitative
  visualizations.

## Priority 2

- PBPK and extrapolation.
- Infectiology and PK/PD indices.
- First-in-human and trial simulation.
- Oncology, survival and causal-language boundaries.

## Evidence to record

For each reviewed French or English file, record the date and change
`review_type` to `internal` or `external` only when that review actually
occurred. Then seal that exact file, for example
`npm run review:seal -- src/content/chapters/valid-vpc.md`. For a reviewed
visualization, seal its exact stem. Reviewer identity or acknowledgement is
published only with permission.

The accessibility protocol and eight user sessions remain separate empirical
tasks in [usability-accessibility-results.md](usability-accessibility-results.md).

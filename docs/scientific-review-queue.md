# Independent scientific review queue

This queue records work that still requires a person other than the author.
It does not claim that an internal or external review has occurred.

Before the targeted 2026-10-12 review, 62 of 65 visualizations had a current
author-review hash. After the bilingual text, equations and captions of
`32_Myelosuppression`, `43_Copula` and `NPAGSupportPoints` were reread, all
65 of 65 have a current author-review hash. This is author review, not
independent validation; independent internal or external review remains pending.

Use the file-level [independent review checklist](scientific-review-checklist.md)
to record sources, reviewer, date, comments and status.

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

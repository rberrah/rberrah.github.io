# Independent scientific review queue

This queue records work that still requires a person other than the author.
It does not claim that an internal or external review has occurred.

After the post-freeze pedagogical and VPC maintenance changes on 2026-10-28, the generated registries report 58 of 67
visualizations with a current recorded review and 9 `pending`. They also report
77 of 95 chapters with a current author-review hash in each language: 18 French
and 18 English files changed after their stored hashes. The exact files and
components are listed in
[author-review-required.md](author-review-required.md). Four cross-domain
lessons per language also remain `pending`. No internal or external chapter
review is recorded.

Use the file-level [independent review checklist](scientific-review-checklist.md)
to record sources, reviewer, date, comments and status.

## Priority 1: review sequence

1. Starter 12: PK/PD foundations and their quantitative figures.
2. Validation: OFV/LRT, AIC/BIC, residual diagnostics, VPC and NPDE.
3. Bayesian estimation and TDM: assumptions, residual error and decision limits.
4. Software workflows: NONMEM, Monolix, nlmixr2 and Pmetrics/nonparametric estimation, including an independent reading of `NPAGSupportPoints.svelte`.
5. Infectiology and PK/PD indices.

## Priority 2

- PBPK and extrapolation.
- First-in-human and trial simulation.
- Oncology, survival and causal-language boundaries.
- The four Omics → PK/PD lessons, reviewed independently in French and English.
- A targeted sample of other central quantitative visualizations.

## Evidence to record

For each reviewed French or English file, record the date and change
`review_type` to `internal` or `external` only when that review actually
occurred. Then seal that exact file, for example
`npm run review:seal -- src/content/chapters/valid-vpc.md`. For a reviewed
visualization, seal its exact stem. Reviewer identity or acknowledgement is
published only with permission.

The accessibility protocol and eight user sessions remain separate empirical
tasks in [usability-accessibility-results.md](usability-accessibility-results.md).

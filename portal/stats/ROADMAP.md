# Stats roadmap

## P0 — make the current calculator reference-grade

1. Automated numerical regression tests against R reference outputs.
2. Exact small-sample Mann–Whitney and Wilcoxon inference where computationally feasible.
3. Diagnostic plots: distributions, paired differences, scatterplots, residuals and Q–Q plots.
4. Downloadable analysis report with input summary, method, result and limitations.

## P1 — broaden common biomedical statistics

- Welch ANOVA and Games–Howell post-hoc.
- Repeated-measures ANOVA / Friedman with corrected post-hoc tests.
- McNemar test for paired binary data.
- One-sample tests and confidence intervals for means / proportions.
- Logistic regression and multivariable linear regression.
- Survival: Kaplan–Meier, log-rank and Cox regression.
- Multiple-testing correction (BH, Holm, Bonferroni).
- Power and sample-size calculators.

## P2 — study-design assistant

Closed-question protocol describing outcome type, number of groups, independence / pairing, repeated measures, covariates and primary estimand. The deterministic rules engine should explain why a method is available or excluded rather than merely returning a test name.

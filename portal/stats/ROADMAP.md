# Stats roadmap

## Completed foundation

- Question-first deterministic routing with FR/EN interface and local browser computation.
- Descriptive statistics, one-sample t, Welch t, paired t, Welch ANOVA, chi-square/Fisher, McNemar, Pearson/Spearman, simple linear regression and two-group log-rank.
- Mann–Whitney, Wilcoxon signed-rank and Kruskal–Wallis sensitivity analyses.
- Exact small-sample Mann–Whitney and Wilcoxon inference when there are no ties; explicit asymptotic fallback otherwise.
- Fixed numerical regression vectors in `npm test`.
- Browser E2E tests for the Stats workflow.
- Descriptive visualizations and Kaplan–Meier display.
- Downloadable local HTML report, copyable summary and print/PDF workflow.

## P0 — strengthen reference-grade behaviour

1. Expand parity testing against R across edge cases: unequal sample sizes, ties, zero cells, near-zero variance and extreme p-values.
2. Add diagnostic plots where they materially affect interpretation: residuals and Q–Q plots for regression/mean-based models.
3. Add corrected post-hoc comparisons after significant multi-group tests, starting with Games–Howell after Welch ANOVA.
4. Improve categorical effect estimates with confidence intervals where appropriate.

## P1 — study planning and common biomedical statistics

1. Power and sample-size calculators for two independent means, paired means, two proportions and correlation, with dropout inflation and explicit assumptions.
2. Repeated-measures / Friedman workflows with corrected post-hoc comparisons.
3. Logistic regression and multivariable linear regression.
4. Survival: full Kaplan–Meier summaries and Cox proportional-hazards regression.
5. Multiple-testing correction: BH, Holm and Bonferroni.

## P2 — study-design assistant

Closed-question protocol describing outcome type, number of groups, independence / pairing, repeated measures, covariates and the primary estimand. The deterministic rules engine should explain why a method is available or excluded rather than merely returning a test name.

The study-design assistant should eventually connect analysis choice, effect-size definition and sample-size planning in one reproducible workflow.
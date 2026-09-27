# Stats roadmap

## Completed foundation

- Question-first deterministic routing with FR/EN interface and local browser computation.
- Descriptive statistics, one-sample t, Welch t, paired t, Welch ANOVA, chi-square/Fisher, McNemar, Pearson/Spearman, simple linear regression and two-group log-rank.
- Mann–Whitney, Wilcoxon signed-rank and Kruskal–Wallis sensitivity analyses.
- Exact small-sample Mann–Whitney and Wilcoxon inference when there are no ties; explicit asymptotic fallback otherwise.
- Corrected pairwise post-hoc comparisons for multi-group analyses: pairwise Welch + Holm or Mann–Whitney + Holm.
- 2×2 risk difference, risk ratio and odds ratio with 95% confidence intervals, explicit event/group orientation and zero-cell correction disclosure.
- Fixed numerical regression vectors in `npm test`.
- Browser E2E tests for the Stats workflow.
- Descriptive visualizations and Kaplan–Meier display.
- Downloadable local HTML report, copyable summary and print/PDF workflow.
- Study-planning calculators for two independent means, paired means, two proportions and correlation, with alpha, target power and dropout inflation.

## P0 — strengthen reference-grade behaviour

1. Expand parity testing against R across edge cases: unequal sample sizes, ties, zero cells, near-zero variance and extreme p-values.
2. Add diagnostic plots where they materially affect interpretation: residuals and Q–Q plots for regression/mean-based models.
3. Add a validated Games–Howell implementation only after a studentized-range implementation has been benchmarked against reference software; keep the current pairwise Welch + Holm method explicitly labelled until then.
4. Improve categorical inference further with confidence intervals or exact alternatives appropriate to sparse tables and stratified analyses.

## P1 — broaden common biomedical statistics

1. Repeated-measures / Friedman workflows with corrected post-hoc comparisons.
2. Logistic regression and multivariable linear regression.
3. Survival: full Kaplan–Meier summaries and Cox proportional-hazards regression.
4. Multiple-testing correction: user-selectable BH, Holm and Bonferroni when the scientific workflow requires it.
5. Extend study planning to unequal allocation, one-sided hypotheses, non-inferiority and cluster/repeated-measures designs.

## P2 — study-design assistant

Closed-question protocol describing outcome type, number of groups, independence / pairing, repeated measures, covariates and the primary estimand. The deterministic rules engine should explain why a method is available or excluded rather than merely returning a test name.

The study-design assistant should eventually connect analysis choice, effect-size definition and sample-size planning in one reproducible workflow.

## Product target

The minimum target is the useful statistical coverage of tools such as BiostaTGV, while exceeding calculator-style interfaces on pedagogy, explicit assumptions, effect-size interpretation, reproducibility, local privacy and modern responsive UI. Feature breadth must not be achieved by silently using approximate or incorrectly labelled methods.
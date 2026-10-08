# Stats roadmap

## Completed foundation

- Question-first deterministic routing with FR/EN interface and local browser computation.
- Descriptive statistics, one-sample t, Welch t, paired t, Welch ANOVA, chi-square/Fisher, McNemar, Pearson/Spearman/Kendall, simple linear regression and two-group log-rank.
- Mann–Whitney, Wilcoxon signed-rank and Kruskal–Wallis sensitivity analyses.
- Friedman repeated-measures workflow with Kendall's W, complete-block handling and paired Wilcoxon + Holm post-hoc comparisons.
- Exact small-sample Mann–Whitney and Wilcoxon inference when there are no ties; explicit asymptotic fallback otherwise.
- Kendall tau-b with exact small-sample inference when tie-free and tie-corrected asymptotic inference otherwise.
- Corrected pairwise post-hoc comparisons for multi-group analyses: pairwise Welch + Holm, Mann–Whitney + Holm or paired Wilcoxon + Holm after Friedman.
- 2×2 risk difference, risk ratio and odds ratio with 95% confidence intervals, explicit event/group orientation and zero-cell correction disclosure.
- Fixed numerical regression vectors in `npm test`, including repeated-measures ties/incomplete blocks and Kendall exact/tied cases.
- Browser E2E tests for the Stats workflow.
- Descriptive visualizations, model diagnostic Q–Q/residual plots and Kaplan–Meier display.
- Downloadable local HTML report, copyable summary and print/PDF workflow.
- Study-planning calculators for two independent means, paired means, two proportions and correlation, with alpha, target power and dropout inflation.
- Closed-question deterministic study-design assistant routing repeated designs to Friedman rather than an independent-group analysis.
- Binary logistic regression with explicit event coding, OR/IC95 %, Wald + likelihood-ratio inference, convergence/separation diagnostics and browser coverage.
- Multivariable linear regression for numeric predictors with adjusted coefficients/IC95 %, global fit, VIFs, complete-case accounting, Cook/leverage/standardized-residual diagnostics and collinearity rejection.
- Extended two-group survival workflow with Kaplan–Meier summaries/risk table and explicitly oriented binary Cox PH (Breslow ties), including unstable-estimate warnings.

## P0 — strengthen reference-grade behaviour

1. Expand parity testing against R across highly unbalanced samples, near-zero variance, extreme p-values and degenerate inputs; add explicit reference-R parity scripts for the advanced methods.
2. Add a validated Games–Howell implementation only after a studentized-range implementation has been benchmarked against reference software; keep the current pairwise Welch + Holm method explicitly labelled until then.
3. Improve categorical inference further with confidence intervals or exact alternatives appropriate to sparse tables and stratified analyses.
4. Add validated proportional-hazards diagnostics (e.g. scaled Schoenfeld residual methods) and clinically chosen landmark summaries beyond the current automatic Kaplan–Meier risk table.

## P1 — broaden common biomedical statistics

1. Multiple-testing correction: user-selectable BH, Holm and Bonferroni when the scientific workflow requires it.
2. Extend study planning to unequal allocation, one-sided hypotheses, non-inferiority and cluster/repeated-measures designs.
3. Consider Cochran's Q for >2 paired binary measurements and other common repeated categorical designs once reference vectors are in place.
4. Extend regression workflows to categorical predictors/interactions and, for linear models, validated heteroscedasticity-robust standard errors.
5. Extend Cox beyond the current binary-group model only after categorical/numeric covariate handling and PH diagnostics are reference-validated.

## P2 — study-design assistant

Extend the existing closed-question assistant from simple routing toward a protocol description of outcome type, number of groups, independence/pairing, repeated measures, covariates and the primary estimand. The deterministic rules engine should explain why a method is available or excluded rather than merely returning a test name.

The study-design assistant should eventually connect analysis choice, effect-size definition and sample-size planning in one reproducible workflow.

## Product target

The minimum target is the useful statistical coverage of tools such as BiostaTGV, while exceeding calculator-style interfaces on pedagogy, explicit assumptions, effect-size interpretation, reproducibility, local privacy and modern responsive UI. Feature breadth must not be achieved by silently using approximate or incorrectly labelled methods.

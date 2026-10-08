# Validation plan

Stats is a browser implementation. Methods should be benchmarked against fixed reference outputs and their inference mode must remain explicit in the UI.

## Reference checks

- Welch: `stats::t.test(var.equal = FALSE)`
- Paired t: `stats::t.test(paired = TRUE)`
- Mann–Whitney: `stats::wilcox.test(exact = TRUE)` for small samples without ties; otherwise the continuity-corrected asymptotic result
- Wilcoxon signed-rank: `stats::wilcox.test(paired = TRUE, exact = TRUE)` for small samples without tied absolute differences; otherwise the continuity-corrected asymptotic result
- Friedman: `stats::friedman.test`, including tie-corrected rank statistics and complete-block exclusion
- Friedman post-hoc: pairwise paired Wilcoxon p-values followed by `stats::p.adjust(method = "holm")`
- Welch ANOVA: reference Welch one-way ANOVA implementation
- Kruskal–Wallis: `stats::kruskal.test`
- Multi-group post-hoc: pairwise Welch tests compared with repeated `stats::t.test(var.equal = FALSE)` calls followed by `stats::p.adjust(method = "holm")`; rank workflow compared with pairwise Wilcoxon/Mann–Whitney p-values followed by Holm adjustment
- Chi-square: `stats::chisq.test(correct = FALSE)` for general tables
- Fisher 2×2: `stats::fisher.test`
- 2×2 risk difference: observed risks with Newcombe–Wilson hybrid confidence interval
- 2×2 risk ratio and odds ratio: log-scale confidence intervals; zero-cell vectors must verify the stated Haldane–Anscombe correction
- McNemar: exact binomial inference for few discordant pairs, asymptotic chi-square otherwise
- Pearson / Spearman / Kendall: `stats::cor.test`; Kendall exact small-sample vectors are compared with the permutation distribution when there are no ties and asymptotic tie-corrected vectors when ties are present
- Linear regression: `stats::lm`, `confint`
- Binary logistic regression: `stats::glm(..., family = binomial())`, `confint.default`/Wald CI and likelihood-ratio comparison against the intercept-only model; explicit separation/non-convergence vectors
- Multivariable linear regression: `stats::lm` coefficient table/`confint`, global F/R²/adjusted R², VIFs from the inverse predictor correlation matrix, hat values and Cook's distance
- Log-rank: reference survival-package implementation
- Kaplan–Meier summaries: reference product-limit survival steps, medians and numbers at risk
- Binary Cox PH: `survival::coxph(..., ties = "breslow")` for log-HR, SE, HR/CI and partial likelihood; orientation reversal must return the reciprocal HR

## Rank-test routing

Mann–Whitney uses exact two-sided rank-distribution inference when the pooled sample has no ties and `N <= 24`. Wilcoxon signed-rank uses exact two-sided inference when non-zero absolute differences have no ties and `n <= 25`. Otherwise the engine reports an asymptotic p-value with tie correction where applicable. The result card explicitly labels the inference mode.

Kendall tau-b uses exact two-sided inference when `n < 50` and both variables are tie-free. The exact distribution is generated from inversion counts. Otherwise the score statistic uses the standard tie-corrected asymptotic variance and the UI labels the result asymptotic.

## Repeated-measures edge cases

Fixed regression vectors cover:

- a complete 8-subject, 3-condition design with `Q = 16`, `W = 1` and three exact paired Wilcoxon post-hoc comparisons;
- an incomplete subject, which must be excluded from the common Friedman/post-hoc block rather than reintroduced pairwise;
- within-subject ties with reference `Q = 6.615384615...` and `p = 0.036600539...`;
- duplicate subject × condition cells, which are rejected rather than silently aggregated.

## Multiplicity and categorical effects

Holm adjustment has fixed regression vectors for raw and adjusted p-values. Browser tests verify that a three-group dataset produces three pairwise rows and exposes the adjusted p-value rather than reporting uncorrected pairwise significance alone.

For 2×2 categorical analyses, numerical vectors verify RD, RR and OR and their confidence intervals. A separate zero-cell vector checks that RR and OR remain finite only because the Haldane–Anscombe correction is invoked, while the risk difference remains based on observed risks. Browser tests verify that the user can see the selected numerator group and event category.

## Survival reference vectors

The built-in two-group survival demonstration is fixed as a reference dataset with 12 observations and 8 events. Kaplan–Meier vectors check group medians (A = 8, B = 9), selected step probabilities and numbers at risk. The Cox PH vector is benchmarked with Breslow ties: A vs B log-HR ≈ 0.589143744, HR ≈ 1.8024444, Wald p ≈ 0.44458 and likelihood-ratio p ≈ 0.44145. Reversing the group orientation must return the reciprocal HR and inverted CI endpoints.

A separate dataset with events confined to one group must be flagged as an unstable Cox estimate rather than silently presenting a finite standard HR as reliable.

## Regression reference vectors

Binary logistic regression has fixed MLE vectors for an intercept + one numeric predictor, including the slope, standard error, odds ratio and 95% CI, log-likelihood, likelihood-ratio statistic/p-value and McFadden R². A perfectly separated dataset is a separate guardrail vector and must produce a stability warning rather than a routine interpretable MLE.

Multivariable linear regression is benchmarked on a two-predictor OLS dataset against reference matrix calculations / `stats::lm`. Fixed vectors cover the intercept, both adjusted slopes and confidence intervals, standard errors, global F test, R², adjusted R², residual standard error, VIFs, maximum leverage and Cook's distance. Additional vectors verify complete-case exclusion, exact collinearity rejection and constant-predictor rejection.

## Edge cases still required

Expand parity testing across highly unbalanced groups, near-zero variance, very small p-values and degenerate inputs. Add explicit reference-R scripts for the advanced methods (including logistic/multivariable regression) rather than relying only on hard-coded JS regression targets. Add heteroscedasticity-robust linear-model standard errors before presenting them as an alternative inferential mode. Add validated proportional-hazards diagnostics (for example a scaled Schoenfeld residual test) before presenting any automated PH diagnostic.

Confirmatory or high-stakes analyses should continue to be checked in validated reference software and against a pre-specified statistical analysis plan.

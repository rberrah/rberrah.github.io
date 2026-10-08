# Deterministic method selection rules

The browser never asks an LLM to select a statistical method.

| Scientific situation | Default | Complement / automatic rule |
|---|---|---|
| Two independent quantitative groups | Welch t-test | Mann–Whitney as rank-based sensitivity analysis |
| Two paired quantitative measurements | Paired t-test | Wilcoxon signed-rank as rank-based sensitivity analysis |
| Three or more repeated quantitative measurements | Friedman | Kendall's W effect size + paired Wilcoxon post-hoc comparisons with Holm correction |
| Three or more independent quantitative groups | Welch ANOVA | Kruskal–Wallis as rank-based sensitivity analysis; corrected pairwise comparisons are reported |
| Two categorical variables | Chi-square | Fisher exact for 2×2 tables when the smallest expected count is < 5; 2×2 effect estimates are reported |
| Paired binary outcome | McNemar | Exact binomial inference when discordant pairs are few |
| Two quantitative / ordinal variables, association | Pearson | Spearman + Kendall tau-b rank measures and simple linear regression |
| Binary outcome + one numeric predictor | Binary logistic regression | Explicit event coding; OR + 95% CI; Wald and likelihood-ratio inference; convergence/separation diagnostics |
| Quantitative outcome + at least two numeric predictors | Multivariable linear regression | Adjusted coefficients + 95% CIs, adjusted R², VIF and influence diagnostics |
| Time to event in two groups | Log-rank | Kaplan–Meier visualization |
| One quantitative sample vs fixed reference | One-sample t-test | No automated rank alternative yet |

## Rank-test inference

Mann–Whitney and Wilcoxon signed-rank are not always forced through a normal approximation. The engine uses an exact two-sided rank distribution for small samples when ties are absent. It falls back to the asymptotic calculation when ties are present or the exact-state threshold is exceeded. The result card states which inference mode was used.

Kendall tau-b uses an exact two-sided permutation distribution when `n < 50` and neither variable contains ties. With ties, or at larger sample sizes, the tool uses the asymptotic variance of Kendall's score corrected for tie groups and labels the inference as asymptotic. Tau-b itself corrects its denominator for ties in both variables.

## Repeated measures

For at least three repeated quantitative or ordinal measurements, the repeated-measures workflow expects long-format data with one subject identifier, one condition/time variable and one value variable.

The Friedman statistic is calculated from average within-subject ranks. Within-subject ties are incorporated through the standard tie correction. The global effect size is Kendall's W. A subject missing at least one condition is excluded from the complete block used for the global test.

Post-hoc localization uses pairwise signed-rank Wilcoxon tests with Holm family-wise error correction. The same complete-subject set is retained for every pair rather than reintroducing incomplete subjects selectively, so the displayed comparisons refer to one coherent repeated-measures population.

## Multi-group post-hoc comparisons

A global multi-group p-value does not identify which groups differ. The tool therefore reports all pairwise comparisons with Holm family-wise error correction:

- after the mean-based Welch ANOVA workflow: pairwise Welch t-tests + Holm adjustment, with mean difference, 95% CI and Hedges' g;
- in the rank-based independent-groups workflow: pairwise Mann–Whitney tests + Holm adjustment, with Cliff's delta;
- after Friedman: paired Wilcoxon signed-rank tests + Holm adjustment, with median paired difference and rank-biserial effect size.

The independent mean-based comparisons are deliberately labelled **pairwise Welch + Holm**, not Games–Howell. Games–Howell requires a validated studentized-range implementation and should only be added under that name once such an implementation is benchmarked against reference software.

## 2×2 categorical effect estimates

For a 2×2 table, the user explicitly chooses the numerator group and the category treated as the event. This avoids silently reversing the interpretation when factor levels change order.

The tool reports:

- risk difference (RD) from the observed risks, with a Newcombe–Wilson hybrid 95% CI;
- risk ratio (RR), with a log-scale Wald 95% CI;
- odds ratio (OR), with a log-scale Wald 95% CI.

When at least one cell is zero, a Haldane–Anscombe correction (+0.5 to all four cells) is used for RR and OR and their confidence intervals. RD remains calculated from the observed risks. The interface states when this correction has been applied.

## Regression models

### Binary logistic regression

The event category is selected explicitly and encoded as \(Y=1\). The current model contains an intercept and one numeric predictor. It reports the slope on the log-odds scale, the odds ratio for a +1-unit increase in the predictor, a Wald 95% confidence interval, Wald p-value, likelihood-ratio statistic/p-value, McFadden R² and AIC.

The maximum-likelihood fit uses Newton updates with step halving. If the fit fails to converge, the information matrix is nearly singular, the standardized coefficient becomes extreme, or fitted probabilities approach 0 and 1 in a pattern compatible with separation, the interface displays a stability warning. In that situation standard MLE odds ratios and p-values should not be interpreted as routine results; a penalized or exact logistic method should be considered.

### Multivariable linear regression

The current multivariable workflow is intentionally restricted to numeric predictors. Rows are retained only when the outcome and every selected predictor are finite (complete-case analysis). Predictors are centered and scaled internally, the normal equations are solved on that stabilized scale, and coefficients/covariance are transformed back to the original units.

The model reports each adjusted coefficient, standard error, 95% CI, t statistic and p-value, plus global F inference, R², adjusted R² and residual standard error. Variance inflation factors are calculated from the inverse predictor correlation matrix.

Influence diagnostics include leverage, standardized residuals and Cook's distance. The interface displays common heuristic review guides (Cook > 4/n, leverage > 2(p+1)/n, |standardized residual| > 3) but never deletes observations automatically. Exact or near-exact collinearity is rejected rather than returning unstable coefficients.

## Study planning

The sidebar includes deterministic approximate sample-size calculations for:

- two independent means with equal allocation;
- paired means using the SD of within-pair differences;
- two independent proportions with equal allocation;
- testing a correlation against zero using Fisher's z transformation.

All planning calculations are two-sided, accept alpha and target power, and can inflate the required sample size for expected dropout. They are planning approximations, not substitutes for a protocol-specific confirmatory calculation when clustering, unequal allocation, non-inferiority, repeated measures, multiplicity, interim analyses or other design features are present.

The user may override a compatible analysis recommendation. The interface separates statistical assumptions from properties that cannot be diagnosed from the entered values alone, such as independence, sampling validity or causal interpretation.

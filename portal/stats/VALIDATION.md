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
- Log-rank: reference survival-package implementation

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

## Edge cases still required

Expand parity testing across highly unbalanced groups, near-zero variance, very small p-values and degenerate inputs. Add explicit parity vectors for the advanced methods in a reference R script rather than relying only on hard-coded JS regression targets.

Confirmatory or high-stakes analyses should continue to be checked in validated reference software and against a pre-specified statistical analysis plan.

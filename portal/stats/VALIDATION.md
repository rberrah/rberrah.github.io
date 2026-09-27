# Validation plan

Stats is a browser implementation. Methods should be benchmarked against fixed reference outputs and their inference mode must remain explicit in the UI.

## Reference checks

- Welch: `stats::t.test(var.equal = FALSE)`
- Paired t: `stats::t.test(paired = TRUE)`
- Mann–Whitney: `stats::wilcox.test(exact = TRUE)` for small samples without ties; otherwise the continuity-corrected asymptotic result
- Wilcoxon signed-rank: `stats::wilcox.test(paired = TRUE, exact = TRUE)` for small samples without tied absolute differences; otherwise the continuity-corrected asymptotic result
- Welch ANOVA: reference Welch one-way ANOVA implementation
- Kruskal–Wallis: `stats::kruskal.test`
- Chi-square: `stats::chisq.test(correct = FALSE)` for general tables
- Fisher 2×2: `stats::fisher.test`
- McNemar: exact binomial inference for few discordant pairs, asymptotic chi-square otherwise
- Pearson / Spearman: `stats::cor.test`
- Linear regression: `stats::lm`, `confint`
- Log-rank: reference survival-package implementation

## Rank-test routing

Mann–Whitney uses exact two-sided rank-distribution inference when the pooled sample has no ties and `N <= 24`. Wilcoxon signed-rank uses exact two-sided inference when non-zero absolute differences have no ties and `n <= 25`. Otherwise the engine reports an asymptotic p-value with tie correction where applicable. The result card explicitly labels the inference mode.

## Edge cases still required

Expand parity testing across unequal sample sizes, ties, zero cells, highly unbalanced groups, near-zero variance, very small p-values and degenerate inputs. Confirmatory or high-stakes analyses should continue to be checked in validated reference software and against a pre-specified statistical analysis plan.
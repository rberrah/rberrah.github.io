# Validation plan

Stats is a browser implementation. Before labelling a method as validated, compare a battery of fixed datasets against R reference functions and document tolerances.

## Required checks

- Welch: `stats::t.test(var.equal = FALSE)`
- Paired t: `stats::t.test(paired = TRUE)`
- Mann–Whitney: `stats::wilcox.test(exact = FALSE, correct = TRUE)`
- Wilcoxon signed-rank: `stats::wilcox.test(paired = TRUE, exact = FALSE, correct = TRUE)`
- ANOVA: `stats::aov`
- Kruskal–Wallis: `stats::kruskal.test`
- Chi-square: `stats::chisq.test(correct = FALSE)` for general tables
- Fisher 2×2: `stats::fisher.test`
- Pearson / Spearman: `stats::cor.test`
- Linear regression: `stats::lm`, `confint`

Validate ordinary cases, unequal sample sizes, ties, zero cells, highly unbalanced groups, very small p-values and near-zero variance. Exact small-sample rank-test inference is not implemented in v0.1 and should remain clearly labelled as approximate.
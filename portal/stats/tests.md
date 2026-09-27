# Manual verification cases

Use the built-in demos in `/stats/tool/` and compare with reference software before considering a release validated.

1. Two independent groups: compare Welch t statistic, degrees of freedom, p-value and mean-difference CI with R `t.test(x, y)`.
2. Paired data: compare with `t.test(x, y, paired=TRUE)`.
3. Three groups: compare global ANOVA F and p-value with `summary(aov(value ~ group))`.
4. 2×2 table: compare chi-square and Fisher exact p-values with `chisq.test()` and `fisher.test()`.
5. Correlation: compare Pearson coefficient and p-value with `cor.test(x, y)`.
6. Linear regression: compare slope, confidence interval, p-value and R² with `summary(lm(y ~ x))` and `confint()`.

Rank-based methods use asymptotic normal/chi-square approximations in the browser implementation; exact small-sample values can differ from R defaults.
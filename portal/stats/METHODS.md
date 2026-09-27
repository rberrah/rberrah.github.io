# Deterministic method selection rules

The browser never asks an LLM to select a statistical test.

| Scientific situation | Default | Alternative / switch |
|---|---|---|
| Two independent quantitative groups | Welch t-test | Mann–Whitney when strong skew / extreme values are declared |
| Two paired quantitative measurements | Paired t-test | Wilcoxon signed-rank when paired differences are strongly skewed / extreme |
| Three or more independent quantitative groups | One-way ANOVA | Kruskal–Wallis when strong skew / extreme values are declared |
| Two categorical variables | Chi-square | Fisher exact for 2×2 tables when the smallest expected count is < 5 |
| Two quantitative variables, association | Pearson | Spearman when relation is not approximately linear or major outliers are expected |
| Simple X → Y quantitative model | Simple linear regression | No automated alternative in v0.1 |

The user may override a compatible recommendation. The interface distinguishes statistical assumptions from properties that cannot be diagnosed from the entered values alone, such as independence or causal validity.
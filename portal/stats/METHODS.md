# Deterministic method selection rules

The browser never asks an LLM to select a statistical method.

| Scientific situation | Default | Complement / automatic rule |
|---|---|---|
| Two independent quantitative groups | Welch t-test | Mann–Whitney as rank-based sensitivity analysis |
| Two paired quantitative measurements | Paired t-test | Wilcoxon signed-rank as rank-based sensitivity analysis |
| Three or more independent quantitative groups | Welch ANOVA | Kruskal–Wallis as rank-based sensitivity analysis |
| Two categorical variables | Chi-square | Fisher exact for 2×2 tables when the smallest expected count is < 5 |
| Paired binary outcome | McNemar | Exact binomial inference when discordant pairs are few |
| Two quantitative variables, association | Pearson | Spearman sensitivity + simple linear regression |
| Time to event in two groups | Log-rank | Kaplan–Meier visualization |
| One quantitative sample vs fixed reference | One-sample t-test | No automated rank alternative yet |

## Rank-test inference

Mann–Whitney and Wilcoxon signed-rank are not always forced through a normal approximation. The engine uses an exact two-sided rank distribution for small samples when ties are absent. It falls back to the asymptotic calculation when ties are present or the exact-state threshold is exceeded. The result card states which inference mode was used.

## Study planning

The sidebar includes deterministic approximate sample-size calculations for:

- two independent means with equal allocation;
- paired means using the SD of within-pair differences;
- two independent proportions with equal allocation;
- testing a correlation against zero using Fisher's z transformation.

All planning calculations are two-sided, accept alpha and target power, and can inflate the required sample size for expected dropout. They are planning approximations, not substitutes for a protocol-specific confirmatory calculation when clustering, unequal allocation, non-inferiority, repeated measures, multiplicity, interim analyses or other design features are present.

The user may override a compatible analysis recommendation. The interface separates statistical assumptions from properties that cannot be diagnosed from the entered values alone, such as independence, sampling validity or causal interpretation.
# Stats

Browser-only deterministic statistics tool published at `/stats/` with the analyser at `/stats/tool/`.

## Current analyses

- Welch two-sample t-test
- Mann–Whitney U
- Paired t-test
- Wilcoxon signed-rank
- One-way ANOVA
- Kruskal–Wallis
- Chi-square independence test
- Fisher exact test for 2×2 tables
- Pearson and Spearman correlation
- Simple linear regression

The interface reports effect estimates, confidence intervals where defined, p-values, effect sizes, assumptions and a plain-language interpretation. Data are processed in the browser and are not sent to a statistical backend.

## Validation targets

Before treating the tool as a reference calculator, benchmark representative cases against R (`t.test`, `wilcox.test`, `aov`, `kruskal.test`, `chisq.test`, `fisher.test`, `cor.test`, `lm`). Rank-based p-values currently use asymptotic approximations when applicable, so small-sample exact values may differ from R defaults. The UI states that the tool is intended for research and education and that high-stakes analyses should be verified with reference software.

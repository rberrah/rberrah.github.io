# Stats

Browser-only deterministic statistics tool published at `/stats/`, with the guided analyser at `/stats/tool/`.

The design follows the same principles as the multi-omics tool: a separate presentation page, FR/EN interface, question-first workflow, contextual help, built-in demonstrations, explicit deterministic rules and plain-language interpretation. No LLM selects the statistical method.

## Current analyses

- Descriptive statistics with mean, SD, median, IQR and mean 95% CI
- One-sample t-test
- Welch two-sample t-test
- Mann–Whitney U sensitivity analysis
- Paired t-test
- Wilcoxon signed-rank sensitivity analysis
- Welch ANOVA
- Kruskal–Wallis sensitivity analysis
- Chi-square independence test
- Fisher exact test for 2×2 tables
- McNemar test for paired binary outcomes
- Pearson and Spearman correlation
- Simple linear regression
- Two-group log-rank test

The interface reports effect estimates, confidence intervals where defined, p-values, effect sizes, assumptions and a plain-language interpretation. Data are parsed and analysed locally in the browser rather than uploaded to a statistical backend.

## Method-selection philosophy

The tool starts from the scientific question and study design rather than asking the user to know a test name. It does not use an automatic normality test as a switch between parametric and non-parametric analysis. For common continuous comparisons, a mean-based method is the primary analysis and the corresponding rank-based method is available as a sensitivity analysis.

## Validation

`npm run test:stats` executes fixed numerical reference vectors for the statistical engine, and these checks are also part of the repository's default `npm test` command. The portal Playwright suite exercises the complete Stats demo workflow in a browser.

Rank-based p-values currently use asymptotic approximations when applicable, so very small samples can differ from exact reference-software results. High-stakes or confirmatory analyses should still be checked in validated reference software and interpreted in the context of the study design.
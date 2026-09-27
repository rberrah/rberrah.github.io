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
- Two-group log-rank test with Kaplan–Meier visualization

The interface reports effect estimates, confidence intervals where defined, p-values, effect sizes, assumptions and a plain-language interpretation. Data are parsed and analysed locally in the browser rather than uploaded to a statistical backend. Results can be visualized and exported as a local HTML report without embedding the raw dataset.

## Method-selection philosophy

The tool starts from the scientific question and study design rather than asking the user to know a test name. It does not use an automatic normality test as a switch between parametric and non-parametric analysis. For common continuous comparisons, a mean-based method is the primary analysis and the corresponding rank-based method is available as a sensitivity analysis.

For Mann–Whitney and Wilcoxon signed-rank, small samples without ties use exact two-sided inference. When exact inference is not appropriate because of ties or sample size, the engine falls back to the asymptotic calculation and the result card labels the inference mode explicitly.

## Validation

`npm run test:stats` executes fixed numerical reference vectors for the statistical engine, and these checks are also part of the repository's default `npm test` command. The vectors cover primary tests plus exact/asymptotic rank-test routing, McNemar and log-rank. The portal Playwright suite exercises the complete Stats demo workflow in a browser, including visualization, exact-inference labelling, bilingual display and local report export.

High-stakes or confirmatory analyses should still be checked in validated reference software and interpreted in the context of the study design and a pre-specified statistical analysis plan.
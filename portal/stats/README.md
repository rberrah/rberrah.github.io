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
- Corrected pairwise post-hoc comparisons after multi-group analyses: pairwise Welch + Holm or Mann–Whitney + Holm
- Chi-square independence test
- Fisher exact test for 2×2 tables
- 2×2 effect estimates with explicit orientation: risk difference, risk ratio and odds ratio with 95% confidence intervals
- McNemar test for paired binary outcomes
- Pearson and Spearman correlation
- Simple linear regression
- Two-group log-rank test with Kaplan–Meier visualization

The interface reports effect estimates, confidence intervals where defined, p-values, effect sizes, assumptions and a plain-language interpretation. Data are parsed and analysed locally in the browser rather than uploaded to a statistical backend. Results can be visualized and exported as a local HTML report without embedding the raw dataset.

For 2×2 tables, the numerator group and event category are explicit controls. When a zero cell prevents finite log-scale RR/OR estimates, the interface states that a Haldane–Anscombe correction has been applied to RR/OR only.

## Study planning

The analyser sidebar also provides approximate deterministic sample-size calculations for two independent means, paired means, two independent proportions and correlation. The user specifies alpha, target power and expected dropout. Results distinguish the statistical sample size from the inflated recruitment target and state the main approximation used.

These calculators are intentionally limited to simple two-sided designs. Confirmatory trials with non-inferiority, clustering, unequal allocation, repeated measurements, multiplicity or interim analyses require a design-specific calculation.

## Method-selection philosophy

The tool starts from the scientific question and study design rather than asking the user to know a test name. It does not use an automatic normality test as a switch between parametric and non-parametric analysis. For common continuous comparisons, a mean-based method is the primary analysis and the corresponding rank-based method is available as a sensitivity analysis.

For Mann–Whitney and Wilcoxon signed-rank, small samples without ties use exact two-sided inference. When exact inference is not appropriate because of ties or sample size, the engine falls back to the asymptotic calculation and the result card labels the inference mode explicitly.

A significant omnibus test is not presented as if it identified the differing groups. For analyses with at least three independent groups, pairwise comparisons are displayed with Holm multiplicity correction and effect estimates.

## Validation

`npm run test:stats` executes fixed numerical reference vectors for the statistical engine, advanced effect-size/post-hoc engine and study-planning engine, and these checks are also part of the repository's default `npm test` command. The vectors cover primary tests, exact/asymptotic rank-test routing, Holm adjustment, 2×2 effect estimates including zero-cell handling, McNemar, log-rank and sample-size calculations.

The portal Playwright suite exercises the complete Stats workflow in a browser, including visualization, exact-inference labelling, corrected multi-group post-hoc output, categorical effect-size orientation, study planning, bilingual display and local report export.

High-stakes or confirmatory analyses should still be checked in validated reference software and interpreted in the context of the study design and a pre-specified statistical analysis plan.
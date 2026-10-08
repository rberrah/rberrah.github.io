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
- Friedman repeated-measures test with Kendall's W, complete-block handling and paired Wilcoxon + Holm post-hoc comparisons
- Welch ANOVA
- Kruskal–Wallis sensitivity analysis
- Corrected pairwise post-hoc comparisons after independent multi-group analyses: pairwise Welch + Holm or Mann–Whitney + Holm
- Chi-square independence test
- Fisher exact test for 2×2 tables
- 2×2 effect estimates with explicit orientation: risk difference, risk ratio and odds ratio with 95% confidence intervals
- McNemar test for paired binary outcomes
- Pearson, Spearman and Kendall tau-b association measures
- Simple linear regression
- Binary logistic regression with explicit event coding, odds ratio + 95% CI, Wald and likelihood-ratio inference, convergence/separation warning
- Multivariable linear regression for multiple numeric predictors with adjusted coefficients, 95% CIs, adjusted R², VIF and influence diagnostics
- Two-group survival workflow with log-rank, Kaplan–Meier summaries/risk table and an explicitly oriented binary Cox proportional-hazards model (Breslow ties)

The interface reports effect estimates, confidence intervals where defined, p-values, effect sizes, assumptions and a plain-language interpretation. Data are parsed and analysed locally in the browser rather than uploaded to a statistical backend. Results can be visualized and exported as a local HTML report without embedding the raw dataset.

For 2×2 tables, the numerator group and event category are explicit controls. When a zero cell prevents finite log-scale RR/OR estimates, the interface states that a Haldane–Anscombe correction has been applied to RR/OR only.

For repeated quantitative measurements, data use long format (`subject`, `condition`, `value`). Friedman and all displayed post-hoc comparisons use the same complete set of subjects, so incomplete subjects are not silently reintroduced pair by pair. Within-subject ties are assigned average ranks and the Friedman statistic is tie-corrected.

For association analyses, Kendall tau-b complements Pearson and Spearman. It uses an exact two-sided permutation distribution when `n < 50` and there are no ties; otherwise it reports a tie-corrected asymptotic inference mode explicitly.

For binary logistic regression, the event category (`Y=1`) is selected explicitly. The browser reports the odds ratio per +1 predictor unit, its 95% CI, Wald and likelihood-ratio p-values, McFadden R² and a stability warning when convergence, the information matrix or fitted probabilities suggest separation. Standard maximum-likelihood odds ratios are not presented as reliable when that warning is triggered.

For multivariable linear regression, the first implementation deliberately accepts numeric predictors only. Predictors are centered and scaled internally for numerical stability, then coefficients are transformed back to their original units. The browser reports adjusted coefficients and 95% CIs, global model fit, VIFs, complete-case exclusions and Cook/leverage/standardized-residual diagnostics. Diagnostic thresholds are review guides and never trigger automatic row deletion.

For two-group survival data, Kaplan–Meier summaries report events/censoring, observed median survival and automatic at-risk landmarks. The Cox model uses the same two-group contrast as log-rank, with an explicit group-of-interest orientation and Breslow handling of tied event times. HR interpretation is accompanied by a proportional-hazards warning; this version does not pretend that a single automatic diagnostic can validate the PH assumption.

## Study planning

The analyser sidebar also provides approximate deterministic sample-size calculations for two independent means, paired means, two independent proportions and correlation. The user specifies alpha, target power and expected dropout. Results distinguish the statistical sample size from the inflated recruitment target and state the main approximation used.

These calculators are intentionally limited to simple two-sided designs. Confirmatory trials with non-inferiority, clustering, unequal allocation, repeated measurements, multiplicity or interim analyses require a design-specific calculation.

## Method-selection philosophy

The tool starts from the scientific question and study design rather than asking the user to know a test name. It does not use an automatic normality test as a switch between parametric and non-parametric analysis. For common continuous comparisons, a mean-based method is the primary analysis and the corresponding rank-based method is available as a sensitivity analysis.

For Mann–Whitney and Wilcoxon signed-rank, small samples without ties use exact two-sided inference. When exact inference is not appropriate because of ties or sample size, the engine falls back to the asymptotic calculation and the result card labels the inference mode explicitly.

A significant omnibus test is not presented as if it identified the differing groups. For analyses with at least three independent groups, pairwise comparisons are displayed with Holm multiplicity correction and effect estimates. Repeated-measures Friedman analyses likewise receive paired Wilcoxon post-hoc comparisons with Holm correction.

## Validation

`npm run test:stats` executes fixed numerical reference vectors for the statistical engine, advanced effect-size/post-hoc engine, repeated-measures edge cases, Kendall tau-b, logistic regression, multivariable regression and study-planning engine, and these checks are also part of the repository's default `npm test` command. The vectors cover primary tests, exact/asymptotic rank-test routing, Friedman tie correction and complete-block handling, Kendall exact/tied inference, Holm adjustment, 2×2 effect estimates including zero-cell handling, McNemar, log-rank and sample-size calculations.

The portal Playwright suite exercises the complete Stats workflow in a browser, including visualization, exact-inference labelling, repeated measures, Kendall tau-b, corrected multi-group post-hoc output, categorical effect-size orientation, logistic event coding/separation warnings, multivariable coefficients/VIF/influence diagnostics, Kaplan–Meier/Cox orientation and instability warnings, study planning, bilingual display and local report export.

High-stakes or confirmatory analyses should still be checked in validated reference software and interpreted in the context of the study design and a pre-specified statistical analysis plan.

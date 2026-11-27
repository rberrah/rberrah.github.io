# MVP-inspired PMx improvements: original implementation

Conceptual inspiration: [MVPapp](https://github.com/stevechoy/MVPapp), Choy et al. (2025),
[doi:10.1002/psp4.70023](https://doi.org/10.1002/psp4.70023).
**No source code, templates, visuals, or third-party assets have been copied.**
The current PMx licence is unchanged.

## Scope of this PR

The four existing teaching laboratories gain an optional, collapsed, bilingual
one-at-a-time (OAT) sensitivity table in **free mode**. The table ranks changes
in AUC(0–horizon), Cmax or concentration immediately *before* a dose at the
fixed horizon, for bounded changes of ±10, ±20 or ±50% in one numeric input.
It reuses PMx's continuous, analytical lab model and existing hard limits.
No external backend, package, API, account or new navigation section is added.

The laboratory **already** offers A/B reference-current comparison and CSV
export. These are deliberately not reimplemented.

## Scientific and product limitations

- OAT is not a global sensitivity index, identifiability diagnostic, uncertainty
  distribution, clinical assessment or sensitivity of fitted individual ETAs.
- For each comparison every nonperturbed parameter, schedule definition and
  horizon remain fixed. The parameter range is clipped to its physical bounds.
- Cmax is computed on the existing dense laboratory series, which includes
  administration boundaries and relevant analytic landmark times; therefore
  numerical sampling still affects Cmax.
- AUC(0–horizon) is derived from exact model mass balance, not a trapezoidal
  approximation. It is **not** AUC(0–infinity).
- C at the horizon is explicitly pre-dose when a new administration occurs
  there. The reference may be zero, in which case relative changes are omitted.
- Integer administration count is excluded: a continuous perturbation has no
  well-defined meaning for that input.
- Simulated figures remain synthetic and educational, not clinical dose advice.

## Verification

Run `node scripts/test_mvp_sensitivity.mjs` and `npm run check` and
`npm run test:labs`. Verify EN/FR, mobile overflow and the teacher's
hidden-results mode manually. No claim of public deployment is made.

## Companion work (MIPD Engine)

A **separate** companion PR should add direct comparison of two
already-computed regimen candidates (including units, horizon and export),
without changing fitting, weights, model formulas or dose ranking.
Future opportunities: source-verified virtual populations, broader parameter
sensitivity in a predeclared model parameter subset, and reproducible R
simulation bundles. These are out of scope here.

## Why this is incremental

The entire panel is optional. There is no new clinical target, medical-device
claim, migration, backend execution, change to patient data retention or
modification of the frozen scientific model library.

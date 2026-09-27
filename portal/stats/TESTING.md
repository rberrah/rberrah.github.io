# Testing

The current implementation separates the numerical engine (`engine.js`) from the browser interface (`ui.js`).

## Numerical reference vectors

Run from the repository root:

```bash
npm run test:stats
```

The same Stats reference vectors are also included in the default `npm test` command used by CI. They currently cover Welch t, Mann–Whitney, paired t, Welch ANOVA, Kruskal–Wallis, Pearson, Fisher exact and descriptive statistics against fixed reference values.

## Browser workflow

The portal Playwright suite includes dedicated Stats tests for:

- public `/stats/` and `/stats/tool/` routes;
- the built-in two-group demo;
- automatic Welch primary analysis plus Mann–Whitney sensitivity analysis;
- result cards, assumptions and the local-processing notice;
- mobile layout and the FR/EN switch.

Run the assembled portal tests with the same command used by the Pages workflow:

```bash
npx playwright test --config playwright.portal.config.js
```

Rank-based p-values use asymptotic approximations in the current version. Exact small-sample rank inference remains a validation/development target.
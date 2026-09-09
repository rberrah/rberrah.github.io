# Lego translation audit (2026-09-09)

## Scope

The eight built-in presets, plus an indirect-response model, are exported from
the actual browser interface to mrgsolve, MLXTRAN and NONMEM. Each is tested
without covariates and with continuous/categorical covariates (12 to 15 effects,
including lag, Km and Hill exponent). Three imports are checked: embedded
specification, indented embedded specification, and source without that marker.

The plain-source cases are also imported through the UI and exported again.
Checks cover state types/volumes, transfers, elimination, nonlinear absorption,
PD drivers, fractions/complements, lags, duration/lag ties and covariate targets.
Dose amounts, plotting choices and simulation horizons are not inferred from
plain structural code. They are preserved by the embedded Lego specification.

## Fixes

- Interpret mrgsolve `$EVENT` split-dose routing before removing the synthetic
  `LEGO_INPUT` state from the diagram. Preserve actual input routes and ties.
- Recover all transit and PD states; do not create a compartment from `kin/kout`.
- Do not overwrite recognized named graphs with default classical PK parameters.
- Resolve NONMEM P/TVP and indexed states, F, ALAG and D. Preserve covariate
  targets, including case-sensitive Km and Hill parameter names.
- Export RATE for NONMEM zero-order inputs using RATE=-2 and Dn.
- Do not duplicate PD compartment states in mrgsolve `$CAPTURE`.
- Keep the embedded specification readable after indentation.
- Remove inline-code backgrounds from the dark code viewer.

## Reproduce

Start a **stable preview of the current build** on port 5174, or set
`LEGO_AUDIT_URL`. Do not rebuild while the browser audit is running; restart
the preview after rebuilding. Run the browser suite before generating native
audit fixtures, because Playwright clears `test-results` on startup.

```text
npm test
npm run check
npm run test:mlxtran
npm run test:e2e -- --workers=2
node scripts/audit_lego_roundtrip.mjs
Rscript tdm-engine/tests/lego_native_exports.R
Rscript tdm-engine/tests/lego_mlxtran_exports.R
npm run tdm:test
npm run tdm:test-lego
npm run tdm:validate-library
```

Set `TDM_ENGINE_E2E_URL=http://127.0.0.1:3838` to include the running local
Shiny app in Playwright. The Simulx test requires `lixoftConnectors`, a licensed
local MonolixSuite installation, and optionally `MONOLIX_HOME`.

The round-trip matrix contains 162 checks. Native mrgsolve checks compare the
54 reconstructed exports with the originals at both reference and comparison
covariates, including repeated doses (relative tolerance 1e-6). Simulx executes
18 full MLXTRAN exports and compares their central concentration to mrgsolve
at reference covariates (tolerance 1e-4). All inputs are generated preset data.

## Limits

NONMEM is not installed locally: its control streams were checked by code
review and round-trip tests, not by a native NONMEM run. Those checks do not
replace an NM-TRAN compilation against a real dataset.

This is an audit of supported Lego structures, not a universal compiler for
arbitrary C++, NM-TRAN or MLXTRAN programs. General conditional mechanisms,
IOV, arbitrary covariance matrices, residual-error models and all possible
covariate forms are not preserved by the structural importer. Existing import
warnings must be reviewed. The embedded specification restores a saved Lego
model; it is not a parser of edits made elsewhere in its surrounding source.

The 46/46 library validation checks compilation and the TDM engine contract,
not clinical validity or fresh verification against every source article.
The local Interactions Shiny implementation is excluded from this publication.
Private articles and patient files are not part of any audit fixture or commit.

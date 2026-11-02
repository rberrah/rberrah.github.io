# Native translator validation harnesses

Parser and round-trip tests do not prove that an exported model runs in the
proprietary source software. Native status is therefore reported as one of:
`passed`, `failed`, or `not-executed`.

## NONMEM

Run `node scripts/audit_lego_roundtrip.mjs`, then set `NONMEM_COMMAND` to a
licensed wrapper accepting `control-file report-file` and run:

```text
npm run test:nonmem-native
```

Without `NONMEM_COMMAND`, the harness reports `not-executed` and never labels
NONMEM export as validated. With a command, it executes three generated
fixtures, requires a report and rejects reports containing termination errors.
The local installation, licence and exact command remain the operator's
responsibility.

## Monolix / Simulx

Run the browser round-trip audit in PMx Explain, then run the following command from the standalone `rberrah/MIPD-Engine` repository:

```text
Rscript tests/lego_mlxtran_exports.R
```

The harness reports `not-executed` when `lixoftConnectors`, MonolixSuite or a
usable licence is unavailable. A `passed` status is emitted only after Simulx
has run the generated MLXTRAN fixtures and their concentration profiles agree
with the mrgsolve references within the documented tolerance.

## nlmixr2 export and Monolix conversion: separate levels of evidence

The PMx Explain [Model Translator](https://rberrah.github.io/pharmacometrie/translator/)
imports recognized model **structures** into an editable Lego graph, and the
`nlmixr2` tab generates a new `ini({})` / `model({})` template. It does **not**
import a complete Monolix project: fitted population parameters, individual
ETAs, full OMEGA/SIGMA, original observation data, administration histories,
or PRED/IPRED are not reconstructed by the structural importer.

The browser regression in `tests/e2e/workshops.spec.js` checks the actual
`nlmixr2` tab output for six structural presets. In particular, any
`TV_*` symbol used in the model must be declared in `ini({})`; lognormal
parameters initialized as `l* <- log(value)` must be referenced from that
same log-scale symbol. The test also exercises a normal parameter to avoid
breaking that distinct parameterization. This is **generator contract
evidence**, not native R validation or numerical equivalence.

For a future **native qualification** (currently **not executed**):

1. Use a public Monolix project that includes the source MLXTRAN, dataset,
   parameter estimates, covariances, observation predictions and dosing
   events. Record the exact versions and the model's numerical settings.
2. Import it using
   [monolix2rx](https://nlmixr2.github.io/monolix2rx/articles/convert-nlmixr2.html)
   and, where appropriate, `babelmixr2::as.nlmixr2()`. This is the
   **full-project comparison reference**, not a dependency of the PMx site.
3. Reconstruct only a model fully supported by the PMx structural parser;
   record every omitted effect or assumption. For unsupported or lossy
   models, stop and mark them **not comparable**, not equivalent.
4. Execute the generated `nlmixr2` model in R with the **same** parameters,
   ETAs (when applicable), dosing records, output units, residual structure
   and solver tolerances. Check successful parsing/compilation before fitting.
5. Compare structural concentration profiles and, when comparable and
   available, PRED and IPRED on the same time grid. Prespecify numerical
   tolerances before inspecting results, and report both absolute and
   relative errors, discrepancies and excluded configurations.

Do not treat an exported `ini({})` / `model({})` function, a passing
JavaScript/Playwright check, or a reconstructed browser diagram as evidence
that an arbitrary Monolix estimation or individual Bayesian prediction was
preserved. PMx is an educational structural translator; `monolix2rx`
addresses a different, full-project conversion task.

## Latest local status

On 2026-10-15, both native harnesses completed cleanly with status
`not-executed`: `NONMEM_COMMAND` was not configured, and Simulx could not be
initialized with a usable installation and licence. Parser, export and
round-trip checks pass separately; they do not change either native status to
`passed`.

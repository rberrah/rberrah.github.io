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

## Latest local status

On 2026-10-15, both native harnesses completed cleanly with status
`not-executed`: `NONMEM_COMMAND` was not configured, and Simulx could not be
initialized with a usable installation and licence. Parser, export and
round-trip checks pass separately; they do not change either native status to
`passed`.

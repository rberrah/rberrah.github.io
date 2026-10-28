# PMx Explain repository governance

Updated: 2026-10-28.

## Repository boundaries

- `rberrah/rberrah.github.io`: PMx Explain, academic portal and integration contracts.
- `rberrah/MIPD-Engine`: executable MIPD engine, PopPK library, R/Pmetrics runtime and Shiny deployment.
- `rberrah/MultiOmics`: MultiOmics software and scientific qualification.
- `rberrah/Omics2PK`: independent omics-to-PK research bridge and its standalone Pages site.
- `rberrah/stats`: biostatistics teaching application and its Pages deployment.

PMx must not reintroduce executable mirrors or scientific test suites owned by these standalone repositories.

## Main-branch policy

The importable repository ruleset is versioned at `.github/rulesets/main-protection.json`. It targets the default branch, requires a pull request, zero approving reviews while the repository has a single maintainer, resolved review threads, an up-to-date branch, and the five actual PMx check contexts: `build`, `scientific-js`, `scientific-r`, `scientific-pmetrics` and `mipd-consumer`. It also blocks force pushes and branch deletion. CODEOWNERS review can be enabled later when independent collaborators are available.

The repository ruleset is active as `Protect PMx main` (ID `25306480`) with no
bypass actor. The deploy workflow is also fail-closed: Pages only publishes an
artifact from a successful `PMx qualification` push run.

## Pull-request rules

Every PR must preserve the distinction between implemented, CI verified, publicly verified, author reviewed, independently reviewed and user tested. Automated checks never upgrade human-validation status.

Generated inventories and communication pages must be regenerated before merge. Current public licensing must be checked by `npm run audit:license`.

## Dependency policy

Dependabot proposes npm updates weekly and GitHub Actions updates monthly. PMx qualification runs `npm audit --audit-level=low`; any known low, moderate, high or critical advisory blocks qualification. The current lockfile has no accepted residual npm advisory.

# PMx Explain repository governance

Updated: 2026-10-17.

## Repository boundaries

- `rberrah/rberrah.github.io`: PMx Explain, academic portal and integration contracts.
- `rberrah/MIPD-Engine`: executable MIPD engine, PopPK library, R/Pmetrics runtime and Shiny deployment.
- `rberrah/MultiOmics`: MultiOmics software and scientific qualification.
- `rberrah/Omics2PK`: independent omics-to-PK research bridge and its standalone Pages site.
- `rberrah/stats`: biostatistics teaching application and its Pages deployment.

PMx must not reintroduce executable mirrors or scientific test suites owned by these standalone repositories.

## Main-branch policy

The intended GitHub rule for `main` is:

1. require a pull request before merge;
2. require the `PMx qualification` workflow to succeed;
3. require the branch to be up to date before merge;
4. require CODEOWNERS review when collaborators are added;
5. block force pushes and branch deletion.

The repository-level connector used for maintenance cannot change branch-protection settings. Until the GitHub rule is enabled in repository settings, the deploy workflow remains fail-closed: Pages only publishes an artifact from a successful `PMx qualification` run.

## Pull-request rules

Every PR must preserve the distinction between implemented, CI verified, publicly verified, author reviewed, independently reviewed and user tested. Automated checks never upgrade human-validation status.

Generated inventories and communication pages must be regenerated before merge. Current public licensing must be checked by `npm run audit:license`.

## Dependency policy

Dependabot proposes npm updates weekly and GitHub Actions updates monthly. PMx qualification runs `npm audit --audit-level=low`; any known low, moderate, high or critical advisory blocks qualification. The current lockfile has no accepted residual npm advisory.

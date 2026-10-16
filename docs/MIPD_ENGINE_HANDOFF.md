# MIPD Engine repository handoff

The scientific MIPD engine and its 46-model population-PK library are maintained in the standalone repository **rberrah/MIPD-Engine**.

## Consumer contract

PMx Explain remains the educational/browser consumer. It uses the unchanged public endpoint:

- https://tdmhub.shinyapps.io/MIPD_Engine/

The source used by PMx is pinned in `integration/mipd-engine-release.json` to an immutable commit SHA. PMx CI fails closed unless that exact SHA has a successful **push** run of `Standalone MIPD qualification` on the standalone repository.

The gate additionally checks:

- 46 models in the standalone catalogue;
- R 4.6.1;
- Pmetrics 3.2.6 qualification;
- deployment remains fixed to Shinyapps app ID `17776160`;
- arbitrary uploaded C++ remains disabled in the production deployment profile.

## Extraction stages

1. **Standalone baseline — complete.** Engine, model library, tests, Pmetrics fixtures and frozen ML artifacts were transferred and origin-hash checked.
2. **Independent qualification — complete for repository CI.** Model compilation, deterministic references, privacy cleanup, core scientific tests, runtime pinning and deployment manifest are tested in the standalone repository.
3. **PMx source pin — current stage.** PMx verifies an immutable standalone SHA while temporarily retaining its local mirror for rollback and cross-repository parity.
4. **Deployment cut-over — pending verification.** Deploy from the standalone repository to the existing Shinyapps app, then verify live session isolation, transfers and PMx integration.
5. **Mirror removal — only after stage 4.** Remove `tdm-engine/`, duplicated ML/model files and PMx-owned scientific CI in separate reversible PRs. Keep browser contracts and educational content in PMx.

Repository extraction does not upgrade the scientific evidence level of any model. Software regression, source reproduction, external validation and clinical-context validation remain separate model-specific statuses.

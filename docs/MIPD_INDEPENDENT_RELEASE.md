# MIPD Engine independent release handoff

`rberrah/MIPD-Engine` is the source repository for the R/Shiny engine, model
library, experimental ML artifacts and engine qualification. PMx Explain owns
the educational pages, builders and transfer interfaces.

PMx pins one immutable standalone commit in `integration/mipd-release.json`.
Its qualification checks that the authentic push workflow succeeded, compares
the 46 standalone model sources and catalogue with the public PMx snapshot, and
runs the bounded Lego importer audit against the standalone files.

The historical `tdm-engine/` directory remains a rollback mirror during the
transition. It must not be removed until the standalone deployment and public
tool transfers are verified. Updating the pin requires a successful standalone
qualification first; a branch name or moving tag is not accepted.


## Pinned runtime and deployment safety contract

The PMx consumer gate also checks the checked-out standalone source itself, not
only GitHub Actions status. The current contract requires:

- 46 model-library entries;
- R 4.6.1;
- Pmetrics 3.2.6 qualification;
- Shinyapps application ID `17776160` and app name `MIPD_Engine`;
- production deployment with arbitrary uploaded C++ disabled.

A future standalone release that intentionally changes any of these values must
update the PMx consumer contract in an explicit reviewable commit; it cannot be
adopted silently by moving a branch or tag.


## PMx scientific consumer transition

PMx CI no longer needs the repository-local mirror to execute the core R and
Pmetrics qualification. The `scientific-r`, `scientific-pmetrics` and full
official Pmetrics benchmark jobs fetch the immutable SHA from
`integration/mipd-release.json` and execute the corresponding tests and
benchmarks from that standalone checkout.

The local `tdm-engine/` directory is retained temporarily only as a development
fallback for scripts that have not yet been converted to the external engine
root. This phase deliberately proves external consumption before the mirror is
deleted in a later, separate PR.

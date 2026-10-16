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

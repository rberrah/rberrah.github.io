# MIPD Engine independent release handoff

`rberrah/MIPD-Engine` is the source repository for the R/Shiny engine, model
library, experimental ML artifacts and engine qualification. PMx Explain owns
the educational pages, builders and transfer interfaces.

PMx pins one immutable standalone commit in `integration/mipd-release.json`.
Its qualification checks that the authentic push workflow succeeded, compares
the 46 standalone model sources and catalogue with the public PMx snapshot, and
runs the bounded Lego importer audit against the standalone files.

The historical repository-local `tdm-engine/` mirror has been removed after
standalone deployment and PMx consumer qualification succeeded. Rollback is now
performed by reverting `integration/mipd-release.json` to a previously
qualified immutable SHA or by reverting the extraction commit; a mutable branch
or tag is never a release contract.


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

PMx no longer carries an executable R/Shiny mirror. `static/tdm/` is only a
browser-facing consumer snapshot used by educational pages and the model
translator. The `mipd-consumer` job compares that snapshot against the pinned
standalone catalogue and model sources. Engine safety, ML artifact hashes,
native regression and deployment code are tested from the standalone checkout.


## Local developer workflow

PMx no longer contains an executable MIPD engine. To run the native backend or
Pmetrics checks from a PMx checkout, first obtain the immutable standalone
engine and expose its root through `MIPD_ENGINE_DIR`.

Example:

```bash
git clone https://github.com/rberrah/MIPD-Engine.git ../MIPD-Engine
cd ../MIPD-Engine
git checkout <sha from PMx integration/mipd-release.json>
cd ../rberrah.github.io
export MIPD_ENGINE_DIR=../MIPD-Engine
npm run tdm:test-pmetrics
npm run test:pmetrics-official
```

On PowerShell use `$env:MIPD_ENGINE_DIR = "..\\MIPD-Engine"`. Native R engine
tests such as `tests/validate_library.R`, `tests/infection_test.R` and
`tests/teaching_lab_test.R` are executed from the standalone repository
itself. PMx owns only browser-facing snapshots, educational content and
cross-repository consumer contracts.

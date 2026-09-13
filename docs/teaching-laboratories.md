# Teaching laboratories (pilot)

Updated 2026-09-13. This Pages release adds absorption/infusion after the
distribution/accumulation and semi-log release (`d638246`). The separate
"Next particle" toolbar button is removed; canvas selection remains accessible
by pointer and keyboard. Shiny deployment remains independent.
This is an educational simulation, not a
drug-specific population model or a clinically validated dosing tool.

## Experiments

- **Distribution:** single IV bolus, two well-mixed compartments, linear central
  elimination. Inputs: dose, CL, Vc, Q and Vp. At Q = 0 the peripheral amount stays
  zero and the central profile reduces to the one-compartment model.
- **Accumulation:** finite repeated IV boluses in a linear one-compartment model,
  with a first-dose multiplier. The last planned administration is followed by
  washout. It approaches steady state; it does not initialize an exact SS state.
- **Oral absorption:** one dose, first-order depot emptying at ka. The
  absorbed flow splits into systemic input `F * ka * depot` and presystemic loss
  `(1-F) * ka * depot`. F aggregates bioavailability without resolving gut/liver
  mechanisms. Loss is not counted as systemic elimination or included in AUC.
- **IV infusion:** one fixed total dose delivered at `dose / duration`,
  then zero input. The bag is undelivered mass, separate from administered mass.
  The end-of-infusion control seeks to the exact stopping time without changing
  the prescribed duration. There is no instantaneous initial bolus.

Amounts and concentrations come from closed-form solutions, superposed over the
actual dose schedule. Particles are symbolic; their positions are not a transport
solver or an anatomical representation. The eliminated amount is
`administered - central - peripheral - oral depot - presystemic loss`;
`AUC(0,t) = eliminated / CL` for these models.
The displayed AUC is not automatically an AUC24. At a bolus time the numeric state
is post-dose; plotted curves include both pre-dose and post-dose states.

The reference is frozen until "Use this model as the new reference" is selected.
Both curves use the current model's display horizon and the same axes. The
current model is solid and the reference is dashed; tables and exports use these
names rather than A/B. Existing shared links retain their compatible schema.
Units throughout: mg, L, h, mg/L, mg.h/L.

The new labs also show analytical single-dose Cmax/Tmax, AUC(0,infinity), and
terminal half-life. For oral absorption this half-life uses `min(ka, CL/V)`,
including flip-flop absorption. At F = 0, Tmax is undefined. The peak and terminal
phase may lie beyond the plotted horizon; these are theoretical landmarks, not
sampled extrema. The oral convolution uses `expm1` and its equal-rate limit to
remain stable at ka = CL/V. Infusion curves include the exact stop time.

Oral particles start in the depot and either enter central or the separate loss
collector. Infusion particles wait in the bag and enter central at uniformly
spaced illustrative times. Both reuse the seeded central residence times and
continuous passageway geometry. Counts never replace the analytical results.

## Playback and particles

Intuition and Equations share the same simulation; the separate simulated-case
view has been removed. Each illustrative particle now retains its identity from
its administration to elimination; reservoir particles and pipe particles are
no longer separate populations. A seeded sequence of exponential residence times
uses the existing linear rates `(CL + Q)/Vc` and `Q/Vp`; central departures split
with probabilities `CL/(CL + Q)` and `Q/(CL + Q)`. Elimination is absorbing and
always occurs from central, never directly from peripheral.

These finite illustrative journeys use [D3's seeded random generators](https://d3js.org/d3-random),
not patient variability or a new clinical estimator. Their empirical counts can
differ from the continuous model. The displayed concentrations, AUC, readouts and
mass-balance bar **only** use the original analytical solver. Particle positions,
liquid tint, reservoir dimensions and passage durations are schematic, not a
molecular-dynamics simulation or added transit compartments. The IV dose remains
instantaneous in the numerical model. Journeys are generated in memory with a
fixed seed and a bounded visual population/work budget, including extreme rates.

A selectable highlighted particle has a short trail and a dose/location readout.
The concentration probe can be dragged with mouse/touch, moved with arrow keys,
or assigned to a compartment through its select input. It displays the exact
well-mixed concentration, not a local particle count; outside a compartment it
does not report a concentration. Repeated doses have optional cohort colors
(palette repeats after five doses) and a next-dose seek command limited to the
display horizon. The current curve is progressively emphasized with a live marker.

This original scene takes inspiration from PhET's
[direct manipulation and multiple representations](https://phet.colorado.edu/en/about),
without copying its artwork or claiming equivalent educational validation.

Playback defaults to 1 h/s, with slow speeds down to 0.1 h/s. An in-scene button
and the existing time toolbar control the same clock. Pause, reset and seeking
act on that clock;
returning to the same time reproduces the same scene. Background tabs and leaving
the whole simulation area pause playback. The observed area includes the time
controls so playback still works when only those controls are visible.

"Animate particles" is checked initially, alongside the initially unchecked
"Follow a particle" and "Probe" controls. Playback never starts automatically,
including with a reduced-motion preference. Unchecking animation preserves the
clock and numeric results without animated trajectories.

Linear and semi-log concentration plots share the same clock, horizon and frozen
reference. The logarithmic plot excludes zero/non-finite concentrations instead
of substituting a positive floor. Both plots are included in the PNG export.

## Teacher mode and privacy

The teacher can hide results, share a reproducible numeric scenario and export
CSV/PNG. Learners can reveal the results themselves; this is not an examination
lock. The causal prediction questions are optional and responses are not saved.

The share fragment uses a versioned allowlist of numeric parameters with bounds,
plus laboratory and boolean flags. Unknown, duplicate, non-finite or out-of-range
fields are rejected. It never serializes free text, C++ code, patient records or
credentials. Internal chapter/teacher entry links may select a built-in scenario
via query parameters. Sharing/exporting requires an explicit action.

Tool handoffs use a Svelte memory store and explicit confirmation at the
destination. Refreshing/closing the page loses that transfer; there is no
localStorage, sessionStorage, database or automatic file save for the scenario.
Existing language/theme preferences are independent of scientific data.

## What crosses each boundary

| Destination | Applied after confirmation | Deliberately not applied |
| --- | --- | --- |
| Lego | PK nodes/edges, numeric parameters, units, first dose, display horizon | Repeated-dose schedule; Lego's preview is single-dose |
| TDM | Securely regenerated PK plus every IV bolus, including loading dose, in a fresh Shiny session | Observed concentrations, fit, clinical target or validated population prior |
| Interactions | Model 1 as a validated Lego-marked PK, maintenance dose/interval, zero infusion | Finite dose count/loading dose; existing model 2 and interaction settings remain |
| General PD | Validated Lego-marked PK, h and mg/L, maintenance dose/interval, horizon | Finite dose count/loading dose; existing PD settings remain |

This table applies to distribution/accumulation. The two new labs currently
transfer only to Lego. Oral absorption exports two depot exits, `ka*F` and
`ka*(1-F)`, whose sum is ka; changing these independently in Lego no longer fixes
ka/F. Infusion exports a single zero-order input with the specified duration.
Direct TDM/DDI/PD transfer is disabled and rejected by the shared handoff helper
until the regimen/route contract is verified. No silent IV-bolus substitution.

DDI/PD apply their own repeated-dose workflows, not the laboratory's complete
history. The destination warning makes this difference explicit. The model's
illustrative OMEGA/SIGMA allow the Lego contract but are not clinical priors.

TDM uses the existing `bridge=lego` entry with a `teaching` payload. R validates
the bounded teaching parameters and rebuilds the structure itself; supplied C++
is not executed. A correlated server ACK confirms successful import. A legacy
client-only ACK is not accepted as confirmation of the complete dose transfer.
Both site and Shiny must include this version before publishing the new workflow.

## Reproducible checks

From the repository root:

```sh
npm run test:labs
Rscript tdm-engine/tests/teaching_lab_test.R
Rscript tdm-engine/tests/input_labs_test.R
Rscript tdm-engine/tests/safe_lego_test.R
npm run check
npm test
npm run build
npx playwright test tests/e2e/laboratories.spec.js
npx playwright test tests/e2e/lab-inputs.spec.js
```

`LABS_E2E_URL` optionally targets an already-running site. The browser checks
cover playback, reference changes, bounded input, teacher links, exports, confirmation
in the four tools, reduced motion, French/dark mode and desktop/mobile widths.
`scripts/smoke_lab_shiny.mjs` additionally tests the bridge against local Vite and
Shiny, using `LABS_E2E_URL` and `TDM_ENGINE_E2E_URL`.

The numeric R test compares ten parameter scenarios against both directly
exported and server-regenerated mrgsolve code, with absolute concentration and
amount tolerance 1e-5. It also covers Q = 0, very small transfer rates and loading
doses. The shared Lego number formatter now preserves 15 significant digits:
its previous six-decimal rounding could erase small rates.

These are numerical/software checks, not an assessment of learning outcomes.
Observation with students/teachers and expansion to oral absorption, variability
and sampling design remain in the roadmap. No institutional PDFs are used here.

Local verification on 2026-09-12: Svelte check (0 errors, 0 warnings), static
build, content checks, 25 browser tests, 20 mrgsolve curve comparisons, secure
Lego regressions and both Shiny smoke scripts passed. Desktop/mobile and dark
mode screenshots were inspected. A full screen-reader audit is still pending.

Particle animation revision on 2026-09-13: Svelte check (0 errors, 0 warnings),
static build, content checks, ten numeric scenarios and all eight laboratory
browser tests passed. Particle unit tests cover stable identities, dose births,
allowed transitions, continuity at boundaries, deterministic seeking, no exchange
at Q = 0, bounded work and mobile geometry, including extreme parameter ranges.
Pixel checks verify movement on both transfer lanes and the elimination outlet,
immobility on pause, and reproducible seeking. Browser interactions cover the
probe's exact central/peripheral readings and drag, keyboard controls, particle
selection, slow playback and next-dose cohorts. Reduced motion and playback with
only the time controls visible are covered. Captures at 320/390/768/1440 px and
French/dark mode were inspected. The scientific solver and Shiny were unchanged;
the R integration tests were not rerun. Full assistive-technology and real-device
touch audits remain pending.

Defaults/semi-log revision on 2026-09-13: check (0 errors/warnings), build,
numeric/particle tests and nine browser tests passed. Checks include both
axes, zero concentrations at extreme elimination rates, synchronized cursors,
initial control states, no autoplay and 320/390/1440 px screenshots.
These nine browser tests also passed against the public Pages URL after deployment.

Technical references: [D3 logarithmic scales](https://d3js.org/d3-scale/log)
require a strictly positive domain; zero values are excluded. The independent
R checks use [mrgsolve events](https://mrgsolve.org/docs/reference/ev.html), with
infusion rate equal to amount/duration, and a separate ODE formulation.

Input laboratories, local verification on 2026-09-13: 21 numerical scenarios
passed (10 existing and 11 new), plus particle identity/continuity/bounds tests.
The 11 new cases include F=0/1, ka=CL/V and near equality, slow/fast absorption,
short/long infusion and an infusion stop beyond the selected horizon. Both the
independent ODE and the actual Lego-regenerated model match each new case within
1e-6. The 20 existing mrgsolve export/server comparisons were rerun and passed.
Svelte check (0 errors/warnings), build, content tests and all 14 browser tests
passed. Screenshots at 320/390/768/1440 px and French/dark mobile were inspected.
Pixel tests verify input-pipe movement, reproducible seeking, pause, and no input
after the infusion stops. Publication of the two new labs was requested after
this local review; it does not include a Shiny deployment.

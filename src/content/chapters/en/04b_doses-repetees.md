---
id: "doses-repetees"
slug: "doses-repetees"
title: "Repeated doses and steady state"
description: "Accumulation, steady-state concentration (Css) and the loading dose."
summary: "What happens when doses are repeated: accumulation, plateau and interval."
track: "core"
order: 4.5
duration: "12 min"
level: "beginner"
tags: ["steady-state", "accumulation", "dosing"]
slides: ["s12"]
quiz:
  - prompt: "The average steady-state concentration is..."
    options:
      - "Dose / (CL · τ)"
      - "Dose · CL · τ"
      - "CL / Dose"
    correct: 0
  - prompt: "The time to reach steady state depends mostly on..."
    options:
      - "the half-life (≈ 4 to 5 t½)"
      - "the administered dose"
      - "the tablet colour"
    correct: 0
  - prompt: "A loading dose is used to..."
    options:
      - "reach the therapeutic zone faster"
      - "lower the final Css"
      - "change the half-life"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s12" -->
A single dose is rarely enough: we **repeat** administration to keep the concentration in the therapeutic window.

But repeating is not neutral: the drug **accumulates** as long as we redose before complete elimination.
<!-- /step -->

<!-- step:title="Intuition" slides="s12" viz="MultiDose" -->
Back to the tank image: it is filled at once with each dose and empties in between.

If you refill **before** it is empty, the average level **rises** — until what enters per interval equals what leaves. That is **steady state** (the plateau).

**Key point —** vary the interval $\tau$: the shorter it is relative to the half-life, the stronger the accumulation.
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s12" viz="MultiDose" -->
The **average steady-state concentration** depends only on clearance and interval:

$$ C_{ss,\text{avg}} = \frac{\text{Dose}}{CL \cdot \tau} $$

The **accumulation ratio** (IV bolus) measures the stacking:

$$ R_{ac} = \frac{1}{1 - e^{-k_e \tau}} $$

**Math —** you reach ~90% of steady state in **~4 half-lives**, whatever the dose. The dose does not set the *speed* of reaching steady state — only its *level*.
<!-- /step -->

<!-- step:title="Worked example" slides="s12" viz="MultiDose" -->
Halve $\tau$: the average Css doubles and accumulation climbs. Lower the clearance (renal impairment): same shape but a higher Css — a toxicity risk.

Tick **loading dose**: a stronger first dose reaches the window immediately, without changing the final plateau.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s12" -->
Do not confuse the **level** of steady state with the **time** to reach it.

**Pitfall —** raising the dose lifts Css but does **not** speed up reaching steady state (still ~5 t½). To reach the window faster: a **loading dose**, not a larger maintenance dose.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Redosing before complete elimination → accumulation up to a plateau (Css).
- $C_{ss,\text{avg}} = \text{Dose}/(CL\cdot\tau)$: clearance and interval set the level.
- Time to steady state ≈ 4 to 5 half-lives, independent of the dose.
- The loading dose speeds entry into the window; maintenance keeps Css.
<!-- /step -->

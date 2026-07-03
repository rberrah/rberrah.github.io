---
id: "perfusion"
slug: "perfusion"
title: "IV infusion and zero-order kinetics"
description: "A constant-rate (zero-order) input building a plateau: Css = R0/CL."
summary: "Intravenous infusion: rise to steady state, Css and decay after stopping."
track: "core"
order: 4.7
duration: "11 min"
level: "beginner"
tags: ["infusion", "zero-order", "steady-state"]
slides: ["s12"]
quiz:
  - prompt: "A zero-order input means the input rate is..."
    options:
      - "constant, independent of concentration"
      - "proportional to concentration"
      - "zero"
    correct: 0
  - prompt: "The steady-state concentration of an infusion is..."
    options:
      - "R0 / CL"
      - "R0 · CL"
      - "R0 / V"
    correct: 0
  - prompt: "Doubling the infusion rate R0..."
    options:
      - "doubles Css without changing the time to reach it"
      - "reaches Css twice as fast"
      - "does not change Css"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s12" -->
Many hospital drugs are given by **intravenous infusion**: a **constant** rate over several hours.

This is the model case of **zero-order input**: unlike oral absorption (proportional to what remains), the input rate does not depend on concentration.
<!-- /step -->

<!-- step:title="Intuition" slides="s12" viz="Infusion" -->
Back to the tank: an inlet tap runs at a **fixed rate** (zero order), while the outlet leak is **proportional to the level** (first order, the clearance).

At first the inlet wins and the level rises. Then the outlet grows with the level… until **inflow = outflow**: the plateau, the **steady state** (Css).

**Key point —** vary the rate R₀: it sets the **height** of the plateau, not the speed of reaching it.
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s12" viz="Infusion" -->
During the infusion, the concentration rises as:

$$ C(t) = \frac{R_0}{CL}\left(1 - e^{-\frac{CL}{V}\,t}\right) $$

and tends toward the plateau:

$$ C_{ss} = \frac{R_0}{CL} $$

**Math —** Css depends only on the **rate** and the **clearance**. You reach ~90% of Css in **~4 half-lives**; after stopping, the decay is exponential (first-order elimination).
<!-- /step -->

<!-- step:title="Worked example" slides="s12" viz="Infusion" -->
Double R₀: Css doubles, but the time to reach it is unchanged (it depends on the half-life).

Lower the clearance (renal impairment): at the same rate, Css rises — an accumulation risk. A too-short infusion stops **before** the plateau: you never reach the target Css.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s12" -->
Do not try to reach Css "faster" by raising the rate.

**Pitfall —** raising R₀ lifts the plateau, but the **time** to steady state stays ~5 half-lives. To reach the window fast: a **loading dose** (bolus) at the start of the infusion, not a higher maintenance rate.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Infusion = zero-order input (constant rate) + first-order elimination.
- $C_{ss} = R_0/CL$: rate and clearance set the plateau.
- ~4 to 5 half-lives to reach (or leave) steady state, independent of the rate.
- Loading dose = reach the window fast; infusion = maintain it.
<!-- /step -->

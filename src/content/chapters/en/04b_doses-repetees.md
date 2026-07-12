---
id: "doses-repetees"
slug: "doses-repetees"
title: "Repeated doses and steady state"
description: "Accumulation, steady-state concentration (Css), the time to reach it and the loading dose — for repeated doses and continuous infusion alike."
summary: "What happens when doses are repeated: accumulation, plateau, interval, loading dose — and the continuous-infusion case."
track: "core"
order: 4.5
duration: "14 min"
level: "beginner"
tags: ["steady-state", "css", "accumulation", "loading-dose", "dosing"]
glossary: ["CL", "t½", "ke"]
slides: ["s12"]
quiz:
  - prompt: "The average steady-state concentration equals..."
    options:
      - "Dose / (CL · τ)"
      - "Dose · CL · τ"
      - "CL / Dose"
    correct: 0
  - prompt: "The time to reach steady state depends mainly on..."
    options:
      - "the half-life (≈ 4 to 5 t½)"
      - "the dose given"
      - "the infusion rate"
    correct: 0
  - prompt: "During a continuous infusion, the steady-state concentration equals..."
    options:
      - "the rate divided by clearance (Css = R₀ / CL)"
      - "the rate times the volume"
      - "the dose divided by the half-life"
    correct: 0
  - prompt: "A loading dose is used to..."
    options:
      - "reach the therapeutic window faster, without changing the final plateau"
      - "lower the final Css"
      - "change the half-life"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s12" -->
A single dose is rarely enough: we **repeat** administration (or infuse continuously) to keep the concentration inside the therapeutic window.

But repeating is not innocent: as long as we re-dose **before** elimination is complete, the drug **accumulates** — up to a plateau. Understanding what sets the **level** of that plateau, and the **time** to reach it, is the foundation of all dosing.
<!-- /step -->

<!-- step:title="Intuition" slides="s12" viz="MultiDose" -->
Picture the tank again: each dose fills it at once, and it drains between doses.

If we re-dose **before** it is empty, the average level **rises**. But the higher the concentration, the faster elimination becomes (it is proportional to concentration) — until **what goes out equals what comes in**. The level stabilises: this is **steady state**.

:::key
Vary the interval $\tau$: the shorter it is relative to the half-life, the stronger the accumulation. And the plateau is reached after a few half-lives, **whatever** the dosing rate.
:::
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s12" viz="MultiDose" -->
The **average steady-state concentration** depends only on clearance and dosing rate:

$$ C_{ss,\text{avg}} = \frac{F\cdot\text{Dose}}{CL \cdot \tau} \qquad\text{and, for a continuous infusion:}\qquad C_{ss} = \frac{R_0}{CL} $$

The **accumulation ratio** (IV bolus) measures the stacking:

$$ R_{ac} = \frac{1}{1 - e^{-k_e \tau}} $$

Finally, the **loading dose** fills the tank in one go:

$$ \text{Loading dose} = C_{ss} \cdot V $$

:::howto
**The sink metaphor.** The tap (dosing rate) fills; the drain (clearance) empties. The steady-state **level** depends on the tap/drain ratio — not on how fast you open the tap. The **time** to fill depends only on the size of the drain (the half-life).

**On the maths.** You reach ~90% of steady state in **~4 half-lives**, whatever the dose. Doubling the dose **doubles** Css without changing the time to get there: the dose sets the *level*, not the *speed*.
:::
<!-- /step -->

<!-- step:title="Worked example" slides="s12" viz="MultiDose" -->
Halve $\tau$: average Css doubles and accumulation climbs. Lower the clearance (renal impairment): same pattern, but a higher Css — a toxicity risk.

**With an infusion.** We target a Css of 10 mg/L with a clearance CL = 2 L/h. The required rate is therefore:

$$ R_0 = C_{ss} \cdot CL = 10 \times 2 = 20 \text{ mg/h} $$

If the half-life is 12 h, steady state is only reached after ~4–5 t½, i.e. **2 to 3 days**. Hence the value of a **loading dose** if we want to be in the window right away: tick the option and watch — the final plateau is unchanged, only the entry is accelerated.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s12" -->
Do not confuse the **level** of steady state with the **time** to reach it.

:::pitfall
Raising the dose lifts Css but does **not** speed up the approach to steady state (still ~4–5 t½). To enter the window faster, use a **loading dose**, not a bigger maintenance dose.

A second trap: **superposition** (Css ∝ dose) only holds under **linear** kinetics. Under saturation (Michaelis-Menten, TMDD), accumulation becomes unpredictable and a modest dose increase can send concentrations soaring.
:::
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Re-dosing before elimination is complete → accumulation up to a plateau: **steady state** (in = out).
- Level: $C_{ss,\text{avg}} = F\cdot\text{Dose}/(CL\cdot\tau)$; for an infusion $C_{ss} = R_0/CL$. Clearance and dosing rate set the plateau.
- Time: ≈ **4 to 5 half-lives**, independent of dose and rate.
- **Loading dose** = $C_{ss}\cdot V$: it speeds up entry into the window without changing the final plateau.
- Superposition (Css ∝ dose) assumes **linear** kinetics; under saturation, everything breaks down.
<!-- /step -->

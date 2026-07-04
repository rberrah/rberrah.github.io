---
id: "etat-equilibre"
slug: "etat-equilibre"
title: "Steady state"
description: "When input equals output: Css, time to reach it, accumulation and the loading dose."
summary: "The steady-state principle: Css = dose rate/CL, time ≈ 4–5 half-lives, accumulation and superposition."
track: "core"
order: 4.6
duration: "12 min"
level: "intermediate"
tags: ["steady-state", "css", "accumulation", "loading-dose"]
prerequisites: ["doses-repetees", "perfusion"]
glossary: ["CL", "t½", "ke", "AUC"]
slides: []
quiz:
  - prompt: "At steady state, the average concentration Css depends on..."
    options:
      - "the dose rate and the clearance (Css = dose rate / CL)"
      - "the volume only"
      - "the drug colour"
    correct: 0
  - prompt: "The time to reach steady state depends mainly on..."
    options:
      - "the half-life (~4–5 t½), not the dose or rate"
      - "the administered dose"
      - "the volume of distribution alone"
    correct: 0
  - prompt: "A loading dose serves to..."
    options:
      - "reach the target steady-state level immediately"
      - "change the clearance"
      - "lower the Css"
    correct: 0
---

<!-- step:title="Why this chapter" -->
In chronic treatment, the concentration does not rise forever: it settles at a **plateau**, the **steady state**. That is where we want to be — in the therapeutic window.

Understanding what sets the plateau's **level** and the **time** to reach it is the basis of all dosing.
<!-- /step -->

<!-- step:title="Intuition" viz="MultiDose" -->
At each dose, some of the previous one remains: the drug **accumulates**. But the higher the concentration, the more elimination (proportional to concentration) rises — until **output equals input**. The level stabilises.

This plateau is reached after a few half-lives, **whatever** the dose rate.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="MultiDose" -->
The steady-state level is set by the **dose rate** and the **clearance**:

$$ C_{ss,avg} = \frac{\text{Dose}/\tau}{CL} = \frac{F\cdot\text{Dose}}{CL\cdot\tau} \qquad (\text{infusion: } C_{ss} = R_0/CL) $$

The **time** to reach it depends only on the half-life (≈ **4–5 t½**), not the dose. The **accumulation** is:

$$ R_{ac} = \frac{1}{1 - e^{-k_e\tau}} $$

**How to read it — the sink metaphor.** The tap (dose rate) fills; the drain (clearance) empties. The equilibrium **level** depends on the tap/drain ratio — not on how fast you open the tap. The **fill time** depends on the drain size (the half-life).

**On the maths side.** Doubling the dose **doubles** Css without changing the time to reach it. A **loading dose** = $C_{ss}\cdot V$ fills the sink at once; maintenance keeps the level.
<!-- /step -->

<!-- step:title="Worked example" viz="Infusion" -->
We target a Css of 10 mg/L, CL = 2 L/h → we need a rate $R_0 = C_{ss}\cdot CL = 20$ mg/h (infusion) or the equivalent in repeated doses.

If the half-life is 12 h, steady state is only reached after ~2–3 days: hence a **loading dose** if we want to be effective immediately.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Raising the dose does not speed up steady state.

**Pitfall —** a classic error: believing a higher dose reaches steady state faster. It reaches a **higher plateau**, at the **same** pace (~4–5 t½). And the **superposition** principle (Css ∝ dose) holds only in **linear** kinetics: under saturation (Michaelis-Menten, TMDD), accumulation becomes unpredictable.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Steady state = input equals output; the concentration stabilises.
- Level: Css = (dose rate)/CL; Css ∝ dose (linear kinetics).
- Time: ~4–5 half-lives, independent of the dose and rate.
- Loading dose = Css·V to reach the plateau at once; superposition only if linear.
<!-- /step -->

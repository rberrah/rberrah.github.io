---
id: "clairance-volume-demi-vie"
slug: "clairance-volume-demi-vie"
title: "Clearance, volume and half-life"
description: "The one-compartment model: CL as a flow, V as a space, half-life as their ratio."
summary: "A visual introduction to the core parameters behind most PK models."
track: "core"
order: 3
duration: "16 min"
level: "beginner"
tags: ["model", "ode", "cl", "v", "half-life"]
slides: ["s03", "s04", "s05", "s06", "s08", "s09", "s12", "s67", "s74"]
quiz:
  - prompt: "After an IV bolus, the initial concentration is..."
    options:
      - "Dose times CL"
      - "Dose divided by V"
      - "Dose divided by CL"
    correct: 1
  - prompt: "Half-life depends on..."
    options:
      - "clearance CL alone"
      - "the distribution volume V alone"
      - "both V and CL together"
    correct: 2
  - prompt: "A larger V at the same dose usually gives..."
    options:
      - "a lower initial concentration"
      - "a higher initial concentration"
      - "no change in concentration"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s67" viz="IVBolus" -->
Clearance, volume and half-life are the first three parameters you meet in PK. They are also the easiest to confuse.

The one-compartment model is useful because it separates three ideas:

- how **diluted** the dose becomes;
- how fast the drug **leaves** the body;
- how long concentration takes to **halve**.
<!-- /step -->

<!-- step:title="Intuition" slides="s12" viz="BucketSim" -->
The course gives a vivid hydraulic image: **the drug is water in a tank**.

- The **tank width** is the **volume of distribution V**: for the same amount, a wider tank gives a lower level.
- The **liquid level** is the **concentration C(t)**.
- The **tap opening** is the **clearance CL**: the wider it is, the faster the tank empties.

**Key point —** widening the tank (larger V) and opening the tap (larger CL) do different things: V lowers the starting level, CL speeds up emptying. Half-life combines both.
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s12" viz="IVBolus" -->
For an IV bolus, the initial concentration is:

$$ C_0 = \frac{\text{Dose}}{V} $$

and the amount decays as:

$$ \frac{dA}{dt} = -\frac{CL}{V}\,A $$

The ratio $CL/V$ is the elimination rate constant $k$.

**Math —** volume dilutes (sets $C_0$); clearance is an **epuration capacity** (a flow, in L/h). Their ratio, and only that, sets the decay speed.

**In the clinic —** physiologically, clearance is an **extraction capacity**: $CL = Q_{organ}\cdot E$ (organ blood flow × extraction ratio $E$). It adds up across routes: $CL_{tot} = CL_r$ (renal) $+\ CL_{nr}$ (hepatic and other). Renal clearance is approached via creatinine clearance (GFR ≈ 120 mL/min).
<!-- /step -->

<!-- step:title="Worked example" viz="IVBolus" -->
Patients A and B each receive 100 mg.

If A has $V = 10\ \text{L}$, then $C_0 = 10\ \text{mg/L}$. If B has $V = 20\ \text{L}$, then $C_0 = 5\ \text{mg/L}$.

Same dose, different apparent space, different starting concentration. Slide V in the figure: the whole curve moves up or down without changing its slope.
<!-- /step -->

<!-- step:title="Two compartments" slides="s08" viz="10_PK2C" -->
Many drugs do not distribute instantly: they first enter a **central compartment** (blood, well-perfused organs), then more slowly a **peripheral compartment** (tissues).

On a **semi-logarithmic** curve this gives **two slopes**:

- the **α phase** (fast): distribution into tissues;
- the **β phase** (slow): true elimination.

**Key point —** hence several volumes: $V_1$ (central), $V_{ss}$ (steady state) and $V_{area}$ (β phase). The terminal half-life depends on the β phase, not on the initial distribution.

Compare with the one-compartment reference: ignoring distribution over-estimates the early concentrations.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s09" viz="IVBolus" -->
Half-life is not a magic property replacing clearance and volume:

$$ t_{1/2} = \frac{0.693\, V}{CL} $$

**Pitfall —** a longer half-life can come from a larger volume, a lower clearance, or both — different biological stories. Always ask: **which parameter changed?**
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Volume controls dilution.
- Clearance controls epuration capacity.
- Half-life is **derived** from volume and clearance.
- A simple compartment model is first a teaching model, then a prediction model if it fits the data.
<!-- /step -->

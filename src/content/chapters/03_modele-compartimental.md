---
id: "clairance-volume-demi-vie"
slug: "clairance-volume-demi-vie"
title: "Clearance, volume, and half-life"
description: "The one-compartment model: CL as a flow, V as a space, and t½ as their ratio."
order: 3
tags: ["model", "ode", "cl", "v", "half-life"]
slides: []
quiz:
  - prompt: "After an IV bolus, the initial concentration C₀ is given by…"
    options:
      - "Dose × CL"
      - "Dose / V"
      - "Dose / CL"
    correct: 1
  - prompt: "Half-life depends on…"
    options:
      - "clearance only"
      - "volume only"
      - "both volume and clearance: t½ = ln2·V/CL"
    correct: 2
  - prompt: "Total drug exposure (AUC) after an IV dose equals…"
    options:
      - "Dose / V"
      - "Dose / CL"
      - "Dose × k"
    correct: 1
---

<!-- step:title="One compartment: the tank analogy" viz="IVBolus" -->
The simplest useful PK model treats the body as a single well-mixed **tank**.

- The **volume** of the tank is $V$ (in $\text{L}$): it sets how concentrated a given amount becomes.
- A **tap** drains the tank at a rate proportional to how full it is. The size of that tap is the **clearance** $CL$ (in $\text{L/h}$).

For an intravenous bolus, the entire dose lands in the tank instantly. The amount $A$ then drains by **first-order** kinetics:

$$ \frac{dA}{dt} = -\,\frac{CL}{V}\,A $$

Use the explorer to build intuition before the algebra: change $V$ and $CL$ and watch which feature of the curve moves.
<!-- /step -->

<!-- step:title="Volume sets the starting height" viz="IVBolus" -->
Right after an IV bolus, concentration is the dose diluted into the volume:

$$ C_0 = \frac{\text{Dose}}{V} \quad [\text{mg/L}] $$

A **larger** $V$ means the same dose is spread thinner, so $C_0$ is **lower**. Volume is an *apparent* space — it can exceed total body water for drugs that bind tissues, which is why a 30 L value is unremarkable for a 70 kg adult.

Pitfall: $V$ rescales the whole curve vertically but, on its own, does **not** change how fast the curve falls.
<!-- /step -->

<!-- step:title="Clearance sets the emptying speed" viz="IVBolus" -->
**Clearance** is the volume of plasma fully cleared of drug per unit time. It is the body's drug-removal *capacity*, set mostly by the liver and kidneys.

Two consequences worth separating:

- Clearance governs the **steady-state exposure** and total **AUC**:
  $$ \mathrm{AUC} = \frac{\text{Dose}}{CL} \quad [\text{mg}\cdot\text{h}/\text{L}] $$
- Clearance does **not** act alone on speed — it works through the rate constant $k$.

So if you want to compare *total exposure* between patients, look at $CL$, not at the peak.
<!-- /step -->

<!-- step:title="Half-life is a ratio, not a fundamental constant" -->
The elimination rate constant combines both parameters:

$$ k = \frac{CL}{V} \quad [\text{1/h}], \qquad C(t) = \frac{\text{Dose}}{V}\,e^{-k\,t} $$

and the **half-life** — time for concentration to halve — follows:

$$ t_{1/2} = \frac{\ln 2}{k} = \frac{\ln 2 \cdot V}{CL} \approx \frac{0.693\,V}{CL} $$

This is the most misused quantity in PK. Half-life is **derived** from $V$ and $CL$; it is not a primary property of the drug. A longer half-life can come from *higher volume* or *lower clearance* — two very different physiological stories with different dosing implications. Switch the explorer to the semi-log view: first-order decay becomes a straight line whose slope is $-k$.
<!-- /step -->

<!-- step:title="Adding the oral route: Ka and Tlag" viz="OralAbsorption" -->
Most drugs are taken by mouth, so the dose must first **absorb** from the gut. A first-order absorption step with rate $K_a$ (in $\text{1/h}$) and an optional lag time $T_{lag}$ gives the **Bateman** function:

$$ C(t) = \frac{\text{Dose}}{V}\cdot\frac{K_a}{K_a-k}\left(e^{-k(t-T_{lag})}-e^{-K_a(t-T_{lag})}\right) $$

Now the curve **rises** to a peak (**Cmax** at **Tmax**) and then falls. Faster $K_a$ → earlier, higher peak; $T_{lag}$ simply shifts the whole curve right.

Watch for **flip-flop**: when $K_a < k$, absorption becomes rate-limiting and the terminal slope reflects $K_a$ rather than elimination — a trap when estimating half-life from oral data.
<!-- /step -->

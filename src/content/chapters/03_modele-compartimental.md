---
id: "clairance-volume-demi-vie"
slug: "clairance-volume-demi-vie"
title: "Clearance, volume, and half-life"
description: "The one-compartment model: CL as a flow, V as a space, and half-life as their ratio."
summary: "A visual introduction to the core parameters behind most PK models."
track: "core"
order: 3
duration: "16 min"
level: "beginner"
tags: ["model", "ode", "cl", "v", "half-life"]
slides: ["s10", "s11", "s12", "s25"]
quiz:
  - prompt: "After an IV bolus, the initial concentration is..."
    options:
      - "Dose times CL"
      - "Dose divided by V"
      - "Dose divided by CL"
    correct: 1
  - prompt: "Half-life depends on..."
    options:
      - "CL only"
      - "V only"
      - "both V and CL"
    correct: 2
  - prompt: "A larger V with the same dose usually gives..."
    options:
      - "a lower initial concentration"
      - "a higher initial concentration"
      - "no change in concentration"
    correct: 0
---

<!-- step:title="Why this matters" slides="s10" viz="IVBolus" -->
Clearance, volume, and half-life are the first three parameters most students meet in PK. They are also easy to confuse.

The one-compartment model is useful because it separates three ideas:

- how diluted the dose becomes;
- how fast drug leaves the body;
- how long it takes concentration to fall by half.
<!-- /step -->

<!-- step:title="Intuition" slides="s10,s11" viz="IVBolus" -->
Picture one well-mixed room full of blocks.

The **volume** is the size of the room. The **clearance** is the speed of the cleanup team. The **half-life** is the time until half the visible blocks are gone.

Changing the room size and changing the cleanup speed do different things to the curve.
<!-- /step -->

<!-- step:title="Building-block metaphor" viz="BuildingBlocksPKPD" -->
Give the same box of blocks to two rooms.

In a small room, the blocks look concentrated. In a large room, the same number of blocks look spread out. That is volume.

Now keep the room fixed. If the cleanup team removes blocks faster, the room empties faster. That is clearance.
<!-- /step -->

<!-- step:title="Minimal math" slides="s12" viz="IVBolus" -->
For an IV bolus:

$$ C_0 = \frac{\text{Dose}}{V} $$

and:

$$ \frac{dA}{dt} = -\frac{CL}{V}A $$

The ratio $CL/V$ is the elimination rate constant:

$$ k = \frac{CL}{V} $$
<!-- /step -->

<!-- step:title="Worked example" viz="IVBolus" -->
Patient A and B both receive 100 mg.

If patient A has $V = 10\ \text{L}$, then $C_0 = 10\ \text{mg/L}$. If patient B has $V = 20\ \text{L}$, then $C_0 = 5\ \text{mg/L}$.

Same dose, different apparent space, different starting concentration.
<!-- /step -->

<!-- step:title="Common trap" slides="s25" viz="IVBolus" -->
Half-life is not a magic property that replaces clearance and volume.

$$ t_{1/2} = \frac{0.693 V}{CL} $$

A longer half-life can mean a larger volume, a lower clearance, or both. Those are different biological stories. Always ask: **which parameter changed?**
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Volume controls dilution.
- Clearance controls removal capacity.
- Half-life is derived from volume and clearance.
- A simple compartment model is a teaching model first, then a prediction model if it fits the data.
<!-- /step -->

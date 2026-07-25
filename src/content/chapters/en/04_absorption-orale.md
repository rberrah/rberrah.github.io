---
id: "absorption-orale"
slug: "absorption-orale"
title: "Oral route, Ka and lag time"
description: "Why an oral curve rises before it falls."
summary: "An accessible account of absorption rate, lag time, Cmax and Tmax."
track: "core"
order: 4
duration: "12 min"
level: "beginner"
tags: ["oral", "absorption", "ka", "tlag"]
slides: ["s07"]
quiz:
  - prompt: "Ka mainly controls..."
    options:
      - "how fast the drug enters the central compartment"
      - "how fast the drug leaves the central compartment"
      - "the fraction of the dose that reaches the systemic circulation"
    correct: 0
  - prompt: "The lag time Tlag represents..."
    options:
      - "a delay before absorption begins"
      - "the time needed to reach the peak concentration"
      - "the total duration of the absorption phase"
    correct: 0
  - prompt: "Flip-flop kinetics can occur when..."
    options:
      - "absorption is slower than elimination"
      - "elimination is slower than absorption"
      - "distribution is slower than elimination"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s07" viz="OralAbsorption" -->
Most drugs are not injected straight into plasma: they are swallowed, absorbed, distributed and eliminated.

That is why oral concentration-time curves **rise**, reach a peak, then fall. The rising part is not noise — it is absorption.

Absorption depends not only on the molecule but also on the **formulation** (the dosage form). The same active ingredient as an immediate-release tablet, a capsule or an extended-release form enters the blood at very different speeds. That is why the absorption rate is a parameter to **estimate**, not a universal constant of the molecule.
<!-- /step -->

<!-- step:title="Intuition" slides="s07" viz="OralAbsorption" -->
Let us start with the simplest model: a **single** absorption constant.

With an oral dose, the blocks first wait outside the main room. The absorption constant $K_a$ sets how fast blocks enter the central compartment: the larger $K_a$, the faster the entry.

**Key point —** the observed curve is a **competition** between input (absorption, driven by $K_a$) and output (elimination, driven by $k = CL/V$). The peak appears when the two flows balance.
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s07" viz="OralAbsorption" -->
The simplest first-order oral model (Bateman curve), **without lag**:

$$ C(t) = \frac{\text{Dose}}{V}\,\frac{K_a}{K_a-k}\left(e^{-kt}-e^{-K_a t}\right) $$

No need to memorize the whole expression: read it as input by absorption ($K_a$) opposed to output by elimination ($k = CL/V$). The two exponentials subtract: early on, absorption dominates (the curve rises), then elimination takes over (the curve falls).

**Math —** increase $K_a$: the peak arrives earlier and higher. It is the only parameter that governs the **speed** of the rise in this basic model.
<!-- /step -->

<!-- step:title="Lag time" slides="s07" viz="OralAbsorption" -->
Sometimes nothing enters the blood for a while after intake (disintegration time, gastric emptying). We then add a **lag time** $T_{lag}$, which simply shifts the start of absorption:

$$ C(t) = \frac{\text{Dose}}{V}\,\frac{K_a}{K_a-k}\left(e^{-k(t-T_{lag})}-e^{-K_a(t-T_{lag})}\right) \quad \text{for } t \geq T_{lag} $$

**Note —** the lag time is above all a **mathematical device**, with little direct physiological meaning, but **very useful** to describe an absorption delay without complicating the model. It is a handy patch: it captures the observed delay without claiming to explain *why* it exists.

In the explorer: increase $T_{lag}$ and the whole start of the curve shifts to the right, without changing the peak height.
<!-- /step -->

<!-- step:title="Transit compartments" slides="s07" viz="OralAbsorption" -->
The $T_{lag}$ shifts the start but keeps an abrupt rise. When absorption is **gradual** (dissolution, gastric emptying), we can do better — and more physiologically — with transit compartments.

A single $K_a$ assumes an immediate rise, which fits poorly to an entry spread out over time.

**Transit compartments** replace the single input with a **chain** of $n$ compartments crossed at rate $k_{tr}$. The drug takes a **mean transit time** $\text{MTT} = n / k_{tr}$ to reach the central compartment.

$$ \frac{dT_1}{dt} = -k_{tr}\,T_1 \qquad \frac{dT_i}{dt} = k_{tr}\,(T_{i-1}-T_i) \qquad \frac{dA}{dt} = k_{tr}\,T_n - k\,A $$

**Key point —** tick "compare with transit compartments": as $n$ grows, the rise becomes **rounder and more delayed** — a flexible alternative to a plain $T_{lag}$.
<!-- /step -->

<!-- step:title="Worked example" slides="s07" viz="OralAbsorption" -->
In the explorer, increase $K_a$.

The peak usually arrives earlier and higher, because blocks enter quickly before cleanup removes many. A larger $T_{lag}$ does not change the peak height but shifts the start of the rise.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s07" -->
Do not estimate the elimination half-life blindly from the oral terminal slope.

**Pitfall —** if absorption is slower than elimination, the last part of the curve reflects **absorption**, not elimination: this is **flip-flop** kinetics. The terminal slope then misleads about the true half-life.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- An oral profile combines absorption and elimination.
- $K_a$ controls the entry speed.
- $T_{lag}$ shifts the start of absorption; transit compartments give a smoother, delayed rise.
- Cmax and Tmax are summaries, not model parameters in themselves.
<!-- /step -->

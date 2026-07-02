---
id: "absorption-orale"
slug: "absorption-orale"
title: "Oral route, Ka and lag time"
description: "Why oral curves rise before they fall."
summary: "A student-friendly explanation of absorption rate, lag time, Cmax, and Tmax."
track: "core"
order: 4
duration: "12 min"
level: "beginner"
tags: ["oral", "absorption", "ka", "tlag"]
slides: ["s13", "s14", "s15", "s16", "s17", "s18", "s19", "s20"]
quiz:
  - prompt: "Ka mainly controls..."
    options:
      - "how fast drug enters the central compartment"
      - "how many organs PBPK contains"
      - "the assay calibration curve"
    correct: 0
  - prompt: "Tlag represents..."
    options:
      - "a delay before absorption begins"
      - "the terminal half-life"
      - "the maximum effect"
    correct: 0
  - prompt: "Flip-flop kinetics can occur when..."
    options:
      - "absorption is slower than elimination"
      - "clearance is zero"
      - "volume is exactly 1 L"
    correct: 0
---

<!-- step:title="Why this matters" slides="s13,s14,s15,s16" viz="OralAbsorption" -->
Most medicines are not injected directly into plasma. They are swallowed, absorbed, distributed, and eliminated.

That is why oral concentration-time curves rise, reach a peak, and then fall. The rising part is not noise. It is absorption.
<!-- /step -->

<!-- step:title="Intuition" slides="s17" viz="OralAbsorption" -->
With an oral dose, the blocks first wait outside the main room.

The absorption rate constant $K_a$ controls how fast blocks enter. A lag time $T_{lag}$ means the door stays closed for a while before entry starts.
<!-- /step -->

<!-- step:title="Building-block metaphor" slides="s13" viz="BuildingBlocksPKPD" -->
Imagine a delivery truck arrives at the classroom.

- $T_{lag}$ is the time before anyone opens the truck.
- $K_a$ is how fast students unload the blocks.
- $CL$ is still the cleanup speed once blocks are inside.

The observed curve mixes both delivery and cleanup.
<!-- /step -->

<!-- step:title="Minimal math" slides="s18,s19" viz="OralAbsorption" -->
A common first-order oral model is:

$$ C(t) = \frac{\text{Dose}}{V}\frac{K_a}{K_a-k}\left(e^{-k(t-T_{lag})}-e^{-K_a(t-T_{lag})}\right) $$

You do not need to memorize the full expression first. Read it as a competition between input by absorption and output by elimination.
<!-- /step -->

<!-- step:title="Worked example" slides="s20" viz="OralAbsorption" -->
Increase $K_a$ in the explorer.

The peak usually arrives earlier and is higher because blocks enter the room quickly before cleanup removes many of them. Increase $T_{lag}$ and the whole start of the curve shifts right.
<!-- /step -->

<!-- step:title="Common trap" slides="s19" -->
Do not estimate elimination half-life blindly from oral terminal slopes.

If absorption is slower than elimination, the last part of the curve may reflect absorption rather than elimination. This is called **flip-flop kinetics**.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Oral profiles include absorption and elimination.
- $K_a$ controls entry speed.
- $T_{lag}$ shifts the start of absorption.
- Cmax and Tmax are summaries, not model parameters by themselves.
<!-- /step -->

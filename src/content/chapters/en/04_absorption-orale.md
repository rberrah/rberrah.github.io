---
id: "absorption-orale"
slug: "absorption-orale"
title: "Oral route, Ka and lag time"
description: "Why an oral curve rises before it falls."
summary: "An accessible account of absorption rate, lag time, Cmax and Tmax."
track: "core"
order: 4
duration: "16 min"
level: "beginner"
tags: ["oral", "absorption", "ka", "tlag"]
slides: ["s07"]
prerequisites: ["clairance-volume-demi-vie"]
glossary: ["Ka","F","Tlag","Cmax / Tmax","Flip-flop"]
sources: ["savic-transit","gibaldi-perrier","rowland-tozer"]
reviewed_on: "2026-07-09"
reviewed_hash: "0fbedd98487a29998bd4861cfad233ec5f4578ab10a4a05b33cb3739b3806308"
review_pending: true
review_type: "author"
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
  - prompt: "What do the two gamma functions represent in the MPA model?"
    options:
      - "two parallel inputs into one compartment"
      - "two distribution compartments"
      - "two patient groups"
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

Here bioavailability $F$ is implicitly folded into the $\text{Dose}/V$ term; for a real extravascular route, this is often written $F\cdot\text{Dose}/V$.

No need to memorize the whole expression: read it as input by absorption ($K_a$) opposed to output by elimination ($k = CL/V$). The two exponentials subtract: early on, absorption dominates (the curve rises), then elimination takes over (the curve falls).

**Math —** increase $K_a$: the peak arrives earlier and higher. It is the only parameter that governs the **speed** of the rise in this basic model.
<!-- /step -->

<!-- step:title="Lag time" slides="s07" viz="OralAbsorption" -->
Sometimes nothing enters the blood for a while after intake (disintegration time, gastric emptying). We then add a **lag time** $T_{lag}$, which simply shifts the start of absorption:

$$ C(t) = \frac{\text{Dose}}{V}\,\frac{K_a}{K_a-k}\left(e^{-k(t-T_{lag})}-e^{-K_a(t-T_{lag})}\right) \quad \text{for } t \geq T_{lag} $$

Same convention: $F$ is omitted to keep the formula readable, but it returns as soon as oral exposure is interpreted in terms of the dose that actually becomes available.

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

<!-- step:title="Gamma and double-gamma absorption" -->
A transit model can also be described by a **gamma density**. With a chain of $n$ identical stages (integer n), time to entry follows a gamma distribution with shape $n$ and rate $b=k_{tr}$. Generalizing to a noninteger shape $a>0$ yields a flexible input:

$$ g(t;a,b)=\frac{b^a t^{a-1} e^{-bt}}{\Gamma(a)},\quad t>0 $$

The integral of $g$ is 1: $g$ describes the **fraction of the dose entering per hour**, not a concentration. With the rate convention $b$ in h⁻¹ (the statistical scale is $1/b$ in hours), the mean input time is $a/b$, standard deviation $\sqrt a/b$, and the mode is $(a-1)/b$ for $a>1$. With $a=1$, this reduces to first-order exponential absorption.

Two parallel input routes give:

$$ g_{\mathrm{total}}(t)=r g(t;a_1,b_1)+(1-r)g(t;a_2,b_2),\quad 0\le r\le1 $$

Total input feeds a single compartment: $dA/dt=F D g_{\mathrm{total}}(t)-k A$, $C=A/V$. Concentration depends on both inputs **and** disposition. Two gamma functions do not imply two compartments, necessarily two visible peaks, or proof of enterohepatic recycling.

**Mycophenolate example:** Woillard et al. (2015), [DOI 10.1016/j.phrs.2015.07.012](https://doi.org/10.1016/j.phrs.2015.07.012), compared ITS and Pmetrics using a 1C double-gamma structure in heart transplant recipients. Their supplement uses C0, a1, b1, a2, b2, r, FAIV and alpha; C0 and FAIV have a specific parameterization, distinct from the generic formula above. The exact historical code conventions still need confirmation.

**Try it:** [PMx Game, Path 4 Pmetrics](/pharmacometrie/game/?lang=en&path=pmetrics). Change the fraction r and the rate of the second input, compare absorption rates and concentrations, then investigate the population distribution.
<!-- /step -->

<!-- step:title="Worked example" slides="s07" viz="OralAbsorption" -->
In the explorer, increase $K_a$.

The peak usually arrives earlier and higher, because blocks enter quickly before cleanup removes many. A larger $T_{lag}$ does not change the peak height but shifts the start of the rise.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s07" -->
Do not estimate the elimination half-life blindly from the oral terminal slope.

**Pitfall —** if absorption is slower than elimination, the last part of the curve reflects **absorption**, not elimination: this is **flip-flop** kinetics. The terminal slope then misleads about the true half-life.
<!-- /step -->

<!-- step:title="Application: vomiting after an oral intake" viz="VomitingExplorer" -->
Part of an oral input may be lost before absorption. Even if the swallowed amount is known, the amount remaining in the absorbable depot depends on the elapsed time, $K_a$, and previous intakes. Drug that has already been absorbed does not disappear from the central compartment.

In this **fictional normalized illustration**, compare the reference, an assumed loss, and different compensating inputs. Complete loss of the depot is an assumption, not a measurement of how much was actually vomited. Effects on exposure and peak concentration must be considered together.

:::howto
With half-life and interval fixed, compare two absorption rates, then vary the assumed fraction lost. Explain why the same event does not necessarily produce the same profile disturbance.
:::

The [public IATDMCT 2025 abstract, p. 226](https://www.iatdmct2025.org/wp-content/uploads/2025/09/IATDMCT2025-Abstract-book-2.pdf#page=35) illustrates a pharmacometric approach to this problem. This module is not the study's clinical model, does not reproduce the application and gives no individual instructions.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- An oral profile combines absorption and elimination.
- $K_a$ controls the entry speed.
- $T_{lag}$ shifts the start of absorption; transit compartments give a smoother, delayed rise.
- Cmax and Tmax are summaries, not model parameters in themselves.
<!-- /step -->

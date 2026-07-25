---
id: "pkpd"
slug: "pkpd"
title: "PK/PD: Emax and turnover"
description: "Linking concentration to effect: saturation, steepness and delays."
summary: "An overview of PD models, from simplest to most mechanistic: linear, Emax, Sheiner effect compartment and indirect response (turnover)."
track: "core"
order: 7
duration: "16 min"
level: "intermediate"
tags: ["pkpd", "emax", "ec50", "turnover"]
slides: ["s26", "s27", "s28", "s29", "s30", "s31", "s32", "s33", "s35", "s36"]
quiz:
  - prompt: "EC50 is the concentration that produces..."
    options:
      - "half of the maximal effect (Emax)"
      - "the full maximal effect (Emax)"
      - "an effect equal to the baseline E0"
    correct: 0
  - prompt: "A Hill coefficient greater than 1 makes the curve..."
    options:
      - "steeper, closer to all-or-nothing"
      - "flatter, with the effect changing very gradually"
      - "shifted toward higher concentrations"
    correct: 0
  - prompt: "Turnover models are useful when..."
    options:
      - "the effect is delayed because the response variable changes over time"
      - "the effect is delayed because the drug distributes slowly"
      - "the delay comes from slow equilibration between plasma and effect site"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s26" viz="BuildingBlocksPKPD" -->
Concentration is usually not the final question. The final question is the **effect**: benefit, toxicity, biomarker change, clinical response.

PK/PD models link the concentration (produced by PK) to that effect. There is a small family of them, from simplest to most mechanistic. This chapter walks through them in order: **linear → Emax → effect compartment → turnover**.
<!-- /step -->

<!-- step:title="Intuition: the linear model" slides="s26,s28" viz="EmaxHill" -->
The simplest link between concentration and effect is **linear**: the effect changes in proportion to concentration.

$$ E = E_0 + S\cdot C $$

$E_0$ is the baseline effect (no drug) and $S$ (the slope) says how much the effect rises per unit of concentration.

**Key point —** this linear model is often **enough** over the concentration range actually observed: only two parameters, easy to estimate. Its limit: it predicts **no saturation** and suggests the effect grows forever with dose — which is biologically false.
<!-- /step -->

<!-- step:title="The formula, unpacked: the Emax model" slides="s28" viz="EmaxHill" -->
In reality, the effect **saturates**: once the targets (receptors, enzymes) are occupied, raising concentration adds almost nothing. That is the **Emax** idea.

Direct Emax model:

$$ E = E_0 + \frac{E_{\max}\, C}{EC_{50} + C} $$

Sigmoid Emax model (Hill coefficient $h$):

$$ E = E_0 + \frac{E_{\max}\, C^{h}}{EC_{50}^{h} + C^{h}} $$

**Math —** $E_0$ = effect without drug; $E_{\max}$ = maximal added effect; $EC_{50}$ = concentration giving half the effect; $h$ = how switch-like the response is.

When $C \ll EC_{50}$, the fraction $\approx C/EC_{50}$: you **recover the linear model**, with slope $E_{\max}/EC_{50}$. When $C = EC_{50}$, it is exactly **½** (hence the name). When $C \gg EC_{50}$, it tends to **1** and $E\to E_0+E_{\max}$ (plateau).

**In the clinic —** "more dose = more effect" stops holding well before saturation, but **not from EC50 onwards**: at $C = EC_{50}$ you have reached only **half** of Emax, and going to $4\times EC_{50}$ still buys another 30 points. It is **beyond ~5 × EC50** (≈ 83 % of Emax) that the gain becomes negligible — while toxicity follows its own curve and often keeps rising. That is where the argument against dose escalation lies.
<!-- /step -->

<!-- step:title="The Sheiner model" slides="s32" viz="SheinerEffect" -->
Often the effect **lags** behind concentration. This delay is not always slow distribution (PK): it can be **pharmacodynamic**.

A first way to describe it, without modelling a whole mechanism: an **effect compartment** (Sheiner). An effect-site concentration $C_e$ is linked to plasma by a single equilibration constant $k_{e0}$:

$$ \frac{dC_e}{dt} = k_{e0}\,(C_p - C_e) $$

The effect then depends on $C_e$ (through an Emax), not on $C_p$. Change $k_{e0}$: a small $k_{e0}$ delays and rounds the effect.

**Key point —** because the effect peaks **after** the plasma peak, plotting effect vs concentration draws a **hysteresis loop** — the signature of a PK/PD delay.
<!-- /step -->

<!-- step:title="Worked example: the turnover model" slides="s33" viz="Turnover" -->
The effect compartment shifts the effect but assumes a **direct** action. Often the drug actually acts on the **production** or **degradation** of a biological substance: this is the **indirect response** (turnover).

A response variable $R$ (a biomarker, a factor) is produced at rate $k_{in}$ and degraded at rate $k_{out}$. The drug stimulates or inhibits one of the two:

$$ \frac{dR}{dt} = k_{in}\,\bigl(1 + f(C)\bigr) - k_{out}\,R $$

At steady state, $R_0 = k_{in}/k_{out}$. Here the delay comes from the **turnover time** of $R$ (driven by $k_{out}$), not from PK.

**Warfarin.** Its anticoagulant effect lags behind concentration: it blocks the **synthesis** of clotting factors, but the factors already present must first be cleared naturally. Concentration changes first; the biological system responds afterwards. The animation shows this $k_{in}/k_{out}$ turnover — not an effect compartment.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s30" viz="EmaxHill" -->
Do not estimate a full Emax when you only observe a **piece** of it.

**Pitfall —** to identify $E_{\max}$ **and** $EC_{50}$, you need observations that span the **whole** curve: the low part (near-linear rise) **and** the plateau (saturation). In practice you often observe only the **middle** of the sigmoid, never reaching the plateau. Estimating $E_{\max}$ and $EC_{50}$ then becomes **unstable**: the two parameters are strongly correlated and the model fails to converge.

The pragmatic fix: **fall back on a linear model** (slope $S$) over the observed range. It is the same trade-off as the low-concentration limit of Emax — a simpler but **estimable** model beats a "correct" but unidentifiable one.
<!-- /step -->

<!-- step:title="Key takeaways" slides="s36" -->
- From simplest to most mechanistic: **linear** (slope $S$), **Emax** (saturation), Sheiner **effect compartment** (delay of a direct action), **turnover** (indirect response $k_{in}/k_{out}$).
- The linear model is the low-concentration limit of Emax ($C \ll EC_{50}$); when you observe only the middle of the curve, it is often the only **estimable** one.
- A delay between effect and concentration is not necessarily slow PK: it can be **PD** (effect compartment or turnover).
- To go deeper into these models, follow the **Pharmacodynamics** track.
<!-- /step -->

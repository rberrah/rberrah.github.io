---
id: "pkpd"
slug: "pkpd"
title: "PK/PD: Emax and turnover"
description: "Linking concentration to effect: saturation, steepness and delays."
summary: "An accessible guide to direct Emax models and indirect-response models."
track: "core"
order: 7
duration: "16 min"
level: "intermediate"
tags: ["pkpd", "emax", "ec50", "turnover"]
slides: ["s26", "s27", "s28", "s29", "s30", "s31", "s32", "s33", "s35", "s36"]
quiz:
  - prompt: "EC50 is the concentration that produces..."
    options:
      - "half of Emax"
      - "no effect"
      - "twice the baseline"
    correct: 0
  - prompt: "A Hill coefficient greater than 1 makes the curve..."
    options:
      - "steeper"
      - "flat at all concentrations"
      - "independent of concentration"
    correct: 0
  - prompt: "Turnover models are useful when..."
    options:
      - "the effect is delayed because the response variable changes over time"
      - "there is no response variable"
      - "PK data cannot be measured"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s26" viz="BuildingBlocksPKPD" -->
Concentration is usually not the final question. The final question is the **effect**.

PK/PD models link the blocks circulating in the body to what they build: benefit, toxicity, biomarker change, clinical response.
<!-- /step -->

<!-- step:title="Intuition" slides="s26,s28" viz="EmaxHill" -->
Adding more blocks only helps until the construction reaches its maximum useful size.

That plateau is the idea behind **Emax**: once the targets are saturated, more concentration adds almost no effect — but can still add toxicity.

**In the clinic —** "more dose = more effect" is false beyond EC50: mostly you gain adverse effects. That is the key argument against dose escalation.
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s28" viz="EmaxHill" -->
A direct Emax model:

$$ E = E_0 + \frac{E_{\max}\, C}{EC_{50} + C} $$

A sigmoid Emax model:

$$ E = E_0 + \frac{E_{\max}\, C^{h}}{EC_{50}^{h} + C^{h}} $$

**How to read it — the volume-knob metaphor.** Turning the volume up (the dose) first adds a lot of loudness, then less and less: at full blast, turning further adds almost nothing — except distortion (the side effects). The ear saturates just as receptors do.

**On the maths side.** In $E = E_0 + \dfrac{E_{\max}C}{EC_{50}+C}$: when $C \ll EC_{50}$, the fraction $\approx C/EC_{50}$ (near-**linear** response); when $C = EC_{50}$, it is exactly **½** (hence the name); when $C \gg EC_{50}$, it tends to **1** and $E\to E_0+E_{\max}$ (plateau). The Hill coefficient $h$ only makes the switch more or less **steep**.

**Math —** $E_0$ = effect without drug; $E_{\max}$ = maximal added effect; $EC_{50}$ = concentration giving half the effect; $h$ (Hill coefficient) = how switch-like the response is.
<!-- /step -->

<!-- step:title="Worked example" slides="s33" viz="Turnover" -->
For warfarin, the clinical effect can lag behind concentration because the drug acts on the turnover of clotting factors.

Concentration changes first; the biological system responds afterwards, over time. That delay is **PD**, not necessarily slow distribution.
<!-- /step -->

<!-- step:title="The Sheiner model" slides="s32" viz="SheinerEffect" -->
When the effect lags but you do not want to model a whole mechanism, add an **effect compartment** (Sheiner): an effect-site concentration $C_e$ linked to plasma by a single equilibration constant $k_{e0}$.

$$ \frac{dC_e}{dt} = k_{e0}\,(C_p - C_e) $$

The effect then depends on $C_e$ (through an Emax), not on $C_p$. Change $k_{e0}$: a small $k_{e0}$ delays and rounds the effect.

**Key point —** because the effect peaks **after** the plasma peak, plotting effect vs concentration draws a **hysteresis loop** — the signature of a PK/PD delay.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s30,s33" viz="Turnover" -->
Do not call every delay "slow PK".

**Pitfall —** sometimes concentration reaches the site quickly, but the measured effect takes time because the biomarker must be produced or removed. Turnover models capture this:
$$ \frac{dR}{dt} = k_{in}\,(1 + f(C)) - k_{out}\,R $$
<!-- /step -->

<!-- step:title="Key takeaways" slides="s36" -->
- PK explains concentration over time.
- PD explains effect as a function of concentration and biology.
- Emax models teach saturation.
- Turnover models teach the delayed response.
<!-- /step -->

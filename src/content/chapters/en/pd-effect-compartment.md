---
id: "pd-effect-compartment"
slug: "pd-effect-compartment"
title: "Effect compartment (Sheiner) and hysteresis"
description: "Linking concentration and effect when the effect is time-shifted: the effect-compartment model."
summary: "The Sheiner model (ke0): a virtual effect compartment that explains concentration–effect hysteresis."
track: "pd"
order: 62
duration: "12 min"
level: "advanced"
tags: ["pharmacodynamics", "effect-compartment", "sheiner", "hysteresis"]
slides: []
quiz:
  - prompt: "The effect-compartment model explains hysteresis by..."
    options:
      - "an equilibration delay between plasma and the effect site (ke0)"
      - "a measurement error"
      - "a dose change"
    correct: 0
  - prompt: "The ke0 parameter controls..."
    options:
      - "the equilibration rate toward the effect compartment"
      - "the plasma clearance"
      - "the bioavailability"
    correct: 0
  - prompt: "A concentration–effect hysteresis loop indicates that..."
    options:
      - "the effect is shifted relative to the plasma concentration"
      - "the effect is instantaneous"
      - "there is no effect"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Sometimes the effect **follows an Emax shape** but **shifted**: at equal plasma concentration, the effect differs depending on whether we are rising or falling. This shift forms a **hysteresis loop**.

The **Sheiner** model explains it elegantly with a virtual **effect compartment**.
<!-- /step -->

<!-- step:title="Intuition" viz="SheinerEffect" -->
The site of action (brain, muscle) is not the plasma: the drug must **diffuse** there. The effect-site concentration **lags** the plasma concentration.

When we plot effect vs plasma concentration, this lag draws a **loop**: that is hysteresis.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="SheinerEffect" -->
We add an effect compartment $C_e$ that equilibrates with plasma at rate $k_{e0}$:

$$ \frac{dC_e}{dt} = k_{e0}\,(C_p - C_e) $$

**How to read it — the heated-room metaphor.** The plasma is the radiator; the effect site is the room. When you switch on (plasma peak), the room does not warm all at once: there is a delay. $k_{e0}$ is the **exchange rate** radiator→room: a small $k_{e0}$ = a room slow to heat and cool = a large lag.

**On the maths side.** $C_e$ "chases" $C_p$: the rate $k_{e0}(C_p-C_e)$ is large when the gap is large, zero at equilibrium. Since the effect follows $C_e$ (lagging), not $C_p$, plotting effect vs $C_p$ traces a **loop** (hysteresis) — same concentration, different effect on the way up and down.

The effect then follows an Emax **of $C_e$** (not $C_p$):

$$ E = E_0 + \frac{E_{max}\,C_e}{EC_{50}+C_e} $$

The effect compartment receives no mass: it is a device that **collapses the hysteresis** loop.

**Ref —** Sheiner L.B. et al., *Clin Pharmacol Ther* 1979 (effect-compartment model, illustrated on d-tubocurarine).
<!-- /step -->

<!-- step:title="Worked example" viz="SheinerEffect" -->
An **anaesthetic agent**: the brain effect lags the plasma concentration. A small $k_{e0}$ = slow equilibration = large hysteresis; a large $k_{e0}$ = near-direct effect.

The equilibration half-life $t_{1/2,k_{e0}} = \ln 2/k_{e0}$ summarises this delay — useful for titration.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Hysteresis is not always an effect compartment.

**Pitfall —** a loop can also come from an **indirect response** (turnover), an **active metabolite** or tolerance. Mechanically choosing "effect compartment" without distinguishing these causes yields a wrong model. The loop's direction (clockwise/anticlockwise) helps diagnose.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- An effect compartment (Sheiner) explains the plasma → effect delay.
- ke0 = equilibration rate; t½ = ln2/ke0 summarises the delay.
- The effect follows an Emax of Ce (effect site), which collapses the hysteresis.
- Hysteresis ≠ always an effect compartment (turnover, metabolite, tolerance).
<!-- /step -->

---
id: "pd-direct"
slug: "pd-direct"
title: "Direct-effect models: Emax and Hill"
description: "When effect follows concentration with no delay: linear, log-linear, Emax and the Hill sigmoid."
summary: "Direct PD models — linear, log-linear, Emax, Hill — and the meaning of their parameters."
track: "pd"
order: 60
duration: "12 min"
level: "intermediate"
tags: ["pharmacodynamics", "emax", "hill", "direct-effect"]
slides: []
quiz:
  - prompt: "A direct-effect model assumes the effect..."
    options:
      - "follows the concentration with no delay"
      - "always appears with a lag after the dose"
      - "is independent of the concentration reached"
    correct: 0
  - prompt: "In the Emax model, EC50 is the concentration giving..."
    options:
      - "half the maximal attainable effect"
      - "the maximal effect, at the curve plateau"
      - "half the concentration at the peak"
    correct: 0
  - prompt: "The Hill coefficient (n) controls..."
    options:
      - "the steepness of the concentration–effect curve"
      - "the height of the plateau, i.e. the maximal effect"
      - "the concentration producing half the effect"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The simplest PD link: the effect **follows** the concentration, with no delay. It is the starting point of all pharmacodynamics, and the **Emax** model is its pillar.

Understanding its parameters (E0, Emax, EC50, n) illuminates all more complex models.
<!-- /step -->

<!-- step:title="Intuition" viz="EmaxHill" -->
At low concentration, each dose increment adds a lot of effect. At high concentration, receptors **saturate**: the effect plateaus.

Hence a curve that **rises then saturates** — the opposite of a straight line. The Hill sigmoid adds an adjustable **steepness**.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="EmaxHill" -->
The sigmoid **Emax** (Hill) model:

$$ E = E_0 + \frac{E_{max}\,C^{\,n}}{EC_{50}^{\,n} + C^{\,n}} $$

- $E_0$: baseline effect (no drug);
- $E_{max}$: maximal attainable effect;
- $EC_{50}$: concentration for half the effect;
- $n$: Hill coefficient (steepness; $n=1$ = hyperbola).

The **linear** ($E=E_0+S\cdot C$) and **log-linear** ($E=E_0+S\cdot\ln C$) forms are valid approximations over a narrow range.

**Math —** for $C \ll EC_{50}$, Emax behaves like a **linear** model of slope $E_{max}/EC_{50}$.
<!-- /step -->

<!-- step:title="Worked example" viz="EmaxHill" -->
An antihypertensive: the drop in pressure follows the concentration almost without delay. We estimate $E_{max}$ (maximal drop) and $EC_{50}$ (target concentration).

Beyond ~$5\times EC_{50}$, raising the dose adds almost no effect — but can add toxicity.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A linear model extrapolates poorly.

**Pitfall —** fitting a **straight line** to concentration–effect data that saturate overestimates the effect at high doses. And an $EC_{50}$ is identifiable only if concentrations **around** it were observed; otherwise it is poorly estimated.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Direct effect = the effect follows concentration with no delay.
- Sigmoid Emax: E0, Emax, EC50, n (Hill = steepness).
- Linear/log-linear = approximations over a narrow range.
- Identifying EC50 requires concentrations around its value.
<!-- /step -->

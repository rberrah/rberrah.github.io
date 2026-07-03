---
id: "math-edo"
slug: "math-edo"
title: "Differential equations and exponentials"
description: "Why dA/dt = −k·A gives exponential decay — the building block of every PK model."
summary: "The maths foundation: rate of change, the exponential solution, semi-log plots and sums of exponentials."
track: "math"
order: 20
duration: "12 min"
level: "beginner"
tags: ["maths", "ode", "exponential"]
slides: []
quiz:
  - prompt: "The solution of dA/dt = −k·A is..."
    options:
      - "A(t) = A₀ · e^(−k·t)"
      - "A(t) = A₀ − k·t"
      - "A(t) = A₀ · k·t"
    correct: 0
  - prompt: "On a semi-log scale, first-order decay looks like..."
    options:
      - "a straight line"
      - "a parabola"
      - "a plateau"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Every PK model is a **differential equation**: it describes how a quantity **changes** over time. Getting comfortable with `dA/dt` demystifies the rest of the course.

You do not need to be a mathematician — read a differential equation as a **sentence** about rates.
<!-- /step -->

<!-- step:title="Intuition" viz="IVBolus" -->
A differential equation links a quantity to its **rate of change**.

In first-order PK, the rate of loss is **proportional to what is left**: the more drug there is, the more leaves per unit time. The result is **exponential decay**.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="IVBolus" -->
The basic block:

$$ \frac{dA}{dt} = -k\,A \quad\Longrightarrow\quad A(t) = A_0\,e^{-k t} $$

Two useful readings:

- the **half-life** $t_{1/2} = \ln(2)/k$ depends only on $k$;
- on a **semi-log scale**, $\ln A(t) = \ln A_0 - k\,t$ is a **straight line** with slope $-k$.

**Math —** this is why concentrations are plotted on a log scale: one phase = one line; two phases = two lines (two-compartment).
<!-- /step -->

<!-- step:title="Worked example" viz="10_PK2C" -->
With several compartments, the solution is a **sum of exponentials**:

$$ C(t) = A\,e^{-\alpha t} + B\,e^{-\beta t} $$

Each exponential is a "phase" (fast distribution α, slow elimination β). Switch the figure to semi-log: the two slopes appear.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Do not confuse **exponential** and **linear** decay.

**Pitfall —** an exponential never drops to zero "all at once": it falls by a constant factor per half-life (50%, 75%, 87.5%…). Reading a slope on a linear scale instead of semi-log is the classic mistake.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- An ODE links a quantity to its rate of change.
- First order: $dA/dt = -k A \Rightarrow A(t)=A_0 e^{-kt}$, half-life $\ln2/k$.
- The semi-log scale linearises; the number of lines = number of compartments.
- A multi-compartment model is a sum of exponentials.
<!-- /step -->

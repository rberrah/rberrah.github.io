---
id: "infectio-viral"
slug: "infectio-viral"
title: "Viral dynamics and infection models"
description: "Modelling viral load under treatment: target cells, biphasic decline and efficacy."
summary: "Viral kinetics models (target cells): biphasic decline, efficacy and emergence of resistance."
track: "infectio"
order: 42
duration: "13 min"
level: "advanced"
tags: ["infectious-diseases", "viral-dynamics", "target-cell", "resistance"]
slides: []
quiz:
  - prompt: "In a viral kinetics model, the biphasic decline reflects..."
    options:
      - "clearance of free virus then loss of infected cells"
      - "two measurement errors"
      - "dose and weight"
    correct: 0
  - prompt: "An antiviral's efficacy parameter ε represents..."
    options:
      - "the fraction of viral production blocked"
      - "the renal clearance"
      - "the volume of distribution"
    correct: 0
  - prompt: "Insufficient efficacy favours..."
    options:
      - "the emergence of resistance (residual replication)"
      - "faster cure"
      - "a drop in viral load"
    correct: 0
---

<!-- step:title="Why this chapter" -->
In viral infectious diseases (HIV, HCV, influenza, COVID, Ebola), the endpoint is not a concentration but the **viral load**. Modelling it under treatment quantifies an antiviral's **efficacy** and anticipates **resistance**.

It is a major field of mechanistic pharmacometrics applied to infection.
<!-- /step -->

<!-- step:title="Intuition" viz="45_ViralKinetics" -->
The virus is **produced** (infected cells) and continuously **cleared**. An antiviral **blocks production**: the viral load falls.

The fall is **biphasic**: first fast (elimination of the free virus already present), then slower (elimination of infected cells). Vary the efficacy and watch the two slopes.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="45_ViralKinetics" -->
The **target-cell** model couples infected cells $I$ and virus $V$:

$$ \frac{dI}{dt} = -\delta\,I, \qquad \frac{dV}{dt} = (1-\varepsilon)\,p\,I - c\,V $$

- $\varepsilon$: **efficacy** (fraction of production blocked);
- $c$: clearance of free virus (phase 1, fast);
- $\delta$: loss of infected cells (phase 2, slow).

At high efficacy, the first slope ≈ $c$, the second ≈ $\delta$.

**Ref —** Neumann A.U. et al., *Science* 1998 (HCV dynamics under interferon); Perelson A.S. (HIV dynamics). In France, the **IAME** team (Bichat — J. Guedj) models HCV, Ebola and COVID; the **Leiden** school (LACDR) for infection modelling.
<!-- /step -->

<!-- step:title="Worked example" viz="45_ViralKinetics" -->
For **HCV**, the phase-1 slope directly estimates treatment efficacy, and phase 2 the elimination rate of infected hepatocytes — hence a prediction of the **time to cure**.

This framework guided the development of direct-acting antivirals and the optimisation of treatment durations.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A rising viral load is not always a pharmacological failure.

**Pitfall —** incomplete efficacy leaves **residual replication** where **resistant** variants can emerge: the viral load rebounds despite a "present" treatment. Distinguishing non-adherence, insufficient exposure (PK) and resistance (virology) is essential — and requires linking the viral model to the drug's **PK**.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Viral load is modelled by an infected-cells ↔ free-virus system.
- Biphasic decline: virus clearance (c) then loss of infected cells (δ).
- Efficacy ε (blocked production) drives the phase-1 slope.
- Insufficient efficacy favours resistance; link to the PK model.
<!-- /step -->

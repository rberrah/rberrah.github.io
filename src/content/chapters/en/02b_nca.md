---
id: "micro-macro"
slug: "micro-macro"
title: "Rate constants or clearances and volumes"
description: "The same compartmental model can be written in rate constants (ke, k12, k21) or in clearances and volumes (CL, Q, V), without confusing the latter with the alpha and beta macroconstants."
summary: "Two equivalent parameterizations of a compartmental model, with precise use of the terms microconstants and macroconstants."
track: "core"
order: 2.5
duration: "6 min"
level: "beginner"
tags: ["parametrisation", "micro", "macro", "clairance"]
slides: []
reviewed_on: "2026-10-09"
updated_on: "2026-10-09"
prerequisites: ["trois-approches"]
glossary: ["CL","V","Q","ke"]
sources: ["gibaldi-perrier","rowland-tozer","holford-clearance"]
review_type: "author"
review_pending: true
reviewed_hash: "946105d5fc89c63e565c70bda55f82af8efd50394c5c2e1019dd426b9dd4bf61"
quiz:
  - prompt: "In a one-compartment model, which identity links the elimination rate constant to CL and V?"
    options:
      - "kₑ = CL / V"
      - "kₑ = CL × V"
      - "kₑ = V / CL"
    correct: 0
  - prompt: "Why does this course favour the CL, Q, V parameterization?"
    options:
      - "because these quantities have a useful physiological interpretation, while remaining model parameters"
      - "because the micro rate constants are wrong"
      - "because software only accepts CL and V"
    correct: 0
  - prompt: "A transfer constant k₁₂ (micro)…"
    options:
      - "describes an exchange rate, with no directly measurable physiological quantity"
      - "is measured directly at the patient's bedside"
      - "always equals twice k₂₁"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The same compartmental model can be written with **rate constants** or with **clearances and volumes**. With coherent initial conditions and scales, these parameterizations describe the same system: this is not a structural difference.

- **Microconstants** are **rate constants**: $k_e$ (elimination), $k_{12}$ and $k_{21}$ (exchange between compartments).
- The **clearance-volume parameterization** uses $CL$ (clearance), $Q$ (intercompartmental clearance), $V_1$ and $V_2$.

In the classical nomenclature of a biexponential equation, **macroconstants** are instead the hybrid slopes $\alpha$, $\beta$ and coefficients $A$, $B$. Calling $CL/Q/V$ "macro" is therefore ambiguous; the rest of this course uses **clearance-volume parameterization**.
<!-- /step -->

<!-- step:title="Intuition" -->
The two forms are like two coordinate systems describing the same point.

- Rate constants say "how **fast, relatively**" drug leaves a compartment. They are rates per unit time.
- Clearances and volumes describe **clearing capacity** ($CL$), an **apparent intercompartmental clearance** ($Q$), and an **apparent distribution space** ($V$). They have a useful physiological interpretation but remain model parameters: $Q$ is not necessarily a measured anatomical flow and $V$ is often apparent.

A rate constant like $k_{12}$ cannot be measured at the bedside; a clearance, volume or apparent flow is easier to reason about — at least by physiological analogy.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="10_PK2C" -->
The bridge between the two is purely algebraic. For a **one-compartment** model:

$$ k_e = \frac{CL}{V} $$

For a **two-compartment** model (central 1, peripheral 2), the rate constants follow from $CL$, $Q$, $V_1$ and $V_2$:

$$ k_e = \frac{CL}{V_1}, \qquad k_{12} = \frac{Q}{V_1}, \qquad k_{21} = \frac{Q}{V_2} $$

**Math —** each rate constant is a **clearance over a volume**. Knowing $CL, Q, V_1, V_2$ is therefore enough to recover these constants. The reverse conversion needs at least one scale quantity, such as $V_1$: rate constants alone cannot reconstruct every clearance and volume simultaneously.
<!-- /step -->

<!-- step:title="Worked example" viz="10_PK2C" -->
Take a two-compartment model with $CL = 6$ L/h, $Q = 4$ L/h, $V_1 = 30$ L, $V_2 = 20$ L.

In rate-constant form: $k_e = 6/30 = 0.20$ h⁻¹, $k_{12} = 4/30 = 0.13$ h⁻¹, $k_{21} = 4/20 = 0.20$ h⁻¹.

Both sets of numbers describe **the same curve**. But "$CL = 6$ L/h" says something immediately useful to the clinician (clearing capacity), where "$k_e = 0.20$ h⁻¹" needs a detour.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Do not mix the two forms in one equation, and always know **which** one a paper or a piece of software uses.

**Pitfall —** comparing or transferring parameters from one model to another without checking the parametrization is a classic mistake: a $k_{12}$ is not a $Q$, and two "equivalent" models can display very different numbers depending on the chosen form. The micro constants also have **no** directly measurable physiological meaning — one more reason to reason in $CL$, $Q$, $V$, while remembering their apparent nature.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- A compartmental model can be written with **microconstants** ($k_e$, $k_{12}$, $k_{21}$) or with **clearances and volumes** ($CL$, $Q$, $V$): the same system in two parameterizations.
- The bridge is algebraic: each rate constant is a **clearance over a volume** ($k_e = CL/V$, $k_{12} = Q/V_1$, $k_{21} = Q/V_2$).
- The course favours $CL$, $Q$ and $V$ for interpretation, while reserving **macroconstants** for hybrid slopes and coefficients ($\alpha$, $\beta$, $A$, $B$) when that representation is used.
<!-- /step -->

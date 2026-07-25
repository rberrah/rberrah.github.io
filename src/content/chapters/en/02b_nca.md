---
id: "micro-macro"
slug: "micro-macro"
title: "Micro or macro: two ways to write one model"
description: "The same compartmental model can be written with rate constants (ke, k12, k21) or with clearances and volumes (CL, Q, V). Why we choose CL/V."
summary: "Micro (rate constants) vs macro (clearances/volumes) parametrization: two languages for one model, and why we keep CL/V."
track: "core"
order: 2.5
duration: "6 min"
level: "beginner"
tags: ["parametrisation", "micro", "macro", "clairance"]
slides: []
reviewed_on: "2026-07-14"
quiz:
  - prompt: "In a one-compartment model, which identity links the micro and macro forms?"
    options:
      - "kₑ = CL / V"
      - "kₑ = CL × V"
      - "kₑ = V / CL"
    correct: 0
  - prompt: "Why does this course favour the CL, Q, V (macro) form?"
    options:
      - "because these quantities have a telling physiological meaning (clearance, flow, distribution space)"
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
The same compartmental model can be written in **two ways**. They describe exactly the same curve: this is not a difference of model, but a difference of **language**.

- The **micro** form uses **rate constants**: $k_e$ (elimination), $k_{12}$ and $k_{21}$ (exchange between compartments).
- The **macro** form uses **clearances and volumes**: $CL$ (clearance), $Q$ (inter-compartmental flow), $V_1$, $V_2$.

This short chapter makes the link explicit, and explains why the rest of the course keeps the **macro** language.
<!-- /step -->

<!-- step:title="Intuition" -->
The two forms are like two coordinate systems describing the same point.

- The **micro** constants say "how **fast**" the drug moves from one compartment to another. They are rates, per unit time.
- The **macro** quantities say "what **clearing capacity**" ($CL$), "what **flow**" between compartments ($Q$) and "what **space**" of distribution ($V$). They are **physiological** quantities.

A rate constant like $k_{12}$ cannot be measured at the bedside; a clearance, a volume, a blood flow can — at least by physiological analogy.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="10_PK2C" -->
The bridge between the two is purely algebraic. For a **one-compartment** model:

$$ k_e = \frac{CL}{V} $$

For a **two-compartment** model (central 1, peripheral 2), the micro constants follow from the macro quantities:

$$ k_e = \frac{CL}{V_1}, \qquad k_{12} = \frac{Q}{V_1}, \qquad k_{21} = \frac{Q}{V_2} $$

**Math —** each rate constant is a **flow over a volume**. It is the same information, rewritten: knowing $CL, Q, V_1, V_2$ is enough to recover all the micro constants, and vice versa.
<!-- /step -->

<!-- step:title="Worked example" viz="10_PK2C" -->
Take a two-compartment model with $CL = 6$ L/h, $Q = 4$ L/h, $V_1 = 30$ L, $V_2 = 20$ L.

In micro form: $k_e = 6/30 = 0.20$ h⁻¹, $k_{12} = 4/30 = 0.13$ h⁻¹, $k_{21} = 4/20 = 0.20$ h⁻¹.

Both sets of numbers describe **the same curve**. But "$CL = 6$ L/h" says something immediately useful to the clinician (clearing capacity), where "$k_e = 0.20$ h⁻¹" needs a detour.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Do not mix the two forms in one equation, and always know **which** one a paper or a piece of software uses.

**Pitfall —** comparing or transferring parameters from one model to another without checking the parametrization is a classic mistake: a $k_{12}$ is not a $Q$, and two "equivalent" models can display very different numbers depending on the chosen form. The micro constants also have **no** directly measurable physiological meaning — one more reason to reason in $CL$, $Q$, $V$.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- A compartmental model can be written in **micro** (rate constants $k_e$, $k_{12}$, $k_{21}$) **or** in **macro** (clearances and volumes $CL$, $Q$, $V$): same curve, two languages.
- The bridge is algebraic: each rate constant is a **flow over a volume** ($k_e = CL/V$, $k_{12} = Q/V_1$, $k_{21} = Q/V_2$).
- **We choose the macro language** ($CL$, $Q$, $V$) for the rest of the course: these quantities speak to medicine (clearance, flow, distribution space), where the micro constants are equivalent but hard to interpret.
<!-- /step -->

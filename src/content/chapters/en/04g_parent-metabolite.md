---
id: "parent-metabolite"
slug: "parent-metabolite"
title: "Parent/metabolite models"
description: "Modelling a drug and its metabolite: formation, elimination, and which step limits the kinetics."
summary: "The parent → metabolite model: fraction metabolised, formation- vs elimination-limited regime, active metabolites."
track: "core"
order: 4.8
duration: "13 min"
level: "advanced"
tags: ["metabolite", "parent", "formation", "active-metabolite"]
prerequisites: ["clairance-volume-demi-vie"]
glossary: ["CL", "t½", "ke", "Michaelis-Menten"]
slides: []
quiz:
  - prompt: "In a parent/metabolite model, the metabolite first appears..."
    options:
      - "gradually, by formation from the parent"
      - "instantly at its final concentration"
      - "at the same time as the parent's peak"
    correct: 0
  - prompt: "If the metabolite is eliminated more slowly than the parent (km < k), its terminal slope is..."
    options:
      - "set by its own slow elimination (km)"
      - "identical to the parent's terminal slope"
      - "steeper than the parent's terminal slope"
    correct: 0
  - prompt: "An active metabolite matters because..."
    options:
      - "it adds to the effect, sometimes toxicity"
      - "it speeds up the parent drug's elimination"
      - "it alters the parent drug's bioavailability"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Many drugs are **transformed** into one or more metabolites. These can be **inactive**, **active** (contributing to the effect), or **toxic**. Modelling them together — parent **and** metabolite — is sometimes essential.

It is also a fine coupling case: the parent's output is the metabolite's **input**.
<!-- /step -->

<!-- step:title="Intuition" viz="65_ParentMetabolite" -->
The parent **decays**; the metabolite must first be **formed** — its curve **rises** then **falls**, like an absorption.

The key question: which is slower? If the metabolite is eliminated **fast**, its concentration follows the parent's. If it is eliminated **slowly**, it **persists** long after the parent is gone.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="65_ParentMetabolite" -->
The coupling is written:

$$ \frac{dA_{par}}{dt} = -k\,A_{par}, \qquad \frac{dA_{met}}{dt} = f_m\,k\,A_{par} - k_m\,A_{met} $$

where $f_m$ is the **fraction metabolised** (to this metabolite), and $k$, $k_m$ the elimination constants.

**How to read it — the two-bucket cascade metaphor.** Water falls from the "parent" bucket into the "metabolite" bucket, which leaks at its own rate. If the second bucket leaks **fast** (large km), its level follows the first; if it leaks **slowly** (small km), it stays full long after the first is empty.

**On the maths side.** The metabolite's terminal slope is $\min(k, k_m)$: the **slowest step** governs. If $k_m > k$ (formation-limited), the metabolite vanishes at the parent's rate (metabolite **flip-flop**); if $k_m < k$ (elimination-limited), it persists.
<!-- /step -->

<!-- step:title="Worked example" viz="65_ParentMetabolite" -->
**Morphine** produces **M6G**, an **active** (analgesic) metabolite cleared renally: in renal impairment, M6G **accumulates** (elimination-limited) and can cause prolonged sedation.

Conversely, a metabolite cleared faster than the parent stays low: its kinetics are visible only while the parent feeds it.
<!-- /step -->

<!-- step:title="Common pitfall" -->
You cannot always identify everything.

**Pitfall —** with metabolite data alone, you **cannot separate** $f_m$ from its volume: you estimate $f_m/V_{met}$ (**apparent** parameters), unless the metabolite is given directly. And an ignored **active** metabolite distorts the exposure–effect relationship: the effect may persist after the **parent** is gone.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The metabolite is formed from the parent: its curve rises then falls.
- dA_met/dt = fm·k·A_par − km·A_met; the terminal slope = min(k, km) (the slowest step).
- km > k: formation-limited (follows the parent); km < k: elimination-limited (persists).
- Active/toxic metabolites must be modelled; fm and V are often only apparent (fm/V).
<!-- /step -->

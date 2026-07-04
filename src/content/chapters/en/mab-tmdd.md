---
id: "mab-tmdd"
slug: "mab-tmdd"
title: "TMDD — target-mediated drug disposition"
description: "When binding to its target becomes an elimination route: the nonlinear PK of biologics."
summary: "The TMDD model (Mager & Jusko): target binding, saturation and dose-dependent clearance."
track: "mab"
order: 51
duration: "13 min"
level: "advanced"
tags: ["mab", "tmdd", "nonlinear", "target"]
slides: []
quiz:
  - prompt: "TMDD (target-mediated drug disposition) produces PK that is..."
    options:
      - "nonlinear: clearance depends on dose"
      - "perfectly linear at all doses"
      - "independent of the target"
    correct: 0
  - prompt: "At high dose, with the target saturated, a mAb's PK becomes..."
    options:
      - "nearly linear (target route negligible)"
      - "faster and faster"
      - "zero"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Many antibodies bind to a **target** (receptor, cytokine). This binding, followed by internalisation of the complex, is an **elimination route** — this is **TMDD** (target-mediated drug disposition).

The result: **nonlinear** PK, where clearance depends on dose. Ignoring it leads to poor extrapolation of schedules.
<!-- /step -->

<!-- step:title="Intuition" viz="54_TMDD" -->
At **low concentration**, almost all the drug finds a free target: binding dominates, elimination is fast and **saturable**.

At **high concentration**, the target is **saturated**: the target route becomes negligible, and PK becomes **linear** again (slow catabolism only). Hence a clearance that **decreases** as the dose increases.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="54_TMDD" -->
The **TMDD** model (Mager & Jusko, 2001) couples free drug $C$, free target $R$ and complex $RC$:

$$ \frac{dC}{dt} = -k_{el}C - k_{on}C\cdot R + k_{off}\,RC $$
$$ \frac{dR}{dt} = k_{syn} - k_{deg}R - k_{on}C\cdot R + k_{off}\,RC,\qquad \frac{dRC}{dt} = k_{on}C\cdot R - (k_{off}+k_{int})RC $$

In practice, the **quasi-equilibrium / Michaelis-Menten** approximation of this system is often used.

**How to read it — the parking-lot metaphor.** The target is a set of parking spaces. At low dose (few cars), each molecule quickly finds a spot and is "removed" from circulation: fast elimination. At high dose, every space is **taken** (target saturated): the extra molecules stay in the blood and leave only by the slow route. Hence a clearance that **drops** as the dose rises.

**On the maths side.** The $k_{on}\,C\cdot R$ term is the "parking" rate: proportional to free molecules $C$ **and** free spaces $R$. When $R\to 0$ (saturation), it vanishes and only $-k_{el}C$ (slow catabolism) remains: PK becomes linear again.

**Ref —** Mager D.E. & Jusko W.J., *J Pharmacokinet Pharmacodyn* 2001 (TMDD model); QSS approximations by Gibiansky & Gibiansky.
<!-- /step -->

<!-- step:title="Worked example" viz="54_TMDD" -->
On a semi-log concentration–time profile, TMDD gives a characteristic **curvature**: a fast drop at low concentration (active target) then a slow slope (saturated target).

Doubling the dose **more than doubles** the exposure — clearance having decreased.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Do not extrapolate linear PK from one dose to another.

**Pitfall —** estimating CL and V at one dose then predicting another dose as if PK were linear is wrong in the presence of TMDD. One must model the target (or at least Michaelis-Menten elimination) and cover a **range of doses**.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Target binding + internalisation = elimination route (TMDD) → nonlinear PK.
- Low [C]: fast, saturable target elimination; high [C]: saturated target, near-linear PK.
- Clearance decreases as dose increases.
- Mager & Jusko model; Michaelis-Menten approximations in practice.
<!-- /step -->

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
      - "often nonlinear when binding and internalisation add a saturable elimination pathway"
      - "linear: target binding does not alter elimination"
      - "nonlinear: clearance increases as the dose increases"
    correct: 0
  - prompt: "At high dose, with the target saturated, a mAb's PK becomes..."
    options:
      - "nearly linear: the target route becomes negligible"
      - "faster and faster: the target captures more of the drug"
      - "strongly nonlinear: the target route dominates elimination"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Many antibodies bind to a **target** (receptor, cytokine). This binding, followed by internalisation of the complex, is an **elimination route** — this is **TMDD** (target-mediated drug disposition).

When target binding followed by internalisation contributes to elimination, the canonical result is **nonlinear** PK in which apparent clearance depends on dose. Not every target-binding process produces that profile.
<!-- /step -->

<!-- step:title="Intuition" viz="54_TMDD" -->
At **low concentration**, almost all the drug finds a free target: binding dominates, elimination is fast and **saturable**.

At **high concentration**, the target is **saturated**: in the canonical TMDD model with internalisation, the relative contribution of this route falls and PK approaches the linear pathway. Apparent clearance may therefore **decrease** as dose increases; this is not a universal rule for all drug-target binding.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="54_TMDD" -->
The **TMDD** model (Mager & Jusko, 2001) couples free drug $C$, free target $R$ and complex $RC$:

$$ \frac{dC}{dt} = -k_{el}C - k_{on}C\cdot R + k_{off}\,RC $$
$$ \frac{dR}{dt} = k_{syn} - k_{deg}R - k_{on}C\cdot R + k_{off}\,RC,\qquad \frac{dRC}{dt} = k_{on}C\cdot R - (k_{off}+k_{int})RC $$

Each term reads:

- $C$, $R$, $RC$: concentrations of **free** drug, **free** target and the **complex**;
- $k_{el}$: non-specific drug elimination (catabolism — the "slow" route);
- $k_{on}$ / $k_{off}$: drug–target **association** and **dissociation** rates;
- $k_{syn}$ / $k_{deg}$: target **synthesis** and **degradation** in the absence of drug;
- $k_{int}$: **internalisation** of the complex (the target "carries away" the drug — the route that saturates).

In practice, the **quasi-steady-state (QSS)** approximation of this system is often used (Gibiansky & Gibiansky, 2008), reducing it to a **Michaelis-Menten** form. QSS is not quasi-equilibrium: complex internalisation enters the apparent constant, hence $K_{ss} = (k_{off}+k_{int})/k_{on}$.

**How to read it — the parking-lot metaphor.** In the canonical case where complexes are internalised, targets resemble spaces that remove molecules from circulation. At high dose these spaces saturate: the pathway plateaus and apparent clearance may fall. Without meaningful complex elimination, the metaphor alone does not predict this behaviour.

**On the maths side.** The $k_{on}\,C\cdot R$ term is the "parking" rate: proportional to free molecules $C$ **and** free spaces $R$. When $R\to 0$ (saturation), it vanishes and only $-k_{el}C$ (slow catabolism) remains: PK becomes linear again.

**Ref —** Mager D.E. & Jusko W.J., *J Pharmacokinet Pharmacodyn* 2001 (TMDD model); QSS approximations by Gibiansky & Gibiansky.
<!-- /step -->

<!-- step:title="Worked example" viz="54_TMDD" -->
On a semi-log concentration–time profile, TMDD gives a characteristic **curvature**: a fast drop at low concentration (active target) then a slow slope (saturated target).

In this canonical scenario, doubling the dose can **more than double** exposure because target-mediated elimination saturates.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Do not extrapolate linear PK from one dose to another.

**Pitfall —** estimating CL and V at one dose then predicting another dose as if PK were linear is wrong in the presence of TMDD. One must model the target (or at least Michaelis-Menten elimination) and cover a **range of doses**.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Target binding + internalisation = elimination route (TMDD) → nonlinear PK.
- Low [C]: fast, saturable target elimination; high [C]: saturated target, near-linear PK.
- In canonical TMDD with complex elimination, apparent clearance may decrease as dose increases; check the mechanism and data.
- Mager & Jusko model; Michaelis-Menten approximations in practice.
<!-- /step -->

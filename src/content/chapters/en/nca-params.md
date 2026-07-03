---
id: "nca-params"
slug: "nca-params"
title: "Derived parameters: CL, Vz, Vss, MRT"
description: "From AUC to parameters: clearance, volumes of distribution and mean residence time."
summary: "How NCA derives clearance, Vz, Vss and MRT from the AUC and the curve's moments."
track: "nca"
order: 82
duration: "12 min"
level: "intermediate"
tags: ["nca", "clearance", "volume", "mrt"]
slides: []
quiz:
  - prompt: "After an IV dose, clearance is computed by..."
    options:
      - "CL = Dose / AUC∞"
      - "CL = Dose × AUC"
      - "CL = Cmax / t½"
    correct: 0
  - prompt: "The mean residence time (MRT) is the ratio..."
    options:
      - "AUMC / AUC"
      - "AUC / Cmax"
      - "Dose / λz"
    correct: 0
  - prompt: "Vss (steady-state volume) is computed (IV) by..."
    options:
      - "CL × MRT"
      - "Dose / Cmax"
      - "AUC / Dose"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The AUC alone is not enough: we want the **clearance** (elimination capacity) and the **volume** (extent of distribution). NCA derives them directly, without a model.

These parameters allow comparing drugs, doses and populations.
<!-- /step -->

<!-- step:title="Intuition" viz="09_PK1C" -->
**Clearance** is the volume of blood fully cleared per unit time: the smaller the AUC for a given dose, the faster the body clears.

The **volume** relates the amount in the body to the plasma concentration: a large volume = a drug that "leaves" into the tissues.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="09_PK1C" -->
After an **IV** dose, the key relations:

$$ CL = \frac{\text{Dose}}{\text{AUC}_{0-\infty}}, \qquad V_z = \frac{CL}{\lambda_z} $$

The curve's **moments** give the mean residence time and the steady-state volume:

$$ MRT = \frac{\text{AUMC}}{\text{AUC}}, \qquad V_{ss} = CL\cdot MRT $$

**Math —** $V_z$ depends on $\lambda_z$ (terminal phase); $V_{ss}$ is independent of the elimination route and often preferred for distribution.
<!-- /step -->

<!-- step:title="Worked example" viz="09_PK1C" -->
IV dose of 100 mg, AUC∞ = 20 mg·h/L → $CL = 5$ L/h. If $\lambda_z = 0.1$ h⁻¹, then $V_z = 50$ L.

Comparing $V_z$ and $V_{ss}$ informs about distribution; comparing $CL$ to renal/hepatic function points to the elimination route.
<!-- /step -->

<!-- step:title="Common pitfall" -->
After the oral route, CL and V are "apparent".

**Pitfall —** without IV, the absorbed fraction $F$ is unknown: we obtain $CL/F$ and $V/F$ (**apparent**). Comparing an oral $CL/F$ to an IV $CL$ without accounting for $F$ is a classic error. Moments (AUMC) are also very sensitive to terminal sampling.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- CL = Dose/AUC∞ (IV); Vz = CL/λz.
- MRT = AUMC/AUC; Vss = CL·MRT (preferred for distribution).
- After the oral route, we get CL/F and V/F (apparent), because F is unknown.
- Moments (AUMC) amplify terminal-sampling errors.
<!-- /step -->

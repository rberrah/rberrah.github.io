---
id: "pbpk-distribution"
slug: "pbpk-distribution"
title: "Tissue distribution and partition coefficients"
description: "Why a molecule accumulates in certain tissues: Kp, protein binding and lipophilicity."
summary: "Tissue/plasma partition coefficients (Kp), free fraction and prediction of the volume of distribution."
track: "pbpk"
order: 71
duration: "12 min"
level: "advanced"
tags: ["pbpk", "partition", "protein-binding", "distribution"]
slides: []
quiz:
  - prompt: "The partition coefficient Kp,T describes..."
    options:
      - "the tissue/plasma concentration ratio at equilibrium"
      - "the administered dose"
      - "the renal elimination rate"
    correct: 0
  - prompt: "A highly lipophilic molecule will tend to..."
    options:
      - "accumulate in fatty tissues (large volume)"
      - "stay only in plasma"
      - "be eliminated without distributing"
    correct: 0
  - prompt: "Only the ... fraction of the drug diffuses and acts."
    options:
      - "free (unbound to proteins)"
      - "protein-bound"
      - "metabolised"
    correct: 0
---

<!-- step:title="Why this chapter" -->
**Distribution** decides where the drug goes and how much stays in the blood. In PBPK it reduces to the **partition coefficients** $K_p$ of each tissue — the link between physicochemical properties and the volume of distribution.

Predicting the $K_p$ well is often the key to a realistic PBPK model.
<!-- /step -->

<!-- step:title="Intuition" viz="01_HumanBody" -->
Each tissue "attracts" the molecule more or less: a lipophilic compound accumulates in **fat**, a protein-bound compound stays more in **plasma**.

The $K_p$ captures this affinity: it is the tissue/plasma concentration ratio once equilibrium is reached.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="04_ThreeApproaches" -->
The overall volume of distribution is rebuilt from the tissues:

$$ V_{ss} = V_p + \sum_T V_T\,K_{p,T} $$

The $K_p$ are **predicted** from lipophilicity ($\log P$), pKa and free fractions (Poulin-Theil, Rodgers-Rowland methods). The plasma **free fraction** $f_u$ drives the active part:

$$ C_{free} = f_u\cdot C_{plasma} $$

**Math —** only the **free** fraction diffuses and acts. A change in protein binding (low albumin) changes $f_u$ — hence distribution and sometimes effect.
<!-- /step -->

<!-- step:title="Worked example" viz="01_HumanBody" -->
A highly lipophilic molecule (high $\log P$) has large $K_p$ in fatty tissues → **large volume of distribution**, extended half-life, accumulation.

Conversely, a hydrophilic, strongly protein-bound compound stays in plasma: small volume, limited distribution.
<!-- /step -->

<!-- step:title="Common pitfall" -->
The free fraction is a classic trap.

**Pitfall —** reasoning on the **total** concentration while ignoring $f_u$ misleads: in hypoalbuminaemia, the free fraction rises while total concentration may look "normal". It is the **free** concentration that matters for effect and for binding interactions.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Kp,T = tissue/plasma affinity; it links physicochemistry and distribution.
- Vss = Vp + Σ V_T·Kp,T; the Kp are predicted (Poulin-Theil, Rodgers-Rowland).
- Only the free fraction (fu) diffuses and acts; albumin modulates it.
- High lipophilicity → fat accumulation, large volume, long half-life.
<!-- /step -->

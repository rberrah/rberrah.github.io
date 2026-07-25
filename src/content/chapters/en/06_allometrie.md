---
id: "allometrie"
slug: "allometrie"
title: "Covariates and allometry"
description: "How weight, renal function and other covariates explain part of the variability."
summary: "An introduction to covariate models, centering and allometric scaling."
track: "core"
order: 6
duration: "14 min"
level: "intermediate"
tags: ["covariates", "allometry", "weight", "model-building"]
slides: ["s18", "s19", "s20", "s21", "s22"]
quiz:
  - prompt: "A covariate is useful when it..."
    options:
      - "explains part of a parameter's variability"
      - "reaches the preset threshold of statistical significance"
      - "systematically reduces the model's residual error"
    correct: 0
  - prompt: "Centering weight at 70 kg helps because..."
    options:
      - "the typical parameter stays interpretable"
      - "the weight effect on clearance then disappears"
      - "the constant 70 must equal the mean weight"
    correct: 0
  - prompt: "Allometry often scales clearance with weight using an exponent near..."
    options:
      - "0.75"
      - "1.00"
      - "0.67"
    correct: 0
---

<!-- step:title="Why this chapter" slides="s19" viz="14_AllometryCentering" -->
Random effects tell us patients differ. Covariates ask whether part of that difference is **explainable**.

Weight, renal function, age, genotype, disease status, co-medications can all act on the parameters. A covariate model turns clinical information into a quantitative adjustment.
<!-- /step -->

<!-- step:title="Intuition" slides="s19,s20" viz="14_AllometryCentering" -->
A covariate is **one measured feature** (weight, renal function, age, genotype…) that helps explain why the same dosing schedule does not produce the same exposure in everyone.

The guiding idea is to link each parameter to a **physiologically coherent** covariate:

- the **volume of distribution** can be linked to **weight**, because it partly reflects the drug's diffusion into tissues, notably fat;
- **clearance** can be linked to **renal function**, which is precisely the rate of renal elimination.

**Key point —** a well-chosen covariate does not erase variability: it moves part of it from the **unexplained** (random effects) to the **explained**. It is a physiological link, not a mere correlation to exploit.
<!-- /step -->

<!-- step:title="The formula, unpacked" slides="s20,s21" viz="14_AllometryCentering" -->
A common allometric model:

$$ CL_i = CL_{70} \left(\frac{WT_i}{70}\right)^{0.75} \qquad V_i = V_{70} \left(\frac{WT_i}{70}\right)^{1} $$

**Math —** the denominator 70 **centers** the model: $CL_{70}$ is the typical clearance for a 70 kg patient. The exponents 0.75 (clearance) and 1 (volume) come from allometric theory.
<!-- /step -->

<!-- step:title="Worked example" slides="s20" viz="14_AllometryCentering" -->
In a pediatric or mixed-weight dataset, weight often explains a visible part of the clearance and volume variability.

After adding allometry, the random effect on clearance can **shrink**: the model has moved variability from "unexplained patient difference" to "explained by weight".

**Note — in pediatrics, weight is not enough.** It is often used as a *proxy* for maturity, but organs do not all mature at the same pace: renal function and hepatic enzymes develop over weeks to years. In neonates and infants, allometry is therefore complemented by a **maturation function** (typically sigmoidal in post-menstrual age), to link clearance to **organ** maturation, not to weight alone.
<!-- /step -->

<!-- step:title="Common pitfall" slides="s22" -->
Do not add a covariate just because it is available.

**Pitfall —** a covariate should be biologically plausible, supported by the data and checked with diagnostics. Automated forward/backward selection helps but does not replace interpretation.

**In the clinic —** a statistically significant covariate does not imply **causality**. It may only be a **proxy** for another factor: **weight** is often a proxy for **fat mass**; **ethnicity**, a proxy for **genetic factors** (enzyme or transporter polymorphisms). The model captures a correlation useful for prediction, without proving the underlying mechanism.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Covariates explain part of a parameter's variability, through a physiological link (volume ↔ tissue diffusion, clearance ↔ renal function).
- Centering keeps typical values interpretable.
- Allometry is a weight-based power-law scaling rule; in pediatrics, complement it with a maturation function (organs mature at different paces).
- Significant does not mean causal: a covariate is often a proxy (weight ↔ fat mass, ethnicity ↔ genetics).
<!-- /step -->

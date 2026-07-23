---
id: "valid-gof"
slug: "valid-gof"
title: "Diagnostic (goodness-of-fit) plots"
description: "Reading a model by eye: observations vs predictions, CWRES residuals and bias detection."
summary: "Goodness-of-fit plots: DV vs PRED/IPRED, CWRES vs time/PRED, and what they reveal."
track: "valid"
order: 90
duration: "12 min"
level: "intermediate"
tags: ["validation", "diagnostic-plots", "gof", "residuals"]
slides: []
quiz:
  - prompt: "On an observations vs predictions plot, a good model gives..."
    options:
      - "a symmetric cloud scattered around the identity line"
      - "a cloud curving below the diagonal at high values"
      - "a perfect alignment with no scatter around the line"
    correct: 0
  - prompt: "A trend of CWRES versus time indicates..."
    options:
      - "a misspecified structural model"
      - "an ill-sized residual-error model"
      - "underestimated random-effect variance"
    correct: 0
  - prompt: "Well-specified CWRES should be..."
    options:
      - "centred on 0, without trend, mostly within ±2"
      - "centred on 0 but all confined within ±1, no exception"
      - "centred on 0 but rising with the predicted concentration"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Before trusting a model, we **look** at it. Diagnostic (goodness-of-fit, GOF) plots reveal at a glance the biases that numbers alone hide.

It is the first — and often most telling — step of model validation.
<!-- /step -->

<!-- step:title="Intuition" viz="50_GOFPlots" -->
Two simple questions: does the model **predict accurately**? Are its **errors neutral**?

A good model aligns observations and predictions on the **diagonal**, and leaves residuals **centred on zero**, without structure. Raise the "misspecification" and watch a systematic bias appear.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="50_GOFPlots" -->
The canonical plots:

- **DV vs PRED** (population) and **DV vs IPRED** (individual): cloud around the identity $y=x$.
- **CWRES vs time** and **CWRES vs PRED**: conditional weighted residuals should be **centred on 0**, without trend, ~95% within $[-2, 2]$.
- **|IWRES| vs PRED**: detects a wrong **residual error** (heteroscedasticity).

**Note —** **CWRES** (Hooker et al., *Pharm Res* 2007) replace WRES because they account for the model's non-linearity.
<!-- /step -->

<!-- step:title="Worked example" viz="50_GOFPlots" -->
If the **DV vs PRED** points curve (the model underpredicts high concentrations), the structural model is at fault: perhaps a compartment or a non-linearity is missing.

A trend of **CWRES over time** (positive early, negative late) betrays a poor absorption or elimination phase.
<!-- /step -->

<!-- step:title="Case study: reading the patterns" viz="62_ResidualPatterns" -->
Each residual **shape** has a cause and a fix: a **U** (or inverted U) = wrong **structure** (missing compartment); a **trumpet** (flaring cloud) = wrong **error model** (additive → combined); a **slope** = bias, often a **missing covariate**.

Cycle through the patterns. The full pattern → cause → fix guide is detailed in the "Case study: improve the model" chapter.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A nice IPRED vs DV is not enough.

**Pitfall —** **individual** plots (IPRED) may look perfect through **overfitting** (high shrinkage) while the population model is poor. Always inspect **population** diagnostics (PRED, CWRES) and beware substantial shrinkage.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- GOF plots visually reveal a model's biases.
- DV vs PRED/IPRED: cloud on the diagonal; CWRES: centred on 0, no trend.
- A CWRES trend = structural or residual misspecification.
- Caution: a perfect IPRED can come from high shrinkage.
<!-- /step -->

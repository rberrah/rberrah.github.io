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
prerequisites: ["erreur-residuelle"]
glossary: ["GOF","PRED / IPRED","Résidus (WRES/CWRES/IWRES/NPDE)","Shrinkage"]
sources: ["hooker-cwres","savic-karlsson-shrinkage","mould-upton"]
updated_on: "2026-10-09"
reviewed_on: "2026-10-09"
review_type: "author"
reviewed_hash: "fcf72902b313550f7cda4fbc2f2e76a839163846c5fef24d3dce589f1262a16d"
quiz:
  - prompt: "On an observations vs predictions plot, a good model gives..."
    options:
      - "a symmetric cloud scattered around the identity line"
      - "a cloud curving below the diagonal at high values"
      - "a perfect alignment with no scatter around the line"
    correct: 0
  - prompt: "A trend of CWRES versus time first suggests..."
    options:
      - "a misspecification hypothesis to investigate"
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
- **CWRES vs time** and **CWRES vs PRED**: under the approximation that CWRES follow $mathcal{N}(0,1)$, they are expected to be **centred on 0**, without trend, with about 95% within $[-2, 2]$. This is a diagnostic guide, not an acceptance rule.
- **|IWRES| vs PRED**: detects a wrong **residual error** (heteroscedasticity).

**Note —** **CWRES** (Hooker et al., *Pharm Res* 2007) were proposed to improve the behaviour of weighted residuals in nonlinear models; the diagnostic still depends on the approximation and estimation method.
<!-- /step -->

<!-- step:title="Worked example" viz="50_GOFPlots" -->
If the **DV vs PRED** points curve (the model underpredicts high concentrations), the structural model becomes suspect: perhaps a compartment, non-linearity, covariate or residual-error form is missing.

A trend of **CWRES over time** (positive early, negative late) is compatible with a poor absorption or elimination phase, but it is not a unique signature.
<!-- /step -->

<!-- step:title="Case study: reading the patterns" viz="62_ResidualPatterns" -->
Each residual **shape** points to hypotheses to test: a **U** (or inverted U) often suggests wrong **structure**; a **trumpet** (flaring cloud) suggests an unsuitable **error model**; a **slope** suggests bias, sometimes a **missing covariate**.

Cycle through the patterns. The full pattern → cause → fix guide is detailed in the "Case study: improve the model" chapter.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A nice IPRED vs DV is not enough.

**Pitfall —** **individual** plots (IPRED) may look perfect while EBEs carry little information, especially with substantial **shrinkage**. Shrinkage is not overfitting by itself: it mainly warns that individual diagnostics are weak. Always inspect **population** diagnostics (PRED, CWRES, VPC/NPDE).
<!-- /step -->

<!-- step:title="Key takeaways" -->
- GOF plots visually reveal a model's biases.
- DV vs PRED/IPRED: cloud on the diagonal; CWRES: centred on 0, no trend.
- A CWRES trend suggests structural or residual misspecification, to be confirmed.
- Caution: a perfect IPRED with high shrinkage may be uninformative.
<!-- /step -->

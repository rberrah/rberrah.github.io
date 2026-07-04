---
id: "valid-diagnostics"
slug: "valid-diagnostics"
title: "A panorama of goodness-of-fit plots"
description: "Read every goodness-of-fit plot — good vs bad model — at a glance."
summary: "An illustrated catalogue: obs vs pred, residuals (CWRES/IWRES), VPC, NPDE and random-effect distributions."
track: "valid"
order: 95
duration: "15 min"
level: "advanced"
tags: ["validation", "gof", "diagnostic-plots", "residuals"]
prerequisites: ["valid-gof", "valid-vpc", "valid-npde"]
glossary: ["GOF", "PRED / IPRED", "Résidus (WRES/CWRES/IWRES/NPDE)", "VPC", "Binning"]
slides: []
quiz:
  - prompt: "No single diagnostic plot is enough; we cross-check them because..."
    options:
      - "each reveals a different kind of defect (structure, variability, error)"
      - "they all say the same thing"
      - "it is an arbitrary regulatory duty"
    correct: 0
  - prompt: "On |IWRES| vs predictions, a rising trend signals..."
    options:
      - "a wrong residual-error model (heteroscedasticity)"
      - "a good fit"
      - "a dosing error"
    correct: 0
  - prompt: "The distribution of random effects (η) should ideally be..."
    options:
      - "centred on 0 and roughly symmetric/Gaussian"
      - "always bimodal"
      - "strictly positive"
    correct: 0
---

<!-- step:title="Why this chapter" -->
No **single test** validates a model. We **cross-check** several plots, because each highlights a different defect: the **structural** model, the **variability**, the **residual error**, the **covariates**.

This chapter is a map: for each plot, what a **good** model looks like, and the warning sign of a **bad** one.
<!-- /step -->

<!-- step:title="Intuition" viz="50_GOFPlots" -->
Two questions guide everything: does the model **predict accurately**? Are its **errors neutral**?

A good model aligns observations and predictions on the diagonal, and leaves residuals centred on zero, without structure. Raise the "misspecification" and watch a systematic bias appear — that is what each plot hunts.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="50_GOFPlots" -->
The **catalogue** of plots and how to read them:

- **DV vs PRED / DV vs IPRED** — accuracy (population / individual). Good: cloud **on the diagonal**. Bad: **curved** cloud (missing compartment or non-linearity).
- **CWRES vs time** and **CWRES vs PRED** — neutrality. Good: centred on **0**, no trend, ~95% within $[-2,2]$. Bad: a **trend** (wrong structural model).
- **|IWRES| vs PRED** — the **residual-error** model. Good: a **flat** cloud. Bad: a **funnel** (heteroscedasticity → switch from additive to combined error).
- **Histogram / QQ-plot of residuals** — normality. Good: a centred bell. Bad: skew, heavy tails.
- **VPC / pcVPC** — does the model **regenerate** the data? (dedicated chapter).
- **NPDE** — simulation-based residuals, should follow $\mathcal{N}(0,1)$ (dedicated chapter).
- **Distribution of η** and **η vs covariates** — variability and missing covariates.

**Ref —** CWRES: Hooker et al., *Pharm Res* 2007. This panorama ties together the GoF, VPC, NPDE and shrinkage chapters.
<!-- /step -->

<!-- step:title="The VPC in practice" viz="17_VPCCrashTest" -->
The **VPC** confronts observed percentiles (5%, 50%, 95%) with the **bands** simulated under the model.

Good model: observed percentiles fall **inside** the tunnels. Median out of band → a **structural** defect; extreme percentiles too tight → **variability** underestimated. Push the points out and watch the diagnosis flip.
<!-- /step -->

<!-- step:title="Worked example" viz="52_NPDE" -->
The **NPDE** (simulation-based residuals) should form a standard Gaussian. A **mean shift** in a subgroup (e.g. renal impairment) betrays a **missing covariate**; a **spread** signals variability captured poorly.

Finally, the **distribution of η** should be centred on 0 and symmetric — a separate bump suggests an unmodelled **subpopulation** (metaboliser phenotype).
<!-- /step -->

<!-- step:title="Common pitfall" -->
Individual plots can lie.

**Pitfall —** a perfect **DV vs IPRED** can come from high **shrinkage** (the model "sticks" by overfitting), not from a good population model. Always inspect **population** diagnostics (PRED, CWRES, VPC) and check shrinkage before interpreting η vs covariates.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Cross-check several plots: each reveals a different defect.
- DV vs PRED/IPRED (accuracy); CWRES (neutrality); |IWRES| (residual error); VPC/NPDE (simulation).
- The η distribution should be centred/symmetric; η vs covariates reveals missing covariates.
- Caution: a perfect IPRED from shrinkage; rely on population diagnostics.
<!-- /step -->

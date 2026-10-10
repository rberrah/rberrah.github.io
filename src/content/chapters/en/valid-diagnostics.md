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
prerequisites: ["valid-gof","valid-vpc","valid-npde"]
glossary: ["GOF","PRED / IPRED","Résidus (WRES/CWRES/IWRES/NPDE)","VPC","Binning"]
slides: []
sources: ["hooker-cwres","karlsson-holford-vpc","brendel-npde","savic-karlsson-shrinkage"]
updated_on: "2026-10-10"
reviewed_on: "2026-10-10"
review_type: "author"
reviewed_hash: "46446a6964b42e72f55f99be7a5d8040f463f6810793c0a61f83cc5550c1f801"
quiz:
  - prompt: "No single diagnostic plot is enough; we cross-check them because..."
    options:
      - "each is sensitive to several components and their consistency narrows the hypotheses"
      - "they all probe the same defect, we just stack them to gain power"
      - "only the VPC truly matters, the others merely confirm it"
    correct: 0
  - prompt: "On |IWRES| vs predictions, a rising trend notably raises suspicion of..."
    options:
      - "residual-error misspecification, to be checked against other diagnostics"
      - "with certainty, a missing structural compartment"
      - "with certainty, a missing covariate on clearance"
    correct: 0
  - prompt: "The distribution of random effects (η) should ideally be..."
    options:
      - "centred on 0 and roughly symmetric/Gaussian"
      - "centred on the parameter's typical value, not zero"
      - "strictly positive, like the PK parameters themselves"
    correct: 0
---

<!-- step:title="Why this chapter" -->
No **single test** validates a model. We **cross-check** several plots because each is sensitive, to different degrees, to the **structural** model, **variability**, **residual error**, design and **covariates**.

This chapter is a map: for each plot, what a **good** model looks like, and the warning sign of a **bad** one.
<!-- /step -->

<!-- step:title="Intuition" viz="50_GOFPlots" -->
Two questions guide everything: does the model **predict accurately**? Are its **errors neutral**?

Under a correctly specified model and diagnostic, approximate agreement with the diagonal and residuals without an obvious pattern are expected. Raise the "misspecification" to create an illustrative bias; in a real analysis, such a pattern opens hypotheses rather than identifying its cause by itself.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="50_GOFPlots" -->
The **catalogue** of plots and how to read them:

- **DV vs PRED / DV vs IPRED** — accuracy (population / individual). A curved cloud may be compatible with missing structure, a covariate or non-linearity.
- **CWRES vs time** and **CWRES vs PRED** — neutrality. When the $\mathcal{N}(0,1)$ approximation is reasonable: centred on **0**, no trend, about 95% within $[-2,2]$. A **trend** suggests structural, covariate or residual misspecification to investigate; this guide is not an acceptance test.
- **|IWRES| vs PRED** — information about the **residual-error** model. A funnel notably raises suspicion of a poorly described conditional variance, but structure, unusual data and shrinkage must also be examined.
- **Histogram / QQ-plot of residuals** — skewness or heavy tails are compatible with several distributional or model defects, without a unique causal diagnosis.
- **VPC / pcVPC** — does the model **regenerate** the data? (dedicated chapter).
- **NPDE** — simulation-based residuals, should follow $\mathcal{N}(0,1)$ (dedicated chapter).
- **Distribution of η** and **η vs covariates** — hypotheses about variability and possible covariates, interpreted with shrinkage.

**Ref —** CWRES: Hooker et al., *Pharm Res* 2007. This panorama ties together the GoF, VPC, NPDE and shrinkage chapters.
<!-- /step -->

<!-- step:title="The VPC in practice" viz="17_VPCCrashTest" -->
The **VPC** confronts observed percentiles (5%, 50%, 95%) with the **bands** simulated under the model.

Repeated discrepancies between observed percentiles and simulated bands indicate predictive misspecification to investigate. A median outside a band may be compatible with structure, covariates, design or dose; poorly reproduced extremes may involve IIV, residual error, binning or other components. A VPC does not separate these causes by itself.
<!-- /step -->

<!-- step:title="Worked example" viz="52_NPDE" -->
Under their calculation assumptions, **NPDE** are expected to be close to a standard Gaussian. A **mean shift** in a subgroup is compatible, among other explanations, with a missing covariate or structure; unexpected spread raises suspicion of predictive misspecification without identifying its component by itself.

Finally, a separate bump in the **η distribution** may suggest a subpopulation, a covariate, model misspecification or an estimation artefact. Other evidence is needed to confirm that hypothesis.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Individual plots can lie.

**Pitfall —** a perfect **DV vs IPRED** can be misleading with high **shrinkage**: individual diagnostics become weakly informative, without automatically meaning overfitting. Always inspect **population** diagnostics (PRED, CWRES, VPC) and check shrinkage before interpreting η vs covariates.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Cross-check several plots: no pattern identifies a unique cause by itself.
- DV vs PRED/IPRED (accuracy); CWRES (neutrality); |IWRES| (residual error); VPC/NPDE (simulation).
- The η distribution and η-versus-covariate plots generate hypotheses that must be read with shrinkage and other diagnostics.
- Caution: a perfect IPRED from shrinkage; rely on population diagnostics.
<!-- /step -->

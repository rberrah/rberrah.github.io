---
id: "tools-nlmixr2"
slug: "tools-nlmixr2"
title: "nlmixr2 — the open source (R)"
description: "Estimate in R, for free: SAEM and FOCEI, the rxode2 engine and the whole R ecosystem."
summary: "nlmixr2: the open-source R alternative, with SAEM/FOCEI, rxode2 for ODEs and R diagnostics."
track: "nlmixr2"
order: 1
duration: "11 min"
level: "intermediate"
tags: ["tools", "nlmixr2", "rxode2", "open-source"]
prerequisites: ["tools-algorithms"]
glossary: ["nlmixr2 / rxode2", "SAEM", "FOCE-I"]
slides: []
quiz:
  - prompt: "nlmixr2 stands out mainly for..."
    options:
      - "being open-source, entirely in R"
      - "its high licence cost"
      - "the absence of any algorithm"
    correct: 0
  - prompt: "nlmixr2 offers..."
    options:
      - "several algorithms, including SAEM and FOCEI"
      - "only simulation"
      - "no estimation"
    correct: 0
  - prompt: "The ODE engine under nlmixr2 is..."
    options:
      - "rxode2 (usable standalone to simulate)"
      - "a spreadsheet"
      - "NM-TRAN"
    correct: 0
---

<!-- step:title="Why this chapter" -->
**nlmixr2** is the **open-source**, **free** alternative, entirely in **R**. It brings the power of commercial engines (SAEM, FOCEI) together with integration into the whole R ecosystem (graphics, data wrangling, reproducibility).

It is the ideal tool to **learn**, **prototype** and **share** a model without a licence barrier.
<!-- /step -->

<!-- step:title="Intuition" viz="67_SAEMConvergence" -->
Everything happens in **R**: the model is a readable **R function**, you call `nlmixr2(...)` with the chosen method, and the results are R objects — directly usable with `ggplot2`, `xpose`, `ggPMX`.

You stay in **one language**, from data to graphics, which simplifies reproducibility.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="67_SAEMConvergence" -->
The model and estimation in R:

```r
mod <- function() {
  ini({
    tcl <- log(0.13); tv <- log(8); tka <- log(1)
    eta.cl ~ 0.1; eta.v ~ 0.1
    prop.err <- 0.1
  })
  model({
    cl <- exp(tcl + eta.cl); v <- exp(tv + eta.v); ka <- exp(tka)
    d/dt(depot)  = -ka*depot
    d/dt(centr)  =  ka*depot - (cl/v)*centr
    cp = centr/v
    cp ~ prop(prop.err)
  })
}
fit <- nlmixr2(mod, data, est = "saem")   # or est = "focei"
```

`est = "saem"` or `"focei"`: nlmixr2 shares the **same** algorithms as Monolix/NONMEM. The ODE engine is **rxode2**, usable standalone to simulate.

**Note —** ref.: the nlmixr2 project (Fidler, Wang, Hallow et al.), open-source (R); integrates with rxode2, xpose and ggPMX.
<!-- /step -->

<!-- step:title="Worked example" viz="67_SAEMConvergence" -->
A student or a small team can **do everything** in nlmixr2 — estimate, simulate (rxode2), diagnose (ggPMX) — without a licence. Many **prototype** in nlmixr2 then **confirm** in NONMEM for the regulatory dossier, the estimates being very close.

It is also an excellent **teaching** aid: the R code is readable and reproducible.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Free does not mean careless.

**Pitfall —** as everywhere, a run that **converges** proves nothing without diagnostics. And you must **document the versions** (nlmixr2, rxode2, R) for reproducibility — the algorithms evolve. The OFV remains comparable only with the **same method**.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- nlmixr2: the open-source, free alternative, entirely in R.
- Model = an R function; SAEM and FOCEI algorithms (same families as Monolix/NONMEM).
- rxode2 ODE engine (also for simulation); R ecosystem (xpose, ggPMX).
- Ideal to learn/prototype/share; document versions; always diagnose.
<!-- /step -->

---
id: "tools-nlmixr2"
slug: "tools-nlmixr2"
title: "nlmixr2 — the open source (R)"
description: "Estimate in R with several estimator families, the rxode2 engine and the R ecosystem."
summary: "nlmixr2: an open-source R platform with several estimators, rxode2 for ODEs and R diagnostics."
track: "nlmixr2"
order: 230
duration: "11 min"
level: "intermediate"
tags: ["tools", "nlmixr2", "rxode2", "open-source"]
prerequisites: ["tools-algorithms"]
glossary: ["nlmixr2 / rxode2","SAEM","FOCE-I"]
slides: []
sources: ["nlmixr2","fidler-nlmixr","kuhn-lavielle-saem","wang-nonmem-methods"]
software_verified_on: "2026-10-12"
software_version: "nlmixr2 7.0.1; nlmixr2est 7.1 documentation"
reviewed_on: "2026-10-12"
review_type: "author"
review_pending: true
reviewed_hash: "da06bbc7fa75507929758ec50bb335c3be47a0657d5e21326d3963eb4dd54174"
quiz:
  - prompt: "nlmixr2 stands out mainly for..."
    options:
      - "being open-source, entirely in R"
      - "a paid commercial licence, like NONMEM"
      - "a closed engine, separate from the R world"
    correct: 0
  - prompt: "nlmixr2 offers..."
    options:
      - "several algorithms, including SAEM and FOCEI"
      - "only SAEM, with no equivalent of FOCEI"
      - "a single Bayesian MCMC engine, no SAEM"
    correct: 0
  - prompt: "The ODE engine under nlmixr2 is..."
    options:
      - "rxode2 (usable standalone to simulate)"
      - "NM-TRAN, the NONMEM control translator"
      - "mlxtran, the Monolix model language"
    correct: 0
---

<!-- step:title="Why this chapter" -->
**nlmixr2** is an **open-source** nonlinear mixed-effects modelling suite in **R**. It provides methods including SAEM and FOCEI, uses rxode2 for dynamic models, and integrates with the R ecosystem for data preparation, graphics and reproducibility.

The absence of a commercial licence facilitates learning, prototyping and sharing. Suitability for an analysis still depends on the model, estimation method, diagnostics, software versions and computing environment.
<!-- /step -->

<!-- step:title="Intuition" viz="67_SAEMConvergence" -->
Everything happens in **R**: the model is a readable **R function**, you call `nlmixr2(...)` with the chosen method, and the results are R objects — directly usable with `ggplot2`, `xpose`, `ggPMX`.

A workflow can remain in **one language**, from data to graphics. This can facilitate traceability when code, data, versions and controls are archived.
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

`est = "saem"` and `"focei"` are only two common choices. Current documentation also distinguishes FO/FOI, FOCE/FOCEI/FOCEP, Laplace/AGQ, `nlme`, `posthoc`, and research methods based on importance sampling, nonparametric estimation, or variational inference. They have their own implementations, settings, conventions, and maturity levels. The ODE engine is **rxode2**, usable standalone to simulate.

**Version checked: nlmixr2 7.0.1, on 12 October 2026.** The 7.x line changed several FOCEI and SAEM defaults and introduced experimental engines. A reproducible result must therefore archive the version, `est =` and the complete control object.

**Note —** ref.: the nlmixr2 project (Fidler, Wang, Hallow et al.), open-source (R); integrates with rxode2, xpose and ggPMX.
<!-- /step -->

<!-- step:title="Worked example" viz="67_SAEMConvergence" -->
For workflows supported by these packages, a student or small team can estimate with nlmixr2, simulate with rxode2 and build diagnostics in R without a commercial licence. Some teams **prototype** in this environment and then compare in another tool according to their workflow; similarity of estimates must be checked model by model, with the same data, assumptions and OFV calculation method.

Explicit R code can support **teaching** and reproducibility, but the approximations still need to be explained and the numerical results checked.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Free does not mean careless.

**Pitfall —** as everywhere, a run that **converges** proves nothing without diagnostics. And you must **document the versions** (nlmixr2, rxode2, R) for reproducibility — the algorithms evolve. The OFV remains comparable only with the **same method**.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- nlmixr2: an open-source nonlinear mixed-effects modelling suite in R.
- Model = an R function; several estimator families, including SAEM, FOCEI, Laplace/AGQ and research methods that require independent checking.
- rxode2 ODE engine (also for simulation); R ecosystem (xpose, ggPMX).
- Useful for learning, prototyping and sharing when appropriate; document versions and controls; always diagnose.
<!-- /step -->

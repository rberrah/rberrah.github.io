---
id: "nlmixr2-moteur"
slug: "nlmixr2-moteur"
title: "nlmixr2 — one model, several estimators"
description: "est = focei, saem, nlme or posthoc: switching algorithm without touching the model, what rxode2 compiles behind it, and the conditions required to compare reported OFVs."
summary: "The model is an R object and the estimator an argument: several methods can consume the same rxode2-compiled code, with objectives and conventions that must be documented."
track: "nlmixr2"
order: 234
duration: "10 min"
level: "intermediate"
tags: ["nlmixr2", "rxode2", "saem", "focei", "estimation"]
prerequisites: ["tools-nlmixr2"]
glossary: ["nlmixr2 / rxode2","FOCE-I","SAEM"]
slides: []
sources: ["nlmixr2","fidler-nlmixr","wang-rxode","lindstrom-bates"]
software_verified_on: "2026-10-12"
software_version: "nlmixr2 7.0.1; nlmixr2est 7.1 documentation"
reviewed_on: "2026-10-12"
review_type: "author"
review_pending: true
reviewed_hash: "da8ad781e509e7faa5fa8bac78faf75538a0a713dd45c93a01795f3e3c082cf4"
quiz:
  - prompt: "You fit the same model twice, once with est = saem and once with est = focei, and subtract the two reported OFVs. What does that difference measure?"
    options:
      - "It is not a valid LRT: a common FOCEi evaluator does not turn fits obtained with different estimators into comparable maxima from one nested-model sequence."
      - "A valid likelihood ratio test as soon as the two models are nested: nlmixr2 brings both OFVs onto the same scale, which makes their difference directly interpretable."
      - "The approximation gap between SAEM and FOCEI: it simply has to be subtracted from the ΔOFV before comparing the latter to the one degree of freedom χ² threshold to conclude."
    correct: 0
  - prompt: "What exactly does est = posthoc do in nlmixr2?"
    options:
      - "It fixes the population parameters at the values in the ini block and estimates only the individual η: it is a posterior Bayesian estimation, not a population fit."
      - "It re-estimates the population parameters from the individual η of the previous run, which refines the θ without launching a full population optimisation again."
      - "It restarts a FOCEI estimation from the estimates of the previous run, which mainly serves to check that an optimum already found is not merely a local one."
    correct: 0
  - prompt: "On a nonlinear, weakly informative model, why can SAEM be more robust than FOCEI?"
    options:
      - "It replaces repeated conditional-mode searches with a stochastic procedure, which can better tolerate some difficult surfaces; its convergence and identifiability still require checking."
      - "It solves the system with a more tolerant integrator, which absorbs the stiffness that the FOCEI solver cannot get past without collapsing its integration step."
      - "It guarantees a correct estimate whenever it returns numerical parameters, even when the data cannot identify the model parameters separately."
    correct: 0
---

<!-- step:title="Why this chapter" -->
In NONMEM, the estimator is a line of the control stream. In Monolix, it is the architecture of the software itself. In nlmixr2, it is a **function argument**. `est = "focei"`, `"saem"`, `"nlme"`, and `"posthoc"` are four representative workflows among the available methods. One word changes, the model does not move a line, and another algorithm takes over.

nlmixr2 separates the **description** of the model from its **evaluation**: the `model({})` block describes the system, whereas `est =` selects the estimation method. This separation allows several estimators to use the same model code while retaining method-specific controls and conventions.

The current `nlmixr2est` 7.1 documentation exposes several families: **FO/FOI**, **FOCE/FOCEI/FOCEP**, **Laplace/AGQ**, **SAEM**, `nlme`, and `posthoc`. It also lists research methods based on importance sampling (`imp`, `impmap`, `qrpem`), nonparametric methods (`npag`, `npb`), and mu-referenced, IRLS, or variational variants. These names do not all have the same maturity or purpose: methods labelled as research methods require independent checking, and `nlmixr2AllEst()` also includes technical aliases and optimizers.

The cost is just as real, and less visible. These four workflows may return numbers displayed as `OFV`, in the same summary, with the same number of decimals. Nothing will remind you which came from where. This chapter explains these examples without claiming to exhaust the estimators available in nlmixr2.
<!-- /step -->

<!-- step:title="Intuition" viz="66_FOCELinearization" -->
The population-estimation methods presented here handle **the same integral** in different ways. For each subject, the likelihood of the observations requires averaging over every $\eta$ compatible with the population, and that integral has no closed form as soon as the model is nonlinear in $\eta$ — a frequent situation in PK. The model says nothing about that integral: it merely supplies what is needed to write it down. What `est =` picks is the **way to approximate or sample it**; `posthoc` is the distinct case where population parameters remain fixed.

**FOCEI uses a local approximation.** It replaces the model by its tangent at the individual mode $\hat{\eta}_i$, which makes the integrand Gaussian and the integral analytical. The price: $\hat{\eta}_i$ must be found for every subject at every population iteration, and the derivatives $\partial f / \partial \eta$ are required. An optimisation loop inside an optimisation loop.

**SAEM does not rely on the same deterministic local approximation.** It treats individual parameters as missing data and simulates them by MCMC instead of repeatedly searching for their conditional mode. Its inner loop proposes an $\eta$, evaluates the model, then accepts or rejects the proposal. It therefore does not use the same derivatives or inner optimisation as FOCEI.

**nlme uses another local approximation**, through the Lindstrom-Bates alternating algorithm, which chains a penalised nonlinear least squares step and a linear mixed effects step. In practice it lands on an approximation very close to FOCE **without** interaction.

**posthoc never faces it.** The population parameters are fixed; all that remains is to find the $\hat{\eta}_i$. There is no population likelihood left to maximise.

:::key
Choosing an engine is not choosing a model. All four fit the same system of equations to the same data. They differ in what they do with the integral — hence in their robustness, their cost, and above all in the **function** whose value they hand you at the finish line. The model is shared; the number displayed is not.
:::
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="16_SAEMCycle" -->
The model, written once, defines only two densities: that of the observations given the individual parameters, $p(y_i \mid \psi_i)$, and that of the individual parameters in the population, $p(\psi_i \mid \theta)$. The population likelihood follows mechanically, and it is the same for everyone:

$$ L(\theta) = \prod_{i=1}^{N} \int p(y_i \mid \psi_i)\; p(\psi_i \mid \theta)\; d\psi_i $$

Now re-read the structure of an nlmixr2 model with that formula in mind. The `ini({})` block fixes the starting point of $\theta$ and the structure of $p(\psi_i \mid \theta)$; the `model({})` block defines $p(y_i \mid \psi_i)$. **Neither says a word about the integral.** The $\int$ sign belongs to neither block — it belongs to the engine. That is the entire justification for the `est =` argument.

| `est =` | Handling of the integral | Expansion point | Needs $\partial f / \partial \eta$ |
|---|---|---|---|
| `"focei"` | first-order Taylor + $\eta$–$\varepsilon$ interaction | $\hat{\eta}_i$ | yes |
| `"saem"` | MCMC sampling, no linearisation | — | no |
| `"nlme"` | Lindstrom-Bates (alternating PNLS/LME), $\approx$ FOCE without interaction | $\hat{\eta}_i$ | yes |
| `"posthoc"` | no integral: $\theta$ and $\Omega$ fixed, only the $\hat{\eta}_i$ are sought | — | yes |

The model, then the four calls:

```r
mod <- function() {
  ini({
    tka <- log(1.1);  tcl <- log(0.135);  tv <- log(7.8)
    eta.cl ~ 0.09
    eta.v  ~ 0.04
    prop.err <- 0.12
  })
  model({
    ka <- exp(tka)
    cl <- exp(tcl + eta.cl)
    v  <- exp(tv  + eta.v)
    d/dt(depot) = -ka * depot
    d/dt(centr) =  ka * depot - (cl / v) * centr
    cp = centr / v
    cp ~ prop(prop.err)
  })
}

f1 <- nlmixr2(mod, dat, est = "focei",
              control = foceiControl(maxOuterIterations = 5000, covMethod = "r,s"))
f2 <- nlmixr2(mod, dat, est = "saem",
              control = saemControl(nBurn = 500, nEm = 300, nmc = 5, seed = 20260716))
f3 <- nlmixr2(mod, dat, est = "nlme")
f4 <- nlmixr2(mod, dat, est = "posthoc")
```

`mod` has not moved. Each engine has its own control object — `foceiControl()`, `saemControl()`, `nlmeControl()` — and accepts only its own: the settings do not carry over, because the algorithms do not have the same levers.

**What rxode2 compiles.** Between `f1` and `f2`, what changes is not the model: it is the model's consumer. rxode2 translates the `model({})` block into **C**, compiles it into a shared library (`.dll` on Windows, `.so` elsewhere) and loads it into the R session. The cost is paid once; the tens of thousands of solves that follow are calls into machine code, not into an interpreter. It is also why a compiler is required — Rtools on Windows — and why the first fit of a model pauses for a reason that has nothing to do with estimation.

SAEM uses **forward** solves. FOCEI additionally needs $\partial f / \partial \eta$; rxode2 therefore symbolically differentiates the system and compiles the **forward sensitivity equations**. The source file is identical, but the compiled object may differ. An `est = "focei"` following an `est = "saem"` may therefore require compilation of the additional sensitivities used by FOCEI.

**What happens to the metrics.** SAEM estimates parameters without itself providing a single value that is directly comparable with every output from other engines. Depending on controls and version, nlmixr2 can add several post-estimation evaluations. With `logLik = FALSE`, an OBJF can be evaluated using the FOCEi approximation at the SAEM estimates; with `logLik = TRUE`, a log-likelihood can be evaluated by Gauss-Hermite quadrature.

```r
# the OFV returned after a SAEM run: by default, the FOCEi objective at the SAEM estimates
f2 <- nlmixr2(mod, dat, est = "saem", control = saemControl(logLik = FALSE))

# or a genuine Gauss-Hermite quadrature: nnodesGq = 1 gives Laplace
f2q <- nlmixr2(mod, dat, est = "saem",
               control = saemControl(logLik = TRUE, nnodesGq = 3, nsdGq = 1.6))
```

Option names are version-dependent: the examples use the current `nnodesGq` / `nsdGq` convention. Check your installed documentation before recycling an old script.

`OBJF` and `logLik` are therefore not synonyms. AIC and BIC derive from a specified log-likelihood together with parameter-count and observation-count conventions; they do not automatically describe the same evaluation as the displayed OBJF. “SAEM OBJF by FOCEi approximation” identifies only the evaluator used for that OBJF at the SAEM estimates. It does not make every likelihood available in the object a FOCEi evaluation. Before comparing values, record the **estimator, evaluator, metric, sign and constant convention, controls and version**.

| Output after `est = "saem"` | What it represents | Correct interpretation |
|---|---|---|
| SAEM parameters | $\theta$, $\Omega$ and residual-error estimates obtained by stochastic-approximation EM | the result of SAEM estimation |
| `OBJF` with `logLik = FALSE` | FOCEi approximation evaluated **at the SAEM parameter estimates** in the configuration described here | a post-estimation diagnostic, not a “SAEM likelihood” or proof of LRT comparability |
| `logLik`, AIC and BIC | quantities tied to the likelihood evaluation retained by the object and its calculation conventions | identify the evaluator explicitly; do not infer it from the `OBJF` label alone |
| `saemControl(logLik = TRUE)` | a post-estimation Gauss-Hermite quadrature evaluation (`nnodesGq`, `nsdGq`) | a distinct approximation whose cost rises rapidly with dimension |
| `est = "imp"`, `"impmap"` or `"qrpem"` | importance-sampling estimators available in the 7.x line and still labelled research methods | do not confuse them with a likelihood merely evaluated after SAEM; report method, version and settings |

The examples were rechecked against nlmixr2 7.0.1 / nlmixr2est 7.1 documentation. FOCEI and SAEM defaults changed in the 7.x line; reproducing an older run therefore requires the package version and control objects, not only the random seed.

:::note
Ref.: Fidler M. et al., *CPT Pharmacometrics Syst Pharmacol* 2019, for the design of nlmixr and the sharing of one model across several estimators; Wang W., Hallow K. M., James D. A., *CPT Pharmacometrics Syst Pharmacol* 2016, for RxODE and the compilation of the ODE system; Lindstrom M. J., Bates D. M., *Biometrics* 1990, for the alternating algorithm underlying `est = "nlme"`; nlmixr2 project documentation for the names of the methods and control options.
:::
<!-- /step -->

<!-- step:title="Worked example" viz="15_OFVGame" -->
**Teaching scenario, not a reproduced benchmark.** Imagine the same one-compartment oral model fitted in turn with FOCEI, SAEM, nlme, and posthoc. Estimates may be close with informative data, but runtimes depend on hardware and settings, and values labelled `OFV` do not become comparable because they appear in the same table.

- FOCEI optimises a conditional approximation to the likelihood.
- SAEM estimates parameters by stochastic approximation; a FOCEi OBJF optionally evaluated afterwards is not the objective SAEM optimised.
- `nlme` uses the Lindstrom-Bates approximation, without interaction.
- `posthoc` fixes the population parameters and is therefore not another population fit.

A difference between these outputs may reflect a **change in approximation or convention**, not an improved model. Only documented runs with a dataset, seed, versions, and controls could support numerical results presented as a benchmark.

**Act two: where engines may stop being interchangeable.** Now imagine sparse sampling and Michaelis-Menten elimination.

```r
  model({
    ka <- exp(tka)
    vm <- exp(tvm + eta.vm)
    km <- exp(tkm)
    v  <- exp(tv  + eta.v)
    d/dt(depot) = -ka * depot
    d/dt(centr) =  ka * depot - (vm * (centr / v)) / (km + (centr / v))
    cp = centr / v
    cp ~ prop(prop.err)
  })
```

In this setting, FOCEI may hit `maxInnerIterations`, return an unstable covariance, or become sensitive to initial values because it searches for a conditional mode for each subject. SAEM can be more robust on that surface through stochastic exploration, without guaranteeing correct convergence or sufficient information in the data.

:::pitfall
Beware the easy conclusion. SAEM has not found the truth merely because it returned a number: convergence diagnostics, identifiability, and sensitivity to initial values remain necessary. Switch engines to address a documented algorithmic difficulty, never to silence an unfavourable diagnostic.
:::

:::howto
**Which engine, when.**
**`"focei"`** whenever a consistent ΔOFV chain is needed — covariate building or structural comparison — and for cross-checking against NONMEM. Both implementations belong to the FOCEI family, but their derivatives, optimisation, settings, and conventions are not identical; estimates therefore do not carry over automatically. It requires suitable data and a differentiable model.
**`"saem"`** is often more robust when methods based on conditional optimisation become sensitive or fail, including some nonlinear systems, sparse designs, or models with many random effects. Its own convergence and identifiability must nevertheless be checked.
**`"nlme"`** to compare against an R legacy or reproduce an old analysis. Rarely the right first choice.
**`"posthoc"`** to apply a published, frozen model to new subjects: the script that estimated the model becomes the Bayesian estimator of the individual parameters.
**One possible strategy** is to use SAEM to obtain initial values, then refit with FOCEI when the comparison sequence must rely on FOCEI. In that case, **all** compared models must be refitted with the same method and conventions; the last run alone is not enough.
:::
<!-- /step -->

<!-- step:title="Common pitfall" -->
The nlmixr2 trap is not that some engine is bad. It is that **switching engine costs one word**, and no trace of it survives in the number that comes out.

:::pitfall
An nlmixr2 object can expose several numbers: the FOCEi objective at the FOCEi optimum, a FOCEi OBJF evaluated at SAEM estimates, a Gauss-Hermite quadrature log-likelihood, or a Lindstrom-Bates objective. The field name and order of magnitude do not establish that they share an evaluator or convention. Inspect the method, controls and version before comparing them.
:::

The scenario is mundane, which is what makes it dangerous. A base model will not start in FOCEI, so it is fitted with SAEM; its parameters are then used as initial values for a covariate model fitted with FOCEI. Subtracting the objective associated with the first fit from that of the second now mixes two estimation chains.

You must refit **both the base and covariate models with the same FOCEI**, the same conventions, and documented controls. Only that difference is a candidate for an LRT, subject to its other assumptions. Any gap that disappears after this alignment came from the estimator or evaluation change, not from the covariate.

:::key
A decision near a threshold should never be mechanical anyway. The primary problem comes earlier: the analyst believed they were comparing two nested models under one objective function while also comparing two estimation procedures.
:::

In NONMEM, changing estimator forces you to edit `$ESTIMATION`: a deliberate act, on a visible line, archived with the run. In nlmixr2 it is a call argument, and the `mod` object — the one you will re-read in six months — keeps **no trace** of it. Six months later, `fit1` and `fit2` are two R objects with two OFVs, and your ΔOFV table no longer remembers that one of them was SAEM.

The discipline is simple, and it is entirely on you: **one engine per comparison chain**, decided before you start, and the `est =` written next to every OFV in the run log — just like the model number. The number, on its own, does not carry it.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The design trait of nlmixr2: the model is an R object, the estimator is an **argument**. `ini({})` and `model({})` describe the densities; the $\int$ sign belongs to the engine, hence `est =`.
- Four representative workflows: `"focei"` approximates the integral by a tangent at $\hat{\eta}_i$ with interaction, `"saem"` samples it, `"nlme"` approximates it differently (Lindstrom-Bates, $\approx$ FOCE without interaction), and `"posthoc"` fixes $\theta$ and seeks only the $\hat{\eta}_i$. Other estimators are available in nlmixr2.
- **rxode2** compiles the model into C, once, and every solve afterwards is machine code. FOCEI needs the sensitivities $\partial f / \partial \eta$, which rxode2 differentiates and compiles in addition: same source, different compiled object — hence the recompilation when going from SAEM to FOCEI.
- **SAEM** can be more robust on some difficult conditional surfaces, with sparse data or sensitive initial values; this does not guarantee convergence or identifiability. ODE stiffness is a separate rxode2 solver-selection and tuning issue and does not by itself justify SAEM. **FOCEI** is a coherent choice when a FOCEI-based ΔOFV sequence is planned.
- `OBJF`, `logLik`, AIC and BIC are not interchangeable. After SAEM, nlmixr2 may add several post-estimation evaluations; always report the evaluator, metric, convention, controls and version.
- A common evaluator does not make an LRT valid. A FOCEi OBJF evaluated at SAEM estimates and an OBJF obtained at the FOCEI optimum use parameter estimates from different procedures. To compare nested models, refit them with the same estimation and evaluation sequence and also check the assumptions of the LRT.
- One engine per comparison chain, chosen in advance, and the `est =` logged next to every OFV. The ease of switching is exactly what makes the mistake easy.
<!-- /step -->

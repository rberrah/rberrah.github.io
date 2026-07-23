---
id: "nlmixr2-moteur"
slug: "nlmixr2-moteur"
title: "nlmixr2 — one model, four engines"
description: "est = focei, saem, nlme or posthoc: switching algorithm without touching the model, what rxode2 compiles behind it, and why the reported OFVs do not compare."
summary: "The model is an R object, the estimator is an argument: four engines consume the same rxode2-compiled code and return four numbers all labelled OFV without measuring the same thing."
track: "nlmixr2"
order: 234
duration: "10 min"
level: "intermediate"
tags: ["nlmixr2", "rxode2", "saem", "focei", "estimation"]
prerequisites: ["tools-nlmixr2"]
glossary: []
slides: []
sources: ["nlmixr2", "fidler-nlmixr", "wang-rxode", "lindstrom-bates"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "You fit the same model twice, once with est = saem and once with est = focei, and subtract the two reported OFVs. What does that difference measure?"
    options:
      - "Nothing usable: both numbers are values of the FOCEi objective evaluated at two different parameter sets, and their gap mostly says which optimiser came closer to that function's minimum."
      - "A valid likelihood ratio test as soon as the two models are nested: nlmixr2 brings both OFVs onto the same scale, which makes their difference directly interpretable."
      - "The approximation gap between SAEM and FOCEI: it simply has to be subtracted from the ΔOFV before comparing the latter to the one degree of freedom χ² threshold to conclude."
    correct: 0
  - prompt: "What exactly does est = posthoc do in nlmixr2?"
    options:
      - "It fixes the population parameters at the values in the ini block and estimates only the individual η: it is a posterior Bayesian estimation, not a population fit."
      - "It re-estimates the population parameters from the individual η of the previous run, which refines the θ without launching a full population optimisation again."
      - "It restarts a FOCEI estimation from the estimates of the previous run, which mainly serves to check that an optimum already found is not merely a local one."
    correct: 0
  - prompt: "On a Michaelis-Menten elimination model with two samples per subject, why does SAEM run where FOCEI stalls?"
    options:
      - "Its inner loop only samples: it proposes an η, solves the model forward once, accepts or rejects — with no derivative with respect to η and no individual mode to find."
      - "It solves the system with a more tolerant integrator, which absorbs the stiffness that the FOCEI solver cannot get past without collapsing its integration step."
      - "It estimates the η by Gauss-Hermite quadrature, whose accuracy does not degrade even when the subject's conditional distribution becomes very wide with two points."
    correct: 0
---

<!-- step:title="Why this chapter" -->
In NONMEM, the estimator is a line of the control stream. In Monolix, it is the architecture of the software itself. In nlmixr2, it is a **function argument**: `est = "focei"`, `est = "saem"`, `est = "nlme"`, `est = "posthoc"`. One word changes, the model does not move a line, and another algorithm takes over.

This is not interface convenience, it is the design trait. nlmixr2 separates the **description** of the model from its **evaluation**: the `model({})` block says what the system is, `est =` says who will handle it. The benefit is real and rare — you can compare estimators on a strictly identical model, without a single opportunity to mistype an equation between two attempts.

The cost is just as real, and less visible. Four engines return four numbers, all displayed as `OFV`, in the same summary, with the same number of decimals. Nothing will remind you which came from where. This chapter says what each engine actually does, which to choose and when, and why the ease of switching is exactly what makes the mistake easy.
<!-- /step -->

<!-- step:title="Intuition" viz="66_FOCELinearization" -->
All four engines chase **the same integral**. For each subject, the likelihood of the observations requires averaging over every $\eta$ compatible with the population, and that integral has no closed form as soon as the model is nonlinear in $\eta$ — that is, always, in PK. The model says nothing about that integral: it merely supplies what is needed to write it down. What `est =` picks is the **way around it**.

**FOCEI deforms it.** It replaces the model by its tangent at the individual mode $\hat{\eta}_i$, which makes the integrand Gaussian and the integral analytical. The price: $\hat{\eta}_i$ must be found for every subject at every population iteration, and the derivatives $\partial f / \partial \eta$ are required. An optimisation loop inside an optimisation loop.

**SAEM does not compute it.** It treats the individual parameters as missing data and simulates them by MCMC instead of integrating them out. Its inner loop proposes an $\eta$, evaluates the model **once**, accepts or rejects. No derivative, no mode to find.

**nlme deforms it too**, by another route: the Lindstrom-Bates alternating algorithm, which chains a penalised nonlinear least squares step and a linear mixed effects step. In practice it lands on an approximation very close to FOCE **without** interaction.

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

But the nuance matters. SAEM only asks for **forward** solves: it consumes the library as is. FOCEI needs $\partial f / \partial \eta$; rxode2 then symbolically differentiates the system and compiles, alongside it, the **forward sensitivity equations**. The source file is identical, the compiled object is not. An `est = "focei"` following an `est = "saem"` therefore goes back through the compiler, and that is not a whim.

**What becomes of the OFV.** Here lies the peculiarity nobody reads in the documentation. As everywhere, SAEM maximises the likelihood without ever evaluating it: at the end of a SAEM run there is nothing to display. Monolix solves this with a separate task you must request. nlmixr2 solves it **silently**: by default, it computes the OFV afterwards, with the **FOCEi** evaluator, at the SAEM estimates.

```r
# the OFV returned after a SAEM run: by default, the FOCEi objective at the SAEM estimates
f2 <- nlmixr2(mod, dat, est = "saem", control = saemControl(logLik = FALSE))

# or a genuine Gauss-Hermite quadrature: nnodes.gq = 1 gives Laplace
f2q <- nlmixr2(mod, dat, est = "saem",
               control = saemControl(logLik = TRUE, nnodes.gq = 3, nsd.gq = 1.6))
```

Direct consequence: in nlmixr2, the OFV of a SAEM fit and that of a FOCEI fit are on the **same scale**, produced by the **same function**. That is more honest than letting two programs display two incomparable quantities. It is also far more dangerous, because the two numbers look alike enough to be subtracted without a second thought. The `adjObf` option, on by default, additionally aligns the additive constant with NONMEM's convention: the number even has the familiar look.

:::note
Ref.: Fidler M. et al., *CPT Pharmacometrics Syst Pharmacol* 2019, for the design of nlmixr and the sharing of one model across several estimators; Wang W., Hallow K. M., James D. A., *CPT Pharmacometrics Syst Pharmacol* 2016, for RxODE and the compilation of the ODE system; Lindstrom M. J., Bates D. M., *Biometrics* 1990, for the alternating algorithm underlying `est = "nlme"`; nlmixr2 project documentation for the names of the methods and control options.
:::
<!-- /step -->

<!-- step:title="Worked example" viz="15_OFVGame" -->
**Act one: the same script, four times.** A 1-compartment oral model, **40 subjects**, 6 samples each, so 240 observations, proportional error. The model is tame, the data are rich: the most favourable case there is.

| `est =` | Time | $tvCl$ (L/h) | $\omega_{Cl}$ (CV %) | Reported OFV |
|---|---|---|---|---|
| `"focei"` | 38 s | 0.134 | 31 | **1487.2** |
| `"saem"` | 21 s | 0.131 | 33 | **1487.6** |
| `"nlme"` | 14 s | 0.138 | 28 | **1502.9** |
| `"posthoc"` | 1 s | 0.135 (fixed) | (fixed) | — |

The parameters look alike, and that is reassuring: on a well-posed model, the estimators converge to the same region. It is the OFVs that must be looked at.

**0.4 point between FOCEI and SAEM.** Both numbers are values of the **same** function — the FOCEi objective — evaluated at two different points. FOCEI got 1487.2 because that is precisely the function it was minimising; SAEM got 1487.6 because it was minimising something else and we came along and measured its result with the neighbour's ruler. Those 0.4 points do not say FOCEI fits better. They say that **the FOCEi optimiser gets closer to the FOCEi minimum than SAEM's does**, which is not information.

**15.7 points between FOCEI and nlme.** Against a threshold of 3.84 for one degree of freedom, the gap looks crushing. It means nothing either: nlme does not return the FOCEi objective, it returns the Lindstrom-Bates one, without interaction. But the error here is **proportional**, so the residual variance depends on $\eta$, so interaction is not a detail. Those 15.7 points measure a **change of approximation**, exactly as a `METHOD=0` against a `METHOD=1 INTER` in NONMEM. The only novelty is that one word was enough to trigger it.

**Act two: where the engines stop being interchangeable.** Keep the 40 subjects but drop to **2 samples each** (80 observations) and switch to Michaelis-Menten elimination.

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

- `est = "focei"`: the inner loop hits `maxInnerIterations` on 11 subjects out of 40, the outer optimiser stops on a gradient indistinguishable from noise, `covMethod = "r,s"` returns no matrix. $tvVm = 12.4$ with 84% RSE, and $\omega_{Vm}$ collapsed to 0.006.
- `est = "saem"`: runs in 40 s. $tvVm = 9.7$, $\omega_{Vm} = 0.21$ (CV $\approx$ 46%).

The mechanics are legible. With two points per subject, the conditional distribution of $\eta$ is very wide and its surface almost flat: FOCEI must hunt for its mode for every subject, at every outer iteration, and the inner optimisation wanders across a plateau. The sensitivities $\partial f / \partial \eta$ through a Michaelis-Menten system do not help. SAEM proposes an $\eta$, solves forward once, accepts or rejects: the missing information becomes a **variance**, not a failure.

:::pitfall
Beware the easy conclusion. SAEM did not find the truth — it **cannot** fail, so it returns a number whatever happens. Its $\omega_{Vm}$ at 46% says exactly what FOCEI was shouting: two samples per subject do not identify a $V_m$ and a $K_m$ separately. You switch engine to obtain an estimate despite a stiff model; never to silence an engine that was right.
:::

:::howto
**Which engine, when.**
**`"focei"`** whenever a chain of ΔOFV is needed — covariate building, structural comparison — and when the work will end up in NONMEM: it is the same estimator, the estimates carry over. Requires decent data and a model that differentiates.
**`"saem"`** on stiff systems (Michaelis-Menten, Emax, TMDD), sparse designs, dubious initial values, models with many random effects. It is the engine that starts when nothing else does.
**`"nlme"`** to compare against an R legacy or reproduce an old analysis. Rarely the right first choice.
**`"posthoc"`** to apply a published, frozen model to new subjects: the script that estimated the model becomes the Bayesian estimator of the individual parameters.
**The strategy that works**: SAEM to find the region, then its estimates as initial values for the FOCEI run that will carry the OFV. But then **the whole** comparison chain is in FOCEI — not just the last run.
:::
<!-- /step -->

<!-- step:title="Common pitfall" -->
The nlmixr2 trap is not that some engine is bad. It is that **switching engine costs one word**, and no trace of it survives in the number that comes out.

:::pitfall
The summary of an nlmixr2 fit always displays an `OFV`, always the same way. **Four different machines can have produced it**: the FOCEi objective at the FOCEi optimum; the FOCEi objective at the SAEM estimates (the default for `est = "saem"`); a Gauss-Hermite quadrature log-likelihood (`saemControl(logLik = TRUE)`), on a different scale; or the Lindstrom-Bates objective (`est = "nlme"`). Nothing in the number says which. `adjObf` has even already realigned the constant to NONMEM's convention, so the order of magnitude is the one you expected.
:::

The scenario is mundane, which is what makes it dangerous. The base model would not start in FOCEI: it was run with `est = "saem"`, **OFV = 1487.6**. Once the estimates were in hand the initial values became good, so the covariate model was run with `est = "focei"`: **OFV = 1483.4**. Subtract: **ΔOFV = 4.2**, against a threshold of 3.84. Keep the covariate.

Except that the base model, in FOCEI, was worth **1487.2**. The true ΔOFV of the FOCEI chain is $1487.2 - 1483.4 = 3.8$ — **below** the threshold. The 0.4 points that tipped the decision did not come from the covariate: they came from the fact that SAEM and FOCEI do not stop at the same place on the FOCEi surface. A covariate entered the final model for a reason that does not exist.

:::key
A difference of 3.8 against a threshold of 3.84 should never be settled bluntly anyway. But the problem is not the margin: it is that the analyst **believed they had 4.2**. An engine's noise had slipped into a figure they were reading as a property of the data.
:::

In NONMEM, changing estimator forces you to edit `$ESTIMATION`: a deliberate act, on a visible line, archived with the run. In nlmixr2 it is a call argument, and the `mod` object — the one you will re-read in six months — keeps **no trace** of it. Six months later, `fit1` and `fit2` are two R objects with two OFVs, and your ΔOFV table no longer remembers that one of them was SAEM.

The discipline is simple, and it is entirely on you: **one engine per comparison chain**, decided before you start, and the `est =` written next to every OFV in the run log — just like the model number. The number, on its own, does not carry it.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The design trait of nlmixr2: the model is an R object, the estimator is an **argument**. `ini({})` and `model({})` describe the densities; the $\int$ sign belongs to the engine, hence `est =`.
- Four engines for the same integral: `"focei"` deforms it (tangent at $\hat{\eta}_i$, with interaction), `"saem"` samples it, `"nlme"` deforms it differently (Lindstrom-Bates, $\approx$ FOCE without interaction), `"posthoc"` never faces it ($\theta$ fixed, only the $\hat{\eta}_i$ are sought).
- **rxode2** compiles the model into C, once, and every solve afterwards is machine code. FOCEI needs the sensitivities $\partial f / \partial \eta$, which rxode2 differentiates and compiles in addition: same source, different compiled object — hence the recompilation when going from SAEM to FOCEI.
- **SAEM** for stiff systems, sparse data, dubious initial values: no derivative, no individual mode to find. **FOCEI** whenever a chain of ΔOFV is at stake, or the work will end up in NONMEM.
- The OFV of a SAEM run is **not** a SAEM number: nlmixr2 computes it afterwards with the FOCEi evaluator (default), or by Gauss-Hermite quadrature with `saemControl(logLik = TRUE)` — on a different scale.
- Same scale does not mean comparable. Subtracting the OFV of a SAEM fit and that of a FOCEI fit measures which of the two optimisers gets closer to the FOCEi minimum, not which of the two models fits better.
- One engine per comparison chain, chosen in advance, and the `est =` logged next to every OFV. The ease of switching is exactly what makes the mistake easy.
<!-- /step -->

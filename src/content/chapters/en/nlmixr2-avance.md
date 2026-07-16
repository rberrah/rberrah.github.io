---
id: "nlmixr2-avance"
slug: "nlmixr2-avance"
title: "nlmixr2 — going further"
description: "Bounded parameters with expit and probitInv, NCA-based auto-initialisation, looping over models in R, babelmixr2 and rxode2 simulation."
summary: "The model is an R object: what that buys you — hand-written bounds, loops, pipelines, translation to NONMEM and Monolix — and what it actually costs."
track: "nlmixr2"
order: 6
duration: "10 min"
level: "intermediate"
tags: ["nlmixr2", "rxode2", "babelmixr2", "logit"]
prerequisites: ["tools-nlmixr2"]
glossary: []
slides: []
sources: ["nlmixr2", "fidler-nlmixr", "wang-rxode", "fda-poppk"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "To bound a parameter within ]0,1[ in nlmixr2, you..."
    options:
      - "write the transformation yourself in the model block, as expit(tf + eta.f): there is no distribution keyword, the algebra you type serves as the link function"
      - "declare distribution = logitNormal in the ini block, which nlmixr2 then applies to the corresponding random effect at estimation time"
      - "bound the random effect itself in the ini block, by giving the eta.f ~ 0.81 line a lower and an upper limit"
    correct: 0
  - prompt: "You pipe model(cl <- exp(tcl + eta.cl + b_cr * log(CRCL/90))) without adding the ini(b_cr = 0.5) line. nlmixr2..."
    options:
      - "declares b_cr as a covariate and therefore expects a b_cr column in the dataset: the run stops on an error that blames the data, while the mistake is in the model"
      - "estimates b_cr anyway, assigning it a default initial estimate of 1, and reports the addition through a plain informational message in the console"
      - "refuses to build the model and returns a syntax error stating that the parameter b_cr has been given no declared initial estimate"
    correct: 0
  - prompt: "About random seeds in nlmixr2 and rxode2..."
    options:
      - "SAEM starts from a fixed default seed: a run reproduces identically while never revealing that it is only one realisation among many, and varying seed is how you test robustness"
      - "SAEM draws a different seed on every call, so you must set saemControl(seed=) for the same script to return exactly the same result twice"
      - "SAEM and rxode2 both inherit the seed set by set.seed(), so a single set.seed() at the top of the script is enough to pin estimation and simulations"
    correct: 0
  - prompt: "With babelmixr2, running an estimation with est = nonmem..."
    options:
      - "writes the control stream, runs NONMEM and reimports the result as an nlmixr2 fit object: you therefore need a licensed NONMEM install, and the OFV obtained does not compare to a SAEM run"
      - "reimplements NONMEM's algorithms inside nlmixr2, which avoids any external installation and reproduces the estimates of a native NONMEM run exactly"
      - "merely translates the model into a control stream for you to run elsewhere, the reported OFV staying comparable to the SAEM run on the same data"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The previous chapter leaves you with an `nlmixr2(mod, data, est = "saem")` that runs. It stays silent on three things.

First: nlmixr2 has **no distribution keyword at all**. Where Monolix declares `logitNormal`, nlmixr2 expects you to write the transformation. That is a design choice, and it cuts both ways.

Second: the model is not a file, it is an **R object**. Model building therefore becomes programming — thirty candidate models is an `lapply`, not thirty folders. With programming's sharp edges thrown in.

Third: the exits. babelmixr2 writes NONMEM and Monolix, rxode2 simulates. And there is an honest conversation to be had about where nlmixr2 does not yet go.
<!-- /step -->

<!-- step:title="Intuition" viz="03_PopulationDistrib" -->
Look at the line `cl <- exp(tcl + eta.cl)`. **Nothing in it declares a log-normal.** There is no keyword, no option, no table of distributions. The `exp()` *is* the log-normal.

nlmixr2 imposes one single thing, the same as every other tool: $\eta_i \sim \mathcal{N}(0, \omega^2)$, a normal random effect living on the whole real line. Everything else is algebra you type. The function you wrap around $\theta + \eta_i$ maps that real line onto the parameter's domain — and you are the one who writes that function.

Hence two symmetric consequences.

**The first liberates.** Bounding a parameter is not a keyword you hope to find in the documentation: it is a function you swap. `exp()` covers $]0, +\infty[$. `expit()` covers $]0, 1[$. `expit(x, 0, 100)` covers $]0, 100[$. `probitInv()` covers $]0,1[$ by another route. Nothing to declare, nothing to look up.

**The second costs.** Nobody proofreads you. Monolix *knows* your $F$ is a logitNormal and adapts what it displays; nlmixr2 runs the algebra you typed and hands back the numbers on the scale you typed them on. There is no keyword to get wrong, and no keyword to protect you.

:::key
The link function is not declared, it is **written**. Positive parameter: `exp()`. A fraction in ]0,1[: `expit()` or `probitInv()`. A quantity bounded in ]min,max[: `expit(x, min, max)`. A quantity that may legitimately be negative — an effect slope, a baseline drift: **nothing at all**, you write `tslope + eta.slope`, and that is the right choice, not laziness.
:::

And here is the idea the rest of the chapter merely declines: everything nlmixr2 reports about a bounded parameter — its initial estimate, its $\omega$, its covariate coefficients — lives on the **scale of the transformation you wrote**, never on the parameter's own.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="12_VariabilitySandbox" -->
A single model governs the whole `model` block:

$$ \psi_i = h^{-1}\!\left(\theta + \sum_k \beta_k\, c_{ik} + \eta_i\right), \qquad \eta_i \sim \mathcal{N}(0, \omega^2) $$

In Monolix you declare $h$. In nlmixr2 you write **$h^{-1}$ directly**: it is the right-hand side of the line. The `ini` block carries the initial estimate on the scale of $h$, the `model` block applies $h^{-1}$ — the two lines must answer each other.

- $\mathbb{R}$ — `ini`: `tslope <- 0.2`; `model`: `slope <- tslope + eta.slope`
- $]0,+\infty[$ — `ini`: `tcl <- log(3.4)`; `model`: `cl <- exp(tcl + eta.cl)`
- $]0,1[$ — `ini`: `tf <- logit(0.62)`; `model`: `fbio <- expit(tf + eta.f)`
- $]0,1[$ via probit — `ini`: `tf <- probit(0.62)`; `model`: `fbio <- probitInv(tf + eta.f)`
- $]min,max[$ — `ini`: `temax <- logit(60, 0, 100)`; `model`: `emax <- expit(temax + eta.emax, 0, 100)`

```r
mod <- function() {
  ini({
    tf  <- logit(0.62)     # 0.4895 : logit scale, NOT 0.62
    tcl <- log(3.4)
    tv  <- log(45)
    tka <- log(1.1)
    eta.f  ~ 0.81          # omega = 0.9, on the logit scale
    eta.cl ~ 0.0784        # omega = 0.28, on the log scale
    prop.sd <- 0.14
  })
  model({
    fbio <- expit(tf + eta.f)      # bounded in ]0,1[ whatever eta turns out to be
    cl   <- exp(tcl + eta.cl)
    v    <- exp(tv)
    ka   <- exp(tka)
    f(depot) <- fbio
    d/dt(depot) = -ka * depot
    d/dt(centr) =  ka * depot - (cl/v) * centr
    cp = centr / v
    cp ~ prop(prop.sd)
  })
}
```

Whatever value is drawn for $\eta_i$ — $-4$, $+4$ — `fbio` stays within its bounds. That is a **structural** guarantee: no optimiser can violate it, because there is nothing to violate.

**The ini-scale trap.** `tf <- logit(0.62)` stores **0.4895** in the parameter table, not 0.62. Writing `tf <- 0.62` therefore does not start at $F = 0.62$ but at $\text{expit}(0.62) = 0.65$. The gap is small; it is nonetheless an initial estimate you believe you know and that is not the one you set.

**Reading a bounded $\omega$.** rxode2 ships the function that does the arithmetic:

```r
logitNormInfo(logit(0.62), sd = 0.9)
#>      mean       var        cv
#> 0.6028707 0.0346592 0.3088056
```

Three numbers to confront. The **median** is $\text{expit}(0.4895) = 0.62$ exactly — the inverse transformation preserves the median. The **mean** is 0.603, not 0.62: `expit` is not linear, exactly as a log-normal has median $e^{\theta}$ but mean $e^{\theta + \omega^2/2}$. And the **CV** is 31%, when $\omega$ is 0.9. The results table will display 0.9; the population has 31% variability. The two numbers have nothing to do with each other, and `logitNormInfo()` is what bridges them.

:::key
Bounding a parameter does not make it **identifiable**. $F$ is only estimable against an IV reference — or, for a relative bioavailability, against the reference arm. On oral-only data, what you estimate is $CL/F$ and $V/F$. Declaring a bounded $F$ on that dataset gives you a parameter the data do not inform: `expit()` will keep it neatly inside ]0,1[ while it drifts wherever the initial estimate left it. The bound holds, the parameter means nothing. A transformation prevents absurdity; it does not create information.
:::

**Auto-initialisation.** babelmixr2 wires PKNCA onto the model: a non-compartmental analysis runs, and its results come back as initial estimates.

```r
mod_init <- nlmixr2(mod, dat, est = "pknca",
                    control = pkncaControl(concu = "ng/mL", doseu = "mg",
                                           timeu = "hr", volumeu = "L"))
```

The returned object is **the same model, with an updated `ini` block**. The most instructive part is the list of units: a $CL$ or a $V$ drawn from an NCA are only right if the units are right, and declaring them is what makes the translation possible. That is also the flaw — announce ng/mL on data in µg/L and the function will hand you wrong initial estimates with exactly the same confidence.

:::note
Ref.: the nlmixr2 project and rxode2 documentation (Fidler, Wang, Hallow et al.) for the syntax, the `logit`/`expit`/`probitInv`/`logitNormInfo` functions and the tool's behaviour; Fidler et al., *CPT Pharmacometrics Syst. Pharmacol.* for the nlmixr project and its comparison against established engines; Wang, Hallow & James, *CPT Pharmacometrics Syst. Pharmacol.* 2016 for the ODE engine and simulation; FDA, *Population Pharmacokinetics — Guidance for Industry* (2022) for reporting the software and its version in a dossier.
:::
<!-- /step -->

<!-- step:title="Worked example" viz="MultiDose" -->
An IV drug, one-compartment, 40 subjects, 8 samples each — 320 observations. Three covariates to screen on clearance.

```r
m0 <- function() {
  ini({
    tcl <- log(3.4)
    tv  <- log(45)
    eta.cl ~ 0.0784
    eta.v  ~ 0.0441
    prop.sd <- 0.14
  })
  model({
    cl <- exp(tcl + eta.cl)
    v  <- exp(tv + eta.v)
    d/dt(centr) = -(cl/v) * centr
    cp = centr / v
    cp ~ prop(prop.sd)
  })
}

mods <- list(
  base = m0,
  wt   = m0 |> model(cl <- exp(tcl + eta.cl + b_wt * log(WT/70)))   |> ini(b_wt = 0.75),
  crcl = m0 |> model(cl <- exp(tcl + eta.cl + b_cr * log(CRCL/90))) |> ini(b_cr = 0.5),
  both = m0 |> model(cl <- exp(tcl + eta.cl + b_wt * log(WT/70) +
                                              b_cr * log(CRCL/90))) |> ini(b_wt = 0.75, b_cr = 0.5)
)

fits <- lapply(mods, function(m)
  nlmixr2(m, dat, est = "saem", control = saemControl(print = 0, seed = 99)))

do.call(rbind, lapply(fits, function(f) f$objDf))
```

The piped `model()` replaces the line defining `cl`; the `ini()` that follows declares the new parameter. Four models, one list, one `lapply`:

```
        OFV     npar    BIC
base   1284.6     6    1319.2
wt     1272.1     7    1312.5
crcl   1269.8     7    1310.2
both   1266.9     8    1313.0
```

The reading is clean. CRCL alone against the base model: $\Delta OFV = 14.8$ on 1 df, that is $p = 1.2 \times 10^{-4}$. Adding weight **on top of** CRCL: $\Delta OFV = 2.9$ on 1 df, below the 3.84 threshold, that is $p = 0.09$ — and BIC degrades (1313.0 against 1310.2). Keep CRCL, drop weight.

The point is not the speed. It is that this table **is code**. Re-run it on a new data extract and every number updates, or none does. That is what "everything is in R" actually buys: not convenience, an audit trail that executes.

**Then you simulate.** Two regimens at equal daily dose: 100 mg every 12 h against 200 mg every 24 h. With $CL = 3.4$ L/h in a subject at 90 mL/min:

$$ C_{\text{ss,avg}} = \frac{D}{CL \times \tau} $$

- q12h: $100/(3.4 \times 12) = 2.45$ mg/L
- q24h: $200/(3.4 \times 24) = 2.45$ mg/L

Identical, by construction. The average is settled on the back of an envelope. So are the peaks, as long as you stay on the typical subject — with $k = CL/V = 3.4/45 = 0.0756$ h⁻¹:

$$ C_{\max,\text{ss}} = \frac{D/V}{1 - e^{-k\tau}} $$

- q12h: $(100/45)/(1 - e^{-0.907}) = 3.73$ mg/L
- q24h: $(200/45)/(1 - e^{-1.814}) = 5.31$ mg/L

Set a toxicity threshold at **6 mg/L**. Both regimens pass. The typical patient is safe either way.

Now, the population:

```r
pop <- data.frame(id = 1:5000, CRCL = rlnorm(5000, log(90), 0.35))
ev  <- et(amt = 200, cmt = "centr", ii = 24, until = 24*20) |>
       et(time = seq(24*18, 24*20, by = 0.25)) |>
       et(id = 1:5000)

sim <- rxSolve(fits$crcl, ev, iCov = pop,
               nStud = 200, thetaMat = fits$crcl$thetaMat,
               dfSub = 40, dfObs = 320)
```

**3.5% of subjects exceed 6 mg/L under q12h. 32% under q24h.**

The typical-value calculation declared both regimens safe; the population simulation puts nearly a third of patients over the line. That gap is the entire reason population simulation exists — and it costs three lines, because `rxSolve()` takes the fit object itself.

:::key
`rxSolve(fit, ...)` simulates **the object that was estimated**: the same class of guarantee as Simulx reading the mlxtran file. No re-implementation, therefore no silent divergence between the estimation code and the simulation code.
But look at what is **not** in the fit: `iCov`. The CRCL distribution of your virtual population is an assumption you author. Drawing CRCL log-normally around 90 mL/min describes a phase-1 population, not the renally impaired patients the covariate was put in the model for. That line does as much work as the model, and nothing proofreads it.
:::

`thetaMat` propagates the uncertainty on the fixed effects, `dfSub` and `dfObs` the uncertainty on $\omega$ and $\sigma$. Without them, the 32% is reported as though it were known exactly.

**The exits.** babelmixr2 does more than translate:

```r
fit_nm  <- nlmixr2(mod_crcl, dat, est = "nonmem",  control = nonmemControl())
fit_mlx <- nlmixr2(mod_crcl, dat, est = "monolix", control = monolixControl())
```

It writes the control stream or the mlxtran project, runs the engine, then **reimports the results as an nlmixr2 fit object**. `fit_nm$objf` answers, `vpcPlot(fit_nm)` plots: the same diagnostic code runs across all three engines. It is less a translator than a **test bench** — one model definition, three engines, comparable diagnostics. In the other direction, `nonmem2rx` and `monolix2rx` read existing runs back into rxode2.
<!-- /step -->

<!-- step:title="Common pitfall" -->
**The piping trap.** Forget the `ini()` line:

```r
m_crcl <- m0 |> model(cl <- exp(tcl + eta.cl + b_cr * log(CRCL/90)))
```

nlmixr2 prints:

```
i add covariate `b_cr`
i add covariate `CRCL`
```

An **informational** message. Not a warning. In an `lapply` over thirty models with `print = 0`, it scrolls past. Then the run stops:

```
Assertion on 'names(data)' failed: Names must include the elements
{'TIME','b_cr','WT'}, but is missing elements {'b_cr'}.
```

:::pitfall
The error accuses your dataset of missing a column. Your dataset is perfectly fine. In a piped `model()` block, **any bare name that is not already a parameter is assumed to come from the data** — that is how `CRCL` gets recognised, and it is why `b_cr` gets the same treatment. The `ini()` line is what promotes it to an estimated parameter. Same mechanism, same trap, for a typo: pipe `b_wt` into the model and write `ini(bwt = 0.75)`, and you get an orphan parameter and a phantom data column. Read the `i` messages — they are informational, but they are the only place the mistake shows.
:::

**Reproducibility, but not the one you expect.** Everything is in R, therefore everything is reproducible. Half true, and the false half is the interesting one.

`saemControl()` starts from a **fixed default seed, 99**. Your SAEM run therefore reproduces to the last digit, every time — which is precisely what makes it easy to forget that SAEM is a *stochastic* algorithm and that you are looking at **one** realisation. A fixed seed gives reproducibility, not robustness. Re-run across a handful of seeds before believing an optimum.

As for rxode2's parallel engines: until you call `rxSetSeed()`, their seed is drawn from a uniform number taken off R's ordinary seed state. Your script still reproduces. But over a large number of simulation calls, that draw can land twice on the same engine seed — the birthday problem — and two "independent" replicates then share the same random stream. The failure is not non-reproducibility: it is a **silent correlation between runs you believe are independent**, and it becomes more likely the more you loop. Which is exactly the workflow this chapter is selling you.

```r
rxSetSeed(1234)   # seed of the rxode2 parallel engines
set.seed(1234)    # R seed
fit <- nlmixr2(mod, dat, est = "saem", control = saemControl(seed = 1234))
```

Three generators, three seeds. None of them is the other's.

:::pitfall
`renv::snapshot()` pins the packages. It pins neither the C toolchain rxode2 compiles your model with, nor your BLAS. Record `sessionInfo()` and the platform alongside the results. "Everything is in R" also means everything moves: nlmixr2 and rxode2 are actively developed, and active development means version drift.
:::

**The limits, honestly.** `est = "nonmem"` launders nothing. babelmixr2 needs a licensed NONMEM installation — it does not hand you one. The generated control stream is yours: to read, to defend. If you cannot explain one of its lines, you cannot submit it. And the OFV NONMEM returns does not compare to your SAEM OFV: different methods, the same trap as any cross-tool comparison.

On regulatory ground, let us be precise rather than polemical. **No agency certifies modelling software.** The FDA popPK guidance asks which software and which version were used, and expects a documented, reproducible analysis. nlmixr2 is therefore not forbidden, and cross-tool comparisons find estimates that agree with NONMEM and Monolix. The friction is **organisational, not scientific**: the CRO's procedures, the installation qualification, the reviewer's habits and the person who will maintain the analysis in four years are all built around NONMEM. That is a real cost, and "but the estimates agree" does not answer it.

Maturity and community follow the same logic. When a NONMEM error message blocks you, fifteen years of mailing-list archive has probably already seen it. On an nlmixr2 edge case you may be the first — and the answer, when it comes, may come from the person who wrote the code: both better and less scalable. The scientific risk is low; the operational risk is real. That is what you decide on, not the licence price.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- nlmixr2 has **no distribution keyword**: the link function is written in the `model` block. `exp()` for $]0,+\infty[$, `expit()` or `probitInv()` for $]0,1[$, `expit(x, min, max)` for any interval, nothing at all for a quantity that may be negative.
- The `ini` block carries values **on the scale of the transformation**: `tf <- logit(0.62)` stores 0.4895. Writing `tf <- 0.62` actually starts at $F = 0.65$.
- A bounded $\omega$ does not read as such: $\omega = 0.9$ in logit around 0.62 gives a **median of 0.62, a mean of 0.603 and a CV of 31%**. `logitNormInfo()` does the arithmetic — use it rather than reporting $\omega$.
- Bounding is not identifying. On oral-only data $F$ is not estimable: `expit()` will keep it inside ]0,1[ while it drifts.
- The model is an **R object**: `|> model()` and `|> ini()` build variants, an `lapply` estimates them, `$objDf` compares them. The selection table becomes code you re-run.
- Mind the piping: a bare name not declared in `ini()` becomes a **covariate**, hence a column expected in the data. The error will accuse your dataset of a mistake made in the model.
- `rxSolve(fit, ...)` simulates the estimated object — no re-implementation. But `iCov`, the virtual population, is an assumption you author; `thetaMat`/`dfSub`/`dfObs` are what propagate estimation uncertainty.
- Seeds: SAEM starts at 99 by default (reproducible is not robust — vary `seed`), rxode2 wants `rxSetSeed()` to avoid seed collisions between supposedly independent replicates.
- **babelmixr2** is a test bench: one model, three engines, shared diagnostics. It provides neither a NONMEM licence, nor an OFV comparable across methods, nor a dispensation from reading the control stream.
- The limits are operational, not scientific: no agency certifies software, but regulatory teams' procedures, tooling and skills are built around NONMEM.
<!-- /step -->

---
id: "nlmixr2-variabilite"
slug: "nlmixr2-variabilite"
title: "nlmixr2 — ini, model and variability"
description: "The statistical model in R: the tilde that declares an eta, the log-transformed theta convention, covariance blocks, IOV as a level, covariates, and reading fit$omega and fit$shrink."
summary: "Writing and reading variability in nlmixr2: eta.cl ~ 0.1 is a variance, tcl lives on the log scale, ~ c() for a covariance block, the vertical bar for IOV, and the parFixed table that back-transforms everything."
track: "nlmixr2"
order: 3
duration: "13 min"
level: "intermediate"
tags: ["nlmixr2", "variability", "omega", "iiv", "iov", "covariates", "shrinkage"]
prerequisites: ["tools-nlmixr2"]
glossary: []
slides: []
sources: ["nlmixr2", "fidler-nlmixr", "karlsson-sheiner-iov", "savic-karlsson-shrinkage"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "In `ini({...})` you write `eta.cl ~ 0.1`. What does the value 0.1 declare?"
    options:
      - "A variance: the standard deviation of the eta is 0.32, i.e. roughly 32% CV on clearance."
      - "A standard deviation: the variance of the eta is therefore 0.01, i.e. roughly 10% CV on clearance."
      - "A CV expressed as a fraction: between-subject variability on clearance is therefore 10%."
    correct: 0
  - prompt: "In `eta.cl + eta.v ~ c(0.1, 0.05, 0.1)`, what does the value 0.05 represent?"
    options:
      - "The covariance between eta.cl and eta.v: the lower triangle reads var(eta.cl), covariance, var(eta.v)."
      - "The variance of eta.v: the vector reads var(eta.cl), var(eta.v), and then the covariance given last."
      - "The correlation between eta.cl and eta.v: nlmixr2 estimates the coefficient itself rather than the covariance."
    correct: 0
  - prompt: "You declare `iov.cl ~ 0.03 | occ` on a dataset with four occasions. How many variability parameters does the IOV add?"
    options:
      - "One only: the level declared by the vertical bar carries a single variance, whatever the number of occasions."
      - "Four: each occasion gets its own variance, which then has to be constrained to stay equal to the others."
      - "Three: the first occasion serves as the reference and the next three each receive their own variance."
    correct: 0
  - prompt: "Your model has `ka <- exp(tka + eta.ka)` and you translate NONMEM's `$THETA (0, 1.2)` as `tka <- c(0, log(1.2))`. What does that bound actually do?"
    options:
      - "It forbids any typical ka below 1 h⁻¹, because the bound applies to tka, hence to the logarithm of ka."
      - "It forbids any negative typical ka, which faithfully reproduces the `(0, 1.2)` of the original control stream."
      - "It has no effect at all, because the exponential written in the model already guarantees that ka stays positive."
    correct: 0
---

<!-- step:title="Why this chapter" -->
The introductory chapter showed the skeleton of an nlmixr2 model: an R function, an `ini({})` block, a `model({})` block. That split looks harmless — the numbers on one side, the equations on the other. It is not. It **spreads a single modelling decision across two blocks**, and that is where most of the nlmixr2 models that run without complaint and report something other than what you think come from.

Take the most ordinary line in the whole ecosystem: `cl <- exp(tcl + eta.cl)`. It says clearance is log-normal. But the logarithmic scale it installs has a consequence for a value written **in the other block**, thirty lines above, and nothing in R checks that the two agree. An initial value, a bound, a `%RSE`: all three change meaning depending on what you wrote in `model({})`.

This chapter covers the five moves of the statistical model in nlmixr2 — declaring an eta, correlating etas, coding IOV, wiring in a covariate, reading the output — keeping the same question throughout: **which scale does the number I am writing live on**.
<!-- /step -->

<!-- step:title="Intuition" viz="12_VariabilitySandbox" -->
The grammar of `ini({})` comes down to three signs. They are not stylistic details: each one **declares a kind of parameter**, and it is the only way nlmixr2 has of knowing what it is dealing with.

- `<-` (or `=`) declares a **fixed effect**: `tcl <- log(4.5)`. A theta, one value estimated for the whole population.
- `~` declares a **random effect**: `eta.cl ~ 0.1`. An omega, a spread around the typical value.
- `|` declares a **level** of variability: `iov.cl ~ 0.03 | occ`. One draw per occasion rather than per patient.

The name declares nothing. `tcl` is not a reserved word: the `t` is a **human convention** for "theta of cl", readable by you, ignored by the machine. You could call it `thingy`. What makes `tcl` a log-transformed parameter is neither its name nor its `log(4.5)` starting value — it is the `exp()` that **you** write around it in `model({})`.

:::key
`ini({})` does not say what the parameters **mean**, only what they **are** (fixed, random, level) and **where the search starts**. The meaning lives entirely in `model({})`. That is why nlmixr2 **reads your `model({})` back** to produce its output: seeing `cl <- exp(tcl + eta.cl)`, it works out that `tcl` is a log and hands you a back-transformed column in L/h. That cleverness is real and saves you time, but it is **descriptive, not normative**: it reports what you wrote, it never fixes a disagreement between the two blocks.
:::
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="03_PopulationDistrib" -->
### The base model

```r
mod <- function() {
  ini({
    tcl <- log(4.5)        # typical clearance, on the log scale
    tv  <- log(32)
    tka <- log(1.1)
    eta.cl ~ 0.1           # VARIANCE of the eta, not a standard deviation
    eta.v  ~ 0.1
    eta.ka ~ 0.2
    prop.err <- 0.15
  })
  model({
    cl <- exp(tcl + eta.cl)
    v  <- exp(tv  + eta.v)
    ka <- exp(tka + eta.ka)
    d/dt(depot) = -ka*depot
    d/dt(centr) =  ka*depot - (cl/v)*centr
    cp = centr/v
    cp ~ prop(prop.err)
  })
}
fit <- nlmixr2(mod, dat, est = "saem")
```

or, for clearance:

$$ \log(Cl_i) = t_{cl} + \eta_{i,cl}, \qquad \eta_{i,cl} \sim \mathcal{N}(0,\ \omega_{cl}^2) $$

### The t convention, and why it exists

Compare with the NONMEM version of the same model, `CL = THETA(1)*EXP(ETA(1))`. Both describe the **same** log-normal, but they do not estimate the same number:

$$ Cl_i = \underbrace{e^{t_{cl}}}_{\theta_{CL}} \cdot e^{\eta_{i,cl}} \qquad \Longrightarrow \qquad \theta_{CL} = e^{t_{cl}}, \quad t_{cl} = \log(\theta_{CL}) $$

In NONMEM the `EXP` wraps the eta only: `THETA(1)` is a clearance, in L/h, on the **natural** scale. In nlmixr2 the `exp()` wraps **theta and eta together**: `tcl` is not a clearance, it is the logarithm of one, and it has no units. `tcl = 1.52` means nothing until you exponentiate it into 4.57 L/h.

That convention is not a whim, and it is not compulsory — `cl <- tcl * exp(eta.cl)` with `tcl <- 4.5` works perfectly well. If every nlmixr2 example nevertheless puts thetas on the log scale, it is for a precise reason: **a log-transformed parameter needs no bound at all**. An exponential structurally cannot return a negative number, whatever the value of `tcl`, including $-40$. Positivity is guaranteed by the shape of the model, not by a constraint imposed on the optimiser — and the optimiser, for its part, gets to work on a free parameter, which suits it far better.

:::key
Writing `tcl <- log(4.5)` rather than `tcl <- c(0, 4.5)` means **replacing a constraint with a reparameterisation**. Hold on to the reason: it explains at once why the convention exists, why bounds are rare in nlmixr2, and why the bound you add out of reflex will almost always be a mistake — we come back to it in the pitfall.
:::

### The value after the tilde is a variance

`eta.cl ~ 0.1` declares $\omega_{cl}^2 = 0.1$. That is the same scale as NONMEM's `$OMEGA`, and the opposite of Monolix's `sd`. For a log-normal, the exact CV of the parameter is:

$$ CV = \sqrt{e^{\omega^2} - 1} $$

| `ini` ($\omega^2$) | $\omega$ | approximate $CV$ | exact $CV$ |
|---|---|---|---|
| 0.04 | 0.20 | 20% | 20.2% |
| 0.09 | 0.30 | 30% | 30.7% |
| 0.10 | 0.32 | 32% | 32.4% |
| 0.16 | 0.40 | 40% | 41.7% |
| 0.50 | 0.71 | 71% | 80.5% |

So the `~ 0.1` that shows up in every tutorial — including in the previous chapter — is not a magic number: it is **32% CV**, a deliberately reasonable opening guess for a PK parameter. You now have what you need to replace it with your own.

:::pitfall
The reflex check is arithmetic and works in both directions of translation. The value after the `~` for a usual 20 to 50% IIV lives between **0.04 and 0.25**, never between 0.2 and 0.5. A Monolix model copied across as-is — `sd=0.3` becoming `eta.cl ~ 0.3` — declares 59% CV instead of 30%. Nothing breaks, the run converges, and you report twice the real variability.
:::

### The covariance block

By default the etas are independent. You correlate them by **adding them up** on the left of the tilde:

```r
ini({
  tcl <- log(4.5)
  tv  <- log(32)
  eta.cl + eta.v ~ c(0.1,
                     0.05, 0.1)
  eta.ka ~ 0.2
})
```

The `c()` gives the **lower triangle** of the covariance matrix, row by row — exactly like NONMEM's `$OMEGA BLOCK`:

$$ \Omega = \begin{pmatrix} 0.10 & 0.05 \\ 0.05 & 0.10 \end{pmatrix}, \qquad r_{cl,v} = \frac{0.05}{\sqrt{0.10}\times\sqrt{0.10}} = 0.5 $$

The order is therefore `var(eta.cl)`, `cov(eta.cl, eta.v)`, `var(eta.v)`: the covariance sits **in the middle**, not at the end. If you would rather declare what you read than what is estimated, `cor()` takes standard deviations on the diagonal and the correlation off-diagonal:

```r
  eta.cl + eta.v ~ cor(0.32,
                       0.5, 0.32)
```

Both blocks above describe the same matrix. Only the way **you** write the starting value changes; the estimated parameter is still the covariance.

:::note
The correlation between $\eta_{cl}$ and $\eta_{v}$ is physiological — a large patient often has both a high clearance and a high volume. Ignoring it does not degrade the fit much, but it distorts **simulations**: the diagonal model manufactures high-clearance, small-volume patients that do not exist in nature.
:::

### IOV is declared as a level

nlmixr2 does not code IOV with repeated etas. It declares it as a **level of variability**, with a vertical bar:

```r
ini({
  tcl <- log(4.5)
  eta.cl ~ 0.1
  iov.cl ~ 0.03 | occ      # between occasions, not between patients
})
model({
  cl <- exp(tcl + eta.cl + iov.cl)
  ...
})
```

$$ \log(Cl_{ij}) = t_{cl} + \eta_{i,cl} + \kappa_{ij}, \qquad \eta_{i,cl} \sim \mathcal{N}(0, \omega_{cl}^2), \quad \kappa_{ij} \sim \mathcal{N}(0, \omega_{\text{IOV}}^2) $$

`| occ` reads "variability **between** `occ`", by symmetry with IIV, which is variability between `id`. The `occ` column is an ordinary data column that you build yourself (for instance `dat$occ <- ifelse(dat$TIME < 336, 1, 2)`).

:::key
The point that matters: the level carries **one single variance**, shared by every occasion. Two occasions or eight, `iov.cl` stays **one estimated parameter** — only the number of individual $\kappa_{ij}$ values grows. It is the same service as NONMEM's `SAME`, obtained by construction: there is nothing to constrain because there is nothing to repeat. That is exactly the spirit of Monolix's `varlevel`. One honest caveat: nlmixr2 does not handle **correlations between IOV terms**, where NONMEM can put them in a single `BLOCK`.
:::

### Covariates are plain R

Here nlmixr2 is more direct than either competitor: there is **no covariate block**. Any column of the dataset can be used straight away in `model({})`, and the transformation is written on the spot.

```r
ini({
  tcl <- log(4.5)
  beta.cl.crcl <- 0.7
  beta.cl.sex  <- 0.1
  eta.cl ~ 0.1
})
model({
  cl <- exp(tcl + beta.cl.crcl*log(CRCL/90) + beta.cl.sex*SEX + eta.cl)
})
```

with `SEX` coded 0/1 in the data. Look at what the log scale gives you for free: the covariate enters **additively on the log**, hence **multiplicatively** on the parameter.

$$ Cl_i = e^{t_{cl}} \left(\frac{CRCL_i}{90}\right)^{\beta_{CRCL}} e^{\beta_{SEX} I_M(i)} \; e^{\eta_{i,cl}} $$

:::howto
A log-transformed, centred continuous covariate added with a plain coefficient inside the `exp()` **is** the power model. It is NONMEM's `TVCL = THETA(1)*(CRCL/90)**THETA(4)`, written without a power operator. Allometry on body weight is obtained the same way: `beta.cl.wt*log(WT/70)` with `beta.cl.wt <- fix(0.75)` to impose it rather than estimate it.
:::

And the rule that holds in all three tools: a covariate **takes away from the eta what it explains**. `exp(tcl)` becomes the clearance of a reference patient — here 90 mL/min of CRCL and `SEX = 0` — and `eta.cl` now carries only the remainder. A covariate that earns its place is therefore seen in the **drop in omega**, not only in the drop in OFV.

:::note
Ref.: the nlmixr2 project documentation for the `ini()`/`model()` block syntax, the variability levels and the contents of the `fit` object; Fidler et al., *CPT Pharmacometrics Syst Pharmacol* for the nlmixr project; Karlsson & Sheiner, *J Pharmacokinet Biopharm* 1993 for inter-occasion variability; Savic & Karlsson, *AAPS J* 2009 for shrinkage.
:::
<!-- /step -->

<!-- step:title="Worked example" viz="12_VariabilitySandbox" -->
**44 patients**, oral administration, one compartment with first-order absorption, proportional error. Two sampling occasions per patient: a rich profile on day 1, two trough samples on day 21. We build the statistical model in steps, using SAEM.

| Run | Variability model | Parameters | OFV | $\Delta$ |
|---|---|---|---|---|
| 1 | three independent etas | 7 | 1682.4 | — |
| 2 | + block `eta.cl + eta.v ~ c(...)` | 8 | 1670.1 | −12.3 |
| 3 | + IOV on `cl` at the `occ` level | 9 | 1651.8 | −18.3 |
| 4 | + CRCL on `cl` | 10 | 1633.6 | −18.2 |

**Run 1 → 2.** The correlation comes out at $r = 0.45$. One parameter more, the OFV drops by 12.3, well above the 3.84 threshold on 1 degree of freedom: the block is kept.

**Run 2 → 3.** `iov.cl` is estimated at 19.2% CV, and the BSV on clearance **falls** from 41.2% to 35.1%. That is the most instructive result in the table: part of what we were attributing to "this patient eliminates fast" was really "that particular visit was different". Without an occasion level, IIV **absorbs the IOV** and ends up overestimated — and a model that overestimates IIV also overestimates the spread of the simulations you will draw a dosing recommendation from.

**Run 3 → 4.** The exponent on creatinine clearance comes out at 0.71, and the BSV on clearance goes from 35.1% to 29.9%. Renal function therefore explains about **5 CV points**. That sentence, not the $\Delta$ of 18.2, is the one with clinical meaning, and the one that goes into the report.

:::note
The OFV of a SAEM fit is not produced by the algorithm itself: nlmixr2 computes it **afterwards**, through a FOCEi approximation, and the fit header says so (`OBJF by FOCEi approximation`). Two practical consequences. These $\Delta$ values are only comparable across runs whose OFV was obtained **the same way** — the "same method" rule from the introductory chapter applies here literally. And testing `iov.cl = 0` puts the null hypothesis **on the boundary** of the parameter space, since a variance cannot be negative: the 3.84 threshold is conservative there, hence safe.
:::

### The parameter table

This is nlmixr2's real ergonomic strength: everything sits in **one table**, already back-transformed.

```
── nlmixr² SAEM(ODE); OBJF by FOCEi approximation ──

  Parameter      Est.     SE  %RSE  Back-transformed(95%CI)  BSV(CV%)  Shrink(SD)%
  tcl            1.52  0.043   2.8       4.57 (4.20, 4.97)       29.9        7.6%
  tv             3.46  0.048   1.4       31.8 (28.9, 35.0)       39.1       12.8%
  tka           0.131  0.104    79       1.14 (0.93, 1.40)       52.4       45.3%
  beta.cl.crcl   0.71  0.128    18       0.71 (0.46, 0.96)
  prop.err      0.116  0.009   7.8                    0.116
  iov.cl                                                          19.2
```

Three columns are worth stopping on.

**`Est.` is on the estimated scale**, `Back-transformed` on the useful one. `tcl = 1.52` is not reportable; $e^{1.52} = 4.57$ L/h is. There is nothing magic about that column: nlmixr2 produced it by **reading the `exp()`** in your `model({})`. The `beta.cl.crcl` row makes this plain — since no exponential surrounds it, the back-transformed value is identical to the estimate, and only the confidence interval is added.

**`BSV(CV%)` spares you the square root.** 29.9% is the $\sqrt{e^{\omega^2}-1}$ of the omega of `eta.cl`. Note that `iov.cl` appears on its own row, with its spread but with no estimate and no standard error: it is a level of variability, not a fixed effect.

:::pitfall
`%RSE` on a log-transformed theta is **not** the RSE you would read in a NONMEM listing, and it must not be judged by the same yardstick. Look at `tka`: 79% RSE, a figure that anywhere else would trigger a reflex to delete the parameter. But the back-transformed interval is (0.93 – 1.40), a factor of 1.5 from bottom to top — a perfectly well estimated absorption. The explanation is arithmetic: the RSE is the ratio $SE/|Est|$ computed **on the log scale**, and $t_{ka} = 0.131$ is close to zero because $k_a$ is close to 1 h⁻¹. A denominator grazing zero blows the ratio up without anything having gone wrong. On a log-transformed theta, judge the uncertainty on the **back-transformed interval**, never on the `%RSE`.
:::

### The objects to interrogate

The printed table summarises; the `fit` object holds everything, as R matrices you can reuse directly.

```r
fit$omega     # full covariance of the random effects
fit$omegaR    # same matrix: SDs on the diagonal, correlations off-diagonal
fit$shrink    # shrinkage and distribution statistics of the etas
fit$eta       # the individual etas, one per patient
fit$iov       # the individual kappas, per patient and per occasion
```

```
> fit$omega
       eta.cl  eta.v eta.ka
eta.cl 0.0856 0.0497 0.0000
eta.v  0.0497 0.1422 0.0000
eta.ka 0.0000 0.0000 0.2426

> fit$omegaR
       eta.cl  eta.v eta.ka
eta.cl 0.2926 0.4500 0.0000
eta.v  0.4500 0.3771 0.0000
eta.ka 0.0000 0.0000 0.4925
```

`fit$omega` and `fit$omegaR` describe the same thing in two languages. The first is what the model estimates; the second is what you can read — $\omega_{cl} = 0.29$, $\omega_{v} = 0.38$ and $r_{cl,v} = 0.45$ are visible at a glance, without dividing anything. The zeros in the `eta.ka` column are not estimates that came out near zero: they are **cells that were never estimated**, since `eta.ka` was declared outside the block.

And shrinkage, already present in the `Shrink(SD)%` column:

$$ Sh_\eta = 1 - \frac{SD(\hat{\eta}_i)}{\omega} $$

$\eta_{cl}$ sits at 7.6%: informed by the whole curve, individual clearance is reliable. $\eta_{ka}$ sits at 45.3%, and the reason is written in the design — only day 1 carries early samples, so the absorption phase is informed on half the occasions. For the patients concerned, the individual estimate **falls back towards the population**.

:::recall
Shrinkage disqualifies the **individual etas** as a diagnostic tool, not the **population parameters**. The omega of `eta.ka` is still estimated across all 44 subjects and keeps its meaning even when `fit$eta` is mute patient by patient. Concretely: at 45% shrinkage, a plot of `eta.ka` against body weight settles nothing, in either direction — you test the covariate **inside the model**, you do not judge it on the cloud.
:::
<!-- /step -->

<!-- step:title="Common pitfall" -->
You are translating into nlmixr2 a NONMEM model that has been running for years. The control stream contains:

```
$THETA (0, 1.2)          ; KA
$PK
  KA = THETA(3)*EXP(ETA(3))
```

The `(0, ...)` here is perfectly correct and perfectly idiomatic: `THETA(3)` is an absorption rate constant in h⁻¹, it must stay positive, so you say so. You transpose faithfully:

```r
ini({
  tka <- c(0, log(1.2))     # "same as NONMEM: lower bound at 0"
  eta.ka ~ 0.2
})
model({
  ka <- exp(tka + eta.ka)
})
```

You run it with `est = "focei"`. The run completes. `tka` comes out at **0.0000**, `ka` back-transformed at **1.00 h⁻¹** — exactly. The SE is nonsense, the `%RSE` goes haywire. You rerun the same file with `est = "saem"`: this time `tka = -0.478`, i.e. **0.62 h⁻¹**, and the absorption-phase diagnostics come back clean.

Two methods, one file, two answers. The tempting conclusion — "SAEM and FOCEI disagree, it is an algorithm artefact" — is wrong, and it would have you spend days comparing engines when the bug is inside a bracket.

:::pitfall
The bound does not apply to `ka`. It applies to **`tka`**, and `tka` is a logarithm. `tka > 0` therefore means $k_a > e^0$, i.e. **`ka` > 1 h⁻¹**. You did not write "absorption is positive": you wrote "absorption is faster than a one-hour absorption half-life". Since the true value is 0.62 h⁻¹, the optimiser pushes the parameter against the bound and **sticks to it**. The signature to recognise: a parameter landing exactly on a round value, with a broken standard error.
:::

That leaves the asymmetry, which is the real danger. **SAEM does not handle bounds** and ignores them — nlmixr2 does warn you in the console about it. **FOCEI, on the other hand, respects them**: its outer optimiser accepts box constraints, and it says nothing, because it is doing exactly what it was told. So the engine that warns you is the one that had no problem, and the engine that hands you the wrong number is the one that stays silent. One warning drowned in a wall of R output, and the damage is done.

The fix is three characters long:

```r
tka <- log(1.2)           # no bound, and that is deliberate
```

:::recall
The bound was not merely **wrongly scaled**: it was **unnecessary**. `exp()` cannot return a negative number, whatever the value of `tka` — positivity is already guaranteed by the shape of the model. That is precisely the bargain you accepted when you adopted the log convention: you traded the constraint for a reparameterisation, and you must not pay for both. Field rule: on a parameter wrapped in `exp()`, use **no** bounds. If you write one anyway, say out loud which value it forbids **on the natural scale** — and check it is not a value your patients could have.
:::
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The grammar of `ini({})` comes down to three signs: `<-` declares a fixed effect, `~` a random effect, `|` a level of variability. The name `tcl` declares nothing — the `t` is a human convention.
- What makes `tcl` log-transformed is the `exp()` in `model({})`, not its starting value. nlmixr2 reads your `model({})` back to back-transform its output: it **reports** what you wrote, it never fixes a disagreement between the two blocks.
- The value after the `~` is a **variance**, like NONMEM's `$OMEGA` and unlike Monolix's `sd`. $CV = \sqrt{e^{\omega^2}-1}$; the tutorial `~ 0.1` is 32% CV; a usual IIV lives between 0.04 and 0.25.
- `eta.cl + eta.v ~ c(0.1, 0.05, 0.1)` gives the **lower triangle** of the covariance: the covariance is in the **middle**. `cor()` lets you enter SDs and a correlation instead.
- IOV is a **level** (`iov.cl ~ 0.03 | occ`): one single variance whatever the number of occasions, so there is no `SAME` to write. Without it, IIV absorbs the IOV and ends up overestimated.
- Covariates are plain R inside `model({})`, with no dedicated block. On the log scale, `beta*log(CRCL/90)` **is** the power model. A good covariate lowers omega, not only the OFV.
- On a log-transformed theta the `%RSE` is misleading near zero: judge on the **back-transformed interval**. `fit$omegaR` reads without arithmetic (SDs on the diagonal, correlations elsewhere); `fit$shrink` above 20–30% invalidates eta versus covariate plots.
- Put **no bound** on a parameter wrapped in `exp()`: it is unnecessary and its scale is misleading. SAEM ignores bounds and warns you, FOCEI applies them in silence — the dangerous engine is the quiet one.
<!-- /step -->

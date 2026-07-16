---
id: "nlmixr2-erreur-residuelle"
slug: "nlmixr2-erreur-residuelle"
title: "nlmixr2 — the residual error model and BLQ data"
description: "Declaring the error in model(): add, prop, pow, lnorm and their combinations; initial values in ini(), BLQ through the CENS and LIMIT columns, diagnostics with ggPMX and xpose.nlmixr2."
summary: "In nlmixr2 the error is declared with a tilde and estimated as standard deviations: the available forms, the addProp that lives in the control rather than the model, native BLQ through CENS and LIMIT, and the R diagnostics."
track: "nlmixr2"
order: 233
duration: "12 min"
level: "intermediate"
tags: ["nlmixr2", "rxode2", "error-model", "bql", "residuals"]
prerequisites: ["tools-nlmixr2"]
glossary: []
slides: []
sources: ["nlmixr2", "fidler-nlmixr", "beal-bql", "berrah-residual"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Your model() block ends with `cp ~ add(add.err) + prop(prop.err)` and nothing else. The way nlmixr2 combines the two terms..."
    options:
      - "depends on the addProp option of the control object, whose default value is combined2: the model text alone does not fix it"
      - "depends on the order of the terms on the line: writing add() before prop() imposes the sum of standard deviations, hence combined1"
      - "is always combined1, the sum of standard deviations, unless the dataset carries a CENS censoring column"
    correct: 0
  - prompt: "After an estimation, nlmixr2 returns `prop.err = 0.118`. This number reads as..."
    options:
      - "a relative standard deviation, hence a CV of about 11.8%: nlmixr2 estimates standard deviations, not variances"
      - "a relative variance, hence a CV of about 34%, exactly like the corresponding value of a SIGMA block under NONMEM"
      - "a standard deviation in mg/L, hence a noise floor of 0.118 mg/L independent of the concentration level"
    correct: 0
  - prompt: "A censored row of your dataset carries `CENS = 1`. The `DV` column of that same row must contain..."
    options:
      - "the LOQ itself: nlmixr2 then lets the row enter through the probability that the concentration lies below that bound"
      - "the value zero, which nlmixr2 recognises as the conventional code for a left-censored observation"
      - "half the LOQ, a value that nlmixr2 imputes before treating the row as an ordinary observation"
    correct: 0
  - prompt: "In the `ini()` block, a residual error parameter is declared with..."
    options:
      - "`<-`, like a fixed effect: its role comes from its use inside an error function, not from its declaration"
      - "`~`, like a random effect: nlmixr2 stores residual terms with the ETA variances, in the same matrix"
      - "`<-` followed by `fixed()`, the only form that lets nlmixr2 tell a residual term from an ordinary fixed effect"
    correct: 0
---

<!-- step:title="Why this chapter" -->
In nlmixr2, the residual error model sits on the last line of `model()`, and that line looks like no other: it carries a **tilde**, not an arrow. This is not a syntactic quirk. Every line above it **computes** something; this one **declares** how that something was observed.

Yet it decides what matters most, because every observation enters the likelihood **divided by its residual standard deviation**. A point you declare precise pulls hard on the curve; a point you declare noisy weighs almost nothing. Writing this line is not describing noise: it is handing out the **weights** of the estimation.

Two things set nlmixr2 apart here, and you need to know both.

The good one: nlmixr2 estimates **standard deviations**, directly in the units of the measurement. No `SIGMA` block, no variance to fix at 1, no `W` to hand-write. Everything the NONMEM chapter buys through a clever parameterisation is the default behaviour here.

The bad one: part of the meaning of your error line is **not** in the model. It is in the control object passed to the estimator. An nlmixr2 model read on its own is, on this precise point, **ambiguous** — and that is this chapter's trap.
<!-- /step -->

<!-- step:title="Intuition" viz="13_ResidualError" -->
Read `cp ~ add(add.err)` as a plain English sentence: "`cp` is observed with an additive error whose standard deviation is called `add.err`". The tilde is exactly the one from `lm(y ~ x)`: on the left what you observe, on the right the model of that observation. nlmixr2 borrows R's grammar rather than inventing one.

This reading has an immediate practical consequence. `cp = centr/v` is an assignment: after that line, `cp` **holds** a value. `cp ~ add(add.err)` changes the value of nothing at all — it wires `cp` to the observation column and tells the estimator what error bar to draw around it. A `model()` function with no tilde line defines no likelihood; it is no longer a model to estimate, it is a simulator.

That leaves the only question the error model asks: **how wide is the bar, and how does it change with concentration?** A real assay has two noise regimes, unrelated to each other:

- a **floor**, in mg/L, indifferent to concentration — background noise, baseline, everything that remains when there is almost nothing left to measure. That is `add()`;
- a **percentage**, growing with concentration — dilutions, pipetting, calibration. That is `prop()`.

A PK profile routinely spans two or three orders of magnitude, from peak to last trough. It therefore crosses both regimes, and no single-term form is right across the whole range. That is exactly why `add() + prop()` is the default answer.

:::key
The real lever is elsewhere: the standard deviation $g(f)$ is the **weight**. In the likelihood, a point costs $(y-f)^2/g^2$. Small $g$ = point declared precise = heavy point. Declaring `prop()` alone tells SAEM "the troughs are my precise points, obey them". Declaring `add()` alone says "the peak and the trough are equally precise" — and since only the high points can produce large deviations in mg/L, they are the ones that will dominate the sum. You are not describing an assay: you are arbitrating which part of the profile the model is allowed to miss.
:::
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="61_ResidualError" -->
Every nlmixr2 form fits under a single statement:

$$ y_{ij} = f_{ij} + g(f_{ij}) \cdot \varepsilon_{ij}, \qquad \varepsilon_{ij} \sim \mathcal{N}(0,1) $$

The tilde line only picks $g$, the **standard-deviation function**.

| declaration in `model()` | $g(f)$ | what it says |
|---|---|---|
| `cp ~ add(a)` | $a$ | floor only, in mg/L |
| `cp ~ prop(b)` | $b \cdot f$ | percentage only |
| `cp ~ pow(b, c)` | $b \cdot f^{c}$ | power, exponent $c$ estimated |
| `cp ~ add(a) + prop(b)` | $\sqrt{a^2 + (bf)^2}$ **or** $a + bf$ | combined — see below |
| `cp ~ add(a) + pow(b, c)` | $\sqrt{a^2 + (bf^{c})^2}$ **or** $a + bf^{c}$ | combined with a free exponent |
| `cp ~ lnorm(s)` | exponential error | $\log y = \log f + s\,\varepsilon$ |

`prop(b)` is merely the $c = 1$ case of `pow(b, c)`. Leaving the exponent free asks the data where the assay's real regime sits between a pure floor ($c = 0$) and a pure percentage ($c = 1$); it is often a poorly identified parameter, to be brought out only with a wide range and abundant data.

`lnorm(s)` gives $y = f \cdot e^{s\varepsilon}$: strictly positive support, right-skewed distribution. Since $e^{s\varepsilon} \approx 1 + s\varepsilon$ for small $s$, the model behaves like a proportional one with $CV \approx s$, but never returns a negative value. The parameter `s` lives on the **log** scale: it is dimensionless. Reading it as mg/L produces a plausible and wrong number. Corollary: `lnorm()` **already produces** an error proportional to the prediction — stacking a `prop()` on top counts the same effect twice.

**The `ini()` block: two operators, two roles.**

```r
mod <- function() {
  ini({
    tka <- log(1.1)
    tcl <- log(2.8)
    tv  <- log(32)
    eta.cl ~ 0.09              # random effect : variance
    eta.v  ~ 0.04
    add.err  <- c(0, 0.03)     # standard deviation, mg/L, lower bound 0
    prop.err <- c(0, 0.12)     # relative standard deviation, fraction
  })
  model({
    ka <- exp(tka)
    cl <- exp(tcl + eta.cl)
    v  <- exp(tv  + eta.v)
    d/dt(depot) = -ka*depot
    d/dt(centr) =  ka*depot - (cl/v)*centr
    cp = centr/v
    cp ~ add(add.err) + prop(prop.err) + combined2()
  })
}
fit <- nlmixr2(mod, data, est = "saem")
```

The previous chapter laid down the rule: inside `ini()`, `~` declares a **random effect** through its variance, `<-` declares a **fixed effect**. Residual parameters get no third lane — they take the `<-`, exactly like the thetas. Writing `add.err ~ 0.03` therefore does not produce a residual term: it creates an ETA named `add.err` that nobody then uses. This is the classic beginner slip, and it breaks very little out loud.

Which leads to the naming point. **nlmixr2 has no block reserved for error parameters.** `add.err` and `prop.err` are conventional names, not keywords: call them `sigma.floor` and `cv.assay` and nothing changes. A scalar declared in `ini()` becomes a residual parameter **because an error function consumes it** on the tilde line, and for no other reason. The role comes from the use, not from the declaration.

:::key
Practical corollary: `add.err` and `prop.err` are estimated as **standard deviations**, on the natural scale of the measurement. A `prop.err` of 0.118 is a CV of 11.8%, read as is. No square root to take — and this is where translating from NONMEM breaks: a `$SIGMA` of 0.0139 for the same assay is a **variance**, and $\sqrt{0.0139} = 0.118$. Copying 0.0139 into `prop.err <- 0.0139` declares a CV of 1.4% and an assay ten times too precise.
:::

Two useful `ini()` forms: bounds, `add.err <- c(0, 0.03)` = lower bound 0 and initial value 0.03 (the three-element form adds an upper bound); and freezing, `add.err <- fixed(0.05)`, to impose a noise floor known from the laboratory instead of estimating it — useful when the low data are too sparse to inform it.

**The combined form, and where the choice lives.** Two ways to assemble a floor and a percentage:

$$ g_{\text{combined1}} = a + b f \qquad\qquad g_{\text{combined2}} = \sqrt{a^2 + (b f)^2} $$

`combined2` is the form that follows from **two independent noise sources**: independence, therefore **variances** add. It is the one with a statistical justification, it is the exact equivalent of NONMEM's `Y = F + F*EPS(1) + EPS(2)`, and it is nlmixr2's **default**. `combined1` adds the standard deviations: no pair of independent sources produces that; it is a convenient parameterisation, nothing more. The two differ appreciably only around $f = a/b$, where the regimes balance — by at most a factor of $\sqrt{2}$.

The nlmixr2 point, though, is not mathematical. It is that this choice is **also** settled by the `addProp` option of the control object, outside the model:

```r
nlmixr2(mod, data, est = "focei",
        control = foceiControl(addProp = "combined1"))
```

Writing `+ combined2()` explicitly on the tilde line, as in the code above, anchors the choice **in the model** and makes it immune to the control. That is not decoration: see the common pitfall.

:::note
Ref.: the nlmixr2 project (documentation of the error models, of the `ini()`/`model()` syntax and of the `CENS`/`LIMIT` data format); Fidler M., Wang W., Hallow K.M. et al. for the implementation and validation of nlmixr/nlmixr2; Beal S.L., *J Pharmacokinet Pharmacodyn* 2001 for the M1-M7 methods of handling data below the LOQ.
:::
<!-- /step -->

<!-- step:title="Worked example" viz="62_ResidualPatterns" -->
An oral kinase inhibitor, 42 patients, 336 concentrations, from 12 mg/L at the peak down to a **LOQ of 0.10 mg/L** — more than two orders of magnitude. SAEM runs on the model above and returns the population parameter table:

| parameter | Est. | %RSE | back-transformed |
|---|---|---|---|
| `tka` | 0.10 | 14 | $k_a$ = 1.11 h⁻¹ |
| `tcl` | 1.03 | 5.2 | $Cl$ = 2.80 L/h |
| `tv` | 3.47 | 3.1 | $V$ = 32.1 L |
| `add.err` | 0.031 | 9.4 | 0.031 mg/L |
| `prop.err` | 0.118 | 4.6 | 11.8% |

Three things read straight off, with no intermediate arithmetic.

**The units.** `add.err` = 0.031 mg/L is a noise floor, `prop.err` = 0.118 a CV of 11.8%. These are standard deviations: the same error expressed in NONMEM would print a `$SIGMA` of 0.000961 and 0.0139, and it would take two square roots to recover these figures.

**The sanity check.** The reference point costs two seconds: `add.err` should land in the neighbourhood of the assay noise, hence in the same range as the LOQ. Here 0.031 for a LOQ of 0.10 — consistent. If SAEM hands you `add.err` = 0.9 mg/L with the same LOQ, the parameter is no longer measuring the assay: it is **soaking up** a structural flaw. Look at the curve before accepting the number.

**The crossover.** It sits at $f = a/b = 0.031/0.118 = 0.26$ mg/L. Above it the percentage rules; below it the floor does. A trough predicted at 0.15 mg/L gets $g = \sqrt{0.031^2 + 0.0177^2} = 0.036$ mg/L. Under `prop(prop.err)` alone it would have got $g = 0.118 \times 0.15 = 0.018$ mg/L: the model would be claiming it resolves that concentration to within 18 ng/mL, six times better than its own LOQ. That is what the additive term prevents.

**BLQ.** The laboratory returns **47 points out of 336 (14%)** below the LOQ, nearly all of them late troughs. An observation "< LOQ" is neither a missing value nor a number: it is an **inequality**, and often the only information you hold about the terminal phase.

nlmixr2 takes it at its word, in the **dataset**, not in the model. Two columns suffice: `CENS` flags the row (0 = ordinary observation, 1 = left-censored, -1 = right-censored) and `LIMIT` supplies the other bound of the interval. On a censored row, the `DV` column carries **the LOQ itself**.

```
ID  TIME   DV     AMT  EVID  CMT    CENS  LIMIT
7    0.0   .      200   1    depot   0     .
7    1.0   3.42   .     0    cp      0     .
7    8.0   0.61   .     0    cp      0     .
7   24.0   0.10   .     0    cp      1     .      <- BQL : DV carries the LOQ
```

The censored row no longer enters through a **density** but through a **probability**:

$$ P(y_{ij} < LOQ) = \Phi\!\left(\frac{LOQ - f_{ij}}{g(f_{ij})}\right) $$

This is Beal's **M3** method, obtained by filling in a column. Adding `LIMIT = 0` on those same rows bounds the interval to $(0,\ 0.10)$ instead of $(-\infty,\ 0.10)$: that is **M4**. One column separates the two. Where NONMEM demands an `F_FLAG`, a hand-coded `PHI` and a `LAPLACIAN`, censoring here is an attribute of the **data** — and since M3 costs nothing to enter, there is no excuse left for a LOQ/2.

What it changes on this dataset, refitting both ways:

| | $Cl$ (L/h) | `add.err` (mg/L) | %RSE of `add.err` |
|---|---|---|---|
| M1 — the 47 points discarded | 2.55 | 0.009 | 71 |
| M3 — `CENS = 1` | 2.80 | 0.031 | 9.4 |

Nine percent apart on clearance, and that is no accident: BQL points are not missing at random. At a given late time, only the patients whose concentration sits **above** the average survive. You are not removing noise, you are **truncating the tail from below** — the terminal slope looks flatter and $Cl$ comes out underestimated.

The tell is in the last column. Without the BQL points, `add.err` has no low data left to inform it: it collapses to 0.009 mg/L **and** its %RSE jumps to 71. nlmixr2 prints you, for free, the sign that the parameter is no longer identified. A three-digit %RSE on an additive residual term is almost always this story.

:::pitfall
On a `CENS = 1` row, `DV` must contain the **LOQ**, not zero and not `NA`. nlmixr2 reads the bound you write literally: with `DV = 0`, you are asserting that the concentration was below **zero**. The probability $\Phi((0 - f)/g)$ then collapses towards 0 for any positive prediction, the likelihood blows up, and SAEM goes off crushing the late predictions in an attempt to satisfy an impossible constraint. The run does not refuse to go — it returns an absurd clearance and an implausible terminal slope.
:::

**The diagnostics.** The IWRES is the residual divided by the standard deviation the error model **claims**, hence the only plot that judges $g$:

$$ \text{IWRES}_{ij} = \frac{y_{ij} - f_i(t_{ij})}{g(f_i(t_{ij}))} $$

If $g$ is right, the cloud is centred on 0, with a standard deviation of 1, and the **same width everywhere**. Hence the reading rule: IWRES against **predictions** — not against time — and you read the **width**, not the centre. A cloud that **opens up** to the right: $g$ too small at the top of the range, the percentage is missing. A cloud that **narrows** to the right: $g$ too small at the bottom of the range, the floor is missing. A **curved** cloud against time: that no longer speaks about the error model but about the structural model.

The fit is an R object, so both diagnostic ecosystems plug straight into it:

```r
fit <- addCwres(fit)    # CWRES/CPRED : not computed by default after a SAEM
fit <- addNpde(fit)     # NPDE, by simulation from the population model

library(xpose.nlmixr2)
xpdb <- xpose_data_nlmixr2(fit)
absval_res_vs_pred(xpdb, res = "IWRES")   # the width, not the centre
dv_vs_ipred(xpdb)

library(ggPMX)
ctr <- pmx_nlmixr(fit)
pmx_plot_iwres_ipred(ctr)
pmx_plot_npde_time(ctr)
pmx_report(ctr, name = "diag", save_dir = ".", format = "html")

vpcPlot(fit, n = 500)
sd(fit$IWRES)           # to be read BEFORE the shape of the cloud
```

:::recall
`sd(fit$IWRES)` before anything else. The $\varepsilon$-shrinkage equals $1 - \mathrm{SD}(\text{IWRES})$: on a sparse design, SAEM can nearly **interpolate** each subject's points, the individual residuals collapse, and the IWRES shrink with them. Far from 1, the cloud has no detection power left — a **bad** error model will return the same handsome plot. Move then to simulation-based diagnostics, `vpcPlot()` and the NPDE, which see the population model you actually declared.
:::
<!-- /step -->

<!-- step:title="Common pitfall" -->
Take nlmixr2's most ordinary error line, written without a modifier:

```r
cp ~ add(add.err) + prop(prop.err)
```

This line **does not say** how the two terms combine. It names two parameters and stops there. The rest — sum of variances or sum of standard deviations — is decided in the control object, through the `addProp` option, whose default is `"combined2"`:

```r
fit1 <- nlmixr2(mod, data, est = "focei")
fit2 <- nlmixr2(mod, data, est = "focei",
                control = foceiControl(addProp = "combined1"))
```

Same `mod` function, same dataset, **two different error models**. On the dataset from the previous section, `fit1` returns `add.err` = 0.031 and `prop.err` = 0.118; `fit2` returns 0.021 and 0.109 — the estimates shift to compensate for the wider shape of `combined1`. And the OFV moves by two or three points, which is to say by nothing: the two forms differ only near $f = a/b$, so they fit almost identically. Nothing in the output shouts.

:::pitfall
The consequence is that **the `mod` function alone does not define your model**. This is counter-intuitive, because everything else is in there: the structure, the ETAs, the initial values. You send `mod` to a reviewer, you paste it into a paper, you pick it up again six months later — and the information is missing. Worse, `saemControl()` carries the **same** option: reusing a colleague's control while switching `est = "saem"` to `est = "focei"` can change the error model along the way, when you thought you were only changing algorithm. The remedy is one modifier: write `+ combined2()` (or `+ combined1()`) **on the tilde line**. The choice becomes a property of the model again, the control can no longer contradict it, and the function reads on its own.
:::

The principle reaches well beyond `addProp`: in nlmixr2, anything that lives in the control escapes the model. That is true of the OFV as well.

:::note
SAEM does not produce a likelihood as a by-product of its iteration: nlmixr2 therefore computes the OFV **after the fact**, by default with the FOCEi evaluator. The consequence for this chapter: a $\Delta$OFV between an `add()` model and an `add() + prop()` model is only worth anything if both fits carry the **same** OFV method — `fit$objDf` lists the ones that have been computed, read it before ruling between two error models. The chapter on the engines details why four different numbers can all be displayed under the name OFV.
:::
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The tilde line of `model()` computes nothing: it **declares** how the prediction was observed. Without it there is no likelihood — just a simulator.
- $g(f)$ is the **weight** of each point in the likelihood, not a description of noise. It arbitrates which part of the profile SAEM is allowed to miss.
- The forms: `add(a)` $= a$; `prop(b)` $= bf$; `pow(b,c)` $= bf^{c}$; `lnorm(s)` $\Rightarrow y = f e^{s\varepsilon}$, where `s` is a CV on the **log** scale, not mg/L.
- nlmixr2 estimates **standard deviations** in the units of the measurement: `prop.err` = 0.118 reads as "CV of 11.8%", no square root. No `SIGMA`, no `1 FIX`, no `W` — the convenience NONMEM asks you to build by hand.
- `ini()`: `~` for a random effect, `<-` for everything else. A scalar becomes residual **because an error function consumes it**, not because it is declared somewhere special. The names are free.
- `add() + prop()` alone is **ambiguous**: the combination comes from `addProp` in the control (default `combined2`, the sum of variances, equivalent to NONMEM's combined form). Write `+ combined2()` on the tilde line so the model reads on its own.
- BLQ: `CENS` (1 = left-censored) and `LIMIT` columns, the **LOQ in `DV`**. The point contributes through $\Phi((LOQ-f)/g)$ — Beal's M3 without a line of code, M4 by adding `LIMIT = 0`. `DV = 0` on a censored row is an impossible assertion that makes the run drift.
- Judge $g$ on IWRES against **predictions**, reading the **width**: opening up = missing percentage; narrowing = missing floor; curved = structural. But read `sd(fit$IWRES)` first — under $\varepsilon$-shrinkage, a handsome cloud proves nothing.
- A huge %RSE on `add.err` signals a floor that no low data informs any more — typically discarded BQL points.
<!-- /step -->

---
id: "nlmixr2-modele-structural"
slug: "nlmixr2-modele-structural"
title: "nlmixr2 — the structural model in R"
description: "The two-block R function: ini({}) for the numbers, model({}) for the equations, ODEs or linCmt(), and the cp ~ line for the observation."
summary: "Writing the structural model in nlmixr2: ini versus model, the rxode2 engine, d/dt() versus linCmt(), and the tilde that changes meaning by block."
track: "nlmixr2"
order: 231
duration: "10 min"
level: "intermediate"
tags: ["nlmixr2", "rxode2", "structural-model", "ode"]
prerequisites: ["tools-nlmixr2"]
glossary: []
slides: []
sources: ["nlmixr2", "fidler-nlmixr", "wang-rxode"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "In the ini block, the line eta.cl ~ 0.09 declares..."
    options:
      - "a random effect on CL, whose initial value 0.09 is a variance, i.e. a CV of about 31%"
      - "a random effect on CL, whose initial value 0.09 is a standard deviation, i.e. a CV of about 9%"
      - "a population parameter initialised at 0.09, which the model will estimate as a typical value"
    correct: 0
  - prompt: "linCmt() selects the PK model..."
    options:
      - "from the names of the parameters defined in the model block: ka, cl and v give a 1-compartment oral model"
      - "from a model number passed as an argument, on the principle of the ADVAN routines in NONMEM"
      - "from the number of d/dt() lines written just before the call inside the model block"
    correct: 0
  - prompt: "In the model block, the line cp ~ prop(prop.sd) means that..."
    options:
      - "cp is the prediction confronted with the observations, with a proportional error of standard deviation prop.sd"
      - "cp follows a proportional probability distribution, of which prop.sd is the variance to be estimated"
      - "cp is one more random parameter, whose between-subject variability is set by prop.sd"
    correct: 0
---

<!-- step:title="Why this chapter" -->
In Monolix you write mlxtran, in NONMEM a control stream: two languages that exist for nothing else, and two files R cannot read. In nlmixr2, the model is an **R function**. It sits in the script, next to your `read.csv()`; you pass it as an argument, you store it in a list, you version it with the rest of the analysis. The border between the model and the code around it disappears.

That function has an imposed shape: two blocks, `ini({...})` for the numbers and `model({...})` for the equations. This chapter shows how a 1-compartment oral model is written inside them — first with differential equations, then with `linCmt()` — and why the `model` block looks like R without quite being R.
<!-- /step -->

<!-- step:title="Intuition" viz="OralAbsorptionExplorer" -->
The real question, when you meet a new tool, is **where it cuts**. nlmixr2 does not cut where Monolix cuts.

- `ini({...})` holds nothing but **numbers**: where the search starts, and which parameter is random. No equation belongs there.
- `model({...})` holds **every equation**: the typical value, the random effect, the ODEs, the concentration, and the observation line.

The consequence is immediate and throws everyone arriving from Monolix: `cl <- exp(tcl + eta.cl)` is written in `model`, three lines away from the `d/dt()`. Between-subject variability — pure statistics — lives in the same block as the structure. There is no `[INDIVIDUAL]` to look for: the lognormal distribution is written by hand. This is NONMEM's split (`$THETA`/`$OMEGA` on one side, `$PK`/`$DES` on the other), transposed into R.

:::key
The body of the function is **never executed** as ordinary R. nlmixr2 reads its text and builds a model object from it. `ini` and `model` compute nothing: they are markers delimiting two zones to parse. Hence the detail that surprises on the first run: you pass `oral1cpt` to `nlmixr2()` — the name of the function, **without parentheses**.
:::
<!-- /step -->

<!-- step:title="The formula, unpacked" -->
The 1-compartment oral model comes down to two amounts — the depot $A_d$, the central one $A_c$ — and a division:

$$ \frac{dA_d}{dt} = -k_a A_d, \qquad \frac{dA_c}{dt} = k_a A_d - \frac{Cl}{V} A_c, \qquad C = \frac{A_c}{V} $$

**ODE version.** The system wired by hand:

```r
oral1cpt <- function() {
  ini({
    tka <- log(0.9)      # <- : POPULATION parameter. ka = 0.9 /h, placed on the
    tcl <- log(6.0)      #      log scale to guarantee a positive value
    tv  <- log(45)
    eta.cl ~ 0.09        # ~  : RANDOM effect; 0.09 is a VARIANCE
    eta.v  ~ 0.04
    prop.sd <- 0.15      # <- : residual error, on the STANDARD DEVIATION scale
  })
  model({
    ka <- exp(tka)             # no eta here: ka is assumed to carry no IIV
    cl <- exp(tcl + eta.cl)    # the lognormal distribution is written BY HAND
    v  <- exp(tv  + eta.v)

    d/dt(depot)   = -ka * depot                     # declaring d/dt CREATES the compartment
    d/dt(central) =  ka * depot - (cl/v) * central  # the ODEs carry AMOUNTS

    cp = central / v           # the division by V is YOUR job
    cp ~ prop(prop.sd)         # OBSERVATION line: cp is confronted with DV
  })
}
```

Line by line:

- In `ini`, `<-` declares a population parameter, `~` declares a random effect **and its variance**. There is no OMEGA matrix to write: it follows from the `~` lines. For correlated etas, you give the lower triangle: `eta.cl + eta.v ~ c(0.09, 0.03, 0.04)`.
- Still in `ini`, `tcl <- c(-Inf, log(6.0), Inf)` sets lower bound, initial value and upper bound; `label("Clearance (L/h)")` names the row in the output table; `fix()` freezes the parameter.
- In `model`, writing `d/dt(depot)` **is enough** to create the `depot` compartment — nothing is declared anywhere else. Compartments are numbered in their **order of appearance**, which makes a numeric `cmt` fragile: reorder two lines and the dataset no longer doses where you think. Use **names** in the `cmt` column.
- `cp` is not a keyword: it is the name **you** give to the prediction.

**linCmt() version.** The `ini` block does not change; only `model` gets shorter:

```r
  model({
    ka <- exp(tka)
    cl <- exp(tcl + eta.cl)
    v  <- exp(tv  + eta.v)
    cp = linCmt()            # ka + cl + v in scope -> 1 cpt oral, returns a CONCENTRATION
    cp ~ prop(prop.sd)
  })
```

:::howto
`linCmt()` takes **no argument**: it looks at the parameters you have just defined and infers the model from them. `cl` and `v` alone give a 1-compartment IV model; add `ka` and you get first-order absorption; add `q` and `vp` and you move to two compartments. This is the idea behind `pkmodel()` in mlxtran — the model chosen by **names** — with one difference: here the names are those of your variables, not of call arguments. Immediate corollary: call your volume `vd` and `linCmt()` recognises nothing any more. It also routes the dose and returns a concentration directly, where the ODE version leaves both to you. By naming your compartments `depot` and `central`, you keep the same dataset for both writings.
:::

:::key
The tilde does **three jobs** depending on where it falls. In `ini`, `eta.cl ~ 0.09` declares a random effect and its variance. In `model`, on the last line, `cp ~ prop(prop.sd)` declares the observation model. In `model`, on an ordinary line, `ke ~ cl/v` computes `ke` but **keeps it out** of the output table — rxode2 syntax uses this so that intermediate variables do not drown the fit. One character, three meanings: always read the tilde against its block.
:::

:::note
Ref.: nlmixr2 and rxode2 documentation for the syntax of the `ini`/`model` blocks and of `linCmt()`; Fidler *et al.*, *CPT Pharmacometrics Syst Pharmacol* 2019 for model specification through an R function; Wang *et al.*, *CPT Pharmacometrics Syst Pharmacol* 2016 for the ODE engine (RxODE/rxode2).
:::
<!-- /step -->

<!-- step:title="Worked example" viz="OralAbsorptionExplorer" -->
Once the model is written, the rest of the script is plain R:

```r
library(nlmixr2)

dat <- read.csv("pk_oral.csv")     # ID TIME AMT DV EVID CMT; dose 200 mg into depot

fit <- nlmixr2(oral1cpt, dat, est = "saem",     # oral1cpt WITHOUT parentheses
               control = saemControl(nBurn = 300, nEm = 400, seed = 42))

fit$parFixed    # population parameter table, RSE, CV of the etas
head(fit)       # data.frame: ID TIME DV PRED IPRED CWRES eta.cl eta.v cl v cp ...
```

Before reading anything, check that the machine does what you think. For a typical subject — **oral dose 200 mg**, $k_a = 0.9$ h⁻¹, $V = 45$ L, $Cl = 6.0$ L/h, $F = 1$ — the elimination rate constant is $k_e = Cl/V \approx 0.133$ h⁻¹, giving a ratio $k_a/k_e = 6.75$ and a peak at

$$ t_{max} = \frac{\ln(k_a/k_e)}{k_a - k_e} = \frac{1.909}{0.767} \approx 2.49 \text{ h} $$

Since $C_{max} = \frac{F \cdot D}{V}e^{-k_e t_{max}}$ for this model, we expect $C_{max} \approx 4.44 \times e^{-0.332} \approx 3.19$ mg/L, for an exposure of $AUC = F \cdot D / Cl \approx 33.3$ mg·h/L. Three numbers computed in thirty seconds, which disqualify a badly wired model before it costs you half a day of diagnostics.

`fit` is not an output file to open in an editor: it is an **augmented data.frame**, one row per observation, with `PRED`, `IPRED`, `CWRES` and the etas already in columns, plus tables (`fit$parFixed`, `fit$omega`) that go straight into `ggplot2`. That is where the model-as-object choice pays off.

:::recall
Never copy `oral1cpt` to make a variant of it. nlmixr2 modifies a model by **piping**: `oral1cpt %>% ini(tka = log(1.4))` changes an initial value, and `oral1cpt %>% model(cl <- exp(tcl + eta.cl + b.wt*log(WT/70))) %>% ini(b.wt = 0.75)` replaces an equation and declares the parameter it introduces. You get a **new** object, the original stays intact, and the gap between two models fits on one line of your script — not in the diff of two forty-line text files. That is the concrete benefit of "everything is R".
:::
<!-- /step -->

<!-- step:title="Common pitfall" -->
Syntax mistakes in nlmixr2 are loud: a parameter declared in `ini` but absent from `model` makes the parse fail before the first run. The expensive trap is elsewhere, and it is mute.

:::pitfall
`eta.cl <- 0.09` instead of `eta.cl ~ 0.09`. One character. The name still starts with `eta.`, `model` still contains `cl <- exp(tcl + eta.cl)`, everything compiles, the run starts. But `eta.cl` has become a **population parameter**: clearance has no IIV any more, every subject shares the same value, and `tcl` and `eta.cl` now exist only through their sum — two numbers for a single piece of information. nlmixr2 cannot guess your intent: the `eta.` prefix is a reading convention, **not a keyword**. The only clue is discreet: the random-effects table has one row fewer than you had in mind.
:::

The symptom looks nothing like the cause. What you will see, if you see anything, is a covariance step that fails or two population parameters with absurd RSEs — the signature of their confounding. You will go hunting for a data or identifiability problem. The error is a tilde.

The same `ini` block hides a second asymmetry, this one purely about reading. `eta.cl ~ 0.09` gives a **variance**: the standard deviation is 0.3 and the lognormal CV about 31%, not 9%. Two lines below, `prop.sd <- 0.15` gives a **standard deviation**: 15% proportional error, where NONMEM would have you write 0.0225 in `$SIGMA`. Same block, same syntax, two scales. Hence the double reflex: convert before copying an initial value found in a NONMEM run, and convert before reporting an IIV.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The model is an R function with two blocks: `ini({...})` holds only numbers, `model({...})` only equations. nlmixr2 **reads** the body of the function, it does not execute it — hence `nlmixr2(oral1cpt, ...)`, without parentheses.
- The split is NONMEM's, not Monolix's: `cl <- exp(tcl + eta.cl)` is written by hand, in the same block as the ODEs. No `[INDIVIDUAL]` to look for.
- In `ini`, `<-` = population parameter, `~` = random effect and its **variance**; residual error, by contrast, is declared as a **standard deviation**.
- `d/dt(depot)` creates the compartment by its declaration alone, numbers follow the order of appearance — dose by **name** — and the division by $V$ is your job.
- `linCmt()` takes no argument: it picks the model from the **names** of the parameters in scope (`ka, cl, v` = 1-cpt oral), routes the dose and returns a concentration.
- `cp ~ prop(prop.sd)` is the observation line; the tilde changes meaning with its block.
- A `<-` used in place of a `~` in `ini` removes an IIV without breaking anything — and the symptom points at a different culprit.
<!-- /step -->

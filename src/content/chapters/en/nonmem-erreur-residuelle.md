---
id: "nonmem-erreur-residuelle"
slug: "nonmem-erreur-residuelle"
title: "NONMEM — the ERROR block and data below the LOQ"
description: "Writing the ERROR block: additive, proportional, combined; setting SIGMA, handling censored data (M1-M7) and reading WRES, CWRES and IWRES."
summary: "The ERROR block sets the weights of the estimation: its three forms, the W parameterisation, Beal's BQL methods and the residuals that diagnose them."
track: "nonmem"
order: 213
duration: "10 min"
level: "intermediate"
tags: ["nonmem", "error-model", "bql", "residuals"]
prerequisites: ["tools-nonmem"]
glossary: []
slides: []
sources: ["nonmem", "beal-bql", "hooker-cwres", "berrah-residual"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "With a proportional or combined error, the INTER option of the ESTIMATION block is required because..."
    options:
      - "the residual standard deviation depends on the individual prediction, hence on the subject ETA, and is evaluated at that estimated ETA"
      - "it speeds up the minimisation by avoiding the numerical computation of the second derivatives of the likelihood at each iteration"
      - "it allows the EPS terms to be correlated with one another through a non-diagonal SIGMA block, exactly as an OMEGA BLOCK does"
    correct: 0
  - prompt: "Beal's M3 method handles a below-LOQ observation by..."
    options:
      - "adding to the likelihood the probability that the predicted concentration falls below the LOQ"
      - "replacing the missing value with LOQ/2 and then treating it as an ordinary observation"
      - "discarding the below-LOQ points and conditioning the likelihood of the remaining ones"
    correct: 0
  - prompt: "To judge whether the residual error model is well chosen, the most direct diagnostic is..."
    options:
      - "|IWRES| vs individual predictions, which isolates the gap between the observation and the subject prediction"
      - "CWRES vs time, which judges the structural model and the variability at the population level"
      - "WRES vs time, which is still computed under the FO approximation even after a FOCE estimation"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The `PK` block describes what the body does to the drug. The `ERROR` block describes everything that separates a patient's prediction from what the laboratory actually measured. It often fits on a single line — and yet it decides what matters most.

Because every observation enters the likelihood **divided by its residual standard deviation**. A point you declare precise pulls hard on the curve; a point you declare noisy weighs almost nothing. Writing this block is not describing noise: it is handing out the **weights** of the estimation.

The trap is that nothing warns you. With a wrong error model, NONMEM converges, prints reasonable-looking THETAs, and silently hands you a wrong model. NONMEM also forces an explicit decision on concentrations below the limit of quantification: it will not guess on your behalf.
<!-- /step -->

<!-- step:title="Intuition" viz="13_ResidualError" -->
An `EPS` is the noise draw of **one** observation; the `SIGMA` block gives its variance. The whole question then fits in one sentence: **how wide is the error bar, and how does it change with concentration?**

Picture yourself drawing an error bar on each point **before** you have seen the fit. NONMEM will then pull the curve towards the points with **short** bars, and let the long-barred ones drift. So the error model arbitrates a tug-of-war between the **peak** and the **tail** of the profile:

- **additive**: the same bar everywhere (±0.08 mg/L at the peak as at the trough). In absolute terms everyone weighs the same, so the **high** concentrations — the only ones capable of large deviations in mg/L — dominate the sum.
- **proportional**: the bar grows with the prediction. At 0.3 mg/L it becomes tiny — those points turn almost **untouchable** and take command of the terminal tail.

Neither is right everywhere. That is exactly why the **combined** model exists.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="61_ResidualError" -->
Around the individual prediction $F_{ij}$ of subject $i$ at time $j$, the three canonical forms:

$$ y_{ij} = F_{ij} + \varepsilon_{1,ij} \qquad y_{ij} = F_{ij}\,(1 + \varepsilon_{1,ij}) \qquad y_{ij} = F_{ij}\,(1 + \varepsilon_{1,ij}) + \varepsilon_{2,ij} $$

with $\varepsilon_k \sim \mathcal{N}(0, \sigma_k^2)$. What matters is the standard deviation each one implies:

| form | statement | standard deviation of the point |
|---|---|---|
| additive | `Y = F + EPS(1)` | $\sigma_1$ |
| proportional | `Y = F*(1+EPS(1))` | $F_{ij}\,\sigma_1$ |
| combined | `Y = F*(1+EPS(1)) + EPS(2)` | $\sqrt{(F_{ij}\sigma_1)^2 + \sigma_2^2}$ |

The `SIGMA` block supplies **variances** — not standard deviations. This is a classic slip: a value of 0.04 on a proportional error means $\sigma_1 = 0.2$, that is a CV of roughly **20%**.

```
$ERROR
  IPRED = F
  Y     = IPRED + IPRED*EPS(1) + EPS(2)   ; combined
$SIGMA
  0.04        ; proportional : CV ~ 20 %
  0.0064      ; additive     : SD ~ 0.08 mg/L
```

The purely proportional form has a structural flaw: as $F \to 0$, the standard deviation tends to zero. The model then claims **infinite** precision near the LOQ, and those points capture an outsized weight. The additive term is the **floor** that prevents this collapse.

:::howto
**The W parameterisation.** In practice the naive form is rarely written. Instead, the residual variance is fixed to 1 and the standard deviations are estimated as THETAs:

```
$ERROR
  IPRED = F
  W     = SQRT(THETA(4)**2 + (THETA(5)*IPRED)**2)
  Y     = IPRED + W*EPS(1)
  IRES  = DV - IPRED
  IWRES = IRES/W
$THETA (0,0.08)   ; a : additive SD (mg/L)
       (0,0.13)   ; b : proportional SD (fraction)
$SIGMA 1 FIX
```

Three benefits: the terms are read **in physical units** (0.08 mg/L and 13%) instead of variances; the `(0,...)` bounds guarantee their positivity; and `IWRES` becomes explicitly available for the output tables.
:::

**The three residuals** — they do not answer the same question:

$$ \text{IWRES}_{ij} = \frac{y_{ij} - \text{IPRED}_{ij}}{W_{ij}} $$

- **IWRES** compares the observation to the **subject's** prediction: it judges the error model itself, and nothing else.
- **CWRES** is a **population** residual, linearised around the subject's estimated ETA — hence consistent with what FOCE optimises. It should look like an $\mathcal{N}(0,1)$; its patterns betray the **structural** model or the covariates.
- **WRES** is still computed under the **FO** approximation, around $\eta = 0$, even after a FOCE estimation. It is therefore inconsistent with the fitted model and regularly flags flaws that do not exist. It is a relic: CWRES replaced it.
<!-- /step -->

<!-- step:title="Worked example" -->
An antibiotic, 60 patients, 480 concentrations, LOQ = 0.25 mg/L. **58 points (12%)** come back from the laboratory as BQL, nearly all of them late troughs.

**The M1 reflex** — throw them away, through an `IGNORE(BQL.EQ.1)` clause in the data block. The model runs, converges cleanly. It returns CL = 4.1 L/h, terminal half-life 9.8 h, and an additive term that collapses to 0.02 mg/L.

**The problem** is that BQL points are not missing at random. At a given late time, only the patients whose concentration sits **above** the average survive: you are not removing noise, you are **truncating the tail from below**. The terminal slope looks flatter, clearance comes out **underestimated**, and the additive term has no low data left to inform it. Refitted with M3, the same dataset gives CL = 4.8 L/h, half-life 8.1 h, additive term 0.09 mg/L — a **15%** gap on clearance.

Fifteen percent on CL is not a modeller's quibble: in Bayesian dosing, a model that underestimates clearance predicts troughs that are too high and leads to **underdosing** the next patient.

**Beal's seven methods** — M1 discards the BQL points; M2 discards them but conditions the likelihood of the remaining points on being above the LOQ; **M3** treats them as **censored** data; M4 adds a positivity constraint to M3; M5 replaces them with LOQ/2; M6 keeps only the first BQL of a run, at LOQ/2; M7 replaces them with zero.

M3 is the reference choice as soon as the BQL proportion exceeds a few percent. Its principle: a censored point does not carry a value, it carries **information** — "the concentration was somewhere below 0.25". You write it as a **probability**, that of the point falling below the LOQ, through the normal cumulative function `PHI`:

```
$ERROR
  IPRED = F
  LOQ   = 0.25
  W     = SQRT(THETA(4)**2 + (THETA(5)*IPRED)**2)
  IF (BQL.EQ.0) THEN
    F_FLAG = 0
    Y = IPRED + W*EPS(1)          ; normal likelihood of the measured point
  ELSE
    F_FLAG = 1
    Y = PHI((LOQ - IPRED)/W)      ; probability that the point lies below the LOQ
  ENDIF
$SIGMA 1 FIX
$ESTIMATION METHOD=1 INTER LAPLACIAN NUMERICAL
```

Setting `F_FLAG` to 1 tells NONMEM that `Y` is no longer a prediction but a **likelihood** — hence `LAPLACIAN`, mandatory here. The dataset must carry a `BQL` indicator column declared on input, and the censored rows keep a non-missing `DV` (the LOQ by convention), even though it does not enter the computation. Since NONMEM 7.3, declaring the censoring bound through `YLO` offers a shortcut on the same principle, without hand-coding `PHI`.

:::note
The OFVs of M1 and M3 are **not comparable**: they do not cover the same records. M3 adds 58 likelihood terms that M1 ignored. Comparing those two OFVs is meaningless — you compare the **estimates** and the diagnostics, not the OFVs.
:::
<!-- /step -->

<!-- step:title="Common pitfall" viz="62_ResidualPatterns" -->
The costliest trap of the error model is not in its own block: it is in the estimation block.

Asking for `METHOD=1` without `INTER` alongside a proportional or combined error is a **silent inconsistency**. Here is why. FOCE linearises the model around each subject's estimated ETA, but the **residual variance**, without `INTER`, stays evaluated at $\eta = 0$. NONMEM then assigns **everyone** the error bar computed on the **typical** prediction.

Yet a proportional error is precisely what makes the standard deviation depend on $F$, hence on the subject's ETA. A patient whose clearance is twice the typical value genuinely has lower concentrations, hence a genuinely smaller absolute error: giving them the average patient's error bar distorts their weight. The extreme subjects are the worst served, the residual variance comes out biased, and the ETAs deform to compensate.

The rule has no exception: **non-additive error → `INTER`**. The overhead is a few minutes of computation. With a strictly additive error, `INTER` changes nothing, since the standard deviation no longer depends on the ETA.

:::pitfall
**The forgotten `FIX`.** With `Y = IPRED + W*EPS(1)`, if the residual variance is estimated instead of being fixed to 1, then `W` and $\sigma$ **multiply** each other: only their product is identifiable, never the two separately. NONMEM does not refuse to run — it drifts, the covariance step fails or returns a singular matrix, and THETA(4)/THETA(5) take values that no longer mean anything. In this parameterisation, `1 FIX` is not a matter of style.
:::
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The error block does not describe noise: it hands out the **weights** of the estimation. Every point enters the likelihood divided by its standard deviation.
- Three forms: additive (`Y = F + EPS(1)`), proportional (`Y = F*(1+EPS(1))`), combined (`Y = F*(1+EPS(1)) + EPS(2)`). The residual variance is declared as a **variance**, not a standard deviation.
- Prefer the `W` parameterisation with the variance fixed to 1: terms readable in physical units, positivity guaranteed, IWRES available.
- Non-additive error → `INTER` at estimation, no exception.
- BQL: M1 truncates the tail from below and underestimates clearance; M3 treats the points as **censored** (`F_FLAG` at 1, `PHI`, `LAPLACIAN`) and remains the default choice beyond a few percent of BQL.
- Diagnostics: **IWRES** judges the error model, **CWRES** judges the rest, **WRES** is a relic computed under FO.
<!-- /step -->

---
id: "nonmem-variabilite"
slug: "nonmem-variabilite"
title: "NONMEM — ETA, OMEGA and variability"
description: "How NONMEM encodes variability: log-normal ETAs, diagonal versus full OMEGA blocks, IOV through repeated etas, and reading shrinkage."
summary: "Writing and reading variability in a control stream: EXP(ETA), DIAGONAL vs BLOCK, SAME for IOV, omega squared to CV%, shrinkage and covariates in the PK block."
track: "nonmem"
order: 212
duration: "13 min"
level: "intermediate"
tags: ["nonmem", "variability", "omega", "iiv", "iov", "shrinkage"]
prerequisites: ["tools-nonmem"]
glossary: []
slides: []
sources: ["nonmem", "karlsson-sheiner-iov", "savic-karlsson-shrinkage", "jonsson-karlsson-scm"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "In a control stream, what does the value 0.09 in `$OMEGA 0.09` represent?"
    options:
      - "The variance of ETA(1): the standard deviation is 0.3, i.e. roughly 31% CV on the parameter."
      - "The standard deviation of ETA(1): the variance is therefore 0.0081, i.e. roughly 9% CV on the parameter."
      - "The CV of the parameter as a fraction: between-subject variability is therefore 9%."
    correct: 0
  - prompt: "Compared with `$OMEGA DIAGONAL(2)`, what does `$OMEGA BLOCK(2)` add for two etas?"
    options:
      - "It also estimates the covariance between the two etas, i.e. 3 variability parameters instead of 2."
      - "It constrains the two variances to be equal to each other, i.e. 1 variability parameter instead of 2."
      - "It applies a logit transform to both etas, which bounds the estimated variability between 0 and 1."
    correct: 0
  - prompt: "In the classic IOV coding, what is the `SAME` keyword for on the occasion OMEGAs?"
    options:
      - "To impose one common variance on all occasion etas, so that IOV costs a single estimated parameter."
      - "To copy the previous OMEGA value and then fix it, which removes IOV from the estimation step."
      - "To force the occasion etas to take the same value within a patient, which cancels the estimated IOV."
    correct: 0
  - prompt: "The listing reports ETASHRINKSD = 47% on ETA(2). Which conclusion is warranted?"
    options:
      - "The EBEs of ETA(2) are pulled towards zero: the ETA(2) vs covariate plot is unreliable for deciding."
      - "The structural model is misspecified on ETA(2): a compartment must be added before going further."
      - "The OMEGA of ETA(2) is underestimated by about 47%: it should be fixed to a larger value."
    correct: 0
---

<!-- step:title="Why this chapter" -->
A control stream describes two very different things with the same economy of means: the **typical model** (the `THETA`s) and the **variability around that typical value** (the `ETA`s, the `EPS`s). The first part is learned quickly. The second is what decides, in practice, whether the model is publishable.

NONMEM protects you from nothing here: a variance written where a standard deviation was meant compiles without a word, and a badly posed variability model produces estimates that look plausible and are wrong. This chapter covers the four moves that come back in every project: writing an `ETA`, choosing between `$OMEGA DIAGONAL` and `$OMEGA BLOCK`, coding IOV, and reading what the listing gives back.
<!-- /step -->

<!-- step:title="Intuition" viz="12_VariabilitySandbox" -->
Think of clearance as a height. The population has a typical height; each patient departs from it by a factor of their own that does not change from one day to the next.

NONMEM encodes that individual departure with an `ETA`, a number **centred on zero** drawn once per patient. The typical value is carried by a `THETA`, the departure by an `ETA`, and the link between the two is almost always **multiplicative**:

- `ETA(1) = 0` → the patient is exactly typical;
- `ETA(1) = +0.30` → their clearance is about 1.35 times the typical value;
- `ETA(1) = -0.30` → about 0.74 times the typical value.

:::key
`THETA`s describe the average patient, `ETA`s describe each patient's distance from that average, `EPS`s describe the noise on each measurement. Three blocks, three distinct questions — mixing them up is the main source of uninterpretable models.
:::
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="03_PopulationDistrib" -->
### The log-normal ETA

The canonical way to write a PK parameter in the `$PK` block is:

```
$PK
  CL = THETA(1)*EXP(ETA(1))
  V  = THETA(2)*EXP(ETA(2))
```

or, in mathematical notation:

$$ CL_i = \theta_{CL} \cdot e^{\eta_{i,1}}, \qquad \eta_{i,1} \sim \mathcal{N}(0,\ \omega_1^2) $$

The `ETA` is normal, so the **parameter** is log-normal: always positive, right-skewed. That is exactly what you want from a clearance, which cannot be negative and for which a few patients eliminate very fast. An additive form (`CL = THETA(1) + ETA(1)`) would allow negative clearances and regularly breaks the minimisation; keep it for parameters that may legitimately change sign.

### From omega squared to CV%

What you write in `$OMEGA` is a **variance**, never a standard deviation. For a log-normal model the exact coefficient of variation of the parameter is:

$$ CV = \sqrt{e^{\omega^2} - 1} $$

and the field approximation $CV \approx \omega$ only holds while $\omega$ stays small:

| `$OMEGA` ($\omega^2$) | $\omega$ | approximate $CV$ | exact $CV$ |
|---|---|---|---|
| 0.04 | 0.20 | 20% | 20.2% |
| 0.09 | 0.30 | 30% | 30.7% |
| 0.16 | 0.40 | 40% | 41.7% |
| 0.50 | 0.71 | 71% | 80.5% |

:::pitfall
Writing `$OMEGA 0.3` while thinking "30% variability" actually declares a variance of 0.30, i.e. a CV of 59%. The model runs, converges, and you report twice the real variability. The reflex check: the `$OMEGA` value of a usual 20 to 50% IIV lives between **0.04 and 0.25**, not between 0.2 and 0.5.
:::

### DIAGONAL versus BLOCK

`$OMEGA` declares the covariance matrix of the etas. Two forms:

```
$OMEGA DIAGONAL(2)
  0.09          ; variance of ETA(1) — CL
  0.16          ; variance of ETA(2) — V
```

Here the etas are assumed **independent**: knowing a patient's clearance tells you nothing about their volume. Two estimated parameters.

```
$OMEGA BLOCK(2)
  0.09                 ; variance of ETA(1)
  0.054   0.16         ; covariance(1,2), then variance of ETA(2)
```

`BLOCK(2)` additionally estimates the off-diagonal term, given as a **lower triangle**:

$$ \Omega = \begin{pmatrix} \omega_1^2 & \omega_{12} \\ \omega_{12} & \omega_2^2 \end{pmatrix}, \qquad r_{12} = \frac{\omega_{12}}{\omega_1\,\omega_2} = \frac{0.054}{0.30 \times 0.40} = 0.45 $$

A `BLOCK(n)` costs $n(n+1)/2$ parameters instead of $n$: moving from 2 to 3 parameters is judged with a likelihood ratio test on 1 degree of freedom, i.e. an OFV drop greater than 3.84 at a 5% risk.

:::note
A strong correlation between `ETA(CL)` and `ETA(V)` is not an artefact to remove: it is physiological (a large patient often has both a high clearance and a high volume), and ignoring it biases simulations, which then produce high-clearance, small-volume patients that do not exist.
:::

### IOV through repeated etas

IOV is coded by giving the patient one **extra eta per occasion**, all drawn from the same distribution. The historical construction of Karlsson and Sheiner uses occasion indicators and the `SAME` keyword:

$$ CL_{ij} = \theta_{CL} \cdot e^{\eta_i + \kappa_{ij}}, \qquad \kappa_{ij} \sim \mathcal{N}(0,\ \omega_{\text{IOV}}^2) $$

```
$INPUT ID TIME AMT DV OCC WT CRCL

$PK
  OC1 = 0
  OC2 = 0
  IF(OCC.EQ.1) OC1 = 1
  IF(OCC.EQ.2) OC2 = 1
  IOV = OC1*ETA(3) + OC2*ETA(4)

  CL  = THETA(1)*EXP(ETA(1) + IOV)
  V   = THETA(2)*EXP(ETA(2))

$OMEGA BLOCK(2)
  0.09
  0.054  0.16
$OMEGA BLOCK(1) 0.04      ; variance of IOV — ETA(3)
$OMEGA BLOCK(1) SAME      ; ETA(4) shares that variance
```

`SAME` is the key point: without it, each occasion would get its own variance, which makes no sense (IOV is a **property of the drug**, not of visit number 2) and multiplies parameters for nothing. With `SAME`, two extra etas cost **only one** estimated parameter.

### Covariates in the PK block

A covariate is not added next to the eta: it explains part of what the eta used to carry. So it goes **inside the typical value**, upstream of `EXP(ETA)`:

```
$PK
  TVCL = THETA(1)*(CRCL/90)**THETA(4)
  TVV  = THETA(2)*(WT/70)
  CL   = TVCL*EXP(ETA(1))
  V    = TVV *EXP(ETA(2))
  S1   = V
```

`TVCL` is the typical clearance **of a patient with that creatinine clearance**; `ETA(1)` now represents only what CRCL fails to explain. A covariate that works is therefore seen in the **drop in `$OMEGA`**, not only in the drop in OFV.
<!-- /step -->

<!-- step:title="Worked example" viz="12_VariabilitySandbox" -->
An analysis on 48 patients, IV administration, one compartment, with between 1 and 6 samples per patient. We start from a model with no covariate and no correlation.

| Run | Variability model | $\Omega$ parameters | OFV | $\Delta$OFV |
|---|---|---|---|---|
| 001 | `DIAGONAL(2)`, no covariate | 2 | 1842.6 | — |
| 002 | `BLOCK(2)`, no covariate | 3 | 1831.9 | −10.7 |
| 003 | `BLOCK(2)` + CRCL on CL | 4 | 1809.4 | −22.5 |

**Run 001 → 002.** One parameter more, the OFV drops by 10.7; the threshold on 1 degree of freedom is 3.84 at a 5% risk. The correlation is real and equals $r = 0.45$: the block is justified.

**Run 002 → 003.** The `THETA(4)` exponent on CRCL is estimated at 0.68. The `$OMEGA` of `ETA(1)` goes from 0.14 to 0.09:

$$ CV_{\text{before}} = \sqrt{e^{0.14}-1} = 38.8\ \%, \qquad CV_{\text{after}} = \sqrt{e^{0.09}-1} = 30.7\ \% $$

Renal function therefore explains about 8 CV points on clearance. That sentence — not the $\Delta$OFV of 22.5 — is the one with clinical meaning, and the one that goes into the report.

**What the listing says.** At the end of a run NONMEM prints the shrinkages, as `ETASHRINKSD(%)`:

```
ETASHRINKSD(%)   8.7   47.2
EBVSHRINKSD(%)   8.1   45.9
EPSSHRINKSD(%)  12.4
```

Formally, shrinkage compares the spread of the EBEs with the declared variability:

$$ Sh_\eta = 1 - \frac{SD(\hat{\eta}_i)}{\omega} $$

`ETA(1)` (clearance, informed by the whole curve) sits at 8.7%: its EBEs are reliable. `ETA(2)` (volume) sits at 47.2%, because single-sample patients bring almost no information on the early phase. For those patients, the individual estimate **falls back towards the population**.
<!-- /step -->

<!-- step:title="Common pitfall" -->
The pitfall is not getting a high shrinkage — that is unavoidable with sparse data. The pitfall is to **keep doing diagnostics as if nothing had happened**.

Continuing run 003: you plot `ETA(2)` against body weight to decide whether weight explains volume. The cloud is flat, the regression gives a near-zero slope. Apparent conclusion: weight has no effect on $V$, drop it.

That is a reasoning error. With 47% shrinkage, the EBEs of `ETA(2)` have been **squeezed towards zero** by the population prior: the true relationship is crushed inside the cloud before you even look at it. The plot does not say "no weight effect"; it says "not enough data for this eta to speak".

:::pitfall
Above 20 to 30% shrinkage, ETA vs covariate plots lose their evidential value. They can **hide a real relationship** (flattened cloud) and, more insidiously, **manufacture a trend that does not exist**, because the contraction towards zero is not the same depending on how rich each patient's sampling is. The same caveats apply to IPRED-based diagnostics, squeezed by EPS shrinkage.
:::

Three reflexes once shrinkage is established:

- **Test the covariate in the model**, not on the plot: include it in `$PK`, rerun, and judge on the OFV and on `$OMEGA`. The formal test stays valid where the cloud lies.
- **Do not hand-fix `$OMEGA`** to "correct" the shrinkage. Shrinkage measures a lack of information in the data; changing the omega value does not create an extra sample, it just moves the problem.
- **Do not delete an eta merely because it shrinks.** An `ETA(2)` poorly informed in every patient may still be necessary to describe the population spread correctly.

:::recall
Shrinkage disqualifies the **EBEs** as a diagnostic tool, not the **population parameters**. `$OMEGA` is still estimated across all subjects and keeps its meaning even when the individual etas are mute.
:::
<!-- /step -->

<!-- step:title="Key takeaways" -->
- `CL = THETA(1)*EXP(ETA(1))` makes the parameter log-normal: positive, right-skewed — the default form for a clearance or a volume.
- What you write in `$OMEGA` is a **variance**. $CV = \sqrt{e^{\omega^2}-1}$; the $CV \approx \omega$ approximation breaks down beyond 40%.
- `DIAGONAL` assumes independent etas; `BLOCK(n)` estimates their covariances for $n(n+1)/2$ parameters, and is judged by a likelihood ratio test. The CL–V correlation is physiological: ignoring it distorts simulations.
- IOV is coded with one eta per occasion, plus `SAME` to impose a common variance — two etas, one single parameter.
- Covariates enter the typical value (`TVCL`), upstream of `EXP(ETA)`; a good covariate lowers `$OMEGA`, not only the OFV.
- Shrinkage above 20–30% invalidates ETA vs covariate plots, in both directions: it hides true relationships and invents false ones. You then decide inside the model, not on the cloud.
<!-- /step -->

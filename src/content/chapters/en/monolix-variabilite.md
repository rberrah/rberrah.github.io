---
id: "monolix-variabilite"
slug: "monolix-variabilite"
title: "Monolix — the INDIVIDUAL block, omega and covariates"
description: "The statistical model in mlxtran: logNormal, normal and logitNormal distributions, correlations between random effects, IOV as a variability level, covariates and reading shrinkage."
summary: "Writing and reading variability in Monolix: typical and sd, choosing the distribution, correlation r(), varlevel for IOV, the COVARIATE block and transformations, omega and shrinkage in the outputs."
track: "monolix"
order: 222
duration: "13 min"
level: "intermediate"
tags: ["monolix", "mlxtran", "variability", "omega", "iov", "covariates", "shrinkage"]
prerequisites: ["tools-monolix"]
glossary: []
slides: []
sources: ["monolix", "lavielle", "karlsson-sheiner-iov", "savic-karlsson-shrinkage"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "You are translating into Monolix a NONMEM model whose IIV on clearance is declared by `$OMEGA 0.09`. What value should `omega_cl` take?"
    options:
      - "0.3: Monolix parametrises variability with a standard deviation, whereas NONMEM's `$OMEGA` declares a variance."
      - "0.09: both programs declare variability on the very same scale, and only the name of the parameter differs."
      - "0.0081: Monolix also declares a variance, so NONMEM's `$OMEGA` value has to be squared before it is carried over."
    correct: 0
  - prompt: "In the [INDIVIDUAL] block, what does the line `correlation = {level=id, r(cl, v)=corr_cl_v}` declare?"
    options:
      - "The correlation coefficient between the random effects of cl and v, estimated directly and bounded between −1 and 1."
      - "The covariance between the random effects of cl and v, from which the correlation must then be recovered by a division."
      - "The correlation between the parameters cl and v themselves, measured on their natural scale rather than on the eta scale."
    correct: 0
  - prompt: "In `cl = {distribution=logNormal, typical=cl_pop, sd={omega_cl, gamma_cl}, varlevel={id, id*occ}}`, what does `gamma_cl` represent?"
    options:
      - "The standard deviation of the random effect drawn at each occasion, shared by all occasions by construction of the level."
      - "The standard deviation of the subject's own random effect, which the second level then copies identically onto each occasion."
      - "The standard deviation of the residual error measured within each occasion, separate from the one declared in [LONGITUDINAL]."
    correct: 0
  - prompt: "In the [COVARIATE] block, you write `tWT = log(WT)` instead of `log(WT/70)`. What follows?"
    options:
      - "The fit is unchanged, but `v_pop` becomes the volume of a 1 kg patient: ill-conditioned, it can no longer be reported."
      - "The fit degrades markedly, because the covariate is no longer on a scale compatible with a logNormal distribution."
      - "The fit is unchanged and `v_pop` keeps its usual meaning: only the unit of the coefficient `beta_v_tWT` is rescaled."
    correct: 0
---

<!-- step:title="Why this chapter" -->
The previous chapter showed how `[LONGITUDINAL]` answers the question "what curve does an individual with given parameters follow?". That leaves the other half of the job: **where those parameters come from**. In Monolix, the whole answer sits in one block, `[INDIVIDUAL]`, and in its helper, `[COVARIATE]`.

That block is short — often five lines. Yet each line is a full modelling decision: which distribution, which spread, which correlations, how many levels of variability, which covariates. And it is this block, not the structural model, that decides what you will be able to write in the report. This chapter reads those lines one by one, then learns to read back what Monolix returns in front of them: the `omega`, the `gamma`, the correlations and the shrinkage.
<!-- /step -->

<!-- step:title="Intuition" viz="12_VariabilitySandbox" -->
A line of `[INDIVIDUAL]` is a complete sentence. Read this one out loud:

```
cl = {distribution=logNormal, typical=cl_pop, sd=omega_cl}
```

"Clearance is log-normal, centred on `cl_pop`, with a spread of `omega_cl`." Three pieces of information: a **shape**, a **centre**, a **width**. Nothing more is needed to say where a patient's clearance comes from.

Behind every distribution sits **the same Gaussian**. Monolix never estimates variability on the parameter's own scale: it estimates it on the scale where it is normal, then lets the parameter out through a transformation.

- `normal`: no transformation at all, $\psi_i = \psi_{\text{pop}} + \eta_i$ — the parameter is free to change sign.
- `logNormal`: the exit is through $\exp$, so $\psi_i = \psi_{\text{pop}}\,e^{\eta_i}$ — always strictly positive.
- `logitNormal`: the exit is through the inverse logit, so $\psi_i$ stays locked inside $(0,1)$, whatever $\eta_i$ does.

:::key
Choosing a `distribution` is not choosing "the shape of the histogram". It is choosing **the constraint** the parameter can never violate: free, positive, or bounded. The Gaussian itself never moves: there is always an $\eta_i \sim \mathcal{N}(0, \omega^2)$ living underneath. That is precisely why correlations, IOV and covariates are declared the same way whatever the distribution: they all act on the $\eta$, not on $\psi$.
:::
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="03_PopulationDistrib" -->
### The baseline line

```
[INDIVIDUAL]
input = {cl_pop, omega_cl, v_pop, omega_v, ka_pop}

DEFINITION:
cl = {distribution=logNormal, typical=cl_pop, sd=omega_cl}
v  = {distribution=logNormal, typical=v_pop,  sd=omega_v}
ka = {distribution=logNormal, typical=ka_pop, no-variability}
```

that is, for clearance:

$$ \log(Cl_i) = \log(cl_{\text{pop}}) + \eta_i, \qquad \eta_i \sim \mathcal{N}(0,\ \omega_{cl}^2) $$

Three things to know about that line.

**`typical` is the median, not the mean.** For a log-normal, `cl_pop` is the value that splits the population in half, not its expectation. The mean is $cl_{\text{pop}}\,e^{\omega^2/2}$: with $\omega_{cl} = 0.29$, it sits 4 % above `cl_pop`. The gap is negligible here, but it grows fast with $\omega$ — and the median is what you report.

**`no-variability` is an explicit choice.** The `ka` line still exists: it declares that $k_a$ is estimated but identical in everyone. Removing IIV is not done by deleting a line, but by replacing `sd=` with a keyword — which forces you to own the decision.

**`sd` is a standard deviation.** This is the most expensive parametrisation difference between the two major programs.

:::pitfall
NONMEM declares a **variance** in `$OMEGA`; Monolix declares a **standard deviation** in `sd`. Translating a model by copying the numbers across — `$OMEGA 0.09` becoming `omega_cl = 0.09` — declares an IIV of 9 % instead of 30 %. Nothing crashes: SAEM simply starts from a far too homogeneous population, and depending on the dataset it may stay there. The reflex check is arithmetic: the `omega` of a usual 20–50 % IIV lives between **0.2 and 0.5**, never between 0.04 and 0.25.
:::

The exact coefficient of variation of the parameter follows directly from `omega`:

$$ CV = \sqrt{e^{\omega^2} - 1} $$

| `omega` | approximate $CV$ ($\approx \omega$) | exact $CV$ |
|---|---|---|
| 0.20 | 20 % | 20.2 % |
| 0.30 | 30 % | 30.7 % |
| 0.50 | 50 % | 53.3 % |
| 0.80 | 80 % | 94.7 % |

The approximation $CV \approx \omega$ is excellent below 0.3 and breaks down clearly beyond 0.5. This is the ergonomic advantage of Monolix's choice: the output reads almost as a CV, with no square root in between.

### Choosing the distribution

| `distribution` | Support | What for |
|---|---|---|
| `logNormal` | $(0, +\infty)$ | The default: $Cl$, $V$, $k_a$, $EC_{50}$ — positive, right-skewed. |
| `normal` | $\mathbb{R}$ | A parameter that may legitimately change sign: a slope, a treatment effect, a departure from a baseline. |
| `logitNormal` | $(0, 1)$, or $(min, max)$ | A bounded fraction: bioavailability $F$, a maximal effect expressed as a fraction, a proportion. |
| `probitNormal` | $(0, 1)$ | Alternative to the logit, with slightly shorter tails. |
| `powerNormal` | $(0, +\infty)$ | Box-Cox: when the log-normal is too skewed for your data. |

The bounded distribution is written with its bounds:

```
F    = {distribution=logitNormal, typical=F_pop, sd=omega_F}          ; bounded (0,1) by default
Emax = {distribution=logitNormal, min=0, max=1, typical=Emax_pop, sd=omega_Emax}
```

and the random effect then acts on the logit scale:

$$ \text{logit}(F_i) = \text{logit}(F_{\text{pop}}) + \eta_i, \qquad \text{logit}(x) = \log\frac{x}{1-x} $$

The benefit is structural: no value of $\eta_i$, however absurd, can push $F_i$ out of $(0,1)$. SAEM can therefore explore freely without ever producing a bioavailability of 1.4.

:::note
The trade-off to know: `omega_F` is **no longer a CV**. It is a spread on the logit scale, with no direct interpretation as a percentage. And when `typical` approaches a bound, the distribution becomes strongly skewed: with $F_{\text{pop}} = 0.9$ and $\omega_F = 1.5$, the distribution piles up against 1 and trails a long tail downwards. An `omega` of 1.5 on a logit is not aberrant at all — you read it by simulating the distribution, not by comparing it to a CV.
:::

### Correlations between random effects

By default the $\eta$ are independent. One line ties them together:

```
DEFINITION:
cl = {distribution=logNormal, typical=cl_pop, sd=omega_cl}
v  = {distribution=logNormal, typical=v_pop,  sd=omega_v}

correlation = {level=id, r(cl, v)=corr_cl_v}
```

Monolix estimates the **correlation coefficient** itself here, not the covariance. This is a parametrisation difference from NONMEM's `$OMEGA BLOCK`, and it works in your favour: $r$ is bounded to $(-1,1)$, reads off without arithmetic, and its estimation cannot produce a non positive-definite matrix. The covariance, should you need it to compare with a NONMEM model, is rebuilt as:

$$ \omega_{cl,v} = r_{cl,v}\;\omega_{cl}\;\omega_v $$

Mind what the word covers: `r(cl, v)` is the correlation between $\eta_{cl}$ and $\eta_v$ — hence between the **logarithms** of the parameters, since that is where the etas live. It is not the correlation between $Cl_i$ and $V_i$ measured on their natural scale. The two are close when the omegas are small, and diverge when they are large.

### Levels of variability: IIV and IOV

IOV is not obtained by adding etas, but by declaring one more **level**:

```
[INDIVIDUAL]
input = {cl_pop, omega_cl, gamma_cl, v_pop, omega_v}

DEFINITION:
cl = {distribution=logNormal, typical=cl_pop,
      sd={omega_cl, gamma_cl}, varlevel={id, id*occ}}
v  = {distribution=logNormal, typical=v_pop, sd=omega_v}
```

$$ \log(Cl_{ij}) = \log(cl_{\text{pop}}) + \eta_i + \kappa_{ij}, \qquad \eta_i \sim \mathcal{N}(0, \omega_{cl}^2), \quad \kappa_{ij} \sim \mathcal{N}(0, \gamma_{cl}^2) $$

The two lists pair up **term by term**: `omega_cl` goes with the `id` level (one draw per patient), `gamma_cl` with the `id*occ` level (one draw per patient **and per** occasion). Monolix's naming convention follows that split: `omega_` for between-subject, `gamma_` for between-occasion.

:::key
Compare with NONMEM, where IOV is built by hand: occasion indicators, one `ETA` per occasion, and the `SAME` keyword to force a common variance on them. In Monolix, `varlevel` declares a **level**, and a level has exactly one variance by construction — there is nothing to constrain because there is nothing to repeat. The occasion column is declared once in the dataset; the number of occasions does not change the number of estimated parameters.
:::

### Covariates

Covariates are transformed in their own block, then wired into `[INDIVIDUAL]`:

```
[COVARIATE]
input = {WT, CRCL, SEX}
SEX = {type=categorical, categories={F, M}}

EQUATION:
tWT   = log(WT/70)          ; centred on a reference patient
tCRCL = log(CRCL/90)

[INDIVIDUAL]
input = {cl_pop, omega_cl, tCRCL, beta_cl_tCRCL, SEX, beta_cl_SEX,
         v_pop, omega_v, tWT, beta_v_tWT}
SEX = {type=categorical, categories={F, M}}

DEFINITION:
cl = {distribution=logNormal, typical=cl_pop,
      covariate={tCRCL, SEX}, coefficient={beta_cl_tCRCL, {0, beta_cl_SEX}},
      sd=omega_cl}
v  = {distribution=logNormal, typical=v_pop,
      covariate=tWT, coefficient=beta_v_tWT, sd=omega_v}
```

that is:

$$ \log(Cl_i) = \log(cl_{\text{pop}}) + \beta_{CRCL}\log\!\left(\frac{CRCL_i}{90}\right) + \beta_{SEX}\,I_M(i) + \eta_i $$

with $I_M(i) = 1$ if the patient is male and $0$ otherwise.

Two reading points. First, the `0` in `{0, beta_cl_SEX}` **pins the reference category**: it is what decides that `cl_pop` is the typical clearance of a **woman**. With no reference fixed, every category would get a coefficient and the model would be unidentifiable against `cl_pop`.

Second, notice what `covariate=tCRCL` actually does on a log-normal. The covariate enters **additively on the log scale**, hence **multiplicatively** on the parameter:

$$ Cl_i = cl_{\text{pop}} \left(\frac{CRCL_i}{90}\right)^{\beta_{CRCL}} e^{\eta_i} $$

:::howto
A continuous covariate that is **log-transformed and centred**, wired in with a plain coefficient on a logNormal distribution, **is** the power model. It is the same thing as NONMEM's `TVCL = THETA(1)*(CRCL/90)**THETA(4)`, written differently. Allometry on body weight with the exponent fixed at 0.75 is obtained the same way: write `tWT = log(WT/70)` and fix `beta_cl_tWT` at 0.75 instead of estimating it.
:::

And the rule that holds in both programs: a covariate takes away from the eta whatever it explains. `cl_pop` is the clearance of a **reference** patient, `eta_cl` now carries only the remainder. A covariate that earns its place therefore shows up as a **drop in `omega_cl`**, not only as a drop in $-2LL$.

:::note
Ref.: Monolix / MonolixSuite documentation (Lixoft — Simulations Plus) for the `[INDIVIDUAL]` and `[COVARIATE]` block syntax; Lavielle M., *Mixed Effects Models for the Population Approach* (Chapman & Hall/CRC) for the parametrisation of the statistical model; Karlsson & Sheiner, *J Pharmacokinet Biopharm* 1993 for between-occasion variability; Savic & Karlsson, *AAPS J* 2009 for shrinkage.
:::
<!-- /step -->

<!-- step:title="Worked example" viz="12_VariabilitySandbox" -->
An analysis on **52 patients**, oral dosing, one compartment, two sampling visits per patient (day 1 and day 15) declared in an occasion column. IIV on $Cl$, $V$ and $k_a$, combined error. The statistical model is built in steps.

| Run | Variability model | Parameters | $-2LL$ | $\Delta$ |
|---|---|---|---|---|
| 1 | IIV only, independent etas | 8 | 1876.4 | — |
| 2 | + `correlation r(cl, v)` | 9 | 1863.1 | −13.3 |
| 3 | + IOV on `cl` (`gamma_cl`) | 10 | 1841.7 | −21.4 |
| 4 | + CRCL on `cl` | 11 | 1820.9 | −20.8 |

**Run 1 → 2.** $r$ is estimated at 0.52. The likelihood-ratio threshold at 1 degree of freedom is 3.84 at the 5 % level: the correlation is retained by a wide margin. It is also expected — a physiologically "large" patient often has both a high clearance and a high volume — and ignoring it would simulate high-clearance, small-volume patients who do not exist.

**Run 2 → 3.** `gamma_cl` comes out at 0.18, a $CV_{\text{IOV}}$ of 18.1 %; and `omega_cl` **drops** from 0.42 to 0.36. That is the most instructive result in the table: part of what was being attributed to "this patient eliminates fast" was in fact "that particular visit was different". Without an occasion level, IIV absorbs IOV and ends up overstated.

**Run 3 → 4.** The exponent on creatinine clearance is estimated at 0.71, and `omega_cl` moves from 0.36 to 0.29:

$$ CV_{\text{before}} = \sqrt{e^{0.36^2}-1} = 37.2\ \%, \qquad CV_{\text{after}} = \sqrt{e^{0.29^2}-1} = 29.6\ \% $$

Renal function therefore explains about **8 points of CV** on clearance. That sentence, and not the $\Delta$ of 20.8, is the one with clinical meaning and the one that goes into the report.

:::pitfall
Two caveats on those $\Delta$. First, Monolix's $-2LL$ is computed by **importance sampling**: it carries a Monte Carlo error, and two runs of the same model do not return exactly the same number. A gap of 2 or 3 points is not interpretable; the gaps above, between 13 and 21, are far above the noise. Second, testing `gamma_cl = 0` puts the null hypothesis **on the boundary** of the parameter space (a standard deviation cannot be negative): the 3.84 threshold is conservative there, hence safe. Testing `corr_cl_v = 0` does not raise that problem, since 0 sits inside $(-1,1)$.
:::

**Reading the output.** Monolix returns the population parameters with their standard error and RSE:

| Parameter | Estimate | RSE (%) |
|---|---|---|
| `cl_pop` | 4.62 L/h | 4 |
| `v_pop` | 31.8 L | 4 |
| `ka_pop` | 1.14 h⁻¹ | 10 |
| `beta_cl_tCRCL` | 0.71 | 18 |
| `omega_cl` | 0.29 | 11 |
| `omega_v` | 0.38 | 13 |
| `omega_ka` | 0.52 | 19 |
| `gamma_cl` | 0.18 | 17 |
| `corr_cl_v` | 0.52 | 21 |

Everything reads without conversion: 0.29 of standard deviation, so ~30 % CV; 0.52 of correlation. Variability parameters carry structurally higher RSEs than the fixed effects — that is normal, estimating a spread takes many subjects. Beyond **50 % RSE on an `omega`**, however, the IIV is not supported by the data and the question of removing it is on the table.

And facing them, the shrinkage:

| Random effect | Shrinkage |
|---|---|
| `eta_cl` | 9 % |
| `eta_v` | 14 % |
| `eta_ka` | 46 % |

$$ Sh_\eta = 1 - \frac{SD(\hat{\eta}_i)}{\omega} $$

$\eta_{cl}$, informed by the whole curve, is reliable at 9 %. $\eta_{ka}$ sits at 46 %: with no early sample in most patients, the absorption phase carries almost no individual information, and each patient's estimate **falls back towards the population**.

:::recall
A useful Monolix specificity: individual parameters are not only a conditional mode (the equivalent of NONMEM's EBE). SAEM samples each patient's **conditional distribution** by MCMC, and Monolix can return those draws. Diagnostics built on simulated draws rather than on a shrunk point estimate recover part of the information shrinkage destroys. That mitigates the problem — it does not erase it: when the data say nothing about $k_a$ in a patient, no individual estimation method will invent it.
:::
<!-- /step -->

<!-- step:title="Common pitfall" -->
Body weight is in the dataset and you want to try it on volume. In `[COVARIATE]`, you write `tWT = log(WT)` — the log transform is there, that is the important part, isn't it?

The run goes through. `beta_v_tWT` comes out at **0.98**: beautiful, almost exactly the allometry expected on a volume. The $-2LL$ drops. `omega_v` drops too. Every sign of success is present.

Then you look at `v_pop`: **0.49 L**, RSE **140 %**.

:::pitfall
`log(WT) = 0` corresponds to a **1 kg** patient. By skipping the centring, you moved the model's reference point onto a weight that does not exist, and `v_pop` became the extrapolated volume of that fictional patient. Two damages. **Interpretation**: `v_pop` is no longer reportable — you cannot write "the typical volume is 0.49 L" in a report. **Conditioning**: `v_pop` and `beta_v_tWT` become nearly collinear (correlation of the estimates above 0.99), the Fisher information matrix is ill-conditioned, and the confidence intervals on both parameters are worthless.
:::

The most disorienting part is that the model is **not wrong**. Since $\log(WT) = \log(WT/70) + \log(70)$, the two spellings are the same model up to a reparametrisation: at the optimum the likelihood is identical, the predictions are identical, `omega_v` and `beta_v_tWT` are identical. Only `v_pop` changes, from 31.8 L to $31.8 \times 70^{-0.98} \approx 0.49$ L.

That is exactly what makes the trap durable: nothing flags the mistake, because there is no mistake in the arithmetic sense. Centring is not a statistical necessity of the fit — it is what makes the parameter **readable** and its estimation **well-posed**. In practice the poor conditioning does get paid for eventually: SAEM starts from an initial value meant for 30 L when the solution is at 0.5 L, converges less well, and the Fisher matrix step becomes fragile.

:::recall
The test fits in one sentence to complete: "`cl_pop` is the typical clearance of a patient who…". If you cannot finish the sentence with a patient who could have been enrolled in your study, your centring is broken. Centre on a **realistic reference value** — your population's median, or a conventional value such as 70 kg — and the parameter becomes both interpretable and well estimated.
:::
<!-- /step -->

<!-- step:title="Key takeaways" -->
- `[INDIVIDUAL]` carries the whole statistical model. One line = a distribution (`distribution`), a centre (`typical`, which is the **median**) and a width (`sd`). `no-variability` removes IIV without deleting the line.
- `sd` is a **standard deviation**, where NONMEM's `$OMEGA` is a **variance**: a model translated by copying the numbers declares 9 % instead of 30 %. The `omega` of a usual IIV lives between 0.2 and 0.5. $CV = \sqrt{e^{\omega^2}-1}$, and $CV \approx \omega$ breaks down beyond 0.5.
- The distribution picks the **constraint**: `logNormal` for a positive parameter, `normal` for one that may change sign, `logitNormal` for a bounded fraction — but its `omega` is then no longer a CV.
- `correlation = {level=id, r(cl, v)=...}` estimates the **correlation coefficient** between the etas, bounded and directly readable; the covariance is rebuilt as $r\,\omega_{cl}\,\omega_v$.
- IOV is a **level** (`varlevel={id, id*occ}`), not a list of etas: one variance by construction, so no `SAME` to write. Without an occasion level, IIV absorbs IOV and ends up overstated.
- On a logNormal, `covariate=log(CRCL/90)` with a coefficient **is** the power model. A useful covariate lowers `omega`, not only the $-2LL$.
- Always centre continuous covariates: an uncentred `log(WT)` gives the same fit but makes `v_pop` unreadable and its estimation ill-conditioned.
- Reading the outputs: RSE > 50 % on an `omega` = IIV unsupported by the data; high shrinkage = individual parameters pulled towards the population; a $\Delta(-2LL)$ of 2 or 3 points = importance-sampling noise.
<!-- /step -->

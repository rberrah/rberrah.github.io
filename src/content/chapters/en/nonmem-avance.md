---
id: "nonmem-avance"
slug: "nonmem-avance"
title: "NONMEM — going further"
description: "Logit and normal distributions, prior information, MU-referencing, the PsN/Xpose/Pirana ecosystem and simulation."
summary: "The tools that take NONMEM from a model that runs to an analysis that holds: bounded parameters, priors, MU-referencing, PsN."
track: "nonmem"
order: 215
duration: "10 min"
level: "intermediate"
tags: ["nonmem", "mu-referencing", "prior", "psn"]
prerequisites: ["tools-nonmem"]
glossary: []
slides: []
sources: ["bauer-nonmem-1", "bauer-nonmem-2", "keizer-psn-xpose", "jonsson-karlsson-scm"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "MU-referencing speeds up SAEM because..."
    options:
      - "MU_n depends only on THETAs and on covariates constant within a subject, which makes the population-parameter update analytic at every iteration"
      - "it reduces the number of subjects simulated during the E step, so that each iteration processes far less individual data"
      - "it replaces numerical integration of the likelihood with a linearisation of the model around the zero values of the ETAs"
    correct: 0
  - prompt: "For a bioavailability that must stay between 0 and 1, the right parameterisation is..."
    options:
      - "logit: F1 = 1/(1+EXP(-(THETA(1)+ETA(1)))), which constrains F1 to ]0,1[ whatever value is drawn for ETA(1)"
      - "log-normal: F1 = THETA(1)*EXP(ETA(1)), which guarantees that F1 is positive whatever value is drawn for ETA(1)"
      - "normal: F1 = THETA(1)+ETA(1), with the lower and upper bounds declared in the THETA block"
    correct: 0
  - prompt: "A prior on a parameter is mainly justified when..."
    options:
      - "the new data cannot inform that parameter, while a published source provides an estimate of it together with its uncertainty"
      - "the new data inform that parameter well, and the prior serves to confirm that the published value is reproduced"
      - "the parameter is the one the study aims to measure, and the prior serves to shrink its final standard error"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The previous chapter stops at the minimal control stream: a structural model, log-normal ETAs, FOCE-I. That is enough to make a model **run**, not to **carry out an analysis**.

Three walls appear fast. A **bounded** parameter — a bioavailability, a responder fraction — that the log-normal happily pushes past 1. Data **too sparse** to estimate everything, when a published model already exists. A SAEM run taking eight hours where it should take one.

NONMEM answers all three. But every answer is written **by hand**, and nothing warns you if you write it wrong.
<!-- /step -->

<!-- step:title="Intuition" viz="03_PopulationDistrib" -->
Writing `CL = THETA(1)*EXP(ETA(1))` is not a ritual: it is a **choice of distribution**.

What NONMEM imposes is that ETA(1) be drawn from a zero-mean normal with variance $\omega^2$. The **function** that turns that ETA into a parameter is yours to choose. The exponential maps the real line onto the positive reals: perfect for a clearance, which is positive and has no ceiling.

A bioavailability, however, lives between 0 and 1. With $\omega = 0.4$ around a typical value of 0.70, the log-normal cheerfully produces individuals at 1.6. NONMEM does not object: it quietly simulates 160 % of the dose absorbed.

The fix is not to rein in the ETA — it is to **change the function**. The logistic maps the real line onto ]0, 1[: whatever value is drawn, the parameter stays where it belongs. And for a quantity that can legitimately be negative — an effect slope, a baseline drift — the identity, hence a **normal**, is the right choice rather than a fallback.

:::key
Choose the transformation from the parameter's **physical domain**, never out of habit.
:::
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="16_SAEMCycle" -->
**Logit — for a bounded parameter**

On the logit scale the parameter becomes unbounded again, hence compatible with a normal ETA:

$$\text{logit}(F_1) = \log\frac{F_1}{1 - F_1} = \theta_1 + \eta_1$$

The inverse brings it back inside the interval:

$$F_1 = \frac{1}{1 + e^{-(\theta_1 + \eta_1)}}$$

```
$PK
  LGT  = THETA(1) + ETA(1)     ; logit scale, unbounded
  F1   = 1/(1 + EXP(-LGT))     ; mapped back into ]0,1[
  BASE = THETA(2) + ETA(2)     ; normal: may be negative
  CL   = THETA(3)*EXP(ETA(3))  ; log-normal: the classic case
```

With THETA(1) = 0.85, the typical value is $1/(1+e^{-0.85}) = 0.70$. The ETA may be −3 or +3; F1 will still lie in ]0, 1[.

**MU-referencing — declaring the expectation**

MU-referencing means writing out explicitly, for each ETA, the expectation of the parameter **on its transformation scale**:

```
$PK
  MU_1 = LOG(THETA(1))              ; CL
  MU_2 = LOG(THETA(2))              ; V
  CL   = EXP(MU_1 + ETA(1))
  V    = EXP(MU_2 + ETA(2))
$ESTIMATION METHOD=SAEM INTERACTION NBURN=2000 NITER=1000 PRINT=100
```

Two rules, non-negotiable. `MU_n` may depend only on THETAs and on covariates **constant within the individual** — never on an ETA, never on a value that changes between two records of the same subject. And the parameter must be written **exactly** as `MU_n + ETA(n)` on the chosen scale.

Why this speeds things up: at each iteration SAEM simulates the individual effects (E step) then updates the population parameters (M step). If the link is `parameter = MU_n + ETA(n)`, then on that scale the model is **linear in ETA** — the M step resolves to a **closed form**, a mean and a covariance of the simulated values. Without MU-referencing, NONMEM does not know that structure exists and must launch a numerical search at every iteration. The gain is a factor, not a percentage. For METHOD=BAYES it is more radical still: Gibbs sampling **assumes** that structure.

**Prior information**

A prior adds a **penalty** to the OFV: moving away from the expected value costs something, in proportion to the confidence placed in it.

$$OFV_{\text{total}} = OFV_{\text{data}} + (\theta - \theta_{\text{prior}})^{\top}\Sigma_{\text{prior}}^{-1}(\theta - \theta_{\text{prior}})$$

```
$PRIOR   NWPRI NTHETA=3 NETA=2 NTHP=1 NETP=0
$THETAP  (1.1) FIX            ; prior mean of KA, in h-1
$THETAPV (0.0121) FIX         ; variance of that prior (SD = 0.11)
```

`NTHP=1`: only the first THETA gets a prior, the other two stay free. Careful — the THETAPV block expects a **variance**, not a standard deviation: here $0.11^2 = 0.0121$.

:::note
Ref.: Bauer, *NONMEM Tutorial* — Part I for blocks and options, Part II for SAEM, BAYES and MU-referencing.
:::
<!-- /step -->

<!-- step:title="Worked example" -->
Paediatric extrapolation. You have a published adult model — first-order absorption, KA = 1.1 h⁻¹, CL = 4.2 L/h, V = 32 L — and a new study: **24 children, 2 samples each, both drawn after the peak**. That is 48 concentrations for three structural parameters and their variabilities.

Estimated freely, KA runs off to 11 h⁻¹ with a 40 % SE, and V follows it into the absurd. The reason is mechanical: **no early sample informs the absorption phase**. KA is not estimable here, and leaving it free contaminates CL and V.

So it gets a prior, centred on the adult value, carrying the published uncertainty:

```
$PRIOR   NWPRI NTHETA=3 NETA=2 NTHP=1 NETP=0
$THETAP  (1.1) FIX
$THETAPV (0.0121) FIX
$ESTIMATION METHOD=SAEM INTERACTION NBURN=2000 NITER=1000
$ESTIMATION METHOD=IMP EONLY=1 NITER=10 ISAMPLE=3000   ; exact OFV
```

KA settles at 1.2 h⁻¹. More importantly, CL and V — the parameters the study **actually** informs — become estimable again, with SEs of 12 % and 15 %.

:::key
Put a prior on what the new data **cannot** learn, never on what you set out to measure. A prior on paediatric clearance would answer the question **instead of** the study.
:::

The model still has to be checked. NONMEM draws **no** graphics at all: everything goes through the R ecosystem, driven from the command line by PsN.

```
execute run12.mod                          # run it, tidy the outputs
bootstrap -samples=1000 run12.mod          # parameter CIs by resampling
vpc -samples=500 -auto_bin=auto run12.mod  # VPC
scm -config_file=scm.conf run12.mod        # forward inclusion / backward elimination
```

Xpose reads those outputs and produces the diagnostics in R; Pirana acts as a workbench for comparing runs. When you only want to **simulate**, a simulation block replaces the estimation one:

```
$SIMULATION (20260716) ONLYSIM SUBPROBLEMS=500
```

The seed makes the simulation reproducible, `ONLYSIM` switches estimation off, and `SUBPROBLEMS=500` generates 500 virtual datasets — the engine behind VPCs and simulated clinical trials.
<!-- /step -->

<!-- step:title="Common pitfall" -->
MU-referencing is the costliest trap, because it **fails silently**. This control stream runs, converges, and hands you a result:

```
$PK
  MU_1 = LOG(THETA(1))
  CL   = THETA(1)*EXP(ETA(1))        ; MU_1 declared but never used
  MU_2 = LOG(THETA(2)) + 0.3*ETA(1)  ; forbidden: MU depends on an ETA
  V    = EXP(MU_2 + ETA(2))
```

:::pitfall
Line 3: `MU_1` is declared, but `CL` is not written as `EXP(MU_1 + ETA(1))`. Mathematically it is the same thing; for the M step it is not — the closed form no longer applies. Line 4: `MU_2` depends on `ETA(1)`, which breaks the linearity assumption. In both cases: no message, no warning. Just a SAEM that crawls, or that converges somewhere else with nothing to flag it.
:::

A second, quieter trap: **the over-tight prior**. A prior variance of 0.0001 on KA is an SD of 0.01 for a value of 1.1 — you have **fixed** the parameter without saying so. The model will converge, the reported SEs will look flattering, and the real uncertainty will have vanished from the dossier. A prior must reflect the **real** uncertainty of its source, published standard error included.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The **transformation**, not the ETA, defines a parameter's domain: `EXP()` for an unbounded positive, logit for a fraction in ]0, 1[, identity for a quantity that may be negative.
- **MU-referencing** — `MU_n` a function of THETAs and constant individual covariates only, then the parameter written exactly as `MU_n + ETA(n)` — makes the M step analytic: SAEM speeds up markedly, and BAYES depends on it.
- A **prior** injects a published model into a data-poor analysis; put it on what the data cannot inform, never on what you want to measure.
- **PsN** automates bootstrap, VPC and SCM; **Xpose** plots; **Pirana** organises. NONMEM produces no graphics: the ecosystem is not a luxury.
- The `$SIMULATION` block — a seed, some `SUBPROBLEMS` — turns an estimated model into a generator of virtual populations.
<!-- /step -->

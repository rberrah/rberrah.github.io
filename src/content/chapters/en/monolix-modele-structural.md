---
id: "monolix-modele-structural"
slug: "monolix-modele-structural"
title: "Monolix — the structural model in mlxtran"
description: "The [LONGITUDINAL] block: the pkmodel() library or hand-written ODEs, initial conditions, t0 and dose routing."
summary: "Writing the structural model in mlxtran: input, EQUATION:, pkmodel() versus ddt_, and DEFINITION: for the observation."
track: "monolix"
order: 2
duration: "10 min"
level: "intermediate"
tags: ["monolix", "mlxtran", "structural-model", "ode"]
prerequisites: ["tools-monolix"]
glossary: []
slides: []
sources: ["monolix", "lavielle", "savic-transit"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "In an mlxtran file, the [LONGITUDINAL] block holds..."
    options:
      - "the structural model: the equations that, for given parameters, predict the curve"
      - "the statistical model: the distributions of individual parameters and their variability"
      - "the longitudinal data: the times, the doses and the observed concentrations"
    correct: 0
  - prompt: "With an ODE system written by hand in EQUATION:, the dose from the dataset..."
    options:
      - "must be routed explicitly to a compartment, for instance by depot(target=Ad)"
      - "is routed automatically to the first compartment declared in the EQUATION: block"
      - "is routed automatically, as with pkmodel(), with no administration macro to write"
    correct: 0
  - prompt: "In pkmodel(), the PK model is selected..."
    options:
      - "by the names of the arguments passed: ka, V, Cl describe a 1-compartment oral model"
      - "by a model number given as the first argument, like the ADVAN routines in NONMEM"
      - "by an option in the DEFINITION: block that declares the number of compartments"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The **structural model** is the machine that turns a dose and a time into a predicted concentration. Everything else — variability, covariates, residual error — is bolted onto it. If that machine is wrong, no SAEM will rescue it: it will simply find the best possible parameters for a model that cannot describe the data.

In Monolix, you write it in **mlxtran**, inside the `[LONGITUDINAL]` block. Two routes are open to you: call the **library** with `pkmodel()`, or write the **system of differential equations** yourself with `ddt_`. This chapter shows both on the same model — a 1-compartment oral model — and explains when to switch from one to the other.
<!-- /step -->

<!-- step:title="Intuition" viz="21_PopPKPlayground" -->
mlxtran forces you to answer **separately** two questions that population modelling always mixes together:

1. **For one individual whose parameters are given, what curve does the concentration follow?** That is the **structural** model — the `[LONGITUDINAL]` block.
2. **How do those parameters vary from one individual to the next?** That is the **statistical** model — the `[INDIVIDUAL]` block.

This separation is the design trait of the language, not a presentational nicety. It has a very concrete consequence: the structural model file you write by hand contains **only** `[LONGITUDINAL]`. The `[INDIVIDUAL]` block is written by the interface from your choices in the statistical model tab. Switching a distribution from logNormal to normal, adding IIV, wiring in a covariate: none of that touches your equations.

:::key
Compare with NONMEM, where `$PK` hosts in the same block the typical value (`TVCL = THETA(1)`) **and** the random effect (`CL = TVCL*EXP(ETA(1))`). In Monolix, the border between structure and statistics is not a matter of writing discipline: it is a block.
:::
<!-- /step -->

<!-- step:title="The formula, unpacked" -->
The 1-compartment oral model is two **amount** compartments — the depot $A_d$ and the central one $A_c$ — plus a concentration that is nothing but a division:

$$ \frac{dA_d}{dt} = -k_a A_d, \qquad \frac{dA_c}{dt} = k_a A_d - \frac{Cl}{V} A_c, \qquad C_c = \frac{A_c}{V} $$

**Library version.** You describe the model by its name, not by its equations:

```
[LONGITUDINAL]
input = {ka, V, Cl}       ; parameters RECEIVED, not estimated here

EQUATION:
Cc = pkmodel(ka, V, Cl)   ; 1 cpt, first-order absorption; returns a CONCENTRATION

DEFINITION:
y1 = {distribution=normal, prediction=Cc, errorModel=combined1(a, b)}

OUTPUT:
output = {y1}
```

**Hand-written ODE version.** The same model, wired by hand:

```
[LONGITUDINAL]
input = {ka, V, Cl}

PK:
depot(target = Ad)        ; WHERE the dose from the dataset lands

EQUATION:
t0   = 0                  ; the instant at which initial conditions apply
Ad_0 = 0                  ; initial conditions: <name>_0 (0 by default)
Ac_0 = 0

ddt_Ad = -ka * Ad         ; declaring ddt_Ad IS ENOUGH to create compartment Ad
ddt_Ac =  ka * Ad - (Cl/V) * Ac

Cc = Ac / V               ; here the division is YOUR job

DEFINITION:
y1 = {distribution=normal, prediction=Cc, errorModel=combined1(a, b)}

OUTPUT:
output = {y1}
```

Line by line:

- `input = {ka, V, Cl}`: the parameters the block **receives**. They are not estimated here — `[INDIVIDUAL]` will supply them. This is the socket between structure and statistics.
- `EQUATION:` holds the ODEs **and** the algebraic equations; the order in which you write the `ddt_` lines does not matter, the solver handles the system.
- `t0` sets the instant at which the initial conditions apply. Without an explicit `t0`, integration starts at the subject's first event. This becomes critical as soon as a model has a non-zero **baseline** (turnover, PD): the system must then start at its steady state, not at zero.
- `DEFINITION:` is the **observation model**: it links a prediction (`Cc`) to an observation (`y1`) through a distribution and an error model. That is already statistics — but *residual* statistics, which stays in `[LONGITUDINAL]` because it concerns the observation, not the individual.

:::howto
**The argument names ARE the model selector.** `pkmodel(V, Cl)` gives a 1-compartment IV model; add `ka` and you get first-order absorption; add `k12, k21` and you move to two compartments; add `Tlag`, `Tk0` or `F` and you describe lag, zero-order input, bioavailability. Where NONMEM has you pick an ADVAN **number**, mlxtran has you name the **parameters** you want to estimate — the model follows from them.
:::

So why write the ODEs yourself? Because the day your structure leaves the catalogue, the library stops. A **transit** chain (Savic 2007), for instance, is obtained by lengthening the system:

```
PK:
depot(target = Atr1)

EQUATION:
ddt_Atr1 = -ktr*Atr1
ddt_Atr2 =  ktr*Atr1 - ktr*Atr2
ddt_Ac   =  ktr*Atr2 - (Cl/V)*Ac
```

with a mean transit time $MTT = (n+1)/k_{tr}$, here $n = 2$ transit compartments. Same logic for an enzyme turnover, a time-varying clearance or a saturable target: as soon as a term depends on the state of the system, you move to `ddt_`.

:::note
Ref.: Monolix / MonolixSuite documentation (Lixoft — Simulations Plus) for the block syntax; Lavielle M., *Mixed Effects Models for the Population Approach* (Chapman & Hall/CRC) for the structural/statistical decomposition; Savic *et al.*, *J Pharmacokinet Pharmacodyn* 2007 for transit compartments.
:::
<!-- /step -->

<!-- step:title="Worked example" viz="21_PopPKPlayground" -->
Take one individual: **oral dose 100 mg**, $k_a = 1.2$ h⁻¹, $V = 32$ L, $Cl = 4.8$ L/h, $F = 1$.

The elimination rate constant is $k_e = Cl/V = 4.8/32 = 0.15$ h⁻¹, giving a ratio $k_a/k_e = 8$. The peak falls at

$$ t_{max} = \frac{\ln(k_a/k_e)}{k_a - k_e} = \frac{\ln 8}{1.05} \approx 1.98 \text{ h} $$

and, since $C_{max} = \frac{F \cdot D}{V}e^{-k_e t_{max}}$ for this model, we expect $C_{max} \approx 3.125 \times e^{-0.297} \approx 2.32$ mg/L, for an exposure of $AUC = F \cdot D / Cl \approx 20.8$ mg·h/L.

Those three numbers are your **acceptance test**. The two versions above describe the same model: they must return the same curve, digit for digit. Hence the reflex that prevents the most damage when moving to hand-written equations:

:::recall
Never start from a blank page. Write the `pkmodel()` version first, run it, record the curve. Then rewrite it with `ddt_` and check that you **recover exactly** the same prediction. Only once that equality holds do you add your complexity (transit, saturation, turnover). Otherwise you will never know whether a discrepancy comes from your new feature or from a wiring mistake.
:::
<!-- /step -->

<!-- step:title="Common pitfall" -->
The pitfall is not forgetting `depot()` — Monolix tells you about that one: the dose has no way in, the system stays at its initial conditions and the prediction is flat at zero. It is loud, therefore harmless.

:::pitfall
The real trap is `depot(target = Ac)` instead of `depot(target = Ad)` — one letter. The model is **valid**, it compiles, it runs, SAEM converges and the diagnostics come up. But the dose lands straight in the central compartment: you have estimated an **IV bolus**. And $A_d$, never filled, stays at zero forever, so $k_a$ has **no** influence on the likelihood at all. Its value barely moves from its initial guess, with a huge RSE, and the absorption phase is missed on every subject at once. Nothing crashed: that is exactly what makes the error expensive.
:::

The lesson goes beyond the typo: with `pkmodel()`, dose routing is part of the model you call; with your own `ddt_`, it becomes **your** responsibility, and nothing in the syntax will remind you that you exercised it badly. A parameter with an absurd RSE is not always a data identifiability problem: check first that it still acts on the prediction.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The structural model lives in `[LONGITUDINAL]`; `input` declares the parameters received, `[INDIVIDUAL]` supplies them. Writing a model by hand means writing `[LONGITUDINAL]` alone.
- `pkmodel()`: the model is selected by the **names of the arguments** (`ka, V, Cl` = 1-cpt oral) and returns a concentration directly, dose routing included.
- `ddt_`: you write the ODEs on **amounts**, you set `t0` and the `<name>_0`, you divide by $V$ yourself, and you route the dose with `depot(target=...)`.
- `DEFINITION:` carries the observation model (distribution + error model), not the between-subject variability.
- Library → ODE migration: reproduce the reference curve identically first, then add the complexity.
- A dose routed to the wrong compartment does not crash the run — it makes a parameter mute.
<!-- /step -->

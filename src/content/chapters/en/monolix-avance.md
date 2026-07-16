---
id: "monolix-avance"
slug: "monolix-avance"
title: "Monolix — going further"
description: "Bounded logit and probit distributions, auto-initialisation, automatic covariate tests, the MonolixSuite and the NONMEM export."
summary: "What separates a model that runs from an analysis that holds: bounded parameters, initialisation, covariate screening, Simulx and the move to NONMEM."
track: "monolix"
order: 225
duration: "10 min"
level: "intermediate"
tags: ["monolix", "mlxtran", "logit", "simulx"]
prerequisites: ["tools-monolix"]
glossary: []
slides: []
sources: ["monolix", "lavielle", "jonsson-karlsson-scm", "ribbing-selection-bias"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "For a parameter declared logitNormal, the omega estimated by Monolix represents..."
    options:
      - "the standard deviation of the random effect on the logit scale; it does not read as a CV and does not compare to a logNormal one"
      - "the coefficient of variation of the parameter across individuals, as for a logNormal: omega = 0.85 therefore means 85% variability"
      - "the standard deviation of the parameter on its natural scale, itself bounded within ]0,1[ by construction of the distribution"
    correct: 0
  - prompt: "Exporting a Monolix project to NONMEM produces..."
    options:
      - "a draft control stream to review and re-run: the translation covers the syntax, not the algorithm, so the estimates differ"
      - "a faithful reproduction of the Monolix run: the model and the data being the same, the estimates and the OFV are identical"
      - "a plain conversion of the dataset to the NONMEM format, the model itself still having to be rewritten entirely by hand"
    correct: 0
  - prompt: "Automatic initialisation of the parameters in Monolix..."
    options:
      - "proposes a starting point for the structural parameters, but validates neither the structural model nor the units of the dataset"
      - "estimates the population parameters by a fast method, which SAEM then merely refines at the margin"
      - "guarantees that SAEM starts in the right basin of attraction and shields the run from local optima"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The previous chapters leave you with a model that **runs**: a structure in `[LONGITUDINAL]`, log-normal parameters, a converging SAEM. That is the start of an analysis, not its end.

Three walls come up fast. A **bioavailability**: declared log-normal, it will exceed 1, and Monolix will happily simulate individuals absorbing 150% of their dose. A **list of covariates** to screen, without launching thirty projects by hand. And, the day the dossier goes to the agency, a **NONMEM control stream**.

Monolix answers all three. Every time, the answer is subtler than the button that triggers it.
<!-- /step -->

<!-- step:title="Intuition" viz="03_PopulationDistrib" -->
In the `[INDIVIDUAL]` block, the `distribution=` keyword is not a presentational label: it is the choice of a **link function**.

Monolix imposes one single thing, the same as NONMEM: the random effect $\eta_i$ is drawn from a zero-mean normal. But a normal lives on the whole real line, from $-\infty$ to $+\infty$. A clearance, meanwhile, is positive; a bioavailability lives between 0 and 1; so does a responder fraction. You therefore need a function that maps the real line **exactly** onto the parameter's domain — no wider, no narrower.

That is all `distribution=` does. `logNormal` picks the exponential and covers $]0, +\infty[$. `logitNormal` picks the logistic and covers $]0, 1[$. `probitNormal` covers the same interval by another route, the normal cumulative distribution function. The parameter's domain decides; habit does not.

:::key
A bounded parameter is not handled by reining in the ETA — that is impossible, it is normal by construction — but by **changing the function**. Positive with no ceiling: `logNormal`. A fraction in ]0,1[: `logitNormal` or `probitNormal`. A quantity that may legitimately be negative, an effect slope, a baseline drift: `normal`, and that is the right choice, not a fallback.
:::

This idea has a consequence that the rest of the chapter merely declines: what Monolix reports about a parameter — its $\omega$, its covariate coefficients, its translation into NONMEM — lives on the **scale of the link function**, never on the parameter's own.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="12_VariabilitySandbox" -->
A single model governs the whole `[INDIVIDUAL]` block:

$$ h(\psi_i) = h(\psi_{\text{pop}}) + \sum_k \beta_k\, c_{ik} + \eta_i, \qquad \eta_i \sim \mathcal{N}(0, \omega^2) $$

The individual parameter $\psi_i$, once passed through $h$, is written as a typical value plus covariate effects plus a normal random effect. Changing distribution means **changing $h$** — nothing else:

- `normal`: $h(x) = x$, domain $\mathbb{R}$;
- `logNormal`: $h(x) = \log x$, domain $]0, +\infty[$;
- `logitNormal`: $h(x) = \log\frac{x}{1-x}$, domain $]0, 1[$;
- `probitNormal`: $h(x) = \Phi^{-1}(x)$, domain $]0, 1[$.

For the logit, you return into the interval through the inverse:

$$ \psi_i = \frac{1}{1 + e^{-h(\psi_i)}} $$

Whatever value is drawn for $\eta_i$ — $-4$, $+4$ — the parameter stays within its bounds. That is a **structural** guarantee, not a numerical constraint an optimiser could violate.

```
[INDIVIDUAL]
input = {F_pop, omega_F, Cl_pop, omega_Cl, V_pop, omega_V}

DEFINITION:
F  = {distribution=logitNormal, typical=F_pop,  sd=omega_F}   ; bounded in ]0,1[
Cl = {distribution=logNormal,   typical=Cl_pop, sd=omega_Cl}  ; positive, no ceiling
V  = {distribution=logNormal,   typical=V_pop,  sd=omega_V}
```

Mind how you read this: `typical=F_pop` is declared and reported on the **natural** scale (Monolix shows 0.70), whereas `sd=omega_F` lives on the **logit** scale. The two numbers on the same line do not live in the same place.

The logit is not restricted to ]0,1[. With explicit bounds it extends to any interval — an $E_{max}$ that cannot exceed 100% inhibition, a Hill coefficient between 1 and 5:

```
Emax = {distribution=logitNormal, min=0, max=100, typical=Emax_pop, sd=omega_E}
```

The transformation then becomes $h(\psi) = \log\frac{\psi - \psi_{\min}}{\psi_{\max} - \psi}$, which does give back the usual logit for $\min = 0$ and $\max = 1$.

**Covariates come through the same door.** They are added on the scale of $h$, not on the parameter's:

```
[COVARIATE]
input = {WT}
EQUATION:
lWT = log(WT/70)                      ; centring on 70 kg

[INDIVIDUAL]
input = {Cl_pop, omega_Cl, beta_Cl_lWT, lWT}
DEFINITION:
Cl = {distribution=logNormal, typical=Cl_pop,
      covariate=lWT, coefficient=beta_Cl_lWT, sd=omega_Cl}
```

Here $\log Cl_i = \log Cl_{\text{pop}} + \beta \log(WT/70) + \eta_i$: $\beta$ is the allometric exponent, and writing it this way makes it directly testable. But if the same machinery is applied to a `logitNormal`, then $\beta$ acts on $\text{logit}(F)$ — it is **not** an effect on $F$, and it does not read as a percentage of $F$.

**The automatic tests.** Monolix reports, with no extra run, two families of tests. On covariates **already in the model**, a Wald test on each $\beta$ ($H_0 : \beta = 0$). On covariates **absent from the model**, correlation tests between the random effects and each candidate covariate: Pearson correlation for a continuous covariate, analysis of variance for a categorical one. A small p flags an $\eta$ that retains structure the model does not explain — hence a covariate worth trying. The automated procedure (COSSAC) chains these tests to build the covariate model step by step.

:::key
These tests operate on samples from the **conditional distribution** of the random effects, not on their mode. This is not an implementation detail: individual modes shrink towards zero when the data are sparse, and that shrinkage erases precisely the correlation you are looking for. Sampling the full distribution preserves the signal.
:::

:::note
Ref.: Monolix / MonolixSuite documentation (Lixoft — Simulations Plus) for the syntax and the features; Lavielle M., *Mixed Effects Models for the Population Approach* (Chapman & Hall/CRC) for the $h(\psi) = h(\psi_{\text{pop}}) + \beta c + \eta$ model and the conditional distribution; Jonsson & Karlsson, *Pharm. Res.* 1998 for stepwise covariate model building; Ribbing & Jonsson, *J. Pharmacokinet. Pharmacodyn.* 2004 for its power and selection bias.
:::
<!-- /step -->

<!-- step:title="Worked example" viz="03_PopulationDistrib" -->
An oral bioavailability, typical value **0.70**, to be described in 40 subjects.

**Log-normal, with $\omega = 0.4$.** The distribution is $F_i = 0.70 \times e^{\eta_i}$. For $F_i$ to exceed 1, you need $\eta_i > \log(1/0.70) = 0.357$, that is $z = 0.357/0.4 = 0.89$. The normal table gives:

$$ P(F_i > 1) = 1 - \Phi(0.89) \approx 0.19 $$

**Nearly one simulated subject in five absorbs more than their dose.** The 95th percentile is $0.70 \times e^{1.96 \times 0.4} = 1.53$: 153% of the dose. The model runs, SAEM converges, the VPC may even look acceptable over the observed range — and the simulation remains a physical absurdity.

**Logit-normal, with $\omega = 0.85$.** The typical value becomes $\text{logit}(0.70) = \log(0.70/0.30) = 0.847$. The 90% interval across individuals is computed on the logit scale, then folded back:

$$ 0.847 \pm 1.96 \times 0.85 = [-0.819,\ 2.513] \;\longrightarrow\; [0.31,\ 0.93] $$

Bounds respected by construction, for any value of $\eta$.

**And in probit, with $\omega = 0.50$?** The typical value becomes $\Phi^{-1}(0.70) = 0.524$, and the same computation gives $[0.32,\ 0.93]$.

Look at those last two lines. **$\omega = 0.85$ in logit and $\omega = 0.50$ in probit describe the same population**, to within a hundredth. Two numbers with nothing in common, one single biology. The ratio here is close to 1.7 — its exact value depends on the criterion you adopt for saying that two spreads resemble each other, the logistic having heavier tails than the normal. In practice logit and probit almost always fit each other's data equally well; probit is mostly justified when the parameter **is** already a probability arising from a latent normal mechanism (a threshold model). So the choice between the two matters far less than having understood what $\omega$ measures.

**The rest of the suite.** Once the model is estimated, the MonolixSuite reuses it **without rewriting it**, because all its tools read the same mlxtran file: **Datxplore** explores the dataset before any modelling; **Mlxplore** explores the model without data, through sliders on the parameters; **Simulx** simulates from the estimated model — new dosing regimens, new population, virtual clinical trial; **PKanalix** covers NCA.

:::key
The real gain is not the list of tools, it is the **single model file**. The model you simulate is, literally, the one you estimated. Where re-implementing a NONMEM model in an R simulator risks a silent divergence between the two pieces of code, here the class of bug does not exist.
:::

And Mlxplore deserves better than its reputation as a teaching tool: it is often the **best initialiser** available. Moving a $k_a$ from 0.3 to 3 while watching the curve deform teaches you the model; auto-initialisation hands you a number.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Monolix displays the $\omega$ values in a single column, whatever the distribution. That is where it breaks.

:::pitfall
**A logit-normal $\omega$ is not a CV.** The "$\omega \approx$ CV" shortcut is true for a log-normal at low variability — $\omega = 0.3$ gives $\text{CV} = \sqrt{e^{0.09}-1} = 30.7\%$ — and it transfers **nowhere** else. Take the example again: $\omega_F = 0.85$ in logit puts 90% of subjects in $[0.31, 0.93]$. The same 0.85 in log-normal would give $[0.13, 3.70]$. Same number in the table, unrelated populations. Writing "85% variability on F" in a report means writing a figure that means nothing. For a bounded distribution, do not report $\omega$ as such: report the **prediction interval** on the natural scale, or simulate it.
:::

The same trap strikes at export time, wearing another face. NONMEM has no `logitNormal` keyword: the translation must write the transformation by hand in `$PK`.

```
$PK
  LGT = THETA(1) + ETA(1)      ; logit scale
  F1  = 1/(1 + EXP(-LGT))      ; back into ]0,1[
```

:::pitfall
The `THETA(1)` of the exported control stream is **0.847**, not 0.70: it is $\text{logit}(0.70)$. Put the two result tables side by side and they will look contradictory. Nothing is broken — both numbers designate the same bioavailability, on two scales. You check an export by redoing the inverse transformation, not by comparing rows.
:::

Two closing warnings, in the same spirit.

**Auto-initialisation diagnoses nothing.** It proposes a starting point for the structural parameters; it does not know that your model is wrong, nor that your concentrations are in ng/mL while your doses are in mg. It will dutifully find the values that best fit a wrong dataset. Its real value lies elsewhere: when it returns a $V$ of 3,000 L for an IV drug, that is not a bad starting point, it is a **symptom** — read it as one. Conversely, Monolix's SAEM is markedly more robust to initial values than FOCE, thanks to the simulated annealing of the burn-in phase, which keeps the variances wide at first and lets the chain explore. That is precisely why auto-init is a convenience, not a rescue.

**Covariate tests are a screen, not a decision.** A p of 0.03 on an $\eta$–covariate correlation says there is signal, not that the covariate must be kept. Chaining automatic inclusions over thirty candidates brings up effects that owe everything to chance, and systematically **overestimates** the magnitude of those retained — this is the selection bias described by Ribbing and Jonsson: the threshold that lets an effect through preferentially retains the datasets where it happens, by luck, to look stronger than it is. An effect must survive three questions: is it clinically **plausible**, does it hold under **backward elimination**, and does it change anything to the **dose** you will recommend?
<!-- /step -->

<!-- step:title="Key takeaways" -->
- `distribution=` picks a **link function** $h$ mapping $\mathbb{R}$ onto the parameter's domain. The model is always $h(\psi_i) = h(\psi_{\text{pop}}) + \sum \beta_k c_{ik} + \eta_i$; only $h$ changes.
- `logitNormal` and `probitNormal` bound a parameter within ]0,1[ — or within ]min,max[ with explicit bounds — **by construction**, for any value of $\eta$. A log-normal bioavailability, on the other hand, exceeds 1 with nothing flagging it.
- $\omega$ and $\beta$ live on the scale of $h$, not on the parameter's. "$\omega \approx$ CV" holds only for the log-normal at low variability: for a bounded distribution, report a prediction interval.
- **Auto-initialisation** gives a starting point, not a diagnosis; SAEM's simulated annealing makes Monolix fairly insensitive to initial values anyway. An absurd proposal is a symptom of the model or of the units.
- The **automatic tests** (Wald on the $\beta$, $\eta$–covariate correlations) screen candidates with no extra run, sampling the conditional distribution to escape shrinkage. They will screen, they will not decide: selection bias is real.
- The **MonolixSuite** shares a single mlxtran file — Datxplore (data), Mlxplore (model), Monolix (estimation), Simulx (simulation), PKanalix (NCA): the model simulated is the one that was estimated.
- The **NONMEM export** is a draft control stream, not a clone: different algorithm, non-comparable OFV, bounded parameters rewritten as explicit transformations. You re-run it and re-diagnose it.
<!-- /step -->

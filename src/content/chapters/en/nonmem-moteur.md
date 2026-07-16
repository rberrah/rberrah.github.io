---
id: "nonmem-moteur"
slug: "nonmem-moteur"
title: "NONMEM's engine — FOCE-I unpacked"
description: "What the ESTIMATION line really computes: Taylor linearisation around the EBEs, the role of INTER, the nature of the OFV, and how to read termination messages."
summary: "FO, FOCE, FOCE-I, SAEM: where each method places its tangent, why INTER matters with proportional error, why OFVs from different methods do not compare, and what a rounding error actually means."
track: "nonmem"
order: 214
duration: "10 min"
level: "intermediate"
tags: ["nonmem", "foce", "estimation", "ofv", "likelihood"]
prerequisites: ["tools-nonmem"]
glossary: []
slides: []
sources: ["wang-nonmem-methods", "bauer-nonmem-2", "lindstrom-bates", "wilks-1938"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Why does the OFV of a METHOD=0 (FO) run not compare with that of a METHOD=1 INTER (FOCE-I) run?"
    options:
      - "Because each method computes a different approximation of the same integral: the OFV gap then measures the change of approximation, not a gain in fit."
      - "Because FO estimates fewer parameters than FOCE-I: the OFV gap must first be corrected by the difference in degrees of freedom."
      - "Because FO works on concentrations and FOCE-I on their logarithms: the two OFVs must first be brought onto a common scale."
    correct: 0
  - prompt: "In METHOD=1 INTER, what exactly does the INTER option do?"
    options:
      - "It evaluates the residual variance at the individual η̂ rather than at η = 0, which changes the result as soon as the error is proportional or combined."
      - "It allows a correlation between the clearance and volume η values, which changes the result as soon as the OMEGA block is diagonal."
      - "It interpolates predictions between two observation times, which changes the result as soon as samples are widely spaced."
    correct: 0
  - prompt: "A run ends with MINIMIZATION TERMINATED DUE TO ROUNDING ERRORS. This means that..."
    options:
      - "the optimiser can no longer reach the requested precision, often through over-parameterisation or poor numerical scaling: the estimates need checking, not necessarily discarding."
      - "the structural model is refuted by the data: the number of compartments must be changed before considering any other correction."
      - "the data file contains outlying or missing rows: the columns must be cleaned before the estimation is launched again."
    correct: 0
---

<!-- step:title="Why this chapter" -->
A control stream reads quickly: blocks, columns, a model. Yet the line that decides everything fits in a few words — `$ESTIMATION METHOD=1 INTER`. It does not describe the model: it describes how NONMEM will **evaluate** that model.

Two runs on the same data, with the same model and two different `$ESTIMATION` lines, return neither the same parameters nor the same OFV. As long as you do not know what that line computes, you read NONMEM's output like an oracle: you take the number instead of interpreting it. This chapter opens the box.
<!-- /step -->

<!-- step:title="Intuition" viz="66_FOCELinearization" -->
The problem NONMEM must solve is an **integral**. For each subject, the likelihood of the observations requires averaging over **all possible η** — every version of that patient compatible with the population. If the model were linear in η, this integral would have an analytical solution and the matter would be closed.

A PK model never is. A concentration depends on an exponential term, and the clearance inside it itself depends on $\exp(\eta)$. The integral has no closed form: it must be approximated.

So we cheat — and the whole question is **where** we cheat. FO replaces the model by its **tangent at η = 0**: the typical patient's tangent, applied to everyone. FOCE takes the tangent **at η̂ᵢ**, the subject's empirical Bayes estimate (EBE) — where that patient actually sits. A local approximation is only good near its anchor point; FOCE moves that anchor onto each patient, one by one.

The price is immediate: η̂ᵢ must be found for every subject, and found again at **every population iteration**, since θ and Ω move in the meantime. FOCE is an optimisation loop inside an optimisation loop. FO has no inner loop: that is why it is fast, and exactly why it goes off the rails as soon as between-subject variability is large.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="66_FOCELinearization" -->
The individual model, with proportional error:

$$ y_{ij} = f(t_{ij}, \theta, \eta_i)\,\big(1 + \varepsilon_{ij}\big), \qquad \eta_i \sim \mathcal{N}(0, \Omega), \quad \varepsilon_{ij} \sim \mathcal{N}(0, \sigma^2) $$

Subject *i*'s likelihood is the integral to be dodged:

$$ L_i = \int p(y_i \mid \eta_i)\; p(\eta_i)\; d\eta_i $$

All classical methods handle it with a **first-order Taylor expansion** around an anchor point $\eta^{*}$:

$$ f(\eta_i) \;\approx\; f(\eta^{*}) \;+\; \underbrace{\frac{\partial f}{\partial \eta}\bigg|_{\eta^{*}}}_{\text{the slope}}\,(\eta_i - \eta^{*}) $$

Everything hinges on the choice of $\eta^{*}$:

| `$ESTIMATION` line | Anchor point | Inner loop |
|---|---|---|
| `METHOD=0` (FO) | $\eta^{*} = 0$, the typical patient | no |
| `METHOD=1` (FOCE) | $\eta^{*} = \hat{\eta}_i$, the subject's EBE | yes |
| `METHOD=1 LAPLACIAN` | $\hat{\eta}_i$ + second derivatives | yes |
| `METHOD=SAEM`, `METHOD=IMP` | no linearisation (stochastic) | not applicable |

**What INTER does.** Once the mean is linearised, the **conditional variance** of the observations still has to be written. With proportional error:

$$ \mathrm{Var}(y_{ij} \mid \eta_i) = f(t_{ij}, \theta, \eta_i)^2\,\sigma^2 $$

This variance **depends on η**. Without `INTER`, NONMEM nevertheless evaluates it at η = 0, using the typical prediction — while the mean has been linearised at η̂ᵢ. With `INTER`, the variance is evaluated at η̂ᵢ as well. The "interaction" in the name is the one between η and ε: **the size of the residual error depends on where the individual sits**.

Concretely: a patient whose clearance is half the typical value has roughly double the concentrations, hence a proportional error twice as large in absolute terms. Without `INTER`, NONMEM hands him the average patient's residual error; his observations are mis-weighted, and his contribution to the likelihood is wrong. If the error is **purely additive**, $\mathrm{Var}(y_{ij}\mid\eta_i) = \sigma^2$ does not depend on η and `INTER` changes **nothing** — hence the rule: `INTER` goes with proportional, combined or exponential error models, which is to say nearly all of PK.

**What the OFV is.** The objective function NONMEM minimises is

$$ OFV = -2 \sum_{i=1}^{N} \log \hat{L}_i $$

where $\hat{L}_i$ is the **approximated** likelihood, approximated the way the method chose. Two remarks decide everything that follows:

- NONMEM **omits an additive constant** (the $\log 2\pi$ term of the normal densities). Its OFV is therefore $-2\log L$ **up to a constant**: an isolated OFV value means nothing, and does not compare with the "−2LL" printed by another piece of software.
- The hat on $\hat{L}_i$ is not decorative. FO, FOCE, FOCE-I and Laplace compute **four different functions**. Comparing their OFVs compares two approximations, not two fits.

**The likelihood ratio test.** For two **nested** models, on the **same data**, with the **same method**:

$$ \Delta OFV = OFV_{\text{base}} - OFV_{\text{full}} \;\sim\; \chi^2_{\Delta df} \quad (\text{under } H_0) $$

Thresholds at 5%: **3.84** for 1 parameter, 5.99 for 2, 7.81 for 3. The omitted constant vanishes in the subtraction — which is why the ΔOFV is legitimate where the absolute OFV is not. But the "same method" requirement is not cosmetic: the **approximation bias** must cancel in the difference too, and it only cancels if both runs are wrong in the same way.

```
; --- FOCE with interaction: the workhorse
$ESTIMATION METHOD=1 INTER MAXEVAL=9999 SIGDIGITS=3 PRINT=5 NOABORT
$COVARIANCE PRINT=E

; --- FO: fast, historical, biased as soon as IIV is large
$ESTIMATION METHOD=0 MAXEVAL=9999 PRINT=5

; --- SAEM: no linearisation, but the OFV needs a separate step
$ESTIMATION METHOD=SAEM INTERACTION NBURN=2000 NITER=1000 SEED=20260714
$ESTIMATION METHOD=IMP INTERACTION EONLY=1 NITER=10 ISAMPLE=3000 PRINT=1
```

:::note
SAEM **maximises without ever computing the likelihood**: there is no maximum-likelihood OFV to collect at the end of a SAEM run. Hence the second `$ESTIMATION` line: an evaluation step by importance sampling (`METHOD=IMP` with `EONLY=1`) which does estimate the likelihood. Forget that line and you are left without a usable OFV.
:::
<!-- /step -->

<!-- step:title="Worked example" viz="15_OFVGame" -->
A 60-subject study, one-compartment model, proportional error, IIV on CL and V.

| Run | Model | Method | OFV | ΔOFV vs reference |
|---|---|---|---|---|
| 1 | base | FOCE-I | 1524.8 | reference |
| 2 | run 1 + weight exponent on CL (1 θ) | FOCE-I | 1512.1 | **12.7** > 3.84 → keep |
| 3 | run 2 + age on V (1 θ) | FOCE-I | 1510.4 | **1.7** < 3.84 → drop |

So far everything is orderly: nested models, same data, same `$ESTIMATION`, threshold 3.84 for 1 degree of freedom.

Now comes the demonstration that matters. Take **run 1, strictly unchanged** — same data, same model, same initial estimates — and replace the single `$ESTIMATION` line with `METHOD=0`. Result: **OFV = 1489.3**.

The OFV dropped by **35.5 points**. No parameter was added, no covariate was tested, nothing was "improved": only the **approximation** changed. A ΔOFV of 35.5 against a 3.84 threshold looks overwhelming — and it means strictly nothing. This is the best proof that the OFV is not an absolute score: it is the value of a function **that depends on the method**.

On to run 4: two-compartment model, IIV on CL, V1, Q and V2, full OMEGA block.

```
 MINIMIZATION TERMINATED
 DUE TO ROUNDING ERRORS (ERROR=134)
 NO. OF FUNCTION EVALUATIONS USED:  1287
 NO. OF SIG. DIGITS UNREPORTABLE
```

The message does not say "your model is wrong". It says: "I can no longer earn the 3 significant digits requested". Near the optimum, NONMEM computes its gradients by **finite differences**; if the OFV surface is flat or noisy in some direction, the useful variation falls **below round-off noise** and the next step becomes a coin toss.

Here the diagnosis is readable in the output: Q's ω has fallen to $4 \cdot 10^{-7}$ and the estimated correlation between η_V1 and η_V2 is 0.98. The model is asking the data to separate two volumes they do not separate. Removing the η on Q is enough to recover `MINIMIZATION SUCCESSFUL` and a `$COVARIANCE` step that completes.

:::howto
**Before blaming the model**, rule out the numerics: θ values on wildly different scales (0.13 next to 45,000 — rescale so all θ are of order 1), initial estimates too far off, a `SIGDIGITS` set too tight. Only then suspect over-parameterisation: an ω collapsing toward 0, a correlation climbing to 0.99, a `$COVARIANCE` step that fails.
:::
<!-- /step -->

<!-- step:title="Common pitfall" -->
NONMEM's failures are loud; its **errors** are silent.

:::pitfall
`METHOD=1` **without** `INTER` on a model with proportional error. The run goes through, converges, prints `MINIMIZATION SUCCESSFUL` and returns parameters that look perfectly normal. **Nothing warns you.** Yet the residual variance was evaluated at the typical patient for everyone: highly exposed subjects are given a variance that is too small, hence **too much weight** in the likelihood; poorly exposed ones, the reverse. The estimated ω absorbs this mis-weighting. And the bias grows **with IIV** — precisely when you are doing population PK.
:::

The mirror-image trap is just as common: reading `MINIMIZATION SUCCESSFUL` as a **certificate of quality**. That line says an optimisation algorithm stopped, satisfied with its own numerical precision. It says nothing about whether the model describes the biology, whether the parameters are identifiable, or whether the VPC holds. Conversely, a `ROUNDING ERRORS` does not condemn a model: it signals that you are asking the data for more than they contain, or that the problem is badly scaled numerically.

:::key
Three working rules. **(1)** `INTER` as soon as the error model depends on the prediction — proportional, combined, exponential. **(2)** A ΔOFV may only be read between nested models, on the same data, with the same `$ESTIMATION`. **(3)** A termination status is information about the optimiser, never a model diagnosis.
:::
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The population likelihood is an **integral with no closed form**; FO, FOCE and Laplace dodge it by **Taylor linearisation**, SAEM and IMP by stochastic means.
- Everything hangs on the **anchor point**: FO linearises at η = 0 (the typical patient, for everyone), FOCE at **η̂ᵢ** (each subject's EBE) — at the cost of an inner loop at every iteration.
- **`INTER`** evaluates the residual variance at η̂ᵢ instead of η = 0: essential with proportional or combined error, without effect with purely additive error.
- **OFV = −2 log L̂ up to an additive constant**, and the "hat" depends on the method: OFVs from FO, FOCE-I, SAEM or another software **do not compare**.
- **ΔOFV ~ χ²** (threshold **3.84** at 1 df, 5%): only between **nested** models, same data, **same method** — the constant and the approximation bias then cancel in the difference.
- `MINIMIZATION SUCCESSFUL` is not a validation; `ROUNDING ERRORS` is not a condemnation — it is a signal of over-parameterisation or poor numerical scaling.
<!-- /step -->

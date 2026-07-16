---
id: "monolix-moteur"
slug: "monolix-moteur"
title: "Monolix — the SAEM engine"
description: "Why a stochastic approximation of EM rather than a linearisation: the two phases, the likelihood computed separately, and what convergence means here."
summary: "SAEM never deforms the model, it samples it: exploration then smoothing, -2LL by importance sampling, and an OFV that is not comparable to FOCE."
track: "monolix"
order: 224
duration: "10 min"
level: "intermediate"
tags: ["monolix", "saem", "estimation", "likelihood"]
prerequisites: ["tools-monolix"]
glossary: []
slides: []
sources: ["delyon-saem", "kuhn-lavielle-saem", "lavielle", "monolix"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "In the SAEM convergence plot, a perfectly flat trajectory during the smoothing phase indicates..."
    options:
      - "very little: the step size decays to zero in the smoothing phase, so the trajectory flattens by construction, whether or not the exploratory phase found the right region"
      - "that the maximum likelihood has been reached: the smoothing phase only settles down if the exploratory phase actually converged to the right region"
      - "that the MCMC chain of the simulation step is badly tuned: too low an acceptance rate freezes the individual parameters and hence the population parameters"
    correct: 0
  - prompt: "Monolix computes the likelihood in a task separate from estimation because..."
    options:
      - "SAEM maximises the likelihood without ever evaluating it: its steps only ever touch the sufficient statistics of the complete-data model"
      - "computing the likelihood is too expensive to redo at every iteration: it is therefore performed only once, at the last iteration of SAEM"
      - "the likelihood only makes sense once the individual parameters are known: it therefore requires the individual parameters task to have run before it"
    correct: 0
  - prompt: "A Monolix -2LL (importance sampling) and a NONMEM OFV (FOCE-I), on the same dataset and the same model..."
    options:
      - "are not comparable in absolute value: they estimate different functions, and NONMEM additionally omits a constant term that Monolix includes"
      - "are comparable as soon as the model is identical: both quantities estimate the same marginal likelihood, up to Monte Carlo noise"
      - "are comparable once divided by the number of observations: the normalisation removes the scale difference between the two implementations"
    correct: 0
---

<!-- step:title="Why this chapter" -->
What sets Monolix apart is not its interface — it is its engine, and the fact that there is only one. NONMEM offers SAEM among a dozen estimation methods; Monolix is **built around** SAEM. It is not an entry in a drop-down list, it is the architecture of the software.

Three peculiarities, often experienced as oddities by anyone arriving from NONMEM, follow directly from that: the likelihood is a **separate task** you must remember to request; the convergence plot has **two phases** separated by a vertical line; and a run **cannot fail** in the way a NONMEM run fails. None of the three is an ergonomic choice. This chapter traces those symptoms back to their common cause.
<!-- /step -->

<!-- step:title="Intuition" viz="16_SAEMCycle" -->
The population likelihood requires integrating out the individual parameters, which we never observe. That integral has no closed form as soon as the model is nonlinear in those parameters — that is, always, in PK/PD. Two schools have been fighting over it for forty years.

**Deform the model until the integral becomes easy.** That is FO, FOCE, Laplace: linearise the model around $\eta = 0$ or around the individual mode, which makes the integrand Gaussian and the integral analytical. You then maximise *exactly* an *approximate* function.

**Do not compute the integral at all.** That is EM, and its stochastic version SAEM: the individual parameters are treated as **missing data**, which you simulate instead of integrating. The model is never deformed — it is only ever evaluated, forward, at parameter values drawn at random.

The difference shows up mechanically, in the inner loop. At every iteration, FOCE must solve **for each subject** an optimisation problem — find the mode $\hat{\eta}_i$ — and needs the derivatives of the model with respect to $\eta$. Two things can break: the inner optimisation may fail to converge, and the derivatives may mean nothing at all (a finite difference across a stiff ODE or the near-vertical flank of an Emax measures only integrator noise). SAEM's inner loop, by contrast, is a Metropolis-Hastings step: propose an $\eta$, evaluate the model **once**, accept or reject on a likelihood ratio. No derivative, no inner optimum.

:::key
Monolix's robustness to stiff models and sparse data lives here, not in the interface. On a subject with two samples, FOCE hunts for the mode of an almost flat surface: the inner optimisation stalls and complains. SAEM samples a conditional distribution that is simply very wide. The missing information becomes a **variance**, not a failure.
:::

The price is twofold and must be paid with eyes open. The answer is **stochastic**: two identical runs do not return exactly the same number. And since the algorithm never computes the likelihood, it hands you none at the finish line.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="67_SAEMConvergence" -->
The likelihood to be maximised integrates out the individual parameters $\psi_i$:

$$ L(\theta) = \prod_{i=1}^{N} \int p(y_i \mid \psi_i)\; p(\psi_i \mid \theta)\; d\psi_i $$

EM sidesteps the integral by changing target. If we **knew** the $\psi_i$, maximising would be trivial: nothing but means and variances. So we alternate between estimating what we cannot see and maximising as though we could:

$$ Q(\theta \mid \theta_k) = \mathbb{E}\left[ \log p(y, \psi \mid \theta) \;\middle|\; y,\; \theta_k \right] $$

Except that this expectation is itself an integral with no closed form. SAEM replaces it with a **stochastic approximation**, in three sub-steps per iteration $k$:

**S — Simulation.** Draw $\psi^{(k)}$ from the conditional distribution $p(\psi \mid y, \theta_k)$, by MCMC. This is the only place where the structural model is called.

**A — Approximation.** Update a running average of the sufficient statistics $S$ of the complete-data model:

$$ s_{k+1} = s_k + \gamma_k \left( S\big(y, \psi^{(k)}\big) - s_k \right) $$

**M — Maximisation.** Re-estimate $\theta_{k+1}$ from $s_{k+1}$, in **closed form** for the exponential family. That is what makes the M-step free: there is nothing to optimise numerically.

Everything hinges on $\gamma_k$. Delyon, Lavielle and Moulines (1999) give the two conditions for almost sure convergence: $\sum_k \gamma_k = \infty$ — the step must not die out too fast, or the sequence freezes anywhere — and $\sum_k \gamma_k^2 < \infty$ — it must die out all the same, or the noise never averages away. Kuhn and Lavielle (2004) carried the result over to nonlinear mixed effects models, replacing the exact draw of the S-step with an MCMC kernel.

Monolix picks $\gamma_k$ in **two phases**, and that is exactly how the convergence plot is read:

**Phase 1 — exploration.** $\gamma_k = 1$. The recursion collapses to $s_{k+1} = S(y, \psi^{(k)})$: no memory, each iteration forgets the previous one. The sequence $\theta_k$ **does not converge** — it wanders, in large steps, through the region of high likelihood. That is deliberate: it is what makes SAEM insensitive to initial values.

**Phase 2 — smoothing.** $\gamma_k$ decays, typically as $1/k^a$ with $a$ between $0.5$ and $1$. The memory lengthens, each new simulation only corrects $s_k$ by a fraction, the Monte Carlo noise averages out and $\theta_k$ converges.

In the project file, all of this is set explicitly:

```
<MONOLIX>

[TASKS]
populationParameters()
fim(method = StochasticApproximation)
logLikelihood(method = ImportanceSampling)   ; SEPARATE task, must be asked for

[SETTINGS]
POPULATION:
exploratoryiterations = 500     ; phase 1: constant step, gamma = 1
smoothingiterations   = 200     ; phase 2: decaying step, gamma ~ 1/k
exploratoryautostop   = yes     ; cuts phase 1 short on a criterion
smoothingautostop     = yes
nbchains              = 5       ; MCMC chains: few subjects => use more
simulatedannealing    = yes     ; brakes the decay of the variances in phase 1

LL:
nbfixediterations     = 10000   ; Monte Carlo size of the importance sampling
```

Two settings deserve a word. `nbchains`: when subjects are few, a single chain per subject produces simulation noise too large relative to the information in the data; Monolix then duplicates the subjects into several chains to average that noise out. `simulatedannealing`: during exploration, the variances ($\omega^2$, the error model parameters) are not allowed to shrink faster than an imposed coefficient. Without that brake, SAEM closes the variances around the initial values within the first few iterations — and explores nothing thereafter.

**The likelihood, computed separately.** Re-read the M-step: it only ever touches $s_{k+1}$, statistics of the **complete-data** model. At no point does the algorithm evaluate $L(\theta)$. SAEM maximises the likelihood without ever computing it. At the end of the run you have $\hat{\theta}$ and nothing to put beside it — hence the separate `logLikelihood` task.

Two methods are then available, and the choice is not neutral. `Linearization` linearises the model around the individual modes: fast, but it reintroduces precisely the approximation SAEM had avoided. `ImportanceSampling` is the honest option: it rewrites subject $i$'s integral as an expectation under a proposal distribution $h$ we know how to simulate,

$$ p(y_i \mid \theta) = \int p(y_i \mid \psi_i)\, p(\psi_i \mid \theta)\, d\psi_i = \mathbb{E}_h\!\left[ \frac{p(y_i \mid \psi_i)\; p(\psi_i \mid \theta)}{h(\psi_i)} \right] $$

and estimates it by the average of $M$ draws:

$$ \hat{p}(y_i \mid \theta) = \frac{1}{M} \sum_{m=1}^{M} \frac{p\big(y_i \mid \psi_i^{(m)}\big)\; p\big(\psi_i^{(m)} \mid \theta\big)}{h\big(\psi_i^{(m)}\big)}, \qquad \psi_i^{(m)} \sim h $$

The proposal $h$ is centred on the subject's conditional distribution — the very one SAEM has just sampled, so we get it for free — but with **heavy tails** (a Student t rather than a Gaussian), so that no draw straying into a region where $h$ is tiny receives an exploding weight.

:::key
$\hat{p}(y_i \mid \theta)$ is an **unbiased** estimator of the subject's likelihood. But what gets reported is $-2\log \hat{L}$, and the logarithm of an average is not the average of the logarithms: the $-2LL$ displayed is **noisy**, and slightly biased. Monolix owns up to this and publishes its **Monte Carlo standard error** right beside it. That is not decoration.
:::

:::note
Ref.: Delyon B., Lavielle M., Moulines E., *Ann Statist* 1999, for the convergence of the stochastic approximation of EM; Kuhn E., Lavielle M., *Comput Statist Data Anal* 2004, for SAEM-MCMC in nonlinear mixed effects models; Lavielle M., *Mixed Effects Models for the Population Approach* (Chapman & Hall/CRC), for importance sampling; Monolix documentation (Lixoft — Simulations Plus) for the names of tasks and settings.
:::
<!-- /step -->

<!-- step:title="Worked example" viz="67_SAEMConvergence" -->
A 1-compartment oral model, **60 subjects**, 10 samples each, so $n_{obs} = 600$ observations. The model is tame enough for FOCE-I to be near-exact on it: the most favourable case there is for a comparison.

- Monolix, SAEM then importance sampling: $-2LL = 2149.2$, Monte Carlo standard error $0.31$.
- NONMEM, FOCE-I, same data, same model: $OFV = 1045.9$.

A gap of 1,103 points. This is not a disagreement between the two programs, it is a **constant**. NONMEM omits from its objective the term $n_{obs}\log(2\pi)$, which Monolix includes in its log-likelihood:

$$ n_{obs} \log(2\pi) = 600 \times 1.8379 = 1102.7 $$

That leaves $2149.2 - 1045.9 - 1102.7 = 0.6$ point, roughly two Monte Carlo errors plus the residue of the FOCE approximation. So the two numbers say the same thing: they are simply not written in the same unit of account. And on a less tame model, that residue would stop being negligible — with no constant available to explain it away.

Second act, more useful day to day. Add weight on $Cl$ and re-run:

- without the covariate: $-2LL = 2149.2 \pm 0.31$
- with weight: $-2LL = 2145.1 \pm 0.31$

$\Delta = 4.1$, against a threshold of $3.84$ for a $\chi^2$ with 1 degree of freedom at 5%. Keep the covariate? Careful: both $-2LL$ values are noisy, and the noise on their difference is $\sqrt{0.31^2 + 0.31^2} \approx 0.44$. The threshold sits $(4.1 - 3.84)/0.44 \approx 0.6$ standard deviations away from the estimate. That decision is not carried by the data: it is carried by the seed of the random number generator.

:::recall
The remedy is arithmetic. The Monte Carlo error decays as $1/\sqrt{M}$: taking `nbfixediterations` from 10,000 to 100,000 divides it by $\sqrt{10} \approx 3.2$, giving $\approx 0.10$ per run and $\approx 0.14$ on the difference. The $\Delta$ becomes $4.1 \pm 0.14$ and the conclusion holds. **Practical rule**: as soon as a $\Delta OFV$ comes within a few Monte Carlo errors of its threshold, increase the sampling size **before** concluding. Never after seeing the result that suits you.
:::
<!-- /step -->

<!-- step:title="Common pitfall" -->
SAEM cannot fail. It runs the iterations you asked for, it stops, it prints parameters. There is no `MINIMIZATION SUCCESSFUL` in Monolix, because there is nothing that could return the opposite. The only judge is the convergence plot — and that is exactly where the trap springs.

:::pitfall
**Flatness in phase 2 proves nothing: it is guaranteed by construction.** In the smoothing phase $\gamma_k \to 0$, so each new simulation only corrects $\theta_k$ by a shrinking fraction. The trajectory flattens **because the step is dying out**, not because the maximum has been reached. If a parameter was still climbing at the switch, phase 2 **freezes it mid-climb** and draws you a beautiful horizontal line at a wrong value. You read "converged" on what is merely a capture.
:::

The diagnostic therefore lives **entirely in phase 1** — the part of the plot that looks like a mess. What to look for: every parameter must reach its plateau **well before** the switch line, then oscillate there with frank, visible noise. A plateau reached at iteration 480 out of 500 is not a plateau, it is a coincidence. A trajectory still monotone at the switch has not finished exploring. An $\omega$ sliding towards zero without ever oscillating flags a random effect the data do not support.

The auto-stop makes matters worse: `exploratoryautostop` cuts phase 1 on a criterion that only looks at a recent window of iterations, and a slow enough drift satisfies it without difficulty. On a hard model, switch it off and lengthen `exploratoryiterations`. It is the one SAEM setting that genuinely buys you something.

And the check that settles it: **re-run with a different seed and different initial values.** If $\hat{\theta}$ moves beyond the announced noise, SAEM is not the culprit. Your likelihood is flat or multimodal — and no algorithm setting will repair a non-identifiable model.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Monolix does not offer SAEM among other methods: it is built around it. Its three apparent oddities all follow from that.
- FOCE deforms the model to make the integral computable; SAEM does not approximate the integral, it samples it. No derivative, no per-subject inner optimisation: hence the robustness to stiff models and sparse data.
- Two phases: exploration at constant step ($\gamma_k = 1$, no memory, wandering on purpose), then smoothing at decaying step ($\gamma_k \approx 1/k$, the noise averages out, it converges). Foundation: Delyon–Lavielle–Moulines (1999), carried over to the nonlinear case by Kuhn–Lavielle (2004).
- SAEM maximises the likelihood without ever evaluating it: the $-2LL$ is a **separate task**, by importance sampling (the honest option) or by linearisation (the one that cancels the engine's advantage).
- The $-2LL$ from importance sampling is noisy: read its Monte Carlo error, and raise `nbfixediterations` before settling a tight LRT.
- The convergence diagnostic is in phase 1. Phase 2 is flat by construction, including on a parameter frozen in the wrong place.
- Monolix's $-2LL$ and NONMEM's OFV are not comparable in absolute value: different functions, plus a constant $n_{obs}\log(2\pi)$ of offset.
<!-- /step -->

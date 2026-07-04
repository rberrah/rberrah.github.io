---
id: "valid-shrinkage"
slug: "valid-shrinkage"
title: "Shrinkage: when EBEs mislead"
description: "Why individual estimates collapse toward the population — and what that invalidates."
summary: "Shrinkage (eta and epsilon): origin, measurement, consequences for diagnostics and remedies."
track: "valid"
order: 94
duration: "12 min"
level: "advanced"
tags: ["validation", "shrinkage", "ebe", "diagnostics"]
slides: []
quiz:
  - prompt: "A high eta-shrinkage means the EBEs..."
    options:
      - "are pulled toward the population mean (weak individual data)"
      - "are perfectly estimated"
      - "do not exist"
    correct: 0
  - prompt: "A high epsilon-shrinkage makes unreliable..."
    options:
      - "individual diagnostic plots (IPRED, IWRES)"
      - "the administered dose"
      - "the population clearance value"
    correct: 0
  - prompt: "Eta-shrinkage is computed as..."
    options:
      - "1 − SD(η̂) / ω"
      - "SD(η̂) × ω"
      - "the mean of the concentrations"
    correct: 0
---

<!-- step:title="Why this chapter" -->
The individual parameters of a population model are not measured: they are **estimated** (EBEs, empirical Bayes estimates). When a patient's data are sparse, this estimate **collapses toward the population** — this is **shrinkage**.

Ignoring it leads to over-interpreting EBEs and trusting distorted diagnostics. This chapter deepens what the core EBE chapter introduces.
<!-- /step -->

<!-- step:title="Intuition" viz="18_BayesianShrinkage" -->
With **many** samples, the EBE reflects the patient's true parameter. With **few** data, the model "cannot see" the individual and pulls its estimate toward the **population mean** (η̂ → 0).

Result: the EBEs are **artificially tightened** around zero. Reduce the individual information and watch the cloud of η̂ contract.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="18_BayesianShrinkage" -->
**Eta-shrinkage** compares the spread of estimated EBEs to the model variability $\omega$:

$$ sh_\eta = 1 - \frac{SD(\hat\eta)}{\omega} $$

**How to read it — the rubber-band metaphor.** Each individual estimate is tied to the population mean by a rubber band. Lots of data for that patient → the band gives way, the estimate goes where the data point. Little data → the band snaps it back toward the population. Shrinkage measures **how much the band won**.

**On the maths side.** $SD(\hat\eta)$ is the **actual** spread of the estimated deviations; $\omega$ is the spread the model **expects**. Rich data: $SD(\hat\eta)\approx\omega$, so $sh_\eta\approx 0$. Sparse data: all $\hat\eta$ are squashed toward 0, $SD(\hat\eta)\to 0$, so $sh_\eta\to 1$ (100% shrinkage).

- $sh_\eta \approx 0$: the EBEs cover the variability well (rich data);
- $sh_\eta \to 1$: all η̂ stick to 0 (sparse data).

**Epsilon-shrinkage** concerns the residual error, via the individual weighted residuals:

$$ sh_\varepsilon = 1 - SD(IWRES) $$

**Ref —** Savic R.M. & Karlsson M.O., *AAPS J* 2009 — the importance of shrinkage for interpreting diagnostics. A shrinkage > 20–30% is generally considered concerning.
<!-- /step -->

<!-- step:title="Worked example" viz="18_BayesianShrinkage" -->
A model with **2 samples per patient** yields a 45% eta-shrinkage on clearance: the η̂ are massively pulled toward 0.

Direct consequence: an **η̂ vs covariate** plot (weight, CrCl) looks "flat" — not because there is no effect, but because the η̂ are squashed. One may **miss** a real covariate, or **invent** one (spurious correlation).
<!-- /step -->

<!-- step:title="Common pitfall" -->
Do not build a covariate model on shrunken EBEs.

**Pitfall —** with high shrinkage, selecting covariates on the η̂ or judging the fit on **individual** plots (IPRED, IWRES) is misleading: these diagnostics look good **by construction**. One must rely instead on **simulation-based** diagnostics (VPC, NPDE) and consider **simplifying** the variability (removing a poorly identified η) or enriching the sampling.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- EBEs collapse toward the population when individual data are sparse: this is shrinkage.
- eta-shrinkage = 1 − SD(η̂)/ω; epsilon-shrinkage = 1 − SD(IWRES).
- High shrinkage (> 20–30%) makes individual diagnostics and covariate selection unreliable.
- Remedies: simulation-based diagnostics (VPC/NPDE), simplify the IIV, enrich sampling.
<!-- /step -->

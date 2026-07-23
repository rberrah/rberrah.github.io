---
id: "valid-uncertainty"
slug: "valid-uncertainty"
title: "Parameter uncertainty: RSE and bootstrap"
description: "How much to trust the estimates? Relative standard errors, covariance matrix and bootstrap."
summary: "Quantifying estimation uncertainty: RSE, covariance matrix, bootstrap and likelihood profiling."
track: "valid"
order: 91
duration: "12 min"
level: "advanced"
tags: ["validation", "rse", "bootstrap", "uncertainty"]
slides: []
quiz:
  - prompt: "The RSE (relative standard error) of a parameter measures..."
    options:
      - "the relative uncertainty of its estimate (SE/estimate)"
      - "its inter-individual variability, i.e. its omega"
      - "the model's residual error scaled by the estimate"
    correct: 0
  - prompt: "The bootstrap estimates uncertainty by..."
    options:
      - "resampling subjects and re-estimating the model"
      - "linearising the likelihood around the final estimate"
      - "simulating new observations under the fitted model"
    correct: 0
  - prompt: "A very high RSE (e.g. > 50%) on a parameter suggests..."
    options:
      - "it is poorly identified by the available data"
      - "it varies strongly between patients (high omega)"
      - "it is strongly correlated with another parameter"
    correct: 0
---

<!-- step:title="Why this chapter" -->
An estimate without **uncertainty** is meaningless: 5 L/h ± 2% and 5 L/h ± 60% are not the same confidence. Quantifying this uncertainty separates a **reliable** parameter from an artefact.

It is the "precision" side of validation, complementing the plots.
<!-- /step -->

<!-- step:title="Intuition" viz="51_Bootstrap" -->
Imagine re-estimating the model on many **resampled** patient datasets: the spread of estimates directly measures the uncertainty.

The richer the data, the **tighter** the distribution: the RSE shrinks. Vary the dataset size and watch the confidence interval narrow.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="51_Bootstrap" -->
Standard errors come from the **covariance matrix** (inverse of the Fisher matrix). The **RSE** in percent:

$$ RSE(\%) = \frac{SE(\hat\theta)}{\hat\theta}\times 100 $$

Three complementary approaches:

- **Covariance matrix** (asymptotic, fast) → SE and RSE;
- **Bootstrap** (resampling) → empirical distribution, 95% CI (2.5–97.5 percentiles);
- **Likelihood profiling** → robust CIs for non-symmetric parameters.

**Note —** the bootstrap and likelihood profiling do not assume normality, unlike the covariance-matrix approximation.
<!-- /step -->

<!-- step:title="Worked example" viz="51_Bootstrap" -->
A model gives $Q$ (inter-compartmental clearance) with an **RSE of 80%**: the parameter is poorly identified — the data barely "see" the distribution phase.

The bootstrap confirms it: the distribution of $Q$ is wide and skewed. We simplify the model or enrich the sampling.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Do not confuse uncertainty and variability.

**Pitfall —** the **RSE** (estimation uncertainty) is not **omega** (inter-individual variability): a parameter can be highly variable between patients yet precisely estimated, and vice versa. A high **condition number** of the covariance matrix also signals excessive **correlation** between parameters (over-parameterisation).
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Every estimate must come with its uncertainty (RSE, CI).
- RSE = SE/estimate; comes from the covariance matrix (inverse of the FIM).
- Bootstrap and likelihood profiling: CIs without a normality assumption.
- RSE ≠ variability (omega); a high RSE = a poorly identified parameter.
<!-- /step -->

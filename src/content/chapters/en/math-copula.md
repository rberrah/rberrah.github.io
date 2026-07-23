---
id: "math-copula"
slug: "math-copula"
title: "Copulas and correlated covariates"
description: "Separating marginal laws from their dependence: simulating realistic covariates with copulas."
summary: "Copulas describe dependence between covariates independently of their margins — useful for simulation."
track: "math"
order: 25
duration: "12 min"
level: "advanced"
tags: ["maths", "copula", "covariates", "simulation"]
slides: []
quiz:
  - prompt: "A copula describes..."
    options:
      - "the dependence structure between variables, separate from their marginal laws"
      - "the marginal law of each variable, taken on its own"
      - "the linear correlation coefficient between two given variables"
    correct: 0
  - prompt: "When simulating realistic virtual patients, ignoring the weight–CrCl correlation..."
    options:
      - "creates impossible combinations (e.g. low weight + huge CrCl)"
      - "slightly inflates the variance but keeps realistic profiles"
      - "preserves the margins, so it has no effect on realism"
    correct: 0
  - prompt: "Sklar's theorem states that a joint law decomposes into..."
    options:
      - "its marginal laws and a copula"
      - "the product of its independent margins"
      - "a mean vector and a covariance matrix"
    correct: 0
---

<!-- step:title="Why this chapter" -->
To **simulate** trials or virtual patients, we must generate **realistic** covariates. Yet weight, height, CrCl and age are **correlated**: drawing them independently produces impossible individuals.

**Copulas** reproduce the observed dependence while keeping the correct marginal laws.
<!-- /step -->

<!-- step:title="Intuition" viz="43_Copula" -->
The key idea: **separate** two questions. (1) How is each covariate distributed **on its own** (its margin)? (2) How are they **linked** together (the dependence)?

A copula describes only the second. Vary the correlation: the marginal histograms do not move, only the **link** changes.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="43_Copula" -->
**Sklar's theorem** decomposes any joint law $F$:

$$ F(x_1,\dots,x_d) = C\big(F_1(x_1),\dots,F_d(x_d)\big) $$

where $C$ is the **copula** (a joint law with uniform margins) and $F_j$ are the margins. The **Gaussian copula** is built from a correlation $\rho$:

$$ u_j = \Phi(z_j),\quad z \sim \mathcal{N}(0,\Sigma),\quad x_j = F_j^{-1}(u_j) $$

**Math —** estimate $\Sigma$ (or $\rho$) on a real covariate database, then **simulate**: clinically plausible margins + preserved dependence.
<!-- /step -->

<!-- step:title="Worked example" viz="43_Copula" -->
For a **VPC** or a trial simulation, we want patients whose weight and CrCl covary as in the real population. A Gaussian copula fitted to the data avoids creating a 45 kg subject with a CrCl of 160 mL/min.

Non-Gaussian copulas (Clayton, Gumbel) capture **tail** dependence (co-occurrence of extremes).
<!-- /step -->

<!-- step:title="Common pitfall" -->
Linear correlation does not tell everything.

**Pitfall —** a Gaussian copula does not capture **tail dependence**: two covariates may be weakly correlated "on average" yet co-extreme (renal frailty + old age). Choose the copula family to match the observed structure, and check on the simulated data.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- A copula separates the margins (each covariate) from the dependence (their link).
- Sklar's theorem: joint law = margins + copula.
- Useful to simulate realistic covariates (VPC, virtual trials) without impossible individuals.
- The Gaussian copula ignores tail dependence; choose the right family.
<!-- /step -->

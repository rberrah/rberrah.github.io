---
id: "ai-clustering"
slug: "ai-clustering"
title: "Clustering, PCA and candidate structures"
description: "Exploring candidate structures in individual parameters — clustering, dimension reduction (PCA) and a signal/noise reference (RMT)."
summary: "Exploring individual parameters by group: unsupervised clustering, PCA to visualise, RMT to separate signal from noise."
track: "ai"
order: 19
duration: "16 min"
level: "advanced"
tags: ["ai", "clustering", "pca", "random-matrix-theory"]
prerequisites: ["bayes-ebes","math-stats"]
glossary: ["EBE","Covariable","η","θ"]
slides: []
sources: ["pearson-1901-pca","marchenko-pastur","hotelling-1933","hastie-esl","savic-karlsson-shrinkage"]
reviewed_on: "2026-10-09"
review_type: "author"
review_pending: true
reviewed_hash: "2aa366fb55eee3ef86739e351f5c0378843b823d8e6ad2ab54ba5853618ad13a"
quiz:
  - prompt: "Grouping individual parameters (EBEs) by cancer type can suggest..."
    options:
      - "a candidate association to evaluate between the parameter and cancer type"
      - "that residual variability alone explains the observed gaps"
      - "that cancer type should become the response variable to predict"
    correct: 0
  - prompt: "PCA (principal component analysis) is used to..."
    options:
      - "reduce dimension by keeping the directions of largest variance"
      - "group patients into classes from their known labels"
      - "select the covariates most correlated with the response"
    correct: 0
  - prompt: "In RMT (Random Matrix Theory), an eigenvalue above the Marchenko-Pastur edge λ₊ indicates..."
    options:
      - "a deviation from the noise model under its assumptions"
      - "sampling noise, to be discarded as irrelevant"
      - "a perfect collinearity between two model parameters"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Once a population model is estimated, we obtain **individual parameter estimates** (EBEs: clearance, volume…). They can be explored for unexpected structure — for example an association between clearance and cancer type — but EBEs are model- and shrinkage-dependent estimates, not observed true parameters.

Three tools to explore it: **clustering** (grouping without labels), **PCA** (principal component analysis, to visualise in 2D), and **RMT** (random matrix theory, to flag components incompatible with a simple noise model).
<!-- /step -->

<!-- step:title="Intuition" viz="63_ClusterPCA" -->
Plot the individual parameters and **colour by cancer type**: if the clouds separate, a parameter varies by group.

A **clustering** algorithm groups the points **without knowing** the type, from their positions alone. In the synthetic example, clear separation allows it to recover the constructed groups. This demonstrates the algorithm; it does not discover cancers or phenotypes in real data.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="63_ClusterPCA" -->
**k-means** partitions into $k$ groups by minimising the within-cluster distance:

$$ \min \sum_{i} \lVert x_i - \mu_{c(i)} \rVert^2 $$

where $\mu_c$ is the **centroid** of cluster $c$. **kNN** (k nearest neighbours) rather **classifies** a new patient from their neighbours, or builds a similarity graph.

**How to read it — the classroom metaphor.** Place students by two scores (maths, sport); without looking at their class, you spot natural **clumps**. k-means draws boundaries around them; kNN guesses a new student's class from their **immediate neighbours**.

**On the maths side.** Parameters on different units usually need **standardisation** before Euclidean distances are computed (CL ≈ 0.1; V ≈ 8 here). A prespecified **group comparison** (ANOVA, Kruskal-Wallis) can then test an association under its assumptions; it does not confirm a causal mechanism.
<!-- /step -->

<!-- step:title="Dimension reduction (PCA)" viz="63_ClusterPCA" -->
With **many** parameters (CL, V, Ka, Q, Tlag…), you cannot plot everything. **PCA** projects the data onto the **directions of largest variance**:

$$ \text{PC}_1, \text{PC}_2 = \text{eigenvectors of the covariance, by decreasing variance} $$

Patients may then be visualised in the (PC₁, PC₂) plane. The retained variance must be reported: two components may be insufficient, and a group absent from the projection may exist in another direction — or vice versa.

**Ref —** Pearson (1901), Hotelling (1933) for PCA; MacQueen (1967) for k-means.
<!-- /step -->

<!-- step:title="Signal or noise? (RMT)" viz="64_RMT" -->
The problem: with few patients and many parameters, **correlations appear by pure chance**. How can components incompatible with an explicit null model be identified? **Random Matrix Theory** provides a reference, under its assumptions.

Under the "**everything is noise**" hypothesis, the eigenvalues of the correlation matrix follow the **Marchenko-Pastur** law, bounded by:

$$ \lambda_{\pm} = \left(1 \pm \sqrt{p/n}\right)^2 $$

**How to read it — the background-noise metaphor.** In a noisy room, the null model describes the expected background hum (the Marchenko-Pastur spectrum). A conversation can rise above it: likewise, an eigenvalue **above $\lambda_+$** is incompatible with the spectrum expected under that model and its assumptions. It flags a component to examine without demonstrating causality, a "true" correlation, or biological reality.

**On the maths side.** The edge $\lambda_+$ depends on the ratio $p/n$ and on the null-model assumptions (centred variables, ideal noise, approximate independence). The more **patients** ($n$ large), the tighter the noise floor. This can propose a "cleaned" correlation matrix, to validate by stability and biological sense.
<!-- /step -->

<!-- step:title="Worked example" viz="63_ClusterPCA" -->
In the displayed synthetic scenario, three constructed tumour types have different mean clearances. K-means receives only CL and V; changing separation and standardisation shows when its groups do or do not resemble the simulated labels.

In a real analysis, an analogous result might motivate evaluating **cancer type as a covariate** on clearance. Clustering generates a hypothesis; stability, model diagnostics, predictive assessment and possible external validation may then provide converging evidence, without establishing a causal mechanism by themselves.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A clustering algorithm **always** finds clusters.

**Pitfall —** k-means returns $k$ groups even in pure noise. Stability, validation and biological plausibility can make a structure more credible, not prove that it is a phenotype. Moreover, EBEs are **shrunk**: clustering on uninformative EBEs can create apparent subgroups. Finally, correlation is not causation: a "discovered" subgroup must be independently evaluated, not assumed.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Individual parameter estimates (EBEs) can suggest unforeseen structure (e.g. CL by cancer type).
- Clustering (k-means) groups without labels; kNN classifies; standardise when scale should not drive distance.
- PCA: reduce dimension by keeping the largest-variance directions, to visualise.
- RMT: above λ₊ = possible statistical signal under the null assumptions, not biological proof; more patients stabilises the edge.
- Clustering generates hypotheses; a covariate model and independent assessment may support them, not automatically turn them into mechanisms.
<!-- /step -->

---
id: "ai-clustering"
slug: "ai-clustering"
title: "Hidden subgroups: clustering, PCA and RMT"
description: "Discovering phenotypes in individual parameters — clustering (k-means/kNN), dimension reduction (PCA) and signal/noise sorting (RMT)."
summary: "Exploring individual parameters by group: unsupervised clustering, PCA to visualise, RMT to separate signal from noise."
track: "ai"
order: 19
duration: "16 min"
level: "advanced"
tags: ["ai", "clustering", "pca", "random-matrix-theory"]
prerequisites: ["bayes-ebes", "math-stats"]
glossary: ["EBE", "Covariable", "η", "θ"]
slides: []
quiz:
  - prompt: "Grouping individual parameters (EBEs) by cancer type can reveal..."
    options:
      - "that a parameter (e.g. clearance) depends on cancer type → a covariate"
      - "the optimal dose without data"
      - "the chemical structure"
    correct: 0
  - prompt: "PCA (principal component analysis) is used to..."
    options:
      - "reduce dimension by keeping the directions of largest variance"
      - "remove patients"
      - "increase the number of parameters"
    correct: 0
  - prompt: "In RMT (Random Matrix Theory), an eigenvalue above the Marchenko-Pastur edge λ₊ indicates..."
    options:
      - "a real correlation (signal), not noise"
      - "a computation error"
      - "an outlier patient"
    correct: 0
---

<!-- step:title="Why this chapter" -->
Once a population model is estimated, we obtain each patient's **individual parameters** (the EBEs: clearance, volume…). These are a goldmine: sometimes an **unforeseen** subgroup hides in them — for example a **clearance that depends on cancer type**.

Three tools to explore it: **clustering** (grouping without labels), **PCA** (principal component analysis, to visualise in 2D), and **RMT** (random matrix theory, to tell a real correlation from a chance artefact).
<!-- /step -->

<!-- step:title="Intuition" viz="63_ClusterPCA" -->
Plot the individual parameters and **colour by cancer type**: if the clouds separate, a parameter varies by group.

A **clustering** algorithm does the reverse: it groups the points **without knowing** the type, from their positions alone. When the separation is clear, it **recovers** the cancers — proof that real structure exists.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="63_ClusterPCA" -->
**k-means** partitions into $k$ groups by minimising the within-cluster distance:

$$ \min \sum_{i} \lVert x_i - \mu_{c(i)} \rVert^2 $$

where $\mu_c$ is the **centroid** of cluster $c$. **kNN** (k nearest neighbours) rather **classifies** a new patient from their neighbours, or builds a similarity graph.

**How to read it — the classroom metaphor.** Place students by two scores (maths, sport); without looking at their class, you spot natural **clumps**. k-means draws boundaries around them; kNN guesses a new student's class from their **immediate neighbours**.

**On the maths side.** You must **standardise** the parameters (CL ≈ 0.1; V ≈ 8: incomparable scales) before computing distances. A simple **group comparison** (ANOVA, Kruskal-Wallis) then confirms that a parameter really differs between types.
<!-- /step -->

<!-- step:title="Dimension reduction (PCA)" viz="63_ClusterPCA" -->
With **many** parameters (CL, V, Ka, Q, Tlag…), you cannot plot everything. **PCA** projects the data onto the **directions of largest variance**:

$$ \text{PC}_1, \text{PC}_2 = \text{eigenvectors of the covariance, by decreasing variance} $$

Patients are then visualised in the (PC₁, PC₂) plane — often 2–3 components capture most of the variance, and subgroups appear there.

**Ref —** Pearson (1901), Hotelling (1933) for PCA; MacQueen (1967) for k-means.
<!-- /step -->

<!-- step:title="Signal or noise? (RMT)" viz="64_RMT" -->
The problem: with few patients and many parameters, **correlations appear by pure chance**. How to know which are real? **Random Matrix Theory** answers.

Under the "**everything is noise**" hypothesis, the eigenvalues of the correlation matrix follow the **Marchenko-Pastur** law, bounded by:

$$ \lambda_{\pm} = \left(1 \pm \sqrt{p/n}\right)^2 $$

**How to read it — the background-noise metaphor.** In a noisy room, most "signals" are just background hum (the Marchenko-Pastur bell). A **real** conversation rises above it: likewise, an eigenvalue **above $\lambda_+$** is a **real** correlation (a true factor); below it, chance.

**On the maths side.** The edge $\lambda_+$ depends on the ratio $p/n$: the more **patients** ($n$ large), the tighter the noise floor and the more the signal stands out. This "cleans" the correlation matrix by keeping only the components above $\lambda_+$.
<!-- /step -->

<!-- step:title="Worked example" viz="63_ClusterPCA" -->
In oncology, a drug is modelled across several cancers. Grouping the **individual clearances**, we discover three clouds matching the **tumour types**: CL is lower in one, higher in another.

Practical conclusion: **add cancer type as a covariate** on clearance — then confirm with the OFV and the VPC. Clustering **generated the hypothesis**, the model **validated** it.
<!-- /step -->

<!-- step:title="Common pitfall" -->
A clustering algorithm **always** finds clusters.

**Pitfall —** k-means returns $k$ groups even in pure noise — structure is real only if it **survives** (RMT, validation, biological sense). Moreover, EBEs are **shrunk**: clustering on uninformative EBEs invents subgroups. Finally, correlation is not causation: a "discovered" subgroup must be **confirmed** as a covariate in the model, not assumed.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- Individual parameters (EBEs) can reveal unforeseen subgroups (e.g. CL by cancer type).
- Clustering (k-means) to group without labels; kNN to classify; always standardise.
- PCA: reduce dimension by keeping the largest-variance directions, to visualise.
- RMT: above λ₊ = signal, below = noise; more patients makes the real stand out.
- Clustering generates hypotheses; the model (covariate + OFV/VPC) validates them.
<!-- /step -->

---
id: "ai-svm"
slug: "ai-svm"
title: "Support vector machines (SVM)"
description: "Separating two classes with the widest possible margin, and bending the boundary with the kernel trick."
summary: "SVM: maximal margin, support vectors, soft margin (C) and the kernel trick."
track: "ai"
order: 16
duration: "13 min"
level: "advanced"
tags: ["ai", "svm", "classification", "kernel"]
slides: []
quiz:
  - prompt: "A linear SVM chooses the boundary that..."
    options:
      - "maximises the margin between the two classes"
      - "connects the centres of gravity of the two classes"
      - "minimises the classification error on the sample"
    correct: 0
  - prompt: "The support vectors are..."
    options:
      - "the points on (or inside) the margin, which define the boundary"
      - "the points farthest from the boundary, deep inside each class"
      - "the respective centres of gravity of the two point clouds"
    correct: 0
  - prompt: "The kernel trick allows one to..."
    options:
      - "separate classes non-linearly without explicitly computing the new dimensions"
      - "explicitly project the data into a much higher-dimensional feature space"
      - "reduce the data's dimension beforehand to make the SVM linear and fast"
    correct: 0
---

<!-- step:title="Why this chapter" -->
**SVMs** were long the go-to classifier, and remain useful when data are **few** but well structured (e.g. classifying responders / non-responders).

Their geometric idea — the **maximal margin** — is elegant and illuminates many other methods.
<!-- /step -->

<!-- step:title="Intuition" viz="41_SVMMargin" -->
Between two clouds of points, infinitely many lines separate the classes. Which to choose? The SVM takes the one leaving the **widest margin** on either side — the most robust.

Only the **edge** points (the **support vectors**) matter: moving a point far from the boundary changes nothing. Adjust $C$ to widen or narrow the margin.
<!-- /step -->

<!-- step:title="The formula, unpacked" viz="41_SVMMargin" -->
The margin equals $2/\lVert w\rVert$. Maximising it amounts to:

$$ \min_{w,b}\ \tfrac{1}{2}\lVert w\rVert^2 \quad \text{s.t.}\quad y_i\,(w\cdot x_i + b) \ge 1 $$

In practice we allow slack (**soft** margin) via variables $\xi_i$ and a parameter $C$:

$$ \min\ \tfrac{1}{2}\lVert w\rVert^2 + C\sum_i \xi_i $$

Large $C$ → little tolerance (narrow margin); small $C$ → wide margin. The **kernel trick** replaces $x\cdot x'$ with $K(x,x')$ to separate classes **non-linearly** (RBF, polynomial kernels).

**Ref —** Cortes C. & Vapnik V., *Support-Vector Networks*, Machine Learning 1995. See also **MLU-Explain**, https://mlu-explain.github.io.
<!-- /step -->

<!-- step:title="Worked example" viz="41_SVMMargin" -->
To classify patients as **responders vs non-responders** from a few biomarkers, an RBF-kernel SVM draws a curved boundary tolerating a few exceptions (soft margin).

Tuning $C$ (and the kernel width $\gamma$) is done by **cross-validation**.
<!-- /step -->

<!-- step:title="Common pitfall" -->
The SVM is sensitive to scale and tuning.

**Pitfall —** without **standardising** covariates, the margin is dominated by large-amplitude variables. And an over-flexible kernel (large $\gamma$, large $C$) overfits. The SVM does not natively provide calibrated probabilities (an extra step is needed).
<!-- /step -->

<!-- step:title="Key takeaways" -->
- The SVM maximises the margin between classes; only support vectors define it.
- Soft margin: $C$ trades error tolerance against margin width.
- The kernel trick enables non-linear boundaries without spelling out the dimensions.
- Standardise covariates; tune $C$ and $\gamma$ by cross-validation.
<!-- /step -->

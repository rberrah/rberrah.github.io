---
id: "bayes-ebes"
slug: "bayes-ebes"
title: "Bayésien, EBEs et shrinkage"
description: "Posterior = prior × vraisemblance ; dangers du shrinkage."
order: 10
tags: ["bayes","ebe","shrinkage"]
slides: ["s57","s58","s59","s60","s61","s62","s63","s64"]
---

<!-- step:title="Posterior" slides="s57,s58" viz="18_BayesianShrinkage" -->
p(θ|y) ∝ p(y|θ)·p(θ). Prior large → données dominent ; prior serré → shrinkage.
<!-- /step -->

<!-- step:title="EBE" slides="s59,s60" viz="18_BayesianShrinkage" -->
Estimation individuelle (MAP). Utile pour TDM, mais biaisée si données pauvres.
Piège : utiliser des EBEs très shrinkées pour clusteriser.
<!-- /step -->

<!-- step:title="Shrinkage" slides="s61,s62,s63,s64" viz="18_BayesianShrinkage" -->
Shrinkage élevé → IWRES sous-dispersés, VPC faussement serrée.
Remède : design plus riche ou variabilité mieux spécifiée.
<!-- /step -->

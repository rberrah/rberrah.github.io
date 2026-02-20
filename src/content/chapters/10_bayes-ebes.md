---
id: "bayes-ebes"
slug: "bayes-ebes"
title: "Bayesian, EBEs and shrinkage"
description: "Posterior = prior × likelihood; shrinkage pitfalls."
order: 10
tags: ["bayes","ebe","shrinkage"]
slides: ["s57","s58","s59","s60","s61","s62","s63","s64"]
---

<!-- step:title="Posterior" slides="s57,s58" viz="18_BayesianShrinkage" -->
p(θ|y) ∝ p(y|θ)p(θ). Wide prior → data dominate; tight prior → model constrains.
<!-- /step -->

<!-- step:title="EBE" slides="s59,s60" viz="18_BayesianShrinkage" -->
MAP estimate per individual. Useful for TDM, biased if data are sparse.
<!-- /step -->

<!-- step:title="Shrinkage" slides="s61,s62,s63,s64" viz="18_BayesianShrinkage" -->
High shrinkage → IWRES under-dispersed, VPC too tight.  
Remedy: richer design or use other diagnostics than EBEs.
<!-- /step -->

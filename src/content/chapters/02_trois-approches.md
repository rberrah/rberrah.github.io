---
id: "trois-approches"
slug: "trois-approches"
title: "NCA vs PopPK vs PBPK"
description: "Compare the three pillars of pharmacometrics."
order: 2
tags: ["approches","nca","poppk","pbpk"]
slides: ["s06","s07","s08","s09"]
---

<!-- step:title="NCA: describe" slides="s06" viz="04_ThreeApproaches" -->
Curve with AUC trapezoids.
Why: NCA computes exposure without a model.
Implication: robust but not predictive.
Pitfall: using NCA to simulate a new dose.
<!-- /step -->

<!-- step:title="PopPK: explain variability" slides="s07,s08" viz="04_ThreeApproaches" -->
Spaghetti + distribution.
Why: compartment + random effects for mean and variability.
Implication: can simulate and individualize.
Pitfall: mis-specified residual error or IIV/IOV confusion.
<!-- /step -->

<!-- step:title="PBPK: rebuild physiology" slides="s09" viz="04_ThreeApproaches" -->
Organ network.
Why: bottom-up mechanism, DDIs.
Implication: useful with sparse clinical data, but complex.
Pitfall: over-parameterizing without data.
<!-- /step -->

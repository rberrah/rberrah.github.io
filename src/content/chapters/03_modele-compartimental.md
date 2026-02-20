---
id: "modele-compartimental"
slug: "modele-compartimental"
title: "Understanding the model (hydraulic analogy)"
description: "Tank and tap: CL, V and concentration over time."
order: 3
tags: ["modele","ode","cl","v"]
slides: ["s10","s11","s12","s25"]
---

<!-- step:title="Tank = concentration" slides="s10" viz="02_BucketSim" -->
Width = Volume V: larger V lowers the level for the same dose.
<!-- /step -->

<!-- step:title="Tap = clearance" slides="s11" viz="02_BucketSim" -->
CL controls emptying speed: wider pipe → faster emptying.
<!-- /step -->

<!-- step:title="Equation" slides="s12,s25" -->
dA/dt = -k·A, k = CL/V; exponential solution, t½ = ln2·V/CL.
Pitfall: t½ depends on V and CL, not CL alone.
<!-- /step -->

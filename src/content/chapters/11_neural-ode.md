---
id: "neural-ode"
slug: "neural-ode"
title: "Grey box & Neural ODE"
description: "Mix ODE and neural nets to fix unknown terms."
order: 11
tags: ["ml","neural-ode","grey-box"]
slides: ["s65","s66","s67","s68","s69","s70"]
---

<!-- step:title="White vs Black vs Grey" slides="s65" viz="20_NeuralBox" -->
White box: ODE only. Black box: NN only. Grey: dC/dt = -k·C + NN(t).
<!-- /step -->

<!-- step:title="Missed bump" slides="s66,s67" viz="20_NeuralBox" -->
Pure ODE misses absorption bump. Pitfall: calling it residual error.
<!-- /step -->

<!-- step:title="Activate NN" slides="s68,s69,s70" viz="20_NeuralBox" -->
Adding NN(t) fits the bump while keeping CL/V interpretable.  
Pitfall: letting NN do everything removes interpretability.
<!-- /step -->

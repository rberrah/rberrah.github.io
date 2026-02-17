---
id: "neural-ode"
slug: "neural-ode"
title: "Grey box & Neural ODE"
description: "Combiner ODE et réseau de neurones pour combler l’inconnu."
order: 11
tags: ["ml","neural-ode","grey-box"]
slides: ["s65","s66","s67","s68","s69","s70"]
---

<!-- step:title="White vs Black vs Grey" slides="s65" viz="20_NeuralBox" -->
White box : ODE seule. Black box : NN seul. Grey box : ODE + NN(t) corrige le terme manquant.
<!-- /step -->

<!-- step:title="Bump manqué" slides="s66,s67" viz="20_NeuralBox" -->
La solution ODE pure ignore une bosse d’absorption complexe.
Piège : penser que tout écart = erreur résiduelle.
<!-- /step -->

<!-- step:title="Activation NN" slides="s68,s69,s70" viz="20_NeuralBox" -->
En ajoutant NN(t), la courbe colle au bump sans perdre l’interprétabilité des paramètres CL/V.
Piège : laisser le NN tout faire → perte d’explicabilité.
<!-- /step -->

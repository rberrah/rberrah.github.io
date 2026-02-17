---
id: "modele-compartimental"
slug: "modele-compartimental"
title: "Comprendre le modèle (analogie hydraulique)"
description: "Réservoir, robinets : CL, V et concentration au cours du temps."
order: 3
tags: ["modele","ode","cl","v"]
slides: ["s10","s11","s12","s25"]
---

<!-- step:title="Réservoir = concentration" slides="s10" viz="02_BucketSim" -->
Largeur = Volume V : plus V est grand, plus le niveau baisse pour la même dose.
<!-- /step -->

<!-- step:title="Robinet = clairance" slides="s11" viz="02_BucketSim" -->
CL contrôle la vitesse de vidange : plus le tuyau est large, plus le réservoir se vide vite.
<!-- /step -->

<!-- step:title="Équation" slides="s12,s25" -->
dA/dt = -k·A, k = CL/V ; solution exponentielle, t½ = ln2·V/CL.
Piège : confondre t½ avec CL seule (t½ dépend aussi de V).
<!-- /step -->

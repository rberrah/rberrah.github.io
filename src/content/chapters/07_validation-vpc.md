---
id: "validation-vpc"
slug: "validation-vpc"
title: "Diagnostics : VPC"
description: "Comparer données observées aux percentiles simulés."
order: 7
tags: ["diagnostic","vpc"]
slides: ["s45","s46","s47","s48","s49","s50","s51","s52","s53","s54"]
---

<!-- step:title="Pourquoi binner ?" slides="s45,s46" viz="17_VPCCrashTest" -->
Regrouper les temps stabilise les percentiles et rend le tunnel lisible.
Piège : trop peu de bins → tunnel trop large ; trop de bins → bruit.
<!-- /step -->

<!-- step:title="Interpréter les bandes" slides="s47,s48,s49" viz="17_VPCCrashTest" -->
Bandes p10–p90 simulées (bleu) vs points observés (rouge).
Si les points sortent systématiquement → biais du modèle ou mauvaise variabilité.
<!-- /step -->

<!-- step:title="Sensibilité aux bins" slides="s50,s51,s52,s53,s54" viz="17_VPCCrashTest" -->
Testez on/off binning : le tunnel doit rester cohérent.
Piège : binning sur des temps observés irréguliers sans interpolation.
<!-- /step -->

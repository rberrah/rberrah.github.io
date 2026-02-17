---
id: "absorption-orale"
slug: "absorption-orale"
title: "Voie orale, Ka et Tlag"
description: "Bateman, lag-time, décalage de la courbe."
order: 4
tags: ["absorption","ka","tlag"]
slides: ["s17","s18","s19","s20"]
---

<!-- step:title="Avant Tlag : rien ne se passe" slides="s17" viz="09_PK1C" -->
Si t < Tlag, C = 0 : la gélule n’est pas dissoute.
Piège : oublier le lag → courbe commence trop tôt.
<!-- /step -->

<!-- step:title="Après Tlag : Bateman" slides="s18,s19" viz="09_PK1C" -->
C(t) = (Dose/V)·(Ka/(Ka−Ke))·(e^{-Ke·(t−Tlag)} − e^{-Ka·(t−Tlag)}).
Ka contrôle la pente de montée, CL/V la pente de descente.
<!-- /step -->

<!-- step:title="Tmax/Cmax" slides="s20" viz="09_PK1C" -->
Tmax augmente quand Ka ↓ ou Tlag ↑. Cmax baisse si V ↑ ou CL ↑.
Piège : conclure à une biodisponibilité faible alors que le lag est long.
<!-- /step -->

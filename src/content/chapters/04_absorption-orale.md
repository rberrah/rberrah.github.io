---
id: "absorption-orale"
slug: "absorption-orale"
title: "Oral route, Ka and Tlag"
description: "Bateman, lag-time, curve shift."
order: 4
tags: ["absorption","ka","tlag"]
slides: ["s17","s18","s19","s20"]
---

<!-- step:title="Before Tlag: nothing happens" slides="s17" viz="09_PK1C" -->
If t < Tlag, C = 0: the pill has not dissolved.
Pitfall: forgetting lag → curve starts too early.
<!-- /step -->

<!-- step:title="After Tlag: Bateman" slides="s18,s19" viz="09_PK1C" -->
C(t) = (Dose/V)·(Ka/(Ka−Ke))·(e^{-Ke·(t−Tlag)} − e^{-Ka·(t−Tlag)}).
Ka controls the rise, CL/V the fall.
<!-- /step -->

<!-- step:title="Tmax/Cmax" slides="s20" viz="09_PK1C" -->
Tmax increases when Ka ↓ or Tlag ↑. Cmax decreases if V ↑ or CL ↑.
Pitfall: low Cmax could be long lag, not low F.
<!-- /step -->

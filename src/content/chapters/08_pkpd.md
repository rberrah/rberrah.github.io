---
id: "pkpd"
slug: "pkpd"
title: "PK/PD: Emax and turnover"
description: "Link concentration to effect, delays, and common pitfalls."
order: 8
tags: ["pkpd","emax","turnover"]
slides: ["s32","s33","s34","s35","s36","s37","s38","s39","s40","s41"]
---

<!-- step:title="Emax" slides="s32,s33" -->
E = E0 + Emax·C/(EC50 + C). Plateau effect; EC50 = concentration for 50% effect.  
Pitfall: EC50 imprecise if data only cover 20–80% effect.
<!-- /step -->

<!-- step:title="Sigmoid" slides="s34,s35" -->
E = E0 + Emax·C^Hill/(EC50^Hill + C^Hill). Hill>1 steepens the curve.
<!-- /step -->

<!-- step:title="Indirect / turnover" slides="s36,s37,s38,s39" -->
dR/dt = kin·(1 ± f(C)) − kout·R. PD delay comes from kout.  
Pitfall: attributing PD delay to PK distribution.
<!-- /step -->

<!-- step:title="Quiz" slides="s40,s41" -->
Check EC50 definition, Hill slope, PK vs PD delay.
<!-- /step -->

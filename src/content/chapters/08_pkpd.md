---
id: "pkpd"
slug: "pkpd"
title: "PK/PD : Emax et turnover"
description: "Relier concentration à l’effet, pièges des données limitées."
order: 8
tags: ["pkpd","emax","turnover"]
slides: ["s32","s33","s34","s35","s36","s37","s38","s39","s40","s41"]
---

<!-- step:title="Emax simple" slides="s32,s33" -->
E = E0 + Emax·C/(EC50 + C). Intuition : plateau, EC50 = concentration pour 50% d’effet.
Piège : données 20–80% de l’effet → EC50 imprécis.
<!-- /step -->

<!-- step:title="Sigmoïde" slides="s34,s35" -->
E = E0 + Emax·C^Hill/(EC50^Hill + C^Hill). Hill > 1 rend la courbe plus abrupte.
<!-- /step -->

<!-- step:title="Turnover / compartiment effet" slides="s36,s37,s38,s39" -->
dR/dt = kin·(1 ± f(C)) − kout·R. Le délai PD vient de kout.
Piège : attribuer un délai PK alors qu’il est PD.
<!-- /step -->

<!-- step:title="Recap & quiz" slides="s40,s41" -->
1) EC50 = ?  
2) Hill = ?  
3) Délai PK vs PD ?
<!-- /step -->

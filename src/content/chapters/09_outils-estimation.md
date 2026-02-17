---
id: "outils-estimation"
slug: "outils-estimation"
title: "Outils & estimation"
description: "FOCE/SAEM, formats de données, convergence."
order: 9
tags: ["outils","saem","foce"]
slides: ["s43","s44"]
---

<!-- step:title="Format de données" slides="s43" -->
Colonnes ID/TIME/AMT/EVID/DV/CMT/COV : sans format propre, impossible d’estimer correctement.
Piège : confondre EVID=0 (observation) et EVID>0 (administration).
<!-- /step -->

<!-- step:title="FOCE-I vs SAEM" slides="s44" -->
FOCE-I : déterministe, rapide ; SAEM : stochastique, robuste avec grosses variabilités.
Piège : interpréter le bruit stochastique SAEM comme non-convergence.
<!-- /step -->

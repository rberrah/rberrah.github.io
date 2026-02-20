---
id: "outils-estimation"
slug: "outils-estimation"
title: "Tools & estimation"
description: "FOCE/SAEM, data format, convergence."
order: 9
tags: ["tools","saem","foce"]
slides: ["s43","s44"]
---

<!-- step:title="Data format" slides="s43" -->
Columns ID/TIME/AMT/EVID/DV/CMT/COV. Without proper format, no estimation.  
Pitfall: EVID=0 (observation) vs EVID>0 (dose) confusion.
<!-- /step -->

<!-- step:title="FOCE-I vs SAEM" slides="s44" -->
FOCE-I: deterministic, fast; SAEM: stochastic, robust with high variability.  
Pitfall: reading SAEM stochasticity as non-convergence.
<!-- /step -->

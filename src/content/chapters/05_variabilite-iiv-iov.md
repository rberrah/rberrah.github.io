---
id: "variabilite-iiv-iov"
slug: "variabilite-iiv-iov"
title: "IIV vs IOV"
description: "Variability between patients and between occasions."
order: 5
tags: ["variabilite","iiv","iov"]
slides: ["s21","s22","s23","s24"]
---

<!-- step:title="IIV: stable differences between patients" slides="s21" viz="12_VariabilitySandbox" -->
Each patient has their own η: CL_i = CL_pop·e^{η_i}. Stable across occasions.  
Pitfall: confusing IIV with residual error.
<!-- /step -->

<!-- step:title="IOV: same patient, different occasions" slides="s22" viz="12_VariabilitySandbox" -->
CL_i,occ = CL_pop·e^{η_i + κ_occ}. If IOV > IIV, TDM gets tricky.  
Pitfall: reading high IOV only as non-adherence.
<!-- /step -->

<!-- step:title="Residual error" slides="s23,s24" -->
Additive, proportional or combined: DV = IPRED + ε_add or IPRED·(1+ε_prop).  
Pitfall: applying error on IPRED instead of simulating DV dispersion.
<!-- /step -->

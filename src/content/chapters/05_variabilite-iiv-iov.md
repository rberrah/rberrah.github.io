---
id: "variabilite-iiv-iov"
slug: "variabilite-iiv-iov"
title: "IIV vs IOV"
description: "Variabilité entre patients et entre occasions."
order: 5
tags: ["variabilite","iiv","iov"]
slides: ["s21","s22","s23","s24"]
---

<!-- step:title="IIV : différences stables entre patients" slides="s21" viz="12_VariabilitySandbox" -->
Chaque patient a son η propre : CL_i = CL_pop·e^{η_i}. Stable d’une occasion à l’autre.
Piège : confondre IIV avec erreur résiduelle.
<!-- /step -->

<!-- step:title="IOV : même patient, occasions différentes" slides="s22" viz="12_VariabilitySandbox" -->
CL_i,occ = CL_pop·e^{η_i + κ_occ}. Si IOV > IIV, le TDM est difficile.
Piège : interpréter une forte IOV comme non-adhérence uniquement.
<!-- /step -->

<!-- step:title="Résiduel" slides="s23,s24" -->
Additif, proportionnel ou combiné : DV = IPRED + ε_add ou IPRED·(1+ε_prop).
Piège : appliquer l’erreur sur IPRED au lieu de DV simulés.
<!-- /step -->

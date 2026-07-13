---
id: "tools-nlmixr2"
slug: "tools-nlmixr2"
title: "nlmixr2 — l'open source (R)"
description: "Estimer en R, gratuitement : SAEM et FOCEI, moteur rxode2 et tout l'écosystème R."
summary: "nlmixr2 : l'alternative open-source en R, avec SAEM/FOCEI, rxode2 pour les ODE et les diagnostics R."
track: "tools"
order: 203
duration: "11 min"
level: "intermediate"
tags: ["tools", "nlmixr2", "rxode2", "open-source"]
prerequisites: ["tools-algorithms"]
glossary: ["nlmixr2 / rxode2", "SAEM", "FOCE-I"]
slides: []
sources: ["nlmixr2", "fidler-nlmixr", "kuhn-lavielle-saem", "wang-nonmem-methods"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "nlmixr2 se distingue surtout par..."
    options:
      - "son caractère open-source, entièrement en R"
      - "son coût de licence élevé"
      - "l'absence de tout algorithme"
    correct: 0
  - prompt: "nlmixr2 propose..."
    options:
      - "plusieurs algorithmes, dont SAEM et FOCEI"
      - "uniquement de la simulation"
      - "aucune estimation"
    correct: 0
  - prompt: "Le moteur d'ODE sous nlmixr2 est..."
    options:
      - "rxode2 (réutilisable seul pour simuler)"
      - "un tableur"
      - "NM-TRAN"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
**nlmixr2** est l'alternative **open-source** et **gratuite**, entièrement en **R**. Elle réunit la puissance des moteurs commerciaux (SAEM, FOCEI) et l'intégration à tout l'écosystème R (graphiques, manipulation de données, reproductibilité).

C'est l'outil idéal pour **apprendre**, **prototyper** et **partager** un modèle sans barrière de licence.
<!-- /step -->

<!-- step:title="Intuition" viz="67_SAEMConvergence" -->
Tout se fait dans **R** : le modèle est une **fonction R** lisible, on appelle `nlmixr2(...)` avec la méthode voulue, et les résultats sont des objets R — directement exploitables avec `ggplot2`, `xpose`, `ggPMX`.

On reste dans **un seul langage**, de la donnée au graphique, ce qui simplifie la reproductibilité.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="67_SAEMConvergence" -->
Le modèle et l'estimation en R :

```r
mod <- function() {
  ini({
    tcl <- log(0.13); tv <- log(8); tka <- log(1)
    eta.cl ~ 0.1; eta.v ~ 0.1
    prop.err <- 0.1
  })
  model({
    cl <- exp(tcl + eta.cl); v <- exp(tv + eta.v); ka <- exp(tka)
    d/dt(depot)  = -ka*depot
    d/dt(centr)  =  ka*depot - (cl/v)*centr
    cp = centr/v
    cp ~ prop(prop.err)
  })
}
fit <- nlmixr2(mod, data, est = "saem")   # ou est = "focei"
```

`est = "saem"` ou `"focei"` : nlmixr2 partage les **mêmes** algorithmes que Monolix/NONMEM. Le moteur d'ODE est **rxode2**, réutilisable seul pour simuler.

:::note
Réf. : projet nlmixr2 (Fidler, Wang, Hallow et coll.), open-source (R) ; s'intègre à rxode2, xpose et ggPMX.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="67_SAEMConvergence" -->
Un étudiant ou une petite équipe peut **tout faire** en nlmixr2 — estimer, simuler (rxode2), diagnostiquer (ggPMX) — sans licence. Beaucoup **prototypent** en nlmixr2 puis **confirment** en NONMEM pour le dossier réglementaire, les estimations étant très proches.

C'est aussi un excellent support **pédagogique** : le code R est lisible et reproductible.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Gratuit ne veut pas dire sans rigueur.

:::pitfall
Comme partout, un run qui **converge** ne prouve rien sans diagnostics. Et il faut **documenter les versions** (nlmixr2, rxode2, R) pour la reproductibilité — les algorithmes évoluent. L'OFV reste comparable seulement **à méthode identique**.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- nlmixr2 : l'alternative open-source, gratuite, entièrement en R.
- Modèle = fonction R ; algorithmes SAEM et FOCEI (mêmes familles que Monolix/NONMEM).
- Moteur d'ODE rxode2 (aussi pour la simulation) ; écosystème R (xpose, ggPMX).
- Idéal pour apprendre/prototyper/partager ; documenter les versions ; diagnostiquer toujours.
<!-- /step -->

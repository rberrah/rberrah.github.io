---
id: "tools-nlmixr2"
slug: "tools-nlmixr2"
title: "nlmixr2 — l'open source (R)"
description: "Estimer en R avec plusieurs familles d'estimateurs, le moteur rxode2 et l'écosystème R."
summary: "nlmixr2 : une plateforme open-source en R, avec plusieurs estimateurs, rxode2 pour les ODE et des diagnostics R."
track: "nlmixr2"
order: 230
duration: "11 min"
level: "intermediate"
tags: ["tools", "nlmixr2", "rxode2", "open-source"]
prerequisites: ["tools-algorithms"]
glossary: ["nlmixr2 / rxode2", "SAEM", "FOCE-I"]
slides: []
sources: ["nlmixr2", "fidler-nlmixr", "kuhn-lavielle-saem", "wang-nonmem-methods"]
software_verified_on: "2026-10-12"
software_version: "nlmixr2 7.0.1; nlmixr2est 7.1 documentation"
reviewed_on: "2026-10-12"
review_type: "author"
review_pending: true
reviewed_hash: "4b73d8951c4acf5a917d68ec73b9c554a4e9530e8ca405e151399e9b6aba445e"
quiz:
  - prompt: "nlmixr2 se distingue surtout par..."
    options:
      - "son caractère open-source, entièrement en R"
      - "sa licence commerciale payante, comme NONMEM"
      - "son moteur propriétaire, séparé de l'écosystème R"
    correct: 0
  - prompt: "nlmixr2 propose..."
    options:
      - "plusieurs algorithmes, dont SAEM et FOCEI"
      - "seulement le SAEM, sans équivalent du FOCEI"
      - "un unique moteur bayésien MCMC, sans SAEM"
    correct: 0
  - prompt: "Le moteur d'ODE sous nlmixr2 est..."
    options:
      - "rxode2 (réutilisable seul pour simuler)"
      - "NM-TRAN, le traducteur de contrôle NONMEM"
      - "mlxtran, le langage de modèle Monolix"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
**nlmixr2** est une suite **open source** de modélisation non linéaire à effets mixtes dans **R**. Elle propose notamment SAEM et FOCEI, utilise rxode2 pour les modèles dynamiques et s'intègre à l'écosystème R pour la préparation des données, les graphiques et la reproductibilité.

L'absence de licence commerciale facilite l'apprentissage, le prototypage et le partage. L'adéquation à une analyse dépend néanmoins du modèle, de la méthode d'estimation, des diagnostics, des versions et de l'environnement de calcul.
<!-- /step -->

<!-- step:title="Intuition" viz="67_SAEMConvergence" -->
Tout se fait dans **R** : le modèle est une **fonction R** lisible, on appelle `nlmixr2(...)` avec la méthode voulue, et les résultats sont des objets R — directement exploitables avec `ggplot2`, `xpose`, `ggPMX`.

Un workflow peut rester dans **un seul langage**, de la donnée au graphique. Cela peut faciliter la traçabilité, à condition d'archiver le code, les données, les versions et les réglages.
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

`est = "saem"` et `"focei"` ne sont que deux choix usuels. La documentation actuelle distingue aussi FO/FOI, FOCE/FOCEI/FOCEP, Laplace/AGQ, `nlme`, `posthoc`, puis des méthodes de recherche par importance sampling, non paramétriques ou variationnelles. Elles ont leurs propres implémentations, réglages, conventions et niveaux de maturité. Le moteur d'ODE est **rxode2**, réutilisable seul pour simuler.

**Version vérifiée : nlmixr2 7.0.1, le 12 octobre 2026.** La série 7 a modifié plusieurs valeurs par défaut de FOCEI et SAEM et introduit des moteurs expérimentaux. Un résultat reproductible doit donc archiver la version, `est =` et l'objet de contrôle complet.

:::note
Réf. : projet nlmixr2 (Fidler, Wang, Hallow et coll.), open-source (R) ; s'intègre à rxode2, xpose et ggPMX.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="67_SAEMConvergence" -->
Pour les workflows pris en charge par ces paquets, un étudiant ou une petite équipe peut estimer avec nlmixr2, simuler avec rxode2 et construire des diagnostics dans R sans licence commerciale. Certaines équipes **prototypent** dans cet environnement puis comparent dans un autre outil selon leur workflow ; la proximité des estimations doit se vérifier modèle par modèle, avec les mêmes données, hypothèses et méthodes de calcul de l'OFV.

Le code R explicite peut servir de support **pédagogique** et reproductible, sans dispenser d'expliquer les approximations ni de contrôler les résultats numériques.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Gratuit ne veut pas dire sans rigueur.

:::pitfall
Comme partout, un run qui **converge** ne prouve rien sans diagnostics. Et il faut **documenter les versions** (nlmixr2, rxode2, R) pour la reproductibilité — les algorithmes évoluent. L'OFV reste comparable seulement **à méthode identique**.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- nlmixr2 : une suite open source de modélisation non linéaire à effets mixtes dans R.
- Modèle = fonction R ; plusieurs familles d'estimateurs, dont SAEM, FOCEI, Laplace/AGQ et des méthodes de recherche à contrôler indépendamment.
- Moteur d'ODE rxode2 (aussi pour la simulation) ; écosystème R (xpose, ggPMX).
- Utile pour apprendre, prototyper et partager selon le besoin ; documenter les versions et réglages ; diagnostiquer toujours.
<!-- /step -->

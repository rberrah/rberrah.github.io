---
id: "mab-tmdd"
slug: "mab-tmdd"
title: "TMDD — disposition médiée par la cible"
description: "Quand se lier à sa cible devient une voie d'élimination : la PK non linéaire des biothérapies."
summary: "Le modèle TMDD (Mager & Jusko) : liaison à la cible, saturation et clairance dose-dépendante."
track: "mab"
order: 51
duration: "13 min"
level: "advanced"
tags: ["mab", "tmdd", "nonlinear", "target"]
prerequisites: ["mab-pk", "clairance-volume-demi-vie"]
glossary: ["Michaelis-Menten", "CL", "AUC"]
slides: []
quiz:
  - prompt: "Le TMDD (target-mediated drug disposition) produit une PK..."
    options:
      - "non linéaire : la clairance dépend de la dose"
      - "parfaitement linéaire à toutes les doses"
      - "indépendante de la cible"
    correct: 0
  - prompt: "À forte dose, la cible étant saturée, la PK d'un mAb devient..."
    options:
      - "quasi linéaire (voie cible négligeable)"
      - "de plus en plus rapide"
      - "nulle"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Beaucoup d'anticorps se lient à une **cible** (récepteur, cytokine). Or cette liaison, suivie de l'internalisation du complexe, constitue une **voie d'élimination** — c'est la **TMDD** (target-mediated drug disposition).

Résultat : une PK **non linéaire**, où la clairance dépend de la dose. Ignorer cela conduit à mal extrapoler les schémas.
<!-- /step -->

<!-- step:title="Intuition" viz="54_TMDD" -->
À **faible concentration**, presque tout le médicament trouve une cible libre : la liaison domine, l'élimination est rapide et **saturable**.

À **forte concentration**, la cible est **saturée** : la voie cible devient négligeable, et la PK redevient **linéaire** (catabolisme lent seul). D'où une clairance qui **diminue** quand la dose augmente.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="54_TMDD" -->
Le modèle **TMDD** (Mager & Jusko, 2001) couple médicament libre $C$, cible libre $R$ et complexe $RC$ :

$$ \frac{dC}{dt} = -k_{el}C - k_{on}C\cdot R + k_{off}\,RC $$
$$ \frac{dR}{dt} = k_{syn} - k_{deg}R - k_{on}C\cdot R + k_{off}\,RC,\qquad \frac{dRC}{dt} = k_{on}C\cdot R - (k_{off}+k_{int})RC $$

En pratique, on utilise souvent l'**approximation quasi-équilibre / Michaelis-Menten** de ce système.

:::howto
**La métaphore du parking.** La cible, ce sont des places de parking. À faible dose (peu de voitures), chaque molécule trouve vite une place et y est « retirée » de la circulation : élimination rapide. À forte dose, toutes les places sont **prises** (cible saturée) : les molécules en trop restent dans le sang et ne partent que par la voie lente. D'où une clairance qui **baisse** quand la dose monte.

**Côté maths.** Le terme $k_{on}\,C\cdot R$ est la vitesse de « garage » : proportionnelle aux molécules libres $C$ **et** aux places libres $R$. Quand $R\to 0$ (saturation), ce terme s'éteint et il ne reste que $-k_{el}C$ (catabolisme lent) : la PK redevient linéaire.
:::

:::note
Réf. : Mager D.E. & Jusko W.J., *J Pharmacokinet Pharmacodyn* 2001 (modèle TMDD) ; approximations QSS de Gibiansky & Gibiansky.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="54_TMDD" -->
Sur un profil concentration–temps en semi-log, la TMDD donne une **courbure** caractéristique : chute rapide à basse concentration (cible active) puis pente lente (cible saturée).

Doubler la dose **plus que double** l'exposition — la clairance ayant baissé.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Ne pas extrapoler une PK linéaire d'une dose à l'autre.

:::pitfall
Estimer CL et V à une dose puis prédire une autre dose comme si la PK était linéaire est faux en présence de TMDD. Il faut modéliser la cible (ou au moins une élimination de Michaelis-Menten) et couvrir une **gamme de doses**.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La liaison à la cible + internalisation = voie d'élimination (TMDD) → PK non linéaire.
- Basse [C] : élimination cible rapide, saturable ; forte [C] : cible saturée, PK quasi linéaire.
- La clairance diminue quand la dose augmente.
- Modèle de Mager & Jusko ; approximations de Michaelis-Menten en pratique.
<!-- /step -->

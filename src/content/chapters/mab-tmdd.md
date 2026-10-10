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
sources: ["mager-jusko-tmdd", "gibiansky-qss", "ryman-meibohm"]
updated_on: "2026-10-09"
reviewed_on: "2026-10-09"
review_type: "author"
reviewed_hash: "0f38f7b0dbd223ff1208dd0eec5064bd66476f83fca395a6a0b31ddfc664302f"
quiz:
  - prompt: "Le TMDD (target-mediated drug disposition) produit une PK..."
    options:
      - "souvent non linéaire lorsque liaison et internalisation ajoutent une voie d'élimination saturable"
      - "linéaire : la liaison à la cible ne modifie pas l'élimination"
      - "non linéaire : la clairance augmente quand la dose augmente"
    correct: 0
  - prompt: "À forte dose, la cible étant saturée, la PK d'un mAb devient..."
    options:
      - "quasi linéaire : la voie cible devient négligeable"
      - "de plus en plus rapide : la cible capte plus de médicament"
      - "fortement non linéaire : la voie cible domine l'élimination"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Beaucoup d'anticorps se lient à une **cible** (récepteur, cytokine). Or cette liaison, suivie de l'internalisation du complexe, constitue une **voie d'élimination** — c'est la **TMDD** (target-mediated drug disposition).

Lorsque la liaison à la cible suivie d'internalisation contribue à l'élimination, le résultat canonique est une PK **non linéaire**, où la clairance apparente dépend de la dose. Toute liaison à une cible ne produit toutefois pas ce profil.
<!-- /step -->

<!-- step:title="Intuition" viz="54_TMDD" -->
À **faible concentration**, presque tout le médicament trouve une cible libre : la liaison domine, l'élimination est rapide et **saturable**.

À **forte concentration**, la cible est **saturée** : dans le modèle TMDD canonique avec internalisation, la contribution relative de cette voie diminue et la PK se rapproche de la voie linéaire. La clairance apparente peut alors **diminuer** quand la dose augmente ; ce n'est pas une règle universelle de toute liaison médicament-cible.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="54_TMDD" -->
Le modèle **TMDD** (Mager & Jusko, 2001) couple médicament libre $C$, cible libre $R$ et complexe $RC$ :

$$ \frac{dC}{dt} = -k_{el}C - k_{on}C\cdot R + k_{off}\,RC $$
$$ \frac{dR}{dt} = k_{syn} - k_{deg}R - k_{on}C\cdot R + k_{off}\,RC,\qquad \frac{dRC}{dt} = k_{on}C\cdot R - (k_{off}+k_{int})RC $$

Chaque terme se lit :

- $C$, $R$, $RC$ : concentrations de médicament **libre**, de cible **libre** et du **complexe** ;
- $k_{el}$ : élimination non spécifique du médicament (catabolisme, la voie « lente ») ;
- $k_{on}$ / $k_{off}$ : vitesses d'**association** et de **dissociation** médicament–cible ;
- $k_{syn}$ / $k_{deg}$ : **synthèse** et **dégradation** de la cible en l'absence de médicament ;
- $k_{int}$ : **internalisation** du complexe (la cible « emporte » le médicament — la voie qui sature).

En pratique, on utilise souvent l'approximation **quasi-steady-state (QSS)** de ce système (Gibiansky & Gibiansky, 2008), qui le réduit à une forme de type **Michaelis-Menten**. QSS n'est pas le quasi-équilibre : l'internalisation du complexe compte dans la constante apparente, d'où $K_{ss} = (k_{off}+k_{int})/k_{on}$.

:::howto
**La métaphore du parking.** Dans le cas canonique où le complexe est internalisé, la cible ressemble à des places qui retirent les molécules de la circulation. À forte dose, ces places saturent : la contribution de cette voie plafonne et la clairance apparente peut baisser. Sans élimination significative du complexe, la métaphore ne prédit pas à elle seule ce comportement.

**Côté maths.** Le terme $k_{on}\,C\cdot R$ est la vitesse de « garage » : proportionnelle aux molécules libres $C$ **et** aux places libres $R$. Quand $R\to 0$ (saturation), ce terme s'éteint et il ne reste que $-k_{el}C$ (catabolisme lent) : la PK redevient linéaire.
:::

:::note
Réf. : Mager D.E. & Jusko W.J., *J Pharmacokinet Pharmacodyn* 2001 (modèle TMDD) ; approximations QSS de Gibiansky & Gibiansky.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="54_TMDD" -->
Sur un profil concentration–temps en semi-log, la TMDD donne une **courbure** caractéristique : chute rapide à basse concentration (cible active) puis pente lente (cible saturée).

Dans ce scénario canonique, doubler la dose peut **plus que doubler** l'exposition parce que la voie médiée par la cible sature.
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
- Dans le TMDD canonique avec élimination du complexe, la clairance apparente peut diminuer quand la dose augmente ; vérifier le mécanisme et les données.
- Modèle de Mager & Jusko ; approximations de Michaelis-Menten en pratique.
<!-- /step -->

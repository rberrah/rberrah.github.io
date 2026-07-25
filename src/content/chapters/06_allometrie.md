---
id: "allometrie"
slug: "allometrie"
title: "Covariables et allométrie"
description: "Comment le poids, la fonction rénale et d'autres covariables expliquent une part de la variabilité."
summary: "Introduction aux modèles de covariables, au centrage et à la mise à l'échelle allométrique."
track: "core"
order: 6
duration: "14 min"
level: "intermediate"
tags: ["covariates", "allometry", "weight", "model-building"]
slides: ["s18", "s19", "s20", "s21", "s22"]
sources: ["anderson-holford-allometry", "jonsson-karlsson-scm", "ribbing-selection-bias", "owen-fiedler-kelly"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Une covariable est utile quand elle..."
    options:
      - "explique une part de la variabilité d'un paramètre"
      - "atteint le seuil de significativité statistique fixé"
      - "réduit systématiquement l'erreur résiduelle du modèle"
    correct: 0
  - prompt: "Centrer le poids à 70 kg aide parce que..."
    options:
      - "le paramètre typique reste interprétable"
      - "l'effet du poids sur la clairance disparaît alors"
      - "la constante 70 doit égaler la moyenne des poids"
    correct: 0
  - prompt: "L'allométrie met souvent la clairance à l'échelle du poids avec un exposant proche de..."
    options:
      - "0,75"
      - "1,00"
      - "0,67"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s19" viz="14_AllometryCentering" -->
Les effets aléatoires nous disent que les patients diffèrent. Les covariables demandent si une partie de cette différence est **explicable**.

Poids, fonction rénale, âge, génotype, statut pathologique, co-médications : tous peuvent agir sur les paramètres. Un modèle de covariables transforme l'information clinique en un ajustement quantitatif.
<!-- /step -->

<!-- step:title="Intuition" slides="s19,s20" viz="14_AllometryCentering" -->
Une covariable est **une caractéristique mesurée** (poids, fonction rénale, âge, génotype…) qui aide à expliquer pourquoi un même schéma posologique ne produit pas la même exposition chez tout le monde.

L'idée directrice est de relier chaque paramètre à une covariable **physiologiquement cohérente** :

- le **volume de distribution** peut être relié au **poids**, parce qu'il reflète en partie la diffusion du médicament dans les tissus, notamment la graisse ;
- la **clairance** peut être reliée à la **fonction rénale**, qui décrit justement la vitesse d'élimination rénale.

:::key
Une covariable bien choisie ne supprime pas la variabilité : elle en déplace une part de l'**inexpliqué** (effets aléatoires) vers l'**expliqué**. C'est un lien physiologique, pas une simple corrélation à exploiter.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s20,s21" viz="14_AllometryCentering" -->
Un modèle allométrique courant :

$$ CL_i = CL_{70} \left(\frac{WT_i}{70}\right)^{0{,}75} \qquad V_i = V_{70} \left(\frac{WT_i}{70}\right)^{1} $$

:::math
Le dénominateur 70 **centre** le modèle : $CL_{70}$ désigne la clairance typique d'un patient de 70 kg. L'exposant 0,75 pour la clairance et 1 pour le volume vient de la théorie allométrique.
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s20" viz="14_AllometryCentering" -->
Dans un jeu de données pédiatrique ou à poids mélangés, le poids explique souvent une part visible de la variabilité de clairance et de volume.

Après ajout de l'allométrie, l'effet aléatoire sur la clairance peut **diminuer** : le modèle a déplacé de la variabilité depuis « différence inexpliquée entre patients » vers « expliquée par le poids ».

:::note
**En pédiatrie, le poids ne suffit pas.** On l'utilise souvent comme *proxy* de la maturité, mais les organes ne mûrissent pas tous au même rythme : la fonction rénale et les enzymes hépatiques se développent sur des semaines à des années. Chez le nouveau-né et le nourrisson, on complète donc l'allométrie par une **fonction de maturation** (typiquement sigmoïde en fonction de l'âge post-menstruel), afin de relier la clairance à la maturation **des organes**, et pas seulement au poids.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s22" -->
N'ajoutez pas une covariable simplement parce qu'elle est disponible.

:::pitfall
Une covariable doit être biologiquement plausible, soutenue par les données et vérifiée par les diagnostics. La sélection automatique (forward/backward) aide, mais ne remplace pas l'interprétation.
:::

:::clinical
Une covariable statistiquement significative ne signifie pas pour autant une **causalité**. Elle peut n'être qu'un **proxy** d'un autre facteur : le **poids** est souvent un proxy de la **masse grasse** ; l'**ethnie**, un proxy de **facteurs génétiques** (polymorphismes d'enzymes ou de transporteurs). Le modèle capte une corrélation utile pour prédire, sans démontrer le mécanisme sous-jacent.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Les covariables expliquent une part de la variabilité des paramètres, via un lien physiologique (volume ↔ diffusion tissulaire, clairance ↔ fonction rénale).
- Le centrage garde les valeurs typiques interprétables.
- L'allométrie est une règle de mise à l'échelle par le poids ; en pédiatrie, la compléter par une fonction de maturation (les organes mûrissent à des rythmes différents).
- Significatif ne veut pas dire causal : une covariable est souvent un proxy (poids ↔ masse grasse, ethnie ↔ génétique).
<!-- /step -->

---
id: "allometrie"
slug: "allometrie"
title: "Covariables et allométrie"
description: "Comment le poids, la fonction rénale et d'autres covariables expliquent une part de la variabilité."
summary: "Introduction, pour étudiants, aux modèles de covariables, au centrage et à la mise à l'échelle allométrique."
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
Si des élèves ont des mains, un espace de table ou une expérience différents, ils construisent différemment.

Une covariable est **une caractéristique mesurée** qui aide à expliquer pourquoi la même notice ne fonctionne pas de façon identique pour tout le monde.

:::key
Le poids est comme la taille de la salle ; la fonction rénale, comme la puissance de l'équipe de nettoyage. Les covariables n'expliquent pas tout, mais elles réduisent la variabilité **inexpliquée**.
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
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s22" -->
N'ajoutez pas une covariable simplement parce qu'elle est disponible.

:::pitfall
Une covariable doit être biologiquement plausible, soutenue par les données et vérifiée par les diagnostics. La sélection automatique (forward/backward) aide, mais ne remplace pas l'interprétation.
:::

:::clinical
Une covariable statistiquement significative n'est pas automatiquement cliniquement utile : l'effet peut être réel mais négligeable devant la variabilité résiduelle.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Les covariables expliquent une part de la variabilité des paramètres.
- Le centrage garde les valeurs typiques interprétables.
- L'allométrie est une règle de mise à l'échelle par le poids.
- Significatif ne veut pas dire cliniquement pertinent.
<!-- /step -->

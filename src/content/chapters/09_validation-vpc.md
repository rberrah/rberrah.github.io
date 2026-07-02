---
id: "validation-vpc"
slug: "validation-vpc"
title: "Diagnostics et VPC"
description: "Comment vérifier qu'un modèle est utile, pas seulement ajusté."
summary: "Introduction pratique aux graphes observé-prédit, aux résidus et aux visual predictive checks."
track: "core"
order: 9
duration: "13 min"
level: "intermediate"
tags: ["diagnostics", "vpc", "residuals", "validation"]
slides: ["s43", "s44", "s46", "s47", "s48", "s49", "s50", "s51", "s52", "s25"]
quiz:
  - prompt: "Une VPC compare les données observées avec..."
    options:
      - "des données simulées à partir du modèle ajusté"
      - "les données du seul premier patient"
      - "un tableau de prix de médicaments"
    correct: 0
  - prompt: "Un bon flux de diagnostic demande si..."
    options:
      - "le modèle reproduit les motifs importants des données"
      - "la fonction objectif est la seule chose qui compte"
      - "tous les résidus doivent être exactement nuls"
    correct: 0
  - prompt: "Un piège diagnostique fréquent est..."
    options:
      - "de regarder les graphes"
      - "de conclure au succès à partir d'une seule métrique"
      - "de simuler à partir du modèle"
    correct: 1
---

<!-- step:title="Pourquoi ce chapitre" slides="s44" viz="17_VPCCrashTest" -->
Ajuster un modèle n'est pas la même chose que lui faire confiance.

Les diagnostics demandent si le modèle **reproduit les motifs** utiles à l'apprentissage et à la prédiction. Un modèle peut converger et rester trompeur.
<!-- /step -->

<!-- step:title="Intuition" slides="s48" viz="17_VPCCrashTest" -->
Une fois les constructions terminées, on compare la notice de montage à ce que la classe a réellement produit.

:::key
Si le modèle prédit des tours mais que les élèves ont fait des ponts, le problème n'est pas un petit détail numérique : la notice rate la structure principale.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s43" viz="17_VPCCrashTest" -->
Un résidu est un écart entre observation et prédiction :

$$ e_{ij} = y_{ij} - \hat{y}_{ij} $$

Les résidus pondérés mettent cet écart à l'échelle de la variabilité attendue.

:::math
Une VPC va plus loin : on laisse **de nombreuses** classes simulées bâtir à partir de la même notice, puis on vérifie si la médiane et la dispersion des simulations recouvrent les observations, intervalle de temps par intervalle de temps.
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s46,s47" viz="17_VPCCrashTest" -->
Pour la warfarine, supposons que les concentrations précoces soient systématiquement sous-prédites.

Cela peut évoquer un problème d'absorption, un temps de latence, ou une inadéquation structurale. Une VPC révèle si le modèle capture à la fois la tendance médiane et l'étalement au cours du temps.
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s50,s51,s52" -->
Ne validez pas un modèle avec un seul graphe.

:::pitfall
Observé-prédit, résidus, précision des paramètres, shrinkage, VPC et plausibilité clinique répondent à des questions **différentes**. Un bon flux de travail les utilise ensemble ; se déclarer satisfait d'une seule métrique est l'erreur classique.
:::
<!-- /step -->

<!-- step:title="Le bootstrap" slides="s25" -->
Comment savoir si le modèle est robuste, ou s'il a simplement eu de la chance avec ces patients ?

Le **bootstrap** rééchantillonne l'étude (tirage avec remise) pour créer des centaines d'études virtuelles, puis réajuste le modèle sur chacune.

:::key
On obtient un **intervalle de confiance** pour chaque paramètre : un IC 95 % étroit signale un modèle stable ; un IC large trahit une estimation fragile.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Les diagnostics testent l'utilité du modèle, pas seulement sa convergence.
- Les VPC comparent les observations à des simulations du modèle ajusté.
- Un motif de résidus systématique est un indice, pas une gêne.
- Un modèle est crédible quand statistiques, graphes et interprétation clinique concordent.
<!-- /step -->

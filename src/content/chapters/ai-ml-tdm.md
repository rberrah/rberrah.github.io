---
id: "ai-ml-tdm"
slug: "ai-ml-tdm"
title: "Machine learning pour le TDM"
description: "Estimer l'exposition (AUC) à partir de quelques prélèvements par apprentissage automatique."
summary: "Le ML appliqué au suivi thérapeutique : arbres, hybridation avec la PopPK, travaux de l'équipe de Limoges."
track: "ai"
order: 13
duration: "13 min"
level: "advanced"
tags: ["ai", "machine-learning", "tdm", "limoges"]
prerequisites: ["tdm", "ai-boosting"]
glossary: ["XGBoost", "MAP-BE", "TDM"]
slides: []
sources: ["woillard-ml-tacrolimus", "woillard-ml-simulation", "destere-iohexol-hybrid", "sayadi-ml-tdm-review", "hughes-keizer", "minichmayr-mipd"]
reviewed_on: "2026-07-09"
review_type: "author"
review_pending: true
reviewed_hash: "1fa18f7ff8b34af16a3be8d2bc0eca80c9d40059396dc40807c14bfa1f1f519c"
quiz:
  - prompt: "L'apport principal du ML pour le TDM est de..."
    options:
      - "prédire l'exposition (AUC) à partir de peu de prélèvements"
      - "supprimer tout besoin de prélèvement sanguin chez le patient"
      - "estimer la clairance individuelle en ajustant une EDO mécaniste"
    correct: 0
  - prompt: "Un modèle hybride PopPK + ML cherche à..."
    options:
      - "combiner la structure mécaniste et la flexibilité de l'apprentissage"
      - "remplacer entièrement la PopPK par un réseau appris sur les données"
      - "n'utiliser la PopPK que pour simuler des données d'entraînement au ML"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
En **suivi thérapeutique pharmacologique (TDM)**, on cherche souvent à estimer l'exposition d'un patient à partir de quelques prises de sang. La méthode bayésienne (**MAP**) utilise un modèle pharmacocinétique de population (**PopPK**) et les mesures du patient. Ce modèle doit convenir à la population étudiée. Une autre approche, l'**apprentissage automatique (ML)**, apprend à partir de données cliniques ou simulées à relier quelques concentrations à l'exposition (**AUC**, l'aire sous la courbe des concentrations).

C'est un axe de recherche très actif, notamment porté par l'équipe de **Limoges**.
<!-- /step -->

<!-- step:title="Intuition" viz="40_TreeEnsemble" -->
Plutôt que d'ajuster une équation différentielle par patient, un modèle d'**arbres** (Random Forest, XGBoost) apprend une fonction : quelques prélèvements + covariables → **AUC**.

Une fois entraîné, ce modèle peut calculer rapidement une AUC et combiner plusieurs informations. Mais il ne décrit pas nécessairement les mécanismes du corps. Ses résultats peuvent être moins fiables pour un patient ou des horaires de prélèvement très différents de ceux étudiés.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="BayesUpdate" -->
Deux familles se comparent (et se combinent) :

- **Bayésien (MAP)** : $a\,posteriori \propto vraisemblance \times a\,priori$ — interprétable, dépend du modèle PopPK.
- **ML** : $\text{AUC} = f_{ML}(C_1, C_2, \text{covariables})$ — flexible, appris sur un jeu de profils dont la taille et la représentativité doivent être documentées.
- **Hybride** : garder la PopPK et laisser le ML corriger la partie mal expliquée.

:::note
Exemples documentés : Woillard *et al.* ont étudié l'estimation de l'AUC du tacrolimus sur des données cliniques, puis à partir de simulations de modèles PopPK publiés ; Destere *et al.* ont évalué une correction hybride de la clairance de l'iohexol ; Sayadi *et al.* proposent une revue de ces usages en TDM. Ces travaux n'évaluent ni les mêmes cibles ni les mêmes domaines d'utilisation.
:::
<!-- /step -->

<!-- step:title="Exemple concret" -->
Pour le **tacrolimus**, Woillard *et al.* ont estimé l'**AUC interdose** à partir de 2–3 concentrations : AUC₀₋₁₂ pour une prise BID et AUC₀₋₂₄ pour une prise QD. Dans leurs jeux de test et six jeux externes riches, leurs modèles XGBoost ont obtenu de meilleures performances que les estimateurs MAP comparés ; ce résultat reste conditionnel aux formulations, temps de prélèvement et populations étudiés.

Une approche **hybride** (Destere et al.) associe une structure PopPK et une composante ML. Elle doit être comparée à chacune de ses composantes sur des données indépendantes ; « hybride » ne signifie pas automatiquement « meilleur ».
<!-- /step -->

<!-- step:title="Piège fréquent" viz="46_ValidationSplit" -->
Un bon résultat sur les patients utilisés pour développer un modèle ne prouve pas qu'il fonctionnera chez d'autres patients.

:::pitfall
Le ML **extrapole mal** hors du domaine d'apprentissage (nouvelle population, nouveau schéma, valeurs extrêmes). Sans **validation externe** ni incertitude affichée, la performance sur les données d'entraînement ne garantit rien au lit du patient.
:::

Dans l'expérience, comparez une séparation aléatoire des **lignes**, une séparation par **patient** et un **centre externe**. Avec plusieurs visites par patient, répartir les lignes au hasard laisse le même individu des deux côtés et produit une évaluation trop optimiste.
<!-- /step -->

<!-- step:title="À retenir" -->
- Le ML prédit l'exposition (AUC) à partir de peu de prélèvements, en complément du bayésien.
- Les arbres peuvent estimer directement une AUC ; une composante ML peut aussi corriger une estimation MAP, comme dans l'exemple de l'iohexol.
- Les résultats publiés concernent des usages définis, notamment le tacrolimus et l'iohexol ; ils ne démontrent pas une supériorité générale du ML.
- Exige une validation adaptée à l'usage, idéalement externe, une description du domaine d'apprentissage et une incertitude lorsqu'elle est estimable.
<!-- /step -->

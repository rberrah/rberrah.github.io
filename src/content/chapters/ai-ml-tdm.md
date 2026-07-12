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
slides: []
sources: ["woillard-ml-tacrolimus", "minichmayr-mipd", "berrah-residual", "chen-xgboost"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "L'apport principal du ML pour le TDM est de..."
    options:
      - "prédire l'exposition (AUC) à partir de peu de prélèvements"
      - "remplacer le clinicien"
      - "supprimer la validation externe"
    correct: 0
  - prompt: "Un modèle hybride PopPK + ML cherche à..."
    options:
      - "combiner la structure mécaniste et la flexibilité de l'apprentissage"
      - "abandonner toute pharmacologie"
      - "ignorer l'incertitude"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Le TDM bayésien (MAP) exige un **bon modèle PopPK** a priori. Une alternative — ou un complément — est d'**apprendre** directement, à partir de grandes bases, la relation entre quelques concentrations et l'**exposition** (AUC).

C'est un axe de recherche très actif, notamment porté par l'équipe de **Limoges**.
<!-- /step -->

<!-- step:title="Intuition" viz="40_TreeEnsemble" -->
Plutôt que d'ajuster une équation différentielle par patient, un modèle d'**arbres** (Random Forest, XGBoost) apprend une fonction : quelques prélèvements + covariables → **AUC**.

Rapide, non paramétrique, il capte des interactions complexes — mais reste une **boîte plus noire** qu'un modèle mécaniste.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="BayesUpdate" -->
Deux familles se comparent (et se combinent) :

- **Bayésien (MAP)** : $a\,posteriori \propto vraisemblance \times a\,priori$ — interprétable, dépend du modèle PopPK.
- **ML** : $\text{AUC} = f_{ML}(C_1, C_2, \text{covariables})$ — flexible, appris sur des milliers de profils.
- **Hybride** : garder la PopPK et laisser le ML corriger la partie mal expliquée.

:::note
Réf. (équipe de Limoges) : Woillard J.-B. et al., *Clin Pharmacol Ther* 2021 (estimation de l'AUC du tacrolimus par ML) ; Labriffe M. et al. (ML pour le TDM des immunosuppresseurs) ; Destere A. et al., *Clin Pharmacokinet* 2022 (modèle hybride PopPK + ML, clairance de l'iohexol) ; Sayadi H. et al. (rôle des modèles de ML pour le TDM optimisé) ; Berrah R. et al., *Ther Drug Monit* (l'erreur résiduelle comme levier caché en MIPD).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="BayesUpdate" -->
Pour le **tacrolimus** (greffe), estimer l'AUC₀₋₂₄ à partir de 2–3 prélèvements est crucial. Les modèles de ML atteignent une précision comparable — voire meilleure — que les estimateurs bayésiens classiques, à condition d'une **base d'apprentissage riche**.

L'approche **hybride** (Destere et al.) combine le meilleur des deux : structure PopPK + correction ML.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Un bon score interne ne fait pas un bon outil clinique.

:::pitfall
Le ML **extrapole mal** hors du domaine d'apprentissage (nouvelle population, nouveau schéma, valeurs extrêmes). Sans **validation externe** ni incertitude affichée, la performance sur les données d'entraînement ne garantit rien au lit du patient.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Le ML prédit l'exposition (AUC) à partir de peu de prélèvements, en complément du bayésien.
- Arbres (XGBoost), modèles hybrides PopPK + ML (Destere), sélection de variables (Woillard, Labriffe).
- Cas phares : tacrolimus, iohexol ; travaux de l'équipe de Limoges (Woillard, Sayadi, Berrah).
- Exige validation externe, incertitude et prudence à l'extrapolation.
<!-- /step -->

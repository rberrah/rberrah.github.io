---
id: "covariates-groups"
slug: "covariates-groups"
title: "Covariables catégorielles, paliers et clusters"
description: "Distinguer catégories observées, seuils imposés et sous-populations latentes."
summary: "Distinguer catégories observées, seuils imposés et sous-populations latentes."
track: "covariates"
order: 2
duration: "12 min"
level: "intermediate"
tags: ["covariates","PK","PD"]
prerequisites: ["covariates-basics"]
glossary: []
slides: []
sources: ["monolix-covariates","hastie-esl","lavielle"]
reviewed_on: "2026-09-29"
quiz: [{"prompt":"Pour un ratio A/B = 0,7 dans une exponentielle, bêta vaut…","options":["log(0,7)","0,7","exp(0,7)"],"correct":0},{"prompt":"Un cluster est…","options":["un groupe appris dont la pertinence doit être vérifiée","nécessairement un génotype","une preuve de mécanisme biologique"],"correct":0},{"prompt":"Choisir un seuil puis le valider sur les mêmes données…","options":["peut surestimer sa performance","élimine le surapprentissage","rend inutile la validation externe"],"correct":0}]
---

<!-- step:title="Pourquoi ce chapitre" viz="CovariateGroups" -->
Un génotype est une catégorie observée ; un stade défini par un seuil est une transformation ; un cluster est construit par un algorithme. Un modèle de mélange traite une appartenance latente. Ces notions ne sont pas interchangeables.
<!-- /step -->

<!-- step:title="Intuition" -->
Pour trois catégories A, B et C, choisir une référence et deux indicatrices évite de confondre la référence avec les contrastes. Un nombre codant un génotype n'implique pas un effet linéaire par unité.

Discrétiser une covariable continue simplifie parfois une décision, mais supprime de l'information et introduit des sauts. Un seuil physiologique doit être motivé, pas recherché puis évalué sur les mêmes patients.
<!-- /step -->

<!-- step:title="La formule décortiquée" -->
Avec B comme référence :
$$ CL_i=CL_B\exp\{\beta_A I(G_i=A)+\beta_C I(G_i=C)+\eta_i\}. $$
Les ratios A/B et C/B valent $\exp(\beta_A)$ et $\exp(\beta_C)$. Il faut donc coder $\beta_A=\log(0{,}7)$ pour un ratio de 0,7, et non $\beta_A=0{,}7$.

Pour une classe latente $Z_i$, la vraisemblance intègre l'appartenance :
$$ p(y_i\mid x_i)=\sum_k \pi_k(x_i)\,p(y_i\mid Z_i=k,x_i). $$
L'incertitude de classe n'est pas supprimée en affectant chaque patient au groupe le plus probable.
<!-- /step -->

<!-- step:title="Exemple concret" viz="CovariateGroups" -->
Avec CL de référence de 4 L/h et des ratios 0,7 / 1 / 1,3, les CL typiques sont 2,8 / 4 / 5,2 L/h.

L'atelier compare soit ces catégories, soit des paliers de poids fictifs. Il **n'ajuste pas de clustering**. Pour un véritable clustering, standardiser les variables sur l'échantillon d'entraînement, apprendre les groupes sur celui-ci, figer la règle d'affectation puis l'appliquer aux nouveaux patients.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Construire des clusters avec l'AUC observée, puis utiliser ces clusters pour prétendre prédire cette AUC chez un patient sans mesure, crée une fuite d'information. Même un clustering non supervisé doit être intégré aux plis d'entraînement lors d'une validation croisée.

Des groupes calculés peuvent refléter un centre, un dosage analytique ou des valeurs manquantes plutôt que des phénotypes. Vérifier stabilité, effectifs et incertitude des contrastes.
<!-- /step -->

<!-- step:title="À retenir" -->
- Catégorie connue : indicatrices et référence explicite.
- Covariable continue : conserver la continuité sauf raison défendable.
- Cluster appris : affectation reproductible et validation hors entraînement.
- Classe latente : probabilités d'appartenance, pas une covariable mesurée.
<!-- /step -->

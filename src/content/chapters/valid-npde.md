---
id: "valid-npde"
slug: "valid-npde"
title: "NPDE : résidus par simulation"
description: "Des résidus qui devraient suivre une loi normale : les NPDE, diagnostic robuste par simulation."
summary: "Les NPDE (normalized prediction distribution errors) : construction par simulation et lecture."
track: "valid"
order: 92
duration: "12 min"
level: "advanced"
tags: ["validation", "npde", "simulation", "residuals"]
slides: []
sources: ["brendel-npde", "karlsson-holford-vpc", "hooker-cwres", "iame"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Si le modèle est correct, les NPDE suivent une loi..."
    options:
      - "normale standard N(0,1)"
      - "uniforme"
      - "exponentielle"
    correct: 0
  - prompt: "Les NPDE se construisent en..."
    options:
      - "comparant chaque observation à une distribution simulée sous le modèle"
      - "dérivant la courbe de concentration"
      - "moyennant les doses"
    correct: 0
  - prompt: "Un décalage de la moyenne des NPDE loin de 0 indique..."
    options:
      - "un biais du modèle"
      - "un bon ajustement"
      - "une erreur d'unité seulement"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Les résidus classiques reposent sur des **approximations** (linéarisation). Les **NPDE** s'en affranchissent : ils comparent chaque observation à ce que le modèle **simule** réellement, offrant un diagnostic robuste.

C'est l'outil de référence pour la validation par simulation, avec la VPC.
<!-- /step -->

<!-- step:title="Intuition" viz="52_NPDE" -->
Pour chaque observation, on **simule** de nombreuses valeurs sous le modèle : où se situe l'observation réelle dans cette distribution ?

Si le modèle est correct, ces positions (normalisées) se répartissent comme une **gaussienne standard**. Un décalage ou un étalement trahit un problème. Montez la mauvaise spécification et observez l'écart.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="52_NPDE" -->
On simule $K$ jeux sous le modèle, on calcule la **position** de chaque observation dans la distribution prédite (pde), puis on la transforme par l'inverse de la normale $\Phi^{-1}$ :

$$ npde_{ij} = \Phi^{-1}\big(pde_{ij}\big) $$

Sous le modèle vrai : $npde \sim \mathcal{N}(0,1)$. On **teste** la moyenne (= 0 ?), la variance (= 1 ?) et la normalité, globalement et **par covariable / par temps**.

:::note
Réf. : Brendel K. et al., *Pharm Res* 2006 (NPDE) ; méthode développée à **IAME** (France Mentré et coll.), disponible dans le package R `npde`.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="52_NPDE" -->
Une moyenne de NPDE **positive** dans le sous-groupe « insuffisants rénaux » signale un modèle qui **sous-estime** leurs concentrations : une covariable ClCr manque probablement sur la clairance.

Tracer les NPDE **contre le temps** ou **contre PRED** localise l'erreur (absorption, élimination, erreur résiduelle).
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Un histogramme global peut cacher des écarts locaux.

:::pitfall
Des NPDE globalement N(0,1) peuvent **masquer** des biais opposés dans deux sous-groupes qui se compensent. Il faut examiner les NPDE **stratifiés** (par covariable, par temps), pas seulement l'histogramme d'ensemble.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Les NPDE comparent chaque observation à une distribution simulée sous le modèle.
- Modèle correct ⇒ NPDE ~ N(0,1) (tests de moyenne, variance, normalité).
- Robustes car sans linéarisation ; à examiner stratifiés (covariable, temps).
- Un décalage/étalement local révèle un biais (souvent une covariable manquante).
<!-- /step -->

---
id: "valid-uncertainty"
slug: "valid-uncertainty"
title: "Incertitude des paramètres : RSE et bootstrap"
description: "Quelle confiance accorder aux estimations ? Erreurs standards relatives, matrice de covariance et bootstrap."
summary: "Quantifier l'incertitude d'estimation : RSE, matrice de covariance, bootstrap et profil de vraisemblance."
track: "valid"
order: 91
duration: "12 min"
level: "advanced"
tags: ["validation", "rse", "bootstrap", "uncertainty"]
slides: []
sources: ["efron-bootstrap", "mentre-optimal-design", "davidian-giltinan"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Le RSE (relative standard error) d'un paramètre mesure..."
    options:
      - "l'incertitude relative de son estimation (SE/estimation)"
      - "sa variabilité inter-individuelle"
      - "sa valeur moyenne"
    correct: 0
  - prompt: "Le bootstrap estime l'incertitude en..."
    options:
      - "ré-échantillonnant les sujets et ré-estimant le modèle"
      - "supprimant des paramètres"
      - "augmentant la dose"
    correct: 0
  - prompt: "Un RSE très élevé (ex. > 50 %) sur un paramètre suggère..."
    options:
      - "qu'il est mal identifié par les données"
      - "qu'il est parfaitement estimé"
      - "que la dose est trop faible"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Une estimation sans **incertitude** n'a pas de sens : 5 L/h ± 2 % et 5 L/h ± 60 %, ce n'est pas la même confiance. Quantifier cette incertitude distingue un paramètre **fiable** d'un artefact.

C'est le pendant « précision » de la validation, complémentaire des graphiques.
<!-- /step -->

<!-- step:title="Intuition" viz="51_Bootstrap" -->
Imaginez ré-estimer le modèle sur de nombreux **jeux ré-échantillonnés** de patients : la dispersion des estimations mesure directement l'incertitude.

Plus les données sont riches, plus la distribution se **resserre** : le RSE diminue. Faites varier la taille du jeu et observez l'intervalle de confiance rétrécir.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="51_Bootstrap" -->
Les erreurs standards viennent de la **matrice de covariance** (inverse de la matrice de Fisher). Le **RSE** en pourcentage :

$$ RSE(\%) = \frac{SE(\hat\theta)}{\hat\theta}\times 100 $$

Trois approches complémentaires :

- **Matrice de covariance** (asymptotique, rapide) → SE et RSE ;
- **Bootstrap** (ré-échantillonnage) → distribution empirique, IC à 95 % (percentiles 2,5–97,5) ;
- **Profil de vraisemblance** → IC robustes pour paramètres non symétriques.

:::note
Le bootstrap et le profil de vraisemblance ne supposent pas la normalité, contrairement à l'approximation par la matrice de covariance.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="51_Bootstrap" -->
Un modèle donne $Q$ (clairance inter-compartimentale) avec un **RSE de 80 %** : le paramètre est mal identifié — les données ne « voient » pas bien la phase de distribution.

Le bootstrap le confirme : la distribution de $Q$ est large et asymétrique. On simplifie le modèle ou on enrichit l'échantillonnage.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Ne pas confondre incertitude et variabilité.

:::pitfall
Le **RSE** (incertitude d'estimation) n'est pas l'**oméga** (variabilité inter-individuelle) : un paramètre peut être très variable entre patients mais précisément estimé, et inversement. Un **nombre de condition** élevé de la matrice de covariance signale en plus une **corrélation** excessive entre paramètres (sur-paramétrisation).
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Toute estimation doit s'accompagner de son incertitude (RSE, IC).
- RSE = SE/estimation ; vient de la matrice de covariance (inverse de la FIM).
- Bootstrap et profil de vraisemblance : IC sans hypothèse de normalité.
- RSE ≠ variabilité (oméga) ; un RSE élevé = paramètre mal identifié.
<!-- /step -->

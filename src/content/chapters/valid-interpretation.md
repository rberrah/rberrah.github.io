---
id: "valid-interpretation"
slug: "valid-interpretation"
title: "Cas pratique : lire les GoF et améliorer le modèle"
description: "Chaque motif de résidus (U, U inversé, trompette, pente) a une cause et un remède concret."
summary: "Guide de dépannage : traduire la forme des graphiques diagnostiques en action sur le modèle."
track: "valid"
order: 96
duration: "13 min"
level: "advanced"
tags: ["validation", "interpretation", "residuals", "troubleshooting"]
prerequisites: ["valid-gof", "valid-diagnostics"]
glossary: ["Résidus (WRES/CWRES/IWRES/NPDE)", "GOF", "PRED / IPRED", "Erreur combinée"]
slides: []
sources: ["hooker-cwres", "mould-upton", "savic-karlsson-shrinkage", "jonsson-karlsson-scm"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Des CWRES en forme de U (négatifs au milieu, positifs aux extrêmes) évoquent..."
    options:
      - "une mauvaise spécification structurale (ex. compartiment manquant)"
      - "un modèle d'erreur résiduelle inadapté (additive vs combinée)"
      - "une variabilité inter-individuelle mal spécifiée sur la clairance"
    correct: 0
  - prompt: "Un nuage de résidus en « trompette » (qui s'évase) appelle..."
    options:
      - "à revoir le modèle d'erreur résiduelle (additive → combinée)"
      - "à ajouter un compartiment de distribution au modèle structural"
      - "à introduire une covariable poids sur le volume de distribution"
    correct: 0
  - prompt: "Une moyenne de résidus non nulle dans un sous-groupe (ex. insuffisants rénaux) suggère..."
    options:
      - "une covariable manquante sur un paramètre de disposition"
      - "un simple hasard d'échantillonnage dans ce sous-groupe"
      - "une erreur résiduelle plus forte dans ce sous-groupe"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Un graphique diagnostique ne sert à rien si l'on ne sait pas **quoi en faire**. Ce chapitre est un **guide de dépannage** : à chaque forme de résidus correspond une **cause probable** et un **remède concret** sur le modèle.

C'est le réflexe qui distingue le débutant (« le graphique est moche ») du modélisateur (« il manque un compartiment »).
<!-- /step -->

<!-- step:title="Intuition" viz="62_ResidualPatterns" -->
La **forme** du nuage de résidus raconte le défaut. Un bon modèle laisse un nuage **aléatoire**, centré sur 0, sans structure.

Toute **structure** — courbure, évasement, pente — est un message. Faites défiler les motifs et lisez, pour chacun, l'interprétation et le remède.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="62_ResidualPatterns" -->
Le **catalogue** motif → cause → remède :

- **Nuage aléatoire, centré sur 0** → modèle adéquat. Rien à changer.
- **Forme en U** (résidus négatifs au milieu, positifs aux extrêmes) → le modèle **sous-prédit** aux extrêmes : mauvaise **structure**. Remède : ajouter un **compartiment**, revoir l'absorption/élimination, ou une non-linéarité.
- **U inversé** → biais opposé (sur-prédiction aux extrêmes). Même famille de remède : revoir le modèle structural.
- **Trompette / entonnoir** (variance qui **croît** avec la prédiction) → mauvais **modèle d'erreur résiduelle**. Remède : passer d'une erreur **additive** à **proportionnelle** ou **combinée**.
- **Pente / tendance** (dérive systématique) → biais : **covariable manquante** ou structure inadaptée.
- **Décalage dans un sous-groupe** (moyenne ≠ 0 chez les insuffisants rénaux, les enfants…) → **covariable manquante** sur le paramètre concerné (ex. ClCr sur la clairance).

:::howto
**La métaphore du diagnostic médical.** Le résidu est un **symptôme**, pas la maladie. Un U = « fièvre courbe » → penser structure ; une trompette = « la mesure devient floue quand c'est grand » → penser modèle d'erreur ; un décalage de sous-groupe = « seuls certains patients sont touchés » → penser covariable.

**Côté maths.** Sur $|IWRES|$ vs prédictions, une pente **positive** = variance croissante = erreur additive insuffisante. Sur **CWRES vs temps**, une courbure = phase (absorption ou élimination) mal décrite. Sur **η vs covariable**, une pente = covariable à ajouter.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="62_ResidualPatterns" -->
Warfarine : si les **CWRES vs temps** dessinent un **U** (sous-prédiction tôt et tard), on **teste un 2ᵉ compartiment** ou un temps de latence. Ici, le Tlag corrige déjà l'essentiel — l'AIC confirme que 2 compartiments n'apportent rien.

Si les résidus s'**évasent** aux fortes concentrations, on **remplace l'erreur additive par une combinée** — souvent la meilleure amélioration sur données à large gamme.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Ne sur-réagissez pas à un motif.

:::pitfall
Un **seul point** extrême n'est pas un motif (vérifier la donnée avant de complexifier). Un motif sur les graphiques **individuels** (IPRED, IWRES) peut être un artefact de **shrinkage** élevé — s'appuyer d'abord sur les diagnostics de **population** (CWRES, VPC, NPDE). Enfin, un remède doit **améliorer l'OFV/AIC** : sinon, on a ajouté de la complexité pour rien.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La forme des résidus se traduit en action : lire le motif, corriger la cause.
- U / U inversé → structure (compartiment, absorption). Trompette → modèle d'erreur (combinée).
- Pente ou décalage de sous-groupe → covariable manquante.
- Vérifier la donnée avant de complexifier ; confirmer tout remède par l'OFV/AIC et la VPC.
<!-- /step -->

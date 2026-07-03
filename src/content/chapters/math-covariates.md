---
id: "math-covariates"
slug: "math-covariates"
title: "Construction du modèle de covariables"
description: "Expliquer la variabilité : allométrie, centrage, sélection pas-à-pas (SCM) et approches modernes."
summary: "Bâtir un modèle de covariables : paramétrisation, allométrie, sélection (SCM/full model), pièges de collinéarité."
track: "math"
order: 26
duration: "14 min"
level: "advanced"
tags: ["maths", "covariates", "scm", "model-building"]
slides: []
quiz:
  - prompt: "Ajouter une covariable pertinente à un modèle de population..."
    options:
      - "explique une partie de la variabilité inter-individuelle (l'oméga baisse)"
      - "augmente toujours la variabilité"
      - "n'a aucun effet sur l'oméga"
    correct: 0
  - prompt: "L'allométrie décrit l'effet du poids sur la clairance par..."
    options:
      - "une loi puissance d'exposant ~0,75"
      - "une relation linéaire d'exposant 1"
      - "aucune relation"
    correct: 0
  - prompt: "La sélection pas-à-pas (SCM) risque..."
    options:
      - "de sur-sélectionner et de biaiser les effets (données réutilisées)"
      - "de toujours donner le vrai modèle"
      - "d'ignorer les covariables"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
La variabilité inter-individuelle n'est pas du hasard pur : une partie s'**explique** par des covariables (poids, fonction rénale, génotype). Les identifier permet d'**individualiser** la dose et de comprendre le médicament.

Construire ce modèle de covariables est un art aux pièges nombreux.
<!-- /step -->

<!-- step:title="Intuition" viz="14_AllometryCentering" -->
Une covariable utile **réduit** la variabilité inexpliquée : après l'avoir ajoutée, les patients « se ressemblent » davantage à covariable égale (l'$\omega$ diminue).

Deux bonnes pratiques : **centrer** la covariable sur une valeur de référence (le paramètre typique garde son sens) et utiliser des formes **physiologiques** (allométrie).
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="14_AllometryCentering" -->
La forme la plus courante, centrée et en loi puissance :

$$ CL_i = CL_{ref}\left(\frac{W_i}{70}\right)^{0{,}75}\cdot e^{\eta_i} $$

- **Centrage** sur 70 kg : $CL_{ref}$ = clairance du sujet de référence ;
- **Allométrie** : exposant ~0,75 pour la clairance (0,75), 1 pour les volumes.

Pour la **sélection**, plusieurs stratégies : **SCM** (stepwise covariate modeling, forward/backward sur l'OFV), **full model** (tout inclure puis juger la pertinence), et des approches modernes (**SAMBA**, sélection pénalisée) plus rapides et moins biaisées.

:::note
Réf. : Jonsson & Karlsson (SCM) ; Anderson & Holford (allométrie) ; Prague, Mentré et coll. — **SAMBA** (IAME) pour une sélection efficace des covariables.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="14_AllometryCentering" -->
Ajouter le **poids** (allométrie) puis la **ClCr** sur la clairance fait chuter l'OFV et l'$\omega$ de la clairance : la variabilité devient explicable, la dose peut s'ajuster au poids et à la fonction rénale.

On juge chaque covariable non seulement sur l'OFV mais sur son **ampleur clinique** (voir l'interprétation par forest plot).
<!-- /step -->

<!-- step:title="Piège fréquent" -->
La sélection pas-à-pas se piège elle-même.

:::pitfall
Le **SCM** teste beaucoup de covariables sur les **mêmes** données : il en **sur-sélectionne** et **surestime** les effets (biais de sélection). Les covariables **corrélées** (poids, taille, ClCr) se substituent l'une à l'autre. Préférer des formes pré-spécifiées, l'allométrie physiologique, et valider les effets retenus.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Une covariable pertinente explique une part de l'IIV (l'oméga diminue).
- Centrer la covariable ; utiliser l'allométrie (CL ∝ poids^0,75, V ∝ poids).
- Sélection : SCM (stepwise), full model, ou approches modernes (SAMBA, pénalisation).
- Le SCM sur-sélectionne et biaise ; attention aux covariables corrélées.
<!-- /step -->

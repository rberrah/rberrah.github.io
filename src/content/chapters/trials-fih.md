---
id: "trials-fih"
slug: "trials-fih"
title: "Première dose chez l'homme : MABEL et NOAEL"
description: "Choisir une dose de départ sûre : du NOAEL animal au MABEL fondé sur la pharmacologie."
summary: "Les approches de dose de départ en première administration humaine : NOAEL, MRSD et MABEL."
track: "trials"
order: 100
duration: "12 min"
level: "advanced"
tags: ["clinical-trials", "first-in-human", "mabel", "starting-dose"]
slides: []
sources: ["fda-starting-dose", "ema-fih", "anderson-holford-allometry", "holford-sheiner-dose-effect"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "L'approche MABEL fonde la dose de départ sur..."
    options:
      - "le plus faible niveau d'effet biologique anticipé (pharmacologie)"
      - "la plus forte dose sans effet indésirable observé chez l'animal"
      - "l'exposition équivalente à la dose thérapeutique établie chez l'animal"
    correct: 0
  - prompt: "Le NOAEL provient..."
    options:
      - "des études de toxicologie animale (dose sans effet indésirable observé)"
      - "des études de pharmacologie in vitro (affinité et puissance sur la cible)"
      - "de la modélisation de l'occupation du récepteur cible chez l'homme"
    correct: 0
  - prompt: "Pour les molécules très actives (agonistes immunitaires), on privilégie..."
    options:
      - "une intégration prudente des preuves MABEL/PAD/NOAEL"
      - "le NOAEL divisé par un facteur de sécurité nettement plus grand"
      - "la moyenne entre la dose issue du NOAEL et celle issue du MABEL"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
La toute première dose chez l'homme se joue **sans donnée humaine** : il faut extrapoler depuis l'animal et la pharmacologie. Une dose trop forte est dangereuse (l'affaire **TGN1412** l'a montré), trop faible retarde le développement.

La pharmacométrie fournit un cadre rationnel qui intègre plusieurs preuves : NOAEL/MRSD, **MABEL** et, selon le contexte, pharmacologically active dose (PAD).
<!-- /step -->

<!-- step:title="Intuition" viz="EmaxHill" -->
Deux philosophies. La **toxicologie** part du haut : la plus forte dose **sans effet indésirable** chez l'animal (NOAEL), qu'on divise par des marges de sécurité.

La **pharmacologie** part du bas : la plus faible dose susceptible de produire un **effet biologique anticipé** (MABEL/PAD), estimée à partir de la puissance, de l'occupation de cible, de la PK/PD et de l'incertitude translationnelle. Pour une molécule très active, cette voie peut être plus prudente.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="EmaxHill" -->
Du **NOAEL** animal, on dérive la dose humaine maximale de départ (MRSD) par mise à l'échelle allométrique et facteurs de sécurité :

$$ \text{HED} = \text{NOAEL}\times\left(\frac{W_{animal}}{W_{humain}}\right)^{0{,}33},\qquad \text{MRSD} = \frac{\text{HED}}{\text{facteur de sécurité}} $$

Le **MABEL** s'appuie sur un ensemble de données pharmacologiques : relation exposition–occupation de cible, activité in vitro, PK/PD, espèces pertinentes et incertitude. Une occupation faible (par exemple 10 %) peut être un scénario de calcul, mais ce n'est pas une règle générale.

:::note
Réf. : FDA *Guidance for Estimating the Maximum Safe Starting Dose* (2005) ; EMA *Guideline on first-in-human clinical trials* (révisée 2017, après TGN1412).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="EmaxHill" -->
Pour un **agoniste immunitaire**, le NOAEL peut donner une dose de départ dangereusement active chez l'homme (espèces peu prédictives). Une approche MABEL/PAD calée sur la pharmacologie humaine anticipée peut proposer une dose bien plus basse.

On retient en général une dose de départ issue d'une **intégration prudente** des approches, pas d'une compétition mécanique entre NOAEL et MABEL.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le NOAEL n'est pas toujours protecteur.

:::pitfall
Pour les biothérapies **très puissantes** ou aux mécanismes absents chez l'animal, le NOAEL peut fortement **sous-estimer** le risque humain. C'est la leçon de TGN1412 : intégrer MABEL/PAD, modélisation PK/PD translationnelle et toxicologie, plutôt que s'appuyer sur une seule règle.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La dose de départ FIH s'extrapole de l'animal et de la pharmacologie, sans donnée humaine.
- NOAEL → HED (allométrie) → MRSD (facteurs de sécurité).
- MABEL/PAD : approche pharmacologique intégrant exposition, cible, puissance, PK/PD et incertitude.
- Pour les molécules très actives, intégrer MABEL/PAD et NOAEL prudemment plutôt que faire primer mécaniquement l'un sur l'autre.
<!-- /step -->

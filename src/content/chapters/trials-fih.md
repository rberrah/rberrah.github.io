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
quiz:
  - prompt: "L'approche MABEL fonde la dose de départ sur..."
    options:
      - "le plus faible niveau d'effet biologique anticipé (pharmacologie)"
      - "la dose maximale tolérée"
      - "le poids du patient"
    correct: 0
  - prompt: "Le NOAEL provient..."
    options:
      - "des études de toxicologie animale (dose sans effet indésirable observé)"
      - "d'un essai de phase III"
      - "du dossier de fabrication"
    correct: 0
  - prompt: "Pour les molécules très actives (agonistes immunitaires), on privilégie..."
    options:
      - "MABEL plutôt que NOAEL, plus prudent"
      - "la dose la plus élevée possible"
      - "aucune modélisation"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
La toute première dose chez l'homme se joue **sans donnée humaine** : il faut extrapoler depuis l'animal et la pharmacologie. Une dose trop forte est dangereuse (l'affaire **TGN1412** l'a montré), trop faible retarde le développement.

La pharmacométrie fournit un cadre rationnel : NOAEL, MRSD et surtout **MABEL**.
<!-- /step -->

<!-- step:title="Intuition" viz="EmaxHill" -->
Deux philosophies. La **toxicologie** part du haut : la plus forte dose **sans effet indésirable** chez l'animal (NOAEL), qu'on divise par des marges de sécurité.

La **pharmacologie** part du bas : la plus faible dose produisant un **effet biologique** détectable (MABEL). Pour une molécule très active, cette seconde voie est bien plus prudente.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="EmaxHill" -->
Du **NOAEL** animal, on dérive la dose humaine maximale de départ (MRSD) par mise à l'échelle allométrique et facteurs de sécurité :

$$ \text{HED} = \text{NOAEL}\times\left(\frac{W_{animal}}{W_{humain}}\right)^{0{,}33},\qquad \text{MRSD} = \frac{\text{HED}}{\text{facteur de sécurité}} $$

Le **MABEL** s'appuie sur la **relation exposition–occupation de la cible** (souvent un Emax) : on choisit une dose donnant une occupation faible (ex. 10 %), en intégrant affinité, puissance in vitro et PK/PD.

:::note
Réf. : FDA *Guidance for Estimating the Maximum Safe Starting Dose* (2005) ; EMA *Guideline on first-in-human clinical trials* (révisée 2017, après TGN1412).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="EmaxHill" -->
Pour un **agoniste immunitaire**, le NOAEL peut donner une dose de départ dangereusement active chez l'homme (espèces peu prédictives). Le **MABEL**, calé sur l'occupation du récepteur, propose une dose bien plus basse — le bon choix.

On retient en général la dose la plus **conservatrice** entre les approches.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le NOAEL n'est pas toujours protecteur.

:::pitfall
Pour les biothérapies **très puissantes** ou aux mécanismes absents chez l'animal, le NOAEL peut fortement **sous-estimer** le risque humain. C'est la leçon de TGN1412 : privilégier le MABEL et la modélisation PK/PD translationnelle, pas la seule toxicologie.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La dose de départ FIH s'extrapole de l'animal et de la pharmacologie, sans donnée humaine.
- NOAEL → HED (allométrie) → MRSD (facteurs de sécurité).
- MABEL : plus faible dose à effet biologique, fondée sur l'exposition–occupation (Emax).
- Pour les molécules très actives, MABEL prime sur NOAEL (leçon TGN1412).
<!-- /step -->

---
id: "tools-estimation"
slug: "tools-estimation"
title: "Les moteurs d'estimation"
description: "NONMEM, Monolix, nlmixr2 : ajuster un modèle NLME aux données, entre FOCE et SAEM."
summary: "Comparer les moteurs d'estimation de population : algorithmes (FOCE-I, SAEM), langages et écosystèmes."
track: "tools"
order: 201
duration: "12 min"
level: "intermediate"
tags: ["tools", "nonmem", "monolix", "nlmixr2", "estimation"]
prerequisites: ["tools-overview", "outils-estimation"]
glossary: ["NONMEM", "Monolix", "SAEM", "FOCE-I", "OFV"]
slides: []
quiz:
  - prompt: "NONMEM est historiquement..."
    options:
      - "la référence de l'estimation de population (fichiers de contrôle, FOCE/SAEM)"
      - "un tableur"
      - "un outil de dessin moléculaire"
    correct: 0
  - prompt: "nlmixr2 se distingue surtout par..."
    options:
      - "son caractère open-source, en R (SAEM/FOCEI)"
      - "l'absence de tout algorithme"
      - "l'impossibilité de simuler"
    correct: 0
  - prompt: "SAEM et FOCE-I sont deux..."
    options:
      - "algorithmes d'estimation du maximum de vraisemblance"
      - "types de dose"
      - "unités de concentration"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Le cœur d'un projet PopPK est l'**estimation** : trouver les paramètres de population qui expliquent le mieux les données. Trois moteurs dominent — **NONMEM**, **Monolix**, **nlmixr2** — avec des algorithmes et des philosophies différents.

Savoir ce qu'ils partagent et ce qui les distingue évite bien des surprises.
<!-- /step -->

<!-- step:title="Intuition" viz="16_SAEMCycle" -->
Tous cherchent la même chose : minimiser la **fonction objective** (−2 log-vraisemblance). Ils diffèrent par la **façon** d'y parvenir.

Deux grandes familles : la **linéarisation** (FOCE-I, rapide, mais approximative) et l'**échantillonnage stochastique** (**SAEM**, robuste sur les modèles difficiles).
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="15_OFVGame" -->
Le critère commun :

$$ OFV = -2\log L $$

- **NONMEM** (ICON) : la **référence** historique et réglementaire. Fichiers de contrôle, FOCE-I et SAEM. Puissant mais austère.
- **Monolix** (Lixoft / Simulations Plus) : **SAEM** avec une **interface graphique** et des diagnostics intégrés.
- **nlmixr2** (open-source, **R**) : SAEM et FOCEI en R, s'intègre à rxode2/mrgsolve et à tout l'écosystème R.

:::note
Les résultats doivent être **cohérents** entre moteurs, mais l'OFV n'est comparable qu'à **méthode identique** (FOCE-I ≠ SAEM). Réf. et liens : « Pour aller plus loin ».
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="15_OFVGame" -->
Sur un modèle simple, FOCE-I et SAEM convergent vers les mêmes estimations. Sur un modèle **difficile** (forte non-linéarité, données éparses), FOCE-I peut échouer là où le **SAEM** reste robuste — d'où sa popularité croissante.

Beaucoup d'équipes prototypent en **nlmixr2** (gratuit, R) puis confirment en NONMEM pour le dossier réglementaire.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Un OFV plus bas n'est pas toujours comparable.

:::pitfall
Comparer l'OFV entre **méthodes différentes** (FOCE-I vs SAEM) ou entre **jeux de données différents** n'a pas de sens. Et la **convergence** (minimisation réussie, matrice de covariance obtenue) ne dit rien de la **justesse** : les diagnostics restent obligatoires.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- NONMEM : référence historique/réglementaire ; Monolix : SAEM + interface ; nlmixr2 : open-source R.
- Deux familles d'algorithmes : linéarisation (FOCE-I) et stochastique (SAEM, robuste).
- Tous minimisent l'OFV (−2 log L) ; OFV comparable seulement à méthode et données identiques.
- Convergence ≠ bon modèle ; prototypage possible en nlmixr2, confirmation en NONMEM.
<!-- /step -->

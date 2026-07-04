---
id: "tools-overview"
slug: "tools-overview"
title: "L'écosystème des outils"
description: "Estimer, simuler, individualiser : quel logiciel pour quelle tâche (NONMEM, Monolix, nlmixr2, mrgsolve, mapbayr)."
summary: "La carte des outils de pharmacométrie : moteurs d'estimation, simulateurs et outils de TDM bayésien."
track: "tools"
order: 200
duration: "12 min"
level: "intermediate"
tags: ["tools", "software", "ecosystem"]
prerequisites: ["outils-estimation"]
glossary: ["NONMEM", "Monolix", "nlmixr2 / rxode2", "mrgsolve", "SAEM"]
slides: []
quiz:
  - prompt: "Pour AJUSTER un modèle de population à des données, on utilise un..."
    options:
      - "moteur d'estimation (NONMEM, Monolix, nlmixr2)"
      - "tableur uniquement"
      - "outil de dessin"
    correct: 0
  - prompt: "Pour SIMULER rapidement de nombreux profils (VPC, essais), on privilégie..."
    options:
      - "mrgsolve ou rxode2 (R)"
      - "un logiciel de traitement de texte"
      - "aucun outil"
    correct: 0
  - prompt: "mapbayr (R) sert surtout à..."
    options:
      - "l'estimation bayésienne (MAP) pour l'ajustement de dose individuel"
      - "dessiner des molécules"
      - "gérer la comptabilité"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
La pharmacométrie s'appuie sur des **logiciels**. Choisir le bon pour la bonne tâche fait gagner un temps précieux — et évite des erreurs.

Ce chapitre dresse la **carte** : à chaque grande tâche (estimer, simuler, individualiser) correspond une famille d'outils.
<!-- /step -->

<!-- step:title="Intuition" viz="16_SAEMCycle" -->
Trois grandes tâches structurent un projet :

- **Estimer** : ajuster un modèle à effets mixtes (NLME) à des données ;
- **Simuler** : générer des profils, des VPC, des essais virtuels ;
- **Individualiser** : estimer les paramètres d'un patient et ajuster sa dose (TDM/MIPD).

Chaque outil excelle sur l'une d'elles.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="16_SAEMCycle" -->
La carte des outils :

- **Estimation** — **NONMEM** (référence historique, FOCE/SAEM, fichiers de contrôle), **Monolix** (SAEM, interface graphique), **nlmixr2** (open-source en **R**, SAEM/FOCEI).
- **Simulation** — **mrgsolve** et **rxode2** (en **R**, très rapides pour les ODE et les grandes populations).
- **TDM / MIPD** — **mapbayr** (**R**, estimation **MAP** bayésienne à partir d'un modèle mrgsolve), plus des plateformes cliniques dédiées.

:::note
Langages : NONMEM (fichiers `.ctl/.mod`), R (nlmixr2, mrgsolve, rxode2, mapbayr). Open-source (nlmixr2, mrgsolve, mapbayr) vs commercial (NONMEM, Monolix). Liens dans « Pour aller plus loin ».
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="16_SAEMCycle" -->
Un projet type enchaîne les outils : **estimer** le modèle PopPK (NONMEM, Monolix ou nlmixr2) → **simuler** la VPC et des scénarios de dose (mrgsolve) → déployer le **TDM bayésien** au lit du patient (mapbayr).

Beaucoup d'équipes combinent : un moteur d'estimation **et** l'écosystème R pour la simulation et les graphiques.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
L'outil ne fait pas la science.

:::pitfall
Un logiciel qui **converge** ne garantit pas un **bon modèle** : les diagnostics restent indispensables. Attention aussi aux **différences de méthode** (FOCE-I vs SAEM) qui changent l'OFV, et à la **reproductibilité** (versions, graines aléatoires). L'outil est un moyen, pas une preuve.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Trois tâches : estimer (NONMEM/Monolix/nlmixr2), simuler (mrgsolve/rxode2), individualiser (mapbayr).
- Open-source (R) vs commercial ; on combine souvent plusieurs outils.
- Convergence ≠ bon modèle ; toujours diagnostiquer et documenter les versions.
- Le choix dépend de la tâche, de l'équipe et des contraintes (réglementaire, coût).
<!-- /step -->

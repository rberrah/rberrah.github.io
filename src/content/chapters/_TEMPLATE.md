---
# ─────────────────────────────────────────────────────────────────────────────
# MODÈLE DE CHAPITRE — copiez ce fichier sous un nouveau nom, ex.
#   src/content/chapters/22_mon-sujet.md
# Le préfixe « _ » de _TEMPLATE.md le fait ignorer par le build : ce fichier
# n'apparaît jamais sur le site tant qu'il commence par « _ ».
#
# RIEN D'AUTRE À FAIRE : la visualisation et l'URL de prerender sont détectées
# automatiquement. Pas de vizMap à éditer, pas de svelte.config.js à toucher.
# ─────────────────────────────────────────────────────────────────────────────
id: "mon-sujet"                 # identifiant unique
slug: "mon-sujet"               # devient l'URL /chapitres/mon-sujet/
title: "Titre lisible du chapitre"
description: "Une phrase qui donne l'angle et l'enjeu du chapitre."
order: 22                       # position dans la liste (ordre croissant)
tags: ["pk"]                    # étiquettes libres
slides: []                      # IDs de slides du catalogue (optionnel)
quiz:                           # checkpoint de fin (optionnel)
  - prompt: "Une question de compréhension ?"
    options: ["Réponse A", "Réponse B", "Réponse C"]
    correct: 1                  # index base 0 de la bonne réponse
---

<!--
  STRUCTURE D'UN BON CHAPITRE (viser la qualité du chapitre 01)
  Chaque `step` = une idée. Pour chaque idée, dérouler :
    1) l'INTUITION en clair, 2) l'ÉQUATION en KaTeX, 3) un PIÈGE, 4) l'ENJEU clinique.
  `viz="<clé>"` = nom (ou alias) d'un composant de
     src/lib/components/visualizations/  — ex. 09_PK1C, IVBolus, ThreeApproaches…
  Une viz posée sur un step reste affichée tant qu'un step suivant n'en impose
  pas une autre : on peut donc commenter longuement une même figure.
-->

<!-- step:title="L'intuition d'abord" viz="09_PK1C" -->
Commencez par l'image mentale, sans équation. Que voit-on bouger ? Pourquoi
est-ce important ? Le lecteur doit comprendre *l'histoire* avant les symboles.

:::key
Une phrase à retenir absolument de cette étape.
:::
<!-- /step -->

<!-- step:title="La formule, décortiquée" viz="09_PK1C" -->
Introduisez l'équation, puis lisez-la terme par terme :

$$ C(t) = \frac{\text{Dose}}{V}\, e^{-\frac{CL}{V}\,t} $$

- $CL/V$ fixe la vitesse de décroissance,
- $\text{Dose}/V$ fixe le point de départ.

:::math
Détail plus technique optionnel pour les lecteurs avancés.
:::
<!-- /step -->

<!-- step:title="Le piège classique" -->
Un step sans `viz` conserve la figure précédente. Idéal pour approfondir.

:::pitfall
L'erreur que tout le monde fait ici, et comment la reconnaître.
:::

:::clinical
Pourquoi cela change quelque chose au lit du patient.
:::
<!-- /step -->

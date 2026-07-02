---
# ─────────────────────────────────────────────────────────────────────────────
# MODÈLE DE CHAPITRE — copiez ce fichier sous un nouveau nom, ex.
#   src/content/chapters/13_mon-sujet.md
# Le préfixe « _ » fait ignorer ce fichier par le build et la validation :
# il n'apparaît jamais sur le site tant qu'il commence par « _ ».
#
# RIEN D'AUTRE À CONFIGURER : la visualisation (viz="…") et l'URL de prerender
# sont détectées automatiquement (voir vizRegistry.js et [slug]/+page.js).
#
# La langue PRINCIPALE est le français : ce fichier est en français.
# Traduction anglaise optionnelle : src/content/chapters/en/<slug>.md (même slug).
# ─────────────────────────────────────────────────────────────────────────────
id: "mon-sujet"                 # identifiant unique
slug: "mon-sujet"               # devient l'URL /chapitres/mon-sujet/
title: "Titre lisible du chapitre"
description: "Une phrase qui donne l'angle et l'enjeu du chapitre."
summary: "Résumé court affiché dans les listes de chapitres."
track: "core"                   # "core" (fondamentaux) ou "ai" (IA)
order: 13                       # position dans la liste (ordre croissant)
duration: "12 min"
level: "beginner"               # beginner | intermediate | advanced
tags: ["pk"]                    # étiquettes libres (liste non vide)
slides: []                      # IDs de slides du catalogue (optionnel)
quiz:                           # checkpoint de fin (obligatoire, >= 1 question)
  - prompt: "Une question de compréhension ?"
    options: ["Réponse A", "Réponse B", "Réponse C"]
    correct: 1                  # index base 0 de la bonne réponse
---

<!--
  SQUELETTE PÉDAGOGIQUE CANONIQUE (validé automatiquement).
  Conservez ces 6 titres d'étape — l'ordre raconte : motivation → intuition →
  formule → exemple → piège → synthèse. Ajoutez des étapes intermédiaires libres.

  RÈGLES :
  - Les titres d'étape ne contiennent NI apostrophe NI guillemet (le parseur
    `title="…"` s'arrête au premier ' ou "). Utilisez-les seulement dans le corps.
  - `viz="<clé>"` = nom (ou alias) d'un composant de
    src/lib/components/visualizations/ — ex. 09_PK1C, IVBolus, ThreeApproaches…
  - Une viz posée sur une étape reste affichée tant qu'une étape suivante n'en
    impose pas une autre : on peut commenter longuement la même figure.
  - Encadrés : :::key  :::pitfall  :::clinical  :::math  :::note … :::
-->

<!-- step:title="Pourquoi ce chapitre" -->
Partez d'un problème clinique ou d'une observation concrète. Pourquoi ce sujet
compte-t-il pour prescrire, interpréter une concentration ou décider ?
<!-- /step -->

<!-- step:title="Intuition" viz="09_PK1C" -->
L'image mentale, sans équation. Que voit-on bouger ? Le lecteur doit comprendre
l'histoire avant les symboles.

:::key
La phrase à retenir absolument de cette étape.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="09_PK1C" -->
Introduisez l'équation, puis lisez-la terme par terme :

$$ C(t) = \frac{\text{Dose}}{V}\, e^{-\frac{CL}{V}\,t} $$

- $CL/V$ fixe la vitesse de décroissance,
- $\text{Dose}/V$ fixe le point de départ.

:::math
Détail plus technique, optionnel, pour les lecteurs avancés.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="09_PK1C" -->
Un cas chiffré ou une manipulation guidée de la figure. « Faites varier CL :
la courbe descend plus vite, la demi-vie raccourcit. »
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Une étape sans `viz` conserve la figure précédente : idéale pour approfondir.

:::pitfall
L'erreur que tout le monde fait ici, et comment la reconnaître.
:::

:::clinical
Pourquoi cela change quelque chose au lit du patient — sans conseil posologique.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Point clé 1.
- Point clé 2.
- Point clé 3.
<!-- /step -->

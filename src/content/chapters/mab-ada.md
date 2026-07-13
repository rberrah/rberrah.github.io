---
id: "mab-ada"
slug: "mab-ada"
title: "Immunogénicité : les anticorps anti-médicament (ADA)"
description: "Quand le système immunitaire attaque le médicament : formation d'ADA, impact sur la PK et l'efficacité."
summary: "Les ADA (anti-drug antibodies) : mécanisme, effet sur la clairance, neutralisation et modélisation."
track: "mab"
order: 52
duration: "12 min"
level: "advanced"
tags: ["mab", "ada", "immunogenicity", "neutralizing"]
slides: []
sources: ["ryman-meibohm", "holford-clearance"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Les ADA (anti-drug antibodies) sont..."
    options:
      - "des anticorps du patient dirigés contre le médicament biologique"
      - "une forme du médicament"
      - "des métabolites inactifs"
    correct: 0
  - prompt: "L'apparition d'ADA tend souvent à..."
    options:
      - "augmenter la clairance et réduire l'exposition"
      - "diminuer la clairance"
      - "n'avoir aucun effet"
    correct: 0
  - prompt: "Un ADA dit 'neutralisant' (NAb)..."
    options:
      - "bloque directement l'activité du médicament (site de liaison)"
      - "augmente l'effet du médicament"
      - "est toujours sans conséquence"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Un anticorps thérapeutique est une **protéine étrangère** : le système immunitaire du patient peut fabriquer des **anticorps anti-médicament** (ADA). C'est l'**immunogénicité**.

Elle peut réduire l'exposition, la durée d'effet, voire provoquer des réactions — un enjeu majeur pour toutes les biothérapies.
<!-- /step -->

<!-- step:title="Intuition" viz="55_ADA" -->
Après quelques administrations, certains patients développent des ADA qui **se lient** au médicament. Les complexes formés sont **éliminés plus vite** → la concentration chute chez ces patients.

Résultat typique : une PK qui « décroche » après quelques semaines, avec une forte **variabilité inter-individuelle**.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="55_ADA" -->
On distingue deux types d'ADA :

- **Liants (binding)** : forment des complexes → accélèrent la **clairance** (exposition ↓).
- **Neutralisants (NAb)** : bloquent en plus le **site actif** → l'effet chute même à concentration égale.

Une modélisation simple augmente la clairance après séroconversion :

$$ CL(t) = CL_0\,\big[1 + \theta_{ADA}\cdot A(t)\big] $$

où $A(t)$ traduit l'apparition (souvent retardée) des ADA.

:::note
Réf. : recommandations EMA/FDA sur l'évaluation de l'immunogénicité ; revues PK des anticorps (Ryman & Meibohm 2017). À rapprocher des chapitres « PK des anticorps » et « TMDD ».
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="55_ADA" -->
Un patient sous anticorps voit sa concentration résiduelle **s'effondrer** au 3ᵉ mois : dosage des ADA positif. L'exposition insuffisante explique la **perte de réponse** (échappement secondaire).

Stratégies : co-immunosuppression, schémas d'induction, ingénierie de la molécule (déimmunisation) pour réduire l'immunogénicité.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Un dosage d'ADA négatif n'exclut pas tout.

:::pitfall
Les tests d'ADA sont **gênés par le médicament** présent (interférence) : un fort taux circulant peut **masquer** les ADA (faux négatifs). L'interprétation dépend du moment du prélèvement et de la sensibilité du test. Une baisse d'exposition inexpliquée doit faire évoquer l'immunogénicité même si le test est négatif.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Les ADA sont des anticorps du patient contre le médicament biologique (immunogénicité).
- Liants → clairance ↑, exposition ↓ ; neutralisants → effet bloqué en plus.
- Modélisation : clairance augmentée après séroconversion, forte variabilité.
- Tests d'ADA sujets à interférence (faux négatifs) ; suspecter devant une baisse d'exposition.
<!-- /step -->

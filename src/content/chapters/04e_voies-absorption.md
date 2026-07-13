---
id: "voies-absorption"
slug: "voies-absorption"
title: "Les voies d'absorption"
description: "IV, orale, sous-cutanée, transdermique, inhalée : chaque voie façonne la courbe et la biodisponibilité."
summary: "Panorama des voies d'administration et de leurs conséquences PK : vitesse d'absorption, premier passage, biodisponibilité."
track: "core"
order: 4.2
duration: "12 min"
level: "beginner"
tags: ["absorption", "route", "bioavailability", "first-pass"]
prerequisites: ["absorption-orale"]
glossary: ["F", "Ka", "Tlag", "Flip-flop", "Compartiments de transit"]
slides: []
sources: ["rowland-tozer", "gibaldi-perrier", "ryman-meibohm"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Par voie intraveineuse (IV), la biodisponibilité F vaut..."
    options:
      - "1 (toute la dose atteint la circulation, pas d'absorption)"
      - "toujours 0,5"
      - "0 (rien n'atteint le sang)"
    correct: 0
  - prompt: "La voie sublinguale/buccale est intéressante car elle..."
    options:
      - "contourne le premier passage hépatique"
      - "ralentit toujours l'absorption"
      - "augmente la clairance rénale"
    correct: 0
  - prompt: "Un patch transdermique produit typiquement une absorption..."
    options:
      - "d'ordre 0 (débit constant, comme une perfusion lente)"
      - "instantanée"
      - "nulle"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
La même molécule, administrée par des **voies** différentes, donne des courbes très différentes. La voie fixe **combien** atteint le sang (biodisponibilité $F$), **à quelle vitesse** (absorption), et si le médicament subit un **premier passage** hépatique.

Choisir la voie, c'est déjà faire de la pharmacocinétique.
<!-- /step -->

<!-- step:title="Intuition" viz="OralAbsorption" -->
La voie **IV** court-circuite l'absorption : toute la dose est dans le sang, tout de suite ($F=1$). Toute autre voie doit d'abord **absorber**, ce qui étale et retarde le pic.

Plus l'absorption est lente, plus le pic est bas et tardif ; certaines voies (patch) imposent un débit **constant**.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="OralAbsorption" -->
La biodisponibilité orale se factorise :

$$ F = f_a \cdot F_g \cdot F_h $$

- $f_a$ : fraction absorbée ; $F_g$ : échappant au métabolisme intestinal ; $F_h = 1 - E_h$ : échappant au **premier passage** hépatique.

Le tableau des voies :

- **IV** : $F=1$, pas d'absorption ni de premier passage — référence.
- **Orale** : absorption d'ordre 1 ($k_a$), premier passage possible → $F$ souvent < 1.
- **Sous-cutanée / IM** : absorption lente (lymphatique pour les grosses protéines), $F$ variable.
- **Sublinguale / buccale / rectale (basse)** : **contournent** en partie le premier passage.
- **Transdermique (patch)** : absorption d'**ordre 0** (débit constant).
- **Inhalée** : rapide, effet local, absorption systémique partielle.

:::note
Réf. : cadre BCS (solubilité/perméabilité) et modèles d'absorption (voir aussi le chapitre PBPK sur l'absorption).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="Infusion" -->
La **trinitrine** en **sublingual** agit en minutes car elle évite le premier passage (qui la détruirait per os). Un **patch** de fentanyl libère à **débit constant** (ordre 0), comme une perfusion lente — d'où un plateau prolongé.

Un **anticorps** en **sous-cutané** met des jours à être absorbé (voie lymphatique), avec $F$ ≈ 50–80 %.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Une absorption lente peut masquer l'élimination.

:::pitfall
Si l'absorption est plus lente que l'élimination ($k_a < k_e$), la **pente terminale** reflète l'**absorption**, pas l'élimination : c'est le **flip-flop** (fréquent en SC, patch, formes retard). On croit alors mesurer une demi-vie d'élimination alors qu'on lit la vitesse d'absorption.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La voie fixe F (combien), la vitesse d'absorption (quand) et le premier passage.
- IV : F = 1, référence. Orale : F = fa·Fg·Fh, premier passage possible.
- Sublinguale/rectale basse contournent le premier passage ; patch = ordre 0 ; SC = lent (lymphatique).
- Attention au flip-flop : ka < ke ⇒ la pente terminale reflète l'absorption.
<!-- /step -->

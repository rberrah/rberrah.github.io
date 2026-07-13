---
id: "pd-tolerance"
slug: "pd-tolerance"
title: "Tolérance, rebond et modèles précurseur"
description: "Quand l'effet s'épuise ou rebondit : tolérance, modèles à médiateur antagoniste et pool de précurseurs."
summary: "Modéliser la tolérance (effet décroissant), le rebond à l'arrêt et l'épuisement d'un pool de précurseurs."
track: "pd"
order: 63
duration: "12 min"
level: "advanced"
tags: ["pharmacodynamics", "tolerance", "rebound", "precursor"]
slides: []
sources: ["jusko-ko-indirect", "dayneka-jusko-indirect", "gabrielsson-weiner"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "La tolérance pharmacodynamique se traduit par..."
    options:
      - "un effet qui diminue au cours d'une exposition constante"
      - "un effet qui augmente indéfiniment"
      - "une PK modifiée"
    correct: 0
  - prompt: "Un rebond à l'arrêt du traitement s'explique souvent par..."
    options:
      - "un contre-régulateur qui a monté pendant le traitement"
      - "une erreur de dosage"
      - "un volume trop faible"
    correct: 0
  - prompt: "Un modèle à pool de précurseurs peut produire..."
    options:
      - "un épuisement puis une récupération de la réponse"
      - "un effet strictement linéaire"
      - "aucune dynamique"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Certains effets **s'atténuent** au fil du temps malgré une concentration maintenue (**tolérance**), ou **rebondissent** à l'arrêt. Un modèle Emax statique ne peut pas le décrire.

Il faut des modèles **dynamiques** : contre-régulation, médiateur antagoniste, pool de précurseurs.
<!-- /step -->

<!-- step:title="Intuition" viz="57_Tolerance" -->
L'organisme **s'adapte** : face à un stimulus prolongé, un mécanisme opposé se met en place et **atténue** l'effet. Quand on arrête, ce contre-régulateur, encore élevé, provoque un **rebond**.

C'est une histoire de deux processus en compétition, avec des vitesses différentes.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="57_Tolerance" -->
Un modèle de **tolérance à médiateur** couple la réponse $R$ et un modérateur $M$ qui la freine :

$$ \frac{dR}{dt} = k_{in}\,[1 + f(C)] - k_{out}\,M\,R, \qquad \frac{dM}{dt} = k_{tol}\,(R - M) $$

Le modérateur $M$ **monte lentement** et éteint peu à peu l'effet. À l'arrêt, $M$ reste haut → **rebond** sous la ligne de base.

Les modèles à **pool de précurseurs** (stock limité qui se vide puis se reconstitue) produisent un profil d'épuisement/récupération.

:::math
Le rapport des vitesses $k_{tol}/k_{out}$ fixe l'ampleur de la tolérance et la profondeur du rebond.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="57_Tolerance" -->
Les **dérivés nitrés** (angine) : leur effet vasodilatateur s'émousse en continu — d'où la nécessité d'un **intervalle libre** quotidien pour restaurer la sensibilité.

Un bêta-bloquant arrêté brutalement peut donner un **rebond** tensionnel/rythmique, car les récepteurs se sont sur-régulés.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Ne pas confondre tolérance PD et baisse d'exposition.

:::pitfall
Un effet qui diminue peut venir d'une **tolérance** (PD) ou d'une **auto-induction** du métabolisme (PK, l'exposition baisse). Les distinguer exige de regarder les **concentrations** : si elles sont stables mais l'effet baisse, c'est de la tolérance.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La tolérance = effet décroissant sous exposition constante (contre-régulation).
- Modèle à médiateur : un modérateur M monte lentement et éteint l'effet ; rebond à l'arrêt.
- Les modèles à pool de précurseurs produisent épuisement puis récupération.
- Distinguer tolérance (PD) d'une auto-induction (PK) en regardant les concentrations.
<!-- /step -->

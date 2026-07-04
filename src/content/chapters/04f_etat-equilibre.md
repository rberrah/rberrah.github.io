---
id: "etat-equilibre"
slug: "etat-equilibre"
title: "L'état d'équilibre (steady state)"
description: "Quand ce qui entre égale ce qui sort : Css, temps pour l'atteindre, accumulation et dose de charge."
summary: "Le principe de l'état d'équilibre : Css = débit/CL, temps ≈ 4–5 demi-vies, accumulation et superposition."
track: "core"
order: 4.6
duration: "12 min"
level: "intermediate"
tags: ["steady-state", "css", "accumulation", "loading-dose"]
prerequisites: ["doses-repetees", "perfusion"]
glossary: ["CL", "t½", "ke", "AUC"]
slides: []
quiz:
  - prompt: "À l'état d'équilibre, la concentration moyenne Css dépend de..."
    options:
      - "le débit de dose et la clairance (Css = débit / CL)"
      - "le volume uniquement"
      - "la couleur du médicament"
    correct: 0
  - prompt: "Le temps pour atteindre l'état d'équilibre dépend surtout de..."
    options:
      - "la demi-vie (~4–5 t½), pas de la dose ni du débit"
      - "la dose administrée"
      - "le volume de distribution seul"
    correct: 0
  - prompt: "Une dose de charge sert à..."
    options:
      - "atteindre tout de suite le niveau d'équilibre visé"
      - "changer la clairance"
      - "diminuer la Css"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
En traitement chronique, la concentration ne monte pas indéfiniment : elle se stabilise à un **plateau**, l'**état d'équilibre** (steady state). C'est là qu'on veut être — dans la fenêtre thérapeutique.

Comprendre ce qui fixe le **niveau** du plateau et le **temps** pour l'atteindre est la base de toute posologie.
<!-- /step -->

<!-- step:title="Intuition" viz="MultiDose" -->
À chaque dose, il reste un peu de la précédente : le médicament **s'accumule**. Mais plus la concentration monte, plus l'élimination (proportionnelle à la concentration) augmente — jusqu'à ce que **ce qui sort égale ce qui entre**. Le niveau se stabilise.

Ce plateau est atteint après quelques demi-vies, **quel que soit** le débit de dose.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="MultiDose" -->
Le niveau d'équilibre est fixé par le **débit de dose** et la **clairance** :

$$ C_{ss,moy} = \frac{\text{Dose}/\tau}{CL} = \frac{F\cdot\text{Dose}}{CL\cdot\tau} \qquad (\text{perfusion : } C_{ss} = R_0/CL) $$

Le **temps** pour l'atteindre ne dépend que de la demi-vie (≈ **4–5 t½**), pas de la dose. L'**accumulation** vaut :

$$ R_{ac} = \frac{1}{1 - e^{-k_e\tau}} $$

:::howto
**La métaphore de l'évier.** Le robinet (débit de dose) remplit ; la bonde (clairance) vide. Le **niveau** d'équilibre dépend du rapport robinet/bonde — pas de la vitesse à laquelle on ouvre. Le **temps** de remplissage dépend de la taille de la bonde (la demi-vie).

**Côté maths.** Doubler la dose **double** la Css sans changer le temps d'atteinte. Une **dose de charge** = $C_{ss}\cdot V$ remplit l'évier d'un coup ; l'entretien maintient le niveau.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="Infusion" -->
On vise une Css de 10 mg/L, CL = 2 L/h → il faut un débit $R_0 = C_{ss}\cdot CL = 20$ mg/h (perfusion) ou l'équivalent en doses répétées.

Si la demi-vie est de 12 h, l'équilibre n'est atteint qu'après ~2–3 jours : d'où une **dose de charge** si l'on veut être efficace tout de suite.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Augmenter la dose n'accélère pas l'équilibre.

:::pitfall
Une erreur classique : croire qu'une dose plus forte atteint l'équilibre plus vite. Elle atteint un **plateau plus haut**, au **même** rythme (~4–5 t½). Et le principe de **superposition** (Css ∝ dose) ne tient qu'en cinétique **linéaire** : sous saturation (Michaelis-Menten, TMDD), l'accumulation devient imprévisible.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- L'état d'équilibre = ce qui entre égale ce qui sort ; la concentration se stabilise.
- Niveau : Css = (débit de dose)/CL ; Css ∝ dose (cinétique linéaire).
- Temps : ~4–5 demi-vies, indépendant de la dose et du débit.
- Dose de charge = Css·V pour atteindre le plateau tout de suite ; superposition seulement si linéaire.
<!-- /step -->

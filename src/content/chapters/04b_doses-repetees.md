---
id: "doses-repetees"
slug: "doses-repetees"
title: "Doses répétées et état d'équilibre"
description: "Accumulation, concentration à l'équilibre (Css), temps pour l'atteindre et dose de charge — en doses répétées comme en perfusion."
summary: "Ce qui se passe quand on répète les doses : accumulation, plateau, intervalle, dose de charge — et le cas de la perfusion continue."
track: "core"
order: 4.5
duration: "14 min"
level: "beginner"
tags: ["steady-state", "css", "accumulation", "loading-dose", "dosing"]
glossary: ["CL", "t½", "ke"]
slides: ["s12"]
sources: ["rowland-tozer", "holford-clearance", "gibaldi-perrier"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "La concentration moyenne à l'équilibre vaut..."
    options:
      - "Dose / (CL · τ)"
      - "Dose · CL · τ"
      - "Dose / (V · τ)"
    correct: 0
  - prompt: "Le temps pour atteindre l'état d'équilibre dépend surtout de..."
    options:
      - "la demi-vie d'élimination"
      - "la dose administrée à chaque prise"
      - "le débit de perfusion utilisé"
    correct: 0
  - prompt: "En perfusion continue, la concentration à l'équilibre vaut..."
    options:
      - "le débit de perfusion divisé par la clairance"
      - "le débit de perfusion multiplié par le volume"
      - "la dose divisée par la demi-vie d'élimination"
    correct: 0
  - prompt: "Une dose de charge sert à..."
    options:
      - "atteindre plus vite la zone thérapeutique"
      - "abaisser la Css finale à l'état d'équilibre"
      - "raccourcir la demi-vie d'élimination"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s12" -->
Une seule dose est rarement suffisante : on **répète** l'administration (ou l'on perfuse en continu) pour maintenir la concentration dans la fenêtre thérapeutique.

Mais répéter n'est pas anodin : tant qu'on redose **avant** élimination complète, le médicament **s'accumule** — jusqu'à un plateau. Comprendre ce qui fixe le **niveau** de ce plateau et le **temps** pour l'atteindre, c'est la base de toute posologie.
<!-- /step -->

<!-- step:title="Intuition" slides="s12" viz="MultiDose" -->
Reprenez l'image du réservoir : chaque dose le remplit d'un coup, et il se vide entre deux prises.

Si on redose **avant** qu'il soit vide, le niveau moyen **monte**. Mais plus la concentration monte, plus l'élimination (proportionnelle à la concentration) s'accélère — jusqu'à ce que **ce qui sort égale ce qui entre**. Le niveau se stabilise : c'est l'**état d'équilibre** (steady state).

:::key
Faites varier l'intervalle $\tau$ : plus il est court devant la demi-vie, plus l'accumulation est forte. Et ce plateau est atteint après quelques demi-vies, **quel que soit** le débit de dose.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s12" viz="MultiDose" -->
La **concentration moyenne à l'équilibre** ne dépend que de la clairance et du débit de dose :

$$ C_{ss,\text{moy}} = \frac{F\cdot\text{Dose}}{CL \cdot \tau} \qquad\text{et, en perfusion continue :}\qquad C_{ss} = \frac{R_0}{CL} $$

Le **ratio d'accumulation** (bolus IV) mesure l'empilement :

$$ R_{ac} = \frac{1}{1 - e^{-k_e \tau}} $$

Enfin, la **dose de charge** remplit le réservoir d'un coup :

$$ \text{Dose de charge} = C_{ss} \cdot V $$

:::howto
**La métaphore de l'évier.** Le robinet (débit de dose) remplit ; la bonde (clairance) vide. Le **niveau** d'équilibre dépend du rapport robinet/bonde — pas de la vitesse à laquelle on ouvre. Le **temps** de remplissage, lui, ne dépend que de la taille de la bonde (la demi-vie).

**Côté maths.** La fraction de l'équilibre atteinte après un temps $t$ suit une montée exponentielle miroir de la décroissance :

$$ f(t) = 1 - e^{-k_e\,t} = 1 - 2^{-\,t/t_{1/2}} $$

En comptant en demi-vies (avec $t = n\cdot t_{1/2}$, donc $f = 1 - 2^{-n}$) :

- **4 demi-vies** → $1 - 2^{-4} = $ **94 %**
- **5 demi-vies** → $1 - 2^{-5} = $ **97 %**
- **6 demi-vies** → $1 - 2^{-6} = $ **98,5 %**

En pratique, on considère l'équilibre « atteint » vers **4 à 5 demi-vies**. Ce temps ne dépend **que** de la demi-vie : doubler la dose **double** la Css sans changer le temps d'atteinte — la dose fixe le *niveau*, pas la *vitesse*.
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s12" viz="MultiDose" -->
Réduisez $\tau$ de moitié : la Css moyenne double et l'accumulation grimpe. Réduisez la clairance (insuffisance rénale) : même schéma, mais Css plus haute — risque de toxicité.

**En perfusion.** On vise une Css de 10 mg/L avec une clairance CL = 2 L/h. Il faut donc un débit :

$$ R_0 = C_{ss} \cdot CL = 10 \times 2 = 20 \text{ mg/h} $$

Si la demi-vie est de 12 h, l'équilibre n'est atteint qu'après ~4–5 t½, soit **2 à 3 jours**. D'où l'intérêt d'une **dose de charge** si l'on veut être dans la fenêtre tout de suite : cochez l'option et observez — le plateau final est inchangé, seule l'entrée est accélérée.
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s12" -->
Ne confondez pas le **niveau** de l'équilibre et le **temps** pour l'atteindre.

:::pitfall
Augmenter la dose monte la Css mais n'accélère **pas** l'arrivée à l'équilibre (toujours ~4–5 t½). Pour entrer plus vite dans la fenêtre : une **dose de charge**, pas une dose d'entretien plus forte.

Second piège : le principe de **superposition** (Css ∝ dose) ne tient qu'en cinétique **linéaire**. Sous saturation (Michaelis-Menten, TMDD), l'accumulation devient imprévisible et une hausse modeste de dose peut faire s'envoler la concentration.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Redoser avant élimination complète → accumulation jusqu'à un plateau : l'**état d'équilibre** (ce qui entre = ce qui sort).
- Niveau : $C_{ss,\text{moy}} = F\cdot\text{Dose}/(CL\cdot\tau)$ ; en perfusion $C_{ss} = R_0/CL$. La clairance et le débit de dose fixent le plateau.
- Temps : ≈ **4 à 5 demi-vies**, indépendant de la dose et du débit.
- **Dose de charge** = $C_{ss}\cdot V$ : elle accélère l'entrée dans la fenêtre sans changer le plateau final.
- La superposition (Css ∝ dose) suppose une cinétique **linéaire** ; sous saturation, tout se dérègle.
<!-- /step -->

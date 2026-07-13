---
id: "infectio-pkpd"
slug: "infectio-pkpd"
title: "Indices PK/PD des anti-infectieux"
description: "T>MIC, Cmax/MIC, AUC/MIC : la forme de l'exposition relative à la CMI décide de l'efficacité."
summary: "Les trois indices PK/PD des antibiotiques et la courbe de bactéricidie."
track: "infectio"
order: 40
duration: "13 min"
level: "intermediate"
tags: ["infectious-diseases", "pkpd-index", "mic", "antibiotics"]
slides: []
sources: ["craig-pkpd", "rybak-vanco", "eucast", "goutelle-hill"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Pour les bêta-lactamines, l'indice PK/PD prédictif d'efficacité est..."
    options:
      - "le temps passé au-dessus de la CMI (T>MIC)"
      - "le poids du patient"
      - "la couleur de la solution"
    correct: 0
  - prompt: "Un antibiotique concentration-dépendant (aminoside) est optimisé par..."
    options:
      - "un Cmax/MIC élevé (fortes doses espacées)"
      - "des doses faibles très fréquentes"
      - "une perfusion nulle"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Pour un antibiotique, l'efficacité ne dépend pas seulement de l'exposition totale, mais de la **forme** de la concentration par rapport à la **CMI** (concentration minimale inhibitrice) du germe.

Trois **indices PK/PD** résument cela — et guident le schéma d'administration.
<!-- /step -->

<!-- step:title="Intuition" viz="56_PKPDIndex" -->
Tracez la concentration au cours du temps et une ligne horizontale = la CMI.

Trois questions : **combien de temps** reste-t-on au-dessus de la CMI ? **Quelle hauteur** atteint le pic par rapport à la CMI ? **Quelle aire** au-dessus de la CMI ? Chaque famille d'antibiotiques privilégie l'une d'elles.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="56_PKPDIndex" -->
Les trois indices (Craig, 1998) :

- **T > CMI** (temps-dépendant) : bêta-lactamines. On l'optimise par des **perfusions prolongées/continues**.
- **Cmax / CMI** (concentration-dépendant) : aminosides, fluoroquinolones. On l'optimise par de **fortes doses espacées**.
- **AUC / CMI** : fluoroquinolones, glycopeptides (vancomycine : cible AUC₂₄/CMI ≥ 400).

$$ \%T_{>CMI}, \qquad \frac{C_{max}}{CMI}, \qquad \frac{AUC_{24}}{CMI} $$

:::note
Réf. : Craig W.A., *Clin Infect Dis* 1998 — cadre fondateur des indices PK/PD.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="EmaxHill" -->
La **courbe de bactéricidie** relie concentration et vitesse de destruction bactérienne — souvent un modèle **Emax** : au-delà d'un certain multiple de la CMI, tuer plus vite devient marginal.

Pour une bêta-lactamine, prolonger la perfusion augmente le **T>CMI** sans augmenter la dose totale.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
La CMI n'est pas une constante exacte.

:::pitfall
La CMI varie d'un germe à l'autre et par dilutions (facteur 2). Il faut aussi raisonner sur la **fraction libre** (seule active) et se méfier de l'**effet inoculum**. Un indice calculé sur la concentration totale peut surestimer l'efficacité.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- L'efficacité antibiotique dépend de la forme de l'exposition vs CMI.
- T>CMI (bêta-lactamines), Cmax/CMI (aminosides), AUC/CMI (fluoroquinolones, vancomycine).
- La bactéricidie suit souvent un Emax ; la fraction libre est ce qui compte.
- La CMI et l'inoculum introduisent de l'incertitude.
<!-- /step -->

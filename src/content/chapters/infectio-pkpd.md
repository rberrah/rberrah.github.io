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
prerequisites: ["pkpd", "nca-auc"]
glossary: ["CMI", "PTA", "AUC", "Cmax / Tmax"]
slides: []
sources: ["craig-pkpd", "rybak-vanco", "eucast", "goutelle-hill"]
updated_on: "2026-10-09"
reviewed_on: "2026-10-09"
review_type: "author"
reviewed_hash: "f2ddda7b03253511461f86d9733229b40b7e702939d12b02f98521c0b588dc91"
quiz:
  - prompt: "Pour les bêta-lactamines, l'indice PK/PD prédictif d'efficacité est..."
    options:
      - "le temps passé au-dessus de la CMI (T>MIC)"
      - "le pic de concentration sur CMI (Cmax/CMI)"
      - "l'aire sous la courbe sur CMI (AUC/CMI)"
    correct: 0
  - prompt: "Un antibiotique concentration-dépendant (aminoside) est optimisé par..."
    options:
      - "un Cmax/MIC élevé (fortes doses espacées)"
      - "un T>CMI élevé par perfusion continue prolongée"
      - "des doses faibles et rapprochées pour lisser le pic"
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
- **Cmax / CMI** (concentration-dépendant) : indice classique des aminosides ; il peut aussi être informatif pour certaines fluoroquinolones selon le médicament, le pathogène et le critère étudié.
- **fAUC / CMI** : indice principal le plus souvent retenu pour les fluoroquinolones, avec l'exposition libre lorsque la cible a été définie ainsi. Pour la vancomycine dans les infections graves à MRSA, le consensus 2020 recommande une **AUC₂₄ de 400–600 mg·h/L lorsque la CMI vaut 1 mg/L par microdilution en bouillon**. Cette condition et la méthode de CMI doivent être conservées dans l'interprétation.

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
La CMI varie d'un germe à l'autre et par dilutions (facteur 2). Les indices sont souvent définis à partir de la **concentration libre**, mais le lien entre liaison, exposition libre et effet dépend du médicament et du contexte. Il faut aussi se méfier de l'**effet inoculum** et expliciter si l'indice utilise une concentration libre ou totale.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- L'efficacité antibiotique dépend de la forme de l'exposition vs CMI.
- T>CMI (bêta-lactamines), Cmax/CMI (aminosides), fAUC/CMI comme indice principal des fluoroquinolones, AUC/CMI pour la vancomycine dans son cadre validé.
- L'exposition libre au site pertinent est souvent la quantité mécanistement active, mais fraction libre, concentration libre et indice validé ne sont pas interchangeables.
- La CMI et l'inoculum introduisent de l'incertitude.
<!-- /step -->

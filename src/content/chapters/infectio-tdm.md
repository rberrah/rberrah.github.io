---
id: "infectio-tdm"
slug: "infectio-tdm"
title: "TDM des antibiotiques"
description: "Vancomycine, aminosides, bêta-lactamines en réanimation : mesurer, estimer l'AUC, ajuster."
summary: "Le suivi thérapeutique des antibiotiques à index étroit, en particulier en réanimation."
track: "infectio"
order: 41
duration: "12 min"
level: "intermediate"
tags: ["infectious-diseases", "tdm", "vancomycin", "icu"]
slides: []
sources: ["rybak-vanco", "roberts-dali", "minichmayr-mipd", "sheiner-forecasting"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Pour la vancomycine, la cible actuelle privilégiée est..."
    options:
      - "l'AUC₂₄/CMI ≥ 400 (estimée par Bayes)"
      - "une résiduelle cible de 15–20 mg/L"
      - "un pic Cmax/CMI ≥ 8 au premier dosage"
    correct: 0
  - prompt: "En réanimation, la clairance rénale augmentée (ARC) tend à..."
    options:
      - "sous-doser les antibiotiques hydrophiles"
      - "surexposer les antibiotiques hydrophiles"
      - "n'affecter que les antibiotiques lipophiles"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Certains antibiotiques à **index thérapeutique étroit** (vancomycine, aminosides) ou à forte variabilité (bêta-lactamines en réanimation) exigent un **suivi thérapeutique** (TDM).

Le but : rester efficace (au-dessus de la cible PK/PD) sans toxicité (rénale, auditive).
<!-- /step -->

<!-- step:title="Intuition" viz="TDMProfile" -->
Comme pour tout TDM : **mesurer** une concentration, **estimer** le profil individuel par Bayes, **ajuster** la dose.

La particularité infectieuse : la cible est un **indice PK/PD** (AUC/CMI, Cmax/CMI), pas seulement une concentration résiduelle.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="MultiDose" -->
Exemple de la **vancomycine** : les recommandations récentes ciblent l'**AUC₂₄/CMI ≥ 400**, estimée par approche **bayésienne** à partir de 1–2 prélèvements (plutôt que la seule résiduelle).

$$ \text{AUC}_{24} = \frac{\text{Dose}_{24}}{CL} $$

:::note
Réf. : Rybak M.J. et al., *Am J Health-Syst Pharm* 2020 (consensus vancomycine, cible AUC/CMI) ; Roberts J.A. et al., *Clin Infect Dis* 2014 (étude DALI : sous-exposition fréquente des bêta-lactamines en réanimation).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="TDMProfile" -->
En réanimation, un patient avec **clairance rénale augmentée** (ARC) élimine vite : à dose standard, il est **sous-exposé** — risque d'échec. Le TDM bayésien détecte la CL élevée et **augmente/rapproche** les doses.

À l'inverse, une insuffisance rénale impose de réduire pour éviter la toxicité.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Ne réglez pas une dose sur une concentration sans son contexte.

:::pitfall
Le **moment du prélèvement** et la **fonction rénale** (souvent instable en réanimation) sont critiques. Viser une résiduelle sans estimer l'AUC peut manquer la cible réelle ; la CMI du germe doit être connue ou supposée.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Le TDM concerne les antibiotiques à index étroit ou très variables (réanimation).
- La cible est un indice PK/PD (vancomycine : AUC₂₄/CMI ≥ 400) estimé par Bayes.
- La clairance rénale augmentée sous-dose les antibiotiques hydrophiles.
- Moment de prélèvement, fonction rénale et CMI conditionnent l'ajustement.
<!-- /step -->

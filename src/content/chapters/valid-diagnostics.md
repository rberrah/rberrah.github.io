---
id: "valid-diagnostics"
slug: "valid-diagnostics"
title: "Panorama des graphiques diagnostiques (GoF)"
description: "Lire chaque graphique de qualité d'ajustement — bon vs mauvais modèle — d'un coup d'œil."
summary: "Catalogue illustré : obs vs pred, résidus (CWRES/IWRES), VPC, NPDE et distribution des effets aléatoires."
track: "valid"
order: 95
duration: "15 min"
level: "advanced"
tags: ["validation", "gof", "diagnostic-plots", "residuals"]
prerequisites: ["valid-gof", "valid-vpc", "valid-npde"]
glossary: ["GOF", "PRED / IPRED", "Résidus (WRES/CWRES/IWRES/NPDE)", "VPC", "Binning"]
slides: []
sources: ["hooker-cwres", "karlsson-holford-vpc", "brendel-npde", "savic-karlsson-shrinkage"]
updated_on: "2026-10-10"
reviewed_on: "2026-10-10"
review_type: "author"
reviewed_hash: "1decec4f1ebff3296efa3cbc4d9a176f0ec8b050e00873d5709da2e4634ada43"
quiz:
  - prompt: "Aucun graphique diagnostique unique ne suffit ; on les croise parce que..."
    options:
      - "chacun est sensible à plusieurs composantes et leur cohérence resserre les hypothèses"
      - "ils explorent tous le même défaut, on cumule pour gagner en puissance"
      - "seule la VPC compte vraiment, les autres ne font que la confirmer"
    correct: 0
  - prompt: "Sur |IWRES| vs prédictions, une tendance croissante fait notamment suspecter..."
    options:
      - "une inadéquation du modèle d'erreur, à confronter aux autres diagnostics"
      - "avec certitude un compartiment structural manquant"
      - "avec certitude une covariable manquante sur la clairance"
    correct: 0
  - prompt: "La distribution des effets aléatoires (η) doit idéalement être..."
    options:
      - "centrée sur 0 et à peu près symétrique/gaussienne"
      - "centrée sur la valeur typique du paramètre, pas sur zéro"
      - "strictement positive, comme les paramètres PK eux-mêmes"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Aucun **test unique** ne valide un modèle. On **croise** plusieurs graphiques, car chacun est sensible, à des degrés différents, au modèle **structural**, à la **variabilité**, à l'**erreur résiduelle**, au plan et aux **covariables**.

Ce chapitre est une carte : pour chaque graphique, à quoi ressemble un **bon** modèle, et le signal d'alarme d'un **mauvais**.
<!-- /step -->

<!-- step:title="Intuition" viz="50_GOFPlots" -->
Deux questions guident tout : le modèle **prédit-il juste** ? Ses **erreurs sont-elles neutres** ?

Sous un modèle et des diagnostics correctement spécifiés, on attend un accord approximatif avec la diagonale et des résidus sans structure évidente. Montez la « mauvaise spécification » pour produire un biais illustratif ; dans une analyse réelle, ce motif ouvre des hypothèses plutôt qu'il ne désigne seul sa cause.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="50_GOFPlots" -->
Le **catalogue** des graphiques et leur lecture :

- **DV vs PRED / DV vs IPRED** — justesse (population / individuel). Un nuage incurvé peut notamment être compatible avec une structure, une covariable ou une non-linéarité manquante.
- **CWRES vs temps** et **CWRES vs PRED** — neutralité. Si l'approximation $\mathcal{N}(0,1)$ est raisonnable : centrés sur **0**, sans tendance, environ 95 % dans $[-2,2]$. Une **tendance** suggère une mauvaise spécification structurale, covariable ou résiduelle à investiguer ; ce repère n'est pas un test d'acceptation.
- **|IWRES| vs PRED** — information sur le modèle d'**erreur résiduelle**. Un entonnoir fait notamment suspecter une variance conditionnelle mal décrite, mais la structure, les données atypiques et le shrinkage doivent aussi être examinés.
- **Histogramme / QQ-plot des résidus** — une asymétrie ou des queues lourdes sont compatibles avec plusieurs défauts de distribution ou de modèle, sans diagnostic causal unique.
- **VPC / pcVPC** — le modèle **régénère-t-il** les données ? (chapitre dédié).
- **NPDE** — résidus par simulation, doivent suivre $\mathcal{N}(0,1)$ (chapitre dédié).
- **Distribution des η** et **η vs covariables** — hypothèses sur la variabilité et d'éventuelles covariables, à interpréter avec le shrinkage.

:::note
CWRES : Hooker et al., *Pharm Res* 2007. Ce panorama synthétise les chapitres GoF, VPC, NPDE et shrinkage.
:::
<!-- /step -->

<!-- step:title="Le VPC en pratique" viz="17_VPCCrashTest" -->
La **VPC** confronte les percentiles observés (5 %, 50 %, 95 %) aux **bandes** simulées sous le modèle.

Des écarts répétés des percentiles observés aux bandes simulées indiquent une inadéquation prédictive à explorer. Une médiane hors bande peut être compatible avec un défaut de structure, de covariable, de design ou de dose ; des extrêmes mal reproduits peuvent impliquer l'IIV, l'erreur résiduelle, le binning ou d'autres composantes. La VPC ne sépare pas seule ces causes.
<!-- /step -->

<!-- step:title="Exemple concret" viz="52_NPDE" -->
Sous les hypothèses de calcul, les **NPDE** (résidus par simulation) sont attendus proches d'une gaussienne standard. Un **décalage de moyenne** dans un sous-groupe est compatible, entre autres, avec une covariable ou une structure manquante ; une dispersion inattendue fait suspecter une inadéquation prédictive sans en identifier seule la composante.

Enfin, une bosse distincte dans la **distribution des η** peut faire envisager une sous-population, une covariable, un problème de modèle ou un artefact d'estimation. Cette hypothèse doit être confirmée par d'autres éléments.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Les graphiques individuels peuvent mentir.

:::pitfall
Un **DV vs IPRED** parfait peut être trompeur avec un **shrinkage** élevé : les diagnostics individuels deviennent peu informatifs, sans que cela signifie automatiquement surajustement. Toujours regarder les diagnostics **population** (PRED, CWRES, VPC) et vérifier le shrinkage avant d'interpréter η vs covariables.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- On croise plusieurs graphiques : aucun motif n'identifie à lui seul une cause unique.
- DV vs PRED/IPRED (justesse) ; CWRES (neutralité) ; |IWRES| (erreur résiduelle) ; VPC/NPDE (simulation).
- Distribution des η et η vs covariables génèrent des hypothèses, à lire avec le shrinkage et les autres diagnostics.
- Méfiance : IPRED parfait par shrinkage ; s'appuyer sur les diagnostics de population.
<!-- /step -->

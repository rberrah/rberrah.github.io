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
quiz:
  - prompt: "Aucun graphique diagnostique unique ne suffit ; on les croise parce que..."
    options:
      - "chacun révèle un type de défaut différent (structure, variabilité, erreur)"
      - "ils disent tous la même chose"
      - "c'est une obligation réglementaire arbitraire"
    correct: 0
  - prompt: "Sur |IWRES| vs prédictions, une tendance croissante signale..."
    options:
      - "un modèle d'erreur résiduelle mal choisi (hétéroscédasticité)"
      - "un bon ajustement"
      - "une erreur de dose"
    correct: 0
  - prompt: "La distribution des effets aléatoires (η) doit idéalement être..."
    options:
      - "centrée sur 0 et à peu près symétrique/gaussienne"
      - "toujours bimodale"
      - "strictement positive"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Aucun **test unique** ne valide un modèle. On **croise** plusieurs graphiques, car chacun éclaire un défaut différent : le modèle **structural**, la **variabilité**, l'**erreur résiduelle**, les **covariables**.

Ce chapitre est une carte : pour chaque graphique, à quoi ressemble un **bon** modèle, et le signal d'alarme d'un **mauvais**.
<!-- /step -->

<!-- step:title="Intuition" viz="50_GOFPlots" -->
Deux questions guident tout : le modèle **prédit-il juste** ? Ses **erreurs sont-elles neutres** ?

Un bon modèle aligne observations et prédictions sur la diagonale, et laisse des résidus centrés sur zéro, sans structure. Montez la « mauvaise spécification » et voyez un biais systématique apparaître — c'est ce que chaque graphique traque.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="50_GOFPlots" -->
Le **catalogue** des graphiques et leur lecture :

- **DV vs PRED / DV vs IPRED** — justesse (population / individuel). Bon : nuage **sur la diagonale**. Mauvais : nuage **incurvé** (compartiment ou non-linéarité manquant).
- **CWRES vs temps** et **CWRES vs PRED** — neutralité. Bon : centrés sur **0**, sans tendance, ~95 % dans $[-2,2]$. Mauvais : **tendance** (mauvais modèle structural).
- **|IWRES| vs PRED** — modèle d'**erreur résiduelle**. Bon : nuage **plat**. Mauvais : en **entonnoir** (hétéroscédasticité → passer d'une erreur additive à combinée).
- **Histogramme / QQ-plot des résidus** — normalité. Bon : cloche centrée. Mauvais : asymétrie, queues lourdes.
- **VPC / pcVPC** — le modèle **régénère-t-il** les données ? (chapitre dédié).
- **NPDE** — résidus par simulation, doivent suivre $\mathcal{N}(0,1)$ (chapitre dédié).
- **Distribution des η** et **η vs covariables** — la variabilité et les covariables manquantes.

:::note
CWRES : Hooker et al., *Pharm Res* 2007. Ce panorama synthétise les chapitres GoF, VPC, NPDE et shrinkage.
:::
<!-- /step -->

<!-- step:title="Le VPC en pratique" viz="17_VPCCrashTest" -->
La **VPC** confronte les percentiles observés (5 %, 50 %, 95 %) aux **bandes** simulées sous le modèle.

Bon modèle : les percentiles observés tombent **dans** les tunnels. Médiane hors bande → défaut de **structure** ; percentiles extrêmes trop serrés → **variabilité** sous-estimée. Faites sortir les points et voyez le diagnostic basculer.
<!-- /step -->

<!-- step:title="Exemple concret" viz="52_NPDE" -->
Les **NPDE** (résidus par simulation) doivent former une gaussienne standard. Un **décalage de moyenne** dans un sous-groupe (ex. insuffisants rénaux) trahit une **covariable manquante** ; un **étalement** signale une variabilité mal capturée.

Enfin, la **distribution des η** doit être centrée sur 0 et symétrique — une bosse à part suggère une **sous-population** (phénotype métaboliseur) non modélisée.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Les graphiques individuels peuvent mentir.

:::pitfall
Un **DV vs IPRED** parfait peut venir d'un **shrinkage** élevé (le modèle « colle » par surajustement), pas d'un bon modèle de population. Toujours regarder les diagnostics **population** (PRED, CWRES, VPC) et vérifier le shrinkage avant d'interpréter η vs covariables.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- On croise plusieurs graphiques : chacun révèle un défaut différent.
- DV vs PRED/IPRED (justesse) ; CWRES (neutralité) ; |IWRES| (erreur résiduelle) ; VPC/NPDE (simulation).
- Distribution des η centrée/symétrique ; η vs covariables révèle les covariables manquantes.
- Méfiance : IPRED parfait par shrinkage ; s'appuyer sur les diagnostics de population.
<!-- /step -->

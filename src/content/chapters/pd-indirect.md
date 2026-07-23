---
id: "pd-indirect"
slug: "pd-indirect"
title: "Modèles de réponse indirecte (turnover)"
description: "Quand le médicament agit sur la production ou la dégradation d'une réponse : les quatre modèles de Dayneka."
summary: "Les modèles turnover : inhibition/stimulation de kin ou kout, et le délai qui en résulte."
track: "pd"
order: 61
duration: "13 min"
level: "intermediate"
tags: ["pharmacodynamics", "indirect-response", "turnover"]
slides: []
sources: ["dayneka-jusko-indirect", "jusko-ko-indirect", "gabrielsson-weiner"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Dans un modèle de réponse indirecte, le délai de l'effet vient..."
    options:
      - "du renouvellement (kout) de la réponse, pas de la PK"
      - "de l'absorption lente du médicament vers le plasma"
      - "de la distribution lente du médicament vers les tissus"
    correct: 0
  - prompt: "Combien de modèles de base de réponse indirecte a décrit Dayneka ?"
    options:
      - "quatre (inhibition/stimulation de kin ou kout)"
      - "deux (inhibition ou stimulation d'une seule vitesse)"
      - "six (inhibition/stimulation de kin, kout et R)"
    correct: 0
  - prompt: "À l'état basal, la réponse R0 vaut..."
    options:
      - "kin / kout"
      - "kin × kout"
      - "kout / kin"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Beaucoup d'effets **ne suivent pas** la concentration en temps réel : le médicament agit sur la **production** ou la **dégradation** d'une substance (glycémie, cellules, biomarqueur). L'effet apparaît alors **en retard**.

Les modèles de **réponse indirecte** (turnover) capturent ce délai de façon mécaniste.
<!-- /step -->

<!-- step:title="Intuition" viz="Turnover" -->
Une réponse $R$ est produite (vitesse $k_{in}$) et éliminée (vitesse $k_{out}$). Sans médicament, elle reste à l'équilibre $R_0 = k_{in}/k_{out}$.

Le médicament pousse sur l'une des deux vitesses. La réponse met du temps à bouger : ce **délai** vient de $k_{out}$, pas de la pharmacocinétique.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="Turnover" -->
Les **quatre modèles** de Dayneka & Jusko selon la vitesse touchée :

$$ \frac{dR}{dt} = k_{in}\,[1\pm f(C)] - k_{out}\,R \qquad\text{(action sur } k_{in}) $$
$$ \frac{dR}{dt} = k_{in} - k_{out}\,[1\pm g(C)]\,R \qquad\text{(action sur } k_{out}) $$

où $f,g$ sont des fonctions Emax d'inhibition ($I_{max}$) ou de stimulation ($S_{max}$). Basculez entre stimulation de $k_{in}$ et inhibition de $k_{out}$ dans l'atelier.

:::note
Réf. : Dayneka N.L., Garg V. & Jusko W.J., *J Pharmacokinet Biopharm* 1993 — les quatre modèles de base de réponse indirecte.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="Turnover" -->
Un anticoagulant oral (warfarine) **inhibe la synthèse** des facteurs de coagulation : l'effet sur l'INR apparaît avec plusieurs jours de retard — le temps que les facteurs existants disparaissent ($k_{out}$).

Le nadir de l'effet ne coïncide donc **pas** avec le pic plasmatique.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Ne pas confondre délai PK et délai PD.

:::pitfall
Le retard d'un modèle turnover vient du **renouvellement** biologique, pas de l'absorption. Augmenter la dose ne raccourcit pas ce délai (il dépend de $k_{out}$) — cela ne fait qu'approfondir l'effet.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Réponse indirecte : le médicament agit sur kin (production) ou kout (dégradation).
- Quatre modèles de Dayneka (inhibition/stimulation × kin/kout).
- R0 = kin/kout ; le délai de l'effet vient de kout, pas de la PK.
- Le nadir de l'effet ne coïncide pas avec le pic plasmatique.
<!-- /step -->

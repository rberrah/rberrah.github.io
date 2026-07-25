---
id: "erreur-residuelle"
slug: "erreur-residuelle"
title: "L'erreur résiduelle"
description: "Ce qui reste entre la prédiction individuelle et l'observation : erreur additive, proportionnelle, combinée."
summary: "Modéliser le bruit résiduel : additive, proportionnelle, combinée — et comment le diagnostiquer."
track: "core"
order: 5.5
duration: "12 min"
level: "intermediate"
tags: ["error-model", "residual", "additive", "proportional"]
prerequisites: ["variabilite-iiv-iov"]
glossary: ["Erreur additive", "Erreur proportionnelle", "Erreur combinée", "ε / σ", "Résidus (WRES/CWRES/IWRES/NPDE)"]
slides: []
sources: ["berrah-residual", "hooker-cwres", "beal-bql", "davidian-giltinan"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Une erreur résiduelle proportionnelle signifie que le bruit..."
    options:
      - "augmente en proportion de la concentration prédite"
      - "est de largeur constante à toute concentration"
      - "diminue quand la concentration prédite augmente"
    correct: 0
  - prompt: "Un graphique |IWRES| vs prédictions en forme d'entonnoir indique..."
    options:
      - "un modèle d'erreur inadapté à ces données"
      - "un ajustement globalement satisfaisant du modèle"
      - "un biais systématique du modèle structural"
    correct: 0
  - prompt: "Le modèle d'erreur combinée est utile parce qu'il..."
    options:
      - "combine un plancher additif et un %CV proportionnel"
      - "élimine le besoin de variabilité inter-individuelle"
      - "impose une erreur constante quelle que soit la valeur"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Même avec le bon modèle structural et la bonne variabilité inter-individuelle, la prédiction d'un patient ne passe **jamais** exactement par ses points. Il reste un écart : l'**erreur résiduelle**.

Elle regroupe l'erreur de **mesure** (dosage), les erreurs de **temps de prélèvement**, et tout ce que le modèle ne capture pas. Bien la modéliser est indispensable — sinon les intervalles de prédiction et les diagnostics sont faux.
<!-- /step -->

<!-- step:title="Intuition" viz="61_ResidualError" -->
Deux façons opposées de « rater » : d'une **largeur constante** (le dosage a une précision de ±0,5 mg/L quelle que soit la concentration) ou d'un **pourcentage** (±10 % de la valeur, donc plus large quand la concentration est haute).

Basculez entre additive, proportionnelle et combinée : la bande d'erreur doit contenir ~95 % des vrais points. C'est ce compromis qu'on cherche.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="61_ResidualError" -->
Autour de la prédiction individuelle $f$, l'observation s'écrit :

$$ y = f + \varepsilon_{add} \quad|\quad y = f\,(1 + \varepsilon_{prop}) \quad|\quad y = f + \sqrt{a^2 + (b\,f)^2}\,\varepsilon $$

- **additive** : $\varepsilon \sim \mathcal{N}(0, a^2)$ — bruit constant (bon près de la limite de quantification) ;
- **proportionnelle** : écart-type $= b\cdot f$ — %CV constant (bon aux fortes concentrations) ;
- **combinée** : deux écritures possibles de l'écart-type — en **somme simple** ($\sigma = a + b\,f$, dite *combined1*) ou en **quadrature** ($\sigma = \sqrt{a^2 + (b f)^2}$, dite *combined2*). Les deux mêlent un **plancher** additif et un **pourcentage** proportionnel.

:::note
En pratique, l'erreur résiduelle réelle est **rarement** exactement la forme en quadrature (*combined2*) que suggèrent les formules « propres ». La somme simple (*combined1*, $\sigma = a + b\,f$) décrit souvent aussi bien, voire mieux, les données, et reste plus stable à estimer. La leçon : ne recopiez pas *combined2* par défaut — choisissez la forme qui colle réellement aux résidus.
:::

:::howto
**La métaphore de la balance.** Une balance de cuisine a une précision **fixe** (±1 g) : erreur additive. Une balance industrielle affiche un **pourcentage** (±0,5 % de la charge) : erreur proportionnelle. Une vraie balance combine les deux — un plancher **et** un %.

**Côté maths.** Sur $|IWRES|$ vs prédictions, l'erreur additive donne un nuage **plat** ; la proportionnelle, un nuage plat une fois normalisé. Un **entonnoir** (résidus qui s'élargissent avec la prédiction) trahit une additive alors qu'il fallait une **proportionnelle/combinée**.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="61_ResidualError" -->
Un dosage LC-MS/MS a souvent un **%CV** à peu près constant (ex. 10 %) sur sa gamme — donc une erreur **proportionnelle** — sauf tout près de la **limite de quantification**, où un terme **additif** prend le relais.

D'où le choix fréquent d'une erreur **combinée** en pratique : elle couvre les basses **et** les hautes concentrations.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Une erreur mal choisie fausse tout le reste.

:::pitfall
Une erreur **additive** sur des données à large gamme sur-pondère les hautes concentrations et sous-estime la précision aux basses. Résultat : mauvais **poids** dans l'estimation et intervalles de prédiction irréalistes. Vérifiez toujours le modèle d'erreur sur le graphe $|IWRES|$ vs prédictions avant de conclure.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- L'erreur résiduelle = écart entre prédiction individuelle et observation (mesure, temps, non-modélisé).
- Additive (largeur constante), proportionnelle (%CV constant), combinée (plancher + %).
- La combinée est le choix par défaut réaliste : plancher additif près de la LOQ, % aux fortes concentrations.
- Diagnostic : |IWRES| vs prédictions ; un entonnoir = mauvais modèle d'erreur.
<!-- /step -->

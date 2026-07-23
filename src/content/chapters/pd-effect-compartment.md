---
id: "pd-effect-compartment"
slug: "pd-effect-compartment"
title: "Compartiment d'effet (Sheiner) et hystérésis"
description: "Relier concentration et effet quand l'effet est décalé dans le temps : le modèle à compartiment d'effet."
summary: "Le modèle de Sheiner (ke0) : un compartiment d'effet virtuel qui explique l'hystérésis concentration–effet."
track: "pd"
order: 62
duration: "12 min"
level: "advanced"
tags: ["pharmacodynamics", "effect-compartment", "sheiner", "hysteresis"]
prerequisites: ["pkpd", "pd-direct"]
glossary: ["Compartiment d’effet (ke0)", "Hystérèse", "Emax"]
slides: []
sources: ["sheiner-effect-compartment", "holford-sheiner-dose-effect", "dayneka-jusko-indirect", "gabrielsson-weiner"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Le modèle à compartiment d'effet explique l'hystérésis par..."
    options:
      - "un délai d'équilibration entre plasma et site d'effet (ke0)"
      - "un métabolite actif qui se forme lentement après la molécule mère"
      - "une saturation des récepteurs aux concentrations élevées"
    correct: 0
  - prompt: "Le paramètre ke0 contrôle..."
    options:
      - "la vitesse d'équilibration vers le compartiment d'effet"
      - "la vitesse d'élimination du médicament hors du plasma"
      - "la vitesse d'absorption depuis le site d'administration"
    correct: 0
  - prompt: "Une boucle d'hystérésis concentration–effet indique que..."
    options:
      - "l'effet est décalé par rapport à la concentration plasmatique"
      - "l'effet suit instantanément la concentration plasmatique"
      - "l'effet plafonne dès que les récepteurs sont totalement saturés"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Parfois l'effet **suit une forme Emax**, mais **décalé** : à concentration plasmatique égale, l'effet diffère selon qu'on monte ou qu'on descend. Ce décalage forme une **boucle d'hystérésis**.

Le modèle de **Sheiner** l'explique élégamment avec un **compartiment d'effet** virtuel.
<!-- /step -->

<!-- step:title="Intuition" viz="SheinerEffect" -->
Le site d'action (cerveau, muscle) n'est pas le plasma : le médicament doit y **diffuser**. La concentration au site d'effet **retarde** la concentration plasmatique.

Quand on trace effet vs concentration plasmatique, ce retard dessine une **boucle** : c'est l'hystérésis.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="SheinerEffect" -->
On ajoute un compartiment d'effet $C_e$ qui s'équilibre avec le plasma à la vitesse $k_{e0}$ :

$$ \frac{dC_e}{dt} = k_{e0}\,(C_p - C_e) $$

:::howto
**La métaphore de la pièce chauffée.** Le plasma, c'est le radiateur ; le site d'effet, c'est la pièce. Quand vous allumez (pic plasmatique), la pièce ne se réchauffe pas d'un coup : il y a un délai. $k_{e0}$ est la **vitesse d'échange** radiateur→pièce : petit $k_{e0}$ = pièce lente à chauffer et à refroidir = gros décalage.

**Côté maths.** $C_e$ « poursuit » $C_p$ : la vitesse $k_{e0}(C_p-C_e)$ est grande quand l'écart est grand, nulle à l'équilibre. Comme l'effet suit $C_e$ (en retard) et non $C_p$, tracer effet vs $C_p$ dessine une **boucle** (hystérèse) — même concentration, effet différent à la montée et à la descente.
:::

L'effet suit alors un Emax **de $C_e$** (et non de $C_p$) :

$$ E = E_0 + \frac{E_{max}\,C_e}{EC_{50}+C_e} $$

Le compartiment d'effet ne reçoit pas de masse : c'est un artifice qui **collapse la boucle** d'hystérésis.

:::note
Réf. : Sheiner L.B. et al., *Clin Pharmacol Ther* 1979 (modèle à compartiment d'effet, illustré sur le d-tubocurarine).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="SheinerEffect" -->
Un **agent anesthésique** : l'effet cérébral est en retard sur la concentration plasmatique. Un petit $k_{e0}$ = équilibration lente = grande hystérésis ; un grand $k_{e0}$ = effet quasi direct.

La demi-vie d'équilibration $t_{1/2,k_{e0}} = \ln 2/k_{e0}$ résume ce délai — utile pour titrer.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Hystérésis n'est pas toujours un compartiment d'effet.

:::pitfall
Une boucle peut aussi venir d'une **réponse indirecte** (turnover), d'un **métabolite actif** ou de la tolérance. Choisir mécaniquement « compartiment d'effet » sans distinguer ces causes conduit à un mauvais modèle. Le sens de la boucle (horaire/anti-horaire) aide au diagnostic.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Un compartiment d'effet (Sheiner) explique le décalage concentration plasma → effet.
- ke0 = vitesse d'équilibration ; t½ = ln2/ke0 résume le délai.
- L'effet suit un Emax de Ce (site d'effet), ce qui collapse l'hystérésis.
- Hystérésis ≠ toujours compartiment d'effet (turnover, métabolite, tolérance).
<!-- /step -->

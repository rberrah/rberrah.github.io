---
id: "pkpd"
slug: "pkpd"
title: "PK/PD : Emax et turnover"
description: "Relier concentration et effet : saturation, pente et délais."
summary: "Panorama des modèles PD, du plus simple au plus mécaniste : linéaire, Emax, compartiment d'effet de Sheiner et réponse indirecte (turnover)."
track: "core"
order: 7
duration: "16 min"
level: "intermediate"
tags: ["pkpd", "emax", "ec50", "turnover"]
prerequisites: ["clairance-volume-demi-vie"]
glossary: ["Emax", "EC50 / CE50", "Coefficient de Hill", "Compartiment d’effet (ke0)", "Réponse indirecte / turnover", "Hystérèse"]
slides: ["s26", "s27", "s28", "s29", "s30", "s31", "s32", "s33", "s35", "s36"]
sources: ["holford-sheiner-dose-effect", "goutelle-hill", "sheiner-effect-compartment", "dayneka-jusko-indirect"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "L'EC50 est la concentration qui produit..."
    options:
      - "la moitié de l'effet maximal (Emax)"
      - "la totalité de l'effet maximal (Emax)"
      - "un effet égal à la valeur de base E0"
    correct: 0
  - prompt: "Un coefficient de Hill supérieur à 1 rend la courbe..."
    options:
      - "plus raide et plus proche du tout ou rien"
      - "plus plate, l'effet variant très progressivement"
      - "décalée vers les concentrations plus élevées"
    correct: 0
  - prompt: "Les modèles de turnover sont utiles quand..."
    options:
      - "l'effet est retardé car la variable de réponse évolue dans le temps"
      - "l'effet est retardé parce que le médicament se distribue lentement"
      - "le retard vient d'un équilibrage lent entre plasma et site d'effet"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s26" viz="BuildingBlocksPKPD" -->
La concentration n'est généralement pas la question finale. La question finale, c'est l'**effet** : bénéfice, toxicité, variation d'un biomarqueur, réponse clinique.

Les modèles PK/PD relient la concentration (produite par la PK) à cet effet. Il en existe une petite famille, du plus simple au plus mécaniste. Ce chapitre les parcourt dans l'ordre : **linéaire → Emax → compartiment d'effet → turnover**.
<!-- /step -->

<!-- step:title="Intuition : le modèle linéaire" slides="s26,s28" viz="EmaxHill" -->
Le lien le plus simple entre concentration et effet est **linéaire** : l'effet varie proportionnellement à la concentration.

$$ E = E_0 + S\cdot C $$

$E_0$ est l'effet de base (sans médicament) et $S$ (la pente, *slope*) dit de combien l'effet augmente par unité de concentration.

:::key
Ce modèle linéaire est souvent **suffisant** dans la plage de concentrations réellement observée : deux paramètres seulement, faciles à estimer. Sa limite : il ne prévoit **aucune saturation** et laisse croire que l'effet augmente indéfiniment avec la dose — ce qui est biologiquement faux.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée : le modèle Emax" slides="s28" viz="EmaxHill" -->
En réalité, l'effet **sature** : une fois les cibles (récepteurs, enzymes) occupées, augmenter la concentration n'apporte presque plus rien. C'est l'idée du modèle **Emax**.

Modèle Emax direct :

$$ E = E_0 + \frac{E_{\max}\, C}{EC_{50} + C} $$

Modèle Emax sigmoïde (coefficient de Hill $h$) :

$$ E = E_0 + \frac{E_{\max}\, C^{h}}{EC_{50}^{h} + C^{h}} $$

:::math
$E_0$ = effet sans médicament ; $E_{\max}$ = effet supplémentaire maximal ; $EC_{50}$ = concentration donnant la moitié de l'effet ; $h$ = à quel point la réponse est « tout ou rien ».

Quand $C \ll EC_{50}$, la fraction $\approx C/EC_{50}$ : on **retrouve le modèle linéaire**, de pente $E_{\max}/EC_{50}$. Quand $C = EC_{50}$, la fraction vaut exactement **½** (d'où le nom). Quand $C \gg EC_{50}$, elle tend vers **1** et $E\to E_0+E_{\max}$ (plateau).
:::

:::clinical
« Plus de dose = plus d'effet » cesse d'être vrai bien avant la saturation, mais **pas dès l'EC50** : à $C = EC_{50}$ on n'a atteint que **la moitié** de l'Emax, et passer à $4\times EC_{50}$ en apporte encore 30 points. C'est **au-delà de ~5 × EC50** (≈ 83 % de l'Emax) que la montée devient négligeable — alors que la toxicité suit sa propre courbe et continue souvent de croître. C'est là l'argument contre la surenchère posologique.
:::
<!-- /step -->

<!-- step:title="Le modèle de Sheiner" slides="s32" viz="SheinerEffect" -->
Souvent, l'effet est **en retard** sur la concentration. Ce délai n'est pas forcément une distribution lente (de la PK) : il peut être **pharmacodynamique**.

Première façon de le décrire, sans modéliser tout un mécanisme : un **compartiment d'effet** (Sheiner). Une concentration au site d'action $C_e$ est reliée au plasma par une seule constante d'équilibrage $k_{e0}$ :

$$ \frac{dC_e}{dt} = k_{e0}\,(C_p - C_e) $$

L'effet dépend alors de $C_e$ (via un Emax), pas de $C_p$. Manipulez $k_{e0}$ : un petit $k_{e0}$ retarde et arrondit l'effet.

:::key
Comme le pic d'effet arrive **après** le pic plasmatique, tracer effet vs concentration dessine une **boucle d'hystérèse** — signature d'un décalage PK/PD.
:::
<!-- /step -->

<!-- step:title="Exemple concret : le modèle de turnover" slides="s33" viz="Turnover" -->
Le compartiment d'effet décale l'effet mais suppose une action **directe**. Souvent, le médicament agit en fait sur la **production** ou la **dégradation** d'une substance biologique : c'est la **réponse indirecte** (turnover).

Une variable de réponse $R$ (biomarqueur, facteur) est produite au rythme $k_{in}$ et dégradée au rythme $k_{out}$. Le médicament stimule ou inhibe l'un des deux :

$$ \frac{dR}{dt} = k_{in}\,\bigl(1 + f(C)\bigr) - k_{out}\,R $$

À l'équilibre, $R_0 = k_{in}/k_{out}$. Le délai vient ici du **temps de renouvellement** de $R$ (piloté par $k_{out}$), pas de la PK.

**La warfarine.** Son effet anticoagulant est en retard sur la concentration : elle bloque la **synthèse** des facteurs de coagulation, mais les facteurs déjà présents doivent d'abord être éliminés naturellement. La concentration change d'abord ; le système biologique répond ensuite. L'animation montre ce turnover $k_{in}/k_{out}$ — et non un compartiment d'effet.
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s30" viz="EmaxHill" -->
N'estimez pas un Emax complet quand vous n'en observez qu'un **morceau**.

:::pitfall
Pour identifier $E_{\max}$ **et** $EC_{50}$, il faut des observations qui couvrent **toute** la courbe : la partie basse (montée quasi linéaire) **et** le plateau (saturation). Or, en pratique, on n'observe souvent que le **milieu** de la sigmoïde, sans jamais atteindre le plateau. Estimer $E_{\max}$ et $EC_{50}$ devient alors **instable** : les deux paramètres sont fortement corrélés et le modèle ne converge pas.

La solution pragmatique : **se rabattre sur un modèle linéaire** (pente $S$) sur la plage observée. C'est le même compromis que la limite basse de l'Emax — un modèle plus simple mais **estimable** vaut mieux qu'un modèle « juste » mais non identifiable.
:::
<!-- /step -->

<!-- step:title="À retenir" slides="s36" -->
- Du plus simple au plus mécaniste : **linéaire** (pente $S$), **Emax** (saturation), **compartiment d'effet** de Sheiner (délai d'une action directe), **turnover** (réponse indirecte $k_{in}/k_{out}$).
- Le modèle linéaire est la limite basse de l'Emax ($C \ll EC_{50}$) ; quand on n'observe que le milieu de la courbe, il est souvent le seul **estimable**.
- Un délai effet/concentration n'est pas forcément de la PK lente : il peut être **PD** (compartiment d'effet ou turnover).
- Pour approfondir ces modèles, suivez le parcours **Pharmacodynamie**.
<!-- /step -->

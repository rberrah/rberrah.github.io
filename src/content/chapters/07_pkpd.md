---
id: "pkpd"
slug: "pkpd"
title: "PK/PD : Emax et turnover"
description: "Relier concentration et effet : saturation, pente et délais."
summary: "Guide accessible aux modèles Emax directs et aux modèles à réponse indirecte."
track: "core"
order: 7
duration: "16 min"
level: "intermediate"
tags: ["pkpd", "emax", "ec50", "turnover"]
slides: ["s26", "s27", "s28", "s29", "s30", "s31", "s32", "s33", "s35", "s36"]
quiz:
  - prompt: "L'EC50 est la concentration qui produit..."
    options:
      - "la moitié de l'Emax"
      - "un effet nul"
      - "deux fois la valeur de base"
    correct: 0
  - prompt: "Un coefficient de Hill supérieur à 1 rend la courbe..."
    options:
      - "plus raide"
      - "plate à toutes les concentrations"
      - "indépendante de la concentration"
    correct: 0
  - prompt: "Les modèles de turnover sont utiles quand..."
    options:
      - "l'effet est retardé car la variable de réponse évolue dans le temps"
      - "il n'y a aucune variable de réponse"
      - "les données PK ne peuvent pas être mesurées"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s26" viz="BuildingBlocksPKPD" -->
La concentration n'est généralement pas la question finale. La question finale, c'est l'**effet**.

Les modèles PK/PD relient les blocs qui circulent dans l'organisme à la construction qu'ils produisent : bénéfice, toxicité, variation d'un biomarqueur, réponse clinique.
<!-- /step -->

<!-- step:title="Intuition" slides="s26,s28" viz="EmaxHill" -->
Ajouter plus de blocs n'aide que jusqu'à ce que la construction atteigne sa taille utile maximale.

Ce plateau est l'idée derrière l'**Emax** : une fois les cibles saturées, plus de concentration n'apporte presque plus d'effet — mais peut encore augmenter la toxicité.

:::clinical
« Plus de dose = plus d'effet » est faux au-delà de l'EC50 : on gagne surtout des effets indésirables. C'est l'argument clé contre la surenchère posologique.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s28" viz="EmaxHill" -->
Un modèle Emax direct :

$$ E = E_0 + \frac{E_{\max}\, C}{EC_{50} + C} $$

Un modèle Emax sigmoïde :

$$ E = E_0 + \frac{E_{\max}\, C^{h}}{EC_{50}^{h} + C^{h}} $$

:::math
$E_0$ = effet sans médicament ; $E_{\max}$ = effet supplémentaire maximal ; $EC_{50}$ = concentration donnant la moitié de l'effet ; $h$ (coefficient de Hill) = à quel point la réponse est « tout ou rien ».
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s33" viz="Turnover" -->
Pour la warfarine, l'effet clinique peut être en retard sur la concentration, car le médicament agit sur le renouvellement des facteurs de coagulation.

La concentration change d'abord ; le système biologique répond ensuite, au cours du temps. Ce délai est de la **PD**, pas nécessairement une distribution lente.
<!-- /step -->

<!-- step:title="Le modèle de Sheiner" slides="s32" viz="SheinerEffect" -->
Quand l'effet est en retard mais qu'on ne veut pas modéliser tout un mécanisme, on ajoute un **compartiment d'effet** (Sheiner) : une concentration au site d'action $C_e$ reliée au plasma par une seule constante d'équilibrage $k_{e0}$.

$$ \frac{dC_e}{dt} = k_{e0}\,(C_p - C_e) $$

L'effet dépend alors de $C_e$ (via un Emax), pas de $C_p$. Manipulez $k_{e0}$ : un petit $k_{e0}$ retarde et arrondit l'effet.

:::key
Comme le pic d'effet arrive **après** le pic plasmatique, tracer effet vs concentration dessine une **boucle d'hystérèse** — signature d'un décalage PK/PD.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s30,s33" viz="Turnover" -->
N'appelez pas tout délai « PK lente ».

:::pitfall
Parfois la concentration atteint vite le site d'action, mais l'effet mesuré prend du temps parce que le biomarqueur doit être produit ou éliminé. Les modèles de **turnover** représentent cela :
$$ \frac{dR}{dt} = k_{in}\,(1 + f(C)) - k_{out}\,R $$
:::
<!-- /step -->

<!-- step:title="À retenir" slides="s36" -->
- La PK explique la concentration au cours du temps.
- La PD explique l'effet en fonction de la concentration et de la biologie.
- Les modèles Emax enseignent la saturation.
- Les modèles de turnover enseignent la réponse retardée.
<!-- /step -->

---
id: "valid-objective"
slug: "valid-objective"
title: "Diagnostics numériques : OFV, AIC, BIC, χ²"
description: "Comparer deux modèles objectivement : fonction objective, test du rapport de vraisemblance et critères pénalisés."
summary: "OFV (−2 log L), test du χ² pour modèles emboîtés, et critères AIC/BIC qui pénalisent la complexité."
track: "valid"
order: 89
duration: "13 min"
level: "advanced"
tags: ["validation", "ofv", "aic", "bic", "likelihood-ratio"]
prerequisites: ["math-regression", "math-stats"]
glossary: ["OFV", "Vraisemblance", "AIC / BIC", "FOCE-I"]
slides: []
quiz:
  - prompt: "La fonction objective (OFV = −2 log L) d'un bon modèle est..."
    options:
      - "plus basse (les données sont plus vraisemblables)"
      - "plus haute"
      - "toujours nulle"
    correct: 0
  - prompt: "Ajouter un paramètre fait toujours..."
    options:
      - "baisser (ou égaler) l'OFV — d'où le besoin de pénaliser la complexité"
      - "monter l'OFV"
      - "changer la dose"
    correct: 0
  - prompt: "Le test du rapport de vraisemblance (ΔOFV ~ χ²) s'applique..."
    options:
      - "à des modèles emboîtés (l'un est un cas particulier de l'autre)"
      - "à n'importe quels modèles"
      - "sans degré de liberté"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Les graphiques disent *comment* un modèle se trompe ; les **diagnostics numériques** disent *lequel* de deux modèles choisir. Ils reposent tous sur une même quantité : la **vraisemblance** des données sous le modèle.

Sans eux, on empilerait des paramètres à l'infini. Avec eux, on arbitre entre ajustement et parcimonie.
<!-- /step -->

<!-- step:title="Intuition" viz="59_ModelSelection" -->
La **fonction objective** (OFV = $-2\log L$) mesure la « surprise » des données : plus elle est **basse**, plus le modèle rend les observations probables.

Problème : ajouter un paramètre fait **toujours** baisser l'OFV, même si le paramètre est inutile. Il faut donc un juge qui demande : la baisse est-elle **plus grande que le hasard** ? Et vaut-elle la complexité ajoutée ?
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="59_ModelSelection" -->
Pour deux modèles **emboîtés** (l'un est un cas particulier de l'autre), le **test du rapport de vraisemblance** compare la baisse d'OFV à une loi du **χ²** :

$$ \Delta OFV = OFV_{réduit} - OFV_{complet} \;\sim\; \chi^2_{\Delta df} \quad (\text{sous } H_0) $$

:::howto
**La métaphore du procès.** $H_0$ = « le paramètre en plus ne sert à rien » (présumé coupable d'inutilité). Le χ² fixe le **seuil du doute raisonnable** (3,84 pour 1 paramètre à 5 %). Si la baisse d'OFV **dépasse** ce seuil, les preuves suffisent : on garde le paramètre.

**Côté maths.** 1 paramètre ⇒ seuil $\chi^2_{1,\,0{,}05}=3{,}84$ ; 2 ⇒ 5,99 ; 3 ⇒ 7,81. Pour des modèles **non emboîtés**, le χ² ne s'applique pas : on utilise alors les critères pénalisés
$$ AIC = OFV + 2k, \qquad BIC = OFV + k\ln(n) $$
où $k$ = nombre de paramètres et $n$ = nombre d'observations. Le plus **bas** gagne ; le BIC pénalise plus fort quand $n$ est grand.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="59_ModelSelection" -->
Warfarine : ajouter un **temps de latence** (1 paramètre) fait chuter l'OFV de plusieurs dizaines de points — bien au-delà de 3,84 : le Tlag est **clairement justifié**, et l'AIC/BIC le confirment.

À l'inverse, passer à **2 compartiments** peut baisser l'OFV un peu, mais pas assez pour compenser la pénalité : l'**AIC remonte** — plus complexe n'est pas meilleur.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
L'OFV ne se compare pas n'importe comment.

:::pitfall
On ne compare l'OFV que sur **exactement les mêmes données**. Le test du χ² exige des modèles **emboîtés** et estimés avec la **même méthode** (attention aux approximations FOCE-I). Enfin, un modèle peut gagner sur l'AIC tout en ayant de **mauvais graphiques** : le nombre ne remplace jamais les diagnostics visuels.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- OFV = −2 log L ; plus bas = données plus vraisemblables. Ajouter un paramètre baisse toujours l'OFV.
- Modèles emboîtés : ΔOFV ~ χ² (seuil 3,84 pour 1 ddl à 5 %) — test du rapport de vraisemblance.
- Modèles non emboîtés : AIC = OFV + 2k, BIC = OFV + k·ln(n) ; le plus bas gagne.
- Comparer sur les mêmes données ; les nombres complètent, ne remplacent pas, les graphiques.
<!-- /step -->

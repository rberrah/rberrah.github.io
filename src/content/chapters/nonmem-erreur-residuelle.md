---
id: "nonmem-erreur-residuelle"
slug: "nonmem-erreur-residuelle"
title: "NONMEM — le bloc ERROR et les données sous la LOQ"
description: "Écrire le bloc ERROR : additive, proportionnelle, combinée ; régler SIGMA, traiter les données censurées (M1-M7) et lire WRES, CWRES et IWRES."
summary: "Le bloc ERROR fixe les poids de l'estimation : ses trois formes, la paramétrisation par W, les méthodes BQL de Beal et les résidus qui les diagnostiquent."
track: "nonmem"
order: 213
duration: "10 min"
level: "intermediate"
tags: ["nonmem", "error-model", "bql", "residuals"]
prerequisites: ["tools-nonmem"]
glossary: []
slides: []
sources: ["nonmem", "beal-bql", "hooker-cwres", "berrah-residual"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Avec une erreur proportionnelle ou combinée, l'option INTER du bloc ESTIMATION est nécessaire parce que..."
    options:
      - "l'écart-type résiduel dépend de la prédiction individuelle, donc de l'ETA du sujet, et doit être évalué à son ETA estimé"
      - "elle accélère la minimisation en évitant le calcul numérique des dérivées secondes de la vraisemblance à chaque itération"
      - "elle autorise une corrélation entre les EPS via un bloc SIGMA non diagonal, à la manière d'un OMEGA BLOCK"
    correct: 0
  - prompt: "La méthode M3 de Beal traite une donnée sous la LOQ en..."
    options:
      - "ajoutant à la vraisemblance la probabilité que la concentration prédite tombe sous la LOQ"
      - "remplaçant la valeur manquante par LOQ/2 et en la traitant ensuite comme une observation ordinaire"
      - "écartant les points sous la LOQ puis en conditionnant la vraisemblance des points restants"
    correct: 0
  - prompt: "Pour juger si le modèle d'erreur résiduelle est bien choisi, le diagnostic le plus direct est..."
    options:
      - "|IWRES| vs prédictions individuelles, qui isole l'écart entre l'observation et la prédiction du sujet"
      - "CWRES vs temps, qui juge le modèle structural et la variabilité au niveau de la population"
      - "WRES vs temps, qui reste calculé sous l'approximation FO même après une estimation FOCE"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Le bloc `PK` décrit ce que l'organisme fait au médicament. Le bloc `ERROR` décrit tout ce qui sépare la prédiction d'un patient de ce que le laboratoire a réellement mesuré. Il tient souvent en une ligne — et il décide pourtant de l'**essentiel**.

Car chaque observation entre dans la vraisemblance **divisée par son écart-type résiduel**. Un point que vous déclarez précis tire fort sur la courbe ; un point que vous déclarez bruité ne pèse presque rien. Écrire ce bloc, ce n'est pas décrire du bruit : c'est distribuer les **poids** de l'estimation.

Le piège est que rien ne prévient. Avec un mauvais modèle d'erreur, NONMEM converge, imprime des THETA d'allure raisonnable, et vous rend un modèle faux en silence. NONMEM impose par ailleurs une décision explicite sur les concentrations sous la limite de quantification : il ne devine pas à votre place.
<!-- /step -->

<!-- step:title="Intuition" viz="13_ResidualError" -->
Un `EPS` est le tirage de bruit d'**une** observation ; le bloc `SIGMA` en donne la variance. Toute la question tient alors en une phrase : **de quelle largeur est la barre d'erreur, et comment varie-t-elle avec la concentration ?**

Imaginez que vous dessiniez une barre d'erreur sur chaque point **avant** d'avoir vu l'ajustement. NONMEM tirera ensuite la courbe vers les points aux barres **courtes**, et laissera filer ceux aux barres longues. Le modèle d'erreur arbitre donc un bras de fer entre le **pic** et la **queue** du profil :

- **additive** : même barre partout (±0,08 mg/L au pic comme au creux). En valeur absolue tout le monde pèse pareil, donc les **fortes** concentrations, seules capables de gros écarts en mg/L, dominent la somme.
- **proportionnelle** : la barre grandit avec la prédiction. À 0,3 mg/L elle devient minuscule — ces points-là deviennent presque **inviolables** et commandent la queue terminale.

Aucun des deux n'a raison partout. C'est pourquoi le modèle **combiné** existe.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="61_ResidualError" -->
Autour de la prédiction individuelle $F_{ij}$ du sujet $i$ au temps $j$, les trois formes canoniques :

$$ y_{ij} = F_{ij} + \varepsilon_{1,ij} \qquad y_{ij} = F_{ij}\,(1 + \varepsilon_{1,ij}) \qquad y_{ij} = F_{ij}\,(1 + \varepsilon_{1,ij}) + \varepsilon_{2,ij} $$

avec $\varepsilon_k \sim \mathcal{N}(0, \sigma_k^2)$. Ce qui compte est l'écart-type que chacune implique :

| forme | écriture | écart-type du point |
|---|---|---|
| additive | `Y = F + EPS(1)` | $\sigma_1$ |
| proportionnelle | `Y = F*(1+EPS(1))` | $F_{ij}\,\sigma_1$ |
| combinée | `Y = F*(1+EPS(1)) + EPS(2)` | $\sqrt{(F_{ij}\sigma_1)^2 + \sigma_2^2}$ |

Le bloc `SIGMA` fournit des **variances** — pas des écarts-types. C'est une source d'erreur classique : une valeur de 0,04 sur une erreur proportionnelle signifie $\sigma_1 = 0{,}2$, soit un CV d'environ **20 %**.

```
$ERROR
  IPRED = F
  Y     = IPRED + IPRED*EPS(1) + EPS(2)   ; combinee
$SIGMA
  0.04        ; proportionnel : CV ~ 20 %
  0.0064      ; additif       : SD ~ 0.08 mg/L
```

La forme purement proportionnelle a un défaut structurel : quand $F \to 0$, l'écart-type tend vers zéro. Le modèle affirme alors une précision **infinie** près de la LOQ, et ces points captent un poids démesuré. Le terme additif est le **plancher** qui empêche cet effondrement.

:::howto
**La paramétrisation par W.** En pratique on écrit rarement la forme naïve. On fixe la variance résiduelle à 1 et on estime les écarts-types comme des THETA :

```
$ERROR
  IPRED = F
  W     = SQRT(THETA(4)**2 + (THETA(5)*IPRED)**2)
  Y     = IPRED + W*EPS(1)
  IRES  = DV - IPRED
  IWRES = IRES/W
$THETA (0,0.08)   ; a : SD additive (mg/L)
       (0,0.13)   ; b : SD proportionnelle (fraction)
$SIGMA 1 FIX
```

Trois bénéfices : on lit les termes **en unités physiques** (0,08 mg/L et 13 %) au lieu de variances ; les bornes `(0,...)` garantissent leur positivité ; et `IWRES` devient disponible explicitement pour les tables de sortie.
:::

**Les trois résidus** — ils ne répondent pas à la même question :

$$ \text{IWRES}_{ij} = \frac{y_{ij} - \text{IPRED}_{ij}}{W_{ij}} $$

- **IWRES** compare l'observation à la prédiction **du sujet** : il juge le modèle d'erreur lui-même, et lui seul.
- **CWRES** est un résidu de **population**, linéarisé autour de l'ETA estimé du sujet — donc cohérent avec ce que FOCE optimise. Il doit ressembler à un $\mathcal{N}(0,1)$ ; ses motifs trahissent le modèle **structural** ou les covariables.
- **WRES** reste calculé sous l'approximation **FO**, autour de $\eta = 0$, y compris après une estimation FOCE. Il est donc incohérent avec le modèle ajusté et signale régulièrement des défauts qui n'existent pas. C'est un vestige : CWRES l'a remplacé.
<!-- /step -->

<!-- step:title="Exemple concret" -->
Un antibiotique, 60 patients, 480 concentrations, LOQ = 0,25 mg/L. **58 points (12 %)** reviennent du laboratoire en BQL, presque tous des creux tardifs.

**Réflexe M1** — on les jette, via une clause `IGNORE(BQL.EQ.1)` dans le bloc de données. Le modèle tourne, converge proprement. Il rend CL = 4,1 L/h, demi-vie terminale 9,8 h, et un terme additif qui s'effondre à 0,02 mg/L.

**Le problème** est que les BQL ne manquent pas au hasard. À un temps tardif donné, ne survivent que les patients dont la concentration est **au-dessus** de la moyenne : on ne supprime pas du bruit, on **tronque la queue par le bas**. La pente terminale paraît plus plate, la clairance sort **sous-estimée**, et le terme additif n'a plus aucune donnée basse pour l'informer. Refait en M3, le même jeu donne CL = 4,8 L/h, demi-vie 8,1 h, terme additif 0,09 mg/L — un écart de **15 %** sur la clairance.

Quinze pour cent sur CL, ce n'est pas une coquetterie de modélisateur : en dosage bayésien, un modèle qui sous-estime la clairance prédit des creux trop hauts et conduit à **sous-doser** le patient suivant.

**Les sept méthodes de Beal** — M1 écarte les BQL ; M2 les écarte mais conditionne la vraisemblance des points restants au fait d'être au-dessus de la LOQ ; **M3** les traite en données **censurées** ; M4 ajoute à M3 la contrainte de positivité ; M5 les remplace par LOQ/2 ; M6 ne garde que le premier BQL d'une série, à LOQ/2 ; M7 les remplace par zéro.

M3 est le choix de référence dès que la proportion de BQL dépasse quelques pour cent. Son principe : un point censuré n'apporte pas une valeur, mais une **information** — « la concentration était quelque part sous 0,25 ». On l'écrit comme une **probabilité**, celle que le point tombe sous la LOQ, via la fonction de répartition normale `PHI` :

```
$ERROR
  IPRED = F
  LOQ   = 0.25
  W     = SQRT(THETA(4)**2 + (THETA(5)*IPRED)**2)
  IF (BQL.EQ.0) THEN
    F_FLAG = 0
    Y = IPRED + W*EPS(1)          ; vraisemblance normale du point mesure
  ELSE
    F_FLAG = 1
    Y = PHI((LOQ - IPRED)/W)      ; probabilite que le point soit sous la LOQ
  ENDIF
$SIGMA 1 FIX
$ESTIMATION METHOD=1 INTER LAPLACIAN NUMERICAL
```

Mettre `F_FLAG` à 1 annonce à NONMEM que `Y` n'est plus une prédiction mais une **vraisemblance** — d'où `LAPLACIAN`, obligatoire ici. Le jeu de données doit porter une colonne indicatrice `BQL` déclarée en entrée, et les lignes censurées gardent un `DV` non manquant (par convention la LOQ), même s'il n'entre pas dans le calcul. Depuis NONMEM 7.3, déclarer la borne de censure via `YLO` offre un raccourci de même principe, sans coder `PHI` à la main.

:::note
Les OFV de M1 et de M3 ne sont **pas comparables** : ils ne portent pas sur les mêmes enregistrements. M3 ajoute 58 termes de vraisemblance que M1 ignorait. Comparer ces deux OFV n'a aucun sens — on compare les **estimations** et les diagnostics, pas les OFV.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" viz="62_ResidualPatterns" -->
Le piège le plus coûteux du modèle d'erreur ne se trouve pas dans son bloc : il est dans celui de l'estimation.

Demander `METHOD=1` sans `INTER` avec une erreur proportionnelle ou combinée est une **incohérence silencieuse**. Voici pourquoi. FOCE linéarise le modèle autour de l'ETA estimé de chaque sujet, mais la **variance résiduelle**, sans `INTER`, reste évaluée à $\eta = 0$. NONMEM attribue alors à **tout le monde** la barre d'erreur calculée sur la prédiction **typique**.

Or l'erreur proportionnelle fait précisément dépendre l'écart-type de $F$, donc de l'ETA du sujet. Un patient dont la clairance vaut le double de la clairance typique a de vraies concentrations plus basses, donc une vraie erreur absolue plus petite : lui coller la barre d'erreur du patient moyen fausse son poids. Les sujets extrêmes sont les plus mal traités, la variance résiduelle sort biaisée, et les ETA se déforment pour compenser.

La règle est sans exception : **erreur non additive → `INTER`**. Le surcoût est quelques minutes de calcul. Avec une erreur strictement additive, `INTER` ne change rien, puisque l'écart-type ne dépend alors plus de l'ETA.

:::pitfall
**Le `FIX` oublié.** Avec `Y = IPRED + W*EPS(1)`, si la variance résiduelle est estimée au lieu d'être fixée à 1, alors `W` et $\sigma$ se **multiplient** : seul leur produit est identifiable, jamais les deux séparément. NONMEM ne refuse pas de tourner — il dérive, l'étape de covariance échoue ou rend une matrice singulière, et THETA(4)/THETA(5) prennent des valeurs qui ne veulent plus rien dire. Dans cette paramétrisation, `1 FIX` n'est pas une option de style.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Le bloc d'erreur ne décrit pas du bruit : il distribue les **poids** de l'estimation. Chaque point entre dans la vraisemblance divisé par son écart-type.
- Trois formes : additive (`Y = F + EPS(1)`), proportionnelle (`Y = F*(1+EPS(1))`), combinée (`Y = F*(1+EPS(1)) + EPS(2)`). La variance résiduelle se déclare en **variance**, pas en écart-type.
- Préférer la paramétrisation par `W` avec une variance fixée à 1 : termes lisibles en unités physiques, positivité garantie, IWRES disponible.
- Erreur non additive → `INTER` à l'estimation, sans exception.
- BQL : M1 tronque la queue par le bas et sous-estime la clairance ; M3 traite les points comme **censurés** (`F_FLAG` à 1, `PHI`, `LAPLACIAN`) et reste le choix par défaut au-delà de quelques pour cent de BQL.
- Diagnostics : **IWRES** juge le modèle d'erreur, **CWRES** juge le reste, **WRES** est un vestige calculé sous FO.
<!-- /step -->

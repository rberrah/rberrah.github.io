---
id: "monolix-erreur-residuelle"
slug: "monolix-erreur-residuelle"
title: "Monolix — le modèle d'erreur résiduelle et la censure"
description: "Le bloc DEFINITION : errorModel constant, proportional, combined1 et combined2, le rôle de distribution, la censure BLQ native et la lecture des IWRES."
summary: "Choisir g(f) dans Monolix : les quatre errorModel et leurs mathématiques, combined1 contre combined2, normal contre logNormal, le BLQ traité en censure, et les IWRES qui jugent le tout."
track: "monolix"
order: 223
duration: "12 min"
level: "intermediate"
tags: ["monolix", "mlxtran", "error-model", "bql", "residuals"]
prerequisites: ["tools-monolix"]
glossary: []
slides: []
sources: ["monolix", "lavielle", "beal-bql", "savic-karlsson-shrinkage"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Vous passez un modèle de `combined1(a, b)` à `combined2(a, b)` en gardant les mêmes valeurs de a et de b. L'écart-type résiduel change le plus..."
    options:
      - "à la concentration f = a/b, où combined1 est exactement racine de 2 fois plus large que combined2 : c'est le maximum de leur écart"
      - "aux fortes concentrations, où le terme proportionnel b·f domine et où l'addition des écarts-types de combined1 s'emballe"
      - "aux faibles concentrations, où le terme additif a domine et où la mise au carré de combined2 écrase le plancher de bruit"
    correct: 0
  - prompt: "Dans `DEFINITION:`, vous écrivez `{distribution=logNormal, prediction=Cc, errorModel=constant(a)}` et le SAEM rend a = 0,15. Cela signifie que..."
    options:
      - "a vit sur l'échelle log : l'erreur vaut y = f·exp(0,15·e), soit un CV d'environ 15 %, et non un plancher de 0,15 mg/L"
      - "a vit sur l'échelle des observations : c'est un plancher de bruit de 0,15 mg/L, exactement comme avec distribution=normal"
      - "a est bien un écart-type en mg/L, mais rapporté à la médiane de la prédiction plutôt qu'à sa moyenne arithmétique"
    correct: 0
  - prompt: "Une ligne du jeu de données porte cens = 1 dans une colonne déclarée de type censored, et la LOQ dans la colonne d'observation. Monolix fait entrer ce point dans la vraisemblance..."
    options:
      - "par la probabilité que la concentration soit sous la LOQ, soit Phi((LOQ - f)/g) : c'est la méthode M3 de Beal, sans rien coder"
      - "par la densité normale évaluée en LOQ/2, valeur que Monolix impute à la place du point juste avant l'estimation"
      - "pas du tout : le point est écarté de l'estimation, et la colonne ne sert qu'à le repérer dans les graphiques de sortie"
    correct: 0
  - prompt: "Sur le graphique des IWRES contre les prédictions, le nuage est large aux faibles prédictions et se resserre nettement aux fortes. Le plus probable est que..."
    options:
      - "l'erreur déclarée est trop petite en bas de gamme : le modèle est proportionnel seul et le plancher additif manque"
      - "l'erreur déclarée est trop petite en haut de gamme : le modèle est constant seul et le terme proportionnel manque"
      - "le modèle structural décrit mal la phase terminale : c'est la forme de la courbe qui est en cause, pas le modèle d'erreur"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Le modèle d'erreur résiduelle tient en un mot-clé au bout d'une ligne de `DEFINITION:`. On le choisit souvent en dernier, par habitude, en se disant que ce n'est « que du bruit ».

C'est une erreur de lecture. Chaque observation entre dans la vraisemblance **divisée par son écart-type résiduel**. Ce mot-clé ne décrit donc pas du bruit : il distribue les **poids** de l'estimation. Il décide quels points le SAEM doit absolument respecter et lesquels il a le droit de rater. Changer `constant` en `proportional`, c'est changer la question à laquelle le SAEM répond — et il y répondra parfaitement, en silence, sans jamais vous prévenir qu'il optimise autre chose que ce que vous vouliez.

Monolix ajoute deux choses que NONMEM ne propose pas sous cette forme : un **deuxième** modèle combiné (`combined1` et `combined2` ne sont pas deux écritures du même modèle), et une gestion **native** de la censure — le BLQ se déclare dans le jeu de données, pas dans le code.
<!-- /step -->

<!-- step:title="Intuition" viz="61_ResidualError" -->
Le modèle d'erreur répond à une seule question : **à quelle distance de sa prédiction une observation devient-elle surprenante ?**

Un dosage réel a deux régimes de bruit, et ils n'ont rien à voir l'un avec l'autre :

- un **plancher**, en mg/L, indifférent à la concentration — bruit de fond, ligne de base, tout ce qui subsiste quand il n'y a presque plus rien à mesurer. C'est `constant(a)` ;
- un **pourcentage**, qui grandit avec la concentration — dilutions, pipetage, calibration. C'est `proportional(b)`.

Un jeu de données de PK couvre couramment deux ou trois ordres de grandeur, du pic au dernier creux. Il traverse donc les deux régimes. Aucun modèle à un seul terme n'est juste sur toute la gamme : c'est très exactement pourquoi les modèles **combinés** existent, et pourquoi ils sont la réponse par défaut.

:::key
Le vrai levier est ailleurs : $g(f)$ est le **poids**. Dans la vraisemblance, un point coûte $(y-f)^2/g^2$. Petit $g$ = point déclaré précis = point lourd. Déclarer une erreur proportionnelle, c'est dire au SAEM « les creux sont mes points précis, obéis-leur ». Déclarer une erreur constante, c'est dire « le pic et le creux sont aussi précis l'un que l'autre » — et comme seuls les points élevés peuvent produire de gros écarts en mg/L, ce sont eux qui domineront la somme. Vous ne décrivez pas un dosage : vous arbitrez quelle partie du profil le modèle a le droit de manquer.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="61_ResidualError" -->
Monolix écrit toutes ses observations sous une seule forme :

$$ h(y_{ij}) = h(f_{ij}) + g(f_{ij}) \cdot \varepsilon_{ij}, \qquad \varepsilon_{ij} \sim \mathcal{N}(0,1) $$

Une ligne de `DEFINITION:` ne fait que remplir les deux trous de cette formule :

- `distribution=` choisit $h$, la **transformation** de l'observation ;
- `errorModel=` choisit $g$, la **fonction d'écart-type**.

Ce sont deux réglages **indépendants**, et la moitié des malentendus vient de les confondre.

**Les quatre `errorModel`.**

| errorModel | $g(f)$ | ce que ça dit |
|---|---|---|
| `constant(a)` | $a$ | plancher seul, en mg/L |
| `proportional(b)` | $b \cdot f$ | pourcentage seul |
| `combined1(a, b)` | $a + b \cdot f$ | somme des **écarts-types** |
| `combined2(a, b)` | $\sqrt{a^2 + (b \cdot f)^2}$ | somme des **variances** |

```
DEFINITION:
y1 = {distribution=normal, prediction=Cc, errorModel=constant(a)}
y1 = {distribution=normal, prediction=Cc, errorModel=proportional(b)}
y1 = {distribution=normal, prediction=Cc, errorModel=combined1(a, b)}
y1 = {distribution=normal, prediction=Cc, errorModel=combined2(a, b)}
```

**combined1 contre combined2.** Ce n'est pas une question de goût. `combined2` est le modèle que l'on obtient en supposant **deux sources de bruit indépendantes** — un plancher d'écart-type $a$ et un terme proportionnel d'écart-type $b f$. Indépendance, donc les **variances** s'additionnent : $g^2 = a^2 + (bf)^2$. C'est la forme qui a une justification statistique. `combined1` additionne les **écarts-types** : aucune paire de sources indépendantes ne produit cela, c'est une paramétrisation linéaire commode de l'écart-type, rien de plus.

Leur écart se calcule exactement. En posant $r = bf/a$ le rapport des deux régimes :

$$ \frac{g_{\text{combined1}}}{g_{\text{combined2}}} = \frac{1+r}{\sqrt{1+r^2}} $$

Ce rapport vaut 1 aux deux extrémités ($r \to 0$ : les deux valent $a$ ; $r \to \infty$ : les deux valent $bf$) et il est **maximal en $r = 1$**, c'est-à-dire exactement à la concentration $f = a/b$ où les deux régimes s'équilibrent. Il y vaut $\sqrt{2}$. Donc : `combined1` n'est **jamais** plus étroit que `combined2`, et il est au plus **41 % plus large**, dans une bande étroite de concentrations au milieu de la gamme.

Deux conséquences pratiques, opposées :

1. Les deux modèles **ajustent presque pareil**. Leur différence est confinée au milieu de la gamme. Les départager sur un $\Delta$OFV de 2 points, c'est départager du bruit.
2. Leurs paramètres ne sont **pas interchangeables**. Un $a$ et un $b$ estimés sous `combined1` ne décrivent pas la même erreur une fois recopiés dans `combined2`.

:::key
Ce point décide des traductions depuis NONMEM. L'écriture canonique `Y = F + F*EPS(1) + EPS(2)` donne $\mathrm{Var}(y) = \sigma_1^2 F^2 + \sigma_2^2$, donc un écart-type $\sqrt{\sigma_2^2 + (\sigma_1 F)^2}$ : c'est **`combined2`**, avec $a = \sigma_2$ et $b = \sigma_1$. Le modèle combiné par défaut de NONMEM, et la paramétrisation par `W = SQRT(THETA(4)**2 + (THETA(5)*IPRED)**2)` du chapitre NONMEM, sont tous deux des `combined2`. `combined1` correspondrait à `W = THETA(4) + THETA(5)*IPRED`. Traduire un modèle NONMEM en `combined1` parce que le nom vient en premier dans la liste est une faute silencieuse.
:::

**`distribution` : normal contre logNormal.**

- `normal` : $h$ = identité, donc $y = f + g\varepsilon$. Le support est $\mathbb{R}$ tout entier : le modèle accorde une probabilité non nulle à des concentrations **négatives**. Anodin tant que $f \gg g$, absurde dès que $f$ approche la LOQ — et cela se voit, la bande basse de la VPC passe sous zéro.
- `logNormal` : $h = \log$, donc $\log(y) = \log(f) + g\varepsilon$, soit $y = f \cdot e^{g\varepsilon}$. Support strictement positif, distribution asymétrique à droite.

Avec `logNormal` **et** `constant(a)`, on retrouve exactement le modèle d'erreur **exponentiel** : $y = f \cdot e^{a\varepsilon}$. Comme $e^{a\varepsilon} \approx 1 + a\varepsilon$ pour $a$ petit, l'écart-type sur l'échelle naturelle vaut environ $a \cdot f$ : le modèle se comporte comme un proportionnel, mais sans jamais rendre de valeur négative.

:::pitfall
Sous `logNormal`, le paramètre `a` vit sur l'échelle **log**. Il est **sans dimension** : c'est un CV, pas une concentration. Exactement, $CV = \sqrt{e^{a^2}-1}$, soit 15,1 % pour $a = 0{,}15$. Le mot-clé est le même, la syntaxe est la même, l'unité change avec `distribution`. Lire « $a = 0{,}15$ » comme un plancher de 0,15 mg/L alors que la loi est logNormale produit un nombre parfaitement plausible et parfaitement faux.
:::

Corollaire : sous `logNormal`, `constant(a)` **produit déjà** une erreur proportionnelle à la prédiction. Empiler un `proportional(b)` par-dessus compte deux fois le même effet. La combinaison est légale syntaxiquement ; elle est rarement ce que vous vouliez dire.

**La censure (BLQ).** Une observation « < LOQ » n'est ni une valeur manquante, ni un nombre : c'est une **inégalité**. Elle affirme que la vraie concentration est quelque part dans $(0, LOQ)$ — et c'est une information réelle, souvent la seule dont vous disposiez sur la phase terminale.

Monolix la prend au mot, et le fait dans le **jeu de données**, pas dans le modèle. Vous déclarez une colonne de type `censored` (usuellement `cens`) : `cens = 1` marque un point censuré à gauche, et la colonne d'observation porte alors la **LOQ elle-même**, pas une valeur imputée. Une colonne `limit` facultative fournit l'autre borne de l'intervalle.

Ce qui change dans la vraisemblance tient en un mot. Une observation ordinaire contribue par une **densité** :

$$ \frac{1}{g_{ij}}\,\varphi\!\left(\frac{y_{ij} - f_{ij}}{g_{ij}}\right) $$

une observation censurée contribue par une **probabilité** :

$$ P(y_{ij} < LOQ) = \Phi\!\left(\frac{LOQ - f_{ij}}{g_{ij}}\right) $$

C'est la méthode **M3** de Beal, et c'est tout : vous cochez un type de colonne, Monolix écrit la vraisemblance. Là où NONMEM demande un `F_FLAG`, un `PHI` à la main et un `LAPLACIAN`, la censure est ici un attribut de la **donnée**. Ce n'est pas un détail de confort : le coût d'entrée de M3 étant nul, il n'y a plus aucune excuse pour un LOQ/2.

Notez que $g$ apparaît **aussi** dans la contribution censurée. Le modèle d'erreur et la censure ne sont pas deux choix indépendants : c'est le terme additif $a$ qui gouverne la vitesse à laquelle $\Phi((LOQ-f)/g)$ sature quand $f$ passe sous la LOQ.

:::note
Réf. : documentation Monolix / MonolixSuite (Lixoft — Simulations Plus) pour la syntaxe de `DEFINITION:` et les types de colonnes ; Lavielle M., *Mixed Effects Models for the Population Approach* (Chapman & Hall/CRC) pour la formulation $h(y) = h(f) + g\varepsilon$ ; Beal S.L., *J Pharmacokinet Pharmacodyn* 2001 pour les méthodes M1-M7 de traitement des données sous la LOQ.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="62_ResidualPatterns" -->
Un médicament oral, profils riches sur 24 h, concentrations de 4 mg/L au pic jusqu'à la LOQ à **0,05 mg/L** — près de deux ordres de grandeur. Le SAEM tourne en `combined2` et rend $a = 0{,}02$ mg/L et $b = 0{,}12$.

Les deux régimes, en chiffres. Le basculement se situe en $f = a/b = 0{,}167$ mg/L :

| prédiction $f$ | $g$ sous combined2 | $g$ sous combined1 | écart |
|---|---|---|---|
| 0,05 (la LOQ) | 0,021 | 0,026 | +24 % |
| 0,167 ($=a/b$) | 0,028 | 0,040 | **+41 %** |
| 1,0 | 0,122 | 0,140 | +15 % |
| 4,0 (le pic) | 0,480 | 0,500 | +4 % |

On lit directement le résultat de la section précédente : l'écart culmine à $\sqrt{2}$ au point de bascule et s'efface aux deux bouts.

**Pourquoi le plancher existe.** Prenons un creux tardif : observation $y = 0{,}09$ mg/L, prédiction individuelle $f = 0{,}06$ mg/L. L'écart est de 0,03 mg/L — 30 ng/mL, soit à peu près le bruit du dosage à ce niveau. Un point sans histoire.

- Sous `combined2(0,02 ; 0,12)` : $g = \sqrt{0{,}02^2 + 0{,}0072^2} = 0{,}0213$, donc $\text{IWRES} = 0{,}03/0{,}0213 = 1{,}41$. Rien à signaler, et c'est correct.
- Sous `proportional(0,12)` seul : $g = 0{,}12 \times 0{,}06 = 0{,}0072$ mg/L, soit **7,2 ng/mL**. Le modèle vient d'affirmer qu'il résout cette concentration à 7 ng/mL près — sept fois mieux que la LOQ du dosage. $\text{IWRES} = 0{,}03/0{,}0072 = 4{,}17$. Un aberrant à 4 sigma, entièrement **fabriqué par le modèle d'erreur**.

Ce n'est pas cosmétique. À elle seule, cette observation pèse environ **13 unités de $-2LL$ de plus** sous `proportional` que sous `combined2`. Le SAEM fait ce qu'on lui demande : il déformera $Cl$ et $V$ sur toute la population pour aller chercher ce creux. Le terme additif n'est pas un paramètre de nuisance — c'est l'affirmation que le dosage a un plancher de bruit, et c'est lui qui empêche la vraisemblance de prendre au sérieux des prédictions proches de zéro.

**Comment on le voit.** L'IWRES est le résidu divisé par l'écart-type que le modèle d'erreur **revendique** :

$$ \text{IWRES}_{ij} = \frac{y_{ij} - f_i(t_{ij})}{g(f_i(t_{ij}))} $$

Cette division est tout l'intérêt du diagnostic : si $g$ est juste, les IWRES forment un nuage normal centré sur 0, d'écart-type 1, et de **même largeur partout**. D'où le graphique qui juge le modèle d'erreur — les IWRES contre les **prédictions**, pas contre le temps — et la règle de lecture : on lit la **largeur**, pas le centre.

- Nuage qui **s'ouvre** vers la droite (étroit en bas, large en haut) : $g$ est trop petit aux fortes concentrations. Vous êtes en `constant`, il manque le pourcentage.
- Nuage qui **se resserre** vers la droite (large en bas, étroit en haut) : $g$ est trop petit aux faibles concentrations. Vous êtes en `proportional`, il manque le plancher — c'est le creux à 4 sigma ci-dessus, répété sur tous les sujets.
- Nuage **courbé**, ou décentré de 0 : cela ne parle plus du modèle d'erreur. Un U contre le temps accuse le modèle **structural**. Aucun modèle d'erreur ne répare une faute de forme : il ne fait qu'élargir la bande jusqu'à ce que le défaut cesse d'être signalé.

:::recall
Un repère qui coûte deux secondes : $a$ doit atterrir dans le voisinage du bruit du dosage, donc du même ordre que la LOQ. Ici $a = 0{,}02$ pour une LOQ à 0,05 — cohérent. Si le SAEM vous rend $a = 0{,}6$ mg/L avec la même LOQ, $a$ ne mesure plus le dosage : il **éponge** un défaut structural. Regardez la courbe avant d'accepter le chiffre.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" -->
L'erreur évidente — laisser `constant` sur un jeu qui couvre deux ordres de grandeur — est **bruyante** : le nuage des IWRES s'ouvre en trompette, et vous le voyez en trois secondes. Bruyante, donc bon marché.

:::pitfall
Le vrai piège est l'inverse : des IWRES **trop beaux**. Protocole épars, trois prélèvements par sujet, trois effets aléatoires. Vous tournez en `combined2`, vous ouvrez le nuage des IWRES : bande serrée, pas de trompette, pas de tendance, écart-type des IWRES à 0,55. On dirait le plus beau graphique de résidus de votre carrière. Ce n'en est pas un. Avec trois observations et trois paramètres individuels, le SAEM peut quasiment **interpoler** les points de chaque sujet : les prédictions individuelles passent dans les données, les résidus individuels s'effondrent vers zéro, et les IWRES rétrécissent avec eux. C'est l'$\varepsilon$-shrinkage, et il se mesure : $\varepsilon\text{-shrinkage} = 1 - \mathrm{SD}(\text{IWRES}) = 45\ \%$. Vous ne regardez pas votre modèle d'erreur, vous regardez votre **protocole**. Près de la moitié du signal qui aurait dû se trouver dans ces résidus a été absorbée par les paramètres individuels — et avec lui, la capacité du graphique à détecter quoi que ce soit. Sous $\varepsilon$-shrinkage, un **mauvais** modèle d'erreur rend le même beau nuage.
:::

Deux réflexes en découlent.

**Lisez $\mathrm{SD}(\text{IWRES})$ avant la forme du nuage.** C'est une ligne sur les résidus exportés par Monolix. Loin de 1, le graphique n'a plus de puissance de détection, et la platitude du nuage ne prouve **rien** sur $g$. La séquence est : d'abord le chiffre, ensuite seulement la forme.

**Puis changez de diagnostic.** L'$\varepsilon$-shrinkage frappe tout ce qui conditionne aux paramètres individuels. Passez aux diagnostics par **simulation** — VPC, NPDE : ils sont construits en simulant depuis le modèle de population, donc ils voient le modèle d'erreur que vous avez réellement déclaré, et non celui qui survit une fois chaque sujet ajusté à ses propres points.

:::note
Ne confondez pas les deux shrinkages. Le $\eta$-shrinkage du chapitre précédent porte sur les effets **aléatoires** et abîme les graphiques ETA contre covariables. L'$\varepsilon$-shrinkage porte sur les **résidus** et abîme les IWRES. Même cause — un protocole peu informatif par sujet — mais deux victimes différentes, et il faut lire les deux.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Le modèle d'erreur ne décrit pas du bruit : $g(f)$ est le **poids** de chaque point dans la vraisemblance. Il arbitre quelle partie du profil le SAEM a le droit de rater.
- Une ligne de `DEFINITION:` remplit deux trous **indépendants** de $h(y) = h(f) + g\varepsilon$ : `distribution=` choisit $h$, `errorModel=` choisit $g$.
- Les quatre $g$ : `constant(a)` $= a$ ; `proportional(b)` $= bf$ ; `combined1(a,b)` $= a+bf$ ; `combined2(a,b)` $= \sqrt{a^2+(bf)^2}$.
- `combined2` additionne les **variances** (deux sources indépendantes) et c'est l'équivalent du `Y = F + F*EPS(1) + EPS(2)` de NONMEM ; `combined1` additionne les écarts-types. `combined1` n'est jamais plus étroit, au plus $\sqrt{2}$ fois plus large, exactement en $f = a/b$. Les $(a, b)$ ne se transposent pas de l'un à l'autre.
- `logNormal` + `constant(a)` = erreur exponentielle $y = f e^{a\varepsilon}$ : support positif, et `a` sur l'échelle **log** — un CV, pas des mg/L.
- BLQ : colonne de type `censored`, la LOQ dans la colonne d'observation. Le point contribue par $\Phi((LOQ-f)/g)$ — le M3 de Beal, natif, sans code, et donc plus aucune raison d'imputer LOQ/2.
- Jugez $g$ sur les IWRES contre **prédictions**, en lisant la **largeur** : nuage qui s'ouvre = pourcentage manquant ; qui se resserre = plancher manquant ; courbé = structural, pas résiduel.
- $\mathrm{SD}(\text{IWRES})$ avant la forme. $\varepsilon\text{-shrinkage} = 1 - \mathrm{SD}(\text{IWRES})$ : quand il est élevé, un beau nuage d'IWRES ne prouve rien — passez à la VPC et aux NPDE.
<!-- /step -->
</content>
</invoke>

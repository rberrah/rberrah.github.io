---
id: "nlmixr2-erreur-residuelle"
slug: "nlmixr2-erreur-residuelle"
title: "nlmixr2 — le modèle d'erreur résiduelle et le BLQ"
description: "Déclarer l'erreur dans model() : add, prop, pow, lnorm et leurs combinaisons ; les valeurs initiales dans ini(), le BLQ par les colonnes CENS et LIMIT, les diagnostics ggPMX et xpose.nlmixr2."
summary: "En nlmixr2 l'erreur se déclare avec un tilde et s'estime en écarts-types : les formes disponibles, le addProp qui vit dans le contrôle et non dans le modèle, le BLQ natif par CENS et LIMIT, et les diagnostics R."
track: "nlmixr2"
order: 4
duration: "12 min"
level: "intermediate"
tags: ["nlmixr2", "rxode2", "error-model", "bql", "residuals"]
prerequisites: ["tools-nlmixr2"]
glossary: []
slides: []
sources: ["nlmixr2", "fidler-nlmixr", "beal-bql", "berrah-residual"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Votre bloc model() se termine par `cp ~ add(add.err) + prop(prop.err)` et rien d'autre. La manière dont nlmixr2 combine les deux termes..."
    options:
      - "dépend de l'option addProp de l'objet de contrôle, dont la valeur par défaut est combined2 : le texte du modèle seul ne la fixe pas"
      - "dépend de l'ordre des termes sur la ligne : écrire add() avant prop() impose la somme des écarts-types, donc combined1"
      - "est toujours combined1, la somme des écarts-types, sauf si le jeu de données comporte une colonne de censure CENS"
    correct: 0
  - prompt: "Après une estimation, nlmixr2 vous rend `prop.err = 0,118`. Ce nombre s'interprète comme..."
    options:
      - "un écart-type relatif, donc un CV d'environ 11,8 % : nlmixr2 estime des écarts-types et non des variances"
      - "une variance relative, donc un CV d'environ 34 %, exactement comme la valeur correspondante d'un bloc SIGMA sous NONMEM"
      - "un écart-type en mg/L, donc un plancher de bruit de 0,118 mg/L indépendant du niveau de la concentration"
    correct: 0
  - prompt: "Une ligne censurée de votre jeu de données porte `CENS = 1`. La colonne `DV` de cette même ligne doit contenir..."
    options:
      - "la LOQ elle-même : nlmixr2 fait alors entrer la ligne par la probabilité que la concentration soit sous cette borne"
      - "la valeur zéro, que nlmixr2 reconnaît comme le code conventionnel d'une observation censurée à gauche"
      - "la moitié de la LOQ, valeur que nlmixr2 impute avant de traiter la ligne comme une observation ordinaire"
    correct: 0
  - prompt: "Dans le bloc `ini()`, un paramètre d'erreur résiduelle se déclare avec..."
    options:
      - "`<-`, comme un effet fixe : c'est son emploi dans une fonction d'erreur qui lui donne son rôle, pas sa déclaration"
      - "`~`, comme un effet aléatoire : nlmixr2 range les termes résiduels avec les variances des ETA, dans la même matrice"
      - "`<-` suivi de `fixed()`, seule écriture qui permette à nlmixr2 de distinguer un terme résiduel d'un effet fixe ordinaire"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
En nlmixr2, le modèle d'erreur résiduelle tient dans la dernière ligne de `model()`, et cette ligne ne ressemble à aucune autre : elle porte un **tilde**, pas une flèche. Ce n'est pas une coquetterie de syntaxe. Toutes les lignes au-dessus **calculent** quelque chose ; celle-ci **déclare** comment ce quelque chose a été observé.

Elle décide pourtant de l'essentiel, car chaque observation entre dans la vraisemblance **divisée par son écart-type résiduel**. Un point que vous déclarez précis tire fort sur la courbe ; un point que vous déclarez bruité ne pèse presque rien. Écrire cette ligne, ce n'est pas décrire du bruit : c'est distribuer les **poids** de l'estimation.

Deux choses distinguent nlmixr2 sur ce terrain, et il faut connaître les deux.

La bonne : nlmixr2 estime des **écarts-types**, directement dans les unités de la mesure. Pas de bloc `SIGMA`, pas de variance à fixer à 1, pas de `W` à écrire à la main. Tout ce que le chapitre NONMEM obtient au prix d'une paramétrisation astucieuse est ici le comportement par défaut.

La mauvaise : une partie du sens de votre ligne d'erreur ne se trouve **pas** dans le modèle. Elle se trouve dans l'objet de contrôle passé à l'estimateur. Un modèle nlmixr2 lu seul est, sur ce point précis, **ambigu** — et c'est le piège de ce chapitre.
<!-- /step -->

<!-- step:title="Intuition" viz="13_ResidualError" -->
Lisez `cp ~ add(add.err)` comme une phrase française : « `cp` est observée avec une erreur additive, dont l'écart-type s'appelle `add.err` ». Le tilde est exactement celui de `lm(y ~ x)` : à gauche ce qu'on observe, à droite le modèle de cette observation. nlmixr2 emprunte la grammaire de R plutôt que d'en inventer une.

Cette lecture a une conséquence pratique immédiate. `cp = centr/v` est une affectation : après cette ligne, `cp` **vaut** quelque chose. `cp ~ add(add.err)` ne change la valeur de rien du tout — elle branche `cp` sur la colonne d'observations et dit à l'estimateur quelle barre d'erreur mettre autour. Une fonction `model()` sans ligne à tilde ne définit aucune vraisemblance ; ce n'est plus un modèle à estimer, c'est un simulateur.

Reste à répondre à la seule question que pose le modèle d'erreur : **quelle largeur a la barre, et comment varie-t-elle avec la concentration ?** Un dosage réel a deux régimes de bruit, sans rapport l'un avec l'autre :

- un **plancher**, en mg/L, indifférent à la concentration — bruit de fond, ligne de base, tout ce qui subsiste quand il n'y a presque plus rien à mesurer. C'est `add()` ;
- un **pourcentage**, qui grandit avec la concentration — dilutions, pipetage, calibration. C'est `prop()`.

Un profil de PK couvre couramment deux ou trois ordres de grandeur, du pic au dernier creux. Il traverse donc les deux régimes, et aucune forme à un seul terme n'est juste sur toute la gamme. C'est très exactement pourquoi `add() + prop()` est la réponse par défaut.

:::key
Le vrai levier est ailleurs : l'écart-type $g(f)$ est le **poids**. Dans la vraisemblance, un point coûte $(y-f)^2/g^2$. Petit $g$ = point déclaré précis = point lourd. Déclarer `prop()` seul, c'est dire au SAEM « les creux sont mes points précis, obéis-leur ». Déclarer `add()` seul, c'est dire « le pic et le creux sont aussi précis l'un que l'autre » — et comme seuls les points élevés peuvent produire de gros écarts en mg/L, ce sont eux qui domineront la somme. Vous ne décrivez pas un dosage : vous arbitrez quelle partie du profil le modèle a le droit de manquer.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="61_ResidualError" -->
Toutes les formes de nlmixr2 se rangent sous une écriture unique :

$$ y_{ij} = f_{ij} + g(f_{ij}) \cdot \varepsilon_{ij}, \qquad \varepsilon_{ij} \sim \mathcal{N}(0,1) $$

La ligne à tilde ne fait que choisir $g$, la **fonction d'écart-type**.

| déclaration dans `model()` | $g(f)$ | ce que ça dit |
|---|---|---|
| `cp ~ add(a)` | $a$ | plancher seul, en mg/L |
| `cp ~ prop(b)` | $b \cdot f$ | pourcentage seul |
| `cp ~ pow(b, c)` | $b \cdot f^{c}$ | puissance, exposant $c$ estimé |
| `cp ~ add(a) + prop(b)` | $\sqrt{a^2 + (bf)^2}$ **ou** $a + bf$ | combiné — voir plus bas |
| `cp ~ add(a) + pow(b, c)` | $\sqrt{a^2 + (bf^{c})^2}$ **ou** $a + bf^{c}$ | combiné à exposant libre |
| `cp ~ lnorm(s)` | erreur exponentielle | $\log y = \log f + s\,\varepsilon$ |

`prop(b)` n'est que le cas $c = 1$ de `pow(b, c)`. Laisser l'exposant libre revient à demander aux données où se situe le régime réel du dosage entre le plancher pur ($c = 0$) et le pourcentage pur ($c = 1$) ; c'est souvent un paramètre mal identifié, à ne sortir que si la gamme est large et les données abondantes.

`lnorm(s)` donne $y = f \cdot e^{s\varepsilon}$ : support strictement positif, distribution asymétrique à droite. Comme $e^{s\varepsilon} \approx 1 + s\varepsilon$ pour $s$ petit, le modèle se comporte comme un proportionnel de CV $\approx s$, mais sans jamais rendre de valeur négative. Le paramètre `s` vit sur l'échelle **log** : il est sans dimension. Le lire comme des mg/L produit un nombre plausible et faux. Corollaire : `lnorm()` **produit déjà** une erreur proportionnelle à la prédiction — lui empiler un `prop()` compte deux fois le même effet.

**Le bloc `ini()` : deux opérateurs, deux rôles.**

```r
mod <- function() {
  ini({
    tka <- log(1.1)
    tcl <- log(2.8)
    tv  <- log(32)
    eta.cl ~ 0.09              # effet aleatoire : variance
    eta.v  ~ 0.04
    add.err  <- c(0, 0.03)     # ecart-type, mg/L, borne inferieure a 0
    prop.err <- c(0, 0.12)     # ecart-type relatif, fraction
  })
  model({
    ka <- exp(tka)
    cl <- exp(tcl + eta.cl)
    v  <- exp(tv  + eta.v)
    d/dt(depot) = -ka*depot
    d/dt(centr) =  ka*depot - (cl/v)*centr
    cp = centr/v
    cp ~ add(add.err) + prop(prop.err) + combined2()
  })
}
fit <- nlmixr2(mod, data, est = "saem")
```

Le chapitre précédent a posé la règle : dans `ini()`, le `~` déclare un **effet aléatoire** par sa variance, le `<-` déclare un **effet fixe**. Les paramètres résiduels n'ont pas de troisième voie — ils prennent le `<-`, exactement comme les theta. Écrire `add.err ~ 0.03` ne produit donc pas un terme résiduel : cela crée un ETA nommé `add.err` dont plus personne ne se sert. C'est la faute de débutant classique, et elle ne fait pas planter grand-chose.

Ce qui mène au point de nommage. **nlmixr2 n'a pas de bloc réservé aux paramètres d'erreur.** `add.err` et `prop.err` sont des noms de convention, pas des mots-clés : appelez-les `sigma.floor` et `cv.assay`, rien ne change. Un scalaire déclaré dans `ini()` devient un paramètre résiduel **parce qu'il est consommé par une fonction d'erreur** dans la ligne à tilde, et pour aucune autre raison. Le rôle vient de l'usage, pas de la déclaration.

:::key
Corollaire pratique : `add.err` et `prop.err` sont estimés comme des **écarts-types**, sur l'échelle naturelle de la mesure. Un `prop.err` de 0,118 est un CV de 11,8 %, à lire tel quel. Aucune racine carrée à prendre — c'est là que la traduction depuis NONMEM se casse : un `$SIGMA` de 0,0139 pour le même dosage est une **variance**, et $\sqrt{0{,}0139} = 0{,}118$. Recopier 0,0139 dans `prop.err <- 0.0139` déclare un CV de 1,4 % et un dosage dix fois trop précis.
:::

Deux écritures utiles dans `ini()` : les bornes, `add.err <- c(0, 0.03)` = borne inférieure 0 et valeur initiale 0,03 (la forme à trois éléments ajoute une borne supérieure) ; et le gel, `add.err <- fixed(0.05)`, pour imposer un plancher de bruit connu du laboratoire au lieu de l'estimer — utile quand les données basses sont trop rares pour l'informer.

**Le combiné, et où vit le choix.** Deux façons d'assembler un plancher et un pourcentage :

$$ g_{\text{combined1}} = a + b f \qquad\qquad g_{\text{combined2}} = \sqrt{a^2 + (b f)^2} $$

`combined2` est la forme qui découle de **deux sources de bruit indépendantes** : indépendance, donc les **variances** s'additionnent. C'est celle qui a une justification statistique, c'est l'équivalent exact du `Y = F + F*EPS(1) + EPS(2)` de NONMEM, et c'est le **défaut** de nlmixr2. `combined1` additionne les écarts-types : aucune paire de sources indépendantes ne produit cela, c'est une paramétrisation commode, rien de plus. Les deux ne diffèrent notablement qu'autour de $f = a/b$, où les régimes s'équilibrent — au plus d'un facteur $\sqrt{2}$.

Le point nlmixr2, lui, n'est pas mathématique. Il est que ce choix se règle **aussi** par l'option `addProp` de l'objet de contrôle, hors du modèle :

```r
nlmixr2(mod, data, est = "focei",
        control = foceiControl(addProp = "combined1"))
```

Écrire `+ combined2()` explicitement sur la ligne à tilde, comme dans le code plus haut, ancre le choix **dans le modèle** et le rend insensible au contrôle. Ce n'est pas une décoration : voyez le piège fréquent.

:::note
Réf. : projet nlmixr2 (documentation des modèles d'erreur, de la syntaxe `ini()`/`model()` et du format de données `CENS`/`LIMIT`) ; Fidler M., Wang W., Hallow K.M. et coll. pour l'implémentation et la validation de nlmixr/nlmixr2 ; Beal S.L., *J Pharmacokinet Pharmacodyn* 2001 pour les méthodes M1-M7 de traitement des données sous la LOQ.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="62_ResidualPatterns" -->
Un inhibiteur de kinase oral, 42 patients, 336 concentrations, de 12 mg/L au pic jusqu'à une **LOQ à 0,10 mg/L** — plus de deux ordres de grandeur. Le SAEM tourne sur le modèle ci-dessus et rend le tableau des paramètres de population :

| paramètre | Est. | %RSE | rétro-transformé |
|---|---|---|---|
| `tka` | 0,10 | 14 | $k_a$ = 1,11 h⁻¹ |
| `tcl` | 1,03 | 5,2 | $Cl$ = 2,80 L/h |
| `tv` | 3,47 | 3,1 | $V$ = 32,1 L |
| `add.err` | 0,031 | 9,4 | 0,031 mg/L |
| `prop.err` | 0,118 | 4,6 | 11,8 % |

Trois choses se lisent directement, sans calcul intermédiaire.

**Les unités.** `add.err` = 0,031 mg/L est un plancher de bruit, `prop.err` = 0,118 un CV de 11,8 %. Ce sont des écarts-types : la même erreur exprimée en NONMEM afficherait un `$SIGMA` de 0,000961 et 0,0139, et il faudrait deux racines carrées pour retrouver ces chiffres.

**La cohérence.** Le repère coûte deux secondes : `add.err` doit atterrir dans le voisinage du bruit du dosage, donc du même ordre que la LOQ. Ici 0,031 pour une LOQ à 0,10 — cohérent. Si le SAEM vous rend `add.err` = 0,9 mg/L avec la même LOQ, le paramètre ne mesure plus le dosage : il **éponge** un défaut structural. Regardez la courbe avant d'accepter le chiffre.

**Le point de bascule.** Il est en $f = a/b = 0{,}031/0{,}118 = 0{,}26$ mg/L. Au-dessus, le pourcentage commande ; au-dessous, le plancher. Un creux prédit à 0,15 mg/L reçoit $g = \sqrt{0{,}031^2 + 0{,}0177^2} = 0{,}036$ mg/L. Sous `prop(prop.err)` seul, il aurait reçu $g = 0{,}118 \times 0{,}15 = 0{,}018$ mg/L : le modèle affirmerait résoudre cette concentration à 18 ng/mL près, six fois mieux que sa propre LOQ. C'est ce que le terme additif empêche.

**Le BLQ.** Le laboratoire renvoie **47 points sur 336 (14 %)** sous la LOQ, presque tous des creux tardifs. Une observation « < LOQ » n'est ni une valeur manquante ni un nombre : c'est une **inégalité**, et souvent la seule information dont vous disposiez sur la phase terminale.

nlmixr2 la prend au mot, dans le **jeu de données**, pas dans le modèle. Deux colonnes suffisent : `CENS` marque la ligne (0 = observation ordinaire, 1 = censurée à gauche, -1 = censurée à droite) et `LIMIT` fournit l'autre borne de l'intervalle. Sur une ligne censurée, la colonne `DV` porte **la LOQ elle-même**.

```
ID  TIME   DV     AMT  EVID  CMT    CENS  LIMIT
7    0.0   .      200   1    depot   0     .
7    1.0   3.42   .     0    cp      0     .
7    8.0   0.61   .     0    cp      0     .
7   24.0   0.10   .     0    cp      1     .      <- BQL : DV porte la LOQ
```

La ligne censurée n'entre plus par une **densité** mais par une **probabilité** :

$$ P(y_{ij} < LOQ) = \Phi\!\left(\frac{LOQ - f_{ij}}{g(f_{ij})}\right) $$

C'est la méthode **M3** de Beal, obtenue en remplissant une colonne. Ajouter `LIMIT = 0` sur ces mêmes lignes borne l'intervalle à $(0;\ 0{,}10)$ au lieu de $(-\infty;\ 0{,}10)$ : c'est **M4**. Une colonne sépare les deux. Là où NONMEM réclame un `F_FLAG`, un `PHI` codé à la main et un `LAPLACIAN`, la censure est ici un attribut de la **donnée** — et le coût d'entrée de M3 étant nul, il n'y a plus d'excuse pour un LOQ/2.

Ce que ça change sur ce jeu, en refaisant tourner les deux :

| | $Cl$ (L/h) | `add.err` (mg/L) | %RSE de `add.err` |
|---|---|---|---|
| M1 — les 47 points écartés | 2,55 | 0,009 | 71 |
| M3 — `CENS = 1` | 2,80 | 0,031 | 9,4 |

Neuf pour cent d'écart sur la clairance, et ce n'est pas un hasard : les BQL ne manquent pas au hasard. À un temps tardif donné, seuls survivent les patients dont la concentration est **au-dessus** de la moyenne. On ne supprime pas du bruit, on **tronque la queue par le bas** — la pente terminale paraît plus plate et $Cl$ sort sous-estimée.

Le tell est dans la dernière colonne. Sans les BQL, `add.err` n'a plus aucune donnée basse pour l'informer : il s'effondre à 0,009 mg/L **et** son %RSE passe à 71. nlmixr2 vous imprime gratuitement le signe que le paramètre n'est plus identifié. Un %RSE à trois chiffres sur un terme résiduel additif est presque toujours cette histoire-là.

:::pitfall
Sur une ligne `CENS = 1`, `DV` doit contenir la **LOQ**, pas zéro et pas `NA`. nlmixr2 lit littéralement la borne que vous inscrivez : avec `DV = 0`, vous affirmez que la concentration était sous **zéro**. La probabilité $\Phi((0 - f)/g)$ s'écrase alors vers 0 pour toute prédiction positive, la vraisemblance explose, et le SAEM part écraser les prédictions tardives pour tenter de satisfaire une contrainte impossible. Le run ne refuse pas de tourner — il rend une clairance absurde et une pente terminale invraisemblable.
:::

**Les diagnostics.** L'IWRES est le résidu divisé par l'écart-type que le modèle d'erreur **revendique**, donc le seul graphique qui juge $g$ :

$$ \text{IWRES}_{ij} = \frac{y_{ij} - f_i(t_{ij})}{g(f_i(t_{ij}))} $$

Si $g$ est juste, le nuage est centré sur 0, d'écart-type 1, et de **même largeur partout**. D'où la règle de lecture : IWRES contre **prédictions** — pas contre le temps — et on lit la **largeur**, pas le centre. Nuage qui **s'ouvre** vers la droite : $g$ trop petit en haut de gamme, il manque le pourcentage. Nuage qui **se resserre** vers la droite : $g$ trop petit en bas de gamme, il manque le plancher. Nuage **courbé** contre le temps : cela ne parle plus du modèle d'erreur mais du modèle structural.

Le fit est un objet R, donc les deux écosystèmes de diagnostic s'y branchent directement :

```r
fit <- addCwres(fit)    # CWRES/CPRED : non calcules par defaut apres un SAEM
fit <- addNpde(fit)     # NPDE, par simulation depuis le modele de population

library(xpose.nlmixr2)
xpdb <- xpose_data_nlmixr2(fit)
absval_res_vs_pred(xpdb, res = "IWRES")   # la largeur, pas le centre
dv_vs_ipred(xpdb)

library(ggPMX)
ctr <- pmx_nlmixr(fit)
pmx_plot_iwres_ipred(ctr)
pmx_plot_npde_time(ctr)
pmx_report(ctr, name = "diag", save_dir = ".", format = "html")

vpcPlot(fit, n = 500)
sd(fit$IWRES)           # a lire AVANT la forme du nuage
```

:::recall
`sd(fit$IWRES)` avant tout le reste. L'$\varepsilon$-shrinkage vaut $1 - \mathrm{SD}(\text{IWRES})$ : sur un protocole épars, le SAEM peut quasiment **interpoler** les points de chaque sujet, les résidus individuels s'effondrent, et les IWRES rétrécissent avec eux. Loin de 1, le nuage n'a plus aucune puissance de détection — un **mauvais** modèle d'erreur rendra le même beau graphique. Passez alors aux diagnostics par simulation, `vpcPlot()` et les NPDE, qui voient le modèle de population que vous avez réellement déclaré.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Reprenez la ligne d'erreur la plus banale de nlmixr2, écrite sans modificateur :

```r
cp ~ add(add.err) + prop(prop.err)
```

Cette ligne **ne dit pas** comment les deux termes se combinent. Elle nomme deux paramètres et s'arrête là. Le reste — somme des variances ou somme des écarts-types — se décide dans l'objet de contrôle, par l'option `addProp`, dont le défaut est `"combined2"` :

```r
fit1 <- nlmixr2(mod, data, est = "focei")
fit2 <- nlmixr2(mod, data, est = "focei",
                control = foceiControl(addProp = "combined1"))
```

Même fonction `mod`, même jeu de données, **deux modèles d'erreur différents**. Sur le jeu de la section précédente, `fit1` rend `add.err` = 0,031 et `prop.err` = 0,118 ; `fit2` rend 0,021 et 0,109 — les estimations se déplacent pour compenser la forme plus large de `combined1`. Et l'OFV bouge de deux ou trois points, c'est-à-dire de rien : les deux formes ne diffèrent qu'au voisinage de $f = a/b$, donc elles ajustent presque pareil. Rien dans la sortie ne crie.

:::pitfall
La conséquence est que **la fonction `mod` seule ne définit pas votre modèle**. C'est contre-intuitif, parce que tout le reste y est : la structure, les ETA, les valeurs initiales. Vous envoyez `mod` à un relecteur, vous la collez dans un article, vous la reprenez six mois plus tard — et l'information manque. Pire, `saemControl()` porte la **même** option : reprendre le contrôle d'un collègue en changeant `est = "saem"` pour `est = "focei"` peut changer le modèle d'erreur au passage, alors que vous pensiez ne changer que d'algorithme. La parade tient en un modificateur : écrivez `+ combined2()` (ou `+ combined1()`) **dans la ligne à tilde**. Le choix redevient une propriété du modèle, le contrôle ne peut plus le contredire, et la fonction se lit seule.
:::

Le principe déborde largement le cas d'`addProp` : en nlmixr2, tout ce qui vit dans le contrôle échappe au modèle. C'est vrai aussi de l'OFV.

:::note
Le SAEM ne produit pas de vraisemblance comme sous-produit de son itération : nlmixr2 calcule donc l'OFV **après coup**, par défaut avec l'évaluateur FOCEi. Conséquence pour ce chapitre : un $\Delta$OFV entre un modèle `add()` et un modèle `add() + prop()` ne vaut que si les deux fits portent la **même** méthode d'OFV — `fit$objDf` liste celles qui ont été calculées, lisez-la avant de départager deux modèles d'erreur. Le chapitre sur les moteurs détaille pourquoi quatre nombres différents peuvent tous s'afficher sous le nom d'OFV.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La ligne à tilde de `model()` ne calcule rien : elle **déclare** comment la prédiction est observée. Sans elle, pas de vraisemblance — juste un simulateur.
- $g(f)$ est le **poids** de chaque point dans la vraisemblance, pas une description du bruit. Il arbitre quelle partie du profil le SAEM a le droit de rater.
- Les formes : `add(a)` $= a$ ; `prop(b)` $= bf$ ; `pow(b,c)` $= bf^{c}$ ; `lnorm(s)` $\Rightarrow y = f e^{s\varepsilon}$, où `s` est un CV sur l'échelle **log**, pas des mg/L.
- nlmixr2 estime des **écarts-types** dans les unités de la mesure : `prop.err` = 0,118 se lit « CV de 11,8 % », sans racine carrée. Pas de `SIGMA`, pas de `1 FIX`, pas de `W` — le confort que NONMEM demande de construire à la main.
- `ini()` : `~` pour un effet aléatoire, `<-` pour tout le reste. Un scalaire devient résiduel **parce qu'une fonction d'erreur le consomme**, pas parce qu'il est déclaré quelque part de spécial. Les noms sont libres.
- `add() + prop()` seul est **ambigu** : la combinaison vient de `addProp` dans le contrôle (défaut `combined2`, la somme des variances, équivalente au combiné de NONMEM). Écrivez `+ combined2()` dans la ligne à tilde pour que le modèle se lise seul.
- BLQ : colonnes `CENS` (1 = censuré à gauche) et `LIMIT`, la **LOQ dans `DV`**. Le point contribue par $\Phi((LOQ-f)/g)$ — le M3 de Beal sans une ligne de code, M4 en ajoutant `LIMIT = 0`. `DV = 0` sur une ligne censurée est une affirmation impossible qui fait dériver le run.
- Jugez $g$ sur les IWRES contre **prédictions**, en lisant la **largeur** : qui s'ouvre = pourcentage manquant ; qui se resserre = plancher manquant ; courbé = structural. Mais lisez `sd(fit$IWRES)` d'abord — sous $\varepsilon$-shrinkage, un beau nuage ne prouve rien.
- Un %RSE énorme sur `add.err` signale un plancher que plus aucune donnée basse n'informe — typiquement des BQL jetés.
<!-- /step -->


---
id: "nlmixr2-moteur"
slug: "nlmixr2-moteur"
title: "nlmixr2 — un modèle, quatre moteurs"
description: "est = focei, saem, nlme ou posthoc : changer d'algorithme sans toucher au modèle, ce que rxode2 compile derrière, et pourquoi les OFV rendus ne se comparent pas."
summary: "Le modèle est un objet R, l'estimateur est un argument : quatre moteurs consomment le même code compilé par rxode2 et rendent quatre nombres qui portent tous le nom d'OFV sans mesurer la même chose."
track: "nlmixr2"
order: 234
duration: "10 min"
level: "intermediate"
tags: ["nlmixr2", "rxode2", "saem", "focei", "estimation"]
prerequisites: ["tools-nlmixr2"]
glossary: []
slides: []
sources: ["nlmixr2", "fidler-nlmixr", "wang-rxode", "lindstrom-bates"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "On ajuste le même modèle deux fois, une fois avec est = saem et une fois avec est = focei, et on soustrait les deux OFV rendus. Que mesure cette différence ?"
    options:
      - "Rien d'exploitable : les deux nombres sont des valeurs de l'objectif FOCEi évaluées à deux jeux de paramètres différents, et leur écart dit surtout lequel des optimiseurs s'est le plus approché du maximum."
      - "Un test du rapport de vraisemblance valide dès lors que les deux modèles sont emboîtés : nlmixr2 ramène les deux OFV sur la même échelle, ce qui rend leur différence directement interprétable."
      - "L'écart d'approximation entre le SAEM et le FOCEI : il suffit de le retrancher du ΔOFV avant de comparer ce dernier au seuil du χ² à un degré de liberté pour trancher entre les modèles."
    correct: 0
  - prompt: "Que fait exactement est = posthoc dans nlmixr2 ?"
    options:
      - "Il fixe les paramètres de population aux valeurs du bloc ini et n'estime que les η individuels : c'est une estimation bayésienne a posteriori, pas un ajustement de population."
      - "Il réestime les paramètres de population à partir des η individuels du run précédent, ce qui affine les θ sans relancer une optimisation complète de la population."
      - "Il relance une estimation FOCEI en partant des estimations du run précédent, ce qui sert surtout à vérifier qu'un optimum déjà trouvé n'est pas seulement local."
    correct: 0
  - prompt: "Sur un modèle à élimination de Michaelis-Menten avec deux prélèvements par sujet, pourquoi le SAEM tourne-t-il là où le FOCEI patine ?"
    options:
      - "Sa boucle interne ne fait qu'échantillonner : elle propose un η, résout le modèle en avant une seule fois, accepte ou rejette — sans dérivée par rapport à η ni recherche de mode individuel."
      - "Il résout le système avec un intégrateur plus tolérant, ce qui absorbe la raideur que le solveur du FOCEI ne parvient pas à franchir sans effondrer son pas d'intégration."
      - "Il estime les η par quadrature de Gauss-Hermite, dont la précision ne se dégrade pas même quand la distribution conditionnelle du sujet devient très large avec deux points."
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Dans NONMEM, l'estimateur est une ligne du fichier de contrôle. Dans Monolix, c'est l'architecture même du logiciel. Dans nlmixr2, c'est un **argument de fonction** : `est = "focei"`, `est = "saem"`, `est = "nlme"`, `est = "posthoc"`. Un mot change, le modèle ne bouge pas d'une ligne, et un autre algorithme prend le relais.

Ce n'est pas une commodité d'interface, c'est le trait de conception. nlmixr2 sépare la **description** du modèle de son **évaluation** : le bloc `model({})` dit ce qu'est le système, `est =` dit qui va s'en charger. Le bénéfice est réel et rare — on peut comparer des estimateurs sur un modèle strictement identique, sans la moindre occasion de réécrire une équation de travers entre deux essais.

Le coût l'est tout autant, et il est moins visible. Quatre moteurs rendent quatre nombres qui s'affichent tous sous le nom d'`OFV`, dans le même résumé, avec le même nombre de décimales. Rien ne vous rappellera lequel est sorti d'où. Ce chapitre dit ce que chaque moteur fait réellement, lequel choisir et quand, et pourquoi la facilité du changement est exactement ce qui rend l'erreur facile.
<!-- /step -->

<!-- step:title="Intuition" viz="66_FOCELinearization" -->
Les quatre moteurs poursuivent **la même intégrale**. Pour chaque sujet, la vraisemblance des observations exige de moyenner sur tous les $\eta$ compatibles avec la population, et cette intégrale n'a pas de forme close dès que le modèle est non linéaire en $\eta$ — c'est-à-dire toujours, en PK. Le modèle ne dit rien de cette intégrale : il fournit seulement de quoi l'écrire. Ce que `est =` choisit, c'est la **manière de la contourner**.

**FOCEI la déforme.** Il remplace le modèle par sa tangente au mode individuel $\hat{\eta}_i$, ce qui rend l'intégrande gaussien et l'intégrale analytique. Le prix : il faut retrouver $\hat{\eta}_i$ pour chaque sujet à chaque itération de population, et il faut les dérivées $\partial f / \partial \eta$. Une boucle d'optimisation dans une boucle d'optimisation.

**SAEM ne la calcule pas.** Il traite les paramètres individuels comme des données manquantes et les simule par MCMC au lieu de les intégrer. Sa boucle interne propose un $\eta$, évalue le modèle **une fois**, accepte ou rejette. Aucune dérivée, aucun mode à trouver.

**nlme la déforme aussi**, mais par un autre chemin : l'algorithme alterné de Lindstrom et Bates, qui enchaîne un pas de moindres carrés non linéaires pénalisés et un pas de modèle linéaire mixte. Il aboutit en pratique à une approximation très proche de FOCE **sans** interaction.

**posthoc ne l'aborde pas du tout.** Les paramètres de population sont fixés ; il ne reste qu'à trouver les $\hat{\eta}_i$. Il n'y a plus de vraisemblance de population à maximiser.

:::key
Le choix d'un moteur n'est pas un choix de modèle. Les quatre ajustent le même système d'équations aux mêmes données. Ils diffèrent par ce qu'ils font de l'intégrale — donc par leur robustesse, leur coût, et surtout par la **fonction** dont ils rendent la valeur à l'arrivée. Le modèle est commun ; le nombre affiché, non.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="16_SAEMCycle" -->
Le modèle, écrit une fois, ne définit que deux densités : celle des observations sachant les paramètres individuels, $p(y_i \mid \psi_i)$, et celle des paramètres individuels dans la population, $p(\psi_i \mid \theta)$. La vraisemblance de population en découle mécaniquement, et elle est la même pour tout le monde :

$$ L(\theta) = \prod_{i=1}^{N} \int p(y_i \mid \psi_i)\; p(\psi_i \mid \theta)\; d\psi_i $$

Relisez maintenant la structure d'un modèle nlmixr2 avec cette formule en tête. Le bloc `ini({})` fixe le point de départ de $\theta$ et la structure de $p(\psi_i \mid \theta)$ ; le bloc `model({})` définit $p(y_i \mid \psi_i)$. **Ni l'un ni l'autre ne dit un mot de l'intégrale.** Le signe $\int$ n'appartient à aucun des deux blocs — il appartient au moteur. C'est toute la justification de l'argument `est =`.

| `est =` | Traitement de l'intégrale | Point d'appui | Besoin de $\partial f / \partial \eta$ |
|---|---|---|---|
| `"focei"` | Taylor d'ordre 1 + interaction $\eta$–$\varepsilon$ | $\hat{\eta}_i$ | oui |
| `"saem"` | échantillonnage MCMC, aucune linéarisation | — | non |
| `"nlme"` | Lindstrom-Bates (PNLS/LME alternés), $\approx$ FOCE sans interaction | $\hat{\eta}_i$ | oui |
| `"posthoc"` | pas d'intégrale : $\theta$ et $\Omega$ fixés, on ne cherche que les $\hat{\eta}_i$ | — | oui |

Le modèle, puis les quatre appels :

```r
mod <- function() {
  ini({
    tka <- log(1.1);  tcl <- log(0.135);  tv <- log(7.8)
    eta.cl ~ 0.09
    eta.v  ~ 0.04
    prop.err <- 0.12
  })
  model({
    ka <- exp(tka)
    cl <- exp(tcl + eta.cl)
    v  <- exp(tv  + eta.v)
    d/dt(depot) = -ka * depot
    d/dt(centr) =  ka * depot - (cl / v) * centr
    cp = centr / v
    cp ~ prop(prop.err)
  })
}

f1 <- nlmixr2(mod, dat, est = "focei",
              control = foceiControl(maxOuterIterations = 5000, covMethod = "r,s"))
f2 <- nlmixr2(mod, dat, est = "saem",
              control = saemControl(nBurn = 500, nEm = 300, nmc = 5, seed = 20260716))
f3 <- nlmixr2(mod, dat, est = "nlme")
f4 <- nlmixr2(mod, dat, est = "posthoc")
```

`mod` n'a pas bougé. Chaque moteur a son objet de contrôle — `foceiControl()`, `saemControl()`, `nlmeControl()` — et n'accepte que le sien : les réglages ne se transposent pas, parce que les algorithmes n'ont pas les mêmes leviers.

**Ce que rxode2 compile.** Entre `f1` et `f2`, ce qui change n'est pas le modèle : c'est son consommateur. rxode2 traduit le bloc `model({})` en **C**, le compile en bibliothèque partagée (`.dll` sous Windows, `.so` ailleurs) et la charge dans la session R. Le coût est payé une fois ; les dizaines de milliers de résolutions qui suivent sont des appels à du code machine, pas à de l'interprété. C'est aussi pourquoi un compilateur est requis — Rtools sous Windows — et pourquoi le premier ajustement d'un modèle marque un temps d'arrêt qui n'a rien à voir avec l'estimation.

Mais la nuance compte. Le SAEM ne demande que des résolutions **en avant** : il consomme la bibliothèque telle quelle. FOCEI, lui, réclame $\partial f / \partial \eta$ ; rxode2 dérive alors symboliquement le système et compile, à côté, les **équations de sensibilité en avant**. Le fichier source est identique, l'objet compilé ne l'est pas. Un `est = "focei"` qui suit un `est = "saem"` repasse donc par le compilateur, et ce n'est pas un caprice.

**Ce que devient l'OFV.** Ici se joue la particularité que personne ne lit dans la documentation. Comme partout, le SAEM maximise la vraisemblance sans jamais l'évaluer : à la fin d'un run SAEM, il n'y a rien à afficher. Monolix règle le problème par une tâche séparée qu'il faut demander. nlmixr2 le règle **silencieusement** : par défaut, il calcule l'OFV après coup, avec l'évaluateur **FOCEi**, aux estimations du SAEM.

```r
# l'OFV rendu apres un run SAEM : par defaut, l'objectif FOCEi evalue aux estimations SAEM
f2 <- nlmixr2(mod, dat, est = "saem", control = saemControl(logLik = FALSE))

# ou une vraie quadrature de Gauss-Hermite : nnodes.gq = 1 donne Laplace
f2q <- nlmixr2(mod, dat, est = "saem",
               control = saemControl(logLik = TRUE, nnodes.gq = 3, nsd.gq = 1.6))
```

Conséquence directe : dans nlmixr2, l'OFV d'un fit SAEM et celui d'un fit FOCEI sont sur la **même échelle**, produits par la **même fonction**. C'est plus honnête que de laisser deux logiciels afficher deux quantités incomparables. C'est aussi bien plus dangereux, parce que les deux nombres se ressemblent assez pour qu'on les soustraie sans y penser. L'option `adjObf`, active par défaut, aligne de surcroît la constante additive sur la convention de NONMEM : le nombre a jusqu'à l'allure familière.

:::note
Réf. : Fidler M. et coll., *CPT Pharmacometrics Syst Pharmacol* 2019, pour la conception de nlmixr et le partage d'un même modèle entre plusieurs estimateurs ; Wang W., Hallow K. M., James D. A., *CPT Pharmacometrics Syst Pharmacol* 2016, pour RxODE et la compilation du système d'EDO ; Lindstrom M. J., Bates D. M., *Biometrics* 1990, pour l'algorithme alterné qui sous-tend `est = "nlme"` ; documentation du projet nlmixr2 pour les noms des méthodes et des options de contrôle.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="15_OFVGame" -->
**Premier temps : le même script, quatre fois.** Un 1 compartiment oral, **40 sujets**, 6 prélèvements chacun, soit 240 observations, erreur proportionnelle. Le modèle est sage, les données sont riches : le cas le plus favorable qui soit.

| `est =` | Temps | $tvCl$ (L/h) | $\omega_{Cl}$ (CV %) | OFV rendu |
|---|---|---|---|---|
| `"focei"` | 38 s | 0,134 | 31 | **1487,2** |
| `"saem"` | 21 s | 0,131 | 33 | **1487,6** |
| `"nlme"` | 14 s | 0,138 | 28 | **1502,9** |
| `"posthoc"` | 1 s | 0,135 (fixé) | (fixé) | — |

Les paramètres se ressemblent, et c'est rassurant : sur un modèle bien posé, les estimateurs convergent vers la même région. Ce sont les OFV qu'il faut regarder.

**0,4 point entre FOCEI et SAEM.** Les deux nombres sont des valeurs de la **même** fonction — l'objectif FOCEi — évaluées en deux points différents. FOCEI a obtenu 1487,2 parce que c'est précisément cette fonction qu'il minimisait ; SAEM a obtenu 1487,6 parce qu'il minimisait autre chose et qu'on est venu mesurer son résultat avec la règle du voisin. Ces 0,4 point ne disent pas que FOCEI ajuste mieux. Ils disent que **l'optimiseur du FOCEi s'approche mieux du minimum du FOCEi que celui du SAEM**, ce qui n'est pas une information.

**15,7 points entre FOCEI et nlme.** Face à un seuil de 3,84 pour un degré de liberté, l'écart paraît écrasant. Il ne veut rien dire non plus : nlme ne rend pas l'objectif FOCEi, il rend celui de Lindstrom-Bates, sans interaction. Or l'erreur est ici **proportionnelle**, donc la variance résiduelle dépend de $\eta$, donc l'interaction n'est pas un détail. Les 15,7 points mesurent un **changement d'approximation**, exactement comme un `METHOD=0` face à un `METHOD=1 INTER` sous NONMEM. La seule nouveauté, c'est qu'il aura suffi d'un mot pour le déclencher.

**Deuxième temps : là où les moteurs cessent d'être interchangeables.** On garde les 40 sujets mais on descend à **2 prélèvements chacun** (80 observations) et on passe à une élimination de Michaelis-Menten.

```r
  model({
    ka <- exp(tka)
    vm <- exp(tvm + eta.vm)
    km <- exp(tkm)
    v  <- exp(tv  + eta.v)
    d/dt(depot) = -ka * depot
    d/dt(centr) =  ka * depot - (vm * (centr / v)) / (km + (centr / v))
    cp = centr / v
    cp ~ prop(prop.err)
  })
```

- `est = "focei"` : la boucle interne bute sur `maxInnerIterations` chez 11 sujets sur 40, l'optimiseur externe s'arrête sur un gradient indiscernable du bruit, `covMethod = "r,s"` ne rend pas de matrice. $tvVm = 12{,}4$ avec 84 % de RSE, et $\omega_{Vm}$ effondrée à 0,006.
- `est = "saem"` : tourne en 40 s. $tvVm = 9{,}7$, $\omega_{Vm} = 0{,}21$ (CV $\approx$ 46 %).

La mécanique est lisible. Avec deux points par sujet, la distribution conditionnelle de $\eta$ est très large et sa surface presque plate : FOCEI doit en chercher le mode pour chaque sujet, à chaque itération externe, et l'optimisation interne erre sur un plateau. Les sensibilités $\partial f / \partial \eta$ à travers un système de Michaelis-Menten n'arrangent rien. SAEM, lui, propose un $\eta$, résout une fois en avant, accepte ou rejette : l'information manquante devient une **variance**, pas une panne.

:::pitfall
Attention à la conclusion facile. Le SAEM n'a pas trouvé la vérité — il ne **peut pas** échouer, donc il rend un nombre quoi qu'il arrive. Son $\omega_{Vm}$ à 46 % dit exactement ce que criait FOCEI : deux prélèvements par sujet n'identifient pas un $V_m$ et un $K_m$ séparément. On change de moteur pour obtenir une estimation malgré un modèle raide ; jamais pour faire taire un moteur qui avait raison.
:::

:::howto
**Quel moteur, quand.**
**`"focei"`** dès qu'on a besoin d'une chaîne de ΔOFV — construction de covariables, comparaison de structures — et quand le travail finira sous NONMEM : c'est le même estimateur, les estimations se transposent. Exige des données correctes et un modèle qui se dérive.
**`"saem"`** sur les systèmes raides (Michaelis-Menten, Emax, TMDD), les protocoles épars, les valeurs initiales douteuses, les modèles à nombreux effets aléatoires. C'est le moteur qui démarre quand rien d'autre ne démarre.
**`"nlme"`** pour comparer à un héritage R ou reproduire une analyse ancienne. Rarement le bon premier choix.
**`"posthoc"`** pour appliquer un modèle publié, figé, à de nouveaux sujets : le script qui a estimé le modèle devient l'estimateur bayésien des paramètres individuels.
**La stratégie qui marche** : SAEM pour trouver la région, puis ses estimations comme valeurs initiales du FOCEI qui portera l'OFV. Mais alors **toute** la chaîne de comparaison est en FOCEI — pas seulement le dernier run.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le piège de nlmixr2 n'est pas qu'un moteur soit mauvais. C'est que **changer de moteur coûte un mot**, et qu'aucune trace ne subsiste dans le nombre qui en sort.

:::pitfall
Le résumé d'un fit nlmixr2 affiche toujours un `OFV`, toujours de la même façon. **Quatre machines différentes peuvent l'avoir produit** : l'objectif FOCEi à l'optimum du FOCEi ; l'objectif FOCEi aux estimations du SAEM (le défaut de `est = "saem"`) ; une log-vraisemblance par quadrature de Gauss-Hermite (`saemControl(logLik = TRUE)`), sur une autre échelle ; ou l'objectif de Lindstrom-Bates (`est = "nlme"`). Rien dans le nombre ne dit lequel. `adjObf` a même déjà recalé la constante sur la convention de NONMEM, si bien que l'ordre de grandeur est celui auquel vous vous attendiez.
:::

Le scénario est banal, et c'est ce qui le rend redoutable. Le modèle de base ne démarrait pas en FOCEI : on l'a passé en `est = "saem"`, **OFV = 1487,6**. Une fois les estimations en main, les valeurs initiales sont devenues bonnes, alors le modèle avec covariable est reparti en `est = "focei"` : **OFV = 1483,4**. On soustrait : **ΔOFV = 4,2**, contre un seuil de 3,84. On garde la covariable.

Sauf que le modèle de base, en FOCEI, valait **1487,2**. Le vrai ΔOFV de la chaîne FOCEI est $1487{,}2 - 1483{,}4 = 3{,}8$ — **sous** le seuil. Les 0,4 point qui ont fait basculer la décision ne venaient pas de la covariable : ils venaient de ce que le SAEM et le FOCEI ne s'arrêtent pas au même endroit sur la surface du FOCEi. Une covariable est entrée dans le modèle final pour une raison qui n'existe pas.

:::key
Une différence à 3,8 contre un seuil à 3,84 ne devrait de toute façon jamais se trancher sèchement. Mais le problème n'est pas la marge : c'est que l'analyste **croyait avoir 4,2**. Le bruit d'un moteur s'était glissé dans un chiffre qu'il lisait comme une propriété des données.
:::

Sous NONMEM, changer d'estimateur oblige à éditer `$ESTIMATION` : un acte délibéré, sur une ligne visible, archivée avec le run. Sous nlmixr2, c'est un argument d'appel, et l'objet `mod` — celui que vous relirez dans six mois — n'en garde **aucune trace**. Six mois plus tard, `fit1` et `fit2` sont deux objets R avec deux OFV, et votre tableau de ΔOFV ne se souvient plus que l'un était SAEM.

La discipline est simple, et elle est entièrement à votre charge : **un seul moteur par chaîne de comparaison**, décidé avant de commencer, et le `est =` écrit à côté de chaque OFV dans le journal de run — au même titre que le numéro du modèle. Le nombre, seul, ne le porte pas.
<!-- /step -->

<!-- step:title="À retenir" -->
- Le trait de conception de nlmixr2 : le modèle est un objet R, l'estimateur est un **argument**. `ini({})` et `model({})` décrivent les densités ; le signe $\int$ appartient au moteur, d'où `est =`.
- Quatre moteurs pour la même intégrale : `"focei"` la déforme (tangente en $\hat{\eta}_i$, avec interaction), `"saem"` l'échantillonne, `"nlme"` la déforme autrement (Lindstrom-Bates, $\approx$ FOCE sans interaction), `"posthoc"` ne l'aborde pas ($\theta$ fixé, seuls les $\hat{\eta}_i$ sont cherchés).
- **rxode2** compile le modèle en C, une fois, et toutes les résolutions suivantes sont du code machine. FOCEI a besoin des sensibilités $\partial f / \partial \eta$, que rxode2 dérive et compile en plus : même source, objet compilé différent — d'où la recompilation en passant de SAEM à FOCEI.
- **SAEM** pour les systèmes raides, les données éparses, les initiales douteuses : pas de dérivée, pas de mode individuel à trouver. **FOCEI** dès qu'une chaîne de ΔOFV est en jeu, ou que le travail finira sous NONMEM.
- L'OFV d'un run SAEM n'est **pas** un nombre du SAEM : nlmixr2 le calcule après coup avec l'évaluateur FOCEi (défaut), ou par quadrature de Gauss-Hermite avec `saemControl(logLik = TRUE)` — sur une autre échelle.
- Même échelle ne veut pas dire comparable. Soustraire l'OFV d'un fit SAEM et celui d'un fit FOCEI mesure lequel des deux optimiseurs s'approche le mieux du minimum du FOCEi, pas lequel des deux modèles ajuste mieux.
- Un seul moteur par chaîne de comparaison, choisi d'avance, et le `est =` consigné à côté de chaque OFV. La facilité du changement est exactement ce qui rend l'erreur facile.
<!-- /step -->

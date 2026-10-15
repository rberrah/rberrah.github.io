---
id: "nlmixr2-moteur"
slug: "nlmixr2-moteur"
title: "nlmixr2 — un modèle, plusieurs estimateurs"
description: "est = focei, saem, nlme ou posthoc : changer d'algorithme sans toucher au modèle, ce que rxode2 compile derrière, et les conditions nécessaires pour comparer les OFV rendus."
summary: "Le modèle est un objet R et l'estimateur un argument : plusieurs méthodes peuvent consommer le même code compilé par rxode2, avec des objectifs et conventions qu'il faut documenter."
track: "nlmixr2"
order: 234
duration: "10 min"
level: "intermediate"
tags: ["nlmixr2", "rxode2", "saem", "focei", "estimation"]
prerequisites: ["tools-nlmixr2"]
glossary: ["nlmixr2 / rxode2", "FOCE-I", "SAEM"]
slides: []
sources: ["nlmixr2", "fidler-nlmixr", "wang-rxode", "lindstrom-bates"]
software_verified_on: "2026-10-12"
software_version: "nlmixr2 7.0.1; nlmixr2est 7.1 documentation"
reviewed_on: "2026-10-12"
review_type: "author"
review_pending: true
reviewed_hash: "cc2222c8b1f2db59bc8c09761420ad2d0be23cd0bbf64ec52939fddcfb110678"
quiz:
  - prompt: "On ajuste le même modèle deux fois, une fois avec est = saem et une fois avec est = focei, et on soustrait les deux OFV rendus. Que mesure cette différence ?"
    options:
      - "Ce n'est pas un LRT valide : un même évaluateur FOCEi ne transforme pas deux ajustements obtenus par des estimateurs différents en deux maxima comparables d'une même chaîne de modèles emboîtés."
      - "Un test du rapport de vraisemblance valide dès lors que les deux modèles sont emboîtés : nlmixr2 ramène les deux OFV sur la même échelle, ce qui rend leur différence directement interprétable."
      - "L'écart d'approximation entre le SAEM et le FOCEI : il suffit de le retrancher du ΔOFV avant de comparer ce dernier au seuil du χ² à un degré de liberté pour trancher entre les modèles."
    correct: 0
  - prompt: "Que fait exactement est = posthoc dans nlmixr2 ?"
    options:
      - "Il fixe les paramètres de population aux valeurs du bloc ini et n'estime que les η individuels : c'est une estimation bayésienne a posteriori, pas un ajustement de population."
      - "Il réestime les paramètres de population à partir des η individuels du run précédent, ce qui affine les θ sans relancer une optimisation complète de la population."
      - "Il relance une estimation FOCEI en partant des estimations du run précédent, ce qui sert surtout à vérifier qu'un optimum déjà trouvé n'est pas seulement local."
    correct: 0
  - prompt: "Sur un modèle non linéaire et peu informatif, pourquoi le SAEM peut-il être plus robuste que le FOCEI ?"
    options:
      - "Il remplace la recherche répétée d'un mode individuel conditionnel par une procédure stochastique, ce qui peut mieux tolérer certaines surfaces difficiles ; sa convergence et l'identifiabilité doivent néanmoins être vérifiées."
      - "Il résout le système avec un intégrateur plus tolérant, ce qui absorbe la raideur que le solveur du FOCEI ne parvient pas à franchir sans effondrer son pas d'intégration."
      - "Il garantit une estimation correcte dès qu'il produit des paramètres numériques, même si les données n'identifient pas séparément les paramètres du modèle."
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Dans NONMEM, l'estimateur est une ligne du fichier de contrôle. Dans Monolix, c'est l'architecture même du logiciel. Dans nlmixr2, c'est un **argument de fonction**. `est = "focei"`, `"saem"`, `"nlme"` et `"posthoc"` sont ici quatre workflows représentatifs parmi les méthodes disponibles. Un mot change, le modèle ne bouge pas d'une ligne, et un autre algorithme prend le relais.

nlmixr2 sépare la **description** du modèle de son **évaluation** : le bloc `model({})` décrit le système et `est =` sélectionne la méthode d'estimation. Cette séparation permet d'appliquer plusieurs estimateurs au même code de modèle, tout en conservant des réglages et des conventions propres à chaque méthode.

La documentation `nlmixr2est` 7.1 expose aujourd'hui plusieurs familles : **FO/FOI**, **FOCE/FOCEI/FOCEP**, **Laplace/AGQ**, **SAEM**, `nlme` et `posthoc`. Elle liste aussi des méthodes de recherche par importance sampling (`imp`, `impmap`, `qrpem`), des méthodes non paramétriques (`npag`, `npb`) et des variantes mu-référencées, IRLS ou variationnelles. Ces noms ne désignent pas tous le même niveau de maturité ni le même objectif : les nouveautés annoncées comme méthodes de recherche doivent être vérifiées indépendamment, et `nlmixr2AllEst()` inclut également des alias et optimiseurs techniques.

Le coût l'est tout autant, et il est moins visible. Ces quatre workflows peuvent rendre des nombres affichés sous le nom d'`OFV`, dans le même résumé, avec le même nombre de décimales. Rien ne vous rappellera lequel est sorti d'où. Ce chapitre explique ces exemples sans prétendre épuiser les estimateurs disponibles dans nlmixr2.
<!-- /step -->

<!-- step:title="Intuition" viz="66_FOCELinearization" -->
Les méthodes d'estimation de population présentées ici traitent **la même intégrale** de différentes façons. Pour chaque sujet, la vraisemblance des observations exige de moyenner sur tous les $\eta$ compatibles avec la population, et cette intégrale n'a pas de forme close dès que le modèle est non linéaire en $\eta$ — situation fréquente en PK. Le modèle ne dit rien de cette intégrale : il fournit seulement de quoi l'écrire. Ce que `est =` choisit, c'est la **manière de l'approximer ou de l'échantillonner** ; `posthoc` est le cas distinct où les paramètres de population restent fixés.

**FOCEI utilise une approximation locale.** Il remplace le modèle par sa tangente au mode individuel $\hat{\eta}_i$, ce qui rend l'intégrande gaussien et l'intégrale analytique. Le prix : il faut retrouver $\hat{\eta}_i$ pour chaque sujet à chaque itération de population, et il faut les dérivées $\partial f / \partial \eta$. Une boucle d'optimisation dans une boucle d'optimisation.

**SAEM ne repose pas sur la même approximation locale déterministe.** Il traite les paramètres individuels comme des données manquantes et les simule par MCMC au lieu de rechercher leur mode conditionnel à chaque itération. Sa boucle interne propose un $\eta$, évalue le modèle, puis accepte ou rejette la proposition. Il n'utilise donc ni les mêmes dérivées ni la même optimisation interne que FOCEI.

**nlme utilise une autre approximation locale**, par l'algorithme alterné de Lindstrom et Bates, qui enchaîne un pas de moindres carrés non linéaires pénalisés et un pas de modèle linéaire mixte. Il aboutit en pratique à une approximation très proche de FOCE **sans** interaction.

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

Le SAEM utilise des résolutions **en avant**. FOCEI réclame en plus $\partial f / \partial \eta$ ; rxode2 dérive alors symboliquement le système et compile les **équations de sensibilité en avant**. Le fichier source est identique, mais l'objet compilé peut différer. Un `est = "focei"` qui suit un `est = "saem"` peut donc nécessiter une compilation adaptée aux sensibilités requises.

**Ce que deviennent les métriques.** SAEM estime les paramètres sans fournir, à lui seul, une valeur unique directement comparable à toutes les sorties d'autres moteurs. Selon les options et la version, nlmixr2 peut ajouter plusieurs évaluations après l'estimation. Avec `logLik = FALSE`, une OBJF peut notamment être évaluée par l'approximation FOCEi aux estimations SAEM ; avec `logLik = TRUE`, une log-vraisemblance peut être évaluée par quadrature de Gauss-Hermite.

```r
# l'OFV rendu apres un run SAEM : par defaut, l'objectif FOCEi evalue aux estimations SAEM
f2 <- nlmixr2(mod, dat, est = "saem", control = saemControl(logLik = FALSE))

# ou une vraie quadrature de Gauss-Hermite : nnodesGq = 1 donne Laplace
f2q <- nlmixr2(mod, dat, est = "saem",
               control = saemControl(logLik = TRUE, nnodesGq = 3, nsdGq = 1.6))
```

Les noms d'options sont dépendants de la version : les exemples utilisent la convention actuelle `nnodesGq` / `nsdGq`. Vérifiez la documentation de votre installation avant de recycler un ancien script.

`OBJF` et `logLik` ne sont donc pas des synonymes. AIC et BIC dérivent d'une log-vraisemblance donnée, avec une convention de comptage des paramètres et des observations ; ils ne décrivent pas automatiquement la même évaluation que l'OBJF affichée. La mention « SAEM OBJF by FOCEi approximation » décrit uniquement l'évaluateur de cette OBJF aux estimations SAEM : elle ne transforme pas toutes les vraisemblances présentes dans l'objet en évaluations FOCEi. Avant toute comparaison, consignez **estimateur, évaluateur, métrique, convention de signe et de constante, options et version**.

| Sortie après `est = "saem"` | Ce qu'elle représente | Interprétation correcte |
|---|---|---|
| paramètres SAEM | estimations de $\theta$, $\Omega$ et de l'erreur obtenues par approximation stochastique EM | résultat de l'estimation SAEM |
| `OBJF` avec `logLik = FALSE` | approximation FOCEi évaluée **aux paramètres SAEM** dans la configuration décrite ici | diagnostic post-estimation, pas « vraisemblance SAEM » ni preuve de comparabilité LRT |
| `logLik`, AIC et BIC | quantités liées à l'évaluation de vraisemblance retenue par l'objet et aux conventions de calcul | identifier explicitement l'évaluateur ; ne pas les déduire du seul libellé `OBJF` |
| `saemControl(logLik = TRUE)` | évaluation numérique postérieure à l'estimation par quadrature de Gauss-Hermite (`nnodesGq`, `nsdGq`) | approximation distincte, dont le coût croît rapidement avec la dimension |
| `est = "imp"`, `"impmap"` ou `"qrpem"` | estimateurs par importance sampling disponibles dans la série 7 et encore signalés comme méthodes de recherche | ne pas les confondre avec une simple OFV calculée après SAEM ; documenter méthode, version et réglages |

Les exemples ont été revérifiés avec la documentation nlmixr2 7.0.1 / nlmixr2est 7.1. Les valeurs par défaut FOCEI et SAEM ont changé dans la série 7 ; reproduire un ancien run exige donc de consigner la version et les objets de contrôle, pas seulement la graine.

:::note
Réf. : Fidler M. et coll., *CPT Pharmacometrics Syst Pharmacol* 2019, pour la conception de nlmixr et le partage d'un même modèle entre plusieurs estimateurs ; Wang W., Hallow K. M., James D. A., *CPT Pharmacometrics Syst Pharmacol* 2016, pour RxODE et la compilation du système d'EDO ; Lindstrom M. J., Bates D. M., *Biometrics* 1990, pour l'algorithme alterné qui sous-tend `est = "nlme"` ; documentation du projet nlmixr2 pour les noms des méthodes et des options de contrôle.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="15_OFVGame" -->
**Scénario pédagogique, pas benchmark reproduit.** Imaginez le même modèle oral à 1 compartiment ajusté successivement par FOCEI, SAEM, nlme et posthoc. Les estimations peuvent être proches sur des données informatives, mais les temps d'exécution dépendent du matériel et des réglages, et les nombres appelés `OFV` ne deviennent pas comparables parce qu'ils figurent dans le même tableau.

- FOCEI optimise une approximation conditionnelle de la vraisemblance.
- SAEM estime les paramètres par approximation stochastique ; une OBJF FOCEi éventuellement évaluée après coup n'est pas l'objectif que SAEM a optimisé.
- `nlme` utilise l'approximation de Lindstrom-Bates, sans interaction.
- `posthoc` fixe les paramètres de population et n'est donc pas un nouvel ajustement de population.

Une différence entre ces sorties peut refléter un **changement d'approximation ou de convention**, pas une amélioration du modèle. Seules des exécutions documentées, avec jeu de données, graine, versions et contrôles, autoriseraient à présenter des résultats numériques comme un benchmark.

**Deuxième temps : là où les moteurs peuvent cesser d'être interchangeables.** Imaginez maintenant un protocole épars et une élimination de Michaelis-Menten.

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

Dans ce type de situation, FOCEI peut atteindre `maxInnerIterations`, produire une covariance instable ou devenir sensible aux valeurs initiales, car il recherche un mode conditionnel pour chaque sujet. SAEM peut être plus robuste sur cette surface grâce à son exploration stochastique, sans que cela garantisse une convergence correcte ni une information suffisante dans les données.

:::pitfall
Attention à la conclusion facile. Le SAEM n'a pas trouvé la vérité parce qu'il a produit un nombre : diagnostics de convergence, identifiabilité et sensibilité aux valeurs initiales restent nécessaires. On change de moteur pour traiter une difficulté algorithmique documentée, jamais pour faire taire un diagnostic défavorable.
:::

:::howto
**Quel moteur, quand.**
**`"focei"`** dès qu'on a besoin d'une chaîne cohérente de ΔOFV — construction de covariables, comparaison de structures — et pour un contrôle croisé avec NONMEM. Les deux implémentations appartiennent à la même famille FOCEI, mais leurs dérivées, optimisations, réglages et conventions ne sont pas identiques ; les estimations ne se transposent donc pas automatiquement. Exige des données correctes et un modèle qui se dérive.
**`"saem"`** est souvent plus robuste lorsque les méthodes fondées sur une optimisation conditionnelle deviennent sensibles ou échouent, notamment sur certains systèmes non linéaires, protocoles épars ou modèles à nombreux effets aléatoires. Sa propre convergence et son identifiabilité doivent néanmoins être vérifiées.
**`"nlme"`** pour comparer à un héritage R ou reproduire une analyse ancienne. Rarement le bon premier choix.
**`"posthoc"`** pour appliquer un modèle publié, figé, à de nouveaux sujets : le script qui a estimé le modèle devient l'estimateur bayésien des paramètres individuels.
**Une stratégie possible** : utiliser SAEM pour obtenir des valeurs initiales, puis réajuster avec FOCEI lorsque la chaîne de comparaison doit reposer sur FOCEI. Dans ce cas, **tous** les modèles comparés doivent être réajustés avec la même méthode et les mêmes conventions ; le dernier run seul ne suffit pas.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le piège de nlmixr2 n'est pas qu'un moteur soit mauvais. C'est que **changer de moteur coûte un mot**, et qu'aucune trace ne subsiste dans le nombre qui en sort.

:::pitfall
Un objet nlmixr2 peut exposer plusieurs nombres : objectif FOCEi à l'optimum FOCEi, OBJF FOCEi évaluée aux estimations SAEM, log-vraisemblance par quadrature de Gauss-Hermite, ou objectif de Lindstrom-Bates. Le nom du champ et son ordre de grandeur ne suffisent pas à établir qu'ils ont le même évaluateur ou la même convention. Lisez la méthode, les contrôles et la version avant de comparer.
:::

Le scénario est banal, et c'est ce qui le rend redoutable. Un modèle de base ne démarre pas en FOCEI ; on l'ajuste avec SAEM, puis on utilise ses paramètres comme valeurs initiales d'un modèle avec covariable ajusté par FOCEI. Soustraire l'OBJF associée au premier ajustement de celle du second mélange alors deux chaînes d'estimation.

Il faut réajuster **le modèle de base et le modèle avec covariable avec le même FOCEI**, les mêmes conventions et des contrôles documentés. Seule cette différence constitue une candidate au LRT, sous ses autres hypothèses. L'écart qui disparaît après ce réalignement ne venait pas de la covariable, mais du changement d'estimateur ou d'évaluation.

:::key
Une décision proche d'un seuil ne devrait de toute façon jamais être mécanique. Mais le problème principal est antérieur : l'analyste croyait comparer deux modèles emboîtés sous une même fonction objectif alors qu'il comparait aussi deux procédures d'estimation.
:::

Sous NONMEM, changer d'estimateur oblige à éditer `$ESTIMATION` : un acte délibéré, sur une ligne visible, archivée avec le run. Sous nlmixr2, c'est un argument d'appel, et l'objet `mod` — celui que vous relirez dans six mois — n'en garde **aucune trace**. Six mois plus tard, `fit1` et `fit2` sont deux objets R avec deux OFV, et votre tableau de ΔOFV ne se souvient plus que l'un était SAEM.

La discipline est simple, et elle est entièrement à votre charge : **un seul moteur par chaîne de comparaison**, décidé avant de commencer, et le `est =` écrit à côté de chaque OFV dans le journal de run — au même titre que le numéro du modèle. Le nombre, seul, ne le porte pas.
<!-- /step -->

<!-- step:title="À retenir" -->
- Le trait de conception de nlmixr2 : le modèle est un objet R, l'estimateur est un **argument**. `ini({})` et `model({})` décrivent les densités ; le signe $\int$ appartient au moteur, d'où `est =`.
- Quatre workflows représentatifs : `"focei"` approche l'intégrale par tangente en $\hat{\eta}_i$ avec interaction, `"saem"` l'échantillonne, `"nlme"` l'approche autrement (Lindstrom-Bates, $\approx$ FOCE sans interaction), et `"posthoc"` fixe $\theta$ pour ne chercher que les $\hat{\eta}_i$. D'autres estimateurs existent dans nlmixr2.
- **rxode2** compile le modèle en C, une fois, et toutes les résolutions suivantes sont du code machine. FOCEI a besoin des sensibilités $\partial f / \partial \eta$, que rxode2 dérive et compile en plus : même source, objet compilé différent — d'où la recompilation en passant de SAEM à FOCEI.
- **SAEM** peut être plus robuste sur certaines surfaces conditionnelles difficiles, avec des données éparses ou des valeurs initiales sensibles ; cela ne garantit ni convergence ni identifiabilité. La raideur des EDO relève séparément du choix et du réglage du solveur rxode2, et ne justifie pas à elle seule SAEM. **FOCEI** est un choix cohérent lorsqu'une chaîne de ΔOFV fondée sur FOCEI est planifiée.
- `OBJF`, `logLik`, AIC et BIC ne sont pas interchangeables. Après SAEM, nlmixr2 peut ajouter plusieurs évaluations postérieures ; rapportez toujours l'évaluateur, la métrique, la convention, les options et la version.
- Même évaluateur ne veut pas dire LRT valide. Une OBJF FOCEi calculée aux estimations SAEM et une OBJF obtenue à l'optimum FOCEI correspondent à des paramètres issus de deux procédures différentes. Pour comparer des modèles emboîtés, réajustez-les avec la même chaîne d'estimation et d'évaluation, puis vérifiez aussi les hypothèses du LRT.
- Un seul moteur par chaîne de comparaison, choisi d'avance, et le `est =` consigné à côté de chaque OFV. La facilité du changement est exactement ce qui rend l'erreur facile.
<!-- /step -->

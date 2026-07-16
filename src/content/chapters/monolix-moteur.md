---
id: "monolix-moteur"
slug: "monolix-moteur"
title: "Monolix — le moteur SAEM"
description: "Pourquoi une approximation stochastique de l'EM plutôt qu'une linéarisation : les deux phases, la vraisemblance calculée à part, et ce que convergence veut dire ici."
summary: "Le SAEM ne déforme jamais le modèle, il l'échantillonne : exploration puis lissage, -2LL par échantillonnage d'importance, et une OFV non comparable à FOCE."
track: "monolix"
order: 5
duration: "10 min"
level: "intermediate"
tags: ["monolix", "saem", "estimation", "vraisemblance"]
prerequisites: ["tools-monolix"]
glossary: []
slides: []
sources: ["delyon-saem", "kuhn-lavielle-saem", "lavielle", "monolix"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Dans le graphe de convergence du SAEM, une trajectoire parfaitement plate pendant la phase de lissage indique..."
    options:
      - "peu de chose : le pas décroît vers zéro en phase de lissage, donc la trajectoire s'aplatit par construction, que la phase d'exploration ait trouvé le bon domaine ou non"
      - "que le maximum de vraisemblance est atteint : la phase de lissage ne se stabilise que si la phase d'exploration a effectivement convergé vers le bon domaine"
      - "que la chaîne MCMC de l'étape de simulation est mal réglée : un taux d'acceptation trop faible fige les paramètres individuels et donc les paramètres de population"
    correct: 0
  - prompt: "Monolix calcule la vraisemblance dans une tâche séparée de l'estimation parce que..."
    options:
      - "le SAEM maximise la vraisemblance sans jamais l'évaluer : ses étapes ne portent que sur les statistiques exhaustives du modèle à données complètes"
      - "le calcul de la vraisemblance est trop coûteux pour être refait à chaque itération : il n'est donc effectué qu'une seule fois, à la dernière itération du SAEM"
      - "la vraisemblance n'a de sens qu'une fois les paramètres individuels connus : elle exige donc que la tâche des paramètres individuels ait tourné avant elle"
    correct: 0
  - prompt: "Un -2LL de Monolix (échantillonnage d'importance) et une OFV de NONMEM (FOCE-I), sur le même jeu de données et le même modèle..."
    options:
      - "ne sont pas comparables en valeur absolue : ils estiment des fonctions différentes, et NONMEM omet de surcroît un terme constant que Monolix inclut"
      - "sont comparables dès lors que le modèle est identique : les deux quantités estiment la même vraisemblance marginale, au bruit de Monte-Carlo près"
      - "sont comparables après division par le nombre d'observations : la normalisation élimine la différence d'échelle entre les deux implémentations"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Ce qui distingue Monolix n'est pas son interface — c'est son moteur, et le fait qu'il n'y en ait qu'un. NONMEM propose le SAEM parmi une dizaine de méthodes d'estimation ; Monolix est **construit autour** du SAEM. Ce n'est pas une entrée dans une liste déroulante, c'est l'architecture du logiciel.

Trois particularités, souvent vécues comme des bizarreries par qui arrive de NONMEM, en découlent directement : la vraisemblance est une **tâche séparée** qu'il faut penser à demander ; le graphe de convergence a **deux phases** séparées par un trait vertical ; et un run **ne peut pas échouer** au sens où un run NONMEM échoue. Aucune des trois n'est un choix d'ergonomie. Ce chapitre remonte de ces symptômes à leur cause commune.
<!-- /step -->

<!-- step:title="Intuition" viz="16_SAEMCycle" -->
La vraisemblance de population exige d'intégrer les paramètres individuels, qu'on n'observe pas. Cette intégrale n'a pas de forme close dès que le modèle est non linéaire en ces paramètres — c'est-à-dire toujours, en PK/PD. Deux écoles s'affrontent depuis quarante ans.

**Déformer le modèle jusqu'à ce que l'intégrale devienne facile.** C'est FO, FOCE, Laplace : on linéarise le modèle autour de $\eta = 0$ ou autour du mode individuel, ce qui rend l'intégrande gaussien et l'intégrale analytique. On maximise ensuite *exactement* une fonction *approchée*.

**Ne pas calculer l'intégrale du tout.** C'est l'EM, et sa version stochastique le SAEM : les paramètres individuels sont traités comme des **données manquantes**, qu'on simule au lieu de les intégrer. Le modèle n'est jamais déformé — il est seulement évalué, en avant, pour des valeurs de paramètres tirées au sort.

La différence se voit mécaniquement, dans la boucle interne. À chaque itération, FOCE doit résoudre **pour chaque sujet** un problème d'optimisation — trouver le mode $\hat{\eta}_i$ — et a besoin des dérivées du modèle par rapport à $\eta$. Deux choses peuvent casser : l'optimisation interne peut ne pas converger, et les dérivées peuvent ne rien vouloir dire (une différence finie à travers une EDO raide ou le flanc quasi vertical d'un Emax ne mesure que du bruit d'intégrateur). La boucle interne du SAEM, elle, est un pas de Metropolis-Hastings : on propose un $\eta$, on évalue le modèle **une fois**, on accepte ou on rejette sur un rapport de vraisemblance. Aucune dérivée, aucun optimum interne.

:::key
La robustesse de Monolix aux modèles raides et aux données éparses est là, pas dans l'interface. Sur un sujet à deux prélèvements, FOCE cherche le mode d'une surface presque plate : l'optimisation interne patine et se plaint. Le SAEM échantillonne une distribution conditionnelle simplement très large. L'information manquante devient une **variance**, pas une panne.
:::

Le prix est double et il faut le payer les yeux ouverts. La réponse est **stochastique** : deux runs identiques ne rendent pas exactement le même chiffre. Et comme l'algorithme ne calcule jamais la vraisemblance, il ne vous en rend aucune à l'arrivée.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="67_SAEMConvergence" -->
La vraisemblance à maximiser intègre les paramètres individuels $\psi_i$ :

$$ L(\theta) = \prod_{i=1}^{N} \int p(y_i \mid \psi_i)\; p(\psi_i \mid \theta)\; d\psi_i $$

L'EM contourne l'intégrale en changeant de cible. Si on **connaissait** les $\psi_i$, maximiser serait trivial : ce ne seraient que des moyennes et des variances. On alterne donc entre estimer ce qu'on ne voit pas et maximiser comme si on le voyait :

$$ Q(\theta \mid \theta_k) = \mathbb{E}\left[ \log p(y, \psi \mid \theta) \;\middle|\; y,\; \theta_k \right] $$

Sauf que cette espérance est, elle aussi, une intégrale sans forme close. Le SAEM la remplace par une **approximation stochastique**, en trois sous-étapes par itération $k$ :

**S — Simulation.** Tirer $\psi^{(k)}$ dans la distribution conditionnelle $p(\psi \mid y, \theta_k)$, par MCMC. C'est le seul endroit où le modèle structural est appelé.

**A — Approximation.** Mettre à jour une moyenne mobile des statistiques exhaustives $S$ du modèle à données complètes :

$$ s_{k+1} = s_k + \gamma_k \left( S\big(y, \psi^{(k)}\big) - s_k \right) $$

**M — Maximisation.** Ré-estimer $\theta_{k+1}$ à partir de $s_{k+1}$, en **forme close** pour la famille exponentielle. C'est ce qui rend le M-step gratuit : il n'y a rien à optimiser numériquement.

Tout se joue dans $\gamma_k$. Delyon, Lavielle et Moulines (1999) donnent les deux conditions de convergence presque sûre : $\sum_k \gamma_k = \infty$ — le pas ne doit pas s'éteindre trop vite, sinon la suite se fige n'importe où — et $\sum_k \gamma_k^2 < \infty$ — il doit s'éteindre quand même, sinon le bruit ne s'efface jamais. Kuhn et Lavielle (2004) ont porté ce résultat aux modèles non linéaires à effets mixtes, en remplaçant le tirage exact du S-step par un noyau MCMC.

Monolix choisit $\gamma_k$ en **deux phases**, et c'est exactement la lecture du graphe de convergence :

**Phase 1 — exploration.** $\gamma_k = 1$. La récurrence se réduit à $s_{k+1} = S(y, \psi^{(k)})$ : aucune mémoire, chaque itération oublie la précédente. La suite $\theta_k$ **ne converge pas** — elle erre, à grands pas, dans la région de forte vraisemblance. C'est voulu : c'est ce qui rend le SAEM peu sensible aux valeurs initiales.

**Phase 2 — lissage.** $\gamma_k$ décroît, typiquement en $1/k^a$ avec $a$ entre $0{,}5$ et $1$. La mémoire s'allonge, chaque nouvelle simulation ne corrige plus $s_k$ que d'une fraction, le bruit de Monte-Carlo se moyenne et $\theta_k$ converge.

Dans le fichier projet, tout cela se règle explicitement :

```
<MONOLIX>

[TASKS]
populationParameters()
fim(method = StochasticApproximation)
logLikelihood(method = ImportanceSampling)   ; tache SEPAREE, a demander

[SETTINGS]
POPULATION:
exploratoryiterations = 500     ; phase 1 : pas constant, gamma = 1
smoothingiterations   = 200     ; phase 2 : pas decroissant, gamma ~ 1/k
exploratoryautostop   = yes     ; coupe la phase 1 sur critere
smoothingautostop     = yes
nbchains              = 5       ; chaines MCMC : peu de sujets => en mettre plus
simulatedannealing    = yes     ; freine la decroissance des variances en phase 1

LL:
nbfixediterations     = 10000   ; taille Monte-Carlo de l'echantillonnage d'importance
```

Deux réglages méritent un mot. `nbchains` : quand les sujets sont peu nombreux, une seule chaîne par sujet produit un bruit de simulation trop gros devant l'information des données ; Monolix duplique alors les sujets en plusieurs chaînes pour moyenner ce bruit. `simulatedannealing` : pendant l'exploration, les variances ($\omega^2$, les paramètres du modèle d'erreur) n'ont pas le droit de décroître plus vite qu'un coefficient imposé. Sans ce frein, le SAEM referme les variances autour des valeurs initiales dès les premières itérations — et il n'explore plus rien.

**La vraisemblance, calculée à part.** Relisez le M-step : il ne touche qu'à $s_{k+1}$, des statistiques du modèle à **données complètes**. À aucun moment l'algorithme n'évalue $L(\theta)$. Le SAEM maximise la vraisemblance sans jamais la calculer. À la fin du run vous avez $\hat{\theta}$ et rien à mettre en face — d'où la tâche `logLikelihood`, séparée.

Deux méthodes s'offrent alors, et le choix n'est pas neutre. `Linearization` linéarise le modèle autour des modes individuels : rapide, mais elle réintroduit exactement l'approximation que le SAEM avait évitée. `ImportanceSampling` est l'option honnête : elle réécrit l'intégrale du sujet $i$ comme une espérance sous une loi de proposition $h$ qu'on sait simuler,

$$ p(y_i \mid \theta) = \int p(y_i \mid \psi_i)\, p(\psi_i \mid \theta)\, d\psi_i = \mathbb{E}_h\!\left[ \frac{p(y_i \mid \psi_i)\; p(\psi_i \mid \theta)}{h(\psi_i)} \right] $$

et l'estime par la moyenne de $M$ tirages :

$$ \hat{p}(y_i \mid \theta) = \frac{1}{M} \sum_{m=1}^{M} \frac{p\big(y_i \mid \psi_i^{(m)}\big)\; p\big(\psi_i^{(m)} \mid \theta\big)}{h\big(\psi_i^{(m)}\big)}, \qquad \psi_i^{(m)} \sim h $$

La proposition $h$ est centrée sur la distribution conditionnelle du sujet — celle-là même que le SAEM vient d'échantillonner, on l'a donc gratuitement — mais avec des **queues lourdes** (une loi de Student plutôt qu'une gaussienne), pour qu'aucun tirage égaré dans une zone où $h$ est minuscule ne reçoive un poids explosif.

:::key
$\hat{p}(y_i \mid \theta)$ est un estimateur **sans biais** de la vraisemblance du sujet. Mais ce qu'on rapporte est $-2\log \hat{L}$, et le logarithme d'une moyenne n'est pas la moyenne des logarithmes : le $-2LL$ affiché est **bruité**, et légèrement biaisé. Monolix l'assume et publie son **erreur standard de Monte-Carlo** juste à côté. Ce n'est pas de la décoration.
:::

:::note
Réf. : Delyon B., Lavielle M., Moulines E., *Ann Statist* 1999, pour la convergence de l'approximation stochastique de l'EM ; Kuhn E., Lavielle M., *Comput Statist Data Anal* 2004, pour le SAEM-MCMC en modèles non linéaires à effets mixtes ; Lavielle M., *Mixed Effects Models for the Population Approach* (Chapman & Hall/CRC), pour l'échantillonnage d'importance ; documentation Monolix (Lixoft — Simulations Plus) pour les noms des tâches et des réglages.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="67_SAEMConvergence" -->
Un 1 compartiment oral, **60 sujets**, 10 prélèvements chacun, soit $n_{obs} = 600$ observations. Le modèle est assez sage pour que FOCE-I y soit quasi exact : c'est le cas le plus favorable qui soit à une comparaison.

- Monolix, SAEM puis échantillonnage d'importance : $-2LL = 2149{,}2$, erreur standard de Monte-Carlo $0{,}31$.
- NONMEM, FOCE-I, mêmes données, même modèle : $OFV = 1045{,}9$.

Un écart de 1 103 points. Ce n'est pas un désaccord entre les deux logiciels, c'est une **constante**. NONMEM omet de son objectif le terme $n_{obs}\log(2\pi)$, que Monolix inclut dans sa log-vraisemblance :

$$ n_{obs} \log(2\pi) = 600 \times 1{,}8379 = 1102{,}7 $$

Il reste $2149{,}2 - 1045{,}9 - 1102{,}7 = 0{,}6$ point, soit environ deux erreurs de Monte-Carlo plus le résidu de l'approximation FOCE. Les deux chiffres disent donc la même chose : ils ne sont simplement pas écrits dans la même unité de compte. Et sur un modèle moins sage, ce résidu cesserait d'être négligeable — sans qu'aucune constante ne vienne l'expliquer.

Second temps, plus utile au quotidien. On ajoute le poids sur $Cl$ et on relance :

- sans covariable : $-2LL = 2149{,}2 \pm 0{,}31$
- avec le poids : $-2LL = 2145{,}1 \pm 0{,}31$

$\Delta = 4{,}1$, contre un seuil de $3{,}84$ pour un $\chi^2$ à 1 degré de liberté à 5 %. On garde la covariable ? Prudence : les deux $-2LL$ sont bruités, et le bruit de leur différence vaut $\sqrt{0{,}31^2 + 0{,}31^2} \approx 0{,}44$. Le seuil se trouve à $(4{,}1 - 3{,}84)/0{,}44 \approx 0{,}6$ écart-type de la valeur estimée. Cette décision n'est pas portée par les données : elle est portée par la graine du générateur aléatoire.

:::recall
Le remède est arithmétique. L'erreur de Monte-Carlo décroît en $1/\sqrt{M}$ : passer `nbfixediterations` de 10 000 à 100 000 la divise par $\sqrt{10} \approx 3{,}2$, soit $\approx 0{,}10$ par run et $\approx 0{,}14$ sur la différence. Le $\Delta$ devient $4{,}1 \pm 0{,}14$ et la conclusion tient. **Règle pratique** : dès qu'un $\Delta OFV$ s'approche de son seuil à moins de quelques erreurs de Monte-Carlo, augmentez la taille de l'échantillonnage **avant** de conclure. Jamais après avoir vu le résultat qui vous arrange.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le SAEM ne peut pas échouer. Il fait les itérations que vous lui avez demandées, il s'arrête, il affiche des paramètres. Il n'existe pas de `MINIMIZATION SUCCESSFUL` chez Monolix, parce qu'il n'existe rien qui puisse renvoyer l'inverse. Le seul juge est le graphe de convergence — et c'est précisément là que le piège se referme.

:::pitfall
**La platitude de la phase 2 ne prouve rien : elle est garantie par construction.** En phase de lissage, $\gamma_k \to 0$, donc chaque nouvelle simulation ne corrige plus $\theta_k$ que d'une fraction décroissante. La trajectoire s'aplatit **parce que le pas s'éteint**, pas parce que le maximum est atteint. Si un paramètre montait encore au moment de la bascule, la phase 2 le **fige en pleine montée** et vous dessine une belle ligne horizontale à une valeur fausse. Vous lisez « convergé » sur ce qui n'est qu'une capture.
:::

Le diagnostic est donc **entièrement dans la phase 1** — la partie du graphe qui a l'air d'un désordre. Ce qu'on y cherche : chaque paramètre doit atteindre son plateau **nettement avant** le trait de bascule, puis y osciller avec un bruit franc et visible. Un plateau atteint à la 480e itération sur 500 n'est pas un plateau, c'est une coïncidence. Une trajectoire encore monotone à la bascule n'a pas fini d'explorer. Un $\omega$ qui glisse vers zéro sans jamais osciller signale un effet aléatoire que les données ne soutiennent pas.

L'auto-stop aggrave le tout : `exploratoryautostop` coupe la phase 1 sur un critère qui ne regarde qu'une fenêtre récente d'itérations, et une dérive assez lente le satisfait sans peine. Sur un modèle difficile, désactivez-le et rallongez `exploratoryiterations`. C'est le seul réglage du SAEM qui achète vraiment quelque chose.

Et le contrôle qui tranche : **relancez avec une autre graine et d'autres valeurs initiales.** Si $\hat{\theta}$ bouge au-delà du bruit annoncé, ce n'est pas le SAEM qui est en cause. C'est votre vraisemblance qui est plate ou multimodale — et aucun réglage d'algorithme ne réparera un modèle non identifiable.
<!-- /step -->

<!-- step:title="À retenir" -->
- Monolix ne propose pas le SAEM parmi d'autres méthodes : il est construit autour. Ses trois bizarreries apparentes en découlent.
- FOCE déforme le modèle pour rendre l'intégrale calculable ; le SAEM ne l'approche pas, il l'échantillonne. Pas de dérivée, pas d'optimisation interne par sujet : d'où la robustesse aux modèles raides et aux données éparses.
- Deux phases : exploration à pas constant ($\gamma_k = 1$, aucune mémoire, on erre exprès), puis lissage à pas décroissant ($\gamma_k \approx 1/k$, le bruit se moyenne, on converge). Fondement : Delyon–Lavielle–Moulines (1999), porté au non linéaire par Kuhn–Lavielle (2004).
- Le SAEM maximise la vraisemblance sans jamais l'évaluer : le $-2LL$ est une **tâche séparée**, par échantillonnage d'importance (l'option honnête) ou par linéarisation (celle qui annule l'avantage du moteur).
- Le $-2LL$ par échantillonnage d'importance est bruité : lisez son erreur de Monte-Carlo, et augmentez `nbfixediterations` avant de trancher un LRT serré.
- Le diagnostic de convergence est dans la phase 1. La phase 2 est plate par construction, y compris sur un paramètre figé au mauvais endroit.
- $-2LL$ de Monolix et OFV de NONMEM ne sont pas comparables en valeur absolue : fonctions différentes, plus une constante $n_{obs}\log(2\pi)$ d'écart.
<!-- /step -->

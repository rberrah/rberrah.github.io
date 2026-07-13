---
id: "ai-clustering"
slug: "ai-clustering"
title: "Sous-groupes cachés : clustering, PCA et RMT"
description: "Découvrir des phénotypes dans les paramètres individuels — clustering (k-means/kNN), réduction de dimension (PCA) et tri signal/bruit (RMT)."
summary: "Explorer les paramètres individuels par groupe : clustering non supervisé, PCA pour visualiser, RMT pour séparer signal et bruit."
track: "ai"
order: 19
duration: "16 min"
level: "advanced"
tags: ["ai", "clustering", "pca", "random-matrix-theory"]
prerequisites: ["bayes-ebes", "math-stats"]
glossary: ["EBE", "Covariable", "η", "θ"]
slides: []
sources: ["hastie-esl", "savic-karlsson-shrinkage"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Regrouper les paramètres individuels (EBE) par type de cancer peut révéler..."
    options:
      - "qu'un paramètre (ex. la clairance) dépend du type de cancer → une covariable"
      - "la dose optimale sans données"
      - "la structure chimique"
    correct: 0
  - prompt: "La PCA (analyse en composantes principales) sert à..."
    options:
      - "réduire la dimension en gardant les directions de plus grande variance"
      - "supprimer des patients"
      - "augmenter le nombre de paramètres"
    correct: 0
  - prompt: "En RMT (Random Matrix Theory), une valeur propre au-dessus du seuil λ₊ de Marchenko-Pastur indique..."
    options:
      - "une vraie corrélation (signal), pas du bruit"
      - "une erreur de calcul"
      - "un patient aberrant"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Après avoir estimé un modèle de population, on obtient les **paramètres individuels** de chaque patient (les EBE : clairance, volume…). Ces paramètres sont une mine : parfois, un sous-groupe **non prévu** s'y cache — par exemple la **clairance qui dépend du type de cancer**.

Trois outils pour l'explorer : le **clustering** (regrouper sans étiquette), la **PCA** (analyse en composantes principales, pour visualiser en 2D), et la **RMT** (théorie des matrices aléatoires, pour distinguer une vraie corrélation d'un artefact du hasard).
<!-- /step -->

<!-- step:title="Intuition" viz="63_ClusterPCA" -->
Tracez les paramètres individuels et **colorez par type de cancer** : si les nuages se séparent, c'est qu'un paramètre varie selon le groupe.

Un algorithme de **clustering** fait l'inverse : il regroupe les points **sans connaître** le type, à partir de leur seule position. Quand la séparation est nette, il **retrouve** les cancers — la preuve qu'il y a une vraie structure.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="63_ClusterPCA" -->
Le **k-means** partitionne en $k$ groupes en minimisant la distance intra-cluster :

$$ \min \sum_{i} \lVert x_i - \mu_{c(i)} \rVert^2 $$

où $\mu_c$ est le **centroïde** du cluster $c$. Le **kNN** (k plus proches voisins) sert plutôt à **classer** un nouveau patient d'après ses voisins, ou à bâtir un graphe de similarité.

:::howto
**La métaphore de la salle de classe.** On place les élèves selon deux notes (maths, sport) ; sans regarder leur classe, on repère des **paquets** naturels. Le k-means dessine des frontières autour de ces paquets ; le kNN, lui, devine la classe d'un nouvel élève d'après ses **voisins immédiats**.

**Côté maths.** Il faut **standardiser** les paramètres (CL ≈ 0,1 ; V ≈ 8 : échelles incomparables) avant de calculer des distances. Une simple **comparaison par groupe** (ANOVA, Kruskal-Wallis) confirme ensuite qu'un paramètre diffère bien entre types.
:::
<!-- /step -->

<!-- step:title="La réduction de dimension (PCA)" viz="63_ClusterPCA" -->
Avec **beaucoup** de paramètres (CL, V, Ka, Q, Tlag…), on ne peut pas tout tracer. La **PCA** projette les données sur les **directions de plus grande variance** :

$$ \text{PC}_1, \text{PC}_2 = \text{vecteurs propres de la covariance, par variance décroissante} $$

On visualise alors les patients dans le plan (PC₁, PC₂) — souvent 2–3 composantes suffisent à capturer l'essentiel de la variance, et les sous-groupes y apparaissent.

:::note
Réf. : Pearson (1901), Hotelling (1933) pour la PCA ; MacQueen (1967) pour le k-means.
:::
<!-- /step -->

<!-- step:title="Signal ou bruit ? (RMT)" viz="64_RMT" -->
Problème : avec peu de patients et beaucoup de paramètres, des **corrélations apparaissent par pur hasard**. Comment savoir lesquelles sont réelles ? La **Random Matrix Theory** répond.

Sous l'hypothèse « **tout est bruit** », les valeurs propres de la matrice de corrélation suivent la loi de **Marchenko-Pastur**, bornée par :

$$ \lambda_{\pm} = \left(1 \pm \sqrt{p/n}\right)^2 $$

:::howto
**La métaphore du brouhaha.** Dans une salle bruyante, la plupart des « signaux » ne sont que du bruit de fond (la cloche de Marchenko-Pastur). Une **vraie** conversation dépasse ce fond : de même, une valeur propre **au-dessus de $\lambda_+$** est une **vraie** corrélation (un facteur réel) ; en dessous, c'est du hasard.

**Côté maths.** Le seuil $\lambda_+$ dépend du rapport $p/n$ : plus on a de **patients** ($n$ grand), plus le fond de bruit se resserre et plus le signal ressort. On « nettoie » ainsi la matrice de corrélation en ne gardant que les composantes au-dessus de $\lambda_+$.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="63_ClusterPCA" -->
En oncologie, on modélise un médicament sur plusieurs cancers. En regroupant les **clairances individuelles**, on découvre trois nuages correspondant aux **types de tumeur** : la CL est plus basse dans l'un, plus haute dans l'autre.

Conclusion pratique : **ajouter le type de cancer comme covariable** sur la clairance — puis confirmer par l'OFV et la VPC. Le clustering a servi à **générer l'hypothèse**, le modèle à la **valider**.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Un algorithme de clustering trouve **toujours** des clusters.

:::pitfall
Le k-means renverra $k$ groupes même dans du bruit pur — la structure n'est réelle que si elle **résiste** (RMT, validation, sens biologique). De plus, les EBE sont **rétrécis** (shrinkage) : un clustering sur des EBE peu informatifs invente des sous-groupes. Enfin, corrélation n'est pas causalité : un sous-groupe « découvert » doit être **confirmé** comme covariable dans le modèle, pas supposé.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Les paramètres individuels (EBE) peuvent révéler des sous-groupes non prévus (ex. CL selon le type de cancer).
- Clustering (k-means) pour regrouper sans étiquette ; kNN pour classer ; toujours standardiser.
- PCA : réduire la dimension en gardant les directions de plus grande variance, pour visualiser.
- RMT : au-dessus de λ₊ = signal, en dessous = bruit ; plus de patients fait ressortir le vrai.
- Le clustering génère des hypothèses ; le modèle (covariable + OFV/VPC) les valide.
<!-- /step -->

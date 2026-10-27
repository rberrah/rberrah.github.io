---
id: "ai-clustering"
slug: "ai-clustering"
title: "Clustering, PCA et structures candidates"
description: "Explorer des structures candidates dans les paramètres individuels — clustering, réduction de dimension (PCA) et repère signal/bruit (RMT)."
summary: "Explorer les paramètres individuels par groupe : clustering non supervisé, PCA pour visualiser, RMT pour séparer signal et bruit."
track: "ai"
order: 19
duration: "16 min"
level: "advanced"
tags: ["ai", "clustering", "pca", "random-matrix-theory"]
prerequisites: ["bayes-ebes", "math-stats"]
glossary: ["EBE", "Covariable", "η", "θ"]
slides: []
sources: ["pearson-1901-pca", "marchenko-pastur", "hotelling-1933", "hastie-esl", "savic-karlsson-shrinkage"]
reviewed_on: "2026-10-09"
review_type: "author"
review_pending: true
reviewed_hash: "c39489299d5821a8f5e8607cde648a49215560618272eb193abc109ae4ef2bf7"
quiz:
  - prompt: "Regrouper les paramètres individuels (EBE) par type de cancer peut suggérer..."
    options:
      - "une association candidate à évaluer entre le paramètre et le type de cancer"
      - "que la variabilité résiduelle explique à elle seule les écarts observés"
      - "que le type de cancer doit devenir la variable réponse à prédire"
    correct: 0
  - prompt: "La PCA (analyse en composantes principales) sert à..."
    options:
      - "réduire la dimension en gardant les directions de plus grande variance"
      - "regrouper les patients en classes à partir de leurs étiquettes connues"
      - "sélectionner les covariables les plus corrélées à la variable réponse"
    correct: 0
  - prompt: "En RMT (Random Matrix Theory), une valeur propre au-dessus du seuil λ₊ de Marchenko-Pastur indique..."
    options:
      - "une déviation au modèle de bruit sous ses hypothèses"
      - "du bruit d'échantillonnage, à écarter comme non pertinent"
      - "une colinéarité parfaite entre deux paramètres du modèle"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Après avoir estimé un modèle de population, on obtient des **estimations de paramètres individuels** (EBE : clairance, volume…). On peut y explorer une structure non prévue — par exemple une association entre clairance et type de cancer — mais les EBE sont des estimations dépendantes du modèle et du shrinkage, pas des paramètres vrais observés.

Trois outils pour l'explorer : le **clustering** (regrouper sans étiquette), la **PCA** (analyse en composantes principales, pour visualiser en 2D), et la **RMT** (théorie des matrices aléatoires, pour repérer des composantes incompatibles avec un modèle de bruit simple).
<!-- /step -->

<!-- step:title="Intuition" viz="63_ClusterPCA" -->
Tracez les paramètres individuels et **colorez par type de cancer** : si les nuages se séparent, c'est qu'un paramètre varie selon le groupe.

Un algorithme de **clustering** regroupe les points **sans connaître** le type, à partir de leur position. Dans l'exemple synthétique, une séparation nette permet de retrouver les groupes construits. Cela montre le fonctionnement de l'algorithme, pas la découverte de cancers ou de phénotypes dans des données réelles.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="63_ClusterPCA" -->
Le **k-means** partitionne en $k$ groupes en minimisant la distance intra-cluster :

$$ \min \sum_{i} \lVert x_i - \mu_{c(i)} \rVert^2 $$

où $\mu_c$ est le **centroïde** du cluster $c$. Le **kNN** (k plus proches voisins) sert plutôt à **classer** un nouveau patient d'après ses voisins, ou à bâtir un graphe de similarité.

:::howto
**La métaphore de la salle de classe.** On place les élèves selon deux notes (maths, sport) ; sans regarder leur classe, on repère des **paquets** naturels. Le k-means dessine des frontières autour de ces paquets ; le kNN, lui, devine la classe d'un nouvel élève d'après ses **voisins immédiats**.

**Côté maths.** Des paramètres d'unités différentes doivent généralement être **standardisés** avant une distance euclidienne (CL ≈ 0,1 ; V ≈ 8 ici). Une **comparaison par groupe** préspécifiée (ANOVA, Kruskal-Wallis) peut ensuite tester une association sous ses hypothèses ; elle ne confirme pas un mécanisme causal.
:::
<!-- /step -->

<!-- step:title="La réduction de dimension (PCA)" viz="63_ClusterPCA" -->
Avec **beaucoup** de paramètres (CL, V, Ka, Q, Tlag…), on ne peut pas tout tracer. La **PCA** projette les données sur les **directions de plus grande variance** :

$$ \text{PC}_1, \text{PC}_2 = \text{vecteurs propres de la covariance, par variance décroissante} $$

On peut alors visualiser les patients dans le plan (PC₁, PC₂). La part de variance conservée doit être affichée : deux composantes peuvent être insuffisantes, et un groupe absent de la projection peut exister dans une autre direction — ou l'inverse.

:::note
Réf. : Pearson (1901), Hotelling (1933) pour la PCA ; MacQueen (1967) pour le k-means.
:::
<!-- /step -->

<!-- step:title="Signal ou bruit ? (RMT)" viz="64_RMT" -->
Problème : avec peu de patients et beaucoup de paramètres, des **corrélations apparaissent par pur hasard**. Comment repérer les composantes incompatibles avec un modèle nul explicite ? La **Random Matrix Theory** fournit un repère, sous ses hypothèses.

Sous l'hypothèse « **tout est bruit** », les valeurs propres de la matrice de corrélation suivent la loi de **Marchenko-Pastur**, bornée par :

$$ \lambda_{\pm} = \left(1 \pm \sqrt{p/n}\right)^2 $$

:::howto
**La métaphore du brouhaha.** Dans une salle bruyante, le modèle nul décrit le bruit de fond attendu (le spectre de Marchenko-Pastur). Une conversation peut dépasser ce fond : de même, une valeur propre **au-dessus de $\lambda_+$** est incompatible avec le spectre attendu sous ce modèle et ses hypothèses. Cela désigne une composante à examiner, sans démontrer une causalité, une corrélation « vraie » ou une réalité biologique.

**Côté maths.** Le seuil $\lambda_+$ dépend du rapport $p/n$ et des hypothèses du modèle nul (variables centrées, bruit idéal, indépendance approximative). Plus on a de **patients** ($n$ grand), plus le fond de bruit se resserre. On peut ainsi proposer un « nettoyage » de la matrice de corrélation, à valider par stabilité et sens biologique.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="63_ClusterPCA" -->
Dans le scénario synthétique affiché, trois types de tumeur construits ont des clairances moyennes différentes. Le k-means reçoit seulement CL et V ; en variant la séparation et la standardisation, on voit quand ses groupes ressemblent ou non aux étiquettes simulées.

Dans une analyse réelle, un résultat analogue pourrait motiver l’évaluation du **type de cancer comme covariable** sur la clairance. Le clustering génère une hypothèse ; la stabilité, les diagnostics du modèle, l'évaluation prédictive et une validation externe éventuelle apportent ensuite des éléments convergents, sans établir à eux seuls un mécanisme causal.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Un algorithme de clustering trouve **toujours** des clusters.

:::pitfall
Le k-means renverra $k$ groupes même dans du bruit pur. Stabilité, validation et plausibilité biologique peuvent rendre une structure plus crédible, pas prouver qu'il s'agit d'un phénotype. De plus, les EBE sont **rétrécis** (shrinkage) : un clustering sur des EBE peu informatifs peut créer des sous-groupes apparents. Enfin, corrélation n'est pas causalité : un sous-groupe « découvert » doit être évalué indépendamment, pas supposé.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Les estimations individuelles (EBE) peuvent suggérer une structure non prévue (ex. CL selon le type de cancer).
- Clustering (k-means) pour regrouper sans étiquette ; kNN pour classer ; standardiser lorsque l'échelle ne doit pas piloter la distance.
- PCA : réduire la dimension en gardant les directions de plus grande variance, pour visualiser.
- RMT : au-dessus de λ₊ = signal statistique possible sous les hypothèses du modèle nul, pas preuve biologique ; plus de patients stabilise le seuil.
- Le clustering génère des hypothèses ; un modèle de covariables et une évaluation indépendante peuvent les étayer, pas les transformer automatiquement en mécanismes.
<!-- /step -->

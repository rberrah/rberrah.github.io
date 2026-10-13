# Guide de démarrage MultiOmics pour chercheurs — version de revue

Ce guide est destiné à un chercheur débutant en bioinformatique.
Il distingue **l'exécution du logiciel**, **l'analyse exploratoire**
et **une conclusion scientifique défendable**. Il n'implique aucune
fonction d'intelligence artificielle générative dans le calcul.

## Choisir la bonne analyse

**Une seule omique suffit.** Commencer par l'outil
[MultiOmics](https://rberrah.github.io/pharmacometrie/multiomics/)
et charger la démonstration guidée pour comprendre le format attendu.
N'ajouter une autre omique que si les échantillons, les sujets et les
temps de mesure peuvent être reliés correctement. Un résultat multi-omique
n'est pas automatiquement meilleur qu'un résultat mono-omique.

Les quatre termes à connaître :

| Terme visible | Ce qu'il signifie |
| --- | --- |
| Sujet / `subject_id` | La personne ou l'organisme qui fournit les échantillons |
| Échantillon / `sample_id` | Un prélèvement défini, provenant d'un sujet |
| Variable / identifiant de feature | Le gène, la protéine ou le métabolite mesuré |
| Répétition technique | Nouvelle mesure d'un même prélèvement, **pas** un nouveau sujet biologique |

La même personne peut avoir plusieurs prélèvements à plusieurs temps ;
cela crée une dépendance statistique. Il est incorrect de considérer
toutes ses lignes comme autant de sujets indépendants.

## Exemple pédagogique : RNA-seq, comparaison de deux groupes

1. Sélectionner le type de mesures **comptages RNA-seq bruts** uniquement
   si les données sont effectivement des comptages entiers non négatifs.
   Une intensité MS, une TPM, une FPKM ou une expression déjà normalisée
   ne peut pas être présentée comme un comptage brut.
2. Préparer un tableau des échantillons contenant `sample_id`,
   `subject_id`, `condition`, `batch` et les variables pertinentes
   du plan expérimental. Documenter quelles colonnes sont les sources
   de vérité, les valeurs manquantes et les réplicats.
3. Vérifier que chaque `sample_id` existe dans la matrice mesurée.
   Des identifiants supplémentaires, dupliqués ou manquants sont un
   **problème à résoudre**, pas une invitation à supprimer
   silencieusement des lignes.
4. Choisir explicitement le groupe de référence et le groupe comparé.
   Le sens du log2 fold-change dépend du sens de cette comparaison.
5. Examiner les lots techniques et les possibles confusions entre
   groupe et lot. Si le plan n'est pas identifiable, **ne pas forcer
   une analyse confirmatoire**.
6. Exécuter une méthode de référence seulement si l'environnement R
   requis est disponible. Un calcul réalisé dans le navigateur
   n'est pas automatiquement un ajustement DESeq2 ou limma.
7. Exporter les résultats, méthodes, paramètres, avertissements,
   versions et exclusions. Garder les conclusions à la portée
   exacte du plan et des mesures ; un q-value de 5 % n'est
   pas une probabilité de vérité biologique.

## Pour une étude multi-omique

- Les **mêmes sujets** doivent être identifiés entre les omiques,
  avec le prélèvement et son temps clairement déclarés.
- Les prélèvements non appariés doivent apparaître dans le rapport ;
  ne jamais fabriquer un appariement pour faire tourner MOFA2 ou DIABLO.
- Les normalisations et imputations adaptées aux mesures sont propres
  à chaque omique. Les données manquantes *MNAR* ne sont pas
  automatiquement réparées par une imputation générique.
- Si l'objectif est de prédire, figer les partitions
  train/test avant la sélection des gènes, l'imputation,
  la standardisation et l'optimisation du modèle.
- Comparer le résultat multi-omique aux meilleurs modèles mono-omiques
  sur **les mêmes patients et les mêmes partitions**. Documenter
  l'amélioration et l'incertitude, y compris l'absence de gain.

## Un rapport publiable doit fournir

Le code source exact (SHA Git), ses licences, les dépendances R/Node,
un jeu de données légalement partageable ou les instructions
d'accès, la nature exploratoire/confirmatoire de chaque analyse,
les exclusions, le plan, les métriques et les résultats défavorables.
Les jeux d'entraînement, de test, et les annotations biologiques
externes doivent être versionnés.

Les données cliniques, même pseudonymisées, ne doivent pas être
déposées dans un dépôt Git public sans garanties juridiques et éthiques.

## Comment interpréter les validations actuelles ?

- **Réussi :** plusieurs suites techniques et un rejeu numérique
  de trois moteurs RNA-seq sous environnement restauré.
- **Résultats encore défavorables :** inflation de FDR DESeq2
  dans certains modèles de simulation RNA-seq. Cela interdit de
  présenter le mode confirmatoire comme universellement qualifié.
- **Toujours à faire :** reproduction biologique externe indépendante,
  preuve du gain multi-omique, étude d'ergonomie auprès de véritables
  débutants et vérifications par lecteurs d'écran.

La qualification complète, les références de CI, le rapport d'article
et les limites se trouvent dans le
[kit de publication](./README.md). Une étude correctement exécutée
par logiciel peut néanmoins ne pas justifier une conclusion causale,
confirmatoire ou clinique.

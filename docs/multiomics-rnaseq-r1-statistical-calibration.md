# RNA-seq R1 — grille quantitative de calibration de référence

**Statut : méthode implémentée, résultats de la matrice complète NON encore
observés lors de sa rédaction.** La réussite de GitHub Actions mesure
l'exécution et préserve les résultats défavorables ; elle **ne certifie
pas** la FDR nominale pour des données biologiques réelles.

## Objectif et protocole avant lecture des résultats

Évaluer **les implémentations réelles** DESeq2, edgeR-QL et limma-voom
via la même matrice de données et les mêmes métadonnées, jamais des
substituts Javascript portant les mêmes noms. Quatre cellules d'étude :

| Cellule | Conditions simulées | Vérité connue |
| --- | --- | --- |
| Nul équilibré | 20 témoins, 20 traités ; deux batches équilibrés | 0/400 gènes affectés |
| Nul déséquilibré | 12 témoins, 28 traités ; lots partiellement associés | 0/400 gènes affectés |
| Mélange équilibré | 20/20 et batch équilibré | 40 gènes affectés, 360 nuls |
| Mélange déséquilibré | 12/28 et batch partiellement associé | 40 affectés, 360 nuls |

100 jeux de données indépendants par cellule (400 jeux), 400 gènes
et 40 sujets biologiques indépendants par jeu, soit **1 200 vrais
ajustements de méthodes R**. Générateur négatif binomial : moyenne
génique hétérogène, dispersion 0,08–0,32, profondeur de bibliothèque
variable, effet technique de lot (indépendant ou partiellement
associé au groupe), signal réel log2FC de ±1,2 ou 0,65 pour les
40 variables affectées. Les 360 autres n'ont aucun effet.

**Interprétation :** il s'agit d'une simulation paramétrique dans
la famille de modèles que ces méthodes cherchent à approximer.
Elle ne prouve pas la robustesse à des distributions biologiques
inconnues, contaminations, RNA dégradé, corrélations gène–gène,
batch parfaitement confondu, isoformes ou alignement erroné.

## Paramètres et indicateurs figés

- Niveau BH q ≤ 0,05, familles de gènes définies par analyse.
- FDR empirique = moyenne de la fraction de découvertes fausses
  (FDP) calculée **dans chaque jeu de données indépendant**, avec
  FDP = 0 lorsqu'aucun gène n'est retenu.
- Sous l'hypothèse nulle complète, FDR = probabilité empirique
  d'au moins une découverte (aussi FWER).
- Puissance = proportion des 40 effets véritables retenus, sans
  sélectionner rétrospectivement les seuls gènes détectés.
- Nombre moyen de découvertes/fausses découvertes, MAE log2FC
  pour les vrais signaux détectés (biais de sélection à signaler).
- IC descriptifs à 95 % par 1 000 bootstraps d'ensembles de jeux
  de données indépendants ; erreur standard Monte-Carlo calculée
  à partir des FDP, non des 400 × 40 mesures prises séparément.
- `FDR > 0,30` bloque la CI comme alerte de régression majeure.
  Ce seuil est **volontairement très tolérant** : passer la CI
  n'atteste **pas** `FDR ≤ 0,05`. Les résultats numériques
  doivent toujours être interprétés avec leurs IC.

## Traçabilité

Fichiers archivés par GitHub Actions (y compris en cas d'échec,
tant que des cellules ont pu s'exécuter) :

- `r1_rnaseq_calibration_completed_cells_partial.csv`
- `r1_rnaseq_calibration_per_dataset.csv`
- `r1_rnaseq_calibration_scenario_summary.csv`
- `r1_rnaseq_calibration_manifest.json`

Les versions de R/Bioconductor/DESeq2/edgeR/limma, les graines,
la définition des effets plantés et le code sont traçables.
**À compléter ensuite :** images de conteneurs versionnées,
données RNA-seq réellement mesurées en réplication externe,
designs corrélés/longitudinaux, qualité des alignements/annotations,
effectifs extrêmes et mécanismes de données manquantes.
Aucune prétention « universelle » ou clinique à partir de cette grille.

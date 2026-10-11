# RNA-seq R1 — dossier de qualification du parcours confirmatoire

**Statut (11 octobre 2026) : garde-fous du mode confirmatoire en cours de
validation logicielle ; pas de certification statistique, biologique ou
clinique.** Ce document précise ce qui est réellement vérifiable, ce qui
reste à prouver, et quand le pipeline doit refuser le mode confirmatoire.

## Domaine de validité V1 restreint

- Type d'échantillon explicitement documenté comme biologique.
  Les blancs, QC poolés et injections techniques hors sujet ne sont
  **jamais supprimés silencieusement** dans le parcours confirmatoire :
  la présence de ces éléments bloque l'analyse jusqu'à constitution
  d'un manifeste d'exclusions préspécifié et vérifiable.
- Une seule omique : **comptages RNA-seq bruts non négatifs et entiers**.
  La forme numérique ne prouve pas l'origine réelle des comptages :
  provenance FASTQ/BAM, alignement, version annotation et comptage
  nécessitent des preuves supplémentaires.
- Deux groupes **biologiquement indépendants**, au moins trois sujets
  distincts par groupe. Cette limite est un seuil de prévention des
  erreurs de logiciel, absolument **pas** un seuil de puissance.
- Hypothèse d'intérêt : différence de condition, un contraste explicitement
  nommé et préspécifié. Régression additive avec intercept, covariables
  observées, sans interaction, appariement, cluster ou série temporelle.
- Un sujet biologique unique par `sample_id`. Un sujet réparti entre
  plusieurs lignes considérées à tort comme indépendantes est bloqué.
  Les réplicats techniques du même prélèvement peuvent être agrégés
  uniquement lorsque leurs `subject_id`, `condition` et `batch`
  sont cohérents.
- **DESeq2 de référence effectivement exécuté** avec audit strict des
  identifiants d'analyses (assays) *avant* agrégation et audit des
  entrées et de l'identifiabilité *avant* ajustement statistique.
- Correction multiple documentée par famille de tests ;
  le résultat ne devient jamais automatiquement une hypothèse confirmée.

## Contrôles logiciels automatisés intégrés

| Étape | Rejet de l'analyse demandée si… | Trace |
| --- | --- | --- |
| CSV → métadonnées | Un `assay_id` manque, est dupliqué ou n'est pas présent dans les mesures | `assayIntegrityContract` |
| Réplicats techniques | Deux lignes d'un même prélèvement indiquent des sujets, conditions ou lots incompatibles | Refus avant agrégation |
| Sujets indépendants | Un `subject_id` est absent ou appartient à plusieurs échantillons considérés indépendants | `confirmatoryInputContract` |
| Mesures RNA | Valeurs manquantes, négatives, fractionnaires, bibliothèque vide, IDs de features dupliqués | Refus strict |
| Jointure | Les ensembles d'IDs RNA et métadonnées ne correspondent pas exactement | Refus, aucune intersection silencieuse |
| Contraste et plan | Moins de deux groupes, moins de trois sujets indépendants par groupe, formule non additive ou contraste ambigu | Refus strict |
| Covariables | Batch variant omis du modèle, covariable manquante, alias ou défaut de rang, trop peu de degrés de liberté | Refus strict |
| Intégration navigateur | Une exécution R réussie est annoncée sans les **deux** contrats précédents | Affichage `blocked` |
| Conclusion | Les contrôles passent | **Éligible pour revue indépendante uniquement** ; `certified=false` |

Les tests sont dans
`multiomics-engine/tests/test_rnaseq_confirmatory_preflight.R`,
`scripts/test_multiomics_diagnostics.mjs` et le workflow
`.github/workflows/multiomics-rnaseq-confirmatory.yml`.

## Matrice de validation statistique R1 — reste à réaliser

| Scénario préspecifié | Estimands et preuves attendues | État |
| --- | --- | --- |
| Hypothèse nulle, 2 groupes équilibrés | Proportion de jeux avec ≥1 découverte BH (FDR=FWER sous nul global), IC binomial exact à 95 % | 12 répliques programmées dans le benchmark R ; intervalle trop large pour conclure à 5 % |
| Nul avec profondeur variable et forte dispersion | Groupes équilibrés ; profondeur ~10× ; dispersion NB élevée ; BH à 5 % | Nouveau scénario de stress R : 8 répliques programmées, aucune validation nominale revendiquée |
| Nul avec répartition des groupes déséquilibrée | 12 témoins / 28 traités ; lot technique associé au groupe mais non complètement confondu | Nouveau scénario de stress R : 8 répliques programmées ; puissance et couverture restent non établies |
| Vérité mixte : 1/5/20 % de gènes modifiés | Distribution des FDP par jeu, FDR moyenne, puissance, biais log2FC, sensibilité aux filtrages | À étendre |
| Effets faibles, forts et de signes opposés | Sensibilité, estimation et couverture des IC selon effectifs | À étendre |
| Batch mesuré, partiellement confondu | Exactitude du contraste / vérification du rang, variations de FDR | À étendre |
| Batch parfaitement confondu | Refus explicite, **aucune estimation identifiable** | Préflight ajouté |
| Sujet dupliqué, étiquettes mélangées, rang dégénéré | Échec explicite, aucun calcul concluant silencieusement | Préflight ajouté |
| Cohorte RNA-seq publique externe, non inspectée auparavant | Reproduction d'un effet primaire préspécifié, prédictions/contrastes, QC indépendants | Non établi |
| Reproductibilité dans un environnement verrouillé | Docker/renv, versions R/DESeq2/annotation, checksums, réanalyse byte-identique ou tolérances numériques | Pas encore garanti |

### Que mesure réellement ce nouvel audit ?

Le benchmark `multiomics-engine/tests/bioconductor_null_calibration.R` exécute **trois méthodes R réelles** (DESeq2, edgeR QL, limma-voom) sur trois plans simulés, chacun avec un **effet biologique nul connu** :

- **Standard :** deux groupes de 20 sujets, séries techniques équilibrées et correction du batch explicite (12 jeux indépendants).
- **Qualité complexe :** deux groupes de 20 sujets, fortes différences de profondeur et forte surdispersion négative binomiale (8 jeux indépendants).
- **Plan déséquilibré :** 12 témoins et 28 traités, série technique partiellement liée au groupe ; rang de la matrice de design vérifié (8 jeux indépendants).

On rapporte **par méthode ET scénario** la proportion de simulations où au moins un gène nul présente q BH ≤ 0,05, avec un **intervalle binomial exact à 95 %** calculé par `binom.test`. Sous nul global, cette proportion estime le FDR et le FWER. Ces intervalles quantifient seulement l'erreur Monte-Carlo. **Zéro simulation positive sur douze donne malgré tout une borne supérieure exacte proche de 26,5 % ; sur huit, proche de 36,9 %.** Le seuil d'alerte automatisé de 35 % ne détecte que des régressions grossières.

Les sorties réelles (`bioconductor_null_replicates.csv`, `bioconductor_null_summary.csv`, `bioconductor_null_scenarios.csv`, environnement R) sont archivées dans les artefacts de la CI. L'ajout du scénario dans le code **n'est pas une exécution probante** : les valeurs mesurées doivent être lues dans un workflow réussi, jamais inventées dans cette documentation. Les résultats ne sont pas assimilables à une calibration sous alternatives non nulles.

**Critères de validation statistique :** définir le niveau alpha, le
nombre de répétitions et la précision Monte-Carlo, les scénarios, les
tests de puissance, les tolérances de calibration et les échecs
autorisés **avant de lire le benchmark**. Les bornes grossières utilisées
par la CI historique ne constituent pas une certification nominale
du contrôle de FDR à 5 %.

## Autres preuves nécessaires avant un parcours confirmatoire complet

1. Validation du protocole analytique et de la provenance (lectures,
   mapping, comptage, annotation, QC, contaminations, batch et
   indépendance réelle des sujets).
2. Plan statistique préenregistré, taille d'effet pertinente et
   justification de la puissance ; procédures d'exclusion et
   d'analyses de sensibilité préspécifiées.
3. Vérifications de diagnostics/dispersion et confrontation à une méthode
   de référence indépendante ; non-concordance explicitement conservée.
4. Réplication externe de résultats biologiques sur des données non
   utilisées pour améliorer ou sélectionner la méthode.
5. Révision humaine indépendante des diagnostics et des conclusions.
   La validation de l'interface par utilisateurs fait l'objet d'un
   protocole distinct.

**Règle de communication :** même lorsque les contrôles R1 passent,
écrire « exécution de la méthode RNA-seq de référence et préflight
technique satisfaisants, revue méthodologique requise », et non
« résultat confirmé », « validé universellement » ou « prêt pour
décision clinique ».

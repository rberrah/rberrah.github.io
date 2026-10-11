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
| Hypothèse nulle, 2 groupes équilibrés | Proportion de jeux avec ≥1 découverte BH (FDR=FWER sous nul global), IC binomial exact à 95 % | 12 répliques exécutées sur Bioconductor : 0/12 découvertes pour les 3 moteurs ; intervalle trop large pour conclure à 5 % |
| Nul avec profondeur variable et forte dispersion | Groupes équilibrés ; profondeur ~10× ; dispersion NB élevée ; BH à 5 % | 8 jeux exécutés : DESeq2 1/8, edgeR 0/8, voom 0/8 ; aucune validation nominale revendiquée |
| Nul avec répartition des groupes déséquilibrée | 12 témoins / 28 traités ; lot technique associé au groupe mais non complètement confondu | 8 jeux exécutés : DESeq2 2/8, edgeR 1/8, voom 0/8 ; puissance et couverture restent non établies |
| Vérité mixte : 1/5/20 % de gènes modifiés | FDP par jeu, FDR moyenne, puissance, biais log2FC, nombre de gènes conservés | 3 scénarios de 12 jeux exécutés ; FDR estimés parfois > 5 %, revue méthodologique requise |
| Effets faibles, forts et de signes opposés | Sensibilité, estimation et couverture des IC selon effectifs | À étendre |
| Batch mesuré, partiellement confondu | Exactitude du contraste / vérification du rang, variations de FDR | À étendre |
| Batch parfaitement confondu | Refus explicite, **aucune estimation identifiable** | Préflight ajouté |
| Sujet dupliqué, étiquettes mélangées, rang dégénéré | Échec explicite, aucun calcul concluant silencieusement | Préflight ajouté |
| Cohorte RNA-seq publique externe, non inspectée auparavant | Reproduction d'un effet primaire préspécifié, prédictions/contrastes, QC indépendants | Non établi |
| Reproductibilité dans un environnement verrouillé | Docker/renv, versions R/DESeq2/annotation, checksums, réanalyse byte-identique ou tolérances numériques | Pas encore garanti |

### Résultats R effectivement observés le 11 octobre 2026

Deux workflows GitHub Actions ont **exécuté** les moteurs Bioconductor de référence sur les données simulées. Les résultats ci-dessous sont des **mesures de simulation** et non des taux d'erreur attendus pour une vraie cohorte. Les logs, les sorties par simulation et les versions R ont été conservés dans les artefacts des workflows.

**Nul global (au moins une découverte BH q ≤ 0,05 par jeu)** — [workflow 38173002502](https://github.com/rberrah/rberrah.github.io/actions/runs/38173002502) :

| Scénario (jeux indépendants) | DESeq2 | edgeR QL | limma-voom |
| --- | ---: | ---: | ---: |
| 20/20, dispersion modérée (12) | 0/12 | 0/12 | 0/12 |
| 20/20, forte dispersion et profondeur variable (8) | 1/8 | 0/8 | 0/8 |
| 12/28, lot technique partiellement confondu (8) | 2/8 | 1/8 | 0/8 |

**Vérité mixte (FDR moyen = moyenne des proportions de fausses découvertes par jeu)** — [workflow 38174106412](https://github.com/rberrah/rberrah.github.io/actions/runs/38174106412) :

| Vrais gènes modifiés parmi 400 (12 jeux par cas) | DESeq2 | edgeR QL | limma-voom |
| --- | ---: | ---: | ---: |
| 4 (1 %) | 11,11 % | 8,33 % | 6,67 % |
| 20 (5 %) | 6,76 % | 3,36 % | 2,64 % |
| 80 (20 %) | 5,45 % | 4,33 % | 3,47 % |

Tous les gènes modifiés plantés ont été détectés dans ces scénarios **à forts effets**, mais ce plafond de puissance reflète la facilité artificielle de l'expérience, pas une garantie pour les études réelles. Pour DESeq2, les couvertures approximatives moyennes des IC Wald non rétrécis sur les vrais signaux sont respectivement 100 %, 92,5 % et 93,65 % selon ces trois scénarios ; il s'agit d'estimations très peu précises (12 jeux, 4/20/80 signaux). **L'observation de FDR au-dessus de 5 % dans plusieurs cellules demeure un signal de revue méthodologique**, même si le seuil logiciel d'alerte à 35 % n'a pas été dépassé. Le test ne permet **ni** de conclure à une inflation réelle du FDR **ni** d'établir sa maîtrise nominale.

**Action requise avant qualification confirmatoire :** campagne indépendante bien plus grande avec précision Monte-Carlo préspecifiée, effets faibles et hétérogènes, tailles d'échantillon variées, plan confondu partiellement et facteurs techniques réalistes ; conserver les résultats négatifs et figer les versions logicielles et critères de décision avant de réexaminer les performances.

### Troisième campagne : faible effet, petite cohorte, batch et signaux rares

Les expériences précédentes détectaient tous les vrais signaux, mais avec des effets artificiels **±1,5 log2FC** et généralement 40 sujets ; ce résultat ne permettait pas d'évaluer la puissance en conditions difficiles.

Le plan de simulation reproductible `multiomics-engine/rnaseq_stress_designs.R` prescrit quatre cas (400 gènes, exactement une étude simulée indépendante par graine, même étude évaluée par les trois méthodes R) :

| Scénario | Taille / proportion de vrais signaux | Effets artificiels | Risque mis à l'épreuve |
| --- | --- | --- | --- |
| `small_effect_20v20` | 20 + 20 sujets, 5 % | ±0,35 log2FC | Faible effet, faible puissance |
| `small_cohort_6v6` | 6 + 6 sujets, 5 % | ±0,75 log2FC | Manque de précision et de puissance |
| `unequal_batch_12v28` | 12 + 28 sujets, 5 % | ±0,75 log2FC | Lot technique corrélé à la condition, mais contraste identifiable |
| `sparse_signals_20v20` | 20 + 20 sujets, 1 % | ±0,75 log2FC | Signaux rares, nombreuses hypothèses réellement nulles |

La génération inclut dispersion négative binomiale hétérogène, facteurs de profondeur de séquençage et effets de lot variant selon les gènes. Les **sujets biologiques sont indépendants**, les groupes/batchs sont explicitement vérifiés et toutes les estimations sont comparées aux effets plantés connus.

Les scripts `multiomics-engine/tests/bioconductor_rnaseq_stress_grid.R` et `.github/workflows/multiomics-rnaseq-stress-grid.yml` distinguent :
- **PR :** 8 jeux par scénario, uniquement pour déceler les régressions logicielles.
- **Campagne mensuelle :** 120 jeux par scénario, avec possibilité de 60/120/200 exécutions sur demande ; 4 scénarios × 3 méthodes, avec archives de toutes les mesures par jeu, diagnostics, versions R, FDR moyenne, intervalle bootstrap et erreur Monte-Carlo.
- **Interprétation :** si la borne inférieure de l'intervalle de FDR dépasse 5 %, la cellule est **signalée pour revue**. L'absence d'alerte, ou le succès de CI, n'est **jamais** un certificat de contrôle du FDR, de puissance suffisante, de stabilité hors simulation ou de validité clinique.

**Important :** cette section décrit un protocole implémenté. **Aucune valeur de performance n'est revendiquée avant lecture d'une exécution effectivement réussie.** Une couverture exhaustive de la variabilité biologique, de la dépendance entre gènes, des compositions cellulaires, des tailles d'effets réalistes et des conditions de collecte nécessitera des plans complémentaires. Le critère de puissance est calculé sur **tous les vrais gènes plantés**, y compris ceux éliminés lors du filtrage.

### Deuxième campagne : mélanges contrôlés de vrais et de faux signaux

Le fichier `multiomics-engine/tests/bioconductor_mixed_truth_reference.R` génère des données de comptages négatifs binomiaux à **400 gènes**, **40 sujets indépendants** et lot technique mesuré. Trois scénarios préspécifiés introduisent **4 (1 %), 20 (5 %) ou 80 (20 %) vrais gènes différentiels**. La moitié de ces gènes est sur-exprimée et l'autre moitié sous-exprimée, à effet nominal ±1,5 sur l'échelle log2. Les mêmes simulations servent aux trois moteurs réels **DESeq2, edgeR QL et limma-voom**.

Les métriques calculées sans connaître le résultat à l'avance sont : **FDP** = faux gènes sélectionnés / tous les gènes sélectionnés dans chaque jeu, **FDR estimée** = moyenne des FDP entre jeux indépendants, **puissance** = vrais signaux détectés / tous les vrais signaux plantés (y compris ceux éliminés par filtrage), erreurs de signe, biais et erreur absolue du log2FC. Des intervalles bootstrap à 95 % sur la FDR sont produits en rééchantillonnant les **jeux indépendants**, jamais les gènes comme s'il s'agissait de nouvelles études. Les seules couvertures d'IC calculées dans cette campagne concernent les intervalles de Wald approximatifs, **non rétrécis**, de DESeq2 ; elles ne doivent pas être assimilées aux intervalles des autres moteurs.

**Ce que ce test ne démontre pas :** la présence de vrais gènes modifiés ne garantit pas la calibration. Avec 12 simulations par scénario, les estimations restent fragiles ; la vérité simulée n'englobe pas les vrais batchs biologiques, les biais d'annotation, les études longitudinales ni l'indépendance des prélèvements d'une cohorte réelle. Les fichiers CSV et `sessionInfo()` sont archivés et les échecs grossiers restent bloquants. Une calibration nominale exploitable nécessitera une simulation beaucoup plus importante, indépendante de la mise au point du pipeline, ainsi qu'une réplication externe avec protocole gelé.

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

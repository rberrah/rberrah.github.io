# Multiomics — contrat de validité scientifique (v1, 2026-10-08)

## Positionnement

Ce logiciel est un **outil de recherche exploratoire**. Son bon fonctionnement technique,
la correction BH et la reproduction de signaux connus **ne constituent pas une validation
statistique générale**. Une analyse peut être exportée et reproductible tout en reposant
sur des hypothèses incorrectes. Le logiciel ne déclare donc jamais une analyse
« publication ready » automatiquement.

## Audit complémentaire MCAR / MAR / MNAR (9 octobre 2026)

Un benchmark indépendant, exécutable avec
`node scripts/test_multiomics_missingness_calibration.mjs`, teste désormais
**2 000 jeux simulés sous hypothèse nulle** et **250 jeux avec un signal connu**.
Il couvre une couche protéomique de type intensité logarithmique, deux groupes
biologiques indépendants, 12 protéines, des cohortes de 24 et 80 sujets, et
cinq scénarios préspécifiés. Chaque cellule comprend 200 répétitions nulles
et 25 répétitions avec signal positif.

La proportion ci-dessous représente les **jeux nuls comportant au moins une
découverte BH à q ≤ 0,05**, et non le pourcentage d'effets biologiques vrais.

| Scénario simulé | 24 sujets | 80 sujets |
| --- | ---: | ---: |
| Données complètes gaussiennes | 4/200 = 2 % | 8/200 = 4 % |
| MCAR (valeurs manquantes complètement aléatoires) | 2/200 = 1 % | 6/200 = 3 % |
| MAR conditionné par l'âge observé | 6/200 = 3 % | 6/200 = 3 % |
| Effet technique de batch important, équilibré entre groupes | 11/200 = 5,5 % | 7/200 = 3,5 % |
| MNAR : censure des queues opposées, sans effet biologique vrai | **44/200 = 22 %** | **186/200 = 93 %** |

La censure MNAR a affecté environ 23 % des mesures ; les taux de valeurs
manquantes entre groupes étaient **proches**, mais leurs distributions
observées étaient biaisées dans des directions opposées. L'augmentation
spectaculaire des découvertes est un **échec des hypothèses d'inférence
sur données observées**, et non la découverte d'effets vrais.

Les vérifications du parcours confirmatoire ont demandé une revue du
mécanisme de données manquantes sur **400/400** simulations MNAR, mais
n'ont émis un statut formel *bloqué* que pour **342/400**.
Les 58 autres restent à `independent_review_required` et ne sont jamais
certifiées. Le logiciel ne peut pas discerner MCAR, MAR et MNAR sur les seules
valeurs observées : **une absence de déséquilibre de taux de missingness
entre groupes ne démontre pas l'absence de biais MNAR**.

Un intervalle de Wilson à 95 % est archivé pour chaque proportion calculée
sur les **200 jeux indépendants**, pas sur les p-values corrélées des protéines.
L'intervalle MNAR pour 80 sujets est d'environ 88,6–95,8 %.
Les contrôles MCAR et MAR constituent un résultat encourageant **uniquement
pour ce générateur** et les modèles/covariables spécifiés, sans prouver une
calibration universelle du FDR ni une validité confirmatoire des cohortes
cliniques. Les effets positifs simulés ont été fixés à +2,7 unités log ;
leur sensibilité ne constitue pas une estimation de puissance généralisable.

Provenance : fichier de CI
`.github/workflows/multiomics-missingness-stress.yml`, générateur à
graine fixe et rapport JSON archivé par GitHub Actions ; résultats du
9 octobre 2026. **Aucun nouveau mécanisme de correction MNAR n'a été
validé** : le traitement des données manquantes exige un modèle d'observation,
des analyses de sensibilité préspécifiées et une revue scientifique indépendante.

## FDR sur mélanges de vrais signaux et de variables nulles (9 octobre 2026)

La campagne antérieure de 2 000 jeux *entièrement nuls* mesurait la proportion
de familles ayant au moins une découverte BH (FWER sous la nullité globale).
Elle **ne mesurait pas directement la FDR dans un mélange d'hypothèses**.

Le benchmark `scripts/test_multiomics_mixed_truth_fdr.mjs` est une deuxième
simulation indépendante, avec une autre famille de générateurs pseudo-aléatoires
(XORShift32, gaussiennes corrélées et loi t à 3 degrés de liberté).
Il teste **2 400 jeux indépendants** : 200 répétitions pour chaque combinaison
de 24 ou 80 sujets et de six mécanismes de variabilité/observation.
Chaque jeu comporte **3 protéines avec effets connus (+2,0 ; +1,4 ; +0,9
unités log) et 9 protéines à effet nul**, des protéines corrélées,
un effet de lot et l'âge comme covariable.

Les valeurs suivantes sont les **moyennes du faux taux de découvertes par jeu**
`V / max(R, 1)`, où `V` est le nombre de découvertes sur des protéines
nulles et `R` le nombre total de découvertes à `q BH ≤ 0,05`.
La correction est **intra-omique**, et non à l'échelle de toute une étude.

| Scénario généré | FDR observée (24 sujets) | FDR observée (80 sujets) |
| --- | ---: | ---: |
| Gaussien, corrélations entre protéines | 3,28 % | 1,73 % |
| Hétéroscédasticité + corrélation | 3,37 % | 2,62 % |
| MCAR + corrélation | 1,83 % | 2,85 % |
| MAR dépendant de l'âge observé + corrélation | 2,70 % | 2,79 % |
| Bruit à queues lourdes (t3) | 1,67 % | 3,02 % |
| **MNAR : censure de queues opposées par groupe** | **19,08 %** | **58,55 %** |

L'incertitude Monte-Carlo est calculée par bootstrap de **jeux complets**
(800 rééchantillonnages), jamais par bootstrap de p-values corrélées.
Dans le scénario MNAR, les IC bootstrap à 95 % de la FDR sont
**14,12–24,00 %** à 24 sujets et **55,22–61,64 %** à 80 sujets.
Les effets biologiques connus ne sont pas généralisables à des cohortes réelles.

La capacité de détection est mesurée séparément : par exemple, pour
les données gaussiennes corrélées, le rappel des trois vrais signaux est de
**56,8 % à 24 sujets** contre **96,8 % à 80 sujets**. Un faible taux de
fausses découvertes peut coexister avec une faible puissance statistique.

Les cinq scénarios non MNAR n'ont pas révélé d'inflation manifeste au-dessus
de 5 % dans ce générateur. Cela **ne prouve pas** le contrôle universel à 5 %,
ni l'adéquation de HC3/BH à un autre plan, à une distribution inconnue,
aux données RNA-seq en comptages, à la métabolomique ou aux modèles
multi-omiques. La censure MNAR déforme les données malgré une proportion
de valeurs manquantes similaire entre groupes : une bonne concordance numérique
JS/R ne répare pas cette absence d'identifiabilité.

Le workflow `.github/workflows/multiomics-mixed-truth-fdr.yml`
archive le rapport JSON complet (FDR, bootstrap, sensibilité, couverture
des IC, filtration des variables). Un contrôle de régression très large
(25 % de FDR pour les scénarios non MNAR) n'est **pas un critère
d'équivalence** à 5 % ; un dépassement statistiquement convaincant du seuil
nominal exige une investigation et une validation indépendante.

**Statut : validation logicielle partielle du modèle HC3 à deux groupes
indépendants, uniquement dans ces scénarios simulés ; aucune certification
confirmatoire universelle.**

## Évaluation sur patients tenus à l'écart : test TCGA du module de métriques (9 octobre 2026)

Une nouvelle validation indépendante des **métriques de prédiction figée** utilise
le découpage fourni par les auteurs de `mixOmics::breast.TCGA` :
150 patients d'apprentissage et 70 patients de test. Le benchmark retient
**105 patients d'apprentissage** et **49 patients de test** correspondant
aux sous-types Her2 et Luminal A.

Un classificateur **de référence distinct du modèle d'entraînement PMx**
est défini avant évaluation : sélection de 20 transcrits sur les
105 sujets d'apprentissage, centrage/réduction appris sur l'apprentissage,
score de centroïdes et calibration logistique uniquement sur l'apprentissage.
Ses poids, transformations et probabilités sont figés avant d'utiliser
les étiquettes des 49 sujets de test. L'évaluation est ensuite calculée
par le véritable module PMx `multiomics-engine/external_validation.R` ;
les prédictions et résultats sont archivés.

**Résultat vérifié en CI : AUC = 1,00 sur 49 sujets testables**. Ce score,
potentiellement impressionnant, **n'est pas une preuve de transportabilité** :
le jeu publié est déjà normalisé et fortement présélectionné pour un
exemple pédagogique, et les deux partitions proviennent du même TCGA.
La protéomique n'est pas présente dans le jeu de test ; aucune validation
externe de MOFA2, DIABLO ou d'un prédicteur réellement multi-omique n'est
donc permise par cette expérience.

Contrôles négatifs sur les probabilités figées :
- 200 permutations des étiquettes du test : AUC moyenne **0,4996** ;
- 80 permutations des étiquettes d'**apprentissage**, avec nouvelle
  sélection et nouveau calibrage avant le scoring sur le même test :
  AUC moyenne **0,4430** (contrôle exploratoire à variance limitée).

Le rapport contient aussi Brier, calibration, intervalles de bootstrap et
traçabilité du nombre de sujets/fonctionnalités. Le script et le workflow
sont `scripts/benchmark_tcga_heldout_reference.R` et
`.github/workflows/multiomics-tcga-heldout.yml`. Le code est testé contre
la version **immuable** `ef3e760526623d9e91e945e4b50be48d764efc40`
des données mixOmics.

**Portée stricte :** ce test valide l'exécution des *métriques externes
sur prédictions figées* et des contrôles d'absence de réentraînement
sur le jeu test. Il **ne valide pas le moteur d'apprentissage PMx** :
un tel test exigera d'entraîner, de figer puis de déployer directement
ce modèle, sans optimiser quoi que ce soit sur les patients de test.
Il ne constitue ni une validation clinique multicentrique ni un
certificat d'utilisation confirmatoire.

## Validation sur partition publiée avec un modèle PMx réellement figé (9 octobre 2026)

Après le benchmark de modèle de référence R (`scripts/benchmark_tcga_heldout_reference.R`),
la chaîne scientifique teste maintenant **le véritable moteur de prédiction PMx**.
Il s'agit de sa régression logistique ridge `ridgeGlmFit`, également utilisée
dans le modèle prédictif du navigateur, réemployée au sein d'un contrat
de gel/rejeu `fitFrozenBinaryPredictor` / `scoreFrozenBinaryPredictor`.
Ce contrat peut être sérialisé en JSON sans réentraînement sur de nouveaux sujets.

Protocole du benchmark source-native mixOmics `breast.TCGA` :

- **105 sujets d'apprentissage**, 70 autres sujets intégralement prédits,
  dont 49 Her2/LumA évalués selon une règle de sous-type fixée à l'avance ;
- panel public de **200 transcrits déjà normalisés et présélectionnés en amont** ;
- 12 variables choisies uniquement sur les sujets d'apprentissage ;
  centrage, imputation, mise à l'échelle et choix de la pénalisation
  déterminés exclusivement sur l'apprentissage ;
- export d'un modèle complet (coefficients, variables, transformations,
  pénalisation, hachage SHA-256 des données d'apprentissage), puis prédictions
  sur tous les 70 sujets du test sans accès aux étiquettes ;
- ouverture séparée des étiquettes de test pour l'évaluation par le
  backend R de PMx, avec AUC, Brier, log-loss, bootstrap et permutations.

Résultat de CI sur l'instantané documenté : **AUC = 0,9939** et
**score de Brier = 0,0208**, avec **AUC moyenne = 0,4992** sur
200 permutations des étiquettes de test. Sur **30 permutations des
étiquettes d'apprentissage avec réentraînement complet PMx** (nouvelle
sélection de variables, validation croisée de pénalisation, ajustement
ridge, prédictions figées), l'AUC moyenne sur le même test est
**0,4754**. Ce contrôle négatif vérifie la chaîne d'apprentissage,
mais n'exclut pas une présélection antérieure de variables par les
auteurs du jeu de données. La pénalisation retenue sur
l'apprentissage est `lambda = 1`. Le benchmark contrôle aussi que
les sujets d'apprentissage ne sont pas acceptés à nouveau dans le test,
que les variables requises ne manquent pas, et que le même modèle
rechargé depuis JSON restitue les prédictions à l'identique.

**Interprétation : validité logicielle partielle d'une prédiction PMx réellement
figée sur des sujets non utilisés pour l'entraînement, pas validité clinique.**
Ces données proviennent d'un même TCGA ; les 200 transcrits avaient
été normalisés/sélectionnés par la ressource publique avant notre benchmark.
Cette sélection préalable peut faciliter artificiellement la distinction
Her2/LumA et introduire une dépendance avec le test. **Une AUC proche de 1
ne doit pas servir d'argument clinique ni de comparaison de supériorité.**
Le test n'a pas de protéomique ; il ne valide pas MOFA2, DIABLO, les
signatures multi-omiques, une autre plateforme ou un autre centre hospitalier.
La protection contre les doublons repose sur des identifiants stables,
et ne peut exclure des recodages du même patient.
Le modèle sérialisé conserve les identifiants d'apprentissage afin de
refuser leur réutilisation dans le test : **avant d'exporter un modèle
issu d'une cohorte clinique, employer des identifiants pseudonymisés,
jamais des noms ni des identifiants directs de patients**.

La source est fixée au commit Git `ef3e760526623d9e91e945e4b50be48d764efc40`.
Fichiers : `scripts/export_tcga_native_pmx.R`,
`scripts/benchmark_tcga_native_pmx.mjs`,
`scripts/evaluate_tcga_native_pmx.R` et workflow
`.github/workflows/multiomics-native-heldout.yml`.
Les coefficients, prédictions, contrôles et métriques peuvent être audités
dans les artefacts GitHub Actions, sans accès à un LLM ni transfert de
données patients vers un service distant.

## Contrôles désormais exécutés dans la CI

| Contrôle | Référence / hypothèse | Limite |
| --- | --- | --- |
| Modèle de groupe, deux conditions indépendantes | Comparaison stricte des coefficients, SE HC3, p de Student et BH entre JavaScript et **R de base indépendant** sur les mêmes 24 sujets × 24 protéines simulées | Ne valide pas les RNA-seq counts, Cox, multigroupe, séries temporelles ni les distributions non gaussiennes |
| Hypothèse nulle | 60 jeux de données gaussiens indépendants, 24 sujets, 24 variables, vérité nulle | Test de détection d'inflation grossière, pas démonstration théorique de contrôle du FDR |
| Contrôle positif | 30 jeux avec quatre décalages de moyenne introduits, détection au q BH 0,10 | Pas une courbe de puissance généralisable |
| Identifiabilité | Covariable reproduisant exactement le groupe expérimental | Les modèles non identifiables doivent refuser de produire p et q, malgré le ridge numérique |
| Prédiction | Sélection des variables dans chaque pli d'entraînement interne et externe | Certains prétraitements avant CV peuvent encore introduire une fuite ; validation externe obligatoire |
| Métabolomique MS | Pas d'extrapolation hors des injections QC, LOESS R seulement avec ≥8 pooled-QC, modèle linéaire possible dès 5 | Seuils à adapter au protocole instrument et à vérifier par analyses de sensibilité |
| Méthodes R | Contrats R exécutés et résultats séparés du navigateur | Un test de fonctionnement du code n'est pas une preuve de bonne calibration de chaque package ou modèle |

Tests reproductibles :
- `npm run test:multiomics` (dont la calibration statistique)
- `Rscript multiomics-engine/tests/browser_reference_agreement.R`
- `Rscript multiomics-engine/tests/backend_smoke.R`
- tests Playwright avec fichiers publics, vues et thème sombre/clair

Le résultat machine-lisible contient `scientificAssurance` et
`publicationReady: false`. Le rapport HTML reprend les limites.

## Définition des niveaux de preuve

- **Exploration descriptive** : ACP, QC, profils et représentation des mesures.
  Aucun critère biologique n'est confirmé par cette seule exploration.
- **Inférence exploratoire** : ajustement statistique et p/q sur données importées.
  Nécessite vérification indépendante du plan, de la distribution, des effets de
  batch, des choix de prétraitement et des comparaisons multiples.
- **Méthode R exécutée** : la sortie de référence est disponible séparément ;
  ce n'est pas une validation externe, ni un accord chiffré garanti sur des données
  réelles. Les packages Bioconductor requis doivent être installés localement.
- **Prédiction interne** : nested-CV sur les sujets avec sélection refaite par
  pli. Le moteur ne publie une métrique que si **100 % des sujets éligibles**
  possèdent exactement une prédiction hors entraînement et si tous les plis
  externes ont été estimés. En cas de pli échoué ou de métrique indéfinie,
  les performances sont indisponibles (et non calculées sur les seuls succès).
  Le prétraitement omique global peut cependant précéder les plis et introduire
  une dépendance ; les résultats restent exploratoires.
- **Validation externe** : cohorte réellement indépendante, protocole figé,
  aucune sélection/tuning sur celle-ci, provenance documentée ; doit être
  organisée par les chercheurs et ne peut être certifiée par déclaration seule.

## Parcours guidé « Préparer une analyse confirmatoire »

L'interface propose deux modes simples : **Explorer** (sans backend R)
et **Préparer une analyse confirmatoire** (moteur R requis). Le second
mode **ne délivre aucun certificat**. Il vérifie seulement si les
calculs et le plan déclarés satisfont les conditions automatisables,
puis produit trois catégories : *vérifié automatiquement*,
*à examiner indépendamment* ou *bloqué*. Aucune option ou case cochée
ne peut convertir ces éléments en preuve de validité scientifique.

Périmètre initial du précontrôle confirmatoire : deux groupes biologiques
indépendants ; chaque couche doit avoir une méthode de référence R
effectivement exécutée (DESeq2 sur comptages bruts RNA-seq, limma
pour matrices appropriées déjà transformées et contrôlées). Les études
longitudinales, les critères cliniques, la survie, les modèles prédictifs,
les marqueurs multi-omiques et l'enrichissement Reactome ne sont
**pas autorisés automatiquement** comme inférence confirmatoire.
Ils restent accessibles en exploration, avec les limites affichées.
L'inférence confirmatoire de ces plans nécessitera une validation
**spécifique à chaque plan** et des diagnostics supplémentaires.

La réussite d'un appel R n'implique jamais que l'unité statistique,
le contraste, la dispersion, les effets de batch, la puissance, les
hypothèses des modèles ni les familles de tests BH soient corrects.

### Prédiction : suppression partielle de la fuite pré-CV

Pour les prédicteurs déclarés **log_expression**, **log_intensity** ou
**log_abundance** (fournis comme tels), le chemin prédictif utilise les
variables importées **sans sélection/filtrage global**.
Pour les comptages RNA-seq entiers non négatifs, seules une normalisation
CPM **par échantillon** et la transformation fixe
`log2(CPM + 0,5)` précèdent les plis. La sélection, l'imputation par
moyenne d'entraînement, l'ajustement des covariables et la mise à
l'échelle sont calculés séparément sur les plis d'entraînement.

Les autres formats, notamment intensités LFQ, aires de pics MS et
matrices « normalized » dont l'historique est inconnu, peuvent encore
subir un prétraitement dépendant de la cohorte avant CV :
`preprocessingLeakageRisk: true`. Même avec ce risque absent au
niveau du moteur, la CV demeure **interne** et ne vérifie pas
le traitement fait **avant import**, la causalité ou la transférabilité
à un autre laboratoire. Une cohorte externe et un protocole de calcul
figé restent obligatoires pour valider un prédicteur.

## Prérequis avant une analyse destinée à une publication

1. **Définir l'unité statistique** (sujet, animal, culture indépendante) et distinguer
   répétition technique, réplicat biologique, temps et batch. Documenter la
   randomisation et les variables de confusion.
2. **Préenregistrer** l'objectif, le contraste, le modèle et les exclusions.
   Rapporter tous les effectifs réels, pertes et données manquantes.
3. **RNA-seq** : quantifications entières non normalisées pour DESeq2/edgeR,
   ou `voom` avec dispersion et poids appropriés. Ne pas traiter les p-values
   du navigateur sur log2-CPM comme des résultats de référence.
4. **Protéomique** : examiner les intensités normalisées et transformées, lot,
   peptides/protéines, censures et données manquantes. Comparer avec limma
   lorsque le design le permet.
5. **Métabolomique** : fournir blancs, ordre d'injection et pooled-QC ;
   examiner l'effet des filtrages RSD, corrections de dérive et stratégies
   d'imputation. Ne jamais convertir m/z–RT en identité chimique garantie.
6. **Diagnostic des modèles** : contrôles de résidus, dispersion,
   influence/outliers, colinéarité, séparations logistiques, censure, hypothèse
   de risques proportionnels et sensibilité aux paramètres.
7. **Contrôle des erreurs multiples** : définir l'univers des variables testées
   et garder séparées la sélection exploratoire et la confirmation de voie.
8. **Validation** : reproduire les estimations dans R avec packages de référence,
   vérifier stabilité des découvertes, puissance, sous-groupes, seuils,
   et pour la prédiction, une cohorte indépendante et les intervalles d'incertitude.
9. **Traçabilité** : archiver données d'entrée, hachages, mappages des
   échantillons, versions et réglages de prétraitement.

## Enrichissement Reactome : contrôle du nombre de tests (révision v2)

La famille de correction BH est maintenant constituée de **toutes les voies Reactome
associées à l'univers réellement mesuré**, et pas seulement des voies renvoyées
pour les signaux sélectionnés. Les voies sans signal sélectionné comptent dans
le nombre d'hypothèses avec p = 1. Les réponses d'API tronquées, l'absence de
correspondance entre l'univers et les voies sélectionnées ou un dénominateur
incohérent entraînent une **FDR non estimable**, jamais un repli silencieux sur
la FDR calculée par Reactome avec un autre univers.

Ce calcul reste **exploratoire** : les caractéristiques ont été sélectionnées
à partir des mêmes données, certaines voies ont une structure hiérarchique et
leurs tests ne sont pas indépendants. La FDR locale n'est pas une preuve de
causalité ou de confirmation biologique. Vérification automatisée :
`node scripts/test_multiomics_pathway_fdr.mjs`.

## Calibration longitudinale et arrêt de la significativité navigateur

Les simulations de 15 scénarios nuls à 24 sujets, deux visites et huit variables,
avec effets aléatoires individuels, ont produit 12 p-values < 0,05 parmi
120 tests (10 %) et au moins une q-value ≤ 0,10 dans quatre jeux sur 15
(26,7 %). Ces estimations sont imprécises mais signalent une possible
anti-conservativité du test de Wald / approximation t de la branche GLS.

**Conséquence volontaire :** la branche navigateur conserve les tailles
d'effet, tendances et distributions comme exploration descriptive, mais
ne produit plus de p-values, q-values ni intervalles de confiance
longitudinaux. Même la corrélation différentielle inter-omique temporelle
n'attribue pas de q-value. L'inférence exige le backend R `lmerTest`
avec contrôle des hypothèses, de la structure aléatoire et des degrés
de liberté. Le test de régression impose cette politique fail-closed.

Ce n'est **pas** une validation du modèle GLS interne ; c'est une limitation
scientifique identifiée et neutralisée. Réintroduire des p-values navigateur
supposerait un benchmark préspécifié indépendant avec calibration de
l'erreur de type I et des IC sur plusieurs valeurs d'ICC, tailles et plans.

## Benchmark Bioconductor réel

Le workflow `.github/workflows/multiomics-bioconductor-validation.yml` exécute
réellement **DESeq2, edgeR quasi-vraisemblance et limma-voom** sur un jeu de
comptages négatif-binomial simulés, avec groupes et lots équilibrés. Les résultats
doivent présenter une direction d'effet correcte, un rappel des vérités positives
minimum déclaré, une limitation des faux positifs et une concordance de
classement entre DESeq2 et voom. Il refuse aussi les comptages fractionnaires
en entrée DESeq2 au lieu de les arrondir silencieusement.

La réussite de ce workflow doit être constatée dans **GitHub Actions** pour le
commit étudié : son existence ne prouve pas sa réussite. Ce test de simulation
reste insuffisant pour généraliser à toutes les tailles de cohortes, dispersions,
variations des bibliothèques ou plans longitudinaux.

## Contrôle négatif Bioconductor : résultat observé en CI

Le benchmark du 9 octobre 2026 (PR #16, référence R réelle, simulation
négative-binomiale) a également été exécuté sur **quatre répétitions d'un même scénario nul**
de 300 gènes × 40 échantillons, soit 1 200 hypothèses nulles par méthode.
Les taux observés de p < 0,05 et les nombres de découvertes BH à q ≤ 0,05
ont été : **DESeq2 6,1 % et 1/1 200**, **limma-voom 5,6 % et 0/1 200**,
**edgeR quasi-vraisemblance 6,2 % et 0/1 200**. Le job s'est terminé
avec succès. Ces fréquences descriptives ne démontrent pas une calibration
exacte au seuil de 5 %, ni un contrôle général de la FDR dans les études
réelles : quatre simulations et un unique ensemble de paramètres sont
insuffisants pour cela. Conserver les simulations, versions logicielles
et la traçabilité des comparaisons avant toute conclusion scientifique.

## Jeux publics : reproduction ciblée et biais de sélection

Les exports publics AgingHFCD et LRRK2 utilisent une sélection des variables
en partie basée sur les **q-values publiées**, complétée par des marqueurs
biologiques d'intérêt imposés. La concordance de direction entre résultats
recalculés et études sources sur ces sous-ensembles vérifie surtout la
reproductibilité ciblée des effets et la cohérence des transformations.
Elle **ne mesure pas** la sensibilité, la spécificité, la calibration de la
FDR ou la capacité de découverte sur l'ensemble des variables initiales :
les observations sélectionnées ne sont pas un échantillon indépendant de la
vérité à prédire. Les jeux publics non sélectionnés, les cohortes externes
et les simulations avec vérité connue restent requis pour cette validation.
Ne jamais transformer « 100 % de directions concordantes sur les variables
sélectionnées » en « 100 % d'exactitude scientifique ».

## Validation croisée sur intensités LFQ et aires MS

La voie prédictive distingue désormais explicitement le traitement
**exploratoire de la matrice** et la **recette reproductible de prédiction** :

- Pour `lfq_intensity` (protéomique) et `peak_area` (métabolomique)
  **non négatifs** : transformation fixée `log2(x + 1)`, suivie d'un
  centrage médian **dans chaque assay uniquement**. Ni pseudocount
  estimé sur la cohorte, ni filtrage de variables utilisant tous les
  sujets, ni référence médiane issue du jeu test avant CV. La sélection
  prédictive, la gestion des valeurs manquantes et la standardisation
  sont refaites sur les plis d'entraînement.
- Les intensités négatives présentées comme brutes sont incompatibles
  avec cette recette ; la voie exploratoire conserve alors un
  avertissement de risque de fuite. Le nom de la mesure ne prouve
  pas son échelle réelle.
- La normalisation médiane **suppose une majorité de variables stables**
  et un **panel identique de variables mesurées** pour les nouvelles
  observations. Ce choix peut effacer des modifications biologiques
  globales et n'est pas universel.
- Le modèle prédictif n'exécute **pas** les corrections de dérive
  pooled-QC, la suppression des variables associées aux blancs, les
  filtres de RSD ou l'imputation MNAR du chemin exploratoire :
  `rawIntensityScreening`, `technicalQcCaveat` et
  `intensityPanelAssumption` signalent cette différence.
  Les contrôles instrumentaux doivent être revus et des analyses de
  sensibilité validées avant toute revendication de biomarqueur.

Le test logiciel `scripts/test_multiomics_prediction_foldsafe.mjs`
perturbe massivement une observation tout en vérifiant que les
transformations des autres sujets restent inchangées. Il complète une
analyse prédictive à deux omiques avec validation croisée imbriquée.
Cela vérifie un **contrat logiciel de non-fuite inter-sujets**, pas la
validité clinique ni la transférabilité analytique.

## Grille de calibration étendue : groupes indépendants

La suite `scripts/test_multiomics_calibration_grid.mjs` et son workflow
GitHub Actions hebdomadaire testent le modèle navigateur ajusté sur une
grille **préspécifiée** de **120 jeux nuls** (20 répétitions × 3 effectifs
× 2 scénarios) et **36 jeux avec signal** (6 répétitions × 3 effectifs
× 2 scénarios), avec 12 variables par jeu. Les effectifs sont **16,
40 et 80 sujets** répartis en deux groupes indépendants. Scénarios :
bruit gaussien équilibré ; hétéroscédasticité et valeurs manquantes
MCAR (~12 %), avec batch équilibré et covariable continue d'âge.

Le rapport machine lisible `calibration-grid.json` conserve par
configuration : nombre réel d'hypothèses estimées, fréquence empirique
des p-values < 0,05 sous le nul, fréquence des familles ayant au moins
une découverte BH q ≤ 0,05 et sensibilité à trois effets positifs connus.

Les bornes CI (taux nul ≤16 %, familles BH ≤40 %, sensibilité ≥40 %
si N ≥40) sont volontairement **très tolérantes** : elles détectent
une régression majeure du logiciel mais **ne démontrent pas** un taux
d'erreur nominal de 5 %, le contrôle de la FDR ou une sensibilité
scientifiquement acceptable. Une véritable validation confirmatoire
demanderait des scénarios plus variés, des intervalles d'incertitude
préspécifiés, des tests de non-infériorité/équivalence, des méthodes
de référence R indépendantes et la prise en compte du plan d'étude
réel. Aucun utilisateur ne reçoit un certificat automatique.

## Étude indépendante de concordance HC3 avec R et sensibilité MNAR

La CI `multiomics-methodology-validation.yml` génère des données brutes
simulées avant toute analyse, puis exécute séparément le navigateur et
une implémentation indépendante R de `lm(value ~ condition + batch + age)`,
avec HC3 calculé explicitement, Student-t, intervalles de confiance et BH.
Les méthodes HC3, limma et DESeq2 ne sont pas considérées interchangeables.

Le protocole gelé (`protocol.json`) couvre 24 et 64 sujets, quatre
mécanismes, **24 réplications nulles et 12 avec effets connus par cellule** :
**288 jeux simulés**. Il conserve observations, sorties JS, sorties R
et rapport JSON. Tolérances numériques préspécifiées R↔JS :
écart absolu ≤ 0,0003 pour coefficient, SE, p et q ; ≤ 0,001
pour les bornes d'intervalle. Dépassement = échec du contrat logiciel.

Le rapport mesure par scénario : taux de faux positifs, fraction de
fausses découvertes réalisée (FDP), couverture 95 % (intervalle Wilson),
biais estimé, sensibilité et attrition du filtre QC. Il ne prouve pas
une calibration nominale universelle ou un contrôle strict de FDR.

Deux contrôles négatifs MNAR sont inclus :
- Censure gauche : l'observation dépend de l'abondance non observée.
- MNAR différentiel : le défaut d'observation dépend de la valeur
  latente et du groupe, pouvant créer une différence sans effet réel.

**Une concordance avec R ne corrige pas le biais MNAR.** Ces scénarios
restent marqués `blocked_MNAR_nonidentifiable`. En données réelles,
un déséquilibre de données manquantes ≥30 points entre groupes,
une fraction médiane manquante ≥20 % par variable, ou une imputation
MNAR supposée bloque la préparation confirmatoire, même avec R.
À plus faible taux, une revue du mécanisme de manquants reste exigée.
Ces seuils sont des garde-fous pragmatiques, **pas des diagnostics
de MCAR/MAR/MNAR** : l'absence de déséquilibre ou une faible fraction
manquante ne rendent pas le mécanisme MNAR identifiable.

Cette étude vérifie le modèle conditionnellement aux variables
retenues par le QC ; elle ne valide ni le filtrage préalable, ni
les matrices MS, ni les plans longitudinaux/survie, ni la
transférabilité à une cohorte clinique indépendante.

## Survie : Cox Breslow, gestion des ex æquo et référence R indépendante

L'ancien solveur Cox itérait chaque événement sans déclarer sa
convention pour les temps d'événement identiques. Le solveur
actuel regroupe les événements au même instant dans la vraisemblance
partielle de **Breslow** et ajuste le score, l'information observée
et la convergence. La prédiction ridge-Cox utilise la même base.

Le script `scripts/test_multiomics_cox_reference.mjs` génère **80 jeux**
de survie : 48/80 sujets, coefficient nul ou connu, temps continus
ou arrondis (nombreux ex æquo), censure indépendante. Le workflow
`multiomics-cox-reference.yml` compare le coefficient, l'erreur
standard et la p-value Wald interne aux résultats indépendants de
`survival::coxph(..., ties='breslow')` dans R, avec tolérance absolue
préspécifiée de **0,001**, et enregistre le résultat de `cox.zph`.
Les données sources, sorties et diagnostics sont archivés.

**La concordance de la vraisemblance partielle ne valide pas
l'hypothèse de risques proportionnels, le mécanisme de censure,
la possibilité de covariables dépendantes du temps ou la
transférabilité clinique.** Le navigateur n'affiche donc plus
de p-value, q-value ou d'IC sur la régression Cox exploratoire ;
seuls les coefficients et rapports de risques descriptifs restent
présents. Pour des conclusions confirmatoires, il faut utiliser
un modèle R de référence adapté à l'étude et inspecter `cox.zph`,
les événements, les courbes de survie et les risques concurrents.
La validation croisée du C-index demeure une analyse prédictive
interne, pas une validation externe.

### Exécution de survie dans le moteur R local

Pour une seule omique ou plusieurs, le backend R propose désormais,
dans ses résultats de référence, `<omic>_survival` (par exemple
`proteomics_survival`). Il ajuste séparément chaque variable avec
`survival::coxph`, **méthode Efron** pour les événements ex æquo,
en incorporant les covariables demandées et un éventuel batch variable.
Il fournit coefficient, hazard ratio, p-value, q-value BH, intervalle,
effectifs/événements et diagnostics de risques proportionnels
`cox.zph` (variable et global). Le nom Efron est distinct du moteur
navigateur Breslow : leurs valeurs peuvent différer en présence de
nombreux événements liés au même temps.

Le routeur R **refuse** les observations répétées d'un même sujet,
les temps ou indicateurs d'événement incomplets, un nombre trop faible
d'événements, des covariables manquantes et les plans non estimables.
Un modèle dont `cox.zph` est significatif reste signalé comme
potentiellement non proportionnel. Même un p-value `cox.zph` non
significatif ne prouve pas l'hypothèse de risques proportionnels.

Le test `multiomics-engine/tests/test_survival_backend.R` vérifie
le modèle, les rejets de plans invalides, la correction BH sur la
famille **complète** de variables soumises et le passage effectif par
`run_backend_analysis`. L'exécution R est une **méthode de référence
accessible**, mais le parcours confirmatoire reste bloqué sans une
revue indépendante du protocole, de la censure et des risques concurrents.


## Projets portables, réouverture et confidentialité

Le site permet d'exporter, depuis une analyse terminée, un fichier
`multiomics_project_reproducible_v1.json` contenant les **textes
originaux** des matrices et de la feuille d'échantillons, les
paramètres de la session, une copie des résultats et une empreinte
cryptographique SHA-256 de chaque fichier. Les exports MS
originaux au format **texte** et leurs annotations éventuelles
sont inclus lorsqu'ils sont présents.

Au réimport : vérification **SHA-256** avant de restaurer les
fichiers, restauration des réglages, **aucune réutilisation des
résultats archivés comme s'ils venaient d'être recalculés**.
L'utilisateur décide explicitement de relancer l'analyse.
Le backend R et les API ChEBI/Reactome reviennent au mode
désactivé : aucune donnée n'est envoyée automatiquement.

**Sécurité et limites** : ce projet contient les données originales
et peut identifier des patients ou collaborateurs. Il reste local
au navigateur au cours de l'import/export mais doit être stocké
et partagé conformément aux règles du laboratoire et au RGPD.
Il n'est pas chiffré par l'application. Le format n'accepte que
des fichiers texte, avec une limite de **80 Mio** de source.
Les spectres mzML/mzXML bruts, l'environnement R complet, les
versions figées de toutes les dépendances et les réponses des
bases externes ne sont **pas** inclus. Une réanalyse avec une
autre version logicielle peut donner des résultats différents.
Pour une publication, archiver séparément les fichiers bruts
instrumentaux et les versions exactes R/Bioconductor/Reactome.

Les tests `scripts/test_multiomics_portable_project.mjs` et
`tests/e2e/multiomics-portable-project.spec.js` vérifient la
restauration exacte, la confidentialité des URL de backend,
l'absence de transmission externe automatique, et le refus
des fichiers falsifiés.

## Versions exactes du moteur R

Le backend R ajoute maintenant `runtime` à chaque analyse et au bilan
de disponibilité (`/health`) : version de R, plateforme, version
Bioconductor lorsque disponible, et versions installées de DESeq2,
edgeR, limma, lmerTest, survival, fgsea, MOFA2, mixOmics, xcms,
MsExperiment, Spectra, mzR, BiocParallel, plumber et jsonlite.

Ce manifeste est également conservé dans le rapport de résultats
et dans l'archive du projet si le backend a été utilisé. Il facilite
l'audit et le diagnostic d'un écart entre laboratoires, mais **ne
constitue pas un verrouillage reproductible de l'environnement** :
il manque encore un fichier renv.lock ou des conteneurs publiés
et figés par digest, la disponibilité exacte des systèmes d'exploitation,
les bibliothèques système et les versions des bases externes.

## Modèle longitudinal R : contraste explicite et refus des plans invalides

La voie R `lmerTest` a été renforcée pour le **contraste de pente
entre deux groupes fixes** (`condition:time`) : le contraste est
désormais **obligatoire et identifié par son nom**. L'ancien choix
automatique d'un coefficient d'interaction quelconque est supprimé.
Le code refuse des groupes qui changent au cours du suivi (crossover),
les observations techniques comptées deux fois pour un même sujet
et un même temps, les temps ambigus ou les unités temporelles mêlées,
les contrastes colinéaires, ainsi que les suivis insuffisants.

Le périmètre couvert actuellement comprend au minimum **10 sujets
indépendants** (au moins 5 par groupe) et **deux temps distincts
observés par sujet**, exprimés sur une échelle numérique cohérente :
`T0,T1,T2`, `D0,D1,D2`, `W0,W1,W2` ou des valeurs numériques.
Ces seuils constituent des **protections logicielles**, pas une
garantie de puissance. Une différence de pente linéaire ne remplace
pas un modèle de trajectoire non linéaire ni une analyse crossover.

Un ajustement aléatoire de pente est tenté seulement si le plan
comporte assez de temps par sujet. Une réduction vers intercept
aléatoire est **documentée**, et un ajustement singulier ou non
convergent ne produit pas de p-value interprétable. **Toutes les
variables de la matrice soumise restent présentes** dans le tableau
des résultats, avec un statut d'échec lorsque nécessaire :
la correction BH utilise toute la famille des variables
**y compris les ajustements non estimables avec p=1**.

Le test `multiomics-engine/tests/test_longitudinal_backend.R`
compare des coefficients et p-values à un ajustement `lmerTest`
indépendamment appelé sur les mêmes données, vérifie le routeur
R réel, impose plusieurs contrôles négatifs et effectue une
petite grille nulle de huit simulations. Ce test ne démontre pas
une calibration universelle sous MAR/MNAR, sans données manquantes
ou avec trajectoires non linéaires.

**Limite scientifique** : ce modèle suppose des effets linéaires
du temps et un groupe fixe. Les changements d'exposition, les
suivis manquants non ignorables, les interactions non linéaires
et l'indépendance de la censure nécessitent une autre analyse
et une validation dédiée. Le parcours confirmatoire reste
bloqué pour les plans longitudinaux jusqu'à revue indépendante.

## DIABLO : validation à sujets tenus à l'écart et prévention des fuites

Le module `mixOmics::tune.block.splsda` puis `perf()` utilise
une validation croisée répétée **sur la cohorte ayant servi au
réglage du modèle**. Le taux d'erreur équilibrée (BER) obtenu
par ce chemin est descriptif ; il ne peut pas être présenté comme
une erreur de validation externe ni comme une garantie de performance
d'un modèle biomarqueur. La documentation mixOmics distingue
l'ajustement/tuning du modèle et la prédiction de nouvelles données.

Une **option avancée, volontaire**, permet maintenant une étude
**interne avec sujets tenus à l'écart** : trois partitions stratifiées
fixées par des graines prédéterminées, préparation de chaque omique
sur l'entraînement seulement (filtrage des variables, imputations,
centrage et réduction), tuning keepX **sur les sujets d'entraînement
seulement**, puis prédiction par `mixOmics::predict` des seuls
sujets exclus de ce pli. Aucun résultat de pli manquant n'est
ignoré silencieusement.

Cette voie **refuse** les mesures longitudinales, moins de 32
sujets partagés et indépendants, moins de 12 sujets par classe,
plus de deux classes, des identifiants sujets dupliqués, des
covariables nécessitant un ajustement global, un batch variable
et toute matrice métabolomique (même déjà logarithmique) :
la chaîne actuelle de QC métabolomique peut apprendre des corrections
ou filtrer les variables sur l'ensemble de la cohorte avant les plis.
Les jeux éligibles sont pour l'instant RNA et protéomique **déjà
log-transformés** et documentés, sans prétraitement appris sur les
sujets de validation. Un prétraitement fait
**avant import** peut toujours avoir introduit une fuite.

Tests : `test_diablo_holdout_recipe.R` altère massivement les
mesures des sujets tenus à l'écart et vérifie que les variables
sélectionnées, paramètres d'imputation et valeurs de tous les
sujets d'entraînement sont **strictement inchangés**. Le test
`test_diablo_outer_reference.R` exécute le vrai package mixOmics
sur un signal connu et un résultat permuté.

**Limite** : les trois partitions réutilisent la même cohorte.
Ce n'est toujours **ni une validation externe indépendante,
ni une démonstration générale de FDR, ni une garantie de
sélection de biomarqueurs stables**. Les corrections instrumentales,
l'équilibrage des lots, les autres plans et la stabilité des
signatures devront recevoir des méthodologies adaptées.

## Intégration multiblocs : stabilité interne DIABLO et audit MOFA2

### DIABLO : fréquence de sélection et indice de Jaccard

Le chemin DIABLO à sujets tenus à l'écart archive maintenant pour
chaque partition d'entraînement les **identifiants effectivement
sélectionnés par `mixOmics::selectVar`**. Il calcule séparément
pour chaque omique la fréquence de sélection de chaque variable et
l'indice de Jaccard moyen/minimal/maximal entre les signatures des
partitions. Le rapport conserve les sélections dans
`diablo_signature_stability.rds` et présente une synthèse repliable
dans l'interface sans encombrer le parcours débutant.

Attention : une fréquence 100 % sur trois séparations qui se
chevauchent **n'est pas** une probabilité de reproductibilité dans
une population indépendante. La stabilité interne ne démontre pas
une association causale, un contrôle de FDR ou une validation
externe de biomarqueur. Des simulations nulles indépendantes,
des sous-groupes et des cohortes externes restent nécessaires.

### MOFA2 : absence de suppression silencieuse de sujets

Une nouvelle étape `mofa2_input_preflight` vérifie les identifiants
de sujets et de variables, l'absence de doublons, les observations
numériquement invalides et la part globale de mesures manquantes.
Le garde-fou expérimental refuse une vue dépassant **40 % de
valeurs manquantes** ; ce seuil est **opérationnel, pas une preuve
de validité MCAR/MAR**. Il refuse surtout les vues comportant des
**ensembles différents de sujets**. Le backend en place utilise
l'intersection des échantillons ; en l'absence d'un modèle dédié
aux vues entièrement absentes, cette sélection complète-cas
ne doit pas être effectuée sans le signaler.

La sortie MOFA2 contient le compte de sujets partagés, les vues,
leurs fractions de manquants et le statut explicite
`descriptive_latent_covariance_not_validated_biomarker`.
Les facteurs demeurent **exploratoires** ; aucune stabilité de
facteur ni recovery de signaux génératifs n'est certifiée par
ce contrôle logiciel. Une évaluation sur facteurs génératifs
connus et des réplications de MOFA2 restent à effectuer.

Les tests R du dossier `multiomics-engine/tests` vérifient les
calculs de Jaccard/fréquences et les refus d'identifiants
incohérents, tandis que la CI `mixOmics` réelle vérifie que
les variables sélectionnées ont des identifiants valides et
que le rapport de stabilité est produit sans perdre de plis.

## Tests de vérité connue MOFA2 et permutation nulle DIABLO

### MOFA2 : orientation des matrices corrigée (point P0)

L'interface utilisateur et le backend PMx échangent des matrices
**sujets × variables**. En revanche, `MOFA2::create_mofa` exige pour
une liste de matrices **variables en lignes et sujets en colonnes**.
L'ancien appel R lui fournissait les matrices sans transposition.
Le backend effectue désormais cette conversion explicitement et
vérifie que chaque colonne MOFA2 porte le bon identifiant sujet
et que les vues sont alignées dans le même ordre. Cela corrige un
problème méthodologique réel : ne pas réutiliser sans réanalyse les
résultats MOFA2 obtenus avec une ancienne version.

Le benchmark `test_mofa_truth_reference.R` fait fonctionner le
**vrai MOFA2** sur trois structures simulées : (a) facteur
biologique seul ; (b) facteur biologique + batch technique ;
(c) batch technique sans facteur biologique réel. Chaque scénario
est répété avec deux graines prédéterminées (six ajustements).
Les facteurs récupérés sont comparés à la vérité connue avec des
corrélations absolues, donc indépendantes de leur signe et de
leur ordre. Les données simulées et les erreurs sont conservées
dans les artefacts CI. Les seuils 0,65 sont des contrôles de
récupération d'un signal synthétique **fort**, pas une validation
universelle de MOFA2, d'un nombre optimal de facteurs ou
de la causalité biologique.

Le test R indépendant `test_mofa_truth_metrics.R` refuse les
identifiants perdus/dupliqués et les scores non finis, vérifie
les corrélations invariantes au signe, et confirme qu'un
**facteur purement technique de batch ne peut être étiqueté
comme signal biologique** simplement parce qu'il explique
de la variance.

### DIABLO : permutations et résolution statistique

`run_diablo_permutation_benchmark` réexécute le processus de
séparation par sujet, le prétraitement sur l'entraînement, le
réglage et la prédiction après avoir **permuté globalement les
étiquettes entre sujets**. Il compare le BER et le Jaccard des
signatures réelles aux distributions nulles, sans réutiliser
les transformations ni les modèles du jeu observé.

Le contrôle de CI utilise **8 permutations** et deux graines
de séparation. La résolution minimale d'une p-value de
permutation vaut **1/(8+1)=0,111**. Ces résultats sont donc
**des contrôles négatifs de logiciel, non des p-values permettant
une conclusion confirmatoire à 5 %**. Une étude d'inférence
sur biomarqueurs demanderait beaucoup plus de permutations,
des cohortes indépendantes et une vérification des plans
de batch/confusion et des décisions de prétraitement.

### Accessibilité débutant

Les détails techniques sont placés dans des sections
facultatives ; la page doit permettre de charger une démo
mono-omique sans installer R, consulter le contrôle qualité
et comprendre les limites des facteurs sans prendre les
corrélations ou les signatures pour des preuves de causalité.
Les tests navigateur vérifient ces chemins à chaque modification.

## Compatibilité des moteurs R : prévention des résultats MOFA2 historiques

Le correctif MOFA2 du 9 octobre 2026 change l'orientation effective
des matrices fournies à `MOFA2::create_mofa`. Les résultats MOFA2
obtenus avec d'anciennes versions du backend ne doivent **pas être
réutilisés sans réanalyse**.

Depuis la version **1.4.0** du backend, `/health` expose
`capabilities.mofa2_orientation_contract =
mofa2-feature-rows-sample-columns-v2`. Le résultat réel de chaque
ajustement inclut le même `implementationContract`, l'orientation
`feature_rows_subject_columns_for_MOFA2` et un indicateur de
préservation des identifiants des sujets.

Si un utilisateur ouvre une étude d'exploration multi-omique avec
un **ancien moteur R local**, le navigateur refuse de transmettre
les matrices à cet ancien backend. Le blocage est indiqué dans le
parcours principal en français/anglais, avec un message de mise
à jour simple. Les méthodes exploratoires locales restent disponibles.

Par défense supplémentaire, les réponses R qui revendiquent une
analyse MOFA2 réussie mais n'incluent pas **les trois preuves
exactes du contrat d'orientation** sont requalifiées `blocked` ;
leurs résultats ne sont pas affichés comme des résultats de
facteurs validés. Cela s'applique aussi si un ancien service
retourne une réponse mal formée.

Cette protection est un **contrat logiciel** : elle évite un
résultat déjà identifié comme incorrect, mais ne démontre pas
que les facteurs récupérés sur un nouveau jeu de données
sont biologiquement valides.

## Limites explicites non résolues

- Pas de test de calibration exhaustif sur l'ensemble des combinaisons de
  distributions, tailles d'échantillon, missingness, modèles mixtes,
  censure, traitements non linéaires ou interactions omiques.
- Une implémentation de limma/DESeq2/edgeR ou d'autres packages peut être
  présente dans le moteur R **sans** avoir été exécutée en CI faute de
  dépendances Bioconductor lourdes. Ne pas interpréter l'existence d'un
  adaptateur comme une validation complète.
- LOESS et imputations dépendent du protocole analytique et des QC disponibles.
- L'enrichissement Reactome et les réseaux sont **hypothétiques et annotatifs**,
  non des preuves de causalité ni de flux.
- Absence d'une étude d'utilisabilité indépendante auprès de biologistes novices.

## Sources méthodologiques

- Love, Huber & Anders (2014). DESeq2, *Genome Biology*, 15:550. DOI 10.1186/s13059-014-0550-8
- Law et al. (2014). voom, *Genome Biology*, 15:R29. DOI 10.1186/gb-2014-15-2-r29
- Broadhurst et al. (2018). Clinical metabolomics pooled QC guidelines. *Metabolomics*, 14:72. DOI 10.1007/s11306-018-1367-3

Les liens historiques et les implémentations de référence ne remplacent pas le
contrôle de l'étude par un statisticien / bioinformaticien compétent.

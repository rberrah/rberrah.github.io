# Multiomics — contrat de validité scientifique (v1, 2026-10-08)

## Positionnement

Ce logiciel est un **outil de recherche exploratoire**. Son bon fonctionnement technique,
la correction BH et la reproduction de signaux connus **ne constituent pas une validation
statistique générale**. Une analyse peut être exportée et reproductible tout en reposant
sur des hypothèses incorrectes. Le logiciel ne déclare donc jamais une analyse
« publication ready » automatiquement.

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
négative-binomiale) a également été exécuté sur **quatre scénarios nuls**
de 300 gènes × 40 échantillons, soit 1 200 hypothèses nulles par méthode.
Les taux observés de p < 0,05 et les nombres de découvertes BH à q ≤ 0,05
ont été : **DESeq2 6,1 % et 1/1 200**, **limma-voom 5,6 % et 0/1 200**,
**edgeR quasi-vraisemblance 6,2 % et 0/1 200**. Le job s'est terminé
avec succès. Ces fréquences descriptives ne démontrent pas une calibration
exacte au seuil de 5 %, ni un contrôle général de la FDR dans les études
réelles : quatre simulations et un unique ensemble de paramètres sont
insuffisants pour cela. Conserver les simulations, versions logicielles
et la traçabilité des comparaisons avant toute conclusion scientifique.

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

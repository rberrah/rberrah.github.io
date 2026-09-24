Prototype multi-omique — contrat de données / Multi-omics prototype — data contract

FRANÇAIS
========

Format canonique des métadonnées : format long, une ligne par mesure technique (assay).

Colonnes requises :
- subject_id : unité biologique indépendante / participant / animal / culture.
- sample_id : prélèvement biologique. Le même sample_id relie les mesures provenant du même prélèvement.
- assay_id : identifiant unique de mesure/run. Les colonnes des matrices doivent correspondre exactement à assay_id.
- omic : transcriptomics, proteomics ou metabolomics.

Colonnes optionnelles selon le design :
- condition : groupe expérimental ou traitement.
- timepoint : visite ou temps expérimental.
- batch : batch technique.
- technical_replicate : numéro de réplicat technique.
- outcome : phénotype/critère pour un outcome binaire, multiclasse, continu ou de comptage.
- survival_time : durée de suivi / temps jusqu'à événement pour une analyse de survie.
- survival_event : événement de survie codé 0/1.
- toute autre colonne peut être sélectionnée explicitement comme covariable.

Branches analytiques actuellement opérationnelles :
- explore : ACP multi-blocs équilibrée sur les sujets partagés entre les couches. Les variables sont standardisées dans chaque couche, les blocs sont pondérés par 1/sqrt(p), puis les axes et loadings communs sont calculés de façon déterministe.
- groups : comparaison de deux groupes, design apparié ou analyse multi-groupe indépendante selon le protocole déclaré.
- time : changement intra-sujet avec deux temps ou pente individuelle avec trois temps ou plus, puis comparaison entre conditions.
- outcome :
  - continu -> régression linéaire ;
  - binaire -> régression logistique ;
  - comptage -> régression de Poisson ;
  - multiclasse -> ANOVA ajustée ;
  - survie -> modèle de Cox ;
  - si plusieurs temps omiques sont présents, le temps utilisé comme prédicteur doit être choisi explicitement (par exemple baseline pour une analyse pronostique).
- crossover : volontairement bloqué tant que période et séquence ne sont pas modélisées.

Batches et covariables :
- les réplicats techniques partageant sample_id + omic sont agrégés après prétraitement ;
- un batch totalement confondu avec la condition, le temps ou un outcome catégoriel bloque l'inférence ;
- plusieurs batches non confondus sont ajustés variable par variable par résidualisation OLS avant les analyses groupes/temps/exploration ;
- dans la branche outcome, le batch est retiré des variables omiques avant le modèle et les covariables sélectionnées entrent explicitement dans la régression ;
- les covariables numériques sont standardisées ; les covariables catégorielles sont encodées explicitement ;
- aucune covariable n'est sélectionnée automatiquement.

Interprétation :
L'interface fournit une section « Comment interpréter ces résultats ? » construite par des règles déterministes à partir du type de modèle, des tailles d'effet, q-values, ajustements, relations inter-omiques et résultats Reactome. Elle ne génère pas de causalité ni de mécanisme non observé.

Services scientifiques externes actuellement appelés :
- ChEBI : résolution conservatrice optionnelle des identifiants métabolites.
- Reactome : sur-représentation de voies et consensus entre couches.

Ensembl, UniProt, UniChem, KEGG et STRING restent des connecteurs prévus ; ils ne sont pas appelés silencieusement par le moteur actuel.

Validation publique automatisée :
- Nutrimouse : biologie PPARalpha, CYP3A11 et métabolites lipidiques.
- TCGA breast : HER2/LumA et analyse Basal/Her2/LumA.
- NCI-60 IntLIM et BRCA IntLIM : changements publiés de corrélations gène-métabolite.
- AgingHFCD : concordance RNA/protéine/métabolite avec les résultats différentiels de référence.
- STATegra : trajectoire Ikaros et structure à 36 échantillons / 3 réplicats biologiques.
- LRRK2 G2019S : concordance RNA/protéine et biologie RAB/endocytose.
- PaintOmics : signal multi-omique planté connu.
- missRows NCI-60 : appariement partiel réel entre couches.

ANALYSE DE L'ÉCHELLE STATegra :
Les données au niveau réplicat et le résumé public à six temps sont très concordants en direction mais ne sont pas numériquement interchangeables. L'échelle des valeurs doit donc être déclarée explicitement.

ENGLISH
=======

Canonical metadata format: long format, one row per technical assay.

Required columns:
- subject_id: independent biological unit.
- sample_id: biological specimen.
- assay_id: unique technical measurement/run ID; matrix columns must match it exactly.
- omic: transcriptomics, proteomics or metabolomics.

Optional design columns include condition, timepoint, batch, technical_replicate, outcome, survival_time, survival_event and any explicitly selected covariate columns.

Operational branches:
- explore: deterministic balanced multi-block PCA across shared subjects.
- groups: two-group, paired or independent multi-group inference according to the declared design.
- time: within-subject change or individual slope followed by between-condition inference.
- outcome: linear, logistic, Poisson, adjusted multiclass ANOVA or Cox regression according to endpoint type. When several omics visits exist, the molecular time point entering the model must be selected explicitly (for example baseline in a prognostic analysis).
- crossover remains blocked until period and sequence effects are modelled.

Multiple non-confounded batches are explicitly adjusted by feature-wise OLS residualisation. Selected covariates are encoded explicitly; the tool never chooses confounders automatically.

The result page includes a deterministic “How should these results be interpreted?” guide. ChEBI and Reactome are the currently active external scientific services.

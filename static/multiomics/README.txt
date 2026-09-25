Pipeline multi-omique PMx Explain — contrat et méthodes
========================================================

FRANÇAIS
========

1. CONTRAT DE DONNÉES

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
- outcome : phénotype/critère pour outcome binaire, multiclasse, continu ou comptage.
- survival_time : durée de suivi / temps jusqu'à événement.
- survival_event : événement de survie codé 0/1.
- sample_type : pour les workflows MS, biological / pooled_qc (ou qc) / blank.
- injection_order : ordre numérique d’injection pour la correction de dérive MS.
- toute autre colonne peut être sélectionnée explicitement comme covariable.

2. CONTRÔLE QUALITÉ ET PRÉTRAITEMENT

Avant l'inférence, chaque couche reçoit un QC spécifique au type déclaré :
- RNA counts / spectral counts : contrôle de profondeur/détection, filtrage CPM conservateur, normalisation par taille de librairie et transformation log2.
- intensités / concentrations : contrôle de missingness, détection, transformation déclarée et centrage médian lorsque pertinent.
- variables constantes ou quasi non observées : retirées avant les modèles.
- assays suspects : détectés par profondeur/signal, nombre de variables détectées et missingness avec règles robustes.
- réplicats techniques : corrélation de Spearman calculée avant agrégation ; r < 0,80 génère un avertissement.
- PCA QC : calculée par couche après prétraitement pour visualiser structure globale, batch et outliers. Une imputation médiane n'est utilisée que pour cette visualisation QC.

Les résultats affichent le nombre de variables avant/après filtre, le missing médian, les assays suspects, les réplicats faibles et la PCA QC.

Pour LC-MS/GC-MS lorsque sample_type et injection_order sont fournis :
- les injections blank et pooled-QC sont exclues de l’inférence biologique ;
- évaluation des signaux associés aux blanks par ratio médiane biologique / médiane blank (5 par défaut) ; le mode par défaut signale les variables sans les supprimer, et un mode d’exclusion explicite est disponible si la SOP du laboratoire le justifie ;
- correction de dérive sur l’échelle log par régression locale déterministe des pooled-QC selon l’ordre d’injection lorsque ≥5 QC ordonnés sont disponibles ;
- filtre de stabilité pooled-QC par RSD (30 % par défaut) ;
- aucune imputation MNAR par défaut ;
- si l’utilisateur sélectionne explicitement « left-censored », les valeurs manquantes biologiques sont imputées dans le bas de la distribution et cette opération est tracée ;
- une analyse confirmatoire doit conserver une analyse de sensibilité sans imputation.

3. BATCHES ET COVARIABLES

- Un batch totalement confondu avec condition, temps ou outcome catégoriel bloque l'analyse.
- Groupes indépendants : modèle explicite feature ~ condition + batch + covariables.
  - 2 groupes : OLS avec erreurs standards robustes HC3.
  - >=3 groupes : ANCOVA avec test F partiel.
- Outcome : batch et covariables entrent directement dans chaque modèle comme termes de nuisance ; les variables omiques ne sont pas pré-résidualisées.
- Temps répétés : batch et covariables entrent directement dans le modèle longitudinal.
- Exploration / corrélations inter-omiques : une copie résidualisée est utilisée lorsque nécessaire pour retirer les facteurs de nuisance.
- Aucune covariable n'est choisie automatiquement.

4. BRANCHES ANALYTIQUES

Explore :
- ACP multi-blocs équilibrée déterministe.
- Standardisation dans chaque couche.
- Pondération 1/sqrt(p) pour éviter qu'une couche avec davantage de variables domine.
- PC1/PC2, scores, loadings et contribution par couche.
- Si partialOmicsExpected=yes, les sujets avec une couche entière absente peuvent participer ; les valeurs absentes sont mises à la moyenne standardisée (0) uniquement pour cette intégration latente exploratoire, jamais pour les tests différentiels.

Groups :
- comparaison ajustée au design et aux covariables.
- correction Benjamini-Hochberg.
- taille d'effet / fold ratio lorsque l'échelle est log2.
- corrélations inter-omiques différentielles sur les sujets réellement communs.

Time :
- design repeated : modèle longitudinal déterministe à intercept aléatoire sujet :
  feature ~ condition * time + batch + covariables + (1|subject)
- estimation GLS itérative du terme aléatoire, interaction condition x temps, IC95 %, FDR et ICC.
- les designs appariés simples conservent une analyse intra-sujet dédiée.
- crossover reste bloqué tant que période et séquence ne sont pas explicitement modélisées.

Outcome :
- continu : régression linéaire.
- binaire : régression logistique.
- comptage : Poisson.
- multiclasse : ANCOVA / test F partiel.
- survie : Cox.
- si plusieurs temps omiques existent, le temps moléculaire utilisé par le modèle doit être choisi explicitement.

5. INTÉGRATION MULTI-OMIQUE

Non supervisée :
- ACP multi-blocs équilibrée native du navigateur.

Supervisée :
- composante multiblocs PLS1-style transparente, construite à partir de la cible déclarée.
- elle fournit poids par variable, contribution par couche et corrélation score-cible.
- elle est descriptive et n'est PAS appelée DIABLO.

Méthodes de référence R :
- multiomics-engine/advanced_methods.R utilise réellement DESeq2, limma, lmerTest, fgsea, MOFA2 et mixOmics::block.splsda (DIABLO).
- multiomics-engine/server.R expose ces méthodes via un bridge local/serveur.
- l’interface propose trois modes : Auto, navigateur uniquement, ou R requis.
- en mode Auto, elle interroge /health puis appelle /run si le backend répond.
- adresse locale par défaut : http://127.0.0.1:8787.
- GitHub Pages ne démarre pas R lui-même : lancer d’abord Rscript multiomics-engine/run_backend.R, ou utiliser un serveur contrôlé.
- un serveur distant doit ajouter TLS, authentification, limites de taille et restriction CORS avant réception de données de recherche.

6. ASSOCIATION VS PRÉDICTION OUTCOME

L'analyse feature-wise et la prédiction sont séparées.

La validation prédictive actuellement disponible pour outcome binaire, multiclasse, continu, comptage et survie utilise :
- folds externes déterministes ;
- sélection de variables limitée aux sujets d'entraînement du fold externe ;
- réglage interne de la pénalisation ridge ;
- prédictions hors échantillon.
Métriques :
- binaire : AUC, accuracy, log-loss.
- multiclasse : accuracy.
- continu / comptage : RMSE et R² hors échantillon.
- survie : sélection univariée Cox limitée au fold d’entraînement, Cox ridge pénalisée, réglage interne de λ et C-index de Harrell sur les folds externes.

Une validation externe indépendante reste nécessaire avant usage clinique.

7. DONNÉES MANQUANTES

- aucune imputation cachée dans les tests différentiels, régressions outcome ou tests de corrélation.
- les corrélations inter-omiques utilisent uniquement les sujets présents dans les deux couches de la paire.
- l'exploration latente peut accepter des blocs omiques absents uniquement si cela est déclaré ; le remplissage par moyenne standardisée est alors limité à cette étape exploratoire.
- la couverture sujet x omique est enregistrée explicitement.

8. ENRICHISSEMENT BIOLOGIQUE

Reactome :
- l'outil interroge Reactome sur les variables sélectionnées.
- il interroge aussi Reactome avec l'univers des variables réellement conservées après QC.
- il recalcule localement un test hypergéométrique puis Benjamini-Hochberg avec cet univers assay-specific.
- la FDR Reactome par défaut n'est utilisée qu'en repli lorsque l'univers spécifique ne peut pas être mappé.
- le nombre de couches soutenant séparément une voie à FDR <=0,10 est affiché pour quantifier la convergence inter-omique.

9. IDENTIFIANTS

Résolution conservative actuellement active :
- transcriptomique : Ensembl ; les identifiants Ensembl canoniques sont conservés, les symboles peuvent être résolus via Ensembl.
- protéomique : UniProt / Ensembl ; les accessions UniProt canoniques sont conservées.
- métabolomique : ChEBI avec correspondances exactes et alias lipidiques déterministes ; les InChIKey peuvent être reliés à ChEBI via UniChem lorsqu'une correspondance unique existe.
- les cas ambigus restent ambiguous/unresolved ; aucun mapping n'est forcé.
- limites de requêtes appliquées pour éviter les appels excessifs.

10. RAPPORT REPRODUCTIBLE

Chaque analyse enregistre :
- version du moteur ;
- protocole complet ;
- mapping des colonnes ;
- QC et prétraitements ;
- covariables ;
- structure des batches ;
- empreintes FNV1a32 des inputs et tailles de fichiers ;
- résultats statistiques ;
- intégration supervisée/exploratoire ;
- validation prédictive ;
- résultats Reactome.

L'interface permet de télécharger :
- JSON complet ;
- CSV par couche ;
- rapport HTML autonome contenant provenance, méthodes, QC, résultats et JSON complet embarqué.

11. AIDE À L'INTERPRÉTATION

Les colonnes statistiques comportent des infobulles « ? » accessibles à la souris et au clavier :
- Fold ratio / effect ;
- p ;
- q BH ;
- Pattern ;
- r reference ;
- r comparison ;
- Delta r ;
- q BH des corrélations ;
- FDR univers assay ;
- FDR par couche ;
- nombre de couches concordantes.

L'interface contient également une section « Comment interpréter ces résultats ? » et un glossaire.

12. VALIDATION PUBLIQUE

La suite automatisée comprend notamment :
- Nutrimouse ;
- TCGA breast ;
- IntLIM NCI-60 et BRCA ;
- AgingHFCD ;
- STATegra ;
- LRRK2 G2019S ;
- PaintOmics à signal multi-omique planté ;
- missRows NCI-60.

Les benchmarks vérifient des vérités biologiques ou statistiques attendues et pas seulement l'exécution du code.

13. LIMITES ENCORE IMPORTANTES

Le navigateur constitue désormais une pipeline analytique déterministe utilisable sur des matrices déjà produites, avec bridge optionnel vers les implémentations R de référence. Limites restantes :
- edgeR/voom automatisé n’est pas encore routé ; DESeq2 et limma le sont via le backend R.
- le QC MS implémente blanks, dérive pooled-QC, RSD et une option MNAR déterministe, mais ne remplace pas un workflow vendor/raw complet (peak picking, alignment, adducts/isotopes, internal standards, carry-over ou batch correction instrument-spécifique).
- fgsea peut récupérer des mappings Reactome lorsque les identifiants sont directement compatibles Ensembl/UniProt ; les identifiants nécessitant une résolution préalable plus complexe restent limités.
- le backend local est automatique lorsqu’il est lancé, mais le site statique ne peut pas créer lui-même le processus R.
- les identifiants chimiques autres que ChEBI/noms exacts/alias déterministes/InChIKey ne disposent pas encore tous d’une conversion cross-database automatique.
- validation externe reste indispensable pour un modèle prédictif destiné à la clinique.

ENGLISH
=======

The browser pipeline now implements the same major stages described above: explicit data contract, modality-aware QC, adjusted design-matrix models, repeated-measures random-intercept GLS, partial-block handling, balanced unsupervised and supervised multiblock integration, nested cross-validated prediction, assay-universe Reactome enrichment, conservative identifier resolution and a reproducible HTML report.

Reference MOFA2 and DIABLO adapters are provided under multiomics-engine/advanced_methods.R for local/server execution. They are intentionally kept distinct from the browser-native PCA/PLS components.

Reference R adapters cover DESeq2, limma, lmerTest, fgsea, MOFA2 and DIABLO. The browser can automatically use them when the local/server bridge is running. Cross-validated survival prediction and advanced MS blank/QC-drift/RSD/MNAR handling are implemented. Remaining limits include full vendor/raw MS processing, edgeR/voom routing, broader chemical-ID cross-mapping, secure deployment of a remote R backend, and external clinical validation.

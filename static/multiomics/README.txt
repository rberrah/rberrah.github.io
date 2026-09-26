Pipeline multi-omique PMx Explain — format des fichiers et méthodes
==================================================================

FRANÇAIS
========

LECTURE RAPIDE — LES MOTS UTILISÉS DANS L’OUTIL
=================================================

Avant les détails techniques, voici la traduction des principaux termes :

- « tableau des échantillons » = fichier qui décrit qui a été prélevé, quel prélèvement a été analysé, dans quel groupe et à quel moment. Ce fichier est parfois appelé metadata / sample sheet.
- « matrice » = tableau contenant les valeurs mesurées. Les lignes sont généralement des gènes, protéines ou métabolites ; les colonnes correspondent aux mesures de vos échantillons.
- « critère étudié » = outcome / endpoint. Exemple : réponse au traitement, concentration, score, décès ou temps jusqu’à un événement.
- « série technique » = batch. Exemple : plaque, jour d’analyse, run ou lot technique.
- « facteur d’ajustement » = covariable. Exemple : âge, sexe, centre ou traitement concomitant.
- « variable biologique » = feature. Selon l’omique, il peut s’agir d’un gène, d’une protéine ou d’un métabolite.
- « résultat corrigé » = q BH / FDR. Il tient compte du fait que des centaines ou milliers de variables sont testées simultanément.
- « validation croisée » = séparation répétée des données en parties d’apprentissage et de validation afin d’évaluer une prédiction sur des sujets non utilisés pour construire le modèle.

La règle générale de l’interface est : terme simple d’abord ; terme statistique dans l’aide « ? » ou entre parenthèses lorsque nécessaire.

1. TABLEAU DES ÉCHANTILLONS

Le tableau des échantillons est un fichier au format long : une ligne correspond à une mesure technique.
Il ne contient pas les milliers de valeurs RNA, protéines ou métabolites. Il sert uniquement à expliquer à l’outil à quoi correspondent les colonnes des matrices.

Colonnes requises :
- subject_id : qui ? participant, animal, culture ou autre unité biologique indépendante.
- sample_id : quel prélèvement ? Le même sample_id relie les mesures provenant du même prélèvement biologique.
- assay_id : quelle mesure ? Cet identifiant doit correspondre exactement à une colonne de la matrice concernée.
- omic : quel type de mesure ? transcriptomics, proteomics ou metabolomics.

Colonnes optionnelles selon l’étude :
- condition : groupe expérimental ou traitement.
- timepoint : visite ou moment expérimental.
- batch : série technique, par exemple plaque, jour ou run.
- technical_replicate : numéro de répétition technique.
- outcome : critère étudié pour une analyse binaire, multiclasse, continue ou de comptage.
- survival_time : durée de suivi / temps jusqu’à l’événement.
- survival_event : événement observé, codé 0/1.
- sample_type : pour les workflows MS, biological / pooled_qc (ou qc) / blank.
- injection_order : ordre numérique d’injection pour la correction de dérive MS.
- toute autre colonne peut être choisie explicitement comme facteur d’ajustement.

Exemple simple :
P001 / P001_T0 / RNA001 / transcriptomics
P001 / P001_T0 / PROT001 / proteomics
P001 / P001_T0 / MET001 / metabolomics

Ici, P001 est la même personne, P001_T0 le même prélèvement, et RNA001 / PROT001 / MET001 trois mesures différentes de ce prélèvement.

2. CONTRÔLE QUALITÉ ET PRÉTRAITEMENT

Avant l’analyse statistique, chaque couche reçoit un contrôle adapté au type de données déclaré :
- RNA counts / spectral counts : contrôle du nombre de lectures ou signaux détectés, filtrage CPM conservateur, normalisation par taille de librairie et transformation log2.
- intensités / concentrations : contrôle des valeurs manquantes, de la détection, transformation déclarée et centrage médian lorsque pertinent.
- variables constantes ou presque jamais observées : retirées avant les modèles.
- mesures suspectes : détectées à partir de la profondeur ou du signal global, du nombre de variables détectées et du pourcentage de valeurs manquantes.
- répétitions techniques : corrélation de Spearman calculée avant agrégation ; r < 0,80 génère un avertissement.
- vue globale par ACP : calculée par couche après prétraitement pour visualiser structure globale, séries techniques et valeurs atypiques. Une imputation médiane n’est utilisée que pour cette visualisation de contrôle qualité.

Les résultats affichent le nombre de variables avant/après filtre, le pourcentage de valeurs manquantes, les mesures suspectes, les répétitions techniques faibles et la vue ACP de contrôle qualité.

Pour LC-MS/GC-MS lorsque sample_type et injection_order sont fournis :
- les blanks et pooled-QC sont exclus de l’analyse biologique ;
- les signaux présents dans les blanks sont évalués par le rapport médiane biologique / médiane blank (5 par défaut) ; par défaut ils sont signalés sans être supprimés ;
- un mode d’exclusion explicite est disponible si la procédure validée du laboratoire le justifie ;
- la dérive instrumentale est corrigée à partir des pooled-QC selon l’ordre d’injection lorsque ≥5 QC ordonnés sont disponibles ;
- la stabilité des pooled-QC peut être filtrée par RSD (30 % par défaut) ;
- aucune imputation MNAR n’est réalisée par défaut ;
- si l’utilisateur sélectionne explicitement « left-censored », les valeurs manquantes biologiques sont imputées dans le bas de la distribution et cette opération est tracée ;
- une analyse confirmatoire doit conserver une analyse de sensibilité sans imputation.

3. DIFFÉRENCES TECHNIQUES ET FACTEURS D’AJUSTEMENT

- Une série technique totalement confondue avec le groupe, le temps ou un critère catégoriel bloque l’analyse car les deux effets ne peuvent pas être séparés.
- Groupes indépendants : modèle explicite feature ~ condition + batch + covariables.
  - 2 groupes : OLS avec erreurs standards robustes HC3.
  - >=3 groupes : ANCOVA avec test F partiel.
- Critère étudié : les séries techniques et facteurs d’ajustement entrent directement dans chaque modèle ; les variables omiques ne sont pas pré-résidualisées.
- Mesures répétées : séries techniques et facteurs d’ajustement entrent directement dans le modèle longitudinal.
- Exploration / corrélations inter-omiques : une copie ajustée peut être utilisée lorsque nécessaire pour retirer les facteurs techniques ou cliniques déclarés.
- Aucun facteur d’ajustement n’est choisi automatiquement.

4. QUESTIONS AUXQUELLES L’OUTIL PEUT RÉPONDRE

Explorer les données :
- résumé des grandes tendances communes entre couches omiques ;
- méthode technique : ACP multi-blocs équilibrée déterministe ;
- standardisation dans chaque couche ;
- pondération 1/sqrt(p) pour éviter qu’une couche avec davantage de variables domine ;
- PC1/PC2, scores, contributions des variables et contribution par couche ;
- si partialOmicsExpected=yes, les sujets avec une couche entière absente peuvent participer à l’exploration ; les valeurs absentes sont mises à la moyenne standardisée (0) uniquement pour cette étape exploratoire, jamais pour les tests différentiels.

Comparer des groupes :
- comparaison adaptée au plan d’étude et aux facteurs d’ajustement ;
- correction Benjamini-Hochberg pour tenir compte du grand nombre de tests ;
- amplitude de l’effet / fold ratio lorsque l’échelle est log2 ;
- comparaison des relations entre omiques sur les sujets réellement présents dans les deux couches.

Étudier l’évolution dans le temps :
- mesures répétées : modèle à intercept aléatoire sujet ;
  feature ~ condition * time + batch + covariables + (1|subject)
- interaction condition x temps, intervalle de confiance à 95 %, FDR et ICC ;
- les designs appariés simples conservent une analyse intra-sujet dédiée ;
- les études crossover restent bloquées tant que période et séquence ne sont pas explicitement modélisées.

Relier les données à un critère :
- critère continu : régression linéaire ;
- oui/non : régression logistique ;
- comptage : Poisson ;
- plusieurs catégories : ANCOVA / test F partiel ;
- survie : Cox ;
- si plusieurs temps omiques existent, le temps moléculaire utilisé doit être choisi explicitement.

5. INTÉGRATION MULTI-OMIQUE

Sans critère cible :
- ACP multi-blocs équilibrée native du navigateur.

Avec critère cible :
- composante multi-blocs PLS1-style transparente, construite à partir du critère déclaré ;
- poids par variable, contribution par couche et corrélation score-cible ;
- cette méthode descriptive n’est PAS appelée DIABLO.

Méthodes R de référence :
- multiomics-engine/advanced_methods.R utilise réellement DESeq2, limma, lmerTest, fgsea, MOFA2 et mixOmics::block.splsda (DIABLO) ;
- multiomics-engine/server.R expose ces méthodes via un bridge local/serveur ;
- l’interface propose trois modes : Auto, navigateur uniquement, ou R requis ;
- en mode Auto, elle interroge /health puis appelle /run si le backend répond ;
- adresse locale par défaut : http://127.0.0.1:8787 ;
- GitHub Pages ne démarre pas R lui-même : lancer d’abord Rscript multiomics-engine/run_backend.R, ou utiliser un serveur contrôlé ;
- un serveur distant doit ajouter TLS, authentification, limites de taille et restriction CORS avant réception de données de recherche.

6. ASSOCIATION ET PRÉDICTION SONT DEUX QUESTIONS DIFFÉRENTES

L’analyse variable par variable recherche quelles molécules sont associées au critère.
La prédiction demande si l’ensemble des données permet de prévoir le critère chez de nouveaux sujets.

La validation prédictive disponible pour critères binaires, multiclasse, continus, de comptage et de survie utilise :
- des séparations externes déterministes des données ;
- un ajustement des séries techniques et facteurs d’ajustement estimé uniquement chez les sujets d’apprentissage ;
- une sélection de variables limitée aux sujets d’apprentissage ;
- centrage, mise à l’échelle et imputation calculés uniquement dans l’apprentissage ;
- réglage interne de la pénalisation ridge ;
- prédictions finales sur des sujets non utilisés pour construire le modèle.

Métriques :
- binaire : AUC, accuracy, log-loss ;
- multiclasse : accuracy ;
- continu / comptage : RMSE et R² hors échantillon ;
- survie : sélection univariée Cox dans l’apprentissage, Cox ridge pénalisée, réglage interne de λ et C-index de Harrell sur les données externes de validation croisée.

Une validation externe indépendante reste nécessaire avant usage clinique.

7. DONNÉES MANQUANTES

- aucune imputation cachée dans les tests différentiels, régressions sur le critère ou tests de corrélation ;
- les corrélations entre omiques utilisent uniquement les sujets présents dans les deux couches concernées ;
- l’exploration latente peut accepter une couche omique entièrement absente uniquement si cela est déclaré ; le remplissage par moyenne standardisée est alors limité à cette étape exploratoire ;
- la couverture sujet x omique est enregistrée explicitement.

8. INTERPRÉTATION BIOLOGIQUE AVEC REACTOME

- l’outil interroge Reactome à partir des variables sélectionnées ;
- il utilise également comme référence l’ensemble des variables réellement conservées après contrôle qualité ;
- il recalcule localement un test hypergéométrique puis Benjamini-Hochberg avec cet univers spécifique ;
- la FDR Reactome par défaut n’est utilisée qu’en repli lorsque cet univers spécifique ne peut pas être mappé ;
- le nombre de couches soutenant séparément une voie à FDR <=0,10 est affiché pour quantifier la convergence entre omiques.

9. IDENTIFIANTS

Résolution conservative actuellement active :
- transcriptomique : Ensembl ; les identifiants Ensembl canoniques sont conservés, les symboles peuvent être résolus via Ensembl ;
- protéomique : UniProt / Ensembl ; les accessions UniProt canoniques sont conservées ;
- métabolomique : ChEBI avec correspondances exactes et alias lipidiques déterministes ; les InChIKey peuvent être reliés à ChEBI via UniChem lorsqu’une correspondance unique existe ;
- les cas ambigus restent ambiguous/unresolved ; aucun mapping n’est forcé ;
- des limites de requêtes évitent les appels excessifs.

10. RAPPORT REPRODUCTIBLE

Chaque analyse enregistre :
- version du moteur ;
- description complète de l’étude ;
- correspondance des colonnes ;
- contrôle qualité et prétraitements ;
- facteurs d’ajustement ;
- structure des séries techniques ;
- empreintes FNV1a32 des fichiers d’entrée et tailles de fichiers ;
- résultats statistiques ;
- intégration supervisée/exploratoire ;
- validation prédictive ;
- résultats Reactome.

L’interface permet de télécharger :
- JSON complet ;
- CSV par couche ;
- rapport HTML autonome contenant provenance, méthodes, contrôle qualité, résultats et JSON complet embarqué.

11. AIDE À L’INTERPRÉTATION

Les colonnes statistiques comportent des infobulles « ? » accessibles à la souris et au clavier. L’interface affiche en priorité une formulation simple et conserve le terme technique dans l’aide.

Exemples :
- Fold ratio / effet : amplitude et sens du changement ;
- p : compatibilité du résultat avec l’hypothèse nulle pour un test donné ;
- q BH : p-value corrigée pour les nombreux tests ;
- Pattern : forme du changement observé ;
- r reference / r comparison : corrélation dans chacun des groupes ;
- Delta r : différence de corrélation entre groupes ;
- FDR univers assay : enrichissement corrigé avec l’ensemble réellement mesuré comme référence ;
- nombre de couches concordantes : combien d’omics soutiennent indépendamment la même voie.

L’interface contient également une section « Comment interpréter ces résultats ? » et un glossaire.

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

Les benchmarks vérifient des résultats biologiques ou statistiques attendus et pas seulement l’exécution du code.

13. LIMITES ENCORE IMPORTANTES

Le navigateur constitue désormais une pipeline analytique déterministe utilisable sur des matrices déjà produites, avec bridge optionnel vers les implémentations R de référence. Limites restantes :
- edgeR/voom automatisé n’est pas encore routé ; DESeq2 et limma le sont via le backend R ;
- le QC MS implémente blanks, dérive pooled-QC, RSD et une option MNAR déterministe, mais ne remplace pas un workflow vendor/raw complet (peak picking, alignment, adducts/isotopes, internal standards, carry-over ou batch correction instrument-spécifique) ;
- fgsea peut récupérer des mappings Reactome lorsque les identifiants sont directement compatibles Ensembl/UniProt ; les identifiants nécessitant une résolution préalable plus complexe restent limités ;
- le backend local est automatique lorsqu’il est lancé, mais le site statique ne peut pas créer lui-même le processus R ;
- les identifiants chimiques autres que ChEBI/noms exacts/alias déterministes/InChIKey ne disposent pas encore tous d’une conversion cross-database automatique ;
- une validation externe reste indispensable pour un modèle prédictif destiné à la clinique.

ENGLISH
=======

Plain-language rule: the interface shows the user-facing meaning first and keeps the technical term in help text or parentheses when needed for reproducibility.

Examples: metadata = sample sheet; outcome = endpoint; batch = technical series; covariate = adjustment factor; feature = measured gene/protein/metabolite; BH q/FDR = multiple-testing corrected result.

The browser pipeline implements an explicit sample-sheet contract, modality-aware QC, adjusted statistical models, repeated-measures models, partial-block handling, balanced unsupervised and supervised multiblock integration, nested cross-validated prediction, assay-universe Reactome enrichment, conservative identifier resolution and a reproducible HTML report.

Reference MOFA2 and DIABLO adapters are provided under multiomics-engine/advanced_methods.R for local/server execution. They are intentionally kept distinct from the browser-native PCA/PLS components.

Reference R adapters cover DESeq2, limma, lmerTest, fgsea, MOFA2 and DIABLO. The browser can automatically use them when the local/server bridge is running. Cross-validated survival prediction and advanced MS blank/QC-drift/RSD/MNAR handling are implemented. Remaining limits include full vendor/raw MS processing, edgeR/voom routing, broader chemical-ID cross-mapping, secure deployment of a remote R backend, and external clinical validation.

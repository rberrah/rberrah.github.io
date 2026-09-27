Pipeline multi-omique PMx Explain — guide simple des fichiers et méthodes
=======================================================================

FRANÇAIS
========

LECTURE RAPIDE — LES MOTS UTILISÉS DANS L’OUTIL
=================================================

L’interface affiche d’abord le sens pratique. Le terme technique reste disponible entre parenthèses ou dans l’aide « ? » lorsque cela est utile pour la reproductibilité.

- Tableau des échantillons = metadata / sample sheet. Il indique qui a été étudié, quel prélèvement a été analysé, dans quel groupe et à quel moment.
- Matrice = tableau contenant les valeurs mesurées. Les lignes sont des gènes, protéines ou métabolites ; les colonnes correspondent aux mesures des échantillons.
- Critère étudié = outcome / endpoint. Exemple : réponse au traitement, concentration, score, décès ou délai jusqu’à un événement.
- Série technique = batch. Exemple : plaque, jour, run ou lot technique.
- Facteur d’ajustement = covariable. Exemple : âge, sexe, centre ou traitement concomitant.
- Variable biologique = feature. Selon la couche, il s’agit d’un gène, d’une protéine ou d’un métabolite.
- Résultat corrigé = q BH / FDR. Il tient compte du grand nombre de variables testées simultanément.
- Validation croisée = évaluation d’une prédiction sur des sujets qui n’ont pas servi à construire le modèle.

PRINCIPE GÉNÉRAL
================

Le logiciel automatise ce qui peut l’être sans masquer les hypothèses. Il ne transforme pas un plan expérimental non identifiable en analyse valide, ne déduit pas la puissance du seul nombre de sujets, ne fusionne pas artificiellement les q-values de plusieurs méthodes et ne présente pas une validation croisée interne comme une validation externe.

Le parcours conseillé est :
1. poser la question biologique ;
2. décrire correctement sujets, prélèvements et mesures ;
3. vérifier le plan et la qualité ;
4. exécuter la méthode compatible ;
5. lire amplitude + incertitude + q/FDR ;
6. chercher la convergence entre omiques ;
7. replacer le signal dans son contexte biologique ;
8. conserver les limites d’interprétation et le manifeste reproductible.

1. TABLEAU DES ÉCHANTILLONS
===========================

Le tableau des échantillons ne contient pas les milliers de valeurs moléculaires. Il explique simplement à l’outil à quoi correspondent les colonnes des matrices.

Colonnes essentielles :
- subject_id : participant, animal, culture ou unité biologique indépendante ;
- sample_id : prélèvement biologique ;
- assay_id : mesure technique correspondant exactement à une colonne de matrice ;
- omic : transcriptomics, proteomics ou metabolomics.

Colonnes utilisées selon l’étude :
- condition : groupe ou traitement ;
- timepoint : visite ou moment expérimental ;
- batch : série technique ;
- technical_replicate : répétition technique ;
- outcome : critère étudié ;
- survival_time : durée de suivi ;
- survival_event : événement observé/censuré ;
- sample_type : biological / pooled_qc / qc / blank pour les workflows MS ;
- injection_order : ordre d’injection MS ;
- toute autre colonne peut être sélectionnée explicitement comme facteur d’ajustement.

Exemple :
P001 / P001_T0 / RNA001  / transcriptomics
P001 / P001_T0 / PROT001 / proteomics
P001 / P001_T0 / MET001  / metabolomics

P001 est la même personne ; P001_T0 est le même prélèvement ; RNA001, PROT001 et MET001 sont trois mesures différentes. Un réplicat technique n’est jamais compté comme un nouveau sujet biologique.

2. CONTRÔLE QUALITÉ ET FAISABILITÉ
===================================

Avant une interprétation forte, l’outil vérifie notamment :
- nombre de sujets biologiquement indépendants dans chaque groupe ;
- déséquilibre entre groupes ;
- chevauchement réel des sujets entre omiques ;
- complétude des mesures répétées ;
- nombre de sujets disposant réellement de plusieurs temps ;
- données manquantes ;
- mesures atypiques ;
- accord entre répétitions techniques ;
- série technique et risque de confusion avec groupe/temps ;
- pour la survie, nombre de sujets exploitables et nombre d’événements observés ;
- éligibilité des méthodes avancées MOFA2 et DIABLO.

`preAnalysisDiagnostics` possède quatre niveaux :
- ready : aucun problème déterministe détecté ;
- usable_with_cautions : analyse possible avec précautions documentées ;
- review_required : une limite de qualité/effectif/design doit être explicitement revue ;
- blocked_or_redesign_required : au moins un problème déterministe empêche une interprétation forte défendable ; il faut corriger le plan/l’annotation ou limiter l’analyse à une description appropriée.

Exemples de situations considérées comme bloquantes ou non défendables pour une inférence forte :
- comparaison de groupes avec moins de deux sujets indépendants dans un groupe ;
- série technique complètement confondue avec la condition biologique ;
- route longitudinale sans véritables mesures répétées chez plusieurs sujets ;
- survie sans suffisamment de sujets exploitables/événements pour estimer le modèle demandé ;
- crossover sans période et séquence explicitement modélisées.

Un groupe contenant moins de cinq sujets indépendants est signalé comme hautement exploratoire, même si un logiciel peut techniquement produire une p-value.

La puissance statistique n’est volontairement PAS déduite du seul nombre de sujets. Une estimation défendable de puissance nécessite un effet attendu, une variabilité et le modèle prévu ; une simulation est souvent préférable pour les designs multi-omiques complexes.

3. LC-MS / GC-MS
=================

Lorsque sample_type et injection_order sont fournis :
- blanks et pooled-QC sont exclus des échantillons biologiques ;
- un ratio blank/biologique est par défaut un SIGNAL DE QC et ne supprime pas automatiquement une feature ;
- un mode de suppression explicite reste disponible pour un SOP de laboratoire validé ;
- une dérive instrumentale peut être corrigée à partir des pooled-QC ordonnés ;
- la stabilité des pooled-QC peut être évaluée par RSD ;
- aucune imputation MNAR n’est effectuée par défaut ;
- une hypothèse left-censored doit être déclarée et accompagnée d’une analyse de sensibilité sans imputation.

4. DIFFÉRENCES TECHNIQUES ET FACTEURS D’AJUSTEMENT
===================================================

Une série technique totalement confondue avec le groupe ou le temps ne peut pas être « corrigée » statistiquement : les deux effets sont non séparables. L’outil bloque alors l’interprétation forte.

Quand le design le permet, les séries techniques et facteurs d’ajustement choisis sont inclus dans le modèle. Aucun facteur d’ajustement n’est inventé automatiquement.

5. QUESTIONS ET ROUTES STATISTIQUES
====================================

Explorer :
- structure générale et covariation entre couches ;
- moteur navigateur : ACP multi-blocs équilibrée ;
- backend de référence : MOFA2 seulement quand les garde-fous d’éligibilité sont compatibles.

Comparer des groupes :
- estimation de l’amplitude et du sens ;
- tests adaptés à la nature de la couche ;
- correction Benjamini-Hochberg ;
- comparaisons inter-omiques sur le chevauchement réel des sujets.

Temps / mesures répétées :
- le sujet reste l’unité de corrélation ;
- lmerTest dans le backend de référence ;
- pente aléatoire du temps essayée automatiquement seulement si le plan la supporte, sinon repli sur intercept aléatoire ;
- interaction condition × temps lorsque le plan l’autorise.

Critère clinique ou expérimental :
- continu : régression linéaire ;
- oui/non : logistique ;
- comptage : Poisson ;
- multicatégoriel : modèle adapté ;
- survie : Cox ;
- la performance prédictive est évaluée séparément de l’association statistique.

6. RNA-SEQ ET MATRICES NORMALISÉES
===================================

Backend R de référence :
- comptes RNA-seq : DESeq2 comme analyse principale et edgeR + limma-voom comme analyse de sensibilité automatisée lorsque disponibles ;
- edgeR quasi-likelihood est également implémenté comme adaptateur de référence ;
- matrices normalisées/log : limma ;
- matrices de design non pleines-rang : rejetées plutôt que fitted avec des coefficients non identifiables.

La concordance DESeq2/voom peut rapporter :
- corrélation des statistiques signées ;
- nombre de résultats significatifs par méthode ;
- chevauchement/Jaccard ;
- accord du sens de l’effet.

Les q-values des différentes méthodes ne sont jamais moyennées ou transformées en « q consensus ». Le désaccord reste visible comme analyse de sensibilité.

7. MOFA2
========

La route de référence :
- nécessite au moins 16 sujets réellement communs aux blocs analysés ;
- élimine les features constantes ou insuffisamment observées ;
- conserve une seed déterministe ;
- enregistre facteurs, poids et variance expliquée lorsqu’elle est disponible ;
- considère explicitement la présence d’effets techniques connus avant l’interprétation.

Un facteur MOFA2 est une structure de covariance latente. Ce n’est ni une preuve causale, ni automatiquement un biomarqueur, ni une validation externe.

8. DIABLO
=========

La route DIABLO est réservée à un critère catégoriel supervisé et nécessite une classe suffisamment représentée pour permettre une validation interne.

Lorsque le plan le permet :
- tuning de la sparsité keepX par `tune.block.splsda()` ;
- validation M-fold répétée ;
- BER comme critère de tuning ;
- nombre de composantes et keepX retenus enregistrés ;
- `mixOmics::perf()` pour l’évaluation interne ;
- seed enregistrée.

Une signature DIABLO est un signal multivarié supervisé. Une validation externe indépendante reste nécessaire avant toute revendication de biomarqueur généralisable.

9. ASSOCIATION, PRÉDICTION ET CAUSALITÉ
========================================

Ces trois affirmations sont séparées dans l’interface :

Association : « cette variable est associée au groupe/critère après les ajustements déclarés ».
Prédiction : « ce modèle prédit un sujet non utilisé pour sa construction avec telle performance ».
Causalité : nécessite un design et des hypothèses causales supplémentaires ; elle n’est jamais déduite d’une simple association ou d’une bonne prédiction.

La validation prédictive disponible évite les fuites : sélection, ajustements, imputation/centrage/échelle et tuning sont appris dans l’entraînement. La performance finale est calculée sur les sujets laissés de côté.

Métriques :
- binaire : AUC, accuracy, log-loss ;
- multiclasse : accuracy ;
- continu/comptage : RMSE et R² hors-échantillon ;
- survie : Cox ridge avec tuning interne et C-index de Harrell dans les folds externes.

Une validation croisée interne ne remplace jamais une validation externe.

10. INTERPRÉTATION BIOLOGIQUE
=============================

Reactome replace les résultats dans des voies biologiques connues. L’univers de référence doit correspondre aux variables effectivement mesurées et mappables. L’outil peut également montrer combien de couches soutiennent une même voie.

Un enrichissement de voie ne prouve pas que la voie est activée, causale ou cliniquement pertinente. La couverture des identifiants et les molécules effectivement contributrices doivent rester visibles.

11. IDENTIFIANTS
================

Résolution conservatrice :
- transcriptomique : Ensembl et symboles de gènes ;
- protéomique : UniProt / Ensembl ;
- métabolomique : ChEBI et noms/alias déterministes ;
- InChIKey : UniChem vers ChEBI lorsque possible ;
- HMDB : HMDB → ChEBI via UniChem ;
- KEGG Compound : recherche exacte des cross-références ChEBI ;
- PubChem CID : PubChem → ChEBI via UniChem quand le type a été déclaré ;
- une correspondance externe n’est acceptée que si elle conduit à un ChEBI unique ;
- plusieurs correspondances = ambiguous ;
- aucune correspondance = unresolved.

Le pipeline préfère l’absence de mapping à un mapping biologiquement incertain.

12. RAPPORT REPRODUCTIBLE
=========================

La page de résultats comporte désormais une synthèse scientifique expliquant :
- ce que les résultats permettent de conclure ;
- ce qu’ils ne permettent pas de conclure ;
- les preuves q/FDR visibles ;
- les avertissements qui doivent rester dans le rapport ;
- la frontière entre association, prédiction et causalité.

Deux exports supplémentaires sont disponibles :
- `multiomics-methods-report.md` : rapport humainement lisible des choix et limites ;
- `multiomics-reproducibility-manifest.json` : manifeste machine-readable contenant question scientifique, design, critère, paramètres de l’interface, métadonnées locales des fichiers, preuves corrigées visibles, avertissements et limites d’interprétation.

Le manifeste n’embarque pas les données de recherche elles-mêmes. Pour une analyse destinée à un manuscrit, conserver séparément :
- fichiers d’entrée immuables ;
- checksums ;
- manifeste ;
- sorties complètes ;
- versions des packages/session R ;
- code/commit utilisé.

13. COMMENT LIRE LES PRINCIPAUX RÉSULTATS
==========================================

- Amplitude / fold ratio : taille et sens du changement.
- p : test avant correction multiple.
- q BH / FDR : résultat corrigé pour le grand nombre de variables testées.
- Pattern : forme générale du changement observé.
- r référence / r comparaison : corrélation dans chaque groupe.
- Δr : différence de corrélation entre groupes.
- FDR de voie : enrichissement corrigé dans l’univers mesuré/mappable.
- Nombre de couches concordantes : nombre d’omics soutenant indépendamment la même voie.

Une petite p-value seule n’est jamais présentée comme une conclusion biologique suffisante.

14. VALIDATION PUBLIQUE ET LIMITES
===================================

La suite automatisée comprend notamment des jeux publics tels que Nutrimouse, TCGA breast, IntLIM NCI-60/BRCA, AgingHFCD, STATegra, LRRK2 G2019S, PaintOmics avec signal multi-omique planté et missRows NCI-60.

L’automatisation peut détecter de nombreuses incompatibilités et réduire les erreurs statistiques courantes. Elle ne peut pas certifier automatiquement :
- absence de biais de sélection ;
- absence de confondeurs non mesurés ;
- pertinence clinique d’une taille d’effet ;
- puissance suffisante sans effet/variance attendus ;
- causalité sans design causal ;
- validité externe sans nouvelle population indépendante.

Ces limites doivent rester visibles même lorsqu’une analyse s’exécute sans erreur.

BACKEND R
=========

Installation :
Rscript multiomics-engine/install_backend_dependencies.R

Démarrage local :
Rscript multiomics-engine/run_backend.R

Adresse par défaut :
http://127.0.0.1:8787

Un serveur distant recevant des données de recherche doit ajouter au minimum TLS, authentification, limites de taille/requêtes et allow-list d’origine.

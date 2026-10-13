# MultiOmics — critères de sortie pour un logiciel de recherche (13 octobre 2026)

**Objectif** : produire une analyse mono- ou multi-omique exploitable, transparente et reproductible pour un article scientifique *du chercheur*. Ce document n'annonce ni une certification universelle des analyses, ni un article sur l'outil.

## Décision de diffusion

**Ne pas labelliser « confirmatoire validé » sur la base des seuls tests internes ou du succès CI.** Autoriser une analyse confirmatoire seulement pour les combinaisons de données, plan, modèle et moteur dont les critères ci-dessous sont documentés. Dans les autres cas : exploration explicitement marquée, ou blocage avec explication courte.

## Dépendances et ordre recommandé

- Contraste RNA-seq préspécifié et intention confirmatoire : #54 (sur `main`).
- Export de recherche ZIP du navigateur : #79 (sur `main`).
- Sérialisation des résultats R exhaustifs : #81 (dépend de #54).
- Intégration dans ZIP des CSV R complets : #82 (dépend de #79 **et** de la forme finale #81).
- Exécution vraie R → ZIP et vérification de réouverture : #83 (dépend de #82/#81).
- Cas public Airway, paires sujet et contraste directionnel : #84 (dépend de #83, doit consommer le code effectivement intégré).
- Analyse RNA-seq appariée côté R : #86 (dépend de #81 et du contrat #54).
- Choix apparié compréhensible côté UI : #87 (dépend de #82 ; doit être raccordé à #86).
- #75 (FDR) est **diagnostique**, sans autorisation de fusion des changements d'inférence tant que l'attribution méthodologique et le calibrage n'ont pas été établis.

Les PR « empilées » ne doivent pas être fusionnées automatiquement : réviser bases, conflits, versions et CI **sur le commit final assemblé**. Conserver des commits/PR distincts par responsabilité.

## Matrice d'acceptation minimale

| ID | Cas | Vérification observable | Critère bloquant |
| --- | --- | --- | --- |
| R1 | RNA-seq indépendant, comptages entiers | Intention + contraste explicites, matrice/metadata concordants, covariables et lots identifiables | Pas d'inférence confirmatoire par repli sur navigateur |
| R2 | RNA-seq apparié | `subject_id` relie exactement deux conditions, `sample_id` identifie chaque prélèvement, modèle `~ subject_id + condition` ajustable | Une paire incomplète/doublon, modèle déficient ou contraste non défini bloque |
| R3 | Données transformées/non entières | Déclaration du type de données et branche de méthode adéquate | Interdire DESeq2 sur quantification non entière sans justification/méthode adaptée |
| R4 | Protéomique / métabolomique | QC manquants, blanks, dérive, filtres, imputations et limites explicités selon plate-forme | Ne pas inférer de validation biologique générale depuis un QC réussi |
| R5 | Mono-omique et trois omiques | Import réel → exécution moteur réel → rapport → ZIP → réimport | Aucun résultat synthétique maquillé en résultat expérimental |
| R6 | Sorties R | Tous les gènes/features ajustés, NA conservés, IDs et contraste inchangés ; `reference_r/` séparé des exports navigateur | Aperçu 100 lignes / sortie `too_large` ≠ export complet |
| R7 | Archivage | `methods.md`, paramètres, versions, checksums SHA-256, identifiants originaux, scripts de vérification | La corruption d'un octet et un fichier manquant doivent être détectés |
| R8 | Protection | Aucun fichier patient envoyé sans opt-in; ZIP privé explicite ; aucune fuite vers logs/télémétrie | Les données privées ne figurent jamais dans les traces publiques |
| R9 | Accessibilité débutant | Parcours FR/EN sur plan, appariement, groupe de référence, q-value et statut d'analyse | Éviter les contrôles avancés avant le parcours guidé |
| R10 | Reproductibilité externe | Jeu public figé, provenance SHA/versions, comparaison numérique ligne à ligne avec méthode indépendante ou appel de référence | Un benchmark démonstratif seul ne constitue pas validation indépendante |
| R11 | Déploiement | Test depuis l'URL Pages, base path, hydration, import CSV MS AUC, export ZIP et réimport | CI de branche verte mais application publique cassée = échec |

## Qualification statistique — règles non négociables

1. Séparer **erreur de câblage** (wrapper identique à l'appel R natif), **calibration statistique** (type I / FDR sous scénarios), **validité externe biologique** (jeu indépendant) et **validité prédictive** (split hors-échantillon / cohorte externe). Une preuve d'une catégorie ne vaut pas pour les autres.
2. Signaler pour chaque scénario N, taille du groupe, taux de filtrage, dispersion, batch/paired/correlation, pourcentage de NA, méthode et version des packages, seed, nombre de répétitions, faux positifs et incertitudes Monte Carlo.
3. Évaluer FDR réalisé et fréquence de découvertes séparément, avec IC binomiaux ou incertitude de simulation; éviter de conclure sur la moyenne de FDP seule dans les scénarios sans découvertes. Distinguer contrôle FDR et puissance.
4. Ne pas « corriger » une inflation FDR en changeant arbitrairement vers une loi t. #75 doit rester un diagnostic jusqu'à comparaison avec appels natifs, hypothèses, calibrage et erreurs de mise en œuvre.
5. Pour MOFA2/DIABLO et tout gain multi-omique : inclure chaque omique seule, fusion naïve, permutation des appariements, split au niveau sujet/cohorte, métriques de calibration, analyses par sous-groupe et contrôles d'informations fuyantes. Un résultat multi-omique inférieur doit rester visible.
6. Le jeu Airway (GSE52778) teste un design apparié connu. Confronter toutes les lignes, pas seulement les 100 premières, à un appel de référence; confirmer les attentes biologiques sans qualifier un effet isolé de sensibilité universelle.

## Artefacts requis pour chaque scénario

- `data_manifest.json` : provenance, téléchargements, empreintes, conditions de partage, structure des échantillons.
- `analysis_config.json` : plan, intention, contraste directionnel, filtres, méthodes, versions, seed.
- `qc.json` : tailles entrantes/sortantes, avertissements et blocages, décisions reproductibles.
- `reference_r/<method>.csv` : lignes exhaustives *si et seulement si* le backend les a effectivement produites.
- `results_browser/` : résultats d'exploration clairement séparés.
- `methods.md` : texte compréhensible, limites et détails suffisants pour Methods.
- `manifest.json` et vérification hors ligne de l'intégrité de l'archive.
- `validation_summary.json` : statut de chaque gate, version du code, commandement CI, preuves et échecs.

Ces noms constituent un **contrat cible** : ne pas prétendre qu'ils existent tous déjà dans la version publiée. La structure implémentée peut utiliser des chemins équivalents si le manifeste les décrit sans ambiguïté.

## Définition de « prêt pour les chercheurs »

- Un nouvel utilisateur peut réaliser le chemin complet avec une démo documentée puis ses propres fichiers, sans connaître `metadata` ni modèle linéaire à l'avance.
- Chaque analyse indique ce qui a été réellement exécuté (navigateur versus R de référence), le nombre d'échantillons indépendants, les exclusions et les limitations de validité.
- Les erreurs du design sont bloquées avant inférence, jamais converties silencieusement en une autre méthode.
- Le dossier d'export se vérifie, s'ouvre et conserve toutes les variables réellement analysées.
- Des jeux publics **externes** et des contrôles négatifs révèlent aussi les échecs, y compris les cas où intégrer plusieurs omiques n'améliore pas les résultats.
- Un test humain (débutant et expert) reste requis avant de revendiquer une accessibilité démontrée.

**Pas de fusion / déploiement « confirmatoire » avant passage documenté de cette matrice sur le SHA intégré.**

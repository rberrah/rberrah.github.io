# PMx Explain — référentiel bibliographique des cibles TDM (pilote)

**Statut au 9 novembre 2026 : PR pilote, revue scientifique de l'auteur en attente.**

## Périmètre et indépendance

Le guide accessible à `/pharmacometrie/cibles-tdm/` est un index de **références bibliographiques** et non un modèle de prédiction, une base exhaustive de recommandations, un protocole de service ou un outil de décision posologique. La bibliothèque exécutable, les modèles PopPK et les régressions de MIPD Engine restent dans `rberrah/MIPD-Engine`. PMx Explain ne les duplique pas.

L'ajout d'un médicament ne signifie pas que ses cibles sont universelles, valides dans toutes les populations ou transposables à tous les dosages analytiques.

## Doctrine documentaire : priorité SFT / SFPT, sans attribution abusive

**Ordre de recherche prioritaire** : SFT (Société francophone de transplantation) et SFPT (Société française de pharmacologie et de thérapeutique, groupe STP-PT). Si ces sociétés ne proposent pas de **valeur numérique explicite pour le contexte donné**, rechercher l'IATDMCT, les autres sociétés savantes compétentes, une recommandation de pratique clinique avec niveau de preuve, puis des études originales évaluées par des pairs. Le rang institutionnel n'autorise jamais à inventer un chiffre ni à extrapoler un seuil d'un autre organe.

La priorité SFT/SFPT est **méthodologique**, pas une affirmation qu'elles ont publié toutes les cibles. Exemples vérifiés le 9/11/2026 :

- **SFT, fiche pharmacien greffe rénale (2022), pp. 4–5** : recommande la mesure résiduelle des anticalcineurines et des inhibiteurs de la mTOR, et l'AUC 0–12 h du MPA ; ne fournit **pas** les bornes numériques du guide. [PDF officiel](https://www.transplantation-francophone.org/wp-content/uploads/Traitement-immunosuppresseur-en-transplantation-renale-Fiche-pharmacien.pdf).
- **SFPT, groupe STP-PT** : ressource institutionnelle sur la place du STP, sans tableau de cibles chiffrées sur sa page de présentation. [Page officielle](https://www.sfpt-fr.org/groupes-de-travail/stp-personnalisation-des-traitements).
- **SFPT, ouvrage de référence 2025** : pertinent pour la relecture experte, mais l'intégralité est payante ; ses chiffres ne doivent pas être cités sans accès au passage précis et possibilité de vérification par l'utilisateur. [Notice SFPT](https://www.sfpt-fr.org/?catid=78&id=2145%3Apublication-du-livre-suivi-th%C3%A9rapeutique-pharmacologique-pour-la-personnalisation-des-traitements-m%C3%A9dicamenteux&view=article).
- **SFT / IATDMCT** : la page de la SFT cite les consensus spécifiques tacrolimus, MPA et évérolimus. Pour une valeur chiffrée, lier directement l'article de consensus, non cette page générale. [Comité scientifique](https://www.transplantation-francophone.org/partenaires-reseaux/societes-savantes/immunosuppressive-drugs-scientific-committee-iatdmct/).

Une publication utilisée comme **preuve numérique** doit fournir : identifiant stable (DOI/PMID ou URL institutionnelle), lien atteignant au minimum un résumé accessible qui contient explicitement la valeur, nom de la section/tableau, vérification d'accès, date de dernière vérification et classification de preuve. Préférer un texte intégral libre. Signaler si le contenu est limité au résumé ; ne pas présenter le full text comme libre s'il ne l'est pas.

**Critères bloquants en revue** :

1. Lien renvoyant seulement à un accueil, un portail ou une page d'inscription sans affirmation chiffrée.
2. Cible provenant d'une simple ligne de tableau secondaire sans vérification de la source originale.
3. Résultat exploratoire, ROC ou protocole monocentrique présenté comme fenêtre consensuelle.
4. Unité, fenêtre temporelle, analyte total/libre, matrice ou contexte incohérents.
5. Contradiction non expliquée entre sources, recommandation dépassée ou confusion entre RCP et consensus.
6. Référence inaccessible même sous forme de résumé ou de source primaire numérique vérifiable.

Un chiffre qui échoue à ces critères doit être **retiré de l'affichage public** jusqu'à clarification. Une valeur avec résumé seul peut être conservée en tant que proposition d'étude identifiée, si le résumé contient le chiffre et ses réserves.

## Table de provenance de la première sélection

| Molécule | Lignes | Publication et accès à l'assertion | Emplacement |
| --- | --- | --- | --- |
| MPA | 4 recommandations d'AUC | [Liu et al. 2025, texte intégral libre](https://pmc.ncbi.nlm.nih.gov/articles/PMC12456993/) | Recommandation 6, tableau 3 |
| MPA cardiaque | 1 seuil exploratoire AUC ≈ 50 mg·h/L | [Woillard et al. 2015, résumé PubMed](https://pubmed.ncbi.nlm.nih.gov/26192348/) | Résultats ; sensibilité 77 %, spécificité 25 %, n = 40 |
| Tacrolimus IR rénal | 3 protocoles liés à la période postgreffe | [Article 2025, texte intégral libre](https://pmc.ncbi.nlm.nih.gov/articles/PMC12122127/) | Tableau 1 et conditions AUC |
| Évérolimus | 4 cibles selon organe (rein/cœur) et ICN | [Masuda et al., consensus IATDMCT 2025 (texte intégral libre)](https://doi.org/10.1097/FTD.0000000000001250) | Tableau 1 et recommandations par organe |
| Vancomycine | 1 cible AUC/CMI pour infection invasive grave à SARM | [Consensus IDSA et partenaires, texte libre](https://www.idsociety.org/practice-guideline/vancomycin/) | Executive summary, hypothèse CMI = 1 |
| Lithium | 3 intervalles en entretien adulte | [Nolen et al. 2019, texte intégral libre](https://pmc.ncbi.nlm.nih.gov/articles/PMC6688930/) | Tableau 5 et conclusion |

**Note MPA cardiaque** : le seuil de 50 mg·h/L est issu d'une analyse ROC d'étude et ne devient pas une « cible validée » du seul fait qu'il se trouve sur le site. Les 36 mg·h/L proviennent d'une recommandation 2025 distincte. Le guide montre les deux avec leurs statuts respectifs.

## Principes de qualification d'une entrée

Chaque ligne représente **molécule × indication × période × co-traitements × métrique × matrice**, avec :
1. Dénomination et synonymes (la prodrogue MMF et son métabolite actif dosé MPA doivent être distingués).
2. AUC sur une fenêtre explicitée, C0, C12h ou autre indicateur, jamais une « concentration » non caractérisée.
3. Unité exacte et compartiment échantillonné : sang total, plasma, sérum, fraction totale ou libre.
4. Borne inférieure/supérieure, seuil inférieur isolé ou point de coupure exploratoire ; **ne pas transformer un seuil d'étude en marge consensuelle**.
5. Cadre : indication, âge, temps après transplantation, formulation, association aux ICN, calendrier de prélèvement et méthode analytique si déterminants.
6. Source primaire/consensus, date, URL stable et statut explicite « recommandation » ou « étude/protocole ».
7. Niveau de preuve **selon la source**, non recalculé automatiquement.

Les sources originales et les noms sont enregistrés dans `src/lib/content/tdmTargets.js`. Les libellés FR/EN sont maintenus ensemble. Pas de récupération automatique de chiffres depuis un PDF ni de génération LLM de recommandations à l'exécution.

## Extension au manuel de prélèvement CHU Limoges (novembre 2026)

Le site [manuel de prélèvement CHU Limoges](https://chu-limoges.manuelprelevement.fr/Laboratory) est la **source officielle pour savoir si et comment une analyse est répertoriée**, jamais la source automatique des seuils thérapeutiques. Le site référence de nombreuses analyses hors STP : il serait trompeur de publier une « fenêtre thérapeutique » pour chacune.

### Inventaire effectivement audité, non exhaustif

L'inventaire `src/lib/content/tdmManualCatalog.js` décrit **74 noms de médicaments** présents dans **sept documents officiels** vérifiables, avec URL profonde vers l'original :

- 36 antibiotiques du document CHU **PTP PREA 0059 C, 26 mai 2026** ; les prélèvements sont décrits mais pas les objectifs chiffrés. Source : `DocumentNew.aspx?idDoc=41157`.
- 26 antidépresseurs dans la fiche analytique groupée `DetailNew.aspx?id=A3618&redirect=home` ; les noms de métabolites sont gardés dans la source d'origine, pas confondus avec 26 fenêtres de STP publiées.
- 5 immunosuppresseurs listés dans un **formulaire de demande d'adaptation** `DocumentNew.aspx?idDoc=33210` : **ne pas les étiqueter comme fiches de dosage individuel vérifiées** sans autre preuve.
- Lithium, valproate : fiches individuelles ; lidocaïne, bupivacaïne, ropivacaïne, mépivacaïne : fiche groupée des anesthésiques locaux ; ibrutinib : examen externe à l'AP-HP.

**Il ne s'agit pas des centaines ou milliers d'examens du manuel entier.** Un chiffre de 74 ne doit jamais être présenté comme le total du manuel CHU. Les analyses sans cible STP justifiée sont affichées avec « Aucune cible numérique qualifiée dans ce guide ». Le site original reste la source de référence pour la disponibilité à date et les conditions préanalytiques.

### Passage au périmètre complet : extraction autorisée, audit et publication sélective

Le script `scripts/import_tdm_manual_catalog.mjs` reçoit une **exportation CSV de métadonnées autorisée** ; il ne parcourt pas automatiquement le portail et ne duplique pas le manuel. Colonnes obligatoires : `exam_id;exam_name;source_url;source_updated;discipline;stp_relevant` ; `stp_relevant` vaut `yes`, `no` ou `review`.

Exemple d'utilisation sur un export accordé par le CHU :

```bash
node scripts/import_tdm_manual_catalog.mjs /chemin/autorise/export-chu.csv /chemin/local/review.json
```

La sortie est **un fichier de revue** (`display_approved: false`, `target_status: not_assessed`, `publication_allowed: false`) ; aucun chiffre, aucune cible, aucun traitement clinique n'est calculé. Seuls les dossiers autorisés puis individuellement vérifiés peuvent être ajoutés au catalogue statique. Les analyses génétiques, biochimiques ou toxicologiques non liées au suivi thérapeutique restent hors des cibles TDM. Une API CHU autorisée ou un export contractuel est nécessaire pour garantir une réconciliation exhaustive et maintenable ; le site public ne garantit pas cette exhaustivité à lui seul.

### Présentation comparative des sources

`src/lib/content/tdmComparisons.js` compare **seulement** des groupes documentés appartenant à la même molécule, indication, métrique et unité. Les autres contextes ne sont jamais fusionnés ; divergences de matrice et valeur sont signalées. Quatre exemples existent actuellement : MPA rénal (2021 et 2025, 30–60 mg·h/L), MPA cardiaque (>36 versus seuil exploratoire ≈50), lithium entretien adulte (ISBD/IGSLI versus NICE, avec sérum/plasma différents), et valproate (ANSM 40–100 versus chapitre 2025 soutenu par la SFPT et groupe SFPT 2010, 50–100 mg/L). La comparaison n'est pas une méta-analyse ni un classement du « meilleur » seuil.

## Inclusion initiale

- MPA : greffe rénale, cardiaque (recommandation >36 et seuil d'étude ≈50 **distincts**), hépatique, pulmonaire ; AUC0–12h.
- Tacrolimus : exemples **spécifiques au centre et au schéma thérapeutique** de C0 en greffe rénale à différents délais. La condition de validation par AUC pour les faibles résiduelles est explicitée.
- Évérolimus : C0 en greffe rénale et cardiaque, selon l'association à un ICN (consensus IATDMCT 2025).
- Vancomycine : AUC24 pour infections invasives graves à SARM, dans l'hypothèse CMI = 1 mg/L ; ne pas présenter C0 15–20 comme équivalent.
- Lithium : cibles sériques C12h de maintenance chez l'adulte et alternatives du consensus liées à réponse/tolérance, avec comparaison NICE.
- Valproate : comparateur RCP ANSM 40–100 mg/L, chapitre STP 2025 diffusé par la SFPT 50–100 mg/L et article du groupe SFPT 2010 50–100 mg/L ; distinguer Cmin et intervalle de référence générique.
- Linézolide : C0 2–8 mg/L, consensus d'experts 2022.

**Cette sélection n'est pas une liste exhaustive.** Les fiches proposées sont des points de départ qui doivent être relus par le responsable scientifique avant fusion.

## Extensions prévues, en PR distinctes

1. **Transplantation** : ciclosporine (C0 vs C2 et temporalité), sirolimus, autres indications et formulations de tacrolimus, conditionnements de l'exposition MPA (associations, fraction libre).
2. **Infectiologie** : aminosides (pic/résiduelle selon rythme), autres glycopeptides, bêta-lactamines lorsque les indices PK/PD dépendent de la CMI et de la population, antifongiques (voriconazole, posaconazole, isavuconazole), antiviraux lorsque cibles défendables.
3. **Neurologie/psychiatrie** : valproate libre et indication spécifique (valproate total déjà référencé), carbamazépine, phénytoïne totale/libre, lamotrigine, clozapine et médicaments du consensus AGNP 2026 selon leur niveau de preuve.
4. **Autres** : digoxine (indication spécifique), méthotrexate haute dose (**seuils d'élimination par temps**, pas une fenêtre statique), autres molécules disposant de recommandations documentées.

Prioriser recommandations de sociétés savantes, consensus IATDMCT, AGNP, ASHP/IDSA et publications évaluées par les pairs. Une cible absente doit rester « non renseignée » ; ne pas fabriquer une valeur numérique.

## Vérification avant fusion

- `node scripts/test_tdm_targets.mjs` : schéma, source, bornes, import CHU en lecture seule, groupes comparables et recherche FR/EN.
- `node scripts/test_tdm_manual_import.mjs` : contrôles de staging CSV et absence de création de cible.
- `npm run test:pmx` puis `npm run build`, et contrôles GitHub requis.
- Recherche manuelle : « mycophenolate », « MMF », « MPA », « mycophénolate », « cardiaque », « éverolimus », « tacrolimus », filtres d'indication et résultats vides.
- Contrôle mobile, clavier, lecteurs d'écran, contrastes clair/sombre, liens et navigation Analyze/TDM.
- Relecture humaine des chiffres et du périmètre de chaque cible par rapport à sa source primaire.
- Si une utilisation clinique est envisagée ultérieurement : validation de la gouvernance éditoriale, procédure de mises à jour, responsabilité des recommandations et évaluation réglementaire de l'usage prévu.

La revue scientifique humaine et la validation d'utilisabilité ne sont **pas** garanties par les tests automatisés.

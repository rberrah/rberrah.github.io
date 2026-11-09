# PMx Explain — référentiel bibliographique des cibles TDM (pilote)

**Statut au 9 novembre 2026 : PR pilote, revue scientifique de l'auteur en attente.**

## Périmètre et indépendance

Le guide accessible à `/pharmacometrie/cibles-tdm/` est un index de **références bibliographiques** et non un modèle de prédiction, une base exhaustive de recommandations, un protocole de service ou un outil de décision posologique. La bibliothèque exécutable, les modèles PopPK et les régressions de MIPD Engine restent dans `rberrah/MIPD-Engine`. PMx Explain ne les duplique pas.

L'ajout d'un médicament ne signifie pas que ses cibles sont universelles, valides dans toutes les populations ou transposables à tous les dosages analytiques.

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

## Inclusion initiale

- MPA : greffe rénale, cardiaque (recommandation >36 et seuil d'étude ≈50 **distincts**), hépatique, pulmonaire ; AUC0–12h.
- Tacrolimus : exemples **spécifiques au centre et au schéma thérapeutique** de C0 en greffe rénale à différents délais. La condition de validation par AUC pour les faibles résiduelles est explicitée.
- Évérolimus : C0 en transplantation avec/sans ICN.
- Vancomycine : AUC24 pour infections invasives graves à SARM, dans l'hypothèse CMI = 1 mg/L ; ne pas présenter C0 15–20 comme équivalent.
- Lithium : cibles sériques C12h de maintenance chez l'adulte et alternatives du consensus liées à réponse/tolérance.

**Cette sélection n'est pas une liste exhaustive.** Les fiches proposées sont des points de départ qui doivent être relus par le responsable scientifique avant fusion.

## Extensions prévues, en PR distinctes

1. **Transplantation** : ciclosporine (C0 vs C2 et temporalité), sirolimus, autres indications et formulations de tacrolimus, conditionnements de l'exposition MPA (associations, fraction libre).
2. **Infectiologie** : aminosides (pic/résiduelle selon rythme), autres glycopeptides, bêta-lactamines lorsque les indices PK/PD dépendent de la CMI et de la population, antifongiques (voriconazole, posaconazole, isavuconazole), antiviraux lorsque cibles défendables.
3. **Neurologie/psychiatrie** : valproate total/libre, carbamazépine, phénytoïne totale/libre, lamotrigine, clozapine et médicaments du consensus AGNP 2026 selon leur niveau de preuve.
4. **Autres** : digoxine (indication spécifique), méthotrexate haute dose (**seuils d'élimination par temps**, pas une fenêtre statique), autres molécules disposant de recommandations documentées.

Prioriser recommandations de sociétés savantes, consensus IATDMCT, AGNP, ASHP/IDSA et publications évaluées par les pairs. Une cible absente doit rester « non renseignée » ; ne pas fabriquer une valeur numérique.

## Vérification avant fusion

- `node scripts/test_tdm_targets.mjs` : schéma, source, bornes et recherche FR/EN.
- `npm run test:pmx` puis `npm run build`, et contrôles GitHub requis.
- Recherche manuelle : « mycophenolate », « MMF », « MPA », « mycophénolate », « cardiaque », « éverolimus », « tacrolimus », filtres d'indication et résultats vides.
- Contrôle mobile, clavier, lecteurs d'écran, contrastes clair/sombre, liens et navigation Analyze/TDM.
- Relecture humaine des chiffres et du périmètre de chaque cible par rapport à sa source primaire.
- Si une utilisation clinique est envisagée ultérieurement : validation de la gouvernance éditoriale, procédure de mises à jour, responsabilité des recommandations et évaluation réglementaire de l'usage prévu.

La revue scientifique humaine et la validation d'utilisabilité ne sont **pas** garanties par les tests automatisés.

# Extension des cibles TDM — audit du 10 novembre 2026

## Portée
Extension **additionnelle** au verrou bibliographique de la PR #224 (75 cibles, 25 références, 75 médicaments).
Cette livraison ajoute **3 molécules, 5 cibles fixes vérifiées, 3 documents numériques** : total cible **78 médicaments, 80 cibles bibliographiques, 28 sources numériques**, sans modifier les **41 contextes d'antibiotiques dépendants de la CMI**.

Le guide est pédagogique ; toute décision thérapeutique nécessite le contexte, la méthode analytique, le protocole et une validation humaine. L'ajout à la recherche ne garantit pas que le CHU de Limoges dose la molécule.

## Couples source → affirmation revus

| ID | Valeur | Indication/métrique/matrice | Preuve primaire / passage |
|---|---|---|---|
| `teicoplanin-severe-hplc` | **15–30 mg/L** | C₀ sérum, HPLC, endocardite/infection sévère | [RCP ANSM téicoplanine](https://base-donnees-publique.medicaments.gouv.fr/medicament/64196782/extrait), §4.2 Mesure des concentrations sériques |
| `teicoplanin-severe-fpia` | **30–40 mg/L** | C₀ sérum, FPIA, endocardite/infection sévère | Même RCP §4.2 ; les intervalles HPLC et FPIA ne sont **pas interchangeables** |
| `clozapine-maintenance-reference` | **350–600 ng/mL** | C₀, clozapine mère (sérum/plasma), suivi psychiatrique | [RCPA Pathology Manual](https://www.rcpa.edu.au/Manuals/RCPA-Manual/Pathology-Tests/C/Clozapine), « Therapeutic Interval » : 350–600 µg/L, conversion exacte 1 µg/L = 1 ng/mL |
| `busulfan-iei-protocol-a` | **85–95 mg·h/L** | AUC **totale cumulée du conditionnement**, allogreffe pour IEI, protocole A myéloablatif | [EBMT/ESID 2026](https://doi.org/10.1038/s41409-026-02906-0), section Busulfan, Figure 1 / Tableau 3 |
| `busulfan-iei-protocol-c` | **60–70 mg·h/L** | AUC **totale cumulée du conditionnement**, allogreffe pour IEI, protocole C intensité réduite | Même recommandation EBMT/ESID 2026, Figure 1 / Tableau 3 |

### Points critiques
- **Téicoplanine** : l'ANSM fournit également des minima pour les infections moins sévères ; ils ne sont pas transcrits comme des intervalles ici, afin de ne pas transformer un **≥** en **>**. L'étiquetage de la méthode est obligatoire sur chaque carte.
- **Clozapine** : intervalle de laboratoire, **pas** cible individualisée universelle. Le dosage de clozapine ne se confond pas avec norclozapine. L'[AGNP 2026](https://pubmed.ncbi.nlm.nih.gov/42392224/) révise les intervalles de nombreuses molécules ; ses tableaux complets doivent être contrôlés avant d'en revendiquer des chiffres.
- **Busulfan** : ces AUC sont **cumulées pour des protocoles IEI spécifiques**, ni des AUC journalières ni des objectifs pour toute greffe de cellules souches. L'AUC est l'indicateur pertinent, pas une C₀.
- Priorité conservée : sociétés savantes, RCP réglementaires ANSM/EMA/FDA, travaux Limoges, autres preuves ; **le classement ne transforme jamais un seuil de toxicité ou une valeur d'étude en cible validée**.
- **Aucun** nouveau lien de prélèvement « CHU Limoges » n'a été ajouté : aucun document officiel de temps de prélèvement propre à ces trois molécules n'a été vérifié.

## Lacunes à traiter ensuite (sans chiffres présumés)
1. **Antipsychotiques** : amisulpride, aripiprazole, halopéridol, olanzapine, quétiapine, rispéridone et autres ; source AGNP 2026 accessible par résumé, mais vérification de ses **valeurs molécule/analyte** à faire, notamment somme active rispéridone + 9-OH.
2. **Antifongiques** : itraconazole, flucytosine, isavuconazole (ne pas imposer du STP de routine si absence de preuve).
3. **Onco/hématologie** : méthotrexate haute dose (seuils de retard d'élimination selon **heure post-début de perfusion**, distincts d'une fenêtre thérapeutique), autres protocoles de busulfan.
4. **Infectiologie** : sécurité des aminosides, linézolide dans la tuberculose résistante (les bornes de toxicité et d'efficacité peuvent différer), téicoplanine autres situations/méthodes.
5. Pour les molécules du manuel CHU actuellement **sans cible qualifiée**, conserver l'identification, l'absence explicite de cible et les liens documentaires vérifiés sans fabriquer une plage.

## Qualification automatique
- 80 tuples **ID → source → relation → bornes**, 28 identifiants URL/DOI immuables ;
- recherche FR/EN, alias, catégorie, HPLC/FPIA, AUC cumulée ;
- aucune modification de MIPD Engine ni des algorithmes PK ;
- publication soumise aux contrôles CI et à la revue scientifique humaine.

# Extension des références antiépileptiques — 10 novembre 2026

## Résumé
PR empilée sur #226 puis #225, sans changement dans MIPD Engine.
Ajout de **15 nouvelles molécules antiépileptiques** et **16 lignes de concentration de référence**.
Les **7 molécules déjà présentes** dans la catégorie antiépileptique sont conservées ; total de famille : **22**.
Catalogue cumulé sur les trois PR après fusion : **125 molécules recherchables, 131 cibles bibliographiques fixes, 32 sources numériques, 41 contextes CMI et 4 signaux de sécurité HD-MTX**.

## Source chiffrée
[Reimers et al. 2018, DOI 10.2147/DDDT.S154388](https://doi.org/10.2147/DDDT.S154388), **tableau 1**, en texte intégral public via [PDF](https://www.tandfonline.com/doi/pdf/10.2147/DDDT.S154388). L'article présente la révision de plages de laboratoires norvégiens ; la plupart ne proviennent pas de corrélations prospectives solides concentration-réponse. Les prélèvements correspondent à des **concentrations sériques pré-dose à l'équilibre**, généralement 12–24 h après la dernière prise.

| Médicament / analyte | Intervalle de référence 2018 | Unité |
|---|---:|---|
| Brivaracétam | 0,2–2 | mg/L |
| Clobazam **parent** | 0,03–0,3 | mg/L |
| **N-desméthylclobazam** (métabolite) | 0,3–3 | mg/L |
| Clonazépam | 13–38 | ng/mL |
| Eslicarbazépine (**S-licarbazépine**) | 3–26 | mg/L |
| Éthosuximide | 39–99 | mg/L |
| Felbamate | 30–60 | mg/L |
| Gabapentine | 3–21 | mg/L |
| Lacosamide | 3–10 | mg/L |
| Pérampanel | 0,1–1 | mg/L |
| Prégabaline | 2–6 | mg/L |
| Rufinamide | 4–31 | mg/L |
| Stiripentol | 4–22 | mg/L |
| Sultiame | 2–10 | mg/L |
| Topiramate | 2–10 | mg/L |
| Zonisamide | 10–38 | mg/L |

Caveats incontournables :
- **Clobazam** : parent et N-desméthylclobazam **distincts**, CYP2C19 peut modifier le ratio ; ne pas additionner ces deux nombres ni attribuer un seuil parental à la somme.
- **Eslicarbazépine** : la référence porte sur la **S-licarbazépine**, ne pas confondre automatiquement avec le MHD racémique d'oxcarbazépine.
- **Clonazépam** : le tableau fournit 0,013–0,038 mg/L ; converti exactement en 13–38 ng/mL pour l'interface, sur la base de la discussion de l'article.
- **Vigabatrine** : le même tableau indique **NA** (mécanisme d'inhibition irréversible) : aucune cible numérique n'est créée artificiellement.
- Les références **2018** ne sont pas des seuils d'efficacité universels ni des valeurs du consensus AGNP 2026. Les données sont bibliographiques et la supervision clinique reste indispensable.
- Aucune conclusion sur la **disponibilité analytique actuelle au CHU Limoges** n'est inférée de ces publications.

## Intégration
- Valeurs dans `tdmAntiseizureExpansion2018.js`, source existante `oxcarb2018` ; source unique, pas de fausse duplication de publication.
- Source précisée : tableau 1 pour l'ensemble et rubrique Oxcarbazepine pour MHD.
- Le sommaire antiépileptique est replié par défaut, comme les autres catégories.
- Tests de verrouillage des **131** valeurs source/relation/bornes, séparation clobazam/metabolite, S-licarbazépine, unité clonazépam, navigation FR/EN.

## Audit de couverture documentaire CHU automatisable

`node scripts/report_tdm_coverage.mjs` décrit les molécules, les cibles fixes ou liées à la CMI, les signaux de sécurité, et les 74 noms extraits des 7 documents CHU déjà vérifiés.

`node scripts/report_tdm_coverage.mjs --json` produit la matrice complète sur la sortie standard. Aucune donnée patient, aucune requête réseau et aucune nouvelle cible numérique.

Le rapport sépare `listed_as_dosed_in_protocol` (36 antibiotiques), `group_exam_page`, `individual_exam_page`, `request_form_only` (5 immunosuppresseurs) et `external_referral` (ibrutinib).

Important : **74/74 noms documentaires trouvables ≠ 74 tests réalisés en interne ≠ exhaustivité actuelle du laboratoire**. Le script met également en évidence les entrées sans cible bibliographique qualifiée : cette absence ne signifie pas qu'une cible devrait nécessairement exister.

Pour certifier l'exhaustivité : récupérer auprès du laboratoire un export actuel autorisé (identifiant d'examen, analyte, matrice, méthode, statut interne/externalisé, date de mise à jour, URL de fiche), faire une jointure par identifiants et vérifier manuellement les écarts.

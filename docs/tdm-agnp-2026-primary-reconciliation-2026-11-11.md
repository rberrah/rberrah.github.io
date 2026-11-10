# AGNP 2026 — première réconciliation moléculaire (PR #231)
_Source primaire : Hart et al., consensus AGNP TDM 2026, *Pharmacopsychiatry*, DOI [10.1055/a-2860-7861](https://doi.org/10.1055/a-2860-7861), **Tableau 5**, consulté le 11 novembre 2026._

## Périmètre
**9 plages originales vérifiées individuellement** dans la version intégrale sous licence CC BY 4.0. Les valeurs 2018, 2020 et 2025 restent visibles et sont **datées**, jamais remplacées silencieusement. Les *laboratory alert levels* sont **différents** des plages thérapeutiques et ne sont pas ajoutés comme bornes supérieures.

| Molécule / indication | AGNP 2026 (tab. 5) | Horaire après dose | Niveau TDM | Alerte distincte | Contraste historique |
|---|---|---|---|---|---|
| Halopéridol, schizophrénie | **1–5 ng/mL** | **12 h** | **1** | 12 ng/mL | ASCP/AGNP 2020 **1–10 ng/mL** |
| Clozapine, schizophrénie | **350–600 ng/mL** | **12 h** | **1** | 1 000 ng/mL | RCPA historique 350–600 |
| Trazodone, dépression | **650–1 500 ng/mL** | **12 h** | **2** | 3 000 ng/mL | Revue 2025 **700–1 000 ng/mL** |
| Lévomilnacipran, dépression | **30–90 ng/mL** | **24 h** | **3** | 180 ng/mL | Revue 2025 **80–120 ng/mL** |
| Desvenlafaxine, dépression | **85–380 ng/mL** | **24 h** | **2** | 450 ng/mL | Revue 2025 même plage |
| Lacosamide, épilepsie | **1–12 µg/mL** | **12 h** | **3** | 24 µg/mL | Reimers 2018 **3–10 mg/L** |
| Lamotrigine, épilepsie | **3–15 µg/mL** | **12 h** | **2** | 20 µg/mL | Références historiques à conserver |
| Lévétiracétam, épilepsie | **6–46 µg/mL** | **12 h** | **4** | 50 µg/mL | Couderc/CHU Limoges **10–40 mg/L** (2022) |
| Tranylcypromine, dépression | **60–400 ng/mL** | **PIC à 2–3 h** | **4** | >800 ng/mL dans le contexte décrit | Revue 2025 : limite supérieure **≤50 ng/mL**, de **prélèvement différent** |

**Conversion utilisée pour les antiépileptiques :** 1 µg/mL = 1 mg/L (identité numérique exacte). Les colonnes unité affichent mg/L pour harmoniser les anciennes références ; le contexte précise que le consensus utilise µg/mL.

### Limitations à ne pas effacer
- Pour le **lévétiracétam**, l’AGNP 2026 note l'absence de relation concentration–efficacité démontrée : niveau TDM 4, pas de recommandation de STP universelle.
- Pour le **lacosamide**, le lien concentration–efficacité est incertain : niveau TDM 3.
- Les concentrations de **tranylcypromine** ont été observées en pic à 2–3 h et la pharmacodynamie persiste après élimination du fait de l’inhibition irréversible de MAO ; ne surtout pas utiliser une plage de pic sur une C0.
- La **clozapine** est la molécule mère, **pas** clozapine + norclozapine.
- Le tableau contient parfois **plusieurs indications et heures distinctes pour une molécule** ; les neuf valeurs sont un **sous-ensemble**, pas une retranscription exhaustive des 160 molécules du consensus.
- Un examen d’aptitude *clinique* (approbation humaine de l’entrée, méthode analytique, formulation et population) reste à effectuer avant une éventuelle consommation informatique par MIPD Engine.

### Verrous de qualité
- Neuf UUID/IDs immuables de lignes, lien primaire DOI, `analyteId`, `analyteBasis`, `samplingTime`, `agnp2026TdmRecommendationLevel`, statut `pending_human_approval`.
- Les tests bloquent toute modification non revue des minima/maxima, des temps ou du lien original.
- Aucun seuil d’alerte stocké en tant que `therapeutic_target`.
- Le récapitulatif AGNP marque ces 9 lignes « recoupées avec l'original », mais conserve le **reste de la file d’audit historique** et le verrou clinique.
- Le snapshot préparatoire tacrolimus/MPA/vancomycine reste strictement en lecture seule et inchangé.

Les nouvelles valeurs sont publiées dans une PR **empilée #231** et non dans la branche `main`, afin d'autoriser la revue scientifique humaine sans modifier les données de référence déjà visibles en production.

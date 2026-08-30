# Correcteurs hybrides PopPK + ML

Ce dossier ne contient aucune donnée patient. Un artefact est optionnel et doit être lié à un seul modèle mrgsolve par son identifiant, sa voie et son empreinte SHA-256.

Le manifeste exige trois gains RMSE strictement positifs avant toute activation de recherche : validation croisée répétée et imbriquée, jeu de test interne non touché, puis validation sur des simulations issues d'un autre modèle PopPK. Le statut clinique reste faux tant qu'une validation favorable sur patients réels indépendants n'est pas documentée.

Les performances doivent être comparées au MAP seul et à une régression pénalisée. La sélection des variables et des hyperparamètres reste dans les plis internes. Le jeu de test final ne sert jamais à choisir l'artefact.

Les artefacts de DDI Academy ne sont pas copiés ici : ils ont été entraînés avec des couples victime-perpétrateur et des modèles de base différents.

Exemple de contrat d'artefact :

```json
{
  "id": "drug-author-route-v1",
  "drug": "Vancomycine",
  "route": "IV",
  "baseModelId": "vanco_roberts",
  "baseModelSha256": "<sha256>",
  "artifactPath": "artifacts/drug-author-route-v1.rds",
  "featureSchema": [
    { "name": "MAP_ETA1", "source": "eta", "key": "ETA1" },
    { "name": "WT", "source": "covariate", "key": "WT" }
  ],
  "correction": { "type": "eta_additive", "eta": "ETA1", "maxAbsDelta": 0.5 },
  "validation": {
    "repeatedNestedCvGainPct": 0,
    "untouchedHoldoutGainPct": 0,
    "alternatePopPkGainPct": 0,
    "realPatient": { "status": "pending", "gainPct": null }
  }
}
```

Le moteur n'accepte actuellement que des boosters `xgb.Booster` RDS et une correction additive bornée d'un ETA. Toute variable manquante, empreinte différente, validation non favorable ou dépendance indisponible provoque un repli explicite sur le MAP sans correction.

## Evaluation vancomycine

`train_vancomycin_xgboost.R` teste uniquement Goti, Revilla et Roberts, tous par voie IV. Il ne lit aucune donnée patient, ne sauvegarde aucun booster et ne modifie jamais `manifest.json`.

Le protocole sépare le hold-out avant tout réglage, estime le gain par validation croisée répétée et imbriquée, compare XGBoost à une régression elastic net, puis teste le correcteur sur des profils simulés par les deux autres modèles PopPK. La cible est la correction de l'ETA de clairance entre une estimation MAP parcimonieuse et une estimation de référence fondée sur un profil riche. Ces simulations constituent un test méthodologique, pas une validation clinique.

```powershell
Rscript ml/train_vancomycin_xgboost.R --smoke --base=all
Rscript ml/train_vancomycin_xgboost.R --n=300 --base=vanco_roberts --report=ml/validation/roberts.csv
```

Un candidat n'est considéré favorable que si les gains XGBoost sont strictement positifs en CV imbriquée, sur le hold-out intact et sur les PopPK alternatifs. Même dans ce cas, le script conserve `artifact_saved = FALSE`; une validation favorable sur patients réels indépendants reste obligatoire avant toute activation clinique.

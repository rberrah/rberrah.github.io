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

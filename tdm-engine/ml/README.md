# Prédiction directe de l'AUC par PopPK + ML

Ce dossier ne contient aucune donnée patient. Il implémente la méthodologie d'entraînement de XGBoost sur des profils pharmacocinétiques simulés, validée pour le tacrolimus par Woillard et al. : doi:10.1016/j.phrs.2021.105578.

Le modèle ML prédit directement l'AUC24 à partir de concentrations parcimonieuses, de leurs horaires exacts, de la posologie et des covariables. La version publiée exige deux prélèvements dans le même intervalle et une administration déclarée à l'état stationnaire (`ss = 1`), conformément aux simulations d'entraînement. Il ne corrige pas un ETA et ne modifie pas la trajectoire MAP. Dans l'application, l'AUC24 ML est affichée séparément; les projections et recommandations restent calculées avec mrgsolve, mapbayr et, le cas échéant, le model averaging.

## Contrat d'artefact

Un artefact est lié à un seul modèle mrgsolve par son identifiant, sa voie et son empreinte SHA-256. La validation croisée répétée et imbriquée ainsi que le jeu de test interne non touché doivent respecter les seuils préspecifiés de biais, RMSE relative et proportion d'erreurs dans ±20 %. La validation sur un autre générateur PopPK mesure séparément la transportabilité; elle ne remplace pas la validation externe sur patients utilisée dans l'article. Les résultats face au MAP et au model averaging sont rapportés sans exiger artificiellement que XGBoost surpasse le modèle qui a généré ses propres données d'entraînement.

Le statut clinique reste faux tant qu'une validation favorable sur des patients réels indépendants atteints par la molécule étudiée n'est pas documentée. L'activation d'un artefact de recherche est toujours volontaire dans l'interface.

```json
{
  "id": "vanco-roberts-auc24-xgb-v1",
  "drug": "Vancomycine",
  "route": "IV",
  "administrationMode": "intermittent",
  "baseModelId": "vanco_roberts",
  "baseModelSha256": "<sha256>",
  "artifactPath": "artifacts/vanco-roberts-auc24-xgb-v1.rds",
  "artifactSha256": "<sha256>",
  "featureSchema": [
    { "name": "WT", "source": "covariate", "key": "WT" },
    { "name": "DOSE", "source": "regimen", "key": "DOSE" },
    { "name": "LAST_CONC", "source": "observation", "key": "LAST_CONC" },
    { "name": "LAST_TIME", "source": "observation", "key": "LAST_TIME" }
  ],
  "prediction": {
    "type": "auc24_direct",
    "metric": "AUC24",
    "unit": "mg.h/L",
    "horizonHours": 24
  },
  "validation": {
    "repeatedNestedCv": {
      "passed": true,
      "relativeRmsePct": 0,
      "relativeBiasPct": 0,
      "within20Pct": 0,
      "gainVsMapPct": 0,
      "gainVsAveragingPct": 0
    },
    "untouchedHoldout": { "passed": true },
    "alternatePopPk": { "passed": true },
    "realPatient": { "status": "pending", "gainPct": null }
  }
}
```

Toute variable manquante, mode de perfusion incompatible, empreinte du modèle ou du booster différente, validation non favorable ou dépendance indisponible provoque un repli explicite sur le MAP. Le manifeste conserve aussi la graine, les effectifs, les hyperparamètres et les versions logicielles de l'entraînement.

## Évaluation vancomycine

`train_vancomycin_xgboost.R` sépare les domaines d'administration. Goti et Revilla sont évalués pour la perfusion intermittente; Revilla et Roberts pour la perfusion continue. Pour chaque patient virtuel, il :

1. simule un profil riche à l'état stationnaire et calcule l'AUC24 trapézoïdale de référence;
2. extrait deux prélèvements avec erreur résiduelle, un après la perfusion et un en fin d'intervalle;
3. calcule les références MAP et model averaging sur les mêmes prélèvements;
4. entraîne XGBoost et une régression elastic net sur l'AUC24 directe;
5. mesure le biais relatif, la RMSE relative et la proportion des erreurs dans ±20 %;
6. réserve l'autre générateur compatible avec le même mode de perfusion, totalement absent du développement, à la validation externe simulée.

```powershell
Rscript ml/train_vancomycin_xgboost.R --smoke --base=all
Rscript ml/train_vancomycin_xgboost.R --n=1000 --mode=intermittent --base=vanco_pkjust --report=ml/validation/revilla.csv
Rscript ml/train_vancomycin_xgboost.R --n=1000 --mode=continuous --base=vanco_roberts
Rscript ml/train_vancomycin_xgboost.R --n=1000 --mode=intermittent --base=vanco_pkjust --publish-research
```

`--publish-research` est refusé en mode smoke ou avec moins de 1 000 patients virtuels par cohorte. Même après publication de recherche, `realPatient.status` reste `pending` et l'interface indique explicitement que la validation externe propre à la vancomycine n'est pas acquise.

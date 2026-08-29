# MIPD Engine

Application Shiny séparée du site statique. Elle exécute les modèles avec `mrgsolve`, individualise les paramètres avec `mapbayr` et compare des scénarios de dose.

## Démarrage local

Depuis la racine du dépôt:

```powershell
npm run tdm:index
npm run tdm:run
```

Ouvrir ensuite `http://127.0.0.1:3838/`.

Le script local active `ALLOW_CUSTOM_MODELS=true`, ce qui autorise le collage et la compilation de C++. Ne pas activer cette option sur un serveur public non isolé.

## Fonctionnalités

- sélection d'un modèle de la bibliothèque ou import/collage d'un modèle produit par l'Atelier Lego;
- compilation C++ libre uniquement en exécution locale ou sur une infrastructure isolée;
- historique de plusieurs administrations et concentrations;
- covariables générées depuis `$PARAM @covariates` et saisies à l'heure de chaque prélèvement;
- estimation MAP bayésienne avec `mapbayr`;
- model averaging AIC ou log-vraisemblance;
- affichage de l'AUC0-24 et de la C0 actuelles à partir des paramètres postérieurs;
- simulation de profils individualisés;
- classement de scénarios par AUC24, Cmin ou Cmax;
- export CSV de la grille posologique.
- import et export JSON des administrations, observations, covariables et cibles.

## Confidentialité et absence de persistance

- aucun champ d'identité patient n'est demandé ni exporté;
- le JSON importé est limité à 1 Mo, validé puis supprimé immédiatement du dossier temporaire;
- les données restent dans la mémoire de la session Shiny et sont libérées à sa fermeture;
- le code C++ personnalisé n'est jamais inclus dans l'export patient;
- les modèles Lego sont régénérés côté serveur puis compilés dans un dossier propre à la session, déchargés et supprimés à sa fermeture;
- les modèles publiés sont livrés avec l'application et aucun modèle soumis par un visiteur n'est ajouté automatiquement au serveur.

## Flux Atelier Lego vers TDM

L'atelier Lego génère un modèle mrgsolve compatible avec le contrat `mapbayr`: tags `[ADM]` et `[OBS]`, effets aléatoires, `OMEGA`, `SIGMA` et sortie `DV`. Il n'ajoute actuellement aucune covariable.

Le code généré contient une spécification JSON versionnée. L'action **Ouvrir dans TDM** l'envoie à la fenêtre Shiny avec `postMessage`; un copier-coller du code complet conserve aussi cette spécification. Le serveur valide les types, identifiants, bornes, compartiments et transferts, puis régénère lui-même un code mrgsolve équivalent. Il ne compile jamais directement le texte C++ reçu.

Le moteur ouvre ensuite le mode Atelier Lego / C++ et demande toujours une validation explicite avant l'analyse. Les administrations, concentrations observées et autres données du patient sont saisies uniquement dans le TDM.

## Déploiement

GitHub Pages ne peut pas exécuter R. Déployer ce dossier séparément sur une infrastructure Shiny ou dans un conteneur R, puis fournir l'URL au build Svelte:

```powershell
$env:PUBLIC_TDM_ENGINE_URL = "https://tdm.votre-domaine.fr"
npm run build
```

Pour un serveur public:

```text
ALLOW_CUSTOM_MODELS=false
```

Avec `ALLOW_CUSTOM_MODELS=false`, les modèles Lego contrôlés restent utilisables publiquement, mais tout C++ arbitraire est refusé. La compilation libre exige un service isolé: conteneur éphémère, système de fichiers en lecture seule, absence de réseau sortant, limites CPU/mémoire/temps et aucune donnée patient persistante.

## Test d'intégration

```powershell
Rscript tdm-engine/tests/smoke_test.R
Rscript tdm-engine/tests/safe_lego_test.R
npm run tdm:validate-library
```

Le smoke test estime les quatre modèles vancomycine avec des covariables variant dans le temps, calcule l'AUC0-24/C0 actuelles, leurs poids AIC et explore une petite grille de doses. Le test Lego compile un modèle contrôlé en mode public et vérifie le refus du C++ libre et des spécifications invalides. La validation de bibliothèque compile les 50 fichiers et vérifie le contrat `mapbayr` de chacun.

# Contribuer à la bibliothèque TDM

La **source de vérité scientifique et exécutable** de la bibliothèque PopPK est le dépôt autonome `rberrah/MIPD-Engine`. PMx Explain n'accepte plus directement de nouveaux modèles dans `static/tdm/models` : ce répertoire est uniquement un snapshot navigateur de la release MIPD épinglée.

## Chemin recommandé

1. Ouvrir une issue dans [rberrah/MIPD-Engine](https://github.com/rberrah/MIPD-Engine/issues/new).
2. Fournir le DOI et la citation primaire, la population source, le code du modèle, les covariables, les unités, la variabilité, l'erreur résiduelle et les limites connues.
3. Faire qualifier le modèle dans MIPD-Engine : provenance/source, compilation, contrat logiciel et tests applicables.
4. Publier une release MIPD immuable et qualifiée ; pour la production, le SHA doit aussi correspondre au moteur Shiny effectivement déployé.
5. Mettre ensuite à jour le contrat PMx `integration/mipd-release.json` et son snapshot navigateur dans une PR PMx dédiée. La CI `mipd-consumer` refuse toute divergence entre le snapshot PMx et la release MIPD épinglée.

Aucun modèle ne doit être ajouté manuellement au snapshot PMx pour contourner ce flux.

## Critères minimaux

- DOI et référence bibliographique primaire identifiables ; toute source secondaire doit être signalée.
- Population de développement explicite : adulte/pédiatrique, soins intensifs ou non, contexte clinique et limites disponibles.
- Paramètres typiques et unités.
- Covariables documentées.
- Variabilité interindividuelle/interoccasion et erreur résiduelle décrites lorsque disponibles.
- Toute adaptation par rapport à l'article est explicitement identifiée.
- Scénario de simulation ou test logiciel pertinent.
- Licence et droits compatibles avec la diffusion publique.

## Sécurité et données

Le site PMx est statique et ne doit contenir aucun token GitHub. Une proposition ne devient jamais automatiquement un modèle public : revue, PR et qualification restent obligatoires.

Ne joignez aucune donnée patient, même pseudonymisée. Les fixtures publiques doivent être synthétiques ou explicitement autorisées.

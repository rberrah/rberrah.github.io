# Contribuer a la bibliotheque TDM

Cette bibliotheque rassemble des modeles PopPK reutilisables pour l'enseignement du TDM et du model-informed precision dosing.

## Chemin recommande

1. Ouvrir une issue avec le template `Nouveau modele TDM`.
2. Fournir le DOI, la citation complete, la population source, le code, les covariables, les unitees et les limites.
3. Attendre la revue du modele avant integration dans `static/tdm/models`.
4. L'index de la page est regenere automatiquement au build; aucun ajout manuel dans le code de la page n'est necessaire.

## Criteres minimaux

- DOI et reference bibliographique primaire identifiables; toute source secondaire doit etre signalee.
- Population de developpement explicite: age, adulte/pediatrique, ICU ou non, etat clinique particulier.
- Parametres typiques avec unitees.
- Covariables documentees.
- Variabilite interindividuelle et erreur residuelle decrites.
- Scenario de simulation ou jeu de test minimal.
- Licence compatible avec une diffusion publique.

## Note de securite

Le site est statique. Un push direct depuis le navigateur demanderait un backend authentifie ou une GitHub App. Il ne faut pas exposer de token GitHub dans le code client. Une proposition ne devient jamais automatiquement un modele public: la revue et la PR restent obligatoires.

Ne joignez aucune donnee patient, meme pseudonymisee. Un scenario de test doit etre entierement synthetique.

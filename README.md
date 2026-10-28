# PMx Explain - portail, cours et interfaces pédagogiques

Ce dépôt contient le portail académique, le cours interactif SvelteKit et les
interfaces pédagogiques de pharmacométrie. Le site publié est statique.

Le moteur de model-informed precision dosing, la bibliothèque de modèles
populationnels, Pmetrics et les artefacts ML sont maintenus séparément dans
`rberrah/MIPD-Engine`. PMx Explain consomme une release MIPD immutable définie
dans `integration/mipd-release.json` et ne contient plus de copie exécutable du
moteur.

**Statut : maintenance / périmètre gelé (28 octobre 2026).** La baseline de code
qualifiée est `9d5d31bdb133f56fdb24f5f9319742d41e3b49f6`. La baseline de gel,
les dépendances externes épinglées et les seules classes de changements encore
acceptées sont documentées dans [la baseline figée](docs/FROZEN_BASELINE_20261028.md).
La [roadmap](ROADMAP.md) est conservée comme historique et comme liste de pistes
non bloquantes ; elle ne constitue plus un plan de développement actif.

## Organisation

- `portal/` : portail académique publié à la racine de `PUBLIC_SITE_ORIGIN`.
- `src/` : cours, visualisations, simulations et interfaces PMx.
- `static/` : ressources statiques du site.
- `static/tdm/` : snapshot navigateur **généré au build**, non versionné
  dans PMx. Les 46 fichiers C++ et les métadonnées sont importés depuis
  le SHA MIPD immuable via `scripts/materialize_mipd_snapshot.mjs`. La
  bibliothèque scientifique est maintenue exclusivement dans MIPD-Engine.
- `integration/mipd-release.json` : contrat immutable vers
  `rberrah/MIPD-Engine`.
- `integration/multiomics-release.json` : contrat immutable vers
  `rberrah/MultiOmics`.
- `integration/omics2pk-release.json` : contrat immutable vers le site autonome
  `rberrah/Omics2PK` utilisé par la navigation interdisciplinaire.
- Le site de biostatistique `/stats/` est maintenu et déployé indépendamment depuis
  `rberrah/stats`; PMx ne conserve plus de copie de son moteur, de ses tests ou de sa CI.
- `docs/`, `scripts/` et `tests/` : documentation, contrôles de contenu et
  tests du portail/PMx.

Les comptes actuels sont générés depuis les sources dans
[l'inventaire de contenu](docs/content-inventory.md) par `npm run inventory`.

Les PDF institutionnels et les données patients ne doivent jamais être publiés.

## Installer / lancer

```sh
npm ci
# Premier lancement : récupère le SHA MIPD immuable et le met en cache local
npm run dev
npm run check
npm run build
```

> GitHub Pages fixe `BASE_PATH=/pharmacometrie`. En local, laisser
> `BASE_PATH` vide pour servir PMx à la racine, ou utiliser
> `/pharmacometrie` pour reproduire le préfixe de production.

## Architecture contenu

- Chapitres Markdown : `src/content/chapters/*.md`
- Index client léger généré : `src/lib/content/chapterIndex.generated.json`
- Corpus plein texte, isolé à la route Recherche : `src/lib/content/chapterSearch.generated.json`
- Corps d'un chapitre : chargement à la demande via `src/lib/content/loadChapter.js`
- Compatibilité navigation/parcours : `src/lib/content/loadChapters.js` expose uniquement les métadonnées
- Catalogue de slides : `src/content/slides/slide_catalog.yaml`
- Visualisations : `src/lib/components/visualizations/`
- Simulations : `src/lib/sim/`
- Charts : `src/lib/charts/`
- Documentation d'édition : [docs/AJOUTER_UN_CHAPITRE.md](docs/AJOUTER_UN_CHAPITRE.md)

## MIPD Engine

PMx affiche et transmet vers le moteur déployé, mais ne possède plus son code
R/Shiny. Les tests `mipd-consumer`, `scientific-r` et
`scientific-pmetrics` récupèrent le SHA exact de `rberrah/MIPD-Engine`,
matérialisent une copie de consommation à partir du SHA MIPD figé,
vérifient la bibliothèque, les transferts, la sécurité de production et les
régressions numériques, puis échouent si le contrat change silencieusement.
PMx ne versionne plus aucune copie C++ : les modèles pédagogiques sont importés
au build, et une URL de moteur local peut être explicitement sélectionnée via
`PUBLIC_TDM_ENGINE_URL` pendant le développement. Sans override, le moteur
public autonome est utilisé également en mode développement.

Développement, modèles, artefacts ML, déploiement Shiny et qualification MIPD :
https://github.com/rberrah/MIPD-Engine

## MultiOmics

L'application MultiOmics est maintenue dans
https://github.com/rberrah/MultiOmics et montée dans l'artefact Pages à
`/multiomics/`. Les anciennes URLs sous `/pharmacometrie/multiomics/`
restent des alias de compatibilité.

## Omics2PK

Le portail de recherche Omics2PK est maintenu et publié indépendamment depuis
`rberrah/Omics2PK`. PMx ne copie ni son moteur ni ses données : il vérifie un
SHA de site publié via `integration/omics2pk-release.json` et expose seulement
le lien interdisciplinaire vers `/Omics2PK/`.

## Stats

Le site de biostatistique est maintenu dans `rberrah/stats` et publié séparément à
`/stats/`. Ce dépôt ne possède plus l'ancienne implémentation `portal/stats/` ni sa
CI scientifique. Le `robots.txt` racine référence son sitemap autonome.

## Gouvernance

Les règles attendues pour `main`, la revue des PR et les frontières entre dépôts
sont documentées dans [docs/repository-governance.md](docs/repository-governance.md).

## Déploiement GitHub Pages

- `PUBLIC_SITE_ORIGIN` configure le domaine indépendamment de `BASE_PATH`.
- `.github/workflows/pmx-ci.yml` qualifie les pull requests et `main`.
- le workflow construit PMx, assemble le portail, monte les applications
  autonomes épinglées, audite `dist/` puis exécute les tests navigateur ;
- `.github/workflows/deploy-pages.yml` publie uniquement l'artefact d'un run
  `main` entièrement réussi ;
- les workflows PMx ne déploient pas Shiny. Le déploiement du moteur appartient
  exclusivement à `rberrah/MIPD-Engine`.

## Licences

- Code original de la version courante : **PolyForm Noncommercial 1.0.0**
  (`LICENSE`).
- Contenus originaux de la version courante : **CC BY-NC-SA 4.0**
  (`LICENSE-CONTENT.md`).
- Les droits accordés par les licences antérieures restent applicables aux
  versions distribuées sous ces licences.
- Les composants tiers conservent leurs licences propres.
- Usage recherche/enseignement ; aucun conseil médical autonome.

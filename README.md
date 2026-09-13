# Pharmacométrie Pratique – portail, cours et outils

Ce dépôt réunit le portail académique, le cours interactif SvelteKit et les outils
de recherche TDM/MIPD, interactions et pharmacodynamie. Le portail et le site
SvelteKit sont statiques ; le moteur R/Shiny est déployé séparément.

**Évolutions prévues : [roadmap priorisée](ROADMAP.md).** Elle distingue les
fonctions déjà livrées, les travaux à réaliser et les décisions d'architecture
encore à arbitrer. Aucune séparation de dépôt ou modification de licence n'est
actée par cette documentation.

## Organisation
- `portal/` : portail publié à la racine `https://rberrah.github.io/`.
- `src/` et `static/` : cours, simulations, ateliers Lego/DDI/PD et interface TDM,
  publiés sous `https://rberrah.github.io/pharmacometrie/`.
- `tdm-engine/` : application R/Shiny et modules de calcul, modèles et artefacts ML.
  Voir [installation et déploiement Shiny](tdm-engine/README.md).
- `static/tdm/` et `scripts/generate_tdm_catalog.mjs` : bibliothèque et génération
  du catalogue, avec synchronisation vers le moteur ; voir les
  [règles de contribution](CONTRIBUTING_TDM_MODELS.md).
- `docs/`, `scripts/` et `tests/` : documentation, contrôles de contenu et tests navigateur.

Les PDF institutionnels et les données patients ne doivent jamais être publiés.

## Installer / lancer
```sh
npm ci
npm run dev          # serveur dev
npm run check        # lint + svelte-check
npm run build        # build statique
```

> GitHub Pages : le workflow fixe `BASE_PATH=/pharmacometrie`. En local, laisser
> `BASE_PATH` vide pour servir l'application à la racine, ou utiliser
> `/pharmacometrie` pour reproduire le préfixe de production.
> Trailing slash activé : les routes sont servies en `/chapitres/slug/`.

## Architecture contenu (gold standard)
- Chapitres = Markdown : `src/content/chapters/*.md`
  - Frontmatter : id, slug, title, description, order, tags, slides: ["s01", …]
  - Steps balisés : `<!-- step:title="..." slides="s01,s02" viz="09_PK1C" --> ... <!-- /step -->`
- Chargement : `src/lib/content/loadChapters.js` (import.meta.glob + gray-matter + markdown-it)
- Catalogue slides : `src/content/slides/slide_catalog.yaml` (source) + JSON dérivé
- Doc édition : `docs/AJOUTER_UN_CHAPITRE.md`

## Code
- Visualisations : `src/lib/components/visualizations/`
- Simulations : `src/lib/sim/` (RK4, multi-compartiments, transit inclus)
- Charts : `src/lib/charts/` (axes chiffrés, autoscale)
- Math (KaTeX CDN) : `src/lib/components/MathBlock.svelte`
- Slides : `static/slides/slide-XX.png` + page `/slides` pour debug
- Pages : accueil, chapitres, Simulation PopPK, Lego, TDM, interactions,
  pharmacodynamie, exercices, glossaire, références, QA, slides et à-propos.

## Scripts utilitaires
- `npm run test:labs` : bilan de masse, doses et scenarios des deux laboratoires.
- [Laboratoires pedagogiques](docs/teaching-laboratories.md) : hypotheses, mode
  enseignant, contrats de transfert et tests R/navigateur. Route `/laboratoires/`.
- `npm run validate` : valide catalogue + chapitres (slides existantes, IDs uniques)
- `npm run slides:export` : export LibreOffice → PNG + renommage `slide-XX.png`

## Export PPTX (optionnel)
1. Placer/laisser `static/pharmacometrie-pratique.pptx`.
2. `npm run slides:export` (LibreOffice/PowerPoint) → `static/slides/slide-01.png`…`slide-74.png`.
3. Mettre à jour `src/content/slides/slide_catalog.yaml` (titres, purpose, notes).

## QA
- Page `http://localhost:5173/qa/` : aperçu rapide des visualisations (presets).
- Page `http://localhost:5173/slides/` : listing des 74 slides (ou placeholders).

## Déploiement GitHub Pages
- Workflow `.github/workflows/deploy-pages.yml` :
  - construit SvelteKit avec `BASE_PATH=/pharmacometrie` ;
  - copie `portal/` à la racine de `dist/` et `build/` dans `dist/pharmacometrie/` ;
  - vérifie les collisions et les fichiers essentiels, puis publie `dist/`.
- Ce workflow ne déploie pas Shiny. Depuis la racine du dépôt,
  `Rscript scripts/deploy_shiny.R` vérifie les fichiers et dépendances ; ajouter
  `--deploy` publie le moteur avec le compte configuré. Aucun PDF, test ou fichier
  local non suivi par Git n'est inclus dans cette sélection.
- Static hosting : `adapter-static` + `fallback: 404.html` + `static/.nojekyll`.
- Accès direct aux routes (refresh sur `/chapitres/<slug>/`) supporté via trailing slash et fallback.

## Licences
- Texte : **CC BY-SA 4.0** (https://creativecommons.org/licenses/by-sa/4.0/deed.fr) — la reprise,
  l'adaptation et la traduction sont autorisées, y compris en enseignement payant, à condition de
  citer l'auteur et de partager aux mêmes conditions.
- Code : **MIT**.
- Pas de conseil médical (pédagogie uniquement).

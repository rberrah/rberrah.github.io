# Pharmacométrie Explain – cours interactif (SvelteKit)

Site éducatif scrollytelling (type MLU-Explain) couvrant PK/PD, PopPK, diagnostics, TDM, IA/Neural ODE. Déploiement 100 % statique (adapter-static) pour GitHub Pages.

## Installer / lancer
```sh
npm ci
npm run dev          # serveur dev
npm run check        # lint + svelte-check
npm run build        # build statique
```

> GitHub Pages : `BASE_PATH` est automatiquement détecté par le workflow. En local, définir `BASE_PATH=/rberrah.github.io` (user site) ou `BASE_PATH=/nom-du-repo` (project site) avant `npm run build` si besoin.  
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
- Pages : home, chapitres (scrolly), playground PopPK, glossaire, QA, slides, à-propos

## Scripts utilitaires
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
  - détecte BASE_PATH (`""` si user site `rberrah.github.io`, sinon `/<repo>`)
  - build + upload `build/`
- Static hosting : `adapter-static` + `fallback: 404.html` + `static/.nojekyll`.
- Accès direct aux routes (refresh sur `/chapitres/<slug>/`) supporté via trailing slash et fallback.

## Licences
- Texte : CC-BY-SA. Code : MIT. Pas de conseil médical (pédagogie uniquement).

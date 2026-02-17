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
- Les chapitres sont des fichiers Markdown : `src/content/chapters/*.md`
  - Frontmatter JSON : slug, title, tag, summary, slides, formulas, quiz…
  - Steps balisés : `<!-- step:title="..." viz="..." --> ... <!-- /step -->`
- Chargement/validation : `src/lib/content/loadChapters.js` + `schema.js` + `markdown.js`
- Slide index : `src/content/slide_index.json` (généré ou complété à la main)
- Documentation édition : `src/content/README.md` (à compléter si besoin)

## Code
- Visualisations : `src/lib/components/visualizations/`
- Simulations : `src/lib/sim/` (RK4, PK multi-compartiments, variabilité)
- Charts : `src/lib/charts/` (axes chiffrés, autoscale)
- Math (KaTeX CDN) : `src/lib/components/MathBlock.svelte`
- Slides : `static/slides/slide-XX.png` (fallback si manquants)
- Pages : home, chapitres scrolly, playground PopPK, glossaire, QA, slides, à-propos

## Scripts utilitaires
- `npm run validate` : valide le contenu (frontmatter, slides, doublons)
- `npm run slides:index` : génère un index de slides par défaut
- `npm run slides:export` : export LibreOffice → PNG + renommage `slide-XX.png`
- `scripts/validate_content.mjs` : checks slides/viz
- `scripts/export_pptx_png.sh` : export PPTX → PNG (renommage numérique robuste)
- `scripts/generate_slide_index.mjs` : stub d’index si aucun export n’est fait

## Export PPTX (optionnel)
1. Placer `static/pharmacometrie-pratique.pptx` (déjà présent).
2. `npm run slides:export` (LibreOffice requis) → `static/slides/slide-01.png`…`slide-74.png`.
3. `npm run slides:index` pour créer/mettre à jour `slide_index.json` (titres à compléter manuellement si besoin).

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

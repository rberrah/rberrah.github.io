# Pharmacométrie Explain – cours interactif (SvelteKit)

Site éducatif scrollytelling (type MLU-Explain) couvrant PK/PD, PopPK, diagnostics, TDM, IA/Neural ODE.

## Installer / lancer

```sh
npm ci               # nécessite l'accès npm (d3, layercake, svelte-scroller…)
npm run dev          # dev server
npm run check        # lint + svelte-check
npm run build        # build statique (adapter-static)
```

> GitHub Pages : définir `BASE_PATH=/rberrah.github.io` (ou nom du repo) avant `npm run build`.

## Contenu
- Pages : home, chapitres (scrolly), playground, glossaire, QA, à-propos.
- Chapitres définis dans `src/lib/content/chapters.js` (slides, formules, quiz, viz).
- Visualisations dans `src/lib/components/visualizations/`.
- Moteur de simulation : `src/lib/sim/` (RK4, oral 1C, variabilité seedée).
- Charts : `src/lib/charts/` (axes chiffrés, autoscale).
- Math (KaTeX CDN) : `src/lib/components/MathBlock.svelte`.
- Slides PPTX optionnelles : placer des PNG nommés `static/slides/slide-XX.png`.

## Export PPTX (optionnel, hors production)
- Plan JSON : `python scripts/extract_pptx_outline.py "Pharmacométrie Pratique.pptx" src/content/pptx_outline.json`
- PNG des slides : `bash scripts/export_pptx_png.sh`

## QA
- Page `http://localhost:5173/qa` : aperçu rapide des visualisations et presets.

## Licences
- Texte : CC-BY-SA. Code : MIT. Pas de conseil médical (pédagogie uniquement).

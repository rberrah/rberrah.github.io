# Ajouter ou éditer un chapitre

1. Créer un fichier Markdown dans `src/content/chapters/` (ex. `05_absorption-orale.md`).
2. Frontmatter obligatoire :
   ```yaml
   ---
   id: "absorption-orale"
   slug: "absorption-orale"
   title: "La voie orale & Tlag"
   description: "Bateman, Ka, Tlag, exemples et pièges."
   order: 4
   tags: ["pk", "absorption"]
   slides: ["s17","s18","s19","s20"]
   ---
   ```
3. Corps structuré en blocs `step` :
   ```markdown
   <!-- step:title="Ka vs Tlag" slides="s17,s18" viz="09_PK1C" -->
   Texte Markdown : ce qu'on voit, pourquoi c'est important, pièges, implications.
   <!-- /step -->
   ```
   - `slides` = IDs du catalogue (`slide_catalog.yaml`), séparés par des virgules.
   - `viz` = identifiant d’un composant de `src/lib/components/visualizations/`.
4. Ajouter un quiz à la fin (simple liste) si besoin :
   ```markdown
   <!-- step:title="Quiz" slides="s20" -->
   1. Question ?
   2. Question ?
   <!-- /step -->
   ```
5. Vérifier :
   ```sh
   npm run validate
   npm run check
   npm run build
   ```
6. Slides :
   - Le catalogue source est `src/content/slides/slide_catalog.yaml`.
   - Les PNG doivent être dans `static/slides/slide-XX.png`.
7. Navigation :
   - L’ordre d’affichage suit `order` croissant.
   - Le slug devient l’URL `/chapitres/<slug>/`.

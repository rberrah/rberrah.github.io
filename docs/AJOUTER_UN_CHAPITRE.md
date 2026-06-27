# Ajouter ou éditer un chapitre

> Guide complet (EN, + visualisations & déploiement) : **`docs/AUTHORING.md`**.

1. Créer un fichier Markdown dans `src/content/chapters/` (ex. `04_absorption-orale.md`).
2. Frontmatter obligatoire :
   ```yaml
   ---
   id: "absorption-orale"
   slug: "absorption-orale"
   title: "La voie orale & Tlag"
   description: "Bateman, Ka, Tlag, exemples et pièges."
   order: 4
   tags: ["pk", "absorption"]
   slides: []          # tableau (vide possible). IDs ⇒ doivent exister dans slide_catalog.yaml
   quiz:               # optionnel : checkpoint de fin de chapitre
     - prompt: "Une question ?"
       options: ["A", "B", "C"]
       correct: 1      # index (base 0) de la bonne réponse
   ---
   ```
3. Corps structuré en blocs `step` :
   ```markdown
   <!-- step:title="Ka vs Tlag" viz="OralAbsorption" -->
   Texte Markdown : ce qu'on voit, pourquoi c'est important, pièges, implications.

   Équations KaTeX (rendues automatiquement) : $C_0 = \dfrac{\text{Dose}}{V}\ [\text{mg/L}]$
   <!-- /step -->
   ```
   - `viz` = identifiant d'un composant enregistré dans `vizMap`
     (`src/routes/chapitres/[slug]/+page.svelte`). Explorers Phase 1 :
     `IVBolus`, `OralAbsorption`. Anciens : `01_HumanBody`, `02_BucketSim`, `09_PK1C`, …
   - `slides` (optionnel, sur un step) = IDs du catalogue séparés par des virgules.
4. Équations : délimiteurs `$ … $` (inline), `$$ … $$` (bloc), `\( … \)`, `\[ … \]`.
   Dans `\text{}`, utiliser `\cdot` plutôt que le caractère `·`.
5. Pistes (tracks) : par défaut **Core**. Pour la piste **IA**, ajouter le slug
   dans `aiSlugs` de `src/lib/content/tracks.js`.
6. Prerender : ajouter `'/chapitres/<slug>'` dans `prerender.entries` de
   `svelte.config.js`.
7. Vérifier :
   ```sh
   npm run validate
   npm run check
   npm run build
   ```
8. Navigation :
   - L'ordre d'affichage suit `order` croissant.
   - Le slug devient l'URL `/chapitres/<slug>/`.
